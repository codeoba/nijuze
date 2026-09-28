import React, { useState, useEffect } from 'react';
import { 
  X, Plus, Send, CheckCircle2, User as UserIcon, 
  ExternalLink, UserPlus, UserCheck, MessageSquare, 
  Award, FileText, Sparkles, Eye
} from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { useRouter } from '../router/Router';
import { storiesAPI } from '../services/api';
import { User } from '../types';

interface Story {
  id: string;
  userId: string;
  user: any;
  content: string;
  imageUrl?: string;
  backgroundColor: string;
  createdAt: string;
  expiresAt: string;
  views: number;
}

const AVATAR_GRADIENTS = [
  'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)', // Indigo - Purple
  'linear-gradient(135deg, #f43f5e 0%, #fb923c 100%)', // Rose - Orange
  'linear-gradient(135deg, #0ea5e9 0%, #3b82f6 100%)', // Sky - Blue
  'linear-gradient(135deg, #10b981 0%, #14b8a6 100%)', // Emerald - Teal
  'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)', // Violet - Pink
  'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)', // Amber - Red
];

const getUserGradient = (idOrName: string = ''): string => {
  let hash = 0;
  for (let i = 0; i < idOrName.length; i++) {
    hash = idOrName.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_GRADIENTS[Math.abs(hash) % AVATAR_GRADIENTS.length];
};

const getInitials = (user?: any): string => {
  if (!user) return 'NJ';
  if (user.avatar && user.avatar.length <= 3 && !user.avatar.startsWith('http')) {
    return user.avatar.toUpperCase();
  }
  if (user.username) {
    const parts = user.username.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return user.username.slice(0, 2).toUpperCase();
  }
  return 'NJ';
};

export const StoriesBar: React.FC = () => {
  const { users, currentUser, toggleFollow, isFollowing } = useApp();
  const { navigate } = useRouter();
  
  const [stories, setStories] = useState<Story[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newContent, setNewContent] = useState('');
  const [selectedGradient, setSelectedGradient] = useState('linear-gradient(135deg, #6366f1 0%, #9333ea 100%)');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch real stories from backend
  const fetchStories = async () => {
    try {
      const data = await storiesAPI.getAll();
      if (data && Array.isArray(data) && data.length > 0) {
        setStories(data);
      }
    } catch {
      // Backend offline or no stories yet
    }
  };

  useEffect(() => {
    fetchStories();
  }, []);

  const handleUserClick = (user: User) => {
    setSelectedUser(user);
  };

  const handleCreateStory = async () => {
    if (!newContent.trim() || !currentUser) return;
    setIsSubmitting(true);
    try {
      await storiesAPI.create({ content: newContent, backgroundColor: selectedGradient });
    } catch {}

    const myNewStory: Story = {
      id: `story-${Date.now()}`,
      userId: currentUser.id,
      user: currentUser,
      content: newContent,
      backgroundColor: selectedGradient,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 86400000).toISOString(),
      views: 0,
    };

    setStories(prev => [myNewStory, ...prev]);
    setNewContent('');
    setShowCreateModal(false);
    setIsSubmitting(false);
  };

  // List of active community members to display
  // Prioritize other users, then current user
  const displayUsers = users && users.length > 0 ? users.slice(0, 10) : [];

  return (
    <>
      <div 
        className="glass-card"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          padding: '14px 18px',
          overflowX: 'auto',
          marginBottom: 18,
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        {/* Current user Add Story / Profile Circle */}
        {currentUser && (
          <div
            onClick={() => setShowCreateModal(true)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              cursor: 'pointer',
              minWidth: 64,
              textAlign: 'center',
              transition: 'transform 0.15s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
          >
            <div style={{
              width: 58,
              height: 58,
              borderRadius: '50%',
              padding: 2.5,
              background: 'linear-gradient(135deg, #6366f1, #9333ea)',
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
            }}>
              <div style={{
                width: '100%',
                height: '100%',
                borderRadius: '50%',
                background: getUserGradient(currentUser.id || currentUser.username),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 16,
                fontWeight: 700,
                color: '#ffffff',
                textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                overflow: 'hidden',
              }}>
                {currentUser.avatar && currentUser.avatar.startsWith('http') ? (
                  <img 
                    src={currentUser.avatar} 
                    alt={currentUser.username} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                  />
                ) : (
                  getInitials(currentUser)
                )}
              </div>
              <div style={{
                position: 'absolute',
                bottom: -2,
                right: -2,
                width: 20,
                height: 20,
                borderRadius: '50%',
                background: '#6366f1',
                border: '2px solid var(--bg-surface, #ffffff)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
              }}>
                <Plus size={12} strokeWidth={3} />
              </div>
            </div>
            <span style={{ 
              fontSize: 12, 
              fontWeight: 600, 
              color: 'var(--text-main)', 
              marginTop: 6, 
              maxWidth: 68, 
              overflow: 'hidden', 
              textOverflow: 'ellipsis', 
              whiteSpace: 'nowrap' 
            }}>
              Weka Story
            </span>
          </div>
        )}

        {/* Member circles */}
        {displayUsers.map((user) => {
          const userStory = stories.find(s => s.userId === user.id);
          const hasStory = !!userStory;
          const initials = getInitials(user);
          const gradient = getUserGradient(user.id || user.username);
          const displayName = user.username ? user.username.split(' ')[0] : 'Mwanachama';

          return (
            <div
              key={user.id}
              onClick={() => handleUserClick(user)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                cursor: 'pointer',
                minWidth: 64,
                textAlign: 'center',
                transition: 'transform 0.15s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
            >
              <div style={{
                width: 58,
                height: 58,
                borderRadius: '50%',
                padding: 2.5,
                background: hasStory
                  ? 'linear-gradient(135deg, #f43f5e, #fb923c)'
                  : 'linear-gradient(135deg, #6366f1, #06b6d4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: hasStory 
                  ? '0 4px 12px rgba(244, 63, 94, 0.35)' 
                  : '0 4px 12px rgba(99, 102, 241, 0.25)',
              }}>
                <div style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: '50%',
                  background: gradient,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 16,
                  fontWeight: 700,
                  color: '#ffffff',
                  textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                  overflow: 'hidden',
                  border: '2px solid var(--bg-surface, #ffffff)',
                }}>
                  {user.avatar && user.avatar.startsWith('http') ? (
                    <img 
                      src={user.avatar} 
                      alt={user.username} 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                    />
                  ) : (
                    initials
                  )}
                </div>
              </div>
              <span style={{ 
                fontSize: 12, 
                fontWeight: 600, 
                color: 'var(--text-main)', 
                marginTop: 6, 
                maxWidth: 68, 
                overflow: 'hidden', 
                textOverflow: 'ellipsis', 
                whiteSpace: 'nowrap' 
              }}>
                {displayName}
              </span>
            </div>
          );
        })}
      </div>

      {/* ========================================================
          USER PROFILE & STORY DETAILS MODAL
         ======================================================== */}
      {selectedUser && (
        <div
          className="modal-overlay"
          onClick={() => setSelectedUser(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: 16,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: 440,
              borderRadius: 24,
              background: 'var(--modal-bg, #ffffff)',
              color: 'var(--text-main, #0f172a)',
              border: '1px solid var(--border-app, #e2e8f0)',
              overflow: 'hidden',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
              animation: 'scaleIn 0.25s ease-out',
            }}
          >
            {/* Header Cover Banner */}
            <div style={{
              height: 120,
              background: getUserGradient(selectedUser.id || selectedUser.username),
              position: 'relative',
              zIndex: 1,
              display: 'flex',
              justifyContent: 'flex-end',
              padding: 12,
            }}>
              <button
                onClick={() => setSelectedUser(null)}
                style={{
                  background: 'rgba(0, 0, 0, 0.4)',
                  backdropFilter: 'blur(4px)',
                  border: 'none',
                  borderRadius: '50%',
                  width: 32,
                  height: 32,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  cursor: 'pointer',
                  transition: 'background 0.2s',
                  position: 'relative',
                  zIndex: 2,
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(0, 0, 0, 0.6)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(0, 0, 0, 0.4)')}
              >
                <X size={18} />
              </button>
            </div>

            {/* Profile Content Body */}
            <div style={{ padding: '0 24px 24px 24px', marginTop: -42, position: 'relative', zIndex: 10 }}>
              {/* Profile Image & Badges */}
              <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 16 }}>
                <div style={{
                  width: 84,
                  height: 84,
                  borderRadius: '50%',
                  border: '4px solid var(--modal-bg, #ffffff)',
                  background: getUserGradient(selectedUser.id || selectedUser.username),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  fontSize: 28,
                  fontWeight: 800,
                  boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
                  position: 'relative',
                  zIndex: 20,
                  flexShrink: 0,
                  overflow: 'hidden',
                }}>
                  {selectedUser.avatar && selectedUser.avatar.startsWith('http') ? (
                    <img 
                      src={selectedUser.avatar} 
                      alt={selectedUser.username} 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                    />
                  ) : (
                    getInitials(selectedUser)
                  )}
                </div>

                {/* Follow Button */}
                {currentUser && currentUser.id !== selectedUser.id && (
                  <button
                    onClick={() => toggleFollow(selectedUser.id)}
                    className={isFollowing(selectedUser.id) ? 'btn-ghost' : 'btn-primary'}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      fontSize: 13,
                      padding: '8px 16px',
                      borderRadius: 12,
                      cursor: 'pointer',
                    }}
                  >
                    {isFollowing(selectedUser.id) ? (
                      <>
                        <UserCheck size={16} />
                        <span>Unafuata</span>
                      </>
                    ) : (
                      <>
                        <UserPlus size={16} />
                        <span>Fuata</span>
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* Name & Role */}
              <div style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <h3 style={{ fontSize: 20, fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>
                    {selectedUser.username}
                  </h3>
                  {(selectedUser.isVerified || (selectedUser as any).is_verified) && (
                    <CheckCircle2 size={18} color="#3b82f6" fill="#3b82f6" style={{ color: 'white' }} />
                  )}
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>
                  @{selectedUser.username ? selectedUser.username.toLowerCase().replace(/\s+/g, '') : 'mwanachama'}
                </div>
              </div>

              {/* Role Pill */}
              <div style={{ marginBottom: 14 }}>
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '4px 10px',
                  borderRadius: 8,
                  fontSize: 12,
                  fontWeight: 600,
                  background: 'var(--tag-bg, rgba(99, 102, 241, 0.12))',
                  color: 'var(--tag-text, #4f46e5)',
                  border: '1px solid var(--tag-border, rgba(99, 102, 241, 0.25))',
                }}>
                  <Award size={13} />
                  <span>{selectedUser.role || 'Mwanachama wa Nijuze'}</span>
                </span>
              </div>

              {/* Bio */}
              <p style={{
                fontSize: 14,
                color: 'var(--text-body)',
                lineHeight: 1.5,
                margin: '0 0 18px 0',
              }}>
                {selectedUser.bio || 'Mwanachama anayechangia kikamilifu kwenye jukwaa la maarifa la Nijuze.'}
              </p>

              {/* Statistics Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: 8,
                padding: '12px 10px',
                borderRadius: 14,
                background: 'var(--bg-subtle, rgba(0, 0, 0, 0.04))',
                border: '1px solid var(--border-app, rgba(0, 0, 0, 0.08))',
                textAlign: 'center',
                marginBottom: 20,
              }}>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-main)' }}>
                    {selectedUser.postsCount ?? (selectedUser as any).posts_count ?? 0}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>Posts</div>
                </div>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-main)' }}>
                    {selectedUser.answersCount ?? (selectedUser as any).answers_count ?? 0}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>Majibu</div>
                </div>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: '#f59e0b' }}>
                    {selectedUser.reputation ?? 0}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>Sifa</div>
                </div>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-main)' }}>
                    {selectedUser.followers ?? (selectedUser as any).followers_count ?? 0}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>Wafuasi</div>
                </div>
              </div>

              {/* Active Story (if user actually posted one) */}
              {(() => {
                const activeStory = stories.find(s => s.userId === selectedUser.id);
                if (!activeStory) return null;
                return (
                  <div style={{
                    padding: 14,
                    borderRadius: 14,
                    background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.08), rgba(147, 51, 234, 0.08))',
                    border: '1px solid rgba(99, 102, 241, 0.25)',
                    marginBottom: 18,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#6366f1', letterSpacing: '0.05em' }}>
                        Story ya Masaa 24
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--text-muted)' }}>
                        <Eye size={12} />
                        <span>{activeStory.views}</span>
                      </div>
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-main)', lineHeight: 1.4 }}>
                      "{activeStory.content}"
                    </div>
                  </div>
                );
              })()}

              {/* Full Profile Page Action Button */}
              <button
                onClick={() => {
                  const targetId = selectedUser.id;
                  setSelectedUser(null);
                  navigate(`/profile/${targetId}`);
                }}
                className="btn-primary"
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  padding: '12px 18px',
                  borderRadius: 14,
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: 'none',
                }}
              >
                <UserIcon size={17} />
                <span>Tazama Wasifu Kamili</span>
                <ExternalLink size={15} style={{ opacity: 0.8 }} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          CREATE STORY MODAL
         ======================================================== */}
      {showCreateModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowCreateModal(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: 16,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: 460,
              borderRadius: 24,
              background: 'var(--modal-bg, #ffffff)',
              color: 'var(--text-main, #0f172a)',
              border: '1px solid var(--border-app, #e2e8f0)',
              padding: 24,
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
              animation: 'scaleIn 0.25s ease-out',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>
                Chapisha Story ya Masaa 24
              </h3>
              <button 
                onClick={() => setShowCreateModal(false)} 
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Live Preview Box */}
            <div style={{
              height: 180,
              borderRadius: 16,
              background: selectedGradient,
              padding: 20,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              color: '#ffffff',
              fontSize: 17,
              fontWeight: 600,
              marginBottom: 16,
              textShadow: '0 1px 3px rgba(0,0,0,0.3)',
              boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.2)',
            }}>
              {newContent || 'Andika maneno ya story yako hapa...'}
            </div>

            <textarea
              placeholder="Unafikiria nini leo? Andika hapa..."
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              rows={3}
              style={{
                width: '100%',
                padding: 12,
                borderRadius: 12,
                background: 'var(--input-bg, #f8fafc)',
                border: '1px solid var(--input-border, #cbd5e1)',
                color: 'var(--input-text, #0f172a)',
                fontSize: 14,
                marginBottom: 16,
                resize: 'none',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />

            {/* Gradient Selector */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8 }}>
                Chagua Rangi:
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                {AVATAR_GRADIENTS.map((grad, i) => (
                  <div
                    key={i}
                    onClick={() => setSelectedGradient(grad)}
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      background: grad,
                      cursor: 'pointer',
                      border: selectedGradient === grad ? '3px solid #6366f1' : '2px solid transparent',
                      transform: selectedGradient === grad ? 'scale(1.15)' : 'none',
                      transition: 'all 0.2s',
                    }}
                  />
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button 
                onClick={() => setShowCreateModal(false)} 
                className="btn-ghost"
                style={{ padding: '9px 18px', borderRadius: 12, cursor: 'pointer' }}
              >
                Ghairi
              </button>
              <button
                onClick={handleCreateStory}
                disabled={!newContent.trim() || isSubmitting}
                className="btn-primary"
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 8, 
                  padding: '9px 20px', 
                  borderRadius: 12, 
                  cursor: isSubmitting || !newContent.trim() ? 'not-allowed' : 'pointer',
                  opacity: !newContent.trim() ? 0.6 : 1,
                  border: 'none',
                }}
              >
                <Send size={15} />
                <span>{isSubmitting ? 'Inachapisha...' : 'Chapisha Sasa'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

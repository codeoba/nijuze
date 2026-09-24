import React, { useState } from 'react';
import {
  X, Camera, Edit3, MapPin, Link as LinkIcon, Calendar, Award,
  BookOpen, MessageCircle, ThumbsUp, Users, Settings, Share2,
  Flag, Mail, Globe, CheckCircle2
} from 'lucide-react';
import { useApp } from '../contexts/AppContext';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId?: string;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({ isOpen, onClose, userId }) => {
  const { currentUser, users, posts, comments, followUser, unfollowUser } = useApp();
  const [activeTab, setActiveTab] = useState<'posts' | 'answers' | 'about'>('posts');
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    bio: '',
    location: '',
    website: '',
  });

  if (!isOpen) return null;

  // Get the user to display
  const displayUser = userId
    ? users.find(u => u.id === userId)
    : currentUser;

  if (!displayUser) return null;

  const isOwnProfile = currentUser?.id === displayUser.id;
  const userPosts = posts.filter(p => p.authorId === displayUser.id);
  const userComments = Object.values(comments).flat().filter(c => c.authorId === displayUser.id);
  const totalUpvotes = userPosts.reduce((sum, p) => sum + p.upvotes, 0);

  const handleFollow = () => {
    if (displayUser.isFollowing) {
      unfollowUser(displayUser.id);
    } else {
      followUser(displayUser.id);
    }
  };

  const handleSaveProfile = () => {
    // In real app, this would call API
    setIsEditing(false);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="glass-card"
        style={{
          width: '100%',
          maxWidth: 800,
          margin: '0 16px',
          maxHeight: '90vh',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cover Image */}
        <div style={{
          height: 150,
          background: 'linear-gradient(135deg, #6366f1, #9333ea, #ec4899)',
          position: 'relative',
        }}>
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: 12,
              right: 12,
              padding: 8,
              borderRadius: 8,
              background: 'rgba(0, 0, 0, 0.5)',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            <X size={20} color="white" />
          </button>
        </div>

        {/* Profile Header */}
        <div style={{ padding: '0 24px', marginTop: -50 }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 16, marginBottom: 16 }}>
            <div style={{ position: 'relative' }}>
              <div className="avatar-ring" style={{ padding: 4 }}>
                <div style={{
                  width: 100,
                  height: 100,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #6366f1, #9333ea)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 36,
                  fontWeight: 'bold',
                  border: '4px solid #0f0f23',
                }}>
                  {displayUser.avatar}
                </div>
              </div>
              {isOwnProfile && (
                <button style={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  background: '#6366f1',
                  border: '2px solid #0f0f23',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <Camera size={16} color="white" />
                </button>
              )}
            </div>

            <div style={{ flex: 1, paddingBottom: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <h2 style={{ fontSize: 24, fontWeight: 700 }}>{displayUser.username}</h2>
                {displayUser.isVerified && (
                  <CheckCircle2 size={20} color="#34d399" />
                )}
              </div>
              <p style={{ fontSize: 14, color: '#94a3b8' }}>{displayUser.role}</p>
            </div>

            {isOwnProfile ? (
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="btn-ghost"
                style={{ display: 'flex', alignItems: 'center', gap: 8 }}
              >
                <Edit3 size={16} />
                Hariri Profile
              </button>
            ) : (
              <button
                onClick={handleFollow}
                className={displayUser.isFollowing ? 'btn-ghost' : 'btn-primary'}
                style={{ display: 'flex', alignItems: 'center', gap: 8 }}
              >
                <Users size={16} />
                {displayUser.isFollowing ? 'Unafuata' : 'Fuata'}
              </button>
            )}
          </div>

          {/* Bio */}
          {isEditing ? (
            <div style={{ marginBottom: 16 }}>
              <textarea
                value={editData.bio}
                onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
                placeholder="Andika bio yako..."
                style={{
                  width: '100%',
                  padding: 12,
                  borderRadius: 12,
                  background: 'rgba(30, 41, 59, 0.5)',
                  border: '1px solid rgba(51, 65, 85, 0.5)',
                  color: '#e2e8f0',
                  fontSize: 14,
                  resize: 'vertical',
                  minHeight: 80,
                }}
              />
              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                <input
                  type="text"
                  placeholder="Location"
                  value={editData.location}
                  onChange={(e) => setEditData({ ...editData, location: e.target.value })}
                  style={{
                    flex: 1,
                    padding: 8,
                    borderRadius: 8,
                    background: 'rgba(30, 41, 59, 0.5)',
                    border: '1px solid rgba(51, 65, 85, 0.5)',
                    color: '#e2e8f0',
                    fontSize: 13,
                  }}
                />
                <input
                  type="url"
                  placeholder="Website"
                  value={editData.website}
                  onChange={(e) => setEditData({ ...editData, website: e.target.value })}
                  style={{
                    flex: 1,
                    padding: 8,
                    borderRadius: 8,
                    background: 'rgba(30, 41, 59, 0.5)',
                    border: '1px solid rgba(51, 65, 85, 0.5)',
                    color: '#e2e8f0',
                    fontSize: 13,
                  }}
                />
              </div>
              <button
                onClick={handleSaveProfile}
                className="btn-primary"
                style={{ marginTop: 8 }}
              >
                Hifadhi
              </button>
            </div>
          ) : (
            <p style={{ fontSize: 14, color: '#cbd5e1', marginBottom: 16, lineHeight: 1.5 }}>
              {displayUser.bio || 'Hakuna bio bado.'}
            </p>
          )}

          {/* Meta Info */}
          <div style={{ display: 'flex', gap: 16, marginBottom: 16, fontSize: 13, color: '#94a3b8', flexWrap: 'wrap' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <MapPin size={14} /> Dar es Salaam, Tanzania
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <Calendar size={14} /> Amejiunga {new Date(displayUser.joinedAt).toLocaleDateString('sw-TZ', { month: 'long', year: 'numeric' })}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <Mail size={14} /> {displayUser.email}
            </span>
          </div>

          {/* Stats */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(5, 1fr)',
            gap: 12,
            padding: 16,
            borderRadius: 12,
            background: 'rgba(30, 41, 59, 0.3)',
            marginBottom: 16,
          }}>
            {[
              { label: 'Posts', value: userPosts.length, icon: BookOpen },
              { label: 'Majibu', value: userComments.length, icon: MessageCircle },
              { label: 'Upvotes', value: totalUpvotes, icon: ThumbsUp },
              { label: 'Followers', value: displayUser.followers, icon: Users },
              { label: 'Reputation', value: displayUser.reputation, icon: Award },
            ].map((stat, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <stat.icon size={20} color="#a5b4fc" style={{ margin: '0 auto 4px' }} />
                <p style={{ fontSize: 18, fontWeight: 700, color: '#a5b4fc' }}>{stat.value}</p>
                <p style={{ fontSize: 11, color: '#64748b' }}>{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Badges */}
          {displayUser.badges.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Badges</h3>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {displayUser.badges.map((badge) => (
                  <div
                    key={badge.id}
                    style={{
                      padding: '8px 12px',
                      borderRadius: 20,
                      background: 'rgba(251, 191, 36, 0.1)',
                      border: '1px solid rgba(251, 191, 36, 0.3)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      fontSize: 13,
                    }}
                  >
                    <span>{badge.icon}</span>
                    <span style={{ color: '#fcd34d', fontWeight: 500 }}>{badge.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tabs */}
          <div style={{ display: 'flex', gap: 8, borderBottom: '1px solid rgba(51, 65, 85, 0.3)', marginBottom: 16 }}>
            {(['posts', 'answers', 'about'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: '12px 20px',
                  background: 'transparent',
                  border: 'none',
                  borderBottom: activeTab === tab ? '2px solid #6366f1' : '2px solid transparent',
                  color: activeTab === tab ? '#a5b4fc' : '#94a3b8',
                  cursor: 'pointer',
                  fontSize: 14,
                  fontWeight: 500,
                }}
              >
                {tab === 'posts' ? 'Posts' : tab === 'answers' ? 'Majibu' : 'Kuhusu'}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 24 }}>
            {activeTab === 'posts' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {userPosts.length === 0 ? (
                  <p style={{ textAlign: 'center', color: '#64748b', padding: 32 }}>
                    Hakuna posts bado
                  </p>
                ) : (
                  userPosts.slice(0, 10).map((post) => (
                    <div
                      key={post.id}
                      style={{
                        padding: 16,
                        borderRadius: 12,
                        background: 'rgba(30, 41, 59, 0.3)',
                        border: '1px solid rgba(51, 65, 85, 0.3)',
                      }}
                    >
                      <h4 style={{ fontSize: 15, fontWeight: 600, marginBottom: 8 }}>
                        {post.title}
                      </h4>
                      <div style={{ display: 'flex', gap: 16, fontSize: 12, color: '#64748b' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <ThumbsUp size={12} /> {post.upvotes}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <MessageCircle size={12} /> {post.commentsCount}
                        </span>
                        <span>{new Date(post.createdAt).toLocaleDateString('sw-TZ')}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'answers' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {userComments.length === 0 ? (
                  <p style={{ textAlign: 'center', color: '#64748b', padding: 32 }}>
                    Hakuna majibu bado
                  </p>
                ) : (
                  userComments.slice(0, 10).map((comment) => (
                    <div
                      key={comment.id}
                      style={{
                        padding: 16,
                        borderRadius: 12,
                        background: 'rgba(30, 41, 59, 0.3)',
                        border: '1px solid rgba(51, 65, 85, 0.3)',
                      }}
                    >
                      <p style={{ fontSize: 14, color: '#cbd5e1', marginBottom: 8 }}>
                        {comment.content}
                      </p>
                      <div style={{ display: 'flex', gap: 16, fontSize: 12, color: '#64748b' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <ThumbsUp size={12} /> {comment.upvotes}
                        </span>
                        <span>{new Date(comment.createdAt).toLocaleDateString('sw-TZ')}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'about' && (
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>Takwimu za Mtumiaji</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{ padding: 16, borderRadius: 12, background: 'rgba(30, 41, 59, 0.3)' }}>
                    <p style={{ fontSize: 14, color: '#94a3b8', marginBottom: 4 }}>Level</p>
                    <p style={{ fontSize: 20, fontWeight: 700, color: '#a5b4fc' }}>
                      Level {Math.floor(displayUser.reputation / 1000) + 1}
                    </p>
                  </div>
                  <div style={{ padding: 16, borderRadius: 12, background: 'rgba(30, 41, 59, 0.3)' }}>
                    <p style={{ fontSize: 14, color: '#94a3b8', marginBottom: 4 }}>Reputation</p>
                    <p style={{ fontSize: 20, fontWeight: 700, color: '#fbbf24' }}>
                      {displayUser.reputation.toLocaleString()} points
                    </p>
                  </div>
                  <div style={{ padding: 16, borderRadius: 12, background: 'rgba(30, 41, 59, 0.3)' }}>
                    <p style={{ fontSize: 14, color: '#94a3b8', marginBottom: 4 }}>Joined</p>
                    <p style={{ fontSize: 16, fontWeight: 600, color: '#cbd5e1' }}>
                      {new Date(displayUser.joinedAt).toLocaleDateString('sw-TZ', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

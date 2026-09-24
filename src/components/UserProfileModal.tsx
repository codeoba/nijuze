import React, { useState } from 'react';
import { X, CheckCircle2, Edit3, Camera, MapPin, Calendar, Award, BookOpen, MessageCircle, ThumbsUp, Users } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { Post, Comment } from '../types';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId?: string;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({ isOpen, onClose, userId }) => {
  const { currentUser, users, posts, toggleFollow, isFollowing } = useApp();
  const [activeTab, setActiveTab] = useState<'posts' | 'about'>('posts');

  if (!isOpen) return null;

  const displayUser = userId ? users.find(u => u.id === userId) : currentUser;
  if (!displayUser) return null;

  const isOwnProfile = currentUser?.id === displayUser.id;
  const userPosts = posts.filter(p => p.authorId === displayUser.id);
  const totalUpvotes = userPosts.reduce((sum, p) => sum + p.upvotes, 0);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="glass-card"
        style={{
          width: '100%', maxWidth: 700, margin: '0 16px',
          maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ height: 120, background: 'linear-gradient(135deg, #6366f1, #9333ea, #ec4899)', position: 'relative' }}>
          <button
            onClick={onClose}
            style={{
              position: 'absolute', top: 12, right: 12,
              padding: 8, borderRadius: 8, background: 'rgba(0, 0, 0, 0.5)',
              border: 'none', cursor: 'pointer',
            }}
          >
            <X size={20} color="white" />
          </button>
        </div>

        <div style={{ padding: '0 24px', marginTop: -40 }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 16, marginBottom: 16 }}>
            <div className="avatar-ring" style={{ padding: 4 }}>
              <div style={{
                width: 80, height: 80, borderRadius: '50%',
                background: 'linear-gradient(135deg, #6366f1, #9333ea)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 28, fontWeight: 'bold', border: '4px solid #0f0f23',
              }}>
                {displayUser.avatar}
              </div>
            </div>
            <div style={{ flex: 1, paddingBottom: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <h2 style={{ fontSize: 22, fontWeight: 700 }}>{displayUser.username}</h2>
                {displayUser.isVerified && <CheckCircle2 size={18} color="#34d399" />}
              </div>
              <p style={{ fontSize: 14, color: '#94a3b8' }}>{displayUser.role}</p>
            </div>
            {!isOwnProfile && (
              <button
                onClick={() => toggleFollow(displayUser.id)}
                className={isFollowing(displayUser.id) ? 'btn-ghost' : 'btn-primary'}
              >
                {isFollowing(displayUser.id) ? 'Unafuata' : 'Fuata'}
              </button>
            )}
          </div>

          <p style={{ fontSize: 14, color: '#cbd5e1', marginBottom: 16, lineHeight: 1.5 }}>
            {displayUser.bio || 'Hakuna bio bado.'}
          </p>

          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12,
            padding: 16, borderRadius: 12, background: 'rgba(30, 41, 59, 0.3)', marginBottom: 16,
          }}>
            {[
              { label: 'Posts', value: userPosts.length, icon: BookOpen },
              { label: 'Majibu', value: displayUser.answersCount, icon: MessageCircle },
              { label: 'Upvotes', value: totalUpvotes, icon: ThumbsUp },
              { label: 'Followers', value: displayUser.followers, icon: Users },
            ].map((stat, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <stat.icon size={20} color="#a5b4fc" style={{ margin: '0 auto 4px' }} />
                <p style={{ fontSize: 18, fontWeight: 700, color: '#a5b4fc' }}>{stat.value}</p>
                <p style={{ fontSize: 11, color: '#64748b' }}>{stat.label}</p>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 8, borderBottom: '1px solid rgba(51, 65, 85, 0.3)', marginBottom: 16 }}>
            {(['posts', 'about'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: '12px 20px', background: 'transparent', border: 'none',
                  borderBottom: activeTab === tab ? '2px solid #6366f1' : '2px solid transparent',
                  color: activeTab === tab ? '#a5b4fc' : '#94a3b8',
                  cursor: 'pointer', fontSize: 14, fontWeight: 500,
                }}
              >
                {tab === 'posts' ? 'Posts' : 'Kuhusu'}
              </button>
            ))}
          </div>

          <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 24 }}>
            {activeTab === 'posts' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {userPosts.length === 0 ? (
                  <p style={{ textAlign: 'center', color: '#64748b', padding: 32 }}>Hakuna posts bado</p>
                ) : (
                  userPosts.map((post) => (
                    <div
                      key={post.id}
                      style={{
                        padding: 16, borderRadius: 12,
                        background: 'rgba(30, 41, 59, 0.3)',
                        border: '1px solid rgba(51, 65, 85, 0.3)',
                      }}
                    >
                      <h4 style={{ fontSize: 15, fontWeight: 600, marginBottom: 8 }}>{post.title}</h4>
                      <div style={{ display: 'flex', gap: 16, fontSize: 12, color: '#64748b' }}>
                        <span><ThumbsUp size={12} style={{ display: 'inline' }} /> {post.upvotes}</span>
                        <span><MessageCircle size={12} style={{ display: 'inline' }} /> {post.commentsCount}</span>
                        <span>{new Date(post.createdAt).toLocaleDateString('sw-TZ')}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'about' && (
              <div>
                <div style={{ padding: 16, borderRadius: 12, background: 'rgba(30, 41, 59, 0.3)', marginBottom: 12 }}>
                  <p style={{ fontSize: 14, color: '#94a3b8', marginBottom: 4 }}>Reputation</p>
                  <p style={{ fontSize: 20, fontWeight: 700, color: '#fbbf24' }}>
                    {displayUser.reputation.toLocaleString()} points
                  </p>
                </div>
                <div style={{ padding: 16, borderRadius: 12, background: 'rgba(30, 41, 59, 0.3)' }}>
                  <p style={{ fontSize: 14, color: '#94a3b8', marginBottom: 4 }}>Amejiunga</p>
                  <p style={{ fontSize: 16, fontWeight: 600, color: '#cbd5e1' }}>
                    {new Date(displayUser.joinedAt).toLocaleDateString('sw-TZ', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { useParams } from '../router/Router';
import { useApp } from '../contexts/AppContext';
import { Comment } from '../types';
import { 
  Camera, Edit3, MapPin, Calendar, Link as LinkIcon, 
  Award, BookOpen, MessageCircle, ThumbsUp, Users, 
  CheckCircle2, Settings, Share2, Flag, MoreHorizontal,
  TrendingUp, Clock, Star, Heart
} from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { userId } = useParams();
  const { currentUser, users, posts, comments, toggleFollow, isFollowing } = useApp();
  const [activeTab, setActiveTab] = useState<'posts' | 'answers' | 'about' | 'activity'>('posts');
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    bio: '',
    location: '',
    website: '',
    twitter: '',
    github: '',
    linkedin: '',
  });

  const profileUser = userId 
    ? users.find(u => u.id === userId) 
    : currentUser;

  const isOwnProfile = currentUser?.id === profileUser?.id;

  useEffect(() => {
    if (profileUser) {
      setEditData({
        bio: profileUser.bio || '',
        location: '',
        website: '',
        twitter: '',
        github: '',
        linkedin: '',
      });
    }
  }, [profileUser]);

  if (!profileUser) {
    return (
      <div style={{ padding: 48, textAlign: 'center' }}>
        <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>User hajapatikana</h2>
        <p style={{ color: '#94a3b8' }}>User huyu hayupo au amefutwa</p>
      </div>
    );
  }

  const userPosts = posts.filter(p => p.authorId === profileUser.id);
  const userComments = (comments as Comment[]).filter(c => c.authorId === profileUser.id);
  const totalUpvotes = userPosts.reduce((sum, p) => sum + p.upvotes, 0);

  const handleSaveProfile = () => {
    // TODO: Implement save to backend
    setIsEditing(false);
  };

  const handleFollow = () => {
    if (profileUser.id) {
      toggleFollow(profileUser.id);
    }
  };

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '24px 16px' }}>
      {/* Cover Image */}
      <div style={{
        height: 200,
        borderRadius: 16,
        background: 'linear-gradient(135deg, #6366f1, #9333ea, #ec4899)',
        position: 'relative',
        marginBottom: 80,
      }}>
        {isOwnProfile && (
          <button style={{
            position: 'absolute',
            top: 16,
            right: 16,
            padding: 8,
            borderRadius: 8,
            background: 'rgba(0, 0, 0, 0.5)',
            border: 'none',
            cursor: 'pointer',
            color: 'white',
          }}>
            <Camera size={20} />
          </button>
        )}
      </div>

      {/* Profile Header */}
      <div style={{ marginTop: -60, marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 24, marginBottom: 16 }}>
          {/* Avatar */}
          <div style={{ position: 'relative' }}>
            <div className="avatar-ring" style={{ padding: 4 }}>
              <div style={{
                width: 120,
                height: 120,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #6366f1, #9333ea)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 48,
                fontWeight: 'bold',
                border: '4px solid #0f0f23',
              }}>
                {profileUser.avatar}
              </div>
            </div>
            {isOwnProfile && (
              <button style={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                width: 36,
                height: 36,
                borderRadius: '50%',
                background: '#6366f1',
                border: '3px solid #0f0f23',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
              }}>
                <Camera size={18} />
              </button>
            )}
          </div>

          {/* User Info */}
          <div style={{ flex: 1, paddingBottom: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
              <h1 style={{ fontSize: 28, fontWeight: 700 }}>{profileUser.username}</h1>
              {profileUser.isVerified && (
                <CheckCircle2 size={24} color="#34d399" />
              )}
            </div>
            <p style={{ fontSize: 16, color: '#94a3b8' }}>{profileUser.role}</p>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: 12 }}>
            {isOwnProfile ? (
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="btn-primary"
                style={{ display: 'flex', alignItems: 'center', gap: 8 }}
              >
                <Edit3 size={16} />
                Hariri Profile
              </button>
            ) : (
              <>
                <button
                  onClick={handleFollow}
                  className={isFollowing(profileUser.id) ? 'btn-ghost' : 'btn-primary'}
                  style={{ display: 'flex', alignItems: 'center', gap: 8 }}
                >
                  <Users size={16} />
                  {isFollowing(profileUser.id) ? 'Unafuata' : 'Fuata'}
                </button>
                <button className="btn-ghost" style={{ padding: 10 }}>
                  <Share2 size={16} />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Bio */}
        {isEditing ? (
          <div style={{ marginBottom: 24 }}>
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
                minHeight: 100,
              }}
            />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 12 }}>
              <input
                type="text"
                placeholder="Location"
                value={editData.location}
                onChange={(e) => setEditData({ ...editData, location: e.target.value })}
                style={{
                  padding: 10,
                  borderRadius: 8,
                  background: 'rgba(30, 41, 59, 0.5)',
                  border: '1px solid rgba(51, 65, 85, 0.5)',
                  color: '#e2e8f0',
                  fontSize: 14,
                }}
              />
              <input
                type="url"
                placeholder="Website"
                value={editData.website}
                onChange={(e) => setEditData({ ...editData, website: e.target.value })}
                style={{
                  padding: 10,
                  borderRadius: 8,
                  background: 'rgba(30, 41, 59, 0.5)',
                  border: '1px solid rgba(51, 65, 85, 0.5)',
                  color: '#e2e8f0',
                  fontSize: 14,
                }}
              />
            </div>
            <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
              <input
                type="text"
                placeholder="Twitter username"
                value={editData.twitter}
                onChange={(e) => setEditData({ ...editData, twitter: e.target.value })}
                style={{
                  flex: 1,
                  padding: 10,
                  borderRadius: 8,
                  background: 'rgba(30, 41, 59, 0.5)',
                  border: '1px solid rgba(51, 65, 85, 0.5)',
                  color: '#e2e8f0',
                  fontSize: 14,
                }}
              />
              <input
                type="text"
                placeholder="GitHub username"
                value={editData.github}
                onChange={(e) => setEditData({ ...editData, github: e.target.value })}
                style={{
                  flex: 1,
                  padding: 10,
                  borderRadius: 8,
                  background: 'rgba(30, 41, 59, 0.5)',
                  border: '1px solid rgba(51, 65, 85, 0.5)',
                  color: '#e2e8f0',
                  fontSize: 14,
                }}
              />
              <input
                type="text"
                placeholder="LinkedIn username"
                value={editData.linkedin}
                onChange={(e) => setEditData({ ...editData, linkedin: e.target.value })}
                style={{
                  flex: 1,
                  padding: 10,
                  borderRadius: 8,
                  background: 'rgba(30, 41, 59, 0.5)',
                  border: '1px solid rgba(51, 65, 85, 0.5)',
                  color: '#e2e8f0',
                  fontSize: 14,
                }}
              />
            </div>
            <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
              <button onClick={handleSaveProfile} className="btn-primary">
                Hifadhi Mabadiliko
              </button>
              <button onClick={() => setIsEditing(false)} className="btn-ghost">
                Ghairi
              </button>
            </div>
          </div>
        ) : (
          <p style={{ fontSize: 16, color: '#cbd5e1', marginBottom: 16, lineHeight: 1.6 }}>
            {profileUser.bio || 'Hakuna bio bado.'}
          </p>
        )}

        {/* Meta Info */}
        <div style={{ display: 'flex', gap: 24, marginBottom: 24, fontSize: 14, color: '#94a3b8', flexWrap: 'wrap' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <MapPin size={16} /> Dar es Salaam, Tanzania
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Calendar size={16} /> Amejiunga {new Date(profileUser.joinedAt).toLocaleDateString('sw-TZ', { month: 'long', year: 'numeric' })}
          </span>
          {editData.website && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <LinkIcon size={16} />
              <a href={editData.website} target="_blank" rel="noopener noreferrer" style={{ color: '#6366f1' }}>
                {editData.website}
              </a>
            </span>
          )}
        </div>

        {/* Stats */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gap: 16,
          padding: 20,
          borderRadius: 16,
          background: 'rgba(30, 41, 59, 0.3)',
          marginBottom: 24,
        }}>
          {[
            { label: 'Posts', value: userPosts.length, icon: BookOpen, color: '#a5b4fc' },
            { label: 'Majibu', value: userComments.length, icon: MessageCircle, color: '#6ee7b7' },
            { label: 'Upvotes', value: totalUpvotes, icon: ThumbsUp, color: '#fbbf24' },
            { label: 'Followers', value: profileUser.followers, icon: Users, color: '#f472b6' },
            { label: 'Reputation', value: profileUser.reputation, icon: Award, color: '#c084fc' },
          ].map((stat, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <stat.icon size={24} color={stat.color} style={{ margin: '0 auto 8px' }} />
              <p style={{ fontSize: 24, fontWeight: 700, color: stat.color }}>{stat.value}</p>
              <p style={{ fontSize: 12, color: '#64748b' }}>{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Badges */}
        {profileUser.badges.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>Badges</h3>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {profileUser.badges.map((badge) => (
                <div
                  key={badge.id}
                  style={{
                    padding: '10px 16px',
                    borderRadius: 20,
                    background: 'rgba(251, 191, 36, 0.1)',
                    border: '1px solid rgba(251, 191, 36, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    fontSize: 14,
                  }}
                >
                  <span style={{ fontSize: 20 }}>{badge.icon}</span>
                  <span style={{ color: '#fcd34d', fontWeight: 500 }}>{badge.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Social Links */}
        {(editData.twitter || editData.github || editData.linkedin) && (
          <div style={{ marginBottom: 24 }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>Social Links</h3>
            <div style={{ display: 'flex', gap: 12 }}>
              {editData.twitter && (
                <a
                  href={`https://twitter.com/${editData.twitter}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    padding: '8px 16px',
                    borderRadius: 8,
                    background: 'rgba(29, 161, 242, 0.1)',
                    border: '1px solid rgba(29, 161, 242, 0.3)',
                    color: '#1da1f2',
                    fontSize: 14,
                    textDecoration: 'none',
                  }}
                >
                  Twitter: @{editData.twitter}
                </a>
              )}
              {editData.github && (
                <a
                  href={`https://github.com/${editData.github}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    padding: '8px 16px',
                    borderRadius: 8,
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    color: '#e2e8f0',
                    fontSize: 14,
                    textDecoration: 'none',
                  }}
                >
                  GitHub: @{editData.github}
                </a>
              )}
              {editData.linkedin && (
                <a
                  href={`https://linkedin.com/in/${editData.linkedin}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    padding: '8px 16px',
                    borderRadius: 8,
                    background: 'rgba(10, 102, 194, 0.1)',
                    border: '1px solid rgba(10, 102, 194, 0.3)',
                    color: '#0a66c2',
                    fontSize: 14,
                    textDecoration: 'none',
                  }}
                >
                  LinkedIn: {editData.linkedin}
                </a>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        gap: 8,
        borderBottom: '1px solid rgba(51, 65, 85, 0.3)',
        marginBottom: 24,
      }}>
        {(['posts', 'answers', 'about', 'activity'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '12px 24px',
              background: 'transparent',
              border: 'none',
              borderBottom: activeTab === tab ? '2px solid #6366f1' : '2px solid transparent',
              color: activeTab === tab ? '#a5b4fc' : '#94a3b8',
              cursor: 'pointer',
              fontSize: 15,
              fontWeight: 500,
            }}
          >
            {tab === 'posts' ? 'Posts' : tab === 'answers' ? 'Majibu' : tab === 'about' ? 'Kuhusu' : 'Activity'}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'posts' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {userPosts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 48, color: '#64748b' }}>
                <BookOpen size={48} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
                <p style={{ fontSize: 16 }}>Hakuna posts bado</p>
              </div>
            ) : (
              userPosts.map((post) => (
                <div
                  key={post.id}
                  className="glass-card"
                  style={{ padding: 20 }}
                >
                  <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>
                    {post.title}
                  </h3>
                  <p style={{ fontSize: 14, color: '#94a3b8', marginBottom: 16, lineHeight: 1.6 }}>
                    {post.content.substring(0, 200)}...
                  </p>
                  <div style={{ display: 'flex', gap: 24, fontSize: 13, color: '#64748b' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <ThumbsUp size={14} /> {post.upvotes}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <MessageCircle size={14} /> {post.commentsCount}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Clock size={14} /> {new Date(post.createdAt).toLocaleDateString('sw-TZ')}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'answers' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {userComments.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 48, color: '#64748b' }}>
                <MessageCircle size={48} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
                <p style={{ fontSize: 16 }}>Hakuna majibu bado</p>
              </div>
            ) : (
              userComments.map((comment: Comment) => (
                <div
                  key={comment.id}
                  className="glass-card"
                  style={{ padding: 20 }}
                >
                  <p style={{ fontSize: 14, color: '#cbd5e1', marginBottom: 12, lineHeight: 1.6 }}>
                    {comment.content}
                  </p>
                  <div style={{ display: 'flex', gap: 24, fontSize: 13, color: '#64748b' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <ThumbsUp size={14} /> {comment.upvotes}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Clock size={14} /> {new Date(comment.createdAt).toLocaleDateString('sw-TZ')}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'about' && (
          <div>
            <div className="glass-card" style={{ padding: 24 }}>
              <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>Takwimu za Mtumiaji</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div style={{ padding: 16, borderRadius: 12, background: 'rgba(30, 41, 59, 0.3)' }}>
                  <p style={{ fontSize: 14, color: '#94a3b8', marginBottom: 4 }}>Level</p>
                  <p style={{ fontSize: 24, fontWeight: 700, color: '#a5b4fc' }}>
                    Level {Math.floor(profileUser.reputation / 1000) + 1}
                  </p>
                </div>
                <div style={{ padding: 16, borderRadius: 12, background: 'rgba(30, 41, 59, 0.3)' }}>
                  <p style={{ fontSize: 14, color: '#94a3b8', marginBottom: 4 }}>Reputation</p>
                  <p style={{ fontSize: 24, fontWeight: 700, color: '#fbbf24' }}>
                    {profileUser.reputation.toLocaleString()} points
                  </p>
                </div>
                <div style={{ padding: 16, borderRadius: 12, background: 'rgba(30, 41, 59, 0.3)' }}>
                  <p style={{ fontSize: 14, color: '#94a3b8', marginBottom: 4 }}>Amejiunga</p>
                  <p style={{ fontSize: 16, fontWeight: 600, color: '#cbd5e1' }}>
                    {new Date(profileUser.joinedAt).toLocaleDateString('sw-TZ', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
                <div style={{ padding: 16, borderRadius: 12, background: 'rgba(30, 41, 59, 0.3)' }}>
                  <p style={{ fontSize: 14, color: '#94a3b8', marginBottom: 4 }}>Email</p>
                  <p style={{ fontSize: 14, fontWeight: 500, color: '#cbd5e1' }}>
                    {profileUser.email}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'activity' && (
          <div>
            <div style={{ textAlign: 'center', padding: 48, color: '#64748b' }}>
              <TrendingUp size={48} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
              <p style={{ fontSize: 16 }}>Activity feed inakuja hivi karibuni</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

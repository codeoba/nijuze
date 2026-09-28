import React, { useState, useEffect, useRef } from 'react';
import { useParams } from '../router/Router';
import { useApp } from '../contexts/AppContext';
import { Comment } from '../types';
import { 
  Camera, Edit3, MapPin, Calendar, Link as LinkIcon, 
  Award, BookOpen, MessageCircle, ThumbsUp, Users, 
  CheckCircle2, Settings, Share2, Flag, MoreHorizontal,
  TrendingUp, Clock, Star, Heart, Loader2
} from 'lucide-react';

import { db } from '../services/database';
import { usersAPI, uploadAPI } from '../services/api';

export const ProfilePage: React.FC = () => {
  const { userId } = useParams();
  const { currentUser, users, posts, comments, toggleFollow, isFollowing, updateUserProfile } = useApp();
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

  const bannerInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  const [asyncUser, setAsyncUser] = useState<any>(null);

  const profileUser = userId 
    ? (users.find(u => u.id === userId || u.username?.toLowerCase() === userId?.toLowerCase()) || db.getUserById(userId) || asyncUser) 
    : currentUser;

  const isOwnProfile = currentUser?.id === profileUser?.id;

  useEffect(() => {
    if (userId && !users.find(u => u.id === userId || u.username?.toLowerCase() === userId?.toLowerCase()) && !db.getUserById(userId)) {
      usersAPI.getById(userId).then(res => {
        if (res) setAsyncUser(res);
      }).catch(() => {});
    }
  }, [userId, users]);

  useEffect(() => {
    if (profileUser) {
      setEditData({
        bio: profileUser.bio || '',
        location: profileUser.location || '',
        website: profileUser.website || '',
        twitter: profileUser.twitter || '',
        github: profileUser.github || '',
        linkedin: profileUser.linkedin || '',
      });
    }
  }, [profileUser]);

  if (!profileUser) {
    return (
      <div style={{ padding: 48, textAlign: 'center' }}>
        <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>User hajapatikana</h2>
        <p style={{ color: 'var(--text-muted)' }}>User huyu hayupo au amefutwa</p>
      </div>
    );
  }

  const userPosts = posts.filter(p => p.authorId === profileUser.id);
  const userComments = (comments as Comment[]).filter(c => c.authorId === profileUser.id);
  const totalUpvotes = userPosts.reduce((sum, p) => sum + p.upvotes, 0);

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingBanner(true);
    try {
      let imageUrl = '';
      try {
        const res = await uploadAPI.upload(file);
        if (res && res.url) imageUrl = res.url;
      } catch {
        imageUrl = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
      }
      if (imageUrl) {
        await updateUserProfile({ cover_image: imageUrl, coverImage: imageUrl });
      }
    } catch (err) {
      console.error('Error uploading banner:', err);
    } finally {
      setIsUploadingBanner(false);
      if (bannerInputRef.current) bannerInputRef.current.value = '';
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingAvatar(true);
    try {
      let imageUrl = '';
      try {
        const res = await uploadAPI.upload(file);
        if (res && res.url) imageUrl = res.url;
      } catch {
        imageUrl = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
      }
      if (imageUrl) {
        await updateUserProfile({ avatar: imageUrl });
      }
    } catch (err) {
      console.error('Error uploading avatar:', err);
    } finally {
      setIsUploadingAvatar(false);
      if (avatarInputRef.current) avatarInputRef.current.value = '';
    }
  };

  const handleSaveProfile = async () => {
    await updateUserProfile({
      bio: editData.bio,
      location: editData.location,
      website: editData.website,
      twitter: editData.twitter,
      github: editData.github,
      linkedin: editData.linkedin,
    });
    setIsEditing(false);
  };

  const handleFollow = () => {
    if (profileUser.id) {
      toggleFollow(profileUser.id);
    }
  };

  const formatJoinDate = (d?: string, options?: Intl.DateTimeFormatOptions) => {
    const rawDate = d || (profileUser as any).created_at || (profileUser as any).createdAt;
    if (!rawDate) return 'Hivi karibuni';
    try {
      const parsed = new Date(rawDate);
      return isNaN(parsed.getTime()) ? 'Hivi karibuni' : parsed.toLocaleDateString('sw-TZ', options || { month: 'long', year: 'numeric' });
    } catch {
      return 'Hivi karibuni';
    }
  };

  const coverUrl = profileUser.cover_image || profileUser.coverImage;
  const avatarUrl = profileUser.avatar;
  const isImageAvatar = avatarUrl && (avatarUrl.startsWith('http') || avatarUrl.startsWith('data:'));

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '24px 16px' }}>
      {/* Cover Image Banner */}
      <div style={{
        height: 200,
        borderRadius: 16,
        background: coverUrl ? `url(${coverUrl}) center/cover no-repeat` : 'linear-gradient(135deg, #6366f1, #9333ea, #ec4899)',
        position: 'relative',
        marginBottom: 80,
        overflow: 'hidden',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
      }}>
        {isOwnProfile && (
          <>
            <input 
              type="file" 
              ref={bannerInputRef} 
              onChange={handleBannerUpload} 
              accept="image/*" 
              style={{ display: 'none' }} 
            />
            <button 
              onClick={() => bannerInputRef.current?.click()}
              disabled={isUploadingBanner}
              title="Badilisha picha ya cover"
              style={{
                position: 'absolute',
                top: 16,
                right: 16,
                padding: '8px 14px',
                borderRadius: 10,
                background: 'rgba(0, 0, 0, 0.55)',
                backdropFilter: 'blur(6px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                cursor: isUploadingBanner ? 'wait' : 'pointer',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                fontSize: 13,
                fontWeight: 600,
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(0, 0, 0, 0.75)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(0, 0, 0, 0.55)')}
            >
              {isUploadingBanner ? <Loader2 size={16} className="animate-spin" /> : <Camera size={16} />}
              <span>{isUploadingBanner ? 'Inapakia...' : 'Weka Cover'}</span>
            </button>
          </>
        )}
      </div>

      {/* Profile Header */}
      <div style={{ marginTop: -60, marginBottom: 24, position: 'relative', zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 24, marginBottom: 16 }}>
          {/* Avatar */}
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <div className="avatar-ring" style={{ padding: 4 }}>
              <div style={{
                width: 120,
                height: 120,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #6366f1, #9333ea)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 44,
                fontWeight: 'bold',
                border: '4px solid var(--bg-surface)',
                color: 'white',
                overflow: 'hidden',
                boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
              }}>
                {isImageAvatar ? (
                  <img 
                    src={avatarUrl} 
                    alt={profileUser.username} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                  />
                ) : (
                  profileUser.avatar || (profileUser.username ? profileUser.username.slice(0, 2).toUpperCase() : 'NJ')
                )}
              </div>
            </div>
            {isOwnProfile && (
              <>
                <input 
                  type="file" 
                  ref={avatarInputRef} 
                  onChange={handleAvatarUpload} 
                  accept="image/*" 
                  style={{ display: 'none' }} 
                />
                <button 
                  onClick={() => avatarInputRef.current?.click()}
                  disabled={isUploadingAvatar}
                  title="Badilisha picha ya wasifu"
                  style={{
                    position: 'absolute',
                    bottom: 4,
                    right: 4,
                    width: 38,
                    height: 38,
                    borderRadius: '50%',
                    background: '#6366f1',
                    border: '3px solid var(--bg-surface)',
                    cursor: isUploadingAvatar ? 'wait' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                    transition: 'transform 0.15s, background 0.2s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.1)')}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                >
                  {isUploadingAvatar ? <Loader2 size={16} className="animate-spin" /> : <Camera size={18} />}
                </button>
              </>
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
            <p style={{ fontSize: 16, color: 'var(--text-muted)' }}>{profileUser.role}</p>
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
                background: 'var(--input-bg)',
                border: '1px solid var(--input-border)',
                color: 'var(--input-text)',
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
                  background: 'var(--input-bg)',
                  border: '1px solid var(--input-border)',
                  color: 'var(--input-text)',
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
                  background: 'var(--input-bg)',
                  border: '1px solid var(--input-border)',
                  color: 'var(--input-text)',
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
                  background: 'var(--input-bg)',
                  border: '1px solid var(--input-border)',
                  color: 'var(--input-text)',
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
                  background: 'var(--input-bg)',
                  border: '1px solid var(--input-border)',
                  color: 'var(--input-text)',
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
                  background: 'var(--input-bg)',
                  border: '1px solid var(--input-border)',
                  color: 'var(--input-text)',
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
          <p style={{ fontSize: 16, color: 'var(--text-body)', marginBottom: 16, lineHeight: 1.6 }}>
            {profileUser.bio || 'Hakuna bio bado.'}
          </p>
        )}

        {/* Meta Info */}
        <div style={{ display: 'flex', gap: 24, marginBottom: 24, fontSize: 14, color: 'var(--text-muted)', flexWrap: 'wrap' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <MapPin size={16} /> Dar es Salaam, Tanzania
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Calendar size={16} /> Amejiunga {formatJoinDate(profileUser.joinedAt)}
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
          background: 'var(--bg-subtle)',
          border: '1px solid var(--border-app)',
          marginBottom: 24,
        }}>
          {[
            { label: 'Posts', value: userPosts.length, icon: BookOpen, color: 'var(--btn-ghost-text)' },
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
                    color: 'var(--text-main)',
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
                  <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 16, lineHeight: 1.6 }}>
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
                  <p style={{ fontSize: 14, color: 'var(--text-body)', marginBottom: 12, lineHeight: 1.6 }}>
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
                <div style={{ padding: 16, borderRadius: 12, background: 'var(--bg-subtle)', border: '1px solid var(--border-app)' }}>
                  <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 4 }}>Level</p>
                  <p style={{ fontSize: 24, fontWeight: 700, color: 'var(--border-focus)' }}>
                    Level {Math.floor(profileUser.reputation / 1000) + 1}
                  </p>
                </div>
                <div style={{ padding: 16, borderRadius: 12, background: 'var(--bg-subtle)', border: '1px solid var(--border-app)' }}>
                  <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 4 }}>Reputation</p>
                  <p style={{ fontSize: 24, fontWeight: 700, color: '#f59e0b' }}>
                    {profileUser.reputation.toLocaleString()} points
                  </p>
                </div>
                <div style={{ padding: 16, borderRadius: 12, background: 'var(--bg-subtle)', border: '1px solid var(--border-app)' }}>
                  <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 4 }}>Amejiunga</p>
                  <p style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-main)' }}>
                    {formatJoinDate(profileUser.joinedAt, {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
                <div style={{ padding: 16, borderRadius: 12, background: 'var(--bg-subtle)', border: '1px solid var(--border-app)' }}>
                  <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 4 }}>Email</p>
                  <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-main)' }}>
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

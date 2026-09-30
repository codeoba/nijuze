import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from '../router/Router';
import { useApp } from '../contexts/AppContext';
import { Comment, User } from '../types';
import { 
  Camera, Edit3, MapPin, Calendar, Link as LinkIcon, 
  Award, BookOpen, MessageCircle, ThumbsUp, Users, 
  CheckCircle2, Settings, Share2, Flag, MoreHorizontal,
  TrendingUp, Clock, Star, Heart, Loader2, LogIn, UserPlus, ArrowLeft
} from 'lucide-react';

import { db } from '../services/database';
import { usersAPI, uploadAPI } from '../services/api';

export const ProfilePage: React.FC = () => {
  const { userId } = useParams();
  const { navigate } = useRouter();
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

  const [localCover, setLocalCover] = useState<string | null>(null);
  const [localAvatar, setLocalAvatar] = useState<string | null>(null);

  const [asyncUser, setAsyncUser] = useState<any>(null);
  const [isLoadingUser, setIsLoadingUser] = useState<boolean>(Boolean(userId));

  // If currentUser in context is null, fallback to reading localStorage immediately
  const localSavedUser: User | null = (() => {
    try {
      const saved = localStorage.getItem('nijuze_user') || localStorage.getItem('nijuze_current_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  })();

  const effectiveCurrentUser = currentUser || localSavedUser;

  const profileUser: any = userId 
    ? (users.find(u => u.id === userId || u.username?.toLowerCase() === userId?.toLowerCase()) || db.getUserById(userId) || asyncUser) 
    : effectiveCurrentUser;

  const isOwnProfile = Boolean(effectiveCurrentUser?.id && profileUser?.id && effectiveCurrentUser.id === profileUser.id);

  useEffect(() => {
    if (userId) {
      const found = users.find(u => u.id === userId || u.username?.toLowerCase() === userId?.toLowerCase()) || db.getUserById(userId);
      if (found) {
        setIsLoadingUser(false);
      } else {
        setIsLoadingUser(true);
        usersAPI.getById(userId).then(res => {
          if (res) setAsyncUser(res);
        }).catch(() => {}).finally(() => {
          setIsLoadingUser(false);
        });
      }
    } else {
      setIsLoadingUser(false);
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

  // If visiting /profile directly without being logged in
  if (!profileUser && !userId) {
    return (
      <div style={{ maxWidth: 600, margin: '60px auto', padding: '0 16px' }}>
        <div className="glass-card" style={{ padding: 40, textAlign: 'center', borderRadius: 20 }}>
          <div style={{
            width: 72,
            height: 72,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(147, 51, 234, 0.2))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
            color: '#6366f1'
          }}>
            <LogIn size={36} />
          </div>
          <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12, color: 'var(--text-main)' }}>
            Karibu kwenye Wasifu Wako
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 15, lineHeight: 1.6, marginBottom: 28 }}>
            Tafadhali ingia kwenye akaunti yako au jiunge ili uweze kuona wasifu wako, kupakia picha za wasifu na cover, na kufuatilia michango yako.
          </p>
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button 
              onClick={() => navigate('/login')} 
              className="btn-primary" 
              style={{ padding: '10px 24px', display: 'flex', alignItems: 'center', gap: 8, fontSize: 15 }}
            >
              <LogIn size={18} />
              Ingia Kwenye Akaunti
            </button>
            <button 
              onClick={() => navigate('/register')} 
              className="btn-ghost" 
              style={{ padding: '10px 24px', display: 'flex', alignItems: 'center', gap: 8, fontSize: 15 }}
            >
              <UserPlus size={18} />
              Jisajili Bure
            </button>
          </div>
        </div>
      </div>
    );
  }

  // If visiting /profile/:userId and user is still loading
  if (isLoadingUser) {
    return (
      <div style={{ padding: 60, textAlign: 'center' }}>
        <Loader2 size={36} className="animate-spin" style={{ margin: '0 auto 16px', color: '#6366f1' }} />
        <p style={{ color: 'var(--text-muted)', fontSize: 16 }}>Inapakia taarifa za mtumiaji...</p>
      </div>
    );
  }

  // If user truly not found
  if (!profileUser) {
    return (
      <div style={{ maxWidth: 500, margin: '60px auto', padding: '0 16px', textAlign: 'center' }}>
        <div className="glass-card" style={{ padding: 40, borderRadius: 20 }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 10, color: 'var(--text-main)' }}>Mtumiaji Hajapatikana</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>Akaunti ya mtumiaji huyu haipo au imefutwa.</p>
          <button onClick={() => navigate('/')} className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <ArrowLeft size={16} /> Rudi Mwanzo
          </button>
        </div>
      </div>
    );
  }

  // Safe normalized variables
  const userBadges = Array.isArray(profileUser.badges) ? profileUser.badges : [];
  const userReputation = typeof profileUser.reputation === 'number' ? profileUser.reputation : 0;
  const userFollowersCount = typeof profileUser.followers === 'number' 
    ? profileUser.followers 
    : (Array.isArray(profileUser.followers) ? profileUser.followers.length : 0);
  const userPosts = Array.isArray(posts) ? posts.filter(p => p && p.authorId === profileUser.id) : [];
  const userComments = Array.isArray(comments) ? (comments as Comment[]).filter(c => c && c.authorId === profileUser.id) : [];
  const totalUpvotes = userPosts.reduce((sum, p) => sum + (p?.upvotes || 0), 0);

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingBanner(true);
    try {
      let imageUrl = '';
      try {
        const res = await uploadAPI.upload(file);
        if (res && res.url) imageUrl = res.url;
      } catch (uploadErr) {
        console.warn('API upload failed, using FileReader fallback:', uploadErr);
        imageUrl = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
      }
      if (imageUrl) {
        setLocalCover(imageUrl);
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
      } catch (uploadErr) {
        console.warn('API upload failed, using FileReader fallback:', uploadErr);
        imageUrl = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
      }
      if (imageUrl) {
        setLocalAvatar(imageUrl);
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
    const rawDate = d || profileUser.created_at || profileUser.createdAt || profileUser.joinedAt;
    if (!rawDate) return 'Hivi karibuni';
    try {
      const parsed = new Date(rawDate);
      return isNaN(parsed.getTime()) ? 'Hivi karibuni' : parsed.toLocaleDateString('sw-TZ', options || { month: 'long', year: 'numeric' });
    } catch {
      return 'Hivi karibuni';
    }
  };

  const formatImageUrl = (url?: string) => {
    if (!url) return '';
    if (url.startsWith('http://localhost:5000/')) {
      return url.replace('http://localhost:5000', '');
    }
    return url;
  };

  const coverUrl = localCover || formatImageUrl(profileUser.cover_image || profileUser.coverImage);
  const avatarUrl = localAvatar || formatImageUrl(profileUser.avatar);
  const isImageAvatar = avatarUrl && (avatarUrl.startsWith('http') || avatarUrl.startsWith('data:') || avatarUrl.startsWith('/'));

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '24px 16px' }}>
      {/* Cover Image Banner */}
      <div style={{
        height: 220,
        borderRadius: 16,
        background: coverUrl ? `url(${coverUrl}) center/cover no-repeat` : 'linear-gradient(135deg, #6366f1, #9333ea, #ec4899)',
        position: 'relative',
        marginBottom: 70,
        overflow: 'hidden',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
      }}>
        {isOwnProfile && (
          <label 
            htmlFor="banner-file-input"
            title="Badilisha picha ya cover"
            style={{
              position: 'absolute',
              top: 16,
              right: 16,
              padding: '8px 14px',
              borderRadius: 10,
              background: 'rgba(0, 0, 0, 0.65)',
              backdropFilter: 'blur(6px)',
              border: '1px solid rgba(255, 255, 255, 0.25)',
              cursor: isUploadingBanner ? 'wait' : 'pointer',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontSize: 13,
              fontWeight: 600,
              zIndex: 10,
              userSelect: 'none',
              transition: 'background 0.2s',
            }}
          >
            <input 
              id="banner-file-input"
              type="file" 
              ref={bannerInputRef} 
              onChange={handleBannerUpload} 
              accept="image/*" 
              disabled={isUploadingBanner}
              style={{ display: 'none' }} 
            />
            {isUploadingBanner ? <Loader2 size={16} className="animate-spin" /> : <Camera size={16} />}
            <span>{isUploadingBanner ? 'Inapakia...' : 'Weka Cover'}</span>
          </label>
        )}
      </div>

      {/* Profile Header */}
      <div style={{ marginTop: -60, marginBottom: 24, position: 'relative', zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 24, marginBottom: 16, flexWrap: 'wrap' }}>
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
                    alt={profileUser.username || 'Wasifu'} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                  />
                ) : (
                  profileUser.avatar || (profileUser.username ? profileUser.username.slice(0, 2).toUpperCase() : 'NJ')
                )}
              </div>
            </div>
            {isOwnProfile && (
              <label 
                htmlFor="avatar-file-input"
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
                  zIndex: 20,
                  userSelect: 'none',
                  transition: 'transform 0.15s, background 0.2s',
                }}
              >
                <input 
                  id="avatar-file-input"
                  type="file" 
                  ref={avatarInputRef} 
                  onChange={handleAvatarUpload} 
                  accept="image/*" 
                  disabled={isUploadingAvatar}
                  style={{ display: 'none' }} 
                />
                {isUploadingAvatar ? <Loader2 size={16} className="animate-spin" /> : <Camera size={18} />}
              </label>
            )}
          </div>

          {/* User Info */}
          <div style={{ flex: 1, minWidth: 200, paddingBottom: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4, flexWrap: 'wrap' }}>
              <h1 style={{ fontSize: 28, fontWeight: 700 }}>{profileUser.username || 'Mwanachama'}</h1>
              {profileUser.isVerified && (
                <CheckCircle2 size={24} color="#34d399" />
              )}
            </div>
            <p style={{ fontSize: 16, color: 'var(--text-muted)' }}>{profileUser.role || 'Mwanachama'}</p>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
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
                  className={profileUser.id && isFollowing(profileUser.id) ? 'btn-ghost' : 'btn-primary'}
                  style={{ display: 'flex', alignItems: 'center', gap: 8 }}
                >
                  <Users size={16} />
                  {profileUser.id && isFollowing(profileUser.id) ? 'Unafuata' : 'Fuata'}
                </button>
                <button 
                  onClick={() => {
                    navigator.clipboard?.writeText(window.location.href);
                    alert('Kiungo cha wasifu kimenakiliwa!');
                  }}
                  className="btn-ghost" 
                  style={{ padding: 10 }}
                  title="Shiriki Kiungo"
                >
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
                placeholder="Location (Mfano: Dar es Salaam)"
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
                placeholder="Website (https://...)"
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
            <MapPin size={16} /> {profileUser.location || 'Tanzania'}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Calendar size={16} /> Amejiunga {formatJoinDate(profileUser.joinedAt)}
          </span>
          {profileUser.website && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <LinkIcon size={16} />
              <a href={profileUser.website.startsWith('http') ? profileUser.website : `https://${profileUser.website}`} target="_blank" rel="noopener noreferrer" style={{ color: '#6366f1' }}>
                {profileUser.website}
              </a>
            </span>
          )}
        </div>

        {/* Stats */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
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
            { label: 'Followers', value: userFollowersCount, icon: Users, color: '#f472b6' },
            { label: 'Reputation', value: userReputation, icon: Award, color: '#c084fc' },
          ].map((stat, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <stat.icon size={24} color={stat.color} style={{ margin: '0 auto 8px' }} />
              <p style={{ fontSize: 24, fontWeight: 700, color: stat.color }}>{stat.value}</p>
              <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Badges */}
        {userBadges.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>Badges</h3>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {userBadges.map((badge: any, index: number) => (
                <div
                  key={badge.id || index}
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
                  <span style={{ fontSize: 20 }}>{badge.icon || '🏅'}</span>
                  <span style={{ color: '#fcd34d', fontWeight: 500 }}>{badge.name || 'Badge'}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Social Links */}
        {(profileUser.twitter || profileUser.github || profileUser.linkedin) && (
          <div style={{ marginBottom: 24 }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>Social Links</h3>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {profileUser.twitter && (
                <a
                  href={`https://twitter.com/${profileUser.twitter}`}
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
                  Twitter: @{profileUser.twitter}
                </a>
              )}
              {profileUser.github && (
                <a
                  href={`https://github.com/${profileUser.github}`}
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
                  GitHub: @{profileUser.github}
                </a>
              )}
              {profileUser.linkedin && (
                <a
                  href={`https://linkedin.com/in/${profileUser.linkedin}`}
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
                  LinkedIn: {profileUser.linkedin}
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
              <div style={{ textAlign: 'center', padding: 48, color: 'var(--text-muted)' }}>
                <BookOpen size={48} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
                <p style={{ fontSize: 16 }}>Hakuna posts bado</p>
              </div>
            ) : (
              userPosts.map((post) => (
                <div
                  key={post.id}
                  className="glass-card"
                  style={{ padding: 20, cursor: 'pointer' }}
                  onClick={() => navigate(`/post/${post.id}`)}
                >
                  <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>
                    {post.title}
                  </h3>
                  <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 16, lineHeight: 1.6 }}>
                    {(post.content || '').substring(0, 200)}...
                  </p>
                  <div style={{ display: 'flex', gap: 24, fontSize: 13, color: 'var(--text-muted)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <ThumbsUp size={14} /> {post.upvotes || 0}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <MessageCircle size={14} /> {post.commentsCount || 0}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Clock size={14} /> {post.createdAt ? new Date(post.createdAt).toLocaleDateString('sw-TZ') : 'Hivi karibuni'}
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
              <div style={{ textAlign: 'center', padding: 48, color: 'var(--text-muted)' }}>
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
                  <div style={{ display: 'flex', gap: 24, fontSize: 13, color: 'var(--text-muted)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <ThumbsUp size={14} /> {comment.upvotes || 0}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Clock size={14} /> {comment.createdAt ? new Date(comment.createdAt).toLocaleDateString('sw-TZ') : 'Hivi karibuni'}
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
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
                <div style={{ padding: 16, borderRadius: 12, background: 'var(--bg-subtle)', border: '1px solid var(--border-app)' }}>
                  <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 4 }}>Level</p>
                  <p style={{ fontSize: 24, fontWeight: 700, color: 'var(--border-focus)' }}>
                    Level {Math.floor(userReputation / 1000) + 1}
                  </p>
                </div>
                <div style={{ padding: 16, borderRadius: 12, background: 'var(--bg-subtle)', border: '1px solid var(--border-app)' }}>
                  <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 4 }}>Reputation</p>
                  <p style={{ fontSize: 24, fontWeight: 700, color: '#f59e0b' }}>
                    {userReputation.toLocaleString()} points
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
                  <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-main)', wordBreak: 'break-all' }}>
                    {profileUser.email || 'Haijawekwa'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'activity' && (
          <div>
            <div style={{ textAlign: 'center', padding: 48, color: 'var(--text-muted)' }}>
              <TrendingUp size={48} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
              <p style={{ fontSize: 16 }}>Activity feed inakuja hivi karibuni</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

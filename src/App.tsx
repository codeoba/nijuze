import React, { useState, useEffect } from 'react';
import {
  Search, Bell, MessageSquare, Home, Compass, Bookmark, Users, Settings,
  TrendingUp, Plus, Award, Zap, Sparkles, BarChart3,
  AlertCircle, LogOut, Trophy, BookOpen, User, Keyboard,
  Activity, Shield, Target, Flame, ChevronDown
} from 'lucide-react';
import { AppProvider, useApp } from './contexts/AppContext';
import { RouterProvider, useRouter } from './router/Router';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { PostCard } from './components/PostCard';
import { PostDetailModal } from './components/PostDetailModal';
import { CreatePostModal } from './components/CreatePostModal';
import { AuthModal } from './components/AuthModal';
import { ChatModal } from './components/ChatModal';
import { StoriesBar } from './components/StoriesBar';
import { Leaderboard } from './components/Leaderboard';
import { ReadingList } from './components/ReadingList';
import { ThemeToggle } from './components/ThemeToggle';
import { MobileNav } from './components/MobileNav';
import { UserProfileModal } from './components/UserProfileModal';
import { SettingsModal } from './components/SettingsModal';
import { FeedSelector, useFeedPosts } from './components/FeedSelector';
import { KeyboardShortcutsModal } from './components/KeyboardShortcuts';
import { MobileBottomNav } from './components/MobileBottomNav';
import { AIChatbot } from './components/AIChatbot';

// Pages
import { ProfilePage } from './pages/ProfilePage';
import { AccountSettingsPage } from './pages/AccountSettingsPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { AdminPanel } from './pages/AdminPanel';
import { ForumPage } from './pages/ForumPage';
import { ActivityFeedPage } from './pages/ActivityFeedPage';
import { UserAnalyticsPage } from './pages/UserAnalyticsPage';
import { AdvancedSearchPage } from './pages/AdvancedSearchPage';
import { GuildsPage } from './pages/GuildsPage';
import { TournamentsPage } from './pages/TournamentsPage';
import { BadgesPage } from './pages/BadgesPage';
import { ChallengesPage } from './pages/ChallengesPage';

import { Post } from './types';
import { formatDate } from './utils/data';

const AppContent: React.FC = () => {
  const { currentPath, navigate } = useRouter();
  const {
    posts, currentUser, isAuthenticated, logout,
    notifications, unreadCount, markAllNotificationsRead,
    searchQuery, setSearchQuery, searchPosts, isOnlineBackend
  } = useApp();

  // Full-page standalone auth routes
  if (currentPath === '/login') return <div className="app-container"><LoginPage /></div>;
  if (currentPath === '/register') return <div className="app-container"><RegisterPage /></div>;
  if (currentPath === '/forgot-password') return <div className="app-container"><ForgotPasswordPage /></div>;

  const [activeTab, setActiveTab] = useState('home');
  const [showAskModal, setShowAskModal] = useState(false);
  const [expandedPost, setExpandedPost] = useState<Post | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [showChat, setShowChat] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showReadingList, setShowReadingList] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [activeFeed, setActiveFeed] = useState<'following' | 'trending' | 'hot' | 'top' | 'rising'>('trending');
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Close dropdowns on route change
  useEffect(() => {
    setShowMoreMenu(false);
    setShowUserMenu(false);
    setShowNotifications(false);
  }, [currentPath]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.header-dropdown-container')) {
        setShowMoreMenu(false);
        setShowUserMenu(false);
        setShowNotifications(false);
      }
    };
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, []);
  
  const feedPosts = useFeedPosts(activeFeed, currentUser?.id);
  const displayPosts = searchQuery ? searchPosts(searchQuery) : feedPosts;

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'k':
            e.preventDefault();
            document.querySelector<HTMLInputElement>('.search-input')?.focus();
            break;
          case 'n':
            e.preventDefault();
            if (isAuthenticated) setShowAskModal(true);
            break;
          case 'b':
            e.preventDefault();
            setShowReadingList(true);
            break;
          case 'm':
            e.preventDefault();
            if (isAuthenticated) setShowChat(true);
            break;
          case ',':
            e.preventDefault();
            if (isAuthenticated) setShowSettings(true);
            break;
        }
      } else if (e.key === 'Escape') {
        setShowAskModal(false);
        setShowNotifications(false);
        setShowChat(false);
        setShowLeaderboard(false);
        setShowReadingList(false);
        setShowProfile(false);
        setShowSettings(false);
        setShowShortcuts(false);
      } else if (e.key === '?') {
        setShowShortcuts(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAuthenticated]);

  const renderCurrentView = () => {
    if (currentPath.startsWith('/profile')) return <ProfilePage />;
    if (currentPath === '/settings') return <AccountSettingsPage />;
    if (currentPath === '/admin') return <AdminPanel />;
    if (currentPath === '/forum') return <ForumPage />;
    if (currentPath === '/activities') return <ActivityFeedPage />;
    if (currentPath === '/analytics') return <UserAnalyticsPage />;
    if (currentPath === '/search') return <AdvancedSearchPage />;
    if (currentPath === '/guilds') return <GuildsPage />;
    if (currentPath === '/tournaments') return <TournamentsPage />;
    if (currentPath === '/badges') return <BadgesPage />;
    if (currentPath === '/challenges') return <ChallengesPage />;

    // Default: Home Feed
    return (
      <div style={{ maxWidth: 850, margin: '0 auto' }}>
        {/* Welcome Banner */}
        {isAuthenticated && currentUser && (
          <div className="glass-card" style={{ padding: 20, marginBottom: 20, position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.12), rgba(147, 51, 234, 0.12))' }} />
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h2 style={{ fontSize: 20, fontWeight: 'bold', color: 'var(--text-main)' }}>
                  Karibu tena, {currentUser.username.split(' ')[0]}! 👋
                </h2>
                <p style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 4 }}>
                  Una posts {currentUser.postsCount || 0}, majibu {currentUser.answersCount || 0}, na alama {currentUser.reputation || 0} za heshima.
                </p>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => navigate('/challenges')} className="btn-ghost" style={{ fontSize: 12, padding: '6px 12px', cursor: 'pointer' }}>
                  🎯 Changamoto
                </button>
                <button onClick={() => setShowLeaderboard(true)} className="btn-ghost" style={{ fontSize: 12, padding: '6px 12px', cursor: 'pointer' }}>
                  🏆 Wanaoongoza
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Stories */}
        {isAuthenticated && <StoriesBar />}

        {/* Create Post Prompt */}
        {isAuthenticated && (
          <div className="glass-card" style={{ padding: 16, marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div className="avatar-ring">
                <div style={{
                  width: 40, height: 40, borderRadius: '50%',
                  background: 'linear-gradient(135deg, #6366f1, #9333ea)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 14, fontWeight: 'bold', color: 'white'
                }}>
                  {currentUser?.avatar || 'NJ'}
                </div>
              </div>
              <button
                onClick={() => setShowAskModal(true)}
                style={{
                  flex: 1, textAlign: 'left', padding: 12, borderRadius: 12,
                  background: 'var(--bg-subtle)',
                  border: '1px solid var(--border-app)',
                  color: 'var(--text-muted)', cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--bg-subtle-hover)';
                  e.currentTarget.style.color = 'var(--text-main)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'var(--bg-subtle)';
                  e.currentTarget.style.color = 'var(--text-muted)';
                }}
              >
                Uliza swali au shiriki maarifa na jamii ya Nijuze...
              </button>
            </div>
          </div>
        )}

        {/* Feed Selector */}
        <FeedSelector activeFeed={activeFeed} onFeedChange={setActiveFeed} />

        {/* Posts Feed */}
        {displayPosts.map((post) => (
          <PostCard key={post.id} post={post} onExpand={setExpandedPost} />
        ))}

        {displayPosts.length === 0 && (
          <div className="glass-card" style={{ padding: 48, textAlign: 'center' }}>
            <AlertCircle size={48} color="#475569" style={{ margin: '0 auto 16px' }} />
            <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8, color: 'var(--text-main)' }}>
              {searchQuery ? 'Hakuna matokeo ya utafutaji' : 'Bado hakuna posts hapa'}
            </h3>
            <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 16 }}>
              {searchQuery ? 'Jaribu kutafuta kwa maneno tofauti' : 'Kuwa wa kwanza kuuliza swali au kuchangia maarifa!'}
            </p>
            {isAuthenticated && (
              <button onClick={() => setShowAskModal(true)} className="btn-primary" style={{ cursor: 'pointer' }}>
                Anzisha Mjadala Sasa
              </button>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="app-container" style={{ minHeight: '100vh' }}>
      {/* Header */}
      <header className="glass-card" style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50, borderRadius: 0, borderTop: 'none', borderLeft: 'none', borderRight: 'none' }}>
        <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 20px', height: 66, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          
          {/* 1. Left: Brand & Status */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
            <div 
              onClick={() => navigate('/')} 
              style={{
                width: 40, height: 40, borderRadius: 12,
                background: 'linear-gradient(135deg, #6366f1, #9333ea)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 4px 14px rgba(99, 102, 241, 0.35)',
                cursor: 'pointer',
                transition: 'transform 0.2s ease'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            >
              <Sparkles size={20} color="white" />
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <h1 
                onClick={() => navigate('/')} 
                className="gradient-text" 
                style={{ fontSize: 21, fontWeight: 800, cursor: 'pointer', margin: 0, letterSpacing: '-0.02em', lineHeight: 1 }}
              >
                Nijuze
              </h1>

              {/* Status Indicator */}
              <div 
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 5,
                  padding: '3px 8px',
                  borderRadius: 20,
                  fontSize: 11,
                  fontWeight: 600,
                  background: isOnlineBackend ? 'rgba(34, 197, 94, 0.12)' : 'rgba(234, 179, 8, 0.12)',
                  color: isOnlineBackend ? '#16a34a' : '#ca8a04',
                  border: `1px solid ${isOnlineBackend ? 'rgba(34, 197, 94, 0.25)' : 'rgba(234, 179, 8, 0.25)'}`
                }}
                title={isOnlineBackend ? 'API imeunganishwa moja kwa moja' : 'Inafanya kazi offline'}
              >
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: isOnlineBackend ? '#22c55e' : '#eab308' }} />
                <span className="hidden sm:inline">{isOnlineBackend ? 'Mtandaoni' : 'Offline'}</span>
              </div>
            </div>
          </div>

          {/* 2. Center: Search & Main Navigation */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, flex: 1, maxWidth: 580, margin: '0 12px' }}>
            {/* Search Input */}
            <div style={{ flex: 1, position: 'relative' }}>
              <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                placeholder="Tafuta maswali, majibu, watu..."
                className="search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ width: '100%', paddingLeft: 38, paddingRight: 14, height: 38, borderRadius: 10, fontSize: 13 }}
              />
            </div>

            {/* Desktop Navigation Group */}
            <nav className="hidden lg:flex header-dropdown-container" style={{ alignItems: 'center', gap: 4, flexShrink: 0 }}>
              <button 
                onClick={() => navigate('/forum')} 
                className={`btn-ghost ${currentPath === '/forum' ? 'active' : ''}`}
                style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, height: 38, padding: '0 12px', borderRadius: 10, cursor: 'pointer' }}
                title="Jukwaa la Majadiliano"
              >
                <MessageSquare size={16} />
                <span>Forum</span>
              </button>
              
              <button 
                onClick={() => navigate('/guilds')} 
                className={`btn-ghost ${currentPath === '/guilds' ? 'active' : ''}`}
                style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, height: 38, padding: '0 12px', borderRadius: 10, cursor: 'pointer' }}
                title="Vikundi na Jamii"
              >
                <Users size={16} />
                <span>Vikundi</span>
              </button>

              {/* Gundua (Explore) Dropdown */}
              <div style={{ position: 'relative' }}>
                <button 
                  onClick={(e) => { e.stopPropagation(); setShowMoreMenu(!showMoreMenu); setShowUserMenu(false); setShowNotifications(false); }}
                  className={`btn-ghost ${['/tournaments', '/badges', '/challenges', '/admin'].includes(currentPath) ? 'active' : ''}`}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, height: 38, padding: '0 12px', borderRadius: 10, cursor: 'pointer' }}
                  title="Gundua Zaidi"
                >
                  <Compass size={16} />
                  <span>Gundua</span>
                  <ChevronDown size={14} style={{ transform: showMoreMenu ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease' }} />
                </button>

                {showMoreMenu && (
                  <div 
                    className="glass-card shadow-xl" 
                    style={{
                      position: 'absolute',
                      top: 46,
                      left: 0,
                      width: 220,
                      padding: 8,
                      borderRadius: 12,
                      zIndex: 60,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 4
                    }}
                  >
                    <button 
                      onClick={() => { navigate('/tournaments'); setShowMoreMenu(false); }}
                      className={`btn-ghost ${currentPath === '/tournaments' ? 'active' : ''}`}
                      style={{ width: '100%', justifyContent: 'flex-start', padding: '8px 12px', borderRadius: 8, gap: 10, fontSize: 13 }}
                    >
                      <Trophy size={16} color="#eab308" />
                      <span>Mashindano</span>
                    </button>
                    
                    <button 
                      onClick={() => { navigate('/badges'); setShowMoreMenu(false); }}
                      className={`btn-ghost ${currentPath === '/badges' ? 'active' : ''}`}
                      style={{ width: '100%', justifyContent: 'flex-start', padding: '8px 12px', borderRadius: 8, gap: 10, fontSize: 13 }}
                    >
                      <Award size={16} color="#8b5cf6" />
                      <span>Nishani & Tuzo</span>
                    </button>

                    <button 
                      onClick={() => { navigate('/challenges'); setShowMoreMenu(false); }}
                      className={`btn-ghost ${currentPath === '/challenges' ? 'active' : ''}`}
                      style={{ width: '100%', justifyContent: 'flex-start', padding: '8px 12px', borderRadius: 8, gap: 10, fontSize: 13 }}
                    >
                      <Target size={16} color="#10b981" />
                      <span>Changamoto</span>
                    </button>

                    {currentUser?.role === 'Admin' && (
                      <>
                        <div style={{ height: 1, background: 'var(--border-app)', margin: '4px 0' }} />
                        <button 
                          onClick={() => { navigate('/admin'); setShowMoreMenu(false); }}
                          className={`btn-ghost ${currentPath === '/admin' ? 'active' : ''}`}
                          style={{ width: '100%', justifyContent: 'flex-start', padding: '8px 12px', borderRadius: 8, gap: 10, fontSize: 13, color: '#f43f5e' }}
                        >
                          <Shield size={16} color="#f43f5e" />
                          <span>Jopo la Msimamizi</span>
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            </nav>
          </div>

          {/* 3. Right: Primary Action, Notifications, Theme, User Menu */}
          <div className="header-dropdown-container" style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
            {/* Primary Action Button */}
            <button 
              onClick={() => setShowAskModal(true)} 
              className="btn-primary" 
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 6, 
                height: 38, 
                padding: '0 16px', 
                borderRadius: 10, 
                fontSize: 13, 
                fontWeight: 600, 
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(99, 102, 241, 0.35)'
              }}
            >
              <Plus size={16} />
              <span className="hidden sm:inline">Uliza Swali</span>
            </button>

            {/* Theme Toggle Button */}
            <ThemeToggle />

            {isAuthenticated ? (
              <>
                {/* Notifications Dropdown */}
                <div style={{ position: 'relative' }}>
                  <button 
                    onClick={(e) => { e.stopPropagation(); setShowNotifications(!showNotifications); setShowUserMenu(false); setShowMoreMenu(false); }} 
                    style={{ 
                      width: 38, 
                      height: 38, 
                      borderRadius: 10, 
                      background: 'var(--bg-subtle)', 
                      border: '1px solid var(--border-app)', 
                      cursor: 'pointer', 
                      position: 'relative', 
                      color: 'var(--text-muted)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.2s ease'
                    }}
                    title="Arifa"
                  >
                    <Bell size={18} />
                    {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
                  </button>

                  {showNotifications && (
                    <div 
                      className="glass-card shadow-2xl" 
                      style={{ 
                        position: 'absolute', 
                        right: 0, 
                        top: 48, 
                        width: 340, 
                        padding: 16, 
                        zIndex: 60, 
                        borderRadius: 16,
                        animation: 'fadeIn 0.15s ease'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                        <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>Arifa ({unreadCount})</h3>
                        <button onClick={markAllNotificationsRead} style={{ fontSize: 12, color: 'var(--btn-ghost-text)', background: 'transparent', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
                          Soma zote
                        </button>
                      </div>
                      {notifications.length === 0 ? (
                        <p style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center', padding: '16px 0', margin: 0 }}>Hakuna arifa mpya kwa sasa</p>
                      ) : (
                        notifications.slice(0, 5).map((notif) => (
                          <div key={notif.id} style={{ padding: '10px 0', borderBottom: '1px solid var(--border-app)', opacity: notif.isRead ? 0.6 : 1 }}>
                            <p style={{ fontSize: 13, color: 'var(--text-body)', margin: 0 }}>{notif.message}</p>
                            <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: '4px 0 0 0' }}>{formatDate(notif.createdAt)}</p>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>

                {/* User Profile Dropdown Menu */}
                <div style={{ position: 'relative' }}>
                  <button
                    onClick={(e) => { e.stopPropagation(); setShowUserMenu(!showUserMenu); setShowNotifications(false); setShowMoreMenu(false); }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '3px 8px 3px 3px',
                      borderRadius: 20,
                      background: 'var(--bg-subtle)',
                      border: '1px solid var(--border-app)',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    title={currentUser?.username || 'Wasifu'}
                  >
                    <div style={{
                      width: 32, height: 32, borderRadius: '50%',
                      background: 'linear-gradient(135deg, #6366f1, #9333ea)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 12, fontWeight: 'bold', color: 'white',
                      boxShadow: '0 2px 6px rgba(99, 102, 241, 0.4)'
                    }}>
                      {currentUser?.avatar || 'NJ'}
                    </div>
                    <ChevronDown size={14} color="var(--text-muted)" style={{ transform: showUserMenu ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease' }} />
                  </button>

                  {showUserMenu && (
                    <div 
                      className="glass-card shadow-2xl" 
                      style={{
                        position: 'absolute',
                        right: 0,
                        top: 48,
                        width: 260,
                        padding: 12,
                        borderRadius: 16,
                        zIndex: 60,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 3,
                        animation: 'fadeIn 0.15s ease'
                      }}
                    >
                      {/* User Header */}
                      <div style={{ padding: '6px 8px 10px 8px', borderBottom: '1px solid var(--border-app)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{
                            width: 38, height: 38, borderRadius: '50%',
                            background: 'linear-gradient(135deg, #6366f1, #9333ea)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 13, fontWeight: 'bold', color: 'white'
                          }}>
                            {currentUser?.avatar || 'NJ'}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-main)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {currentUser?.username || 'Mwanachama'}
                            </div>
                            <div style={{ fontSize: 11, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {currentUser?.email || ''}
                            </div>
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8, fontSize: 11, color: 'var(--btn-ghost-text)' }}>
                          <span style={{ padding: '2px 8px', borderRadius: 6, background: 'rgba(99, 102, 241, 0.12)', fontWeight: 600 }}>
                            {currentUser?.role || 'Mwanachama'}
                          </span>
                          <span>•</span>
                          <span>⭐ {(currentUser?.reputation || 0).toLocaleString()} alama</span>
                        </div>
                      </div>

                      {/* Dropdown Navigation Links */}
                      <button 
                        onClick={() => { navigate('/profile'); setShowUserMenu(false); }}
                        className="btn-ghost"
                        style={{ width: '100%', justifyContent: 'flex-start', padding: '8px 10px', borderRadius: 8, gap: 10, fontSize: 13 }}
                      >
                        <User size={16} />
                        <span>Wasifu Wangu</span>
                      </button>

                      <button 
                        onClick={() => { navigate('/settings'); setShowUserMenu(false); }}
                        className="btn-ghost"
                        style={{ width: '100%', justifyContent: 'flex-start', padding: '8px 10px', borderRadius: 8, gap: 10, fontSize: 13 }}
                      >
                        <Settings size={16} />
                        <span>Mipangilio ya Akaunti</span>
                      </button>

                      <button 
                        onClick={() => { navigate('/challenges'); setShowUserMenu(false); }}
                        className="btn-ghost"
                        style={{ width: '100%', justifyContent: 'flex-start', padding: '8px 10px', borderRadius: 8, gap: 10, fontSize: 13 }}
                      >
                        <Target size={16} />
                        <span>Changamoto Zangu</span>
                      </button>

                      <button 
                        onClick={() => { navigate('/badges'); setShowUserMenu(false); }}
                        className="btn-ghost"
                        style={{ width: '100%', justifyContent: 'flex-start', padding: '8px 10px', borderRadius: 8, gap: 10, fontSize: 13 }}
                      >
                        <Award size={16} />
                        <span>Nishani Zangu</span>
                      </button>

                      {currentUser?.role === 'Admin' && (
                        <button 
                          onClick={() => { navigate('/admin'); setShowUserMenu(false); }}
                          className="btn-ghost"
                          style={{ width: '100%', justifyContent: 'flex-start', padding: '8px 10px', borderRadius: 8, gap: 10, fontSize: 13, color: '#f43f5e' }}
                        >
                          <Shield size={16} color="#f43f5e" />
                          <span>Jopo la Msimamizi</span>
                        </button>
                      )}

                      <div style={{ height: 1, background: 'var(--border-app)', margin: '4px 0' }} />

                      <button 
                        onClick={() => { logout(); setShowUserMenu(false); }}
                        className="btn-ghost"
                        style={{ width: '100%', justifyContent: 'flex-start', padding: '8px 10px', borderRadius: 8, gap: 10, fontSize: 13, color: '#ef4444' }}
                      >
                        <LogOut size={16} color="#ef4444" />
                        <span>Ondoka</span>
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <button
                  onClick={() => navigate('/login')}
                  className="btn-ghost"
                  style={{ fontSize: 13, height: 38, padding: '0 14px', borderRadius: 10, cursor: 'pointer' }}
                >
                  Ingia
                </button>
                <button
                  onClick={() => navigate('/register')}
                  className="btn-primary"
                  style={{ fontSize: 13, height: 38, padding: '0 16px', borderRadius: 10, cursor: 'pointer' }}
                >
                  Jiunga
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main style={{ paddingTop: 80, paddingBottom: 64, paddingLeft: 16, paddingRight: 16 }}>
        {renderCurrentView()}
      </main>

      {/* Floating AI Assistant */}
      <AIChatbot />

      {/* Modals */}
      <CreatePostModal isOpen={showAskModal} onClose={() => setShowAskModal(false)} />
      <PostDetailModal post={expandedPost} onClose={() => setExpandedPost(null)} />
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        mode={authMode}
        onToggleMode={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
      />
      <ChatModal isOpen={showChat} onClose={() => setShowChat(false)} />
      <ReadingList isOpen={showReadingList} onClose={() => setShowReadingList(false)} />
      <UserProfileModal isOpen={showProfile} onClose={() => setShowProfile(false)} />
      <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} />
      <KeyboardShortcutsModal isOpen={showShortcuts} onClose={() => setShowShortcuts(false)} />

      {showLeaderboard && (
        <div className="modal-overlay" onClick={() => setShowLeaderboard(false)}>
          <div className="glass-card" style={{ width: '100%', maxWidth: 800, margin: '0 16px', maxHeight: '90vh', overflowY: 'auto' }} onClick={(e) => e.stopPropagation()}>
            <Leaderboard />
          </div>
        </div>
      )}

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />
    </div>
  );
};

const AppWrapper: React.FC = () => {
  return (
    <ThemeProvider>
      <RouterProvider>
        <AppProvider>
          <AppContent />
        </AppProvider>
      </RouterProvider>
    </ThemeProvider>
  );
};

const App: React.FC = () => {
  return <AppWrapper />;
};

export default App;

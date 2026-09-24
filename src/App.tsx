import React, { useState, useEffect } from 'react';
import {
  Search, Bell, MessageSquare, Home, Compass, Bookmark, Users, Settings,
  TrendingUp, Plus, Clock, Award, Zap, Star, Sparkles, BarChart3,
  AlertCircle, Heart, LogOut, Trophy, BookOpen, User, Keyboard,
  Activity, Shield
} from 'lucide-react';
import { AppProvider, useApp } from './contexts/AppContext';
import { RouterProvider, useRouter } from './router/Router';
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
import { ProfilePage } from './pages/ProfilePage';
import { AccountSettingsPage } from './pages/AccountSettingsPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { AdminPanel } from './pages/AdminPanel';
import { ForumPage } from './pages/ForumPage';
import { ActivityFeedPage } from './pages/ActivityFeedPage';
import { Post } from './types';
import { formatDate } from './utils/data';

const AppContent: React.FC = () => {
  const { currentPath, navigate } = useRouter();
  const {
    posts, currentUser, isAuthenticated, logout,
    notifications, unreadCount, markAllNotificationsRead,
    trendingTopics, categories,
    searchQuery, setSearchQuery, searchPosts
  } = useApp();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated && !['/login', '/register', '/forgot-password'].includes(currentPath)) {
      // Don't redirect, just show login prompt
    }
  }, [isAuthenticated, currentPath]);

  // Handle routing
  if (currentPath === '/login') {
    return <LoginPage />;
  }

  if (currentPath === '/register') {
    return <RegisterPage />;
  }

  if (currentPath === '/forgot-password') {
    return <ForgotPasswordPage />;
  }

  if (currentPath.startsWith('/profile')) {
    return <ProfilePage />;
  }

  if (currentPath === '/settings') {
    return <AccountSettingsPage />;
  }

  if (currentPath === '/admin') {
    return <AdminPanel />;
  }

  if (currentPath === '/forum') {
    return <ForumPage />;
  }

  if (currentPath === '/activities') {
    return <ActivityFeedPage />;
  }

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
  
  const feedPosts = useFeedPosts(activeFeed, currentUser?.id);

  const displayPosts = searchQuery ? searchPosts(searchQuery) : feedPosts;

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in input
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

  const menuItems = [
    { id: "home", icon: Home, label: "Nyumbani" },
    { id: "explore", icon: Compass, label: "Gundua" },
    { id: "trending", icon: TrendingUp, label: "Trending" },
    { id: "bookmarks", icon: Bookmark, label: "Bookmarks" },
    { id: "communities", icon: Users, label: "Jamii" },
    { id: "messages", icon: MessageSquare, label: "Ujumbe" },
    { id: "settings", icon: Settings, label: "Mipangilio" },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#0f0f23' }}>
      {/* Header */}
      <header className="glass-card" style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50, borderRadius: 0 }}>
        <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 16px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: 'linear-gradient(135deg, #6366f1, #9333ea)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Sparkles size={20} color="white" />
            </div>
            <h1 className="gradient-text" style={{ fontSize: 20, fontWeight: 'bold' }}>Nijuze</h1>
          </div>

          <div style={{ flex: 1, maxWidth: 500, margin: '0 16px', position: 'relative' }}>
            <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Tafuta maswali, majibu, watu..."
              className="search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {isAuthenticated ? (
              <>
                <button onClick={() => navigate('/forum')} className="btn-ghost" style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14 }}>
                  <MessageSquare size={16} />
                  <span style={{ display: 'none' }}>Forum</span>
                </button>
                <button onClick={() => navigate('/activities')} className="btn-ghost" style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14 }}>
                  <Activity size={16} />
                  <span style={{ display: 'none' }}>Shughuli</span>
                </button>
                {currentUser?.role === 'Admin' && (
                  <button onClick={() => navigate('/admin')} className="btn-ghost" style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14 }}>
                    <Shield size={16} />
                    <span style={{ display: 'none' }}>Admin</span>
                  </button>
                )}
                <button onClick={() => setShowAskModal(true)} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14 }}>
                  <Plus size={16} />
                  <span style={{ display: 'none' }}>Uliza Swali</span>
                </button>

                <div style={{ position: 'relative' }}>
                  <button onClick={() => setShowNotifications(!showNotifications)} style={{ padding: 10, borderRadius: 12, background: 'transparent', border: 'none', cursor: 'pointer', position: 'relative' }}>
                    <Bell size={20} color="#cbd5e1" />
                    {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
                  </button>

                  {showNotifications && (
                    <div className="glass-card" style={{ position: 'absolute', right: 0, top: 48, width: 320, padding: 16, zIndex: 50 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                        <h3 style={{ fontSize: 14, fontWeight: 600 }}>Arifa ({unreadCount})</h3>
                        <button onClick={markAllNotificationsRead} style={{ fontSize: 12, color: '#818cf8', background: 'transparent', border: 'none', cursor: 'pointer' }}>
                          Soma zote
                        </button>
                      </div>
                      {notifications.slice(0, 5).map((notif) => (
                        <div key={notif.id} style={{ padding: '8px 0', borderBottom: '1px solid rgba(51, 65, 85, 0.3)', opacity: notif.isRead ? 0.6 : 1 }}>
                          <p style={{ fontSize: 13, color: '#cbd5e1' }}>{notif.message}</p>
                          <p style={{ fontSize: 11, color: '#64748b' }}>{formatDate(notif.createdAt)}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <button onClick={() => setShowChat(true)} style={{ padding: 10, borderRadius: 12, background: 'transparent', border: 'none', cursor: 'pointer' }}>
                  <MessageSquare size={20} color="#cbd5e1" />
                </button>
                <ThemeToggle />

                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <button
                    onClick={() => navigate('/profile')}
                    className="avatar-ring"
                    style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 0 }}
                  >
                    <div style={{
                      width: 32, height: 32, borderRadius: '50%',
                      background: 'linear-gradient(135deg, #6366f1, #9333ea)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 12, fontWeight: 'bold'
                    }}>
                      {currentUser?.avatar}
                    </div>
                  </button>
                  <button
                    onClick={() => navigate('/settings')}
                    style={{ padding: 8, borderRadius: 8, background: 'transparent', border: 'none', cursor: 'pointer' }}
                    title="Mipangilio"
                  >
                    <Settings size={18} color="#94a3b8" />
                  </button>
                  <button
                    onClick={logout}
                    style={{ padding: 8, borderRadius: 8, background: 'transparent', border: 'none', cursor: 'pointer' }}
                    title="Ondoka"
                  >
                    <LogOut size={18} color="#94a3b8" />
                  </button>
                </div>
              </>
            ) : (
              <>
                <button
                  onClick={() => navigate('/login')}
                  className="btn-ghost"
                  style={{ fontSize: 14 }}
                >
                  Ingia
                </button>
                <button
                  onClick={() => navigate('/register')}
                  className="btn-primary"
                  style={{ fontSize: 14 }}
                >
                  Jiunga
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ paddingTop: 80, paddingBottom: 32, paddingLeft: 16, paddingRight: 16 }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          {/* Welcome Banner */}
          {isAuthenticated && currentUser && (
            <div className="glass-card" style={{ padding: 20, marginBottom: 24, position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(147, 51, 234, 0.15))' }} />
              <div style={{ position: 'relative' }}>
                <h2 style={{ fontSize: 20, fontWeight: 'bold' }}>Karibu tena, {currentUser.username.split(' ')[0]}! 👋</h2>
                <p style={{ fontSize: 14, color: '#94a3b8', marginTop: 8 }}>
                  Una posts {currentUser.postsCount} na majibu {currentUser.answersCount}. Endelea kuchangia!
                </p>
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
                    fontSize: 14, fontWeight: 'bold'
                  }}>
                    {currentUser?.avatar}
                  </div>
                </div>
                <button
                  onClick={() => setShowAskModal(true)}
                  style={{
                    flex: 1, textAlign: 'left', padding: 12, borderRadius: 12,
                    background: 'rgba(30, 41, 59, 0.3)',
                    border: '1px solid rgba(51, 65, 85, 0.3)',
                    color: '#94a3b8', cursor: 'pointer'
                  }}
                >
                  Uliza swali au shiriki maarifa...
                </button>
              </div>
            </div>
          )}

          {/* Feed Selector */}
          <FeedSelector activeFeed={activeFeed} onFeedChange={setActiveFeed} />

          {/* Posts */}
          {displayPosts.map((post) => (
            <PostCard key={post.id} post={post} onExpand={setExpandedPost} />
          ))}

          {displayPosts.length === 0 && (
            <div className="glass-card" style={{ padding: 48, textAlign: 'center' }}>
              <AlertCircle size={48} color="#475569" style={{ margin: '0 auto 16px' }} />
              <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>
                {searchQuery ? 'Hakuna matokeo' : 'Bado hakuna posts'}
              </h3>
              <p style={{ fontSize: 14, color: '#94a3b8' }}>
                {searchQuery ? 'Jaribu kutafuta kwa maneno tofauti' : 'Kuwa wa kwanza kuuliza swali!'}
              </p>
            </div>
          )}
        </div>
      </main>

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
    <RouterProvider>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </RouterProvider>
  );
};

const App: React.FC = () => {
  return <AppWrapper />;
};

export default App;

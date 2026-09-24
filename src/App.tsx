import React, { useState } from 'react';
import {
  Search, Bell, MessageSquare, Home, Compass, Bookmark, Users, Settings,
  TrendingUp, Plus, Clock, Award, Zap, Star, Filter, ChevronDown,
  Sparkles, BarChart3, AlertCircle, Heart, LogOut, Trophy, BookOpen
} from 'lucide-react';
import { AppProvider, useApp } from './contexts/AppContext';
import { PostCard } from './components/PostCard';
import { PostDetailModal } from './components/PostDetailModal';
import { CreatePostModal } from './components/CreatePostModal';
import { AuthModal } from './components/AuthModal';
import { ChatModal } from './components/ChatModal';
import { StoriesBar } from './components/StoriesBar';
import { Leaderboard } from './components/Leaderboard';
import { ReadingList } from './components/ReadingList';
import { Post } from './types';
import { formatDate } from './utils/data';

const AppContent: React.FC = () => {
  const {
    posts, currentUser, isAuthenticated, logout,
    notifications, unreadCount, markAllNotificationsRead,
    trendingTopics, categories, analytics,
    searchQuery, setSearchQuery, searchResults
  } = useApp();

  const [activeTab, setActiveTab] = useState('home');
  const [showAskModal, setShowAskModal] = useState(false);
  const [expandedPost, setExpandedPost] = useState<Post | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [showChat, setShowChat] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showReadingList, setShowReadingList] = useState(false);

  const menuItems = [
    { id: "home", icon: Home, label: "Nyumbani" },
    { id: "explore", icon: Compass, label: "Gundua" },
    { id: "trending", icon: TrendingUp, label: "Trending" },
    { id: "bookmarks", icon: Bookmark, label: "Bookmarks" },
    { id: "communities", icon: Users, label: "Jamii" },
    { id: "messages", icon: MessageSquare, label: "Ujumbe" },
    { id: "analytics", icon: BarChart3, label: "Analytics" },
    { id: "settings", icon: Settings, label: "Mipangilio" },
  ];

  const displayPosts = searchQuery ? searchResults : posts;

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
                <button onClick={() => setShowAskModal(true)} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14 }}>
                  <Plus size={16} />
                  <span className="hidden md:inline">Uliza Swali</span>
                </button>

                <div style={{ position: 'relative' }}>
                  <button onClick={() => setShowNotifications(!showNotifications)} style={{ padding: 10, borderRadius: 12, background: 'transparent', border: 'none', cursor: 'pointer', position: 'relative' }}>
                    <Bell size={20} color="#cbd5e1" />
                    {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
                  </button>

                  {showNotifications && (
                    <div className="glass-card" style={{ position: 'absolute', right: 0, top: 48, width: 320, padding: 16, zIndex: 50 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                        <h3 style={{ fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
                          <Bell size={16} color="#818cf8" />
                          Arifa ({unreadCount})
                        </h3>
                        <button
                          onClick={markAllNotificationsRead}
                          style={{ fontSize: 12, color: '#818cf8', background: 'transparent', border: 'none', cursor: 'pointer' }}
                        >
                          Soma zote
                        </button>
                      </div>
                      {notifications.slice(0, 5).map((notif) => (
                        <div key={notif.id} style={{
                          display: 'flex', alignItems: 'flex-start', gap: 12,
                          padding: '8px 0', borderBottom: '1px solid rgba(51, 65, 85, 0.3)',
                          opacity: notif.isRead ? 0.6 : 1
                        }}>
                          {notif.fromUser && (
                            <div style={{
                              width: 32, height: 32, borderRadius: '50%',
                              background: 'linear-gradient(135deg, #6366f1, #9333ea)',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: 12, fontWeight: 'bold', flexShrink: 0
                            }}>
                              {notif.fromUser.avatar}
                            </div>
                          )}
                          <div style={{ flex: 1 }}>
                            <p style={{ fontSize: 13, color: '#cbd5e1' }}>{notif.message}</p>
                            <p style={{ fontSize: 11, color: '#64748b' }}>{formatDate(notif.createdAt)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <button onClick={() => setShowChat(true)} style={{ padding: 10, borderRadius: 12, background: 'transparent', border: 'none', cursor: 'pointer' }}>
                  <MessageSquare size={20} color="#cbd5e1" />
                </button>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div className="avatar-ring">
                    <div style={{
                      width: 32, height: 32, borderRadius: '50%',
                      background: 'linear-gradient(135deg, #6366f1, #9333ea)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 12, fontWeight: 'bold'
                    }}>
                      {currentUser?.avatar}
                    </div>
                  </div>
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
                  onClick={() => { setAuthMode('login'); setShowAuthModal(true); }}
                  className="btn-ghost"
                  style={{ fontSize: 14 }}
                >
                  Ingia
                </button>
                <button
                  onClick={() => { setAuthMode('register'); setShowAuthModal(true); }}
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

      {/* Sidebar */}
      <aside style={{ position: 'fixed', left: 0, top: 64, bottom: 0, width: 256, padding: 16, overflowY: 'auto', display: 'none' }}>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`sidebar-link ${activeTab === item.id ? 'active' : ''}`}
              style={{ width: '100%', border: 'none', background: 'transparent', cursor: 'pointer', textAlign: 'left' }}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div style={{ marginTop: 32 }}>
          <h3 style={{ fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', padding: '0 16px', marginBottom: 12 }}>Kategoria</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {categories.map((cat) => (
              <button key={cat.id} className="sidebar-link" style={{ width: '100%', border: 'none', background: 'transparent', cursor: 'pointer', textAlign: 'left', fontSize: 14 }}>
                <span>{cat.icon}</span>
                <span>{cat.name}</span>
                <span style={{ marginLeft: 'auto', fontSize: 12, color: '#64748b' }}>{(cat.postsCount / 1000).toFixed(1)}K</span>
              </button>
            ))}
          </div>
        </div>

        {isAuthenticated && currentUser && (
          <div className="glass-card" style={{ padding: 16, marginTop: 32 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <div className="avatar-ring">
                <div style={{
                  width: 40, height: 40, borderRadius: '50%',
                  background: 'linear-gradient(135deg, #6366f1, #9333ea)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 14, fontWeight: 'bold'
                }}>
                  {currentUser.avatar}
                </div>
              </div>
              <div>
                <p style={{ fontSize: 14, fontWeight: 600 }}>{currentUser.username}</p>
                <p style={{ fontSize: 12, color: '#94a3b8' }}>Level {Math.floor(currentUser.reputation / 1000) + 1} • {currentUser.reputation} pts</p>
              </div>
            </div>
            <div className="progress-bar">
              <div className="progress-bar-fill" style={{ width: `${(currentUser.reputation % 1000) / 10}%` }} />
            </div>
            <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 8 }}>
              {1000 - (currentUser.reputation % 1000)} pts hadi Level {Math.floor(currentUser.reputation / 1000) + 2}
            </p>
          </div>
        )}
      </aside>

      {/* Right Sidebar */}
      <aside style={{ position: 'fixed', right: 0, top: 64, bottom: 0, width: 320, padding: 16, overflowY: 'auto', display: 'none' }}>
        <div className="glass-card" style={{ padding: 20, marginBottom: 16 }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <TrendingUp size={16} color="#818cf8" />
            Mada Zinazovuma
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {trendingTopics.map((topic) => (
              <div key={topic.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 500, color: '#e2e8f0' }}>{topic.name}</p>
                  <p style={{ fontSize: 12, color: '#64748b' }}>{topic.postsCount.toLocaleString()} posts</p>
                </div>
                <span style={{ fontSize: 12, color: '#34d399', fontWeight: 500 }}>+{topic.growth}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div className="glass-card" style={{ padding: 16, marginBottom: 16 }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Viungo vya Haraka</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <button
              onClick={() => setShowLeaderboard(true)}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '10px 12px', borderRadius: 10,
                background: 'rgba(99, 102, 241, 0.1)',
                border: '1px solid rgba(99, 102, 241, 0.2)',
                color: '#a5b4fc', cursor: 'pointer',
                fontSize: 13, fontWeight: 500
              }}
            >
              <Trophy size={16} />
              <span>Orodha ya Bora</span>
            </button>
            <button
              onClick={() => setShowReadingList(true)}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '10px 12px', borderRadius: 10,
                background: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid rgba(16, 185, 129, 0.2)',
                color: '#6ee7b7', cursor: 'pointer',
                fontSize: 13, fontWeight: 500
              }}
            >
              <BookOpen size={16} />
              <span>Orodha ya Kusoma</span>
            </button>
          </div>
        </div>

        <div className="glass-card" style={{ padding: 20 }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <BarChart3 size={16} color="#34d399" />
            Takwimu za Nijuze
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div style={{ textAlign: 'center', padding: 12, borderRadius: 12, background: 'rgba(99, 102, 241, 0.05)', border: '1px solid rgba(99, 102, 241, 0.1)' }}>
              <p style={{ fontSize: 18, fontWeight: 'bold', color: '#a5b4fc' }}>{analytics.totalPosts}</p>
              <p style={{ fontSize: 12, color: '#94a3b8' }}>Posts</p>
            </div>
            <div style={{ textAlign: 'center', padding: 12, borderRadius: 12, background: 'rgba(147, 51, 234, 0.05)', border: '1px solid rgba(147, 51, 234, 0.1)' }}>
              <p style={{ fontSize: 18, fontWeight: 'bold', color: '#c4b5fd' }}>{analytics.totalComments}</p>
              <p style={{ fontSize: 12, color: '#94a3b8' }}>Comments</p>
            </div>
            <div style={{ textAlign: 'center', padding: 12, borderRadius: 12, background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.1)' }}>
              <p style={{ fontSize: 18, fontWeight: 'bold', color: '#6ee7b7' }}>{analytics.totalUsers}</p>
              <p style={{ fontSize: 12, color: '#94a3b8' }}>Users</p>
            </div>
            <div style={{ textAlign: 'center', padding: 12, borderRadius: 12, background: 'rgba(245, 158, 11, 0.05)', border: '1px solid rgba(245, 158, 11, 0.1)' }}>
              <p style={{ fontSize: 18, fontWeight: 'bold', color: '#fcd34d' }}>{analytics.totalViews.toLocaleString()}</p>
              <p style={{ fontSize: 12, color: '#94a3b8' }}>Views</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ paddingTop: 80, paddingBottom: 32, paddingLeft: 16, paddingRight: 16 }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          {/* Welcome Banner */}
          {isAuthenticated && currentUser && (
            <div className="glass-card" style={{ padding: 20, marginBottom: 24, position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(147, 51, 234, 0.15), rgba(236, 72, 153, 0.1))' }} />
              <div style={{ position: 'relative' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <h2 style={{ fontSize: 20, fontWeight: 'bold' }}>Karibu tena, {currentUser.username.split(' ')[0]}! 👋</h2>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 12px', borderRadius: 20, background: 'rgba(99, 102, 241, 0.2)', border: '1px solid rgba(99, 102, 241, 0.3)' }}>
                    <Zap size={14} color="#a5b4fc" />
                    <span style={{ fontSize: 12, color: '#a5b4fc', fontWeight: 500 }}>Streak: 7 siku 🔥</span>
                  </div>
                </div>
                <p style={{ fontSize: 14, color: '#94a3b8', marginBottom: 16 }}>
                  Una posts {currentUser.postsCount} na majibu {currentUser.answersCount}. Endelea kuchangia!
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
                  {[
                    { icon: Star, label: 'Reputation', value: currentUser.reputation.toLocaleString(), color: '#fcd34d' },
                    { icon: Award, label: 'Badges', value: currentUser.badges.length, color: '#6ee7b7' },
                    { icon: TrendingUp, label: 'Posts', value: currentUser.postsCount, color: '#a5b4fc' },
                    { icon: MessageSquare, label: 'Answers', value: currentUser.answersCount, color: '#f472b6' },
                  ].map((stat, i) => (
                    <div key={i} style={{ padding: 12, borderRadius: 12, background: 'rgba(30, 41, 59, 0.3)', border: '1px solid rgba(51, 65, 85, 0.3)', textAlign: 'center' }}>
                      <stat.icon size={20} color={stat.color} style={{ margin: '0 auto 4px' }} />
                      <p style={{ fontSize: 16, fontWeight: 'bold', color: stat.color }}>{stat.value}</p>
                      <p style={{ fontSize: 11, color: '#64748b' }}>{stat.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Stories */}
          <StoriesBar />

          {/* Quick Actions */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 16, overflowX: 'auto', paddingBottom: 4 }}>
            {[
              { emoji: '🔥', label: 'Moto' },
              { emoji: '💡', label: 'Mawazo' },
              { emoji: '🎯', label: 'Malengo' },
              { emoji: '📚', label: 'Elimu' },
              { emoji: '💼', label: 'Kazi' },
              { emoji: '🌍', label: 'Dunia' },
              { emoji: '🎨', label: 'Sanaa' },
            ].map((topic, i) => (
              <button key={i} style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '8px 16px', borderRadius: 20,
                background: 'rgba(30, 41, 59, 0.5)',
                border: '1px solid rgba(51, 65, 85, 0.3)',
                color: '#cbd5e1', cursor: 'pointer',
                whiteSpace: 'nowrap', fontSize: 13, fontWeight: 500
              }}>
                <span>{topic.emoji}</span>
                <span>{topic.label}</span>
              </button>
            ))}
          </div>

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
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12 }}>
                <button onClick={() => setShowAskModal(true)} className="tool-btn" style={{ flex: 1, justifyContent: 'center' }}><Plus size={16} />Swali</button>
                <button className="tool-btn" style={{ flex: 1, justifyContent: 'center' }}><Star size={16} />Picha</button>
                <button className="tool-btn" style={{ flex: 1, justifyContent: 'center' }}><TrendingUp size={16} />Link</button>
              </div>
            </div>
          )}

          {/* Filters */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, overflowX: 'auto', paddingBottom: 8 }}>
            {[
              { id: 'latest', label: 'Mpya', icon: Clock },
              { id: 'trending', label: 'Trending', icon: TrendingUp },
              { id: 'top', label: 'Bora', icon: Star },
              { id: 'unanswered', label: 'Haijajibiwa', icon: AlertCircle },
            ].map((filter) => (
              <button key={filter.id} style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '8px 16px', borderRadius: 12, fontSize: 14,
                fontWeight: 500, whiteSpace: 'nowrap',
                background: 'rgba(99, 102, 241, 0.2)',
                color: '#a5b4fc',
                border: '1px solid rgba(99, 102, 241, 0.3)',
                cursor: 'pointer'
              }}>
                <filter.icon size={16} />{filter.label}
              </button>
            ))}
          </div>

          {/* Posts */}
          {displayPosts.map((post) => (
            <PostCard key={post.id} post={post} onExpand={setExpandedPost} />
          ))}

          {displayPosts.length === 0 && (
            <div className="glass-card" style={{ padding: 48, textAlign: 'center' }}>
              <Search size={48} color="#475569" style={{ margin: '0 auto 16px' }} />
              <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>Hakuna matokeo</h3>
              <p style={{ fontSize: 14, color: '#94a3b8' }}>
                {searchQuery ? 'Jaribu kutafuta kwa maneno tofauti' : 'Bado hakuna posts. Kuwa wa kwanza kuuliza!'}
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
      
      {/* Leaderboard Modal */}
      {showLeaderboard && (
        <div className="modal-overlay" onClick={() => setShowLeaderboard(false)}>
          <div
            className="glass-card"
            style={{
              width: '100%',
              maxWidth: 800,
              margin: '0 16px',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <Leaderboard />
          </div>
        </div>
      )}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

export default App;

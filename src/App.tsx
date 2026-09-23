import React, { useState } from 'react';
import {
  Search, Bell, MessageSquare, Home, Compass, Bookmark, Users, Settings,
  TrendingUp, Plus, ThumbsUp, ThumbsDown, Share2, MoreHorizontal,
  Eye, Clock, Award, Zap, MessageCircle, Flag,
  Star, Filter, ChevronDown, X, Send, Image, Link2,
  Code, List, Quote, Bold, Italic, Globe, Lock, Sparkles,
  BarChart3, AlertCircle, CheckCircle2, Copy, Download, Pin,
  Heart, ExternalLink, BookOpen
} from 'lucide-react';

interface Post {
  id: number;
  author: string;
  avatar: string;
  role: string;
  time: string;
  question: string;
  answer?: string;
  tags: string[];
  upvotes: number;
  downvotes: number;
  comments: number;
  views: number;
  shares: number;
  bookmarks: number;
  reactions: { [key: string]: number };
  isUpvoted: boolean;
  isDownvoted: boolean;
  isBookmarked: boolean;
  isPinned?: boolean;
  answerCount: number;
}

const samplePosts: Post[] = [
  {
    id: 1,
    author: "Amina Hassan",
    avatar: "AH",
    role: "Mtaalam wa AI",
    time: "Saa 2 zilizopita",
    question: "Je, ni njia bora zipi za kujifunza Machine Learning mwaka 2026?",
    answer: "Kwa mwaka 2026, njia bora za kujifunza ML ni: 1) Tumia platforms kama Kaggle na Coursera, 2) Anza na Python basics, 3) Jifunze mathematics ya linear algebra na statistics, 4) Fanya projects halisi, 5) Jiunge na communities za ML...",
    tags: ["Machine Learning", "AI", "Teknolojia", "Kujifunza"],
    upvotes: 342,
    downvotes: 12,
    comments: 47,
    views: 2840,
    shares: 89,
    bookmarks: 156,
    reactions: { "🔥": 45, "💡": 78, "❤️": 34, "👏": 23 },
    isUpvoted: false,
    isDownvoted: false,
    isBookmarked: false,
    isPinned: true,
    answerCount: 12,
  },
  {
    id: 2,
    author: "Juma Bakari",
    avatar: "JB",
    role: "Software Engineer",
    time: "Saa 5 zilizopita",
    question: "Tofauti kati ya React na Vue.js ni zipi? Nipi ni bora kwa project kubwa?",
    answer: "React na Vue zote ni frameworks nzuri, lakini zina tofauti muhimu. React ina ecosystem kubwa zaidi na flexiblity, wakati Vue ni rahisi kujifunza na ina documentation bora...",
    tags: ["React", "Vue.js", "Web Development", "Frontend"],
    upvotes: 218,
    downvotes: 8,
    comments: 34,
    views: 1920,
    shares: 56,
    bookmarks: 98,
    reactions: { "🔥": 32, "💡": 56, "❤️": 21, "👏": 18 },
    isUpvoted: true,
    isDownvoted: false,
    isBookmarked: true,
    answerCount: 8,
  },
  {
    id: 3,
    author: "Fatma Omar",
    avatar: "FO",
    role: "Data Scientist",
    time: "Saa 8 zilizopita",
    question: "Je, blockchain inaweza kutumikaje katika sekta ya afya Tanzania?",
    answer: "Blockchain inaweza kuleta mapinduzi katika sekta ya afya kwa: 1) Kuhifadhi records za wagonjwa kwa usalama, 2) Kufuatilia dawa na vifaa vya matibabu, 3) Kuwezesha malipo ya bima kwa uwazi...",
    tags: ["Blockchain", "Afya", "Innovation", "Tanzania"],
    upvotes: 187,
    downvotes: 5,
    comments: 28,
    views: 1540,
    shares: 43,
    bookmarks: 72,
    reactions: { "🔥": 28, "💡": 42, "❤️": 19, "👏": 15 },
    isUpvoted: false,
    isDownvoted: false,
    isBookmarked: false,
    answerCount: 6,
  },
  {
    id: 4,
    author: "David Mwangi",
    avatar: "DM",
    role: "UX Designer",
    time: "Siku 1 iliyopita",
    question: "Design principles zipi ni muhimu zaidi kwa kuunda mobile apps za Afrika Mashariki?",
    answer: "Kwa kuunda apps za East Africa, zingatia: 1) UI rahisi na intuitive, 2) Support ya lugha nyingi, 3) Offline functionality, 4) Low data usage, 5) Accessibility kwa watumiaji wote...",
    tags: ["UX Design", "Mobile Apps", "Africa", "Design"],
    upvotes: 156,
    downvotes: 3,
    comments: 22,
    views: 1230,
    shares: 34,
    bookmarks: 67,
    reactions: { "🔥": 22, "💡": 38, "❤️": 15, "👏": 12 },
    isUpvoted: false,
    isDownvoted: false,
    isBookmarked: false,
    answerCount: 5,
  }
];

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [showAskModal, setShowAskModal] = useState(false);
  const [expandedPost, setExpandedPost] = useState<Post | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [posts, setPosts] = useState<Post[]>(samplePosts);
  const [showNotifications, setShowNotifications] = useState(false);
  const [question, setQuestion] = useState('');

  const filteredPosts = posts.filter(post =>
    post.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleAskQuestion = () => {
    if (question) {
      const newPost: Post = {
        id: Date.now(),
        author: "Neema K.",
        avatar: "NK",
        role: "Mwanachama",
        time: "Sasa hivi",
        question,
        tags: ["Mpya"],
        upvotes: 0,
        downvotes: 0,
        comments: 0,
        views: 1,
        shares: 0,
        bookmarks: 0,
        reactions: {},
        isUpvoted: false,
        isDownvoted: false,
        isBookmarked: false,
        answerCount: 0,
      };
      setPosts([newPost, ...posts]);
      setQuestion('');
      setShowAskModal(false);
    }
  };

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

  const categories = [
    { name: "Teknolojia", icon: "💻", count: 45200 },
    { name: "Biashara", icon: "📊", count: 32100 },
    { name: "Sayansi", icon: "🔬", count: 28400 },
    { name: "Sanaa", icon: "🎨", count: 19800 },
    { name: "Michezo", icon: "⚽", count: 15600 },
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
            <button onClick={() => setShowAskModal(true)} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14 }}>
              <Plus size={16} />
              <span style={{ display: 'none' }}>Uliza Swali</span>
            </button>

            <div style={{ position: 'relative' }}>
              <button onClick={() => setShowNotifications(!showNotifications)} style={{ padding: 10, borderRadius: 12, background: 'transparent', border: 'none', cursor: 'pointer' }}>
                <Bell size={20} color="#cbd5e1" />
                <span className="notification-badge">5</span>
              </button>

              {showNotifications && (
                <div className="glass-card" style={{ position: 'absolute', right: 0, top: 48, width: 320, padding: 16, zIndex: 50 }}>
                  <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Bell size={16} color="#818cf8" />
                    Arifa Mpya
                  </h3>
                  {[
                    { text: "Amina amejibu swali lako", time: "Dakika 5" },
                    { text: "Swali lako limepata upvotes 50+", time: "Saa 1" },
                    { text: "Juma amekufuata", time: "Saa 2" },
                  ].map((notif, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '8px 0', borderBottom: i < 2 ? '1px solid rgba(51, 65, 85, 0.5)' : 'none' }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#6366f1', marginTop: 6, flexShrink: 0 }} />
                      <div>
                        <p style={{ fontSize: 14, color: '#cbd5e1' }}>{notif.text}</p>
                        <p style={{ fontSize: 12, color: '#64748b' }}>{notif.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button style={{ padding: 10, borderRadius: 12, background: 'transparent', border: 'none', cursor: 'pointer' }}>
              <MessageSquare size={20} color="#cbd5e1" />
            </button>

            <div className="avatar-ring" style={{ marginLeft: 8 }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #9333ea)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 'bold' }}>NK</div>
            </div>
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
              <button key={cat.name} className="sidebar-link" style={{ width: '100%', border: 'none', background: 'transparent', cursor: 'pointer', textAlign: 'left', fontSize: 14 }}>
                <span>{cat.icon}</span>
                <span>{cat.name}</span>
                <span style={{ marginLeft: 'auto', fontSize: 12, color: '#64748b' }}>{(cat.count / 1000).toFixed(1)}K</span>
              </button>
            ))}
          </div>
        </div>
      </aside>

      {/* Right Sidebar */}
      <aside style={{ position: 'fixed', right: 0, top: 64, bottom: 0, width: 320, padding: 16, overflowY: 'auto', display: 'none' }}>
        {/* Trending Topics */}
        <div className="glass-card" style={{ padding: 20, marginBottom: 16 }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <TrendingUp size={16} color="#818cf8" />
            Mada Zinazovuma
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { name: "AI & Machine Learning", posts: "12.4K", trend: "+24%" },
              { name: "Web3 & Blockchain", posts: "8.7K", trend: "+18%" },
              { name: "Startup Ecosystem", posts: "6.2K", trend: "+31%" },
              { name: "Cybersecurity", posts: "5.8K", trend: "+15%" },
            ].map((topic, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 500, color: '#e2e8f0' }}>{topic.name}</p>
                  <p style={{ fontSize: 12, color: '#64748b' }}>{topic.posts} posts</p>
                </div>
                <span style={{ fontSize: 12, color: '#34d399', fontWeight: 500 }}>{topic.trend}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Contributors */}
        <div className="glass-card" style={{ padding: 20, marginBottom: 16 }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <Award size={16} color="#fcd34d" />
            Wachangiaji Bora
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { name: "Amina H.", role: "AI Expert", points: "12.4K", rank: 1 },
              { name: "Juma B.", role: "Developer", points: "9.8K", rank: 2 },
              { name: "Fatma O.", role: "Data Scientist", points: "8.2K", rank: 3 },
            ].map((user) => (
              <div key={user.rank} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 12, fontWeight: 'bold', color: '#fcd34d', width: 16 }}>#{user.rank}</span>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #9333ea)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 'bold' }}>
                  {user.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 14, fontWeight: 500 }}>{user.name}</p>
                  <p style={{ fontSize: 12, color: '#64748b' }}>{user.role}</p>
                </div>
                <span style={{ fontSize: 12, color: '#a5b4fc' }}>{user.points}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="glass-card" style={{ padding: 20 }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <BarChart3 size={16} color="#34d399" />
            Takwimu za Nijuze
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div style={{ textAlign: 'center', padding: 12, borderRadius: 12, background: 'rgba(99, 102, 241, 0.05)', border: '1px solid rgba(99, 102, 241, 0.1)' }}>
              <p style={{ fontSize: 18, fontWeight: 'bold', color: '#a5b4fc' }}>2.4M</p>
              <p style={{ fontSize: 12, color: '#94a3b8' }}>Maswali</p>
            </div>
            <div style={{ textAlign: 'center', padding: 12, borderRadius: 12, background: 'rgba(147, 51, 234, 0.05)', border: '1px solid rgba(147, 51, 234, 0.1)' }}>
              <p style={{ fontSize: 18, fontWeight: 'bold', color: '#c4b5fd' }}>8.1M</p>
              <p style={{ fontSize: 12, color: '#94a3b8' }}>Majibu</p>
            </div>
            <div style={{ textAlign: 'center', padding: 12, borderRadius: 12, background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.1)' }}>
              <p style={{ fontSize: 18, fontWeight: 'bold', color: '#6ee7b7' }}>450K</p>
              <p style={{ fontSize: 12, color: '#94a3b8' }}>Watumiaji</p>
            </div>
            <div style={{ textAlign: 'center', padding: 12, borderRadius: 12, background: 'rgba(245, 158, 11, 0.05)', border: '1px solid rgba(245, 158, 11, 0.1)' }}>
              <p style={{ fontSize: 18, fontWeight: 'bold', color: '#fcd34d' }}>98%</p>
              <p style={{ fontSize: 12, color: '#94a3b8' }}>Satisfaction</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ paddingTop: 80, paddingBottom: 32, paddingLeft: 16, paddingRight: 16 }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          {/* Welcome Banner */}
          <div className="glass-card" style={{ padding: 20, marginBottom: 24, position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(147, 51, 234, 0.15), rgba(236, 72, 153, 0.1))' }} />
            <div style={{ position: 'relative' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <h2 style={{ fontSize: 20, fontWeight: 'bold' }}>Karibu tena, Neema! 👋</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 12px', borderRadius: 20, background: 'rgba(99, 102, 241, 0.2)', border: '1px solid rgba(99, 102, 241, 0.3)' }}>
                  <Zap size={14} color="#a5b4fc" />
                  <span style={{ fontSize: 12, color: '#a5b4fc', fontWeight: 500 }}>Streak: 7 siku 🔥</span>
                </div>
              </div>
              <p style={{ fontSize: 14, color: '#94a3b8', marginBottom: 16 }}>Umeacha maswali 3 bila kujibiwa. Jiunge na mazungumzo 12 mapya leo.</p>
              
              {/* Quick Stats */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
                {[
                  { icon: Star, label: 'Rank', value: '#142', color: '#fcd34d' },
                  { icon: Award, label: 'Badges', value: '12', color: '#6ee7b7' },
                  { icon: TrendingUp, label: 'Posts', value: '234', color: '#a5b4fc' },
                  { icon: Heart, label: 'Likes', value: '1.2K', color: '#f472b6' },
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

          {/* Quick Actions Bar */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 16, overflowX: 'auto', paddingBottom: 4 }}>
            {[
              { emoji: '🔥', label: 'Moto', color: '#ef4444' },
              { emoji: '💡', label: 'Mawazo', color: '#f59e0b' },
              { emoji: '🎯', label: 'Malengo', color: '#10b981' },
              { emoji: '📚', label: 'Elimu', color: '#6366f1' },
              { emoji: '💼', label: 'Kazi', color: '#8b5cf6' },
              { emoji: '🌍', label: 'Dunia', color: '#06b6d4' },
              { emoji: '🎨', label: 'Sanaa', color: '#ec4899' },
            ].map((topic, i) => (
              <button key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 20, background: 'rgba(30, 41, 59, 0.5)', border: '1px solid rgba(51, 65, 85, 0.3)', color: '#cbd5e1', cursor: 'pointer', whiteSpace: 'nowrap', fontSize: 13, fontWeight: 500 }}>
                <span>{topic.emoji}</span>
                <span>{topic.label}</span>
              </button>
            ))}
          </div>

          {/* Create Post */}
          <div className="glass-card" style={{ padding: 16, marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div className="avatar-ring">
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #9333ea)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 'bold' }}>NK</div>
              </div>
              <button onClick={() => setShowAskModal(true)} style={{ flex: 1, textAlign: 'left', padding: 12, borderRadius: 12, background: 'rgba(30, 41, 59, 0.3)', border: '1px solid rgba(51, 65, 85, 0.3)', color: '#94a3b8', cursor: 'pointer' }}>
                Uliza swali au shiriki maarifa...
              </button>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12 }}>
              <button onClick={() => setShowAskModal(true)} className="tool-btn" style={{ flex: 1, justifyContent: 'center' }}><Plus size={16} />Swali</button>
              <button className="tool-btn" style={{ flex: 1, justifyContent: 'center' }}><Image size={16} />Picha</button>
              <button className="tool-btn" style={{ flex: 1, justifyContent: 'center' }}><Link2 size={16} />Link</button>
              <button className="tool-btn" style={{ flex: 1, justifyContent: 'center' }}><Code size={16} />Code</button>
            </div>
          </div>

          {/* Filters */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, overflowX: 'auto', paddingBottom: 8 }}>
            {[
              { id: 'latest', label: 'Mpya', icon: Clock },
              { id: 'trending', label: 'Trending', icon: TrendingUp },
              { id: 'top', label: 'Bora', icon: Star },
              { id: 'unanswered', label: 'Haijajibiwa', icon: AlertCircle },
            ].map((filter) => (
              <button key={filter.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', borderRadius: 12, fontSize: 14, fontWeight: 500, whiteSpace: 'nowrap', background: 'rgba(99, 102, 241, 0.2)', color: '#a5b4fc', border: '1px solid rgba(99, 102, 241, 0.3)', cursor: 'pointer' }}>
                <filter.icon size={16} />{filter.label}
              </button>
            ))}
          </div>

          {/* Posts */}
          {filteredPosts.map((post) => (
            <PostCard key={post.id} post={post} onExpand={setExpandedPost} />
          ))}

          {filteredPosts.length === 0 && (
            <div className="glass-card" style={{ padding: 48, textAlign: 'center' }}>
              <Search size={48} color="#475569" style={{ margin: '0 auto 16px' }} />
              <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>Hakuna matokeo</h3>
              <p style={{ fontSize: 14, color: '#94a3b8' }}>Jaribu kutafuta kwa maneno tofauti</p>
            </div>
          )}
        </div>
      </main>

      {/* Ask Question Modal */}
      {showAskModal && (
        <div className="modal-overlay" onClick={() => setShowAskModal(false)}>
          <div className="glass-card" style={{ width: '100%', maxWidth: 640, margin: '0 16px', padding: 24, maxHeight: '90vh', overflowY: 'auto' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
              <h2 className="gradient-text" style={{ fontSize: 20, fontWeight: 'bold' }}>Uliza Swali</h2>
              <button onClick={() => setShowAskModal(false)} style={{ padding: 8, borderRadius: 8, background: 'transparent', border: 'none', cursor: 'pointer' }}><X size={20} color="#cbd5e1" /></button>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 14, fontWeight: 500, color: '#cbd5e1', marginBottom: 8, display: 'block' }}>Swali lako</label>
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Andika swali lako kwa ufasaha..."
                style={{ width: '100%', padding: 12, borderRadius: 12, background: 'rgba(30, 41, 59, 0.5)', border: '1px solid rgba(51, 65, 85, 0.5)', color: '#e2e8f0', fontSize: 14 }}
              />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 14, fontWeight: 500, color: '#cbd5e1', marginBottom: 8, display: 'block' }}>Maelezo (Hiari)</label>
              <div style={{ borderRadius: 12, border: '1px solid rgba(51, 65, 85, 0.5)', overflow: 'hidden' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: 8, borderBottom: '1px solid rgba(51, 65, 85, 0.5)', background: 'rgba(30, 41, 59, 0.3)' }}>
                  <button style={{ padding: 6, borderRadius: 4, background: 'transparent', border: 'none', cursor: 'pointer' }}><Bold size={16} color="#94a3b8" /></button>
                  <button style={{ padding: 6, borderRadius: 4, background: 'transparent', border: 'none', cursor: 'pointer' }}><Italic size={16} color="#94a3b8" /></button>
                  <button style={{ padding: 6, borderRadius: 4, background: 'transparent', border: 'none', cursor: 'pointer' }}><Code size={16} color="#94a3b8" /></button>
                  <button style={{ padding: 6, borderRadius: 4, background: 'transparent', border: 'none', cursor: 'pointer' }}><Link2 size={16} color="#94a3b8" /></button>
                  <button style={{ padding: 6, borderRadius: 4, background: 'transparent', border: 'none', cursor: 'pointer' }}><List size={16} color="#94a3b8" /></button>
                  <button style={{ padding: 6, borderRadius: 4, background: 'transparent', border: 'none', cursor: 'pointer' }}><Quote size={16} color="#94a3b8" /></button>
                  <button style={{ padding: 6, borderRadius: 4, background: 'transparent', border: 'none', cursor: 'pointer' }}><Image size={16} color="#94a3b8" /></button>
                </div>
                <textarea placeholder="Eleza swali lako kwa undani..." style={{ width: '100%', padding: 12, background: 'transparent', border: 'none', color: '#e2e8f0', fontSize: 14, resize: 'none', height: 128 }} />
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <input type="checkbox" style={{ width: 16, height: 16, borderRadius: 4, border: '1px solid #475569', background: '#1e293b' }} />
                <span style={{ fontSize: 14, color: '#cbd5e1', display: 'flex', alignItems: 'center', gap: 4 }}><Lock size={14} /> Jibu kwa siri</span>
              </label>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 12 }}>
              <button onClick={() => setShowAskModal(false)} className="btn-ghost">Ghairi</button>
              <button onClick={handleAskQuestion} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 8 }} disabled={!question}>
                <Send size={16} />Tuma Swali
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Post Detail Modal */}
      {expandedPost && (
        <div className="modal-overlay" onClick={() => setExpandedPost(null)}>
          <div className="glass-card" style={{ width: '100%', maxWidth: 768, margin: '0 16px', maxHeight: '90vh', overflowY: 'auto' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ position: 'sticky', top: 0, background: 'rgba(15, 23, 42, 0.9)', backdropFilter: 'blur(12px)', padding: 16, borderBottom: '1px solid rgba(51, 65, 85, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 10 }}>
              <h3 style={{ fontSize: 14, fontWeight: 600 }}>Mazungumzo</h3>
              <button onClick={() => setExpandedPost(null)} style={{ padding: 8, borderRadius: 8, background: 'transparent', border: 'none', cursor: 'pointer' }}><X size={20} color="#cbd5e1" /></button>
            </div>

            <div style={{ padding: 24 }}>
              <div style={{ marginBottom: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                  <div className="avatar-ring">
                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #9333ea)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 'bold' }}>{expandedPost.avatar}</div>
                  </div>
                  <div>
                    <h4 style={{ fontSize: 14, fontWeight: 600 }}>{expandedPost.author}</h4>
                    <p style={{ fontSize: 12, color: '#94a3b8' }}>{expandedPost.role} • {expandedPost.time}</p>
                  </div>
                </div>
                <h2 style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 16 }}>{expandedPost.question}</h2>
                {expandedPost.answer && <p style={{ color: '#cbd5e1', lineHeight: 1.6, marginBottom: 16 }}>{expandedPost.answer}</p>}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
                  {expandedPost.tags.map((tag) => <span key={tag} className="tag">#{tag}</span>)}
                </div>
              </div>

              <div style={{ borderTop: '1px solid rgba(51, 65, 85, 0.3)', paddingTop: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                  <h4 style={{ fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <MessageCircle size={16} color="#818cf8" />Majibu ({expandedPost.answerCount})
                  </h4>
                  <select style={{ padding: '6px 12px', borderRadius: 8, background: 'rgba(30, 41, 59, 0.5)', border: '1px solid rgba(51, 65, 85, 0.5)', color: '#cbd5e1', fontSize: 13 }}>
                    <option>Mpya zaidi</option>
                    <option>Ya zamani</option>
                    <option>Bora zaidi</option>
                  </select>
                </div>

                {[
                  { author: "Said M.", text: "Nakubaliana sana na hili. Pia ningependekeza kutumia resources za free kama freeCodeCamp.", time: "Saa 1", likes: 12, isBest: true },
                  { author: "Grace W.", text: "Asante kwa swali hili! Nimejifunza mengi kutoka kwenye majibu.", time: "Saa 3", likes: 8, isBest: false },
                  { author: "Hassan K.", text: "Ningependa kuongeza kwamba practice ni muhimu sana. Jaribu kufanya projects halisi.", time: "Saa 5", likes: 5, isBest: false },
                ].map((c, i) => (
                  <div key={i} style={{ display: 'flex', gap: 12, marginBottom: 16, padding: 12, borderRadius: 12, background: c.isBest ? 'rgba(99, 102, 241, 0.1)' : 'rgba(30, 41, 59, 0.2)', border: c.isBest ? '1px solid rgba(99, 102, 241, 0.3)' : 'none' }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, #10b981, #0d9488)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 'bold', flexShrink: 0 }}>
                      {c.author.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 14, fontWeight: 500 }}>{c.author}</span>
                        {c.isBest && (
                          <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, background: 'rgba(99, 102, 241, 0.2)', color: '#a5b4fc', padding: '2px 8px', borderRadius: 12 }}>
                            <CheckCircle2 size={10} /> Jibu Bora
                          </span>
                        )}
                        <span style={{ fontSize: 12, color: '#64748b' }}>{c.time}</span>
                      </div>
                      <p style={{ fontSize: 14, color: '#cbd5e1', lineHeight: 1.5 }}>{c.text}</p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 8 }}>
                        <button className="tool-btn" style={{ fontSize: 12 }}><ThumbsUp size={12} /> {c.likes}</button>
                        <button className="tool-btn" style={{ fontSize: 12 }}><ThumbsDown size={12} /></button>
                        <button className="tool-btn" style={{ fontSize: 12 }}><MessageCircle size={12} /> Jibu</button>
                        <button className="tool-btn" style={{ fontSize: 12 }}><Share2 size={12} /> Shiriki</button>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Comment Input */}
                <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #9333ea)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 'bold', flexShrink: 0 }}>NK</div>
                  <div style={{ flex: 1 }}>
                    <textarea placeholder="Andika jibu lako..." style={{ width: '100%', padding: 12, borderRadius: 12, background: 'rgba(30, 41, 59, 0.5)', border: '1px solid rgba(51, 65, 85, 0.5)', color: '#e2e8f0', fontSize: 14, resize: 'none', height: 80 }} />
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button style={{ padding: 6, borderRadius: 4, background: 'transparent', border: 'none', cursor: 'pointer' }}><Bold size={16} color="#94a3b8" /></button>
                        <button style={{ padding: 6, borderRadius: 4, background: 'transparent', border: 'none', cursor: 'pointer' }}><Italic size={16} color="#94a3b8" /></button>
                        <button style={{ padding: 6, borderRadius: 4, background: 'transparent', border: 'none', cursor: 'pointer' }}><Code size={16} color="#94a3b8" /></button>
                        <button style={{ padding: 6, borderRadius: 4, background: 'transparent', border: 'none', cursor: 'pointer' }}><Image size={16} color="#94a3b8" /></button>
                      </div>
                      <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, padding: '8px 16px' }}>
                        <Send size={14} />Tuma
                      </button>
                    </div>
                  </div>
                </div>

                {/* Related Questions */}
                <div style={{ marginTop: 24, padding: 16, borderRadius: 12, background: 'rgba(30, 41, 59, 0.2)' }}>
                  <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <BookOpen size={16} color="#818cf8" />Maswali Yanayohusiana
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {[
                      "Je, Python ni lugha bora kwa beginners?",
                      "Tofauti kati ya Data Science na Machine Learning",
                      "Resources bora za kujifunza programming",
                    ].map((q, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', padding: '8px 0', borderBottom: i < 2 ? '1px solid rgba(51, 65, 85, 0.3)' : 'none' }}>
                        <ChevronDown size={14} color="#64748b" style={{ transform: 'rotate(-90deg)' }} />
                        <span style={{ fontSize: 13, color: '#cbd5e1' }}>{q}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Author Card */}
                <div style={{ marginTop: 24, padding: 16, borderRadius: 12, background: 'rgba(30, 41, 59, 0.2)' }}>
                  <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Users size={16} color="#818cf8" />Kuhusu Mwandishi
                  </h4>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div className="avatar-ring">
                      <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #9333ea)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 'bold' }}>
                        {expandedPost.avatar}
                      </div>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <span style={{ fontSize: 15, fontWeight: 600 }}>{expandedPost.author}</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#34d399' }}><CheckCircle2 size={12} /> Verified</span>
                      </div>
                      <p style={{ fontSize: 13, color: '#94a3b8', marginBottom: 8 }}>{expandedPost.role}</p>
                      <div style={{ display: 'flex', gap: 16, fontSize: 12, color: '#64748b' }}>
                        <span><strong style={{ color: '#cbd5e1' }}>234</strong> posts</span>
                        <span><strong style={{ color: '#cbd5e1' }}>1.2K</strong> followers</span>
                        <span><strong style={{ color: '#cbd5e1' }}>89</strong> following</span>
                      </div>
                    </div>
                    <button className="btn-primary" style={{ fontSize: 13, padding: '8px 16px' }}>Fuata</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const PostCard: React.FC<{ post: Post; onExpand: (post: Post) => void }> = ({ post, onExpand }) => {
  const [localPost, setLocalPost] = useState(post);
  const [showMoreOptions, setShowMoreOptions] = useState(false);

  const handleUpvote = () => {
    setLocalPost(prev => ({
      ...prev,
      isUpvoted: !prev.isUpvoted,
      isDownvoted: false,
      upvotes: prev.isUpvoted ? prev.upvotes - 1 : prev.upvotes + 1,
      downvotes: prev.isDownvoted ? prev.downvotes - 1 : prev.downvotes,
    }));
  };

  const handleDownvote = () => {
    setLocalPost(prev => ({
      ...prev,
      isDownvoted: !prev.isDownvoted,
      isUpvoted: false,
      downvotes: prev.isDownvoted ? prev.downvotes - 1 : prev.downvotes + 1,
      upvotes: prev.isUpvoted ? prev.upvotes - 1 : prev.upvotes,
    }));
  };

  const handleBookmark = () => {
    setLocalPost(prev => ({
      ...prev,
      isBookmarked: !prev.isBookmarked,
      bookmarks: prev.isBookmarked ? prev.bookmarks - 1 : prev.bookmarks + 1,
    }));
  };

  return (
    <article className="glass-card" style={{ padding: 20, marginBottom: 16, position: 'relative' }}>
      {localPost.isPinned && (
        <div style={{ position: 'absolute', top: -8, left: 16 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, background: 'rgba(245, 158, 11, 0.2)', color: '#fcd34d', padding: '4px 8px', borderRadius: 20, border: '1px solid rgba(245, 158, 11, 0.3)' }}>
            <Pin size={12} /> Pinned
          </span>
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div className="avatar-ring">
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #9333ea)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 'bold' }}>{localPost.avatar}</div>
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <h4 style={{ fontSize: 14, fontWeight: 600 }}>{localPost.author}</h4>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#34d399' }}><CheckCircle2 size={12} /> Verified</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#94a3b8' }}>
              <span>{localPost.role}</span><span>•</span><span>{localPost.time}</span><span>•</span><Globe size={12} />
            </div>
          </div>
        </div>
        <div style={{ position: 'relative' }}>
          <button className="tool-btn" onClick={() => setShowMoreOptions(!showMoreOptions)}><MoreHorizontal size={16} /></button>
          {showMoreOptions && (
            <div className="glass-card" style={{ position: 'absolute', right: 0, top: 40, width: 200, padding: 8, zIndex: 20 }}>
              {[
                { icon: Share2, label: 'Shiriki' },
                { icon: Bookmark, label: 'Hifadhi' },
                { icon: Copy, label: 'Nakili Link' },
                { icon: ExternalLink, label: 'Fungua' },
                { icon: Flag, label: 'Ripoti' },
              ].map((item, i) => (
                <button key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderRadius: 8, width: '100%', background: 'transparent', border: 'none', color: '#cbd5e1', cursor: 'pointer', fontSize: 14 }} onClick={() => setShowMoreOptions(false)}>
                  <item.icon size={16} />
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <h2 style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 12, cursor: 'pointer', lineHeight: 1.5 }} onClick={() => onExpand(localPost)}>
        {localPost.question}
      </h2>

      {localPost.answer && (
        <div style={{ marginBottom: 16, padding: 16, borderRadius: 12, background: 'rgba(30, 41, 59, 0.3)', border: '1px solid rgba(51, 65, 85, 0.3)' }}>
          <p style={{ fontSize: 14, color: '#cbd5e1', lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {localPost.answer}
          </p>
          <button onClick={() => onExpand(localPost)} style={{ fontSize: 12, color: '#818cf8', marginTop: 8, background: 'transparent', border: 'none', cursor: 'pointer', fontWeight: 500 }}>Soma zaidi →</button>
        </div>
      )}

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
        {localPost.tags.map((tag) => <span key={tag} className="tag">#{tag}</span>)}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 12, color: '#94a3b8', marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid rgba(51, 65, 85, 0.3)' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Eye size={14} />{localPost.views.toLocaleString()} views</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><MessageCircle size={14} />{localPost.answerCount} majibu</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={14} />{localPost.time}</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
        {Object.entries(localPost.reactions).map(([emoji, count]) => (
          <button key={emoji} className="reaction-btn"><span>{emoji}</span><span style={{ fontSize: 12 }}>{count}</span></button>
        ))}
        <button className="reaction-btn" title="Ongeza reaction">
          <span>+</span>
        </button>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
          <button className="tool-btn" style={{ fontSize: 12 }} title="Penda">
            <Heart size={14} />
          </button>
          <button className="tool-btn" style={{ fontSize: 12 }} title="Fuata mwandishi">
            <Users size={14} /> Fuata
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <button onClick={handleUpvote} className={`tool-btn ${localPost.isUpvoted ? 'active' : ''}`}>
            <ThumbsUp size={16} /><span style={{ fontSize: 12, fontWeight: 500 }}>{localPost.upvotes}</span>
          </button>
          <button onClick={handleDownvote} className={`tool-btn ${localPost.isDownvoted ? 'active' : ''}`}>
            <ThumbsDown size={16} /><span style={{ fontSize: 12, fontWeight: 500 }}>{localPost.downvotes}</span>
          </button>
          <button className="tool-btn" onClick={() => onExpand(localPost)}>
            <MessageCircle size={16} /><span style={{ fontSize: 12 }}>{localPost.comments}</span>
          </button>
          <button className="tool-btn"><Share2 size={16} /><span style={{ fontSize: 12 }}>{localPost.shares}</span></button>
          <button onClick={handleBookmark} className={`tool-btn ${localPost.isBookmarked ? 'active' : ''}`}>
            <Bookmark size={16} fill={localPost.isBookmarked ? 'currentColor' : 'none'} /><span style={{ fontSize: 12 }}>{localPost.bookmarks}</span>
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <button className="tool-btn"><Copy size={16} /></button>
          <button className="tool-btn"><Download size={16} /></button>
          <button className="tool-btn"><Flag size={16} /></button>
          <button className="tool-btn"><MoreHorizontal size={16} /></button>
        </div>
      </div>
    </article>
  );
};

export default App;

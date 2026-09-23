import React, { useState } from 'react';
import {
  Search, Bell, MessageSquare, Home, Compass, Bookmark, Users, Settings,
  TrendingUp, Plus, ThumbsUp, ThumbsDown, Share2, MoreHorizontal,
  Eye, Clock, Award, Zap, MessageCircle, Flag,
  BookOpen, Star, Filter, ChevronDown, X, Send, Image, Link2,
  Code, List, Quote, Bold, Italic, Globe, Lock, Sparkles,
  BarChart3, AlertCircle, CheckCircle2, Copy, Download, Pin
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
  category: string;
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
    category: "Teknolojia"
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
    category: "Programming"
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
    category: "Innovation"
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
    category: "Design"
  }
];

const trendingTopics = [
  { name: "AI & Machine Learning", posts: "12.4K", trend: "+24%" },
  { name: "Web3 & Blockchain", posts: "8.7K", trend: "+18%" },
  { name: "Startup Ecosystem", posts: "6.2K", trend: "+31%" },
  { name: "Cybersecurity", posts: "5.8K", trend: "+15%" },
  { name: "Cloud Computing", posts: "4.9K", trend: "+12%" },
];

const categories = [
  { name: "Teknolojia", icon: "💻", count: 45200 },
  { name: "Biashara", icon: "📊", count: 32100 },
  { name: "Sayansi", icon: "🔬", count: 28400 },
  { name: "Sanaa", icon: "🎨", count: 19800 },
  { name: "Michezo", icon: "⚽", count: 15600 },
];

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [showAskModal, setShowAskModal] = useState(false);
  const [expandedPost, setExpandedPost] = useState<Post | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [posts, setPosts] = useState<Post[]>(samplePosts);
  const [showNotifications, setShowNotifications] = useState(false);
  const [question, setQuestion] = useState('');
  const [comment, setComment] = useState('');

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
        category: "General"
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

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 glass-card" style={{ borderRadius: 0 }}>
        <div className="max-w-[1400px] mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold gradient-text hidden sm:block">Nijuze</h1>
          </div>

          <div className="flex-1 max-w-xl mx-4 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Tafuta maswali, majibu, watu..."
              className="search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2">
            <button onClick={() => setShowAskModal(true)} className="btn-primary flex items-center gap-2 text-sm">
              <Plus className="w-4 h-4" />
              <span className="hidden md:inline">Uliza Swali</span>
            </button>

            <div className="relative">
              <button onClick={() => setShowNotifications(!showNotifications)} className="relative p-2.5 rounded-xl hover:bg-indigo-500/10 transition-colors">
                <Bell className="w-5 h-5 text-slate-300" />
                <span className="notification-badge">5</span>
              </button>

              {showNotifications && (
                <div className="absolute right-0 top-12 w-80 glass-card p-4 z-50">
                  <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                    <Bell className="w-4 h-4 text-indigo-400" />
                    Arifa Mpya
                  </h3>
                  {[
                    { text: "Amina amejibu swali lako", time: "Dakika 5" },
                    { text: "Swali lako limepata upvotes 50+", time: "Saa 1" },
                    { text: "Juma amekufuata", time: "Saa 2" },
                    { text: "Comment mpya kwenye post yako", time: "Saa 3" },
                  ].map((notif, i) => (
                    <div key={i} className="flex items-start gap-3 py-2 border-b border-slate-700/50 last:border-0">
                      <div className="w-2 h-2 rounded-full bg-indigo-500 mt-2 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-slate-300">{notif.text}</p>
                        <p className="text-xs text-slate-500">{notif.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button className="p-2.5 rounded-xl hover:bg-indigo-500/10 transition-colors">
              <MessageSquare className="w-5 h-5 text-slate-300" />
            </button>

            <div className="avatar-ring ml-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold">NK</div>
            </div>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <aside className="fixed left-0 top-16 bottom-0 w-64 p-4 overflow-y-auto hidden lg:block">
        <nav className="space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`sidebar-link w-full ${activeTab === item.id ? 'active' : ''}`}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
              {item.id === "messages" && (
                <span className="ml-auto text-xs bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full">3</span>
              )}
            </button>
          ))}
        </nav>

        <div className="mt-8">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 mb-3">Kategoria</h3>
          <div className="space-y-1">
            {categories.map((cat) => (
              <button key={cat.name} className="sidebar-link w-full text-sm">
                <span>{cat.icon}</span>
                <span>{cat.name}</span>
                <span className="ml-auto text-xs text-slate-500">{(cat.count / 1000).toFixed(1)}K</span>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-8 glass-card p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="avatar-ring">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-sm font-bold">NK</div>
            </div>
            <div>
              <p className="text-sm font-semibold">Neema K.</p>
              <p className="text-xs text-slate-400">Level 12 • 2,450 pts</p>
            </div>
          </div>
          <div className="progress-bar">
            <div className="progress-bar-fill" style={{ width: '72%' }} />
          </div>
          <p className="text-xs text-slate-400 mt-2">550 pts hadi Level 13</p>
        </div>
      </aside>

      {/* Right Sidebar */}
      <aside className="fixed right-0 top-16 bottom-0 w-80 p-4 overflow-y-auto hidden xl:block">
        <div className="glass-card p-5 mb-4">
          <h3 className="font-semibold text-sm flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-indigo-400" />
            Mada Zinazovuma
          </h3>
          <div className="space-y-3">
            {trendingTopics.map((topic, i) => (
              <div key={i} className="flex items-center justify-between group cursor-pointer">
                <div>
                  <p className="text-sm font-medium text-slate-200 group-hover:text-indigo-300 transition-colors">{topic.name}</p>
                  <p className="text-xs text-slate-500">{topic.posts} posts</p>
                </div>
                <span className="text-xs text-emerald-400 font-medium">{topic.trend}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card p-5 mb-4">
          <h3 className="font-semibold text-sm flex items-center gap-2 mb-4">
            <Award className="w-4 h-4 text-amber-400" />
            Wachangiaji Bora
          </h3>
          <div className="space-y-3">
            {[
              { name: "Amina H.", role: "AI Expert", points: "12.4K", rank: 1 },
              { name: "Juma B.", role: "Developer", points: "9.8K", rank: 2 },
              { name: "Fatma O.", role: "Data Scientist", points: "8.2K", rank: 3 },
            ].map((user) => (
              <div key={user.rank} className="flex items-center gap-3">
                <span className="text-xs font-bold text-amber-400 w-4">#{user.rank}</span>
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold">
                  {user.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{user.name}</p>
                  <p className="text-xs text-slate-500">{user.role}</p>
                </div>
                <span className="text-xs text-indigo-300">{user.points}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card p-5">
          <h3 className="font-semibold text-sm flex items-center gap-2 mb-4">
            <BarChart3 className="w-4 h-4 text-emerald-400" />
            Takwimu za Nijuze
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="text-center p-3 rounded-xl bg-indigo-500/5 border border-indigo-500/10">
              <p className="text-lg font-bold text-indigo-300">2.4M</p>
              <p className="text-xs text-slate-400">Maswali</p>
            </div>
            <div className="text-center p-3 rounded-xl bg-purple-500/5 border border-purple-500/10">
              <p className="text-lg font-bold text-purple-300">8.1M</p>
              <p className="text-xs text-slate-400">Majibu</p>
            </div>
            <div className="text-center p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
              <p className="text-lg font-bold text-emerald-300">450K</p>
              <p className="text-xs text-slate-400">Watumiaji</p>
            </div>
            <div className="text-center p-3 rounded-xl bg-amber-500/5 border border-amber-500/10">
              <p className="text-lg font-bold text-amber-300">98%</p>
              <p className="text-xs text-slate-400">Satisfaction</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="pt-20 pb-8 px-4 lg:ml-64 xl:mr-80">
        <div className="max-w-2xl mx-auto">
          {/* Welcome Banner */}
          <div className="glass-card p-5 mb-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10" />
            <div className="relative">
              <h2 className="text-lg font-bold mb-1">Karibu tena, Neema! 👋</h2>
              <p className="text-sm text-slate-400">Umeacha maswali 3 bila kujibiwa. Jiunge na mazungumzo 12 mapya leo.</p>
              <div className="flex items-center gap-4 mt-3">
                <div className="flex items-center gap-1.5 text-xs text-indigo-300">
                  <Zap className="w-3.5 h-3.5" /><span>Streak: 7 siku</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-amber-300">
                  <Star className="w-3.5 h-3.5" /><span>Rank: #142</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-emerald-300">
                  <Award className="w-3.5 h-3.5" /><span>Badges: 12</span>
                </div>
              </div>
            </div>
          </div>

          {/* Create Post */}
          <div className="glass-card p-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="avatar-ring">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-sm font-bold">NK</div>
              </div>
              <button onClick={() => setShowAskModal(true)} className="flex-1 text-left p-3 rounded-xl bg-slate-800/30 border border-slate-700/30 text-slate-400 hover:border-indigo-500/30 transition-colors">
                Uliza swali au shiriki maarifa...
              </button>
            </div>
            <div className="flex items-center gap-2 mt-3">
              <button onClick={() => setShowAskModal(true)} className="tool-btn flex-1 justify-center"><Plus className="w-4 h-4" />Swali</button>
              <button className="tool-btn flex-1 justify-center"><Image className="w-4 h-4" />Picha</button>
              <button className="tool-btn flex-1 justify-center"><Link2 className="w-4 h-4" />Link</button>
              <button className="tool-btn flex-1 justify-center"><Code className="w-4 h-4" />Code</button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2">
            {[
              { id: 'latest', label: 'Mpya', icon: Clock },
              { id: 'trending', label: 'Trending', icon: TrendingUp },
              { id: 'top', label: 'Bora', icon: Star },
              { id: 'unanswered', label: 'Haijajibiwa', icon: AlertCircle },
            ].map((filter) => (
              <button key={filter.id} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                <filter.icon className="w-4 h-4" />{filter.label}
              </button>
            ))}
            <button className="ml-auto flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-slate-400 hover:text-slate-200 hover:bg-slate-800/50">
              <Filter className="w-4 h-4" />Filter<ChevronDown className="w-3 h-3" />
            </button>
          </div>

          {/* Posts */}
          {filteredPosts.map((post) => (
            <PostCard key={post.id} post={post} onExpand={setExpandedPost} setPosts={setPosts} posts={posts} />
          ))}

          {filteredPosts.length === 0 && (
            <div className="glass-card p-12 text-center">
              <Search className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Hakuna matokeo</h3>
              <p className="text-sm text-slate-400">Jaribu kutafuta kwa maneno tofauti</p>
            </div>
          )}
        </div>
      </main>

      {/* Ask Question Modal */}
      {showAskModal && (
        <div className="modal-overlay" onClick={() => setShowAskModal(false)}>
          <div className="glass-card w-full max-w-2xl mx-4 p-6 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold gradient-text">Uliza Swali</h2>
              <button onClick={() => setShowAskModal(false)} className="p-2 rounded-lg hover:bg-slate-700/50"><X className="w-5 h-5" /></button>
            </div>

            <div className="mb-4">
              <label className="text-sm font-medium text-slate-300 mb-2 block">Swali lako</label>
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Andika swali lako kwa ufasaha..."
                className="w-full p-3 rounded-xl bg-slate-800/50 border border-slate-700/50 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>

            <div className="mb-4">
              <label className="text-sm font-medium text-slate-300 mb-2 block">Maelezo (Hiari)</label>
              <div className="rounded-xl border border-slate-700/50 overflow-hidden">
                <div className="flex items-center gap-1 p-2 border-b border-slate-700/50 bg-slate-800/30">
                  <button className="p-1.5 rounded hover:bg-slate-700/50"><Bold className="w-4 h-4 text-slate-400" /></button>
                  <button className="p-1.5 rounded hover:bg-slate-700/50"><Italic className="w-4 h-4 text-slate-400" /></button>
                  <button className="p-1.5 rounded hover:bg-slate-700/50"><Code className="w-4 h-4 text-slate-400" /></button>
                  <button className="p-1.5 rounded hover:bg-slate-700/50"><Link2 className="w-4 h-4 text-slate-400" /></button>
                  <button className="p-1.5 rounded hover:bg-slate-700/50"><List className="w-4 h-4 text-slate-400" /></button>
                  <button className="p-1.5 rounded hover:bg-slate-700/50"><Quote className="w-4 h-4 text-slate-400" /></button>
                  <button className="p-1.5 rounded hover:bg-slate-700/50"><Image className="w-4 h-4 text-slate-400" /></button>
                </div>
                <textarea placeholder="Eleza swali lako kwa undani..." className="w-full p-3 bg-transparent text-slate-200 placeholder-slate-500 focus:outline-none resize-none h-32" />
              </div>
            </div>

            <div className="flex items-center gap-4 mb-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-indigo-500" />
                <span className="text-sm text-slate-300 flex items-center gap-1"><Lock className="w-3.5 h-3.5" /> Jibu kwa siri</span>
              </label>
            </div>

            <div className="flex items-center justify-end gap-3">
              <button onClick={() => setShowAskModal(false)} className="btn-ghost">Ghairi</button>
              <button onClick={handleAskQuestion} className="btn-primary flex items-center gap-2" disabled={!question}>
                <Send className="w-4 h-4" />Tuma Swali
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Post Detail Modal */}
      {expandedPost && (
        <div className="modal-overlay" onClick={() => setExpandedPost(null)}>
          <div className="glass-card w-full max-w-3xl mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-slate-900/90 backdrop-blur-xl p-4 border-b border-slate-700/30 flex items-center justify-between z-10">
              <h3 className="font-semibold text-sm">Mazungumzo</h3>
              <button onClick={() => setExpandedPost(null)} className="p-2 rounded-lg hover:bg-slate-700/50"><X className="w-5 h-5" /></button>
            </div>

            <div className="p-6">
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="avatar-ring">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-sm font-bold">{expandedPost.avatar}</div>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold">{expandedPost.author}</h4>
                    <p className="text-xs text-slate-400">{expandedPost.role} • {expandedPost.time}</p>
                  </div>
                </div>
                <h2 className="text-xl font-bold mb-4">{expandedPost.question}</h2>
                {expandedPost.answer && <p className="text-slate-300 leading-relaxed mb-4">{expandedPost.answer}</p>}
                <div className="flex flex-wrap gap-2 mb-4">
                  {expandedPost.tags.map((tag) => <span key={tag} className="tag">#{tag}</span>)}
                </div>
              </div>

              <div className="border-t border-slate-700/30 pt-4">
                <h4 className="font-semibold text-sm mb-4 flex items-center gap-2">
                  <MessageCircle className="w-4 h-4 text-indigo-400" />Majibu ({expandedPost.answerCount})
                </h4>

                {[
                  { author: "Said M.", text: "Nakubaliana sana na hili. Pia ningependekeza kutumia resources za free kama freeCodeCamp.", time: "Saa 1", likes: 12 },
                  { author: "Grace W.", text: "Asante kwa swali hili! Nimejifunza mengi kutoka kwenye majibu.", time: "Saa 3", likes: 8 },
                ].map((c, i) => (
                  <div key={i} className="flex gap-3 mb-4 p-3 rounded-xl bg-slate-800/20">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-xs font-bold flex-shrink-0">
                      {c.author.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium">{c.author}</span>
                        <span className="text-xs text-slate-500">{c.time}</span>
                      </div>
                      <p className="text-sm text-slate-300">{c.text}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <button className="tool-btn text-xs"><ThumbsUp className="w-3 h-3" /> {c.likes}</button>
                        <button className="tool-btn text-xs">Jibu</button>
                      </div>
                    </div>
                  </div>
                ))}

                <div className="mt-4 flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold flex-shrink-0">NK</div>
                  <div className="flex-1">
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Andika jibu lako..."
                      className="w-full p-3 rounded-xl bg-slate-800/50 border border-slate-700/50 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-none h-20"
                    />
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-2">
                        <button className="p-1.5 rounded hover:bg-slate-700/50"><Bold className="w-4 h-4 text-slate-400" /></button>
                        <button className="p-1.5 rounded hover:bg-slate-700/50"><Italic className="w-4 h-4 text-slate-400" /></button>
                        <button className="p-1.5 rounded hover:bg-slate-700/50"><Code className="w-4 h-4 text-slate-400" /></button>
                      </div>
                      <button className="btn-primary text-sm flex items-center gap-2"><Send className="w-3.5 h-3.5" />Tuma</button>
                    </div>
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

// Post Card Component
const PostCard: React.FC<{ post: Post; onExpand: (post: Post) => void; setPosts: React.Dispatch<React.SetStateAction<Post[]>>; posts: Post[] }> = ({ post, onExpand, setPosts, posts }) => {
  const [localPost, setLocalPost] = useState(post);

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
    <article className="glass-card p-5 mb-4 relative group">
      {localPost.isPinned && (
        <div className="absolute -top-2 left-4">
          <span className="flex items-center gap-1 text-xs bg-amber-500/20 text-amber-300 px-2 py-1 rounded-full border border-amber-500/30">
            <Pin className="w-3 h-3" /> Pinned
          </span>
        </div>
      )}

      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="avatar-ring">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-sm font-bold">{localPost.avatar}</div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-semibold">{localPost.author}</h4>
              <span className="flex items-center gap-1 text-xs text-emerald-400"><CheckCircle2 className="w-3 h-3" /> Verified</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span>{localPost.role}</span><span>•</span><span>{localPost.time}</span><span>•</span><Globe className="w-3 h-3" />
            </div>
          </div>
        </div>
        <button className="tool-btn opacity-0 group-hover:opacity-100 transition-opacity"><MoreHorizontal className="w-4 h-4" /></button>
      </div>

      <h2 className="text-lg font-bold mb-3 cursor-pointer hover:text-indigo-300 transition-colors leading-relaxed" onClick={() => onExpand(localPost)}>
        {localPost.question}
      </h2>

      {localPost.answer && (
        <div className="mb-4 p-4 rounded-xl bg-slate-800/30 border border-slate-700/30">
          <p className="text-sm text-slate-300 leading-relaxed" style={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {localPost.answer}
          </p>
          <button onClick={() => onExpand(localPost)} className="text-xs text-indigo-400 mt-2 hover:text-indigo-300 font-medium">Soma zaidi →</button>
        </div>
      )}

      <div className="flex flex-wrap gap-2 mb-4">
        {localPost.tags.map((tag) => <span key={tag} className="tag">#{tag}</span>)}
      </div>

      <div className="flex items-center gap-4 text-xs text-slate-400 mb-4 pb-3 border-b border-slate-700/30">
        <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" />{localPost.views.toLocaleString()} views</span>
        <span className="flex items-center gap-1"><MessageCircle className="w-3.5 h-3.5" />{localPost.answerCount} majibu</span>
        <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{localPost.time}</span>
      </div>

      <div className="flex items-center gap-2 flex-wrap mb-3">
        {Object.entries(localPost.reactions).map(([emoji, count]) => (
          <button key={emoji} className="reaction-btn"><span>{emoji}</span><span className="text-xs">{count}</span></button>
        ))}
        <button className="reaction-btn"><span>+</span></button>
      </div>

      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-1">
          <button onClick={handleUpvote} className={`tool-btn ${localPost.isUpvoted ? 'active' : ''}`}>
            <ThumbsUp className="w-4 h-4" /><span className="text-xs font-medium">{localPost.upvotes}</span>
          </button>
          <button onClick={handleDownvote} className={`tool-btn ${localPost.isDownvoted ? 'active' : ''}`}>
            <ThumbsDown className="w-4 h-4" /><span className="text-xs font-medium">{localPost.downvotes}</span>
          </button>
          <button className="tool-btn" onClick={() => onExpand(localPost)}>
            <MessageCircle className="w-4 h-4" /><span className="text-xs">{localPost.comments}</span>
          </button>
          <button className="tool-btn"><Share2 className="w-4 h-4" /><span className="text-xs">{localPost.shares}</span></button>
          <button onClick={handleBookmark} className={`tool-btn ${localPost.isBookmarked ? 'active' : ''}`}>
            <Bookmark className={`w-4 h-4 ${localPost.isBookmarked ? 'fill-current' : ''}`} /><span className="text-xs">{localPost.bookmarks}</span>
          </button>
        </div>

        <div className="flex items-center gap-1">
          <button className="tool-btn" title="Nakili link"><Copy className="w-4 h-4" /></button>
          <button className="tool-btn" title="Pakua"><Download className="w-4 h-4" /></button>
          <button className="tool-btn" title="Ripoti"><Flag className="w-4 h-4" /></button>
          <button className="tool-btn" title="Zaidi"><MoreHorizontal className="w-4 h-4" /></button>
        </div>
      </div>
    </article>
  );
};

export default App;

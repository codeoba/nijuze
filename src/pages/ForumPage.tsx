import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { useRouter } from '../router/Router';
import { 
  MessageSquare, Users, TrendingUp, Clock, Eye, ThumbsUp,
  Plus, Search, Filter, Pin, Lock, Star, ChevronRight,
  BookOpen, Award, Flame, FileText
} from 'lucide-react';

export const ForumPage: React.FC = () => {
  const { posts, users, currentUser } = useApp();
  const { navigate } = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'latest' | 'popular' | 'unanswered'>('latest');
  const [searchQuery, setSearchQuery] = useState('');

  // Forum categories
  const categories = [
    { id: 'tech', name: 'Teknolojia', icon: '💻', description: 'Programming, AI, Web Development', color: '#6366f1', posts: 45200, members: 12400 },
    { id: 'business', name: 'Biashara', icon: '📊', description: 'Startups, Marketing, Finance', color: '#10b981', posts: 32100, members: 8900 },
    { id: 'science', name: 'Sayansi', icon: '🔬', description: 'Research, Innovation, Discovery', color: '#f59e0b', posts: 28400, members: 6700 },
    { id: 'art', name: 'Sanaa', icon: '🎨', description: 'Design, Music, Film, Photography', color: '#ec4899', posts: 19800, members: 5400 },
    { id: 'sports', name: 'Michezo', icon: '⚽', description: 'Football, Basketball, Athletics', color: '#ef4444', posts: 15600, members: 9800 },
    { id: 'education', name: 'Elimu', icon: '📚', description: 'Learning, Teaching, Resources', color: '#8b5cf6', posts: 22300, members: 7600 },
    { id: 'health', name: 'Afya', icon: '🏥', description: 'Wellness, Medicine, Fitness', color: '#14b8a6', posts: 18900, members: 6200 },
    { id: 'politics', name: 'Siasa', icon: '🏛️', description: 'Government, Policy, Discussion', color: '#f97316', posts: 14200, members: 5100 },
  ];

  // Filter posts by category
  const filteredPosts = selectedCategory 
    ? posts.filter(p => p.category.toLowerCase() === selectedCategory)
    : posts;

  // Sort posts
  const sortedPosts = [...filteredPosts].sort((a, b) => {
    if (sortBy === 'popular') {
      return (b.upvotes + b.commentsCount) - (a.upvotes + a.commentsCount);
    } else if (sortBy === 'unanswered') {
      return a.commentsCount - b.commentsCount;
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  // Search posts
  const searchedPosts = searchQuery
    ? sortedPosts.filter(p => 
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.content.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : sortedPosts;

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto', padding: '24px 16px' }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 8 }}>
          <MessageSquare size={32} color="#6366f1" />
          <h1 style={{ fontSize: 32, fontWeight: 700, color: 'var(--text-main)' }}>Forum</h1>
        </div>
        <p style={{ color: 'var(--text-muted)' }}>Jiunge na mazungumzo na watumiaji wengine</p>
      </div>

      {/* Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 16,
        marginBottom: 32,
      }}>
        {[
          { label: 'Total Posts', value: posts.length, icon: FileText, color: '#6366f1' },
          { label: 'Active Users', value: users.filter(u => u.postsCount > 0).length, icon: Users, color: '#10b981' },
          { label: 'Categories', value: categories.length, icon: BookOpen, color: '#f59e0b' },
          { label: 'Total Views', value: posts.reduce((sum, p) => sum + p.views, 0), icon: Eye, color: '#ec4899' },
        ].map((stat, i) => (
          <div key={i} className="glass-card" style={{ padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <stat.icon size={24} color={stat.color} />
              <p style={{ fontSize: 28, fontWeight: 700, color: stat.color }}>
                {stat.value.toLocaleString()}
              </p>
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>{stat.label}</p>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 24 }}>
        {/* Categories Sidebar */}
        <div>
          <div className="glass-card" style={{ padding: 20 }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-main)' }}>
              <BookOpen size={18} color="var(--border-focus)" />
              Kategoria
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <button
                onClick={() => setSelectedCategory(null)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '10px 12px',
                  borderRadius: 10,
                  background: !selectedCategory ? 'var(--btn-ghost-bg)' : 'transparent',
                  border: 'none',
                  color: !selectedCategory ? 'var(--btn-ghost-text)' : 'var(--text-muted)',
                  cursor: 'pointer',
                  fontSize: 14,
                  fontWeight: !selectedCategory ? 600 : 500,
                  textAlign: 'left',
                  width: '100%',
                }}
              >
                <span style={{ fontSize: 20 }}>🌐</span>
                <span style={{ color: 'var(--text-main)' }}>Zote</span>
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '10px 12px',
                    borderRadius: 10,
                    background: selectedCategory === cat.id ? 'var(--btn-ghost-bg)' : 'transparent',
                    border: 'none',
                    color: selectedCategory === cat.id ? 'var(--btn-ghost-text)' : 'var(--text-muted)',
                    cursor: 'pointer',
                    fontSize: 14,
                    fontWeight: selectedCategory === cat.id ? 600 : 500,
                    textAlign: 'left',
                    width: '100%',
                  }}
                >
                  <span style={{ fontSize: 20 }}>{cat.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ color: 'var(--text-main)' }}>{cat.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                      {cat.posts.toLocaleString()} posts
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Top Contributors */}
          <div className="glass-card" style={{ padding: 20, marginTop: 16 }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-main)' }}>
              <Award size={18} color="#fbbf24" />
              Wachangiaji Bora
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {users.slice(0, 5).map((user, i) => (
                <div key={user.id} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: i === 0 ? '#fbbf24' : i === 1 ? '#94a3b8' : '#cd7f32', width: 20 }}>
                    #{i + 1}
                  </span>
                  <div style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #6366f1, #9333ea)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 12,
                    fontWeight: 'bold',
                    color: 'white',
                  }}>
                    {user.avatar}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-main)', margin: 0 }}>{user.username}</p>
                    <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: 0 }}>{user.postsCount} posts</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div>
          {/* Search & Filters */}
          <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tafuta kwenye forum..."
                style={{
                  width: '100%',
                  padding: '10px 12px 10px 40px',
                  borderRadius: 12,
                  background: 'var(--input-bg)',
                  border: '1px solid var(--input-border)',
                  color: 'var(--input-text)',
                  fontSize: 14,
                }}
              />
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              style={{
                padding: '10px 16px',
                borderRadius: 12,
                background: 'var(--input-bg)',
                border: '1px solid var(--input-border)',
                color: 'var(--input-text)',
                fontSize: 14,
                cursor: 'pointer',
              }}
            >
              <option value="latest">Mpya Zaidi</option>
              <option value="popular">Maarufu Zaidi</option>
              <option value="unanswered">Haijajibiwa</option>
            </select>
            {currentUser && (
              <button
                onClick={() => navigate('/create')}
                className="btn-primary"
                style={{ display: 'flex', alignItems: 'center', gap: 8 }}
              >
                <Plus size={16} />
                Post Mpya
              </button>
            )}
          </div>

          {/* Posts List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {searchedPosts.length === 0 ? (
              <div className="glass-card" style={{ padding: 48, textAlign: 'center' }}>
                <MessageSquare size={48} color="#475569" style={{ margin: '0 auto 16px' }} />
                <p style={{ fontSize: 16, color: 'var(--text-muted)' }}>Hakuna posts zilizopatikana</p>
              </div>
            ) : (
              searchedPosts.map((post) => (
                <ForumPostCard key={post.id} post={post} onClick={() => navigate(`/post/${post.id}`)} />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Forum Post Card Component
const ForumPostCard: React.FC<{ post: any; onClick: () => void }> = ({ post, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="glass-card"
      style={{ padding: 20, cursor: 'pointer', transition: 'all 0.2s ease' }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'var(--border-focus)';
        e.currentTarget.style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'var(--border-app)';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      <div style={{ display: 'flex', gap: 16 }}>
        {/* Vote Count */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 4,
          padding: '8px 12px',
          borderRadius: 12,
          background: 'var(--btn-ghost-bg)',
          border: '1px solid var(--btn-ghost-border)',
          minWidth: 60,
        }}>
          <ThumbsUp size={16} color="var(--btn-ghost-text)" />
          <span style={{ fontSize: 18, fontWeight: 700, color: 'var(--btn-ghost-text)' }}>{post.upvotes}</span>
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>votes</span>
        </div>

        {/* Content */}
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            {post.isPinned && (
              <span style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                padding: '2px 8px',
                borderRadius: 8,
                background: 'rgba(251, 191, 36, 0.15)',
                color: '#d97706',
                fontSize: 11,
                fontWeight: 600,
              }}>
                <Pin size={10} /> Pinned
              </span>
            )}
            {post.isAnonymous && (
              <span style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                padding: '2px 8px',
                borderRadius: 8,
                background: 'var(--bg-subtle)',
                color: 'var(--text-muted)',
                fontSize: 11,
                fontWeight: 600,
              }}>
                <Lock size={10} /> Anonymous
              </span>
            )}
          </div>

          <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8, color: 'var(--text-main)' }}>
            {post.title}
          </h3>

          <p style={{ fontSize: 14, color: 'var(--text-body)', marginBottom: 12, lineHeight: 1.5 }}>
            {post.content.substring(0, 150)}...
          </p>

          {/* Tags */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
            {post.tags.slice(0, 3).map((tag: string) => (
              <span key={tag} className="tag">
                #{tag}
              </span>
            ))}
          </div>

          {/* Meta Info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 13, color: 'var(--text-muted)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{
                width: 24,
                height: 24,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #6366f1, #9333ea)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 10,
                fontWeight: 'bold',
                color: 'white',
              }}>
                {post.author.avatar}
              </div>
              <span style={{ color: 'var(--text-main)' }}>{post.author.username}</span>
            </div>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <Clock size={14} />
              {new Date(post.createdAt).toLocaleDateString()}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <MessageSquare size={14} />
              {post.commentsCount} majibu
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <Eye size={14} />
              {post.views} views
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

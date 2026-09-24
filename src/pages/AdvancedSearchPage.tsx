import React, { useState, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import { useRouter } from '../router/Router';
import { 
  Search, Filter, X, Calendar, Tag, User, TrendingUp,
  Clock, ThumbsUp, MessageCircle, Eye, ChevronDown
} from 'lucide-react';

export const AdvancedSearchPage: React.FC = () => {
  const { posts, users } = useApp();
  const { navigate } = useRouter();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    category: '',
    author: '',
    dateRange: 'all',
    minUpvotes: 0,
    hasComments: false,
    sortBy: 'relevance',
  });
  const [showFilters, setShowFilters] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);

  // Get unique categories
  const categories = [...new Set(posts.map(p => p.category))].filter(Boolean);
  
  // Get unique authors
  const authors = [...new Set(posts.map(p => p.author.username))];

  // Search and filter posts
  useEffect(() => {
    let results = posts;

    // Text search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      results = results.filter(p => 
        p.title.toLowerCase().includes(query) ||
        p.content.toLowerCase().includes(query) ||
        p.tags.some(t => t.toLowerCase().includes(query))
      );
    }

    // Category filter
    if (filters.category) {
      results = results.filter(p => p.category === filters.category);
    }

    // Author filter
    if (filters.author) {
      results = results.filter(p => p.author.username === filters.author);
    }

    // Date range filter
    if (filters.dateRange !== 'all') {
      const now = new Date();
      const cutoff = new Date();
      
      switch (filters.dateRange) {
        case 'today':
          cutoff.setHours(0, 0, 0, 0);
          break;
        case 'week':
          cutoff.setDate(now.getDate() - 7);
          break;
        case 'month':
          cutoff.setMonth(now.getMonth() - 1);
          break;
        case 'year':
          cutoff.setFullYear(now.getFullYear() - 1);
          break;
      }
      
      results = results.filter(p => new Date(p.createdAt) >= cutoff);
    }

    // Min upvotes filter
    if (filters.minUpvotes > 0) {
      results = results.filter(p => p.upvotes >= filters.minUpvotes);
    }

    // Has comments filter
    if (filters.hasComments) {
      results = results.filter(p => p.commentsCount > 0);
    }

    // Sort results
    switch (filters.sortBy) {
      case 'latest':
        results = [...results].sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        break;
      case 'popular':
        results = [...results].sort((a, b) => b.upvotes - a.upvotes);
        break;
      case 'most commented':
        results = [...results].sort((a, b) => b.commentsCount - a.commentsCount);
        break;
      case 'most viewed':
        results = [...results].sort((a, b) => b.views - a.views);
        break;
      default: // relevance
        if (searchQuery) {
          results = [...results].sort((a, b) => {
            const aTitle = a.title.toLowerCase().includes(searchQuery.toLowerCase()) ? 2 : 0;
            const bTitle = b.title.toLowerCase().includes(searchQuery.toLowerCase()) ? 2 : 0;
            const aContent = a.content.toLowerCase().includes(searchQuery.toLowerCase()) ? 1 : 0;
            const bContent = b.content.toLowerCase().includes(searchQuery.toLowerCase()) ? 1 : 0;
            return (bTitle + bContent) - (aTitle + aContent);
          });
        }
    }

    setSearchResults(results);
  }, [searchQuery, filters, posts]);

  const clearFilters = () => {
    setFilters({
      category: '',
      author: '',
      dateRange: 'all',
      minUpvotes: 0,
      hasComments: false,
      sortBy: 'relevance',
    });
  };

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 16px' }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 8 }}>
          <Search size={32} color="#6366f1" />
          <h1 style={{ fontSize: 32, fontWeight: 700 }}>Tafuta ya Kisasa</h1>
        </div>
        <p style={{ color: '#94a3b8' }}>Tafuta posts kwa filters za kisasa</p>
      </div>

      {/* Search Bar */}
      <div className="glass-card" style={{ padding: 24, marginBottom: 24 }}>
        <div style={{ position: 'relative', marginBottom: 16 }}>
          <Search size={20} color="#64748b" style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tafuta posts, tags, au content..."
            style={{
              width: '100%',
              padding: '16px 16px 16px 48px',
              borderRadius: 12,
              background: 'rgba(30, 41, 59, 0.5)',
              border: '1px solid rgba(51, 65, 85, 0.5)',
              color: '#e2e8f0',
              fontSize: 16,
            }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              style={{
                position: 'absolute',
                right: 16,
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              <X size={20} color="#64748b" />
            </button>
          )}
        </div>

        {/* Filter Toggle */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '10px 16px',
            borderRadius: 10,
            background: showFilters ? 'rgba(99, 102, 241, 0.2)' : 'rgba(30, 41, 59, 0.3)',
            border: `1px solid ${showFilters ? 'rgba(99, 102, 241, 0.5)' : 'rgba(51, 65, 85, 0.3)'}`,
            color: showFilters ? '#a5b4fc' : '#94a3b8',
            cursor: 'pointer',
            fontSize: 14,
            fontWeight: 500,
          }}
        >
          <Filter size={16} />
          {showFilters ? 'Ficha Filters' : 'Onyesha Filters'}
          <ChevronDown size={16} style={{ transform: showFilters ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
        </button>

        {/* Filters Panel */}
        {showFilters && (
          <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid rgba(51, 65, 85, 0.3)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
              {/* Category Filter */}
              <div>
                <label style={{ fontSize: 13, color: '#94a3b8', marginBottom: 8, display: 'block' }}>
                  Kategoria
                </label>
                <select
                  value={filters.category}
                  onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                  style={{
                    width: '100%',
                    padding: 10,
                    borderRadius: 8,
                    background: 'rgba(30, 41, 59, 0.5)',
                    border: '1px solid rgba(51, 65, 85, 0.5)',
                    color: '#e2e8f0',
                    fontSize: 14,
                  }}
                >
                  <option value="">Zote</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Author Filter */}
              <div>
                <label style={{ fontSize: 13, color: '#94a3b8', marginBottom: 8, display: 'block' }}>
                  Mwandishi
                </label>
                <select
                  value={filters.author}
                  onChange={(e) => setFilters({ ...filters, author: e.target.value })}
                  style={{
                    width: '100%',
                    padding: 10,
                    borderRadius: 8,
                    background: 'rgba(30, 41, 59, 0.5)',
                    border: '1px solid rgba(51, 65, 85, 0.5)',
                    color: '#e2e8f0',
                    fontSize: 14,
                  }}
                >
                  <option value="">Wote</option>
                  {authors.map(author => (
                    <option key={author} value={author}>{author}</option>
                  ))}
                </select>
              </div>

              {/* Date Range Filter */}
              <div>
                <label style={{ fontSize: 13, color: '#94a3b8', marginBottom: 8, display: 'block' }}>
                  Muda
                </label>
                <select
                  value={filters.dateRange}
                  onChange={(e) => setFilters({ ...filters, dateRange: e.target.value })}
                  style={{
                    width: '100%',
                    padding: 10,
                    borderRadius: 8,
                    background: 'rgba(30, 41, 59, 0.5)',
                    border: '1px solid rgba(51, 65, 85, 0.5)',
                    color: '#e2e8f0',
                    fontSize: 14,
                  }}
                >
                  <option value="all">Wakati Wote</option>
                  <option value="today">Leo</option>
                  <option value="week">Wiki Iliyopita</option>
                  <option value="month">Mwezi Uliopita</option>
                  <option value="year">Mwaka Uliopita</option>
                </select>
              </div>

              {/* Sort By Filter */}
              <div>
                <label style={{ fontSize: 13, color: '#94a3b8', marginBottom: 8, display: 'block' }}>
                  Panga Kwa
                </label>
                <select
                  value={filters.sortBy}
                  onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
                  style={{
                    width: '100%',
                    padding: 10,
                    borderRadius: 8,
                    background: 'rgba(30, 41, 59, 0.5)',
                    border: '1px solid rgba(51, 65, 85, 0.5)',
                    color: '#e2e8f0',
                    fontSize: 14,
                  }}
                >
                  <option value="relevance">Relevance</option>
                  <option value="latest">Mpya Zaidi</option>
                  <option value="popular">Maarufu Zaidi</option>
                  <option value="most commented">Comments Nyingi</option>
                  <option value="most viewed">Views Nyingi</option>
                </select>
              </div>

              {/* Min Upvotes Filter */}
              <div>
                <label style={{ fontSize: 13, color: '#94a3b8', marginBottom: 8, display: 'block' }}>
                  Upvotes Minimum
                </label>
                <input
                  type="number"
                  value={filters.minUpvotes}
                  onChange={(e) => setFilters({ ...filters, minUpvotes: parseInt(e.target.value) || 0 })}
                  min="0"
                  style={{
                    width: '100%',
                    padding: 10,
                    borderRadius: 8,
                    background: 'rgba(30, 41, 59, 0.5)',
                    border: '1px solid rgba(51, 65, 85, 0.5)',
                    color: '#e2e8f0',
                    fontSize: 14,
                  }}
                />
              </div>

              {/* Has Comments Filter */}
              <div>
                <label style={{ fontSize: 13, color: '#94a3b8', marginBottom: 8, display: 'block' }}>
                  Comments
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={filters.hasComments}
                    onChange={(e) => setFilters({ ...filters, hasComments: e.target.checked })}
                    style={{ width: 18, height: 18 }}
                  />
                  <span style={{ fontSize: 14, color: '#e2e8f0' }}>Zenye comments tu</span>
                </label>
              </div>
            </div>

            {/* Clear Filters Button */}
            <button
              onClick={clearFilters}
              style={{
                marginTop: 16,
                padding: '8px 16px',
                borderRadius: 8,
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#fca5a5',
                cursor: 'pointer',
                fontSize: 14,
                fontWeight: 500,
              }}
            >
              Futa Filters Zote
            </button>
          </div>
        )}
      </div>

      {/* Results Count */}
      <div style={{ marginBottom: 16, fontSize: 14, color: '#94a3b8' }}>
        Matokeo: <strong style={{ color: '#e2e8f0' }}>{searchResults.length}</strong> posts zilizopatikana
      </div>

      {/* Search Results */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {searchResults.length === 0 ? (
          <div className="glass-card" style={{ padding: 48, textAlign: 'center' }}>
            <Search size={48} color="#475569" style={{ margin: '0 auto 16px' }} />
            <p style={{ fontSize: 16, color: '#94a3b8' }}>Hakuna matokeo yaliyopatikana</p>
            <p style={{ fontSize: 14, color: '#64748b', marginTop: 8 }}>Jaribu kubadilisha filters au search query</p>
          </div>
        ) : (
          searchResults.map((post) => (
            <div
              key={post.id}
              onClick={() => navigate(`/post/${post.id}`)}
              className="glass-card"
              style={{ padding: 20, cursor: 'pointer', transition: 'all 0.2s ease' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.3)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(51, 65, 85, 0.3)';
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
                  background: 'rgba(99, 102, 241, 0.1)',
                  minWidth: 60,
                }}>
                  <ThumbsUp size={16} color="#a5b4fc" />
                  <span style={{ fontSize: 18, fontWeight: 700, color: '#a5b4fc' }}>{post.upvotes}</span>
                  <span style={{ fontSize: 11, color: '#64748b' }}>votes</span>
                </div>

                {/* Content */}
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8, color: '#e2e8f0' }}>
                    {post.title}
                  </h3>

                  <p style={{ fontSize: 14, color: '#94a3b8', marginBottom: 12, lineHeight: 1.5 }}>
                    {post.content.substring(0, 150)}...
                  </p>

                  {/* Tags */}
                  <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
                    {post.tags.slice(0, 3).map((tag: string) => (
                      <span
                        key={tag}
                        style={{
                          padding: '4px 10px',
                          borderRadius: 12,
                          background: 'rgba(99, 102, 241, 0.1)',
                          border: '1px solid rgba(99, 102, 241, 0.2)',
                          color: '#a5b4fc',
                          fontSize: 12,
                        }}
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>

                  {/* Meta Info */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 13, color: '#64748b' }}>
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
                      <span>{post.author.username}</span>
                    </div>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Clock size={14} />
                      {new Date(post.createdAt).toLocaleDateString()}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <MessageCircle size={14} />
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
          ))
        )}
      </div>
    </div>
  );
};

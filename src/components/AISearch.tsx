import React, { useState, useEffect, useRef } from 'react';
import { Search, Sparkles, TrendingUp, Clock, ThumbsUp, X } from 'lucide-react';
import { useApp } from '../contexts/AppContext';

// Simple semantic search using keyword matching and scoring
const semanticSearch = (query: string, posts: any[]) => {
  const queryWords = query.toLowerCase().split(/\s+/).filter(w => w.length > 2);
  
  return posts.map(post => {
    let score = 0;
    const title = post.title.toLowerCase();
    const content = post.content.toLowerCase();
    const tags = post.tags.map((t: string) => t.toLowerCase());
    
    // Title matches (highest weight)
    queryWords.forEach(word => {
      if (title.includes(word)) score += 10;
      if (content.includes(word)) score += 3;
      if (tags.some((t: string) => t.includes(word))) score += 5;
    });
    
    // Exact phrase match
    if (title.includes(query.toLowerCase())) score += 20;
    
    // Boost popular posts
    score += Math.log(post.upvotes + 1) * 2;
    score += Math.log(post.views + 1);
    
    // Recency boost
    const daysOld = (Date.now() - new Date(post.createdAt).getTime()) / (1000 * 60 * 60 * 24);
    if (daysOld < 7) score += 5;
    else if (daysOld < 30) score += 2;
    
    return { post, score };
  })
  .filter(item => item.score > 0)
  .sort((a, b) => b.score - a.score)
  .map(item => item.post);
};

// Auto-suggest tags based on content
const suggestTags = (content: string): string[] => {
  const tagSuggestions: { [key: string]: string[] } = {
    'react': ['React', 'Frontend', 'JavaScript'],
    'python': ['Python', 'Programming', 'Data Science'],
    'machine learning': ['Machine Learning', 'AI', 'Data Science'],
    'blockchain': ['Blockchain', 'Web3', 'Cryptocurrency'],
    'design': ['Design', 'UX', 'UI'],
    'business': ['Business', 'Startup', 'Entrepreneurship'],
    'health': ['Health', 'Wellness', 'Fitness'],
  };
  
  const contentLower = content.toLowerCase();
  const suggested: string[] = [];
  
  Object.entries(tagSuggestions).forEach(([keyword, tags]) => {
    if (contentLower.includes(keyword)) {
      suggested.push(...tags);
    }
  });
  
  return [...new Set(suggested)].slice(0, 5);
};

// Summarize long content
const summarizeContent = (content: string, maxLength: number = 150): string => {
  if (content.length <= maxLength) return content;
  
  // Find the last sentence before maxLength
  const truncated = content.substring(0, maxLength);
  const lastPeriod = truncated.lastIndexOf('.');
  
  if (lastPeriod > maxLength * 0.7) {
    return truncated.substring(0, lastPeriod + 1);
  }
  
  return truncated + '...';
};

interface AISearchProps {
  onResults: (results: any[]) => void;
}

export const AISearch: React.FC<AISearchProps> = ({ onResults }) => {
  const { posts } = useApp();
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load recent searches
  useEffect(() => {
    const saved = localStorage.getItem('recent_searches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  // Generate suggestions as user types
  useEffect(() => {
    if (query.length > 2) {
      const queryLower = query.toLowerCase();
      const matches = posts
        .filter(p => 
          p.title.toLowerCase().includes(queryLower) ||
          p.tags.some(t => t.toLowerCase().includes(queryLower))
        )
        .slice(0, 5)
        .map(p => p.title);
      
      setSuggestions(matches);
      setShowSuggestions(matches.length > 0);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [query, posts]);

  // Perform search
  const handleSearch = (searchQuery?: string) => {
    const q = searchQuery || query;
    if (!q.trim()) return;
    
    setIsSearching(true);
    
    // Save to recent searches
    const updated = [q, ...recentSearches.filter(s => s !== q)].slice(0, 10);
    setRecentSearches(updated);
    localStorage.setItem('recent_searches', JSON.stringify(updated));
    
    // Perform semantic search
    const results = semanticSearch(q, posts);
    
    setTimeout(() => {
      onResults(results);
      setIsSearching(false);
      setShowSuggestions(false);
    }, 300);
  };

  const handleClear = () => {
    setQuery('');
    onResults([]);
    inputRef.current?.focus();
  };

  const handleRemoveRecent = (search: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = recentSearches.filter(s => s !== search);
    setRecentSearches(updated);
    localStorage.setItem('recent_searches', JSON.stringify(updated));
  };

  return (
    <div className="glass-card" style={{ padding: 24, marginBottom: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <Sparkles size={20} color="#a5b4fc" />
        <h3 style={{ fontSize: 18, fontWeight: 600 }}>AI-Powered Search</h3>
      </div>
      
      {/* Search Input */}
      <div style={{ position: 'relative', marginBottom: 16 }}>
        <Search size={20} color="#64748b" style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)' }} />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          onFocus={() => query.length > 2 && setShowSuggestions(suggestions.length > 0)}
          placeholder="Tafuta kwa AI... (semantic search)"
          style={{
            width: '100%',
            padding: '14px 48px 14px 48px',
            borderRadius: 12,
            background: 'rgba(30, 41, 59, 0.5)',
            border: '1px solid rgba(99, 102, 241, 0.3)',
            color: 'var(--text-main)',
            fontSize: 15,
          }}
        />
        {query && (
          <button
            onClick={handleClear}
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
        
        {/* Suggestions Dropdown */}
        {showSuggestions && (
          <div style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            marginTop: 8,
            background: 'rgba(26, 26, 46, 0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(99, 102, 241, 0.3)',
            borderRadius: 12,
            zIndex: 100,
            maxHeight: 300,
            overflowY: 'auto',
          }}>
            {suggestions.map((suggestion, i) => (
              <button
                key={i}
                onClick={() => {
                  setQuery(suggestion);
                  handleSearch(suggestion);
                }}
                style={{
                  display: 'block',
                  width: '100%',
                  padding: '12px 16px',
                  background: 'transparent',
                  border: 'none',
                  borderBottom: i < suggestions.length - 1 ? '1px solid rgba(51, 65, 85, 0.3)' : 'none',
                  color: 'var(--text-main)',
                  fontSize: 14,
                  textAlign: 'left',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(99, 102, 241, 0.1)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Search Button */}
      <button
        onClick={() => handleSearch()}
        className="btn-primary"
        disabled={isSearching || !query.trim()}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          marginBottom: 16,
        }}
      >
        {isSearching ? (
          <>
            <div style={{
              width: 16,
              height: 16,
              border: '2px solid rgba(255, 255, 255, 0.3)',
              borderTopColor: 'white',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
            }} />
            Inatafuta...
          </>
        ) : (
          <>
            <Sparkles size={16} />
            Tafuta kwa AI
          </>
        )}
      </button>

      {/* Recent Searches */}
      {recentSearches.length > 0 && (
        <div>
          <p style={{ fontSize: 13, color: '#64748b', marginBottom: 8 }}>Matafuti ya Hivi Karibuni:</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {recentSearches.slice(0, 5).map((search, i) => (
              <button
                key={i}
                onClick={() => handleSearch(search)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '6px 12px',
                  borderRadius: 20,
                  background: 'rgba(99, 102, 241, 0.1)',
                  border: '1px solid rgba(99, 102, 241, 0.2)',
                  color: 'var(--btn-ghost-text)',
                  fontSize: 12,
                  cursor: 'pointer',
                }}
              >
                <Clock size={12} />
                {search}
                <X
                  size={12}
                  onClick={(e) => handleRemoveRecent(search, e)}
                  style={{ cursor: 'pointer', opacity: 0.6 }}
                />
              </button>
            ))}
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

// Export helper functions
export { semanticSearch, suggestTags, summarizeContent };

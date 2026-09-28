import React, { useState, useEffect } from 'react';
import { Bookmark, X, Clock, Eye, Tag, Trash2, ExternalLink, BookOpen } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { Post } from '../types';
import { formatDate } from '../utils/data';

export const ReadingList: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { posts, currentUser } = useApp();
  const [readingList, setReadingList] = useState<Post[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');

  useEffect(() => {
    if (isOpen) {
      // Get bookmarked posts
      const bookmarked = posts.filter(p => p.isBookmarked);
      setReadingList(bookmarked);
    }
  }, [isOpen, posts]);

  const filteredList = readingList.filter(post => {
    if (filter === 'unread') return !post.isRead;
    if (filter === 'read') return post.isRead;
    return true;
  });

  const handleRemove = (postId: string) => {
    setReadingList(readingList.filter(p => p.id !== postId));
  };

  const handleMarkAsRead = (postId: string) => {
    setReadingList(readingList.map(p => p.id === postId ? { ...p, isRead: true } : p));
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="glass-card"
        style={{
          width: '100%',
          maxWidth: 700,
          margin: '0 16px',
          maxHeight: '90vh',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          padding: 20,
          borderBottom: '1px solid rgba(51, 65, 85, 0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
            <BookOpen size={24} color="#818cf8" />
            Orodha ya Kusoma
          </h2>
          <button
            onClick={onClose}
            style={{ padding: 8, borderRadius: 8, background: 'transparent', border: 'none', cursor: 'pointer' }}
          >
            <X size={20} color="#cbd5e1" />
          </button>
        </div>

        {/* Filters */}
        <div style={{
          padding: 16,
          borderBottom: '1px solid rgba(51, 65, 85, 0.3)',
          display: 'flex',
          gap: 8,
        }}>
          {(['all', 'unread', 'read'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: '8px 16px',
                borderRadius: 20,
                background: filter === f ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
                border: `1px solid ${filter === f ? 'rgba(99, 102, 241, 0.5)' : 'rgba(51, 65, 85, 0.3)'}`,
                color: filter === f ? '#a5b4fc' : '#94a3b8',
                cursor: 'pointer',
                fontSize: 13,
                fontWeight: 500,
              }}
            >
              {f === 'all' ? 'Zote' : f === 'unread' ? 'Hazijasomwa' : 'Zimesomwa'}
              <span style={{ marginLeft: 6, opacity: 0.7 }}>
                ({f === 'all' ? readingList.length : f === 'unread' ? readingList.filter(p => !p.isRead).length : readingList.filter(p => p.isRead).length})
              </span>
            </button>
          ))}
        </div>

        {/* Reading List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
          {filteredList.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: 48,
              color: '#64748b',
            }}>
              <Bookmark size={48} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
              <p style={{ fontSize: 16, fontWeight: 500, marginBottom: 8 }}>
                Hakuna posts kwenye orodha yako
              </p>
              <p style={{ fontSize: 14 }}>
                Bofya bookmark kwenye post ili kuiongeza hapa
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {filteredList.map((post) => (
                <div
                  key={post.id}
                  style={{
                    padding: 16,
                    borderRadius: 12,
                    background: post.isRead ? 'rgba(30, 41, 59, 0.2)' : 'rgba(99, 102, 241, 0.05)',
                    border: `1px solid ${post.isRead ? 'rgba(51, 65, 85, 0.2)' : 'rgba(99, 102, 241, 0.2)'}`,
                    opacity: post.isRead ? 0.7 : 1,
                  }}
                >
                  {/* Post Header */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
                    <div style={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #6366f1, #9333ea)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 14,
                      fontWeight: 'bold',
                      flexShrink: 0,
                    }}>
                      {post.author.avatar}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 4, lineHeight: 1.4 }}>
                        {post.title}
                      </h3>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#64748b' }}>
                        <span>{post.author.username}</span>
                        <span>•</span>
                        <span>{formatDate(post.createdAt)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Post Content Preview */}
                  <p style={{
                    fontSize: 13,
                    color: 'var(--text-muted)',
                    lineHeight: 1.5,
                    marginBottom: 12,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}>
                    {post.content}
                  </p>

                  {/* Tags */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
                    {post.tags.slice(0, 3).map((tag) => (
                      <span key={tag} style={{
                        padding: '4px 8px',
                        borderRadius: 12,
                        background: 'rgba(99, 102, 241, 0.1)',
                        border: '1px solid rgba(99, 102, 241, 0.2)',
                        fontSize: 11,
                        color: 'var(--btn-ghost-text)',
                      }}>
                        #{tag}
                      </span>
                    ))}
                  </div>

                  {/* Stats & Actions */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingTop: 12,
                    borderTop: '1px solid rgba(51, 65, 85, 0.2)',
                  }}>
                    <div style={{ display: 'flex', gap: 16, fontSize: 12, color: '#64748b' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Eye size={14} />
                        {post.views.toLocaleString()}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Clock size={14} />
                        {Math.ceil(post.content.split(' ').length / 200)} min kusoma
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      {!post.isRead && (
                        <button
                          onClick={() => handleMarkAsRead(post.id)}
                          style={{
                            padding: '6px 12px',
                            borderRadius: 8,
                            background: 'rgba(16, 185, 129, 0.1)',
                            border: '1px solid rgba(16, 185, 129, 0.3)',
                            color: '#10b981',
                            cursor: 'pointer',
                            fontSize: 12,
                            fontWeight: 500,
                          }}
                        >
                          Weka Soma
                        </button>
                      )}
                      <button
                        onClick={() => handleRemove(post.id)}
                        style={{
                          padding: 6,
                          borderRadius: 8,
                          background: 'rgba(239, 68, 68, 0.1)',
                          border: '1px solid rgba(239, 68, 68, 0.3)',
                          cursor: 'pointer',
                        }}
                      >
                        <Trash2 size={14} color="#ef4444" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Stats */}
        {filteredList.length > 0 && (
          <div style={{
            padding: 16,
            borderTop: '1px solid rgba(51, 65, 85, 0.3)',
            background: 'rgba(30, 41, 59, 0.3)',
            display: 'flex',
            justifyContent: 'space-around',
          }}>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: 18, fontWeight: 700, color: 'var(--btn-ghost-text)' }}>{filteredList.length}</p>
              <p style={{ fontSize: 12, color: '#64748b' }}>Posts</p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: 18, fontWeight: 700, color: '#10b981' }}>
                {filteredList.reduce((sum, p) => sum + Math.ceil(p.content.split(' ').length / 200), 0)}
              </p>
              <p style={{ fontSize: 12, color: '#64748b' }}>Dakika</p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: 18, fontWeight: 700, color: '#fbbf24' }}>
                {filteredList.filter(p => !p.isRead).length}
              </p>
              <p style={{ fontSize: 12, color: '#64748b' }}>Zilizobaki</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

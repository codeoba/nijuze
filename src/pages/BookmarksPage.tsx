import React, { useState } from 'react';
import { useRouter } from '../router/Router';
import { useApp } from '../contexts/AppContext';
import { formatDate } from '../utils/data';
import {
  Bookmark, ArrowLeft, ChevronRight, BookOpen, Clock, Tag,
  ThumbsUp, MessageCircle, Trash2, AlertCircle
} from 'lucide-react';

export const BookmarksPage: React.FC = () => {
  const { navigate } = useRouter();
  const { posts, toggleBookmark, isAuthenticated } = useApp();
  const [filter, setFilter] = useState<'all' | 'unsolved' | 'solved'>('all');

  const bookmarkedPosts = posts.filter((p) => p.isBookmarked);

  const filteredPosts = bookmarkedPosts.filter((post) => {
    if (filter === 'solved') return post.isSolved;
    if (filter === 'unsolved') return !post.isSolved;
    return true;
  });

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', paddingBottom: 64 }}>
      {/* Breadcrumb Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-muted)' }}>
          <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0 }}>
            Nyumbani
          </button>
          <ChevronRight size={14} />
          <span style={{ color: 'var(--btn-ghost-text)', fontWeight: 600 }}>Orodha ya Kusoma (Bookmarks)</span>
        </div>

        <button
          onClick={() => navigate('/')}
          className="btn-ghost"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, padding: '6px 14px', cursor: 'pointer' }}
        >
          <ArrowLeft size={16} /> Rudi Nyumbani
        </button>
      </div>

      {/* Hero Card */}
      <div
        className="glass-card"
        style={{
          padding: 28,
          marginBottom: 24,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 16,
          background: 'linear-gradient(135deg, rgba(234, 179, 8, 0.12), rgba(99, 102, 241, 0.08))',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div
            style={{
              width: 50,
              height: 50,
              borderRadius: 14,
              background: 'linear-gradient(135deg, #eab308, #ca8a04)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 14px rgba(234, 179, 8, 0.35)',
            }}
          >
            <Bookmark size={24} color="white" />
          </div>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-main)', marginBottom: 4 }}>
              Maswali Uliyohifadhi ({bookmarkedPosts.length})
            </h1>
            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              Maudhui na majibu uliyoyaweka alama ili kuyasoma au kurejelea baadaye.
            </p>
          </div>
        </div>

        {/* Filter Pills */}
        <div style={{ display: 'flex', gap: 6, background: 'var(--bg-subtle)', padding: 4, borderRadius: 10, border: '1px solid var(--border-app)' }}>
          {[
            { id: 'all', label: 'Zote' },
            { id: 'unsolved', label: 'Yasiyojibiwa' },
            { id: 'solved', label: 'Yaliyojibiwa' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setFilter(item.id as any)}
              style={{
                padding: '6px 12px',
                borderRadius: 8,
                fontSize: 12,
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
                background: filter === item.id ? 'var(--btn-ghost-bg)' : 'transparent',
                color: filter === item.id ? 'var(--btn-ghost-text)' : 'var(--text-muted)',
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* List of Bookmarks */}
      {filteredPosts.length === 0 ? (
        <div className="glass-card" style={{ padding: 48, textAlign: 'center' }}>
          <BookOpen size={48} color="var(--text-muted)" style={{ margin: '0 auto 16px' }} />
          <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-main)', marginBottom: 6 }}>
            {bookmarkedPosts.length === 0 ? 'Bado Hujafadhi Chapisho Lolote' : 'Hakuna machapisho kwenye kichujio hiki'}
          </h3>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 20 }}>
            Unaposoma mada yoyote kwenye Nijuze, bonyeza alama ya kitabu (Bookmark) ili kuihifadhi hapa.
          </p>
          <button onClick={() => navigate('/forum')} className="btn-primary" style={{ padding: '8px 20px', cursor: 'pointer' }}>
            Vinjari Maswali
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {filteredPosts.map((post) => (
            <div
              key={post.id}
              className="glass-card"
              style={{
                padding: 20,
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                gap: 16,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              onClick={() => navigate(`/post/${post.id}`)}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-focus)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-app)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
                  {post.category && (
                    <span
                      style={{
                        padding: '2px 8px',
                        borderRadius: 6,
                        fontSize: 11,
                        fontWeight: 600,
                        background: 'rgba(99, 102, 241, 0.12)',
                        color: 'var(--btn-ghost-text)',
                      }}
                    >
                      {post.category}
                    </span>
                  )}
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    Imechapishwa {formatDate(post.createdAt)}
                  </span>
                </div>

                <h3 style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-main)', marginBottom: 8, lineHeight: 1.4 }}>
                  {post.title}
                </h3>

                <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 12, lineHeight: 1.5 }}>
                  {post.content.slice(0, 150)}...
                </p>

                <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 12, color: 'var(--text-muted)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <ThumbsUp size={14} /> {post.upvotes} kura
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <MessageCircle size={14} /> {post.commentsCount} majibu
                  </span>
                </div>
              </div>

              {/* Remove Bookmark Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleBookmark(post.id);
                }}
                title="Ondoa kwenye orodha ya kusoma"
                style={{
                  padding: 8,
                  borderRadius: 8,
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.2)',
                  color: '#ef4444',
                  cursor: 'pointer',
                  flexShrink: 0,
                }}
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

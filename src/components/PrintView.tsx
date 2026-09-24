import React from 'react';
import { Printer, X } from 'lucide-react';
import { Post } from '../types';
import { formatDate } from '../utils/data';

interface PrintViewProps {
  post: Post;
  onClose: () => void;
}

export const PrintView: React.FC<PrintViewProps> = ({ post, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="glass-card"
        style={{
          width: '100%',
          maxWidth: 800,
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
          padding: 16,
          borderBottom: '1px solid rgba(51, 65, 85, 0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Printer size={20} color="#a5b4fc" />
            <h3 style={{ fontSize: 16, fontWeight: 600, margin: 0 }}>Print Preview</h3>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={handlePrint}
              className="btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: 8 }}
            >
              <Printer size={16} />
              Chapisha
            </button>
            <button
              onClick={onClose}
              style={{
                padding: 8,
                borderRadius: 8,
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              <X size={20} color="#cbd5e1" />
            </button>
          </div>
        </div>

        {/* Print Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 32 }}>
          <div id="print-content" style={{ background: 'white', color: 'black', padding: 40 }}>
            {/* Header */}
            <div style={{ marginBottom: 32, borderBottom: '2px solid #6366f1', paddingBottom: 16 }}>
              <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8, color: '#0f172a' }}>
                {post.title}
              </h1>
              <div style={{ display: 'flex', gap: 16, fontSize: 14, color: '#64748b' }}>
                <span>By {post.author.username}</span>
                <span>•</span>
                <span>{formatDate(post.createdAt)}</span>
                <span>•</span>
                <span>{post.category}</span>
              </div>
            </div>

            {/* Content */}
            <div style={{ marginBottom: 32 }}>
              <div 
                style={{ fontSize: 16, lineHeight: 1.8, color: '#1e293b' }}
                dangerouslySetInnerHTML={{ __html: post.content }}
              />
            </div>

            {/* Tags */}
            {post.tags.length > 0 && (
              <div style={{ marginBottom: 32 }}>
                <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, color: '#64748b' }}>
                  Tags
                </h3>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      style={{
                        padding: '6px 12px',
                        borderRadius: 20,
                        background: '#f1f5f9',
                        border: '1px solid #e2e8f0',
                        fontSize: 13,
                        color: '#475569',
                      }}
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Stats */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 16,
              padding: 24,
              background: '#f8fafc',
              borderRadius: 12,
              marginBottom: 32,
            }}>
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: 24, fontWeight: 700, color: '#6366f1', marginBottom: 4 }}>
                  {post.upvotes}
                </p>
                <p style={{ fontSize: 13, color: '#64748b' }}>Upvotes</p>
              </div>
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: 24, fontWeight: 700, color: '#6366f1', marginBottom: 4 }}>
                  {post.commentsCount}
                </p>
                <p style={{ fontSize: 13, color: '#64748b' }}>Comments</p>
              </div>
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: 24, fontWeight: 700, color: '#6366f1', marginBottom: 4 }}>
                  {post.views}
                </p>
                <p style={{ fontSize: 13, color: '#64748b' }}>Views</p>
              </div>
            </div>

            {/* Footer */}
            <div style={{
              marginTop: 48,
              paddingTop: 16,
              borderTop: '1px solid #e2e8f0',
              textAlign: 'center',
              fontSize: 12,
              color: '#94a3b8',
            }}>
              <p>Chapishwa kutoka Nijuze - {new Date().toLocaleDateString('sw-TZ')}</p>
              <p>https://nijuze.com/post/{post.id}</p>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #print-content, #print-content * {
            visibility: visible;
          }
          #print-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

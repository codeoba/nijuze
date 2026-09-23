import React, { useState } from 'react';
import {
  X, MessageCircle, ThumbsUp, ThumbsDown, Share2, Bold, Italic, Code, Image,
  Send, CheckCircle2, Users, BookOpen, ChevronDown
} from 'lucide-react';
import { Post } from '../types';
import { useApp } from '../contexts/AppContext';
import { formatDate } from '../utils/data';

interface PostDetailModalProps {
  post: Post | null;
  onClose: () => void;
}

export const PostDetailModal: React.FC<PostDetailModalProps> = ({ post, onClose }) => {
  const { comments, addComment, upvoteComment, downvoteComment, markBestAnswer, users, isAuthenticated, currentUser, incrementViews } = useApp();
  const [commentText, setCommentText] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'best'>('best');

  if (!post) return null;

  const postComments = comments[post.id] || [];
  
  const sortedComments = [...postComments].sort((a, b) => {
    if (sortBy === 'best') {
      if (a.isBestAnswer) return -1;
      if (b.isBestAnswer) return 1;
      return b.upvotes - a.upvotes;
    }
    if (sortBy === 'newest') {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  });

  const handleSubmitComment = () => {
    if (!commentText.trim() || !isAuthenticated) return;
    addComment(post.id, commentText);
    setCommentText('');
  };

  // Increment views when modal opens
  React.useEffect(() => {
    incrementViews(post.id);
  }, [post.id]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="glass-card"
        style={{
          width: '100%', maxWidth: 768, margin: '0 16px',
          maxHeight: '90vh', overflowY: 'auto'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          position: 'sticky', top: 0, background: 'rgba(15, 23, 42, 0.95)',
          backdropFilter: 'blur(12px)', padding: 16,
          borderBottom: '1px solid rgba(51, 65, 85, 0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 10
        }}>
          <h3 style={{ fontSize: 14, fontWeight: 600 }}>Mazungumzo</h3>
          <button
            onClick={onClose}
            style={{ padding: 8, borderRadius: 8, background: 'transparent', border: 'none', cursor: 'pointer' }}
          >
            <X size={20} color="#cbd5e1" />
          </button>
        </div>

        <div style={{ padding: 24 }}>
          {/* Post Content */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div className="avatar-ring">
                <div style={{
                  width: 40, height: 40, borderRadius: '50%',
                  background: 'linear-gradient(135deg, #6366f1, #9333ea)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 14, fontWeight: 'bold'
                }}>
                  {post.author.avatar}
                </div>
              </div>
              <div>
                <h4 style={{ fontSize: 14, fontWeight: 600 }}>{post.author.username}</h4>
                <p style={{ fontSize: 12, color: '#94a3b8' }}>{post.author.role} • {formatDate(post.createdAt)}</p>
              </div>
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 16 }}>{post.title}</h2>
            <p style={{ color: '#cbd5e1', lineHeight: 1.7, marginBottom: 16, whiteSpace: 'pre-wrap' }}>
              {post.content}
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
              {post.tags.map((tag) => <span key={tag} className="tag">#{tag}</span>)}
            </div>
          </div>

          {/* Comments Section */}
          <div style={{ borderTop: '1px solid rgba(51, 65, 85, 0.3)', paddingTop: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <h4 style={{ fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
                <MessageCircle size={16} color="#818cf8" />
                Majibu ({postComments.length})
              </h4>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                style={{
                  padding: '6px 12px', borderRadius: 8,
                  background: 'rgba(30, 41, 59, 0.5)',
                  border: '1px solid rgba(51, 65, 85, 0.5)',
                  color: '#cbd5e1', fontSize: 13
                }}
              >
                <option value="best">Bora zaidi</option>
                <option value="newest">Mpya zaidi</option>
                <option value="oldest">Ya zamani</option>
              </select>
            </div>

            {/* Comments List */}
            {sortedComments.map((comment) => (
              <div
                key={comment.id}
                style={{
                  display: 'flex', gap: 12, marginBottom: 16, padding: 12,
                  borderRadius: 12,
                  background: comment.isBestAnswer ? 'rgba(99, 102, 241, 0.1)' : 'rgba(30, 41, 59, 0.2)',
                  border: comment.isBestAnswer ? '1px solid rgba(99, 102, 241, 0.3)' : 'none'
                }}
              >
                <div style={{
                  width: 32, height: 32, borderRadius: '50%',
                  background: 'linear-gradient(135deg, #10b981, #0d9488)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, fontWeight: 'bold', flexShrink: 0
                }}>
                  {comment.author.avatar}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 14, fontWeight: 500 }}>{comment.author.username}</span>
                    {comment.isBestAnswer && (
                      <span style={{
                        display: 'flex', alignItems: 'center', gap: 4, fontSize: 11,
                        background: 'rgba(99, 102, 241, 0.2)', color: '#a5b4fc',
                        padding: '2px 8px', borderRadius: 12
                      }}>
                        <CheckCircle2 size={10} /> Jibu Bora
                      </span>
                    )}
                    <span style={{ fontSize: 12, color: '#64748b' }}>{formatDate(comment.createdAt)}</span>
                  </div>
                  <p style={{ fontSize: 14, color: '#cbd5e1', lineHeight: 1.5 }}>{comment.content}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 8 }}>
                    <button
                      className={`tool-btn ${comment.isUpvoted ? 'active' : ''}`}
                      style={{ fontSize: 12, padding: '4px 8px' }}
                      onClick={() => upvoteComment(post.id, comment.id)}
                    >
                      <ThumbsUp size={12} /> {comment.upvotes}
                    </button>
                    <button
                      className={`tool-btn ${comment.isDownvoted ? 'active' : ''}`}
                      style={{ fontSize: 12, padding: '4px 8px' }}
                      onClick={() => downvoteComment(post.id, comment.id)}
                    >
                      <ThumbsDown size={12} /> {comment.downvotes}
                    </button>
                    <button className="tool-btn" style={{ fontSize: 12, padding: '4px 8px' }}>
                      <MessageCircle size={12} /> Jibu
                    </button>
                    {isAuthenticated && currentUser?.id === post.authorId && (
                      <button
                        className="tool-btn"
                        style={{ fontSize: 12, padding: '4px 8px' }}
                        onClick={() => markBestAnswer(post.id, comment.id)}
                      >
                        <CheckCircle2 size={12} /> {comment.isBestAnswer ? 'Ondoa Best' : 'Weka Best'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {postComments.length === 0 && (
              <div style={{ textAlign: 'center', padding: 32, color: '#64748b' }}>
                <MessageCircle size={32} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
                <p style={{ fontSize: 14 }}>Bado hakuna majibu. Kuwa wa kwanza kujibu!</p>
              </div>
            )}

            {/* Comment Input */}
            {isAuthenticated ? (
              <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: '50%',
                  background: 'linear-gradient(135deg, #6366f1, #9333ea)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, fontWeight: 'bold', flexShrink: 0
                }}>
                  {currentUser?.avatar}
                </div>
                <div style={{ flex: 1 }}>
                  <textarea
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Andika jibu lako..."
                    style={{
                      width: '100%', padding: 12, borderRadius: 12,
                      background: 'rgba(30, 41, 59, 0.5)',
                      border: '1px solid rgba(51, 65, 85, 0.5)',
                      color: '#e2e8f0', fontSize: 14, resize: 'none', height: 80
                    }}
                  />
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button style={{ padding: 6, borderRadius: 4, background: 'transparent', border: 'none', cursor: 'pointer' }}><Bold size={16} color="#94a3b8" /></button>
                      <button style={{ padding: 6, borderRadius: 4, background: 'transparent', border: 'none', cursor: 'pointer' }}><Italic size={16} color="#94a3b8" /></button>
                      <button style={{ padding: 6, borderRadius: 4, background: 'transparent', border: 'none', cursor: 'pointer' }}><Code size={16} color="#94a3b8" /></button>
                      <button style={{ padding: 6, borderRadius: 4, background: 'transparent', border: 'none', cursor: 'pointer' }}><Image size={16} color="#94a3b8" /></button>
                    </div>
                    <button
                      className="btn-primary"
                      style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, padding: '8px 16px' }}
                      onClick={handleSubmitComment}
                      disabled={!commentText.trim()}
                    >
                      <Send size={14} /> Tuma
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{
                marginTop: 16, padding: 16, borderRadius: 12,
                background: 'rgba(99, 102, 241, 0.05)',
                border: '1px solid rgba(99, 102, 241, 0.2)',
                textAlign: 'center'
              }}>
                <p style={{ fontSize: 14, color: '#94a3b8' }}>
                  Ingia ili uweze kujibu maswali
                </p>
              </div>
            )}

            {/* Related Questions */}
            <div style={{ marginTop: 24, padding: 16, borderRadius: 12, background: 'rgba(30, 41, 59, 0.2)' }}>
              <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                <BookOpen size={16} color="#818cf8" /> Maswali Yanayohusiana
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
                <Users size={16} color="#818cf8" /> Kuhusu Mwandishi
              </h4>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div className="avatar-ring">
                  <div style={{
                    width: 48, height: 48, borderRadius: '50%',
                    background: 'linear-gradient(135deg, #6366f1, #9333ea)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 16, fontWeight: 'bold'
                  }}>
                    {post.author.avatar}
                  </div>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: 15, fontWeight: 600 }}>{post.author.username}</span>
                    {post.author.isVerified && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#34d399' }}>
                        <CheckCircle2 size={12} /> Verified
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize: 13, color: '#94a3b8', marginBottom: 8 }}>{post.author.bio}</p>
                  <div style={{ display: 'flex', gap: 16, fontSize: 12, color: '#64748b' }}>
                    <span><strong style={{ color: '#cbd5e1' }}>{post.author.postsCount}</strong> posts</span>
                    <span><strong style={{ color: '#cbd5e1' }}>{post.author.followers}</strong> followers</span>
                    <span><strong style={{ color: '#cbd5e1' }}>{post.author.following}</strong> following</span>
                  </div>
                </div>
                <button className="btn-primary" style={{ fontSize: 13, padding: '8px 16px' }}>Fuata</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

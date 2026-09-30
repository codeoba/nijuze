import React, { useState, useEffect } from 'react';
import { X, MessageCircle, ThumbsUp, ThumbsDown, Bookmark, Share2, Send, CheckCircle2, Award, Trash2 } from 'lucide-react';
import { Post, Comment } from '../types';
import { useApp } from '../contexts/AppContext';
import { formatDate } from '../utils/data';
import { CommentRichEditor, CommentContent } from './CommentRichEditor';
import { UserAvatar } from './UserAvatar';

interface PostDetailModalProps {
  post: Post | null;
  onClose: () => void;
}

export const PostDetailModal: React.FC<PostDetailModalProps> = ({ post, onClose }) => {
  const {
    getCommentsByPost,
    addComment,
    deleteComment,
    markBestAnswer,
    upvoteComment,
    upvotePost,
    downvotePost,
    toggleBookmark,
    isAuthenticated,
    currentUser,
    incrementViews,
    posts
  } = useApp();

  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState<Comment[]>([]);
  const [copied, setCopied] = useState(false);

  // Sync active post data from state for real-time votes/bookmarks
  const currentPost = posts.find(p => p.id === post?.id) || post;

  useEffect(() => {
    if (post) {
      setComments(getCommentsByPost(post.id));
      incrementViews(post.id);
    }
  }, [post?.id, getCommentsByPost]);

  if (!currentPost) return null;

  const handleSubmitComment = async () => {
    if (!commentText.trim() || !isAuthenticated) return;
    const newComment = await addComment(currentPost.id, commentText.trim());
    if (newComment) {
      setComments(prev => [newComment, ...prev]);
      setCommentText('');
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: currentPost.title,
        text: currentPost.content.slice(0, 100),
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const isAuthor = currentUser?.id === currentPost.authorId;

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
        <div style={{
          position: 'sticky', top: 0, background: 'var(--header-bg)',
          backdropFilter: 'blur(12px)', padding: 16,
          borderBottom: '1px solid var(--border-app)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 10
        }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-main)' }}>Mazungumzo</h3>
          <button
            onClick={onClose}
            style={{ padding: 8, borderRadius: 8, background: 'transparent', border: 'none', cursor: 'pointer' }}
          >
            <X size={20} color="var(--text-muted)" />
          </button>
        </div>

        <div style={{ padding: 24 }}>
          {/* Post Header */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div className="avatar-ring" style={{ padding: 2 }}>
                <UserAvatar avatar={currentPost.author?.avatar} username={currentPost.author?.username} size={40} />
              </div>
              <div>
                <h4 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-main)' }}>{currentPost.author.username}</h4>
                <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{currentPost.author.role} • {formatDate(currentPost.createdAt)}</p>
              </div>
            </div>

            <h2 style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 16, color: 'var(--text-main)' }}>
              {currentPost.title}
            </h2>

            <p style={{ color: 'var(--text-body)', lineHeight: 1.7, marginBottom: 16, whiteSpace: 'pre-wrap' }}>
              {currentPost.content}
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
              {currentPost.tags.map((tag) => <span key={tag} className="tag">#{tag}</span>)}
            </div>

            {/* Interaction Bar */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '12px 16px', borderRadius: 12,
              background: 'var(--bg-subtle)', border: '1px solid var(--border-app)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <button
                  onClick={() => upvotePost(currentPost.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '6px 12px', borderRadius: 8, border: 'none', cursor: 'pointer',
                    background: currentPost.isUpvoted ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
                    color: currentPost.isUpvoted ? '#818cf8' : 'var(--text-muted)',
                    fontWeight: 500, fontSize: 13
                  }}
                >
                  <ThumbsUp size={16} />
                  <span>{currentPost.upvotes}</span>
                </button>

                <button
                  onClick={() => downvotePost(currentPost.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '6px 12px', borderRadius: 8, border: 'none', cursor: 'pointer',
                    background: currentPost.isDownvoted ? 'rgba(239, 68, 68, 0.2)' : 'transparent',
                    color: currentPost.isDownvoted ? '#f87171' : '#94a3b8',
                    fontWeight: 500, fontSize: 13
                  }}
                >
                  <ThumbsDown size={16} />
                  <span>{currentPost.downvotes}</span>
                </button>

                <button
                  onClick={() => toggleBookmark(currentPost.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '6px 12px', borderRadius: 8, border: 'none', cursor: 'pointer',
                    background: currentPost.isBookmarked ? 'rgba(234, 179, 8, 0.2)' : 'transparent',
                    color: currentPost.isBookmarked ? '#facc15' : '#94a3b8',
                    fontWeight: 500, fontSize: 13
                  }}
                >
                  <Bookmark size={16} />
                  <span>{currentPost.bookmarks || 0}</span>
                </button>
              </div>

              <button
                onClick={handleShare}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '6px 12px', borderRadius: 8, border: 'none', cursor: 'pointer',
                  background: 'transparent', color: copied ? '#34d399' : '#94a3b8',
                  fontSize: 13
                }}
              >
                <Share2 size={16} />
                <span>{copied ? 'Imenakiliwa!' : 'Shiriki'}</span>
              </button>
            </div>
          </div>

          {/* Comments Section */}
          <div style={{ borderTop: '1px solid var(--border-app)', paddingTop: 16 }}>
            <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-main)' }}>
              <MessageCircle size={16} color="#818cf8" />
              Majibu ({comments.length})
            </h4>

            {comments.map((comment) => (
              <div
                key={comment.id}
                style={{
                  display: 'flex', gap: 12, marginBottom: 16, padding: 14,
                  borderRadius: 12,
                  background: comment.isBestAnswer ? 'rgba(99, 102, 241, 0.12)' : 'var(--bg-subtle)',
                  border: comment.isBestAnswer ? '1px solid rgba(99, 102, 241, 0.4)' : '1px solid var(--border-app)'
                }}
              >
                <UserAvatar avatar={comment.author?.avatar} username={comment.author?.username} size={32} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4, flexWrap: 'wrap', gap: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-main)' }}>{comment.author.username}</span>
                      {comment.isBestAnswer && (
                        <span style={{
                          display: 'flex', alignItems: 'center', gap: 4, fontSize: 11,
                          background: 'var(--btn-ghost-bg)', color: 'var(--btn-ghost-text)',
                          padding: '2px 8px', borderRadius: 12, fontWeight: 600
                        }}>
                          <CheckCircle2 size={12} /> Jibu Bora
                        </span>
                      )}
                      <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{formatDate(comment.createdAt)}</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {/* Best Answer Toggle (if post author or admin) */}
                      {(isAuthor || currentUser?.role === 'Admin') && (
                        <button
                          onClick={() => markBestAnswer(comment.id, currentPost.id)}
                          title={comment.isBestAnswer ? 'Ondoa Jibu Bora' : 'Weka kama Jibu Bora'}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 4,
                            padding: '3px 8px', borderRadius: 6, fontSize: 11, cursor: 'pointer',
                            background: comment.isBestAnswer ? 'var(--btn-ghost-bg)' : 'var(--bg-subtle)',
                            color: comment.isBestAnswer ? 'var(--btn-ghost-text)' : 'var(--text-muted)',
                            border: '1px solid var(--border-app)'
                          }}
                        >
                          <Award size={12} />
                          {comment.isBestAnswer ? 'Chaguo lako' : 'Weka Jibu Bora'}
                        </button>
                      )}

                      {/* Delete comment if author */}
                      {(currentUser?.id === comment.authorId || currentUser?.role === 'Admin') && (
                        <button
                          onClick={() => {
                            deleteComment(comment.id);
                            setComments(prev => prev.filter(c => c.id !== comment.id));
                          }}
                          style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 2, color: 'var(--text-muted)' }}
                          title="Futa jibu"
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  </div>

                  <CommentContent content={comment.content} />

                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <button
                      onClick={() => upvoteComment(comment.id)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 4,
                        background: 'transparent', border: 'none', cursor: 'pointer',
                        color: 'var(--text-muted)', fontSize: 12
                      }}
                    >
                      <ThumbsUp size={12} />
                      <span>{comment.upvotes || 0}</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {comments.length === 0 && (
              <div style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)' }}>
                <MessageCircle size={32} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
                <p style={{ fontSize: 14 }}>Bado hakuna majibu. Kuwa wa kwanza kujibu!</p>
              </div>
            )}

            {/* Answer Input using Rich Text Editor */}
            {isAuthenticated ? (
              <div style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid var(--border-app)' }}>
                <h4 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-main)', marginBottom: 12 }}>
                  Weka Jibu au Maoni Yako:
                </h4>
                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <UserAvatar avatar={currentUser?.avatar} username={currentUser?.username} size={36} />
                  <div style={{ flex: 1 }}>
                    <CommentRichEditor
                      value={commentText}
                      onChange={setCommentText}
                      onSubmit={handleSubmitComment}
                      placeholder="Andika jibu lako (tumia Bold, Italic, Code, Nukuu, Orodha, n.k)..."
                      submitLabel="Tuma Jibu"
                      minHeight={85}
                    />
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
                <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>
                  Ingia ili uweze kujibu maswali
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

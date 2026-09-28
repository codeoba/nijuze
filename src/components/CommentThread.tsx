import React, { useState } from 'react';
import { ThumbsUp, ThumbsDown, MessageCircle, Reply, CheckCircle2, MoreHorizontal } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { Comment } from '../types';
import { formatDate } from '../utils/data';
import { CommentRichEditor, CommentContent } from './CommentRichEditor';

interface CommentThreadProps {
  comment: Comment;
  postId: string;
  depth?: number;
  maxDepth?: number;
}

export const CommentThread: React.FC<CommentThreadProps> = ({ 
  comment, 
  postId, 
  depth = 0, 
  maxDepth = 5 
}) => {
  const { currentUser, addComment } = useApp();
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [showReplies, setShowReplies] = useState(true);

  const handleReply = () => {
    if (!replyText.trim() || !currentUser) return;
    addComment(postId, replyText);
    setReplyText('');
    setShowReplyForm(false);
  };

  return (
    <div style={{ marginLeft: depth > 0 ? 24 : 0 }}>
      {/* Comment Card */}
      <div
        style={{
          padding: 16,
          borderRadius: 12,
          background: comment.isBestAnswer ? 'rgba(99, 102, 241, 0.1)' : 'rgba(30, 41, 59, 0.2)',
          border: comment.isBestAnswer ? '1px solid rgba(99, 102, 241, 0.3)' : '1px solid rgba(51, 65, 85, 0.2)',
          marginBottom: 12,
        }}
      >
        {/* Comment Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
          <div style={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #6366f1, #9333ea)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 14,
            fontWeight: 'bold',
            color: 'white',
            flexShrink: 0,
          }}>
            {comment.author.avatar}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-main)' }}>
                {comment.author.username}
              </span>
              {comment.isBestAnswer && (
                <span style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  padding: '2px 8px',
                  borderRadius: 12,
                  background: 'rgba(99, 102, 241, 0.2)',
                  color: 'var(--btn-ghost-text)',
                  fontSize: 11,
                  fontWeight: 600,
                }}>
                  <CheckCircle2 size={10} /> Jibu Bora
                </span>
              )}
              <span style={{ fontSize: 12, color: '#64748b' }}>
                {formatDate(comment.createdAt)}
              </span>
            </div>
          </div>
          <button style={{
            padding: 6,
            borderRadius: 6,
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
          }}>
            <MoreHorizontal size={16} color="#64748b" />
          </button>
        </div>

        {/* Comment Content */}
        <CommentContent content={comment.content} />

        {/* Comment Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            className={`tool-btn ${comment.isUpvoted ? 'active' : ''}`}
            style={{ fontSize: 12, padding: '4px 8px' }}
          >
            <ThumbsUp size={14} />
            <span>{comment.upvotes}</span>
          </div>
          <div
            className={`tool-btn ${comment.isDownvoted ? 'active' : ''}`}
            style={{ fontSize: 12, padding: '4px 8px' }}
          >
            <ThumbsDown size={14} />
            <span>{comment.downvotes}</span>
          </div>
          {depth < maxDepth && (
            <button
              onClick={() => setShowReplyForm(!showReplyForm)}
              className="tool-btn"
              style={{ fontSize: 12, padding: '4px 8px' }}
            >
              <Reply size={14} />
              <span>Jibu</span>
            </button>
          )}
        </div>

        {/* Reply Form using Rich Text Editor */}
        {showReplyForm && (
          <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border-app)' }}>
            <CommentRichEditor
              value={replyText}
              onChange={setReplyText}
              onSubmit={handleReply}
              onCancel={() => setShowReplyForm(false)}
              placeholder="Andika jibu lako (tumia Bold, Italic, Code, Nukuu, n.k)..."
              submitLabel="Tuma Jibu"
              minHeight={70}
            />
          </div>
        )}
      </div>

      {/* Nested Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div style={{ marginTop: 8 }}>
          {showReplies ? (
            <>
              {comment.replies.map((reply) => (
                <CommentThread
                  key={reply.id}
                  comment={reply}
                  postId={postId}
                  depth={depth + 1}
                  maxDepth={maxDepth}
                />
              ))}
              <button
                onClick={() => setShowReplies(false)}
                style={{
                  marginLeft: 24,
                  padding: '6px 12px',
                  borderRadius: 8,
                  background: 'transparent',
                  border: 'none',
                  color: '#818cf8',
                  cursor: 'pointer',
                  fontSize: 13,
                  fontWeight: 500,
                }}
              >
                Ficha majibu ({comment.replies.length})
              </button>
            </>
          ) : (
            <button
              onClick={() => setShowReplies(true)}
              style={{
                marginLeft: 24,
                padding: '6px 12px',
                borderRadius: 8,
                background: 'rgba(99, 102, 241, 0.1)',
                border: '1px solid rgba(99, 102, 241, 0.2)',
                color: 'var(--btn-ghost-text)',
                cursor: 'pointer',
                fontSize: 13,
                fontWeight: 500,
              }}
            >
              Onyesha majibu ({comment.replies.length})
            </button>
          )}
        </div>
      )}
    </div>
  );
};

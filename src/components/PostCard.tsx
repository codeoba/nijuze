import React, { useState } from 'react';
import {
  ThumbsUp, ThumbsDown, MessageCircle, Share2, Bookmark, MoreHorizontal,
  Eye, Clock, Pin, CheckCircle2, Globe, Copy, Download, Flag,
  ExternalLink, Heart, Users
} from 'lucide-react';
import { Post } from '../types';
import { useApp } from '../contexts/AppContext';
import { formatDate } from '../utils/data';

interface PostCardProps {
  post: Post;
  onExpand: (post: Post) => void;
}

export const PostCard: React.FC<PostCardProps> = ({ post, onExpand }) => {
  const { upvotePost, downvotePost, toggleBookmark, addReaction, isAuthenticated } = useApp();
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.origin + '/post/' + post.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    setShowMoreOptions(false);
  };

  const handleReaction = (emoji: string) => {
    if (!isAuthenticated) return;
    addReaction(post.id, emoji);
    setShowReactionPicker(false);
  };

  const handleUpvote = () => {
    if (!isAuthenticated) return;
    upvotePost(post.id);
  };

  const handleDownvote = () => {
    if (!isAuthenticated) return;
    downvotePost(post.id);
  };

  const handleBookmark = () => {
    if (!isAuthenticated) return;
    toggleBookmark(post.id);
  };

  const totalReactions = Object.values(post.reactions).reduce((sum, arr) => sum + arr.length, 0);

  return (
    <article className="glass-card" style={{ padding: 20, marginBottom: 16, position: 'relative' }}>
      {post.isPinned && (
        <div style={{ position: 'absolute', top: -8, left: 16 }}>
          <span style={{
            display: 'flex', alignItems: 'center', gap: 4, fontSize: 12,
            background: 'rgba(245, 158, 11, 0.15)', color: '#d97706',
            padding: '4px 8px', borderRadius: 20, border: '1px solid rgba(245, 158, 11, 0.3)',
            fontWeight: 600
          }}>
            <Pin size={12} /> Pinned
          </span>
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div className="avatar-ring">
            <div style={{
              width: 40, height: 40, borderRadius: '50%',
              background: 'linear-gradient(135deg, #6366f1, #9333ea)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 14, fontWeight: 'bold'
            }}>
              {post.isAnonymous ? '?' : post.author.avatar}
            </div>
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <h4 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-main)' }}>
                {post.isAnonymous ? 'Anonymous' : post.author.username}
              </h4>
              {post.author.isVerified && (
                <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#34d399' }}>
                  <CheckCircle2 size={12} /> Verified
                </span>
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--text-muted)' }}>
              <span>{post.author.role}</span>
              <span>•</span>
              <span>{formatDate(post.createdAt)}</span>
              <span>•</span>
              <Globe size={12} />
            </div>
          </div>
        </div>
        <div style={{ position: 'relative' }}>
          <button
            className="tool-btn"
            onClick={() => setShowMoreOptions(!showMoreOptions)}
          >
            <MoreHorizontal size={16} />
          </button>
          {showMoreOptions && (
            <div
              className="glass-card"
              style={{
                position: 'absolute', right: 0, top: 40, width: 200,
                padding: 8, zIndex: 20
              }}
            >
              {[
                { icon: Share2, label: 'Shiriki', action: () => setShowMoreOptions(false) },
                { icon: Bookmark, label: post.isBookmarked ? 'Ondoa Bookmark' : 'Hifadhi', action: () => { handleBookmark(); setShowMoreOptions(false); } },
                { icon: Copy, label: copied ? 'Imenakiliwa!' : 'Nakili Link', action: handleCopyLink },
                { icon: ExternalLink, label: 'Fungua', action: () => { onExpand(post); setShowMoreOptions(false); } },
                { icon: Download, label: 'Pakua', action: () => setShowMoreOptions(false) },
                { icon: Flag, label: 'Ripoti', action: () => setShowMoreOptions(false) },
              ].map((item, i) => (
                <button
                  key={i}
                  onClick={item.action}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '8px 12px', borderRadius: 8, width: '100%',
                    background: 'transparent', border: 'none',
                    color: 'var(--text-body)', cursor: 'pointer', fontSize: 14
                  }}
                >
                  <item.icon size={16} />
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Title */}
      <h2
        style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 12, cursor: 'pointer', lineHeight: 1.5, color: 'var(--text-main)' }}
        onClick={() => onExpand(post)}
      >
        {post.title}
      </h2>

      {/* Content Preview */}
      {post.content && (
        <div style={{
          marginBottom: 16, padding: 16, borderRadius: 12,
          background: 'var(--bg-subtle)', border: '1px solid var(--border-app)'
        }}>
          <p style={{
            fontSize: 14, color: 'var(--text-body)', lineHeight: 1.6,
            display: '-webkit-box', WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical', overflow: 'hidden'
          }}>
            {post.content}
          </p>
          <button
            onClick={() => onExpand(post)}
            style={{
              fontSize: 12, color: 'var(--border-focus)', marginTop: 8,
              background: 'transparent', border: 'none',
              cursor: 'pointer', fontWeight: 600
            }}
          >
            Soma zaidi →
          </button>
        </div>
      )}

      {/* Tags */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
        {post.tags.map((tag) => (
          <span key={tag} className="tag">#{tag}</span>
        ))}
      </div>

      {/* Stats */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 16, fontSize: 12,
        color: 'var(--text-muted)', marginBottom: 16, paddingBottom: 12,
        borderBottom: '1px solid var(--border-app)'
      }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <Eye size={14} />{post.views.toLocaleString()} views
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <MessageCircle size={14} />{post.commentsCount} majibu
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <Clock size={14} />{formatDate(post.createdAt)}
        </span>
      </div>

      {/* Reactions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
        {Object.entries(post.reactions).map(([emoji, userIds]) => (
          <button
            key={emoji}
            className="reaction-btn"
            onClick={() => handleReaction(emoji)}
            style={{
              background: userIds.includes('currentUser') ? 'var(--btn-ghost-bg)' : undefined,
              borderColor: userIds.includes('currentUser') ? 'var(--btn-ghost-border)' : undefined,
              color: userIds.includes('currentUser') ? 'var(--btn-ghost-text)' : undefined,
            }}
          >
            <span>{emoji}</span>
            <span style={{ fontSize: 12 }}>{userIds.length}</span>
          </button>
        ))}
        <div style={{ position: 'relative' }}>
          <button
            className="reaction-btn"
            onClick={() => setShowReactionPicker(!showReactionPicker)}
            title="Ongeza reaction"
          >
            <span>+</span>
          </button>
          {showReactionPicker && (
            <div
              className="glass-card"
              style={{
                position: 'absolute', bottom: '100%', left: 0, marginBottom: 8,
                padding: 8, display: 'flex', gap: 4, zIndex: 20
              }}
            >
              {['🔥', '💡', '❤️', '👏', '😮', '🎉', '🤔', '💯'].map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => handleReaction(emoji)}
                  style={{
                    width: 32, height: 32, borderRadius: 8,
                    background: 'transparent', border: 'none',
                    cursor: 'pointer', fontSize: 18,
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}
        </div>
        {totalReactions > 0 && (
          <span style={{ fontSize: 12, color: '#64748b', marginLeft: 4 }}>
            {totalReactions} reactions
          </span>
        )}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
          <button className="tool-btn" style={{ fontSize: 12 }} title="Penda">
            <Heart size={14} />
          </button>
          <button className="tool-btn" style={{ fontSize: 12 }} title="Fuata mwandishi">
            <Users size={14} /> Fuata
          </button>
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <button
            onClick={handleUpvote}
            className={`tool-btn ${post.isUpvoted ? 'active' : ''}`}
            style={{ opacity: isAuthenticated ? 1 : 0.5 }}
          >
            <ThumbsUp size={16} />
            <span style={{ fontSize: 12, fontWeight: 500 }}>{post.upvotes}</span>
          </button>
          <button
            onClick={handleDownvote}
            className={`tool-btn ${post.isDownvoted ? 'active' : ''}`}
            style={{ opacity: isAuthenticated ? 1 : 0.5 }}
          >
            <ThumbsDown size={16} />
            <span style={{ fontSize: 12, fontWeight: 500 }}>{post.downvotes}</span>
          </button>
          <button className="tool-btn" onClick={() => onExpand(post)}>
            <MessageCircle size={16} />
            <span style={{ fontSize: 12 }}>{post.commentsCount}</span>
          </button>
          <button className="tool-btn">
            <Share2 size={16} />
            <span style={{ fontSize: 12 }}>{post.shares}</span>
          </button>
          <button
            onClick={handleBookmark}
            className={`tool-btn ${post.isBookmarked ? 'active' : ''}`}
            style={{ opacity: isAuthenticated ? 1 : 0.5 }}
          >
            <Bookmark size={16} fill={post.isBookmarked ? 'currentColor' : 'none'} />
            <span style={{ fontSize: 12 }}>{post.bookmarks}</span>
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <button className="tool-btn" onClick={handleCopyLink}>
            <Copy size={16} />
          </button>
          <button className="tool-btn">
            <Download size={16} />
          </button>
          <button className="tool-btn">
            <Flag size={16} />
          </button>
        </div>
      </div>
    </article>
  );
};

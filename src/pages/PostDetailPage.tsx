import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from '../router/Router';
import { useApp } from '../contexts/AppContext';
import { formatDate } from '../utils/data';
import { Post, Comment } from '../types';
import { CommentRichEditor, CommentContent } from '../components/CommentRichEditor';
import { UserAvatar } from '../components/UserAvatar';
import {
  ArrowLeft, ThumbsUp, ThumbsDown, Bookmark, Share2, MessageCircle,
  CheckCircle2, Award, Trash2, Clock, Eye, Tag, AlertCircle,
  HelpCircle, User as UserIcon, Send, Sparkles, Shield, ChevronRight
} from 'lucide-react';

export const PostDetailPage: React.FC = () => {
  const params = useParams();
  const { navigate, currentPath } = useRouter();

  // Extract ID from params or directly from pathname fallback
  const rawId = params.postId || params.id || currentPath.split('/')[2];

  const {
    posts,
    currentUser,
    isAuthenticated,
    getCommentsByPost,
    addComment,
    deleteComment,
    markBestAnswer,
    upvoteComment,
    upvotePost,
    downvotePost,
    toggleBookmark,
    incrementViews,
    deletePost,
    categories,
  } = useApp();

  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState<Comment[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [sortBy, setSortBy] = useState<'best' | 'latest' | 'votes'>('best');

  const post = posts.find((p) => p.id === rawId);

  useEffect(() => {
    if (rawId) {
      setComments(getCommentsByPost(rawId));
      incrementViews(rawId);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [rawId, getCommentsByPost, incrementViews]);

  if (!post) {
    return (
      <div style={{ maxWidth: 900, margin: '40px auto', padding: '0 16px' }}>
        <button
          onClick={() => navigate('/')}
          className="btn-ghost"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            marginBottom: 24,
            cursor: 'pointer',
          }}
        >
          <ArrowLeft size={16} /> Rudi Nyumbani
        </button>

        <div className="glass-card" style={{ padding: 48, textAlign: 'center' }}>
          <AlertCircle size={48} color="#ef4444" style={{ margin: '0 auto 16px' }} />
          <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-main)', marginBottom: 8 }}>
            Swali au Chapisho Halijapatikana
          </h2>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 24 }}>
            Huenda post hii imefutwa au kiungo ulichotumia sio sahihi.
          </p>
          <button onClick={() => navigate('/forum')} className="btn-primary" style={{ cursor: 'pointer' }}>
            Vinjari Mijadala Mingine
          </button>
        </div>
      </div>
    );
  }

  const isPostAuthor = currentUser?.id === post.authorId;
  const isUserAdmin = currentUser?.role === 'Admin';
  const hasBestAnswer = comments.some((c) => c.isBestAnswer);

  const handleSubmitComment = async () => {
    if (!commentText.trim() || !isAuthenticated) return;
    setIsSubmitting(true);
    try {
      const newComment = await addComment(post.id, commentText.trim());
      if (newComment) {
        setComments((prev) => [newComment, ...prev]);
        setCommentText('');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleShare = () => {
    const shareUrl = window.location.origin + '/post/' + post.id;
    if (navigator.share) {
      navigator.share({
        title: post.title,
        text: post.content.slice(0, 120),
        url: shareUrl,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleDeletePost = async () => {
    if (window.confirm('Una uhakika unataka kufuta swali/chapisho hili?')) {
      const success = await deletePost(post.id);
      if (success) {
        navigate('/');
      }
    }
  };

  // Sort comments: Best answer always top, then based on selection
  const sortedComments = [...comments].sort((a, b) => {
    if (a.isBestAnswer) return -1;
    if (b.isBestAnswer) return 1;
    if (sortBy === 'votes') return b.upvotes - a.upvotes;
    if (sortBy === 'latest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    return b.upvotes - a.upvotes; // default 'best'
  });

  // Related posts from same category or tags
  const relatedPosts = posts
    .filter((p) => p.id !== post.id && (p.category === post.category || p.tags.some((t) => post.tags.includes(t))))
    .slice(0, 4);

  return (
    <div style={{ maxWidth: 1140, margin: '0 auto', paddingBottom: 64 }}>
      {/* 1. Breadcrumbs & Back Navigation */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
          marginBottom: 20,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-muted)' }}>
          <button
            onClick={() => navigate('/')}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0 }}
          >
            Nyumbani
          </button>
          <ChevronRight size={14} />
          <button
            onClick={() => navigate('/forum')}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0 }}
          >
            Mijadala
          </button>
          {post.category && (
            <>
              <ChevronRight size={14} />
              <span style={{ color: 'var(--btn-ghost-text)', fontWeight: 600 }}>{post.category}</span>
            </>
          )}
        </div>

        <button
          onClick={() => navigate(-1 as any || navigate('/'))}
          className="btn-ghost"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 13,
            padding: '6px 12px',
            cursor: 'pointer',
          }}
        >
          <ArrowLeft size={16} /> Rudi Nyuma
        </button>
      </div>

      {/* 2. Main Two-Column Layout */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) 320px',
          gap: 24,
          alignItems: 'start',
        }}
        className="post-detail-grid"
      >
        {/* Left Column: Post Content & Comments */}
        <div>
          {/* Post Article Card */}
          <article className="glass-card" style={{ padding: 28, marginBottom: 24, position: 'relative' }}>
            {/* Top Badges & Category */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 14 }}>
              {post.category && (
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '4px 12px',
                    borderRadius: 20,
                    fontSize: 12,
                    fontWeight: 600,
                    background: 'rgba(99, 102, 241, 0.12)',
                    color: 'var(--btn-ghost-text)',
                    border: '1px solid rgba(99, 102, 241, 0.25)',
                  }}
                >
                  <Tag size={13} /> {post.category}
                </span>
              )}

              {hasBestAnswer && (
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                    padding: '4px 12px',
                    borderRadius: 20,
                    fontSize: 12,
                    fontWeight: 600,
                    background: 'rgba(16, 185, 129, 0.12)',
                    color: '#10b981',
                    border: '1px solid rgba(16, 185, 129, 0.25)',
                  }}
                >
                  <CheckCircle2 size={13} /> Swali Limejibiwa
                </span>
              )}
            </div>

            {/* Post Title */}
            <h1
              style={{
                fontSize: 26,
                fontWeight: 800,
                lineHeight: 1.4,
                color: 'var(--text-main)',
                marginBottom: 18,
                letterSpacing: '-0.3px',
              }}
            >
              {post.title}
            </h1>

            {/* Author Bar */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 12,
                paddingBottom: 18,
                borderBottom: '1px solid var(--border-app)',
                marginBottom: 20,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div 
                  style={{ cursor: 'pointer' }}
                  onClick={() => navigate(`/profile/${post.authorId}`)}
                >
                  <UserAvatar 
                    avatar={post.isAnonymous ? '?' : post.author?.avatar} 
                    username={post.isAnonymous ? '?' : post.author?.username} 
                    size={44} 
                  />
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span
                      onClick={() => navigate(`/profile/${post.authorId}`)}
                      style={{
                        fontSize: 15,
                        fontWeight: 700,
                        color: 'var(--text-main)',
                        cursor: 'pointer',
                      }}
                    >
                      {post.isAnonymous ? 'Mwanachama Asiyejulikana' : post.author.username}
                    </span>
                    {post.author.isVerified && (
                      <span
                        title="Akaunti Iliyohakikiwa"
                        style={{ display: 'inline-flex', alignItems: 'center', color: '#10b981' }}
                      >
                        <CheckCircle2 size={15} />
                      </span>
                    )}
                    <span
                      style={{
                        fontSize: 11,
                        padding: '2px 8px',
                        borderRadius: 6,
                        background: 'var(--bg-subtle)',
                        border: '1px solid var(--border-app)',
                        color: 'var(--text-muted)',
                        fontWeight: 600,
                      }}
                    >
                      {post.author.role || 'Mwanachama'}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Clock size={13} /> {formatDate(post.createdAt)}
                    </span>
                    <span>•</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Eye size={13} /> {post.views || 0} maoni
                    </span>
                  </div>
                </div>
              </div>

              {/* Author Actions (Delete Post) */}
              {(isPostAuthor || isUserAdmin) && (
                <button
                  onClick={handleDeletePost}
                  title="Futa Swali"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '6px 12px',
                    borderRadius: 8,
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.25)',
                    color: '#ef4444',
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  <Trash2 size={14} /> Futa
                </button>
              )}
            </div>

            {/* Post Body Content */}
            <div
              style={{
                fontSize: 15,
                lineHeight: 1.8,
                color: 'var(--text-main)',
                marginBottom: 24,
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
              }}
            >
              {post.content}
            </div>

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    onClick={() => navigate('/search')}
                    style={{
                      fontSize: 12,
                      padding: '4px 10px',
                      borderRadius: 8,
                      background: 'var(--bg-subtle)',
                      border: '1px solid var(--border-app)',
                      color: 'var(--btn-ghost-text)',
                      cursor: 'pointer',
                      fontWeight: 500,
                    }}
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Interactive Action Toolbar */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 18px',
                borderRadius: 14,
                background: 'var(--bg-subtle)',
                border: '1px solid var(--border-app)',
                flexWrap: 'wrap',
                gap: 12,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {/* Upvote */}
                <button
                  onClick={() => isAuthenticated ? upvotePost(post.id) : navigate('/login')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '8px 14px',
                    borderRadius: 10,
                    border: 'none',
                    cursor: 'pointer',
                    background: post.isUpvoted ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
                    color: post.isUpvoted ? '#818cf8' : 'var(--text-main)',
                    fontWeight: 600,
                    fontSize: 14,
                    transition: 'all 0.2s ease',
                  }}
                  title="Piga kura ya kukubali"
                >
                  <ThumbsUp size={17} />
                  <span>{post.upvotes}</span>
                </button>

                {/* Downvote */}
                <button
                  onClick={() => isAuthenticated ? downvotePost(post.id) : navigate('/login')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '8px 14px',
                    borderRadius: 10,
                    border: 'none',
                    cursor: 'pointer',
                    background: post.isDownvoted ? 'rgba(239, 68, 68, 0.2)' : 'transparent',
                    color: post.isDownvoted ? '#f87171' : 'var(--text-muted)',
                    fontWeight: 600,
                    fontSize: 14,
                    transition: 'all 0.2s ease',
                  }}
                  title="Piga kura ya kukataa"
                >
                  <ThumbsDown size={17} />
                  <span>{post.downvotes}</span>
                </button>

                {/* Bookmark */}
                <button
                  onClick={() => isAuthenticated ? toggleBookmark(post.id) : navigate('/login')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '8px 14px',
                    borderRadius: 10,
                    border: 'none',
                    cursor: 'pointer',
                    background: post.isBookmarked ? 'rgba(234, 179, 8, 0.2)' : 'transparent',
                    color: post.isBookmarked ? '#facc15' : 'var(--text-muted)',
                    fontWeight: 500,
                    fontSize: 14,
                    transition: 'all 0.2s ease',
                  }}
                  title="Hifadhi kwenye orodha ya kusoma"
                >
                  <Bookmark size={17} />
                  <span>{post.bookmarks || 0}</span>
                </button>
              </div>

              {/* Share button */}
              <button
                onClick={handleShare}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '8px 16px',
                  borderRadius: 10,
                  border: '1px solid var(--border-app)',
                  cursor: 'pointer',
                  background: 'transparent',
                  color: copied ? '#10b981' : 'var(--text-main)',
                  fontWeight: 600,
                  fontSize: 13,
                  transition: 'all 0.2s ease',
                }}
              >
                <Share2 size={16} />
                <span>{copied ? 'Kiungo Kimekopiliwa! ✓' : 'Shiriki Kiungo'}</span>
              </button>
            </div>
          </article>

          {/* Answers & Comments Section */}
          <section id="answers" style={{ marginTop: 32 }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 12,
                marginBottom: 20,
              }}
            >
              <h2
                style={{
                  fontSize: 20,
                  fontWeight: 800,
                  color: 'var(--text-main)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                }}
              >
                <MessageCircle size={22} color="#6366f1" />
                Majibu ({comments.length})
              </h2>

              {/* Sort Filter */}
              {comments.length > 1 && (
                <div style={{ display: 'flex', gap: 6, background: 'var(--bg-subtle)', padding: 4, borderRadius: 10, border: '1px solid var(--border-app)' }}>
                  {[
                    { id: 'best', label: 'Bora' },
                    { id: 'votes', label: 'Kura Nyingi' },
                    { id: 'latest', label: 'Hivi Punde' },
                  ].map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setSortBy(s.id as any)}
                      style={{
                        padding: '4px 10px',
                        borderRadius: 8,
                        fontSize: 12,
                        fontWeight: 600,
                        border: 'none',
                        cursor: 'pointer',
                        background: sortBy === s.id ? 'var(--btn-ghost-bg)' : 'transparent',
                        color: sortBy === s.id ? 'var(--btn-ghost-text)' : 'var(--text-muted)',
                      }}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Answer Form */}
            <div className="glass-card" style={{ padding: 24, marginBottom: 28 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-main)', marginBottom: 14 }}>
                Toa Jibu Lako
              </h3>

              {isAuthenticated ? (
                <div>
                  <CommentRichEditor
                    value={commentText}
                    onChange={setCommentText}
                    onSubmit={handleSubmitComment}
                    placeholder="Andika ufafanuzi kamili, hatua za kufuata au mfano wa suluhisho..."
                    minHeight={120}
                    submitting={isSubmitting}
                    submitLabel="Wasilisha Jibu"
                  />
                </div>
              ) : (
                <div
                  style={{
                    padding: 24,
                    textAlign: 'center',
                    background: 'var(--bg-subtle)',
                    borderRadius: 14,
                    border: '1px dashed var(--border-app)',
                  }}
                >
                  <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 16 }}>
                    Unahitaji kuingia kwenye akaunti yako ili uweze kutoa jibu na kusaidia jamii ya Nijuze.
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
                    <button onClick={() => navigate('/login')} className="btn-primary" style={{ padding: '8px 20px', cursor: 'pointer' }}>
                      Ingia Sasa
                    </button>
                    <button onClick={() => navigate('/register')} className="btn-ghost" style={{ padding: '8px 20px', cursor: 'pointer' }}>
                      Jiunge na Nijuze
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Answers List */}
            {sortedComments.length === 0 ? (
              <div className="glass-card" style={{ padding: 40, textAlign: 'center' }}>
                <HelpCircle size={40} color="var(--text-muted)" style={{ margin: '0 auto 12px' }} />
                <h4 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-main)', marginBottom: 6 }}>
                  Bado hakuna jibu lililotolewa
                </h4>
                <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                  Je, unafahamu suluhisho la swali hili? Kuwa wa kwanza kutoa jibu hapo juu!
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {sortedComments.map((comment) => {
                  const isCommentAuthor = currentUser?.id === comment.authorId;

                  return (
                    <div
                      key={comment.id}
                      className="glass-card"
                      style={{
                        padding: 20,
                        border: comment.isBestAnswer
                          ? '1.5px solid rgba(99, 102, 241, 0.5)'
                          : '1px solid var(--border-app)',
                        background: comment.isBestAnswer
                          ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.08), rgba(147, 51, 234, 0.04))'
                          : 'var(--card-bg)',
                        position: 'relative',
                        borderRadius: 16,
                      }}
                    >
                      {/* Best Answer Banner */}
                      {comment.isBestAnswer && (
                        <div
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 6,
                            padding: '4px 12px',
                            borderRadius: 20,
                            background: 'linear-gradient(135deg, #10b981, #059669)',
                            color: 'white',
                            fontSize: 12,
                            fontWeight: 700,
                            marginBottom: 14,
                            boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)',
                          }}
                        >
                          <Award size={14} /> Jibu Bora Lililochaguliwa
                        </div>
                      )}

                      {/* Comment Header */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          marginBottom: 14,
                          flexWrap: 'wrap',
                          gap: 10,
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div 
                            style={{ cursor: 'pointer' }}
                            onClick={() => navigate(`/profile/${comment.authorId}`)}
                          >
                            <UserAvatar 
                              avatar={comment.author?.avatar} 
                              username={comment.author?.username} 
                              size={36} 
                            />
                          </div>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <span
                                onClick={() => navigate(`/profile/${comment.authorId}`)}
                                style={{
                                  fontSize: 14,
                                  fontWeight: 700,
                                  color: 'var(--text-main)',
                                  cursor: 'pointer',
                                }}
                              >
                                {comment.author.username}
                              </span>
                              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                                {comment.author.role}
                              </span>
                            </div>
                            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                              {formatDate(comment.createdAt)}
                            </span>
                          </div>
                        </div>

                        {/* Best Answer Toggle (for question author or admin) */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          {(isPostAuthor || isUserAdmin) && (
                            <button
                              onClick={() => markBestAnswer(comment.id, post.id)}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 6,
                                padding: '4px 10px',
                                borderRadius: 8,
                                fontSize: 12,
                                fontWeight: 600,
                                cursor: 'pointer',
                                background: comment.isBestAnswer
                                  ? 'rgba(99, 102, 241, 0.15)'
                                  : 'var(--bg-subtle)',
                                color: comment.isBestAnswer
                                  ? 'var(--btn-ghost-text)'
                                  : 'var(--text-muted)',
                                border: '1px solid var(--border-app)',
                              }}
                              title={comment.isBestAnswer ? 'Ondoa Jibu Bora' : 'Chagua kama Jibu Bora'}
                            >
                              <Award size={14} />
                              {comment.isBestAnswer ? 'Chaguo lako' : 'Weka Jibu Bora'}
                            </button>
                          )}

                          {/* Delete Comment */}
                          {(isCommentAuthor || isPostAuthor || isUserAdmin) && (
                            <button
                              onClick={async () => {
                                if (window.confirm('Una uhakika unataka kufuta jibu hili?')) {
                                  const ok = await deleteComment(comment.id);
                                  if (ok) {
                                    setComments((prev) => prev.filter((c) => c.id !== comment.id));
                                  }
                                }
                              }}
                              title="Futa jibu"
                              style={{
                                background: 'transparent',
                                border: 'none',
                                color: 'var(--text-muted)',
                                cursor: 'pointer',
                                padding: 6,
                                borderRadius: 6,
                              }}
                              onMouseEnter={(e) => (e.currentTarget.style.color = '#ef4444')}
                              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
                            >
                              <Trash2 size={15} />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Comment Content */}
                      <div style={{ marginBottom: 16 }}>
                        <CommentContent content={comment.content} />
                      </div>

                      {/* Comment Action Bar */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 12,
                          paddingTop: 10,
                          borderTop: '1px solid var(--border-app)',
                        }}
                      >
                        <button
                          onClick={() => isAuthenticated ? upvoteComment(comment.id) : navigate('/login')}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                            padding: '4px 10px',
                            borderRadius: 8,
                            border: '1px solid var(--border-app)',
                            background: comment.isUpvoted ? 'rgba(99, 102, 241, 0.15)' : 'var(--bg-subtle)',
                            color: comment.isUpvoted ? 'var(--btn-ghost-text)' : 'var(--text-main)',
                            fontSize: 12,
                            fontWeight: 600,
                            cursor: 'pointer',
                          }}
                        >
                          <ThumbsUp size={13} />
                          <span>{comment.upvotes} {comment.upvotes === 1 ? 'Kura' : 'Kura'}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>

        {/* Right Column: Sidebar */}
        <aside style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* 1. Author Info Card */}
          <div className="glass-card" style={{ padding: 22 }}>
            <h3
              style={{
                fontSize: 14,
                fontWeight: 700,
                color: 'var(--text-main)',
                marginBottom: 16,
                letterSpacing: '0.3px',
              }}
            >
              Kuhusu Muulizaji
            </h3>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
              <UserAvatar 
                avatar={post.isAnonymous ? '?' : post.author?.avatar} 
                username={post.isAnonymous ? '?' : post.author?.username} 
                size={48} 
              />
              <div>
                <h4 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-main)' }}>
                  {post.isAnonymous ? 'Mwanachama' : post.author.username}
                </h4>
                <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  {post.author.role || 'Mwanachama wa Nijuze'}
                </p>
              </div>
            </div>

            {post.author.bio && (
              <p
                style={{
                  fontSize: 13,
                  lineHeight: 1.5,
                  color: 'var(--text-muted)',
                  marginBottom: 14,
                }}
              >
                {post.author.bio}
              </p>
            )}

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 8,
                padding: '12px 10px',
                borderRadius: 10,
                background: 'var(--bg-subtle)',
                marginBottom: 14,
                textAlign: 'center',
              }}
            >
              <div>
                <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-main)' }}>
                  {post.author.reputation || 120}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Heshima</div>
              </div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-main)' }}>
                  {post.author.postsCount || 1}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Maswali</div>
              </div>
            </div>

            {!post.isAnonymous && (
              <button
                onClick={() => navigate(`/profile/${post.authorId}`)}
                className="btn-ghost"
                style={{ width: '100%', fontSize: 13, justifyContent: 'center', cursor: 'pointer' }}
              >
                Tazama Wasifu Kamili
              </button>
            )}
          </div>

          {/* 2. Related Questions Card */}
          {relatedPosts.length > 0 && (
            <div className="glass-card" style={{ padding: 22 }}>
              <h3
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: 'var(--text-main)',
                  marginBottom: 14,
                  letterSpacing: '0.3px',
                }}
              >
                Mada Zinazohusiana
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {relatedPosts.map((rp) => (
                  <div
                    key={rp.id}
                    onClick={() => navigate(`/post/${rp.id}`)}
                    style={{
                      padding: 10,
                      borderRadius: 10,
                      background: 'var(--bg-subtle)',
                      border: '1px solid var(--border-app)',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'var(--border-focus)';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'var(--border-app)';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    <h5
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: 'var(--text-main)',
                        marginBottom: 6,
                        lineHeight: 1.4,
                      }}
                    >
                      {rp.title}
                    </h5>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, color: 'var(--text-muted)' }}>
                      <span>{rp.upvotes} kura</span>
                      <span>•</span>
                      <span>{rp.commentsCount} majibu</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3. Community Guidelines Card */}
          <div className="glass-card" style={{ padding: 22 }}>
            <h3
              style={{
                fontSize: 14,
                fontWeight: 700,
                color: 'var(--text-main)',
                marginBottom: 12,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <Sparkles size={16} color="#eab308" /> Vidokezo vya Majibu Bora
            </h3>
            <ul
              style={{
                paddingLeft: 18,
                margin: 0,
                fontSize: 12,
                lineHeight: 1.7,
                color: 'var(--text-muted)',
                display: 'flex',
                flexDirection: 'column',
                gap: 6,
              }}
            >
              <li>Eleza kwa lugha fasaha ya Kiswahili inayoeleweka.</li>
              <li>Weka mifano halisi au vipande vya nambari za kodi kama inahusika.</li>
              <li>Epuka majibu mafupi yasiyotoa ufafanuzi wa kutosha.</li>
              <li>Heshimu maoni na mitazamo ya wanachama wengine.</li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
};

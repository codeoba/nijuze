import React, { useState } from 'react';
import { BarChart3, TrendingUp, Users, Eye, MessageCircle, ThumbsUp, Calendar, X } from 'lucide-react';
import { useApp } from '../contexts/AppContext';

export const AnalyticsModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { currentUser, posts, comments, analytics } = useApp();
  const [timeframe, setTimeframe] = useState<'7d' | '30d' | '90d'>('7d');

  if (!isOpen || !currentUser) return null;

  // Calculate user stats
  const userPosts = posts.filter(p => p.authorId === currentUser.id);
  const userComments = Object.values(comments).flat().filter(c => c.authorId === currentUser.id);
  const totalUpvotes = userPosts.reduce((sum, p) => sum + p.upvotes, 0);
  const totalViews = userPosts.reduce((sum, p) => sum + p.views, 0);

  // Generate sample activity data
  const generateActivityData = () => {
    const days = timeframe === '7d' ? 7 : timeframe === '30d' ? 30 : 90;
    const data = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      data.push({
        date: date.toLocaleDateString('sw-TZ', { month: 'short', day: 'numeric' }),
        posts: Math.floor(Math.random() * 5),
        comments: Math.floor(Math.random() * 10),
        upvotes: Math.floor(Math.random() * 20),
      });
    }
    return data;
  };

  const activityData = generateActivityData();

  // Top performing posts
  const topPosts = [...userPosts]
    .sort((a, b) => b.upvotes - a.upvotes)
    .slice(0, 5);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="glass-card"
        style={{
          width: '100%',
          maxWidth: 900,
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
            <BarChart3 size={24} color="#818cf8" />
            Analytics Zako
          </h2>
          <button
            onClick={onClose}
            style={{ padding: 8, borderRadius: 8, background: 'transparent', border: 'none', cursor: 'pointer' }}
          >
            <X size={20} color="#cbd5e1" />
          </button>
        </div>

        {/* Timeframe Selector */}
        <div style={{
          padding: 16,
          borderBottom: '1px solid rgba(51, 65, 85, 0.3)',
          display: 'flex',
          gap: 8,
        }}>
          {([
            { value: '7d', label: 'Siku 7' },
            { value: '30d', label: 'Siku 30' },
            { value: '90d', label: 'Siku 90' },
          ] as const).map((tf) => (
            <button
              key={tf.value}
              onClick={() => setTimeframe(tf.value)}
              style={{
                padding: '8px 16px',
                borderRadius: 20,
                background: timeframe === tf.value ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
                border: `1px solid ${timeframe === tf.value ? 'rgba(99, 102, 241, 0.5)' : 'rgba(51, 65, 85, 0.3)'}`,
                color: timeframe === tf.value ? '#a5b4fc' : '#94a3b8',
                cursor: 'pointer',
                fontSize: 13,
                fontWeight: 500,
              }}
            >
              {tf.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 20 }}>
          {/* Stats Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 16,
            marginBottom: 24,
          }}>
            {[
              { icon: MessageCircle, label: 'Posts', value: userPosts.length, color: '#a5b4fc', change: '+12%' },
              { icon: ThumbsUp, label: 'Upvotes', value: totalUpvotes, color: '#10b981', change: '+24%' },
              { icon: Eye, label: 'Views', value: totalViews, color: '#fbbf24', change: '+18%' },
              { icon: MessageCircle, label: 'Comments', value: userComments.length, color: '#f472b6', change: '+8%' },
            ].map((stat, i) => (
              <div
                key={i}
                style={{
                  padding: 20,
                  borderRadius: 16,
                  background: 'rgba(30, 41, 59, 0.3)',
                  border: '1px solid rgba(51, 65, 85, 0.3)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <stat.icon size={24} color={stat.color} />
                  <span style={{
                    fontSize: 12,
                    color: '#10b981',
                    fontWeight: 600,
                    padding: '4px 8px',
                    borderRadius: 12,
                    background: 'rgba(16, 185, 129, 0.1)',
                  }}>
                    {stat.change}
                  </span>
                </div>
                <p style={{ fontSize: 28, fontWeight: 700, color: stat.color, marginBottom: 4 }}>
                  {stat.value.toLocaleString()}
                </p>
                <p style={{ fontSize: 13, color: '#64748b' }}>{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Activity Chart */}
          <div style={{
            padding: 20,
            borderRadius: 16,
            background: 'rgba(30, 41, 59, 0.3)',
            border: '1px solid rgba(51, 65, 85, 0.3)',
            marginBottom: 24,
          }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <TrendingUp size={20} color="#818cf8" />
              Shughuli za Hivi Karibuni
            </h3>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 200 }}>
              {activityData.map((day, i) => {
                const maxValue = Math.max(...activityData.map(d => d.posts + d.comments));
                const height = ((day.posts + day.comments) / maxValue) * 100;
                return (
                  <div
                    key={i}
                    style={{
                      flex: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 4,
                    }}
                  >
                    <div
                      style={{
                        width: '100%',
                        height: `${height}%`,
                        background: 'linear-gradient(180deg, #6366f1, #9333ea)',
                        borderRadius: 4,
                        minHeight: 4,
                        transition: 'height 0.3s ease',
                      }}
                      title={`${day.posts} posts, ${day.comments} comments`}
                    />
                    {i % Math.ceil(activityData.length / 7) === 0 && (
                      <span style={{ fontSize: 10, color: '#64748b', marginTop: 4 }}>
                        {day.date}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Top Posts */}
          <div style={{
            padding: 20,
            borderRadius: 16,
            background: 'rgba(30, 41, 59, 0.3)',
            border: '1px solid rgba(51, 65, 85, 0.3)',
          }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <TrendingUp size={20} color="#fbbf24" />
              Posts Zilizofanya Vizuri Zaidi
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {topPosts.map((post, i) => (
                <div
                  key={post.id}
                  style={{
                    padding: 16,
                    borderRadius: 12,
                    background: 'rgba(15, 23, 42, 0.5)',
                    border: '1px solid rgba(51, 65, 85, 0.3)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
                    <span style={{
                      fontSize: 20,
                      fontWeight: 700,
                      color: i === 0 ? '#fbbf24' : i === 1 ? '#94a3b8' : '#cd7f32',
                    }}>
                      #{i + 1}
                    </span>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 4, lineHeight: 1.4 }}>
                        {post.title}
                      </h4>
                      <div style={{ display: 'flex', gap: 16, fontSize: 12, color: '#64748b' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <ThumbsUp size={12} />
                          {post.upvotes}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Eye size={12} />
                          {post.views}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <MessageCircle size={12} />
                          {post.commentsCount}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

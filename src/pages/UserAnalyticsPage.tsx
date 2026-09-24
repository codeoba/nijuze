import React, { useState, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import { 
  BarChart3, TrendingUp, Users, Eye, MessageCircle, ThumbsUp,
  Award, Calendar, Clock, Star, Zap, Target
} from 'lucide-react';

export const UserAnalyticsPage: React.FC = () => {
  const { currentUser, posts, comments } = useApp();
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d');

  if (!currentUser) return null;

  // Calculate user stats
  const userPosts = posts.filter(p => p.authorId === currentUser.id);
  const userComments = comments.filter(c => c.authorId === currentUser.id);
  
  const totalUpvotes = userPosts.reduce((sum, p) => sum + p.upvotes, 0);
  const totalViews = userPosts.reduce((sum, p) => sum + p.views, 0);
  const totalComments = userPosts.reduce((sum, p) => sum + p.commentsCount, 0);
  
  const avgUpvotesPerPost = userPosts.length > 0 ? Math.round(totalUpvotes / userPosts.length) : 0;
  const avgViewsPerPost = userPosts.length > 0 ? Math.round(totalViews / userPosts.length) : 0;
  
  // Top performing posts
  const topPosts = [...userPosts]
    .sort((a, b) => b.upvotes - a.upvotes)
    .slice(0, 5);
  
  // Recent activity
  const recentActivity = [
    ...userPosts.map(p => ({ type: 'post', date: p.createdAt, text: p.title, upvotes: p.upvotes })),
    ...userComments.map(c => ({ type: 'comment', date: c.createdAt, text: c.content.substring(0, 50), upvotes: c.upvotes }))
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 10);

  // Engagement rate
  const engagementRate = totalViews > 0 ? ((totalUpvotes + totalComments) / totalViews * 100).toFixed(1) : 0;

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 16px' }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 8 }}>
          <BarChart3 size={32} color="#6366f1" />
          <h1 style={{ fontSize: 32, fontWeight: 700 }}>Analytics Zangu</h1>
        </div>
        <p style={{ color: '#94a3b8' }}>Tazama takwimu na utendaji wako kwenye jukwaa</p>
      </div>

      {/* Time Range Selector */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        {[
          { id: '7d', label: 'Siku 7' },
          { id: '30d', label: 'Siku 30' },
          { id: '90d', label: 'Siku 90' },
          { id: 'all', label: 'Zote' },
        ].map((range) => (
          <button
            key={range.id}
            onClick={() => setTimeRange(range.id as any)}
            style={{
              padding: '8px 16px',
              borderRadius: 10,
              background: timeRange === range.id ? 'rgba(99, 102, 241, 0.2)' : 'rgba(30, 41, 59, 0.3)',
              border: `1px solid ${timeRange === range.id ? 'rgba(99, 102, 241, 0.5)' : 'rgba(51, 65, 85, 0.3)'}`,
              color: timeRange === range.id ? '#a5b4fc' : '#94a3b8',
              cursor: 'pointer',
              fontSize: 14,
              fontWeight: 500,
            }}
          >
            {range.label}
          </button>
        ))}
      </div>

      {/* Overview Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 16,
        marginBottom: 32,
      }}>
        {[
          { label: 'Posts Zangu', value: userPosts.length, icon: MessageCircle, color: '#6ee7b7', change: '+12%' },
          { label: 'Comments Zangu', value: userComments.length, icon: MessageCircle, color: '#60a5fa', change: '+8%' },
          { label: 'Total Upvotes', value: totalUpvotes, icon: ThumbsUp, color: '#fbbf24', change: '+24%' },
          { label: 'Total Views', value: totalViews, icon: Eye, color: '#f472b6', change: '+18%' },
          { label: 'Engagement Rate', value: `${engagementRate}%`, icon: Target, color: '#c084fc', change: '+5%' },
          { label: 'Reputation', value: currentUser.reputation, icon: Award, color: '#a5b4fc', change: '+15%' },
        ].map((stat, i) => (
          <div key={i} className="glass-card" style={{ padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <stat.icon size={24} color={stat.color} />
              <span style={{
                fontSize: 12,
                color: stat.change.startsWith('+') ? '#10b981' : '#ef4444',
                fontWeight: 600,
                padding: '4px 8px',
                borderRadius: 12,
                background: stat.change.startsWith('+') ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
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

      {/* Performance Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 32 }}>
        {/* Average Performance */}
        <div className="glass-card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
            <TrendingUp size={20} color="#a5b4fc" />
            Wastani wa Utendaji
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 14, color: '#94a3b8' }}>Upvotes kwa Post</span>
              <span style={{ fontSize: 20, fontWeight: 700, color: '#fbbf24' }}>{avgUpvotesPerPost}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 14, color: '#94a3b8' }}>Views kwa Post</span>
              <span style={{ fontSize: 20, fontWeight: 700, color: '#f472b6' }}>{avgViewsPerPost}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 14, color: '#94a3b8' }}>Comments kwa Post</span>
              <span style={{ fontSize: 20, fontWeight: 700, color: '#60a5fa' }}>{totalComments}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 14, color: '#94a3b8' }}>Engagement Rate</span>
              <span style={{ fontSize: 20, fontWeight: 700, color: '#c084fc' }}>{engagementRate}%</span>
            </div>
          </div>
        </div>

        {/* Level Progress */}
        <div className="glass-card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Star size={20} color="#fbbf24" />
            Maendeleo ya Level
          </h3>
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 14, color: '#94a3b8' }}>Level {Math.floor(currentUser.reputation / 1000) + 1}</span>
              <span style={{ fontSize: 14, color: '#94a3b8' }}>Level {Math.floor(currentUser.reputation / 1000) + 2}</span>
            </div>
            <div style={{
              height: 12,
              borderRadius: 6,
              background: 'rgba(30, 41, 59, 0.5)',
              overflow: 'hidden',
            }}>
              <div style={{
                height: '100%',
                width: `${(currentUser.reputation % 1000) / 10}%`,
                background: 'linear-gradient(90deg, #6366f1, #9333ea)',
                borderRadius: 6,
                transition: 'width 0.5s ease',
              }} />
            </div>
            <p style={{ fontSize: 13, color: '#64748b', marginTop: 8 }}>
              {1000 - (currentUser.reputation % 1000)} points hadi level inayofuata
            </p>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 14, color: '#94a3b8' }}>Reputation Yako</span>
            <span style={{ fontSize: 24, fontWeight: 700, color: '#a5b4fc' }}>
              {currentUser.reputation.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Top Performing Posts */}
      <div className="glass-card" style={{ padding: 24, marginBottom: 24 }}>
        <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Zap size={20} color="#fbbf24" />
          Posts Zilizofanya Vizuri Zaidi
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {topPosts.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#64748b', padding: 32 }}>
              Bado huna posts
            </p>
          ) : (
            topPosts.map((post, i) => (
              <div
                key={post.id}
                style={{
                  padding: 16,
                  borderRadius: 12,
                  background: 'rgba(30, 41, 59, 0.3)',
                  border: '1px solid rgba(51, 65, 85, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                }}
              >
                <span style={{
                  fontSize: 24,
                  fontWeight: 700,
                  color: i === 0 ? '#fbbf24' : i === 1 ? '#94a3b8' : '#cd7f32',
                  width: 40,
                }}>
                  #{i + 1}
                </span>
                <div style={{ flex: 1 }}>
                  <h4 style={{ fontSize: 15, fontWeight: 600, marginBottom: 8 }}>
                    {post.title}
                  </h4>
                  <div style={{ display: 'flex', gap: 16, fontSize: 13, color: '#64748b' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <ThumbsUp size={14} /> {post.upvotes}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Eye size={14} /> {post.views}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <MessageCircle size={14} /> {post.commentsCount}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Clock size={14} /> {new Date(post.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="glass-card" style={{ padding: 24 }}>
        <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Clock size={20} color="#60a5fa" />
          Shughuli za Hivi Karibuni
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {recentActivity.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#64748b', padding: 32 }}>
              Hakuna shughuli bado
            </p>
          ) : (
            recentActivity.map((activity, i) => (
              <div
                key={i}
                style={{
                  padding: 12,
                  borderRadius: 10,
                  background: 'rgba(30, 41, 59, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                }}
              >
                <div style={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  background: activity.type === 'post' ? 'rgba(110, 231, 183, 0.2)' : 'rgba(96, 165, 250, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  {activity.type === 'post' ? (
                    <MessageCircle size={18} color="#6ee7b7" />
                  ) : (
                    <MessageCircle size={18} color="#60a5fa" />
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 14, color: '#e2e8f0', marginBottom: 4 }}>
                    {activity.type === 'post' ? 'Uliunda post:' : 'Uli comment:'}{' '}
                    <strong>{activity.text}</strong>
                  </p>
                  <p style={{ fontSize: 12, color: '#64748b' }}>
                    {new Date(activity.date).toLocaleDateString()} • {activity.upvotes} upvotes
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

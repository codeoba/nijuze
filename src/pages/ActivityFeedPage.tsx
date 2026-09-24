import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { 
  Activity, FileText, MessageSquare, ThumbsUp, Users, Award,
  TrendingUp, Clock, Filter, Bell, Eye, Heart, Share2,
  UserPlus, MessageCircle, Star, Zap
} from 'lucide-react';

export const ActivityFeedPage: React.FC = () => {
  const { posts, users, currentUser, comments } = useApp();
  const [filter, setFilter] = useState<'all' | 'posts' | 'comments' | 'follows' | 'achievements'>('all');
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month' | 'all'>('week');

  // Generate activities from posts, comments, and user actions
  const generateActivities = () => {
    const activities: any[] = [];

    // Post activities
    posts.forEach(post => {
      activities.push({
        id: `post-${post.id}`,
        type: 'post',
        user: post.author,
        action: 'aliunda post mpya',
        target: post.title,
        targetId: post.id,
        timestamp: post.createdAt,
        icon: FileText,
        color: '#6ee7b7',
        metadata: {
          upvotes: post.upvotes,
          comments: post.commentsCount,
          views: post.views,
        }
      });
    });

    // Comment activities
    comments.forEach(comment => {
      const post = posts.find(p => p.id === comment.postId);
      if (post) {
        activities.push({
          id: `comment-${comment.id}`,
          type: 'comment',
          user: comment.author,
          action: 'alijibu post',
          target: post.title,
          targetId: post.id,
          timestamp: comment.createdAt,
          icon: MessageSquare,
          color: '#60a5fa',
          metadata: {
            upvotes: comment.upvotes,
          }
        });
      }
    });

    // Simulate follow activities (in real app, this would come from database)
    users.slice(0, 5).forEach((user, i) => {
      if (i > 0) {
        activities.push({
          id: `follow-${user.id}`,
          type: 'follow',
          user: user,
          action: 'alifuata',
          target: users[i - 1].username,
          targetId: users[i - 1].id,
          timestamp: new Date(Date.now() - i * 3600000).toISOString(),
          icon: UserPlus,
          color: '#a5b4fc',
        });
      }
    });

    // Simulate achievement activities
    users.slice(0, 3).forEach((user, i) => {
      activities.push({
        id: `achievement-${user.id}`,
        type: 'achievement',
        user: user,
        action: 'alipata badge mpya',
        target: 'Mchangiaji Bora',
        targetId: user.id,
        timestamp: new Date(Date.now() - i * 7200000).toISOString(),
        icon: Award,
        color: '#fbbf24',
      });
    });

    // Sort by timestamp
    return activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  };

  const allActivities = generateActivities();

  // Filter activities
  const filteredActivities = allActivities.filter(activity => {
    if (filter !== 'all' && activity.type !== filter) return false;
    
    if (timeRange !== 'all') {
      const now = new Date();
      const activityDate = new Date(activity.timestamp);
      const diffHours = (now.getTime() - activityDate.getTime()) / (1000 * 60 * 60);
      
      if (timeRange === 'today' && diffHours > 24) return false;
      if (timeRange === 'week' && diffHours > 168) return false;
      if (timeRange === 'month' && diffHours > 720) return false;
    }
    
    return true;
  });

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '24px 16px' }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 8 }}>
          <Activity size={32} color="#6366f1" />
          <h1 style={{ fontSize: 32, fontWeight: 700 }}>Activity Feed</h1>
        </div>
        <p style={{ color: '#94a3b8' }}>Fuata shughuli zote kwenye jukwaa</p>
      </div>

      {/* Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: 16,
        marginBottom: 32,
      }}>
        {[
          { label: 'Posts Leo', value: posts.filter(p => {
            const today = new Date();
            const postDate = new Date(p.createdAt);
            return postDate.toDateString() === today.toDateString();
          }).length, icon: FileText, color: '#6ee7b7' },
          { label: 'Comments Leo', value: comments.filter(c => {
            const today = new Date();
            const commentDate = new Date(c.createdAt);
            return commentDate.toDateString() === today.toDateString();
          }).length, icon: MessageSquare, color: '#60a5fa' },
          { label: 'Active Users', value: users.filter(u => u.postsCount > 0 || u.answersCount > 0).length, icon: Users, color: '#a5b4fc' },
          { label: 'Total Activities', value: allActivities.length, icon: Zap, color: '#fbbf24' },
        ].map((stat, i) => (
          <div key={i} className="glass-card" style={{ padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <stat.icon size={24} color={stat.color} />
              <p style={{ fontSize: 28, fontWeight: 700, color: stat.color }}>
                {stat.value}
              </p>
            </div>
            <p style={{ fontSize: 13, color: '#64748b' }}>{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="glass-card" style={{ padding: 20, marginBottom: 24 }}>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <label style={{ fontSize: 13, color: '#94a3b8', marginBottom: 8, display: 'block' }}>Aina</label>
            <div style={{ display: 'flex', gap: 8 }}>
              {[
                { id: 'all', label: 'Zote', icon: Activity },
                { id: 'posts', label: 'Posts', icon: FileText },
                { id: 'comments', label: 'Comments', icon: MessageSquare },
                { id: 'follows', label: 'Follows', icon: UserPlus },
                { id: 'achievements', label: 'Badges', icon: Award },
              ].map((f) => {
                const Icon = f.icon;
                return (
                  <button
                    key={f.id}
                    onClick={() => setFilter(f.id as any)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '8px 14px',
                      borderRadius: 10,
                      background: filter === f.id ? 'rgba(99, 102, 241, 0.2)' : 'rgba(30, 41, 59, 0.3)',
                      border: `1px solid ${filter === f.id ? 'rgba(99, 102, 241, 0.5)' : 'rgba(51, 65, 85, 0.3)'}`,
                      color: filter === f.id ? '#a5b4fc' : '#94a3b8',
                      cursor: 'pointer',
                      fontSize: 13,
                      fontWeight: 500,
                    }}
                  >
                    <Icon size={14} />
                    {f.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label style={{ fontSize: 13, color: '#94a3b8', marginBottom: 8, display: 'block' }}>Muda</label>
            <div style={{ display: 'flex', gap: 8 }}>
              {[
                { id: 'today', label: 'Leo' },
                { id: 'week', label: 'Wiki' },
                { id: 'month', label: 'Mwezi' },
                { id: 'all', label: 'Zote' },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTimeRange(t.id as any)}
                  style={{
                    padding: '8px 14px',
                    borderRadius: 10,
                    background: timeRange === t.id ? 'rgba(99, 102, 241, 0.2)' : 'rgba(30, 41, 59, 0.3)',
                    border: `1px solid ${timeRange === t.id ? 'rgba(99, 102, 241, 0.5)' : 'rgba(51, 65, 85, 0.3)'}`,
                    color: timeRange === t.id ? '#a5b4fc' : '#94a3b8',
                    cursor: 'pointer',
                    fontSize: 13,
                    fontWeight: 500,
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Activity Feed */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {filteredActivities.length === 0 ? (
          <div className="glass-card" style={{ padding: 48, textAlign: 'center' }}>
            <Activity size={48} color="#475569" style={{ margin: '0 auto 16px' }} />
            <p style={{ fontSize: 16, color: '#94a3b8' }}>Hakuna shughuli zilizopatikana</p>
          </div>
        ) : (
          filteredActivities.map((activity) => (
            <ActivityCard key={activity.id} activity={activity} />
          ))
        )}
      </div>
    </div>
  );
};

// Activity Card Component
const ActivityCard: React.FC<{ activity: any }> = ({ activity }) => {
  const Icon = activity.icon;

  return (
    <div
      className="glass-card"
      style={{
        padding: 20,
        display: 'flex',
        gap: 16,
        transition: 'all 0.2s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.3)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'rgba(51, 65, 85, 0.3)';
      }}
    >
      {/* Icon */}
      <div style={{
        width: 48,
        height: 48,
        borderRadius: '50%',
        background: `${activity.color}20`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}>
        <Icon size={24} color={activity.color} />
      </div>

      {/* Content */}
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <div style={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #6366f1, #9333ea)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 12,
            fontWeight: 'bold',
            color: 'white',
          }}>
            {activity.user.avatar}
          </div>
          <div>
            <p style={{ fontSize: 14, color: '#e2e8f0' }}>
              <strong>{activity.user.username}</strong>{' '}
              <span style={{ color: '#94a3b8' }}>{activity.action}</span>{' '}
              <strong style={{ color: '#a5b4fc' }}>{activity.target}</strong>
            </p>
            <p style={{ fontSize: 12, color: '#64748b', display: 'flex', alignItems: 'center', gap: 4 }}>
              <Clock size={12} />
              {formatTimeAgo(activity.timestamp)}
            </p>
          </div>
        </div>

        {/* Metadata */}
        {activity.metadata && (
          <div style={{ display: 'flex', gap: 16, fontSize: 13, color: '#64748b', marginTop: 8 }}>
            {activity.metadata.upvotes !== undefined && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <ThumbsUp size={14} />
                {activity.metadata.upvotes} upvotes
              </span>
            )}
            {activity.metadata.comments !== undefined && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <MessageSquare size={14} />
                {activity.metadata.comments} comments
              </span>
            )}
            {activity.metadata.views !== undefined && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <Eye size={14} />
                {activity.metadata.views} views
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Helper function to format time ago
const formatTimeAgo = (timestamp: string): string => {
  const now = new Date();
  const date = new Date(timestamp);
  const diffSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffSeconds < 60) return 'sasa hivi';
  if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)} dakika zilizopita`;
  if (diffSeconds < 86400) return `${Math.floor(diffSeconds / 3600)} masaa yaliyopita`;
  if (diffSeconds < 604800) return `${Math.floor(diffSeconds / 86400)} siku zilizopita`;
  return date.toLocaleDateString('sw-TZ');
};

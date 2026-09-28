import React, { useState, useEffect } from 'react';
import { Trophy, Medal, Award, TrendingUp, Star, Crown } from 'lucide-react';
import { useApp } from '../contexts/AppContext';

interface LeaderboardEntry {
  rank: number;
  user: any;
  points: number;
  posts: number;
  answers: number;
  badges: number;
  change: number; // +1, -1, 0 (position change)
}

export const Leaderboard: React.FC = () => {
  const { users, currentUser } = useApp();
  const [timeframe, setTimeframe] = useState<'week' | 'month' | 'all'>('week');
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    // Generate leaderboard from users
    const entries: LeaderboardEntry[] = users
      .map((user, index) => ({
        rank: index + 1,
        user,
        points: user.reputation + Math.floor(Math.random() * 5000),
        posts: user.postsCount + Math.floor(Math.random() * 50),
        answers: user.answersCount + Math.floor(Math.random() * 100),
        badges: user.badges.length + Math.floor(Math.random() * 5),
        change: Math.floor(Math.random() * 5) - 2, // -2 to +2
      }))
      .sort((a, b) => b.points - a.points)
      .map((entry, index) => ({ ...entry, rank: index + 1 }));

    setLeaderboard(entries);
  }, [users, timeframe]);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown size={24} color="#fbbf24" />;
      case 2:
        return <Medal size={24} color="#94a3b8" />;
      case 3:
        return <Medal size={24} color="#cd7f32" />;
      default:
        return <span style={{ fontSize: 16, fontWeight: 700, color: '#64748b' }}>#{rank}</span>;
    }
  };

  const getRankBg = (rank: number) => {
    switch (rank) {
      case 1:
        return 'linear-gradient(135deg, rgba(251, 191, 36, 0.2), rgba(245, 158, 11, 0.1))';
      case 2:
        return 'linear-gradient(135deg, rgba(148, 163, 184, 0.2), rgba(100, 116, 139, 0.1))';
      case 3:
        return 'linear-gradient(135deg, rgba(205, 127, 50, 0.2), rgba(180, 100, 30, 0.1))';
      default:
        return 'transparent';
    }
  };

  const currentUserEntry = leaderboard.find(entry => entry.user.id === currentUser?.id);

  return (
    <div className="glass-card" style={{ padding: 24 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Trophy size={24} color="#fbbf24" />
          Orodha ya Bora
        </h2>
        <div style={{ display: 'flex', gap: 8 }}>
          {(['week', 'month', 'all'] as const).map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              style={{
                padding: '6px 12px',
                borderRadius: 8,
                background: timeframe === tf ? 'var(--btn-ghost-bg)' : 'transparent',
                border: `1px solid ${timeframe === tf ? 'var(--btn-ghost-border)' : 'var(--border-app)'}`,
                color: timeframe === tf ? 'var(--btn-ghost-text)' : 'var(--text-muted)',
                cursor: 'pointer',
                fontSize: 13,
                fontWeight: timeframe === tf ? 600 : 500,
                transition: 'all 0.2s ease',
              }}
            >
              {tf === 'week' ? 'Wiki' : tf === 'month' ? 'Mwezi' : 'Yote'}
            </button>
          ))}
        </div>
      </div>

      {/* Current User Position */}
      {currentUserEntry && (
        <div style={{
          padding: 16,
          borderRadius: 12,
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(147, 51, 234, 0.1))',
          border: '1px solid rgba(99, 102, 241, 0.3)',
          marginBottom: 20,
          display: 'flex',
          alignItems: 'center',
          gap: 16,
        }}>
          <div style={{
            width: 48,
            height: 48,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #6366f1, #9333ea)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 16,
            fontWeight: 'bold',
          }}>
            {currentUserEntry.user.avatar}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <h4 style={{ fontSize: 15, fontWeight: 600 }}>Nafasi Yako</h4>
              <span style={{
                background: 'rgba(99, 102, 241, 0.3)',
                color: 'var(--btn-ghost-text)',
                padding: '2px 8px',
                borderRadius: 12,
                fontSize: 12,
                fontWeight: 600,
              }}>
                #{currentUserEntry.rank}
              </span>
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              {currentUserEntry.points.toLocaleString()} points • {currentUserEntry.posts} posts • {currentUserEntry.answers} answers
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: 20, fontWeight: 700, color: 'var(--btn-ghost-text)' }}>
              {currentUserEntry.points.toLocaleString()}
            </p>
            <p style={{ fontSize: 12, color: '#64748b' }}>points</p>
          </div>
        </div>
      )}

      {/* Top 3 Podium */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr',
        gap: 12,
        marginBottom: 24,
      }}>
        {leaderboard.slice(0, 3).map((entry, index) => (
          <div
            key={entry.user.id}
            style={{
              padding: 20,
              borderRadius: 16,
              background: getRankBg(entry.rank),
              border: `1px solid ${entry.rank === 1 ? 'rgba(251, 191, 36, 0.3)' : entry.rank === 2 ? 'rgba(148, 163, 184, 0.3)' : 'rgba(205, 127, 50, 0.3)'}`,
              textAlign: 'center',
              order: index === 0 ? 1 : index === 1 ? 0 : 2,
              transform: index === 0 ? 'scale(1.05)' : 'scale(1)',
            }}
          >
            <div style={{ marginBottom: 12 }}>
              {getRankIcon(entry.rank)}
            </div>
            <div style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #6366f1, #9333ea)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 20,
              fontWeight: 'bold',
              margin: '0 auto 12px',
            }}>
              {entry.user.avatar}
            </div>
            <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>
              {entry.user.username}
            </h4>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>
              {entry.user.role}
            </p>
            <p style={{ fontSize: 18, fontWeight: 700, color: entry.rank === 1 ? '#fbbf24' : entry.rank === 2 ? '#94a3b8' : '#cd7f32' }}>
              {entry.points.toLocaleString()}
            </p>
            <p style={{ fontSize: 11, color: '#64748b' }}>points</p>
          </div>
        ))}
      </div>

      {/* Rest of Leaderboard */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {leaderboard.slice(3, 10).map((entry) => (
          <div
            key={entry.user.id}
            style={{
              padding: 12,
              borderRadius: 12,
              background: entry.user.id === currentUser?.id ? 'var(--btn-ghost-bg)' : 'var(--bg-subtle)',
              border: `1px solid ${entry.user.id === currentUser?.id ? 'var(--btn-ghost-border)' : 'var(--border-app)'}`,
              display: 'flex',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <div style={{ width: 40, textAlign: 'center' }}>
              {getRankIcon(entry.rank)}
            </div>
            <div style={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #6366f1, #9333ea)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 14,
              fontWeight: 'bold',
            }}>
              {entry.user.avatar}
            </div>
            <div style={{ flex: 1 }}>
              <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 2 }}>
                {entry.user.username}
              </h4>
              <div style={{ display: 'flex', gap: 12, fontSize: 12, color: '#64748b' }}>
                <span>{entry.posts} posts</span>
                <span>{entry.answers} answers</span>
                <span>{entry.badges} badges</span>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: 16, fontWeight: 700, color: 'var(--btn-ghost-text)' }}>
                {entry.points.toLocaleString()}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'flex-end' }}>
                {entry.change > 0 && (
                  <TrendingUp size={12} color="#10b981" />
                )}
                {entry.change < 0 && (
                  <TrendingUp size={12} color="#ef4444" style={{ transform: 'rotate(180deg)' }} />
                )}
                <span style={{
                  fontSize: 11,
                  color: entry.change > 0 ? '#10b981' : entry.change < 0 ? '#ef4444' : '#64748b',
                }}>
                  {entry.change > 0 ? `+${entry.change}` : entry.change < 0 ? entry.change : '='}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Stats Summary */}
      <div style={{
        marginTop: 24,
        padding: 16,
        borderRadius: 12,
        background: 'var(--bg-subtle)',
        border: '1px solid var(--border-app)',
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 16,
      }}>
        <div style={{ textAlign: 'center' }}>
          <Star size={20} color="#fbbf24" style={{ margin: '0 auto 8px' }} />
          <p style={{ fontSize: 18, fontWeight: 700, color: '#fbbf24' }}>
            {leaderboard[0]?.points.toLocaleString()}
          </p>
          <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Highest Points</p>
        </div>
        <div style={{ textAlign: 'center' }}>
          <Award size={20} color="var(--border-focus)" style={{ margin: '0 auto 8px' }} />
          <p style={{ fontSize: 18, fontWeight: 700, color: 'var(--border-focus)' }}>
            {leaderboard.reduce((sum, e) => sum + e.posts, 0)}
          </p>
          <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Total Posts</p>
        </div>
        <div style={{ textAlign: 'center' }}>
          <Trophy size={20} color="#10b981" style={{ margin: '0 auto 8px' }} />
          <p style={{ fontSize: 18, fontWeight: 700, color: '#10b981' }}>
            {leaderboard.reduce((sum, e) => sum + e.answers, 0)}
          </p>
          <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Total Answers</p>
        </div>
      </div>
    </div>
  );
};

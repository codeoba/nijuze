import React from 'react';
import { useRouter } from '../router/Router';
import { Leaderboard } from '../components/Leaderboard';
import { Trophy, ArrowLeft, ChevronRight, Award, Flame, Users, Sparkles } from 'lucide-react';

export const LeaderboardPage: React.FC = () => {
  const { navigate } = useRouter();

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', paddingBottom: 64 }}>
      {/* Breadcrumb Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-muted)' }}>
          <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0 }}>
            Nyumbani
          </button>
          <ChevronRight size={14} />
          <span style={{ color: 'var(--btn-ghost-text)', fontWeight: 600 }}>Orodha ya Viongozi & Wanachama Bora</span>
        </div>

        <button
          onClick={() => navigate('/')}
          className="btn-ghost"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, padding: '6px 14px', cursor: 'pointer' }}
        >
          <ArrowLeft size={16} /> Rudi Nyumbani
        </button>
      </div>

      {/* Hero Banner */}
      <div
        className="glass-card"
        style={{
          padding: 32,
          marginBottom: 28,
          position: 'relative',
          overflow: 'hidden',
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(147, 51, 234, 0.1))',
          border: '1px solid var(--border-app)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 16,
              background: 'linear-gradient(135deg, #f59e0b, #d97706)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 6px 20px rgba(245, 158, 11, 0.35)',
              flexShrink: 0,
            }}
          >
            <Trophy size={28} color="white" />
          </div>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-main)', marginBottom: 6 }}>
              Orodha ya Viongozi (Leaderboard)
            </h1>
            <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.5 }}>
              Tazama wanachama wanaochangia zaidi maarifa, kujibu maswali na kupokea kura nyingi zaidi kwenye jamii ya Nijuze.
            </p>
          </div>
        </div>
      </div>

      {/* Main Leaderboard Table & Info */}
      <div className="glass-card" style={{ padding: 24 }}>
        <Leaderboard />
      </div>
    </div>
  );
};

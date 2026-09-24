import React, { useState, useEffect } from 'react';
import { Gift, Star, Flame, Trophy, X, Sparkles } from 'lucide-react';
import { useApp } from '../contexts/AppContext';

interface Reward {
  id: string;
  name: string;
  description: string;
  points: number;
  icon: string;
  type: 'badge' | 'title' | 'perk';
  isUnlocked: boolean;
}

interface DailyChallenge {
  id: string;
  title: string;
  description: string;
  points: number;
  isCompleted: boolean;
  expiresAt: string;
}

export const RewardsSystem: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { currentUser, posts, comments } = useApp();
  const [userPoints, setUserPoints] = useState(0);
  const [streak, setStreak] = useState(7);
  const [dailyChallenge, setDailyChallenge] = useState<DailyChallenge | null>(null);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [showClaimSuccess, setShowClaimSuccess] = useState(false);

  useEffect(() => {
    if (isOpen && currentUser) {
      // Calculate user points
      const userPosts = posts.filter(p => p.authorId === currentUser.id).length;
      const userComments = Object.values(comments).flat().filter(c => c.authorId === currentUser.id).length;
      const totalUpvotes = posts.filter(p => p.authorId === currentUser.id).reduce((sum, p) => sum + p.upvotes, 0);
      
      const points = (userPosts * 10) + (userComments * 5) + (totalUpvotes * 2) + currentUser.reputation;
      setUserPoints(points);

      // Daily challenge
      setDailyChallenge({
        id: 'daily-1',
        title: 'Changia Leo!',
        description: 'Toa jibu 1 au chapisha post 1',
        points: 50,
        isCompleted: userPosts > 0 || userComments > 0,
        expiresAt: new Date(Date.now() + 86400000).toISOString(),
      });

      // Available rewards
      setRewards([
        {
          id: 'r1',
          name: 'Badge ya Dhahabu',
          description: 'Badge maalum ya dhahabu kwenye profile yako',
          points: 500,
          icon: '🏆',
          type: 'badge',
          isUnlocked: points >= 500,
        },
        {
          id: 'r2',
          name: 'Title ya Mtaalamu',
          description: 'Pata title ya "Mtaalamu" kwenye profile',
          points: 1000,
          icon: '⭐',
          type: 'title',
          isUnlocked: points >= 1000,
        },
        {
          id: 'r3',
          name: 'Featured Post',
          description: 'Post yako itaonyeshwa kwenye homepage kwa siku 1',
          points: 750,
          icon: '🌟',
          type: 'perk',
          isUnlocked: points >= 750,
        },
        {
          id: 'r4',
          name: 'Custom Avatar',
          description: 'Weka avatar yako maalum',
          points: 300,
          icon: '🎨',
          type: 'perk',
          isUnlocked: points >= 300,
        },
        {
          id: 'r5',
          name: 'Priority Support',
          description: 'Pata msaada wa kwanza kutoka kwa timu',
          points: 1500,
          icon: '💎',
          type: 'perk',
          isUnlocked: points >= 1500,
        },
      ]);
    }
  }, [isOpen, currentUser, posts, comments]);

  const handleClaimReward = (reward: Reward) => {
    if (userPoints >= reward.points && !reward.isUnlocked) {
      setUserPoints(userPoints - reward.points);
      setRewards(rewards.map(r => r.id === reward.id ? { ...r, isUnlocked: true } : r));
      setShowClaimSuccess(true);
      setTimeout(() => setShowClaimSuccess(false), 3000);
    }
  };

  const handleClaimDaily = () => {
    if (dailyChallenge && !dailyChallenge.isCompleted) {
      setUserPoints(userPoints + dailyChallenge.points);
      setDailyChallenge({ ...dailyChallenge, isCompleted: true });
      setShowClaimSuccess(true);
      setTimeout(() => setShowClaimSuccess(false), 3000);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="glass-card"
        style={{
          width: '100%',
          maxWidth: 800,
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
            <Gift size={24} color="#fbbf24" />
            Mfumo wa Zawadi
          </h2>
          <button
            onClick={onClose}
            style={{ padding: 8, borderRadius: 8, background: 'transparent', border: 'none', cursor: 'pointer' }}
          >
            <X size={20} color="#cbd5e1" />
          </button>
        </div>

        {/* Success Message */}
        {showClaimSuccess && (
          <div style={{
            padding: 16,
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(5, 150, 105, 0.1))',
            borderBottom: '1px solid rgba(16, 185, 129, 0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}>
            <Sparkles size={20} color="#10b981" />
            <span style={{ fontSize: 14, color: '#10b981', fontWeight: 600 }}>
              Hongera! Umefanikiwa kupata zawadi! 🎉
            </span>
          </div>
        )}

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 20 }}>
          {/* Points Summary */}
          <div style={{
            padding: 20,
            borderRadius: 16,
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(147, 51, 234, 0.1))',
            border: '1px solid rgba(99, 102, 241, 0.3)',
            marginBottom: 20,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div>
                <p style={{ fontSize: 14, color: '#94a3b8', marginBottom: 4 }}>Points Zako</p>
                <p style={{ fontSize: 36, fontWeight: 700, color: '#a5b4fc' }}>
                  {userPoints.toLocaleString()}
                </p>
              </div>
              <div style={{
                padding: '12px 20px',
                borderRadius: 16,
                background: 'rgba(251, 191, 36, 0.2)',
                border: '1px solid rgba(251, 191, 36, 0.3)',
                textAlign: 'center',
              }}>
                <Flame size={24} color="#fbbf24" style={{ margin: '0 auto 4px' }} />
                <p style={{ fontSize: 20, fontWeight: 700, color: '#fbbf24' }}>{streak}</p>
                <p style={{ fontSize: 11, color: '#fcd34d' }}>Siku Streak</p>
              </div>
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 12,
            }}>
              <div style={{ textAlign: 'center', padding: 12, borderRadius: 12, background: 'rgba(30, 41, 59, 0.3)' }}>
                <p style={{ fontSize: 18, fontWeight: 700, color: '#10b981' }}>+10</p>
                <p style={{ fontSize: 11, color: '#64748b' }}>Kwa Post</p>
              </div>
              <div style={{ textAlign: 'center', padding: 12, borderRadius: 12, background: 'rgba(30, 41, 59, 0.3)' }}>
                <p style={{ fontSize: 18, fontWeight: 700, color: '#60a5fa' }}>+5</p>
                <p style={{ fontSize: 11, color: '#64748b' }}>Kwa Comment</p>
              </div>
              <div style={{ textAlign: 'center', padding: 12, borderRadius: 12, background: 'rgba(30, 41, 59, 0.3)' }}>
                <p style={{ fontSize: 18, fontWeight: 700, color: '#f472b6' }}>+2</p>
                <p style={{ fontSize: 11, color: '#64748b' }}>Kwa Upvote</p>
              </div>
            </div>
          </div>

          {/* Daily Challenge */}
          {dailyChallenge && (
            <div style={{
              padding: 20,
              borderRadius: 16,
              background: 'rgba(30, 41, 59, 0.3)',
              border: '1px solid rgba(51, 65, 85, 0.3)',
              marginBottom: 20,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <h3 style={{ fontSize: 16, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Star size={20} color="#fbbf24" />
                  Changuo ya Kila Siku
                </h3>
                <span style={{
                  padding: '4px 12px',
                  borderRadius: 12,
                  background: dailyChallenge.isCompleted ? 'rgba(16, 185, 129, 0.2)' : 'rgba(251, 191, 36, 0.2)',
                  color: dailyChallenge.isCompleted ? '#10b981' : '#fbbf24',
                  fontSize: 12,
                  fontWeight: 600,
                }}>
                  {dailyChallenge.isCompleted ? '✓ Imekamilika' : `+${dailyChallenge.points} pts`}
                </span>
              </div>
              <h4 style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>{dailyChallenge.title}</h4>
              <p style={{ fontSize: 13, color: '#94a3b8', marginBottom: 12 }}>{dailyChallenge.description}</p>
              {!dailyChallenge.isCompleted && (
                <button
                  onClick={handleClaimDaily}
                  className="btn-primary"
                  style={{ width: '100%' }}
                >
                  Dai Zawadi
                </button>
              )}
            </div>
          )}

          {/* Rewards Grid */}
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Trophy size={20} color="#a5b4fc" />
            Zawadi Zinazopatikana
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
            {rewards.map((reward) => (
              <div
                key={reward.id}
                style={{
                  padding: 20,
                  borderRadius: 16,
                  background: reward.isUnlocked
                    ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(5, 150, 105, 0.1))'
                    : 'rgba(30, 41, 59, 0.3)',
                  border: `1px solid ${reward.isUnlocked ? 'rgba(16, 185, 129, 0.3)' : 'rgba(51, 65, 85, 0.3)'}`,
                  opacity: reward.isUnlocked ? 1 : userPoints >= reward.points ? 1 : 0.6,
                }}
              >
                <div style={{ fontSize: 48, marginBottom: 12, textAlign: 'center' }}>
                  {reward.icon}
                </div>
                <h4 style={{ fontSize: 15, fontWeight: 600, marginBottom: 4, textAlign: 'center' }}>
                  {reward.name}
                </h4>
                <p style={{ fontSize: 12, color: '#94a3b8', marginBottom: 12, textAlign: 'center', lineHeight: 1.4 }}>
                  {reward.description}
                </p>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 12,
                }}>
                  <span style={{ fontSize: 13, color: '#fbbf24', fontWeight: 600 }}>
                    {reward.points} points
                  </span>
                  <span style={{
                    fontSize: 11,
                    color: '#64748b',
                    textTransform: 'capitalize',
                    padding: '2px 8px',
                    borderRadius: 8,
                    background: 'rgba(30, 41, 59, 0.5)',
                  }}>
                    {reward.type}
                  </span>
                </div>
                {reward.isUnlocked ? (
                  <div style={{
                    padding: 8,
                    borderRadius: 8,
                    background: 'rgba(16, 185, 129, 0.2)',
                    textAlign: 'center',
                    fontSize: 13,
                    color: '#10b981',
                    fontWeight: 600,
                  }}>
                    ✓ Imedaiwa
                  </div>
                ) : (
                  <button
                    onClick={() => handleClaimReward(reward)}
                    disabled={userPoints < reward.points}
                    className="btn-primary"
                    style={{
                      width: '100%',
                      opacity: userPoints >= reward.points ? 1 : 0.5,
                      cursor: userPoints >= reward.points ? 'pointer' : 'not-allowed',
                    }}
                  >
                    Dai Sasa
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

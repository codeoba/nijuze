import React, { useState, useEffect } from 'react';
import { Target, Trophy, Clock, CheckCircle2, Star, Zap } from 'lucide-react';
import { useApp } from '../contexts/AppContext';

interface Challenge {
  id: string;
  title: string;
  description: string;
  type: 'post' | 'comment' | 'upvote' | 'follow' | 'share';
  target: number;
  current: number;
  reward: number;
  expiresAt: Date;
  completed: boolean;
}

export const DailyChallenges: React.FC = () => {
  const { currentUser, posts, comments } = useApp();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [claimedRewards, setClaimedRewards] = useState<string[]>([]);

  useEffect(() => {
    if (!currentUser) return;

    // Generate daily challenges
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    const userPosts = posts.filter(p => p.authorId === currentUser.id);
    const userComments = comments.filter(c => c.authorId === currentUser.id);
    const todayPosts = userPosts.filter(p => {
      const postDate = new Date(p.createdAt);
      return postDate.toDateString() === new Date().toDateString();
    });
    const todayComments = userComments.filter(c => {
      const commentDate = new Date(c.createdAt);
      return commentDate.toDateString() === new Date().toDateString();
    });

    const dailyChallenges: Challenge[] = [
      {
        id: 'challenge-1',
        title: 'Mchangiaji wa Leo',
        description: 'Chapisha post 1 leo',
        type: 'post',
        target: 1,
        current: todayPosts.length,
        reward: 50,
        expiresAt: today,
        completed: todayPosts.length >= 1,
      },
      {
        id: 'challenge-2',
        title: 'Msaidizi',
        description: 'Toa majibu 3 leo',
        type: 'comment',
        target: 3,
        current: todayComments.length,
        reward: 75,
        expiresAt: today,
        completed: todayComments.length >= 3,
      },
      {
        id: 'challenge-3',
        title: 'Mshiriki Active',
        description: 'Piga upvote posts 10',
        type: 'upvote',
        target: 10,
        current: Math.min(userPosts.reduce((sum, p) => sum + (p.isUpvoted ? 1 : 0), 0), 10),
        reward: 30,
        expiresAt: today,
        completed: userPosts.filter(p => p.isUpvoted).length >= 10,
      },
      {
        id: 'challenge-4',
        title: 'Mtandao',
        description: 'Fuata watu 5 wapya',
        type: 'follow',
        target: 5,
        current: Math.min(currentUser.following, 5),
        reward: 40,
        expiresAt: today,
        completed: currentUser.following >= 5,
      },
      {
        id: 'challenge-5',
        title: 'Mshawishi',
        description: 'Shiriki post 2',
        type: 'share',
        target: 2,
        current: 0, // Would need to track shares
        reward: 60,
        expiresAt: today,
        completed: false,
      },
    ];

    setChallenges(dailyChallenges);

    // Load claimed rewards
    const claimed = localStorage.getItem(`claimed_rewards_${currentUser.id}_${new Date().toDateString()}`);
    if (claimed) {
      setClaimedRewards(JSON.parse(claimed));
    }
  }, [currentUser, posts, comments]);

  const claimReward = (challengeId: string, reward: number) => {
    if (!currentUser) return;
    
    setClaimedRewards([...claimedRewards, challengeId]);
    localStorage.setItem(
      `claimed_rewards_${currentUser.id}_${new Date().toDateString()}`,
      JSON.stringify([...claimedRewards, challengeId])
    );

    // In production, this would update user's points in the database
    alert(`Hongera! Umepata points ${reward}! 🎉`);
  };

  const getProgressColor = (current: number, target: number) => {
    const percentage = (current / target) * 100;
    if (percentage >= 100) return '#10b981';
    if (percentage >= 75) return '#22c55e';
    if (percentage >= 50) return '#eab308';
    if (percentage >= 25) return '#f59e0b';
    return '#ef4444';
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'post': return '📝';
      case 'comment': return '💬';
      case 'upvote': return '👍';
      case 'follow': return '👥';
      case 'share': return '🔗';
      default: return '🎯';
    }
  };

  if (!currentUser) return null;

  const completedCount = challenges.filter(c => c.completed).length;
  const claimedCount = claimedRewards.length;
  const totalReward = challenges.reduce((sum, c) => sum + c.reward, 0);
  const claimedReward = challenges
    .filter(c => claimedRewards.includes(c.id))
    .reduce((sum, c) => sum + c.reward, 0);

  return (
    <div className="glass-card" style={{ padding: 24 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Target size={24} color="#fbbf24" />
          <div>
            <h3 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>Changamoto za Kila Siku</h3>
            <p style={{ fontSize: 13, color: '#94a3b8', margin: 0 }}>
              Kamilisha changamoto kupata points!
            </p>
          </div>
        </div>
        <div style={{
          padding: '8px 16px',
          borderRadius: 12,
          background: 'rgba(251, 191, 36, 0.1)',
          border: '1px solid rgba(251, 191, 36, 0.3)',
          textAlign: 'center',
        }}>
          <p style={{ fontSize: 12, color: '#fcd34d', margin: 0 }}>Points</p>
          <p style={{ fontSize: 20, fontWeight: 700, color: '#fbbf24', margin: 0 }}>
            {claimedReward}/{totalReward}
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontSize: 13, color: '#94a3b8' }}>
            Maendeleo: {completedCount}/{challenges.length}
          </span>
          <span style={{ fontSize: 13, color: '#94a3b8' }}>
            Zilizodaiwa: {claimedCount}/{completedCount}
          </span>
        </div>
        <div style={{
          height: 8,
          borderRadius: 4,
          background: 'rgba(30, 41, 59, 0.5)',
          overflow: 'hidden',
        }}>
          <div style={{
            height: '100%',
            width: `${(completedCount / challenges.length) * 100}%`,
            background: 'linear-gradient(90deg, #fbbf24, #f59e0b)',
            borderRadius: 4,
            transition: 'width 0.5s ease',
          }} />
        </div>
      </div>

      {/* Challenges List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {challenges.map((challenge) => {
          const progress = Math.min((challenge.current / challenge.target) * 100, 100);
          const isClaimed = claimedRewards.includes(challenge.id);
          
          return (
            <div
              key={challenge.id}
              style={{
                padding: 16,
                borderRadius: 12,
                background: challenge.completed ? 'rgba(16, 185, 129, 0.05)' : 'rgba(30, 41, 59, 0.3)',
                border: `1px solid ${challenge.completed ? 'rgba(16, 185, 129, 0.3)' : 'rgba(51, 65, 85, 0.3)'}`,
                opacity: isClaimed ? 0.6 : 1,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
                <div style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  background: challenge.completed ? 'rgba(16, 185, 129, 0.2)' : 'rgba(251, 191, 36, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 20,
                  flexShrink: 0,
                }}>
                  {getTypeIcon(challenge.type)}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <h4 style={{ fontSize: 15, fontWeight: 600, margin: 0 }}>{challenge.title}</h4>
                    {challenge.completed && (
                      <CheckCircle2 size={16} color="#10b981" />
                    )}
                  </div>
                  <p style={{ fontSize: 13, color: '#94a3b8', margin: 0 }}>
                    {challenge.description}
                  </p>
                </div>
                <div style={{
                  padding: '4px 12px',
                  borderRadius: 12,
                  background: 'rgba(251, 191, 36, 0.2)',
                  border: '1px solid rgba(251, 191, 36, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                }}>
                  <Star size={12} color="#fbbf24" />
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#fbbf24' }}>
                    +{challenge.reward}
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 12, color: '#64748b' }}>
                    {challenge.current}/{challenge.target}
                  </span>
                  <span style={{ fontSize: 12, color: '#64748b' }}>
                    {Math.round(progress)}%
                  </span>
                </div>
                <div style={{
                  height: 6,
                  borderRadius: 3,
                  background: 'rgba(30, 41, 59, 0.5)',
                  overflow: 'hidden',
                }}>
                  <div style={{
                    height: '100%',
                    width: `${progress}%`,
                    background: getProgressColor(challenge.current, challenge.target),
                    borderRadius: 3,
                    transition: 'width 0.5s ease',
                  }} />
                </div>
              </div>

              {/* Action Button */}
              {challenge.completed && !isClaimed && (
                <button
                  onClick={() => claimReward(challenge.id, challenge.reward)}
                  className="btn-primary"
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                  }}
                >
                  <Trophy size={16} />
                  Dai Points
                </button>
              )}

              {isClaimed && (
                <div style={{
                  padding: 8,
                  borderRadius: 8,
                  background: 'rgba(16, 185, 129, 0.1)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  textAlign: 'center',
                  fontSize: 13,
                  color: '#10b981',
                  fontWeight: 600,
                }}>
                  ✓ Points Zimedaiwa
                </div>
              )}

              {/* Expiry */}
              <div style={{
                marginTop: 8,
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                fontSize: 11,
                color: '#64748b',
              }}>
                <Clock size={12} />
                Inaisha: {challenge.expiresAt.toLocaleTimeString('sw-TZ', { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

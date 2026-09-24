import React, { useState, useEffect } from 'react';
import { Trophy, Award, Star, Target, Flame, BookOpen, MessageCircle, ThumbsUp, Users, Crown, X } from 'lucide-react';
import { useApp } from '../contexts/AppContext';

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  requirement: number;
  progress: number;
  isUnlocked: boolean;
  unlockedAt?: string;
  category: 'posting' | 'engagement' | 'social' | 'special';
  points: number;
}

export const AchievementsModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { currentUser, posts, comments } = useApp();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [filter, setFilter] = useState<'all' | 'unlocked' | 'locked'>('all');

  useEffect(() => {
    if (isOpen && currentUser) {
      // Generate achievements based on user activity
      const userPosts = posts.filter(p => p.authorId === currentUser.id).length;
      const userComments = Object.values(comments).flat().filter(c => c.authorId === currentUser.id).length;
      const totalUpvotes = posts.filter(p => p.authorId === currentUser.id).reduce((sum, p) => sum + p.upvotes, 0);

      const achievementsList: Achievement[] = [
        {
          id: 'first-post',
          name: 'Mwandishi wa Kwanza',
          description: 'Chapisha post yako ya kwanza',
          icon: '🎉',
          requirement: 1,
          progress: Math.min(userPosts, 1),
          isUnlocked: userPosts >= 1,
          unlockedAt: userPosts >= 1 ? new Date().toISOString() : undefined,
          category: 'posting',
          points: 50,
        },
        {
          id: 'prolific-writer',
          name: 'Mwandishi Mzuri',
          description: 'Chapisha posts 10',
          icon: '✍️',
          requirement: 10,
          progress: userPosts,
          isUnlocked: userPosts >= 10,
          category: 'posting',
          points: 200,
        },
        {
          id: 'helpful-answerer',
          name: 'Msaidizi',
          description: 'Toa majibu 5',
          icon: '💡',
          requirement: 5,
          progress: Math.min(userComments, 5),
          isUnlocked: userComments >= 5,
          category: 'engagement',
          points: 100,
        },
        {
          id: 'expert-answerer',
          name: 'Mtaalamu',
          description: 'Toa majibu 50',
          icon: '🏆',
          requirement: 50,
          progress: userComments,
          isUnlocked: userComments >= 50,
          category: 'engagement',
          points: 500,
        },
        {
          id: 'popular-post',
          name: 'Post Maarufu',
          description: 'Pata upvotes 100',
          icon: '🔥',
          requirement: 100,
          progress: totalUpvotes,
          isUnlocked: totalUpvotes >= 100,
          category: 'engagement',
          points: 300,
        },
        {
          id: 'viral-post',
          name: 'Post ya Viral',
          description: 'Pata upvotes 500',
          icon: '🚀',
          requirement: 500,
          progress: totalUpvotes,
          isUnlocked: totalUpvotes >= 500,
          category: 'engagement',
          points: 1000,
        },
        {
          id: 'social-butterfly',
          name: 'Social Butterfly',
          description: 'Fuata watu 10',
          icon: '🦋',
          requirement: 10,
          progress: Math.min(currentUser.following, 10),
          isUnlocked: currentUser.following >= 10,
          category: 'social',
          points: 150,
        },
        {
          id: 'influencer',
          name: 'Influencer',
          description: 'Pata followers 100',
          icon: '⭐',
          requirement: 100,
          progress: currentUser.followers,
          isUnlocked: currentUser.followers >= 100,
          category: 'social',
          points: 500,
        },
        {
          id: 'streak-7',
          name: 'Mshiriki wa Daima',
          description: 'Ingia siku 7 mfululizo',
          icon: '🔥',
          requirement: 7,
          progress: 7,
          isUnlocked: true,
          unlockedAt: new Date().toISOString(),
          category: 'special',
          points: 200,
        },
        {
          id: 'verified',
          name: 'Mtu wa Kuaminika',
          icon: '✅',
          description: 'Thibitisha akaunti yako',
          requirement: 1,
          progress: currentUser.isVerified ? 1 : 0,
          isUnlocked: currentUser.isVerified,
          category: 'special',
          points: 100,
        },
      ];

      setAchievements(achievementsList);
    }
  }, [isOpen, currentUser, posts, comments]);

  const filteredAchievements = achievements.filter(a => {
    if (filter === 'unlocked') return a.isUnlocked;
    if (filter === 'locked') return !a.isUnlocked;
    return true;
  });

  const unlockedCount = achievements.filter(a => a.isUnlocked).length;
  const totalPoints = achievements.filter(a => a.isUnlocked).reduce((sum, a) => sum + a.points, 0);

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
            <Trophy size={24} color="#fbbf24" />
            Mafanikio Yako
          </h2>
          <button
            onClick={onClose}
            style={{ padding: 8, borderRadius: 8, background: 'transparent', border: 'none', cursor: 'pointer' }}
          >
            <X size={20} color="#cbd5e1" />
          </button>
        </div>

        {/* Stats Summary */}
        <div style={{
          padding: 16,
          borderBottom: '1px solid rgba(51, 65, 85, 0.3)',
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 16,
        }}>
          <div style={{ textAlign: 'center' }}>
            <Award size={24} color="#a5b4fc" style={{ margin: '0 auto 8px' }} />
            <p style={{ fontSize: 24, fontWeight: 700, color: '#a5b4fc' }}>{unlockedCount}</p>
            <p style={{ fontSize: 12, color: '#64748b' }}>Yamefunguliwa</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <Star size={24} color="#fbbf24" style={{ margin: '0 auto 8px' }} />
            <p style={{ fontSize: 24, fontWeight: 700, color: '#fbbf24' }}>{totalPoints}</p>
            <p style={{ fontSize: 12, color: '#64748b' }}>Points</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <Target size={24} color="#10b981" style={{ margin: '0 auto 8px' }} />
            <p style={{ fontSize: 24, fontWeight: 700, color: '#10b981' }}>{achievements.length - unlockedCount}</p>
            <p style={{ fontSize: 12, color: '#64748b' }}>Yamebaki</p>
          </div>
        </div>

        {/* Filters */}
        <div style={{
          padding: 16,
          borderBottom: '1px solid rgba(51, 65, 85, 0.3)',
          display: 'flex',
          gap: 8,
        }}>
          {(['all', 'unlocked', 'locked'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: '8px 16px',
                borderRadius: 20,
                background: filter === f ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
                border: `1px solid ${filter === f ? 'rgba(99, 102, 241, 0.5)' : 'rgba(51, 65, 85, 0.3)'}`,
                color: filter === f ? '#a5b4fc' : '#94a3b8',
                cursor: 'pointer',
                fontSize: 13,
                fontWeight: 500,
              }}
            >
              {f === 'all' ? 'Zote' : f === 'unlocked' ? 'Zimefunguliwa' : 'Hazijafunguliwa'}
            </button>
          ))}
        </div>

        {/* Achievements List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 16 }}>
            {filteredAchievements.map((achievement) => (
              <div
                key={achievement.id}
                style={{
                  padding: 20,
                  borderRadius: 16,
                  background: achievement.isUnlocked
                    ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(147, 51, 234, 0.1))'
                    : 'rgba(30, 41, 59, 0.3)',
                  border: `1px solid ${achievement.isUnlocked ? 'rgba(99, 102, 241, 0.3)' : 'rgba(51, 65, 85, 0.3)'}`,
                  opacity: achievement.isUnlocked ? 1 : 0.7,
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {achievement.isUnlocked && (
                  <div style={{
                    position: 'absolute',
                    top: 12,
                    right: 12,
                    background: 'rgba(16, 185, 129, 0.2)',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    borderRadius: 12,
                    padding: '4px 8px',
                    fontSize: 11,
                    color: '#10b981',
                    fontWeight: 600,
                  }}>
                    ✓ Imefunguliwa
                  </div>
                )}

                <div style={{ fontSize: 48, marginBottom: 12 }}>
                  {achievement.icon}
                </div>

                <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>
                  {achievement.name}
                </h3>

                <p style={{ fontSize: 13, color: '#94a3b8', marginBottom: 12, lineHeight: 1.4 }}>
                  {achievement.description}
                </p>

                {/* Progress Bar */}
                <div style={{ marginBottom: 12 }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: 12,
                    color: '#64748b',
                    marginBottom: 4,
                  }}>
                    <span>{achievement.progress} / {achievement.requirement}</span>
                    <span>{Math.min(100, Math.round((achievement.progress / achievement.requirement) * 100))}%</span>
                  </div>
                  <div style={{
                    height: 6,
                    borderRadius: 3,
                    background: 'rgba(30, 41, 59, 0.5)',
                    overflow: 'hidden',
                  }}>
                    <div style={{
                      height: '100%',
                      width: `${Math.min(100, (achievement.progress / achievement.requirement) * 100)}%`,
                      background: achievement.isUnlocked
                        ? 'linear-gradient(90deg, #10b981, #059669)'
                        : 'linear-gradient(90deg, #6366f1, #9333ea)',
                      borderRadius: 3,
                      transition: 'width 0.5s ease',
                    }} />
                  </div>
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}>
                  <span style={{
                    fontSize: 12,
                    color: '#fbbf24',
                    fontWeight: 600,
                  }}>
                    +{achievement.points} points
                  </span>
                  <span style={{
                    fontSize: 11,
                    color: '#64748b',
                    textTransform: 'capitalize',
                  }}>
                    {achievement.category}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

import { User, Post, Comment } from '../types';
import { db } from './database';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  requirement: number;
  category: 'posting' | 'engagement' | 'social' | 'special';
  points: number;
}

export const ACHIEVEMENTS: Achievement[] = [
  // Posting Achievements
  {
    id: 'first-post',
    name: 'Mwandishi wa Kwanza',
    description: 'Chapisha post yako ya kwanza',
    icon: '🎉',
    requirement: 1,
    category: 'posting',
    points: 50,
  },
  {
    id: 'prolific-writer',
    name: 'Mwandishi Mzuri',
    description: 'Chapisha posts 10',
    icon: '✍️',
    requirement: 10,
    category: 'posting',
    points: 200,
  },
  {
    id: 'master-writer',
    name: 'Mwandishi Bora',
    description: 'Chapisha posts 50',
    icon: '📝',
    requirement: 50,
    category: 'posting',
    points: 500,
  },
  
  // Engagement Achievements
  {
    id: 'first-comment',
    name: 'Msaidizi',
    description: 'Toa jibu lako la kwanza',
    icon: '💬',
    requirement: 1,
    category: 'engagement',
    points: 30,
  },
  {
    id: 'helpful-answerer',
    name: 'Msaada Mkubwa',
    description: 'Toa majibu 25',
    icon: '💡',
    requirement: 25,
    category: 'engagement',
    points: 300,
  },
  {
    id: 'expert-answerer',
    name: 'Mtaalamu',
    description: 'Toa majibu 100',
    icon: '🏆',
    requirement: 100,
    category: 'engagement',
    points: 1000,
  },
  {
    id: 'popular-post',
    name: 'Post Maarufu',
    description: 'Pata upvotes 50 kwenye post moja',
    icon: '🔥',
    requirement: 50,
    category: 'engagement',
    points: 250,
  },
  {
    id: 'viral-post',
    name: 'Post ya Viral',
    description: 'Pata upvotes 200 kwenye post moja',
    icon: '🚀',
    requirement: 200,
    category: 'engagement',
    points: 800,
  },
  
  // Social Achievements
  {
    id: 'first-follow',
    name: 'Mrafiki',
    description: 'Fuata mtu wa kwanza',
    icon: '👥',
    requirement: 1,
    category: 'social',
    points: 20,
  },
  {
    id: 'social-butterfly',
    name: 'Social Butterfly',
    description: 'Fuata watu 10',
    icon: '🦋',
    requirement: 10,
    category: 'social',
    points: 100,
  },
  {
    id: 'influencer',
    name: 'Influencer',
    description: 'Pata followers 50',
    icon: '⭐',
    requirement: 50,
    category: 'social',
    points: 500,
  },
  {
    id: 'celebrity',
    name: 'Celeb',
    description: 'Pata followers 200',
    icon: '🌟',
    requirement: 200,
    category: 'social',
    points: 1500,
  },
  
  // Special Achievements
  {
    id: 'streak-7',
    name: 'Mshiriki wa Daima',
    description: 'Ingia siku 7 mfululizo',
    icon: '🔥',
    requirement: 7,
    category: 'special',
    points: 200,
  },
  {
    id: 'verified',
    name: 'Mtu wa Kuaminika',
    description: 'Thibitisha akaunti yako',
    icon: '✅',
    requirement: 1,
    category: 'special',
    points: 100,
  },
];

export const checkAchievements = (userId: string): Achievement[] => {
  const user = db.getUserById(userId);
  if (!user) return [];
  
  const userPosts = db.getPostsByUser(userId);
  const userComments = db.getComments().filter(c => c.authorId === userId);
  const earnedAchievements: Achievement[] = [];
  
  ACHIEVEMENTS.forEach(achievement => {
    let earned = false;
    
    switch (achievement.id) {
      case 'first-post':
        earned = userPosts.length >= 1;
        break;
      case 'prolific-writer':
        earned = userPosts.length >= 10;
        break;
      case 'master-writer':
        earned = userPosts.length >= 50;
        break;
      case 'first-comment':
        earned = userComments.length >= 1;
        break;
      case 'helpful-answerer':
        earned = userComments.length >= 25;
        break;
      case 'expert-answerer':
        earned = userComments.length >= 100;
        break;
      case 'popular-post':
        earned = userPosts.some(p => p.upvotes >= 50);
        break;
      case 'viral-post':
        earned = userPosts.some(p => p.upvotes >= 200);
        break;
      case 'first-follow':
        earned = user.following >= 1;
        break;
      case 'social-butterfly':
        earned = user.following >= 10;
        break;
      case 'influencer':
        earned = user.followers >= 50;
        break;
      case 'celebrity':
        earned = user.followers >= 200;
        break;
      case 'verified':
        earned = user.isVerified;
        break;
    }
    
    if (earned) {
      earnedAchievements.push(achievement);
    }
  });
  
  return earnedAchievements;
};

export const awardAchievement = (userId: string, achievement: Achievement): void => {
  const user = db.getUserById(userId);
  if (!user) return;
  
  const userBadges = Array.isArray(user.badges) ? user.badges : [];

  // Check if already earned
  const alreadyEarned = userBadges.some(b => b.id === achievement.id);
  if (alreadyEarned) return;
  
  // Add badge
  const badge = {
    id: achievement.id,
    name: achievement.name,
    icon: achievement.icon,
    description: achievement.description,
    earnedAt: new Date().toISOString(),
  };
  
  db.updateUser(userId, {
    badges: [...userBadges, badge],
    reputation: (user.reputation || 0) + achievement.points,
  });
  
  // Create notification
  db.createNotification({
    userId,
    type: 'badge',
    message: `Umepata badge mpya: ${achievement.icon} ${achievement.name}!`,
    link: `/profile/${userId}`,
    fromUserId: userId,
  });
};

export const checkAndAwardAchievements = (userId: string): void => {
  const earned = checkAchievements(userId);
  const user = db.getUserById(userId);
  if (!user) return;
  
  const userBadges = Array.isArray(user.badges) ? user.badges : [];

  earned.forEach(achievement => {
    const alreadyEarned = userBadges.some(b => b.id === achievement.id);
    if (!alreadyEarned) {
      awardAchievement(userId, achievement);
    }
  });
};

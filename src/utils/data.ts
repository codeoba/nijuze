import { User, Post, Comment, Notification } from '../types';

// Generate unique ID
export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Format date
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'Sasa hivi';
  if (diffInSeconds < 3600) return `Dakika ${Math.floor(diffInSeconds / 60)} zilizopita`;
  if (diffInSeconds < 86400) return `Saa ${Math.floor(diffInSeconds / 3600)} zilizopita`;
  if (diffInSeconds < 604800) return `Siku ${Math.floor(diffInSeconds / 86400)} zilizopita`;
  return date.toLocaleDateString('sw-TZ');
};

// LocalStorage helpers
export const storage = {
  get: <T>(key: string, defaultValue: T): T => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  },

  set: <T>(key: string, value: T): void => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  },

  remove: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing from localStorage:', error);
    }
  },
};

// Sample data generators
export const generateSampleUsers = (): User[] => [
  {
    id: 'user1',
    username: 'Amina Hassan',
    email: 'amina@example.com',
    avatar: 'AH',
    role: 'Mtaalam wa AI',
    bio: 'Data Scientist na ML Engineer yenye uzoefu wa miaka 5+',
    joinedAt: '2024-01-15T00:00:00Z',
    followers: 1240,
    following: 89,
    postsCount: 234,
    answersCount: 567,
    reputation: 12400,
    badges: [
      { id: 'b1', name: 'Mtaalam', icon: '🏆', description: 'Majibu 100+', earnedAt: '2024-03-01' },
      { id: 'b2', name: 'Mwandishi Bora', icon: '✍️', description: 'Posts 50+', earnedAt: '2024-02-15' },
    ],
    isVerified: true,
  },
  {
    id: 'user2',
    username: 'Juma Bakari',
    email: 'juma@example.com',
    avatar: 'JB',
    role: 'Software Engineer',
    bio: 'Full-stack developer, React & Node.js expert',
    joinedAt: '2024-02-01T00:00:00Z',
    followers: 980,
    following: 156,
    postsCount: 189,
    answersCount: 423,
    reputation: 9800,
    badges: [
      { id: 'b3', name: 'Developer Pro', icon: '💻', description: 'Code posts 100+', earnedAt: '2024-04-01' },
    ],
    isVerified: true,
  },
  {
    id: 'user3',
    username: 'Fatma Omar',
    email: 'fatma@example.com',
    avatar: 'FO',
    role: 'Data Scientist',
    bio: 'Blockchain enthusiast na researcher',
    joinedAt: '2024-03-10T00:00:00Z',
    followers: 820,
    following: 67,
    postsCount: 156,
    answersCount: 298,
    reputation: 8200,
    badges: [],
    isVerified: true,
  },
  {
    id: 'user4',
    username: 'David Mwangi',
    email: 'david@example.com',
    avatar: 'DM',
    role: 'UX Designer',
    bio: 'Creating beautiful user experiences for Africa',
    joinedAt: '2024-01-20T00:00:00Z',
    followers: 650,
    following: 234,
    postsCount: 98,
    answersCount: 187,
    reputation: 6500,
    badges: [],
    isVerified: false,
  },
];

export const generateSamplePosts = (_users: User[]): Post[] => [];

export const generateSampleComments = (_users: User[], _postId: string): Comment[] => [];

export const generateSampleNotifications = (_users: User[]): Notification[] => [];


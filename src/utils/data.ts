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

export const generateSamplePosts = (users: User[]): Post[] => [
  {
    id: 'post1',
    authorId: 'user1',
    author: users[0],
    title: 'Je, ni njia bora zipi za kujifunza Machine Learning mwaka 2026?',
    content: 'Nimekuwa nikijifunza ML kwa miezi 3 na nataka kujua njia bora za kuendelea. Je, ni resources gani mnazopendekeza? Nimeanza na Python basics na sasa niko kwenye pandas na numpy.',
    tags: ['Machine Learning', 'AI', 'Teknolojia', 'Kujifunza'],
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    upvotes: 342,
    downvotes: 12,
    commentsCount: 47,
    views: 2840,
    shares: 89,
    bookmarks: 156,
    reactions: { '🔥': ['user2', 'user3'], '💡': ['user4'], '❤️': ['user2'] },
    isUpvoted: false,
    isDownvoted: false,
    isBookmarked: false,
    isPinned: true,
    isAnonymous: false,
    category: 'Teknolojia',
  },
  {
    id: 'post2',
    authorId: 'user2',
    author: users[1],
    title: 'Tofauti kati ya React na Vue.js ni zipi? Nipi ni bora kwa project kubwa?',
    content: 'Nina project kubwa ya enterprise na nataka kuchagua framework sahihi. React ina ecosystem kubwa lakini Vue ni rahisi. Je, mtaalamu yeyote anaweza kunitoa ushauri?',
    tags: ['React', 'Vue.js', 'Web Development', 'Frontend'],
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    upvotes: 218,
    downvotes: 8,
    commentsCount: 34,
    views: 1920,
    shares: 56,
    bookmarks: 98,
    reactions: { '🔥': ['user1'], '💡': ['user3', 'user4'] },
    isUpvoted: true,
    isDownvoted: false,
    isBookmarked: true,
    isPinned: false,
    isAnonymous: false,
    category: 'Programming',
  },
  {
    id: 'post3',
    authorId: 'user3',
    author: users[2],
    title: 'Je, blockchain inaweza kutumikaje katika sekta ya afya Tanzania?',
    content: 'Ninafanya research kuhusu blockchain na nataka kujua applications zake katika healthcare. Je, kuna mfano wowote wa matumizi ya blockchain katika sekta ya afya Afrika?',
    tags: ['Blockchain', 'Afya', 'Innovation', 'Tanzania'],
    createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    upvotes: 187,
    downvotes: 5,
    commentsCount: 28,
    views: 1540,
    shares: 43,
    bookmarks: 72,
    reactions: { '💡': ['user1', 'user2'] },
    isUpvoted: false,
    isDownvoted: false,
    isBookmarked: false,
    isPinned: false,
    isAnonymous: false,
    category: 'Innovation',
  },
  {
    id: 'post4',
    authorId: 'user4',
    author: users[3],
    title: 'Design principles zipi ni muhimu zaidi kwa kuunda mobile apps za Afrika Mashariki?',
    content: 'Ninaunda app kwa East Africa market na nataka kuhakikisha design inaendana na mahitaji ya watumiaji wetu. Je, kuna considerations maalum za UX/UI kwa region yetu?',
    tags: ['UX Design', 'Mobile Apps', 'Africa', 'Design'],
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    upvotes: 156,
    downvotes: 3,
    commentsCount: 22,
    views: 1230,
    shares: 34,
    bookmarks: 67,
    reactions: { '❤️': ['user1'] },
    isUpvoted: false,
    isDownvoted: false,
    isBookmarked: false,
    isPinned: false,
    isAnonymous: false,
    category: 'Design',
  },
];

export const generateSampleComments = (users: User[], postId: string): Comment[] => [
  {
    id: 'comment1',
    postId,
    authorId: 'user2',
    author: users[1],
    content: 'Nakubaliana sana na hili. Pia ningependekeza kutumia resources za free kama freeCodeCamp na Kaggle competitions.',
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    upvotes: 12,
    downvotes: 0,
    isUpvoted: false,
    isDownvoted: false,
    isBestAnswer: true,
    replies: [],
  },
  {
    id: 'comment2',
    postId,
    authorId: 'user3',
    author: users[2],
    content: 'Asante kwa swali hili! Nimejifunza mengi kutoka kwenye majibu. Pia jaribu Fast.ai courses.',
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    upvotes: 8,
    downvotes: 0,
    isUpvoted: false,
    isDownvoted: false,
    isBestAnswer: false,
    replies: [],
  },
  {
    id: 'comment3',
    postId,
    authorId: 'user4',
    author: users[3],
    content: 'Ningependa kuongeza kwamba practice ni muhimu sana. Jaribu kufanya projects halisi badala ya tutorials tu.',
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    upvotes: 5,
    downvotes: 0,
    isUpvoted: false,
    isDownvoted: false,
    isBestAnswer: false,
    replies: [],
  },
];

export const generateSampleNotifications = (users: User[]): Notification[] => [
  {
    id: 'notif1',
    userId: 'currentUser',
    type: 'upvote',
    message: 'Amina amepiga upvote swali lako',
    link: '/post/post1',
    createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    isRead: false,
    fromUser: users[0],
  },
  {
    id: 'notif2',
    userId: 'currentUser',
    type: 'comment',
    message: 'Juma amejibu swali lako',
    link: '/post/post2',
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    isRead: false,
    fromUser: users[1],
  },
  {
    id: 'notif3',
    userId: 'currentUser',
    type: 'follow',
    message: 'Fatma amekufuata',
    link: '/profile/user3',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    isRead: true,
    fromUser: users[2],
  },
  {
    id: 'notif4',
    userId: 'currentUser',
    type: 'badge',
    message: 'Umepata badge mpya: Mwandishi Bora ✍️',
    link: '/badges',
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    isRead: true,
  },
];

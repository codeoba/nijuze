export interface User {
  id: string;
  username: string;
  email: string;
  avatar: string;
  role: string;
  bio: string;
  joinedAt: string;
  followers: number;
  following: number;
  postsCount: number;
  answersCount: number;
  reputation: number;
  badges: Badge[];
  isVerified: boolean;
  isFollowing?: boolean;
}

export interface Badge {
  id: string;
  name: string;
  icon: string;
  description: string;
  earnedAt: string;
}

export interface Post {
  id: string;
  authorId: string;
  author: User;
  title: string;
  content: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  upvotes: number;
  downvotes: number;
  commentsCount: number;
  views: number;
  shares: number;
  bookmarks: number;
  reactions: { [emoji: string]: string[] };
  isUpvoted: boolean;
  isDownvoted: boolean;
  isBookmarked: boolean;
  isPinned: boolean;
  isAnonymous: boolean;
  isRead?: boolean;
  category: string;
}

export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  author: User;
  content: string;
  createdAt: string;
  updatedAt: string;
  upvotes: number;
  downvotes: number;
  isUpvoted: boolean;
  isDownvoted: boolean;
  isBestAnswer: boolean;
  replies: Comment[];
}

export interface Notification {
  id: string;
  userId: string;
  type: 'upvote' | 'comment' | 'follow' | 'mention' | 'badge' | 'answer';
  message: string;
  link: string;
  createdAt: string;
  isRead: boolean;
  fromUser?: User;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  description: string;
  postsCount: number;
  followersCount: number;
}

export interface TrendingTopic {
  id: string;
  name: string;
  postsCount: number;
  growth: number;
  category: string;
}

export interface Analytics {
  totalPosts: number;
  totalComments: number;
  totalUsers: number;
  totalViews: number;
  topCategories: { name: string; count: number }[];
  recentActivity: { date: string; posts: number; comments: number }[];
}

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Post, Comment, Notification, Category, TrendingTopic } from '../types';
import { db } from '../services/database';

interface AppState {
  // Auth
  currentUser: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => { success: boolean; error?: string };
  register: (username: string, email: string, password: string) => { success: boolean; error?: string };
  logout: () => void;

  // Posts
  posts: Post[];
  createPost: (title: string, content: string, tags: string[], category: string, isAnonymous: boolean) => Post | null;
  deletePost: (postId: string) => boolean;
  upvotePost: (postId: string) => void;
  downvotePost: (postId: string) => void;
  toggleBookmark: (postId: string) => void;
  addReaction: (postId: string, emoji: string) => void;
  incrementViews: (postId: string) => void;
  searchPosts: (query: string) => Post[];

  // Comments
  comments: Comment[];
  getCommentsByPost: (postId: string) => Comment[];
  addComment: (postId: string, content: string) => Comment | null;
  deleteComment: (commentId: string) => boolean;

  // Users
  users: User[];
  toggleFollow: (userId: string) => boolean;
  isFollowing: (userId: string) => boolean;
  getUserById: (userId: string) => User | undefined;

  // Notifications
  notifications: Notification[];
  markNotificationRead: (notifId: string) => void;
  markAllNotificationsRead: () => void;
  unreadCount: number;

  // Messages
  getConversation: (userId: string) => any[];
  sendMessage: (receiverId: string, content: string) => void;

  // Categories & Topics
  categories: Category[];
  trendingTopics: TrendingTopic[];

  // Search
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const AppContext = createContext<AppState | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('nijuze_current_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [posts, setPosts] = useState<Post[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Load data from database
  const refreshData = () => {
    setPosts(db.getPosts().map(p => ({
      ...p,
      author: db.getUserById(p.authorId) || p.author,
      isUpvoted: currentUser ? db.getPostVote(p.id, currentUser.id) === 'upvote' : false,
      isDownvoted: currentUser ? db.getPostVote(p.id, currentUser.id) === 'downvote' : false,
      isBookmarked: currentUser ? db.isBookmarked(p.id, currentUser.id) : false,
    })));
    setUsers(db.getUsers());
    setComments(db.getComments());
    if (currentUser) {
      setNotifications(db.getNotificationsByUser(currentUser.id));
    }
  };

  useEffect(() => {
    refreshData();
  }, [currentUser]);

  // Auth methods
  const login = (email: string, password: string): { success: boolean; error?: string } => {
    const user = db.getUserByEmail(email);
    if (!user) {
      return { success: false, error: 'Email haijapatikana' };
    }
    if (user.password !== password) {
      return { success: false, error: 'Password si sahihi' };
    }
    setCurrentUser(user);
    localStorage.setItem('nijuze_current_user', JSON.stringify(user));
    return { success: true };
  };

  const register = (username: string, email: string, password: string): { success: boolean; error?: string } => {
    if (db.getUserByEmail(email)) {
      return { success: false, error: 'Email hii imeshajiriwa' };
    }
    if (password.length < 6) {
      return { success: false, error: 'Password lazima iwe na herufi 6 au zaidi' };
    }
    const user = db.createUser({
      username,
      email,
      password,
      avatar: username.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2),
      role: 'Mwanachama',
      bio: '',
    });
    setCurrentUser(user);
    localStorage.setItem('nijuze_current_user', JSON.stringify(user));
    return { success: true };
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('nijuze_current_user');
  };

  // Post methods
  const createPost = (title: string, content: string, tags: string[], category: string, isAnonymous: boolean): Post | null => {
    if (!currentUser) return null;
    const post = db.createPost({
      authorId: currentUser.id,
      author: currentUser,
      title,
      content,
      tags,
      category,
      isAnonymous,
    });
    refreshData();
    return post;
  };

  const deletePost = (postId: string): boolean => {
    const result = db.deletePost(postId);
    refreshData();
    return result;
  };

  const upvotePost = (postId: string) => {
    if (!currentUser) return;
    db.votePost(postId, currentUser.id, 'upvote');
    refreshData();
  };

  const downvotePost = (postId: string) => {
    if (!currentUser) return;
    db.votePost(postId, currentUser.id, 'downvote');
    refreshData();
  };

  const toggleBookmark = (postId: string) => {
    if (!currentUser) return;
    db.toggleBookmark(postId, currentUser.id);
    refreshData();
  };

  const addReaction = (postId: string, emoji: string) => {
    if (!currentUser) return;
    db.toggleReaction(postId, currentUser.id, emoji);
    refreshData();
  };

  const incrementViews = (postId: string) => {
    db.incrementPostViews(postId);
  };

  const searchPosts = (query: string): Post[] => {
    return db.searchPosts(query);
  };

  // Comment methods
  const getCommentsByPost = (postId: string): Comment[] => {
    return db.getCommentsByPost(postId).map(c => ({
      ...c,
      author: db.getUserById(c.authorId) || c.author,
    }));
  };

  const addComment = (postId: string, content: string): Comment | null => {
    if (!currentUser) return null;
    const comment = db.createComment({
      postId,
      authorId: currentUser.id,
      author: currentUser,
      content,
    });
    refreshData();
    return comment;
  };

  const deleteComment = (commentId: string): boolean => {
    const result = db.deleteComment(commentId);
    refreshData();
    return result;
  };

  // User methods
  const toggleFollow = (userId: string): boolean => {
    if (!currentUser) return false;
    const result = db.toggleFollow(currentUser.id, userId);
    refreshData();
    return result;
  };

  const isFollowing = (userId: string): boolean => {
    if (!currentUser) return false;
    return db.isFollowing(currentUser.id, userId);
  };

  const getUserById = (userId: string): User | undefined => {
    return db.getUserById(userId);
  };

  // Notification methods
  const markNotificationRead = (notifId: string) => {
    db.markNotificationRead(notifId);
    refreshData();
  };

  const markAllNotificationsRead = () => {
    if (!currentUser) return;
    db.markAllNotificationsRead(currentUser.id);
    refreshData();
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  // Message methods
  const getConversation = (userId: string) => {
    if (!currentUser) return [];
    return db.getConversation(currentUser.id, userId);
  };

  const sendMessage = (receiverId: string, content: string) => {
    if (!currentUser) return;
    db.sendMessage(currentUser.id, receiverId, content);
  };

  // Categories & Topics
  const categories: Category[] = [
    { id: 'cat1', name: 'Teknolojia', icon: '💻', description: 'Programming, AI, Web Dev', postsCount: 0, followersCount: 0 },
    { id: 'cat2', name: 'Biashara', icon: '📊', description: 'Startups, Finance, Marketing', postsCount: 0, followersCount: 0 },
    { id: 'cat3', name: 'Sayansi', icon: '🔬', description: 'Research, Innovation', postsCount: 0, followersCount: 0 },
    { id: 'cat4', name: 'Sanaa', icon: '🎨', description: 'Design, Music, Film', postsCount: 0, followersCount: 0 },
    { id: 'cat5', name: 'Michezo', icon: '⚽', description: 'Football, Basketball', postsCount: 0, followersCount: 0 },
  ];

  const trendingTopics: TrendingTopic[] = [
    { id: 't1', name: 'AI & Machine Learning', postsCount: 0, growth: 24, category: 'Teknolojia' },
    { id: 't2', name: 'Web3 & Blockchain', postsCount: 0, growth: 18, category: 'Teknolojia' },
    { id: 't3', name: 'Startup Ecosystem', postsCount: 0, growth: 31, category: 'Biashara' },
    { id: 't4', name: 'Cybersecurity', postsCount: 0, growth: 15, category: 'Teknolojia' },
    { id: 't5', name: 'Cloud Computing', postsCount: 0, growth: 12, category: 'Teknolojia' },
  ];

  const value: AppState = {
    currentUser,
    isAuthenticated: !!currentUser,
    login,
    register,
    logout,
    posts,
    createPost,
    deletePost,
    upvotePost,
    downvotePost,
    toggleBookmark,
    addReaction,
    incrementViews,
    searchPosts,
    comments,
    getCommentsByPost,
    addComment,
    deleteComment,
    users,
    toggleFollow,
    isFollowing,
    getUserById,
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    unreadCount,
    getConversation,
    sendMessage,
    categories,
    trendingTopics,
    searchQuery,
    setSearchQuery,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};

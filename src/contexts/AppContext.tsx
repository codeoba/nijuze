import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Post, Comment, Notification, Category, TrendingTopic, Analytics } from '../types';
import { storage, generateId, generateSampleUsers, generateSamplePosts, generateSampleComments, generateSampleNotifications } from '../utils/data';

interface AppState {
  // Auth
  currentUser: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => boolean;
  register: (username: string, email: string, password: string) => boolean;
  logout: () => void;

  // Posts
  posts: Post[];
  createPost: (title: string, content: string, tags: string[], category: string, isAnonymous: boolean) => void;
  updatePost: (postId: string, title: string, content: string, tags: string[]) => void;
  deletePost: (postId: string) => void;
  upvotePost: (postId: string) => void;
  downvotePost: (postId: string) => void;
  bookmarkPost: (postId: string) => void;
  addReaction: (postId: string, emoji: string) => void;
  incrementViews: (postId: string) => void;

  // Comments
  comments: { [postId: string]: Comment[] };
  addComment: (postId: string, content: string) => void;
  upvoteComment: (postId: string, commentId: string) => void;
  downvoteComment: (postId: string, commentId: string) => void;
  markBestAnswer: (postId: string, commentId: string) => void;

  // Users
  users: User[];
  followUser: (userId: string) => void;
  unfollowUser: (userId: string) => void;
  getUserById: (userId: string) => User | undefined;

  // Notifications
  notifications: Notification[];
  markNotificationRead: (notifId: string) => void;
  markAllNotificationsRead: () => void;
  unreadCount: number;

  // Categories & Topics
  categories: Category[];
  trendingTopics: TrendingTopic[];

  // Analytics
  analytics: Analytics;

  // Search
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  searchResults: Post[];
}

const AppContext = createContext<AppState | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Initialize state from localStorage
  const [currentUser, setCurrentUser] = useState<User | null>(() => 
    storage.get<User | null>('currentUser', null)
  );
  const [posts, setPosts] = useState<Post[]>(() => {
    const saved = storage.get<Post[]>('posts', []);
    if (saved.length === 0) {
      const users = generateSampleUsers();
      return generateSamplePosts(users);
    }
    return saved;
  });
  const [comments, setComments] = useState<{ [postId: string]: Comment[] }>(() => {
    const saved = storage.get<{ [postId: string]: Comment[] }>('comments', {});
    if (Object.keys(saved).length === 0) {
      const users = generateSampleUsers();
      return {
        post1: generateSampleComments(users, 'post1'),
        post2: generateSampleComments(users, 'post2'),
        post3: generateSampleComments(users, 'post3'),
        post4: generateSampleComments(users, 'post4'),
      };
    }
    return saved;
  });
  const [users, setUsers] = useState<User[]>(() => {
    const saved = storage.get<User[]>('users', []);
    if (saved.length === 0) {
      return generateSampleUsers();
    }
    return saved;
  });
  const [notifications, setNotifications] = useState<Notification[]>(() => {
    const saved = storage.get<Notification[]>('notifications', []);
    if (saved.length === 0) {
      return generateSampleNotifications(generateSampleUsers());
    }
    return saved;
  });
  const [searchQuery, setSearchQuery] = useState('');

  // Save to localStorage whenever state changes
  useEffect(() => {
    storage.set('currentUser', currentUser);
  }, [currentUser]);

  useEffect(() => {
    storage.set('posts', posts);
  }, [posts]);

  useEffect(() => {
    storage.set('comments', comments);
  }, [comments]);

  useEffect(() => {
    storage.set('users', users);
  }, [users]);

  useEffect(() => {
    storage.set('notifications', notifications);
  }, [notifications]);

  // Auth methods
  const login = (email: string, password: string): boolean => {
    // Mock authentication - in real app, this would call API
    const user = users.find(u => u.email === email);
    if (user && password.length >= 6) {
      setCurrentUser(user);
      return true;
    }
    return false;
  };

  const register = (username: string, email: string, password: string): boolean => {
    if (users.find(u => u.email === email)) {
      return false; // Email already exists
    }
    if (password.length < 6) {
      return false;
    }

    const newUser: User = {
      id: generateId(),
      username,
      email,
      avatar: username.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2),
      role: 'Mwanachama',
      bio: '',
      joinedAt: new Date().toISOString(),
      followers: 0,
      following: 0,
      postsCount: 0,
      answersCount: 0,
      reputation: 0,
      badges: [],
      isVerified: false,
    };

    setUsers([...users, newUser]);
    setCurrentUser(newUser);
    return true;
  };

  const logout = () => {
    setCurrentUser(null);
    storage.remove('currentUser');
  };

  // Post methods
  const createPost = (title: string, content: string, tags: string[], category: string, isAnonymous: boolean) => {
    if (!currentUser) return;

    const newPost: Post = {
      id: generateId(),
      authorId: currentUser.id,
      author: currentUser,
      title,
      content,
      tags,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      upvotes: 0,
      downvotes: 0,
      commentsCount: 0,
      views: 0,
      shares: 0,
      bookmarks: 0,
      reactions: {},
      isUpvoted: false,
      isDownvoted: false,
      isBookmarked: false,
      isPinned: false,
      isAnonymous,
      category,
    };

    setPosts([newPost, ...posts]);
    
    // Update user stats
    const updatedUser = { ...currentUser, postsCount: currentUser.postsCount + 1 };
    setCurrentUser(updatedUser);
    setUsers(users.map(u => u.id === currentUser.id ? updatedUser : u));
  };

  const updatePost = (postId: string, title: string, content: string, tags: string[]) => {
    setPosts(posts.map(p => 
      p.id === postId 
        ? { ...p, title, content, tags, updatedAt: new Date().toISOString() }
        : p
    ));
  };

  const deletePost = (postId: string) => {
    setPosts(posts.filter(p => p.id !== postId));
  };

  const upvotePost = (postId: string) => {
    if (!currentUser) return;

    setPosts(posts.map(p => {
      if (p.id === postId) {
        if (p.isUpvoted) {
          return { ...p, isUpvoted: false, upvotes: p.upvotes - 1 };
        } else {
          const newUpvotes = p.isDownvoted ? p.upvotes + 1 : p.upvotes + 1;
          const newDownvotes = p.isDownvoted ? p.downvotes - 1 : p.downvotes;
          return { ...p, isUpvoted: true, isDownvoted: false, upvotes: newUpvotes, downvotes: newDownvotes };
        }
      }
      return p;
    }));
  };

  const downvotePost = (postId: string) => {
    if (!currentUser) return;

    setPosts(posts.map(p => {
      if (p.id === postId) {
        if (p.isDownvoted) {
          return { ...p, isDownvoted: false, downvotes: p.downvotes - 1 };
        } else {
          const newDownvotes = p.isUpvoted ? p.downvotes + 1 : p.downvotes + 1;
          const newUpvotes = p.isUpvoted ? p.upvotes - 1 : p.upvotes;
          return { ...p, isDownvoted: true, isUpvoted: false, downvotes: newDownvotes, upvotes: newUpvotes };
        }
      }
      return p;
    }));
  };

  const bookmarkPost = (postId: string) => {
    setPosts(posts.map(p => 
      p.id === postId 
        ? { ...p, isBookmarked: !p.isBookmarked, bookmarks: p.isBookmarked ? p.bookmarks - 1 : p.bookmarks + 1 }
        : p
    ));
  };

  const addReaction = (postId: string, emoji: string) => {
    if (!currentUser) return;

    setPosts(posts.map(p => {
      if (p.id === postId) {
        const reactions = { ...p.reactions };
        if (!reactions[emoji]) {
          reactions[emoji] = [];
        }
        if (reactions[emoji].includes(currentUser.id)) {
          reactions[emoji] = reactions[emoji].filter(id => id !== currentUser.id);
          if (reactions[emoji].length === 0) {
            delete reactions[emoji];
          }
        } else {
          reactions[emoji] = [...reactions[emoji], currentUser.id];
        }
        return { ...p, reactions };
      }
      return p;
    }));
  };

  const incrementViews = (postId: string) => {
    setPosts(posts.map(p => 
      p.id === postId ? { ...p, views: p.views + 1 } : p
    ));
  };

  // Comment methods
  const addComment = (postId: string, content: string) => {
    if (!currentUser) return;

    const newComment: Comment = {
      id: generateId(),
      postId,
      authorId: currentUser.id,
      author: currentUser,
      content,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      upvotes: 0,
      downvotes: 0,
      isUpvoted: false,
      isDownvoted: false,
      isBestAnswer: false,
      replies: [],
    };

    setComments({
      ...comments,
      [postId]: [...(comments[postId] || []), newComment],
    });

    // Update post comments count
    setPosts(posts.map(p => 
      p.id === postId ? { ...p, commentsCount: p.commentsCount + 1 } : p
    ));

    // Update user stats
    const updatedUser = { ...currentUser, answersCount: currentUser.answersCount + 1 };
    setCurrentUser(updatedUser);
    setUsers(users.map(u => u.id === currentUser.id ? updatedUser : u));
  };

  const upvoteComment = (postId: string, commentId: string) => {
    if (!currentUser) return;

    setComments({
      ...comments,
      [postId]: (comments[postId] || []).map(c => {
        if (c.id === commentId) {
          if (c.isUpvoted) {
            return { ...c, isUpvoted: false, upvotes: c.upvotes - 1 };
          } else {
            const newUpvotes = c.isDownvoted ? c.upvotes + 1 : c.upvotes + 1;
            const newDownvotes = c.isDownvoted ? c.downvotes - 1 : c.downvotes;
            return { ...c, isUpvoted: true, isDownvoted: false, upvotes: newUpvotes, downvotes: newDownvotes };
          }
        }
        return c;
      }),
    });
  };

  const downvoteComment = (postId: string, commentId: string) => {
    if (!currentUser) return;

    setComments({
      ...comments,
      [postId]: (comments[postId] || []).map(c => {
        if (c.id === commentId) {
          if (c.isDownvoted) {
            return { ...c, isDownvoted: false, downvotes: c.downvotes - 1 };
          } else {
            const newDownvotes = c.isUpvoted ? c.downvotes + 1 : c.downvotes + 1;
            const newUpvotes = c.isUpvoted ? c.upvotes - 1 : c.upvotes;
            return { ...c, isDownvoted: true, isUpvoted: false, downvotes: newDownvotes, upvotes: newUpvotes };
          }
        }
        return c;
      }),
    });
  };

  const markBestAnswer = (postId: string, commentId: string) => {
    setComments({
      ...comments,
      [postId]: (comments[postId] || []).map(c => ({
        ...c,
        isBestAnswer: c.id === commentId ? !c.isBestAnswer : false,
      })),
    });
  };

  // User methods
  const followUser = (userId: string) => {
    if (!currentUser) return;

    setUsers(users.map(u => {
      if (u.id === userId) {
        return { ...u, followers: u.followers + 1, isFollowing: true };
      }
      if (u.id === currentUser.id) {
        return { ...u, following: u.following + 1 };
      }
      return u;
    }));

    const updatedCurrentUser = { ...currentUser, following: currentUser.following + 1 };
    setCurrentUser(updatedCurrentUser);
  };

  const unfollowUser = (userId: string) => {
    if (!currentUser) return;

    setUsers(users.map(u => {
      if (u.id === userId) {
        return { ...u, followers: u.followers - 1, isFollowing: false };
      }
      if (u.id === currentUser.id) {
        return { ...u, following: u.following - 1 };
      }
      return u;
    }));

    const updatedCurrentUser = { ...currentUser, following: currentUser.following - 1 };
    setCurrentUser(updatedCurrentUser);
  };

  const getUserById = (userId: string) => users.find(u => u.id === userId);

  // Notification methods
  const markNotificationRead = (notifId: string) => {
    setNotifications(notifications.map(n => 
      n.id === notifId ? { ...n, isRead: true } : n
    ));
  };

  const markAllNotificationsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, isRead: true })));
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  // Categories & Topics
  const categories: Category[] = [
    { id: 'cat1', name: 'Teknolojia', icon: '💻', description: 'Programming, AI, Web Dev', postsCount: 45200, followersCount: 12400 },
    { id: 'cat2', name: 'Biashara', icon: '📊', description: 'Startups, Finance, Marketing', postsCount: 32100, followersCount: 8900 },
    { id: 'cat3', name: 'Sayansi', icon: '🔬', description: 'Research, Innovation', postsCount: 28400, followersCount: 6700 },
    { id: 'cat4', name: 'Sanaa', icon: '🎨', description: 'Design, Music, Film', postsCount: 19800, followersCount: 5400 },
    { id: 'cat5', name: 'Michezo', icon: '⚽', description: 'Football, Basketball', postsCount: 15600, followersCount: 9800 },
  ];

  const trendingTopics: TrendingTopic[] = [
    { id: 't1', name: 'AI & Machine Learning', postsCount: 12400, growth: 24, category: 'Teknolojia' },
    { id: 't2', name: 'Web3 & Blockchain', postsCount: 8700, growth: 18, category: 'Teknolojia' },
    { id: 't3', name: 'Startup Ecosystem', postsCount: 6200, growth: 31, category: 'Biashara' },
    { id: 't4', name: 'Cybersecurity', postsCount: 5800, growth: 15, category: 'Teknolojia' },
    { id: 't5', name: 'Cloud Computing', postsCount: 4900, growth: 12, category: 'Teknolojia' },
  ];

  // Analytics
  const analytics: Analytics = {
    totalPosts: posts.length,
    totalComments: Object.values(comments).reduce((sum, arr) => sum + arr.length, 0),
    totalUsers: users.length,
    totalViews: posts.reduce((sum, p) => sum + p.views, 0),
    topCategories: [
      { name: 'Teknolojia', count: 45200 },
      { name: 'Biashara', count: 32100 },
      { name: 'Sayansi', count: 28400 },
    ],
    recentActivity: [
      { date: '2024-01-01', posts: 120, comments: 340 },
      { date: '2024-01-02', posts: 145, comments: 420 },
      { date: '2024-01-03', posts: 132, comments: 380 },
    ],
  };

  // Search
  const searchResults = searchQuery
    ? posts.filter(p =>
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : [];

  const value: AppState = {
    currentUser,
    isAuthenticated: !!currentUser,
    login,
    register,
    logout,
    posts,
    createPost,
    updatePost,
    deletePost,
    upvotePost,
    downvotePost,
    bookmarkPost,
    addReaction,
    incrementViews,
    comments,
    addComment,
    upvoteComment,
    downvoteComment,
    markBestAnswer,
    users,
    followUser,
    unfollowUser,
    getUserById,
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    unreadCount,
    categories,
    trendingTopics,
    analytics,
    searchQuery,
    setSearchQuery,
    searchResults,
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

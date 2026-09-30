import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { User, Post, Comment, Notification, Category, TrendingTopic } from '../types';
import { db } from '../services/database';
import { authAPI, postsAPI, commentsAPI, usersAPI, notificationsAPI } from '../services/api';

interface AppState {
  // Auth
  currentUser: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (username: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;

  // Posts
  posts: Post[];
  createPost: (title: string, content: string, tags: string[], category: string, isAnonymous: boolean) => Promise<Post | null>;
  deletePost: (postId: string) => Promise<boolean>;
  upvotePost: (postId: string) => Promise<void>;
  downvotePost: (postId: string) => Promise<void>;
  toggleBookmark: (postId: string) => Promise<void>;
  addReaction: (postId: string, emoji: string) => Promise<void>;
  incrementViews: (postId: string) => void;
  searchPosts: (query: string) => Post[];

  // Comments
  comments: Comment[];
  getCommentsByPost: (postId: string) => Comment[];
  addComment: (postId: string, content: string) => Promise<Comment | null>;
  deleteComment: (commentId: string) => Promise<boolean>;
  markBestAnswer: (commentId: string, postId: string) => Promise<void>;
  upvoteComment: (commentId: string) => Promise<void>;

  // Users
  users: User[];
  toggleFollow: (userId: string) => Promise<boolean>;
  isFollowing: (userId: string) => boolean;
  getUserById: (userId: string) => User | undefined;
  updateUserProfile: (updates: Partial<User>) => Promise<User | null>;

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
  createCategory: (name: string, icon?: string, description?: string) => void;
  deleteCategory: (id: string) => void;
  trendingTopics: TrendingTopic[];

  // Search
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  // Status
  isOnlineBackend: boolean;
}

const AppContext = createContext<AppState | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('nijuze_user') || localStorage.getItem('nijuze_current_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [posts, setPosts] = useState<Post[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isOnlineBackend, setIsOnlineBackend] = useState(false);

  const isNotDemoPost = useCallback((p: Post) => {
    if (!p || !p.id) return false;
    if (p.id.startsWith('post') || p.id === 'd2401122-7827-4363-9a71-7beed04b6b1b') return false;
    const title = (p.title || '').toLowerCase();
    if (
      title.includes('machine learning mwaka 2026') ||
      title.includes('react na vue.js') ||
      title.includes('blockchain') ||
      title.includes('jaribio la chapisho')
    ) {
      return false;
    }
    return true;
  }, []);

  // Sync data from local storage as initial/offline baseline
  const loadLocalBaseline = useCallback(() => {
    const localPosts = db.getPosts()
      .filter(isNotDemoPost)
      .map(p => ({
        ...p,
        author: db.getUserById(p.authorId) || p.author,
        isUpvoted: currentUser ? db.getPostVote(p.id, currentUser.id) === 'upvote' : false,
        isDownvoted: currentUser ? db.getPostVote(p.id, currentUser.id) === 'downvote' : false,
        isBookmarked: currentUser ? db.isBookmarked(p.id, currentUser.id) : false,
      }));
    setPosts(localPosts);
    setUsers(db.getUsers());
    setComments(db.getComments());
    if (currentUser) {
      setNotifications(db.getNotificationsByUser(currentUser.id));
    }
  }, [currentUser, isNotDemoPost]);

  // Synchronize with real backend API
  const syncWithBackend = useCallback(async () => {
    try {
      // 1. Fetch posts from API
      const postsRes = await postsAPI.getAll({ limit: 50 });
      if (postsRes && Array.isArray(postsRes.posts)) {
        const cleanPosts = postsRes.posts.filter(isNotDemoPost);
        setPosts(cleanPosts);
        setIsOnlineBackend(true);
      } else {
        loadLocalBaseline();
      }

      // 2. Fetch users
      const usersRes = await usersAPI.getAll();
      if (usersRes && usersRes.length > 0) {
        setUsers(usersRes.map(u => ({ ...u, badges: Array.isArray(u.badges) ? u.badges : [] })));
      } else {
        setUsers(db.getUsers());
      }

      // 3. If authenticated, fetch current user info & notifications
      const token = localStorage.getItem('nijuze_token');
      if (token) {
        try {
          const me = await authAPI.getCurrentUser();
          if (me) {
            let savedLocalUser: any = null;
            try {
              const raw = localStorage.getItem('nijuze_user');
              if (raw) savedLocalUser = JSON.parse(raw);
            } catch {}

            const mergedUser = {
              ...savedLocalUser,
              ...me,
              badges: Array.isArray(me.badges) ? me.badges : (Array.isArray(savedLocalUser?.badges) ? savedLocalUser.badges : []),
              avatar: (me.avatar && (me.avatar.startsWith('http') || me.avatar.startsWith('/uploads') || me.avatar.startsWith('data:')))
                ? me.avatar
                : (savedLocalUser?.avatar || me.avatar),
              cover_image: me.cover_image || me.coverImage || savedLocalUser?.cover_image || savedLocalUser?.coverImage || null,
              coverImage: me.cover_image || me.coverImage || savedLocalUser?.cover_image || savedLocalUser?.coverImage || null,
            };

            setCurrentUser(mergedUser);
            localStorage.setItem('nijuze_user', JSON.stringify(mergedUser));
            localStorage.setItem('nijuze_current_user', JSON.stringify(mergedUser));
            db.updateUser(mergedUser.id, mergedUser);
          }
          const notifs = await notificationsAPI.getAll();
          if (notifs) {
            setNotifications(notifs);
          }
        } catch {
          // Token expired or invalid
        }
      }
    } catch (err) {
      // Backend is currently offline, fall back to local baseline
      setIsOnlineBackend(false);
      loadLocalBaseline();
    }
  }, [loadLocalBaseline, isNotDemoPost]);

  // Purge legacy demo posts from localStorage on start
  useEffect(() => {
    try {
      const storedPosts = localStorage.getItem('nijuze_db_posts');
      if (storedPosts) {
        const parsed = JSON.parse(storedPosts);
        if (Array.isArray(parsed)) {
          const cleaned = parsed.filter(isNotDemoPost);
          localStorage.setItem('nijuze_db_posts', JSON.stringify(cleaned));
        }
      }
      const storedComments = localStorage.getItem('nijuze_db_comments');
      if (storedComments) {
        const parsedC = JSON.parse(storedComments);
        if (Array.isArray(parsedC)) {
          const cleanedC = parsedC.filter((c: any) => 
            !c.id?.startsWith('comment') && 
            !c.postId?.startsWith('post') && 
            c.postId !== 'd2401122-7827-4363-9a71-7beed04b6b1b'
          );
          localStorage.setItem('nijuze_db_comments', JSON.stringify(cleanedC));
        }
      }
    } catch {}
  }, [isNotDemoPost]);

  useEffect(() => {
    loadLocalBaseline();
    syncWithBackend();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (currentUser) {
      setNotifications(db.getNotificationsByUser(currentUser.id));
    }
  }, [currentUser]);

  // Auth methods
  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      // 1. Try real API backend first
      const response = await authAPI.login(email, password);
      if (response && response.data && response.data.user) {
        const user = response.data.user;
        setCurrentUser(user);
        localStorage.setItem('nijuze_user', JSON.stringify(user));
        localStorage.setItem('nijuze_current_user', JSON.stringify(user));
        setIsOnlineBackend(true);
        await syncWithBackend();
        return { success: true };
      }
    } catch (err: any) {
      // If error is invalid credentials from backend, return error
      if (err.message && (err.message.includes('Invalid') || err.message.includes('password') || err.message.includes('banned'))) {
        return { success: false, error: err.message };
      }

      // Otherwise backend is offline, check local db fallback
      const localUser = db.getUserByEmail(email);
      if (localUser) {
        if (localUser.password === password) {
          setCurrentUser(localUser);
          localStorage.setItem('nijuze_current_user', JSON.stringify(localUser));
          localStorage.setItem('nijuze_user', JSON.stringify(localUser));
          return { success: true };
        }
        return { success: false, error: 'Password si sahihi' };
      }
    }

    return { success: false, error: 'Email haijapatikana au nenosiri si sahihi' };
  };

  const register = async (username: string, email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    if (password.length < 6) {
      return { success: false, error: 'Password lazima iwe na herufi 6 au zaidi' };
    }

    try {
      // 1. Try real API backend
      const response = await authAPI.register(username, email, password);
      if (response && response.data && response.data.user) {
        const user = response.data.user;
        setCurrentUser(user);
        localStorage.setItem('nijuze_user', JSON.stringify(user));
        localStorage.setItem('nijuze_current_user', JSON.stringify(user));
        setIsOnlineBackend(true);
        await syncWithBackend();
        return { success: true };
      }
    } catch (err: any) {
      if (err.message && err.message.includes('already registered')) {
        return { success: false, error: 'Email hii imeshajiriwa tayari' };
      }

      // Offline fallback
      if (db.getUserByEmail(email)) {
        return { success: false, error: 'Email hii imeshajiriwa' };
      }

      const localUser = db.createUser({
        username,
        email,
        password,
        avatar: username.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'NJ',
        role: 'Mwanachama',
        bio: '',
      });
      setCurrentUser(localUser);
      localStorage.setItem('nijuze_current_user', JSON.stringify(localUser));
      localStorage.setItem('nijuze_user', JSON.stringify(localUser));
      return { success: true };
    }

    return { success: false, error: 'Hitilafu wakati wa kujiandikisha' };
  };

  const logout = () => {
    authAPI.logout();
    setCurrentUser(null);
    localStorage.removeItem('nijuze_current_user');
    localStorage.removeItem('nijuze_user');
    localStorage.removeItem('nijuze_token');
  };

  // Post methods
  const createPost = async (title: string, content: string, tags: string[], category: string, isAnonymous: boolean): Promise<Post | null> => {
    if (!currentUser) return null;

    let createdPost: Post | null = null;

    // 1. Try API
    try {
      const res = await postsAPI.create({ title, content, tags, category, isAnonymous });
      if (res && res.post) {
        createdPost = res.post;
      }
    } catch {
      // Backend offline
    }

    // 2. Also save to local database for offline resilience
    const localPost = db.createPost({
      authorId: currentUser.id,
      author: currentUser,
      title,
      content,
      tags,
      category,
      isAnonymous,
    });

    const finalPost = createdPost || localPost;
    setPosts(prev => [finalPost, ...prev]);
    return finalPost;
  };

  const deletePost = async (postId: string): Promise<boolean> => {
    setPosts(prev => prev.filter(p => p.id !== postId));
    try {
      await postsAPI.delete(postId);
    } catch {}
    return db.deletePost(postId);
  };

  const upvotePost = async (postId: string) => {
    if (!currentUser) return;

    // Optimistic UI update
    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        const wasUpvoted = p.isUpvoted;
        return {
          ...p,
          upvotes: wasUpvoted ? Math.max(0, p.upvotes - 1) : p.upvotes + 1,
          downvotes: p.isDownvoted ? Math.max(0, p.downvotes - 1) : p.downvotes,
          isUpvoted: !wasUpvoted,
          isDownvoted: false
        };
      }
      return p;
    }));

    db.votePost(postId, currentUser.id, 'upvote');

    try {
      await postsAPI.upvote(postId);
    } catch {}
  };

  const downvotePost = async (postId: string) => {
    if (!currentUser) return;

    // Optimistic UI update
    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        const wasDownvoted = p.isDownvoted;
        return {
          ...p,
          downvotes: wasDownvoted ? Math.max(0, p.downvotes - 1) : p.downvotes + 1,
          upvotes: p.isUpvoted ? Math.max(0, p.upvotes - 1) : p.upvotes,
          isDownvoted: !wasDownvoted,
          isUpvoted: false
        };
      }
      return p;
    }));

    db.votePost(postId, currentUser.id, 'downvote');

    try {
      await postsAPI.downvote(postId);
    } catch {}
  };

  const toggleBookmark = async (postId: string) => {
    if (!currentUser) return;

    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        const willBookmark = !p.isBookmarked;
        return {
          ...p,
          isBookmarked: willBookmark,
          bookmarks: willBookmark ? p.bookmarks + 1 : Math.max(0, p.bookmarks - 1)
        };
      }
      return p;
    }));

    db.toggleBookmark(postId, currentUser.id);

    try {
      await postsAPI.bookmark(postId);
    } catch {}
  };

  const addReaction = async (postId: string, emoji: string) => {
    if (!currentUser) return;

    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        const reactions = { ...(p.reactions || {}) };
        const userList = Array.isArray(reactions[emoji]) ? reactions[emoji] : [];
        const hasReacted = userList.includes(currentUser.id);
        reactions[emoji] = hasReacted
          ? userList.filter(id => id !== currentUser.id)
          : [...userList, currentUser.id];
        return { ...p, reactions };
      }
      return p;
    }));

    db.toggleReaction(postId, currentUser.id, emoji);

    try {
      await postsAPI.addReaction(postId, emoji);
    } catch {}
  };

  const incrementViews = (postId: string) => {
    db.incrementPostViews(postId);
  };

  const searchPosts = (query: string): Post[] => {
    if (!query.trim()) return posts;
    const q = query.toLowerCase();
    return posts.filter(p =>
      p.title.toLowerCase().includes(q) ||
      p.content.toLowerCase().includes(q) ||
      p.tags.some(t => t.toLowerCase().includes(q))
    );
  };

  // Comment methods
  const getCommentsByPost = (postId: string): Comment[] => {
    return comments.filter(c => c.postId === postId).map(c => ({
      ...c,
      author: db.getUserById(c.authorId) || c.author,
    }));
  };

  const addComment = async (postId: string, content: string): Promise<Comment | null> => {
    if (!currentUser) return null;

    let newComment: Comment | null = null;
    try {
      const res = await commentsAPI.create(postId, content);
      if (res) newComment = res;
    } catch {}

    const localComment = db.createComment({
      postId,
      authorId: currentUser.id,
      author: currentUser,
      content,
    });

    const finalComment = newComment || localComment;
    setComments(prev => [finalComment, ...prev]);
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, commentsCount: p.commentsCount + 1 } : p));
    return finalComment;
  };

  const deleteComment = async (commentId: string): Promise<boolean> => {
    setComments(prev => prev.filter(c => c.id !== commentId));
    try {
      await commentsAPI.delete(commentId);
    } catch {}
    return db.deleteComment(commentId);
  };

  const markBestAnswer = async (commentId: string, postId: string): Promise<void> => {
    setComments(prev => prev.map(c => {
      if (c.postId === postId) {
        return {
          ...c,
          isBestAnswer: c.id === commentId ? !c.isBestAnswer : false
        };
      }
      return c;
    }));

    try {
      await commentsAPI.markBest(commentId);
    } catch {}
  };

  const upvoteComment = async (commentId: string): Promise<void> => {
    setComments(prev => prev.map(c => {
      if (c.id === commentId) {
        return {
          ...c,
          upvotes: (c.upvotes || 0) + 1
        };
      }
      return c;
    }));

    try {
      await commentsAPI.upvote(commentId);
    } catch {}
  };

  // User methods
  const toggleFollow = async (userId: string): Promise<boolean> => {
    if (!currentUser) return false;
    const isNowFollowing = db.toggleFollow(currentUser.id, userId);

    try {
      if (isNowFollowing) {
        await usersAPI.follow(userId);
      } else {
        await usersAPI.unfollow(userId);
      }
    } catch {}

    setUsers(db.getUsers());
    return isNowFollowing;
  };

  const isFollowing = (userId: string): boolean => {
    if (!currentUser) return false;
    return db.isFollowing(currentUser.id, userId);
  };

  const getUserById = (userId: string): User | undefined => {
    return users.find(u => u.id === userId) || db.getUserById(userId);
  };

  const updateUserProfile = async (updates: Partial<User>): Promise<User | null> => {
    if (!currentUser) return null;

    const normalizedUpdates = {
      ...updates,
      ...(updates.cover_image && { coverImage: updates.cover_image }),
      ...(updates.coverImage && { cover_image: updates.coverImage }),
    };

    let updatedUser: User = { 
      ...currentUser, 
      ...normalizedUpdates,
      badges: Array.isArray(currentUser.badges) ? currentUser.badges : []
    };

    try {
      const res = await usersAPI.updateProfile(normalizedUpdates);
      if (res) {
        updatedUser = { 
          ...updatedUser, 
          ...res,
          badges: (Array.isArray(res.badges) && res.badges.length > 0) ? res.badges : (Array.isArray(updatedUser.badges) ? updatedUser.badges : [])
        };
      }
    } catch {}

    setCurrentUser(updatedUser);
    localStorage.setItem('nijuze_user', JSON.stringify(updatedUser));
    localStorage.setItem('nijuze_current_user', JSON.stringify(updatedUser));

    db.updateUser(currentUser.id, normalizedUpdates);
    setUsers(prev => prev.map(u => u.id === currentUser.id ? { ...u, ...normalizedUpdates } : u));

    return updatedUser;
  };

  // Notification methods
  const markNotificationRead = (notifId: string) => {
    setNotifications(prev => prev.map(n => n.id === notifId ? { ...n, isRead: true } : n));
    db.markNotificationRead(notifId);
    try {
      notificationsAPI.markRead(notifId);
    } catch {}
  };

  const markAllNotificationsRead = () => {
    if (!currentUser) return;
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    db.markAllNotificationsRead(currentUser.id);
    try {
      notificationsAPI.markAllRead();
    } catch {}
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
  const DEFAULT_CATEGORIES: Category[] = [
    { id: 'cat1', name: 'Teknolojia', icon: '💻', description: 'Programming, AI, Web Dev', postsCount: 42, followersCount: 1200 },
    { id: 'cat2', name: 'Biashara', icon: '📊', description: 'Startups, Finance, Marketing', postsCount: 28, followersCount: 890 },
    { id: 'cat3', name: 'Sayansi', icon: '🔬', description: 'Research, Innovation', postsCount: 19, followersCount: 650 },
    { id: 'cat4', name: 'Sanaa', icon: '🎨', description: 'Design, Music, Film', postsCount: 14, followersCount: 430 },
    { id: 'cat5', name: 'Michezo', icon: '⚽', description: 'Football, Basketball', postsCount: 12, followersCount: 520 },
    { id: 'cat6', name: 'Elimu', icon: '📚', description: 'Masomo, Vyuo, Scholarships', postsCount: 31, followersCount: 940 },
    { id: 'cat7', name: 'Afya', icon: '🏥', description: 'Uzazi, Lishe, Tiba', postsCount: 22, followersCount: 710 },
  ];

  const [categories, setCategories] = useState<Category[]>(() => {
    try {
      const saved = localStorage.getItem('nijuze_categories');
      return saved ? JSON.parse(saved) : DEFAULT_CATEGORIES;
    } catch {
      return DEFAULT_CATEGORIES;
    }
  });

  const createCategory = (name: string, icon: string = '📁', description: string = '') => {
    const newCat: Category = {
      id: `cat-${Date.now()}`,
      name: name.trim(),
      icon: icon.trim() || '📁',
      description: description.trim(),
      postsCount: 0,
      followersCount: 0,
    };
    setCategories(prev => {
      const updated = [...prev, newCat];
      try {
        localStorage.setItem('nijuze_categories', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const deleteCategory = (id: string) => {
    setCategories(prev => {
      const updated = prev.filter(c => c.id !== id);
      try {
        localStorage.setItem('nijuze_categories', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const trendingTopics: TrendingTopic[] = [
    { id: 't1', name: 'AI & Machine Learning', postsCount: 45, growth: 24, category: 'Teknolojia' },
    { id: 't2', name: 'React 19 & Next.js', postsCount: 38, growth: 18, category: 'Teknolojia' },
    { id: 't3', name: 'Biashara za Kidijitali', postsCount: 29, growth: 31, category: 'Biashara' },
    { id: 't4', name: 'Cybersecurity & Privacy', postsCount: 26, growth: 15, category: 'Teknolojia' },
    { id: 't5', name: 'Cloud Computing (AWS/GCP)', postsCount: 21, growth: 12, category: 'Teknolojia' },
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
    markBestAnswer,
    upvoteComment,
    users,
    toggleFollow,
    isFollowing,
    getUserById,
    updateUserProfile,
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    unreadCount,
    getConversation,
    sendMessage,
    categories,
    createCategory,
    deleteCategory,
    trendingTopics,
    searchQuery,
    setSearchQuery,
    isOnlineBackend,
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

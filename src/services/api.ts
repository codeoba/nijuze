// API Service - Can be swapped with real backend later
// Currently uses localStorage, but structured like real API calls

import { db } from './database';
import { User, Post, Comment, Notification, Message } from '../types';

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const api = {
  // Auth
  auth: {
    async register(username: string, email: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> {
      await delay(300); // Simulate network delay
      
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
      
      return { success: true, user };
    },
    
    async login(email: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> {
      await delay(300);
      
      const user = db.getUserByEmail(email);
      if (!user) {
        return { success: false, error: 'Email haijapatikana' };
      }
      
      if (user.password !== password) {
        return { success: false, error: 'Password si sahihi' };
      }
      
      return { success: true, user };
    },
  },
  
  // Posts
  posts: {
    async getAll(): Promise<Post[]> {
      await delay(200);
      return db.getPosts();
    },
    
    async getById(id: string): Promise<Post | undefined> {
      await delay(100);
      return db.getPostById(id);
    },
    
    async create(data: {
      authorId: string;
      author: User;
      title: string;
      content: string;
      tags: string[];
      category: string;
      isAnonymous: boolean;
    }): Promise<Post> {
      await delay(300);
      return db.createPost(data);
    },
    
    async update(id: string, updates: Partial<Post>): Promise<Post | undefined> {
      await delay(200);
      return db.updatePost(id, updates);
    },
    
    async delete(id: string): Promise<boolean> {
      await delay(200);
      return db.deletePost(id);
    },
    
    async search(query: string): Promise<Post[]> {
      await delay(200);
      return db.searchPosts(query);
    },
  },
  
  // Comments
  comments: {
    async getByPost(postId: string): Promise<Comment[]> {
      await delay(200);
      return db.getCommentsByPost(postId);
    },
    
    async create(data: {
      postId: string;
      authorId: string;
      author: User;
      content: string;
    }): Promise<Comment> {
      await delay(300);
      return db.createComment(data);
    },
    
    async delete(id: string): Promise<boolean> {
      await delay(200);
      return db.deleteComment(id);
    },
  },
  
  // Voting
  voting: {
    async votePost(postId: string, userId: string, type: 'upvote' | 'downvote'): Promise<void> {
      await delay(200);
      db.votePost(postId, userId, type);
    },
    
    async getPostVote(postId: string, userId: string): Promise<'upvote' | 'downvote' | null> {
      await delay(100);
      return db.getPostVote(postId, userId);
    },
  },
  
  // Bookmarks
  bookmarks: {
    async toggle(postId: string, userId: string): Promise<boolean> {
      await delay(200);
      return db.toggleBookmark(postId, userId);
    },
    
    async isBookmarked(postId: string, userId: string): Promise<boolean> {
      await delay(100);
      return db.isBookmarked(postId, userId);
    },
  },
  
  // Followers
  followers: {
    async toggle(followerId: string, followingId: string): Promise<boolean> {
      await delay(200);
      return db.toggleFollow(followerId, followingId);
    },
    
    async isFollowing(followerId: string, followingId: string): Promise<boolean> {
      await delay(100);
      return db.isFollowing(followerId, followingId);
    },
  },
  
  // Reactions
  reactions: {
    async toggle(postId: string, userId: string, emoji: string): Promise<void> {
      await delay(200);
      db.toggleReaction(postId, userId, emoji);
    },
  },
  
  // Notifications
  notifications: {
    async getByUser(userId: string): Promise<Notification[]> {
      await delay(200);
      return db.getNotificationsByUser(userId);
    },
    
    async markRead(id: string): Promise<void> {
      await delay(100);
      db.markNotificationRead(id);
    },
    
    async markAllRead(userId: string): Promise<void> {
      await delay(200);
      db.markAllNotificationsRead(userId);
    },
  },
  
  // Messages
  messages: {
    async getConversation(userId1: string, userId2: string): Promise<Message[]> {
      await delay(200);
      return db.getConversation(userId1, userId2);
    },
    
    async send(senderId: string, receiverId: string, content: string): Promise<Message> {
      await delay(300);
      return db.sendMessage(senderId, receiverId, content);
    },
  },
  
  // Users
  users: {
    async getAll(): Promise<User[]> {
      await delay(200);
      return db.getUsers();
    },
    
    async getById(id: string): Promise<User | undefined> {
      await delay(100);
      return db.getUserById(id);
    },
    
    async update(id: string, updates: Partial<User>): Promise<User | undefined> {
      await delay(200);
      return db.updateUser(id, updates);
    },
  },
  
  // Data Export/Import
  data: {
    async export(): Promise<string> {
      await delay(500);
      const data = {
        users: db.getUsers(),
        posts: db.getPosts(),
        comments: db.getComments(),
        notifications: db.getNotifications(),
        messages: db.getMessages(),
        exportedAt: new Date().toISOString(),
        version: '1.0.0',
      };
      return JSON.stringify(data, null, 2);
    },
    
    async import(jsonString: string): Promise<boolean> {
      await delay(500);
      try {
        const data = JSON.parse(jsonString);
        
        // Clear existing data
        db.reset();
        
        // Import data
        if (data.users) {
          data.users.forEach((user: User) => {
            localStorage.setItem(`nijuze_db_users`, JSON.stringify(data.users));
          });
        }
        
        if (data.posts) {
          localStorage.setItem('nijuze_db_posts', JSON.stringify(data.posts));
        }
        
        if (data.comments) {
          localStorage.setItem('nijuze_db_comments', JSON.stringify(data.comments));
        }
        
        if (data.notifications) {
          localStorage.setItem('nijuze_db_notifications', JSON.stringify(data.notifications));
        }
        
        if (data.messages) {
          localStorage.setItem('nijuze_db_messages', JSON.stringify(data.messages));
        }
        
        return true;
      } catch (error) {
        console.error('Import failed:', error);
        return false;
      }
    },
  },
};

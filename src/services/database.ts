// Real Database Service using localStorage as persistent storage
// This simulates a real backend - can be swapped with API calls later

import { User, Post, Comment, Notification, Message } from '../types';

const DB_KEYS = {
  USERS: 'nijuze_db_users',
  POSTS: 'nijuze_db_posts',
  COMMENTS: 'nijuze_db_comments',
  NOTIFICATIONS: 'nijuze_db_notifications',
  MESSAGES: 'nijuze_db_messages',
  CURRENT_USER: 'nijuze_db_current_user',
  FOLLOWERS: 'nijuze_db_followers',
  BOOKMARKS: 'nijuze_db_bookmarks',
  VOTES: 'nijuze_db_votes',
  REACTIONS: 'nijuze_db_reactions',
};

// Generate unique ID
export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
};

// Generic DB operations
class Database {
  private get<T>(key: string): T[] {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  private set<T>(key: string, data: T[]): void {
    localStorage.setItem(key, JSON.stringify(data));
  }

  // Users
  getUsers(): User[] {
    return this.get<User>(DB_KEYS.USERS);
  }

  getUserById(id: string): User | undefined {
    return this.getUsers().find(u => u.id === id);
  }

  getUserByEmail(email: string): User | undefined {
    return this.getUsers().find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  createUser(userData: Omit<User, 'id' | 'joinedAt' | 'reputation' | 'followers' | 'following' | 'postsCount' | 'answersCount' | 'badges' | 'isVerified'>): User {
    const users = this.getUsers();
    const newUser: User = {
      ...userData,
      id: generateId(),
      joinedAt: new Date().toISOString(),
      reputation: 0,
      followers: 0,
      following: 0,
      postsCount: 0,
      answersCount: 0,
      badges: [],
      isVerified: false,
    };
    users.push(newUser);
    this.set(DB_KEYS.USERS, users);
    return newUser;
  }

  updateUser(id: string, updates: Partial<User>): User | undefined {
    const users = this.getUsers();
    const index = users.findIndex(u => u.id === id);
    if (index === -1) return undefined;
    users[index] = { ...users[index], ...updates };
    this.set(DB_KEYS.USERS, users);
    return users[index];
  }

  // Posts
  getPosts(): Post[] {
    return this.get<Post>(DB_KEYS.POSTS);
  }

  getPostById(id: string): Post | undefined {
    return this.getPosts().find(p => p.id === id);
  }

  getPostsByUser(userId: string): Post[] {
    return this.getPosts().filter(p => p.authorId === userId);
  }

  createPost(postData: Omit<Post, 'id' | 'createdAt' | 'updatedAt' | 'upvotes' | 'downvotes' | 'commentsCount' | 'views' | 'shares' | 'bookmarks' | 'reactions' | 'isUpvoted' | 'isDownvoted' | 'isBookmarked' | 'isPinned'>): Post {
    const posts = this.getPosts();
    const newPost: Post = {
      ...postData,
      id: generateId(),
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
    };
    posts.unshift(newPost);
    this.set(DB_KEYS.POSTS, posts);

    // Update user posts count
    const user = this.getUserById(postData.authorId);
    if (user) {
      this.updateUser(user.id, { postsCount: user.postsCount + 1 });
    }

    return newPost;
  }

  updatePost(id: string, updates: Partial<Post>): Post | undefined {
    const posts = this.getPosts();
    const index = posts.findIndex(p => p.id === id);
    if (index === -1) return undefined;
    posts[index] = { ...posts[index], ...updates, updatedAt: new Date().toISOString() };
    this.set(DB_KEYS.POSTS, posts);
    return posts[index];
  }

  deletePost(id: string): boolean {
    const posts = this.getPosts();
    const post = posts.find(p => p.id === id);
    if (!post) return false;

    this.set(DB_KEYS.POSTS, posts.filter(p => p.id !== id));

    // Update user posts count
    const user = this.getUserById(post.authorId);
    if (user) {
      this.updateUser(user.id, { postsCount: Math.max(0, user.postsCount - 1) });
    }

    // Delete related comments
    const comments = this.getComments();
    this.set(DB_KEYS.COMMENTS, comments.filter(c => c.postId !== id));

    return true;
  }

  incrementPostViews(id: string): void {
    const posts = this.getPosts();
    const post = posts.find(p => p.id === id);
    if (post) {
      post.views += 1;
      this.set(DB_KEYS.POSTS, posts);
    }
  }

  // Comments
  getComments(): Comment[] {
    return this.get<Comment>(DB_KEYS.COMMENTS);
  }

  getCommentsByPost(postId: string): Comment[] {
    return this.getComments().filter(c => c.postId === postId);
  }

  createComment(commentData: Omit<Comment, 'id' | 'createdAt' | 'updatedAt' | 'upvotes' | 'downvotes' | 'isUpvoted' | 'isDownvoted' | 'isBestAnswer' | 'replies'>): Comment {
    const comments = this.getComments();
    const newComment: Comment = {
      ...commentData,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      upvotes: 0,
      downvotes: 0,
      isUpvoted: false,
      isDownvoted: false,
      isBestAnswer: false,
      replies: [],
    };
    comments.push(newComment);
    this.set(DB_KEYS.COMMENTS, comments);

    // Update post comments count
    const post = this.getPostById(commentData.postId);
    if (post) {
      this.updatePost(post.id, { commentsCount: post.commentsCount + 1 });
    }

    // Update user answers count
    const user = this.getUserById(commentData.authorId);
    if (user) {
      this.updateUser(user.id, { answersCount: user.answersCount + 1 });
    }

    // Create notification for post author
    if (post && post.authorId !== commentData.authorId) {
      this.createNotification({
        userId: post.authorId,
        type: 'comment',
        message: `${user?.username || 'Mtu'} amejibu swali lako`,
        link: `/post/${post.id}`,
        fromUserId: commentData.authorId,
      });
    }

    return newComment;
  }

  deleteComment(id: string): boolean {
    const comments = this.getComments();
    const comment = comments.find(c => c.id === id);
    if (!comment) return false;

    this.set(DB_KEYS.COMMENTS, comments.filter(c => c.id !== id));

    // Update post comments count
    const post = this.getPostById(comment.postId);
    if (post) {
      this.updatePost(post.id, { commentsCount: Math.max(0, post.commentsCount - 1) });
    }

    return true;
  }

  // Notifications
  getNotifications(): Notification[] {
    return this.get<Notification>(DB_KEYS.NOTIFICATIONS);
  }

  getNotificationsByUser(userId: string): Notification[] {
    return this.getNotifications()
      .filter(n => n.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  createNotification(notifData: Omit<Notification, 'id' | 'createdAt' | 'isRead'>): Notification {
    const notifications = this.getNotifications();
    const newNotif: Notification = {
      ...notifData,
      id: generateId(),
      createdAt: new Date().toISOString(),
      isRead: false,
    };
    notifications.unshift(newNotif);
    this.set(DB_KEYS.NOTIFICATIONS, notifications);
    return newNotif;
  }

  markNotificationRead(id: string): void {
    const notifications = this.getNotifications();
    const notif = notifications.find(n => n.id === id);
    if (notif) {
      notif.isRead = true;
      this.set(DB_KEYS.NOTIFICATIONS, notifications);
    }
  }

  markAllNotificationsRead(userId: string): void {
    const notifications = this.getNotifications();
    notifications.forEach(n => {
      if (n.userId === userId) n.isRead = true;
    });
    this.set(DB_KEYS.NOTIFICATIONS, notifications);
  }

  // Messages
  getMessages(): Message[] {
    return this.get<Message>(DB_KEYS.MESSAGES);
  }

  getConversation(userId1: string, userId2: string): Message[] {
    return this.getMessages()
      .filter(m =>
        (m.senderId === userId1 && m.receiverId === userId2) ||
        (m.senderId === userId2 && m.receiverId === userId1)
      )
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }

  sendMessage(senderId: string, receiverId: string, content: string): Message {
    const messages = this.getMessages();
    const newMessage: Message = {
      id: generateId(),
      senderId,
      receiverId,
      content,
      createdAt: new Date().toISOString(),
      isRead: false,
    };
    messages.push(newMessage);
    this.set(DB_KEYS.MESSAGES, messages);
    return newMessage;
  }

  markMessageRead(id: string): void {
    const messages = this.getMessages();
    const msg = messages.find(m => m.id === id);
    if (msg) {
      msg.isRead = true;
      this.set(DB_KEYS.MESSAGES, messages);
    }
  }

  // Voting
  votePost(postId: string, userId: string, type: 'upvote' | 'downvote'): void {
    const votes = this.get<{ postId: string; userId: string; type: string }>(DB_KEYS.VOTES);
    const existingVote = votes.find(v => v.postId === postId && v.userId === userId);
    const post = this.getPostById(postId);
    if (!post) return;

    if (existingVote) {
      if (existingVote.type === type) {
        // Remove vote
        this.set(DB_KEYS.VOTES, votes.filter(v => !(v.postId === postId && v.userId === userId)));
        if (type === 'upvote') {
          this.updatePost(postId, { upvotes: Math.max(0, post.upvotes - 1) });
        } else {
          this.updatePost(postId, { downvotes: Math.max(0, post.downvotes - 1) });
        }
      } else {
        // Change vote
        this.set(DB_KEYS.VOTES, votes.map(v =>
          v.postId === postId && v.userId === userId ? { ...v, type } : v
        ));
        if (type === 'upvote') {
          this.updatePost(postId, {
            upvotes: post.upvotes + 1,
            downvotes: Math.max(0, post.downvotes - 1),
          });
        } else {
          this.updatePost(postId, {
            downvotes: post.downvotes + 1,
            upvotes: Math.max(0, post.upvotes - 1),
          });
        }
      }
    } else {
      // Add new vote
      votes.push({ postId, userId, type });
      this.set(DB_KEYS.VOTES, votes);
      if (type === 'upvote') {
        this.updatePost(postId, { upvotes: post.upvotes + 1 });
      } else {
        this.updatePost(postId, { downvotes: post.downvotes + 1 });
      }

      // Notify post author
      if (post.authorId !== userId && type === 'upvote') {
        const user = this.getUserById(userId);
        this.createNotification({
          userId: post.authorId,
          type: 'upvote',
          message: `${user?.username || 'Mtu'} amepiga upvote swali lako`,
          link: `/post/${post.id}`,
          fromUserId: userId,
        });
      }
    }
  }

  getPostVote(postId: string, userId: string): 'upvote' | 'downvote' | null {
    const votes = this.get<{ postId: string; userId: string; type: string }>(DB_KEYS.VOTES);
    const vote = votes.find(v => v.postId === postId && v.userId === userId);
    return vote ? vote.type as 'upvote' | 'downvote' : null;
  }

  // Bookmarks
  toggleBookmark(postId: string, userId: string): boolean {
    const bookmarks = this.get<{ postId: string; userId: string }>(DB_KEYS.BOOKMARKS);
    const existing = bookmarks.find(b => b.postId === postId && b.userId === userId);
    const post = this.getPostById(postId);

    if (existing) {
      this.set(DB_KEYS.BOOKMARKS, bookmarks.filter(b => !(b.postId === postId && b.userId === userId)));
      if (post) this.updatePost(postId, { bookmarks: Math.max(0, post.bookmarks - 1) });
      return false;
    } else {
      bookmarks.push({ postId, userId });
      this.set(DB_KEYS.BOOKMARKS, bookmarks);
      if (post) this.updatePost(postId, { bookmarks: post.bookmarks + 1 });
      return true;
    }
  }

  isBookmarked(postId: string, userId: string): boolean {
    const bookmarks = this.get<{ postId: string; userId: string }>(DB_KEYS.BOOKMARKS);
    return bookmarks.some(b => b.postId === postId && b.userId === userId);
  }

  // Followers
  toggleFollow(followerId: string, followingId: string): boolean {
    const followers = this.get<{ followerId: string; followingId: string }>(DB_KEYS.FOLLOWERS);
    const existing = followers.find(f => f.followerId === followerId && f.followingId === followingId);

    if (existing) {
      this.set(DB_KEYS.FOLLOWERS, followers.filter(f => !(f.followerId === followerId && f.followingId === followingId)));
      const follower = this.getUserById(followerId);
      const following = this.getUserById(followingId);
      if (follower) this.updateUser(followerId, { following: Math.max(0, follower.following - 1) });
      if (following) this.updateUser(followingId, { followers: Math.max(0, following.followers - 1) });
      return false;
    } else {
      followers.push({ followerId, followingId });
      this.set(DB_KEYS.FOLLOWERS, followers);
      const follower = this.getUserById(followerId);
      const following = this.getUserById(followingId);
      if (follower) this.updateUser(followerId, { following: follower.following + 1 });
      if (following) this.updateUser(followingId, { followers: following.followers + 1 });

      // Notify
      const followerUser = this.getUserById(followerId);
      this.createNotification({
        userId: followingId,
        type: 'follow',
        message: `${followerUser?.username || 'Mtu'} amekufuata`,
        link: `/profile/${followerId}`,
        fromUserId: followerId,
      });
      return true;
    }
  }

  isFollowing(followerId: string, followingId: string): boolean {
    const followers = this.get<{ followerId: string; followingId: string }>(DB_KEYS.FOLLOWERS);
    return followers.some(f => f.followerId === followerId && f.followingId === followingId);
  }

  // Reactions
  toggleReaction(postId: string, userId: string, emoji: string): void {
    const reactions = this.get<{ postId: string; userId: string; emoji: string }>(DB_KEYS.REACTIONS);
    const existing = reactions.find(r => r.postId === postId && r.userId === userId && r.emoji === emoji);

    if (existing) {
      this.set(DB_KEYS.REACTIONS, reactions.filter(r => !(r.postId === postId && r.userId === userId && r.emoji === emoji)));
    } else {
      reactions.push({ postId, userId, emoji });
      this.set(DB_KEYS.REACTIONS, reactions);
    }

    // Update post reactions
    const postReactions = reactions.filter(r => r.postId === postId);
    const reactionsMap: { [key: string]: string[] } = {};
    postReactions.forEach(r => {
      if (!reactionsMap[r.emoji]) reactionsMap[r.emoji] = [];
      reactionsMap[r.emoji].push(r.userId);
    });
    this.updatePost(postId, { reactions: reactionsMap });
  }

  // Search
  searchPosts(query: string): Post[] {
    const q = query.toLowerCase();
    return this.getPosts().filter(p =>
      p.title.toLowerCase().includes(q) ||
      p.content.toLowerCase().includes(q) ||
      p.tags.some(t => t.toLowerCase().includes(q))
    );
  }

  // Reset database (for testing)
  reset(): void {
    Object.values(DB_KEYS).forEach(key => localStorage.removeItem(key));
  }
}

export const db = new Database();

// ============================================
// NIJUZE BACKEND SERVER - MySQL Version
// For aaPanel & Docker Deployment
// ============================================

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');
const { v4: uuidv4 } = require('uuid');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { getStorageEngine } = require('./database/storageEngine');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Prevent process exit on network/database hiccups
process.on('uncaughtException', (err) => {
  console.error('⚠️ Uncaught Exception intercepted:', err.message);
});
process.on('unhandledRejection', (reason) => {
  console.error('⚠️ Unhandled Rejection intercepted:', reason?.message || reason);
});

// ============================================
// DATABASE CONNECTION
// ============================================
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'nijuze_user',
  password: process.env.DB_PASSWORD || 'your_password',
  database: process.env.DB_NAME || 'nijuze',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: 'utf8mb4'
};

let db;

async function connectDB() {
  try {
    const pool = await mysql.createPool(dbConfig);
    // Test connection
    const connection = await pool.getConnection();
    await connection.ping();
    connection.release();
    db = pool;
    console.log('✅ Connected to MySQL database');

    // Automatically purge demo posts and their comments if present
    try {
      await db.query(`DELETE FROM comments WHERE post_id LIKE 'post-%' OR post_id = 'd2401122-7827-4363-9a71-7beed04b6b1b'`);
      await db.query(`DELETE FROM posts WHERE id LIKE 'post-%' OR id = 'd2401122-7827-4363-9a71-7beed04b6b1b' OR title LIKE '%Machine Learning mwaka 2026%' OR title LIKE '%React na Vue.js%' OR title LIKE '%blockchain%afya%' OR title LIKE '%Jaribio%'`);
      console.log('🧹 Purged legacy demo posts from MySQL database');
    } catch (cleanupErr) {
      // ignore
    }

    try {
      await db.query(`ALTER TABLE users ADD COLUMN cover_image VARCHAR(500) NULL`);
    } catch (colErr) {
      // column already exists
    }
  } catch (error) {
    console.warn('⚠️ MySQL server unavailable (' + error.message + '). Activating Local Storage Engine fallback...');
    db = getStorageEngine();
    console.log('✅ Local Storage Engine initialized & ready for full CRUD operations.');
  }
}

// ============================================
// MIDDLEWARE
// ============================================
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(cors({
  origin: '*',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300,
  message: { success: false, error: 'Too many requests, please try again later' }
});
app.use('/api/', limiter);

// Static files
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

// ============================================
// FILE UPLOAD CONFIGURATION
// ============================================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB
  fileFilter: (req, file, cb) => {
    const allowedExtensions = /jpeg|jpg|png|gif|webp|svg|pdf|doc|docx|xls|xlsx|ppt|pptx|txt|csv|zip|rar|tar|gz|json|mp3|mp4|wav|m4a/;
    const extname = path.extname(file.originalname).toLowerCase().replace('.', '');
    
    if (allowedExtensions.test(extname)) {
      return cb(null, true);
    } else {
      cb(new Error('Aina hii ya faili haikubaliki. Tafadhali pakia picha au faili sahihi.'));
    }
  }
});

// ============================================
// AUTHENTICATION MIDDLEWARE
// ============================================
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ success: false, error: 'Access token required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'nijuze_default_jwt_secret_key_2026');
    
    const [users] = await db.query('SELECT id, username, email, role, is_banned FROM users WHERE id = ?', [decoded.id]);
    
    if (users.length === 0) {
      return res.status(401).json({ success: false, error: 'User not found' });
    }

    if (users[0].is_banned) {
      return res.status(403).json({ success: false, error: 'Account is banned' });
    }

    req.user = { id: users[0].id, username: users[0].username, email: users[0].email, role: users[0].role };
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, error: 'Token expired' });
    }
    return res.status(403).json({ success: false, error: 'Invalid token' });
  }
};

const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'nijuze_default_jwt_secret_key_2026');
      const [users] = await db.query('SELECT id, username, email, role, is_banned FROM users WHERE id = ?', [decoded.id]);
      if (users.length > 0 && !users[0].is_banned) {
        req.user = users[0];
      }
    }
  } catch {
    // Ignore invalid optional tokens
  }
  next();
};

const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'Admin') {
    return res.status(403).json({ success: false, error: 'Admin access required' });
  }
  next();
};

// Helper functions
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET || 'nijuze_default_jwt_secret_key_2026', { 
    expiresIn: process.env.JWT_EXPIRES_IN || '7d' 
  });
};

const generateId = () => uuidv4();

// ============================================
// AUTH ROUTES
// ============================================

// Register
app.post('/api/auth/register', async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      throw new Error('All fields are required');
    }

    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters');
    }

    const [existingUsers] = await connection.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existingUsers.length > 0) {
      throw new Error('Email already registered');
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const userId = generateId();
    const avatar = username.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'NJ';

    await connection.query(
      `INSERT INTO users (id, username, email, password_hash, avatar, role) 
       VALUES (?, ?, ?, ?, ?, 'Mwanachama')`,
      [userId, username, email, passwordHash, avatar]
    );

    await connection.commit();

    const token = generateToken(userId);

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: userId,
          username,
          email,
          avatar,
          role: 'Mwanachama',
          reputation: 0,
          isVerified: false,
          followers: 0,
          following: 0,
          postsCount: 0,
          answersCount: 0
        },
        token
      }
    });
  } catch (error) {
    await connection.rollback();
    res.status(400).json({ success: false, error: error.message });
  } finally {
    connection.release();
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password are required' });
    }

    const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    
    if (users.length === 0) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    const user = users[0];

    if (user.is_banned) {
      return res.status(403).json({ success: false, error: 'Account is banned' });
    }

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    await db.query('UPDATE users SET last_login = NOW() WHERE id = ?', [user.id]);

    const token = generateToken(user.id);

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          avatar: user.avatar,
          role: user.role,
          bio: user.bio,
          reputation: user.reputation,
          isVerified: Boolean(user.is_verified),
          followers: user.followers_count || 0,
          following: user.following_count || 0,
          postsCount: user.posts_count || 0,
          answersCount: user.answers_count || 0
        },
        token
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get current user
app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const [users] = await db.query(
      `SELECT id, username, email, avatar, role, bio, reputation, is_verified, 
              followers_count, following_count, posts_count, answers_count, created_at 
       FROM users WHERE id = ?`,
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    const [badges] = await db.query('SELECT * FROM badges WHERE user_id = ?', [req.user.id]);

    const u = users[0];
    res.json({
      success: true,
      data: {
        id: u.id,
        username: u.username,
        email: u.email,
        avatar: u.avatar,
        role: u.role,
        bio: u.bio,
        reputation: u.reputation,
        isVerified: Boolean(u.is_verified),
        followers: u.followers_count,
        following: u.following_count,
        postsCount: u.posts_count,
        answersCount: u.answers_count,
        createdAt: u.created_at,
        badges
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================
// POSTS ROUTES
// ============================================

// Get all posts
app.get('/api/posts', optionalAuth, async (req, res) => {
  try {
    const { page = 1, limit = 20, category, search, sort = 'latest' } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT p.*, u.username as author_username, u.avatar as author_avatar, 
             u.role as author_role, u.is_verified as author_verified
      FROM posts p
      LEFT JOIN users u ON p.author_id = u.id
      WHERE p.is_approved = TRUE
        AND p.id NOT LIKE 'post-%'
        AND p.id != 'd2401122-7827-4363-9a71-7beed04b6b1b'
        AND p.title NOT LIKE '%Machine Learning mwaka 2026%'
        AND p.title NOT LIKE '%React na Vue.js%'
        AND p.title NOT LIKE '%blockchain%afya%'
        AND p.title NOT LIKE '%Jaribio%'
    `;
    const params = [];

    if (category && category !== 'All' && category !== 'Zote') {
      query += ' AND p.category = ?';
      params.push(category);
    }

    if (search) {
      query += ' AND (p.title LIKE ? OR p.content LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    switch (sort) {
      case 'popular':
        query += ' ORDER BY (p.upvotes + p.comments_count * 2) DESC, p.created_at DESC';
        break;
      case 'unanswered':
        query += ' ORDER BY p.comments_count ASC, p.created_at DESC';
        break;
      default:
        query += ' ORDER BY p.is_pinned DESC, p.created_at DESC';
    }

    query += ' LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [posts] = await db.query(query, params);

    let countQuery = `
      SELECT COUNT(*) as total FROM posts 
      WHERE is_approved = TRUE 
        AND id NOT LIKE 'post-%'
        AND id != 'd2401122-7827-4363-9a71-7beed04b6b1b'
        AND title NOT LIKE '%Machine Learning mwaka 2026%'
        AND title NOT LIKE '%React na Vue.js%'
        AND title NOT LIKE '%blockchain%afya%'
        AND title NOT LIKE '%Jaribio%'
    `;
    const countParams = [];
    if (category && category !== 'All' && category !== 'Zote') {
      countQuery += ' AND category = ?';
      countParams.push(category);
    }
    if (search) {
      countQuery += ' AND (title LIKE ? OR content LIKE ?)';
      countParams.push(`%${search}%`, `%${search}%`);
    }

    const [countResult] = await db.query(countQuery, countParams);
    const total = countResult[0]?.total || 0;

    // Check user upvotes & bookmarks if logged in
    let userVotesMap = {};
    let userBookmarksMap = {};
    if (req.user) {
      const [votes] = await db.query('SELECT post_id, vote_type FROM post_votes WHERE user_id = ?', [req.user.id]);
      votes.forEach(v => { userVotesMap[v.post_id] = v.vote_type; });

      const [bms] = await db.query('SELECT post_id FROM bookmarks WHERE user_id = ?', [req.user.id]);
      bms.forEach(b => { userBookmarksMap[b.post_id] = true; });
    }

    const formattedPosts = posts.map(post => {
      let parsedTags = [];
      let parsedReactions = {};
      try { parsedTags = typeof post.tags === 'string' ? JSON.parse(post.tags) : (post.tags || []); } catch {}
      try { parsedReactions = typeof post.reactions === 'string' ? JSON.parse(post.reactions) : (post.reactions || {}); } catch {}

      return {
        id: post.id,
        authorId: post.author_id,
        title: post.title,
        content: post.content,
        tags: parsedTags,
        category: post.category,
        createdAt: post.created_at,
        updatedAt: post.updated_at,
        upvotes: post.upvotes || 0,
        downvotes: post.downvotes || 0,
        commentsCount: post.comments_count || 0,
        views: post.views || 0,
        shares: post.shares || 0,
        bookmarks: post.bookmarks_count || 0,
        reactions: parsedReactions,
        isPinned: Boolean(post.is_pinned),
        isAnonymous: Boolean(post.is_anonymous),
        imageUrl: post.image_url,
        isUpvoted: userVotesMap[post.id] === 'upvote',
        isDownvoted: userVotesMap[post.id] === 'downvote',
        isBookmarked: Boolean(userBookmarksMap[post.id]),
        author: {
          id: post.author_id,
          username: post.is_anonymous ? 'Mwanachama Asiyejulikana' : post.author_username,
          avatar: post.is_anonymous ? '??' : (post.author_avatar || 'NJ'),
          role: post.author_role || 'Mwanachama',
          isVerified: Boolean(post.author_verified)
        }
      };
    });

    res.json({
      success: true,
      data: {
        posts: formattedPosts,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit) || 1
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create post
app.post('/api/posts', authenticateToken, async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const { title, content, tags = [], category = 'Teknolojia', isAnonymous = false, imageUrl } = req.body;

    if (!title || !content) {
      throw new Error('Title and content are required');
    }

    if (title.length < 5) {
      throw new Error('Title must be at least 5 characters');
    }

    const postId = generateId();

    await connection.query(
      `INSERT INTO posts (id, author_id, title, content, tags, category, is_anonymous, image_url) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [postId, req.user.id, title, content, JSON.stringify(tags), category, isAnonymous, imageUrl || null]
    );

    // Update user post count & reputation
    await connection.query('UPDATE users SET posts_count = posts_count + 1, reputation = reputation + 5 WHERE id = ?', [req.user.id]);

    // Create activity
    await connection.query(
      `INSERT INTO activities (id, user_id, type, target_id, target_type) 
       VALUES (?, ?, 'post', ?, 'post')`,
      [generateId(), req.user.id, postId]
    );

    await connection.commit();

    const newPost = {
      id: postId,
      authorId: req.user.id,
      title,
      content,
      tags,
      category,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      upvotes: 0,
      downvotes: 0,
      commentsCount: 0,
      views: 0,
      shares: 0,
      bookmarks: 0,
      reactions: {},
      isPinned: false,
      isAnonymous,
      imageUrl,
      isUpvoted: false,
      isDownvoted: false,
      isBookmarked: false,
      author: {
        id: req.user.id,
        username: req.user.username,
        avatar: req.user.avatar || 'NJ',
        role: req.user.role || 'Mwanachama',
        isVerified: false
      }
    };

    res.status(201).json({
      success: true,
      data: { post: newPost }
    });
  } catch (error) {
    await connection.rollback();
    res.status(400).json({ success: false, error: error.message });
  } finally {
    connection.release();
  }
});

// Get single post
app.get('/api/posts/:id', optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const [posts] = await db.query(
      `SELECT p.*, u.username as author_username, u.avatar as author_avatar, 
              u.role as author_role, u.is_verified as author_verified, u.bio as author_bio
       FROM posts p
       LEFT JOIN users u ON p.author_id = u.id
       WHERE p.id = ?`,
      [id]
    );

    if (posts.length === 0) {
      return res.status(404).json({ success: false, error: 'Post not found' });
    }

    await db.query('UPDATE posts SET views = views + 1 WHERE id = ?', [id]);

    const post = posts[0];
    let parsedTags = [];
    let parsedReactions = {};
    try { parsedTags = typeof post.tags === 'string' ? JSON.parse(post.tags) : (post.tags || []); } catch {}
    try { parsedReactions = typeof post.reactions === 'string' ? JSON.parse(post.reactions) : (post.reactions || {}); } catch {}

    let isUpvoted = false;
    let isDownvoted = false;
    let isBookmarked = false;

    if (req.user) {
      const [votes] = await db.query('SELECT vote_type FROM post_votes WHERE post_id = ? AND user_id = ?', [id, req.user.id]);
      if (votes.length > 0) {
        isUpvoted = votes[0].vote_type === 'upvote';
        isDownvoted = votes[0].vote_type === 'downvote';
      }
      const [bms] = await db.query('SELECT id FROM bookmarks WHERE post_id = ? AND user_id = ?', [id, req.user.id]);
      isBookmarked = bms.length > 0;
    }

    res.json({
      success: true,
      data: {
        id: post.id,
        authorId: post.author_id,
        title: post.title,
        content: post.content,
        tags: parsedTags,
        category: post.category,
        createdAt: post.created_at,
        updatedAt: post.updated_at,
        upvotes: post.upvotes,
        downvotes: post.downvotes,
        commentsCount: post.comments_count,
        views: post.views + 1,
        shares: post.shares,
        bookmarks: post.bookmarks_count,
        reactions: parsedReactions,
        isPinned: Boolean(post.is_pinned),
        isAnonymous: Boolean(post.is_anonymous),
        imageUrl: post.image_url,
        isUpvoted,
        isDownvoted,
        isBookmarked,
        author: {
          id: post.author_id,
          username: post.is_anonymous ? 'Mwanachama Asiyejulikana' : post.author_username,
          avatar: post.is_anonymous ? '??' : post.author_avatar,
          role: post.author_role,
          isVerified: Boolean(post.author_verified),
          bio: post.author_bio
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update post
app.put('/api/posts/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, tags, category } = req.body;

    const [posts] = await db.query('SELECT * FROM posts WHERE id = ?', [id]);
    if (posts.length === 0) return res.status(404).json({ success: false, error: 'Post not found' });

    if (posts[0].author_id !== req.user.id && req.user.role !== 'Admin') {
      return res.status(403).json({ success: false, error: 'Unauthorized to edit this post' });
    }

    await db.query(
      'UPDATE posts SET title = COALESCE(?, title), content = COALESCE(?, content), tags = COALESCE(?, tags), category = COALESCE(?, category) WHERE id = ?',
      [title, content, tags ? JSON.stringify(tags) : null, category, id]
    );

    res.json({ success: true, message: 'Post updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Delete post
app.delete('/api/posts/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const [posts] = await db.query('SELECT * FROM posts WHERE id = ?', [id]);
    if (posts.length === 0) return res.status(404).json({ success: false, error: 'Post not found' });

    if (posts[0].author_id !== req.user.id && req.user.role !== 'Admin') {
      return res.status(403).json({ success: false, error: 'Unauthorized to delete this post' });
    }

    await db.query('DELETE FROM posts WHERE id = ?', [id]);
    await db.query('UPDATE users SET posts_count = GREATEST(0, posts_count - 1) WHERE id = ?', [posts[0].author_id]);

    res.json({ success: true, message: 'Post deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Upvote post
app.post('/api/posts/:id/upvote', authenticateToken, async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const { id } = req.params;
    const userId = req.user.id;

    const [existingVotes] = await connection.query(
      'SELECT * FROM post_votes WHERE post_id = ? AND user_id = ?',
      [id, userId]
    );

    if (existingVotes.length > 0) {
      if (existingVotes[0].vote_type === 'upvote') {
        await connection.query('DELETE FROM post_votes WHERE post_id = ? AND user_id = ?', [id, userId]);
      } else {
        await connection.query('UPDATE post_votes SET vote_type = ? WHERE post_id = ? AND user_id = ?', ['upvote', id, userId]);
      }
    } else {
      await connection.query(
        'INSERT INTO post_votes (id, post_id, user_id, vote_type) VALUES (?, ?, ?, ?)',
        [generateId(), id, userId, 'upvote']
      );

      const [posts] = await connection.query('SELECT author_id FROM posts WHERE id = ?', [id]);
      if (posts.length > 0 && posts[0].author_id !== userId) {
        await connection.query(
          `INSERT INTO notifications (id, user_id, type, message, from_user_id, link) 
           VALUES (?, ?, 'upvote', ?, ?, ?)`,
          [generateId(), posts[0].author_id, `${req.user.username} amepiga kura swali lako`, userId, `/post/${id}`]
        );
        await connection.query('UPDATE users SET reputation = reputation + 2 WHERE id = ?', [posts[0].author_id]);
      }
    }

    // Direct vote count update (reliable, doesn't depend on procedure)
    await connection.query(`
      UPDATE posts SET 
        upvotes = (SELECT COUNT(*) FROM post_votes WHERE post_id = ? AND vote_type = 'upvote'),
        downvotes = (SELECT COUNT(*) FROM post_votes WHERE post_id = ? AND vote_type = 'downvote')
      WHERE id = ?
    `, [id, id, id]);

    await connection.commit();

    res.json({ success: true });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ success: false, error: error.message });
  } finally {
    connection.release();
  }
});

// Downvote post
app.post('/api/posts/:id/downvote', authenticateToken, async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const { id } = req.params;
    const userId = req.user.id;

    const [existingVotes] = await connection.query(
      'SELECT * FROM post_votes WHERE post_id = ? AND user_id = ?',
      [id, userId]
    );

    if (existingVotes.length > 0) {
      if (existingVotes[0].vote_type === 'downvote') {
        await connection.query('DELETE FROM post_votes WHERE post_id = ? AND user_id = ?', [id, userId]);
      } else {
        await connection.query('UPDATE post_votes SET vote_type = ? WHERE post_id = ? AND user_id = ?', ['downvote', id, userId]);
      }
    } else {
      await connection.query(
        'INSERT INTO post_votes (id, post_id, user_id, vote_type) VALUES (?, ?, ?, ?)',
        [generateId(), id, userId, 'downvote']
      );
    }

    await connection.query(`
      UPDATE posts SET 
        upvotes = (SELECT COUNT(*) FROM post_votes WHERE post_id = ? AND vote_type = 'upvote'),
        downvotes = (SELECT COUNT(*) FROM post_votes WHERE post_id = ? AND vote_type = 'downvote')
      WHERE id = ?
    `, [id, id, id]);

    await connection.commit();

    res.json({ success: true });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ success: false, error: error.message });
  } finally {
    connection.release();
  }
});

// Bookmark post
app.post('/api/posts/:id/bookmark', authenticateToken, async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    const { id } = req.params;
    const userId = req.user.id;

    const [existing] = await connection.query('SELECT id FROM bookmarks WHERE post_id = ? AND user_id = ?', [id, userId]);
    let isBookmarked = false;

    if (existing.length > 0) {
      await connection.query('DELETE FROM bookmarks WHERE post_id = ? AND user_id = ?', [id, userId]);
    } else {
      await connection.query('INSERT INTO bookmarks (id, user_id, post_id) VALUES (?, ?, ?)', [generateId(), userId, id]);
      isBookmarked = true;
    }

    await connection.query('UPDATE posts SET bookmarks_count = (SELECT COUNT(*) FROM bookmarks WHERE post_id = ?) WHERE id = ?', [id, id]);

    await connection.commit();
    res.json({ success: true, isBookmarked });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ success: false, error: error.message });
  } finally {
    connection.release();
  }
});

// React to post
app.post('/api/posts/:id/react', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { emoji } = req.body;
    if (!emoji) return res.status(400).json({ success: false, error: 'Emoji is required' });

    const [posts] = await db.query('SELECT reactions FROM posts WHERE id = ?', [id]);
    if (posts.length === 0) return res.status(404).json({ success: false, error: 'Post not found' });

    let reactions = {};
    try {
      reactions = typeof posts[0].reactions === 'string' ? JSON.parse(posts[0].reactions) : (posts[0].reactions || {});
    } catch {}

    reactions[emoji] = (reactions[emoji] || 0) + 1;

    await db.query('UPDATE posts SET reactions = ? WHERE id = ?', [JSON.stringify(reactions), id]);

    res.json({ success: true, reactions });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================
// COMMENTS ROUTES
// ============================================

// Get comments for post
app.get('/api/posts/:postId/comments', async (req, res) => {
  try {
    const { postId } = req.params;
    const { sort = 'best' } = req.query;

    let query = `
      SELECT c.*, u.username as author_username, u.avatar as author_avatar, u.role as author_role
      FROM comments c
      LEFT JOIN users u ON c.author_id = u.id
      WHERE c.post_id = ?
    `;

    switch (sort) {
      case 'newest':
        query += ' ORDER BY c.created_at DESC';
        break;
      case 'oldest':
        query += ' ORDER BY c.created_at ASC';
        break;
      default:
        query += ' ORDER BY c.is_best_answer DESC, c.upvotes DESC, c.created_at DESC';
    }

    const [comments] = await db.query(query, [postId]);

    const formattedComments = comments.map(comment => ({
      id: comment.id,
      postId: comment.post_id,
      authorId: comment.author_id,
      content: comment.content,
      upvotes: comment.upvotes || 0,
      downvotes: comment.downvotes || 0,
      isBestAnswer: Boolean(comment.is_best_answer),
      parentId: comment.parent_id,
      createdAt: comment.created_at,
      updatedAt: comment.updated_at,
      author: {
        id: comment.author_id,
        username: comment.author_username || 'Mwanachama',
        avatar: comment.author_avatar || 'NJ',
        role: comment.author_role || 'Mwanachama'
      }
    }));

    res.json({ success: true, data: formattedComments });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Add comment
app.post('/api/posts/:postId/comments', authenticateToken, async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const { postId } = req.params;
    const { content } = req.body;

    if (!content) {
      throw new Error('Content is required');
    }

    const commentId = generateId();

    await connection.query(
      `INSERT INTO comments (id, post_id, author_id, content) VALUES (?, ?, ?, ?)`,
      [commentId, postId, req.user.id, content]
    );

    // Update post comments count
    await connection.query('UPDATE posts SET comments_count = comments_count + 1 WHERE id = ?', [postId]);
    // Update user answer count & reputation
    await connection.query('UPDATE users SET answers_count = answers_count + 1, reputation = reputation + 10 WHERE id = ?', [req.user.id]);

    // Create activity
    await connection.query(
      `INSERT INTO activities (id, user_id, type, target_id, target_type) 
       VALUES (?, ?, 'comment', ?, 'comment')`,
      [generateId(), req.user.id, commentId]
    );

    // Notify post author
    const [posts] = await connection.query('SELECT author_id, title FROM posts WHERE id = ?', [postId]);
    if (posts.length > 0 && posts[0].author_id !== req.user.id) {
      await connection.query(
        `INSERT INTO notifications (id, user_id, type, message, from_user_id, link) 
         VALUES (?, ?, 'comment', ?, ?, ?)`,
        [generateId(), posts[0].author_id, `${req.user.username} amejibu swali lako: "${posts[0].title.slice(0, 30)}..."`, req.user.id, `/post/${postId}`]
      );
    }

    await connection.commit();

    const newComment = {
      id: commentId,
      postId,
      authorId: req.user.id,
      content,
      upvotes: 0,
      downvotes: 0,
      isBestAnswer: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      author: {
        id: req.user.id,
        username: req.user.username,
        avatar: req.user.avatar || 'NJ',
        role: req.user.role || 'Mwanachama'
      }
    };

    res.status(201).json({ success: true, data: newComment });
  } catch (error) {
    await connection.rollback();
    res.status(400).json({ success: false, error: error.message });
  } finally {
    connection.release();
  }
});

// Update comment
app.put('/api/comments/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    if (!content) return res.status(400).json({ success: false, error: 'Content is required' });

    const [comments] = await db.query('SELECT * FROM comments WHERE id = ?', [id]);
    if (comments.length === 0) return res.status(404).json({ success: false, error: 'Comment not found' });

    if (comments[0].author_id !== req.user.id && req.user.role !== 'Admin') {
      return res.status(403).json({ success: false, error: 'Unauthorized to edit this comment' });
    }

    await db.query('UPDATE comments SET content = ? WHERE id = ?', [content, id]);
    res.json({ success: true, message: 'Comment updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Delete comment
app.delete('/api/comments/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const [comments] = await db.query('SELECT * FROM comments WHERE id = ?', [id]);
    if (comments.length === 0) return res.status(404).json({ success: false, error: 'Comment not found' });

    if (comments[0].author_id !== req.user.id && req.user.role !== 'Admin') {
      return res.status(403).json({ success: false, error: 'Unauthorized to delete this comment' });
    }

    await db.query('DELETE FROM comments WHERE id = ?', [id]);
    await db.query('UPDATE posts SET comments_count = GREATEST(0, comments_count - 1) WHERE id = ?', [comments[0].post_id]);

    res.json({ success: true, message: 'Comment deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Upvote comment
app.post('/api/comments/:id/upvote', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const [existing] = await db.query('SELECT * FROM comment_votes WHERE comment_id = ? AND user_id = ?', [id, userId]);
    if (existing.length > 0) {
      await db.query('DELETE FROM comment_votes WHERE comment_id = ? AND user_id = ?', [id, userId]);
    } else {
      await db.query('INSERT INTO comment_votes (id, comment_id, user_id, vote_type) VALUES (?, ?, ?, ?)', [generateId(), id, userId, 'upvote']);
    }

    await db.query('UPDATE comments SET upvotes = (SELECT COUNT(*) FROM comment_votes WHERE comment_id = ? AND vote_type = "upvote") WHERE id = ?', [id, id]);

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Mark comment as best answer
app.post('/api/comments/:id/best', authenticateToken, async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    const { id } = req.params;

    const [comments] = await connection.query('SELECT * FROM comments WHERE id = ?', [id]);
    if (comments.length === 0) return res.status(404).json({ success: false, error: 'Comment not found' });

    const comment = comments[0];
    const [posts] = await connection.query('SELECT author_id FROM posts WHERE id = ?', [comment.post_id]);
    if (posts.length === 0) return res.status(404).json({ success: false, error: 'Post not found' });

    if (posts[0].author_id !== req.user.id && req.user.role !== 'Admin') {
      return res.status(403).json({ success: false, error: 'Only the author can select the best answer' });
    }

    // Toggle best answer
    const newStatus = !comment.is_best_answer;
    // Unmark any previous best answer on the same post
    await connection.query('UPDATE comments SET is_best_answer = FALSE WHERE post_id = ?', [comment.post_id]);
    await connection.query('UPDATE comments SET is_best_answer = ? WHERE id = ?', [newStatus, id]);

    if (newStatus) {
      // Award reputation for best answer
      await connection.query('UPDATE users SET reputation = reputation + 25 WHERE id = ?', [comment.author_id]);
      await connection.query(
        `INSERT INTO notifications (id, user_id, type, message, from_user_id, link)
         VALUES (?, ?, 'badge', 'Jibu lako limechaguliwa kuwa JIBU BORA! (+25 Rep)', ?, ?)`,
        [generateId(), comment.author_id, req.user.id, `/post/${comment.post_id}`]
      );
    }

    await connection.commit();
    res.json({ success: true, isBestAnswer: newStatus });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ success: false, error: error.message });
  } finally {
    connection.release();
  }
});

// ============================================
// USERS ROUTES
// ============================================

// Get all users
app.get('/api/users', async (req, res) => {
  try {
    const [users] = await db.query(`
      SELECT id, username, email, avatar, role, bio, reputation, is_verified,
             followers_count, following_count, posts_count, answers_count, created_at
      FROM users
      ORDER BY reputation DESC, followers_count DESC
      LIMIT 100
    `);

    const formattedUsers = users.map(u => ({
      id: u.id,
      username: u.username,
      email: u.email,
      avatar: u.avatar,
      role: u.role,
      bio: u.bio,
      reputation: u.reputation,
      isVerified: Boolean(u.is_verified),
      followers: u.followers_count,
      following: u.following_count,
      postsCount: u.posts_count,
      answersCount: u.answers_count,
      joinedAt: u.created_at
    }));

    res.json({ success: true, data: formattedUsers });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get user by ID
app.get('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [users] = await db.query(`
      SELECT * FROM users WHERE id = ?
    `, [id]);

    if (users.length === 0) return res.status(404).json({ success: false, error: 'User not found' });

    const [badges] = await db.query('SELECT * FROM badges WHERE user_id = ?', [id]);
    const u = users[0];

    res.json({
      success: true,
      data: {
        id: u.id,
        username: u.username,
        email: u.email,
        avatar: u.avatar,
        cover_image: u.cover_image || null,
        coverImage: u.cover_image || null,
        role: u.role,
        bio: u.bio,
        reputation: u.reputation,
        isVerified: Boolean(u.is_verified),
        followers: u.followers_count,
        following: u.following_count,
        postsCount: u.posts_count,
        answersCount: u.answers_count,
        joinedAt: u.created_at,
        badges
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update current user profile (avatar, cover_image, bio, etc.)
app.put('/api/users/profile', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { bio, avatar, cover_image, coverImage } = req.body;
    const finalCover = cover_image || coverImage;

    const updates = [];
    const params = [];

    if (bio !== undefined) {
      updates.push('bio = ?');
      params.push(bio);
    }
    if (avatar !== undefined) {
      updates.push('avatar = ?');
      params.push(avatar);
    }
    if (finalCover !== undefined) {
      try {
        updates.push('cover_image = ?');
        params.push(finalCover);
      } catch {}
    }

    if (updates.length > 0) {
      params.push(userId);
      await db.query(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`, params);
    }

    const [users] = await db.query('SELECT * FROM users WHERE id = ?', [userId]);
    if (users.length === 0) return res.status(404).json({ success: false, error: 'User not found' });
    const u = users[0];

    res.json({
      success: true,
      data: {
        id: u.id,
        username: u.username,
        email: u.email,
        avatar: u.avatar,
        cover_image: u.cover_image || null,
        coverImage: u.cover_image || null,
        role: u.role,
        bio: u.bio,
        reputation: u.reputation,
        isVerified: Boolean(u.is_verified),
        followers: u.followers_count,
        following: u.following_count,
        postsCount: u.posts_count,
        answersCount: u.answers_count,
        joinedAt: u.created_at,
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Follow user
app.post('/api/users/:id/follow', authenticateToken, async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    const { id: followingId } = req.params;
    const followerId = req.user.id;

    if (followingId === followerId) {
      return res.status(400).json({ success: false, error: 'Cannot follow yourself' });
    }

    const [existing] = await connection.query('SELECT id FROM followers WHERE follower_id = ? AND following_id = ?', [followerId, followingId]);
    if (existing.length === 0) {
      await connection.query('INSERT INTO followers (id, follower_id, following_id) VALUES (?, ?, ?)', [generateId(), followerId, followingId]);
      await connection.query('UPDATE users SET followers_count = followers_count + 1 WHERE id = ?', [followingId]);
      await connection.query('UPDATE users SET following_count = following_count + 1 WHERE id = ?', [followerId]);

      await connection.query(
        `INSERT INTO notifications (id, user_id, type, message, from_user_id, link) 
         VALUES (?, ?, 'follow', ?, ?, ?)`,
        [generateId(), followingId, `${req.user.username} ameanza kukufuatilia`, followerId, `/profile/${followerId}`]
      );
    }

    await connection.commit();
    res.json({ success: true, message: 'Followed user successfully' });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ success: false, error: error.message });
  } finally {
    connection.release();
  }
});

// Unfollow user
app.delete('/api/users/:id/follow', authenticateToken, async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    const { id: followingId } = req.params;
    const followerId = req.user.id;

    await connection.query('DELETE FROM followers WHERE follower_id = ? AND following_id = ?', [followerId, followingId]);
    await connection.query('UPDATE users SET followers_count = GREATEST(0, followers_count - 1) WHERE id = ?', [followingId]);
    await connection.query('UPDATE users SET following_count = GREATEST(0, following_count - 1) WHERE id = ?', [followerId]);

    await connection.commit();
    res.json({ success: true, message: 'Unfollowed user successfully' });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ success: false, error: error.message });
  } finally {
    connection.release();
  }
});

// ============================================
// NOTIFICATIONS ROUTES
// ============================================

// Get user notifications
app.get('/api/notifications', authenticateToken, async (req, res) => {
  try {
    const [notifs] = await db.query(
      'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50',
      [req.user.id]
    );

    const formatted = notifs.map(n => ({
      id: n.id,
      userId: n.user_id,
      type: n.type,
      message: n.message,
      link: n.link,
      fromUserId: n.from_user_id,
      isRead: Boolean(n.is_read),
      createdAt: n.created_at
    }));

    res.json({ success: true, data: formatted });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Mark single notification read
app.put('/api/notifications/:id/read', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('UPDATE notifications SET is_read = TRUE WHERE id = ? AND user_id = ?', [id, req.user.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Mark all notifications read
app.put('/api/notifications/read-all', authenticateToken, async (req, res) => {
  try {
    await db.query('UPDATE notifications SET is_read = TRUE WHERE user_id = ?', [req.user.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================
// FILE & IMAGE UPLOAD ROUTE
// ============================================
app.post('/api/upload', optionalAuth, upload.any(), (req, res) => {
  try {
    const file = (req.files && req.files.length > 0) ? req.files[0] : req.file;
    if (!file) {
      return res.status(400).json({ success: false, error: 'Hakuna faili lililopakiwa' });
    }

    const baseUrl = process.env.API_URL || `http://localhost:${PORT}`;
    const fileUrl = `${baseUrl.replace('/api', '')}/uploads/${file.filename}`;

    res.json({
      success: true,
      data: {
        url: fileUrl,
        filename: file.filename,
        originalName: file.originalname,
        mimetype: file.mimetype,
        size: file.size
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================
// STORIES ROUTES
// ============================================

// Get active stories
app.get('/api/stories', async (req, res) => {
  try {
    const [stories] = await db.query(`
      SELECT s.*, u.username, u.avatar, u.role
      FROM stories s
      JOIN users u ON s.user_id = u.id
      WHERE s.expires_at > NOW()
      ORDER BY s.created_at DESC
    `);
    const formatted = stories.map(s => ({
      id: s.id,
      userId: s.user_id,
      content: s.content,
      backgroundColor: s.background_color || 'linear-gradient(135deg, #6366f1, #9333ea)',
      views: s.views || 0,
      createdAt: s.created_at,
      expiresAt: s.expires_at,
      user: {
        id: s.user_id,
        username: s.username,
        avatar: s.avatar || 'NJ',
        role: s.role
      }
    }));
    res.json({ success: true, data: formatted });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create story
app.post('/api/stories', authenticateToken, async (req, res) => {
  try {
    const { content, backgroundColor } = req.body;
    if (!content) return res.status(400).json({ success: false, error: 'Content required' });
    const id = generateId();
    await db.query(`
      INSERT INTO stories (id, user_id, content, background_color, expires_at)
      VALUES (?, ?, ?, ?, DATE_ADD(NOW(), INTERVAL 24 HOUR))
    `, [id, req.user.id, content, backgroundColor || 'linear-gradient(135deg, #6366f1, #9333ea)']);
    
    res.status(201).json({ success: true, data: { id, content } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// View story
app.post('/api/stories/:id/view', async (req, res) => {
  try {
    await db.query('UPDATE stories SET views = views + 1 WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================
// MESSAGES ROUTES
// ============================================

// Get conversations
app.get('/api/messages/conversations', authenticateToken, async (req, res) => {
  try {
    const [conversations] = await db.query(`
      SELECT 
        CASE WHEN sender_id = ? THEN receiver_id ELSE sender_id END as other_user_id,
        content as last_message,
        created_at as last_message_time,
        is_read
      FROM messages
      WHERE id IN (
        SELECT MAX(id)
        FROM messages
        WHERE sender_id = ? OR receiver_id = ?
        GROUP BY LEAST(sender_id, receiver_id), GREATEST(sender_id, receiver_id)
      )
      ORDER BY created_at DESC
    `, [req.user.id, req.user.id, req.user.id]);

    const result = [];
    for (const c of conversations) {
      const [userRows] = await db.query('SELECT id, username, avatar, role FROM users WHERE id = ?', [c.other_user_id]);
      if (userRows.length > 0) {
        result.push({
          userId: c.other_user_id,
          user: userRows[0],
          lastMessage: c.last_message,
          lastMessageTime: c.last_message_time,
          unreadCount: c.is_read ? 0 : 1
        });
      }
    }
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get messages with a user
app.get('/api/messages/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const [messages] = await db.query(`
      SELECT * FROM messages
      WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)
      ORDER BY created_at ASC
      LIMIT 100
    `, [req.user.id, userId, userId, req.user.id]);

    // Mark as read
    await db.query('UPDATE messages SET is_read = TRUE WHERE sender_id = ? AND receiver_id = ?', [userId, req.user.id]);

    res.json({ success: true, data: messages });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Send message
app.post('/api/messages/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const { content } = req.body;
    if (!content) return res.status(400).json({ success: false, error: 'Content required' });

    const messageId = generateId();
    await db.query(`
      INSERT INTO messages (id, sender_id, receiver_id, content)
      VALUES (?, ?, ?, ?)
    `, [messageId, req.user.id, userId, content]);

    // Create notification
    await db.query(`
      INSERT INTO notifications (id, user_id, type, message, from_user_id, link)
      VALUES (?, ?, 'comment', ?, ?, '/messages')
    `, [generateId(), userId, `${req.user.username} amekutumia ujumbe mpya`, req.user.id]);

    res.status(201).json({
      success: true,
      data: {
        id: messageId,
        senderId: req.user.id,
        receiverId: userId,
        content,
        createdAt: new Date().toISOString(),
        isRead: false
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================
// GUILDS ROUTES
// ============================================

// Get guilds
app.get('/api/guilds', optionalAuth, async (req, res) => {
  try {
    const [guilds] = await db.query(`
      SELECT g.*, u.username as leader_name,
        (SELECT COUNT(*) FROM guild_members gm WHERE gm.guild_id = g.id) as members_count
      FROM guilds g
      JOIN users u ON g.leader_id = u.id
      ORDER BY g.created_at DESC
    `);

    let userGuilds = [];
    if (req.user) {
      const [memberships] = await db.query('SELECT guild_id FROM guild_members WHERE user_id = ?', [req.user.id]);
      userGuilds = memberships.map(m => m.guild_id);
    }

    const formatted = guilds.map(g => ({
      id: g.id,
      name: g.name,
      description: g.description,
      icon: g.icon || '🏰',
      leaderId: g.leader_id,
      leaderName: g.leader_name,
      membersCount: g.members_count || 1,
      maxMembers: g.max_members,
      isPrivate: Boolean(g.is_private),
      isMember: userGuilds.includes(g.id),
      createdAt: g.created_at
    }));

    res.json({ success: true, data: formatted });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create guild
app.post('/api/guilds', authenticateToken, async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    const { name, description, icon, maxMembers, isPrivate } = req.body;
    if (!name) return res.status(400).json({ success: false, error: 'Guild name is required' });

    const guildId = generateId();
    await connection.query(`
      INSERT INTO guilds (id, name, description, icon, leader_id, max_members, is_private)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [guildId, name, description || '', icon || '🏰', req.user.id, maxMembers || 50, isPrivate || false]);

    // Leader joins automatically
    await connection.query(`
      INSERT INTO guild_members (id, guild_id, user_id, role)
      VALUES (?, ?, ?, 'leader')
    `, [generateId(), guildId, req.user.id]);

    await connection.commit();
    res.status(201).json({ success: true, data: { id: guildId, name } });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ success: false, error: error.message });
  } finally {
    connection.release();
  }
});

// Join guild
app.post('/api/guilds/:id/join', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    await db.query(`
      INSERT IGNORE INTO guild_members (id, guild_id, user_id, role)
      VALUES (?, ?, ?, 'member')
    `, [generateId(), id, req.user.id]);
    res.json({ success: true, message: 'Joined guild successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Leave guild
app.post('/api/guilds/:id/leave', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM guild_members WHERE guild_id = ? AND user_id = ?', [id, req.user.id]);
    res.json({ success: true, message: 'Left guild' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================
// TOURNAMENTS ROUTES
// ============================================

// Get tournaments
app.get('/api/tournaments', optionalAuth, async (req, res) => {
  try {
    const [tournaments] = await db.query(`
      SELECT t.*,
        (SELECT COUNT(*) FROM tournament_participants tp WHERE tp.tournament_id = t.id) as participants_count
      FROM tournaments t
      ORDER BY t.created_at DESC
    `);

    let userTournaments = [];
    if (req.user) {
      const [participations] = await db.query('SELECT tournament_id FROM tournament_participants WHERE user_id = ?', [req.user.id]);
      userTournaments = participations.map(p => p.tournament_id);
    }

    const formatted = tournaments.map(t => ({
      id: t.id,
      name: t.name,
      description: t.description,
      icon: t.icon || '🏆',
      startDate: t.start_date,
      endDate: t.end_date,
      maxParticipants: t.max_participants,
      participantsCount: t.participants_count || 0,
      prize: t.prize,
      status: t.status,
      isJoined: userTournaments.includes(t.id)
    }));

    res.json({ success: true, data: formatted });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Join tournament
app.post('/api/tournaments/:id/join', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    await db.query(`
      INSERT IGNORE INTO tournament_participants (id, tournament_id, user_id)
      VALUES (?, ?, ?)
    `, [generateId(), id, req.user.id]);
    res.json({ success: true, message: 'Joined tournament' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================
// AI CHATBOT ROUTE
// ============================================
app.post('/api/ai/chat', async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ success: false, error: 'Message is required' });

    const msg = message.toLowerCase().trim();

    // Search database for matching posts or answers
    let relatedPosts = [];
    try {
      const [rows] = await db.query('SELECT id, title, category, upvotes FROM posts WHERE title LIKE ? OR content LIKE ? LIMIT 3', [`%${msg}%`, `%${msg}%`]);
      relatedPosts = rows;
    } catch {}

    let response = '';

    if (msg.includes('habari') || msg.includes('hujambo') || msg.includes('mambo') || msg.includes('hello')) {
      response = 'Habari yako! Mimi ni Nijuze AI Assistant. Niko tayari kukusaidia kupata majibu ya kitaalamu, kuelewa mada za kiteknolojia, biashara au kupata posts za jamii yetu. Je, nikusaidie nini leo?';
    } else if (msg.includes('react') || msg.includes('frontend') || msg.includes('javascript')) {
      response = 'React ni maktaba (library) ya kisasa ya JavaScript inayotumika kujenga mifumo ya kielektroniki yenye kasi. Inatumia dhana ya "Components" na State Management (kama Context API). Kwenye Nijuze unaweza kupata miongozo na maswali mengi ya React!';
    } else if (msg.includes('python') || msg.includes('ai') || msg.includes('machine learning')) {
      response = 'Kujifunza AI na Machine Learning kwa Python kunahitaji kuanza na misingi ya Python, maktaba za NumPy na Pandas, na kisha Scikit-Learn au PyTorch kwa Deep Learning. Jamii ya Nijuze ina wataalam wengi wa AI unaweza kuwauliza maswali hapa!';
    } else if (msg.includes('biashara') || msg.includes('startup') || msg.includes('fedha')) {
      response = 'Kuanzisha biashara ya kidijitali Afrika Mashariki kunahitaji utafiti wa soko, kutatua shida halisi ya wateja (Problem-Market Fit), na kuweka mifumo ya malipo (kama M-Pesa au kadi). Tembelea kategoria ya "Biashara" kwenye Nijuze kuona uzoefu wa wajasiriamali!';
    } else {
      if (relatedPosts.length > 0) {
        response = `Nimepata mada ${relatedPosts.length} kwenye Nijuze zinazohusiana na swali lako:\n\n` +
          relatedPosts.map((p, i) => `${i + 1}. **${p.title}** (${p.category}) - 👍 ${p.upvotes} kura`).join('\n') +
          `\n\nUnaweza kubofya au kutafuta mada hizo kwenye mfumo!`;
      } else {
        response = `Asante kwa swali lako kuhusu "${message}". Kwenye jukwaa la Nijuze, unaweza kubofya kitufe cha "+ Uliza Swali" ili kupata majibu ya kina kutoka kwa maelfu ya wataalamu na wanachama, au unaweza kujiunga na Vikundi (Guilds) na Mashindano!`;
      }
    }

    res.json({ success: true, reply: response });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================
// ADMIN ROUTES
// ============================================

// Get dashboard stats
app.get('/api/admin/stats', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const [users] = await db.query('SELECT COUNT(*) as count FROM users');
    const [posts] = await db.query('SELECT COUNT(*) as count FROM posts');
    const [comments] = await db.query('SELECT COUNT(*) as count FROM comments');
    const [views] = await db.query('SELECT COALESCE(SUM(views), 0) as total FROM posts');
    const [activeUsers] = await db.query('SELECT COUNT(*) as count FROM users WHERE posts_count > 0 OR answers_count > 0');
    const [reports] = await db.query('SELECT COUNT(*) as count FROM reports WHERE status = "pending"');

    res.json({
      success: true,
      data: {
        totalUsers: users[0].count,
        totalPosts: posts[0].count,
        totalComments: comments[0].count,
        totalViews: views[0].total,
        activeUsers: activeUsers[0].count,
        pendingReports: reports[0]?.count || 0
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get all users (admin)
app.get('/api/admin/users', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const offset = (page - 1) * limit;

    let query = 'SELECT id, username, email, avatar, role, reputation, is_verified, is_banned, created_at FROM users';
    const params = [];

    if (search) {
      query += ' WHERE username LIKE ? OR email LIKE ?';
      params.push(`%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [users] = await db.query(query, params);

    res.json({
      success: true,
      data: users
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Ban user (admin)
app.post('/api/admin/users/:id/ban', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('UPDATE users SET is_banned = TRUE WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Unban user (admin)
app.post('/api/admin/users/:id/unban', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('UPDATE users SET is_banned = FALSE WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get reports (admin)
app.get('/api/admin/reports', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const [reports] = await db.query(`
      SELECT r.*, u.username as reporter_username 
      FROM reports r
      LEFT JOIN users u ON r.reporter_id = u.id
      ORDER BY r.created_at DESC LIMIT 50
    `);
    res.json({ success: true, data: reports });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================
// HEALTH CHECK
// ============================================
app.get(['/health', '/api/health'], async (req, res) => {
  try {
    let dbStatus = 'disconnected';
    let dbType = 'none';
    if (db) {
      const connection = await db.getConnection();
      await connection.ping();
      connection.release();
      dbStatus = 'connected';
      dbType = db.isLocalStorage ? 'local_json_engine' : 'mysql';
    }
    
    res.json({ 
      status: 'healthy', 
      timestamp: new Date().toISOString(),
      database: dbStatus,
      engine: dbType,
      version: '1.0.0'
    });
  } catch (error) {
    res.status(200).json({ 
      status: 'degraded', 
      database: 'disconnected',
      error: error.message 
    });
  }
});

// ============================================
// ERROR HANDLING
// ============================================
app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Route not found' });
});

app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ success: false, error: err.message || 'Internal server error' });
});

// ============================================
// START SERVER
// ============================================
async function startServer() {
  try {
    await connectDB();
    
    app.listen(PORT, () => {
      console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🚀 NIJUZE BACKEND SERVER                                ║
║                                                           ║
║   Port: ${PORT}                                              ║
║   Environment: ${process.env.NODE_ENV || 'development'}                           ║
║   Database: MySQL                                         ║
║                                                           ║
║   API: http://localhost:${PORT}/api                          ║
║   Health: http://localhost:${PORT}/health                    ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
  }
}

startServer();

module.exports = { app, db };

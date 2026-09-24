// ============================================
// NIJUZE BACKEND SERVER - MySQL Version
// For aaPanel Deployment
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
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

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
    db = await mysql.createPool(dbConfig);
    console.log('✅ Connected to MySQL database');
    
    // Test connection
    const connection = await db.getConnection();
    await connection.ping();
    connection.release();
    console.log('✅ Database connection test successful');
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    process.exit(1);
  }
}

// ============================================
// MIDDLEWARE
// ============================================
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: { success: false, error: 'Too many requests, please try again later' }
});
app.use('/api/', limiter);

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ============================================
// FILE UPLOAD CONFIGURATION
// ============================================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
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

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if user exists and is not banned
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

const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'Admin') {
    return res.status(403).json({ success: false, error: 'Admin access required' });
  }
  next();
};

// ============================================
// HELPER FUNCTIONS
// ============================================
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { 
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

    // Validation
    if (!username || !email || !password) {
      throw new Error('All fields are required');
    }

    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters');
    }

    // Check if user exists
    const [existingUsers] = await connection.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existingUsers.length > 0) {
      throw new Error('Email already registered');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const userId = generateId();
    const avatar = username.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

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
          role: 'Mwanachama'
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

    // Find user
    const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    
    if (users.length === 0) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    const user = users[0];

    if (user.is_banned) {
      return res.status(403).json({ success: false, error: 'Account is banned' });
    }

    // Check password
    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    // Update last login
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
          reputation: user.reputation,
          is_verified: user.is_verified
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

    // Get badges
    const [badges] = await db.query('SELECT * FROM badges WHERE user_id = ?', [req.user.id]);

    res.json({
      success: true,
      data: {
        ...users[0],
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
app.get('/api/posts', async (req, res) => {
  try {
    const { page = 1, limit = 20, category, search, sort = 'latest' } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT p.*, u.username as author_username, u.avatar as author_avatar, 
             u.role as author_role, u.is_verified as author_verified
      FROM posts p
      LEFT JOIN users u ON p.author_id = u.id
      WHERE p.is_approved = TRUE
    `;
    const params = [];

    if (category) {
      query += ' AND p.category = ?';
      params.push(category);
    }

    if (search) {
      query += ' AND (p.title LIKE ? OR p.content LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    // Sorting
    switch (sort) {
      case 'popular':
        query += ' ORDER BY (p.upvotes + p.comments_count * 2) DESC';
        break;
      case 'unanswered':
        query += ' ORDER BY p.comments_count ASC';
        break;
      default:
        query += ' ORDER BY p.is_pinned DESC, p.created_at DESC';
    }

    query += ' LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [posts] = await db.query(query, params);

    // Get total count
    let countQuery = 'SELECT COUNT(*) as total FROM posts WHERE is_approved = TRUE';
    const countParams = [];
    
    if (category) {
      countQuery += ' AND category = ?';
      countParams.push(category);
    }
    
    if (search) {
      countQuery += ' AND (title LIKE ? OR content LIKE ?)';
      countParams.push(`%${search}%`, `%${search}%`);
    }

    const [countResult] = await db.query(countQuery, countParams);
    const total = countResult[0].total;

    // Format posts
    const formattedPosts = posts.map(post => ({
      ...post,
      author: {
        id: post.author_id,
        username: post.author_username,
        avatar: post.author_avatar,
        role: post.author_role,
        isVerified: post.author_verified
      },
      tags: JSON.parse(post.tags || '[]'),
      reactions: JSON.parse(post.reactions || '{}')
    }));

    res.json({
      success: true,
      data: {
        posts: formattedPosts,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
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

    const { title, content, tags, category, isAnonymous = false } = req.body;

    if (!title || !content) {
      throw new Error('Title and content are required');
    }

    if (title.length < 10) {
      throw new Error('Title must be at least 10 characters');
    }

    const postId = generateId();

    await connection.query(
      `INSERT INTO posts (id, author_id, title, content, tags, category, is_anonymous) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [postId, req.user.id, title, content, JSON.stringify(tags), category, isAnonymous]
    );

    // Create activity
    await connection.query(
      `INSERT INTO activities (id, user_id, type, target_id, target_type) 
       VALUES (?, ?, 'post', ?, 'post')`,
      [generateId(), req.user.id, postId]
    );

    await connection.commit();

    // Get created post
    const [posts] = await connection.query('SELECT * FROM posts WHERE id = ?', [postId]);

    res.status(201).json({
      success: true,
      data: {
        post: {
          ...posts[0],
          tags: JSON.parse(posts[0].tags || '[]'),
          reactions: JSON.parse(posts[0].reactions || '{}')
        }
      }
    });
  } catch (error) {
    await connection.rollback();
    res.status(400).json({ success: false, error: error.message });
  } finally {
    connection.release();
  }
});

// Get single post
app.get('/api/posts/:id', async (req, res) => {
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

    // Increment views
    await db.query('UPDATE posts SET views = views + 1 WHERE id = ?', [id]);

    const post = posts[0];

    res.json({
      success: true,
      data: {
        ...post,
        author: {
          id: post.author_id,
          username: post.author_username,
          avatar: post.author_avatar,
          role: post.author_role,
          isVerified: post.author_verified,
          bio: post.author_bio
        },
        tags: JSON.parse(post.tags || '[]'),
        reactions: JSON.parse(post.reactions || '{}')
      }
    });
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

    // Check if already voted
    const [existingVotes] = await connection.query(
      'SELECT * FROM post_votes WHERE post_id = ? AND user_id = ?',
      [id, userId]
    );

    if (existingVotes.length > 0) {
      if (existingVotes[0].vote_type === 'upvote') {
        // Remove upvote
        await connection.query('DELETE FROM post_votes WHERE post_id = ? AND user_id = ?', [id, userId]);
      } else {
        // Change to upvote
        await connection.query('UPDATE post_votes SET vote_type = ? WHERE post_id = ? AND user_id = ?', ['upvote', id, userId]);
      }
    } else {
      // Add upvote
      await connection.query(
        'INSERT INTO post_votes (id, post_id, user_id, vote_type) VALUES (?, ?, ?, ?)',
        [generateId(), id, userId, 'upvote']
      );

      // Notify post author
      const [posts] = await connection.query('SELECT author_id FROM posts WHERE id = ?', [id]);
      if (posts.length > 0 && posts[0].author_id !== userId) {
        await connection.query(
          `INSERT INTO notifications (id, user_id, type, message, from_user_id, link) 
           VALUES (?, ?, 'upvote', ?, ?, ?)`,
          [generateId(), posts[0].author_id, `${req.user.username} amepiga upvote swali lako`, userId, `/post/${id}`]
        );
      }
    }

    // Update post vote counts
    await connection.query('CALL UpdatePostVotes(?)', [id]);

    await connection.commit();

    res.json({ success: true });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ success: false, error: error.message });
  } finally {
    connection.release();
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
        query += ' ORDER BY c.is_best_answer DESC, c.upvotes DESC';
    }

    const [comments] = await db.query(query, [postId]);

    const formattedComments = comments.map(comment => ({
      ...comment,
      author: {
        id: comment.author_id,
        username: comment.author_username,
        avatar: comment.author_avatar,
        role: comment.author_role
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

    // Create activity
    await connection.query(
      `INSERT INTO activities (id, user_id, type, target_id, target_type) 
       VALUES (?, ?, 'comment', ?, 'comment')`,
      [generateId(), req.user.id, commentId]
    );

    // Notify post author
    const [posts] = await connection.query('SELECT author_id FROM posts WHERE id = ?', [postId]);
    if (posts.length > 0 && posts[0].author_id !== req.user.id) {
      await connection.query(
        `INSERT INTO notifications (id, user_id, type, message, from_user_id, link) 
         VALUES (?, ?, 'comment', ?, ?, ?)`,
        [generateId(), posts[0].author_id, `${req.user.username} amejibu swali lako`, req.user.id, `/post/${postId}`]
      );
    }

    await connection.commit();

    res.status(201).json({ success: true, data: { id: commentId } });
  } catch (error) {
    await connection.rollback();
    res.status(400).json({ success: false, error: error.message });
  } finally {
    connection.release();
  }
});

// ============================================
// FILE UPLOAD ROUTE
// ============================================
app.post('/api/upload', authenticateToken, upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file uploaded' });
    }

    const fileUrl = `${process.env.API_URL || 'http://localhost:5000'}/uploads/${req.file.filename}`;

    res.json({
      success: true,
      data: {
        url: fileUrl,
        filename: req.file.filename
      }
    });
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
    const [views] = await db.query('SELECT SUM(views) as total FROM posts');
    const [activeUsers] = await db.query('SELECT COUNT(*) as count FROM users WHERE posts_count > 0 OR answers_count > 0');

    res.json({
      success: true,
      data: {
        totalUsers: users[0].count,
        totalPosts: posts[0].count,
        totalComments: comments[0].count,
        totalViews: views[0].total || 0,
        activeUsers: activeUsers[0].count
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

    let query = 'SELECT * FROM users';
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

// ============================================
// HEALTH CHECK
// ============================================
app.get('/health', async (req, res) => {
  try {
    const connection = await db.getConnection();
    await connection.ping();
    connection.release();
    
    res.json({ 
      status: 'healthy', 
      timestamp: new Date().toISOString(),
      database: 'connected'
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'unhealthy', 
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
    process.exit(1);
  }
}

startServer();

module.exports = { app, db };

// Nijuze Backend - Main Server File
// This is a complete Node.js + Express backend implementation

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');
const Redis = require('redis');
const socketIo = require('socket.io');
const http = require('http');
const multer = require('multer');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const sgMail = require('@sendgrid/mail');

// Initialize Express app
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: { success: false, error: { code: 'RATE_LIMIT', message: 'Too many requests' } },
});
app.use('/api/', limiter);

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

// Redis connection
const redisClient = Redis.createClient({ url: process.env.REDIS_URL });
redisClient.connect().catch(console.error);

// AWS S3 configuration
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// SendGrid configuration
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// File upload configuration
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'audio/mpeg'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  },
});

// JWT Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Access token required' } });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Invalid token' } });
    }
    req.user = user;
    next();
  });
};

// Helper functions
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
};

const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

const comparePassword = async (password, hash) => {
  return bcrypt.compare(password, hash);
};

// Upload to S3
const uploadToS3 = async (file, folder) => {
  const key = `${folder}/${Date.now()}-${file.originalname}`;
  const command = new PutObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET,
    Key: key,
    Body: file.buffer,
    ContentType: file.mimetype,
  });

  await s3Client.send(command);
  return `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
};

// Send email
const sendEmail = async (to, subject, html) => {
  const msg = {
    to,
    from: process.env.FROM_EMAIL,
    subject,
    html,
  };
  await sgMail.send(msg);
};

// ==================== AUTH ROUTES ====================

// Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Validation
    if (!username || !email || !password) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'All fields are required' } });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Password must be at least 6 characters' } });
    }

    // Check if user exists
    const existingUser = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Email already registered' } });
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    const result = await pool.query(
      `INSERT INTO users (username, email, password_hash, avatar, role, reputation)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, username, email, avatar, role, reputation, is_verified, created_at`,
      [username, email, passwordHash, username.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2), 'Mwanachama', 0]
    );

    const user = result.rows[0];
    const token = generateToken(user.id);

    // Send welcome email
    await sendEmail(
      email,
      'Karibu Nijuze!',
      `<h1>Karibu ${username}!</h1><p>Asante kwa kujiunga na Nijuze.</p>`
    );

    res.status(201).json({ success: true, data: { user, token } });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Internal server error' } });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Email and password are required' } });
    }

    // Find user
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Invalid credentials' } });
    }

    const user = result.rows[0];

    // Check password
    const isValid = await comparePassword(password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Invalid credentials' } });
    }

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
          is_verified: user.is_verified,
        },
        token,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Internal server error' } });
  }
});

// Get current user
app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, username, email, avatar, role, bio, reputation, is_verified, created_at FROM users WHERE id = $1',
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'User not found' } });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Internal server error' } });
  }
});

// ==================== POSTS ROUTES ====================

// Get all posts
app.get('/api/posts', async (req, res) => {
  try {
    const { page = 1, limit = 20, category, tag, search, sort = 'latest' } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT p.*, u.username, u.avatar, u.role, u.is_verified,
             COUNT(c.id) as comments_count
      FROM posts p
      LEFT JOIN users u ON p.author_id = u.id
      LEFT JOIN comments c ON p.id = c.post_id
    `;
    const params = [];
    const conditions = [];

    if (category) {
      conditions.push(`p.category = $${params.length + 1}`);
      params.push(category);
    }

    if (tag) {
      conditions.push(`$${params.length + 1} = ANY(p.tags)`);
      params.push(tag);
    }

    if (search) {
      conditions.push(`(p.title ILIKE $${params.length + 1} OR p.content ILIKE $${params.length + 1})`);
      params.push(`%${search}%`);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' GROUP BY p.id, u.id';

    // Sorting
    switch (sort) {
      case 'trending':
        query += ' ORDER BY (p.upvotes + p.comments_count * 2) DESC';
        break;
      case 'top':
        query += ' ORDER BY p.upvotes DESC';
        break;
      default:
        query += ' ORDER BY p.created_at DESC';
    }

    query += ` LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);

    // Get total count
    let countQuery = 'SELECT COUNT(*) FROM posts p';
    const countParams = [];
    if (conditions.length > 0) {
      countQuery += ' WHERE ' + conditions.join(' AND ');
    }
    const countResult = await pool.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].count);

    res.json({
      success: true,
      data: {
        posts: result.rows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error('Get posts error:', error);
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Internal server error' } });
  }
});

// Create post
app.post('/api/posts', authenticateToken, async (req, res) => {
  try {
    const { title, content, tags, category, isAnonymous = false } = req.body;

    // Validation
    if (!title || !content) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Title and content are required' } });
    }

    if (title.length < 10) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Title must be at least 10 characters' } });
    }

    const result = await pool.query(
      `INSERT INTO posts (author_id, title, content, tags, category, is_anonymous)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [req.user.id, title, content, tags, category, isAnonymous]
    );

    const post = result.rows[0];

    // Update user reputation
    await pool.query('UPDATE users SET reputation = reputation + 10 WHERE id = $1', [req.user.id]);

    res.status(201).json({ success: true, data: { post } });
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Internal server error' } });
  }
});

// Get single post
app.get('/api/posts/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT p.*, u.username, u.avatar, u.role, u.is_verified, u.bio, u.followers_count, u.following_count
       FROM posts p
       LEFT JOIN users u ON p.author_id = u.id
       WHERE p.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Post not found' } });
    }

    // Increment views
    await pool.query('UPDATE posts SET views = views + 1 WHERE id = $1', [id]);

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Get post error:', error);
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Internal server error' } });
  }
});

// Upvote post
app.post('/api/posts/:id/upvote', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Check if already upvoted
    const existing = await pool.query('SELECT * FROM post_votes WHERE post_id = $1 AND user_id = $2', [id, userId]);

    if (existing.rows.length > 0) {
      if (existing.rows[0].vote_type === 'upvote') {
        // Remove upvote
        await pool.query('DELETE FROM post_votes WHERE post_id = $1 AND user_id = $2', [id, userId]);
        await pool.query('UPDATE posts SET upvotes = upvotes - 1 WHERE id = $1', [id]);
      } else {
        // Change to upvote
        await pool.query('UPDATE post_votes SET vote_type = $1 WHERE post_id = $2 AND user_id = $3', ['upvote', id, userId]);
        await pool.query('UPDATE posts SET upvotes = upvotes + 1, downvotes = downvotes - 1 WHERE id = $1', [id]);
      }
    } else {
      // Add upvote
      await pool.query('INSERT INTO post_votes (post_id, user_id, vote_type) VALUES ($1, $2, $3)', [id, userId, 'upvote']);
      await pool.query('UPDATE posts SET upvotes = upvotes + 1 WHERE id = $1', [id]);
      
      // Notify post author
      const post = await pool.query('SELECT author_id FROM posts WHERE id = $1', [id]);
      if (post.rows[0].author_id !== userId) {
        await pool.query(
          'INSERT INTO notifications (user_id, type, message, from_user_id) VALUES ($1, $2, $3, $4)',
          [post.rows[0].author_id, 'upvote', 'Someone upvoted your post', userId]
        );
      }
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Upvote error:', error);
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Internal server error' } });
  }
});

// ==================== COMMENTS ROUTES ====================

// Get comments for post
app.get('/api/posts/:postId/comments', async (req, res) => {
  try {
    const { postId } = req.params;
    const { sort = 'best' } = req.query;

    let query = `
      SELECT c.*, u.username, u.avatar, u.role, u.is_verified
      FROM comments c
      LEFT JOIN users u ON c.author_id = u.id
      WHERE c.post_id = $1
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

    const result = await pool.query(query, [postId]);

    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Internal server error' } });
  }
});

// Add comment
app.post('/api/posts/:postId/comments', authenticateToken, async (req, res) => {
  try {
    const { postId } = req.params;
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Content is required' } });
    }

    const result = await pool.query(
      `INSERT INTO comments (post_id, author_id, content)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [postId, req.user.id, content]
    );

    const comment = result.rows[0];

    // Update post comments count
    await pool.query('UPDATE posts SET comments_count = comments_count + 1 WHERE id = $1', [postId]);

    // Update user reputation
    await pool.query('UPDATE users SET reputation = reputation + 5 WHERE id = $1', [req.user.id]);

    // Notify post author
    const post = await pool.query('SELECT author_id FROM posts WHERE id = $1', [postId]);
    if (post.rows[0].author_id !== req.user.id) {
      await pool.query(
        'INSERT INTO notifications (user_id, type, message, from_user_id) VALUES ($1, $2, $3, $4)',
        [post.rows[0].author_id, 'comment', 'Someone commented on your post', req.user.id]
      );
    }

    res.status(201).json({ success: true, data: { comment } });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Internal server error' } });
  }
});

// ==================== CHAT ROUTES ====================

// Get conversations
app.get('/api/chat/conversations', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      `SELECT DISTINCT
         CASE WHEN m.sender_id = $1 THEN m.receiver_id ELSE m.sender_id END as user_id,
         u.username, u.avatar,
         FIRST_VALUE(m.content) OVER (PARTITION BY CASE WHEN m.sender_id = $1 THEN m.receiver_id ELSE m.sender_id END ORDER BY m.created_at DESC) as last_message,
         FIRST_VALUE(m.created_at) OVER (PARTITION BY CASE WHEN m.sender_id = $1 THEN m.receiver_id ELSE m.sender_id END ORDER BY m.created_at DESC) as last_message_time,
         COUNT(*) FILTER (WHERE m.receiver_id = $1 AND m.is_read = false) OVER (PARTITION BY CASE WHEN m.sender_id = $1 THEN m.receiver_id ELSE m.sender_id END) as unread_count
       FROM messages m
       LEFT JOIN users u ON (CASE WHEN m.sender_id = $1 THEN m.receiver_id ELSE m.sender_id END) = u.id
       WHERE m.sender_id = $1 OR m.receiver_id = $1
       ORDER BY last_message_time DESC`,
      [userId]
    );

    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Internal server error' } });
  }
});

// Send message
app.post('/api/chat/messages', authenticateToken, async (req, res) => {
  try {
    const { receiverId, content } = req.body;

    if (!receiverId || !content) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Receiver and content are required' } });
    }

    const result = await pool.query(
      `INSERT INTO messages (sender_id, receiver_id, content)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [req.user.id, receiverId, content]
    );

    const message = result.rows[0];

    // Emit socket event
    io.to(receiverId).emit('chat:message', message);

    res.status(201).json({ success: true, data: { message } });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Internal server error' } });
  }
});

// ==================== WEBSOCKET ====================

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join', (userId) => {
    socket.join(userId);
  });

  socket.on('typing', (data) => {
    socket.to(data.receiverId).emit('chat:typing', { userId: data.userId });
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// ==================== ERROR HANDLING ====================

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Route not found' } });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message || 'Internal server error' } });
});

// ==================== START SERVER ====================

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Nijuze Backend Server running on port ${PORT}`);
  console.log(`📡 WebSocket server ready`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = { app, server, io };

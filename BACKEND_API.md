# Nijuze Backend API Documentation

## Overview
Nijuze ni jukwaa la maswali na majibu lenye features za kisasa kama live chat, stories, polls, leaderboard, na zaidi.

## Base URL
```
Production: https://api.nijuze.com
Development: http://localhost:5000
```

## Authentication
All API endpoints require authentication using JWT tokens.

### Headers
```
Authorization: Bearer <token>
Content-Type: application/json
```

---

## Endpoints

### Authentication

#### POST /api/auth/register
Register new user

**Request Body:**
```json
{
  "username": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_123",
      "username": "John Doe",
      "email": "john@example.com",
      "avatar": "JD",
      "role": "Mwanachama",
      "reputation": 0,
      "isVerified": false
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### POST /api/auth/login
Login user

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": { ... },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### Posts

#### GET /api/posts
Get all posts with pagination and filters

**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 20)
- `category` (optional)
- `tag` (optional)
- `search` (optional)
- `sort` (latest | trending | top)

**Response:**
```json
{
  "success": true,
  "data": {
    "posts": [
      {
        "id": "post_123",
        "authorId": "user_123",
        "author": { ... },
        "title": "How to learn Machine Learning?",
        "content": "I want to learn ML...",
        "tags": ["ML", "AI", "Learning"],
        "category": "Technology",
        "upvotes": 342,
        "downvotes": 12,
        "commentsCount": 47,
        "views": 2840,
        "createdAt": "2024-01-15T10:30:00Z",
        "isUpvoted": false,
        "isBookmarked": false
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "pages": 5
    }
  }
}
```

#### POST /api/posts
Create new post

**Request Body:**
```json
{
  "title": "How to learn Machine Learning?",
  "content": "I want to learn ML...",
  "tags": ["ML", "AI", "Learning"],
  "category": "Technology",
  "isAnonymous": false
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "post": { ... }
  }
}
```

#### GET /api/posts/:id
Get single post

#### PUT /api/posts/:id
Update post (owner only)

#### DELETE /api/posts/:id
Delete post (owner only)

#### POST /api/posts/:id/upvote
Upvote post

#### POST /api/posts/:id/downvote
Downvote post

#### POST /api/posts/:id/bookmark
Toggle bookmark

---

### Comments

#### GET /api/posts/:postId/comments
Get comments for a post

**Query Parameters:**
- `sort` (best | newest | oldest)

#### POST /api/posts/:postId/comments
Add comment

**Request Body:**
```json
{
  "content": "This is my answer..."
}
```

#### PUT /api/comments/:id
Update comment

#### DELETE /api/comments/:id
Delete comment

#### POST /api/comments/:id/upvote
Upvote comment

#### POST /api/comments/:id/best
Mark as best answer (post owner only)

---

### Users

#### GET /api/users/:id
Get user profile

#### PUT /api/users/:id
Update user profile

#### POST /api/users/:id/follow
Follow user

#### DELETE /api/users/:id/follow
Unfollow user

#### GET /api/users/:id/posts
Get user's posts

#### GET /api/users/:id/followers
Get user's followers

#### GET /api/users/:id/following
Get user's following

---

### Chat

#### GET /api/chat/conversations
Get user's conversations

#### GET /api/chat/conversations/:userId/messages
Get messages with specific user

#### POST /api/chat/messages
Send message

**Request Body:**
```json
{
  "receiverId": "user_456",
  "content": "Hello!"
}
```

---

### Notifications

#### GET /api/notifications
Get user's notifications

#### PUT /api/notifications/:id/read
Mark notification as read

#### PUT /api/notifications/read-all
Mark all notifications as read

---

### Stories

#### GET /api/stories
Get active stories

#### POST /api/stories
Create story

**Request Body:**
```json
{
  "content": "My story text...",
  "backgroundColor": "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
}
```

#### DELETE /api/stories/:id
Delete story

---

### Polls

#### POST /api/polls
Create poll

**Request Body:**
```json
{
  "question": "What is your favorite framework?",
  "options": ["React", "Vue", "Angular"],
  "duration": 24,
  "isAnonymous": false,
  "allowMultiple": false
}
```

#### POST /api/polls/:id/vote
Vote on poll

**Request Body:**
```json
{
  "optionId": "opt_123"
}
```

---

### Leaderboard

#### GET /api/leaderboard
Get leaderboard

**Query Parameters:**
- `timeframe` (week | month | all)

---

### Achievements

#### GET /api/achievements
Get user's achievements

#### GET /api/achievements/available
Get available achievements

---

### Rewards

#### GET /api/rewards
Get available rewards

#### POST /api/rewards/:id/claim
Claim reward

---

### Analytics

#### GET /api/analytics/user
Get user's analytics

**Query Parameters:**
- `timeframe` (7d | 30d | 90d)

---

### Search

#### GET /api/search
Search posts, users, tags

**Query Parameters:**
- `q` (search query)
- `type` (posts | users | tags | all)

---

## Error Responses

All errors follow this format:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Error description"
  }
}
```

### Common Error Codes
- `UNAUTHORIZED` - Invalid or missing token
- `FORBIDDEN` - Insufficient permissions
- `NOT_FOUND` - Resource not found
- `VALIDATION_ERROR` - Invalid request data
- `RATE_LIMIT` - Too many requests

---

## Rate Limiting
- 100 requests per minute for authenticated users
- 20 requests per minute for unauthenticated users

---

## WebSocket Events

### Chat
- `chat:message` - New message received
- `chat:typing` - User is typing

### Notifications
- `notification:new` - New notification

### Posts
- `post:upvote` - Post was upvoted
- `post:comment` - New comment on post

---

## Database Schema

### Users
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  username VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  avatar VARCHAR(10),
  role VARCHAR(50),
  bio TEXT,
  reputation INTEGER DEFAULT 0,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Posts
```sql
CREATE TABLE posts (
  id UUID PRIMARY KEY,
  author_id UUID REFERENCES users(id),
  title VARCHAR(500) NOT NULL,
  content TEXT NOT NULL,
  tags TEXT[],
  category VARCHAR(50),
  upvotes INTEGER DEFAULT 0,
  downvotes INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  views INTEGER DEFAULT 0,
  is_pinned BOOLEAN DEFAULT FALSE,
  is_anonymous BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Comments
```sql
CREATE TABLE comments (
  id UUID PRIMARY KEY,
  post_id UUID REFERENCES posts(id),
  author_id UUID REFERENCES users(id),
  content TEXT NOT NULL,
  upvotes INTEGER DEFAULT 0,
  downvotes INTEGER DEFAULT 0,
  is_best_answer BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Messages
```sql
CREATE TABLE messages (
  id UUID PRIMARY KEY,
  sender_id UUID REFERENCES users(id),
  receiver_id UUID REFERENCES users(id),
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## Environment Variables

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/nijuze
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d

# AWS S3
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_S3_BUCKET=nijuze-uploads
AWS_REGION=us-east-1

# Email
SENDGRID_API_KEY=your-sendgrid-key
FROM_EMAIL=noreply@nijuze.com

# WebSocket
WEBSOCKET_URL=wss://ws.nijuze.com

# AI
OPENAI_API_KEY=your-openai-key
```

---

## Deployment

### Backend (Node.js + Express)
```bash
# Install dependencies
npm install

# Run migrations
npm run migrate

# Start server
npm start

# Development
npm run dev
```

### Frontend (React)
```bash
# Install dependencies
npm install

# Development
npm run dev

# Build
npm run build

# Deploy to Vercel
vercel --prod
```

---

## Tech Stack

### Backend
- Node.js + Express
- PostgreSQL
- Redis (caching)
- WebSocket (Socket.io)
- JWT (authentication)
- AWS S3 (file storage)
- SendGrid (email)

### Frontend
- React + TypeScript
- Tailwind CSS
- Framer Motion
- Lucide Icons
- LocalStorage (offline support)

### Deployment
- Backend: AWS EC2 / DigitalOcean
- Frontend: Vercel / Netlify
- Database: AWS RDS / Supabase
- CDN: Cloudflare

---

## Security

- HTTPS only
- JWT with refresh tokens
- Rate limiting
- Input validation
- SQL injection prevention
- XSS protection
- CORS configuration
- Password hashing (bcrypt)

---

## Performance

- Redis caching
- Database indexing
- CDN for static assets
- Image optimization
- Lazy loading
- Code splitting
- Gzip compression

---

## Monitoring

- Error tracking (Sentry)
- Performance monitoring (New Relic)
- Analytics (Google Analytics)
- Logging (Winston)

---

## License
MIT

---

## Support
Email: support@nijuze.com
Documentation: https://docs.nijuze.com

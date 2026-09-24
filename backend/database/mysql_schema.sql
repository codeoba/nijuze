-- ============================================
-- NIJUZE DATABASE SCHEMA - MySQL
-- Version: 1.0.0
-- ============================================

-- Create database
CREATE DATABASE IF NOT EXISTS nijuze CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE nijuze;

-- ============================================
-- USERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(36) PRIMARY KEY,
  username VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  avatar VARCHAR(10),
  role ENUM('Admin', 'Moderator', 'Mwanachama') DEFAULT 'Mwanachama',
  bio TEXT,
  reputation INT DEFAULT 0,
  is_verified BOOLEAN DEFAULT FALSE,
  followers_count INT DEFAULT 0,
  following_count INT DEFAULT 0,
  posts_count INT DEFAULT 0,
  answers_count INT DEFAULT 0,
  is_banned BOOLEAN DEFAULT FALSE,
  last_login TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_username (username),
  INDEX idx_role (role),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- POSTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS posts (
  id VARCHAR(36) PRIMARY KEY,
  author_id VARCHAR(36) NOT NULL,
  title VARCHAR(500) NOT NULL,
  content TEXT NOT NULL,
  tags JSON,
  category VARCHAR(50),
  upvotes INT DEFAULT 0,
  downvotes INT DEFAULT 0,
  comments_count INT DEFAULT 0,
  views INT DEFAULT 0,
  shares INT DEFAULT 0,
  bookmarks_count INT DEFAULT 0,
  reactions JSON DEFAULT '{}',
  is_pinned BOOLEAN DEFAULT FALSE,
  is_anonymous BOOLEAN DEFAULT FALSE,
  is_approved BOOLEAN DEFAULT TRUE,
  image_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_author_id (author_id),
  INDEX idx_category (category),
  INDEX idx_created_at (created_at),
  INDEX idx_upvotes (upvotes),
  INDEX idx_is_pinned (is_pinned),
  FULLTEXT INDEX idx_search (title, content)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- COMMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS comments (
  id VARCHAR(36) PRIMARY KEY,
  post_id VARCHAR(36) NOT NULL,
  author_id VARCHAR(36) NOT NULL,
  content TEXT NOT NULL,
  upvotes INT DEFAULT 0,
  downvotes INT DEFAULT 0,
  is_best_answer BOOLEAN DEFAULT FALSE,
  parent_id VARCHAR(36) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
  FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (parent_id) REFERENCES comments(id) ON DELETE CASCADE,
  INDEX idx_post_id (post_id),
  INDEX idx_author_id (author_id),
  INDEX idx_created_at (created_at),
  INDEX idx_upvotes (upvotes)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- POST VOTES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS post_votes (
  id VARCHAR(36) PRIMARY KEY,
  post_id VARCHAR(36) NOT NULL,
  user_id VARCHAR(36) NOT NULL,
  vote_type ENUM('upvote', 'downvote') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_vote (post_id, user_id),
  INDEX idx_post_id (post_id),
  INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- COMMENT VOTES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS comment_votes (
  id VARCHAR(36) PRIMARY KEY,
  comment_id VARCHAR(36) NOT NULL,
  user_id VARCHAR(36) NOT NULL,
  vote_type ENUM('upvote', 'downvote') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (comment_id) REFERENCES comments(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_vote (comment_id, user_id),
  INDEX idx_comment_id (comment_id),
  INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- BOOKMARKS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS bookmarks (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  post_id VARCHAR(36) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
  UNIQUE KEY unique_bookmark (user_id, post_id),
  INDEX idx_user_id (user_id),
  INDEX idx_post_id (post_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- REACTIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS reactions (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  post_id VARCHAR(36) NOT NULL,
  emoji VARCHAR(10) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
  UNIQUE KEY unique_reaction (user_id, post_id, emoji),
  INDEX idx_post_id (post_id),
  INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- FOLLOWERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS followers (
  id VARCHAR(36) PRIMARY KEY,
  follower_id VARCHAR(36) NOT NULL,
  following_id VARCHAR(36) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (follower_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (following_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_follow (follower_id, following_id),
  INDEX idx_follower_id (follower_id),
  INDEX idx_following_id (following_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- MESSAGES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS messages (
  id VARCHAR(36) PRIMARY KEY,
  sender_id VARCHAR(36) NOT NULL,
  receiver_id VARCHAR(36) NOT NULL,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_sender_id (sender_id),
  INDEX idx_receiver_id (receiver_id),
  INDEX idx_created_at (created_at),
  INDEX idx_is_read (is_read)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- NOTIFICATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS notifications (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  type ENUM('upvote', 'comment', 'follow', 'mention', 'badge', 'answer') NOT NULL,
  message TEXT NOT NULL,
  link VARCHAR(255),
  from_user_id VARCHAR(36),
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (from_user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_user_id (user_id),
  INDEX idx_is_read (is_read),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- STORIES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS stories (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  content TEXT NOT NULL,
  background_color VARCHAR(255),
  views INT DEFAULT 0,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_expires_at (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- POLLS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS polls (
  id VARCHAR(36) PRIMARY KEY,
  post_id VARCHAR(36) NOT NULL,
  question VARCHAR(500) NOT NULL,
  is_anonymous BOOLEAN DEFAULT FALSE,
  allow_multiple BOOLEAN DEFAULT FALSE,
  ends_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
  INDEX idx_post_id (post_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- POLL OPTIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS poll_options (
  id VARCHAR(36) PRIMARY KEY,
  poll_id VARCHAR(36) NOT NULL,
  text VARCHAR(255) NOT NULL,
  votes INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (poll_id) REFERENCES polls(id) ON DELETE CASCADE,
  INDEX idx_poll_id (poll_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- POLL VOTES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS poll_votes (
  id VARCHAR(36) PRIMARY KEY,
  poll_id VARCHAR(36) NOT NULL,
  option_id VARCHAR(36) NOT NULL,
  user_id VARCHAR(36) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (poll_id) REFERENCES polls(id) ON DELETE CASCADE,
  FOREIGN KEY (option_id) REFERENCES poll_options(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_poll_vote (poll_id, user_id),
  INDEX idx_poll_id (poll_id),
  INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- REPORTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS reports (
  id VARCHAR(36) PRIMARY KEY,
  reporter_id VARCHAR(36) NOT NULL,
  content_type ENUM('post', 'comment', 'user') NOT NULL,
  content_id VARCHAR(36) NOT NULL,
  reason VARCHAR(100) NOT NULL,
  details TEXT,
  status ENUM('pending', 'reviewed', 'resolved', 'dismissed') DEFAULT 'pending',
  admin_notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (reporter_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_status (status),
  INDEX idx_content_type (content_type),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- BADGES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS badges (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  name VARCHAR(100) NOT NULL,
  icon VARCHAR(10) NOT NULL,
  description TEXT,
  earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- ACTIVITIES TABLE (Activity Feed)
-- ============================================
CREATE TABLE IF NOT EXISTS activities (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  type ENUM('post', 'comment', 'upvote', 'follow', 'badge', 'share') NOT NULL,
  target_id VARCHAR(36),
  target_type VARCHAR(50),
  metadata JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_type (type),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- SESSIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS sessions (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  token VARCHAR(500) NOT NULL,
  ip_address VARCHAR(45),
  user_agent TEXT,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_token (token),
  INDEX idx_expires_at (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- SETTINGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS settings (
  id VARCHAR(36) PRIMARY KEY,
  key_name VARCHAR(100) UNIQUE NOT NULL,
  value TEXT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- INSERT DEFAULT SETTINGS
-- ============================================
INSERT INTO settings (id, key_name, value) VALUES
(UUID(), 'site_name', 'Nijuze'),
(UUID(), 'site_description', 'Jukwaa la maswali na majibu'),
(UUID(), 'max_posts_per_day', '10'),
(UUID(), 'max_comments_per_post', '100'),
(UUID(), 'allow_anonymous_posts', 'true'),
(UUID(), 'require_email_verification', 'true'),
(UUID(), 'maintenance_mode', 'false');

-- ============================================
-- INSERT SAMPLE ADMIN USER
-- Password: admin123 (hashed with bcrypt)
-- ============================================
INSERT INTO users (id, username, email, password_hash, avatar, role, bio, reputation, is_verified) VALUES
(UUID(), 'Admin', 'admin@nijuze.com', '$2a$10$YourHashedPasswordHere', 'AD', 'Admin', 'System Administrator', 10000, TRUE);

-- ============================================
-- INSERT SAMPLE CATEGORIES
-- ============================================
INSERT INTO settings (id, key_name, value) VALUES
(UUID(), 'categories', JSON_ARRAY(
  JSON_OBJECT('id', 'tech', 'name', 'Teknolojia', 'icon', '💻', 'description', 'Programming, AI, Web Dev'),
  JSON_OBJECT('id', 'business', 'name', 'Biashara', 'icon', '📊', 'description', 'Startups, Finance, Marketing'),
  JSON_OBJECT('id', 'science', 'name', 'Sayansi', 'icon', '🔬', 'description', 'Research, Innovation'),
  JSON_OBJECT('id', 'art', 'name', 'Sanaa', 'icon', '🎨', 'description', 'Design, Music, Film'),
  JSON_OBJECT('id', 'sports', 'name', 'Michezo', 'icon', '⚽', 'description', 'Football, Basketball'),
  JSON_OBJECT('id', 'education', 'name', 'Elimu', 'icon', '📚', 'description', 'Learning, Teaching'),
  JSON_OBJECT('id', 'health', 'name', 'Afya', 'icon', '🏥', 'description', 'Wellness, Medicine'),
  JSON_OBJECT('id', 'politics', 'name', 'Siasa', 'icon', '🏛️', 'description', 'Government, Policy')
));

-- ============================================
-- VIEWS FOR COMMON QUERIES
-- ============================================

-- View for posts with author info
CREATE OR REPLACE VIEW posts_with_authors AS
SELECT 
  p.*,
  u.username as author_username,
  u.avatar as author_avatar,
  u.role as author_role,
  u.is_verified as author_verified
FROM posts p
LEFT JOIN users u ON p.author_id = u.id;

-- View for comments with author info
CREATE OR REPLACE VIEW comments_with_authors AS
SELECT 
  c.*,
  u.username as author_username,
  u.avatar as author_avatar,
  u.role as author_role
FROM comments c
LEFT JOIN users u ON c.author_id = u.id;

-- View for user statistics
CREATE OR REPLACE VIEW user_stats AS
SELECT 
  u.id,
  u.username,
  u.email,
  u.avatar,
  u.role,
  u.reputation,
  u.posts_count,
  u.answers_count,
  u.followers_count,
  u.following_count,
  COUNT(DISTINCT p.id) as actual_posts,
  COUNT(DISTINCT c.id) as actual_comments,
  COALESCE(SUM(p.upvotes), 0) as total_upvotes
FROM users u
LEFT JOIN posts p ON u.id = p.author_id
LEFT JOIN comments c ON u.id = c.author_id
GROUP BY u.id;

-- ============================================
-- STORED PROCEDURES
-- ============================================

DELIMITER //

-- Procedure to update post vote counts
CREATE PROCEDURE UpdatePostVotes(IN p_post_id VARCHAR(36))
BEGIN
  UPDATE posts 
  SET 
    upvotes = (SELECT COUNT(*) FROM post_votes WHERE post_id = p_post_id AND vote_type = 'upvote'),
    downvotes = (SELECT COUNT(*) FROM post_votes WHERE post_id = p_post_id AND vote_type = 'downvote')
  WHERE id = p_post_id;
END //

-- Procedure to update user post count
CREATE PROCEDURE UpdateUserPostCount(IN p_user_id VARCHAR(36))
BEGIN
  UPDATE users 
  SET posts_count = (SELECT COUNT(*) FROM posts WHERE author_id = p_user_id)
  WHERE id = p_user_id;
END //

-- Procedure to update user answer count
CREATE PROCEDURE UpdateUserAnswerCount(IN p_user_id VARCHAR(36))
BEGIN
  UPDATE users 
  SET answers_count = (SELECT COUNT(*) FROM comments WHERE author_id = p_user_id)
  WHERE id = p_user_id;
END //

-- Procedure to cleanup expired stories
CREATE PROCEDURE CleanupExpiredStories()
BEGIN
  DELETE FROM stories WHERE expires_at < NOW();
END //

DELIMITER ;

-- ============================================
-- EVENTS (Scheduled Tasks)
-- ============================================

-- Enable event scheduler
SET GLOBAL event_scheduler = ON;

-- Event to cleanup expired stories daily
CREATE EVENT IF NOT EXISTS cleanup_expired_stories
ON SCHEDULE EVERY 1 DAY
STARTS CURRENT_TIMESTAMP
DO
  CALL CleanupExpiredStories();

-- ============================================
-- TRIGGERS
-- ============================================

DELIMITER //

-- Trigger to update post count after insert
CREATE TRIGGER after_post_insert
AFTER INSERT ON posts
FOR EACH ROW
BEGIN
  CALL UpdateUserPostCount(NEW.author_id);
END //

-- Trigger to update post count after delete
CREATE TRIGGER after_post_delete
AFTER DELETE ON posts
FOR EACH ROW
BEGIN
  CALL UpdateUserPostCount(OLD.author_id);
END //

-- Trigger to update answer count after insert
CREATE TRIGGER after_comment_insert
AFTER INSERT ON comments
FOR EACH ROW
BEGIN
  CALL UpdateUserAnswerCount(NEW.author_id);
  UPDATE posts SET comments_count = comments_count + 1 WHERE id = NEW.post_id;
END //

-- Trigger to update answer count after delete
CREATE TRIGGER after_comment_delete
AFTER DELETE ON comments
FOR EACH ROW
BEGIN
  CALL UpdateUserAnswerCount(OLD.author_id);
  UPDATE posts SET comments_count = comments_count - 1 WHERE id = OLD.post_id;
END //

-- Trigger to update followers count after insert
CREATE TRIGGER after_follow_insert
AFTER INSERT ON followers
FOR EACH ROW
BEGIN
  UPDATE users SET followers_count = followers_count + 1 WHERE id = NEW.following_id;
  UPDATE users SET following_count = following_count + 1 WHERE id = NEW.follower_id;
END //

-- Trigger to update followers count after delete
CREATE TRIGGER after_follow_delete
AFTER DELETE ON followers
FOR EACH ROW
BEGIN
  UPDATE users SET followers_count = followers_count - 1 WHERE id = OLD.following_id;
  UPDATE users SET following_count = following_count - 1 WHERE id = OLD.follower_id;
END //

DELIMITER ;

-- ============================================
-- GRANT PERMISSIONS (Adjust as needed)
-- ============================================
-- GRANT ALL PRIVILEGES ON nijuze.* TO 'nijuze_user'@'localhost' IDENTIFIED BY 'your_password';
-- FLUSH PRIVILEGES;

-- ============================================
-- END OF SCHEMA
-- ============================================

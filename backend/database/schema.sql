-- Nijuze Database Schema
-- PostgreSQL

-- Drop existing tables (for development)
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS stories CASCADE;
DROP TABLE IF EXISTS poll_votes CASCADE;
DROP TABLE IF EXISTS poll_options CASCADE;
DROP TABLE IF EXISTS polls CASCADE;
DROP TABLE IF EXISTS post_votes CASCADE;
DROP TABLE IF EXISTS comment_votes CASCADE;
DROP TABLE IF EXISTS bookmarks CASCADE;
DROP TABLE IF EXISTS reactions CASCADE;
DROP TABLE IF EXISTS followers CASCADE;
DROP TABLE IF EXISTS comments CASCADE;
DROP TABLE IF EXISTS posts CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  avatar VARCHAR(10),
  role VARCHAR(50) DEFAULT 'Mwanachama',
  bio TEXT,
  reputation INTEGER DEFAULT 0,
  is_verified BOOLEAN DEFAULT FALSE,
  followers_count INTEGER DEFAULT 0,
  following_count INTEGER DEFAULT 0,
  posts_count INTEGER DEFAULT 0,
  answers_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Posts table
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(500) NOT NULL,
  content TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  category VARCHAR(50),
  upvotes INTEGER DEFAULT 0,
  downvotes INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  views INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  is_pinned BOOLEAN DEFAULT FALSE,
  is_anonymous BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Comments table
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  author_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  upvotes INTEGER DEFAULT 0,
  downvotes INTEGER DEFAULT 0,
  is_best_answer BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Post votes table
CREATE TABLE post_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  vote_type VARCHAR(10) NOT NULL CHECK (vote_type IN ('upvote', 'downvote')),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

-- Comment votes table
CREATE TABLE comment_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  vote_type VARCHAR(10) NOT NULL CHECK (vote_type IN ('upvote', 'downvote')),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(comment_id, user_id)
);

-- Bookmarks table
CREATE TABLE bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, post_id)
);

-- Reactions table
CREATE TABLE reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  emoji VARCHAR(10) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, post_id, emoji)
);

-- Followers table
CREATE TABLE followers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID REFERENCES users(id) ON DELETE CASCADE,
  following_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(follower_id, following_id)
);

-- Messages table
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
  receiver_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Notifications table
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  message TEXT NOT NULL,
  link VARCHAR(255),
  from_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Stories table
CREATE TABLE stories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  background_color VARCHAR(255),
  views INTEGER DEFAULT 0,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Polls table
CREATE TABLE polls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  question VARCHAR(500) NOT NULL,
  is_anonymous BOOLEAN DEFAULT FALSE,
  allow_multiple BOOLEAN DEFAULT FALSE,
  ends_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Poll options table
CREATE TABLE poll_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id UUID REFERENCES polls(id) ON DELETE CASCADE,
  text VARCHAR(255) NOT NULL,
  votes INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Poll votes table
CREATE TABLE poll_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id UUID REFERENCES polls(id) ON DELETE CASCADE,
  option_id UUID REFERENCES poll_options(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(poll_id, user_id)
);

-- Indexes for performance
CREATE INDEX idx_posts_author ON posts(author_id);
CREATE INDEX idx_posts_category ON posts(category);
CREATE INDEX idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX idx_posts_upvotes ON posts(upvotes DESC);
CREATE INDEX idx_posts_tags ON posts USING GIN(tags);
CREATE INDEX idx_posts_title_content ON posts USING GIN(to_tsvector('english', title || ' ' || content));

CREATE INDEX idx_comments_post ON comments(post_id);
CREATE INDEX idx_comments_author ON comments(author_id);
CREATE INDEX idx_comments_created_at ON comments(created_at DESC);

CREATE INDEX idx_post_votes_post ON post_votes(post_id);
CREATE INDEX idx_post_votes_user ON post_votes(user_id);

CREATE INDEX idx_comment_votes_comment ON comment_votes(comment_id);
CREATE INDEX idx_comment_votes_user ON comment_votes(user_id);

CREATE INDEX idx_bookmarks_user ON bookmarks(user_id);
CREATE INDEX idx_bookmarks_post ON bookmarks(post_id);

CREATE INDEX idx_reactions_post ON reactions(post_id);
CREATE INDEX idx_reactions_user ON reactions(user_id);

CREATE INDEX idx_followers_follower ON followers(follower_id);
CREATE INDEX idx_followers_following ON followers(following_id);

CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_receiver ON messages(receiver_id);
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);

CREATE INDEX idx_stories_user ON stories(user_id);
CREATE INDEX idx_stories_expires_at ON stories(expires_at);

CREATE INDEX idx_polls_post ON polls(post_id);
CREATE INDEX idx_poll_options_poll ON poll_options(poll_id);
CREATE INDEX idx_poll_votes_poll ON poll_votes(poll_id);
CREATE INDEX idx_poll_votes_user ON poll_votes(user_id);

-- Trigger to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_posts_updated_at BEFORE UPDATE ON posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger to update user stats
CREATE OR REPLACE FUNCTION update_user_posts_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE users SET posts_count = posts_count + 1 WHERE id = NEW.author_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE users SET posts_count = posts_count - 1 WHERE id = OLD.author_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_posts_count_trigger
AFTER INSERT OR DELETE ON posts
FOR EACH ROW EXECUTE FUNCTION update_user_posts_count();

-- Trigger to update followers count
CREATE OR REPLACE FUNCTION update_followers_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE users SET followers_count = followers_count + 1 WHERE id = NEW.following_id;
    UPDATE users SET following_count = following_count + 1 WHERE id = NEW.follower_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE users SET followers_count = followers_count - 1 WHERE id = OLD.following_id;
    UPDATE users SET following_count = following_count - 1 WHERE id = OLD.follower_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_followers_count_trigger
AFTER INSERT OR DELETE ON followers
FOR EACH ROW EXECUTE FUNCTION update_followers_count();

-- Insert sample data
INSERT INTO users (username, email, password_hash, avatar, role, bio, reputation, is_verified) VALUES
('Amina Hassan', 'amina@example.com', '$2a$10$example1', 'AH', 'Mtaalam wa AI', 'Data Scientist na ML Engineer yenye uzoefu wa miaka 5+', 12400, true),
('Juma Bakari', 'juma@example.com', '$2a$10$example2', 'JB', 'Software Engineer', 'Full-stack developer, React & Node.js expert', 9800, true),
('Fatma Omar', 'fatma@example.com', '$2a$10$example3', 'FO', 'Data Scientist', 'Blockchain enthusiast na researcher', 8200, true),
('David Mwangi', 'david@example.com', '$2a$10$example4', 'DM', 'UX Designer', 'Creating beautiful user experiences for Africa', 6500, false);

-- Insert sample posts
INSERT INTO posts (author_id, title, content, tags, category, upvotes, downvotes, comments_count, views) VALUES
((SELECT id FROM users WHERE email = 'amina@example.com'), 'Je, ni njia bora zipi za kujifunza Machine Learning mwaka 2026?', 'Nimekuwa nikijifunza ML kwa miezi 3 na nataka kujua njia bora za kuendelea. Je, ni resources gani mnazopendekeza?', ARRAY['Machine Learning', 'AI', 'Teknolojia', 'Kujifunza'], 'Teknolojia', 342, 12, 47, 2840),
((SELECT id FROM users WHERE email = 'juma@example.com'), 'Tofauti kati ya React na Vue.js ni zipi? Nipi ni bora kwa project kubwa?', 'Nina project kubwa ya enterprise na nataka kuchagua framework sahihi. React ina ecosystem kubwa lakini Vue ni rahisi.', ARRAY['React', 'Vue.js', 'Web Development', 'Frontend'], 'Programming', 218, 8, 34, 1920),
((SELECT id FROM users WHERE email = 'fatma@example.com'), 'Je, blockchain inaweza kutumikaje katika sekta ya afya Tanzania?', 'Ninafanya research kuhusu blockchain na nataka kujua applications zake katika healthcare.', ARRAY['Blockchain', 'Afya', 'Innovation', 'Tanzania'], 'Innovation', 187, 5, 28, 1540),
((SELECT id FROM users WHERE email = 'david@example.com'), 'Design principles zipi ni muhimu zaidi kwa kuunda mobile apps za Afrika Mashariki?', 'Ninaunda app kwa East Africa market na nataka kuhakikisha design inaendana na mahitaji ya watumiaji wetu.', ARRAY['UX Design', 'Mobile Apps', 'Africa', 'Design'], 'Design', 156, 3, 22, 1230);

-- Insert sample comments
INSERT INTO comments (post_id, author_id, content, upvotes, is_best_answer) VALUES
((SELECT id FROM posts LIMIT 1), (SELECT id FROM users WHERE email = 'juma@example.com'), 'Nakubaliana sana na hili. Pia ningependekeza kutumia resources za free kama freeCodeCamp na Kaggle competitions.', 12, true),
((SELECT id FROM posts LIMIT 1), (SELECT id FROM users WHERE email = 'fatma@example.com'), 'Asante kwa swali hili! Nimejifunza mengi kutoka kwenye majibu. Pia jaribu Fast.ai courses.', 8, false),
((SELECT id FROM posts LIMIT 1), (SELECT id FROM users WHERE email = 'david@example.com'), 'Ningependa kuongeza kwamba practice ni muhimu sana. Jaribu kufanya projects halisi badala ya tutorials tu.', 5, false);

-- Insert sample followers
INSERT INTO followers (follower_id, following_id) VALUES
((SELECT id FROM users WHERE email = 'juma@example.com'), (SELECT id FROM users WHERE email = 'amina@example.com')),
((SELECT id FROM users WHERE email = 'fatma@example.com'), (SELECT id FROM users WHERE email = 'amina@example.com')),
((SELECT id FROM users WHERE email = 'david@example.com'), (SELECT id FROM users WHERE email = 'juma@example.com'));

-- Insert sample bookmarks
INSERT INTO bookmarks (user_id, post_id) VALUES
((SELECT id FROM users WHERE email = 'juma@example.com'), (SELECT id FROM posts LIMIT 1 OFFSET 2)),
((SELECT id FROM users WHERE email = 'fatma@example.com'), (SELECT id FROM posts LIMIT 1));

-- Create function to clean up expired stories
CREATE OR REPLACE FUNCTION cleanup_expired_stories()
RETURNS void AS $$
BEGIN
  DELETE FROM stories WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Schedule cleanup job (requires pg_cron extension)
-- SELECT cron.schedule('cleanup-stories', '0 * * * *', 'SELECT cleanup_expired_stories()');

-- Grant permissions (adjust as needed)
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO nijuze_user;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO nijuze_user;

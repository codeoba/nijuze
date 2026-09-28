// ============================================
// Database Initialization Script
// Run: node scripts/init-db.js
// ============================================

const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function initDatabase() {
  console.log('🚀 Initializing Nijuze Database...\n');

  const host = process.env.DB_HOST || 'localhost';
  const user = process.env.DB_USER || 'root';
  const password = process.env.DB_PASSWORD || '';
  const dbName = process.env.DB_NAME || 'nijuze';

  let connection;
  try {
    // Connect to MySQL Server
    connection = await mysql.createConnection({
      host,
      user,
      password,
      multipleStatements: true
    });
    console.log('✅ Connected to MySQL server');

    // Create database
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    console.log(`✅ Database "${dbName}" ready`);

    await connection.query(`USE \`${dbName}\``);

    // Read schema
    const schemaPath = path.join(__dirname, '..', 'database', 'mysql_schema.sql');
    if (fs.existsSync(schemaPath)) {
      const rawSchema = fs.readFileSync(schemaPath, 'utf8');

      // Separate clean SQL statements (tables, procedures, triggers)
      // Strip DELIMITER statements and split into runnable blocks
      const cleanSchema = rawSchema.replace(/DELIMITER\s+\/\//g, '').replace(/DELIMITER\s+;/g, '');
      
      // Split by semicolon outside of BEGIN...END blocks, or execute statement blocks
      const rawBlocks = cleanSchema.split(/;\s*[\r\n]+/);

      for (let block of rawBlocks) {
        let stmt = block.trim();
        // Remove trailing '//' if any
        if (stmt.endsWith('//')) {
          stmt = stmt.slice(0, -2).trim();
        }
        if (!stmt || stmt.startsWith('--') || stmt.startsWith('/*')) continue;

        try {
          await connection.query(stmt);
        } catch (err) {
          // Ignore table/procedure already exists warnings
          if (!err.message.includes('already exists') && !err.message.includes('Duplicate')) {
            // Log informative message without crashing
            console.log(`ℹ️ Notice for statement: ${err.message}`);
          }
        }
      }
      console.log('✅ Database schema and tables verified');
    }

    // Create Admin User
    const adminPassword = await bcrypt.hash('admin123', 10);
    const adminId = uuidv4();

    await connection.query(
      `INSERT INTO users (id, username, email, password_hash, avatar, role, bio, reputation, is_verified) 
       VALUES (?, 'Admin', 'admin@nijuze.com', ?, 'AD', 'Admin', 'System Administrator', 10000, TRUE)
       ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash)`,
      [adminId, adminPassword]
    );

    // Create Sample Users
    const samplePassword = await bcrypt.hash('password123', 10);
    const sampleUsers = [
      { id: 'user-amina', username: 'Amina Hassan', email: 'amina@nijuze.com', avatar: 'AH', role: 'Mwanachama', bio: 'Data Scientist & AI Enthusiast', rep: 1250 },
      { id: 'user-juma', username: 'Juma Bakari', email: 'juma@nijuze.com', avatar: 'JB', role: 'Mwanachama', bio: 'Full-stack Developer, React & Node.js', rep: 890 },
      { id: 'user-neema', username: 'Neema Mwangi', email: 'neema@nijuze.com', avatar: 'NM', role: 'Moderator', bio: 'Cybersecurity Specialist', rep: 2400 },
    ];

    for (const u of sampleUsers) {
      await connection.query(
        `INSERT INTO users (id, username, email, password_hash, avatar, role, bio, reputation, is_verified)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, TRUE)
         ON DUPLICATE KEY UPDATE username = VALUES(username)`,
        [u.id, u.username, u.email, samplePassword, u.avatar, u.role, u.bio, u.rep]
      );
    }
    console.log('✅ Sample users created');

    // Create Sample Posts
    const samplePosts = [
      {
        id: 'post-1',
        authorId: 'user-amina',
        title: 'Jinsi ya kuanza kujifunza Akili Mnemba (Artificial Intelligence) kwa lugha ya Kiswahili mwaka 2026?',
        content: 'Habari wataalam, ningependa kujua njia bora na vitabu au kozi za kuanza kujifunza Machine Learning na Deep Learning kuanzia misingi ya Python na Hisabati.',
        tags: JSON.stringify(['AI', 'Python', 'MachineLearning', 'Elimu']),
        category: 'Teknolojia',
        upvotes: 42,
        downvotes: 1,
        commentsCount: 3,
        views: 310
      },
      {
        id: 'post-2',
        authorId: 'user-juma',
        title: 'Tofauti kati ya React Server Components na Client Components ni ipi?',
        content: 'Nimekuwa nikitumia React kwa muda, lakini bado naona kuna mkanganyiko kuhusu ni lini unapaswa kutumia Server Components na lini unapaswa kuweka "use client". Yeyote mwenye ufafanuzi mzuri?',
        tags: JSON.stringify(['React', 'WebDevelopment', 'JavaScript', 'Frontend']),
        category: 'Teknolojia',
        upvotes: 35,
        downvotes: 0,
        commentsCount: 2,
        views: 245
      },
      {
        id: 'post-3',
        authorId: 'user-neema',
        title: 'Mbinu bora za kulinda taarifa binafsi (Privacy) mtandaoni',
        content: 'Katika ulimwengu wa sasa wa kidijitali, ulinzi wa data ni jambo la msingi. Tumia Two-Factor Authentication (2FA), nenosiri imara na meneja wa nenosiri (password manager).',
        tags: JSON.stringify(['Cybersecurity', 'Usalama', 'Privacy']),
        category: 'Usalama',
        upvotes: 68,
        downvotes: 2,
        commentsCount: 5,
        views: 520
      }
    ];

    for (const p of samplePosts) {
      await connection.query(
        `INSERT INTO posts (id, author_id, title, content, tags, category, upvotes, downvotes, comments_count, views, is_approved)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, TRUE)
         ON DUPLICATE KEY UPDATE title = VALUES(title)`,
        [p.id, p.authorId, p.title, p.content, p.tags, p.category, p.upvotes, p.downvotes, p.commentsCount, p.views]
      );
    }
    console.log('✅ Sample posts created');

    console.log('\n🎉 Database Initialization Complete!');
    console.log('----------------------------------------------------');
    console.log('👤 Admin Email:    admin@nijuze.com');
    console.log('🔑 Admin Password: admin123');
    console.log('👤 Sample User:    amina@nijuze.com (pass: password123)');
    console.log('----------------------------------------------------\n');

  } catch (err) {
    console.error('❌ Database initialization error:', err.message);
  } finally {
    if (connection) await connection.end();
  }
}

initDatabase();

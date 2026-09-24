// ============================================
// Database Initialization Script
// Run: node scripts/init-db.js
// ============================================

const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

async function initDatabase() {
  console.log('🚀 Initializing Nijuze Database...\n');

  // Connect to MySQL
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD,
    multipleStatements: true
  });

  try {
    console.log('✅ Connected to MySQL server');

    // Create database
    await connection.query('CREATE DATABASE IF NOT EXISTS nijuze CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');
    console.log('✅ Database "nijuze" created');

    // Switch to database
    await connection.query('USE nijuze');

    // Read and execute schema
    const fs = require('fs');
    const schema = fs.readFileSync('./database/mysql_schema.sql', 'utf8');
    
    // Split by statements and execute
    const statements = schema.split(';').filter(s => s.trim().length > 0);
    
    for (const statement of statements) {
      if (statement.trim().startsWith('--') || statement.trim().startsWith('/*')) {
        continue;
      }
      try {
        await connection.query(statement);
      } catch (error) {
        // Ignore duplicate errors
        if (!error.message.includes('already exists')) {
          console.error('Error executing statement:', error.message);
        }
      }
    }

    console.log('✅ Database schema created');

    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 10);
    const adminId = uuidv4();
    
    await connection.query(
      `INSERT INTO users (id, username, email, password_hash, avatar, role, bio, reputation, is_verified) 
       VALUES (?, 'Admin', 'admin@nijuze.com', ?, 'AD', 'Admin', 'System Administrator', 10000, TRUE)
       ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash)`,
      [adminId, adminPassword]
    );

    console.log('✅ Admin user created');
    console.log('   Email: admin@nijuze.com');
    console.log('   Password: admin123');
    console.log('   ⚠️  CHANGE THIS PASSWORD AFTER FIRST LOGIN!\n');

    // Create sample users
    const sampleUsers = [
      { username: 'Amina Hassan', email: 'amina@example.com', role: 'Mtaalam wa AI' },
      { username: 'Juma Bakari', email: 'juma@example.com', role: 'Software Engineer' },
      { username: 'Fatma Omar', email: 'fatma@example.com', role: 'Data Scientist' },
      { username: 'David Mwangi', email: 'david@example.com', role: 'UX Designer' },
    ];

    for (const user of sampleUsers) {
      const userId = uuidv4();
      const password = await bcrypt.hash('password123', 10);
      const avatar = user.username.split(' ').map(n => n[0]).join('');

      await connection.query(
        `INSERT INTO users (id, username, email, password_hash, avatar, role, bio, reputation) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE username = VALUES(username)`,
        [userId, user.username, user.email, password, avatar, user.role, `${user.role} with 5+ years experience`, Math.floor(Math.random() * 5000) + 1000]
      );
    }

    console.log('✅ Sample users created');
    console.log('   Password for all: password123\n');

    // Create sample posts
    const [users] = await connection.query('SELECT id, username FROM users WHERE role != "Admin" LIMIT 4');
    
    const samplePosts = [
      {
        title: 'Je, ni njia bora zipi za kujifunza Machine Learning mwaka 2026?',
        content: 'Nimekuwa nikijifunza ML kwa miezi 3 na nataka kujua njia bora za kuendelea. Je, ni resources gani mnazopendekeza? Nimeanza na Python basics na sasa niko kwenye pandas na numpy.',
        tags: ['Machine Learning', 'AI', 'Teknolojia', 'Kujifunza'],
        category: 'Teknolojia',
        upvotes: 342,
        views: 2840
      },
      {
        title: 'Tofauti kati ya React na Vue.js ni zipi? Nipi ni bora kwa project kubwa?',
        content: 'Nina project kubwa ya enterprise na nataka kuchagua framework sahihi. React ina ecosystem kubwa zaidi na flexiblity, wakati Vue ni rahisi kujifunza na ina documentation bora.',
        tags: ['React', 'Vue.js', 'Web Development', 'Frontend'],
        category: 'Teknolojia',
        upvotes: 218,
        views: 1920
      },
      {
        title: 'Je, blockchain inaweza kutumikaje katika sekta ya afya Tanzania?',
        content: 'Ninafanya research kuhusu blockchain na nataka kujua applications zake katika healthcare. Je, kuna mfano wowote wa matumizi ya blockchain katika sekta ya afya Afrika?',
        tags: ['Blockchain', 'Afya', 'Innovation', 'Tanzania'],
        category: 'Sayansi',
        upvotes: 187,
        views: 1540
      },
      {
        title: 'Design principles zipi ni muhimu zaidi kwa kuunda mobile apps za Afrika Mashariki?',
        content: 'Ninaunda app kwa East Africa market na nataka kuhakikisha design inaendana na mahitaji ya watumiaji wetu. Je, kuna considerations maalum za UX/UI kwa region yetu?',
        tags: ['UX Design', 'Mobile Apps', 'Africa', 'Design'],
        category: 'Sanaa',
        upvotes: 156,
        views: 1230
      }
    ];

    for (let i = 0; i < samplePosts.length; i++) {
      const post = samplePosts[i];
      const postId = uuidv4();
      const author = users[i % users.length];

      await connection.query(
        `INSERT INTO posts (id, author_id, title, content, tags, category, upvotes, views) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [postId, author.id, post.title, post.content, JSON.stringify(post.tags), post.category, post.upvotes, post.views]
      );

      // Add sample comments
      const commentCount = Math.floor(Math.random() * 5) + 2;
      for (let j = 0; j < commentCount; j++) {
        const commentId = uuidv4();
        const commenter = users[(i + j + 1) % users.length];
        
        await connection.query(
          `INSERT INTO comments (id, post_id, author_id, content, upvotes) 
           VALUES (?, ?, ?, ?, ?)`,
          [commentId, postId, commenter.id, `Hili ni swali zuri sana! Ningependekeza ${['kujifunza kutoka Kaggle', 'kutumia freeCodeCamp', 'kujiunga na communities', 'kufanya projects halisi'][j % 4]}.`, Math.floor(Math.random() * 20) + 1]
        );
      }
    }

    console.log('✅ Sample posts and comments created\n');

    console.log('═══════════════════════════════════════════════════════════');
    console.log('✅ DATABASE INITIALIZATION COMPLETE!');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('\n📊 Statistics:');
    console.log(`   Users: ${users.length + 1} (including admin)`);
    console.log(`   Posts: ${samplePosts.length}`);
    console.log(`   Comments: ${samplePosts.length * 3} (approx)`);
    console.log('\n🔐 Login Credentials:');
    console.log('   Admin: admin@nijuze.com / admin123');
    console.log('   Users: amina@example.com / password123');
    console.log('          juma@example.com / password123');
    console.log('          fatma@example.com / password123');
    console.log('          david@example.com / password123');
    console.log('\n⚠️  IMPORTANT: Change default passwords after first login!');
    console.log('═══════════════════════════════════════════════════════════\n');

  } catch (error) {
    console.error('❌ Error initializing database:', error.message);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

initDatabase();

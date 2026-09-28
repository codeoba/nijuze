// ============================================
// Database Seeding Script
// Run: node scripts/seed-db.js
// ============================================

const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

async function seedDatabase() {
  console.log('🌱 Seeding Nijuze Database with fresh demo data...');
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'nijuze_user',
      password: process.env.DB_PASSWORD || 'your_password',
      database: process.env.DB_NAME || 'nijuze'
    });

    console.log('✅ Connected to database for seeding');

    // Add sample badges
    const badges = [
      { id: 'b-1', userId: 'user-amina', name: 'Mtaalam wa AI', icon: '🤖', description: 'Ameweka majibu zaidi ya 50 kwenye AI' },
      { id: 'b-2', userId: 'user-juma', name: 'React Guru', icon: '⚛️', description: 'Mtaalam mwenye mchango mkubwa wa React' },
      { id: 'b-3', userId: 'user-neema', name: 'Mlinzi wa Jamii', icon: '🛡️', description: 'Moderator anayeaminika' }
    ];

    for (const b of badges) {
      await connection.query(
        'INSERT IGNORE INTO badges (id, user_id, name, icon, description) VALUES (?, ?, ?, ?, ?)',
        [b.id, b.userId, b.name, b.icon, b.description]
      );
    }

    console.log('✅ Badges seeded successfully!');
    await connection.end();
  } catch (error) {
    console.error('❌ Seeding error:', error.message);
  }
}

seedDatabase();

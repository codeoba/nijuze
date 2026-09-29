const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const DB_FILE = path.join(__dirname, 'local_db.json');

function getDefaultData() {
  const passwordHash = bcrypt.hashSync('password123', 10);
  const adminHash = bcrypt.hashSync('admin123', 10);

  const users = [
    {
      id: 'user-admin',
      username: 'Msimamizi Mkuu',
      email: 'admin@nijuze.com',
      password_hash: adminHash,
      avatar: 'MM',
      role: 'Admin',
      bio: 'Msimamizi Mkuu wa Nijuze Platform',
      reputation: 25000,
      is_verified: 1,
      followers_count: 3500,
      following_count: 120,
      posts_count: 50,
      answers_count: 320,
      is_banned: 0,
      created_at: new Date('2024-01-01').toISOString(),
    },
    {
      id: 'user-amina',
      username: 'Amina Hassan',
      email: 'amina@example.com',
      password_hash: passwordHash,
      avatar: 'AH',
      role: 'Mtaalam wa AI',
      bio: 'Data Scientist na ML Engineer',
      reputation: 12400,
      is_verified: 1,
      followers_count: 1240,
      following_count: 89,
      posts_count: 24,
      answers_count: 145,
      is_banned: 0,
      created_at: new Date('2024-01-15').toISOString(),
    },
    {
      id: 'user-juma',
      username: 'Juma Bakari',
      email: 'juma@example.com',
      password_hash: passwordHash,
      avatar: 'JB',
      role: 'Software Engineer',
      bio: 'Full-stack developer, React & Node.js expert',
      reputation: 9800,
      is_verified: 1,
      followers_count: 980,
      following_count: 156,
      posts_count: 18,
      answers_count: 89,
      is_banned: 0,
      created_at: new Date('2024-02-01').toISOString(),
    },
    {
      id: 'user-fatma',
      username: 'Fatma Omar',
      email: 'fatma@example.com',
      password_hash: passwordHash,
      avatar: 'FO',
      role: 'Data Scientist',
      bio: 'Blockchain enthusiast na researcher',
      reputation: 8200,
      is_verified: 1,
      followers_count: 820,
      following_count: 67,
      posts_count: 15,
      answers_count: 64,
      is_banned: 0,
      created_at: new Date('2024-03-10').toISOString(),
    },
  ];

  const posts = [
    {
      id: 'post-1',
      author_id: 'user-amina',
      title: 'Je, ni njia bora zipi za kujifunza Machine Learning mwaka 2026?',
      content: 'Nimekuwa nikijifunza ML kwa miezi 3 na nataka kujua njia bora za kuendelea. Je, ni resources gani mnazopendekeza? Nimeanza na Python basics na sasa niko kwenye pandas na numpy.',
      tags: JSON.stringify(['Machine Learning', 'AI', 'Teknolojia', 'Kujifunza']),
      category: 'Teknolojia',
      upvotes: 342,
      downvotes: 12,
      comments_count: 47,
      views: 2840,
      shares: 89,
      bookmarks_count: 156,
      reactions: JSON.stringify({ '🔥': ['user-juma', 'user-fatma'], '💡': ['user-admin'] }),
      is_pinned: 1,
      is_anonymous: 0,
      is_approved: 1,
      created_at: new Date(Date.now() - 2 * 3600000).toISOString(),
    },
    {
      id: 'post-2',
      author_id: 'user-juma',
      title: 'Tofauti kati ya React na Vue.js ni zipi? Nipi ni bora kwa project kubwa?',
      content: 'Nina project kubwa ya enterprise na nataka kuchagua framework sahihi. React ina ecosystem kubwa lakini Vue ni rahisi. Je, mtaalamu yeyote anaweza kunitoa ushauri?',
      tags: JSON.stringify(['React', 'Vue.js', 'Web Development', 'Frontend']),
      category: 'Teknolojia',
      upvotes: 218,
      downvotes: 8,
      comments_count: 34,
      views: 1920,
      shares: 56,
      bookmarks_count: 98,
      reactions: JSON.stringify({ '🔥': ['user-amina'], '💡': ['user-fatma'] }),
      is_pinned: 0,
      is_anonymous: 0,
      is_approved: 1,
      created_at: new Date(Date.now() - 5 * 3600000).toISOString(),
    },
    {
      id: 'post-3',
      author_id: 'user-fatma',
      title: 'Je, blockchain inaweza kutumikaje katika sekta ya afya Tanzania?',
      content: 'Ninafanya research kuhusu blockchain na nataka kujua applications zake katika healthcare. Je, kuna mfano wowote wa matumizi ya blockchain katika sekta ya afya Afrika?',
      tags: JSON.stringify(['Blockchain', 'Afya', 'Innovation', 'Tanzania']),
      category: 'Afya',
      upvotes: 187,
      downvotes: 5,
      comments_count: 28,
      views: 1540,
      shares: 43,
      bookmarks_count: 72,
      reactions: JSON.stringify({ '💡': ['user-amina', 'user-juma'] }),
      is_pinned: 0,
      is_anonymous: 0,
      is_approved: 1,
      created_at: new Date(Date.now() - 8 * 3600000).toISOString(),
    },
  ];

  const comments = [
    {
      id: 'comment-1',
      post_id: 'post-1',
      author_id: 'user-juma',
      content: 'Ninapendekeza kozi ya Andrew Ng ya Deep Learning kwenye Coursera, kisha fanya miradi ya Kaggle mara kwa mara!',
      upvotes: 45,
      downvotes: 2,
      is_best_answer: 1,
      created_at: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: 'comment-2',
      post_id: 'post-1',
      author_id: 'user-fatma',
      content: 'Pia jifunze Scikit-learn vizuri kabla ya kuingia kwenye PyTorch au TensorFlow.',
      upvotes: 28,
      downvotes: 1,
      is_best_answer: 0,
      created_at: new Date(Date.now() - 1800000).toISOString(),
    }
  ];

  const guilds = [
    {
      id: 'guild-1',
      name: 'Tech Wizards Africa',
      description: 'Kikundi cha wataalam wa teknolojia, AI na Web Development',
      icon: '💻',
      leader_id: 'user-amina',
      member_ids: JSON.stringify(['user-amina', 'user-juma', 'user-fatma']),
      max_members: 50,
      is_private: 0,
      created_at: new Date().toISOString(),
    },
    {
      id: 'guild-2',
      name: 'Business Leaders',
      description: 'Wafanyabiashara na entrepreneurs wa Afrika Mashariki',
      icon: '💼',
      leader_id: 'user-juma',
      member_ids: JSON.stringify(['user-juma']),
      max_members: 30,
      is_private: 0,
      created_at: new Date().toISOString(),
    }
  ];

  const tournaments = [
    {
      id: 'tourn-1',
      title: 'Weekly Coding Challenge',
      description: 'Shindano la wiki la programming na utatuzi wa matatizo ya code',
      icon: '💻',
      start_date: '2026-09-29',
      end_date: '2026-10-06',
      status: 'upcoming',
      reward: '500 Pts + Nishani ya Dhahabu',
      participant_ids: JSON.stringify(['user-amina', 'user-juma']),
      max_participants: 100,
      created_at: new Date().toISOString(),
    },
    {
      id: 'tourn-2',
      title: 'Best Post Competition',
      description: 'Shindano la post na swali bora la mwezi huu',
      icon: '📝',
      start_date: '2026-09-22',
      end_date: '2026-09-29',
      status: 'ongoing',
      reward: '1000 Pts + Hadhi ya Mshindi',
      participant_ids: JSON.stringify(['user-amina', 'user-fatma', 'user-juma']),
      max_participants: 50,
      created_at: new Date().toISOString(),
    }
  ];

  const badges = [
    { id: 'b-1', user_id: 'user-amina', name: 'Mtaalam wa AI', icon: '🤖', description: 'Ameweka majibu zaidi ya 50 kwenye AI' },
    { id: 'b-2', user_id: 'user-juma', name: 'React Guru', icon: '⚛️', description: 'Mtaalam mwenye mchango mkubwa wa React' },
    { id: 'b-3', user_id: 'user-fatma', name: 'Blockchain Pioneer', icon: '⛓️', description: 'Utafiti bora wa Web3' }
  ];

  const notifications = [];
  const post_votes = [];
  const bookmarks = [];

  return { users, posts, comments, guilds, tournaments, badges, notifications, post_votes, bookmarks };
}

class LocalDatabase {
  constructor() {
    this.isLocalStorage = true;
    this.data = this.load();
  }

  load() {
    try {
      if (fs.existsSync(DB_FILE)) {
        return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
      }
    } catch (e) {}
    const defaultData = getDefaultData();
    this.save(defaultData);
    return defaultData;
  }

  save(dataToSave) {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(dataToSave || this.data, null, 2), 'utf8');
    } catch (e) {}
  }

  async query(sql, params = []) {
    const s = sql.trim().toLowerCase();

    // 1. SELECT users WHERE email = ?
    if (s.includes('from users') && s.includes('where email = ?')) {
      const email = (params[0] || '').toLowerCase();
      const rows = this.data.users.filter(u => u.email.toLowerCase() === email);
      return [rows, []];
    }

    // 2. SELECT users WHERE id = ?
    if (s.includes('from users') && s.includes('where id = ?')) {
      const id = params[0];
      const rows = this.data.users.filter(u => u.id === id);
      return [rows, []];
    }

    // 3. SELECT * FROM users
    if (s.includes('select') && s.includes('from users') && !s.includes('where')) {
      return [this.data.users, []];
    }

    // 4. INSERT INTO users
    if (s.startsWith('insert into users')) {
      const user = {
        id: params[0],
        username: params[1],
        email: params[2],
        password_hash: params[3],
        avatar: params[4] || 'NJ',
        role: params[5] || 'Mwanachama',
        bio: params[6] || '',
        reputation: 0,
        is_verified: 0,
        followers_count: 0,
        following_count: 0,
        posts_count: 0,
        answers_count: 0,
        is_banned: 0,
        created_at: new Date().toISOString()
      };
      this.data.users.push(user);
      this.save();
      return [{ insertId: user.id, affectedRows: 1 }, []];
    }

    // 4b. UPDATE users
    if (s.startsWith('update users')) {
      const id = params[params.length - 1];
      const user = this.data.users.find(u => u.id === id);
      if (user) {
        const whereIdx = sql.toLowerCase().indexOf('where');
        const setIdx = sql.toLowerCase().indexOf('set');
        if (setIdx !== -1 && whereIdx !== -1) {
          const setPart = sql.substring(setIdx + 3, whereIdx).trim();
          const fields = setPart.split(',').map(f => f.trim().split('=')[0].trim());
          fields.forEach((field, idx) => {
            if (params[idx] !== undefined) {
              user[field] = params[idx];
            }
          });
          this.save();
          return [{ affectedRows: 1 }, []];
        }
      }
      return [{ affectedRows: 0 }, []];
    }

    // 5. SELECT posts
    if (s.includes('from posts')) {
      if (s.includes('count(*) as total')) {
        let count = this.data.posts.length;
        if (params.length > 0 && typeof params[0] === 'string' && !params[0].startsWith('%')) {
          count = this.data.posts.filter(p => p.category === params[0]).length;
        }
        return [[{ total: count }], []];
      }

      // Check single post
      if (s.includes('where p.id = ?') || s.includes('where id = ?')) {
        const id = params[0];
        const post = this.data.posts.find(p => p.id === id);
        if (!post) return [[], []];
        const author = this.data.users.find(u => u.id === post.author_id) || {};
        return [[{
          ...post,
          author_username: author.username || 'Mwanachama',
          author_avatar: author.avatar || 'NJ',
          author_role: author.role || 'Mwanachama',
          author_verified: author.is_verified || 0,
        }], []];
      }

      // List of posts with author join
      let list = this.data.posts.map(p => {
        const author = this.data.users.find(u => u.id === p.author_id) || {};
        return {
          ...p,
          author_username: author.username || 'Mwanachama',
          author_avatar: author.avatar || 'NJ',
          author_role: author.role || 'Mwanachama',
          author_verified: author.is_verified || 0,
        };
      });

      if (params.length > 0 && typeof params[0] === 'string' && !params[0].startsWith('%') && params[0] !== 'All' && params[0] !== 'Zote') {
        list = list.filter(p => p.category === params[0]);
      }

      return [list, []];
    }

    // 6. INSERT INTO posts
    if (s.startsWith('insert into posts')) {
      const newPost = {
        id: params[0],
        author_id: params[1],
        title: params[2],
        content: params[3],
        tags: typeof params[4] === 'string' ? params[4] : JSON.stringify(params[4] || []),
        category: params[5] || 'Teknolojia',
        is_anonymous: params[6] ? 1 : 0,
        image_url: params[7] || null,
        upvotes: 0,
        downvotes: 0,
        comments_count: 0,
        views: 0,
        shares: 0,
        bookmarks_count: 0,
        reactions: '{}',
        is_pinned: 0,
        is_approved: 1,
        created_at: new Date().toISOString()
      };
      this.data.posts.unshift(newPost);
      // update author posts_count
      const user = this.data.users.find(u => u.id === newPost.author_id);
      if (user) user.posts_count = (user.posts_count || 0) + 1;
      this.save();
      return [{ insertId: newPost.id, affectedRows: 1 }, []];
    }

    // 7. COMMENTS queries
    if (s.includes('from comments')) {
      if (s.includes('where post_id = ?') || s.includes('where c.post_id = ?')) {
        const postId = params[0];
        const comments = this.data.comments.filter(c => c.post_id === postId).map(c => {
          const author = this.data.users.find(u => u.id === c.author_id) || {};
          return {
            ...c,
            author_username: author.username || 'Mwanachama',
            author_avatar: author.avatar || 'NJ',
            author_role: author.role || 'Mwanachama',
            author_verified: author.is_verified || 0,
          };
        });
        return [comments, []];
      }
      return [this.data.comments, []];
    }

    // 8. INSERT INTO comments
    if (s.startsWith('insert into comments')) {
      const newComment = {
        id: params[0],
        post_id: params[1],
        author_id: params[2],
        content: params[3],
        upvotes: 0,
        downvotes: 0,
        is_best_answer: 0,
        created_at: new Date().toISOString()
      };
      this.data.comments.unshift(newComment);
      const post = this.data.posts.find(p => p.id === newComment.post_id);
      if (post) post.comments_count = (post.comments_count || 0) + 1;
      this.save();
      return [{ insertId: newComment.id, affectedRows: 1 }, []];
    }

    // 9. BADGES queries
    if (s.includes('from badges')) {
      if (s.includes('where user_id = ?')) {
        const userId = params[0];
        return [this.data.badges.filter(b => b.user_id === userId), []];
      }
      return [this.data.badges, []];
    }

    // 10. GUILDS queries
    if (s.includes('from guilds')) {
      return [this.data.guilds, []];
    }

    // 11. TOURNAMENTS queries
    if (s.includes('from tournaments')) {
      return [this.data.tournaments, []];
    }

    // 12. VOTES & BOOKMARKS
    if (s.includes('from post_votes')) {
      return [this.data.post_votes, []];
    }
    if (s.includes('from bookmarks')) {
      return [this.data.bookmarks, []];
    }

    // Default fallback
    return [[], []];
  }

  async getConnection() {
    return {
      query: (sql, params) => this.query(sql, params),
      execute: (sql, params) => this.query(sql, params),
      beginTransaction: async () => {},
      commit: async () => {},
      rollback: async () => {},
      release: () => {},
      ping: async () => true,
    };
  }
}

let instance = null;
function getStorageEngine() {
  if (!instance) {
    instance = new LocalDatabase();
  }
  return instance;
}

module.exports = { getStorageEngine };

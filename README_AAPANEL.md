# 🚀 NIJUZE - Installation Guide for aaPanel + MySQL

## 📋 Quick Start

Nijuze sasa iko **tayari kwa aaPanel** na **MySQL database**!

---

## 🎯 What's Included

### ✅ Backend (MySQL)
- Node.js + Express API
- MySQL database schema
- JWT authentication
- File upload support
- Admin API endpoints
- Complete CRUD operations

### ✅ Frontend (React)
- Modern React + TypeScript
- API service layer
- Responsive design
- PWA support
- Multi-language (SW/EN/FR)

### ✅ Deployment Files
- aaPanel installation guide
- Nginx configuration
- PM2 process manager
- SSL setup guide
- Backup scripts

---

## 📦 Files Structure

```
nijuze/
├── backend/
│   ├── server.js                    # Main backend server (MySQL)
│   ├── package.json                 # Backend dependencies
│   ├── .env.example                 # Environment template
│   ├── database/
│   │   └── mysql_schema.sql         # MySQL database schema
│   └── scripts/
│       └── init-db.js               # Database initialization
│
├── src/                             # Frontend source
│   ├── services/
│   │   ├── api.ts                   # API service (connects to backend)
│   │   └── database.ts              # LocalStorage fallback
│   └── pages/
│       ├── AdminPanel.tsx           # Admin dashboard
│       ├── ForumPage.tsx            # Forum system
│       └── ActivityFeedPage.tsx     # Activity feed
│
├── AAPANEL_INSTALLATION.md          # Complete aaPanel guide
├── quick-start.sh                   # Quick installation script
├── .env                             # Frontend environment
└── README_AAPANEL.md                # This file
```

---

## 🚀 Installation Methods

### Method 1: Quick Start (Recommended)

```bash
# 1. Upload files to aaPanel
# Use aaPanel File Manager to upload to /www/wwwroot/nijuze/

# 2. Make script executable
chmod +x quick-start.sh

# 3. Run quick start
sudo bash quick-start.sh
```

The script will:
- ✅ Create .env file with random secrets
- ✅ Create MySQL database and user
- ✅ Install backend dependencies
- ✅ Initialize database with sample data
- ✅ Build frontend
- ✅ Start backend with PM2

### Method 2: Manual Installation

Follow the complete guide: **[AAPANEL_INSTALLATION.md](./AAPANEL_INSTALLATION.md)**

---

## 🔧 Configuration

### Backend (.env)

```env
# Server
NODE_ENV=production
PORT=5000
API_URL=https://api.yourdomain.com
FRONTEND_URL=https://yourdomain.com

# MySQL Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=nijuze_user
DB_PASSWORD=your_password
DB_NAME=nijuze

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
```

### Frontend (.env.production)

```env
VITE_API_URL=https://api.yourdomain.com
VITE_WS_URL=wss://api.yourdomain.com
```

---

## 🗄️ Database Setup

### 1. Create Database in aaPanel

1. Go to **Database** → **MySQL** → **Add database**
2. Fill in:
   - Database name: `nijuze`
   - Username: `nijuze_user`
   - Password: (generate strong password)
   - Access: Localhost

### 2. Import Schema

```bash
# Via aaPanel phpMyAdmin
# Or via command line:
mysql -u nijuze_user -p nijuze < backend/database/mysql_schema.sql
```

### 3. Initialize Data

```bash
cd backend
npm install
node scripts/init-db.js
```

This creates:
- ✅ Admin user (admin@nijuze.com / admin123)
- ✅ Sample users
- ✅ Sample posts and comments

---

## 🌐 Nginx Configuration

### Frontend Site

```nginx
server {
    listen 80;
    server_name yourdomain.com;
    root /www/wwwroot/nijuze/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### API Site

```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
    }
}
```

---

## 🔐 SSL Setup

### Via aaPanel

1. Go to **Website** → Select site → **SSL**
2. Choose **Let's Encrypt**
3. Add domains:
   - yourdomain.com
   - www.yourdomain.com
   - api.yourdomain.com
4. Click **Apply**
5. Enable **Force HTTPS**

---

## 🚀 Starting Services

### Backend (PM2)

```bash
cd /www/wwwroot/nijuze/backend

# Start
pm2 start server.js --name nijuze-backend

# Save
pm2 save

# Auto-start on boot
pm2 startup
```

### Check Status

```bash
pm2 status
pm2 logs nijuze-backend
```

---

## 📊 Default Credentials

### Admin
- **Email:** admin@nijuze.com
- **Password:** admin123
- ⚠️ **CHANGE AFTER FIRST LOGIN!**

### Sample Users
- amina@example.com / password123
- juma@example.com / password123
- fatma@example.com / password123
- david@example.com / password123

---

## 🧪 Testing

### 1. Test Backend

```bash
curl https://api.yourdomain.com/health
```

Expected:
```json
{
  "status": "healthy",
  "timestamp": "2024-...",
  "database": "connected"
}
```

### 2. Test Frontend

Visit: `https://yourdomain.com`

### 3. Test Login

1. Go to `/login`
2. Login with admin credentials
3. Verify dashboard loads

### 4. Test Admin Panel

1. Go to `/admin`
2. Verify you can see dashboard
3. Check user management
4. Test post management

---

## 🔄 Updating

### Update Backend

```bash
cd /www/wwwroot/nijuze/backend
git pull origin main
npm install
pm2 restart nijuze-backend
```

### Update Frontend

```bash
cd /www/wwwroot/nijuze
git pull origin main
npm install
npm run build
```

---

## 💾 Backup

### Database Backup

```bash
# Manual backup
mysqldump -u nijuze_user -p nijuze > backup_$(date +%Y%m%d).sql

# Automated (add to crontab)
0 2 * * * mysqldump -u nijuze_user -p'password' nijuze | gzip > /www/backup/nijuze_$(date +\%Y\%m\%d).sql.gz
```

### Files Backup

```bash
tar -czf uploads_$(date +%Y%m%d).tar.gz backend/uploads/
```

---

## 🐛 Troubleshooting

### Backend not starting

```bash
# Check logs
pm2 logs nijuze-backend

# Check if port is in use
sudo lsof -i :5000

# Restart
pm2 restart nijuze-backend
```

### Database connection failed

```bash
# Test connection
mysql -u nijuze_user -p nijuze

# Check .env
cat backend/.env

# Verify MySQL is running
sudo systemctl status mysql
```

### 502 Bad Gateway

```bash
# Check backend is running
pm2 status

# Check Nginx logs
tail -f /www/wwwlogs/yourdomain.com.error.log

# Restart services
pm2 restart nijuze-backend
sudo systemctl restart nginx
```

---

## 📚 Documentation

- **[AAPANEL_INSTALLATION.md](./AAPANEL_INSTALLATION.md)** - Complete installation guide
- **[BACKEND_API.md](./BACKEND_API.md)** - API documentation
- **[ADMIN_AND_FORUM_COMPLETE.md](./ADMIN_AND_FORUM_COMPLETE.md)** - Features overview
- **[LEVEL_100_REPORT.md](./LEVEL_100_REPORT.md)** - Project summary

---

## 🎯 Features

### ✅ 85+ Features
- User authentication & authorization
- Posts, comments, voting
- Real-time notifications
- Admin panel (complete)
- Forum system (8 categories)
- Activity feed
- Rich text editor (40+ tools)
- Image upload
- Multi-language support
- Dark/Light mode
- PWA support
- And more...

### ✅ Production Ready
- MySQL database
- JWT authentication
- File uploads
- SSL/TLS support
- Rate limiting
- CORS configured
- Error handling
- Logging

---

## 💰 Cost Estimation

### Server (Monthly)
- VPS (2GB RAM): $10-20
- Domain: $1
- SSL: Free (Let's Encrypt)
- **Total: ~$15-25/month**

### aaPanel
- Free (open source)

---

## 📞 Support

### Documentation
- Installation: `AAPANEL_INSTALLATION.md`
- API: `BACKEND_API.md`
- Features: `ADMIN_AND_FORUM_COMPLETE.md`

### Contact
- Email: support@nijuze.com
- Discord: https://discord.gg/nijuze

---

## 🎊 Summary

**Nijuze is now ready for aaPanel + MySQL!**

### What you have:
- ✅ Complete backend (Node.js + MySQL)
- ✅ Modern frontend (React + TypeScript)
- ✅ Admin panel (full featured)
- ✅ Forum system (8 categories)
- ✅ Activity feed (real-time)
- ✅ Installation scripts
- ✅ Deployment guide
- ✅ 85+ features

### Next steps:
1. Upload files to aaPanel
2. Run `bash quick-start.sh`
3. Configure domain & SSL
4. Test all features
5. Launch! 🚀

---

**Ready to deploy!** 🎉

For detailed instructions, see **[AAPANEL_INSTALLATION.md](./AAPANEL_INSTALLATION.md)**

# 🚀 NIJUZE - aaPanel Installation Guide (MySQL)

## 📋 Overview

Guide kamili ya ku-install Nijuze kwenye **aaPanel** na **MySQL database**.

---

## 🎯 Requirements

### Server Requirements
- **OS:** Ubuntu 20.04/22.04 LTS or CentOS 7/8
- **RAM:** 2GB minimum (4GB recommended)
- **Storage:** 20GB minimum
- **CPU:** 1 vCPU minimum (2 vCPU recommended)

### aaPanel Requirements
- aaPanel installed and running
- Nginx web server
- MySQL 5.7+ or 8.0+
- Node.js 18+
- PM2 process manager

---

## 📦 Step 1: Install aaPanel

### Ubuntu/Debian
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install aaPanel
wget -O install.sh http://www.aapanel.com/script/install_6.0_en.sh && sudo bash install.sh aapanel
```

### CentOS
```bash
# Update system
sudo yum update -y

# Install aaPanel
wget -O install.sh http://www.aapanel.com/script/install_6.0_en.sh && sudo bash install.sh aapanel
```

### Access aaPanel
After installation, access aaPanel at:
```
http://your-server-ip:8888/[random-string]
```

Login with credentials shown during installation.

---

## 🗄️ Step 2: Install Required Software via aaPanel

### 1. Install Nginx
1. Go to **App Store** → **One-click**
2. Click **LNMP** (recommended) or install Nginx separately
3. Select **Nginx 1.22+**
4. Click **Install**

### 2. Install MySQL
1. Go to **App Store** → **One-click**
2. Select **MySQL 8.0** (or 5.7)
3. Set root password during installation
4. Click **Install**

### 3. Install Node.js Manager
1. Go to **App Store** → **Third-party**
2. Search for **Node.js version manager**
3. Click **Install**
4. After installation, go to **Software Store** → **Node.js version manager**
5. Install **Node.js 18.x**

### 4. Install PM2 Manager
1. Go to **App Store** → **Third-party**
2. Search for **PM2 Manager**
3. Click **Install**

---

## 🔧 Step 3: Create MySQL Database

### Via aaPanel GUI
1. Go to **Database** → **MySQL**
2. Click **Add database**
3. Fill in:
   - **Database name:** `nijuze`
   - **Username:** `nijuze_user`
   - **Password:** Generate strong password (save it!)
   - **Access permission:** Localhost
4. Click **Submit**

### Via Command Line
```bash
# Login to MySQL
mysql -u root -p

# Create database and user
CREATE DATABASE nijuze CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'nijuze_user'@'localhost' IDENTIFIED BY 'your_strong_password';
GRANT ALL PRIVILEGES ON nijuze.* TO 'nijuze_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### Import Database Schema
```bash
# Upload mysql_schema.sql to server via aaPanel File Manager
# Then import:
mysql -u nijuze_user -p nijuze < /www/wwwroot/nijuze/backend/database/mysql_schema.sql
```

---

## 📤 Step 4: Upload Nijuze Files

### Via aaPanel File Manager
1. Go to **Files**
2. Navigate to `/www/wwwroot/`
3. Create folder: `nijuze`
4. Upload all Nijuze files to `/www/wwwroot/nijuze/`

### Via SFTP/SCP
```bash
# From your local machine
scp -r ./nijuze/* root@your-server-ip:/www/wwwroot/nijuze/
```

### File Structure
```
/www/wwwroot/nijuze/
├── backend/
│   ├── server.js
│   ├── package.json
│   ├── .env
│   └── database/
│       └── mysql_schema.sql
├── dist/              # Frontend build files
├── src/               # Frontend source
├── package.json
└── ...
```

---

## 🔐 Step 5: Configure Backend

### 1. Install Backend Dependencies
```bash
cd /www/wwwroot/nijuze/backend
npm install
```

### 2. Configure Environment Variables
```bash
# Copy .env.example to .env
cp .env.example .env

# Edit .env file
nano .env
```

Fill in your values:
```env
NODE_ENV=production
PORT=5000
API_URL=https://api.yourdomain.com
FRONTEND_URL=https://yourdomain.com

# MySQL Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=nijuze_user
DB_PASSWORD=your_strong_password
DB_NAME=nijuze

# JWT Secret (generate with: openssl rand -base64 32)
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d

# Upload
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760
```

### 3. Create Uploads Directory
```bash
mkdir -p uploads
chmod 755 uploads
```

### 4. Test Backend
```bash
# Start backend manually to test
node server.js

# You should see:
# ✅ Connected to MySQL database
# 🚀 NIJUZE BACKEND SERVER
# Port: 5000
```

Press `Ctrl+C` to stop.

---

## 🎨 Step 6: Build Frontend

### 1. Install Frontend Dependencies
```bash
cd /www/wwwroot/nijuze
npm install
```

### 2. Configure Frontend Environment
```bash
# Create .env.production
nano .env.production
```

Add:
```env
VITE_API_URL=https://api.yourdomain.com
VITE_WS_URL=wss://api.yourdomain.com
```

### 3. Build Frontend
```bash
npm run build
```

Build files will be in `/dist/` folder.

---

## 🌐 Step 7: Configure Nginx

### Via aaPanel GUI

#### 1. Add Website for Frontend
1. Go to **Website** → **Add site**
2. Fill in:
   - **Domain:** `yourdomain.com`
   - **Root directory:** `/www/wwwroot/nijuze/dist`
   - **PHP version:** Pure static
   - **Database:** None
3. Click **Submit**

#### 2. Configure Nginx for Frontend
1. Click on your site → **Settings** → **Configuration file**
2. Replace content with:

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    root /www/wwwroot/nijuze/dist;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json application/javascript;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Frontend routes (SPA)
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Static files caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # API proxy
    location /api {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Increase timeout for file uploads
        proxy_read_timeout 300s;
        proxy_send_timeout 300s;
        client_max_body_size 50M;
    }

    # Uploads proxy
    location /uploads {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Health check
    location /health {
        proxy_pass http://127.0.0.1:5000;
    }

    # Deny access to hidden files
    location ~ /\. {
        deny all;
        access_log off;
        log_not_found off;
    }
}
```

3. Click **Save**

#### 3. Add API Subdomain
1. Go to **Website** → **Add site**
2. Fill in:
   - **Domain:** `api.yourdomain.com`
   - **Root directory:** `/www/wwwroot/nijuze/backend`
   - **PHP version:** Pure static
3. Click **Submit**

#### 4. Configure Nginx for API
1. Click on API site → **Settings** → **Configuration file**
2. Replace content with:

```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    # CORS headers
    add_header Access-Control-Allow-Origin "https://yourdomain.com" always;
    add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always;
    add_header Access-Control-Allow-Headers "Authorization, Content-Type" always;
    add_header Access-Control-Allow-Credentials "true" always;

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req zone=api burst=20 nodelay;

    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        proxy_read_timeout 300s;
        proxy_send_timeout 300s;
        client_max_body_size 50M;
    }

    # Static files
    location /uploads {
        alias /www/wwwroot/nijuze/backend/uploads;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

3. Click **Save**

---

## 🔒 Step 8: Configure SSL

### Via aaPanel GUI
1. Go to **Website** → Click on your site → **SSL**
2. Select **Let's Encrypt**
3. Add domains:
   - `yourdomain.com`
   - `www.yourdomain.com`
   - `api.yourdomain.com`
4. Click **Apply**
5. Enable **Force HTTPS**

### Repeat for API site
1. Go to **Website** → Click on API site → **SSL**
2. Select **Let's Encrypt**
3. Add domain: `api.yourdomain.com`
4. Click **Apply**
5. Enable **Force HTTPS**

---

## 🚀 Step 9: Start Backend with PM2

### Via aaPanel PM2 Manager
1. Go to **Software Store** → **PM2 Manager** → **Settings**
2. Click **Add project**
3. Fill in:
   - **Project name:** `nijuze-backend`
   - **Startup file:** `/www/wwwroot/nijuze/backend/server.js`
   - **Project directory:** `/www/wwwroot/nijuze/backend`
   - **Run user:** `www`
4. Click **Submit**

### Via Command Line
```bash
# Install PM2 globally (if not installed)
npm install -g pm2

# Start backend
cd /www/wwwroot/nijuze/backend
pm2 start server.js --name nijuze-backend

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
```

### Verify Backend is Running
```bash
# Check PM2 status
pm2 status

# Check logs
pm2 logs nijuze-backend

# Test health endpoint
curl https://api.yourdomain.com/health
```

---

## ✅ Step 10: Test Installation

### 1. Test Frontend
```bash
# Visit your domain
https://yourdomain.com
```

You should see the Nijuze homepage.

### 2. Test Backend API
```bash
# Test health endpoint
curl https://api.yourdomain.com/health

# Expected response:
# {"status":"healthy","timestamp":"...","database":"connected"}
```

### 3. Test Registration
1. Go to `https://yourdomain.com/register`
2. Create a new account
3. Verify you can login

### 4. Test Admin Panel
1. Login as admin (admin@nijuze.com / admin123)
2. Go to `https://yourdomain.com/admin`
3. Verify you can see dashboard

---

## 🔧 Step 11: Post-Installation Tasks

### 1. Update Admin Password
```bash
# Login to MySQL
mysql -u nijuze_user -p nijuze

# Update admin password (generate hash with bcrypt)
UPDATE users SET password_hash = '$2a$10$YourNewHashedPassword' WHERE email = 'admin@nijuze.com';
EXIT;
```

### 2. Configure Firewall
```bash
# Allow HTTP/HTTPS
sudo ufw allow 80
sudo ufw allow 443

# Allow SSH (only your IP)
sudo ufw allow from YOUR_IP to any port 22

# Enable firewall
sudo ufw enable
```

### 3. Setup Automatic Backups
```bash
# Create backup script
nano /www/wwwroot/nijuze/backup.sh
```

Add:
```bash
#!/bin/bash
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/www/backup/nijuze"

mkdir -p $BACKUP_DIR

# Backup database
mysqldump -u nijuze_user -p'your_password' nijuze > $BACKUP_DIR/db_$TIMESTAMP.sql

# Compress
gzip $BACKUP_DIR/db_$TIMESTAMP.sql

# Backup uploads
tar -czf $BACKUP_DIR/uploads_$TIMESTAMP.tar.gz /www/wwwroot/nijuze/backend/uploads

# Delete old backups (keep 30 days)
find $BACKUP_DIR -name "*.sql.gz" -mtime +30 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +30 -delete

echo "Backup completed: $TIMESTAMP"
```

Make executable:
```bash
chmod +x /www/wwwroot/nijuze/backup.sh
```

Add to crontab:
```bash
# Edit crontab
crontab -e

# Add daily backup at 2 AM
0 2 * * * /www/wwwroot/nijuze/backup.sh >> /var/log/nijuze-backup.log 2>&1
```

### 4. Monitor Logs
```bash
# Backend logs
pm2 logs nijuze-backend

# Nginx error logs
tail -f /www/wwwlogs/yourdomain.com.error.log

# Nginx access logs
tail -f /www/wwwlogs/yourdomain.com.log
```

---

## 📊 Step 12: Performance Optimization

### 1. Enable Redis Cache (Optional)
```bash
# Install Redis via aaPanel
# App Store → One-click → Redis

# Install Redis in backend
cd /www/wwwroot/nijuze/backend
npm install redis

# Update server.js to use Redis
```

### 2. Optimize MySQL
```bash
# Edit MySQL config
nano /etc/my.cnf
```

Add/modify:
```ini
[mysqld]
innodb_buffer_pool_size = 1G
innodb_log_file_size = 256M
innodb_flush_log_at_trx_commit = 2
query_cache_size = 64M
query_cache_type = 1
max_connections = 200
```

Restart MySQL:
```bash
sudo systemctl restart mysql
```

### 3. Enable Nginx Caching
Add to Nginx config:
```nginx
# Cache static files
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
    access_log off;
}
```

---

## 🔄 Step 13: Update & Maintenance

### Update Backend
```bash
cd /www/wwwroot/nijuze/backend

# Pull latest code
git pull origin main

# Install new dependencies
npm install

# Restart backend
pm2 restart nijuze-backend
```

### Update Frontend
```bash
cd /www/wwwroot/nijuze

# Pull latest code
git pull origin main

# Install new dependencies
npm install

# Rebuild
npm run build

# Nginx will automatically serve new files
```

### Database Maintenance
```bash
# Optimize tables
mysql -u nijuze_user -p nijuze -e "OPTIMIZE TABLE posts; OPTIMIZE TABLE comments; OPTIMIZE TABLE users;"

# Check database size
mysql -u nijuze_user -p nijuze -e "SELECT table_name, ROUND((data_length + index_length) / 1024 / 1024, 2) AS 'Size (MB)' FROM information_schema.tables WHERE table_schema = 'nijuze';"
```

---

## 🐛 Troubleshooting

### Backend not starting
```bash
# Check logs
pm2 logs nijuze-backend --lines 100

# Check if port is in use
sudo lsof -i :5000

# Kill process on port 5000
sudo fuser -k 5000/tcp

# Restart
pm2 restart nijuze-backend
```

### Database connection failed
```bash
# Test MySQL connection
mysql -u nijuze_user -p nijuze

# Check .env file
cat /www/wwwroot/nijuze/backend/.env

# Verify MySQL is running
sudo systemctl status mysql
```

### 502 Bad Gateway
```bash
# Check if backend is running
pm2 status

# Check Nginx error logs
tail -50 /www/wwwlogs/yourdomain.com.error.log

# Restart both services
pm2 restart nijuze-backend
sudo systemctl restart nginx
```

### CORS errors
```bash
# Check .env FRONTEND_URL
cat /www/wwwroot/nijuze/backend/.env | grep FRONTEND_URL

# Check Nginx CORS headers
grep -A5 "Access-Control" /www/server/panel/vhost/nginx/api.yourdomain.com.conf
```

---

## 📞 Support

### Documentation
- API Docs: `/www/wwwroot/nijuze/BACKEND_API.md`
- Deployment: `/www/wwwroot/nijuze/PRODUCTION_DEPLOYMENT.md`
- README: `/www/wwwroot/nijuze/README.md`

### Logs
- Backend: `pm2 logs nijuze-backend`
- Nginx: `/www/wwwlogs/yourdomain.com.error.log`
- MySQL: `/var/log/mysql/error.log`

### Contact
- Email: support@nijuze.com
- Discord: https://discord.gg/nijuze

---

## 🎉 You're Live!

Your Nijuze platform is now live at **https://yourdomain.com**

**Admin Panel:** https://yourdomain.com/admin  
**API:** https://api.yourdomain.com

---

## 📝 Quick Commands Reference

```bash
# Backend
pm2 start nijuze-backend          # Start
pm2 stop nijuze-backend           # Stop
pm2 restart nijuze-backend        # Restart
pm2 logs nijuze-backend           # Logs
pm2 status                        # Status

# Database
mysql -u nijuze_user -p nijuze    # Login
mysqldump -u nijuze_user -p nijuze > backup.sql  # Backup

# Nginx
sudo systemctl restart nginx      # Restart
sudo systemctl status nginx       # Status
tail -f /www/wwwlogs/yourdomain.com.error.log  # Error logs

# System
sudo ufw status                   # Firewall
df -h                             # Disk space
free -m                           # Memory
top                               # Processes
```

---

**Installation Complete!** 🚀

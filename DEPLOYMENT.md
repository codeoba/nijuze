# 🚀 Nijuze - Deployment Guide

## Overview
Guide kamili ya ku-deploy Nijuze production environment.

---

## 📋 Prerequisites

### Required Accounts
- [AWS Account](https://aws.amazon.com/) (EC2, RDS, S3, CloudFront)
- [Vercel Account](https://vercel.com/) (Frontend hosting)
- [Domain Name](https://namecheap.com/) (nijuze.com)
- [SendGrid Account](https://sendgrid.com/) (Email service)
- [GitHub Account](https://github.com/) (Code repository)

### Required Tools
- Node.js 18+
- PostgreSQL 14+
- Redis 6+
- Git
- AWS CLI
- Vercel CLI

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                      Cloudflare CDN                      │
└─────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┴───────────────────┐
        │                                       │
┌───────▼────────┐                    ┌────────▼────────┐
│   Vercel       │                    │   AWS EC2       │
│   (Frontend)   │                    │   (Backend)     │
│   React App    │                    │   Node.js       │
└────────────────┘                    └────────┬────────┘
                                               │
                        ┌──────────────────────┼──────────────────────┐
                        │                      │                      │
                ┌───────▼────────┐    ┌────────▼────────┐    ┌───────▼────────┐
                │   AWS RDS      │    │   AWS ElastiCache│   │   AWS S3       │
                │  PostgreSQL    │    │     Redis        │   │  File Storage  │
                └────────────────┘    └─────────────────┘    └────────────────┘
```

---

## 🗄️ Step 1: Database Setup (AWS RDS)

### Create PostgreSQL Database

1. Go to AWS RDS Console
2. Click "Create database"
3. Choose:
   - Engine: PostgreSQL 14
   - Template: Free tier (or Production)
   - DB instance class: db.t3.micro (free) or db.t3.medium (production)
   - Storage: 20 GB (auto-scaling enabled)
   - Multi-AZ: Enable for production
4. Set credentials:
   - Master username: `nijuze_admin`
   - Master password: (generate strong password)
5. Network:
   - VPC: Default
   - Public access: No
   - VPC security group: Create new (allow port 5432 from EC2)
6. Click "Create database"

### Get Connection String
```
postgresql://nijuze_admin:PASSWORD@nijuze-db.xxxxx.region.rds.amazonaws.com:5432/nijuze
```

### Run Migrations
```bash
# Connect to database
psql postgresql://nijuze_admin:PASSWORD@nijuze-db.xxxxx.region.rds.amazonaws.com:5432/nijuze

# Run schema
\i backend/database/schema.sql
```

---

## 🔴 Step 2: Redis Setup (AWS ElastiCache)

### Create Redis Cluster

1. Go to ElastiCache Console
2. Click "Create"
3. Choose:
   - Cluster engine: Redis
   - Location: Same region as RDS
   - Node type: cache.t3.micro (free) or cache.t3.medium (production)
   - Number of replicas: 0 (free) or 2 (production)
4. Click "Create"

### Get Redis URL
```
redis://nijuze-redis.xxxxx.cache.amazonaws.com:6379
```

---

## 📦 Step 3: S3 Bucket Setup

### Create S3 Bucket

1. Go to S3 Console
2. Click "Create bucket"
3. Bucket name: `nijuze-uploads`
4. Region: Same as other services
5. Block all public access: OFF (for public files)
6. Enable versioning: Yes
7. Click "Create bucket"

### Configure CORS
```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
    "AllowedOrigins": ["*"],
    "ExposeHeaders": []
  }
]
```

### Get Credentials
1. Go to IAM Console
2. Create user: `nijuze-s3-user`
3. Attach policy: `AmazonS3FullAccess`
4. Create access key
5. Save:
   - AWS_ACCESS_KEY_ID
   - AWS_SECRET_ACCESS_KEY

---

## 🖥️ Step 4: Backend Deployment (AWS EC2)

### Launch EC2 Instance

1. Go to EC2 Console
2. Click "Launch instance"
3. Choose:
   - Name: `nijuze-backend`
   - AMI: Ubuntu 22.04 LTS
   - Instance type: t3.micro (free) or t3.medium (production)
   - Key pair: Create new (download .pem file)
   - Security group:
     - Allow SSH (22) from your IP
     - Allow HTTP (80) from anywhere
     - Allow HTTPS (443) from anywhere
     - Allow WebSocket (3001) from anywhere
4. Storage: 30 GB GP3
5. Click "Launch instance"

### Connect to EC2
```bash
chmod 400 nijuze-key.pem
ssh -i nijuze-key.pem ubuntu@your-ec2-ip.amazonaws.com
```

### Install Dependencies
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2 (process manager)
sudo npm install -g pm2

# Install Nginx
sudo apt install -y nginx

# Install Git
sudo apt install -y git
```

### Clone Repository
```bash
cd /var/www
sudo git clone https://github.com/yourusername/nijuze.git
cd nijuze
sudo chown -R ubuntu:ubuntu .
```

### Install Backend Dependencies
```bash
cd backend
npm install
```

### Create Environment File
```bash
nano .env
```

```env
# Server
NODE_ENV=production
PORT=5000
FRONTEND_URL=https://nijuze.com

# Database
DATABASE_URL=postgresql://nijuze_admin:PASSWORD@nijuze-db.xxxxx.region.rds.amazonaws.com:5432/nijuze

# Redis
REDIS_URL=redis://nijuze-redis.xxxxx.cache.amazonaws.com:6379

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# AWS S3
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_S3_BUCKET=nijuze-uploads
AWS_REGION=us-east-1

# SendGrid
SENDGRID_API_KEY=SG.xxxxx
FROM_EMAIL=noreply@nijuze.com

# WebSocket
WEBSOCKET_URL=wss://ws.nijuze.com
```

### Start Backend with PM2
```bash
pm2 start server.js --name nijuze-backend
pm2 save
pm2 startup
```

### Configure Nginx
```bash
sudo nano /etc/nginx/sites-available/nijuze
```

```nginx
server {
    listen 80;
    server_name api.nijuze.com ws.nijuze.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/nijuze /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Setup SSL with Let's Encrypt
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d api.nijuze.com -d ws.nijuze.com
```

---

## 🎨 Step 5: Frontend Deployment (Vercel)

### Install Vercel CLI
```bash
npm install -g vercel
```

### Login to Vercel
```bash
vercel login
```

### Deploy Frontend
```bash
cd frontend
vercel --prod
```

### Set Environment Variables in Vercel
1. Go to Vercel Dashboard
2. Select your project
3. Go to Settings > Environment Variables
4. Add:
   - `VITE_API_URL`: `https://api.nijuze.com`
   - `VITE_WS_URL`: `wss://ws.nijuze.com`

### Connect Custom Domain
1. Go to Vercel Dashboard > Your Project > Settings > Domains
2. Add domain: `nijuze.com`
3. Follow DNS instructions

---

## 🌐 Step 6: DNS Configuration

### Configure DNS Records

1. Go to your domain registrar (Namecheap, GoDaddy, etc.)
2. Add DNS records:

```
Type: A
Name: @
Value: [Vercel IP]

Type: CNAME
Name: www
Value: cname.vercel-dns.com

Type: CNAME
Name: api
Value: [EC2 Elastic IP]

Type: CNAME
Name: ws
Value: [EC2 Elastic IP]
```

---

## 📧 Step 7: Email Service Setup (SendGrid)

### Create SendGrid Account

1. Go to [SendGrid](https://sendgrid.com/)
2. Sign up for free plan (100 emails/day)
3. Verify single sender email: `noreply@nijuze.com`
4. Create API Key:
   - Go to Settings > API Keys
   - Create API Key (Full Access)
   - Copy key to backend .env

---

## 🔒 Step 8: Security Configuration

### Firewall Rules
```bash
# Allow SSH (only your IP)
sudo ufw allow from YOUR_IP to any port 22

# Allow HTTP/HTTPS
sudo ufw allow 80
sudo ufw allow 443

# Enable firewall
sudo ufw enable
```

### SSL/TLS
- Already configured with Let's Encrypt
- Force HTTPS in Nginx config

### Rate Limiting
- Already configured in backend (100 req/min)

### CORS
- Configure in backend to allow only your frontend domain

---

## 📊 Step 9: Monitoring Setup

### Install Monitoring Tools

```bash
# Install PM2 monitoring
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7

# Install New Relic (optional)
npm install newrelic --save
```

### Setup Uptime Monitoring
- Use [UptimeRobot](https://uptimerobot.com/) (free)
- Monitor: `https://nijuze.com` and `https://api.nijuze.com`

---

## 🚀 Step 10: Launch Checklist

### Pre-Launch
- [ ] Database migrations run
- [ ] Backend deployed and running
- [ ] Frontend deployed to Vercel
- [ ] SSL certificates installed
- [ ] DNS records configured
- [ ] Email service working
- [ ] Environment variables set
- [ ] Monitoring setup
- [ ] Backup strategy in place

### Testing
- [ ] User registration works
- [ ] Login works
- [ ] Create post works
- [ ] Comments work
- [ ] Chat works
- [ ] File uploads work
- [ ] Email notifications work
- [ ] WebSocket connections work

### Performance
- [ ] Page load < 3 seconds
- [ ] API response < 500ms
- [ ] Database queries optimized
- [ ] CDN configured
- [ ] Caching enabled

---

## 🔄 Step 11: Deployment Automation

### Create Deploy Script
```bash
#!/bin/bash
# deploy.sh

echo "🚀 Deploying Nijuze..."

# Pull latest code
cd /var/www/nijuze
git pull origin main

# Install dependencies
cd backend
npm install --production

# Restart backend
pm2 restart nijuze-backend

# Deploy frontend
cd ../frontend
npm install
npm run build
vercel --prod --yes

echo "✅ Deployment complete!"
```

### Setup GitHub Actions
```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Deploy Backend
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.EC2_HOST }}
          username: ubuntu
          key: ${{ secrets.EC2_SSH_KEY }}
          script: |
            cd /var/www/nijuze
            ./deploy.sh
```

---

## 💰 Step 12: Cost Estimation

### AWS (Monthly)
- EC2 t3.micro: Free tier (12 months) / $15/month after
- RDS t3.micro: Free tier (12 months) / $15/month after
- ElastiCache t3.micro: Free tier (12 months) / $15/month after
- S3: $0.023/GB (first 50TB)
- Data transfer: $0.09/GB

### Vercel
- Hobby plan: Free
- Pro plan: $20/month

### SendGrid
- Free plan: 100 emails/day
- Essentials: $19.95/month (50K emails)

### Domain
- .com domain: $10-15/year

### Total (First Year)
- **Free tier**: ~$25/year (domain only)
- **After free tier**: ~$100-150/month

---

## 🛠️ Maintenance

### Daily Tasks
- Check PM2 logs: `pm2 logs`
- Monitor errors
- Check disk space

### Weekly Tasks
- Review analytics
- Check user feedback
- Update dependencies

### Monthly Tasks
- Database backup
- Security updates
- Performance optimization
- Cost review

---

## 📞 Support

### Documentation
- API Docs: https://docs.nijuze.com
- User Guide: https://help.nijuze.com

### Contact
- Email: support@nijuze.com
- Discord: https://discord.gg/nijuze
- Twitter: @nijuze

---

## 🎉 You're Live!

Your Nijuze platform is now live at **https://nijuze.com**

**Level 100 Achieved!** 🏆

---

## 📝 Notes

- Always test in staging before production
- Keep backups of database
- Monitor costs regularly
- Update dependencies monthly
- Review security quarterly

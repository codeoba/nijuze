# 🚀 Nijuze - Production Deployment Guide

## Overview

Guide kamili ya ku-deploy Nijuze katika production environment kwa kutumia Docker, AWS, na best practices za kisasa.

---

## 📋 Prerequisites

### Required Accounts
- [AWS Account](https://aws.amazon.com/) (EC2, RDS, S3, CloudFront)
- [Domain Name](https://namecheap.com/) (nijuze.com)
- [SendGrid Account](https://sendgrid.com/) (Email service)
- [GitHub Account](https://github.com/) (Code repository)
- [Cloudflare Account](https://cloudflare.com/) (CDN & DNS)

### Required Tools
- Docker & Docker Compose
- Node.js 18+
- PostgreSQL 15+
- Redis 7+
- Git
- AWS CLI
- SSL Certificates (Let's Encrypt)

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                      Cloudflare CDN                      │
│                    (DDoS Protection)                     │
└─────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┴───────────────────┐
        │                                       │
┌───────▼────────┐                    ┌────────▼────────┐
│   Nginx        │                    │   Load Balancer │
│  (Reverse      │                    │   (AWS ALB)     │
│   Proxy)       │                    │                 │
└───────┬────────┘                    └────────┬────────┘
        │                                       │
        └───────────────────┬───────────────────┘
                            │
        ┌───────────────────┴───────────────────┐
        │                                       │
┌───────▼────────┐                    ┌────────▼────────┐
│   Frontend     │                    │   Backend API   │
│   (React)      │                    │   (Node.js)     │
│   Port: 3000   │                    │   Port: 5000    │
└────────────────┘                    └────────┬────────┘
                                               │
                        ┌──────────────────────┼──────────────────────┐
                        │                      │                      │
                ┌───────▼────────┐    ┌────────▼────────┐    ┌───────▼────────┐
                │   PostgreSQL   │    │     Redis       │    │   AWS S3       │
                │   (Database)   │    │    (Cache)      │    │  (File Store)  │
                │   Port: 5432   │    │   Port: 6379    │    │                │
                └────────────────┘    └─────────────────┘    └────────────────┘
```

---

## 🗄️ Step 1: Database Setup (AWS RDS)

### Create PostgreSQL Database

1. **Go to AWS RDS Console**
2. **Click "Create database"**
3. **Choose:**
   - Engine: PostgreSQL 15
   - Template: Production
   - DB instance class: db.t3.medium (2 vCPU, 4GB RAM)
   - Storage: 100 GB (gp3, auto-scaling enabled)
   - Multi-AZ: Enable (High availability)
   - Backup retention: 7 days

4. **Set credentials:**
   ```
   Master username: nijuze_admin
   Master password: [Generate strong password]
   ```

5. **Network:**
   - VPC: Default
   - Public access: No
   - VPC security group: Create new (allow port 5432 from EC2)

6. **Click "Create database"**

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

1. **Go to ElastiCache Console**
2. **Click "Create"**
3. **Choose:**
   - Cluster engine: Redis 7
   - Location: Same region as RDS
   - Node type: cache.r6g.large (2 vCPU, 13GB RAM)
   - Number of replicas: 2 (High availability)
   - Automatic failover: Enable

4. **Click "Create"**

### Get Redis URL
```
redis://nijuze-redis.xxxxx.cache.amazonaws.com:6379
```

---

## 📦 Step 3: S3 Bucket Setup

### Create S3 Bucket

1. **Go to S3 Console**
2. **Click "Create bucket"**
3. **Bucket name:** `nijuze-uploads`
4. **Region:** Same as other services
5. **Block all public access:** OFF (for public files)
6. **Enable versioning:** Yes
7. **Enable encryption:** AWS-KMS
8. **Click "Create bucket"**

### Configure CORS
```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
    "AllowedOrigins": ["https://nijuze.com"],
    "ExposeHeaders": []
  }
]
```

### Create IAM User for S3 Access

1. **Go to IAM Console**
2. **Create user:** `nijuze-s3-user`
3. **Attach policy:**
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::nijuze-uploads",
        "arn:aws:s3:::nijuze-uploads/*"
      ]
    }
  ]
}
```
4. **Create access key**
5. **Save:**
   - AWS_ACCESS_KEY_ID
   - AWS_SECRET_ACCESS_KEY

---

## 🖥️ Step 4: Backend Deployment (AWS EC2)

### Launch EC2 Instance

1. **Go to EC2 Console**
2. **Click "Launch instance"**
3. **Choose:**
   - Name: `nijuze-backend`
   - AMI: Ubuntu 22.04 LTS
   - Instance type: t3.large (2 vCPU, 8GB RAM)
   - Key pair: Create new (download .pem file)
   - Security group:
     - Allow SSH (22) from your IP
     - Allow HTTP (80) from anywhere
     - Allow HTTPS (443) from anywhere
     - Allow WebSocket (5000) from anywhere
4. **Storage:** 100 GB GP3
5. **Click "Launch instance"**

### Connect to EC2
```bash
chmod 400 nijuze-key.pem
ssh -i nijuze-key.pem ubuntu@your-ec2-ip.amazonaws.com
```

### Install Dependencies
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker ubuntu

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Install Git
sudo apt install -y git

# Install Nginx
sudo apt install -y nginx
```

### Clone Repository
```bash
cd /var/www
sudo git clone https://github.com/yourusername/nijuze.git
cd nijuze
sudo chown -R ubuntu:ubuntu .
```

### Configure Environment
```bash
# Copy environment template
cp .env.example .env

# Edit environment file
nano .env
```

**Fill in all environment variables:**
```env
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://nijuze_admin:PASSWORD@nijuze-db.xxxxx.region.rds.amazonaws.com:5432/nijuze
REDIS_URL=redis://nijuze-redis.xxxxx.cache.amazonaws.com:6379
JWT_SECRET=[Generate with: openssl rand -base64 32]
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_S3_BUCKET=nijuze-uploads
SENDGRID_API_KEY=SG.xxxxx
```

### Start Application with Docker Compose
```bash
# Build and start all services
sudo docker-compose up -d

# Check status
sudo docker-compose ps

# View logs
sudo docker-compose logs -f backend
```

### Setup SSL with Let's Encrypt
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d nijuze.com -d www.nijuze.com -d api.nijuze.com

# Auto-renewal (already configured)
sudo certbot renew --dry-run
```

---

## 🌐 Step 5: DNS Configuration

### Configure DNS Records

1. **Go to Cloudflare Dashboard**
2. **Add your domain:** nijuze.com
3. **Add DNS records:**

```
Type: A
Name: @
Value: [EC2 Elastic IP]
Proxy: ON

Type: CNAME
Name: www
Value: nijuze.com
Proxy: ON

Type: CNAME
Name: api
Value: nijuze.com
Proxy: ON

Type: CNAME
Name: ws
Value: nijuze.com
Proxy: ON
```

4. **Enable SSL/TLS:**
   - Mode: Full (strict)
   - Always Use HTTPS: ON
   - Minimum TLS Version: 1.2

---

## 📧 Step 6: Email Service Setup (SendGrid)

### Create SendGrid Account

1. **Go to [SendGrid](https://sendgrid.com/)**
2. **Sign up for Pro plan** ($19.95/month - 50K emails)
3. **Verify domain:** nijuze.com
4. **Create API Key:**
   - Go to Settings > API Keys
   - Create API Key (Full Access)
   - Copy key to .env

### Configure Email Templates

Create email templates for:
- Welcome email
- Password reset
- Notification emails
- Weekly digest

---

## 🔒 Step 7: Security Configuration

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

### Nginx Security Headers
Already configured in `nginx.conf`:
- X-Frame-Options
- X-Content-Type-Options
- X-XSS-Protection
- Content-Security-Policy
- Strict-Transport-Security

### Rate Limiting
Already configured:
- API: 10 requests/second
- Login: 5 requests/minute

### Backup Strategy
```bash
# Create backup script
cat > /var/www/nijuze/scripts/backup.sh << 'EOF'
#!/bin/bash
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/var/backups/nijuze"

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup database
pg_dump -U nijuze_admin -h nijuze-db.xxxxx.region.rds.amazonaws.com nijuze > $BACKUP_DIR/db_$TIMESTAMP.sql

# Compress backup
gzip $BACKUP_DIR/db_$TIMESTAMP.sql

# Upload to S3
aws s3 cp $BACKUP_DIR/db_$TIMESTAMP.sql.gz s3://nijuze-backups/db_$TIMESTAMP.sql.gz

# Delete old backups (keep 30 days)
find $BACKUP_DIR -name "db_*.sql.gz" -mtime +30 -delete

echo "Backup completed: db_$TIMESTAMP.sql.gz"
EOF

chmod +x /var/www/nijuze/scripts/backup.sh

# Add to crontab (daily at 2 AM)
(crontab -l 2>/dev/null; echo "0 2 * * * /var/www/nijuze/scripts/backup.sh") | crontab -
```

---

## 📊 Step 8: Monitoring Setup

### Install Monitoring Tools

```bash
# Install PM2 for process management
sudo npm install -g pm2

# Start backend with PM2
cd /var/www/nijuze/backend
pm2 start server.js --name nijuze-backend
pm2 save
pm2 startup
```

### Setup Uptime Monitoring
1. **Use [UptimeRobot](https://uptimerobot.com/)** (Free)
2. **Monitor:**
   - https://nijuze.com
   - https://api.nijuze.com/health
   - https://ws.nijuze.com

### Setup Error Tracking
1. **Create [Sentry](https://sentry.io/) account**
2. **Add DSN to .env:**
   ```
   SENTRY_DSN=https://your-sentry-dsn@sentry.io/project
   ```

### Setup Analytics
1. **Create Google Analytics account**
2. **Add tracking ID to .env:**
   ```
   GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
   ```

---

## 🚀 Step 9: Deployment Automation

### Create Deploy Script
```bash
cat > /var/www/nijuze/deploy.sh << 'EOF'
#!/bin/bash
set -e

echo "🚀 Deploying Nijuze..."

# Pull latest code
cd /var/www/nijuze
git pull origin main

# Rebuild backend
sudo docker-compose build backend

# Restart services
sudo docker-compose up -d --no-deps backend

# Run database migrations (if any)
sudo docker-compose exec backend npm run migrate

# Clear cache
sudo docker-compose exec backend npm run cache:clear

echo "✅ Deployment complete!"
EOF

chmod +x /var/www/nijuze/deploy.sh
```

### Setup GitHub Actions
Already created in `.github/workflows/ci-cd.yml`

---

## 🔄 Step 10: Maintenance

### Daily Tasks
```bash
# Check PM2 logs
pm2 logs

# Monitor errors
pm2 status

# Check disk space
df -h

# Check memory usage
free -m
```

### Weekly Tasks
- Review analytics
- Check user feedback
- Update dependencies
- Review error logs

### Monthly Tasks
```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Update Docker images
sudo docker-compose pull
sudo docker-compose up -d

# Review security logs
sudo tail -f /var/log/nginx/access.log

# Optimize database
psql -U nijuze_admin -h nijuze-db.xxxxx.region.rds.amazonaws.com -d nijuze -c "VACUUM ANALYZE;"
```

---

## 💰 Cost Estimation

### AWS (Monthly)
- EC2 t3.large: $120/month
- RDS db.t3.medium: $130/month
- ElastiCache cache.r6g.large: $180/month
- S3: $5/month (first 50TB)
- Data transfer: $20/month
- **Total: ~$455/month**

### Services (Monthly)
- Vercel Pro: $20/month
- SendGrid Pro: $20/month
- Cloudflare Pro: $20/month
- Sentry Team: $26/month
- **Total: ~$86/month**

### Domain
- .com domain: $12/year

### **Total Monthly Cost: ~$541/month**

---

## 📈 Performance Optimization

### Frontend
- Enable gzip compression (already in nginx.conf)
- Use CDN for static assets (Cloudflare)
- Implement lazy loading
- Optimize images
- Minify CSS/JS

### Backend
- Use Redis caching (already configured)
- Implement database indexing (already in schema.sql)
- Use connection pooling
- Enable HTTP/2 (already in nginx.conf)
- Optimize database queries

### Database
- Use read replicas for scaling
- Implement query caching
- Regular VACUUM ANALYZE
- Monitor slow queries

---

## 🎯 Launch Checklist

### Pre-Launch
- [ ] Database migrations run
- [ ] Backend deployed and running
- [ ] Frontend deployed
- [ ] SSL certificates installed
- [ ] DNS records configured
- [ ] Email service working
- [ ] Environment variables set
- [ ] Monitoring setup
- [ ] Backup strategy in place
- [ ] Security headers configured
- [ ] Rate limiting enabled
- [ ] CORS configured

### Testing
- [ ] User registration works
- [ ] Login works
- [ ] Create post works
- [ ] Comments work
- [ ] Chat works
- [ ] File uploads work
- [ ] Email notifications work
- [ ] WebSocket connections work
- [ ] Search works
- [ ] Mobile responsive

### Performance
- [ ] Page load < 3 seconds
- [ ] API response < 500ms
- [ ] Database queries optimized
- [ ] CDN configured
- [ ] Caching enabled
- [ ] Gzip compression enabled

---

## 📞 Support

### Documentation
- API Docs: https://docs.nijuze.com
- User Guide: https://help.nijuze.com
- Status Page: https://status.nijuze.com

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
- Scale infrastructure as needed

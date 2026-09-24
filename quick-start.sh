#!/bin/bash

# ============================================
# NIJUZE - Quick Start Script for aaPanel
# Run: bash quick-start.sh
# ============================================

echo "╔═══════════════════════════════════════════════════════════╗"
echo "║                                                           ║"
echo "║   🚀 NIJUZE - Quick Start for aaPanel                     ║"
echo "║                                                           ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if running as root
if [ "$EUID" -ne 0 ]; then
   echo -e "${RED}❌ Error: This script must be run as root${NC}"
   echo "Please run: sudo bash quick-start.sh"
   exit 1
fi

# Get current directory
CURRENT_DIR=$(pwd)
BACKEND_DIR="$CURRENT_DIR/backend"

echo -e "${YELLOW}📍 Current directory: $CURRENT_DIR${NC}"
echo ""

# Step 1: Check Node.js
echo -e "${YELLOW}📦 Step 1: Checking Node.js...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js not found!${NC}"
    echo "Please install Node.js 18+ via aaPanel first"
    exit 1
fi

NODE_VERSION=$(node -v)
echo -e "${GREEN}✅ Node.js version: $NODE_VERSION${NC}"
echo ""

# Step 2: Check MySQL
echo -e "${YELLOW}📦 Step 2: Checking MySQL...${NC}"
if ! command -v mysql &> /dev/null; then
    echo -e "${RED}❌ MySQL not found!${NC}"
    echo "Please install MySQL via aaPanel first"
    exit 1
fi

echo -e "${GREEN}✅ MySQL is installed${NC}"
echo ""

# Step 3: Create .env file
echo -e "${YELLOW}🔧 Step 3: Creating .env file...${NC}"
cd "$BACKEND_DIR"

if [ ! -f .env ]; then
    # Generate random JWT secret
    JWT_SECRET=$(openssl rand -base64 32)
    
    # Generate random database password
    DB_PASSWORD=$(openssl rand -base64 16 | tr -d '=+/' | cut -c1-16)
    
    cat > .env << EOF
NODE_ENV=production
PORT=5000
API_URL=http://localhost:5000
FRONTEND_URL=http://localhost:3000

DB_HOST=localhost
DB_PORT=3306
DB_USER=nijuze_user
DB_PASSWORD=$DB_PASSWORD
DB_NAME=nijuze

JWT_SECRET=$JWT_SECRET
JWT_EXPIRES_IN=7d

UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760
EOF
    
    echo -e "${GREEN}✅ .env file created${NC}"
    echo -e "${YELLOW}   Database password: $DB_PASSWORD${NC}"
    echo -e "${YELLOW}   ⚠️  Save this password!${NC}"
else
    echo -e "${GREEN}✅ .env file already exists${NC}"
fi
echo ""

# Step 4: Create MySQL database
echo -e "${YELLOW}🗄️  Step 4: Creating MySQL database...${NC}"
echo "Enter MySQL root password:"
read -s MYSQL_ROOT_PASSWORD

# Create database and user
mysql -u root -p"$MYSQL_ROOT_PASSWORD" << EOF
CREATE DATABASE IF NOT EXISTS nijuze CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'nijuze_user'@'localhost' IDENTIFIED BY '$DB_PASSWORD';
GRANT ALL PRIVILEGES ON nijuze.* TO 'nijuze_user'@'localhost';
FLUSH PRIVILEGES;
EOF

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Database 'nijuze' created${NC}"
    echo -e "${GREEN}✅ User 'nijuze_user' created${NC}"
else
    echo -e "${RED}❌ Failed to create database${NC}"
    exit 1
fi
echo ""

# Step 5: Install backend dependencies
echo -e "${YELLOW}📦 Step 5: Installing backend dependencies...${NC}"
npm install

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Backend dependencies installed${NC}"
else
    echo -e "${RED}❌ Failed to install dependencies${NC}"
    exit 1
fi
echo ""

# Step 6: Initialize database
echo -e "${YELLOW}🗄️  Step 6: Initializing database...${NC}"
node scripts/init-db.js

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Database initialized${NC}"
else
    echo -e "${RED}❌ Failed to initialize database${NC}"
    exit 1
fi
echo ""

# Step 7: Create uploads directory
echo -e "${YELLOW}📁 Step 7: Creating uploads directory...${NC}"
mkdir -p uploads
chmod 755 uploads
echo -e "${GREEN}✅ Uploads directory created${NC}"
echo ""

# Step 8: Start backend with PM2
echo -e "${YELLOW}🚀 Step 8: Starting backend with PM2...${NC}"

# Check if PM2 is installed
if ! command -v pm2 &> /dev/null; then
    echo "Installing PM2..."
    npm install -g pm2
fi

# Stop existing process if running
pm2 delete nijuze-backend 2>/dev/null || true

# Start backend
pm2 start server.js --name nijuze-backend

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Backend started with PM2${NC}"
else
    echo -e "${RED}❌ Failed to start backend${NC}"
    exit 1
fi

# Save PM2 configuration
pm2 save
pm2 startup

echo ""

# Step 9: Build frontend
echo -e "${YELLOW}🎨 Step 9: Building frontend...${NC}"
cd "$CURRENT_DIR"

# Update frontend .env
cat > .env.production << EOF
VITE_API_URL=http://localhost:5000
VITE_WS_URL=ws://localhost:5000
EOF

# Install frontend dependencies
npm install

# Build frontend
npm run build

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Frontend built successfully${NC}"
else
    echo -e "${RED}❌ Failed to build frontend${NC}"
    exit 1
fi
echo ""

# Step 10: Set permissions
echo -e "${YELLOW}🔐 Step 10: Setting permissions...${NC}"
chown -R www:www "$CURRENT_DIR"
chmod -R 755 "$CURRENT_DIR"
echo -e "${GREEN}✅ Permissions set${NC}"
echo ""

# Summary
echo "═══════════════════════════════════════════════════════════"
echo -e "${GREEN}✅ NIJUZE INSTALLATION COMPLETE!${NC}"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "📊 Installation Summary:"
echo "   Backend: http://localhost:5000"
echo "   Frontend: http://localhost:3000 (or serve dist/ folder)"
echo "   Database: MySQL (nijuze)"
echo ""
echo "🔐 Login Credentials:"
echo "   Admin: admin@nijuze.com / admin123"
echo "   Users: amina@example.com / password123"
echo "          juma@example.com / password123"
echo "          fatma@example.com / password123"
echo "          david@example.com / password123"
echo ""
echo "🔧 Database Credentials:"
echo "   Host: localhost"
echo "   Database: nijuze"
echo "   User: nijuze_user"
echo "   Password: $DB_PASSWORD"
echo ""
echo "📝 Next Steps:"
echo "   1. Configure Nginx (see AAPANEL_INSTALLATION.md)"
echo "   2. Setup SSL certificates"
echo "   3. Update domain in .env files"
echo "   4. Change default passwords"
echo ""
echo "📚 Documentation:"
echo "   - AAPANEL_INSTALLATION.md"
echo "   - BACKEND_API.md"
echo "   - README.md"
echo ""
echo "═══════════════════════════════════════════════════════════"
echo ""

# Show PM2 status
pm2 status

echo ""
echo "🎉 You're ready to go!"
echo ""

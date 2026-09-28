#!/bin/bash
# =====================================================================
# NIJUZE — Automated aaPanel Deployment Script
# Domain: nijuze.mdandu.com
# Database: sql_nijuze_mdandu_com
# =====================================================================

set -e

DOMAIN="nijuze.mdandu.com"
WEB_ROOT="/www/wwwroot/$DOMAIN"
REPO="https://github.com/codeoba/nijuze.git"
BRANCH="master"
BACKEND_PORT=5000

DB_NAME="sql_nijuze_mdandu_com"
DB_USER="sql_nijuze_mdandu_com"
DB_PASS="ed88a6a4a257d"
DB_HOST="localhost"

echo "========================================================="
echo "   🚀 NIJUZE aaPanel Automated Deployment Script"
echo "   Domain:   $DOMAIN"
echo "   Database: $DB_NAME"
echo "========================================================="

# 1. Create Web Root Directory
mkdir -p "$WEB_ROOT"
cd "$WEB_ROOT"

# 2. Clone or Pull Latest Code
if [ ! -d "$WEB_ROOT/.git" ]; then
    echo "📥 [1/6] Cloning repository from GitHub..."
    git clone -b "$BRANCH" "$REPO" .
else
    echo "🔄 [1/6] Pulling latest code from GitHub..."
    git fetch origin
    git reset --hard "origin/$BRANCH"
fi

# 3. Setup Backend Environment (.env)
echo "⚙️  [2/6] Configuring Backend Environment..."
cat <<EOF > "$WEB_ROOT/backend/.env"
PORT=$BACKEND_PORT
NODE_ENV=production
DB_HOST=$DB_HOST
DB_PORT=3306
DB_USER=$DB_USER
DB_PASSWORD=$DB_PASS
DB_NAME=$DB_NAME
JWT_SECRET=nijuze_super_secret_jwt_key_mdandu_2026
JWT_EXPIRES_IN=30d
API_URL=https://$DOMAIN/api
EOF

# Ensure uploads directory exists with correct permissions
mkdir -p "$WEB_ROOT/backend/uploads"
chmod -R 775 "$WEB_ROOT/backend/uploads"

# 4. Import / Initialize MySQL Database
echo "🗄️  [3/6] Initializing MySQL Database Schema..."
if [ -f "$WEB_ROOT/backend/database/mysql_schema.sql" ]; then
    mysql -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASS" "$DB_NAME" < "$WEB_ROOT/backend/database/mysql_schema.sql" || {
        echo "⚠️ Note: Schema import returned an alert (tables may already exist), continuing..."
    }
    echo "  ✅ Database tables checked/imported."
fi

# 5. Build Frontend (React + Vite)
echo "🏗️  [4/6] Installing Frontend Dependencies & Building..."
npm install
npm run build
echo "  ✅ Frontend build generated at: $WEB_ROOT/dist"

# 6. Start / Restart Backend using PM2
echo "⚡ [5/6] Setting up Backend Service (Node.js / PM2)..."
cd "$WEB_ROOT/backend"
npm install --production

# Check if PM2 is available, otherwise install it globally
if ! command -v pm2 &> /dev/null; then
    npm install -g pm2
fi

# Stop existing process if running, then start fresh
pm2 stop nijuze-api 2>/dev/null || true
pm2 delete nijuze-api 2>/dev/null || true
pm2 start server.js --name "nijuze-api"
pm2 save

# 7. Configure Nginx Configuration Suggestion
echo "🌐 [6/6] Generating Nginx Configuration snippet..."
cat <<EOF > "$WEB_ROOT/nginx_nijuze.conf"
# Nginx Configuration snippet for aaPanel Website: $DOMAIN
# Weka hii ndani ya: aaPanel -> Website -> Settings -> Config file (au Reverse Proxy)

location / {
    root $WEB_ROOT/dist;
    index index.html;
    try_files \$uri \$uri/ /index.html;
}

location /api/ {
    proxy_pass http://127.0.0.1:$BACKEND_PORT/api/;
    proxy_http_version 1.1;
    proxy_set_header Upgrade \$http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host \$host;
    proxy_cache_bypass \$http_upgrade;
    proxy_set_header X-Real-IP \$remote_addr;
    proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto \$scheme;
    client_max_body_size 30M;
}

location /uploads/ {
    alias $WEB_ROOT/backend/uploads/;
    expires 30d;
    add_header Cache-Control "public, no-transform";
}
EOF

# Fix file permissions for aaPanel www user
chown -R www:www "$WEB_ROOT" 2>/dev/null || chown -R nginx:nginx "$WEB_ROOT" 2>/dev/null || true

echo ""
echo "========================================================="
echo "  🎉 NIJUZE DEPLOYMENT SUCCESSFUL!"
echo "  Website: https://$DOMAIN"
echo "  API Endpoint: https://$DOMAIN/api/health"
echo "  PM2 Status: pm2 status"
echo "========================================================="

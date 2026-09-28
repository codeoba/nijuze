#!/bin/bash
# =====================================================================
# NIJUZE — Direct Vite & Node.js Deployment for aaPanel
# Domain: nijuze.mdandu.com
# Database: sql_nijuze_mdandu_com
# =====================================================================

set -e

DOMAIN="nijuze.mdandu.com"
WEB_ROOT="/www/wwwroot/$DOMAIN"
REPO="https://github.com/codeoba/nijuze.git"
BRANCH="master"
BACKEND_PORT=5000
VITE_PORT=3000

DB_NAME="sql_nijuze_mdandu_com"
DB_USER="sql_nijuze_mdandu_com"
DB_PASS="ed88a6a4a257d"
DB_HOST="localhost"

echo "========================================================="
echo "   🚀 NIJUZE aaPanel Direct Vite + Node.js Deployment"
echo "   Domain:   $DOMAIN"
echo "   Database: $DB_NAME"
echo "   Mode:     Vite Server (Port $VITE_PORT)"
echo "========================================================="

# Auto-detect Node.js & npm in aaPanel paths
for node_dir in /www/server/nodejs/v*/bin; do
    if [ -d "$node_dir" ]; then
        export PATH="$node_dir:$PATH"
    fi
done
export PATH="/usr/local/bin:/usr/bin:/bin:$PATH"

# 1. Web Root Directory
mkdir -p "$WEB_ROOT"
cd "$WEB_ROOT"

# Unlock .user.ini if aaPanel locked it
chattr -i "$WEB_ROOT/.user.ini" 2>/dev/null || true

# 2. Fetch Latest Code from GitHub
if [ ! -d "$WEB_ROOT/.git" ]; then
    echo "📥 [1/5] Fetching code from GitHub into $WEB_ROOT..."
    git init
    git remote add origin "$REPO" 2>/dev/null || git remote set-url origin "$REPO"
    git fetch origin "$BRANCH"
    git checkout -f -B "$BRANCH" "origin/$BRANCH"
else
    echo "🔄 [1/5] Pulling latest code from GitHub..."
    git fetch origin "$BRANCH"
    git reset --hard "origin/$BRANCH"
fi

# 3. Setup Backend Environment (.env)
echo "⚙️  [2/5] Configuring Backend Environment..."
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
API_URL=http://localhost:$BACKEND_PORT/api
EOF

# Ensure uploads directory exists
mkdir -p "$WEB_ROOT/backend/uploads"
chmod -R 775 "$WEB_ROOT/backend/uploads"

# 4. Import / Initialize MySQL Database
echo "🗄️  [3/5] Initializing MySQL Database Schema..."
if [ -f "$WEB_ROOT/backend/database/mysql_schema.sql" ]; then
    mysql -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASS" "$DB_NAME" < "$WEB_ROOT/backend/database/mysql_schema.sql" 2>/dev/null || {
        echo "ℹ️  Tables checked / already initialized."
    }
    echo "  ✅ Database schema ready."
fi

# 5. Install Dependencies (Frontend & Backend)
echo "📦 [4/5] Installing npm dependencies for Vite and Backend..."
npm install

cd "$WEB_ROOT/backend"
npm install
cd "$WEB_ROOT"

# Ensure PM2 is installed
if ! command -v pm2 &> /dev/null; then
    echo "Installing PM2 process manager..."
    npm install -g pm2
fi

# 6. Start Backend & Vite Server directly with PM2
echo "⚡ [5/5] Starting Backend & Vite Servers with PM2..."

# Backend
pm2 delete nijuze-backend 2>/dev/null || true
cd "$WEB_ROOT/backend"
pm2 start server.js --name "nijuze-backend"

# Vite Frontend
cd "$WEB_ROOT"
pm2 delete nijuze-vite 2>/dev/null || true
pm2 start npm --name "nijuze-vite" -- run dev

pm2 save

echo ""
echo "========================================================="
echo "  🎉 NIJUZE VITE SERVER RUNNING SUCCESSFULLY!"
echo "========================================================="
pm2 list
echo ""
echo "🌐 Vite App: http://127.0.0.1:$VITE_PORT"
echo "🌐 Backend:  http://127.0.0.1:$BACKEND_PORT"
echo "========================================================="

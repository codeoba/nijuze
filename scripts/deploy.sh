#!/bin/bash

# Nijuze Deployment Script
# Usage: ./deploy.sh [environment]
# Environments: staging, production

set -e

ENVIRONMENT=${1:-staging}
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

echo "🚀 Deploying Nijuze to $ENVIRONMENT..."
echo "Timestamp: $TIMESTAMP"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if required tools are installed
check_dependencies() {
    echo -e "${YELLOW}Checking dependencies...${NC}"
    
    if ! command -v node &> /dev/null; then
        echo -e "${RED}Node.js is not installed${NC}"
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        echo -e "${RED}npm is not installed${NC}"
        exit 1
    fi
    
    if ! command -v git &> /dev/null; then
        echo -e "${RED}Git is not installed${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✓ All dependencies installed${NC}"
}

# Build frontend
build_frontend() {
    echo -e "${YELLOW}Building frontend...${NC}"
    npm run build
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Frontend built successfully${NC}"
    else
        echo -e "${RED}✗ Frontend build failed${NC}"
        exit 1
    fi
}

# Deploy to Vercel
deploy_frontend() {
    echo -e "${YELLOW}Deploying frontend to Vercel...${NC}"
    
    if [ "$ENVIRONMENT" = "production" ]; then
        vercel --prod --yes
    else
        vercel --yes
    fi
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Frontend deployed successfully${NC}"
    else
        echo -e "${RED}✗ Frontend deployment failed${NC}"
        exit 1
    fi
}

# Deploy backend
deploy_backend() {
    echo -e "${YELLOW}Deploying backend...${NC}"
    
    # SSH to server and deploy
    ssh -i ~/.ssh/nijuze-key.pem ubuntu@api.nijuze.com << 'EOF'
        cd /var/www/nijuze
        git pull origin main
        cd backend
        npm install --production
        pm2 restart nijuze-backend
        pm2 save
EOF
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Backend deployed successfully${NC}"
    else
        echo -e "${RED}✗ Backend deployment failed${NC}"
        exit 1
    fi
}

# Run tests
run_tests() {
    echo -e "${YELLOW}Running tests...${NC}"
    npm test
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ All tests passed${NC}"
    else
        echo -e "${RED}✗ Tests failed${NC}"
        exit 1
    fi
}

# Create backup
create_backup() {
    echo -e "${YELLOW}Creating backup...${NC}"
    
    ssh -i ~/.ssh/nijuze-key.pem ubuntu@api.nijuze.com << EOF
        pg_dump -U nijuze_admin nijuze > /var/backups/nijuze_backup_$TIMESTAMP.sql
        echo "Backup created: nijuze_backup_$TIMESTAMP.sql"
EOF
    
    echo -e "${GREEN}✓ Backup created${NC}"
}

# Health check
health_check() {
    echo -e "${YELLOW}Running health check...${NC}"
    
    # Check frontend
    FRONTEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://nijuze.com)
    if [ "$FRONTEND_STATUS" = "200" ]; then
        echo -e "${GREEN}✓ Frontend is healthy${NC}"
    else
        echo -e "${RED}✗ Frontend health check failed (Status: $FRONTEND_STATUS)${NC}"
    fi
    
    # Check backend API
    API_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://api.nijuze.com/health)
    if [ "$API_STATUS" = "200" ]; then
        echo -e "${GREEN}✓ Backend API is healthy${NC}"
    else
        echo -e "${RED}✗ Backend API health check failed (Status: $API_STATUS)${NC}"
    fi
}

# Main deployment flow
main() {
    echo "================================"
    echo "  Nijuze Deployment Script"
    echo "  Environment: $ENVIRONMENT"
    echo "================================"
    echo ""
    
    check_dependencies
    
    if [ "$ENVIRONMENT" = "production" ]; then
        create_backup
        run_tests
    fi
    
    build_frontend
    deploy_frontend
    deploy_backend
    
    sleep 10  # Wait for deployment to propagate
    
    health_check
    
    echo ""
    echo "================================"
    echo -e "${GREEN}✓ Deployment completed successfully!${NC}"
    echo "================================"
    echo ""
    echo "Frontend: https://nijuze.com"
    echo "Backend API: https://api.nijuze.com"
    echo ""
}

# Run main function
main

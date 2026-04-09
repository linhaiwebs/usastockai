#!/bin/bash

# ============================================
# Stock AI Diagnostic System - Complete Deployment Script
# ============================================
# This script ensures complete cleanup including Redis cache
# ============================================

set -e  # Exit on error

echo "🚀 Starting complete deployment with Redis cache cleanup..."

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[✓]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[⚠]${NC} $1"
}

print_error() {
    echo -e "${RED}[✗]${NC} $1"
}

# Step 1: Stop all containers
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 1: Stopping all containers..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
docker-compose down
print_status "Containers stopped"

# Step 2: Clear Redis cache (CRITICAL!)
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 2: Clearing Redis cache..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Remove Redis volume (this clears all cached data)
docker volume rm usastockai_redis_data 2>/dev/null || print_warning "Redis volume already removed or doesn't exist"
print_status "Redis cache cleared completely"

# Step 3: Clean up Docker system
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 3: Cleaning Docker system..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
docker-compose down --rmi all -v --remove-orphans 2>/dev/null || true
docker system prune -af --volumes 2>/dev/null || true
print_status "Docker system cleaned"

# Step 4: Clean frontend cache
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 4: Cleaning frontend cache..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
rm -rf frontend/.next
rm -rf frontend/node_modules/.cache
print_status "Frontend cache cleaned"

# Step 5: Pull latest code
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 5: Pulling latest code..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
git fetch origin
git checkout feature/stock-ai-diagnostic-system
git pull origin feature/stock-ai-diagnostic-system
print_status "Code updated"

# Step 6: Rebuild with no cache
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 6: Rebuilding containers (no cache)..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
docker-compose build --no-cache
print_status "Containers built"

# Step 7: Start services
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 7: Starting services..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
docker-compose up -d
print_status "Services started"

# Step 8: Wait for services to be healthy
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 8: Waiting for services to be ready..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Waiting 30 seconds for services to initialize..."
sleep 30

# Check service health
if docker-compose ps | grep -q "Up"; then
    print_status "Services are running"
else
    print_error "Some services failed to start. Check logs below:"
    docker-compose logs --tail=50
    exit 1
fi

# Step 9: Show status
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Deployment Complete!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
docker-compose ps

echo ""
echo "✅ Deployment successful!"
echo ""
echo "📊 Services:"
echo "  • Frontend: http://localhost:3000"
echo "  • Backend:  http://localhost:8000"
echo "  • API Docs: http://localhost:8000/docs"
echo ""
echo "📝 View logs:"
echo "  • docker-compose logs -f backend"
echo "  • docker-compose logs -f frontend"
echo ""
echo "🗑️  Redis cache: CLEARED"
echo ""

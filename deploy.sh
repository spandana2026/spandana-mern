#!/bin/bash
# Spandana Care Aid Foundation — One-Command Deploy Script
# Run on your server: chmod +x deploy.sh && ./deploy.sh
# Requires: Node.js 18+, npm

set -e

echo "======================================"
echo "  Spandana — Production Build & Deploy"
echo "======================================"

# Check Node version
NODE_VERSION=$(node -v 2>/dev/null | cut -d'v' -f2 | cut -d'.' -f1)
if [ -z "$NODE_VERSION" ] || [ "$NODE_VERSION" -lt "18" ]; then
    echo "ERROR: Node.js 18 or higher required. Install from https://nodejs.org"
    exit 1
fi

# ── Step 1: Backend dependencies ──────────────────────────────────────────────
echo ""
echo "Step 1/4: Installing backend dependencies..."
cd backend
npm install --production
cd ..
echo "  Backend dependencies installed."

# ── Step 2: Check backend .env ────────────────────────────────────────────────
echo ""
echo "Step 2/4: Checking backend/.env..."
if [ ! -f "backend/.env" ]; then
    cp backend/.env.example backend/.env
    echo "  CREATED backend/.env from .env.example"
    echo "  IMPORTANT: Edit backend/.env and set ADMIN_PASSWORD and SESSION_SECRET before running!"
    echo "  Then re-run this script."
    exit 0
fi
echo "  backend/.env found."

# ── Step 3: Frontend build ────────────────────────────────────────────────────
echo ""
echo "Step 3/4: Building frontend..."

# Read VITE_API_URL from user or default to relative /api/v1
if [ -z "$VITE_API_URL" ]; then
    read -p "  Enter your API URL (e.g. https://spandana.org/api/v1) [default: /api/v1]: " VITE_API_URL
    VITE_API_URL=${VITE_API_URL:-/api/v1}
fi

cd frontend
npm install
VITE_API_URL="$VITE_API_URL" npm run build
cd ..

echo "  Frontend built to frontend/dist/"

# ── Step 4: Launch backend ────────────────────────────────────────────────────
echo ""
echo "Step 4/4: Starting backend..."

if command -v pm2 &> /dev/null; then
    pm2 start ecosystem.config.json --env production 2>/dev/null || pm2 restart spandana-api
    pm2 save
    echo "  Backend started with PM2."
    echo "  View logs: pm2 logs spandana-api"
else
    echo "  PM2 not found. Install it: npm install -g pm2"
    echo "  Then run: pm2 start ecosystem.config.json"
    echo ""
    echo "  Or run directly (not recommended for production):"
    echo "  cd backend && node server.js"
fi

echo ""
echo "======================================"
echo "  Deploy complete!"
echo "  Backend: http://localhost:5000"
echo "  Frontend: frontend/dist/ (serve with nginx or Apache)"
echo "  API docs: http://localhost:5000/api/v1/docs"
echo "======================================"

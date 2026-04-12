#!/bin/bash

# LPU RAG Assistant - Quick Start Script
# Production v2.0 - 2026

set -e

echo "================================================"
echo "🚀 LPU RAG Knowledge Assistant - Quick Start"
echo "================================================"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Check Python
echo -e "${BLUE}[1/5]${NC} Checking Python version..."
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}❌ Python 3 is not installed${NC}"
    exit 1
fi
PYTHON_VERSION=$(python3 --version | cut -d' ' -f2 | cut -d'.' -f1,2)
echo -e "${GREEN}✅ Python $PYTHON_VERSION found${NC}"

# Install dependencies
echo ""
echo -e "${BLUE}[2/5]${NC} Installing dependencies..."
pip install -q -r requirements.txt
echo -e "${GREEN}✅ Dependencies installed${NC}"

# Setup environment
echo ""
echo -e "${BLUE}[3/5]${NC} Setting up environment..."
if [ ! -f ".env" ]; then
    cp .env.production.example .env
    echo -e "${YELLOW}⚠️  Created .env file - Update with your Groq API key${NC}"
else
    echo -e "${GREEN}✅ .env file exists${NC}"
fi

# Initialize database
echo ""
echo -e "${BLUE}[4/5]${NC} Initializing authentication database..."
python3 << 'PYEOF'
from api.core.auth import init_db, get_user_by_email
init_db()
user = get_user_by_email('saragadathrinath@gmail.com')
print(f"✅ Admin user: {user.email}")
PYEOF

# Start backend
echo ""
echo -e "${BLUE}[5/5]${NC} Starting backend server..."
echo -e "${GREEN}✅ All checks passed!${NC}"
echo ""
echo "================================================"
echo "🎉 Ready to start"
echo "================================================"
echo ""
echo -e "Run this command to start the backend:"
echo -e "${BLUE}python -m uvicorn api.main:app --reload${NC}"
echo ""
echo -e "In another terminal, start the frontend:"
echo -e "${BLUE}cd frontend && npm install && npm run dev${NC}"
echo ""
echo -e "Then visit: ${BLUE}http://localhost:3000${NC}"
echo ""
echo "Demo Credentials:"
echo -e "  Email:    ${YELLOW}saragadathrinath@gmail.com${NC}"
echo -e "  Password: ${YELLOW}Sthrinath@1234${NC}"
echo ""
echo "================================================"

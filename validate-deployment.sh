#!/bin/bash

# Production Deployment Validation Script
# Validates backend and frontend configurations before deployment

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo "================================================"
echo "🔍 Production Deployment Validation"
echo "================================================"
echo ""

PASSED=0
FAILED=0

# Function to check item
check_item() {
    local name=$1
    local cmd=$2
    local expected=$3
    
    if eval "$cmd" &>/dev/null; then
        echo -e "${GREEN}✅${NC} $name"
        ((PASSED++))
    else
        echo -e "${RED}❌${NC} $name"
        ((FAILED++))
    fi
}

# Backend checks
echo -e "${BLUE}Backend Checks:${NC}"
check_item "Python 3.11+" "python3 --version | grep -qE '3\.(1[1-9]|[2-9][0-9])'"
check_item "FastAPI installed" "python3 -c 'import fastapi' 2>/dev/null"
check_item "Uvicorn installed" "python3 -c 'import uvicorn' 2>/dev/null"
check_item "ChromaDB installed" "python3 -c 'import chromadb' 2>/dev/null"
check_item "Auth dependencies" "python3 -c 'import jose; import passlib' 2>/dev/null"
check_item "requirements.txt exists" "test -f requirements.txt"
check_item "API config valid" "python3 -c 'from api.core.config import settings' 2>/dev/null"
check_item "Auth module valid" "python3 -c 'from api.core.auth import authenticate_user' 2>/dev/null"
check_item "RAG service valid" "python3 -c 'from api.services.rag_service import ask_rag' 2>/dev/null"
check_item "Main app valid" "python3 -c 'from api.main import app' 2>/dev/null"

echo ""
echo -e "${BLUE}Frontend Checks:${NC}"
check_item "Node.js 18+" "node --version | grep -qE 'v(1[8-9]|[2-9][0-9])'"
check_item "npm installed" "npm --version &>/dev/null"
check_item "package.json exists" "test -f frontend/package.json"
check_item "Next.js configured" "test -f frontend/next.config.ts"
check_item "TailwindCSS configured" "grep -q tailwindcss frontend/package.json"

echo ""
echo -e "${BLUE}Security Checks:${NC}"
check_item ".env file exists" "test -f .env"
check_item "SECRET_KEY defined" "grep -q '^SECRET_KEY=' .env"
check_item "GROQ_API_KEY defined" "grep -q '^GROQ_API_KEY=' .env"
check_item "Git ignores .env" "grep -q '.env' .gitignore"
check_item "Git ignores auth.db" "grep -q 'auth.db' .gitignore"

echo ""
echo -e "${BLUE}Docker Checks:${NC}"
check_item "Docker installed" "docker --version &>/dev/null"
check_item "Docker Compose installed" "docker-compose --version &>/dev/null"
check_item "Dockerfile exists" "test -f Dockerfile"
check_item "docker-compose.yml exists" "test -f docker-compose.yml"
check_item "Frontend Dockerfile exists" "test -f frontend/Dockerfile.frontend"

echo ""
echo -e "${BLUE}Documentation Checks:${NC}"
check_item "README exists" "test -f README.md"
check_item "DEPLOYMENT.md exists" "test -f DEPLOYMENT.md"
check_item "PRODUCTION_README.md exists" "test -f PRODUCTION_README.md"

echo ""
echo "================================================"
echo "📊 Results"
echo "================================================"
echo -e "${GREEN}Passed: $PASSED${NC}"
echo -e "${RED}Failed: $FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✨ All checks passed! Ready for deployment.${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Update .env with production values"
    echo "2. Run: docker-compose build"
    echo "3. Run: docker-compose up -d"
    echo ""
    exit 0
else
    echo -e "${RED}⚠️  $FAILED check(s) failed. Fix issues before deployment.${NC}"
    echo ""
    exit 1
fi

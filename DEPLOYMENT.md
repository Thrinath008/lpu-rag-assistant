# 🚀 LPU RAG Assistant - Production Deployment Guide

## Overview

This guide will help you deploy the LPU RAG Knowledge Assistant to production with full authentication, scalability, and security.

---

## 📋 Prerequisites

- **Docker** & **Docker Compose** (recommended)
- **Python 3.11+** (for local deployment)
- **Node.js 18+** (for frontend)
- **Groq API Key** (for LLaMA 3.1 8B model)
- **Linux/macOS Server** or cloud provider (AWS, GCP, DigitalOcean, Render, Railway, etc.)

---

## 🔑 Step 1: Environment Setup

### Create Production Environment File

```bash
cp .env.production.example .env.production
```

### Edit `.env.production`:

```env
# Security - Change these in production!
SECRET_KEY="your-min-32-char-secret-key-for-jwt-2026"
API_KEY="lpu-rag-api-production-key"
ADMIN_KEY="lpu-admin-production-key"

# API Configuration
GROQ_API_KEY="your-actual-groq-api-key"

# Deployment URLs
ALLOWED_HOSTS="yourdomain.com,www.yourdomain.com,api.yourdomain.com"
CORS_ORIGINS="https://yourdomain.com,https://www.yourdomain.com"

# Logging
LOG_LEVEL="INFO"
```

---

## 🐳 Step 2: Docker Deployment (Recommended)

### Build and Run with Docker Compose

```bash
# Build images
docker-compose build

# Start services
docker-compose up -d

# View logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Stop services
docker-compose down
```

### Verify Services

```bash
# Check backend health
curl http://localhost:8000/api/health

# Access frontend
open http://localhost:3000
```

---

## ☁️ Cloud Deployment Options

### Option 1: Render.com (Easiest)

#### Backend Deployment

1. **Create Web Service for Backend**
   - Connect GitHub repository
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `uvicorn api.main:app --host 0.0.0.0 --port 8000`
   - Environment Variables: Add from `.env.production`

2. **Create Web Service for Frontend**
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
   - Set `NEXT_PUBLIC_API_URL` to backend URL

#### Database

- SQLite auto-created at `./auth.db`
- For PostgreSQL: Update connection string in `config.py`

### Option 2: Railway.app

```bash
# Connect repository and Railway will auto-detect services
railway up
```

### Option 3: AWS ECS (Production-Grade)

1. Create ECR repositories for backend and frontend
2. Push Docker images:

```bash
aws ecr get-login-password | docker login --username AWS --password-stdin <account-id>.dkr.ecr.<region>.amazonaws.com

docker tag lpu-rag-backend <account-id>.dkr.ecr.<region>.amazonaws.com/lpu-rag-backend:latest
docker push <account-id>.dkr.ecr.<region>.amazonaws.com/lpu-rag-backend:latest

docker tag lpu-rag-frontend <account-id>.dkr.ecr.<region>.amazonaws.com/lpu-rag-frontend:latest
docker push <account-id>.dkr.ecr.<region>.amazonaws.com/lpu-rag-frontend:latest
```

3. Create ECS cluster and services
4. Use RDS for PostgreSQL (optional, upgrade from SQLite)

### Option 4: DigitalOcean App Platform

1. Create new App
2. Connect GitHub repository
3. Configure build and run settings
4. Deploy

---

## 🔐 Step 3: SSL/TLS Certificate

### Using Let's Encrypt with Nginx (VPS)

```bash
# Install Certbot
sudo apt-get install certbot python3-certbot-nginx

# Generate certificate
sudo certbot certonly --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal
sudo systemctl enable certbot.timer
```

### Cloud-Provided SSL

- **Render**: Automatic SSL certificate
- **Railway**: Automatic SSL certificate
- **AWS**: Use ACM for free certificates

---

## 🌐 Step 4: Nginx Reverse Proxy (Optional, for VPS)

Create `/etc/nginx/sites-available/lpu-rag`:

```nginx
upstream backend {
    server 127.0.0.1:8000;
}

upstream frontend {
    server 127.0.0.1:3000;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Frontend
    location / {
        proxy_pass http://frontend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Backend API
    location /api {
        proxy_pass http://backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 60s;
    }
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}
```

Enable and restart:

```bash
sudo ln -s /etc/nginx/sites-available/lpu-rag /etc/nginx/sites-enabled/
sudo systemctl restart nginx
```

---

## 📊 Step 5: Monitoring & Logging

### Docker Logs

```bash
# View all logs
docker-compose logs -f

# View specific service
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Health Checks

```bash
# Backend health
curl https://yourdomain.com/api/health

# Frontend status
curl https://yourdomain.com/
```

### Log Aggregation (Optional)

- **Datadog**: Add Datadog agent
- **ELK Stack**: Elasticsearch, Logstash, Kibana
- **Sentry**: Error tracking

---

## 👤 Admin Credentials

### Default Login

- **Email**: `saragadathrinath@gmail.com`
- **Password**: `Sthrinath@1234`

⚠️ **Change These Immediately!**

```python
# Update password via Python:
from api.core.auth import create_user

create_user("newemail@lpu.edu.in", "newstrongpassword123", is_admin=True)
```

---

## 📦 Database Upgrades

### From SQLite to PostgreSQL

1. **Create PostgreSQL Database**

```bash
createdb lpu_rag_production
```

2. **Update `api/core/config.py`**

```python
DATABASE_URL = "postgresql://user:password@localhost/lpu_rag_production"
```

3. **Install PostgreSQL adapter**

```bash
pip install psycopg2-binary sqlalchemy
```

4. **Migrate data** (if needed)

---

## 🚨 Security Checklist

- ✅ Changed default admin credentials
- ✅ Set strong SECRET_KEY (min 32 chars)
- ✅ Configured CORS to specific domains
- ✅ Enabled SSL/TLS certificates
- ✅ Set up environment variables (not hardcoded)
- ✅ Configured security headers (HSTS, X-Frame-Options, etc.)
- ✅ Enabled HTTPS redirection
- ✅ Rate limiting (optional via middleware)
- ✅ Input validation & sanitization
- ✅ Secrets not committed to git

---

## 🔄 CI/CD Pipeline (GitHub Actions)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Build Docker images
        run: docker-compose build
      
      - name: Push to registry
        env:
          REGISTRY: ghcr.io
          IMAGE_NAME: ${{ github.repository }}
        run: |
          docker tag lpu-rag-backend $REGISTRY/$IMAGE_NAME/backend:latest
          docker push $REGISTRY/$IMAGE_NAME/backend:latest
      
      - name: Deploy to Render
        env:
          RENDER_DEPLOY_HOOK: ${{ secrets.RENDER_DEPLOY_HOOK }}
        run: curl $RENDER_DEPLOY_HOOK
```

---

## 📈 Scaling Recommendations

### Horizontal Scaling

```yaml
# docker-compose.yml - Scale backends
services:
  backend-1:
    build: .
    ports: ["8001:8000"]
  
  backend-2:
    build: .
    ports: ["8002:8000"]
  
  backend-3:
    build: .
    ports: ["8003:8000"]
  
  nginx:
    image: nginx:latest
    ports: ["8000:80"]
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
```

### Caching Layer

Add Redis for caching:

```yaml
redis:
  image: redis:7-alpine
  ports: ["6379:6379"]
  volumes:
    - redis-data:/data

volumes:
  redis-data:
```

---

## 🐛 Troubleshooting

### Backend won't start

```bash
# Check logs
docker-compose logs backend

# Verify environment variables
docker-compose config

# Test locally
python -m uvicorn api.main:app --reload
```

### Frontend can't connect to backend

1. Check `NEXT_PUBLIC_API_URL` in frontend env
2. Verify CORS in backend settings
3. Check network/firewall rules

### High memory usage

- Reduce embedding batch size in `embed_and_store.py`
- Enable production mode: `uvicorn api.main:app --workers 4`

---

## 📞 Support & Resources

- **FastAPI Docs**: http://yourdomain.com/docs
- **Groq API**: https://console.groq.com
- **Docker Compose**: https://docs.docker.com/compose/
- **Render Docs**: https://render.com/docs

---

## 🎉 Next Steps

1. **Set up custom domain**
2. **Configure monitoring & alerts**
3. **Set up backup strategy**
4. **Test disaster recovery**
5. **Document operational procedures**
6. **Create team onboarding guide**

---

**Deployed with ❤️ by Thrinath, Shambhavi, Arshad - 2026**

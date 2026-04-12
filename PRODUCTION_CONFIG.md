# Production Configuration Guide

## 🔐 Security Configuration

### 1. Environment Variables

Create `.env` with strong values:

```bash
# CRITICAL: Generate a strong SECRET_KEY
# Linux/Mac: openssl rand -hex 32
# Python: import secrets; print(secrets.token_hex(32))

SECRET_KEY="your-256-bit-hex-string-here"
API_KEY="generate-a-random-api-key"
ADMIN_KEY="generate-a-random-admin-key"

# Groq API - Get from https://console.groq.com
GROQ_API_KEY="gsk_..."

# Deployment URLs
ALLOWED_HOSTS="yourdomain.com,api.yourdomain.com,www.yourdomain.com"
CORS_ORIGINS="https://yourdomain.com,https://www.yourdomain.com"

# Database
DATABASE_URL="sqlite:///./auth.db"
# OR for PostgreSQL:
# DATABASE_URL="postgresql://user:password@localhost:5432/lpu_rag"

# Logging
LOG_LEVEL="INFO"
```

### 2. Change Default Credentials

**IMMEDIATELY** change the default admin password:

```bash
python3 << 'EOF'
from api.core.auth import create_user

# Delete old user and create new one
# Or just create additional admin
create_user("your-email@company.com", "StrongPassword123!", is_admin=True)
print("✅ New admin user created")
EOF
```

### 3. Security Headers

Already configured in `api/main.py`:

```python
response.headers["X-Content-Type-Options"] = "nosniff"
response.headers["X-Frame-Options"] = "DENY"
response.headers["X-XSS-Protection"] = "1; mode=block"
response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
```

### 4. CORS Configuration

Set to specific domains only:

```env
CORS_ORIGINS="https://yourdomain.com,https://api.yourdomain.com"
```

NOT:
```env
CORS_ORIGINS="*"  # ❌ DANGEROUS
```

### 5. API Keys

For production, use environment variables:

```bash
# Backend
export SECRET_KEY=$(openssl rand -hex 32)
export API_KEY=$(python3 -c "import secrets; print(secrets.token_hex(16))")
export ADMIN_KEY=$(python3 -c "import secrets; print(secrets.token_hex(16))")
export GROQ_API_KEY="your-actual-groq-key"
```

---

## 🗄️ Database Configuration

### SQLite (Default - Single Server)

```env
DATABASE_URL="sqlite:///./auth.db"
```

Works for:
- Development
- Small deployments
- Single-server setup

Limitations:
- Not suitable for multi-process deployments
- Limited concurrent access

### PostgreSQL (Recommended - Production)

1. **Install PostgreSQL**

```bash
# macOS
brew install postgresql

# Ubuntu
sudo apt-get install postgresql

# Docker
docker run --name postgres -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgres
```

2. **Create Database**

```bash
createdb lpu_rag_production
```

3. **Update Configuration**

```env
DATABASE_URL="postgresql://user:password@localhost:5432/lpu_rag_production"
```

4. **Install Python Driver**

```bash
pip install psycopg2-binary sqlalchemy
```

---

## 🚀 Deployment Environments

### Local Development

```bash
# 1. Create .env
cp .env.production.example .env
# Edit .env with test values

# 2. Install dependencies
pip install -r requirements.txt

# 3. Start backend
python -m uvicorn api.main:app --reload

# 4. Start frontend
cd frontend && npm run dev
```

### Staging

```bash
# Use docker-compose with staging values
docker-compose -f docker-compose.yml up --build

# Verify
curl https://staging.yourdomain.com/api/health
```

### Production

```bash
# 1. Update .env with production values
# 2. Generate strong SECRET_KEY
# 3. Set production CORS origins
# 4. Configure HTTPS
# 5. Deploy

docker-compose up -d
```

---

## 📊 Monitoring Configuration

### Health Checks

```bash
# Backend health
curl https://yourdomain.com/api/health

# API stats
curl https://yourdomain.com/api/stats

# Auth test
curl -X POST https://yourdomain.com/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password"}'
```

### Logging

Configure in `api/core/logging.py`:

```python
# Set LOG_LEVEL
# DEBUG, INFO, WARNING, ERROR, CRITICAL

LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")
```

For production logging:

```bash
# Send logs to stdout (captured by container orchestration)
# Use ELK Stack, Datadog, or CloudWatch for aggregation
```

---

## 🔧 Performance Tuning

### Backend Workers

Update in deployment:

```bash
# Render
Start Command: uvicorn api.main:app --workers 4

# Docker
CMD ["uvicorn", "api.main:app", "--workers", "4", "--worker-class", "uvicorn.workers.UvicornWorker"]
```

### Frontend Optimization

```bash
# Build optimizations in next.config.ts
const nextConfig = {
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,
  swcMinify: true,
};
```

### Vector Database

ChromaDB settings in `api/services/rag_service.py`:

```python
# Increase TOP_K for more results (slower)
TOP_K = 5  # Default

# Batch size for embeddings
batch_size = 16  # Reduce if memory-constrained
```

---

## 🔄 Auto-scaling

### Horizontal Scaling

For multiple backend instances:

```yaml
# docker-compose.yml
version: '3.8'
services:
  backend:
    deploy:
      replicas: 3
      resources:
        limits:
          cpus: '0.5'
          memory: 512M
        reservations:
          cpus: '0.25'
          memory: 256M
```

### Load Balancing

Use Nginx to distribute traffic:

```nginx
upstream backend {
    server backend:8000;
    server backend:8001;
    server backend:8002;
}

server {
    location /api {
        proxy_pass http://backend;
    }
}
```

---

## 🆘 Troubleshooting

### Port Already in Use

```bash
# Find and kill process
lsof -i :8000
kill -9 <PID>

# Or use different port
uvicorn api.main:app --port 9000
```

### Database Connection Error

```bash
# Check database is running
pg_isready -h localhost -p 5432

# Check connection string
python3 -c "
import sqlalchemy
engine = sqlalchemy.create_engine('postgresql://...')
connection = engine.connect()
print('✅ Connected')
"
```

### Memory Issues

```bash
# Monitor memory
docker stats

# Reduce batch size for embeddings
# In embed_and_store.py: batch_size = 8
```

### Slow Retrieval

```bash
# Check ChromaDB is persisted
ls -lh embeddings/

# Verify index is loaded
python3 -c "
import chromadb
client = chromadb.PersistentClient(path='embeddings')
collection = client.get_collection('lpu_knowledge_base')
print(f'Vectors: {collection.count()}')
"
```

---

## 📈 Scaling to Production

### Phase 1: Foundation (Week 1)
- [ ] Set up PostgreSQL database
- [ ] Configure production environment variables
- [ ] Set up SSL/TLS certificates
- [ ] Deploy on single cloud instance

### Phase 2: High Availability (Week 2)
- [ ] Set up load balancer
- [ ] Deploy multiple backend instances
- [ ] Configure auto-scaling
- [ ] Set up monitoring

### Phase 3: Optimization (Week 3)
- [ ] Enable caching (Redis)
- [ ] Add CDN for frontend
- [ ] Optimize embeddings batch size
- [ ] Set up log aggregation

### Phase 4: Compliance (Week 4)
- [ ] Security audit
- [ ] Data backup strategy
- [ ] Disaster recovery plan
- [ ] Documentation

---

## 🔐 Production Checklist

Before going live:

- [ ] Changed default admin credentials
- [ ] Generated strong SECRET_KEY (32+ chars)
- [ ] Configured production CORS origins
- [ ] Enabled HTTPS/TLS
- [ ] Set up SSL certificate auto-renewal
- [ ] Configured database backups
- [ ] Set up monitoring & alerting
- [ ] Tested disaster recovery
- [ ] Documented operational procedures
- [ ] Security audit completed
- [ ] Load testing completed
- [ ] Set up rate limiting
- [ ] Configured request validation
- [ ] Set up error tracking (Sentry)
- [ ] Configured log aggregation

---

## 📞 Support

For production issues:
1. Check `/api/health` endpoint
2. Review logs in deployment console
3. Verify environment variables
4. Check database connectivity
5. Test API endpoints with curl

---

**Production Configuration Template v2.0 | 2026**

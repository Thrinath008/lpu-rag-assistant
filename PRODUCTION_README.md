# 🚀 LPU Knowledge Assistant v2.0 — Production Edition

![License](https://img.shields.io/badge/License-Proprietary-red)
![Status](https://img.shields.io/badge/Status-Production%20Ready-green)
![Python](https://img.shields.io/badge/Python-3.11%2B-blue)
![Node.js](https://img.shields.io/badge/Node.js-18%2B-green)

---

## ✨ What's New in v2.0

### 🔐 Authentication & Security
- ✅ **JWT Authentication** with bcrypt password hashing
- ✅ **Admin Dashboard** with authenticated access
- ✅ **Role-based Access Control** (Admin/User)
- ✅ **Secure API Endpoints** with bearer token validation
- ✅ **HTTPS-ready** with security headers

### 🎨 Premium UI/UX
- ✅ **Modern Dark Theme** with gradient accents
- ✅ **Responsive Design** (mobile/tablet/desktop)
- ✅ **Real-time Chat** with streaming responses
- ✅ **Admin Panel** for document management
- ✅ **Professional Login Page** with form validation

### 🏭 Production Ready
- ✅ **Docker & Docker Compose** for easy deployment
- ✅ **Environment-based Configuration**
- ✅ **Comprehensive Logging** and monitoring
- ✅ **Health Checks** and status endpoints
- ✅ **Error Handling** with detailed messages

### 📊 Knowledge Base
- ✅ **13 Official LPU Documents**
- ✅ **2,000+ Semantic Chunks**
- ✅ **Instant Vector Search**
- ✅ **Source Attribution** with relevance scores
- ✅ **Automatic Indexing** on document upload

---

## 🚀 Quick Start

### Local Development

```bash
# 1. Clone repository
git clone <repo-url>
cd lpu-rag-assistant

# 2. Install backend dependencies
pip install -r requirements.txt

# 3. Set environment variables
cp .env.example .env
# Edit .env with your Groq API key

# 4. Start backend
python -m uvicorn api.main:app --reload

# 5. In another terminal, start frontend
cd frontend
npm install
npm run dev

# 6. Open browser
open http://localhost:3000

# 7. Login with demo credentials
# Email: saragadathrinath@gmail.com
# Password: Sthrinath@1234
```

### Docker Deployment

```bash
# Build and run all services
docker-compose up --build

# Access application
# Frontend: http://localhost:3000
# Backend: http://localhost:8000
# API Docs: http://localhost:8000/docs
```

---

## 🔑 Default Admin Credentials

⚠️ **CHANGE THESE IMMEDIATELY IN PRODUCTION**

```
Email:    saragadathrinath@gmail.com
Password: Sthrinath@1234
```

---

## 📂 Project Structure

```
lpu-rag-assistant/
├── api/                          # FastAPI Backend
│   ├── core/
│   │   ├── auth.py              # JWT & Password handling
│   │   ├── config.py            # Settings management
│   │   └── logging.py           # Application logging
│   ├── routes/
│   │   ├── auth.py              # Login/logout endpoints
│   │   ├── chat.py              # Q&A endpoints
│   │   └── admin.py             # Document upload
│   ├── services/
│   │   ├── rag_service.py       # Retrieval & generation
│   │   └── pipeline_service.py  # Document processing
│   └── main.py                  # FastAPI app setup
│
├── frontend/                     # Next.js Frontend
│   ├── src/
│   │   ├── app/                 # Pages & layouts
│   │   ├── components/          # React components
│   │   ├── hooks/               # Custom hooks
│   │   ├── lib/                 # Utilities & API client
│   │   └── store/               # State management
│   └── package.json
│
├── scripts/                      # Data processing
│   ├── convert_docx_to_text.py
│   ├── chunk_documents.py
│   ├── embed_and_store.py
│   └── rag_query.py
│
├── embeddings/                   # Vector database (ChromaDB)
├── chunks/                       # Processed chunks
├── docs_clean/                   # Extracted text
├── docs_raw/                     # Original documents
├── requirements.txt              # Python dependencies
├── Dockerfile                    # Backend container
├── docker-compose.yml            # Multi-container setup
├── DEPLOYMENT.md                 # Deployment guide
└── README.md                     # This file
```

---

## 🔌 API Endpoints

### Authentication

```
POST /api/v1/auth/login
  - Email & password login
  - Returns JWT token

POST /api/v1/auth/logout
  - Logout (client discards token)

GET /api/v1/auth/me
  - Get current user info
```

### Chat

```
POST /api/v1/ask
  - Query: "What is the minimum attendance?"
  - Returns: Answer + sources + metadata

POST /api/v1/ask/stream
  - Streaming version for real-time responses
  - NDJSON format
```

### Admin

```
POST /api/v1/admin/upload
  - Upload .docx document
  - Automatic processing & indexing
  - Requires admin authentication
```

### Health

```
GET /api/health
  - System status & metadata

GET /api/stats
  - Knowledge base statistics
```

---

## 🔐 Authentication

### How It Works

1. User visits `/login` page
2. Enters email & password
3. Backend validates credentials (bcrypt)
4. Returns JWT token (24-hour expiry)
5. Frontend stores token in localStorage
6. Token included in API requests via `Authorization: Bearer <token>` header
7. Backend validates token on protected routes

### Protected Routes

- `/admin` - Admin dashboard
- `/api/v1/admin/upload` - Document upload
- `/api/v1/auth/me` - User info

---

## 🌐 Deployment

### Render.com (5 minutes)

1. Connect GitHub repository
2. Create two Web Services (backend + frontend)
3. Add environment variables
4. Deploy

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed guide.

### AWS/GCP/Azure

See [DEPLOYMENT.md](./DEPLOYMENT.md) for cloud-specific instructions.

---

## 🛠️ Configuration

### Environment Variables

```env
# Security
SECRET_KEY="min-32-char-secret-key"
API_KEY="api-authentication-key"
ADMIN_KEY="admin-authentication-key"

# LLM
GROQ_API_KEY="your-groq-api-key"

# Deployment
ALLOWED_HOSTS="localhost,127.0.0.1,yourdomain.com"
CORS_ORIGINS="http://localhost:3000,https://yourdomain.com"

# Frontend
NEXT_PUBLIC_API_URL="http://127.0.0.1:8000/api"
```

---

## 📊 Performance Metrics

| Metric | Value |
|--------|-------|
| Embedding Model | all-MiniLM-L6-v2 (384-dim) |
| Vector DB | ChromaDB (local, persistent) |
| LLM | LLaMA 3.1 8B (Groq API) |
| Retrieval Speed | ~100ms (local) |
| Generation Speed | ~2-5 seconds |
| Max Response Tokens | 1024 |
| Temperature | 0.2 (deterministic) |

---

## 🔄 Document Upload Process

1. Admin logs in
2. Navigates to `/admin`
3. Selects .docx file
4. Chooses category
5. Clicks "Upload"

**Backend Processing:**
1. Extract text from .docx
2. Split into semantic chunks
3. Generate embeddings
4. Store in ChromaDB
5. Make searchable immediately

---

## 🐛 Troubleshooting

### "Invalid credentials" on login

```bash
# Reset password
python -c "from api.core.auth import create_user; create_user('saragadathrinath@gmail.com', 'Sthrinath@1234', is_admin=True)"
```

### Backend won't start

```bash
# Check Python version
python --version  # Should be 3.11+

# Install dependencies
pip install -r requirements.txt

# Test import
python -c "import fastapi; print(fastapi.__version__)"
```

### Frontend can't connect

1. Verify `NEXT_PUBLIC_API_URL` in frontend env
2. Check backend is running: `curl http://localhost:8000/api/health`
3. Check CORS configuration in `api/main.py`

---

## 📚 Tech Stack

**Backend:**
- FastAPI (async web framework)
- Pydantic (data validation)
- SQLite/PostgreSQL (auth database)
- ChromaDB (vector store)
- sentence-transformers (embeddings)
- Groq API (LLaMA 3.1 8B)
- Python-jose (JWT tokens)
- Bcrypt (password hashing)

**Frontend:**
- Next.js 14 (React framework)
- TypeScript (type safety)
- TailwindCSS (styling)
- Zustand (state management)
- Axios (HTTP client)
- React Markdown (markdown rendering)

**Infrastructure:**
- Docker & Docker Compose
- Nginx (reverse proxy)
- Let's Encrypt (SSL/TLS)

---

## 📄 License

Proprietary - All rights reserved. © 2026 Thrinath

---

**Built with ❤️ for LPU Students | Production v2.0 | 2026**

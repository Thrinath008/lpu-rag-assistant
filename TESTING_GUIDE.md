# 🧪 Testing & Quality Assurance Guide

## Unit Tests

### Backend Auth Tests

```python
# tests/test_auth.py
import pytest
from api.core.auth import (
    authenticate_user,
    get_password_hash,
    verify_password,
    create_access_token,
    verify_token,
)

def test_password_hashing():
    password = "TestPassword123!"
    hashed = get_password_hash(password)
    assert verify_password(password, hashed)
    assert not verify_password("WrongPassword", hashed)

def test_authentication():
    user = authenticate_user("saragadathrinath@gmail.com", "Sthrinath@1234")
    assert user is not None
    assert user.email == "saragadathrinath@gmail.com"
    assert user.is_admin == True

def test_authentication_failure():
    user = authenticate_user("saragadathrinath@gmail.com", "WrongPassword")
    assert user is None

def test_jwt_token():
    token = create_access_token({"sub": "test@example.com"})
    payload = verify_token(token)
    assert payload is not None
    assert payload["email"] == "test@example.com"

def test_invalid_token():
    payload = verify_token("invalid.token.here")
    assert payload is None
```

### Backend RAG Tests

```python
# tests/test_rag.py
import pytest
from api.services.rag_service import retrieve_chunks, build_context, ask_rag

def test_retrieve_chunks():
    chunks = retrieve_chunks("What is attendance policy?", top_k=3)
    assert len(chunks) > 0
    assert all("text" in c for c in chunks)
    assert all("score" in c for c in chunks)
    assert all(0 <= c["score"] <= 1 for c in chunks)

def test_build_context():
    chunks = [
        {
            "text": "Sample policy text",
            "source_file": "policy.docx",
            "category": "academics",
            "chunk_index": 0,
            "score": 0.95
        }
    ]
    context = build_context(chunks)
    assert "Sample policy text" in context
    assert "policy.docx" in context
```

## Integration Tests

### API Endpoint Tests

```python
# tests/test_api.py
import pytest
from fastapi.testclient import TestClient
from api.main import app

client = TestClient(app)

def test_health_endpoint():
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_login_success():
    response = client.post("/api/v1/auth/login", json={
        "email": "saragadathrinath@gmail.com",
        "password": "Sthrinath@1234"
    })
    assert response.status_code == 200
    assert "access_token" in response.json()

def test_login_failure():
    response = client.post("/api/v1/auth/login", json={
        "email": "saragadathrinath@gmail.com",
        "password": "WrongPassword"
    })
    assert response.status_code == 401

def test_ask_endpoint():
    response = client.post("/api/v1/ask", json={
        "query": "What is the minimum attendance?"
    }, headers={"x-api-key": "lpu-rag-dev-key"})
    assert response.status_code == 200
    assert "answer" in response.json()
    assert "sources" in response.json()
```

## E2E Tests

### Frontend Tests with Playwright

```python
# tests/e2e_test.py
from playwright.sync_api import sync_playwright

def test_login_flow():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        
        # Navigate to login
        page.goto("http://localhost:3000/login")
        
        # Fill form
        page.fill('input[type="email"]', "saragadathrinath@gmail.com")
        page.fill('input[type="password"]', "Sthrinath@1234")
        
        # Submit
        page.click('button[type="submit"]')
        
        # Wait for redirect
        page.wait_for_url("**/admin")
        assert "admin" in page.url
        
        browser.close()

def test_chat_flow():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        
        # Navigate to chat
        page.goto("http://localhost:3000")
        
        # Send message
        page.fill('textarea[placeholder*="Ask"]', "What is attendance policy?")
        page.click('button[type="submit"]')
        
        # Wait for response
        page.wait_for_selector('.prose')
        
        # Verify response
        content = page.text_content('.prose')
        assert len(content) > 0
        
        browser.close()
```

## Performance Tests

### Load Testing with Locust

```python
# tests/load_test.py
from locust import HttpUser, task, between

class ChatUser(HttpUser):
    wait_time = between(1, 3)
    
    @task(3)
    def ask_question(self):
        headers = {"x-api-key": "lpu-rag-dev-key"}
        self.client.post("/api/v1/ask", json={
            "query": "What is the minimum attendance?"
        }, headers=headers)
    
    @task(1)
    def health_check(self):
        self.client.get("/api/health")

# Run with:
# locust -f tests/load_test.py -H http://localhost:8000
```

### Load Test Results

Expected performance:
- **Latency**: 2-5 seconds (with Groq API)
- **Throughput**: 10-20 requests/second per instance
- **Error Rate**: < 1%

## Manual Testing Checklist

### Authentication
- [ ] Login with correct credentials succeeds
- [ ] Login with wrong password fails
- [ ] Invalid email shows error
- [ ] Token is stored in localStorage
- [ ] Token included in API requests
- [ ] Token expiry handled (24 hours)
- [ ] Logout clears token
- [ ] Invalid token rejected

### Chat Interface
- [ ] Message sends successfully
- [ ] Bot response appears
- [ ] Sources are displayed
- [ ] Relevance scores shown
- [ ] Streaming works (if enabled)
- [ ] Error messages displayed
- [ ] Empty query rejected
- [ ] Long messages handled

### Admin Panel
- [ ] Protected route requires login
- [ ] Redirect to login if not authenticated
- [ ] File upload works
- [ ] Category selection works
- [ ] Upload validation (only .docx)
- [ ] Success message shown
- [ ] Recent uploads displayed
- [ ] Stats are accurate

### API Endpoints
- [ ] GET /api/health returns 200
- [ ] GET /api/stats returns 200
- [ ] POST /api/v1/auth/login works
- [ ] POST /api/v1/ask works
- [ ] POST /api/v1/admin/upload requires auth
- [ ] Invalid API key rejected
- [ ] CORS headers present

## Debugging Tools

### Backend Debugging

```bash
# View logs
docker-compose logs -f backend

# Test endpoint
curl -X POST http://localhost:8000/api/v1/ask \
  -H "Content-Type: application/json" \
  -H "x-api-key: lpu-rag-dev-key" \
  -d '{"query":"What is attendance?"}'

# Interactive shell
docker-compose exec backend python

# Check database
sqlite3 auth.db "SELECT * FROM users;"
```

### Frontend Debugging

```bash
# View logs
docker-compose logs -f frontend

# Browser dev tools
# Open http://localhost:3000
# Press F12 for Developer Tools
# Check Console for errors
# Check Network tab for API calls

# Test API directly
fetch('http://localhost:8000/api/health')
  .then(r => r.json())
  .then(d => console.log(d))
```

## Continuous Integration

### GitHub Actions Example

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
    
    steps:
      - uses: actions/checkout@v2
      
      - name: Set up Python
        uses: actions/setup-python@v2
        with:
          python-version: 3.11
      
      - name: Install dependencies
        run: |
          pip install -r requirements.txt
          pip install pytest pytest-cov
      
      - name: Run tests
        run: pytest tests/ --cov=api --cov-report=xml
      
      - name: Upload coverage
        uses: codecov/codecov-action@v2
```

## Quality Metrics

### Code Coverage Target

- Backend: > 80%
- Frontend: > 70%
- Critical paths: > 95%

### Performance Targets

- Page load: < 2s
- Chat response: < 5s
- API response: < 100ms
- Uptime: > 99.5%

## Testing Commands

```bash
# Run all tests
pytest tests/ -v

# Run specific test
pytest tests/test_auth.py::test_authentication

# With coverage
pytest tests/ --cov=api --cov-report=html

# Frontend tests
cd frontend && npm run test

# E2E tests
playwright test

# Load tests
locust -f tests/load_test.py
```

---

**Quality Assurance Guide v2.0 | 2026**

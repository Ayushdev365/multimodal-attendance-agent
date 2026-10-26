# Local Development Guide

## Prerequisites

- **Python**: 3.11+
- **Node.js**: 18+ or 20+
- **npm**: 9+
- **Git**: 2.30+

---

## 1. Local Setup Workflow (macOS / Linux / Windows)

### Step A: Clone Repository
```bash
git clone <YOUR_REPO_URL>
cd multimodal-attendance-agent
```

### Step B: Backend Initialization
```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate    # On Windows: .venv\Scripts\activate
python -m pip install --upgrade pip
pip install -r requirements.txt
python -m app.seed_demo      # Initialize database with clean demo dataset
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```
Backend API will be accessible at: `http://127.0.0.1:8000`  
Interactive Swagger docs: `http://127.0.0.1:8000/docs`

### Step C: Frontend Initialization
Open a second terminal window:
```bash
cd frontend   # Or repository root in monorepo layout
npm install
npm run dev
```
Frontend development server will open at: `http://localhost:5173` (or `http://localhost:3000`)

---

## 2. Running Automated Tests

### Backend Test Suite
```bash
cd backend
source .venv/bin/activate
pytest -v
```

### Frontend Typecheck & Build
```bash
npm run lint
npm run build
```

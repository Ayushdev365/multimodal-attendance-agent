# Multimodal Attendance & Engagement Agent

A production-grade, privacy-first classroom intelligence application combining real-time computer vision presence tracking, local acoustic voice activity detection (VAD), instructor-assisted attendance verification, and evidence-based pedagogical recommendations.

---

## 1. Project Overview

The **Multimodal Attendance & Engagement Agent** automates classroom attendance logging without resorting to invasive biometric surveillance. By evaluating continuous, sustained presence thresholds ($t_{\text{present}} \ge 60\text{s}$) via local face/person detection models and tracking acoustic speech-to-silence ratios, it empowers educators with objective session analytics, auditable CSV accreditation records, and real-time pedagogical assistance.

---

## 2. Key Features

- **Automated Sustained-Presence Tracking**: Computes first-seen, last-seen, and cumulative duration; prevents momentary detections from triggering false presence.
- **Privacy-First Identity Verification**: Anonymous participant tracking codes (`TRK-01`) bound to enrolled students (`PAR-101`) through instructor authorization. Zero biometric facial vectors stored.
- **Acoustic Speech & VAD Analytics**: Local root-mean-square energy processing detects speech intervals, instructor monologue proportions, and peer collaborative windows.
- **Deterministic AI Teaching Assistant**: Rule-based pedagogical recommendations triggered by statistical session thresholds with transparent evidence, confidence scores, and limitations.
- **Institutional Accreditation Export**: Standardized CSV exports with date filtering, manual override audit flags, and FERPA-compliant pseudonymization.
- **100% Offline-First Architecture**: Runs entirely on local hardware with zero external cloud video transfers or required API keys.

---

## 3. Technology Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, Recharts, Lucide React.
- **Backend**: Python 3.11, FastAPI, Pydantic v2, SQLAlchemy 2.0, Alembic, Uvicorn.
- **Computer Vision**: OpenCV (Haar Cascades / HOG) & MediaPipe face detection.
- **Audio Processing**: Local Root-Mean-Square (RMS) sub-frame Voice Activity Detection with NumPy.
- **Database**: SQLite (default local zero-configuration) / PostgreSQL compatible via SQLAlchemy.

---

## 4. Architecture Overview

```
┌────────────────────────────────────────────────────────┐
│                   Instructor Dashboard                 │
│               (React 19 + TypeScript + Vite)           │
│  - Live Classroom Video/Canvas Overlay                 │
│  - Sustained Presence Countdown & Unverified Queue     │
│  - Engagement Analytics (Recharts Time-Series)         │
│  - Pedagogical Teaching Assistant Cards                │
└──────────────────────────┬─────────────────────────────┘
                           │
                 HTTP REST API (/api/v1/*)
                           │
┌──────────────────────────▼─────────────────────────────┐
│                 FastAPI Application Engine             │
│  ┌───────────────────────┬──────────────────────────┐  │
│  │ Vision Pipeline       │ Audio Pipeline           │  │
│  │ • OpenCV Detector     │ • Acoustic Energy VAD    │  │
│  │ • Centroid Tracker    │ • Speech/Silence Ratio   │  │
│  │ • Sustained Threshold │ • Turn-Taking Detection  │  │
│  └───────────────────────┴──────────────────────────┘  │
│  ┌───────────────────────┬──────────────────────────┐  │
│  │ Recommendation Engine │ Audit & Compliance       │  │
│  │ • Monologue Detection │ • Immutable Event Log    │  │
│  │ • Evidence Cards      │ • CSV Export Engine      │  │
│  └───────────────────────┴──────────────────────────┘  │
└──────────────────────────┬─────────────────────────────┘
                           │
┌──────────────────────────▼─────────────────────────────┐
│                   Persistence Layer                    │
│      SQLAlchemy ORM + SQLite (Configurable PostgreSQL) │
└────────────────────────────────────────────────────────┘
```

---

## 5. Repository Structure

```
multimodal-attendance-agent/
├── frontend/ (and root dev server)
│   ├── src/
│   │   ├── components/       # Reusable UI controls (Navbar, etc.)
│   │   ├── pages/            # 9 classroom intelligence views
│   │   ├── services/         # Typed REST API client
│   │   ├── types/            # TypeScript domain models
│   │   ├── App.tsx           # Application orchestrator
│   │   └── main.tsx          # Client entrypoint
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
├── backend/
│   ├── app/
│   │   ├── api/v1/           # Versioned REST API endpoints
│   │   ├── core/             # Configuration & environment settings
│   │   ├── db/               # SQLAlchemy engine & sessionmaker
│   │   ├── models/           # Database tables
│   │   ├── schemas/          # Pydantic validation models
│   │   ├── vision/           # Face/person detector & centroid tracker
│   │   ├── audio/            # Local energy-based VAD processor
│   │   ├── analytics/        # Time-series statistical engine
│   │   ├── recommendations/  # Deterministic pedagogical rule engine
│   │   ├── seed_demo.py      # Explicit demo dataset seeder
│   │   └── main.py           # FastAPI entrypoint
│   ├── tests/                # Automated pytest suite
│   ├── requirements.txt      # Pinned Python dependencies
│   ├── pyproject.toml        # Ruff & project configuration
│   └── alembic.ini           # Migration configuration
├── models/
│   └── README.md             # Model weights acquisition guide
├── scripts/
│   ├── init_db.py            # Standalone schema initializer
│   └── seed_demo.py          # Demo dataset runner
├── docs/
│   ├── ARCHITECTURE.md
│   ├── API.md
│   ├── PRIVACY.md
│   ├── DEVELOPMENT.md
│   └── TROUBLESHOOTING.md
├── .github/
│   └── workflows/
│       └── ci.yml            # Automated CI pipeline
├── .gitignore
├── .env.example
├── LICENSE                   # Apache 2.0
├── CONTRIBUTING.md
├── SECURITY.md
└── README.md
```

---

## 6. System Requirements

- **Operating System**: macOS 12+, Ubuntu 22.04+, or Windows 10/11.
- **Python**: 3.11.x
- **Node.js**: 18.x or 20.x
- **Memory**: Minimum 4GB RAM (8GB recommended for live video feeds).
- **Hardware**: Standard webcam or USB camera (optional; simulated feed included).

---

## 7. Installation Instructions (macOS)

```bash
# 1. Clone repository
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd multimodal-attendance-agent

# 2. Setup backend virtual environment
cd backend
python3 -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
pip install -r requirements.txt

# 3. Initialize database with demo data
python -m app.seed_demo
```

---

## 8. Installation Instructions (Windows & Linux)

### Linux (Ubuntu / Debian)
```bash
sudo apt update && sudo apt install -y python3-venv python3-pip nodejs npm
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python -m app.seed_demo
```

### Windows (PowerShell)
```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python -m app.seed_demo
```

---

## 9. Environment Configuration

Copy the sample environment file:
```bash
cp .env.example .env
```
Default non-secret values:
```env
APP_ENV=development
HOST=127.0.0.1
PORT=8000
DATABASE_URL=sqlite:///./data/attendance.db
FRONTEND_ORIGIN=http://localhost:5173
LOG_LEVEL=INFO
MODEL_DIR=./models
ENABLE_AUDIO_PROCESSING=true
ENABLE_BIOMETRIC_IDENTIFICATION=false
DEFAULT_PRESENCE_THRESHOLD_SECONDS=60
```

---

## 10. Database Initialization

Run the explicit initialization script:
```bash
python scripts/init_db.py
```
Or seed with representative demonstration classrooms and students:
```bash
python scripts/seed_demo.py
```

---

## 11. Backend Startup

In your first terminal:
```bash
cd backend
source .venv/bin/activate
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```
- API Server: `http://127.0.0.1:8000`
- Interactive OpenAPI Docs: `http://127.0.0.1:8000/docs`

---

## 12. Frontend Startup

In a second terminal:
```bash
npm install
npm run dev
```
Open your browser to `http://localhost:3000` (or `http://localhost:5173`).

---

## 13. Model Installation & Offline Readiness

OpenCV Haar Cascades are bundled directly with `opencv-python-headless`.
For hermetic offline environments without network access, see `models/README.md`.

---

## 14. Camera & Media Processing

1. In the **Live Classroom** page, click **Connect Local Camera** to grant WebRTC webcam access.
2. If camera access is denied or unavailable, the agent activates the high-fidelity **synthetic classroom feed**, ensuring detection bounding boxes, tracking ID counters, and sustained presence logic remain fully testable.
3. Sustained presence threshold is configurable via the header dropdown (30s, 60s, 120s, 300s).

---

## 15. Testing & Code Quality

### Run Backend Tests (pytest)
```bash
cd backend
source .venv/bin/activate
pytest -v
```

### Run Python Linting (Ruff)
```bash
ruff check backend/app backend/tests
```

### Run Frontend Typecheck, Integration Tests & Build
```bash
npm run lint
npm test
npm run build
```

---

## 16. GitHub Upload & Push Instructions

Push the project to a new empty GitHub repository:

```bash
# 1. Inspect repository status
git status

# 2. Stage verified source code
git add .

# 3. Confirm that no secret files or local databases are staged
git status
git diff --cached --check

# 4. Commit initial release
git commit -m "Initial commit: Multimodal Attendance & Engagement Agent"

# 5. Set branch and push to your remote GitHub repository
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/multimodal-attendance-agent.git
git push -u origin main
```

---

## 17. Known Limitations

- **Head-Orientation**: Optical head-pose estimation is an approximation and can be influenced by lighting or camera angles.
- **Acoustic Disambiguation**: Single-channel microphones approximate instructor speaking proportion via energy dynamics; directional beamforming requires multi-microphone arrays.
- **Field of View**: Presence detection is constrained to students seated within camera range.

---

## 18. Privacy & Ethics Considerations

- **Attention is Not Measured**: The system strictly refrains from claiming it measures internal cognitive focus, comprehension, or emotion.
- **Zero Facial Recognition**: Identification is performed via participant codes (`PAR-101`) with instructor verification.
- **No Video Persistence**: Media streams are discarded in volatile memory.

---

## 19. Troubleshooting

Refer to `docs/TROUBLESHOOTING.md` for camera permission errors, OpenCV headless installations, and database unlocking steps.

---

## 20. Future Roadmap

- Multi-camera classroom stitching for large lecture halls.
- Distributed BLE / NFC badge correlation fallback.
- Advanced acoustic turn-taking diarization with localized multi-channel microphones.

# Architecture & Systems Design

The **Multimodal Attendance & Engagement Agent** is architected for local, privacy-first classroom intelligence.

## 1. System Topology

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

## 2. Computer Vision Presence Pipeline

1. **Frame Capture**: Ingests video from local USB/WebRTC camera or uploaded video file.
2. **Face/Person Detection**: Bounding boxes detected per frame using OpenCV Haar Cascades or MediaPipe BlazeFace.
3. **Centroid Tracking**: Matches bounding box centroids across frames using Euclidean distance minimization.
4. **Sustained Presence Window**: Tracks continuous duration $t_{\text{present}}$. Once $t_{\text{present}} \ge \text{threshold}$ (default: 60s), the participant is marked as observed.
5. **Instructor Authorization Gate**: Unknown faces are tracked as unverified tags (`TRK-01`). The instructor binds or verifies them to enrolled participant codes (`PAR-101`), preventing automated facial misidentification.

## 3. Audio Activity Pipeline

1. **PCM Sampling**: Captures mono 16kHz audio stream from local microphone.
2. **Sub-Frame Energy Calculation**: Evaluates Root-Mean-Square (RMS) amplitude against calibrated ambient noise floor.
3. **Speech-to-Silence Windowing**: Aggregates speech burst ratios over rolling 5-minute intervals.
4. **Front-Zone Separation**: Estimates instructor versus student voice activity through acoustic energy dynamics.

## 4. Teaching Recommendation Rules Engine

- **Monologue Pacing**: Flags instructor speech ratio $>80\%$ and movement index $<0.30$ lasting $>10$ minutes.
- **Collaborative Windows**: Identifies peer discussion periods ($>60\%$ distributed acoustic speech).
- **Attendance Anomalies**: Detects abrupt drops in visible participants ($>30\%$ drop across consecutive windows).

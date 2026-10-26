# Troubleshooting & FAQ

## 1. Camera Access Issues

- **Symptom**: "Camera notice: Camera hardware access is not supported in this browser window."
- **Resolution**:
  1. Verify browser camera permissions in site settings.
  2. For localhost testing, ensure the origin is `http://localhost` or `https://` (WebRTC requires a secure context).
  3. If operating in a sandboxed iframe without device passthrough, the app automatically activates the high-fidelity simulated classroom stream so computer vision tracking remains testable.

## 2. OpenCV Headless vs GUI
- **Issue**: `libGL.so.1: cannot open shared object file` on Linux servers.
- **Resolution**: We pin `opencv-python-headless` in `requirements.txt` to eliminate external X11/OpenGL dependencies in CI and server containers.

## 3. Database Migration / Locking
- **Issue**: SQLite `database is locked`.
- **Resolution**: The SQLite connection string uses `connect_args={"check_same_thread": False}`. For high-throughput institutional deployments, configure `DATABASE_URL=postgresql://user:pass@host/db` in `.env`.

## 4. Resetting Database to Default Demo
- In the UI: Navigate to **Privacy & Audit** and click **Reset Local Database**.
- From terminal:
  ```bash
  rm data/attendance.db data/db.json
  python -m app.seed_demo
  ```

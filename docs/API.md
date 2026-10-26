# REST API Specification (v1)

Base URL: `/api/v1`

## Health & System
- `GET /health` - System health, offline status, and timestamp.
- `GET /api/v1/system/capabilities` - Returns installed detection models, VAD status, and versions.

## Classrooms
- `GET /api/v1/classrooms` - List all lecture halls and classrooms.
- `POST /api/v1/classrooms` - Create a new classroom.
  - Body: `{"name": string, "code": string, "room_number": string, "capacity": number}`

## Participants
- `GET /api/v1/participants?classroom_id={id}` - List enrolled participants.
- `POST /api/v1/participants` - Enroll a participant.
  - Body: `{"classroom_id": string, "code": string, "name": string, "email": string}`

## Sessions
- `GET /api/v1/sessions?classroom_id={id}` - List sessions.
- `POST /api/v1/sessions` - Schedule a session.
  - Body: `{"classroom_id": string, "title": string, "presence_threshold_seconds": number}`
- `POST /api/v1/sessions/{id}/start` - Begin live camera monitoring.
- `POST /api/v1/sessions/{id}/end` - Finalize and archive session.

## Attendance & Tracking
- `GET /api/v1/sessions/{id}/attendance` - Retrieve attendance records.
- `PATCH /api/v1/attendance/{id}` - Update status or instructor verification.
  - Body: `{"status": "present"|"late"|"absent"|"unverified", "verified_by_instructor": boolean, "notes": string}`
- `POST /api/v1/sessions/{id}/detections` - Ingest vision detection heartbeat.

## Metrics & Recommendations
- `GET /api/v1/sessions/{id}/metrics` - Retrieve time-series visibility & audio metrics.
- `GET /api/v1/sessions/{id}/recommendations` - Retrieve teaching assistant recommendations.
- `POST /api/v1/sessions/{id}/recommendations/recalculate` - Force recalculation of rules.

## Reports & Compliance
- `GET /api/v1/reports/attendance.csv?session_id={id}` - Download CSV accreditation export.
- `GET /api/v1/audit-events` - Immutable security and manual override log.

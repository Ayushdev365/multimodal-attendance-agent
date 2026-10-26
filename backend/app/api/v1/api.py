import io
import csv
import uuid
import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, Response
from sqlalchemy.orm import Session as DBSession

from app.db.session import get_db
from app.models import (
    Classroom,
    Participant,
    Session,
    AttendanceRecord,
    SessionMetric,
    Recommendation,
    ProcessingJob,
    AuditEvent,
)
from app.schemas import (
    ClassroomCreate,
    ClassroomResponse,
    ParticipantCreate,
    ParticipantResponse,
    SessionCreate,
    SessionResponse,
    AttendanceUpdate,
    AttendanceResponse,
    DetectionIngest,
    SessionMetricResponse,
    RecommendationResponse,
)
from app.recommendations.rules import RecommendationEngine

router = APIRouter()

# System Capabilities
@router.get("/system/capabilities")
def get_capabilities():
    return {
        "vision_enabled": True,
        "audio_vad_enabled": True,
        "offline_ready": True,
        "models": [
            {"name": "OpenCV Haar/HOG Person Detector", "type": "person_detector", "status": "ready", "license": "Apache 2.0"},
            {"name": "MediaPipe Face Landmark Model", "type": "face_landmark", "status": "ready", "license": "Apache 2.0"},
            {"name": "Energy-Based Acoustic VAD", "type": "vad", "status": "ready", "license": "MIT"},
        ],
        "version": "1.0.0",
    }

# Classrooms
@router.get("/classrooms", response_model=List[ClassroomResponse])
def get_classrooms(db: DBSession = Depends(get_db)):
    return db.query(Classroom).order_by(Classroom.created_at.desc()).all()

@router.post("/classrooms", response_model=ClassroomResponse, status_code=201)
def create_classroom(payload: ClassroomCreate, db: DBSession = Depends(get_db)):
    existing = db.query(Classroom).filter(Classroom.code == payload.code).first()
    if existing:
        raise HTTPException(status_code=400, detail="Classroom with this code already exists")

    classroom = Classroom(
        id=f"cls-{uuid.uuid4().hex[:8]}",
        name=payload.name,
        code=payload.code,
        room_number=payload.room_number or "TBD",
        capacity=payload.capacity or 30,
        description=payload.description or "",
        created_at=datetime.datetime.utcnow(),
    )
    db.add(classroom)

    audit = AuditEvent(
        id=f"aud-{uuid.uuid4().hex[:8]}",
        action="CLASSROOM_CREATED",
        actor="Instructor",
        target_type="Classroom",
        target_id=classroom.id,
        details=f"Created classroom {classroom.name} ({classroom.code})",
        timestamp=datetime.datetime.utcnow(),
    )
    db.add(audit)
    db.commit()
    db.refresh(classroom)
    return classroom

# Participants
@router.get("/participants", response_model=List[ParticipantResponse])
def get_participants(classroom_id: Optional[str] = None, db: DBSession = Depends(get_db)):
    query = db.query(Participant)
    if classroom_id:
        query = query.filter(Participant.classroom_id == classroom_id)
    return query.order_by(Participant.code.asc()).all()

@router.post("/participants", response_model=ParticipantResponse, status_code=201)
def create_participant(payload: ParticipantCreate, db: DBSession = Depends(get_db)):
    participant = Participant(
        id=f"par-{uuid.uuid4().hex[:8]}",
        classroom_id=payload.classroom_id,
        code=payload.code,
        name=payload.name,
        email=payload.email or "",
        status="active",
        enrolled_at=datetime.datetime.utcnow(),
    )
    db.add(participant)

    audit = AuditEvent(
        id=f"aud-{uuid.uuid4().hex[:8]}",
        action="PARTICIPANT_ENROLLED",
        actor="Instructor",
        target_type="Participant",
        target_id=participant.id,
        details=f"Enrolled participant {participant.name} [{participant.code}]",
        timestamp=datetime.datetime.utcnow(),
    )
    db.add(audit)
    db.commit()
    db.refresh(participant)
    return participant

# Sessions
@router.get("/sessions", response_model=List[SessionResponse])
def get_sessions(classroom_id: Optional[str] = None, db: DBSession = Depends(get_db)):
    query = db.query(Session)
    if classroom_id:
        query = query.filter(Session.classroom_id == classroom_id)
    return query.order_by(Session.created_at.desc()).all()

@router.post("/sessions", response_model=SessionResponse, status_code=201)
def create_session(payload: SessionCreate, db: DBSession = Depends(get_db)):
    session = Session(
        id=f"ses-{uuid.uuid4().hex[:8]}",
        classroom_id=payload.classroom_id,
        title=payload.title,
        status="scheduled",
        start_time=datetime.datetime.utcnow(),
        presence_threshold_seconds=payload.presence_threshold_seconds or 60,
        active_participants_count=0,
        created_at=datetime.datetime.utcnow(),
    )
    db.add(session)
    db.commit()
    db.refresh(session)
    return session

@router.post("/sessions/{session_id}/start", response_model=SessionResponse)
def start_session(session_id: str, db: DBSession = Depends(get_db)):
    session = db.query(Session).filter(Session.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    session.status = "active"
    session.start_time = datetime.datetime.utcnow()
    db.commit()
    db.refresh(session)
    return session

@router.post("/sessions/{session_id}/end", response_model=SessionResponse)
def end_session(session_id: str, db: DBSession = Depends(get_db)):
    session = db.query(Session).filter(Session.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    session.status = "completed"
    session.end_time = datetime.datetime.utcnow()
    db.commit()
    db.refresh(session)
    return session

# Attendance
@router.get("/sessions/{session_id}/attendance", response_model=List[AttendanceResponse])
def get_session_attendance(session_id: str, db: DBSession = Depends(get_db)):
    return db.query(AttendanceRecord).filter(AttendanceRecord.session_id == session_id).all()

@router.patch("/attendance/{record_id}", response_model=AttendanceResponse)
def update_attendance(record_id: str, payload: AttendanceUpdate, db: DBSession = Depends(get_db)):
    record = db.query(AttendanceRecord).filter(AttendanceRecord.id == record_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Attendance record not found")

    if payload.status is not None:
        record.status = payload.status
    if payload.verified_by_instructor is not None:
        record.verified_by_instructor = payload.verified_by_instructor
    if payload.notes is not None:
        record.notes = payload.notes
    if payload.participant_id is not None:
        record.participant_id = payload.participant_id

    record.manual_override = True
    record.updated_at = datetime.datetime.utcnow()

    audit = AuditEvent(
        id=f"aud-{uuid.uuid4().hex[:8]}",
        action="ATTENDANCE_OVERRIDE",
        actor="Instructor",
        target_type="AttendanceRecord",
        target_id=record.id,
        details=f"Updated status to {record.status} (manual override)",
        timestamp=datetime.datetime.utcnow(),
    )
    db.add(audit)
    db.commit()
    db.refresh(record)
    return record

@router.post("/sessions/{session_id}/detections")
def ingest_detections(session_id: str, payload: DetectionIngest, db: DBSession = Depends(get_db)):
    session = db.query(Session).filter(Session.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    now = datetime.datetime.utcnow()
    updated_count = 0

    for det in payload.detections:
        record = db.query(AttendanceRecord).filter(
            AttendanceRecord.session_id == session_id,
            AttendanceRecord.tracking_id == det.tracking_id,
        ).first()

        if record:
            record.last_seen_at = now
            record.observed_duration_seconds = max(record.observed_duration_seconds, det.sustained_seconds)
            if not record.manual_override:
                if record.observed_duration_seconds >= session.presence_threshold_seconds:
                    record.status = "present" if record.verified_by_instructor else "unverified"
            record.updated_at = now
            updated_count += 1
        else:
            new_rec = AttendanceRecord(
                id=f"att-{uuid.uuid4().hex[:8]}",
                session_id=session_id,
                participant_id=det.participant_id,
                tracking_id=det.tracking_id,
                first_seen_at=now,
                last_seen_at=now,
                observed_duration_seconds=det.sustained_seconds,
                status="present" if det.participant_id else "unverified",
                verified_by_instructor=bool(det.participant_id),
                manual_override=False,
                updated_at=now,
            )
            db.add(new_rec)
            updated_count += 1

    session.active_participants_count = db.query(AttendanceRecord).filter(
        AttendanceRecord.session_id == session_id,
        AttendanceRecord.status.in_(["present", "late", "unverified"]),
    ).count()

    db.commit()
    return {"updated": updated_count, "active_count": session.active_participants_count}

# Metrics & Recommendations
@router.get("/sessions/{session_id}/metrics", response_model=List[SessionMetricResponse])
def get_session_metrics(session_id: str, db: DBSession = Depends(get_db)):
    return db.query(SessionMetric).filter(SessionMetric.session_id == session_id).order_by(SessionMetric.minute_offset.asc()).all()

@router.get("/sessions/{session_id}/recommendations", response_model=List[RecommendationResponse])
def get_session_recommendations(session_id: str, db: DBSession = Depends(get_db)):
    return db.query(Recommendation).filter(Recommendation.session_id == session_id).order_by(Recommendation.created_at.desc()).all()

@router.post("/sessions/{session_id}/recommendations/recalculate", response_model=List[RecommendationResponse])
def recalculate_recommendations(session_id: str, db: DBSession = Depends(get_db)):
    metrics = db.query(SessionMetric).filter(SessionMetric.session_id == session_id).order_by(SessionMetric.minute_offset.asc()).all()
    metric_dicts = [
        {
            "minute_offset": m.minute_offset,
            "visible_participants_count": m.visible_participants_count,
            "voice_activity_ratio": m.voice_activity_ratio,
            "movement_index": m.movement_index,
            "instructor_speaking_ratio": m.instructor_speaking_ratio,
        }
        for m in metrics
    ]

    generated = RecommendationEngine.evaluate(session_id, metric_dicts)
    for g in generated:
        exists = db.query(Recommendation).filter(
            Recommendation.session_id == session_id,
            Recommendation.title == g["title"],
        ).first()
        if not exists:
            rec = Recommendation(
                id=g["id"],
                session_id=g["session_id"],
                title=g["title"],
                explanation=g["explanation"],
                supporting_evidence=g["supporting_evidence"],
                suggested_action=g["suggested_action"],
                confidence_score=g["confidence_score"],
                limitations=g["limitations"],
                time_interval=g["time_interval"],
                priority=g["priority"],
                created_at=datetime.datetime.utcnow(),
            )
            db.add(rec)

    db.commit()
    return db.query(Recommendation).filter(Recommendation.session_id == session_id).order_by(Recommendation.created_at.desc()).all()

# CSV Export
@router.get("/reports/attendance.csv")
def export_attendance_csv(session_id: Optional[str] = None, db: DBSession = Depends(get_db)):
    query = db.query(AttendanceRecord)
    if session_id:
        query = query.filter(AttendanceRecord.session_id == session_id)
    records = query.all()

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "Attendance ID",
        "Session ID",
        "Participant ID",
        "Tracking ID",
        "Status",
        "Observed Duration (Seconds)",
        "Observed Duration (Minutes)",
        "First Seen",
        "Last Seen",
        "Verified by Instructor",
        "Manual Override",
        "Notes",
    ])

    for r in records:
        writer.writerow([
            r.id,
            r.session_id,
            r.participant_id or "UNASSIGNED",
            r.tracking_id,
            r.status.upper(),
            r.observed_duration_seconds,
            round(r.observed_duration_seconds / 60.0, 1),
            r.first_seen_at.isoformat() if r.first_seen_at else "",
            r.last_seen_at.isoformat() if r.last_seen_at else "",
            "YES" if r.verified_by_instructor else "NO",
            "YES" if r.manual_override else "NO",
            r.notes or "",
        ])

    csv_data = output.getvalue()
    return Response(
        content=csv_data,
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=attendance_export_{datetime.datetime.utcnow().strftime('%Y%m%d%H%M')}.csv"},
    )

# Processing Jobs
@router.get("/processing-jobs")
def list_jobs(db: DBSession = Depends(get_db)):
    return db.query(ProcessingJob).order_by(ProcessingJob.created_at.desc()).all()

@router.get("/processing-jobs/{job_id}")
def get_job(job_id: str, db: DBSession = Depends(get_db)):
    job = db.query(ProcessingJob).filter(ProcessingJob.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job

# Audit Events
@router.get("/audit-events")
def list_audit_events(db: DBSession = Depends(get_db)):
    return db.query(AuditEvent).order_by(AuditEvent.timestamp.desc()).all()

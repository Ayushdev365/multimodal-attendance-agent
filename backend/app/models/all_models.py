import datetime
from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, Float, Boolean, Text
from sqlalchemy.orm import relationship
from app.db.base import Base

class Classroom(Base):
    __tablename__ = "classrooms"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    code = Column(String, unique=True, index=True, nullable=False)
    room_number = Column(String, default="TBD")
    capacity = Column(Integer, default=30)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    participants = relationship("Participant", back_populates="classroom", cascade="all, delete-orphan")
    sessions = relationship("Session", back_populates="classroom", cascade="all, delete-orphan")


class Participant(Base):
    __tablename__ = "participants"

    id = Column(String, primary_key=True, index=True)
    classroom_id = Column(String, ForeignKey("classrooms.id"), nullable=False, index=True)
    code = Column(String, index=True, nullable=False) # e.g. "PAR-101"
    name = Column(String, nullable=False)
    email = Column(String, nullable=True)
    status = Column(String, default="active")
    enrolled_at = Column(DateTime, default=datetime.datetime.utcnow)

    classroom = relationship("Classroom", back_populates="participants")
    attendance_records = relationship("AttendanceRecord", back_populates="participant")


class Session(Base):
    __tablename__ = "sessions"

    id = Column(String, primary_key=True, index=True)
    classroom_id = Column(String, ForeignKey("classrooms.id"), nullable=False, index=True)
    title = Column(String, nullable=False)
    status = Column(String, default="scheduled", index=True) # scheduled, active, completed, cancelled
    start_time = Column(DateTime, default=datetime.datetime.utcnow)
    end_time = Column(DateTime, nullable=True)
    presence_threshold_seconds = Column(Integer, default=60)
    active_participants_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    classroom = relationship("Classroom", back_populates="sessions")
    attendance_records = relationship("AttendanceRecord", back_populates="session", cascade="all, delete-orphan")
    metrics = relationship("SessionMetric", back_populates="session", cascade="all, delete-orphan")
    recommendations = relationship("Recommendation", back_populates="session", cascade="all, delete-orphan")


class AttendanceRecord(Base):
    __tablename__ = "attendance_records"

    id = Column(String, primary_key=True, index=True)
    session_id = Column(String, ForeignKey("sessions.id"), nullable=False, index=True)
    participant_id = Column(String, ForeignKey("participants.id"), nullable=True, index=True)
    tracking_id = Column(String, index=True, nullable=False) # e.g. "TRK-01"
    first_seen_at = Column(DateTime, nullable=True)
    last_seen_at = Column(DateTime, nullable=True)
    observed_duration_seconds = Column(Integer, default=0)
    status = Column(String, default="unverified") # present, late, absent, unverified
    verified_by_instructor = Column(Boolean, default=False)
    manual_override = Column(Boolean, default=False)
    notes = Column(Text, nullable=True)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    session = relationship("Session", back_populates="attendance_records")
    participant = relationship("Participant", back_populates="attendance_records")


class SessionMetric(Base):
    __tablename__ = "session_metrics"

    id = Column(String, primary_key=True, index=True)
    session_id = Column(String, ForeignKey("sessions.id"), nullable=False, index=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    minute_offset = Column(Integer, default=0)
    visible_participants_count = Column(Integer, default=0)
    voice_activity_ratio = Column(Float, default=0.0)
    movement_index = Column(Float, default=0.0)
    instructor_speaking_ratio = Column(Float, default=0.0)
    data_quality_score = Column(Float, default=1.0)

    session = relationship("Session", back_populates="metrics")


class Recommendation(Base):
    __tablename__ = "recommendations"

    id = Column(String, primary_key=True, index=True)
    session_id = Column(String, ForeignKey("sessions.id"), nullable=False, index=True)
    title = Column(String, nullable=False)
    explanation = Column(Text, nullable=False)
    supporting_evidence = Column(Text, nullable=False)
    suggested_action = Column(Text, nullable=False)
    confidence_score = Column(Float, default=0.85)
    limitations = Column(Text, nullable=False)
    time_interval = Column(String, nullable=False)
    priority = Column(String, default="medium") # low, medium, high
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    session = relationship("Session", back_populates="recommendations")


class ProcessingJob(Base):
    __tablename__ = "processing_jobs"

    id = Column(String, primary_key=True, index=True)
    session_id = Column(String, nullable=False, index=True)
    type = Column(String, nullable=False) # live_stream, video_upload, audio_upload
    status = Column(String, default="queued") # queued, processing, completed, failed
    progress_percent = Column(Integer, default=0)
    file_name = Column(String, nullable=True)
    file_size_bytes = Column(Integer, nullable=True)
    error_message = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)


class AuditEvent(Base):
    __tablename__ = "audit_events"

    id = Column(String, primary_key=True, index=True)
    action = Column(String, nullable=False)
    actor = Column(String, nullable=False)
    target_type = Column(String, nullable=False)
    target_id = Column(String, nullable=False)
    details = Column(Text, nullable=False)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

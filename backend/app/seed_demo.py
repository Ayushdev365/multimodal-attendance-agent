"""
Explicit Demo Data Seeder for Multimodal Attendance & Engagement Agent.
Safe to run on demand: python -m app.seed_demo
Populates sample classrooms, participants, active/completed sessions, and metrics.
"""

import sys
import datetime
from app.db.base import Base
from app.db.session import engine, SessionLocal
from app.models import (
    Classroom,
    Participant,
    Session,
    AttendanceRecord,
    SessionMetric,
    Recommendation,
    AuditEvent,
)

def seed_demo_data():
    print("Initializing database tables...")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # Check if already seeded
        existing = db.query(Classroom).filter(Classroom.code == "CS101-SEC1").first()
        if existing:
            print("Demo data already present in database. Skipping duplicate seed.")
            return

        print("Seeding demo classrooms...")
        c1 = Classroom(
            id="cls-cs101",
            name="Computer Science 101 - Algorithms",
            code="CS101-SEC1",
            room_number="Hall 302",
            capacity=35,
            description="Foundations of Algorithms and Data Structures",
            created_at=datetime.datetime.utcnow(),
        )
        db.add(c1)

        print("Seeding participants with anonymous student codes...")
        p1 = Participant(id="par-01", classroom_id="cls-cs101", code="PAR-101", name="Alex Rivera", email="arivera@univ.edu")
        p2 = Participant(id="par-02", classroom_id="cls-cs101", code="PAR-102", name="Sophia Chen", email="schen@univ.edu")
        p3 = Participant(id="par-03", classroom_id="cls-cs101", code="PAR-103", name="Marcus Johnson", email="mjohnson@univ.edu")
        p4 = Participant(id="par-04", classroom_id="cls-cs101", code="PAR-104", name="Elena Rostova", email="erostova@univ.edu")
        db.add_all([p1, p2, p3, p4])

        print("Seeding active classroom session...")
        now = datetime.datetime.utcnow()
        s1 = Session(
            id="ses-live-01",
            classroom_id="cls-cs101",
            title="Session 08: Dynamic Programming & Memoization",
            status="active",
            start_time=now - datetime.timedelta(minutes=40),
            presence_threshold_seconds=60,
            active_participants_count=3,
            created_at=now - datetime.timedelta(minutes=45),
        )
        db.add(s1)

        print("Seeding attendance records with sustained presence...")
        att1 = AttendanceRecord(
            id="att-01",
            session_id="ses-live-01",
            participant_id="par-01",
            tracking_id="TRK-01",
            first_seen_at=now - datetime.timedelta(minutes=38),
            last_seen_at=now - datetime.timedelta(minutes=1),
            observed_duration_seconds=2220,
            status="present",
            verified_by_instructor=True,
            manual_override=False,
        )
        att2 = AttendanceRecord(
            id="att-02",
            session_id="ses-live-01",
            participant_id="par-02",
            tracking_id="TRK-02",
            first_seen_at=now - datetime.timedelta(minutes=37),
            last_seen_at=now - datetime.timedelta(minutes=1),
            observed_duration_seconds=2160,
            status="present",
            verified_by_instructor=True,
            manual_override=False,
        )
        att3 = AttendanceRecord(
            id="att-03",
            session_id="ses-live-01",
            participant_id=None,
            tracking_id="TRK-03",
            first_seen_at=now - datetime.timedelta(minutes=15),
            last_seen_at=now - datetime.timedelta(minutes=1),
            observed_duration_seconds=840,
            status="unverified",
            verified_by_instructor=False,
            notes="Unassigned participant detected at Row 3 Seat 4",
        )
        db.add_all([att1, att2, att3])

        print("Seeding time-series session metrics...")
        intervals = [
            (0, 3, 0.60, 0.40, 0.85, 0.95),
            (5, 3, 0.55, 0.35, 0.82, 0.94),
            (10, 3, 0.62, 0.38, 0.78, 0.96),
            (15, 3, 0.45, 0.25, 0.90, 0.93),
            (20, 3, 0.42, 0.20, 0.92, 0.95),
            (25, 3, 0.50, 0.42, 0.65, 0.94),
            (30, 3, 0.72, 0.46, 0.52, 0.95),
            (35, 3, 0.65, 0.38, 0.68, 0.96),
        ]
        for offset, vis, voice, move, inst, conf in intervals:
            m = SessionMetric(
                id=f"met-{offset}",
                session_id="ses-live-01",
                timestamp=now - datetime.timedelta(minutes=35 - offset),
                minute_offset=offset,
                visible_participants_count=vis,
                voice_activity_ratio=voice,
                movement_index=move,
                instructor_speaking_ratio=inst,
                data_quality_score=conf,
            )
            db.add(m)

        db.commit()
        print("Demo seed completed successfully!")
    finally:
        db.close()

if __name__ == "__main__":
    seed_demo_data()

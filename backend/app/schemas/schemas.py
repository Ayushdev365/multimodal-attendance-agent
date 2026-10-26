import datetime
from typing import Optional, List
from pydantic import BaseModel, Field

class ClassroomCreate(BaseModel):
    name: str
    code: str
    room_number: Optional[str] = "TBD"
    capacity: Optional[int] = 30
    description: Optional[str] = ""

class ClassroomResponse(BaseModel):
    id: str
    name: str
    code: str
    room_number: str
    capacity: int
    description: Optional[str]
    created_at: datetime.datetime

    class Config:
        from_attributes = True

class ParticipantCreate(BaseModel):
    classroom_id: str
    code: str
    name: str
    email: Optional[str] = ""

class ParticipantResponse(BaseModel):
    id: str
    classroom_id: str
    code: str
    name: str
    email: Optional[str]
    status: str
    enrolled_at: datetime.datetime

    class Config:
        from_attributes = True

class SessionCreate(BaseModel):
    classroom_id: str
    title: str
    presence_threshold_seconds: Optional[int] = 60

class SessionResponse(BaseModel):
    id: str
    classroom_id: str
    title: str
    status: str
    start_time: datetime.datetime
    end_time: Optional[datetime.datetime]
    presence_threshold_seconds: int
    active_participants_count: int
    created_at: datetime.datetime

    class Config:
        from_attributes = True

class AttendanceUpdate(BaseModel):
    status: Optional[str] = None
    verified_by_instructor: Optional[bool] = None
    participant_id: Optional[str] = None
    notes: Optional[str] = None

class AttendanceResponse(BaseModel):
    id: str
    session_id: str
    participant_id: Optional[str]
    tracking_id: str
    first_seen_at: Optional[datetime.datetime]
    last_seen_at: Optional[datetime.datetime]
    observed_duration_seconds: int
    status: str
    verified_by_instructor: bool
    manual_override: bool
    notes: Optional[str]
    updated_at: datetime.datetime

    class Config:
        from_attributes = True

class DetectionItem(BaseModel):
    tracking_id: str
    sustained_seconds: int
    participant_id: Optional[str] = None
    is_present: bool = True

class DetectionIngest(BaseModel):
    detections: List[DetectionItem]

class SessionMetricResponse(BaseModel):
    id: str
    session_id: str
    timestamp: datetime.datetime
    minute_offset: int
    visible_participants_count: int
    voice_activity_ratio: float
    movement_index: float
    instructor_speaking_ratio: float
    data_quality_score: float

    class Config:
        from_attributes = True

class RecommendationResponse(BaseModel):
    id: str
    session_id: str
    title: str
    explanation: str
    supporting_evidence: str
    suggested_action: str
    confidence_score: float
    limitations: str
    time_interval: str
    priority: str
    created_at: datetime.datetime

    class Config:
        from_attributes = True

export type AttendanceStatus = 'present' | 'late' | 'absent' | 'unverified';

export interface Classroom {
  id: string;
  name: string;
  code: string;
  roomNumber: string;
  capacity: number;
  description?: string;
  createdAt: string;
}

export interface Participant {
  id: string;
  classroomId: string;
  code: string; // e.g. "PAR-101"
  name: string;
  email: string;
  status: 'active' | 'archived';
  avatarColor?: string;
  enrolledAt: string;
}

export interface Session {
  id: string;
  classroomId: string;
  title: string;
  status: 'scheduled' | 'active' | 'completed' | 'cancelled';
  startTime: string;
  endTime?: string;
  presenceThresholdSeconds: number; // default: 60s
  activeParticipantsCount?: number;
  totalEnrolledCount?: number;
  createdAt: string;
}

export interface AttendanceRecord {
  id: string;
  sessionId: string;
  participantId?: string; // undefined if unverified tracking ID
  participantCode?: string;
  participantName?: string;
  trackingId: string; // e.g. "TRK-001"
  firstSeenAt: string;
  lastSeenAt: string;
  observedDurationSeconds: number;
  status: AttendanceStatus;
  verifiedByInstructor: boolean;
  notes?: string;
  manualOverride: boolean;
  updatedAt: string;
}

export interface SessionMetric {
  id: string;
  sessionId: string;
  timestamp: string;
  minuteOffset: number;
  visibleParticipantsCount: number;
  voiceActivityRatio: number; // 0.0 - 1.0 (proportion of speech in window)
  movementIndex: number; // 0.0 - 1.0 (observable scene activity)
  instructorSpeakingRatio: number; // 0.0 - 1.0
  dataQualityScore: number; // 0.0 - 1.0 (lighting/fps confidence)
}

export interface Recommendation {
  id: string;
  sessionId: string;
  title: string;
  explanation: string;
  supportingEvidence: string;
  suggestedAction: string;
  confidenceScore: number; // e.g. 0.88
  limitations: string;
  timeInterval: string; // e.g. "00:15 - 00:30"
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
}

export interface ProcessingJob {
  id: string;
  sessionId: string;
  type: 'live_stream' | 'video_upload' | 'audio_upload';
  status: 'queued' | 'processing' | 'completed' | 'failed';
  progressPercent: number;
  fileName?: string;
  fileSizeBytes?: number;
  errorMessage?: string;
  createdAt: string;
  completedAt?: string;
}

export interface AuditEvent {
  id: string;
  action: string;
  actor: string;
  targetType: string;
  targetId: string;
  details: string;
  timestamp: string;
}

export interface PrivacySettings {
  rawVideoStorageEnabled: boolean; // default false
  rawAudioStorageEnabled: boolean; // default false
  retentionDays: number; // default 30
  biometricMatchingEnabled: boolean; // default false
  anonymizeExportReports: boolean; // default false
  offlineOnlyMode: boolean; // default true
}

export interface SystemCapabilities {
  visionEnabled: boolean;
  audioVadEnabled: boolean;
  offlineReady: boolean;
  models: {
    name: string;
    type: 'person_detector' | 'face_landmark' | 'vad';
    status: 'loaded' | 'ready' | 'download_needed';
    license: string;
  }[];
  version: string;
}

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
  confidence: number;
}

export interface DetectedPerson {
  trackingId: string;
  box: BoundingBox;
  sustainedSeconds: number;
  isVerified: boolean;
  participantId?: string;
  participantCode?: string;
  participantName?: string;
  firstSeen: string;
  lastSeen: string;
}

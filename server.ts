/**
 * Multimodal Attendance & Engagement Agent - Express Full-Stack Server
 * Mounts Vite middleware in development and serves full REST API under /api/v1
 */

import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import type {
  Classroom,
  Participant,
  Session,
  AttendanceRecord,
  SessionMetric,
  Recommendation,
  ProcessingJob,
  AuditEvent,
  PrivacySettings,
  SystemCapabilities,
} from './src/types/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

app.use(express.json({ limit: '10mb' }));

// Ensure data folder exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// In-Memory Database State
interface DatabaseState {
  classrooms: Classroom[];
  participants: Participant[];
  sessions: Session[];
  attendance: AttendanceRecord[];
  metrics: SessionMetric[];
  recommendations: Recommendation[];
  jobs: ProcessingJob[];
  auditLogs: AuditEvent[];
  privacy: PrivacySettings;
}

const getInitialSeed = (): DatabaseState => {
  const c1Id = 'cls-cs101';
  const s1Id = 'ses-live-01';

  const classrooms: Classroom[] = [
    {
      id: c1Id,
      name: 'Computer Science 101 - Algorithms',
      code: 'CS101-SEC1',
      roomNumber: 'Hall 302',
      capacity: 35,
      description: 'Foundations of Algorithms and Data Structures',
      createdAt: '2026-10-01T08:00:00Z',
    },
    {
      id: 'cls-bio210',
      name: 'Biology 210 - Cellular Genetics',
      code: 'BIO210-SEC2',
      roomNumber: 'Science Annex B',
      capacity: 40,
      description: 'Principles of Molecular Biology and Genetics',
      createdAt: '2026-10-05T09:00:00Z',
    },
  ];

  const participants: Participant[] = [
    { id: 'par-01', classroomId: c1Id, code: 'PAR-101', name: 'Alex Rivera', email: 'arivera@univ.edu', status: 'active', enrolledAt: '2026-10-01T08:30:00Z' },
    { id: 'par-02', classroomId: c1Id, code: 'PAR-102', name: 'Sophia Chen', email: 'schen@univ.edu', status: 'active', enrolledAt: '2026-10-01T08:30:00Z' },
    { id: 'par-03', classroomId: c1Id, code: 'PAR-103', name: 'Marcus Johnson', email: 'mjohnson@univ.edu', status: 'active', enrolledAt: '2026-10-01T08:31:00Z' },
    { id: 'par-04', classroomId: c1Id, code: 'PAR-104', name: 'Elena Rostova', email: 'erostova@univ.edu', status: 'active', enrolledAt: '2026-10-01T08:32:00Z' },
    { id: 'par-05', classroomId: c1Id, code: 'PAR-105', name: 'Devon Vance', email: 'dvance@univ.edu', status: 'active', enrolledAt: '2026-10-01T08:33:00Z' },
    { id: 'par-06', classroomId: c1Id, code: 'PAR-106', name: 'Zoya Patel', email: 'zpatel@univ.edu', status: 'active', enrolledAt: '2026-10-01T08:34:00Z' },
    { id: 'par-07', classroomId: c1Id, code: 'PAR-107', name: 'Liam O\'Connor', email: 'loconnor@univ.edu', status: 'active', enrolledAt: '2026-10-01T08:35:00Z' },
    { id: 'par-08', classroomId: c1Id, code: 'PAR-108', name: 'Amina Mansour', email: 'amansour@univ.edu', status: 'active', enrolledAt: '2026-10-01T08:36:00Z' },
  ];

  const sessions: Session[] = [
    {
      id: s1Id,
      classroomId: c1Id,
      title: 'Session 08: Dynamic Programming & Memoization',
      status: 'active',
      startTime: new Date(Date.now() - 42 * 60 * 1000).toISOString(),
      presenceThresholdSeconds: 60,
      activeParticipantsCount: 7,
      totalEnrolledCount: 8,
      createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    },
    {
      id: 'ses-completed-02',
      classroomId: c1Id,
      title: 'Session 07: Divide & Conquer Recursion',
      status: 'completed',
      startTime: '2026-10-24T10:00:00Z',
      endTime: '2026-10-24T11:30:00Z',
      presenceThresholdSeconds: 60,
      activeParticipantsCount: 8,
      totalEnrolledCount: 8,
      createdAt: '2026-10-24T09:45:00Z',
    },
  ];

  const now = Date.now();
  const attendance: AttendanceRecord[] = [
    {
      id: 'att-01',
      sessionId: s1Id,
      participantId: 'par-01',
      participantCode: 'PAR-101',
      participantName: 'Alex Rivera',
      trackingId: 'TRK-01',
      firstSeenAt: new Date(now - 40 * 60 * 1000).toISOString(),
      lastSeenAt: new Date(now - 1 * 60 * 1000).toISOString(),
      observedDurationSeconds: 2340,
      status: 'present',
      verifiedByInstructor: true,
      manualOverride: false,
      updatedAt: new Date(now - 1 * 60 * 1000).toISOString(),
    },
    {
      id: 'att-02',
      sessionId: s1Id,
      participantId: 'par-02',
      participantCode: 'PAR-102',
      participantName: 'Sophia Chen',
      trackingId: 'TRK-02',
      firstSeenAt: new Date(now - 39 * 60 * 1000).toISOString(),
      lastSeenAt: new Date(now - 1 * 60 * 1000).toISOString(),
      observedDurationSeconds: 2280,
      status: 'present',
      verifiedByInstructor: true,
      manualOverride: false,
      updatedAt: new Date(now - 1 * 60 * 1000).toISOString(),
    },
    {
      id: 'att-03',
      sessionId: s1Id,
      participantId: 'par-03',
      participantCode: 'PAR-103',
      participantName: 'Marcus Johnson',
      trackingId: 'TRK-03',
      firstSeenAt: new Date(now - 22 * 60 * 1000).toISOString(),
      lastSeenAt: new Date(now - 1 * 60 * 1000).toISOString(),
      observedDurationSeconds: 1260,
      status: 'late',
      verifiedByInstructor: true,
      notes: 'Arrived 20 mins after session start time',
      manualOverride: false,
      updatedAt: new Date(now - 1 * 60 * 1000).toISOString(),
    },
    {
      id: 'att-04',
      sessionId: s1Id,
      participantId: 'par-04',
      participantCode: 'PAR-104',
      participantName: 'Elena Rostova',
      trackingId: 'TRK-04',
      firstSeenAt: new Date(now - 41 * 60 * 1000).toISOString(),
      lastSeenAt: new Date(now - 2 * 60 * 1000).toISOString(),
      observedDurationSeconds: 2310,
      status: 'present',
      verifiedByInstructor: true,
      manualOverride: false,
      updatedAt: new Date(now - 2 * 60 * 1000).toISOString(),
    },
    {
      id: 'att-05',
      sessionId: s1Id,
      participantId: 'par-05',
      participantCode: 'PAR-105',
      participantName: 'Devon Vance',
      trackingId: 'TRK-05',
      firstSeenAt: new Date(now - 38 * 60 * 1000).toISOString(),
      lastSeenAt: new Date(now - 1 * 60 * 1000).toISOString(),
      observedDurationSeconds: 2190,
      status: 'present',
      verifiedByInstructor: true,
      manualOverride: false,
      updatedAt: new Date(now - 1 * 60 * 1000).toISOString(),
    },
    {
      id: 'att-06',
      sessionId: s1Id,
      participantId: 'par-06',
      participantCode: 'PAR-106',
      participantName: 'Zoya Patel',
      trackingId: 'TRK-06',
      firstSeenAt: new Date(now - 39 * 60 * 1000).toISOString(),
      lastSeenAt: new Date(now - 1 * 60 * 1000).toISOString(),
      observedDurationSeconds: 2250,
      status: 'present',
      verifiedByInstructor: true,
      manualOverride: false,
      updatedAt: new Date(now - 1 * 60 * 1000).toISOString(),
    },
    {
      id: 'att-07',
      sessionId: s1Id,
      participantId: undefined,
      participantCode: undefined,
      participantName: undefined,
      trackingId: 'TRK-07',
      firstSeenAt: new Date(now - 15 * 60 * 1000).toISOString(),
      lastSeenAt: new Date(now - 1 * 60 * 1000).toISOString(),
      observedDurationSeconds: 840,
      status: 'unverified',
      verifiedByInstructor: false,
      notes: 'New participant detected at Row 3 Seat 4; pending instructor verification.',
      manualOverride: false,
      updatedAt: new Date(now - 1 * 60 * 1000).toISOString(),
    },
    {
      id: 'att-08',
      sessionId: s1Id,
      participantId: 'par-08',
      participantCode: 'PAR-108',
      participantName: 'Amina Mansour',
      trackingId: 'TRK-NONE',
      firstSeenAt: '',
      lastSeenAt: '',
      observedDurationSeconds: 0,
      status: 'absent',
      verifiedByInstructor: false,
      notes: 'Not detected in camera frame during active session',
      manualOverride: false,
      updatedAt: new Date(now - 40 * 60 * 1000).toISOString(),
    },
  ];

  // 40 minutes of simulated session metrics (5-minute intervals)
  const metrics: SessionMetric[] = [];
  const intervals = [
    { offset: 0, visible: 6, voice: 0.65, move: 0.42, inst: 0.85, conf: 0.94 },
    { offset: 5, visible: 6, voice: 0.58, move: 0.35, inst: 0.80, conf: 0.95 },
    { offset: 10, visible: 6, voice: 0.62, move: 0.38, inst: 0.75, conf: 0.96 },
    { offset: 15, visible: 6, voice: 0.45, move: 0.28, inst: 0.88, conf: 0.93 },
    { offset: 20, visible: 7, voice: 0.40, move: 0.22, inst: 0.92, conf: 0.95 },
    { offset: 25, visible: 7, voice: 0.52, move: 0.45, inst: 0.60, conf: 0.94 }, // Q&A started
    { offset: 30, visible: 7, voice: 0.70, move: 0.48, inst: 0.55, conf: 0.95 }, // High participant voice
    { offset: 35, visible: 7, voice: 0.64, move: 0.41, inst: 0.70, conf: 0.96 },
    { offset: 40, visible: 7, voice: 0.55, move: 0.36, inst: 0.78, conf: 0.94 },
  ];

  intervals.forEach((item, idx) => {
    metrics.push({
      id: `met-${idx + 1}`,
      sessionId: s1Id,
      timestamp: new Date(now - (40 - item.offset) * 60 * 1000).toISOString(),
      minuteOffset: item.offset,
      visibleParticipantsCount: item.visible,
      voiceActivityRatio: item.voice,
      movementIndex: item.move,
      instructorSpeakingRatio: item.inst,
      dataQualityScore: item.conf,
    });
  });

  const recommendations: Recommendation[] = [
    {
      id: 'rec-01',
      sessionId: s1Id,
      title: 'Sustained Monologue Detected: Introduce Active Q&A',
      explanation: 'Between minutes 15 and 25, instructor speech proportion exceeded 88% while observable movement settled below 0.25.',
      supportingEvidence: 'Continuous lecture interval: 10 minutes; Speech/Silence ratio: 0.88; Observable participant movement decreased by 38%.',
      suggestedAction: 'Pause the presentation to present a quick check-for-understanding problem or peer discussion prompt.',
      confidenceScore: 0.89,
      limitations: 'Calculated purely from aggregate audio speech bursts and frame movement vectors. Does not measure individual cognitive comprehension.',
      timeInterval: '00:15 - 00:25',
      priority: 'high',
      createdAt: new Date(now - 15 * 60 * 1000).toISOString(),
    },
    {
      id: 'rec-02',
      sessionId: s1Id,
      title: 'Successful Interactive Window Observed',
      explanation: 'Between minutes 25 and 35, distributed voice activity increased to 0.70 with balanced participant interaction.',
      supportingEvidence: 'Voice activity increased by +75% over previous window; 4 distinct acoustic turn-taking transitions detected.',
      suggestedAction: 'Acknowledge participant contributions and synthesize key points before transitioning to the next algorithmic module.',
      confidenceScore: 0.92,
      limitations: 'Voice activity segmentation is acoustic-only and does not parse linguistic transcript accuracy.',
      timeInterval: '00:25 - 00:35',
      priority: 'medium',
      createdAt: new Date(now - 5 * 60 * 1000).toISOString(),
    },
  ];

  const jobs: ProcessingJob[] = [
    {
      id: 'job-01',
      sessionId: s1Id,
      type: 'live_stream',
      status: 'processing',
      progressPercent: 78,
      createdAt: new Date(now - 42 * 60 * 1000).toISOString(),
    },
  ];

  const auditLogs: AuditEvent[] = [
    {
      id: 'aud-01',
      action: 'SESSION_STARTED',
      actor: 'Prof. J. Vance',
      targetType: 'Session',
      targetId: s1Id,
      details: 'Started active session with 60s sustained-presence threshold',
      timestamp: new Date(now - 42 * 60 * 1000).toISOString(),
    },
    {
      id: 'aud-02',
      action: 'ATTENDANCE_VERIFICATION_AUTOMATED',
      actor: 'System (Agent Pipeline)',
      targetType: 'AttendanceRecord',
      targetId: 'att-01',
      details: 'Participant PAR-101 sustained presence verified (>60s threshold met)',
      timestamp: new Date(now - 38 * 60 * 1000).toISOString(),
    },
    {
      id: 'aud-03',
      action: 'UNVERIFIED_DETECTION_FLAGGED',
      actor: 'System (Agent Pipeline)',
      targetType: 'AttendanceRecord',
      targetId: 'att-07',
      details: 'Unassigned participant detected (TRK-07) flagged for instructor authorization',
      timestamp: new Date(now - 15 * 60 * 1000).toISOString(),
    },
  ];

  const privacy: PrivacySettings = {
    rawVideoStorageEnabled: false,
    rawAudioStorageEnabled: false,
    retentionDays: 30,
    biometricMatchingEnabled: false,
    anonymizeExportReports: false,
    offlineOnlyMode: true,
  };

  return { classrooms, participants, sessions, attendance, metrics, recommendations, jobs, auditLogs, privacy };
};

// Load or Seed DB
let db: DatabaseState;
try {
  if (fs.existsSync(DB_FILE)) {
    db = JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
  } else {
    db = getInitialSeed();
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
  }
} catch {
  db = getInitialSeed();
}

const saveDb = () => {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
  } catch (err) {
    console.error('Failed to write db file:', err);
  }
};

// ==========================================
// REST API ROUTES (/api/v1)
// ==========================================

// Health Check
app.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    service: 'Multimodal Attendance & Engagement Agent API',
    offline_ready: true,
  });
});

// System Capabilities
app.get('/api/v1/system/capabilities', (_req: Request, res: Response) => {
  const capabilities: SystemCapabilities = {
    visionEnabled: true,
    audioVadEnabled: true,
    offlineReady: true,
    models: [
      { name: 'MediaPipe Face Detection', type: 'face_landmark', status: 'ready', license: 'Apache 2.0' },
      { name: 'OpenCV Haar/HOG Person Detector', type: 'person_detector', status: 'ready', license: 'Apache 2.0' },
      { name: 'Energy-Based Acoustic VAD', type: 'vad', status: 'ready', license: 'MIT' },
    ],
    version: '1.0.0',
  };
  res.json(capabilities);
});

// Classrooms
app.get('/api/v1/classrooms', (_req: Request, res: Response) => {
  res.json(db.classrooms);
});

app.post('/api/v1/classrooms', (req: Request, res: Response) => {
  const { name, code, roomNumber, capacity, description } = req.body;
  if (!name || !code) {
    res.status(400).json({ error: 'Name and Code are required' });
    return;
  }
  const newClassroom: Classroom = {
    id: `cls-${Date.now()}`,
    name,
    code,
    roomNumber: roomNumber || 'TBD',
    capacity: Number(capacity) || 30,
    description: description || '',
    createdAt: new Date().toISOString(),
  };
  db.classrooms.unshift(newClassroom);
  db.auditLogs.unshift({
    id: `aud-${Date.now()}`,
    action: 'CLASSROOM_CREATED',
    actor: 'Instructor',
    targetType: 'Classroom',
    targetId: newClassroom.id,
    details: `Created classroom ${newClassroom.name} (${newClassroom.code})`,
    timestamp: new Date().toISOString(),
  });
  saveDb();
  res.status(201).json(newClassroom);
});

// Participants
app.get('/api/v1/participants', (req: Request, res: Response) => {
  const { classroomId } = req.query;
  if (classroomId) {
    return res.json(db.participants.filter(p => p.classroomId === classroomId));
  }
  res.json(db.participants);
});

app.post('/api/v1/participants', (req: Request, res: Response) => {
  const { classroomId, code, name, email } = req.body;
  if (!classroomId || !code || !name) {
    res.status(400).json({ error: 'ClassroomId, Code, and Name are required' });
    return;
  }
  const newParticipant: Participant = {
    id: `par-${Date.now()}`,
    classroomId,
    code,
    name,
    email: email || '',
    status: 'active',
    enrolledAt: new Date().toISOString(),
  };
  db.participants.push(newParticipant);
  db.auditLogs.unshift({
    id: `aud-${Date.now()}`,
    action: 'PARTICIPANT_ENROLLED',
    actor: 'Instructor',
    targetType: 'Participant',
    targetId: newParticipant.id,
    details: `Enrolled participant ${newParticipant.name} [${newParticipant.code}]`,
    timestamp: new Date().toISOString(),
  });
  saveDb();
  res.status(201).json(newParticipant);
});

// Sessions
app.get('/api/v1/sessions', (req: Request, res: Response) => {
  const { classroomId } = req.query;
  let list = db.sessions;
  if (classroomId) {
    list = list.filter(s => s.classroomId === classroomId);
  }
  res.json(list);
});

app.post('/api/v1/sessions', (req: Request, res: Response) => {
  const { classroomId, title, presenceThresholdSeconds } = req.body;
  if (!classroomId || !title) {
    res.status(400).json({ error: 'ClassroomId and Title are required' });
    return;
  }
  const enrolledCount = db.participants.filter(p => p.classroomId === classroomId).length;
  const newSession: Session = {
    id: `ses-${Date.now()}`,
    classroomId,
    title,
    status: 'scheduled',
    startTime: new Date().toISOString(),
    presenceThresholdSeconds: Number(presenceThresholdSeconds) || 60,
    activeParticipantsCount: 0,
    totalEnrolledCount: enrolledCount,
    createdAt: new Date().toISOString(),
  };
  db.sessions.unshift(newSession);
  db.auditLogs.unshift({
    id: `aud-${Date.now()}`,
    action: 'SESSION_CREATED',
    actor: 'Instructor',
    targetType: 'Session',
    targetId: newSession.id,
    details: `Created session ${newSession.title} with ${newSession.presenceThresholdSeconds}s presence threshold`,
    timestamp: new Date().toISOString(),
  });
  saveDb();
  res.status(201).json(newSession);
});

app.post('/api/v1/sessions/:id/start', (req: Request, res: Response) => {
  const session = db.sessions.find(s => s.id === req.params.id);
  if (!session) {
    res.status(404).json({ error: 'Session not found' });
    return;
  }
  session.status = 'active';
  session.startTime = new Date().toISOString();
  db.auditLogs.unshift({
    id: `aud-${Date.now()}`,
    action: 'SESSION_STARTED',
    actor: 'Instructor',
    targetType: 'Session',
    targetId: session.id,
    details: `Session started live monitoring`,
    timestamp: new Date().toISOString(),
  });
  saveDb();
  res.json(session);
});

app.post('/api/v1/sessions/:id/end', (req: Request, res: Response) => {
  const session = db.sessions.find(s => s.id === req.params.id);
  if (!session) {
    res.status(404).json({ error: 'Session not found' });
    return;
  }
  session.status = 'completed';
  session.endTime = new Date().toISOString();
  db.auditLogs.unshift({
    id: `aud-${Date.now()}`,
    action: 'SESSION_COMPLETED',
    actor: 'Instructor',
    targetType: 'Session',
    targetId: session.id,
    details: `Session finalized and archived`,
    timestamp: new Date().toISOString(),
  });
  saveDb();
  res.json(session);
});

// Attendance Records (All or filter by sessionId)
app.get('/api/v1/attendance', (req: Request, res: Response) => {
  const { sessionId } = req.query;
  if (sessionId && sessionId !== 'all') {
    return res.json(db.attendance.filter(a => a.sessionId === sessionId));
  }
  res.json(db.attendance);
});

// Attendance Records for a session
app.get('/api/v1/sessions/:id/attendance', (req: Request, res: Response) => {
  const records = db.attendance.filter(a => a.sessionId === req.params.id);
  res.json(records);
});

// Manual correction or instructor verification of attendance
app.patch('/api/v1/attendance/:id', (req: Request, res: Response) => {
  const record = db.attendance.find(a => a.id === req.params.id);
  if (!record) {
    res.status(404).json({ error: 'Attendance record not found' });
    return;
  }
  const { status, verifiedByInstructor, participantId, notes } = req.body;

  if (status !== undefined) record.status = status;
  if (verifiedByInstructor !== undefined) record.verifiedByInstructor = verifiedByInstructor;
  if (notes !== undefined) record.notes = notes;

  if (participantId !== undefined) {
    record.participantId = participantId;
    const participant = db.participants.find(p => p.id === participantId);
    if (participant) {
      record.participantCode = participant.code;
      record.participantName = participant.name;
    }
  }

  record.manualOverride = true;
  record.updatedAt = new Date().toISOString();

  db.auditLogs.unshift({
    id: `aud-${Date.now()}`,
    action: 'ATTENDANCE_MANUAL_UPDATE',
    actor: 'Instructor',
    targetType: 'AttendanceRecord',
    targetId: record.id,
    details: `Updated record for ${record.participantName || record.trackingId} to status: ${record.status}`,
    timestamp: new Date().toISOString(),
  });

  saveDb();
  res.json(record);
});

// Real-time Detection Ingestion from client or processing worker
app.post('/api/v1/sessions/:id/detections', (req: Request, res: Response) => {
  const sessionId = req.params.id;
  const session = db.sessions.find(s => s.id === sessionId);
  if (!session) {
    res.status(404).json({ error: 'Session not found' });
    return;
  }

  const { detections } = req.body as {
    detections: { trackingId: string; sustainedSeconds: number; participantId?: string; isPresent: boolean }[];
  };

  if (!detections || !Array.isArray(detections)) {
    res.status(400).json({ error: 'detections array required' });
    return;
  }

  const nowIso = new Date().toISOString();
  let updatedCount = 0;

  for (const det of detections) {
    let record = db.attendance.find(a => a.sessionId === sessionId && a.trackingId === det.trackingId);
    if (!record && det.participantId) {
      record = db.attendance.find(a => a.sessionId === sessionId && a.participantId === det.participantId);
    }

    if (record) {
      record.lastSeenAt = nowIso;
      record.observedDurationSeconds = Math.max(record.observedDurationSeconds, det.sustainedSeconds);
      if (!record.manualOverride) {
        if (record.observedDurationSeconds >= session.presenceThresholdSeconds) {
          record.status = record.verifiedByInstructor ? 'present' : 'unverified';
        }
      }
      record.updatedAt = nowIso;
      updatedCount++;
    } else {
      // New detected person
      const newRec: AttendanceRecord = {
        id: `att-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        sessionId,
        participantId: det.participantId,
        trackingId: det.trackingId,
        firstSeenAt: nowIso,
        lastSeenAt: nowIso,
        observedDurationSeconds: det.sustainedSeconds,
        status: det.participantId ? 'present' : 'unverified',
        verifiedByInstructor: !!det.participantId,
        manualOverride: false,
        updatedAt: nowIso,
      };

      if (det.participantId) {
        const p = db.participants.find(part => part.id === det.participantId);
        if (p) {
          newRec.participantCode = p.code;
          newRec.participantName = p.name;
        }
      }

      db.attendance.push(newRec);
      updatedCount++;
    }
  }

  session.activeParticipantsCount = db.attendance.filter(
    a => a.sessionId === sessionId && (a.status === 'present' || a.status === 'late' || a.status === 'unverified')
  ).length;

  saveDb();
  res.json({ updated: updatedCount, activeCount: session.activeParticipantsCount });
});

// Session Metrics
app.get('/api/v1/sessions/:id/metrics', (req: Request, res: Response) => {
  const metrics = db.metrics.filter(m => m.sessionId === req.params.id);
  res.json(metrics);
});

// Recommendations
app.get('/api/v1/sessions/:id/recommendations', (req: Request, res: Response) => {
  const recs = db.recommendations.filter(r => r.sessionId === req.params.id);
  res.json(recs);
});

// Recalculate deterministic recommendations from metrics
app.post('/api/v1/sessions/:id/recommendations/recalculate', (req: Request, res: Response) => {
  const sessionId = req.params.id;
  const metrics = db.metrics.filter(m => m.sessionId === sessionId);

  if (metrics.length === 0) {
    res.json({ message: 'Insufficient metrics to generate recommendations', recommendations: [] });
    return;
  }

  const newRecs: Recommendation[] = [];
  const latest = metrics[metrics.length - 1];

  // Rule 1: High Instructor Monologue
  if (latest.instructorSpeakingRatio > 0.8 && latest.movementIndex < 0.3) {
    newRecs.push({
      id: `rec-${Date.now()}-1`,
      sessionId,
      title: 'Pacing Check: High Instructor Speech with Low Movement',
      explanation: `Instructor monologue ratio reached ${(latest.instructorSpeakingRatio * 100).toFixed(0)}% with participant observable activity dipping to ${latest.movementIndex.toFixed(2)}.`,
      supportingEvidence: `Current minute offset: ${latest.minuteOffset}; Voice ratio: ${latest.voiceActivityRatio.toFixed(2)}; Activity index: ${latest.movementIndex.toFixed(2)}.`,
      suggestedAction: 'Pause lecturing to introduce an interactive poll, short recap question, or think-pair-share segment.',
      confidenceScore: 0.88,
      limitations: 'Measurement reflects acoustic speech activity and movement energy, not individual cognitive understanding.',
      timeInterval: `${Math.max(0, latest.minuteOffset - 10)}:00 - ${latest.minuteOffset}:00`,
      priority: 'high',
      createdAt: new Date().toISOString(),
    });
  }

  // Rule 2: High Collaborative Voice Activity
  if (latest.voiceActivityRatio > 0.65 && latest.instructorSpeakingRatio < 0.6) {
    newRecs.push({
      id: `rec-${Date.now()}-2`,
      sessionId,
      title: 'High Interaction Engagement Observed',
      explanation: 'Balanced turn-taking and elevated classroom speech indicate an active collaborative period.',
      supportingEvidence: `Voice activity ratio at ${latest.voiceActivityRatio.toFixed(2)} with instructor speech below 60%.`,
      suggestedAction: 'Allow discussion to conclude naturally before summarizing key takeaways.',
      confidenceScore: 0.91,
      limitations: 'Audio processing does not distinguish productive academic discussion from off-topic chatter.',
      timeInterval: `${Math.max(0, latest.minuteOffset - 5)}:00 - ${latest.minuteOffset}:00`,
      priority: 'low',
      createdAt: new Date().toISOString(),
    });
  }

  // Save unique recommendations
  for (const r of newRecs) {
    if (!db.recommendations.some(existing => existing.title === r.title && existing.sessionId === sessionId)) {
      db.recommendations.unshift(r);
    }
  }

  saveDb();
  res.json(db.recommendations.filter(r => r.sessionId === sessionId));
});

// Processing Jobs
app.get('/api/v1/processing-jobs', (_req: Request, res: Response) => {
  res.json(db.jobs);
});

app.get('/api/v1/processing-jobs/:id', (req: Request, res: Response) => {
  const job = db.jobs.find(j => j.id === req.params.id);
  if (!job) {
    res.status(404).json({ error: 'Job not found' });
    return;
  }
  res.json(job);
});

app.post('/api/v1/processing-jobs', (req: Request, res: Response) => {
  const { sessionId, type, fileName, fileSizeBytes } = req.body;
  if (!sessionId || !type) {
    res.status(400).json({ error: 'sessionId and type are required' });
    return;
  }

  const newJob: ProcessingJob = {
    id: `job-${Date.now()}`,
    sessionId,
    type,
    status: 'processing',
    progressPercent: 15,
    fileName: fileName || 'video_stream.mp4',
    fileSizeBytes: fileSizeBytes || 1024 * 1024 * 12,
    createdAt: new Date().toISOString(),
  };

  db.jobs.unshift(newJob);

  // Simulate progress steps asynchronously in dev environment
  setTimeout(() => {
    newJob.progressPercent = 55;
    saveDb();
  }, 1500);

  setTimeout(() => {
    newJob.progressPercent = 100;
    newJob.status = 'completed';
    newJob.completedAt = new Date().toISOString();
    saveDb();
  }, 4000);

  saveDb();
  res.status(202).json(newJob);
});

// Audit Events
app.get('/api/v1/audit-events', (_req: Request, res: Response) => {
  res.json(db.auditLogs);
});

// Privacy Settings
app.get('/api/v1/privacy/settings', (_req: Request, res: Response) => {
  res.json(db.privacy);
});

app.put('/api/v1/privacy/settings', (req: Request, res: Response) => {
  db.privacy = { ...db.privacy, ...req.body };
  db.auditLogs.unshift({
    id: `aud-${Date.now()}`,
    action: 'PRIVACY_POLICY_UPDATED',
    actor: 'Administrator',
    targetType: 'PrivacySettings',
    targetId: 'global',
    details: 'Updated retention policies and biometric matching gates',
    timestamp: new Date().toISOString(),
  });
  saveDb();
  res.json(db.privacy);
});

// CSV Export Endpoint
app.get('/api/v1/reports/attendance.csv', (req: Request, res: Response) => {
  const { sessionId } = req.query;
  let records = db.attendance;
  if (sessionId && sessionId !== 'all') {
    records = records.filter(r => r.sessionId === sessionId);
  }

  const headers = [
    'Attendance ID',
    'Session ID',
    'Participant Code',
    'Participant Name',
    'Tracking ID',
    'Status',
    'Observed Duration (Seconds)',
    'Observed Duration (Minutes)',
    'First Seen At',
    'Last Seen At',
    'Verified by Instructor',
    'Manual Override',
    'Notes',
  ];

  const escapeCsv = (val: unknown) => {
    if (val === undefined || val === null) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const rows = records.map(r => [
    r.id,
    r.sessionId,
    r.participantCode || 'N/A',
    db.privacy.anonymizeExportReports && r.participantName ? `Participant-${r.id.slice(-4)}` : (r.participantName || 'Unassigned'),
    r.trackingId,
    r.status.toUpperCase(),
    r.observedDurationSeconds,
    (r.observedDurationSeconds / 60).toFixed(1),
    r.firstSeenAt,
    r.lastSeenAt,
    r.verifiedByInstructor ? 'YES' : 'NO',
    r.manualOverride ? 'YES' : 'NO',
    r.notes || '',
  ].map(escapeCsv).join(','));

  const csvContent = [headers.map(escapeCsv).join(','), ...rows].join('\r\n') + '\r\n';

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="attendance_report_${Date.now()}.csv"`);
  res.status(200).send(csvContent);
});

// Seed Demo Database Reset Endpoint
app.post('/api/v1/seed', (_req: Request, res: Response) => {
  db = getInitialSeed();
  saveDb();
  res.json({ message: 'Database reset to initial demo state', success: true });
});

// ==========================================
// VITE DEV SERVER / STATIC SERVING
// ==========================================
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    // Mount Vite dev middleware
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production static file serving
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Multimodal Attendance Agent server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

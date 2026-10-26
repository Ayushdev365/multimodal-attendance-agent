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
} from '../types/index.ts';

const BASE_URL = '/api/v1';

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };
  const res = await fetch(`${BASE_URL}${endpoint}`, { ...options, headers });
  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(errorBody.error || `Request failed with status ${res.status}`);
  }
  return res.json();
}

export const api = {
  // Health & System
  getHealth: () => fetch('/health').then(r => r.json()),
  getCapabilities: () => request<SystemCapabilities>('/system/capabilities'),

  // Classrooms
  getClassrooms: () => request<Classroom[]>('/classrooms'),
  createClassroom: (data: Partial<Classroom>) =>
    request<Classroom>('/classrooms', { method: 'POST', body: JSON.stringify(data) }),

  // Participants
  getParticipants: (classroomId?: string) =>
    request<Participant[]>(classroomId ? `/participants?classroomId=${classroomId}` : '/participants'),
  createParticipant: (data: Partial<Participant>) =>
    request<Participant>('/participants', { method: 'POST', body: JSON.stringify(data) }),

  // Sessions
  getSessions: (classroomId?: string) =>
    request<Session[]>(classroomId ? `/sessions?classroomId=${classroomId}` : '/sessions'),
  createSession: (data: { classroomId: string; title: string; presenceThresholdSeconds?: number }) =>
    request<Session>('/sessions', { method: 'POST', body: JSON.stringify(data) }),
  startSession: (id: string) => request<Session>(`/sessions/${id}/start`, { method: 'POST' }),
  endSession: (id: string) => request<Session>(`/sessions/${id}/end`, { method: 'POST' }),

  // Attendance
  getAllAttendance: (sessionId?: string) =>
    request<AttendanceRecord[]>(sessionId && sessionId !== 'all' ? `/attendance?sessionId=${sessionId}` : '/attendance'),
  getAttendance: (sessionId: string) => request<AttendanceRecord[]>(`/sessions/${sessionId}/attendance`),
  updateAttendance: (id: string, data: Partial<AttendanceRecord>) =>
    request<AttendanceRecord>(`/attendance/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  sendDetections: (
    sessionId: string,
    detections: { trackingId: string; sustainedSeconds: number; participantId?: string; isPresent: boolean }[]
  ) =>
    request<{ updated: number; activeCount: number }>(`/sessions/${sessionId}/detections`, {
      method: 'POST',
      body: JSON.stringify({ detections }),
    }),

  // Metrics & Recommendations
  getMetrics: (sessionId: string) => request<SessionMetric[]>(`/sessions/${sessionId}/metrics`),
  getRecommendations: (sessionId: string) => request<Recommendation[]>(`/sessions/${sessionId}/recommendations`),
  recalculateRecommendations: (sessionId: string) =>
    request<Recommendation[]>(`/sessions/${sessionId}/recommendations/recalculate`, { method: 'POST' }),

  // Processing Jobs
  getJobs: () => request<ProcessingJob[]>('/processing-jobs'),
  createJob: (data: { sessionId: string; type: string; fileName?: string; fileSizeBytes?: number }) =>
    request<ProcessingJob>('/processing-jobs', { method: 'POST', body: JSON.stringify(data) }),

  // Reports
  getAttendanceCsvUrl: (sessionId?: string) =>
    `${BASE_URL}/reports/attendance.csv${sessionId && sessionId !== 'all' ? `?sessionId=${sessionId}` : ''}`,

  // Privacy & Auditing
  getPrivacySettings: () => request<PrivacySettings>('/privacy/settings'),
  updatePrivacySettings: (data: Partial<PrivacySettings>) =>
    request<PrivacySettings>('/privacy/settings', { method: 'PUT', body: JSON.stringify(data) }),
  getAuditEvents: () => request<AuditEvent[]>('/audit-events'),

  // Demo Seed
  resetDemoSeed: () => request<{ message: string; success: boolean }>('/seed', { method: 'POST' }),
};

import React, { useEffect, useState } from 'react';
import {
  Calendar,
  Plus,
  Play,
  Square,
  Clock,
  Users,
  Video,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { api } from '../services/api.ts';
import type { Session, Classroom } from '../types/index.ts';

interface SessionManagementProps {
  onNavigateToLive: (sessionId: string) => void;
  onNavigateToAttendance: (sessionId: string) => void;
}

export const SessionManagement: React.FC<SessionManagementProps> = ({
  onNavigateToLive,
  onNavigateToAttendance,
}) => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // New Session Modal
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState<string>('');
  const [selectedClassroomId, setSelectedClassroomId] = useState<string>('');
  const [presenceThreshold, setPresenceThreshold] = useState<number>(60);
  const [creating, setCreating] = useState<boolean>(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [sesList, clsList] = await Promise.all([api.getSessions(), api.getClassrooms()]);
      setSessions(sesList);
      setClassrooms(clsList);
      if (clsList.length > 0 && !selectedClassroomId) {
        setSelectedClassroomId(clsList[0].id);
      }
    } catch (err) {
      console.error('Failed to load sessions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !selectedClassroomId) return;
    try {
      setCreating(true);
      const created = await api.createSession({
        classroomId: selectedClassroomId,
        title: newTitle.trim(),
        presenceThresholdSeconds: presenceThreshold,
      });
      setSessions([created, ...sessions]);
      setShowCreateModal(false);
      setNewTitle('');
    } catch (err) {
      console.error('Failed to create session:', err);
    } finally {
      setCreating(false);
    }
  };

  const handleStartSession = async (id: string) => {
    try {
      const updated = await api.startSession(id);
      setSessions(sessions.map(s => (s.id === id ? updated : s)));
      onNavigateToLive(id);
    } catch (err) {
      console.error('Failed to start session:', err);
    }
  };

  const handleEndSession = async (id: string) => {
    try {
      const updated = await api.endSession(id);
      setSessions(sessions.map(s => (s.id === id ? updated : s)));
    } catch (err) {
      console.error('Failed to end session:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="glass-panel rounded-3xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight">Classroom Session Management</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Configure scheduled, active, and completed teaching sessions with sustained presence thresholds.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-5 py-2 rounded-full text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-lg shadow-indigo-500/25 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Schedule New Session</span>
        </button>
      </div>

      {/* Session Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {sessions.map(session => {
          const classroom = classrooms.find(c => c.id === session.classroomId);
          const isActive = session.status === 'active';
          const isCompleted = session.status === 'completed';

          return (
            <div
              key={session.id}
              className={`glass-card rounded-3xl p-6 flex flex-col justify-between transition-all ${
                isActive
                  ? 'border-emerald-400/40 bg-emerald-950/20 shadow-emerald-500/10'
                  : ''
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-[10px] font-mono font-bold ${
                      isActive
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 animate-pulse'
                        : isCompleted
                        ? 'bg-slate-800/80 text-slate-400 border border-white/5'
                        : 'bg-indigo-500/20 text-indigo-300 border border-indigo-400/30'
                    }`}
                  >
                    {session.status.toUpperCase()}
                  </span>
                  <span className="text-[11px] font-mono text-cyan-300">
                    Threshold: {session.presenceThresholdSeconds}s
                  </span>
                </div>

                <h3 className="text-base font-bold text-white leading-snug">{session.title}</h3>
                <div className="text-xs text-slate-400 mt-1 font-medium">
                  {classroom ? `${classroom.name} (${classroom.roomNumber})` : 'General Lecture Hall'}
                </div>

                <div className="mt-4 pt-3 border-t border-white/5 space-y-2 text-xs text-slate-400">
                  <div className="flex items-center justify-between">
                    <span>Started:</span>
                    <span className="font-mono text-slate-200">
                      {new Date(session.startTime).toLocaleString()}
                    </span>
                  </div>
                  {session.endTime && (
                    <div className="flex items-center justify-between">
                      <span>Concluded:</span>
                      <span className="font-mono text-slate-200">
                        {new Date(session.endTime).toLocaleString()}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span>Active Participants:</span>
                    <span className="font-mono text-cyan-300 font-bold">
                      {session.activeParticipantsCount ?? 0} / {session.totalEnrolledCount ?? 0} enrolled
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 pt-3 border-t border-white/5 flex items-center justify-between gap-2.5">
                {isActive ? (
                  <>
                    <button
                      onClick={() => onNavigateToLive(session.id)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-indigo-500/20"
                    >
                      <Video className="w-3.5 h-3.5" />
                      <span>Live Camera</span>
                    </button>
                    <button
                      onClick={() => handleEndSession(session.id)}
                      className="flex items-center justify-center gap-1 py-2 px-3.5 rounded-full glass-pill hover:bg-rose-500/20 text-rose-300 border-rose-500/30 text-xs font-bold transition-all"
                    >
                      <Square className="w-3.5 h-3.5" />
                      <span>End</span>
                    </button>
                  </>
                ) : isCompleted ? (
                  <button
                    onClick={() => onNavigateToAttendance(session.id)}
                    className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-full glass-pill hover:bg-white/15 text-slate-200 text-xs font-semibold transition-all"
                  >
                    <span>View Attendance Audit</span>
                    <ExternalLink className="w-3.5 h-3.5 text-cyan-300" />
                  </button>
                ) : (
                  <button
                    onClick={() => handleStartSession(session.id)}
                    className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold transition-all shadow-md shadow-emerald-600/20"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>Launch Session</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Session Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateSession}
            className="glass-panel rounded-3xl max-w-md w-full p-6 shadow-2xl border border-white/20 space-y-4"
          >
            <div className="flex items-center gap-2 pb-2 border-b border-white/10">
              <Calendar className="w-5 h-5 text-indigo-400" />
              <h3 className="text-base font-bold text-white">Schedule Classroom Session</h3>
            </div>

            <div className="space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">Session Title:</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Session 09: Dynamic Programming"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  className="w-full glass-pill rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">Classroom / Hall:</label>
                <select
                  value={selectedClassroomId}
                  onChange={e => setSelectedClassroomId(e.target.value)}
                  className="w-full glass-pill rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden"
                >
                  {classrooms.map(c => (
                    <option key={c.id} value={c.id} className="bg-slate-900">
                      {c.name} ({c.roomNumber})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Sustained Presence Threshold:
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min={15}
                    max={300}
                    step={15}
                    value={presenceThreshold}
                    onChange={e => setPresenceThreshold(Number(e.target.value))}
                    className="flex-1 accent-indigo-500"
                  />
                  <span className="font-mono text-xs text-cyan-300 font-bold w-12 text-right">
                    {presenceThreshold}s
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 block mt-1">
                  Required continuous detection duration before attendance is validated.
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white glass-pill rounded-full"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={creating}
                className="px-5 py-2 text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 rounded-full shadow-lg shadow-indigo-500/25 transition-all"
              >
                {creating ? 'Creating...' : 'Initialize Session'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

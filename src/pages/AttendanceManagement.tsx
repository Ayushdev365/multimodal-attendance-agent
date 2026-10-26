import React, { useEffect, useState } from 'react';
import {
  Download,
  Filter,
  Search,
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  Edit2,
  FileSpreadsheet,
  Check,
  UserCheck,
} from 'lucide-react';
import { api } from '../services/api.ts';
import type { Session, AttendanceRecord, AttendanceStatus, Participant, Classroom } from '../types/index.ts';

export const AttendanceManagement: React.FC = () => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string>('');
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Edit / Override Modal
  const [editingRecord, setEditingRecord] = useState<AttendanceRecord | null>(null);
  const [newStatus, setNewStatus] = useState<AttendanceStatus>('present');
  const [assignParticipantId, setAssignParticipantId] = useState<string>('');
  const [overrideNotes, setOverrideNotes] = useState<string>('');

  const loadData = async () => {
    try {
      setLoading(true);
      const [clsList, sesList] = await Promise.all([api.getClassrooms(), api.getSessions()]);
      setClassrooms(clsList);
      setSessions(sesList);

      const defaultSes = sesList.find(s => s.status === 'active') || sesList[0];
      if (defaultSes) {
        setSelectedSessionId(defaultSes.id);
        const [attList, partList] = await Promise.all([
          api.getAttendance(defaultSes.id),
          api.getParticipants(defaultSes.classroomId),
        ]);
        setAttendance(attList);
        setParticipants(partList);
      }
    } catch (err) {
      console.error('Error loading attendance management:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSessionChange = async (sessionId: string) => {
    setSelectedSessionId(sessionId);
    const ses = sessions.find(s => s.id === sessionId);
    if (!ses) return;
    try {
      setLoading(true);
      const [attList, partList] = await Promise.all([
        api.getAttendance(sessionId),
        api.getParticipants(ses.classroomId),
      ]);
      setAttendance(attList);
      setParticipants(partList);
    } catch (err) {
      console.error('Failed to change session:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveOverride = async () => {
    if (!editingRecord) return;
    try {
      const payload: Partial<AttendanceRecord> = {
        status: newStatus,
        notes: overrideNotes,
        verifiedByInstructor: true,
      };
      if (assignParticipantId) {
        payload.participantId = assignParticipantId;
      }
      await api.updateAttendance(editingRecord.id, payload);

      const updated = await api.getAttendance(selectedSessionId);
      setAttendance(updated);
      setEditingRecord(null);
    } catch (err) {
      console.error('Failed to save manual override:', err);
    }
  };

  const openEditModal = (rec: AttendanceRecord) => {
    setEditingRecord(rec);
    setNewStatus(rec.status);
    setAssignParticipantId(rec.participantId || '');
    setOverrideNotes(rec.notes || '');
  };

  // Filter attendance records
  const filteredRecords = attendance.filter(record => {
    const matchesSearch =
      !searchQuery ||
      (record.participantName && record.participantName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (record.participantCode && record.participantCode.toLowerCase().includes(searchQuery.toLowerCase())) ||
      record.trackingId.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || record.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const presentCount = attendance.filter(a => a.status === 'present').length;
  const lateCount = attendance.filter(a => a.status === 'late').length;
  const unverifiedCount = attendance.filter(a => a.status === 'unverified').length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="glass-panel rounded-3xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight">Attendance Roster & Verification</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time sustained presence logs with instructor oversight and manual override authority.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedSessionId}
            onChange={e => handleSessionChange(e.target.value)}
            className="glass-pill rounded-full px-4 py-2 text-xs text-white font-medium focus:outline-hidden cursor-pointer"
          >
            {sessions.map(s => (
              <option key={s.id} value={s.id} className="bg-slate-900">
                {s.title} ({s.status.toUpperCase()})
              </option>
            ))}
          </select>

          <a
            href={api.getAttendanceCsvUrl(selectedSessionId)}
            download
            className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-lg shadow-indigo-500/25 transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </a>
        </div>
      </div>

      {/* Filter and Status Tally Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <button
          onClick={() => setStatusFilter('all')}
          className={`p-4 rounded-3xl text-left transition-all glass-card ${
            statusFilter === 'all'
              ? 'border-indigo-400/50 bg-indigo-500/15 shadow-indigo-500/20'
              : ''
          }`}
        >
          <span className="text-xs font-semibold text-slate-400 block">Total Records</span>
          <span className="text-2xl font-bold font-sans text-white mt-1 block tabular-nums">
            {attendance.length}
          </span>
        </button>

        <button
          onClick={() => setStatusFilter('present')}
          className={`p-4 rounded-3xl text-left transition-all glass-card ${
            statusFilter === 'present'
              ? 'border-emerald-400/50 bg-emerald-500/15 shadow-emerald-500/20'
              : ''
          }`}
        >
          <span className="text-xs font-semibold text-slate-400 block">Verified Present</span>
          <span className="text-2xl font-bold font-sans text-emerald-400 mt-1 block tabular-nums">
            {presentCount}
          </span>
        </button>

        <button
          onClick={() => setStatusFilter('late')}
          className={`p-4 rounded-3xl text-left transition-all glass-card ${
            statusFilter === 'late'
              ? 'border-amber-400/50 bg-amber-500/15 shadow-amber-500/20'
              : ''
          }`}
        >
          <span className="text-xs font-semibold text-slate-400 block">Late Check-Ins</span>
          <span className="text-2xl font-bold font-sans text-amber-400 mt-1 block tabular-nums">
            {lateCount}
          </span>
        </button>

        <button
          onClick={() => setStatusFilter('unverified')}
          className={`p-4 rounded-3xl text-left transition-all glass-card ${
            statusFilter === 'unverified'
              ? 'border-cyan-400/50 bg-cyan-500/15 shadow-cyan-500/20'
              : ''
          }`}
        >
          <span className="text-xs font-semibold text-slate-400 block">Unverified Flags</span>
          <span className="text-2xl font-bold font-sans text-cyan-400 mt-1 block tabular-nums">
            {unverifiedCount}
          </span>
        </button>
      </div>

      {/* Search Input Bar */}
      <div className="glass-panel rounded-2xl p-3 flex items-center gap-3">
        <Search className="w-4 h-4 text-slate-400 ml-2" />
        <input
          type="text"
          placeholder="Filter by student name, code (e.g. PAR-101), or tracking ID..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="w-full bg-transparent text-xs text-white placeholder-slate-400 focus:outline-hidden"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="text-xs text-slate-400 hover:text-white mr-2"
          >
            Clear
          </button>
        )}
      </div>

      {/* Attendance Table */}
      <div className="glass-card-static rounded-3xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.02] text-slate-400 font-semibold">
                <th className="py-4 px-5">Participant</th>
                <th className="py-4 px-5">Tracking ID</th>
                <th className="py-4 px-5">First Seen</th>
                <th className="py-4 px-5">Last Seen</th>
                <th className="py-4 px-5">Observed Time</th>
                <th className="py-4 px-5">Status</th>
                <th className="py-4 px-5">Verification</th>
                <th className="py-4 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-sans">
              {filteredRecords.map(rec => {
                const durationMinutes = (rec.observedDurationSeconds / 60).toFixed(1);
                return (
                  <tr key={rec.id} className="hover:bg-white/[0.04] transition-colors">
                    <td className="py-3.5 px-5">
                      <div className="font-bold text-white">
                        {rec.participantName || <span className="text-amber-400 italic">Unassigned Tracked Person</span>}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                        {rec.participantCode || 'Awaiting Enrollment'}
                      </div>
                    </td>

                    <td className="py-3.5 px-5 font-mono text-cyan-300 font-medium">{rec.trackingId}</td>

                    <td className="py-3.5 px-5 text-slate-400 font-mono text-[11px]">
                      {rec.firstSeenAt ? new Date(rec.firstSeenAt).toLocaleTimeString() : '—'}
                    </td>

                    <td className="py-3.5 px-5 text-slate-400 font-mono text-[11px]">
                      {rec.lastSeenAt ? new Date(rec.lastSeenAt).toLocaleTimeString() : '—'}
                    </td>

                    <td className="py-3.5 px-5 font-mono text-slate-200 tabular-nums font-semibold">
                      {durationMinutes} min ({rec.observedDurationSeconds}s)
                    </td>

                    <td className="py-3.5 px-5">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-[11px] font-bold font-mono ${
                          rec.status === 'present'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30'
                            : rec.status === 'late'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-400/30'
                            : rec.status === 'unverified'
                            ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/30'
                            : 'bg-rose-500/20 text-rose-300 border border-rose-400/30'
                        }`}
                      >
                        {rec.status.toUpperCase()}
                      </span>
                    </td>

                    <td className="py-3.5 px-5">
                      {rec.verifiedByInstructor ? (
                        <div className="flex items-center gap-1.5 text-emerald-300 text-xs font-medium">
                          <Check className="w-3.5 h-3.5" />
                          <span>Instructor Verified</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-amber-300 text-xs font-medium">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>Unverified</span>
                        </div>
                      )}
                      {rec.manualOverride && (
                        <span className="text-[10px] text-indigo-300 font-mono block mt-0.5">
                          Manual Override
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-5 text-right">
                      <button
                        onClick={() => openEditModal(rec)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full glass-pill text-white text-xs font-semibold hover:bg-white/15 transition-all"
                      >
                        <Edit2 className="w-3 h-3 text-cyan-300" />
                        <span>Override</span>
                      </button>
                    </td>
                  </tr>
                );
              })}

              {filteredRecords.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500 text-xs">
                    No matching attendance records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual Override & Verification Modal */}
      {editingRecord && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-white/20 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-base font-bold text-white">Manual Attendance Correction</h3>
              <span className="text-xs font-mono text-cyan-300">{editingRecord.trackingId}</span>
            </div>

            <div className="space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Enrolled Participant:
                </label>
                <select
                  value={assignParticipantId}
                  onChange={e => setAssignParticipantId(e.target.value)}
                  className="w-full glass-pill rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden"
                >
                  <option value="" className="bg-slate-900">-- Leave Unassigned / Anonymous Track --</option>
                  {participants.map(p => (
                    <option key={p.id} value={p.id} className="bg-slate-900">
                      {p.name} ({p.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Attendance Status:
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {(['present', 'late', 'absent', 'unverified'] as AttendanceStatus[]).map(st => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setNewStatus(st)}
                      className={`py-2 text-xs font-mono rounded-xl font-bold border transition-all ${
                        newStatus === st
                          ? 'bg-indigo-600/40 text-cyan-300 border-cyan-400 shadow-md shadow-indigo-500/25'
                          : 'glass-pill text-slate-400 hover:text-white'
                      }`}
                    >
                      {st.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Audit Notes / Reason:
                </label>
                <textarea
                  value={overrideNotes}
                  onChange={e => setOverrideNotes(e.target.value)}
                  rows={3}
                  placeholder="e.g. Verified by instructor; medical accommodation."
                  className="w-full glass-pill rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
              <button
                onClick={() => setEditingRecord(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white glass-pill rounded-full"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveOverride}
                className="px-5 py-2 text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 rounded-full shadow-lg shadow-indigo-500/25"
              >
                Save Override
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useEffect, useState } from 'react';
import {
  FileSpreadsheet,
  Download,
  Calendar,
  CheckCircle2,
  Clock,
  Printer,
  FileText,
  BarChart,
  RefreshCw,
} from 'lucide-react';
import { api } from '../services/api.ts';
import type { Session, AttendanceRecord, Classroom } from '../types/index.ts';

export const ReportsPage: React.FC = () => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string>('all');
  const [allAttendance, setAllAttendance] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const loadData = async () => {
    try {
      setIsRefreshing(true);
      const [sesList, clsList, records] = await Promise.all([
        api.getSessions(),
        api.getClassrooms(),
        api.getAllAttendance(),
      ]);
      setSessions(sesList);
      setClassrooms(clsList);
      setAllAttendance(records);
    } catch (err) {
      console.error('Failed to load reports data:', err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredAttendance =
    selectedSessionId === 'all'
      ? allAttendance
      : allAttendance.filter(a => a.sessionId === selectedSessionId);

  const presentCount = filteredAttendance.filter(a => a.status === 'present').length;
  const lateCount = filteredAttendance.filter(a => a.status === 'late').length;
  const unverifiedCount = filteredAttendance.filter(a => a.status === 'unverified').length;
  const absentCount = filteredAttendance.filter(a => a.status === 'absent').length;
  const total = filteredAttendance.length;

  const attendanceRate = total > 0 ? Math.round(((presentCount + lateCount) / total) * 100) : 0;
  const totalDurationMinutes =
    total > 0
      ? (
          filteredAttendance.reduce((acc, a) => acc + a.observedDurationSeconds, 0) /
          total /
          60
        ).toFixed(1)
      : '0.0';

  const downloadCsv = () => {
    const url = api.getAttendanceCsvUrl(selectedSessionId === 'all' ? undefined : selectedSessionId);
    window.location.href = url;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-panel rounded-3xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg font-bold text-white tracking-tight">
              Attendance Audit & Accreditation Reports
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Standardized presence records, observed durations, and verifiable institutional summaries.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Refresh Button */}
          <button
            onClick={loadData}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3 py-2 rounded-full glass-pill text-xs font-semibold text-slate-300 hover:text-white transition-all disabled:opacity-50"
            title="Refresh Attendance Data"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          {/* Session Filter Dropdown */}
          <select
            value={selectedSessionId}
            onChange={e => setSelectedSessionId(e.target.value)}
            className="glass-pill rounded-full px-4 py-2 text-xs text-white font-medium focus:outline-hidden cursor-pointer"
          >
            <option value="all" className="bg-slate-900">
              All Sessions ({allAttendance.length} total entries)
            </option>
            {sessions.map(s => {
              const count = allAttendance.filter(a => a.sessionId === s.id).length;
              return (
                <option key={s.id} value={s.id} className="bg-slate-900">
                  {s.title} ({count} entries)
                </option>
              );
            })}
          </select>

          {/* CSV Download Button */}
          <button
            onClick={downloadCsv}
            className="flex items-center gap-2 px-5 py-2 rounded-full text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-lg shadow-indigo-500/25 transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Download CSV Audit File</span>
          </button>
        </div>
      </div>

      {/* Metric Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card rounded-3xl p-5">
          <span className="text-xs font-semibold text-slate-400 block">Overall Presence Rate</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-sans text-emerald-400 tabular-nums">{attendanceRate}%</span>
            <span className="text-xs text-emerald-300 font-mono">present or late</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 font-mono">
            {presentCount + lateCount} of {total} verified present
          </div>
        </div>

        <div className="glass-card rounded-3xl p-5">
          <span className="text-xs font-semibold text-slate-400 block">Avg. Observed Duration</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-sans text-white tabular-nums">{totalDurationMinutes}</span>
            <span className="text-xs text-cyan-300 font-mono">minutes/student</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 font-mono">Mean continuous in-frame time</div>
        </div>

        <div className="glass-card rounded-3xl p-5">
          <span className="text-xs font-semibold text-slate-400 block">Late Check-Ins</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-sans text-amber-400 tabular-nums">{lateCount}</span>
            <span className="text-xs text-slate-400 font-mono">participants</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 font-mono">First seen &gt;15m after start</div>
        </div>

        <div className="glass-card rounded-3xl p-5">
          <span className="text-xs font-semibold text-slate-400 block">Unverified Flags</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-sans text-cyan-400 tabular-nums">{unverifiedCount}</span>
            <span className="text-xs text-slate-400 font-mono">pending</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 font-mono">Awaiting instructor assignment</div>
        </div>
      </div>

      {/* Report Preview Table */}
      <div className="glass-card-static rounded-3xl p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div>
            <h3 className="text-sm font-bold text-white">Accreditation Report Preview</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Exact table structure formatted for institutional audit and accreditation exports.
            </p>
          </div>
          <span className="text-xs font-mono text-cyan-300 glass-pill px-3 py-1 rounded-full">
            {filteredAttendance.length} records verified
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.02] text-slate-400 font-semibold">
                <th className="py-4 px-4">Participant Code</th>
                <th className="py-4 px-4">Student Name</th>
                <th className="py-4 px-4">Session ID</th>
                <th className="py-4 px-4">Status</th>
                <th className="py-4 px-4">Duration</th>
                <th className="py-4 px-4">First Seen</th>
                <th className="py-4 px-4">Verified</th>
                <th className="py-4 px-4 text-right">Audit Type</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-sans">
              {filteredAttendance.map(rec => (
                <tr key={rec.id} className="hover:bg-white/[0.04] transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-cyan-300">{rec.participantCode || 'PENDING'}</td>
                  <td className="py-3 px-4 font-bold text-white">
                    {rec.participantName || <span className="text-amber-400 italic">Unassigned Track</span>}
                  </td>
                  <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">{rec.sessionId}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                        rec.status === 'present'
                          ? 'text-emerald-300 bg-emerald-500/20 border border-emerald-400/30'
                          : rec.status === 'late'
                          ? 'text-amber-300 bg-amber-500/20 border border-amber-400/30'
                          : rec.status === 'unverified'
                          ? 'text-cyan-300 bg-cyan-500/20 border border-cyan-400/30'
                          : 'text-rose-300 bg-rose-500/20 border border-rose-400/30'
                      }`}
                    >
                      {rec.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-200 font-mono font-medium">
                    {Math.floor(rec.observedDurationSeconds / 60)}m {rec.observedDurationSeconds % 60}s
                  </td>
                  <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">
                    {rec.firstSeenAt ? new Date(rec.firstSeenAt).toLocaleTimeString() : '—'}
                  </td>
                  <td className="py-3 px-4 text-slate-300 font-semibold">{rec.verifiedByInstructor ? 'YES' : 'NO'}</td>
                  <td className="py-3 px-4 text-right text-slate-400 font-mono text-[11px]">
                    {rec.manualOverride ? (
                      <span className="text-indigo-300 font-bold">OVERRIDE</span>
                    ) : (
                      'AUTOMATED'
                    )}
                  </td>
                </tr>
              ))}

              {filteredAttendance.length === 0 && !loading && (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500 text-xs">
                    No attendance records logged yet for the selected session.
                  </td>
                </tr>
              )}

              {loading && (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400 text-xs">
                    Loading accreditation records...
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

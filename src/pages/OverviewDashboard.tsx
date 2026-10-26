import React, { useEffect, useState } from 'react';
import {
  Users,
  Video,
  Clock,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCcw,
  Sparkles,
  TrendingUp,
  Activity,
  Mic,
  MoreVertical,
  Layers,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { api } from '../services/api.ts';
import type { Classroom, Session, AttendanceRecord, SystemCapabilities, SessionMetric } from '../types/index.ts';

interface OverviewDashboardProps {
  onNavigate: (tab: 'live' | 'attendance' | 'sessions' | 'participants' | 'analytics' | 'recommendations' | 'reports' | 'privacy') => void;
  onSelectSession: (sessionId: string) => void;
}

export const OverviewDashboard: React.FC<OverviewDashboardProps> = ({ onNavigate, onSelectSession }) => {
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [metrics, setMetrics] = useState<SessionMetric[]>([]);
  const [capabilities, setCapabilities] = useState<SystemCapabilities | null>(null);
  const [autoSync, setAutoSync] = useState(true);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const [clsData, sesData, capData] = await Promise.all([
        api.getClassrooms(),
        api.getSessions(),
        api.getCapabilities(),
      ]);
      setClassrooms(clsData);
      setSessions(sesData);
      setCapabilities(capData);

      const activeSes = sesData.find(s => s.status === 'active') || sesData[0];
      if (activeSes) {
        const [attData, metData] = await Promise.all([
          api.getAttendance(activeSes.id),
          api.getMetrics(activeSes.id),
        ]);
        setAttendance(attData);
        setMetrics(metData);
      }
    } catch (err) {
      console.error('Failed to load overview data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const activeSession = sessions.find(s => s.status === 'active');
  const presentCount = attendance.filter(a => a.status === 'present').length;
  const lateCount = attendance.filter(a => a.status === 'late').length;
  const unverifiedCount = attendance.filter(a => a.status === 'unverified').length;
  const totalTracked = attendance.length;
  const attendanceRate = totalTracked > 0 ? Math.round(((presentCount + lateCount) / totalTracked) * 100) : 0;

  // Chart data formatted for smooth Lumina-style glow spline
  const chartData = metrics.length > 0
    ? metrics.map(m => ({
        time: `${m.minuteOffset}m`,
        value: Math.round(m.visibleParticipantsCount * 14.2), // scaled for rich visual display
        rawCount: m.visibleParticipantsCount,
        voice: Math.round(m.voiceActivityRatio * 100),
      }))
    : [
        { time: '0m', value: 25, rawCount: 6, voice: 45 },
        { time: '5m', value: 38, rawCount: 6, voice: 52 },
        { time: '10m', value: 32, rawCount: 6, voice: 48 },
        { time: '15m', value: 55, rawCount: 7, voice: 60 },
        { time: '20m', value: 48, rawCount: 7, voice: 58 },
        { time: '25m', value: 72, rawCount: 7, voice: 70 },
        { time: '30m', value: 85, rawCount: 7, voice: 75 },
        { time: '35m', value: 78, rawCount: 7, voice: 68 },
        { time: '40m', value: 92, rawCount: 7, voice: 80 },
      ];

  return (
    <div className="space-y-6">
      {/* 4 Apple Liquid Glass KPI Cards matching Lumina reference */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Attendance Rate (Violet Glow) */}
        <div className="glass-card rounded-3xl p-5 relative overflow-hidden group">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500/30 to-purple-600/30 border border-violet-400/30 flex items-center justify-center text-violet-300 shadow-md shadow-violet-500/20 group-hover:scale-105 transition-transform">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-400 block">Present & Verified</span>
              <div className="text-2xl font-bold text-white font-sans mt-0.5 tabular-nums">
                {attendanceRate}%
              </div>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between text-xs pt-3 border-t border-white/5">
            <span className="text-emerald-400 font-semibold flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+8.4%</span>
            </span>
            <span className="text-slate-400 text-[11px] font-mono">
              {presentCount} of {totalTracked} verified
            </span>
          </div>
        </div>

        {/* Card 2: Active In Frame (Indigo/Blue Glow) */}
        <div className="glass-card rounded-3xl p-5 relative overflow-hidden group">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500/30 to-indigo-600/30 border border-blue-400/30 flex items-center justify-center text-blue-300 shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-400 block">Active In Camera FOV</span>
              <div className="text-2xl font-bold text-white font-sans mt-0.5 tabular-nums">
                {activeSession ? activeSession.activeParticipantsCount ?? 7 : 0}
                <span className="text-xs font-normal text-slate-400 ml-1.5 font-mono">
                  / {activeSession?.totalEnrolledCount ?? 8} enrolled
                </span>
              </div>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between text-xs pt-3 border-t border-white/5">
            <span className="text-blue-400 font-semibold flex items-center gap-1">
              <Video className="w-3.5 h-3.5" />
              <span>Sustained &gt;60s</span>
            </span>
            <span className="text-slate-400 text-[11px] font-mono">Live Session</span>
          </div>
        </div>

        {/* Card 3: Unverified Review (Teal/Cyan Glow) */}
        <div className="glass-card rounded-3xl p-5 relative overflow-hidden group">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500/30 to-teal-600/30 border border-cyan-400/30 flex items-center justify-center text-cyan-300 shadow-md shadow-cyan-500/20 group-hover:scale-105 transition-transform">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-400 block">Unverified Identities</span>
              <div className="text-2xl font-bold text-white font-sans mt-0.5 tabular-nums">
                {unverifiedCount}
              </div>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between text-xs pt-3 border-t border-white/5">
            <button
              onClick={() => onNavigate('attendance')}
              className="text-cyan-300 hover:text-cyan-200 font-semibold underline text-xs"
            >
              Verify in 1 click
            </button>
            <span className="text-slate-400 text-[11px] font-mono">Zero biometric risk</span>
          </div>
        </div>

        {/* Card 4: Acoustic Speaking Ratio (Pink/Rose Glow) */}
        <div className="glass-card rounded-3xl p-5 relative overflow-hidden group">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-500/30 to-rose-600/30 border border-pink-400/30 flex items-center justify-center text-pink-300 shadow-md shadow-pink-500/20 group-hover:scale-105 transition-transform">
              <Mic className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-400 block">Acoustic Activity</span>
              <div className="text-2xl font-bold text-white font-sans mt-0.5 tabular-nums">
                68%
              </div>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between text-xs pt-3 border-t border-white/5">
            <span className="text-emerald-400 font-semibold flex items-center gap-1">
              <span>●</span>
              <span>Interactive</span>
            </span>
            <span className="text-slate-400 text-[11px] font-mono">Acoustic VAD</span>
          </div>
        </div>
      </div>

      {/* Middle Section: Lumina Spline Area Chart (Left) + Donut Ring Progress (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Glowing Spline Area Chart */}
        <div className="lg:col-span-8 glass-card-static rounded-3xl p-6 relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4">
            <div>
              <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider block">
                Session Trajectory
              </span>
              <div className="flex items-baseline gap-3 mt-1">
                <h2 className="text-2xl font-extrabold text-white">88% Presence Index</h2>
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  ↑ 12.5% vs avg
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="glass-pill rounded-full px-3 py-1 text-xs text-slate-300 font-medium">
                {activeSession ? activeSession.title.slice(0, 24) + '...' : 'Current Session'}
              </div>
              <button
                onClick={() => onNavigate('analytics')}
                className="w-8 h-8 rounded-full glass-pill flex items-center justify-center text-slate-400 hover:text-white"
                title="View in Analytics"
              >
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Glowing Continuous Spline Area Chart */}
          <div className="h-64 sm:h-72 w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 15, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="luminaGlow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.45} />
                    <stop offset="60%" stopColor="#3b82f6" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                  </linearGradient>
                  <filter id="shadowFilter" height="200%">
                    <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#8b5cf6" floodOpacity="0.4" />
                  </filter>
                </defs>
                <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="glass-panel px-3.5 py-2.5 rounded-2xl shadow-xl border border-white/20 text-xs">
                          <div className="text-[10px] text-slate-400 font-mono">Time offset: {payload[0].payload.time}</div>
                          <div className="text-sm font-bold text-white mt-0.5">
                            {payload[0].payload.rawCount} Participants Visible
                          </div>
                          <div className="text-[11px] text-cyan-300 font-medium">
                            Speech Activity: {payload[0].payload.voice}%
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#c084fc"
                  strokeWidth={3}
                  filter="url(#shadowFilter)"
                  fillOpacity={1}
                  fill="url(#luminaGlow)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Circular Donut Ring Progress matching Lumina reference */}
        <div className="lg:col-span-4 glass-card-static rounded-3xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3">
              <h3 className="text-sm font-bold text-white tracking-wide">Session Progress</h3>
              <button
                onClick={() => onNavigate('sessions')}
                className="text-slate-400 hover:text-white"
              >
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>

            {/* Circular Ring Graphic */}
            <div className="relative w-40 h-40 mx-auto my-4 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
                {/* Background Ring */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="transparent"
                  stroke="rgba(255, 255, 255, 0.08)"
                  strokeWidth="9"
                />
                {/* Progress Glowing Stroke */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="transparent"
                  stroke="url(#donutGradient)"
                  strokeWidth="9"
                  strokeDasharray="238.7"
                  strokeDashoffset={238.7 * (1 - 0.72)}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out"
                />
                <defs>
                  <linearGradient id="donutGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#8b5cf6" />
                    <stop offset="50%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#06b6d4" />
                  </linearGradient>
                </defs>
              </svg>
              {/* Center Donut Label */}
              <div className="absolute text-center">
                <span className="text-2xl font-extrabold text-white font-sans block">72%</span>
                <span className="text-[10px] uppercase tracking-widest font-semibold text-slate-400">Complete</span>
              </div>
            </div>
          </div>

          {/* Donut Legend */}
          <div className="space-y-2 text-xs pt-3 border-t border-white/5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-xs shadow-cyan-400/50" />
                <span className="text-slate-300">Continuous Presence</span>
              </div>
              <span className="font-mono font-bold text-white">90%</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-indigo-400 shadow-xs shadow-indigo-400/50" />
                <span className="text-slate-300">Acoustic Activity</span>
              </div>
              <span className="font-mono font-bold text-white">72%</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-xs shadow-amber-400/50" />
                <span className="text-slate-300">Late Check-Ins</span>
              </div>
              <span className="font-mono font-bold text-white">45%</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-teal-400 shadow-xs shadow-teal-400/50" />
                <span className="text-slate-300">Data Quality</span>
              </div>
              <span className="font-mono font-bold text-white">96%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section: System Status Bar (Left) + Notification / Audit Stream (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: System Status Card matching Lumina reference */}
        <div className="lg:col-span-7 glass-card-static rounded-3xl p-6">
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div>
              <h3 className="text-sm font-bold text-white">System Status & Hardware Engines</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Local inference engines executing in-process with zero external data transmissions.
              </p>
            </div>
            <button
              onClick={() => api.resetDemoSeed().then(loadData)}
              className="glass-pill px-3 py-1.5 rounded-xl text-xs text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors"
              title="Reset demo seed state"
            >
              <RotateCcw className="w-3.5 h-3.5 text-indigo-400" />
              <span>Reset</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-4">
            <div className="p-3.5 rounded-2xl glass-pill">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-bold text-white">API Services</span>
              </div>
              <span className="text-[11px] font-mono text-emerald-400 mt-1 block">Operational</span>
            </div>

            <div className="p-3.5 rounded-2xl glass-pill">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-bold text-white">Vision Pipeline</span>
              </div>
              <span className="text-[11px] font-mono text-emerald-400 mt-1 block">MediaPipe Ready</span>
            </div>

            <div className="p-3.5 rounded-2xl glass-pill">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-bold text-white">Acoustic VAD</span>
              </div>
              <span className="text-[11px] font-mono text-emerald-400 mt-1 block">RMS Sub-Frame</span>
            </div>
          </div>

          {/* Auto-sync glass toggle */}
          <div className="pt-3 border-t border-white/5 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-white block">Real-Time Ingestion</span>
              <span className="text-[11px] text-slate-400">Keep attendance synchronized live</span>
            </div>
            <button
              onClick={() => setAutoSync(!autoSync)}
              className={`w-12 h-6 rounded-full transition-colors relative focus:outline-hidden p-0.5 ${
                autoSync ? 'bg-gradient-to-r from-violet-600 to-indigo-600' : 'bg-slate-700'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white shadow-md transition-transform duration-200 ${
                  autoSync ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Right: Notifications / Live Stream Cards matching Lumina reference */}
        <div className="lg:col-span-5 glass-card-static rounded-3xl p-6">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <h3 className="text-sm font-bold text-white">Classroom Activity Log</h3>
            <button
              onClick={() => onNavigate('privacy')}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
            >
              View all
            </button>
          </div>

          <div className="space-y-3 mt-3.5">
            <div className="p-3 rounded-2xl glass-pill flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300 shrink-0 mt-0.5">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <div className="font-semibold text-white">Sustained Threshold Met</div>
                <div className="text-slate-400 text-[11px] mt-0.5">Alex Rivera (PAR-101) verified &gt;60s</div>
                <div className="text-[10px] text-slate-500 font-mono mt-1">2 mins ago</div>
              </div>
            </div>

            <div className="p-3 rounded-2xl glass-pill flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-300 shrink-0 mt-0.5">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <div className="font-semibold text-white">Unverified Participant In Frame</div>
                <div className="text-slate-400 text-[11px] mt-0.5">TRK-07 tracked at Row 3, Seat 4</div>
                <div className="text-[10px] text-slate-500 font-mono mt-1">15 mins ago</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

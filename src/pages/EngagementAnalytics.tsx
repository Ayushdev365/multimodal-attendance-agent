import React, { useEffect, useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  Activity,
  Mic,
  Eye,
  Info,
  ShieldAlert,
  Calendar,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { api } from '../services/api.ts';
import type { Session, SessionMetric } from '../types/index.ts';

export const EngagementAnalytics: React.FC = () => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string>('');
  const [metrics, setMetrics] = useState<SessionMetric[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        const sesList = await api.getSessions();
        setSessions(sesList);
        const active = sesList.find(s => s.status === 'active') || sesList[0];
        if (active) {
          setSelectedSessionId(active.id);
          const data = await api.getMetrics(active.id);
          setMetrics(data);
        }
      } catch (err) {
        console.error('Failed to load metrics:', err);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const handleSessionChange = async (id: string) => {
    setSelectedSessionId(id);
    try {
      setLoading(true);
      const data = await api.getMetrics(id);
      setMetrics(data);
    } catch (err) {
      console.error('Failed to update metrics for session:', err);
    } finally {
      setLoading(false);
    }
  };

  const chartData = metrics.map(m => ({
    time: `${m.minuteOffset}m`,
    visibleCount: m.visibleParticipantsCount,
    voiceActivityPercent: Math.round(m.voiceActivityRatio * 100),
    movementIndexPercent: Math.round(m.movementIndex * 100),
    instructorSpeechPercent: Math.round(m.instructorSpeakingRatio * 100),
    qualityScorePercent: Math.round(m.dataQualityScore * 100),
  }));

  const avgVoice =
    metrics.length > 0
      ? Math.round((metrics.reduce((acc, m) => acc + m.voiceActivityRatio, 0) / metrics.length) * 100)
      : 0;

  const avgInstructor =
    metrics.length > 0
      ? Math.round((metrics.reduce((acc, m) => acc + m.instructorSpeakingRatio, 0) / metrics.length) * 100)
      : 0;

  const avgMovement =
    metrics.length > 0
      ? Math.round((metrics.reduce((acc, m) => acc + m.movementIndex, 0) / metrics.length) * 100)
      : 0;

  const avgConfidence =
    metrics.length > 0
      ? Math.round((metrics.reduce((acc, m) => acc + m.dataQualityScore, 0) / metrics.length) * 100)
      : 0;

  return (
    <div className="space-y-6">
      {/* Header & Session Selector */}
      <div className="glass-panel rounded-3xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight">Observable Engagement Analytics</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Acoustic speech dynamics, participant frame counts, and observable room activity signals.
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
                {s.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Mandatory Scientific Guardrail Notice */}
      <div className="p-4 rounded-3xl glass-card border-indigo-400/20 text-xs text-slate-300 flex items-start gap-3.5">
        <div className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300 shrink-0 mt-0.5">
          <Info className="w-4 h-4" />
        </div>
        <div className="space-y-1">
          <span className="font-bold text-white block">Methodological Transparency:</span>
          <p className="text-slate-400 leading-relaxed text-[11px]">
            These analytics measure <em>observable acoustic energy intervals</em>, <em>optical movement pixel deltas</em>, and <em>detected person counts</em> across the session timeline. In accordance with pedagogical standards, they <strong>do not claim to establish internal student attention, cognitive comprehension, motivation, or emotional affect</strong>, and must never be used to rank or penalize individuals.
          </p>
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card rounded-3xl p-5">
          <span className="text-xs font-semibold text-slate-400 block">Avg. Voice Activity</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-sans text-white tabular-nums">{avgVoice}%</span>
            <span className="text-xs text-cyan-300 font-mono">speech window</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 font-mono">Local acoustic VAD</div>
        </div>

        <div className="glass-card rounded-3xl p-5">
          <span className="text-xs font-semibold text-slate-400 block">Instructor Monologue</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-sans text-indigo-300 tabular-nums">{avgInstructor}%</span>
            <span className="text-xs text-slate-400 font-mono">predominant speech</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 font-mono">Front-zone acoustic source</div>
        </div>

        <div className="glass-card rounded-3xl p-5">
          <span className="text-xs font-semibold text-slate-400 block">Observable Movement</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-sans text-violet-300 tabular-nums">{avgMovement}%</span>
            <span className="text-xs text-slate-400 font-mono">motion density</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 font-mono">Pixel vector displacement</div>
        </div>

        <div className="glass-card rounded-3xl p-5">
          <span className="text-xs font-semibold text-slate-400 block">Data Quality / Confidence</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-sans text-emerald-400 tabular-nums">{avgConfidence}%</span>
            <span className="text-xs text-emerald-400 font-mono">high capture</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 font-mono">Lighting & FPS stability</div>
        </div>
      </div>

      {/* Chart 1: Participant Visibility & Movement Trends */}
      <div className="glass-card-static rounded-3xl p-6 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-white/10">
          <div>
            <h3 className="text-sm font-bold text-white">Participant Presence & Observable Activity</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Visible participant count alongside normalized movement index across the session.
            </p>
          </div>
          <span className="text-xs font-mono text-cyan-300 glass-pill px-3 py-1 rounded-full">
            5-min intervals
          </span>
        </div>

        <div className="h-64 sm:h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorVis" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="colorMov" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#a855f7" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#a855f7" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="time" stroke="#64748B" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis stroke="#64748B" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(18, 25, 46, 0.90)',
                  borderColor: 'rgba(255, 255, 255, 0.2)',
                  borderRadius: '16px',
                  backdropFilter: 'blur(16px)',
                  fontSize: '12px',
                  color: '#ffffff',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              <Area
                type="monotone"
                dataKey="visibleCount"
                name="Visible In Frame"
                stroke="#38bdf8"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#colorVis)"
              />
              <Area
                type="monotone"
                dataKey="movementIndexPercent"
                name="Movement Index (%)"
                stroke="#a855f7"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#colorMov)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 2: Speech vs. Silence Acoustic Dynamics */}
      <div className="glass-card-static rounded-3xl p-6 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-white/10">
          <div>
            <h3 className="text-sm font-bold text-white">Speech vs. Silence Acoustic Dynamics</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Aggregate voice activity ratio compared against instructor speech distribution.
            </p>
          </div>
          <span className="text-xs font-mono text-indigo-300 glass-pill px-3 py-1 rounded-full">
            Acoustic VAD
          </span>
        </div>

        <div className="h-64 sm:h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey="time" stroke="#64748B" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis stroke="#64748B" tick={{ fontSize: 11, fill: '#94a3b8' }} domain={[0, 100]} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(18, 25, 46, 0.90)',
                  borderColor: 'rgba(255, 255, 255, 0.2)',
                  borderRadius: '16px',
                  backdropFilter: 'blur(16px)',
                  fontSize: '12px',
                  color: '#ffffff',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              <Line
                type="monotone"
                dataKey="voiceActivityPercent"
                name="Total Speech Activity (%)"
                stroke="#34d399"
                strokeWidth={2.5}
                dot={{ r: 4, fill: '#34d399' }}
              />
              <Line
                type="monotone"
                dataKey="instructorSpeechPercent"
                name="Instructor Speech (%)"
                stroke="#fbbf24"
                strokeWidth={2.5}
                dot={{ r: 4, fill: '#fbbf24' }}
              />
              <Line
                type="monotone"
                dataKey="qualityScorePercent"
                name="Data Quality (%)"
                stroke="#94a3b8"
                strokeDasharray="4 4"
                strokeWidth={1.5}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

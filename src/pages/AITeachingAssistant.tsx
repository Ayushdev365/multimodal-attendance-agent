import React, { useEffect, useState } from 'react';
import {
  Sparkles,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  RefreshCw,
  Lightbulb,
  Clock,
  ShieldAlert,
  ArrowRight,
  TrendingDown,
  Layers,
} from 'lucide-react';
import { api } from '../services/api.ts';
import type { Session, Recommendation } from '../types/index.ts';

export const AITeachingAssistant: React.FC = () => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string>('');
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [recalculating, setRecalculating] = useState<boolean>(false);

  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        const sesList = await api.getSessions();
        setSessions(sesList);
        const active = sesList.find(s => s.status === 'active') || sesList[0];
        if (active) {
          setSelectedSessionId(active.id);
          const recs = await api.getRecommendations(active.id);
          setRecommendations(recs);
        }
      } catch (err) {
        console.error('Failed to load recommendations:', err);
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
      const recs = await api.getRecommendations(id);
      setRecommendations(recs);
    } catch (err) {
      console.error('Failed to update recommendations for session:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRecalculate = async () => {
    if (!selectedSessionId) return;
    try {
      setRecalculating(true);
      const updated = await api.recalculateRecommendations(selectedSessionId);
      setRecommendations(updated);
    } catch (err) {
      console.error('Failed to recalculate recommendations:', err);
    } finally {
      setRecalculating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-panel rounded-3xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-400" />
            <h2 className="text-lg font-bold text-white tracking-tight">
              Evidence-Based Teaching Assistant
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Deterministic pedagogical feedback derived from acoustic energy, turn-taking intervals, and room visibility.
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

          <button
            onClick={handleRecalculate}
            disabled={recalculating}
            className="flex items-center gap-2 px-5 py-2 rounded-full text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 shadow-lg shadow-indigo-500/25 transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${recalculating ? 'animate-spin' : ''}`} />
            <span>{recalculating ? 'Evaluating...' : 'Recalculate Rules'}</span>
          </button>
        </div>
      </div>

      {/* Epistemological Transparency Notice */}
      <div className="p-4 rounded-3xl glass-card border-amber-400/20 text-xs text-slate-300 flex items-start gap-3.5">
        <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-300 shrink-0 mt-0.5">
          <ShieldAlert className="w-4 h-4" />
        </div>
        <div className="space-y-1">
          <span className="font-bold text-white block">Rule-Based Pedagogical Engine:</span>
          <p className="text-slate-400 leading-relaxed text-[11px]">
            Recommendations are generated using verified instructional strategies (e.g. 15-minute monologue thresholds, speech-to-silence ratio drops, and acoustic turn-taking transitions). Every card includes concrete empirical observations, confidence levels, and explicit pedagogical limitations.
          </p>
        </div>
      </div>

      {/* Recommendations List */}
      <div className="space-y-4">
        {recommendations.map(rec => {
          const isHigh = rec.priority === 'high';
          const isMedium = rec.priority === 'medium';

          return (
            <div
              key={rec.id}
              className={`glass-card rounded-3xl p-6 space-y-4 transition-all ${
                isHigh
                  ? 'border-amber-400/40 bg-gradient-to-br from-amber-500/[0.08] to-slate-900/60 shadow-amber-500/10'
                  : 'border-white/10'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase ${
                      isHigh
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-400/30'
                        : isMedium
                        ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-400/30'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30'
                    }`}
                  >
                    {rec.priority} Priority
                  </span>
                  <h3 className="text-sm font-bold text-white">{rec.title}</h3>
                </div>

                <div className="flex items-center gap-3 text-xs font-mono text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-cyan-300" />
                    <span>Interval: {rec.timeInterval}</span>
                  </div>
                  <span>·</span>
                  <div className="flex items-center gap-1 text-emerald-400 font-bold">
                    <span>Evidence Quality: {(rec.confidenceScore * 100).toFixed(0)}%</span>
                  </div>
                </div>
              </div>

              {/* Explanation & Evidence */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-2xl glass-pill">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Observed Context
                  </span>
                  <p className="text-slate-300 leading-relaxed">{rec.explanation}</p>
                </div>

                <div className="p-4 rounded-2xl glass-pill">
                  <span className="text-[11px] font-bold text-cyan-300 uppercase tracking-wider block mb-1">
                    Empirical Supporting Evidence
                  </span>
                  <p className="text-slate-300 font-mono text-[11px] leading-relaxed">
                    {rec.supportingEvidence}
                  </p>
                </div>
              </div>

              {/* Suggested Action Box */}
              <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-400/25 flex items-start gap-3.5 text-xs">
                <Lightbulb className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-indigo-200 block mb-0.5">Recommended Instructional Action:</span>
                  <p className="text-slate-200 leading-relaxed">{rec.suggestedAction}</p>
                </div>
              </div>

              {/* Explicit Limitations Footer */}
              <div className="text-[11px] text-slate-400 flex items-center gap-2 pt-2 border-t border-white/5">
                <span className="font-bold text-slate-400">Pedagogical Limitation:</span>
                <span>{rec.limitations}</span>
              </div>
            </div>
          );
        })}

        {recommendations.length === 0 && (
          <div className="p-8 rounded-3xl glass-card text-center text-xs text-slate-400">
            No recommendations generated yet for this session. Click &quot;Recalculate Rules&quot; once sufficient session metrics have accumulated.
          </div>
        )}
      </div>
    </div>
  );
};

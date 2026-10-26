import React, { useEffect, useState } from 'react';
import {
  ShieldCheck,
  Lock,
  EyeOff,
  Database,
  History,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Server,
  FileCheck,
  Fingerprint,
  MicOff,
  VideoOff,
  UserX,
} from 'lucide-react';
import { api } from '../services/api.ts';
import type { PrivacySettings, AuditEvent, SystemCapabilities } from '../types/index.ts';

export const PrivacySettingsPage: React.FC = () => {
  const [privacy, setPrivacy] = useState<PrivacySettings>({
    rawVideoStorageEnabled: false,
    rawAudioStorageEnabled: false,
    retentionDays: 30,
    biometricMatchingEnabled: false,
    anonymizeExportReports: false,
    offlineOnlyMode: true,
  });
  const [auditLogs, setAuditLogs] = useState<AuditEvent[]>([]);
  const [capabilities, setCapabilities] = useState<SystemCapabilities | null>(null);
  const [saving, setSaving] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const [privData, auditData, capData] = await Promise.all([
        api.getPrivacySettings(),
        api.getAuditEvents(),
        api.getCapabilities(),
      ]);
      setPrivacy(privData);
      setAuditLogs(auditData);
      setCapabilities(capData);
    } catch (err) {
      console.error('Failed to load privacy settings:', err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggle = async (key: keyof PrivacySettings) => {
    try {
      setSaving(true);
      const updated = { ...privacy, [key]: !privacy[key] };
      setPrivacy(updated);
      await api.updatePrivacySettings(updated);
      setSuccessMessage('Privacy policy setting updated and recorded in the audit trail.');
      setTimeout(() => setSuccessMessage(null), 3500);
      const logs = await api.getAuditEvents();
      setAuditLogs(logs);
    } catch (err) {
      console.error('Failed to update privacy:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleResetDatabase = async () => {
    if (confirm('Are you sure you want to reset the database to clean demo state? All sessions, attendance records, and active tracking buffers will be reinitialized.')) {
      await api.resetDemoSeed();
      await loadData();
      setSuccessMessage('Local database reseeded to clean baseline state.');
      setTimeout(() => setSuccessMessage(null), 3500);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="glass-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border border-white/10">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500/20 to-cyan-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300 shadow-md shadow-emerald-950/40">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-white">Privacy Controls & Audit Trail</h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                FERPA Compliant
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Strict edge-computing safeguards: zero raw video persistence, volatile memory processing, and persistent event logging.
            </p>
          </div>
        </div>

        <button
          onClick={handleResetDatabase}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-rose-300 hover:text-rose-200 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 transition-all shadow-xs"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Reset Local Database</span>
        </button>
      </div>

      {successMessage && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-400/40 text-emerald-200 text-xs flex items-center gap-2.5 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Primary 3 Safeguard Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="glass-card p-5 border border-white/10 space-y-2">
          <div className="w-9 h-9 rounded-xl bg-cyan-500/15 border border-cyan-400/20 flex items-center justify-center text-cyan-300 mb-3">
            <VideoOff className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-white">Zero Video Storage</h3>
          <p className="text-xs text-slate-300/80 leading-relaxed">
            Frames are processed in ephemeral local RAM buffers. Neither raw camera streams nor facial snapshots are ever written to disk.
          </p>
        </div>

        <div className="glass-card p-5 border border-white/10 space-y-2">
          <div className="w-9 h-9 rounded-xl bg-violet-500/15 border border-violet-400/20 flex items-center justify-center text-violet-300 mb-3">
            <MicOff className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-white">Acoustic Ratio Only</h3>
          <p className="text-xs text-slate-300/80 leading-relaxed">
            Audio pipelines calculate energy decibel thresholds (VAD). No voice audio, spectral waveforms, or transcripts are preserved.
          </p>
        </div>

        <div className="glass-card p-5 border border-white/10 space-y-2">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-400/20 flex items-center justify-center text-emerald-300 mb-3">
            <Fingerprint className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-white">Pseudonymous Codes</h3>
          <p className="text-xs text-slate-300/80 leading-relaxed">
            Students are tracked via ephemeral session tags (e.g., Track #4). Unverified detections require explicit instructor pairing.
          </p>
        </div>
      </div>

      {/* Institutional Policy Switches */}
      <div className="glass-card p-6 border border-white/10 space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div>
            <h2 className="text-sm font-bold text-white">Institutional Safeguards & Retention Controls</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Enforce local privacy compliance rules configured for higher education accreditation.
            </p>
          </div>
          <div className="text-right">
            <span className="text-[11px] font-mono text-cyan-300 bg-cyan-500/10 px-2.5 py-1 rounded-full border border-cyan-400/20">
              Retention Limit: {privacy.retentionDays} Days
            </span>
          </div>
        </div>

        <div className="divide-y divide-white/5 space-y-2">
          {/* Policy 1: Video Discard */}
          <div className="pt-3 pb-3 flex items-center justify-between gap-4">
            <div className="space-y-0.5 max-w-xl">
              <span className="text-xs font-semibold text-slate-100 flex items-center gap-2">
                <VideoOff className="w-3.5 h-3.5 text-cyan-400" />
                Discard Raw Video Feeds Immediately
              </span>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Guarantees all camera frames are discarded immediately after feature extraction. Disabling this would create disk buffers (prohibited under default institutional policy).
              </p>
            </div>
            {/* Apple iOS-style liquid toggle */}
            <button
              onClick={() => handleToggle('rawVideoStorageEnabled')}
              disabled={saving}
              className={`w-13 h-7 rounded-full p-1 transition-all duration-300 relative focus:outline-hidden ${
                !privacy.rawVideoStorageEnabled
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-400 shadow-md shadow-emerald-500/30'
                  : 'bg-white/15'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform duration-300 ${
                  !privacy.rawVideoStorageEnabled ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Policy 2: Audio Discard */}
          <div className="pt-3 pb-3 flex items-center justify-between gap-4">
            <div className="space-y-0.5 max-w-xl">
              <span className="text-xs font-semibold text-slate-100 flex items-center gap-2">
                <MicOff className="w-3.5 h-3.5 text-violet-400" />
                Discard Raw Audio Streams (VAD Only)
              </span>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Permits only anonymized speech activity ratios to be stored. Raw audio buffer recordings are purged instantly.
              </p>
            </div>
            <button
              onClick={() => handleToggle('rawAudioStorageEnabled')}
              disabled={saving}
              className={`w-13 h-7 rounded-full p-1 transition-all duration-300 relative focus:outline-hidden ${
                !privacy.rawAudioStorageEnabled
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-400 shadow-md shadow-emerald-500/30'
                  : 'bg-white/15'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform duration-300 ${
                  !privacy.rawAudioStorageEnabled ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Policy 3: Biometric Identification Restriction */}
          <div className="pt-3 pb-3 flex items-center justify-between gap-4">
            <div className="space-y-0.5 max-w-xl">
              <span className="text-xs font-semibold text-slate-100 flex items-center gap-2">
                <Fingerprint className="w-3.5 h-3.5 text-amber-400" />
                Biometric Identification Gate
              </span>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Prevents automated facial matching against stored biometric templates. Unverified tracks must be instructor-confirmed using classroom PIN or seat layout.
              </p>
            </div>
            <button
              onClick={() => handleToggle('biometricMatchingEnabled')}
              disabled={saving}
              className={`w-13 h-7 rounded-full p-1 transition-all duration-300 relative focus:outline-hidden ${
                !privacy.biometricMatchingEnabled
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-400 shadow-md shadow-emerald-500/30'
                  : 'bg-white/15'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform duration-300 ${
                  !privacy.biometricMatchingEnabled ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Policy 4: Anonymize Export Reports */}
          <div className="pt-3 pb-3 flex items-center justify-between gap-4">
            <div className="space-y-0.5 max-w-xl">
              <span className="text-xs font-semibold text-slate-100 flex items-center gap-2">
                <UserX className="w-3.5 h-3.5 text-indigo-400" />
                Anonymize Public Attendance Reports
              </span>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                When enabled, exported CSV sheets and public institutional audits replace student names with pseudonymized identifiers (e.g. Participant-104).
              </p>
            </div>
            <button
              onClick={() => handleToggle('anonymizeExportReports')}
              disabled={saving}
              className={`w-13 h-7 rounded-full p-1 transition-all duration-300 relative focus:outline-hidden ${
                privacy.anonymizeExportReports
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-400 shadow-md shadow-emerald-500/30'
                  : 'bg-white/15'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform duration-300 ${
                  privacy.anonymizeExportReports ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Policy 5: Offline Local Execution Only */}
          <div className="pt-3 pb-3 flex items-center justify-between gap-4">
            <div className="space-y-0.5 max-w-xl">
              <span className="text-xs font-semibold text-slate-100 flex items-center gap-2">
                <Lock className="w-3.5 h-3.5 text-cyan-400" />
                Offline Air-Gapped Inference Mode
              </span>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Forces computer-vision and rule engines to run completely local on the host device. Blocks external telemetry or cloud analytics transmission.
              </p>
            </div>
            <button
              onClick={() => handleToggle('offlineOnlyMode')}
              disabled={saving}
              className={`w-13 h-7 rounded-full p-1 transition-all duration-300 relative focus:outline-hidden ${
                privacy.offlineOnlyMode
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-400 shadow-md shadow-emerald-500/30'
                  : 'bg-white/15'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform duration-300 ${
                  privacy.offlineOnlyMode ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Security Audit Trail Section */}
      <div className="glass-card p-6 border border-white/10 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-indigo-500/15 border border-indigo-400/20 flex items-center justify-center text-indigo-400">
              <History className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Security Audit Trail & Compliance Log</h2>
              <p className="text-[11px] text-slate-400">Persistent event logging for verification, overrides, and policy adjustments</p>
            </div>
          </div>
          <span className="text-xs font-mono px-3 py-1 rounded-full glass-pill text-cyan-300 border border-cyan-400/20">
            {auditLogs.length} Events Logged
          </span>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-white/5 bg-slate-950/40">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.02] text-slate-400 font-semibold text-[11px]">
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Actor</th>
                <th className="py-3 px-4">Target Type</th>
                <th className="py-3 px-4">Audit Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-mono text-[11px]">
              {auditLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-500 font-sans">
                    No audit records registered yet.
                  </td>
                </tr>
              ) : (
                auditLogs.map(log => (
                  <tr key={log.id} className="hover:bg-white/[0.03] transition-colors">
                    <td className="py-3 px-4 text-slate-400 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded-md font-bold text-[10px] tracking-wide uppercase bg-indigo-500/15 text-indigo-300 border border-indigo-400/20">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-200 font-sans font-medium whitespace-nowrap">
                      {log.actor}
                    </td>
                    <td className="py-3 px-4 text-slate-400 whitespace-nowrap">
                      {log.targetType}
                    </td>
                    <td className="py-3 px-4 text-slate-300 font-sans">
                      {log.details}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

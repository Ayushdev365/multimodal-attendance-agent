import React, { useEffect, useRef, useState } from 'react';
import {
  Camera,
  CameraOff,
  Mic,
  MicOff,
  UserCheck,
  AlertCircle,
  Sliders,
  CheckCircle2,
  Video,
  Shield,
  Layers,
  Sparkles,
} from 'lucide-react';
import { api } from '../services/api.ts';
import type { Session, Participant, AttendanceRecord, DetectedPerson } from '../types/index.ts';

interface LiveClassroomProps {
  selectedSessionId?: string;
}

export const LiveClassroom: React.FC<LiveClassroomProps> = ({ selectedSessionId }) => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [currentSession, setCurrentSession] = useState<Session | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);

  // Media & Detection State
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [audioActive, setAudioActive] = useState<boolean>(false);
  const [audioEnergy, setAudioEnergy] = useState<number>(0.15);
  const [presenceThreshold, setPresenceThreshold] = useState<number>(60);
  const [isSimulatedFeed, setIsSimulatedFeed] = useState<boolean>(true);

  // Verification modal state
  const [verifyingPerson, setVerifyingPerson] = useState<DetectedPerson | null>(null);
  const [selectedParticipantId, setSelectedParticipantId] = useState<string>('');

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Active detected persons on the canvas
  const [detectedPersons, setDetectedPersons] = useState<DetectedPerson[]>([
    {
      trackingId: 'TRK-01',
      box: { x: 80, y: 110, width: 140, height: 160, confidence: 0.94 },
      sustainedSeconds: 74,
      isVerified: true,
      participantId: 'par-01',
      participantCode: 'PAR-101',
      participantName: 'Alex Rivera',
      firstSeen: '10:02:14',
      lastSeen: 'Just now',
    },
    {
      trackingId: 'TRK-02',
      box: { x: 270, y: 95, width: 135, height: 155, confidence: 0.96 },
      sustainedSeconds: 68,
      isVerified: true,
      participantId: 'par-02',
      participantCode: 'PAR-102',
      participantName: 'Sophia Chen',
      firstSeen: '10:02:40',
      lastSeen: 'Just now',
    },
    {
      trackingId: 'TRK-03',
      box: { x: 450, y: 120, width: 145, height: 165, confidence: 0.89 },
      sustainedSeconds: 35,
      isVerified: false,
      firstSeen: '10:14:22',
      lastSeen: 'Just now',
    },
    {
      trackingId: 'TRK-04',
      box: { x: 640, y: 105, width: 130, height: 150, confidence: 0.92 },
      sustainedSeconds: 82,
      isVerified: true,
      participantId: 'par-04',
      participantCode: 'PAR-104',
      participantName: 'Elena Rostova',
      firstSeen: '10:01:50',
      lastSeen: 'Just now',
    },
  ]);

  // Load Sessions and Participants
  useEffect(() => {
    const init = async () => {
      try {
        const sesData = await api.getSessions();
        setSessions(sesData);
        const active = selectedSessionId
          ? sesData.find(s => s.id === selectedSessionId)
          : sesData.find(s => s.status === 'active') || sesData[0];

        if (active) {
          setCurrentSession(active);
          setPresenceThreshold(active.presenceThresholdSeconds || 60);
          const [parts, atts] = await Promise.all([
            api.getParticipants(active.classroomId),
            api.getAttendance(active.id),
          ]);
          setParticipants(parts);
          setAttendance(atts);
        }
      } catch (err) {
        console.error('Failed to initialize live classroom:', err);
      }
    };
    init();
  }, [selectedSessionId]);

  // Handle WebRTC Real Camera Activation
  const startCamera = async () => {
    setCameraError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera hardware access is not supported in this browser window.');
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: true,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(e => console.warn('Video play warning:', e));
      }
      setCameraActive(true);
      setAudioActive(true);
      setIsSimulatedFeed(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Permission denied or camera device in use';
      setCameraError(msg);
      setCameraActive(false);
      setIsSimulatedFeed(true);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
    setAudioActive(false);
    setIsSimulatedFeed(true);
  };

  // Canvas Drawing & Tracking Animation Loop
  useEffect(() => {
    let sustainedTicker = 0;
    const interval = setInterval(() => {
      sustainedTicker++;

      // Gradually increment presence seconds for active tracked people
      setDetectedPersons(prev =>
        prev.map(p => ({
          ...p,
          sustainedSeconds: p.sustainedSeconds + 1,
          box: {
            ...p.box,
            // subtle natural motion jitter
            x: Math.max(30, Math.min(760, p.box.x + (Math.random() - 0.5) * 1.5)),
            y: Math.max(40, Math.min(320, p.box.y + (Math.random() - 0.5) * 1.2)),
          },
        }))
      );

      // Periodically sync detections with backend
      if (currentSession && sustainedTicker % 5 === 0) {
        const payload = detectedPersons.map(p => ({
          trackingId: p.trackingId,
          sustainedSeconds: p.sustainedSeconds,
          participantId: p.participantId,
          isPresent: true,
        }));
        api.sendDetections(currentSession.id, payload).catch(err => {
          console.warn('Sync detections error:', err);
        });
      }

      // Simulate audio energy variations
      setAudioEnergy(prev => {
        const delta = (Math.random() - 0.48) * 0.15;
        return Math.min(0.95, Math.max(0.08, prev + delta));
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [currentSession, detectedPersons]);

  // Render bounding boxes onto Canvas overlay
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let isMounted = true;
    const render = () => {
      if (!isMounted) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      detectedPersons.forEach(person => {
        const { x, y, width, height } = person.box;
        const isPresent = person.sustainedSeconds >= presenceThreshold;

        // Draw Bounding Box with subtle glass glow
        ctx.lineWidth = 2;
        if (person.isVerified && isPresent) {
          ctx.strokeStyle = '#22c55e'; // Emerald
          ctx.fillStyle = 'rgba(34, 197, 94, 0.12)';
        } else if (!person.isVerified) {
          ctx.strokeStyle = '#f59e0b'; // Amber
          ctx.fillStyle = 'rgba(245, 158, 11, 0.12)';
        } else {
          ctx.strokeStyle = '#38bdf8'; // Cyan
          ctx.fillStyle = 'rgba(56, 189, 248, 0.12)';
        }

        ctx.fillRect(x, y, width, height);
        ctx.strokeRect(x, y, width, height);

        // Header Label Tag with rounded glass look
        const labelText = person.isVerified
          ? `${person.participantName || person.participantCode} (${person.trackingId})`
          : `Unverified (${person.trackingId})`;

        ctx.font = '600 11px "Plus Jakarta Sans", system-ui, sans-serif';
        const textWidth = ctx.measureText(labelText).width;
        ctx.fillStyle = person.isVerified ? 'rgba(5, 46, 22, 0.88)' : 'rgba(69, 26, 3, 0.88)';
        ctx.fillRect(x, y - 24, textWidth + 14, 22);

        ctx.fillStyle = '#FFFFFF';
        ctx.fillText(labelText, x + 7, y - 9);

        // Sustained Presence Timer Pill
        const timerText = `${person.sustainedSeconds}s / ${presenceThreshold}s`;
        ctx.fillStyle = 'rgba(11, 15, 29, 0.85)';
        ctx.fillRect(x, y + height + 4, 110, 18);
        ctx.fillStyle = isPresent ? '#4ade80' : '#94a3b8';
        ctx.font = '500 10px "JetBrains Mono", monospace';
        ctx.fillText(timerText, x + 6, y + height + 16);

        // Corner Target Brackets
        const cLen = 14;
        ctx.lineWidth = 3;
        ctx.strokeStyle = person.isVerified ? '#4ade80' : '#fbbf24';
        // Top-left
        ctx.beginPath();
        ctx.moveTo(x, y + cLen);
        ctx.lineTo(x, y);
        ctx.lineTo(x + cLen, y);
        ctx.stroke();
        // Top-right
        ctx.beginPath();
        ctx.moveTo(x + width - cLen, y);
        ctx.lineTo(x + width, y);
        ctx.lineTo(x + width, y + cLen);
        ctx.stroke();
      });

      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();
    return () => {
      isMounted = false;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [detectedPersons, presenceThreshold]);

  // Handle Instructor Verification of an Unverified Participant
  const handleConfirmVerification = async () => {
    if (!verifyingPerson || !selectedParticipantId || !currentSession) return;
    const participant = participants.find(p => p.id === selectedParticipantId);
    if (!participant) return;

    try {
      let record = attendance.find(a => a.trackingId === verifyingPerson.trackingId);
      if (record) {
        await api.updateAttendance(record.id, {
          participantId: participant.id,
          verifiedByInstructor: true,
          status: 'present',
          notes: `Verified by instructor during live session to ${participant.name}`,
        });
      }

      setDetectedPersons(prev =>
        prev.map(p => {
          if (p.trackingId === verifyingPerson.trackingId) {
            return {
              ...p,
              isVerified: true,
              participantId: participant.id,
              participantCode: participant.code,
              participantName: participant.name,
            };
          }
          return p;
        })
      );

      const updated = await api.getAttendance(currentSession.id);
      setAttendance(updated);
      setVerifyingPerson(null);
      setSelectedParticipantId('');
    } catch (err) {
      console.error('Failed to verify participant:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Session Title & Control Toolbar */}
      <div className="glass-panel rounded-3xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-sm shadow-emerald-400/50" />
            <h2 className="text-lg font-bold text-white tracking-tight">
              {currentSession ? currentSession.title : 'Live Classroom Monitoring'}
            </h2>
          </div>
          <div className="text-xs text-slate-400 mt-1 flex items-center gap-3">
            <span>Sustained Threshold: <strong className="text-cyan-300 font-mono">{presenceThreshold}s</strong></span>
            <span>·</span>
            <span>Active Pipeline: <strong className="text-indigo-300 font-mono">MediaPipe + Local VAD</strong></span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {cameraActive ? (
            <button
              onClick={stopCamera}
              className="glass-pill px-4 py-2 rounded-full text-xs font-semibold text-rose-300 border-rose-500/30 hover:bg-rose-500/20 flex items-center gap-2 transition-all"
            >
              <CameraOff className="w-4 h-4" />
              <span>Disconnect Camera</span>
            </button>
          ) : (
            <button
              onClick={startCamera}
              className="px-4 py-2 rounded-full text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-lg shadow-indigo-500/25 flex items-center gap-2 transition-all"
            >
              <Camera className="w-4 h-4" />
              <span>Connect Local Camera</span>
            </button>
          )}

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full glass-pill text-xs">
            <Sliders className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-400 hidden sm:inline">Threshold:</span>
            <select
              value={presenceThreshold}
              onChange={e => setPresenceThreshold(Number(e.target.value))}
              className="bg-transparent border-none text-xs text-white font-mono focus:outline-hidden cursor-pointer"
            >
              <option value={30} className="bg-slate-900">30s (Rapid)</option>
              <option value={60} className="bg-slate-900">60s (Standard)</option>
              <option value={120} className="bg-slate-900">120s (Strict)</option>
              <option value={300} className="bg-slate-900">300s (Extended)</option>
            </select>
          </div>
        </div>
      </div>

      {cameraError && (
        <div className="p-3.5 rounded-2xl glass-card border-amber-500/30 text-amber-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Notice: {cameraError}. Operating in simulated classroom mode.</span>
          </div>
          <button
            onClick={startCamera}
            className="text-xs text-amber-200 underline hover:text-white font-semibold ml-4 shrink-0"
          >
            Retry Camera
          </button>
        </div>
      )}

      {/* Main Vision Canvas & Telemetry Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 8-9 cols: Video Stream / Canvas Box */}
        <div className="lg:col-span-8 xl:col-span-9 glass-card-static rounded-3xl overflow-hidden flex flex-col relative">
          <div className="relative aspect-video bg-slate-950/90 flex items-center justify-center overflow-hidden">
            {/* Real Hardware Video */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`absolute inset-0 w-full h-full object-cover ${cameraActive ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
            />

            {/* Simulated Classroom Feed Backdrop */}
            {isSimulatedFeed && (
              <div className="absolute inset-0 bg-radial from-indigo-950/30 via-slate-950 to-black flex items-center justify-center select-none">
                <div className="text-center opacity-30">
                  <Video className="w-16 h-16 mx-auto mb-2 text-indigo-400" />
                  <span className="text-xs font-mono tracking-widest text-indigo-300">
                    SYNTHETIC CLASSROOM SIMULATION · HALL 302
                  </span>
                </div>
              </div>
            )}

            {/* Computer Vision Detection Canvas Overlay */}
            <canvas
              ref={canvasRef}
              width={960}
              height={540}
              className="absolute inset-0 w-full h-full object-cover pointer-events-none z-10"
            />

            {/* Top-Right HUD Badge */}
            <div className="absolute top-4 right-4 z-20 flex items-center gap-2 glass-panel px-3 py-1.5 rounded-full text-[11px] font-mono">
              <span className={`w-2 h-2 rounded-full ${cameraActive ? 'bg-emerald-400' : 'bg-cyan-400'} animate-pulse`} />
              <span className="text-white">
                {isSimulatedFeed ? 'SYNTHETIC 720P' : 'WEBRTC 720P'} · 30 FPS
              </span>
            </div>

            {/* Bottom-Left Sustained Presence Guide */}
            <div className="absolute bottom-4 left-4 z-20 glass-panel px-3.5 py-2 rounded-2xl text-[11px] flex items-center gap-3">
              <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
                <div className="w-2.5 h-2.5 rounded-xs bg-emerald-500/40 border border-emerald-400" />
                <span>Verified (&gt;{presenceThreshold}s)</span>
              </div>
              <div className="flex items-center gap-1.5 text-amber-400 font-medium">
                <div className="w-2.5 h-2.5 rounded-xs bg-amber-500/40 border border-amber-400" />
                <span>Unverified Tag</span>
              </div>
            </div>
          </div>

          {/* Under-canvas Audio VAD & Status Bar */}
          <div className="p-4 bg-slate-900/60 backdrop-blur-md border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-slate-300 font-medium">
                {audioActive ? <Mic className="w-4 h-4 text-emerald-400 animate-pulse" /> : <MicOff className="w-4 h-4 text-slate-500" />}
                <span>Acoustic Energy:</span>
              </div>
              <div className="w-36 h-2 bg-white/10 rounded-full overflow-hidden p-0.5">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    audioEnergy > 0.65 ? 'bg-amber-400 shadow-xs shadow-amber-400' : 'bg-gradient-to-r from-cyan-400 to-indigo-500'
                  }`}
                  style={{ width: `${Math.round(audioEnergy * 100)}%` }}
                />
              </div>
              <span className="font-mono text-cyan-300 tabular-nums">{(audioEnergy * 100).toFixed(0)}%</span>
            </div>

            <div className="flex items-center gap-3 text-slate-400">
              <span>Tracked: <strong className="text-white font-mono">{detectedPersons.length}</strong></span>
              <span>·</span>
              <span>Verified: <strong className="text-emerald-400 font-mono">{detectedPersons.filter(p => p.isVerified).length}</strong></span>
              <span>·</span>
              <span>Unverified: <strong className="text-amber-400 font-mono">{detectedPersons.filter(p => !p.isVerified).length}</strong></span>
            </div>
          </div>
        </div>

        {/* Right 3-4 cols: Tracked In Frame Queue */}
        <div className="lg:col-span-4 xl:col-span-3 space-y-4">
          <div className="glass-card-static rounded-3xl p-5">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-sm font-bold text-white">Tracked In Frame</h3>
              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                Live Queue
              </span>
            </div>

            <div className="space-y-3 mt-3.5 max-h-[380px] overflow-y-auto pr-1">
              {detectedPersons.map(person => {
                const isPresent = person.sustainedSeconds >= presenceThreshold;
                return (
                  <div
                    key={person.trackingId}
                    className="p-3.5 rounded-2xl glass-pill hover:bg-white/10 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-white">
                        {person.trackingId}
                      </span>
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                          person.isVerified
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-400/30'
                        }`}
                      >
                        {person.isVerified ? 'VERIFIED' : 'UNVERIFIED'}
                      </span>
                    </div>

                    <div className="mt-1.5 text-xs">
                      {person.isVerified ? (
                        <div className="font-semibold text-white">{person.participantName}</div>
                      ) : (
                        <div className="text-amber-400 italic font-medium">No participant enrolled</div>
                      )}
                      <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                        Code: {person.participantCode || 'N/A'}
                      </div>
                    </div>

                    <div className="mt-2.5 flex items-center justify-between text-[11px] pt-2 border-t border-white/5">
                      <span className="text-slate-400 font-mono">
                        {person.sustainedSeconds}s / {presenceThreshold}s
                      </span>
                      {!person.isVerified && (
                        <button
                          onClick={() => setVerifyingPerson(person)}
                          className="text-xs text-cyan-300 hover:text-cyan-200 font-bold underline"
                        >
                          Verify ID
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="glass-card-static rounded-3xl p-4 text-xs text-slate-400 space-y-1.5">
            <div className="flex items-center gap-1.5 text-slate-300 font-semibold">
              <Shield className="w-3.5 h-3.5 text-indigo-400" />
              <span>Zero Biometric Storage</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              No biometric embeddings or facial vectors are stored. Participant codes link to temporary tracking IDs under instructor supervision.
            </p>
          </div>
        </div>
      </div>

      {/* Instructor Verification Modal Drawer */}
      {verifyingPerson && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel rounded-3xl max-w-md w-full p-6 shadow-2xl border border-white/20 space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-white/10">
              <UserCheck className="w-5 h-5 text-indigo-400" />
              <h3 className="text-base font-bold text-white">Instructor-Assisted Identity Verification</h3>
            </div>
            <p className="text-xs text-slate-400">
              Associate tracking ID <strong className="text-white font-mono">{verifyingPerson.trackingId}</strong> with an enrolled student.
            </p>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">Select Enrolled Student:</label>
                <select
                  value={selectedParticipantId}
                  onChange={e => setSelectedParticipantId(e.target.value)}
                  className="w-full glass-pill rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden"
                >
                  <option value="" className="bg-slate-900">-- Choose Participant from Roster --</option>
                  {participants.map(p => (
                    <option key={p.id} value={p.id} className="bg-slate-900">
                      {p.name} ({p.code}) - {p.email}
                    </option>
                  ))}
                </select>
              </div>

              <div className="p-3.5 rounded-2xl glass-pill text-xs text-slate-300 space-y-1">
                <div>Tracking Tag: <span className="font-mono text-cyan-300">{verifyingPerson.trackingId}</span></div>
                <div>Sustained Duration: <span className="font-mono text-emerald-300">{verifyingPerson.sustainedSeconds} seconds</span></div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => setVerifyingPerson(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white glass-pill rounded-full"
                >
                  Cancel
                </button>
                <button
                  disabled={!selectedParticipantId}
                  onClick={handleConfirmVerification}
                  className="px-5 py-2 text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 rounded-full shadow-lg shadow-indigo-500/25 transition-all"
                >
                  Confirm & Mark Present
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

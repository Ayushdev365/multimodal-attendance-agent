import React, { useEffect, useState } from 'react';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  Shield,
  CheckCircle2,
  Mail,
  Tag,
} from 'lucide-react';
import { api } from '../services/api.ts';
import type { Participant, Classroom } from '../types/index.ts';

export const ParticipantManagement: React.FC = () => {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [selectedClassroomId, setSelectedClassroomId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  // Enroll Modal
  const [showModal, setShowModal] = useState<boolean>(false);
  const [name, setName] = useState<string>('');
  const [code, setCode] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [enrollClassroomId, setEnrollClassroomId] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [parts, cls] = await Promise.all([api.getParticipants(), api.getClassrooms()]);
      setParticipants(parts);
      setClassrooms(cls);
      if (cls.length > 0 && !enrollClassroomId) {
        setEnrollClassroomId(cls[0].id);
      }
    } catch (err) {
      console.error('Failed to load participants:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleEnroll = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim() || !enrollClassroomId) return;
    try {
      setSubmitting(true);
      const newPart = await api.createParticipant({
        name: name.trim(),
        code: code.trim(),
        email: email.trim(),
        classroomId: enrollClassroomId,
      });
      setParticipants([...participants, newPart]);
      setShowModal(false);
      setName('');
      setCode('');
      setEmail('');
    } catch (err) {
      console.error('Failed to enroll participant:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredParticipants = participants.filter(p => {
    const matchesClassroom = selectedClassroomId === 'all' || p.classroomId === selectedClassroomId;
    const matchesSearch =
      !searchQuery ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.email.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesClassroom && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-panel rounded-3xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight">Participant & Student Directory</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Privacy-first participant identification codes decoupled from permanent biometric facial vectors.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-5 py-2 rounded-full text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-lg shadow-indigo-500/25 transition-all"
        >
          <UserPlus className="w-4 h-4" />
          <span>Enroll New Participant</span>
        </button>
      </div>

      {/* Privacy Notice Box */}
      <div className="p-4 rounded-3xl glass-card border-emerald-400/20 text-xs text-slate-300 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300 shrink-0">
            <Shield className="w-4 h-4" />
          </div>
          <span>
            Participant codes (e.g. <strong className="text-cyan-300 font-mono">PAR-101</strong>) decouple attendance tracking from external facial databases.
          </span>
        </div>
        <span className="text-[11px] font-mono font-bold text-emerald-300 bg-emerald-500/20 border border-emerald-400/30 px-3 py-1 rounded-full">
          FERPA & GDPR Safe
        </span>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 flex items-center gap-2 glass-panel rounded-2xl px-3.5 py-2.5 text-xs">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by student name, code, or email..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-transparent text-white placeholder-slate-400 focus:outline-hidden"
          />
        </div>

        <select
          value={selectedClassroomId}
          onChange={e => setSelectedClassroomId(e.target.value)}
          className="glass-pill rounded-2xl px-4 py-2.5 text-xs text-white focus:outline-hidden cursor-pointer"
        >
          <option value="all" className="bg-slate-900">All Classrooms ({participants.length})</option>
          {classrooms.map(c => (
            <option key={c.id} value={c.id} className="bg-slate-900">
              {c.name} ({c.code})
            </option>
          ))}
        </select>
      </div>

      {/* Participants Table */}
      <div className="glass-card-static rounded-3xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.02] text-slate-400 font-semibold">
                <th className="py-4 px-5">Participant Code</th>
                <th className="py-4 px-5">Student Name</th>
                <th className="py-4 px-5">Institutional Email</th>
                <th className="py-4 px-5">Assigned Classroom</th>
                <th className="py-4 px-5">Status</th>
                <th className="py-4 px-5 text-right">Enrolled Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-sans">
              {filteredParticipants.map(part => {
                const classroom = classrooms.find(c => c.id === part.classroomId);
                return (
                  <tr key={part.id} className="hover:bg-white/[0.04] transition-colors">
                    <td className="py-3.5 px-5 font-mono font-bold text-cyan-300">
                      {part.code}
                    </td>
                    <td className="py-3.5 px-5 font-bold text-white">{part.name}</td>
                    <td className="py-3.5 px-5 text-slate-400 font-mono text-[11px]">{part.email}</td>
                    <td className="py-3.5 px-5 text-slate-300 font-medium">
                      {classroom ? `${classroom.code} - ${classroom.name}` : 'General'}
                    </td>
                    <td className="py-3.5 px-5">
                      <span className="inline-block px-3 py-1 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                        {part.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-right text-slate-400 font-mono text-[11px]">
                      {new Date(part.enrolledAt).toLocaleDateString()}
                    </td>
                  </tr>
                );
              })}

              {filteredParticipants.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500 text-xs">
                    No participants found matching the criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Enroll Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
          <form
            onSubmit={handleEnroll}
            className="glass-panel rounded-3xl max-w-md w-full p-6 shadow-2xl border border-white/20 space-y-4"
          >
            <div className="flex items-center gap-2 pb-2 border-b border-white/10">
              <UserPlus className="w-5 h-5 text-indigo-400" />
              <h3 className="text-base font-bold text-white">Enroll New Student</h3>
            </div>

            <div className="space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">Full Name:</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Jordan Miller"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full glass-pill rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Participant Identifier Code:
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. PAR-109"
                  value={code}
                  onChange={e => setCode(e.target.value.toUpperCase())}
                  className="w-full glass-pill rounded-xl px-3 py-2 text-xs text-cyan-300 font-mono font-bold placeholder-slate-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">Email Address:</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. jmiller@univ.edu"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full glass-pill rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">Assigned Classroom:</label>
                <select
                  value={enrollClassroomId}
                  onChange={e => setEnrollClassroomId(e.target.value)}
                  className="w-full glass-pill rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden"
                >
                  {classrooms.map(c => (
                    <option key={c.id} value={c.id} className="bg-slate-900">
                      {c.name} ({c.code})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white glass-pill rounded-full"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2 text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 rounded-full shadow-lg shadow-indigo-500/25 transition-all"
              >
                {submitting ? 'Enrolling...' : 'Confirm Enrollment'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

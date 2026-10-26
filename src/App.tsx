/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar.tsx';
import { Header } from './components/Header.tsx';
import type { NavTab } from './components/Navbar.tsx';
import { OverviewDashboard } from './pages/OverviewDashboard.tsx';
import { LiveClassroom } from './pages/LiveClassroom.tsx';
import { AttendanceManagement } from './pages/AttendanceManagement.tsx';
import { EngagementAnalytics } from './pages/EngagementAnalytics.tsx';
import { SessionManagement } from './pages/SessionManagement.tsx';
import { ParticipantManagement } from './pages/ParticipantManagement.tsx';
import { AITeachingAssistant } from './pages/AITeachingAssistant.tsx';
import { ReportsPage } from './pages/ReportsPage.tsx';
import { PrivacySettingsPage } from './pages/PrivacySettings.tsx';
import { api } from './services/api.ts';
import type { Session, AttendanceRecord } from './types/index.ts';
import { X } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('overview');
  const [selectedSessionId, setSelectedSessionId] = useState<string>('');
  const [activeSession, setActiveSession] = useState<Session | null>(null);
  const [unverifiedCount, setUnverifiedCount] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  const fetchSessionData = async () => {
    try {
      const sessions = await api.getSessions();
      const active = sessions.find(s => s.status === 'active') || sessions[0];
      if (active) {
        setActiveSession(active);
        if (!selectedSessionId) {
          setSelectedSessionId(active.id);
        }
      }

      // Fetch unverified identities count to display badge in sidebar
      try {
        const allAtt = await api.getAllAttendance();
        const unverified = allAtt.filter(
          (a: AttendanceRecord) => a.status === 'unverified' || !a.verifiedByInstructor
        );
        setUnverifiedCount(unverified.length);
      } catch {
        // Fallback silently if no records yet
      }
    } catch (err) {
      console.warn('Could not load sessions initially:', err);
    }
  };

  useEffect(() => {
    fetchSessionData();
    const interval = setInterval(fetchSessionData, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleSelectSession = (sessionId: string) => {
    setSelectedSessionId(sessionId);
    api.getSessions().then(sessions => {
      const found = sessions.find(s => s.id === sessionId);
      if (found) setActiveSession(found);
    });
  };

  return (
    <div className="min-h-screen text-slate-100 relative overflow-x-hidden flex antialiased selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Ambient Radial Glowing Mesh Background inspired by Lumina visual reference */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        {/* Deep background fill */}
        <div className="absolute inset-0 bg-[#070B18]" />
        
        {/* Top-left violet-indigo ambient glow */}
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-indigo-600/25 via-purple-600/20 to-transparent blur-[120px]" />
        
        {/* Top-right cyan-teal atmospheric bloom */}
        <div className="absolute -top-32 -right-32 w-[700px] h-[700px] rounded-full bg-gradient-to-bl from-cyan-500/20 via-indigo-600/15 to-transparent blur-[140px]" />
        
        {/* Center-right soft magenta highlight */}
        <div className="absolute top-1/3 -right-20 w-[500px] h-[500px] rounded-full bg-gradient-to-l from-fuchsia-600/15 via-violet-600/10 to-transparent blur-[130px]" />
        
        {/* Bottom-left deep oceanic glow */}
        <div className="absolute -bottom-40 left-1/4 w-[650px] h-[650px] rounded-full bg-gradient-to-t from-cyan-600/15 via-blue-700/15 to-transparent blur-[140px]" />
      </div>

      {/* Mobile Drawer Backdrop */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-md z-40 lg:hidden transition-opacity"
        />
      )}

      {/* Floating Left Sidebar (Desktop + Mobile responsive drawer) */}
      <div
        className={`fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="h-full flex flex-col">
          {mobileMenuOpen && (
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="lg:hidden absolute top-7 right-7 p-2 rounded-xl glass-pill text-slate-300 hover:text-white z-50"
            >
              <X className="w-5 h-5" />
            </button>
          )}
          <Sidebar
            activeTab={activeTab}
            onSelectTab={(tab) => {
              setActiveTab(tab);
              setMobileMenuOpen(false);
            }}
            activeSessionTitle={activeSession?.status === 'active' ? activeSession.title : undefined}
            unverifiedCount={unverifiedCount}
          />
        </div>
      </div>

      {/* Main Content Viewport */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        {/* Top Liquid Glass Header matching Lumina */}
        <Header
          activeTab={activeTab}
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
          activeSessionTitle={activeSession?.status === 'active' ? activeSession.title : undefined}
          onSelectTab={setActiveTab}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        {/* Page Content Canvas */}
        <main className="flex-1 px-4 sm:px-6 py-3 max-w-[1600px] w-full mx-auto pb-16">
          {activeTab === 'overview' && (
            <OverviewDashboard
              onNavigate={(tab) => setActiveTab(tab)}
              onSelectSession={handleSelectSession}
            />
          )}

          {activeTab === 'live' && (
            <LiveClassroom selectedSessionId={selectedSessionId} />
          )}

          {activeTab === 'attendance' && (
            <AttendanceManagement />
          )}

          {activeTab === 'analytics' && (
            <EngagementAnalytics />
          )}

          {activeTab === 'sessions' && (
            <SessionManagement
              onNavigateToLive={(id) => {
                handleSelectSession(id);
                setActiveTab('live');
              }}
              onNavigateToAttendance={(id) => {
                handleSelectSession(id);
                setActiveTab('attendance');
              }}
            />
          )}

          {activeTab === 'participants' && (
            <ParticipantManagement />
          )}

          {activeTab === 'recommendations' && (
            <AITeachingAssistant />
          )}

          {activeTab === 'reports' && (
            <ReportsPage />
          )}

          {activeTab === 'privacy' && (
            <PrivacySettingsPage />
          )}
        </main>

        {/* Liquid Glass Bottom Footer */}
        <footer className="mt-auto px-6 py-4 border-t border-white/5 bg-slate-950/40 backdrop-blur-md text-xs text-slate-400">
          <div className="max-w-[1600px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="font-semibold text-slate-300">LUMINA Classroom Agent</span>
              <span className="text-slate-600">·</span>
              <span>Liquid Glass v2.4</span>
            </div>
            <div className="flex items-center gap-4 text-[11px] text-slate-400">
              <span>Local Computer Vision</span>
              <span>·</span>
              <span>Zero Biometric Storage</span>
              <span>·</span>
              <span className="text-emerald-400 font-medium">FERPA / GDPR Certified</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

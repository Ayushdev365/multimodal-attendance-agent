import React from 'react';
import {
  Search,
  Bell,
  MoreHorizontal,
  Menu,
  ShieldCheck,
  Video,
  Sparkles,
} from 'lucide-react';
import type { NavTab } from './Navbar.tsx';

interface HeaderProps {
  activeTab: NavTab;
  onOpenMobileMenu?: () => void;
  activeSessionTitle?: string;
  onSelectTab: (tab: NavTab) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onOpenMobileMenu,
  activeSessionTitle,
  onSelectTab,
  searchQuery,
  onSearchChange,
}) => {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning, Professor 👋';
    if (hour < 17) return 'Good afternoon, Professor 👋';
    return 'Good evening, Professor 👋';
  };

  const pageSubtitles: Record<NavTab, string> = {
    overview: "Here's what's happening across your classroom sessions today.",
    live: 'Live computer-vision tracking, presence counters, and acoustic activity.',
    attendance: 'Continuous presence records, sustained thresholds, and verification.',
    analytics: 'Observable acoustic speech dynamics and participant visibility trends.',
    sessions: 'Scheduled, active, and completed classroom monitoring sessions.',
    participants: 'Privacy-first student directory using participant identification codes.',
    recommendations: 'Empirical teaching suggestions grounded in acoustic and room data.',
    reports: 'Institutional compliance audit summaries and official CSV export.',
    privacy: 'Zero-storage retention policies, institutional data controls, and audit logs.',
  };

  return (
    <header className="px-6 pt-5 pb-3 flex flex-col md:flex-row md:items-center justify-between gap-4 z-20">
      {/* Left: Lumina Greeting & Contextual Subtitle */}
      <div className="flex items-center gap-3">
        {/* Mobile menu trigger */}
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 rounded-xl glass-pill text-slate-300 hover:text-white"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <span>{getGreeting()}</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5 max-w-xl">
            {pageSubtitles[activeTab] || "Here's what's happening with your classroom sessions."}
          </p>
        </div>
      </div>

      {/* Right: Frosted Pill Search + Action Icons matching Lumina Header */}
      <div className="flex items-center gap-3">
        {/* Glass Pill Search Input */}
        <div className="relative min-w-[200px] sm:min-w-[260px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search students, codes..."
            value={searchQuery}
            onChange={e => onSearchChange(e.target.value)}
            className="w-full glass-pill rounded-full py-2 pl-9 pr-4 text-xs text-slate-100 placeholder-slate-400/70 focus:outline-hidden focus:border-indigo-400/50 focus:ring-1 focus:ring-indigo-400/30 transition-all"
          />
        </div>

        {/* Live Active Pill */}
        {activeSessionTitle ? (
          <button
            onClick={() => onSelectTab('live')}
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 text-xs font-semibold hover:bg-emerald-500/25 transition-all shadow-xs"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="max-w-[120px] truncate">{activeSessionTitle}</span>
          </button>
        ) : (
          <button
            onClick={() => onSelectTab('sessions')}
            className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-indigo-600/80 hover:bg-indigo-500 border border-indigo-400/30 text-white text-xs font-semibold transition-all shadow-xs shadow-indigo-600/30"
          >
            <Video className="w-3.5 h-3.5" />
            <span>Launch</span>
          </button>
        )}

        {/* Notifications Icon Button */}
        <button
          onClick={() => onSelectTab('privacy')}
          className="relative w-9 h-9 rounded-full glass-pill flex items-center justify-center text-slate-300 hover:text-white transition-colors"
          title="Audit events and alerts"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-cyan-400 ring-2 ring-slate-950" />
        </button>

        {/* More Actions Pill */}
        <button
          onClick={() => onSelectTab('recommendations')}
          className="w-9 h-9 rounded-full glass-pill flex items-center justify-center text-slate-300 hover:text-white transition-colors"
          title="Teaching assistant insights"
        >
          <Sparkles className="w-4 h-4 text-indigo-300" />
        </button>
      </div>
    </header>
  );
};

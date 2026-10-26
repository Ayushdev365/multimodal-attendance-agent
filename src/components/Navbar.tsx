import React from 'react';
import {
  LayoutDashboard,
  Video,
  UserCheck,
  BarChart3,
  Calendar,
  Users,
  Sparkles,
  FileSpreadsheet,
  ShieldCheck,
} from 'lucide-react';

export type NavTab =
  | 'overview'
  | 'live'
  | 'attendance'
  | 'analytics'
  | 'sessions'
  | 'participants'
  | 'recommendations'
  | 'reports'
  | 'privacy';

interface NavbarProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  activeSessionTitle?: string;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, onSelectTab, activeSessionTitle }) => {
  const navItems: { id: NavTab; label: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: 'Overview', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'live', label: 'Live Classroom', icon: <Video className="w-4 h-4" /> },
    { id: 'attendance', label: 'Attendance', icon: <UserCheck className="w-4 h-4" /> },
    { id: 'analytics', label: 'Engagement', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'sessions', label: 'Sessions', icon: <Calendar className="w-4 h-4" /> },
    { id: 'participants', label: 'Participants', icon: <Users className="w-4 h-4" /> },
    { id: 'recommendations', label: 'Teaching AI', icon: <Sparkles className="w-4 h-4" /> },
    { id: 'reports', label: 'Reports', icon: <FileSpreadsheet className="w-4 h-4" /> },
    { id: 'privacy', label: 'Privacy & Audit', icon: <ShieldCheck className="w-4 h-4" /> },
  ];

  return (
    <header className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 px-6 py-3 transition-colors">
      <div className="flex items-center justify-between gap-8 max-w-7xl mx-auto">
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-7 h-7 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold text-xs">
            MA
          </div>
          <button
            onClick={() => onSelectTab('overview')}
            className="text-base font-bold tracking-tight text-white hover:text-blue-400 transition-colors whitespace-nowrap"
          >
            Multimodal Attendance Agent
          </button>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1 overflow-x-auto py-0.5">
          {navItems.map(item => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-all duration-150 ${
                  isActive
                    ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30 shadow-xs'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Primary Action / Active Context */}
        <div className="flex items-center gap-3 shrink-0">
          {activeSessionTitle ? (
            <button
              onClick={() => onSelectTab('live')}
              className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-emerald-300 bg-emerald-950/60 border border-emerald-500/30 rounded-md hover:bg-emerald-900/50 transition-colors whitespace-nowrap"
              title="Click to switch to active live classroom view"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="max-w-[140px] truncate">{activeSessionTitle}</span>
            </button>
          ) : (
            <button
              onClick={() => onSelectTab('sessions')}
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-md shadow-sm transition-all whitespace-nowrap"
            >
              Start Session
            </button>
          )}
        </div>
      </div>

      {/* Mobile navigation row */}
      <div className="lg:hidden flex items-center gap-1 overflow-x-auto pt-2 pb-1 border-t border-slate-800/60 mt-2">
        {navItems.map(item => (
          <button
            key={item.id}
            onClick={() => onSelectTab(item.id)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs whitespace-nowrap ${
              activeTab === item.id
                ? 'bg-blue-600/20 text-blue-400 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        ))}
      </div>
    </header>
  );
};

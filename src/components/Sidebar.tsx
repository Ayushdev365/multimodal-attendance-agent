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
  ChevronRight,
  ShieldAlert,
  ChevronDown,
} from 'lucide-react';
import type { NavTab } from './Navbar.tsx';

interface SidebarProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  activeSessionTitle?: string;
  unverifiedCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  activeSessionTitle,
  unverifiedCount = 0,
}) => {
  const navItems: { id: NavTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'overview', label: 'Overview', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'live', label: 'Live Classroom', icon: <Video className="w-4 h-4" /> },
    { id: 'attendance', label: 'Attendance', icon: <UserCheck className="w-4 h-4" />, badge: unverifiedCount > 0 ? unverifiedCount : undefined },
    { id: 'analytics', label: 'Analytics', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'sessions', label: 'Sessions', icon: <Calendar className="w-4 h-4" /> },
    { id: 'participants', label: 'Participants', icon: <Users className="w-4 h-4" /> },
    { id: 'recommendations', label: 'Teaching AI', icon: <Sparkles className="w-4 h-4" /> },
    { id: 'reports', label: 'Reports', icon: <FileSpreadsheet className="w-4 h-4" /> },
    { id: 'privacy', label: 'Privacy & Audit', icon: <ShieldCheck className="w-4 h-4" /> },
  ];

  return (
    <aside className="w-64 xl:w-72 shrink-0 flex flex-col justify-between h-[calc(100vh-2rem)] sticky top-4 my-4 ml-4 mr-0 glass-panel rounded-3xl p-5 select-none z-30 transition-all border border-white/12 shadow-2xl shadow-indigo-950/30">
      {/* Top: Lumina Logo & Brand */}
      <div className="space-y-6">
        <div className="flex items-center gap-3.5 px-2 py-1">
          {/* Faceted 3D Glass Gem/Prism Logo matching Lumina */}
          <div className="relative w-9 h-9 rounded-xl flex items-center justify-center p-0.5 bg-gradient-to-br from-violet-400 via-indigo-500 to-cyan-400 shadow-lg shadow-indigo-500/30">
            <div className="w-full h-full rounded-[10px] bg-slate-950/80 backdrop-blur-xs flex items-center justify-center">
              <div className="w-4 h-4 rotate-45 border-2 border-cyan-300 bg-gradient-to-tr from-violet-500/70 to-cyan-400/80 rounded-xs shadow-xs" />
            </div>
            {/* Ambient specular highlight */}
            <div className="absolute inset-0 rounded-xl bg-gradient-to-t from-transparent via-white/20 to-white/40 pointer-events-none" />
          </div>

          <div>
            <div className="text-base font-extrabold tracking-wider bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent">
              LUMINA
            </div>
            <div className="text-[10px] tracking-widest uppercase font-semibold text-indigo-300/80 -mt-0.5">
              Classroom AI
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1.5">
          {navItems.map(item => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-semibold tracking-wide transition-all duration-200 group relative ${
                  isActive
                    ? 'glass-nav-active text-white font-bold shadow-md shadow-indigo-950/30'
                    : 'text-slate-300/80 hover:text-white hover:bg-white/[0.07]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`transition-colors duration-200 ${
                      isActive ? 'text-cyan-300' : 'text-slate-400 group-hover:text-indigo-300'
                    }`}
                  >
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  {item.badge !== undefined && (
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold bg-amber-500/30 text-amber-300 border border-amber-400/30">
                      {item.badge}
                    </span>
                  )}
                  {isActive && (
                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-sm shadow-cyan-400/80 animate-pulse" />
                  )}
                </div>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Profile / User Tile matching Lumina reference */}
      <div className="pt-4 border-t border-white/10 space-y-3">
        {activeSessionTitle && (
          <div
            onClick={() => onSelectTab('live')}
            className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-400/20 hover:bg-emerald-500/20 transition-colors cursor-pointer group"
          >
            <div className="flex items-center justify-between text-[11px] font-semibold text-emerald-300">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Live Feed Active
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-emerald-400/60 group-hover:translate-x-0.5 transition-transform" />
            </div>
            <div className="text-[11px] text-slate-300 truncate mt-1 font-medium">
              {activeSessionTitle}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between p-2 rounded-2xl glass-pill hover:bg-white/10 transition-colors cursor-pointer">
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white text-xs font-bold border border-white/20 shadow-xs">
                JV
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-slate-950" />
            </div>
            <div className="text-left">
              <div className="text-xs font-bold text-white leading-tight">Prof. J. Vance</div>
              <div className="text-[10px] text-slate-400 truncate max-w-[110px]">
                instructor@lumina.io
              </div>
            </div>
          </div>
          <ChevronDown className="w-4 h-4 text-slate-400 mr-1" />
        </div>
      </div>
    </aside>
  );
};

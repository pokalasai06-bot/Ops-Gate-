import React from 'react';
import { UserRole } from '../types';
import { Shield, ShieldAlert, ShieldCheck, Terminal, Users } from 'lucide-react';
import { TEAM_MEMBERS } from '../data/teamMembers';

interface TopNavProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  userRole: UserRole;
  onChangeRole: (role: UserRole) => void;
  pendingExceptionsCount: number;
  stagedActionsCount: number;
}

export const TopNav: React.FC<TopNavProps> = ({
  currentTab,
  onSelectTab,
  userRole,
  onChangeRole,
  pendingExceptionsCount,
  stagedActionsCount,
}) => {
  const currentMember = TEAM_MEMBERS.find(m => m.role === userRole) || TEAM_MEMBERS[0];

  const navItems = [
    { id: 'dashboard', label: 'Overview' },
    { id: 'personal', label: 'Personal Dashboards' },
    { id: 'studio', label: 'Workflow Studio' },
    { 
      id: 'review', 
      label: pendingExceptionsCount > 0 
        ? `Review Queue (${pendingExceptionsCount})` 
        : 'Review Queue' 
    },
    { 
      id: 'gate', 
      label: stagedActionsCount > 0 
        ? `Execution Gate (${stagedActionsCount})` 
        : 'Execution Gate' 
    },
    { id: 'audit', label: 'Audit Trail' },
    { id: 'rules', label: 'Business Rules' },
    { id: 'integrations', label: 'Integrations' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#090d16]/95 backdrop-blur-md border-b border-amber-500/20 shadow-lg shadow-black/40">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 px-4 sm:px-6 py-3">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-200 via-amber-400 to-amber-700 text-slate-950 flex items-center justify-center font-bold text-sm tracking-widest shadow-md shadow-amber-500/20" style={{ fontFamily: 'var(--font-display)' }}>
            OG
          </div>
          <button 
            onClick={() => onSelectTab('dashboard')}
            className="text-lg font-bold tracking-wider hover:opacity-90 transition-opacity whitespace-nowrap text-left"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            <span className="text-white">Ops</span>
            <span className="text-amber-400">Gate</span>
            <span className="text-xs text-amber-200/60 font-mono tracking-normal ml-1 font-normal">AI</span>
          </button>
          <span className="text-[10px] text-amber-200/40 font-mono tracking-widest uppercase hidden xl:inline ml-1 border-l border-amber-500/20 pl-2.5">
            review-first ops
          </span>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden lg:flex items-center gap-4 xl:gap-5 text-xs font-medium text-slate-300">
          {navItems.map((item) => {
            const isPersonal = item.id === 'personal';
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`whitespace-nowrap shrink-0 transition-all py-1 flex items-center gap-1.5 ${
                  currentTab === item.id
                    ? 'text-amber-300 font-semibold border-b-2 border-amber-400 drop-shadow-[0_0_8px_rgba(212,175,55,0.4)]'
                    : 'hover:text-amber-200/90 text-slate-400'
                }`}
              >
                {isPersonal && <Users className="w-3.5 h-3.5 text-amber-400" />}
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Primary Action & Role Control */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Quick jump to Personal Dashboard */}
          <button
            onClick={() => onSelectTab('personal')}
            className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-lg border transition-all ${
              currentTab === 'personal'
                ? 'bg-amber-400 text-slate-950 font-bold border-amber-400 shadow-md'
                : 'bg-slate-900/80 text-amber-200 border-amber-500/30 hover:border-amber-400'
            }`}
            title="Open Personal Dashboard"
          >
            <span className="w-4 h-4 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center text-[10px] font-bold">
              {currentMember.avatar}
            </span>
            <span className="hidden md:inline font-mono text-[11px]">{currentMember.name.split(' ')[0]}</span>
          </button>

          {/* Active Gate Security Status */}
          <div 
            onClick={() => onSelectTab('gate')}
            className="cursor-pointer hidden sm:flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono rounded-full bg-amber-950/40 text-amber-300 border border-amber-500/40 hover:bg-amber-900/50 transition-all gold-glow"
            title="External actions cannot execute without manual sign-off"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span className="font-semibold tracking-wider text-[11px]">GATE: ARMED</span>
          </div>

          {/* User Role Switcher */}
          <div className="flex items-center text-xs">
            <select
              aria-label="User Role"
              value={userRole}
              onChange={(e) => onChangeRole(e.target.value as UserRole)}
              className="bg-slate-900/90 border border-amber-500/30 text-amber-100 text-xs rounded-lg px-2.5 py-1.5 font-medium focus:outline-none focus:ring-1 focus:ring-amber-400 cursor-pointer shadow-inner shadow-black/60"
            >
              <option value="business_owner" className="bg-slate-900 text-white">Alex Vance (Admin)</option>
              <option value="ops_staff" className="bg-slate-900 text-white">Sarah Lin (Ops)</option>
              <option value="ai_agent" className="bg-slate-900 text-white">OpsGate AI Agent</option>
            </select>
          </div>
        </div>
      </div>

      {/* Mobile / Compact nav row */}
      <div className="lg:hidden flex items-center overflow-x-auto gap-4 px-4 py-2 border-t border-amber-500/15 text-xs font-medium text-slate-300 bg-slate-950/60 scrollbar-none">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onSelectTab(item.id)}
            className={`whitespace-nowrap shrink-0 py-1 ${
              currentTab === item.id ? 'text-amber-300 font-semibold' : 'hover:text-amber-200 text-slate-400'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
    </header>
  );
};

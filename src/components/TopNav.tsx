import React from 'react';
import { UserRole } from '../types';
import { Shield, ShieldAlert, ShieldCheck } from 'lucide-react';

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
  const navItems = [
    { id: 'dashboard', label: 'Dashboard' },
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
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-8 px-6 py-3.5">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-base tracking-tighter">
            OG
          </div>
          <button 
            onClick={() => onSelectTab('dashboard')}
            className="text-lg font-bold tracking-tight text-slate-900 hover:text-slate-700 transition-colors whitespace-nowrap text-left"
          >
            OpsGate AI
          </button>
          <span className="text-xs text-slate-400 font-mono hidden lg:inline">
            review-first ops
          </span>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
                currentTab === item.id
                  ? 'text-slate-900 font-semibold border-b-2 border-slate-900'
                  : 'hover:text-slate-900'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Zone 3: Primary Action & Role Control */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Active Gate Security Status */}
          <div 
            onClick={() => onSelectTab('gate')}
            className="cursor-pointer hidden sm:flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono rounded bg-amber-50 text-amber-800 border border-amber-200/60 hover:bg-amber-100 transition-colors"
            title="External actions cannot execute without manual sign-off"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
            <span className="font-semibold">GATE: ARMED</span>
          </div>

          {/* User Role Switcher */}
          <div className="flex items-center text-xs">
            <span className="text-slate-500 mr-2 hidden sm:inline">Role:</span>
            <select
              aria-label="User Role"
              value={userRole}
              onChange={(e) => onChangeRole(e.target.value as UserRole)}
              className="bg-slate-100 border border-slate-200 text-slate-800 text-xs rounded-md px-2.5 py-1.5 font-medium focus:outline-none focus:ring-1 focus:ring-slate-900"
            >
              <option value="business_owner">Business Owner (Admin)</option>
              <option value="ops_staff">Operations Staff (Reviewer)</option>
              <option value="ai_agent">AI Agent Inspector</option>
            </select>
          </div>
        </div>
      </div>

      {/* Mobile nav row */}
      <div className="md:hidden flex items-center overflow-x-auto gap-4 px-6 py-2 border-t border-slate-100 text-xs font-medium text-slate-600">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onSelectTab(item.id)}
            className={`whitespace-nowrap shrink-0 py-1 ${
              currentTab === item.id ? 'text-slate-900 font-semibold' : 'hover:text-slate-900'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
    </header>
  );
};

import React, { useState } from 'react';
import { BusinessRecord, AuditEvent, UserRole } from '../types';
import { TEAM_MEMBERS, TeamMember } from '../data/teamMembers';
import { 
  ShieldCheck, 
  ShieldAlert, 
  CheckCircle2, 
  XCircle, 
  Edit3, 
  Search, 
  UserCheck, 
  Sparkles, 
  ArrowRight, 
  TrendingUp, 
  TrendingDown, 
  Layers,
  Lock,
  Clock,
  Briefcase
} from 'lucide-react';

interface PersonalDashboardViewProps {
  records: BusinessRecord[];
  auditLogs: AuditEvent[];
  userRole: UserRole;
  onChangeRole: (role: UserRole) => void;
  onOpenRecordEditor: (record: BusinessRecord) => void;
  onApproveRecord: (recordId: string, notes?: string) => void;
  onRejectRecord: (recordId: string, reason: string) => void;
  onNavigateTab: (tab: string) => void;
}

export const PersonalDashboardView: React.FC<PersonalDashboardViewProps> = ({
  records,
  auditLogs,
  userRole,
  onChangeRole,
  onOpenRecordEditor,
  onApproveRecord,
  onRejectRecord,
  onNavigateTab,
}) => {
  // Map current userRole to initial member
  const initialMember = TEAM_MEMBERS.find(m => m.role === userRole) || TEAM_MEMBERS[0];
  const [selectedMember, setSelectedMember] = useState<TeamMember>(initialMember);

  // Filters for assigned records
  const [searchFilter, setSearchFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'exception' | 'valid' | 'approved'>('all');

  // Filter records relevant to this member
  const assignedRecords = records.filter(rec => {
    // Search filter
    if (searchFilter) {
      const q = searchFilter.toLowerCase();
      const matchId = rec.id.toLowerCase().includes(q);
      const matchName = String(rec.fields.customer_name || rec.fields.vendor_name || '').toLowerCase().includes(q);
      const matchCompany = String(rec.fields.company || '').toLowerCase().includes(q);
      if (!matchId && !matchName && !matchCompany) return false;
    }

    // Status filter
    if (statusFilter !== 'all') {
      if (statusFilter === 'exception' && rec.validationStatus !== 'exception') return false;
      if (statusFilter === 'valid' && (rec.validationStatus !== 'valid' && rec.validationStatus !== 'corrected')) return false;
      if (statusFilter === 'approved' && rec.reviewStatus !== 'approved') return false;
    }

    // Person-specific domain filtering
    if (selectedMember.id === 'marcus_sterling') {
      // Invoices / AP focus
      return rec.id.startsWith('INV') || rec.sourceName.toLowerCase().includes('bill') || rec.sourceName.toLowerCase().includes('invoice');
    }
    if (selectedMember.id === 'sarah_lin') {
      // Leads & data quality focus
      return rec.id.startsWith('L') || rec.validationStatus === 'exception';
    }
    if (selectedMember.id === 'alex_vance') {
      // Executive focus: all items with risk, amount > $2500, or exceptions
      const amountStr = String(rec.fields.deal_size || rec.fields.amount || '0');
      const num = parseFloat(amountStr.replace(/[^0-9.]/g, '')) || 0;
      return num >= 2500 || rec.validationStatus === 'exception';
    }
    if (selectedMember.id === 'elena_rostova') {
      // Support & customer focus
      return rec.id.startsWith('L') || rec.fields.status === 'New' || rec.fields.status === 'Inquiry';
    }

    return true;
  });

  // Filter audit events where this person is involved
  const personalAudits = auditLogs.filter(log => {
    if (selectedMember.id === 'alex_vance') return log.actorRole === 'business_owner' || log.actor.includes('Alex');
    if (selectedMember.id === 'sarah_lin') return log.actorRole === 'ops_staff' && log.actor.includes('Sarah');
    if (selectedMember.id === 'marcus_sterling') return log.details.includes('INV') || log.details.includes('invoice') || log.actor.includes('Marcus');
    if (selectedMember.id === 'elena_rostova') return log.details.includes('Lead') || log.actor.includes('Elena');
    if (selectedMember.id === 'opsgate_agent') return log.actorRole === 'ai_agent' || log.actor.includes('AI') || log.actor.includes('OpsGate');
    return true;
  }).slice(0, 8);

  const pendingExceptionsInScope = assignedRecords.filter(r => r.validationStatus === 'exception' && r.reviewStatus !== 'approved').length;
  const approvedInScope = assignedRecords.filter(r => r.reviewStatus === 'approved').length;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Header: Team Switcher & Identity Bar */}
      <div className="luxury-card p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Active Persona Header */}
          <div className="flex items-start sm:items-center gap-4">
            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${selectedMember.avatarBg} text-slate-950 flex items-center justify-center font-bold text-xl tracking-wider shadow-lg shadow-amber-500/20 shrink-0`} style={{ fontFamily: 'var(--font-display)' }}>
              {selectedMember.avatar}
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-2xl font-bold text-white tracking-wide" style={{ fontFamily: 'var(--font-display)' }}>
                  {selectedMember.name}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/30">
                  {selectedMember.clearance}
                </span>
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-mono bg-emerald-950/40 text-emerald-400 border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  {selectedMember.status}
                </span>
              </div>
              <p className="text-sm text-slate-300 mt-1 font-medium">
                {selectedMember.title} <span className="text-amber-500/50">·</span> <span className="text-amber-200/70">{selectedMember.department}</span>
              </p>
              <p className="text-xs text-slate-400 mt-1 max-w-2xl font-light">
                {selectedMember.bio}
              </p>
            </div>
          </div>

          {/* Quick Persona Switcher Buttons */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 shrink-0">
            <div className="flex items-center gap-1.5 p-1 bg-slate-900/90 rounded-xl border border-amber-500/20 shadow-inner">
              {TEAM_MEMBERS.map((member) => {
                const isSelected = member.id === selectedMember.id;
                return (
                  <button
                    key={member.id}
                    onClick={() => setSelectedMember(member)}
                    title={`${member.name} (${member.title})`}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      isSelected
                        ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold shadow-md shadow-amber-500/30 scale-105'
                        : 'text-slate-400 hover:text-amber-200 hover:bg-slate-800/60'
                    }`}
                  >
                    <span className="w-4 h-4 rounded-full bg-slate-950/30 flex items-center justify-center text-[10px] font-bold">
                      {member.avatar}
                    </span>
                    <span className="hidden md:inline">{member.name.split(' ')[0]}</span>
                  </button>
                );
              })}
            </div>

            {/* Sync Role Button */}
            {userRole !== selectedMember.role && (
              <button
                onClick={() => onChangeRole(selectedMember.role)}
                className="gold-button px-3.5 py-1.5 text-xs font-semibold flex items-center gap-1.5 shadow-md"
                title={`Switch active application session role to ${selectedMember.role}`}
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Assume {selectedMember.role === 'business_owner' ? 'Admin' : selectedMember.role === 'ops_staff' ? 'Operator' : 'Agent'} Role</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* KPI Metrics Strip for this Persona */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {selectedMember.kpiStats.map((kpi) => (
          <div key={kpi.id} className="luxury-card p-5 relative overflow-hidden group hover:border-amber-500/40 transition-all">
            <div className="flex items-start justify-between">
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                {kpi.label}
              </span>
              <span className={`inline-flex items-center gap-1 text-[11px] font-mono font-semibold px-2 py-0.5 rounded-full ${
                kpi.trend === 'up' 
                  ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-500/30' 
                  : kpi.trend === 'down'
                  ? 'bg-amber-950/40 text-amber-300 border border-amber-500/30'
                  : 'bg-slate-800/80 text-slate-300 border border-slate-700'
              }`}>
                {kpi.trend === 'up' && <TrendingUp className="w-3 h-3" />}
                {kpi.trend === 'down' && <TrendingDown className="w-3 h-3" />}
                {kpi.change}
              </span>
            </div>
            <div className="text-2xl font-bold text-white mt-2 tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
              {kpi.value}
            </div>
            <p className="text-xs text-amber-200/50 mt-1 font-light">
              {kpi.subtext}
            </p>
          </div>
        ))}
      </div>

      {/* 2-Column Core Section: Assigned Records Queue & Personal Responsibilities/Audit */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Assigned Operational Records (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="luxury-card p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-amber-500/15">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2" style={{ fontFamily: 'var(--font-display)' }}>
                  <Layers className="w-5 h-5 text-amber-400" />
                  <span>Assigned Operations Queue</span>
                  <span className="px-2 py-0.5 rounded-full text-xs font-mono bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    {assignedRecords.length}
                  </span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Records matching {selectedMember.name}'s scope and authorization policies.
                </p>
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Search records..."
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                    className="bg-slate-900/90 border border-amber-500/20 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 font-mono w-36 sm:w-44"
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="bg-slate-900/90 border border-amber-500/20 rounded-lg px-2.5 py-1.5 text-xs text-amber-200 focus:outline-none focus:border-amber-400 cursor-pointer"
                >
                  <option value="all">All Statuses</option>
                  <option value="exception">Exceptions Only</option>
                  <option value="valid">Clean / Valid</option>
                  <option value="approved">Approved</option>
                </select>
              </div>
            </div>

            {/* Records List */}
            <div className="mt-4 space-y-3 max-h-[500px] overflow-y-auto pr-1">
              {assignedRecords.length === 0 ? (
                <div className="text-center py-12 text-slate-500 text-xs">
                  <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-400/50 mb-2" />
                  No pending records matching filter for {selectedMember.name}.
                </div>
              ) : (
                assignedRecords.map((rec) => {
                  const isException = rec.validationStatus === 'exception';
                  const isApproved = rec.reviewStatus === 'approved';
                  const isRejected = rec.reviewStatus === 'rejected';

                  return (
                    <div 
                      key={rec.id}
                      className={`p-4 rounded-xl border transition-all ${
                        isException && !isApproved
                          ? 'bg-amber-950/20 border-amber-500/40 hover:border-amber-400'
                          : isApproved
                          ? 'bg-emerald-950/15 border-emerald-500/30'
                          : isRejected
                          ? 'bg-rose-950/15 border-rose-500/30 opacity-70'
                          : 'bg-slate-900/50 border-slate-800 hover:border-amber-500/30'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono text-xs font-bold text-amber-300">
                              {rec.id}
                            </span>
                            <span className="text-sm font-semibold text-white">
                              {rec.fields.customer_name || rec.fields.vendor_name || 'Anonymous Record'}
                            </span>
                            {rec.fields.company && (
                              <span className="text-xs text-slate-400">
                                ({rec.fields.company})
                              </span>
                            )}
                            {rec.fields.amount && (
                              <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                                ${rec.fields.amount.toFixed(2)}
                              </span>
                            )}
                            {rec.fields.deal_size && (
                              <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                                {rec.fields.deal_size}
                              </span>
                            )}
                          </div>

                          <div className="text-xs text-slate-400 flex items-center gap-3">
                            <span>Source: <strong className="text-slate-300">{rec.sourceName}</strong></span>
                            <span>•</span>
                            <span>Confidence: <strong className={rec.confidenceScore >= 80 ? 'text-emerald-400 font-mono' : 'text-amber-400 font-mono'}>{rec.confidenceScore}%</strong></span>
                          </div>

                          {/* Issues list if exception */}
                          {rec.issues.length > 0 && (
                            <div className="mt-2 space-y-1">
                              {rec.issues.map((iss, i) => (
                                <div key={i} className="text-xs text-amber-300/90 flex items-center gap-1.5">
                                  <ShieldAlert className="w-3 h-3 text-amber-400 shrink-0" />
                                  <span>{iss.message}</span>
                                </div>
                              ))}
                            </div>
                          )}

                          {rec.reviewerNotes && (
                            <div className="text-xs text-slate-400 italic mt-1 bg-slate-950/40 p-2 rounded border border-slate-800">
                              Note: {rec.reviewerNotes}
                            </div>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            onClick={() => onOpenRecordEditor(rec)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all border border-slate-700"
                            title="Edit Record Fields Inline"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          {!isApproved && (
                            <button
                              onClick={() => onApproveRecord(rec.id, `Approved by ${selectedMember.name}`)}
                              className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1 shadow transition-all"
                              title="Authorize this record"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">Approve</span>
                            </button>
                          )}

                          {!isRejected && (
                            <button
                              onClick={() => onRejectRecord(rec.id, `Rejected by ${selectedMember.name} (Policy Non-Compliance)`)}
                              className="px-2 py-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-500/30 text-xs font-medium flex items-center gap-1 transition-all"
                              title="Reject and block this record"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Quick Link to Execution Gate */}
            <div className="mt-4 pt-4 border-t border-amber-500/15 flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                All approvals are staged safely. External dispatches require Execution Gate release.
              </span>
              <button
                onClick={() => onNavigateTab('gate')}
                className="text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1 transition-colors"
              >
                <span>View Execution Gate</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Assigned Queues & Personal Action Ledger (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Assigned Responsibilities & Governance Queues */}
          <div className="luxury-card p-6">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-amber-400" />
              <span>Assigned Queues & Policy Gates</span>
            </h3>
            <div className="space-y-2.5">
              {selectedMember.assignedQueues.map((queue, i) => (
                <div key={i} className="p-3 rounded-lg bg-slate-900/60 border border-amber-500/20 text-xs flex items-center justify-between gap-3">
                  <div>
                    <div className="text-amber-300 font-medium">{queue}</div>
                    <div className="text-slate-400 mt-0.5 text-[11px]">Strict review barrier enforced prior to dispatch</div>
                  </div>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                </div>
              ))}
            </div>

            {/* Core Responsibilities list */}
            <div className="mt-4 pt-4 border-t border-amber-500/15">
              <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Operational Authority & Safeguards
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-300">
                {selectedMember.responsibilities.map((resp, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-amber-400 mt-0.5">•</span>
                    <span className="font-light">{resp}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Personal Action Ledger & Audit Timeline */}
          <div className="luxury-card p-6">
            <div className="flex items-center justify-between pb-3 border-b border-amber-500/15">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Personal Action Ledger</span>
              </h3>
              <button
                onClick={() => onNavigateTab('audit')}
                className="text-xs text-amber-400 hover:text-amber-300 font-medium flex items-center gap-1 transition-colors"
              >
                <span>Full Ledger</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="mt-3 space-y-3">
              {personalAudits.length === 0 ? (
                <div className="text-slate-500 text-xs py-4 text-center">
                  No personal events recorded yet for this session.
                </div>
              ) : (
                personalAudits.map((log) => (
                  <div key={log.id} className="p-2.5 rounded-lg bg-slate-900/50 border border-slate-800 text-xs space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-mono text-amber-400 font-semibold">{log.eventType}</span>
                      <span className="text-slate-500 font-mono">{log.timestamp.slice(11, 19)}</span>
                    </div>
                    <div className="text-slate-300 text-[11px] leading-relaxed">
                      {log.details}
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono truncate">
                      Hash: {log.hash}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

import React from 'react';
import { BusinessRecord, AuditEvent, ConnectorInfo, ValidationRule } from '../types';
import { 
  ShieldCheck, 
  ShieldAlert, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight, 
  Layers, 
  Sparkles,
  Lock,
  ExternalLink,
  FileSpreadsheet,
  Receipt,
  Headphones
} from 'lucide-react';

interface DashboardViewProps {
  records: BusinessRecord[];
  auditLogs: AuditEvent[];
  rules: ValidationRule[];
  connectors: ConnectorInfo[];
  onNavigateTab: (tab: string) => void;
  onSelectScenario: (scenarioId: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  records,
  auditLogs,
  rules,
  connectors,
  onNavigateTab,
  onSelectScenario,
}) => {
  const exceptionCount = records.filter(r => r.validationStatus === 'exception' && r.reviewStatus !== 'approved').length;
  const approvedCount = records.filter(r => r.reviewStatus === 'approved').length;
  const validCount = records.filter(r => r.validationStatus === 'valid' || r.validationStatus === 'corrected').length;
  const totalStaged = records.reduce((acc, r) => acc + r.stagedActions.filter(a => a.status === 'staged').length, 0);
  const totalDispatched = records.reduce((acc, r) => acc + r.stagedActions.filter(a => a.status === 'dispatched').length, 0);

  return (
    <div className="space-y-8 relative">
      {/* Ambient background glows for luxury depth */}
      <div className="absolute -top-16 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none animate-pulse-slow"></div>
      <div className="absolute top-1/3 -right-20 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Hero Security Gating Banner with Luxury Finish */}
      <div className="luxury-card rounded-2xl p-6 sm:p-8 relative overflow-hidden">
        {/* Subtle decorative gold corner motif */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-amber-400/10 via-transparent to-transparent pointer-events-none"></div>

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 text-xs font-mono text-amber-300/80 mb-2.5">
              <span className="font-semibold tracking-wider uppercase text-[10px] text-amber-400">Institutional Review Architecture</span>
              <span className="text-amber-500/40">·</span>
              <span className="text-emerald-400 font-medium">Safe Execution Guarantee</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-normal text-white text-balance" style={{ fontFamily: 'var(--font-serif)' }}>
              Autonomous Planning. <span className="italic gold-gradient-text font-serif">Human-Controlled Action.</span>
            </h1>
            <p className="text-sm text-slate-300 mt-2.5 leading-relaxed max-w-2xl font-light">
              OpsGate parses natural-language directives into deterministic task plans and runs strict data validation. Outbound writes to CRM, email, and messaging are held behind a cryptographically logged execution gate until you sign off.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0 relative z-10">
            <button
              onClick={() => onNavigateTab('studio')}
              className="gold-button px-5 py-2.5 text-xs rounded-xl flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-slate-900" />
              <span>Create New Workflow</span>
            </button>
            <button
              onClick={() => onNavigateTab('gate')}
              className="px-4 py-2.5 text-xs font-semibold text-amber-200 bg-slate-900/80 border border-amber-500/30 rounded-xl hover:bg-slate-800/80 hover:border-amber-400/50 transition-all flex items-center gap-2 shadow-inner shadow-black/40"
            >
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span>Inspect Gate ({totalStaged})</span>
            </button>
          </div>
        </div>

        {/* Real-time Status Metric Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-amber-500/15 relative z-10">
          <div className="p-3 rounded-xl bg-slate-950/40 border border-white/5">
            <div className="text-[11px] text-slate-400 uppercase tracking-wider font-mono">Exceptions Requiring Review</div>
            <div className="text-2xl sm:text-3xl font-semibold text-white font-mono tabular-nums mt-1 flex items-baseline gap-2">
              <span className="text-amber-300">{exceptionCount}</span>
              {exceptionCount > 0 && (
                <span className="text-[11px] font-sans text-rose-400 font-medium">Action Needed</span>
              )}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/40 border border-white/5">
            <div className="text-[11px] text-slate-400 uppercase tracking-wider font-mono">Staged External Actions</div>
            <div className="text-2xl sm:text-3xl font-semibold text-white font-mono tabular-nums mt-1 flex items-baseline gap-2">
              <span className="text-amber-200">{totalStaged}</span>
              <span className="text-[11px] font-sans text-amber-400/80 font-medium">Held at Gate</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/40 border border-white/5">
            <div className="text-[11px] text-slate-400 uppercase tracking-wider font-mono">Authorized & Dispatched</div>
            <div className="text-2xl sm:text-3xl font-semibold text-white font-mono tabular-nums mt-1 flex items-baseline gap-2">
              <span className="text-emerald-400">{totalDispatched}</span>
              <span className="text-[11px] font-sans text-emerald-400/80 font-medium">Verified</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/40 border border-white/5">
            <div className="text-[11px] text-slate-400 uppercase tracking-wider font-mono">Immutable Audit Entries</div>
            <div className="text-2xl sm:text-3xl font-semibold text-white font-mono tabular-nums mt-1 flex items-baseline gap-2">
              <span className="text-slate-200">{auditLogs.length}</span>
              <span className="text-[10px] font-mono text-amber-400/60 uppercase">SHA-256</span>
            </div>
          </div>
        </div>
      </div>

      {/* Role-Based Squad Dashboards Banner */}
      <div className="luxury-card rounded-2xl p-6 relative overflow-hidden border-amber-500/30">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-amber-500/15">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <h2 className="text-lg font-bold text-white tracking-wide" style={{ fontFamily: 'var(--font-display)' }}>
                Individual Operations Dashboards
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Personalized dashboards for each team member with tailored queues, dual-authorization limits, and domain-specific oversight.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => onNavigateTab('personal')}
              className="gold-button px-4 py-2 text-xs font-semibold flex items-center gap-1.5 shadow"
            >
              <span>Open Personal Dashboards</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 5 Squad Persona Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 mt-5">
          <div 
            onClick={() => onNavigateTab('personal')}
            className="cursor-pointer p-3.5 rounded-xl bg-slate-900/60 border border-amber-500/20 hover:border-amber-400 hover:bg-slate-900/90 transition-all group"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-amber-700 text-slate-950 flex items-center justify-center font-bold text-xs">
                AV
              </div>
              <div>
                <div className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors">Alex Vance</div>
                <div className="text-[10px] text-amber-200/60 font-mono">Managing Director</div>
              </div>
            </div>
            <div className="mt-2 text-[11px] text-slate-400 font-light line-clamp-2">
              Level 4 Clearance · $14.2k Gated Capital · Executive write-barrier sign-offs
            </div>
          </div>

          <div 
            onClick={() => onNavigateTab('personal')}
            className="cursor-pointer p-3.5 rounded-xl bg-slate-900/60 border border-emerald-500/20 hover:border-emerald-400 hover:bg-slate-900/90 transition-all group"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-700 text-slate-950 flex items-center justify-center font-bold text-xs">
                SL
              </div>
              <div>
                <div className="text-xs font-bold text-white group-hover:text-emerald-300 transition-colors">Sarah Lin</div>
                <div className="text-[10px] text-emerald-200/60 font-mono">Senior Ops Lead</div>
              </div>
            </div>
            <div className="mt-2 text-[11px] text-slate-400 font-light line-clamp-2">
              Level 3 Clearance · Inbound Leads Triage · Duplicate Resolution Queue
            </div>
          </div>

          <div 
            onClick={() => onNavigateTab('personal')}
            className="cursor-pointer p-3.5 rounded-xl bg-slate-900/60 border border-yellow-500/20 hover:border-yellow-400 hover:bg-slate-900/90 transition-all group"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-yellow-800 text-slate-950 flex items-center justify-center font-bold text-xs">
                MS
              </div>
              <div>
                <div className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors">Marcus Sterling</div>
                <div className="text-[10px] text-yellow-200/60 font-mono">AP Controller</div>
              </div>
            </div>
            <div className="mt-2 text-[11px] text-slate-400 font-light line-clamp-2">
              Level 3 Clearance · Vendor Bills &gt; $2.5k · QuickBooks batch staging
            </div>
          </div>

          <div 
            onClick={() => onNavigateTab('personal')}
            className="cursor-pointer p-3.5 rounded-xl bg-slate-900/60 border border-purple-500/20 hover:border-purple-400 hover:bg-slate-900/90 transition-all group"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-400 to-indigo-800 text-slate-950 flex items-center justify-center font-bold text-xs">
                ER
              </div>
              <div>
                <div className="text-xs font-bold text-white group-hover:text-purple-300 transition-colors">Elena Rostova</div>
                <div className="text-[10px] text-purple-200/60 font-mono">Client Ops Lead</div>
              </div>
            </div>
            <div className="mt-2 text-[11px] text-slate-400 font-light line-clamp-2">
              Level 2 Clearance · VIP Inquiries · Customer outreach communication drafts
            </div>
          </div>

          <div 
            onClick={() => onNavigateTab('personal')}
            className="cursor-pointer p-3.5 rounded-xl bg-slate-900/60 border border-amber-500/30 hover:border-amber-400 hover:bg-slate-900/90 transition-all group"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-300 to-amber-700 text-slate-950 flex items-center justify-center font-bold text-xs">
                OG
              </div>
              <div>
                <div className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors">OpsGate AI</div>
                <div className="text-[10px] text-amber-200/60 font-mono">Autonomous Planner</div>
              </div>
            </div>
            <div className="mt-2 text-[11px] text-slate-400 font-light line-clamp-2">
              Level 1 Clearance · 8-Step DAG · Deterministic rules &amp; SHA-256 seal
            </div>
          </div>
        </div>
      </div>

      {/* Workflow Pre-loaded Scenarios */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-normal text-white" style={{ fontFamily: 'var(--font-serif)' }}>
              Curated Business Scenarios
            </h2>
            <p className="text-xs text-slate-400">
              Select an operational template to simulate AI instruction synthesis, multi-rule validation, and execution barriers.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Scenario 1: Customer Leads */}
          <div 
            onClick={() => {
              onSelectScenario('leads_spreadsheet');
              onNavigateTab('studio');
            }}
            className="cursor-pointer luxury-card rounded-2xl p-5 hover:border-amber-400/40 transition-all flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-900/60 to-slate-950 border border-blue-500/30 text-blue-300 flex items-center justify-center shadow-md">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <span className="text-xs font-mono text-amber-300/70 border border-amber-500/20 px-2 py-0.5 rounded-md bg-amber-950/20">5 Records</span>
              </div>
              <h3 className="text-base font-semibold text-white mt-4 group-hover:text-amber-300 transition-colors">
                Customer Leads Triage & CRM
              </h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Ingests inbound leads spreadsheet, flags duplicate emails and missing formats, stages CRM draft cards, and holds welcome outreach.
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-white/10 flex items-center justify-between text-xs font-medium text-amber-300">
              <span>Initialize Workflow</span>
              <ArrowRight className="w-4 h-4 text-amber-400 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Scenario 2: Vendor Invoices */}
          <div 
            onClick={() => {
              onSelectScenario('vendor_invoices');
              onNavigateTab('studio');
            }}
            className="cursor-pointer luxury-card rounded-2xl p-5 hover:border-amber-400/40 transition-all flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-900/60 to-slate-950 border border-amber-500/30 text-amber-300 flex items-center justify-center shadow-md">
                  <Receipt className="w-5 h-5" />
                </div>
                <span className="text-xs font-mono text-amber-300/70 border border-amber-500/20 px-2 py-0.5 rounded-md bg-amber-950/20">5 Bills</span>
              </div>
              <h3 className="text-base font-semibold text-white mt-4 group-hover:text-amber-300 transition-colors">
                Vendor Invoices & AP Review
              </h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Audits supplier invoices for negative balances, duplicate invoice numbers, and $2,500 senior authorization limits before payment staging.
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-white/10 flex items-center justify-between text-xs font-medium text-amber-300">
              <span>Initialize Workflow</span>
              <ArrowRight className="w-4 h-4 text-amber-400 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Scenario 3: Support Inquiries */}
          <div 
            onClick={() => {
              onSelectScenario('support_tickets');
              onNavigateTab('studio');
            }}
            className="cursor-pointer luxury-card rounded-2xl p-5 hover:border-amber-400/40 transition-all flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-900/60 to-slate-950 border border-emerald-500/30 text-emerald-300 flex items-center justify-center shadow-md">
                  <Headphones className="w-5 h-5" />
                </div>
                <span className="text-xs font-mono text-amber-300/70 border border-amber-500/20 px-2 py-0.5 rounded-md bg-amber-950/20">4 Tickets</span>
              </div>
              <h3 className="text-base font-semibold text-white mt-4 group-hover:text-amber-300 transition-colors">
                Support Ticket Triage
              </h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Validates customer IDs, detects urgent delivery escalations, drafts standard resolution emails, and prevents auto-dispatch.
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-white/10 flex items-center justify-between text-xs font-medium text-amber-300">
              <span>Initialize Workflow</span>
              <ArrowRight className="w-4 h-4 text-amber-400 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Layout: Review Highlights & Audit Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Review Queue Spotlight */}
        <div className="luxury-card rounded-2xl p-6">
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div>
              <h3 className="text-base font-semibold text-white">
                Actionable Exception Queue
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Records flagged by validation engine requiring human judgment
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('review')}
              className="text-xs font-medium text-amber-300 hover:text-amber-200 flex items-center gap-1 transition-colors"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="mt-4 space-y-3">
            {records.slice(0, 4).map((rec) => {
              const hasErr = rec.validationStatus === 'exception';
              return (
                <div
                  key={rec.id}
                  onClick={() => onNavigateTab('review')}
                  className="cursor-pointer p-3 rounded-xl border border-white/5 bg-slate-950/40 hover:border-amber-500/30 hover:bg-slate-900/60 transition-all flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-slate-900 text-amber-300 border border-amber-500/20">
                      {rec.id}
                    </span>
                    <div>
                      <div className="text-xs font-medium text-white">
                        {rec.fields.customer_name || rec.fields.vendorName || rec.id}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate max-w-xs">
                        {rec.issues.length > 0
                          ? rec.issues[0].message
                          : 'Valid record · Staged for CRM draft'}
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    {hasErr ? (
                      <span className="text-xs font-semibold text-rose-400">Flagged Issue</span>
                    ) : (
                      <span className="text-xs font-semibold text-emerald-400">Passes Quality</span>
                    )}
                    <div className="text-[11px] font-mono text-slate-400 tabular-nums">
                      {rec.confidenceScore}% conf
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Immutable Audit Feed */}
        <div className="luxury-card rounded-2xl p-6">
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div>
              <h3 className="text-base font-semibold text-white">
                Immutable Ledger Highlights
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Tamper-evident log of agent plans, operator decisions, and gate interventions
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('audit')}
              className="text-xs font-medium text-amber-300 hover:text-amber-200 flex items-center gap-1 transition-colors"
            >
              <span>Full Ledger</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="mt-4 space-y-3 font-mono text-xs">
            {auditLogs.slice(0, 4).map((evt) => (
              <div key={evt.id} className="p-3 rounded-xl border border-white/5 bg-slate-950/40">
                <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                  <span className="font-semibold text-amber-300">{evt.id}</span>
                  <span className="tabular-nums text-slate-400">{evt.timestamp}</span>
                </div>
                <div className="text-xs text-slate-200 font-sans">
                  {evt.details}
                </div>
                <div className="mt-1 text-[11px] text-slate-400 flex items-center gap-2">
                  <span>Actor: <span className="text-slate-300">{evt.actor}</span></span>
                  <span>·</span>
                  <span className="truncate max-w-[180px] text-amber-200/50">{evt.hash}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

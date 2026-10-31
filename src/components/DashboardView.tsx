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
    <div className="space-y-8">
      {/* Hero Security Gating Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 text-xs font-mono text-slate-500 mb-2">
              <span className="font-semibold text-slate-800">Review-First Architecture</span>
              <span>·</span>
              <span className="text-emerald-700 font-medium">Safe Execution Guarantee</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 text-balance">
              Autonomous Planning. Human-Controlled Action.
            </h1>
            <p className="text-sm text-slate-600 mt-2 leading-relaxed">
              OpsGate converts plain-language instructions into deterministic task plans and runs strict data validation. Outbound writes to CRM, email, and messaging are held behind an execution gate until you approve.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => onNavigateTab('studio')}
              className="px-4 py-2.5 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors flex items-center gap-2 shadow-xs"
            >
              <Sparkles className="w-4 h-4 text-slate-300" />
              <span>Create New Workflow</span>
            </button>
            <button
              onClick={() => onNavigateTab('gate')}
              className="px-4 py-2.5 text-xs font-semibold text-slate-800 bg-slate-100 border border-slate-200 rounded-lg hover:bg-slate-200 transition-colors flex items-center gap-2"
            >
              <Lock className="w-3.5 h-3.5 text-slate-600" />
              <span>Inspect Gate ({totalStaged})</span>
            </button>
          </div>
        </div>

        {/* Real-time Status Metric Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-slate-100">
          <div>
            <div className="text-xs text-slate-500">Exceptions Requiring Review</div>
            <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums mt-1 flex items-baseline gap-2">
              <span>{exceptionCount}</span>
              {exceptionCount > 0 && (
                <span className="text-xs font-sans text-rose-600 font-medium">Action Needed</span>
              )}
            </div>
          </div>

          <div>
            <div className="text-xs text-slate-500">Staged External Actions</div>
            <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums mt-1 flex items-baseline gap-2">
              <span>{totalStaged}</span>
              <span className="text-xs font-sans text-amber-700 font-medium">Held at Gate</span>
            </div>
          </div>

          <div>
            <div className="text-xs text-slate-500">Authorized & Dispatched</div>
            <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums mt-1 flex items-baseline gap-2">
              <span>{totalDispatched}</span>
              <span className="text-xs font-sans text-emerald-700 font-medium">Verified</span>
            </div>
          </div>

          <div>
            <div className="text-xs text-slate-500">Immutable Audit Entries</div>
            <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums mt-1 flex items-baseline gap-2">
              <span>{auditLogs.length}</span>
              <span className="text-xs font-mono text-slate-400">SHA-256</span>
            </div>
          </div>
        </div>
      </div>

      {/* Workflow Pre-loaded Scenarios */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Interactive Business Workflows
            </h2>
            <p className="text-xs text-slate-500">
              Select a pre-loaded small business scenario to see AI instruction parsing, validation findings, and human review gating in action.
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
            className="cursor-pointer bg-white border border-slate-200 rounded-xl p-5 hover:border-slate-400 hover:shadow-xs transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <span className="text-xs font-mono text-slate-400">5 Records</span>
              </div>
              <h3 className="text-base font-semibold text-slate-900 mt-4">
                Customer Leads Triage & CRM
              </h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Reads inbound leads spreadsheet, flags duplicate emails and missing formats, stages CRM draft cards, and holds welcome outreach.
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-medium text-slate-700">
              <span>Run Scenario</span>
              <ArrowRight className="w-4 h-4 text-slate-500" />
            </div>
          </div>

          {/* Scenario 2: Vendor Invoices */}
          <div 
            onClick={() => {
              onSelectScenario('vendor_invoices');
              onNavigateTab('studio');
            }}
            className="cursor-pointer bg-white border border-slate-200 rounded-xl p-5 hover:border-slate-400 hover:shadow-xs transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
                  <Receipt className="w-5 h-5" />
                </div>
                <span className="text-xs font-mono text-slate-400">5 Bills</span>
              </div>
              <h3 className="text-base font-semibold text-slate-900 mt-4">
                Vendor Invoices & AP Review
              </h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Checks supplier invoices for negative balances, duplicate invoice numbers, and $2,500 senior authorization limits before payment staging.
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-medium text-slate-700">
              <span>Run Scenario</span>
              <ArrowRight className="w-4 h-4 text-slate-500" />
            </div>
          </div>

          {/* Scenario 3: Support Inquiries */}
          <div 
            onClick={() => {
              onSelectScenario('support_tickets');
              onNavigateTab('studio');
            }}
            className="cursor-pointer bg-white border border-slate-200 rounded-xl p-5 hover:border-slate-400 hover:shadow-xs transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <Headphones className="w-5 h-5" />
                </div>
                <span className="text-xs font-mono text-slate-400">4 Tickets</span>
              </div>
              <h3 className="text-base font-semibold text-slate-900 mt-4">
                Support Ticket Triage
              </h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Validates customer IDs, detects urgent delivery escalations, drafts standard resolution emails, and prevents auto-dispatch.
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-medium text-slate-700">
              <span>Run Scenario</span>
              <ArrowRight className="w-4 h-4 text-slate-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Layout: Review Highlights & Audit Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Review Queue Spotlight */}
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-base font-semibold text-slate-900">
                Actionable Exception Queue
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Records flagged by validation engine requiring human judgment
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('review')}
              className="text-xs font-medium text-slate-700 hover:text-slate-900 flex items-center gap-1"
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
                  className="cursor-pointer p-3 rounded-lg border border-slate-100 hover:border-slate-300 hover:bg-slate-50/70 transition-all flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-800">
                      {rec.id}
                    </span>
                    <div>
                      <div className="text-xs font-medium text-slate-900">
                        {rec.fields.customer_name || rec.fields.vendorName || rec.id}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate max-w-xs">
                        {rec.issues.length > 0
                          ? rec.issues[0].message
                          : 'Valid record · Staged for CRM draft'}
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    {hasErr ? (
                      <span className="text-xs font-semibold text-rose-700">Flagged Issue</span>
                    ) : (
                      <span className="text-xs font-semibold text-emerald-700">Passes Quality</span>
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
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-base font-semibold text-slate-900">
                Immutable Ledger Highlights
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Tamper-evident log of agent plans, operator decisions, and gate interventions
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('audit')}
              className="text-xs font-medium text-slate-700 hover:text-slate-900 flex items-center gap-1"
            >
              <span>Full Ledger</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="mt-4 space-y-3 font-mono text-xs">
            {auditLogs.slice(0, 4).map((evt) => (
              <div key={evt.id} className="p-3 rounded-lg border border-slate-100 bg-slate-50/50">
                <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                  <span className="font-semibold text-slate-800">{evt.id}</span>
                  <span className="tabular-nums">{evt.timestamp}</span>
                </div>
                <div className="text-xs text-slate-800 font-sans">
                  {evt.details}
                </div>
                <div className="mt-1 text-[11px] text-slate-500 flex items-center gap-2">
                  <span>Actor: {evt.actor}</span>
                  <span>·</span>
                  <span className="truncate max-w-[180px]">{evt.hash}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

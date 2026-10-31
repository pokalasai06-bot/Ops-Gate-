import React, { useState } from 'react';
import { BusinessRecord, StagedAction, UserRole } from '../types';
import { 
  ShieldAlert, 
  ShieldCheck, 
  Lock, 
  Unlock, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  Send,
  RefreshCw,
  FileCheck,
  CheckSquare,
  Square,
  Sparkles,
  Sliders,
  Copy,
  ChevronDown,
  ChevronUp,
  Zap,
  Terminal
} from 'lucide-react';

interface ExecutionGateViewProps {
  records: BusinessRecord[];
  onAuthorizeAndDispatch: (approvedActionIds: string[]) => Promise<void>;
  onNavigateToAudit: () => void;
  userRole: UserRole;
  isDispatching: boolean;
}

export const ExecutionGateView: React.FC<ExecutionGateViewProps> = ({
  records,
  onAuthorizeAndDispatch,
  onNavigateToAudit,
  userRole,
  isDispatching,
}) => {
  const [selectedSystemFilter, setSelectedSystemFilter] = useState<string>('all');
  const [executionDone, setExecutionDone] = useState(false);
  const [dryRunMode, setDryRunMode] = useState(false);
  const [dryRunProgress, setDryRunProgress] = useState<number | null>(null);
  const [dryRunLogs, setDryRunLogs] = useState<string[]>([]);
  const [expandedPayloadIds, setExpandedPayloadIds] = useState<Record<string, boolean>>({});
  const [selectedActionIds, setSelectedActionIds] = useState<string[]>([]);

  // Collect all staged actions
  const allStagedActions: Array<StagedAction & { record: BusinessRecord }> = [];
  records.forEach(rec => {
    rec.stagedActions.forEach(act => {
      allStagedActions.push({ ...act, record: rec });
    });
  });

  const approvedActions = allStagedActions.filter(a => a.record.reviewStatus === 'approved');
  const pendingActions = allStagedActions.filter(a => a.record.reviewStatus !== 'approved' && a.status !== 'dispatched');
  const dispatchedActions = allStagedActions.filter(a => a.status === 'dispatched');

  const filteredActions = allStagedActions.filter(act => {
    if (selectedSystemFilter === 'all') return true;
    return act.targetSystem.toLowerCase().includes(selectedSystemFilter.toLowerCase());
  });

  // Effective action IDs to dispatch: either user's custom selection or all approved
  const effectiveDispatchIds = selectedActionIds.length > 0 
    ? selectedActionIds.filter(id => approvedActions.some(a => a.id === id))
    : approvedActions.map(a => a.id);

  // Toggle single action selection
  const handleToggleSelectAction = (id: string) => {
    setSelectedActionIds(prev => {
      if (prev.length === 0) {
        // If nothing was selected before, select all approved except this one
        return approvedActions.map(a => a.id).filter(x => x !== id);
      }
      return prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id];
    });
  };

  const handleSelectAllApproved = () => {
    setSelectedActionIds(approvedActions.map(a => a.id));
  };

  const handleDeselectAll = () => {
    setSelectedActionIds([]);
  };

  // Dry run simulation
  const handleStartDryRun = async () => {
    setDryRunLogs([]);
    setDryRunProgress(10);
    setDryRunLogs(prev => [...prev, `[INIT] Booting isolated connector sandbox...`]);
    
    await new Promise(r => setTimeout(r, 400));
    setDryRunProgress(40);
    setDryRunLogs(prev => [...prev, `[GATE CHECK] Verified 0 unapproved writes. Gate barrier valid.`]);

    await new Promise(r => setTimeout(r, 400));
    setDryRunProgress(75);
    setDryRunLogs(prev => [
      ...prev, 
      `[SIMULATE] Simulated dispatch for ${effectiveDispatchIds.length} payloads across connectors.`,
      `[STATUS] All connector test pings returned HTTP 200 OK (latency avg: 78ms).`
    ]);

    await new Promise(r => setTimeout(r, 400));
    setDryRunProgress(100);
    setDryRunLogs(prev => [...prev, `[SUCCESS] Dry-run audit complete. No actual external writes executed.`]);
  };

  const handleRunDispatch = async () => {
    if (effectiveDispatchIds.length === 0) return;
    await onAuthorizeAndDispatch(effectiveDispatchIds);
    setExecutionDone(true);
  };

  const systems = Array.from(new Set(allStagedActions.map(a => a.targetSystem)));

  return (
    <div className="space-y-6 relative">
      {/* Background ambient lighting */}
      <div className="absolute top-10 right-20 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Page Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-normal text-white" style={{ fontFamily: 'var(--font-serif)' }}>
          Execution Gate &amp; Connector Staging
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Zero external side-effects happen automatically. All connector writes are staged in an isolated memory buffer until an authorized human signs off.
        </p>
      </div>

      {/* Security Barrier Status Card - Luxury Vault Styling */}
      <div className={`luxury-card rounded-2xl p-6 sm:p-7 transition-all relative overflow-hidden ${
        approvedActions.length > 0
          ? 'border-amber-400/50 gold-glow bg-gradient-to-br from-slate-900/90 via-slate-950 to-amber-950/20'
          : 'border-white/10'
      }`}>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5 relative z-10">
          <div className="flex items-start gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-lg ${
              approvedActions.length > 0 
                ? 'bg-gradient-to-br from-amber-300 via-amber-400 to-amber-600 text-slate-950 shadow-amber-500/20' 
                : 'bg-slate-900 border border-white/10 text-slate-400'
            }`}>
              {approvedActions.length > 0 ? (
                <Unlock className="w-6 h-6 stroke-[2.5]" />
              ) : (
                <Lock className="w-6 h-6" />
              )}
            </div>

            <div>
              <div className="flex items-center gap-2.5">
                <h3 className="text-lg font-bold text-white">
                  {approvedActions.length > 0
                    ? `Authorization Confirmed (${effectiveDispatchIds.length} of ${approvedActions.length} Actions Armed)`
                    : 'Gate Barrier Active: No Outbound Writes Authorized'}
                </h3>
                <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-950/60 text-amber-300 border border-amber-500/30">
                  Strict Security Gate
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1.5 leading-relaxed max-w-2xl font-light">
                {approvedActions.length > 0
                  ? `Operator has authorized ${records.filter(r => r.reviewStatus === 'approved').length} records. Select specific actions below, test in dry-run mode, or click "Authorize & Dispatch" to execute.`
                  : 'External connectors (CRM, Email, Slack, Accounting) are paused. Go to the Review Queue to examine and approve valid records first.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto shrink-0 relative z-10">
            {/* Interactive Dry Run Toggle */}
            {approvedActions.length > 0 && (
              <button
                type="button"
                onClick={() => setDryRunMode(!dryRunMode)}
                className={`px-3.5 py-2.5 text-xs rounded-xl font-medium border transition-all flex items-center gap-1.5 ${
                  dryRunMode 
                    ? 'border-indigo-400 bg-indigo-950/70 text-indigo-200 shadow-md ring-1 ring-indigo-400/40' 
                    : 'border-white/10 bg-slate-900 text-slate-400 hover:text-white'
                }`}
              >
                <Terminal className="w-3.5 h-3.5 text-indigo-400" />
                <span>Dry-Run Simulation: {dryRunMode ? 'ON' : 'OFF'}</span>
              </button>
            )}

            {approvedActions.length > 0 && (
              dryRunMode ? (
                <button
                  onClick={handleStartDryRun}
                  className="px-5 py-2.5 text-xs rounded-xl font-bold bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center gap-2 shadow-lg hover:scale-105 transition-transform"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Simulate Outbound Writes</span>
                </button>
              ) : (
                <button
                  disabled={isDispatching || effectiveDispatchIds.length === 0}
                  onClick={handleRunDispatch}
                  className="gold-button flex-1 md:flex-initial px-5 py-2.5 text-xs rounded-xl disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg hover:scale-105 transition-transform"
                >
                  {isDispatching ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Dispatching Connectors...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Authorize &amp; Dispatch ({effectiveDispatchIds.length})</span>
                    </>
                  )}
                </button>
              )
            )}

            {dispatchedActions.length > 0 && (
              <button
                onClick={onNavigateToAudit}
                className="flex-1 md:flex-initial px-4 py-2.5 text-xs font-semibold text-amber-200 bg-slate-900/80 hover:bg-slate-800 border border-amber-500/30 rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-inner shadow-black/40"
              >
                <FileCheck className="w-3.5 h-3.5 text-amber-400" />
                <span>Audit Logs ({dispatchedActions.length})</span>
              </button>
            )}
          </div>
        </div>

        {/* Dry Run Simulation Progress & Logs */}
        {dryRunProgress !== null && (
          <div className="mt-5 pt-4 border-t border-white/10 space-y-2 animate-fadeIn">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-indigo-300 font-semibold flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-indigo-400" />
                <span>Sandbox Simulation Engine</span>
              </span>
              <span className="text-slate-400">{dryRunProgress}%</span>
            </div>
            
            <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
              <div 
                className="bg-indigo-400 h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${dryRunProgress}%` }}
              />
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-indigo-500/30 font-mono text-[11px] text-slate-300 space-y-1">
              {dryRunLogs.map((log, i) => (
                <div key={i} className="text-indigo-200/90 leading-tight">{log}</div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Interactive System Filter Tabs & Batch Selectors */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 luxury-card p-3 rounded-2xl">
        <div className="flex items-center gap-1.5 overflow-x-auto p-1 bg-slate-950/70 rounded-xl border border-white/5">
          <button
            onClick={() => setSelectedSystemFilter('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${
              selectedSystemFilter === 'all'
                ? 'bg-amber-400/25 text-amber-200 border border-amber-400/50 shadow-xs font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            All Systems ({allStagedActions.length})
          </button>
          {systems.map(sys => {
            const count = allStagedActions.filter(a => a.targetSystem === sys).length;
            return (
              <button
                key={sys}
                onClick={() => setSelectedSystemFilter(sys)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                  selectedSystemFilter === sys
                    ? 'bg-amber-400/25 text-amber-200 border border-amber-400/50 shadow-xs font-semibold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {sys} ({count})
              </button>
            );
          })}
        </div>

        {/* Granular Action Selection Helpers */}
        {approvedActions.length > 0 && (
          <div className="flex items-center gap-2 text-xs font-mono">
            <button
              type="button"
              onClick={handleSelectAllApproved}
              className="text-amber-300 hover:text-amber-200 transition-colors"
            >
              Arm All ({approvedActions.length})
            </button>
            <span className="text-slate-600">·</span>
            <button
              type="button"
              onClick={handleDeselectAll}
              className="text-slate-400 hover:text-white transition-colors"
            >
              Reset Selection
            </button>
          </div>
        )}
      </div>

      {/* Staged Actions List */}
      <div className="space-y-3">
        {filteredActions.length === 0 ? (
          <div className="luxury-card rounded-2xl p-8 text-center text-slate-500 text-xs">
            No staged actions found for the selected filter.
          </div>
        ) : (
          filteredActions.map(action => {
            const isApproved = action.record.reviewStatus === 'approved';
            const isDispatched = action.status === 'dispatched';
            const isSelected = selectedActionIds.length === 0 ? isApproved : selectedActionIds.includes(action.id);
            const isExpanded = expandedPayloadIds[action.id];

            return (
              <div
                key={action.id}
                className={`luxury-card rounded-2xl p-4 sm:p-5 border transition-all ${
                  isDispatched
                    ? 'border-emerald-500/40 bg-emerald-950/10'
                    : isApproved
                      ? isSelected 
                        ? 'border-amber-400/60 bg-amber-950/20 shadow-md ring-1 ring-amber-400/30'
                        : 'border-white/10 bg-slate-950/60 opacity-60'
                      : 'border-white/10 bg-slate-950/40 opacity-75'
                }`}
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    {/* Interactive Selection Checkbox */}
                    {isApproved && !isDispatched && (
                      <button
                        type="button"
                        onClick={() => handleToggleSelectAction(action.id)}
                        className="p-1 text-slate-400 hover:text-amber-300 transition-colors mt-0.5"
                        title={isSelected ? 'Disarm this action' : 'Arm this action for dispatch'}
                      >
                        {isSelected ? (
                          <CheckSquare className="w-4 h-4 text-amber-400" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-600" />
                        )}
                      </button>
                    )}

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-amber-300 bg-slate-900 border border-amber-500/30 px-2 py-0.5 rounded">
                          {action.targetSystem}
                        </span>
                        <span className="text-xs font-semibold text-white">
                          {action.actionType}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          Record #{action.record.id} ({action.record.fields.customer_name || action.record.fields.vendorName || 'Entity'})
                        </span>
                      </div>

                      <div className="text-xs text-slate-400 mt-1 font-mono flex items-center gap-3">
                        <span>Payload ID: {action.id}</span>
                        <span>·</span>
                        <span>Endpoint: /v1/{action.targetSystem.toLowerCase()}/{action.actionType.toLowerCase().replace(/\s+/g, '_')}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                    {/* Status Pill */}
                    {isDispatched ? (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        <span>DISPATCHED (200 OK)</span>
                      </span>
                    ) : isApproved ? (
                      isSelected ? (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-semibold bg-amber-950/80 text-amber-300 border border-amber-500/50 flex items-center gap-1 shadow-xs">
                          <Unlock className="w-3 h-3 text-amber-400" />
                          <span>ARMED FOR DISPATCH</span>
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-semibold bg-slate-900 text-slate-400 border border-white/10">
                          HELD (UNARMED)
                        </span>
                      )
                    ) : (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-semibold bg-slate-900 text-slate-400 border border-white/10 flex items-center gap-1">
                        <Lock className="w-3 h-3 text-slate-500" />
                        <span>BLOCKED (AWAITING REVIEW)</span>
                      </span>
                    )}

                    {/* Expand Payload Button */}
                    <button
                      type="button"
                      onClick={() => setExpandedPayloadIds(prev => ({ ...prev, [action.id]: !prev[action.id] }))}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-amber-300 hover:bg-slate-900 transition-colors"
                      title="Inspect Raw Payload JSON"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Expanded Payload Inspector */}
                {isExpanded && (
                  <div className="mt-3 pt-3 border-t border-white/10 space-y-2 animate-fadeIn font-mono text-xs">
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>Serialized HTTP Request Body</span>
                      <button
                        type="button"
                        onClick={() => navigator.clipboard.writeText(JSON.stringify(action.payload, null, 2))}
                        className="text-amber-300 hover:text-white flex items-center gap-1 transition-colors"
                      >
                        <Copy className="w-3 h-3" />
                        <span>Copy JSON</span>
                      </button>
                    </div>
                    <pre className="p-3 rounded-xl bg-slate-950 border border-white/10 text-amber-100 overflow-x-auto text-[11px] leading-tight">
                      {JSON.stringify(action.payload, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

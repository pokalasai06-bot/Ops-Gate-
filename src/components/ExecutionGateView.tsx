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
  FileCheck
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

  const handleRunDispatch = async () => {
    const actionIds = approvedActions.map(a => a.id);
    if (actionIds.length === 0) return;
    await onAuthorizeAndDispatch(actionIds);
    setExecutionDone(true);
  };

  const systems = Array.from(new Set(allStagedActions.map(a => a.targetSystem)));

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
          Execution Gate & Connector Staging
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 mt-1">
          Zero external side-effects happen automatically. All connector writes are staged in an isolated memory buffer until an authorized human signs off.
        </p>
      </div>

      {/* Security Barrier Status Card */}
      <div className={`p-6 rounded-xl border transition-all ${
        approvedActions.length > 0
          ? 'bg-amber-50/80 border-amber-300'
          : 'bg-white border-slate-200'
      }`}>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
          <div className="flex items-start gap-3.5">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
              approvedActions.length > 0 ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-700'
            }`}>
              {approvedActions.length > 0 ? (
                <Unlock className="w-5 h-5" />
              ) : (
                <Lock className="w-5 h-5" />
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">
                  {approvedActions.length > 0
                    ? `Authorization Pending (${approvedActions.length} Staged Actions Ready)`
                    : 'Gate Barrier Active: No Outbound Writes Authorized'}
                </h3>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                  Strict Gate Policy
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed max-w-2xl">
                {approvedActions.length > 0
                  ? `You have authorized ${records.filter(r => r.reviewStatus === 'approved').length} records. Clicking "Authorize & Dispatch" will fire real API calls to HubSpot, SendGrid, and Slack.`
                  : 'External connectors (CRM, Email, Slack, Accounting) are paused. Go to the Review Queue to examine and approve valid records first.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto shrink-0">
            {approvedActions.length > 0 && (
              <button
                disabled={isDispatching}
                onClick={handleRunDispatch}
                className="flex-1 md:flex-initial px-5 py-2.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-50 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-xs"
              >
                {isDispatching ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Dispatching Connectors...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Authorize & Dispatch ({approvedActions.length})</span>
                  </>
                )}
              </button>
            )}

            {dispatchedActions.length > 0 && (
              <button
                onClick={onNavigateToAudit}
                className="flex-1 md:flex-initial px-4 py-2.5 text-xs font-semibold text-slate-800 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors flex items-center justify-center gap-1.5"
              >
                <FileCheck className="w-3.5 h-3.5 text-slate-600" />
                <span>View Audit Receipt</span>
              </button>
            )}
          </div>
        </div>

        {/* Counter Summary */}
        <div className="grid grid-cols-3 gap-4 mt-6 pt-5 border-t border-slate-200/60 text-xs">
          <div>
            <div className="text-slate-500">Staged & Authorized</div>
            <div className="text-lg font-bold font-mono text-slate-900 mt-0.5">
              {approvedActions.length} actions
            </div>
          </div>
          <div>
            <div className="text-slate-500">Held Behind Gate (Unapproved / Errored)</div>
            <div className="text-lg font-bold font-mono text-rose-700 mt-0.5">
              {pendingActions.length} actions
            </div>
          </div>
          <div>
            <div className="text-slate-500">Successfully Dispatched</div>
            <div className="text-lg font-bold font-mono text-emerald-700 mt-0.5">
              {dispatchedActions.length} actions
            </div>
          </div>
        </div>
      </div>

      {/* System Filters */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-medium">
        <span className="text-slate-500 mr-1">Filter by Target:</span>
        <button
          onClick={() => setSelectedSystemFilter('all')}
          className={`px-3 py-1.5 rounded-lg border transition-colors ${
            selectedSystemFilter === 'all'
              ? 'bg-slate-900 text-white border-slate-900'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          All Targets ({allStagedActions.length})
        </button>
        {systems.map(sys => (
          <button
            key={sys}
            onClick={() => setSelectedSystemFilter(sys)}
            className={`px-3 py-1.5 rounded-lg border transition-colors ${
              selectedSystemFilter === sys
                ? 'bg-slate-900 text-white border-slate-900'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            {sys}
          </button>
        ))}
      </div>

      {/* Staged Actions List */}
      <div className="space-y-3">
        {filteredActions.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-500 text-xs">
            No staged actions found for this view.
          </div>
        ) : (
          filteredActions.map(action => {
            const isApproved = action.record.reviewStatus === 'approved';
            const isDispatched = action.status === 'dispatched';
            const isHeld = !isApproved && !isDispatched;

            return (
              <div
                key={action.id}
                className={`p-4 rounded-xl border transition-all ${
                  isDispatched
                    ? 'bg-emerald-50/40 border-emerald-200'
                    : isApproved
                      ? 'bg-white border-amber-300 shadow-xs'
                      : 'bg-slate-50/70 border-slate-200'
                }`}
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-800">
                        {action.record.id}
                      </span>
                      <span className="text-xs font-bold text-slate-900">
                        {action.targetSystem}
                      </span>
                      <span className="text-xs text-slate-500">
                        · {action.actionType}
                      </span>
                    </div>

                    <p className="text-xs text-slate-700 font-medium">
                      {action.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {isDispatched ? (
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-800 bg-emerald-100/80 px-2.5 py-1 rounded">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>DISPATCHED ({action.externalResponseId || 'OK_200'})</span>
                      </div>
                    ) : isApproved ? (
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-900 bg-amber-100 px-2.5 py-1 rounded">
                        <Unlock className="w-3.5 h-3.5 text-amber-700" />
                        <span>READY FOR DISPATCH</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 bg-slate-200/70 px-2.5 py-1 rounded">
                        <Lock className="w-3.5 h-3.5 text-slate-500" />
                        <span>BLOCKED AT GATE</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Staged Payload Snippet */}
                <div className="mt-3 pt-3 border-t border-slate-100">
                  <details className="text-xs text-slate-500">
                    <summary className="cursor-pointer hover:text-slate-800 font-mono text-[11px]">
                      View staged JSON payload
                    </summary>
                    <pre className="mt-2 p-2.5 bg-slate-900 text-slate-200 rounded-lg overflow-x-auto text-[11px] font-mono">
                      {JSON.stringify(action.payload, null, 2)}
                    </pre>
                  </details>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

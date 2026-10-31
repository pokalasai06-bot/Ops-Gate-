import React from 'react';
import { TaskStep } from '../types';
import { ShieldCheck, ShieldAlert, CheckCircle2, Clock, ArrowRight, Lock } from 'lucide-react';

interface TaskPlanCardProps {
  steps: TaskStep[];
  onReviewGateClick?: () => void;
}

export const TaskPlanCard: React.FC<TaskPlanCardProps> = ({ steps, onReviewGateClick }) => {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div>
          <h3 className="text-base font-semibold text-slate-900">
            Explainable Execution Plan
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Deterministic step DAG generated from business instruction. External actions held at step 6.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
          <span>{steps.length} Steps</span>
          <span>·</span>
          <span className="text-amber-700 font-medium">1 Approval Gate</span>
        </div>
      </div>

      <div className="mt-5 space-y-3">
        {steps.map((step, idx) => {
          const isGate = step.type === 'human_gate';
          const isExternal = step.externalImpact === 'external_write_gated';
          const isCompleted = step.status === 'completed';
          const isBlocked = step.status === 'blocked_at_gate';
          const isExecuted = step.status === 'executed';

          return (
            <div
              key={step.id}
              className={`p-3.5 rounded-lg border transition-all ${
                isGate
                  ? 'bg-amber-50/60 border-amber-200/90'
                  : isBlocked
                    ? 'bg-slate-50 border-slate-200'
                    : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded flex items-center justify-center font-mono text-xs font-semibold shrink-0 mt-0.5 bg-slate-100 text-slate-700">
                    {idx + 1}
                  </div>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-slate-900">
                        {step.name}
                      </span>
                      <span className="text-xs text-slate-500">
                        via {step.targetSystem}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      {step.rationale}
                    </p>

                    {step.outputSummary && (
                      <div className="mt-2 text-xs font-mono text-slate-500 bg-slate-50 px-2 py-1 rounded inline-block">
                        Output: {step.outputSummary}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1.5 shrink-0">
                  {isGate ? (
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-800 bg-amber-100/80 px-2.5 py-1 rounded">
                      <Lock className="w-3.5 h-3.5" />
                      <span>GATE: HELD</span>
                    </div>
                  ) : isExternal && isBlocked ? (
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 bg-slate-100 px-2.5 py-1 rounded">
                      <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                      <span>PENDING SIGN-OFF</span>
                    </div>
                  ) : isExecuted ? (
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-800 bg-emerald-100/80 px-2.5 py-1 rounded">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>DISPATCHED</span>
                    </div>
                  ) : isCompleted ? (
                    <div className="flex items-center gap-1 text-xs text-emerald-700 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Verified</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-xs text-slate-400">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Queued</span>
                    </div>
                  )}

                  <span className="text-xs text-slate-400 font-mono">
                    {step.externalImpact === 'external_write_gated'
                      ? 'External Write'
                      : step.externalImpact === 'staging_safe'
                        ? 'Isolated Staging'
                        : 'Read Only'}
                  </span>
                </div>
              </div>

              {isGate && onReviewGateClick && (
                <div className="mt-3 pt-3 border-t border-amber-200/60 flex items-center justify-between">
                  <span className="text-xs text-amber-800 font-medium">
                    External connectors will not dispatch until you review exceptions and authorize execution.
                  </span>
                  <button
                    onClick={onReviewGateClick}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-amber-900 bg-amber-200/80 hover:bg-amber-300 px-3 py-1.5 rounded transition-colors"
                  >
                    <span>Proceed to Review</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

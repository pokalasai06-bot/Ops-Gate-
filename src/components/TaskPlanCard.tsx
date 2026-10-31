import React, { useState } from 'react';
import { TaskStep, BusinessRecord } from '../types';
import { 
  ShieldCheck, 
  ShieldAlert, 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  Lock, 
  ChevronDown, 
  ChevronUp, 
  AlertTriangle,
  FileCode,
  Layers,
  Database,
  ArrowDownRight,
  Eye,
  Info
} from 'lucide-react';

interface TaskPlanCardProps {
  steps: TaskStep[];
  records?: BusinessRecord[];
  datasetName?: string;
  onReviewGateClick?: () => void;
  onOpenRecordEditor?: (record: BusinessRecord) => void;
}

export const TaskPlanCard: React.FC<TaskPlanCardProps> = ({ 
  steps, 
  records = [], 
  datasetName = 'Source Ingestion Stream', 
  onReviewGateClick,
  onOpenRecordEditor
}) => {
  // Track which step is currently expanded (default to first step or null)
  const [expandedStepId, setExpandedStepId] = useState<string | null>(steps[0]?.id || null);

  const toggleStep = (stepId: string) => {
    setExpandedStepId(prev => prev === stepId ? null : stepId);
  };

  const handleExpandAll = () => {
    if (expandedStepId === 'ALL') {
      setExpandedStepId(null);
    } else {
      setExpandedStepId('ALL');
    }
  };

  // Extract exceptions and issues from records for step context
  const exceptionRecords = records.filter(r => r.validationStatus === 'exception');
  const validRecords = records.filter(r => r.validationStatus === 'valid' || r.validationStatus === 'corrected');
  const stagedActionsCount = records.reduce((acc, r) => acc + r.stagedActions.length, 0);

  // Helper to generate step-specific input/output/validation context
  const getStepContext = (step: TaskStep, idx: number) => {
    switch (step.type) {
      case 'ingest':
        return {
          inputData: {
            source: datasetName,
            recordsCount: `${records.length} business rows`,
            format: 'Structured Tabular / JSON Schema',
            encoding: 'UTF-8 Verified',
          },
          outputData: {
            destination: 'Isolated Memory Staging Sandbox',
            recordsLoaded: `${records.length} records in buffer`,
            status: 'Raw records staged, zero external calls made',
          },
          validationDetails: [
            { label: 'Schema Validation', status: 'Passed', detail: 'All expected columns present' },
            { label: 'UTF-8 Encoding', status: 'Passed', detail: 'Zero corrupt characters detected' },
            { label: 'Memory Sandboxing', status: 'Enforced', detail: 'Isolated buffer initialized' },
          ],
          issues: [],
        };

      case 'validate':
        return {
          inputData: {
            source: 'Sandboxed raw records from Step 1',
            candidateRecords: `${records.length} records evaluated`,
            rulesApplied: 'Mandatory fields, RFC 5322 email syntax, numerical range rules',
          },
          outputData: {
            destination: 'Validation Results Matrix',
            cleanRecords: `${validRecords.length} records passed quality checks`,
            exceptionRecords: `${exceptionRecords.length} records flagged for triage`,
          },
          validationDetails: [
            { label: 'RFC 5322 Email Syntax', status: 'Evaluated', detail: 'Checked syntax across customer addresses' },
            { label: 'Required Field Check', status: 'Evaluated', detail: 'Identified missing mandatory properties' },
            { label: 'Business Policy Limits', status: 'Evaluated', detail: 'Audited values against threshold policies' },
          ],
          issues: exceptionRecords.flatMap(r => r.issues.map(i => ({ recordId: r.id, ...i }))),
        };

      case 'dedup':
        const duplicateIssues = exceptionRecords.flatMap(r => 
          r.issues.filter(i => i.ruleName.toLowerCase().includes('duplicate') || i.message.toLowerCase().includes('duplicate'))
            .map(i => ({ recordId: r.id, ...i }))
        );
        return {
          inputData: {
            source: 'Post-validation record stream from Step 2',
            primaryKeys: 'Email address, phone number, vendor invoice number',
            windowSize: 'Full batch scope',
          },
          outputData: {
            destination: 'Deduplication Index Registry',
            uniqueIdentities: `${records.length - duplicateIssues.length} unique identities verified`,
            collisionCount: `${duplicateIssues.length} collisions intercepted`,
          },
          validationDetails: [
            { label: 'Cross-Row Collision Check', status: duplicateIssues.length > 0 ? 'Collisions Detected' : 'Clean', detail: 'Scanned identical primary contact points' },
            { label: 'Identity Protection', status: 'Enforced', detail: 'Prevented duplicate entity creation in CRM' },
          ],
          issues: duplicateIssues,
        };

      case 'route_exception':
        return {
          inputData: {
            source: 'Flagged records from Steps 2 & 3',
            totalExceptions: `${exceptionRecords.length} records flagged`,
            triagePriority: exceptionRecords.some(r => r.issues.some(i => i.severity === 'critical')) ? 'Critical Attention Required' : 'Standard Queue',
          },
          outputData: {
            destination: 'OpsGate Human Review Queue',
            cleanStream: `${validRecords.length} records cleared for staging`,
            blockedStream: `${exceptionRecords.length} records quarantined for human operator`,
          },
          validationDetails: [
            { label: 'Quarantine Isolation', status: 'Active', detail: 'Contaminated rows cannot reach execution stage' },
            { label: 'Triage Routing', status: 'Assigned', detail: 'Forwarded to Operator desk with suggested inline fixes' },
          ],
          issues: exceptionRecords.map(r => ({
            recordId: r.id,
            ruleName: 'Quarantine Exception',
            field: r.issues[0]?.field || 'Record',
            severity: r.issues[0]?.severity || 'high',
            message: r.issues.map(i => i.message).join('; ') || 'Record flagged by validation engine',
            suggestedFix: r.issues[0]?.suggestedFix || 'Review and correct fields in Review Queue',
          })),
        };

      case 'stage_draft':
        return {
          inputData: {
            source: 'Validated clean records from Step 4',
            eligibleRecords: `${validRecords.length} clean records`,
            connectors: 'HubSpot CRM, SendGrid Email, Slack #sales-ops, QuickBooks',
          },
          outputData: {
            destination: 'Staged Payloads Buffer (Isolated Sandbox)',
            stagedPayloadsCount: `${stagedActionsCount} actions assembled in memory`,
            externalWriteStatus: 'ZERO external API requests transmitted (HELD)',
          },
          validationDetails: [
            { label: 'Payload Schema Assembly', status: 'Passed', detail: 'Generated valid CRM & email payloads' },
            { label: 'Write Barrier Verification', status: 'ARMED', detail: 'All outbound HTTP dispatch sockets locked' },
          ],
          issues: [],
        };

      case 'human_gate':
        return {
          inputData: {
            source: 'Staged actions ready in memory buffer from Step 5',
            pendingActions: `${stagedActionsCount} actions held behind barrier`,
            supervisoryPolicy: 'HOLD_ALL_WRITES_UNTIL_MANUAL_APPROVAL',
          },
          outputData: {
            destination: 'OpsGate Security Execution Gate',
            gateStatus: 'BARRIER ARMED - REQUIRES OPERATOR SIGN-OFF',
            dispatchAllowance: '0 actions permitted without explicit authorization',
          },
          validationDetails: [
            { label: 'Dual-Control Verification', status: 'Active', detail: 'Transactions > $2,500 require executive clearance' },
            { label: 'Zero-Leakage Invariant', status: 'VERIFIED', detail: 'Zero unauthorized records can bypass this barrier' },
            { label: 'Cryptographic Pre-Hash', status: 'Ready', detail: 'Ledger block prepared for approval signature' },
          ],
          issues: exceptionRecords.length > 0 ? [{
            recordId: 'GATE_HOLD',
            ruleName: 'Human Review Gate Invariant',
            field: 'Gate Security',
            severity: 'critical' as const,
            message: `${exceptionRecords.length} exceptions must be reviewed or overridden before complete batch dispatch.`,
            suggestedFix: 'Open Review Queue to inspect records and authorize clean items.',
          }] : [],
        };

      case 'external_dispatch':
        return {
          inputData: {
            source: 'Authorized records released by human operator at Step 6',
            targetNetworks: step.targetSystem,
            approvalGateCleared: step.status === 'executed' ? 'YES (Authorized)' : 'NO (Held at Gate)',
          },
          outputData: {
            destination: 'External 3P APIs (HubSpot, SendGrid, Slack, QuickBooks)',
            dispatchStatus: step.status === 'executed' ? 'Dispatched with 200 OK responses' : 'LOCKED - Awaiting Gate Clearance',
            externalResponseIds: step.status === 'executed' ? 'Verified external record IDs generated' : 'None generated yet',
          },
          validationDetails: [
            { label: 'Write-Barrier Invariant', status: step.status === 'executed' ? 'Released with Proof' : 'ENFORCED (LOCKED)', detail: 'External dispatches strictly gated' },
            { label: 'API Idempotency Key', status: 'Active', detail: 'Prevents double-submission on network retries' },
          ],
          issues: [],
        };

      case 'audit_log':
        return {
          inputData: {
            source: 'Full execution lifecycle, operator authorizations, and timestamps',
            signingAlgorithm: 'SHA-256 Chained Hash',
            immutableStore: 'Cryptographic Audit Ledger',
          },
          outputData: {
            destination: 'OpsGate Immutable Audit Ledger',
            ledgerBlock: 'Appended tamper-evident block',
            verification: 'Cryptographic proof sealed with previous event hash',
          },
          validationDetails: [
            { label: 'Hash Chain Integrity', status: 'Valid', detail: 'Previous event hash verified' },
            { label: 'Immutability Guarantee', status: 'Enforced', detail: 'Append-only ledger prevents record modification' },
          ],
          issues: [],
        };

      default:
        return {
          inputData: { source: step.targetSystem },
          outputData: { destination: step.targetSystem },
          validationDetails: [],
          issues: [],
        };
    }
  };

  return (
    <div className="luxury-card rounded-2xl p-6">
      {/* Card Header with Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-white tracking-wide" style={{ fontFamily: 'var(--font-display)' }}>
              Explainable Execution Plan
            </h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-amber-500/10 text-amber-300 border border-amber-500/30">
              Interactive DAG
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Click any step to inspect input records, generated outputs, deterministic rule findings, and security invariants.
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono shrink-0">
          <button
            onClick={handleExpandAll}
            className="px-2.5 py-1 rounded-lg bg-slate-900 border border-amber-500/20 text-amber-200 hover:border-amber-400 transition-all flex items-center gap-1.5"
          >
            <Eye className="w-3.5 h-3.5 text-amber-400" />
            <span>{expandedStepId === 'ALL' ? 'Collapse All' : 'Expand All'}</span>
          </button>
          <div className="flex items-center gap-2 text-slate-400 hidden sm:flex">
            <span className="text-slate-300">{steps.length} Steps</span>
            <span className="text-amber-500/40">·</span>
            <span className="text-amber-300 font-medium">1 Approval Gate</span>
          </div>
        </div>
      </div>

      {/* Steps List */}
      <div className="mt-5 space-y-3.5">
        {steps.map((step, idx) => {
          const isGate = step.type === 'human_gate';
          const isExternal = step.externalImpact === 'external_write_gated';
          const isCompleted = step.status === 'completed';
          const isBlocked = step.status === 'blocked_at_gate';
          const isExecuted = step.status === 'executed';
          const isExpanded = expandedStepId === step.id || expandedStepId === 'ALL';
          
          const context = getStepContext(step, idx);
          const hasIssues = context.issues && context.issues.length > 0;

          return (
            <div
              key={step.id}
              className={`rounded-xl border transition-all duration-200 overflow-hidden ${
                isGate
                  ? 'bg-amber-950/25 border-amber-500/40 shadow-md shadow-amber-500/5'
                  : isBlocked
                  ? 'bg-slate-950/60 border-amber-500/25'
                  : isExpanded
                  ? 'bg-slate-950/80 border-amber-400/50 shadow-md'
                  : 'bg-slate-950/40 border-white/5 hover:border-amber-500/30 hover:bg-slate-900/50'
              }`}
            >
              {/* Clickable Step Header */}
              <button
                type="button"
                onClick={() => toggleStep(step.id)}
                aria-expanded={isExpanded}
                className="w-full text-left p-4 flex items-start justify-between gap-4 cursor-pointer focus:outline-none focus:ring-1 focus:ring-amber-400/50 rounded-xl"
              >
                <div className="flex items-start gap-3.5 flex-1 min-w-0">
                  {/* Step Order Badge */}
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-mono text-xs font-semibold shrink-0 mt-0.5 shadow-md transition-transform ${
                    isGate 
                      ? 'bg-amber-400 text-slate-950 font-bold' 
                      : isCompleted
                      ? 'bg-slate-900 border border-emerald-500/30 text-emerald-300'
                      : 'bg-slate-900 border border-amber-500/20 text-amber-300'
                  }`}>
                    {idx + 1}
                  </div>

                  {/* Step Title & Summary */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-white tracking-wide hover:text-amber-300 transition-colors">
                        {step.name}
                      </span>
                      <span className="text-xs text-amber-200/60 font-mono">
                        via {step.targetSystem}
                      </span>
                      {hasIssues && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-rose-950/60 text-rose-300 border border-rose-500/30 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3 text-rose-400" />
                          <span>{context.issues.length} {context.issues.length === 1 ? 'flag' : 'flags'}</span>
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-300 mt-1 leading-relaxed font-light line-clamp-1">
                      {step.rationale}
                    </p>

                    {step.outputSummary && (
                      <div className="mt-2 text-[11px] font-mono text-amber-200/80 bg-slate-900/90 border border-amber-500/15 px-2.5 py-0.5 rounded-md inline-block">
                        Output: {step.outputSummary}
                      </div>
                    )}
                  </div>
                </div>

                {/* Status Badges & Expansion Indicator */}
                <div className="flex items-center gap-3 shrink-0">
                  <div className="flex flex-col items-end gap-1.5">
                    {/* Primary Status Pill */}
                    {isGate ? (
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-300 bg-amber-950/60 border border-amber-400/40 px-2.5 py-1 rounded-full shadow-xs">
                        <Lock className="w-3.5 h-3.5 text-amber-400" />
                        <span className="text-[11px] tracking-wider uppercase font-mono">GATE: HELD</span>
                      </div>
                    ) : isExternal && isBlocked ? (
                      <div className="flex items-center gap-1.5 text-xs text-amber-200/80 bg-slate-900 border border-amber-500/30 px-2.5 py-1 rounded-full">
                        <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                        <span className="text-[11px] tracking-wider uppercase font-mono">PENDING SIGN-OFF</span>
                      </div>
                    ) : isExecuted ? (
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-300 bg-emerald-950/50 border border-emerald-500/30 px-2.5 py-1 rounded-full">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-[11px] tracking-wider uppercase font-mono">DISPATCHED</span>
                      </div>
                    ) : isCompleted ? (
                      <div className="flex items-center gap-1 text-xs text-emerald-400 font-medium bg-emerald-950/30 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Verified</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-xs text-slate-500 bg-slate-900/60 px-2.5 py-0.5 rounded-full">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Queued</span>
                      </div>
                    )}

                    {/* Security Pill */}
                    <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">
                      {step.externalImpact === 'external_write_gated'
                        ? 'External Write Gated'
                        : step.externalImpact === 'staging_safe'
                        ? 'Isolated Staging'
                        : 'Read Only'}
                    </span>
                  </div>

                  {/* Expand Chevron Icon */}
                  <div className="p-1 rounded-lg bg-slate-900 border border-white/5 text-amber-300 group-hover:border-amber-400 transition-colors">
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-amber-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                </div>
              </button>

              {/* Expandable Step Details Drawer */}
              {isExpanded && (
                <div className="px-5 pb-5 pt-2 border-t border-amber-500/15 bg-slate-950/70 space-y-4 animate-fadeIn">
                  
                  {/* Step Metadata Sub-Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-3 text-xs bg-slate-900/80 p-3 rounded-lg border border-white/5">
                    <div className="flex items-center gap-3 text-slate-300 font-mono text-[11px]">
                      <span>Step ID: <strong className="text-amber-300">{step.id}</strong></span>
                      <span>•</span>
                      <span>Type: <strong className="text-amber-200">{step.type}</strong></span>
                      {step.executionTimeMs !== undefined && (
                        <>
                          <span>•</span>
                          <span>Execution Duration: <strong className="text-emerald-400">{step.executionTimeMs}ms</strong></span>
                        </>
                      )}
                      {step.dependsOn && step.dependsOn.length > 0 && (
                        <>
                          <span>•</span>
                          <span>Prerequisite: <strong className="text-slate-400">{step.dependsOn.join(', ')}</strong></span>
                        </>
                      )}
                    </div>

                    {/* Immutable Protected Notice */}
                    <div className="flex items-center gap-1.5 text-[11px] font-mono text-amber-300/80 bg-amber-950/40 px-2.5 py-0.5 rounded border border-amber-500/20">
                      <Lock className="w-3 h-3 text-amber-400" />
                      <span>Protected Step: Immutable Inspection Mode</span>
                    </div>
                  </div>

                  {/* Full Description & Rationale */}
                  <div className="space-y-1">
                    <span className="text-[11px] font-mono uppercase text-amber-300 font-semibold tracking-wider flex items-center gap-1.5">
                      <Info className="w-3.5 h-3.5 text-amber-400" />
                      <span>Step Description &amp; Behavioral Rationale</span>
                    </span>
                    <p className="text-xs text-slate-200 leading-relaxed bg-slate-900/50 p-3 rounded-lg border border-slate-800">
                      {step.rationale}
                    </p>
                  </div>

                  {/* 2-Column Grid: Input Data vs Output Staging */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Input Data Box */}
                    <div className="p-3.5 rounded-xl bg-slate-900/60 border border-white/5 space-y-2">
                      <div className="text-[11px] font-mono font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                        <Database className="w-3.5 h-3.5 text-blue-400" />
                        <span>Input Data &amp; Source State</span>
                      </div>
                      <div className="space-y-1.5 text-xs text-slate-300">
                        {Object.entries(context.inputData).map(([key, val]) => (
                          <div key={key} className="flex items-start justify-between gap-2 border-b border-white/5 pb-1 last:border-0 last:pb-0">
                            <span className="text-slate-400 capitalize">{key.replace(/([A-Z])/g, ' $1')}:</span>
                            <span className="font-mono text-white text-right font-medium">{String(val)}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Output Staging Box */}
                    <div className="p-3.5 rounded-xl bg-slate-900/60 border border-white/5 space-y-2">
                      <div className="text-[11px] font-mono font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                        <ArrowDownRight className="w-3.5 h-3.5 text-amber-400" />
                        <span>Output &amp; Staging Artifacts</span>
                      </div>
                      <div className="space-y-1.5 text-xs text-slate-300">
                        {Object.entries(context.outputData).map(([key, val]) => (
                          <div key={key} className="flex items-start justify-between gap-2 border-b border-white/5 pb-1 last:border-0 last:pb-0">
                            <span className="text-slate-400 capitalize">{key.replace(/([A-Z])/g, ' $1')}:</span>
                            <span className="font-mono text-amber-200 text-right font-medium">{String(val)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Validation Results Matrix */}
                  {context.validationDetails.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-[11px] font-mono uppercase text-emerald-400 font-semibold tracking-wider flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Validation Checks &amp; Invariants Evaluated</span>
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                        {context.validationDetails.map((vd, i) => (
                          <div key={i} className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 text-xs">
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="font-semibold text-white">{vd.label}</span>
                              <span className="font-mono text-emerald-400 font-semibold">{vd.status}</span>
                            </div>
                            <div className="text-[11px] text-slate-400 mt-1 font-light">{vd.detail}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Issues & Flagged Details (if any records encountered errors at this step) */}
                  {hasIssues && (
                    <div className="space-y-2">
                      <span className="text-[11px] font-mono uppercase text-rose-400 font-semibold tracking-wider flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                        <span>Flagged Anomalies Requiring Human Triage ({context.issues.length})</span>
                      </span>
                      <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                        {context.issues.map((iss, i) => {
                          const matchingRec = records.find(r => r.id === iss.recordId);
                          return (
                            <div key={i} className="p-3 rounded-lg bg-rose-950/20 border border-rose-500/30 text-xs space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="font-mono font-bold text-rose-300">
                                  Record: {iss.recordId} ({iss.field})
                                </span>
                                <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase font-semibold bg-rose-900/50 text-rose-200 border border-rose-500/30">
                                  {iss.severity}
                                </span>
                              </div>
                              <p className="text-slate-200 text-xs font-light">
                                {iss.message}
                              </p>
                              {iss.suggestedFix && (
                                <div className="text-[11px] text-amber-300/90 font-mono">
                                  Suggested Fix: {iss.suggestedFix}
                                </div>
                              )}
                              {matchingRec && onOpenRecordEditor && (
                                <div className="pt-1 flex items-center justify-end">
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onOpenRecordEditor(matchingRec);
                                    }}
                                    className="gold-button text-[11px] font-semibold px-2.5 py-1 rounded-md flex items-center gap-1 shadow-sm"
                                  >
                                    <span>Review &amp; Correct {matchingRec.id}</span>
                                    <ArrowRight className="w-3 h-3" />
                                  </button>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Human Review Gate Specific Actions (Step 6 or Step 7) */}
                  {isGate && onReviewGateClick && (
                    <div className="mt-3.5 pt-3.5 border-t border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-amber-950/30 p-3.5 rounded-xl border border-amber-500/20">
                      <div className="space-y-0.5">
                        <span className="text-xs text-amber-200 font-semibold flex items-center gap-1.5">
                          <Lock className="w-3.5 h-3.5 text-amber-400" />
                          <span>Human Authorization Gate Enforced</span>
                        </span>
                        <p className="text-[11px] text-slate-300 font-light">
                          External connectors (HubSpot, SendGrid, Slack, QuickBooks) remain completely blocked until human approval.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={onReviewGateClick}
                        className="gold-button inline-flex items-center justify-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-lg shadow-md shrink-0"
                      >
                        <span>Open Human Review Queue</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

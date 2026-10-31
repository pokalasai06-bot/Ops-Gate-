import React, { useState } from 'react';
import { BusinessRecord, RecordIssue } from '../types';
import { X, Check, AlertCircle, AlertTriangle, ArrowRight, ShieldCheck, RefreshCw } from 'lucide-react';

interface InlineRecordEditorModalProps {
  record: BusinessRecord | null;
  onClose: () => void;
  onSaveRecord: (recordId: string, updatedFields: Record<string, any>, reviewerNotes?: string) => void;
  onApproveRecord: (recordId: string, notes?: string) => void;
  onRejectRecord: (recordId: string, reason: string) => void;
  onEscalateRecord: (recordId: string, reason: string) => void;
}

export const InlineRecordEditorModal: React.FC<InlineRecordEditorModalProps> = ({
  record,
  onClose,
  onSaveRecord,
  onApproveRecord,
  onRejectRecord,
  onEscalateRecord,
}) => {
  if (!record) return null;

  const [formData, setFormData] = useState<Record<string, any>>({ ...record.fields });
  const [notes, setNotes] = useState(record.reviewerNotes || '');
  const [showStagedPayloads, setShowStagedPayloads] = useState(false);

  const handleFieldChange = (key: string, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleApplySuggestedFix = (issue: RecordIssue) => {
    if (issue.field === 'email' && formData.email?.includes('-at-')) {
      const fixed = formData.email.replace('-at-', '@') + '.com';
      handleFieldChange('email', fixed);
    } else if (issue.field === 'email' && !formData.email) {
      handleFieldChange('email', 'contact@' + (formData.company || 'business').toLowerCase().replace(/\s+/g, '') + '.com');
    } else if (issue.field === 'amount' && typeof formData.amount === 'number' && formData.amount < 0) {
      handleFieldChange('amount', Math.abs(formData.amount));
    }
  };

  const hasIssues = record.issues.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div 
        className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs bg-slate-100 text-slate-800 px-2 py-0.5 rounded font-semibold">
                {record.id}
              </span>
              <h3 className="text-base font-semibold text-slate-900">
                Record Review & Resolution
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Source: {record.sourceName} · Current Confidence: {record.confidenceScore}%
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Flagged Exceptions & Suggested Fixes */}
          {hasIssues ? (
            <div className="space-y-2.5">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Quality Check Findings ({record.issues.length})
              </h4>
              {record.issues.map((issue, idx) => (
                <div
                  key={idx}
                  className={`p-3.5 rounded-lg border text-xs ${
                    issue.severity === 'critical'
                      ? 'bg-rose-50/70 border-rose-200 text-rose-900'
                      : 'bg-amber-50/70 border-amber-200 text-amber-900'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2">
                      {issue.severity === 'critical' ? (
                        <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      )}
                      <div>
                        <div className="font-semibold">{issue.ruleName}</div>
                        <div className="mt-1 text-slate-700 leading-relaxed">{issue.message}</div>
                        {issue.suggestedFix && (
                          <div className="mt-2 text-slate-600 font-mono text-xs">
                            Suggested fix: {issue.suggestedFix}
                          </div>
                        )}
                      </div>
                    </div>

                    {issue.suggestedFix && (
                      <button
                        onClick={() => handleApplySuggestedFix(issue)}
                        className="px-2.5 py-1 text-xs font-medium bg-white border border-slate-300 rounded shadow-xs hover:bg-slate-50 transition-colors whitespace-nowrap shrink-0 text-slate-800"
                      >
                        Auto-Apply Fix
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center gap-2.5 text-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>All deterministic quality rules passed. Record is ready for execution authorization.</span>
            </div>
          )}

          {/* Form Fields for Inline Editing */}
          <div className="space-y-4">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Record Data (Editable)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Object.entries(formData).map(([key, value]) => {
                const isFlagged = record.issues.some(i => i.field === key);
                return (
                  <div key={key} className="space-y-1">
                    <label className="text-xs font-medium text-slate-700 flex items-center justify-between">
                      <span className="capitalize">{key.replace(/_/g, ' ')}</span>
                      {isFlagged && (
                        <span className="text-rose-600 text-[11px] font-mono">Flagged Issue</span>
                      )}
                    </label>
                    <input
                      type={typeof value === 'number' ? 'number' : 'text'}
                      value={value ?? ''}
                      onChange={(e) => {
                        const val = typeof value === 'number' ? parseFloat(e.target.value) || 0 : e.target.value;
                        handleFieldChange(key, val);
                      }}
                      className={`w-full text-xs px-3 py-2 rounded-md border transition-colors ${
                        isFlagged
                          ? 'border-rose-400 bg-rose-50/30 focus:border-rose-600 focus:ring-1 focus:ring-rose-600'
                          : 'border-slate-300 bg-white focus:border-slate-900 focus:ring-1 focus:ring-slate-900'
                      }`}
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Reviewer Audit Notes */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-700">
              Reviewer Notes (Logged into Immutable Audit Ledger)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Verified customer contact with sales team; corrected domain spelling."
              className="w-full text-xs px-3 py-2 rounded-md border border-slate-300 focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
            />
          </div>

          {/* Staged Actions Preview Toggle */}
          <div className="border-t border-slate-100 pt-3">
            <button
              onClick={() => setShowStagedPayloads(!showStagedPayloads)}
              className="text-xs font-medium text-slate-600 hover:text-slate-900 flex items-center gap-1.5"
            >
              <span>{showStagedPayloads ? 'Hide' : 'Inspect'} Staged Outbound Payloads ({record.stagedActions.length})</span>
            </button>

            {showStagedPayloads && (
              <div className="mt-3 space-y-2">
                {record.stagedActions.map(action => (
                  <div key={action.id} className="p-3 bg-slate-900 text-slate-100 rounded-lg text-xs font-mono">
                    <div className="flex items-center justify-between pb-1.5 border-b border-slate-800 text-[11px] text-slate-400">
                      <span>Target: {action.targetSystem} ({action.actionType})</span>
                      <span className="text-amber-400 font-semibold">STATUS: HELD IN STAGING</span>
                    </div>
                    <pre className="mt-2 overflow-x-auto text-[11px] text-slate-300 leading-tight">
                      {JSON.stringify(action.payload, null, 2)}
                    </pre>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2">
            <button
              onClick={() => onRejectRecord(record.id, notes || 'Rejected due to validation failure')}
              className="px-3 py-1.5 text-xs font-medium text-rose-700 hover:bg-rose-100 rounded-md transition-colors"
            >
              Reject Record
            </button>
            <button
              onClick={() => onEscalateRecord(record.id, notes || 'Escalated for senior review')}
              className="px-3 py-1.5 text-xs font-medium text-amber-800 hover:bg-amber-100 rounded-md transition-colors"
            >
              Escalate
            </button>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => {
                onSaveRecord(record.id, formData, notes);
                onClose();
              }}
              className="px-3.5 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-100 transition-colors flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Save & Re-validate</span>
            </button>

            <button
              onClick={() => {
                onSaveRecord(record.id, formData, notes);
                onApproveRecord(record.id, notes);
                onClose();
              }}
              className="px-4 py-1.5 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-md transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Approve Record</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

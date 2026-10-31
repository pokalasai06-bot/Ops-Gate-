import React, { useState, useMemo, useEffect } from 'react';
import { BusinessRecord, RecordIssue, ValidationRule, StagedAction } from '../types';
import { 
  X, 
  Check, 
  AlertCircle, 
  AlertTriangle, 
  ArrowRight, 
  ShieldCheck, 
  RefreshCw, 
  GitMerge, 
  Mail, 
  Sparkles, 
  Lock, 
  Unlock,
  UserCheck, 
  CheckCircle2, 
  HelpCircle, 
  Clock,
  Copy,
  ChevronDown,
  ChevronUp,
  Sliders,
  Type,
  FileCheck,
  Send,
  Zap
} from 'lucide-react';
import { validateSingleRecord } from '../services/workflowEngine';
import { INITIAL_VALIDATION_RULES } from '../data/defaultRules';

interface InlineRecordEditorModalProps {
  record: BusinessRecord | null;
  allRecords?: BusinessRecord[];
  rules?: ValidationRule[];
  onClose: () => void;
  onSaveRecord: (recordId: string, updatedFields: Record<string, any>, reviewerNotes?: string) => void;
  onApproveRecord: (recordId: string, notes?: string) => void;
  onRejectRecord: (recordId: string, reason: string) => void;
  onEscalateRecord: (recordId: string, reason: string) => void;
  onMergeRecord?: (duplicateRecordId: string, masterRecordId: string, mergeNotes?: string) => void;
}

export const InlineRecordEditorModal: React.FC<InlineRecordEditorModalProps> = ({
  record,
  allRecords = [],
  rules = INITIAL_VALIDATION_RULES,
  onClose,
  onSaveRecord,
  onApproveRecord,
  onRejectRecord,
  onEscalateRecord,
  onMergeRecord,
}) => {
  if (!record) return null;

  const [formData, setFormData] = useState<Record<string, any>>({ ...record.fields });
  const [notes, setNotes] = useState(record.reviewerNotes || '');
  const [showStagedPayloads, setShowStagedPayloads] = useState(false);
  const [duplicateResolutionMode, setDuplicateResolutionMode] = useState<'merge' | 'correct'>('merge');
  const [validationErrorBanner, setValidationErrorBanner] = useState<string | null>(null);
  
  // Interactive merge field picks (which attributes to adopt from which record)
  const [mergeFieldPicks, setMergeFieldPicks] = useState<Record<string, 'master' | 'duplicate'>>({});
  const [suppressDuplicateWrites, setSuppressDuplicateWrites] = useState(true);

  // Staged action toggles: allows granular enabling/disabling of outbound connectors for this record
  const [actionToggles, setActionToggles] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    record.stagedActions.forEach(a => {
      initial[a.id] = a.status !== 'blocked';
    });
    return initial;
  });

  // Hotkey listener: Esc to close, Ctrl+Enter to authorize
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleAuthorizeRecord();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [formData, notes]);

  // Find duplicate counterpart record if any
  const duplicateCounterpart = useMemo(() => {
    const emailVal = (formData.email || '').toString().trim().toLowerCase();
    const invVal = (formData.invoice_no || '').toString().trim().toUpperCase();

    if (emailVal) {
      return allRecords.find(r => r.id !== record.id && (r.fields.email || '').toString().trim().toLowerCase() === emailVal);
    }
    if (invVal) {
      return allRecords.find(r => r.id !== record.id && (r.fields.invoice_no || '').toString().trim().toUpperCase() === invVal);
    }
    return null;
  }, [formData.email, formData.invoice_no, allRecords, record.id]);

  // Live validation on current formData
  const liveValidation = useMemo(() => {
    const simulatedCandidateList = allRecords.map(r => 
      r.id === record.id ? { id: r.id, fields: formData } : { id: r.id, fields: r.fields }
    );
    return validateSingleRecord(record.id, formData, simulatedCandidateList, rules, record.sourceName);
  }, [formData, allRecords, record.id, rules, record.sourceName]);

  const isValid = liveValidation.issues.length === 0;

  const handleFieldChange = (key: string, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
    setValidationErrorBanner(null);
  };

  // Quick field interactive helpers
  const handleTrimWhitespace = (key: string) => {
    const val = formData[key];
    if (typeof val === 'string') {
      handleFieldChange(key, val.trim().replace(/\s+/g, ' '));
    }
  };

  const handleTitleCase = (key: string) => {
    const val = formData[key];
    if (typeof val === 'string') {
      const titled = val.toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
      handleFieldChange(key, titled);
    }
  };

  const handleRevertField = (key: string) => {
    handleFieldChange(key, record.fields[key]);
  };

  // Smart suggestions for missing email based on name and company
  const emailPrefixOptions = useMemo(() => {
    const name = (formData.customer_name || formData.vendorName || '').toString().trim().toLowerCase();
    if (!name) return ['contact', 'ops', 'billing'];
    const parts = name.split(/\s+/);
    const first = parts[0] || 'user';
    const last = parts[parts.length - 1] || 'client';
    return [
      `${first}.${last}`,
      first,
      `${first[0]}${last}`,
      `${first}.ops`,
      `${first}+client`,
    ];
  }, [formData.customer_name, formData.vendorName]);

  const domainOptions = useMemo(() => {
    const rawCo = (formData.company || 'acme').toString().trim().toLowerCase().replace(/[^a-z0-9]/g, '');
    return [
      `@${rawCo}.com`,
      `@${rawCo}.co`,
      `@${rawCo}corp.io`,
      `@gmail.com`,
    ];
  }, [formData.company]);

  // Handle auto-apply RFC fix
  const handleApplyRfcFix = (rawEmail: string) => {
    let fixed = rawEmail.trim();
    if (fixed.includes('-at-')) {
      fixed = fixed.replace('-at-', '@');
      if (!fixed.includes('.')) fixed += '.com';
    } else if (!fixed.includes('@')) {
      fixed = `${fixed}@${(formData.company || 'domain').toLowerCase().replace(/\s+/g, '')}.com`;
    }
    handleFieldChange('email', fixed);
  };

  // Interactive Live Email Health Checks
  const emailHealthChecks = useMemo(() => {
    const email = (formData.email || '').toString().trim();
    const hasValue = email.length > 0;
    const isRfcValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const isUnique = !allRecords.some(r => r.id !== record.id && (r.fields.email || '').toString().trim().toLowerCase() === email.toLowerCase());
    const hasTld = email.includes('.') && email.split('.').pop()!.length >= 2;

    return {
      hasValue,
      isRfcValid,
      isUnique,
      hasTld,
      overallValid: hasValue && isRfcValid && isUnique && hasTld,
    };
  }, [formData.email, allRecords, record.id]);

  // Handle Save Corrections
  const handleSaveCorrections = () => {
    if (!isValid) {
      setValidationErrorBanner(`Cannot mark as resolved: ${liveValidation.issues[0]?.message || 'Fields still contain validation errors.'}`);
      return;
    }

    const resolutionNote = notes.trim() 
      ? notes 
      : `Corrected fields (${Object.keys(formData).join(', ')}). All quality rules verified.`;

    onSaveRecord(record.id, formData, resolutionNote);
    onClose();
  };

  // Handle Authorize & Save
  const handleAuthorizeRecord = () => {
    if (!isValid) {
      setValidationErrorBanner(`Cannot authorize record: ${liveValidation.issues[0]?.message || 'Please correct errors before authorization.'}`);
      return;
    }

    const resolutionNote = notes.trim() 
      ? notes 
      : `Authorized by operator after verifying fields. Ready for Execution Gate.`;

    onSaveRecord(record.id, formData, resolutionNote);
    onApproveRecord(record.id, resolutionNote);
    onClose();
  };

  // Handle Merge Duplicate
  const handleExecuteMerge = () => {
    if (!duplicateCounterpart) return;
    
    // Compute consolidated fields based on mergeFieldPicks
    const mergedFields = { ...duplicateCounterpart.fields };
    Object.entries(mergeFieldPicks).forEach(([fieldKey, pick]) => {
      if (pick === 'duplicate' && formData[fieldKey] !== undefined) {
        mergedFields[fieldKey] = formData[fieldKey];
      }
    });

    const mergeNotes = notes.trim() 
      ? notes 
      : `Merged duplicate record ${record.id} into master record ${duplicateCounterpart.id}. ${
          suppressDuplicateWrites ? 'Duplicate write dispatch prevented.' : 'Actions retained.'
        }`;

    if (onMergeRecord) {
      onMergeRecord(record.id, duplicateCounterpart.id, mergeNotes);
    } else {
      onSaveRecord(record.id, formData, `MERGED into ${duplicateCounterpart.id}.`);
      onApproveRecord(record.id, `Merged into ${duplicateCounterpart.id}`);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div 
        className="luxury-card rounded-2xl shadow-2xl border-amber-400/40 w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-slate-950/90">
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs bg-slate-900 border border-amber-500/40 text-amber-300 px-2.5 py-1 rounded-md font-bold shadow-inner">
              {record.id}
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold text-white tracking-wide" style={{ fontFamily: 'var(--font-display)' }}>
                  Human Review &amp; Exception Resolution
                </h3>
                {isValid ? (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-emerald-950/70 text-emerald-300 border border-emerald-500/40 flex items-center gap-1 shadow-xs">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    <span>ALL RULES PASSED</span>
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-amber-950/70 text-amber-300 border border-amber-500/50 flex items-center gap-1 shadow-xs animate-pulse">
                    <AlertTriangle className="w-3 h-3 text-amber-400" />
                    <span>{liveValidation.issues.length} ACTION{liveValidation.issues.length > 1 ? 'S' : ''} REQUIRED</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
                <span>Source: <strong className="text-amber-200/90 font-medium">{record.sourceName}</strong></span>
                <span>·</span>
                <span>Confidence: <strong className={isValid ? 'text-emerald-400 font-mono' : 'text-amber-400 font-mono'}>{liveValidation.confidenceScore}%</strong></span>
                <span>·</span>
                <span className="text-[11px] text-slate-400 font-mono">[Esc] Close · [Ctrl+Enter] Authorize</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800/80 transition-colors"
            title="Close Review Interface (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Validation Error Banner (if submission blocked) */}
        {validationErrorBanner && (
          <div className="bg-rose-950/90 border-b border-rose-500/50 px-6 py-2.5 text-xs text-rose-200 flex items-center gap-2 animate-fadeIn">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span className="font-medium">{validationErrorBanner}</span>
          </div>
        )}

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* 1. DUPLICATE EMAIL RESOLUTION INTERFACE */}
          {duplicateCounterpart && (
            <div className="luxury-card rounded-2xl p-5 border-amber-400/50 bg-gradient-to-br from-amber-950/40 via-slate-950 to-slate-900 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-amber-500/20">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
                  <GitMerge className="w-4 h-4 text-amber-400" />
                  <span>Duplicate Entity Collision Detected</span>
                </div>
                <span className="text-[10px] font-mono px-2.5 py-1 rounded bg-amber-500/15 text-amber-200 border border-amber-500/30 font-semibold">
                  Collides with Master #{duplicateCounterpart.id}
                </span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed font-light">
                Identifier <code className="text-amber-300 bg-slate-900 px-2 py-0.5 rounded font-mono font-medium">{formData.email || formData.invoice_no}</code> already exists in master record <strong className="text-white font-mono">{duplicateCounterpart.id}</strong> ({duplicateCounterpart.fields.customer_name || duplicateCounterpart.fields.vendorName}). Choose an interactive resolution strategy:
              </p>

              {/* Interactive Strategy Selector Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Option A Card */}
                <button
                  type="button"
                  onClick={() => setDuplicateResolutionMode('merge')}
                  className={`p-4 rounded-xl border text-left transition-all relative overflow-hidden group cursor-pointer ${
                    duplicateResolutionMode === 'merge'
                      ? 'border-amber-400 bg-amber-950/50 shadow-lg shadow-amber-500/10 ring-1 ring-amber-400/40'
                      : 'border-white/10 bg-slate-950/60 hover:border-amber-500/30 hover:bg-slate-900/60'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${
                        duplicateResolutionMode === 'merge' ? 'border-amber-400 bg-amber-400 text-slate-950' : 'border-slate-500'
                      }`}>
                        {duplicateResolutionMode === 'merge' && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                      </div>
                      <span className="text-xs font-bold text-white">Option A: Merge into Master</span>
                    </div>
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-500/30">
                      Recommended
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 mt-2 leading-relaxed">
                    Consolidates this entry into <strong className="text-amber-200">{duplicateCounterpart.id}</strong>. Automatically disables duplicate outbound writes.
                  </p>
                </button>

                {/* Option B Card */}
                <button
                  type="button"
                  onClick={() => setDuplicateResolutionMode('correct')}
                  className={`p-4 rounded-xl border text-left transition-all relative overflow-hidden group cursor-pointer ${
                    duplicateResolutionMode === 'correct'
                      ? 'border-amber-400 bg-amber-950/50 shadow-lg shadow-amber-500/10 ring-1 ring-amber-400/40'
                      : 'border-white/10 bg-slate-950/60 hover:border-amber-500/30 hover:bg-slate-900/60'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${
                        duplicateResolutionMode === 'correct' ? 'border-amber-400 bg-amber-400 text-slate-950' : 'border-slate-500'
                      }`}>
                        {duplicateResolutionMode === 'correct' && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                      </div>
                      <span className="text-xs font-bold text-white">Option B: Assign Unique Contact</span>
                    </div>
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-500/30">
                      New Entity
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 mt-2 leading-relaxed">
                    Update the contact address to a distinct email or secondary alias, preserving both records as separate customers.
                  </p>
                </button>
              </div>

              {/* Mode A: Interactive Side-by-Side Merge Studio */}
              {duplicateResolutionMode === 'merge' && (
                <div className="p-4 rounded-xl bg-slate-950/80 border border-amber-500/30 space-y-3.5 animate-fadeIn">
                  <div className="flex items-center justify-between pb-2 border-b border-white/10">
                    <span className="text-[11px] font-mono font-semibold uppercase text-amber-300 flex items-center gap-1.5">
                      <Sliders className="w-3.5 h-3.5 text-amber-400" />
                      <span>Interactive Merge Field Selector</span>
                    </span>
                    <span className="text-[11px] text-slate-400">Click to choose which version to preserve:</span>
                  </div>

                  {/* Side-by-Side Field Comparison Cards */}
                  <div className="space-y-2 text-xs">
                    {/* Name Comparison */}
                    <div className="p-2.5 rounded-lg bg-slate-900/80 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="text-slate-400 text-[11px] font-mono w-24">Customer Name:</div>
                      <div className="flex-1 grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setMergeFieldPicks(prev => ({ ...prev, customer_name: 'master' }))}
                          className={`p-2 rounded border text-left transition-all ${
                            (mergeFieldPicks.customer_name || 'master') === 'master'
                              ? 'border-amber-400 bg-amber-950/40 text-amber-200 font-semibold'
                              : 'border-white/10 bg-slate-950 text-slate-400 hover:text-white'
                          }`}
                        >
                          <div className="text-[10px] text-slate-400 font-mono">Master {duplicateCounterpart.id}</div>
                          <div>{duplicateCounterpart.fields.customer_name || 'N/A'}</div>
                        </button>
                        <button
                          type="button"
                          onClick={() => setMergeFieldPicks(prev => ({ ...prev, customer_name: 'duplicate' }))}
                          className={`p-2 rounded border text-left transition-all ${
                            mergeFieldPicks.customer_name === 'duplicate'
                              ? 'border-amber-400 bg-amber-950/40 text-amber-200 font-semibold'
                              : 'border-white/10 bg-slate-950 text-slate-400 hover:text-white'
                          }`}
                        >
                          <div className="text-[10px] text-slate-400 font-mono">Duplicate {record.id}</div>
                          <div>{formData.customer_name || 'N/A'}</div>
                        </button>
                      </div>
                    </div>

                    {/* Company Comparison */}
                    <div className="p-2.5 rounded-lg bg-slate-900/80 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="text-slate-400 text-[11px] font-mono w-24">Company:</div>
                      <div className="flex-1 grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setMergeFieldPicks(prev => ({ ...prev, company: 'master' }))}
                          className={`p-2 rounded border text-left transition-all ${
                            (mergeFieldPicks.company || 'master') === 'master'
                              ? 'border-amber-400 bg-amber-950/40 text-amber-200 font-semibold'
                              : 'border-white/10 bg-slate-950 text-slate-400 hover:text-white'
                          }`}
                        >
                          <div className="text-[10px] text-slate-400 font-mono">Master {duplicateCounterpart.id}</div>
                          <div>{duplicateCounterpart.fields.company || 'N/A'}</div>
                        </button>
                        <button
                          type="button"
                          onClick={() => setMergeFieldPicks(prev => ({ ...prev, company: 'duplicate' }))}
                          className={`p-2 rounded border text-left transition-all ${
                            mergeFieldPicks.company === 'duplicate'
                              ? 'border-amber-400 bg-amber-950/40 text-amber-200 font-semibold'
                              : 'border-white/10 bg-slate-950 text-slate-400 hover:text-white'
                          }`}
                        >
                          <div className="text-[10px] text-slate-400 font-mono">Duplicate {record.id}</div>
                          <div>{formData.company || 'N/A'}</div>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Write Suppression Toggle */}
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-white/10 text-xs">
                    <div className="flex items-center gap-2">
                      <Lock className="w-4 h-4 text-amber-400" />
                      <div>
                        <span className="font-semibold text-white">Suppress Outbound Connector Dispatches</span>
                        <p className="text-[11px] text-slate-400">Blocks duplicate CRM contact creation &amp; welcome email draft</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSuppressDuplicateWrites(!suppressDuplicateWrites)}
                      className={`px-3 py-1.5 rounded-lg font-mono text-xs font-bold transition-all ${
                        suppressDuplicateWrites 
                          ? 'bg-amber-400 text-slate-950 shadow-sm' 
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {suppressDuplicateWrites ? 'LOCKED (SAFE)' : 'ALLOW DISPATCH'}
                    </button>
                  </div>

                  {/* Execute Merge CTA */}
                  <div className="flex items-center justify-end pt-2">
                    <button
                      type="button"
                      onClick={handleExecuteMerge}
                      className="gold-button px-5 py-2.5 text-xs font-semibold flex items-center gap-2 shadow-md hover:scale-[1.01] transition-transform"
                    >
                      <GitMerge className="w-4 h-4" />
                      <span>Confirm Merge into {duplicateCounterpart.id}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Mode B: Interactive Email Builder & Matrix */}
              {duplicateResolutionMode === 'correct' && (
                <div className="p-4 rounded-xl bg-slate-950/80 border border-amber-500/30 space-y-3.5 animate-fadeIn">
                  <label className="text-[11px] font-mono text-amber-300 block font-semibold uppercase">
                    Interactive Unique Email Composer
                  </label>
                  
                  <div className="relative">
                    <input
                      type="email"
                      value={formData.email || ''}
                      onChange={(e) => handleFieldChange('email', e.target.value)}
                      placeholder="e.g. secondary.contact@acmesupplies.co"
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-amber-500/35 bg-slate-900 text-white focus:border-amber-400 focus:outline-none font-mono shadow-inner"
                    />
                    {formData.email && (
                      <button
                        type="button"
                        onClick={() => handleFieldChange('email', '')}
                        className="absolute right-3 top-2.5 text-slate-400 hover:text-white text-xs"
                      >
                        Clear
                      </button>
                    )}
                  </div>

                  {/* Interactive Prefix & Domain Chips */}
                  <div className="space-y-2">
                    <div className="text-[11px] text-slate-400 flex items-center justify-between">
                      <span>Click to build or replace email parts:</span>
                      <span className="font-mono text-amber-300 text-[10px]">Instant Composition</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[10px] font-mono text-slate-500 mr-1 uppercase">Aliases:</span>
                      {emailPrefixOptions.map((prefix, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            const domain = (formData.email || '').includes('@') 
                              ? `@${(formData.email || '').split('@')[1]}` 
                              : domainOptions[0];
                            handleFieldChange('email', `${prefix}${domain}`);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-slate-900 border border-white/10 hover:border-amber-400 text-amber-200 text-[11px] font-mono transition-all hover:bg-slate-800"
                        >
                          {prefix}
                        </button>
                      ))}
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[10px] font-mono text-slate-500 mr-1 uppercase">Domains:</span>
                      {domainOptions.map((dom, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            const prefix = (formData.email || '').includes('@')
                              ? (formData.email || '').split('@')[0]
                              : (emailPrefixOptions[0] || 'contact');
                            handleFieldChange('email', `${prefix}${dom}`);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-slate-900 border border-amber-500/20 hover:border-amber-400 text-amber-300 text-[11px] font-mono transition-all hover:bg-slate-800"
                        >
                          {dom}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Interactive 4-Point Health Matrix */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-white/10">
                    <div className={`p-2 rounded-lg border text-center transition-all ${
                      emailHealthChecks.isRfcValid 
                        ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300' 
                        : 'bg-rose-950/40 border-rose-500/30 text-rose-300'
                    }`}>
                      <div className="text-[10px] font-mono uppercase">1. RFC Syntax</div>
                      <div className="text-xs font-bold mt-0.5">{emailHealthChecks.isRfcValid ? '✓ Valid' : '✗ Invalid'}</div>
                    </div>

                    <div className={`p-2 rounded-lg border text-center transition-all ${
                      emailHealthChecks.isUnique 
                        ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300' 
                        : 'bg-amber-950/40 border-amber-500/40 text-amber-300'
                    }`}>
                      <div className="text-[10px] font-mono uppercase">2. Uniqueness</div>
                      <div className="text-xs font-bold mt-0.5">{emailHealthChecks.isUnique ? '✓ Unique' : '✗ Collides'}</div>
                    </div>

                    <div className={`p-2 rounded-lg border text-center transition-all ${
                      emailHealthChecks.hasValue 
                        ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300' 
                        : 'bg-rose-950/40 border-rose-500/30 text-rose-300'
                    }`}>
                      <div className="text-[10px] font-mono uppercase">3. Populated</div>
                      <div className="text-xs font-bold mt-0.5">{emailHealthChecks.hasValue ? '✓ Present' : '✗ Empty'}</div>
                    </div>

                    <div className={`p-2 rounded-lg border text-center transition-all ${
                      emailHealthChecks.hasTld 
                        ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300' 
                        : 'bg-rose-950/40 border-rose-500/30 text-rose-300'
                    }`}>
                      <div className="text-[10px] font-mono uppercase">4. TLD Suffix</div>
                      <div className="text-xs font-bold mt-0.5">{emailHealthChecks.hasTld ? '✓ Valid TLD' : '✗ Incomplete'}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 2. MISSING EMAIL OR MALFORMED EMAIL INTERFACE (Non-Duplicate) */}
          {(!formData.email || formData.email.includes('-at-') || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) && !duplicateCounterpart && (
            <div className="p-4 rounded-xl border border-amber-500/40 bg-amber-950/30 text-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-amber-300 flex items-center gap-1.5">
                  <Mail className="w-4 h-4 text-amber-400" />
                  <span>{!formData.email ? 'Missing Mandatory Email Address' : 'RFC 5322 Syntax Correction'}</span>
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-rose-950/60 text-rose-300 border border-rose-500/30 font-semibold uppercase">
                  Action Required
                </span>
              </div>

              <p className="text-slate-300 font-light leading-relaxed">
                {!formData.email 
                  ? 'A valid email address is required to generate customer CRM records and welcome outreach drafts.'
                  : `Email "${formData.email}" does not conform to RFC 5322 standards. Fix the delimiter syntax or provide a valid address.`}
              </p>

              {/* Auto-suggest button if -at- is present */}
              {formData.email && formData.email.includes('-at-') && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleApplyRfcFix(formData.email)}
                    className="gold-button px-3.5 py-1.5 text-xs font-semibold flex items-center gap-1.5 shadow"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Auto-Fix RFC Syntax: {formData.email.replace('-at-', '@')}.com</span>
                  </button>
                </div>
              )}

              {/* Suggestions chips for empty email */}
              {!formData.email && emailPrefixOptions.length > 0 && (
                <div className="space-y-1.5">
                  <div className="text-[11px] font-mono text-slate-400 uppercase">Interactive Generated Suggestions:</div>
                  <div className="flex flex-wrap gap-2">
                    {emailPrefixOptions.map((sug, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => handleFieldChange('email', `${sug}${domainOptions[0]}`)}
                        className="px-2.5 py-1 rounded-lg bg-slate-900 border border-amber-500/30 text-amber-300 hover:border-amber-400 font-mono text-[11px] transition-all hover:scale-105"
                      >
                        + {sug}{domainOptions[0]}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 3. FIELD EDITOR GRID WITH QUICK ACTIONS */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-[11px] font-mono font-semibold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                <Type className="w-3.5 h-3.5 text-amber-400" />
                <span>Record Attributes &amp; Interactive Tools</span>
              </h4>
              <span className="text-[11px] text-slate-400">
                {Object.keys(formData).length} data attributes loaded
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {Object.entries(formData).map(([key, value]) => {
                const hasError = liveValidation.issues.some(issue => issue.field === key);
                const isModified = record.fields[key] !== value;

                return (
                  <div 
                    key={key} 
                    className={`p-3 rounded-xl border transition-all ${
                      hasError 
                        ? 'border-rose-500/60 bg-rose-950/20 shadow-xs' 
                        : isModified
                          ? 'border-amber-400/50 bg-amber-950/15'
                          : 'border-white/10 bg-slate-950/60'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-[11px] font-mono text-slate-300 capitalize font-medium flex items-center gap-1">
                        <span>{key.replace(/_/g, ' ')}</span>
                        {isModified && (
                          <span className="text-[9px] font-mono text-amber-400 bg-amber-500/20 px-1 rounded">Edited</span>
                        )}
                      </label>

                      {/* Interactive Micro-Tools for this field */}
                      <div className="flex items-center gap-1">
                        {typeof value === 'string' && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleTrimWhitespace(key)}
                              title="Trim redundant spaces"
                              className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-900 border border-white/10 text-slate-400 hover:text-amber-300 hover:border-amber-500/30 transition-colors"
                            >
                              Trim
                            </button>
                            <button
                              type="button"
                              onClick={() => handleTitleCase(key)}
                              title="Convert to Title Case"
                              className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-900 border border-white/10 text-slate-400 hover:text-amber-300 hover:border-amber-500/30 transition-colors"
                            >
                              Aa
                            </button>
                          </>
                        )}
                        {isModified && (
                          <button
                            type="button"
                            onClick={() => handleRevertField(key)}
                            title="Revert to initial value"
                            className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-900 border border-white/10 text-slate-400 hover:text-rose-300 transition-colors"
                          >
                            Revert
                          </button>
                        )}
                      </div>
                    </div>

                    <input
                      type={typeof value === 'number' ? 'number' : 'text'}
                      value={value ?? ''}
                      onChange={(e) => handleFieldChange(key, typeof value === 'number' ? parseFloat(e.target.value) || 0 : e.target.value)}
                      className="w-full text-xs px-3 py-2 rounded-lg border border-white/10 bg-slate-900 text-white focus:border-amber-400 focus:outline-none font-mono"
                    />

                    {/* Specific Field Error Message */}
                    {hasError && (
                      <p className="text-[10px] text-rose-300 mt-1 font-mono flex items-center gap-1">
                        <AlertCircle className="w-3 h-3 text-rose-400 shrink-0" />
                        <span>{liveValidation.issues.find(issue => issue.field === key)?.message}</span>
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* 4. ACTIVE VALIDATION ISSUES LIST */}
          {liveValidation.issues.length > 0 && (
            <div className="p-4 rounded-xl border border-amber-500/40 bg-amber-950/20 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span>Remaining Policy Exceptions ({liveValidation.issues.length})</span>
              </div>
              <div className="space-y-1.5">
                {liveValidation.issues.map((issue, idx) => (
                  <div key={idx} className="text-xs text-slate-300 flex items-start gap-2 bg-slate-900/60 p-2 rounded-lg border border-white/5">
                    <span className="font-mono text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded mt-0.5">
                      {issue.ruleId}
                    </span>
                    <span className="flex-1">{issue.message}</span>
                    <span className="font-mono text-[10px] text-rose-300 uppercase">{issue.severity}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 5. REVIEWER NOTES & AUDIT COMMENT */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-mono text-slate-300 block font-medium">
              Reviewer Audit Log Justification
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Verified contact via phone directory. Corrected delimiter syntax and approved for CRM staging."
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-white/10 bg-slate-900 text-white focus:border-amber-400 focus:outline-none"
            />
          </div>

          {/* 6. INTERACTIVE STAGED OUTBOUND PAYLOADS INSPECTOR */}
          <div className="border-t border-white/10 pt-3">
            <button
              type="button"
              onClick={() => setShowStagedPayloads(!showStagedPayloads)}
              className="text-xs font-medium text-amber-300 hover:text-amber-200 flex items-center justify-between w-full p-2.5 rounded-xl bg-slate-950/80 border border-white/10 transition-colors"
            >
              <span className="flex items-center gap-2">
                <Lock className="w-3.5 h-3.5 text-amber-400" />
                <span>Interactive Outbound Connector Staging ({record.stagedActions.length} Actions)</span>
              </span>
              <span className="flex items-center gap-1 font-mono text-[11px] text-slate-400">
                {showStagedPayloads ? 'Hide Details' : 'Inspect & Configure'}
                {showStagedPayloads ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </span>
            </button>

            {showStagedPayloads && (
              <div className="mt-3 space-y-2.5 animate-fadeIn">
                {record.stagedActions.map(action => {
                  const isEnabled = actionToggles[action.id] !== false;
                  return (
                    <div key={action.id} className="p-3 bg-slate-950 border border-white/10 rounded-xl text-xs font-mono space-y-2">
                      <div className="flex items-center justify-between pb-1.5 border-b border-white/10 text-[11px]">
                        <span className="text-white font-semibold flex items-center gap-1.5">
                          <Send className="w-3 h-3 text-amber-400" />
                          <span>{action.targetSystem} · {action.actionType}</span>
                        </span>
                        
                        {/* Interactive Toggle for this Action */}
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold ${
                            isEnabled ? 'bg-amber-950/80 text-amber-300 border border-amber-500/40' : 'bg-slate-900 text-slate-400 border border-white/10'
                          }`}>
                            {isEnabled ? 'STAGED (HELD)' : 'PAUSED'}
                          </span>
                          <button
                            type="button"
                            onClick={() => setActionToggles(prev => ({ ...prev, [action.id]: !isEnabled }))}
                            className={`px-2 py-0.5 rounded text-[10px] font-sans font-semibold transition-colors ${
                              isEnabled ? 'bg-amber-400 text-slate-950' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                            }`}
                          >
                            {isEnabled ? 'Disable' : 'Enable'}
                          </button>
                        </div>
                      </div>
                      
                      <pre className="overflow-x-auto text-[11px] text-amber-100/90 leading-tight bg-slate-900/80 p-2.5 rounded-lg border border-white/5">
                        {JSON.stringify(action.payload, null, 2)}
                      </pre>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-6 py-4 border-t border-white/10 bg-slate-950/95">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => {
                onRejectRecord(record.id, notes || 'Rejected due to validation failure');
                onClose();
              }}
              className="px-3.5 py-2 text-xs font-medium text-rose-400 hover:bg-rose-950/50 rounded-xl transition-colors border border-rose-500/20 hover:border-rose-500/50"
            >
              Reject Record
            </button>
            <button
              type="button"
              onClick={() => {
                onEscalateRecord(record.id, notes || 'Escalated for senior review');
                onClose();
              }}
              className="px-3.5 py-2 text-xs font-medium text-amber-300 hover:bg-amber-950/50 rounded-xl transition-colors border border-amber-500/20 hover:border-amber-500/50"
            >
              Escalate
            </button>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            {/* Save Corrections Button */}
            <button
              type="button"
              onClick={handleSaveCorrections}
              className="px-4 py-2.5 text-xs font-medium text-slate-200 bg-slate-900 border border-white/15 rounded-xl hover:bg-slate-800 transition-all flex items-center gap-1.5 shadow-sm hover:scale-[1.01]"
              title="Save corrections and re-validate"
            >
              <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
              <span>Save Corrections</span>
            </button>

            {/* Authorize / Approve Record Button */}
            <button
              type="button"
              onClick={handleAuthorizeRecord}
              className="gold-button px-5 py-2.5 text-xs rounded-xl flex items-center gap-2 shadow-md hover:scale-[1.02] transition-transform font-bold"
              title="Validate, save, and authorize for execution gate"
            >
              <Check className="w-4 h-4" />
              <span>Authorize Record</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

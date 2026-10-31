import React, { useState } from 'react';
import { DemoDataset, TaskStep, BusinessRecord, ValidationRule } from '../types';
import { TaskPlanCard } from './TaskPlanCard';
import { 
  Sparkles, 
  Play, 
  RotateCcw, 
  ShieldCheck, 
  ArrowRight, 
  FileText, 
  Database, 
  Lock, 
  Layers,
  AlertTriangle,
  Sliders,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Gauge,
  Zap,
  Check
} from 'lucide-react';

interface WorkflowStudioViewProps {
  instruction: string;
  onChangeInstruction: (val: string) => void;
  selectedDataset: DemoDataset;
  allDatasets: DemoDataset[];
  onSelectDataset: (datasetId: string) => void;
  taskSteps: TaskStep[];
  records: BusinessRecord[];
  rules?: ValidationRule[];
  onToggleRule?: (ruleId: string) => void;
  onGeneratePlanAndValidate: () => void;
  onNavigateToReview: () => void;
  onOpenRecordEditor?: (record: BusinessRecord) => void;
  isProcessing: boolean;
}

export const WorkflowStudioView: React.FC<WorkflowStudioViewProps> = ({
  instruction,
  onChangeInstruction,
  selectedDataset,
  allDatasets,
  onSelectDataset,
  taskSteps,
  records,
  rules = [],
  onToggleRule,
  onGeneratePlanAndValidate,
  onNavigateToReview,
  onOpenRecordEditor,
  isProcessing,
}) => {
  const [executionMode, setExecutionMode] = useState<'sandbox' | 'production_review'>('sandbox');
  const [showRulesDrawer, setShowRulesDrawer] = useState(false);
  const [simulationSpeed, setSimulationSpeed] = useState<'normal' | 'fast' | 'instant'>('normal');

  const exceptionCount = records.filter(r => r.validationStatus === 'exception' && r.reviewStatus !== 'approved').length;
  const validCount = records.filter(r => r.validationStatus === 'valid' || r.validationStatus === 'corrected').length;

  const quickPromptTemplates = [
    {
      label: 'Customer Leads Triage',
      datasetId: 'leads_spreadsheet',
      sourceType: 'Google Sheets',
      recordCount: 5,
      exceptionEstimate: '4 exceptions flagged',
      badge: 'Sales Operations',
      prompt: 'Review new customer leads in the spreadsheet. Validate emails and duplicates. Create a CRM draft for valid leads, prepare welcome emails, and notify sales. Do not send anything externally until approved.',
    },
    {
      label: 'Accounts Payable Audit',
      datasetId: 'vendor_invoices',
      sourceType: 'Invoices CSV',
      recordCount: 5,
      exceptionEstimate: 'High-value signoff >$2.5k',
      badge: 'Finance & Treasury',
      prompt: 'Audit incoming vendor bills. Verify positive amounts, check for duplicate invoice numbers, flag any payment over $2,500 for owner review, and prepare QuickBooks payment drafts.',
    },
    {
      label: 'Support Ticket Dispatch',
      datasetId: 'support_tickets',
      sourceType: 'Support Queue',
      recordCount: 4,
      exceptionEstimate: 'Delivery escalation',
      badge: 'Customer Service',
      prompt: 'Triage customer support tickets. Validate email and order IDs, flag urgent escalation tags, draft email replies, and hold all outbound replies until customer service lead signs off.',
    },
  ];

  return (
    <div className="space-y-8 relative">
      {/* Background ambient lighting */}
      <div className="absolute top-10 right-1/4 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-normal text-white" style={{ fontFamily: 'var(--font-serif)' }}>
          Workflow Directive &amp; Task Planner
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Give natural-language directives. OpsGate parses intent, builds an explainable DAG, validates records, and stages actions behind a human approval gate.
        </p>
      </div>

      {/* Main Builder Form */}
      <div className="luxury-card rounded-2xl p-6 sm:p-8 space-y-6">
        
        {/* Source Data & Execution Mode Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-[11px] font-mono font-semibold text-amber-300 uppercase tracking-wider block mb-2">
              Select Business Data Source
            </label>
            <select
              value={selectedDataset.id}
              onChange={(e) => onSelectDataset(e.target.value)}
              className="w-full text-xs font-medium text-white bg-slate-950/80 border border-amber-500/30 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-1 focus:ring-amber-400 cursor-pointer shadow-inner shadow-black/50"
            >
              {allDatasets.map((ds) => (
                <option key={ds.id} value={ds.id} className="bg-slate-900 text-white">
                  {ds.title} ({ds.records.length} records) · {ds.sourceType}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] font-mono font-semibold text-amber-300 uppercase tracking-wider block mb-2">
              Execution Safety Mode
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setExecutionMode('sandbox')}
                className={`flex-1 py-2 px-3 text-xs font-medium rounded-xl border text-left transition-all cursor-pointer ${
                  executionMode === 'sandbox'
                    ? 'border-amber-400/80 bg-amber-950/50 text-amber-200 shadow-md shadow-amber-500/10 ring-1 ring-amber-400/30'
                    : 'border-white/5 bg-slate-950/40 text-slate-400 hover:bg-slate-900/50'
                }`}
              >
                <div className="font-semibold text-white flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                  <span>Institutional Sandbox</span>
                </div>
                <div className="text-[10px] text-amber-200/70 font-mono">Mock connector buffer</div>
              </button>

              <button
                type="button"
                onClick={() => setExecutionMode('production_review')}
                className={`flex-1 py-2 px-3 text-xs font-medium rounded-xl border text-left transition-all cursor-pointer ${
                  executionMode === 'production_review'
                    ? 'border-amber-400/80 bg-amber-950/50 text-amber-200 shadow-md shadow-amber-500/10 ring-1 ring-amber-400/30'
                    : 'border-white/5 bg-slate-950/40 text-slate-400 hover:bg-slate-900/50'
                }`}
              >
                <div className="font-semibold text-white flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Production Review</span>
                </div>
                <div className="text-[10px] text-amber-200/70 font-mono">Real connector drafts · Gated</div>
              </button>
            </div>
          </div>
        </div>

        {/* Interactive Curated Directive Presets Cards */}
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <label className="text-[11px] font-mono font-semibold text-amber-300 uppercase tracking-wider block">
              Interactive Directive Presets
            </label>
            <span className="text-[11px] text-slate-400">Click a scenario card to load data &amp; directive</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {quickPromptTemplates.map((tpl) => {
              const isSelected = selectedDataset.id === tpl.datasetId && instruction === tpl.prompt;
              return (
                <button
                  key={tpl.label}
                  type="button"
                  onClick={() => {
                    onSelectDataset(tpl.datasetId);
                    onChangeInstruction(tpl.prompt);
                  }}
                  className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer relative overflow-hidden group hover:scale-[1.01] ${
                    isSelected
                      ? 'border-amber-400 bg-amber-950/40 text-amber-200 shadow-lg shadow-amber-500/10 ring-1 ring-amber-400/50'
                      : 'border-white/10 bg-slate-950/60 hover:border-amber-500/30 hover:bg-slate-900/60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-white/10 text-amber-300 uppercase font-semibold">
                      {tpl.badge}
                    </span>
                    {isSelected && (
                      <span className="w-4 h-4 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </span>
                    )}
                  </div>

                  <div className="font-bold text-white text-xs mt-2 group-hover:text-amber-200 transition-colors">
                    {tpl.label}
                  </div>

                  <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-2">
                    <span>{tpl.sourceType}</span>
                    <span>·</span>
                    <span className="text-amber-300/80">{tpl.recordCount} records</span>
                  </div>

                  <div className="text-[10px] text-rose-300/80 mt-1.5 font-mono">
                    {tpl.exceptionEstimate}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Interactive Live Validation Rules Controls */}
        {rules.length > 0 && onToggleRule && (
          <div className="border border-white/10 rounded-xl bg-slate-950/70 overflow-hidden">
            <button
              type="button"
              onClick={() => setShowRulesDrawer(!showRulesDrawer)}
              className="w-full px-4 py-2.5 flex items-center justify-between text-xs text-amber-300 hover:text-white transition-colors"
            >
              <span className="flex items-center gap-2 font-mono font-semibold">
                <Sliders className="w-3.5 h-3.5 text-amber-400" />
                <span>Interactive Live Business Rules &amp; Policy Toggles ({rules.filter(r => r.enabled).length} Active)</span>
              </span>
              <span className="flex items-center gap-1 font-mono text-[11px] text-slate-400">
                {showRulesDrawer ? 'Collapse Toggles' : 'Configure Rules'}
                {showRulesDrawer ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </span>
            </button>

            {showRulesDrawer && (
              <div className="p-4 border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 animate-fadeIn">
                {rules.map((rule) => (
                  <div
                    key={rule.id}
                    onClick={() => onToggleRule(rule.id)}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                      rule.enabled 
                        ? 'border-amber-400/40 bg-amber-950/20 text-white' 
                        : 'border-white/5 bg-slate-900/40 text-slate-500'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] uppercase font-bold text-amber-300">
                        {rule.id.replace('rule_', '').toUpperCase()}
                      </span>
                      <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold ${
                        rule.enabled ? 'bg-amber-400 text-slate-950' : 'bg-slate-800 text-slate-500'
                      }`}>
                        {rule.enabled ? 'ON' : 'OFF'}
                      </span>
                    </div>
                    <div className="text-xs font-semibold mt-1 truncate">{rule.name}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">{rule.description}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Natural Language Instruction Text Area */}
        <div className="space-y-2">
          <label className="text-[11px] font-mono font-semibold text-amber-300 uppercase tracking-wider flex items-center justify-between">
            <span>Natural Language Workflow Directive</span>
            <span className="text-slate-400 font-normal font-sans text-xs">AI Instruction Engine</span>
          </label>
          <textarea
            rows={4}
            value={instruction}
            onChange={(e) => onChangeInstruction(e.target.value)}
            placeholder="Describe what you want the agent to do. E.g. Review new customer leads in the spreadsheet. Validate emails and duplicates. Create a CRM draft for valid leads, prepare welcome emails, and notify sales. Do not send anything externally until approved."
            className="w-full text-sm p-4 rounded-xl border border-white/10 focus:border-amber-400 focus:outline-none bg-slate-950/70 text-slate-100 placeholder:text-slate-500 font-sans leading-relaxed shadow-inner shadow-black/50"
          />
        </div>

        {/* Action Controls & Interactive Simulation Speed */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <div className="flex items-center gap-2 text-xs text-amber-200/70 font-mono">
            <Lock className="w-4 h-4 text-amber-400 shrink-0" />
            <span>ENFORCED POLICY: All external outbound write APIs remain locked.</span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {/* Speed Selector */}
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-white/10 text-[11px] font-mono">
              <span className="px-2 text-slate-500 uppercase">Speed:</span>
              <button
                type="button"
                onClick={() => setSimulationSpeed('normal')}
                className={`px-2 py-0.5 rounded-lg transition-colors ${
                  simulationSpeed === 'normal' ? 'bg-amber-400 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                1x
              </button>
              <button
                type="button"
                onClick={() => setSimulationSpeed('fast')}
                className={`px-2 py-0.5 rounded-lg transition-colors ${
                  simulationSpeed === 'fast' ? 'bg-amber-400 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                5x
              </button>
              <button
                type="button"
                onClick={() => setSimulationSpeed('instant')}
                className={`px-2 py-0.5 rounded-lg transition-colors ${
                  simulationSpeed === 'instant' ? 'bg-amber-400 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Instant
              </button>
            </div>

            <button
              onClick={() => onChangeInstruction('')}
              className="px-3.5 py-2 text-xs font-medium text-slate-400 hover:text-white transition-colors"
            >
              Clear
            </button>
            
            <button
              disabled={!instruction.trim() || isProcessing}
              onClick={onGeneratePlanAndValidate}
              className="gold-button flex-1 sm:flex-initial px-5 py-2.5 text-xs rounded-xl disabled:opacity-50 flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform shadow-md"
            >
              <Sparkles className="w-4 h-4 text-slate-950" />
              <span>{isProcessing ? 'Synthesizing DAG & Validating...' : 'Generate Plan & Validate Records'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Structured Task Plan & Quality Findings Section */}
      {taskSteps.length > 0 && (
        <div className="space-y-6">
          {/* Quick Outcome Banner */}
          <div className="luxury-card rounded-2xl p-5 sm:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-amber-400/30">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-amber-300">
                <span>Task Generation Complete</span>
                <span>·</span>
                <span className="text-amber-400 font-medium">Step 6 Approval Gate Active</span>
              </div>
              <h3 className="text-lg font-bold text-white mt-1">
                {records.length} records evaluated: <span className="text-emerald-400">{validCount} clean</span>, <span className="text-rose-400">{exceptionCount} exceptions</span>
              </h3>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl font-light">
                The agent has staged CRM drafts and notifications in isolated memory. As mandated by security policy, nothing has been dispatched externally.
              </p>

              {/* Selectable Exception Badges for Human Review */}
              {exceptionCount > 0 && onOpenRecordEditor && (
                <div className="mt-3 flex items-center gap-2 flex-wrap">
                  <span className="text-[11px] font-mono text-amber-300/80 uppercase">Select Exception to Review:</span>
                  {records.filter(r => r.validationStatus === 'exception' && r.reviewStatus !== 'approved').map(r => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => onOpenRecordEditor(r)}
                      className="px-2.5 py-1 rounded-lg text-xs font-mono font-semibold bg-rose-950/60 hover:bg-rose-900 border border-rose-500/40 text-rose-200 transition-all flex items-center gap-1 shadow-xs hover:scale-105"
                      title={`Review exception for ${r.id}: ${r.issues[0]?.message || ''}`}
                    >
                      <AlertTriangle className="w-3 h-3 text-rose-400" />
                      <span>{r.id} ({r.fields.customer_name || r.fields.vendorName || 'Record'})</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={onNavigateToReview}
              className="gold-button px-5 py-2.5 text-xs rounded-xl flex items-center gap-2 shrink-0 shadow-lg hover:scale-105 transition-transform"
            >
              <span>Review Exceptions ({exceptionCount})</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Task Plan Details Card */}
          <TaskPlanCard 
            steps={taskSteps} 
            records={records}
            datasetName={selectedDataset.sourceName}
            onReviewGateClick={onNavigateToReview} 
            onOpenRecordEditor={onOpenRecordEditor}
          />
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import { DemoDataset, TaskStep, BusinessRecord } from '../types';
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
  Layers
} from 'lucide-react';

interface WorkflowStudioViewProps {
  instruction: string;
  onChangeInstruction: (val: string) => void;
  selectedDataset: DemoDataset;
  allDatasets: DemoDataset[];
  onSelectDataset: (datasetId: string) => void;
  taskSteps: TaskStep[];
  records: BusinessRecord[];
  onGeneratePlanAndValidate: () => void;
  onNavigateToReview: () => void;
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
  onGeneratePlanAndValidate,
  onNavigateToReview,
  isProcessing,
}) => {
  const [executionMode, setExecutionMode] = useState<'sandbox' | 'production_review'>('sandbox');

  const exceptionCount = records.filter(r => r.validationStatus === 'exception' && r.reviewStatus !== 'approved').length;
  const validCount = records.filter(r => r.validationStatus === 'valid' || r.validationStatus === 'corrected').length;

  const quickPromptTemplates = [
    {
      label: 'Customer Leads Triage',
      datasetId: 'leads_spreadsheet',
      prompt: 'Review new customer leads in the spreadsheet. Validate emails and duplicates. Create a CRM draft for valid leads, prepare welcome emails, and notify sales. Do not send anything externally until approved.',
    },
    {
      label: 'Accounts Payable Audit',
      datasetId: 'vendor_invoices',
      prompt: 'Audit incoming vendor bills. Verify positive amounts, check for duplicate invoice numbers, flag any payment over $2,500 for owner review, and prepare QuickBooks payment drafts.',
    },
    {
      label: 'Support Ticket Dispatch',
      datasetId: 'support_tickets',
      prompt: 'Triage customer support tickets. Validate email and order IDs, flag urgent escalation tags, draft email replies, and hold all outbound replies until customer service lead signs off.',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
          Workflow Intake & Task Planner
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 mt-1">
          Give natural-language business instructions. OpsGate parses the intent, builds an explainable step plan, checks data quality, and stages actions behind a human approval gate.
        </p>
      </div>

      {/* Main Builder Form */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-7 space-y-6">
        {/* Source Data & Execution Mode Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block mb-2">
              Select Business Data Source
            </label>
            <select
              value={selectedDataset.id}
              onChange={(e) => onSelectDataset(e.target.value)}
              className="w-full text-xs font-medium text-slate-900 bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2.5 focus:outline-none focus:ring-1 focus:ring-slate-900"
            >
              {allDatasets.map((ds) => (
                <option key={ds.id} value={ds.id}>
                  {ds.title} ({ds.records.length} records) · {ds.sourceType}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block mb-2">
              Execution Safety Mode
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setExecutionMode('sandbox')}
                className={`flex-1 py-2 px-3 text-xs font-medium rounded-lg border text-left transition-colors ${
                  executionMode === 'sandbox'
                    ? 'border-slate-900 bg-slate-900 text-white shadow-xs'
                    : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="font-semibold">Demo Sandbox</div>
                <div className="text-[11px] opacity-80">Safe mock connector sandbox</div>
              </button>

              <button
                type="button"
                onClick={() => setExecutionMode('production_review')}
                className={`flex-1 py-2 px-3 text-xs font-medium rounded-lg border text-left transition-colors ${
                  executionMode === 'production_review'
                    ? 'border-slate-900 bg-slate-900 text-white shadow-xs'
                    : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="font-semibold">Production Review</div>
                <div className="text-[11px] opacity-80">Real connector drafts · Gated</div>
              </button>
            </div>
          </div>
        </div>

        {/* Prompt Templates Quick Pickers */}
        <div>
          <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block mb-2">
            Quick Template Presets
          </label>
          <div className="flex flex-wrap gap-2">
            {quickPromptTemplates.map((tpl) => (
              <button
                key={tpl.label}
                onClick={() => {
                  onSelectDataset(tpl.datasetId);
                  onChangeInstruction(tpl.prompt);
                }}
                className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                  instruction === tpl.prompt
                    ? 'border-slate-900 bg-slate-100 font-semibold text-slate-900'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                {tpl.label}
              </button>
            ))}
          </div>
        </div>

        {/* Natural Language Instruction Text Area */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center justify-between">
            <span>Natural Language Workflow Instruction</span>
            <span className="text-slate-400 font-normal">Plain English</span>
          </label>
          <textarea
            rows={4}
            value={instruction}
            onChange={(e) => onChangeInstruction(e.target.value)}
            placeholder="Describe what you want the agent to do. E.g. Review new customer leads in the spreadsheet. Validate emails and duplicates. Create a CRM draft for valid leads, prepare welcome emails, and notify sales. Do not send anything externally until approved."
            className="w-full text-sm p-4 rounded-xl border border-slate-300 focus:outline-none focus:ring-1 focus:ring-slate-900 font-sans leading-relaxed"
          />
        </div>

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Lock className="w-4 h-4 text-amber-700" />
            <span>Default Policy: All external outbound write APIs remain locked.</span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={() => onChangeInstruction('')}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors"
            >
              Clear
            </button>
            <button
              disabled={!instruction.trim() || isProcessing}
              onClick={onGeneratePlanAndValidate}
              className="flex-1 sm:flex-initial px-5 py-2.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-50 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-xs"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isProcessing ? 'Analyzing & Validating...' : 'Generate Plan & Validate Records'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Structured Task Plan & Quality Findings Section */}
      {taskSteps.length > 0 && (
        <div className="space-y-6">
          {/* Quick Outcome Banner */}
          <div className="bg-slate-900 text-white rounded-xl p-5 sm:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                <span>Task Generation Complete</span>
                <span>·</span>
                <span className="text-amber-400 font-medium">Step 6 Approval Gate Active</span>
              </div>
              <h3 className="text-lg font-bold text-white mt-1">
                {records.length} records processed: {validCount} valid, {exceptionCount} require human review
              </h3>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl">
                The agent has staged CRM drafts and notifications in memory. As mandated by policy, nothing has been sent externally.
              </p>
            </div>

            <button
              onClick={onNavigateToReview}
              className="px-5 py-2.5 text-xs font-semibold text-slate-900 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors flex items-center gap-2 shrink-0 shadow-xs"
            >
              <span>Review Exceptions ({exceptionCount})</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Task Plan Details Card */}
          <TaskPlanCard 
            steps={taskSteps} 
            onReviewGateClick={onNavigateToReview} 
          />
        </div>
      )}
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { 
  BusinessRecord, 
  AuditEvent, 
  ConnectorInfo, 
  DemoDataset, 
  TaskStep, 
  UserRole, 
  ValidationRule 
} from './types';
import { DEMO_DATASETS, INITIAL_CONNECTORS } from './data/mockData';
import { INITIAL_VALIDATION_RULES } from './data/defaultRules';
import { generateStructuredTaskPlan, processAllRecords, validateSingleRecord } from './services/workflowEngine';
import { createAuditEvent, INITIAL_AUDIT_LOGS } from './services/auditLogger';

import { TopNav } from './components/TopNav';
import { DashboardView } from './components/DashboardView';
import { WorkflowStudioView } from './components/WorkflowStudioView';
import { ReviewQueueView } from './components/ReviewQueueView';
import { ExecutionGateView } from './components/ExecutionGateView';
import { AuditTrailView } from './components/AuditTrailView';
import { BusinessRulesView } from './components/BusinessRulesView';
import { IntegrationsView } from './components/IntegrationsView';
import { InlineRecordEditorModal } from './components/InlineRecordEditorModal';

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [userRole, setUserRole] = useState<UserRole>('business_owner');

  // Datasets and workflow instruction
  const [allDatasets] = useState<DemoDataset[]>(DEMO_DATASETS);
  const [selectedDataset, setSelectedDataset] = useState<DemoDataset>(DEMO_DATASETS[0]);
  const [instruction, setInstruction] = useState<string>(DEMO_DATASETS[0].defaultPrompt);

  // Business rules state
  const [rules, setRules] = useState<ValidationRule[]>(INITIAL_VALIDATION_RULES);

  // Core execution and record state
  const [records, setRecords] = useState<BusinessRecord[]>(() => {
    return processAllRecords(DEMO_DATASETS[0].records, INITIAL_VALIDATION_RULES, DEMO_DATASETS[0].sourceName);
  });

  const [taskSteps, setTaskSteps] = useState<TaskStep[]>(() => {
    return generateStructuredTaskPlan(DEMO_DATASETS[0].defaultPrompt, DEMO_DATASETS[0].sourceName);
  });

  // Audit ledger state
  const [auditLogs, setAuditLogs] = useState<AuditEvent[]>(() => {
    const initialEvents = [...INITIAL_AUDIT_LOGS];
    initialEvents.unshift(
      createAuditEvent(
        'Ava Vance (Admin)',
        'business_owner',
        'INSTRUCTION_RECEIVED',
        'Workflow',
        'WF-INIT',
        `Initialized demo workflow for "${DEMO_DATASETS[0].title}".`,
        'info'
      )
    );
    return initialEvents;
  });

  // Connectors
  const [connectors, setConnectors] = useState<ConnectorInfo[]>(INITIAL_CONNECTORS);

  // Modal editor
  const [editingRecord, setEditingRecord] = useState<BusinessRecord | null>(null);

  // Async indicators
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDispatching, setIsDispatching] = useState(false);

  // Counts for badge navigation
  const pendingExceptionsCount = records.filter(
    r => r.validationStatus === 'exception' && r.reviewStatus !== 'approved'
  ).length;

  const stagedActionsCount = records.reduce(
    (acc, r) => acc + r.stagedActions.filter(a => a.status === 'staged' && a.recordId && r.reviewStatus !== 'rejected').length, 
    0
  );

  // Switch scenario
  const handleSelectScenario = (scenarioId: string) => {
    const found = allDatasets.find(d => d.id === scenarioId);
    if (!found) return;

    setSelectedDataset(found);
    setInstruction(found.defaultPrompt);

    const newRecords = processAllRecords(found.records, rules, found.sourceName);
    setRecords(newRecords);

    const newSteps = generateStructuredTaskPlan(found.defaultPrompt, found.sourceName);
    setTaskSteps(newSteps);

    const newAudit = createAuditEvent(
      userRole === 'business_owner' ? 'Alex Vance (Admin)' : 'Sarah Lin (Ops)',
      userRole,
      'INSTRUCTION_RECEIVED',
      'Workflow',
      found.id,
      `Loaded scenario "${found.title}". Parsed prompt: "${found.defaultPrompt.slice(0, 60)}..."`,
      'info'
    );
    setAuditLogs(prev => [newAudit, ...prev]);
  };

  // Re-run workflow plan & validation
  const handleGeneratePlanAndValidate = async () => {
    setIsProcessing(true);
    await new Promise(r => setTimeout(r, 400));

    const newSteps = generateStructuredTaskPlan(instruction, selectedDataset.sourceName);
    const newRecords = processAllRecords(selectedDataset.records, rules, selectedDataset.sourceName);

    setTaskSteps(newSteps);
    setRecords(newRecords);
    setIsProcessing(false);

    const exceptionsFound = newRecords.filter(r => r.validationStatus === 'exception').length;

    const planAudit = createAuditEvent(
      'AI Workflow Agent',
      'ai_agent',
      'PLAN_GENERATED',
      'Workflow',
      'PLAN_01',
      `Synthesized 8-step task plan. Evaluated ${newRecords.length} records: flagged ${exceptionsFound} exceptions requiring human sign-off.`,
      exceptionsFound > 0 ? 'warning' : 'info'
    );

    const gateAudit = createAuditEvent(
      'OpsGate Security Barrier',
      'ai_agent',
      'GATE_EXECUTION_BLOCKED',
      'Gate',
      'GATE_01',
      `Execution barrier armed. 0 external actions will be dispatched until operator authorization.`,
      'warning'
    );

    setAuditLogs(prev => [gateAudit, planAudit, ...prev]);
  };

  // User edits a record inline
  const handleSaveRecord = (recordId: string, updatedFields: Record<string, any>, reviewerNotes?: string) => {
    setRecords(prev => {
      return prev.map(rec => {
        if (rec.id !== recordId) return rec;

        // Re-validate this record with updated fields
        const allSimulated = prev.map(r => r.id === recordId ? { id: r.id, fields: updatedFields } : { id: r.id, fields: r.fields });
        const { validationStatus, confidenceScore, issues, stagedActions } = validateSingleRecord(
          recordId,
          updatedFields,
          allSimulated,
          rules,
          rec.sourceName
        );

        return {
          ...rec,
          fields: updatedFields,
          validationStatus: issues.length === 0 ? 'corrected' : validationStatus,
          confidenceScore,
          issues,
          reviewerNotes: reviewerNotes || rec.reviewerNotes,
          stagedActions,
        };
      });
    });

    const editAudit = createAuditEvent(
      userRole === 'business_owner' ? 'Alex Vance (Admin)' : 'Sarah Lin (Ops)',
      userRole,
      'RECORD_MANUALLY_EDITED',
      'Record',
      recordId,
      `Operator manually modified fields for record ${recordId}. Field values updated and re-validated.`,
      'info'
    );
    setAuditLogs(prev => [editAudit, ...prev]);
  };

  // User approves a single record
  const handleApproveRecord = (recordId: string, notes?: string) => {
    setRecords(prev => {
      return prev.map(rec => {
        if (rec.id !== recordId) return rec;
        return {
          ...rec,
          reviewStatus: 'approved',
          reviewedBy: userRole === 'business_owner' ? 'Alex Vance (Admin)' : 'Sarah Lin (Ops)',
          reviewedAt: new Date().toISOString(),
          reviewerNotes: notes || rec.reviewerNotes,
          stagedActions: rec.stagedActions.map(a => ({ ...a, status: 'approved' })),
        };
      });
    });

    const approvalAudit = createAuditEvent(
      userRole === 'business_owner' ? 'Alex Vance (Admin)' : 'Sarah Lin (Ops)',
      userRole,
      'HUMAN_APPROVAL_GRANTED',
      'Record',
      recordId,
      `Authorized execution for record ${recordId}. Staged actions released to execution gate ready-pool.`,
      'success'
    );
    setAuditLogs(prev => [approvalAudit, ...prev]);
  };

  // User rejects a record
  const handleRejectRecord = (recordId: string, reason: string) => {
    setRecords(prev => {
      return prev.map(rec => {
        if (rec.id !== recordId) return rec;
        return {
          ...rec,
          reviewStatus: 'rejected',
          reviewedBy: userRole === 'business_owner' ? 'Alex Vance (Admin)' : 'Sarah Lin (Ops)',
          reviewedAt: new Date().toISOString(),
          reviewerNotes: reason,
          stagedActions: rec.stagedActions.map(a => ({ ...a, status: 'blocked' })),
        };
      });
    });

    const rejectAudit = createAuditEvent(
      userRole === 'business_owner' ? 'Alex Vance (Admin)' : 'Sarah Lin (Ops)',
      userRole,
      'HUMAN_REJECTION_RECORDED',
      'Record',
      recordId,
      `Rejected record ${recordId}. Reason: "${reason}". Associated staged connector actions permanently blocked.`,
      'warning'
    );
    setAuditLogs(prev => [rejectAudit, ...prev]);
  };

  // Escalate record
  const handleEscalateRecord = (recordId: string, reason: string) => {
    setRecords(prev => {
      return prev.map(rec => {
        if (rec.id !== recordId) return rec;
        return {
          ...rec,
          reviewStatus: 'escalated',
          reviewerNotes: `ESCALATED: ${reason}`,
        };
      });
    });

    const escAudit = createAuditEvent(
      userRole === 'business_owner' ? 'Alex Vance (Admin)' : 'Sarah Lin (Ops)',
      userRole,
      'RULE_CONFIG_CHANGED',
      'Record',
      recordId,
      `Record ${recordId} escalated to senior administrative desk for policy exception review.`,
      'info'
    );
    setAuditLogs(prev => [escAudit, ...prev]);
  };

  // Batch approve all valid records
  const handleBatchApproveValid = () => {
    const validRecords = records.filter(
      r => (r.validationStatus === 'valid' || r.validationStatus === 'corrected') && r.reviewStatus !== 'approved'
    );

    if (validRecords.length === 0) return;

    setRecords(prev => {
      return prev.map(rec => {
        if (rec.validationStatus === 'valid' || rec.validationStatus === 'corrected') {
          return {
            ...rec,
            reviewStatus: 'approved',
            reviewedBy: userRole === 'business_owner' ? 'Alex Vance (Admin)' : 'Sarah Lin (Ops)',
            reviewedAt: new Date().toISOString(),
            stagedActions: rec.stagedActions.map(a => ({ ...a, status: 'approved' })),
          };
        }
        return rec;
      });
    });

    const batchAudit = createAuditEvent(
      userRole === 'business_owner' ? 'Alex Vance (Admin)' : 'Sarah Lin (Ops)',
      userRole,
      'HUMAN_APPROVAL_GRANTED',
      'Workflow',
      'BATCH_APPROVAL',
      `Batch authorized all ${validRecords.length} clean records (${validRecords.map(r => r.id).join(', ')}).`,
      'success'
    );
    setAuditLogs(prev => [batchAudit, ...prev]);
  };

  // Authorize & Dispatch from Execution Gate
  const handleAuthorizeAndDispatch = async (approvedActionIds: string[]) => {
    setIsDispatching(true);

    // Simulate network dispatch with realistic sequencing
    for (let i = 0; i < approvedActionIds.length; i++) {
      await new Promise(r => setTimeout(r, 350));
      const actionId = approvedActionIds[i];

      setRecords(prev => {
        return prev.map(rec => {
          return {
            ...rec,
            stagedActions: rec.stagedActions.map(act => {
              if (act.id === actionId) {
                const prefix = act.targetSystem.includes('HubSpot') ? 'HS_CONTACT_' : act.targetSystem.includes('SendGrid') ? 'SG_MSG_' : 'SLK_EVT_';
                return {
                  ...act,
                  status: 'dispatched',
                  dispatchedAt: new Date().toISOString(),
                  externalResponseId: `${prefix}${Math.floor(10000 + Math.random() * 90000)}`,
                };
              }
              return act;
            }),
          };
        });
      });
    }

    // Update connector counters
    setConnectors(prev => {
      return prev.map(conn => ({
        ...conn,
        executedActionsCount: conn.executedActionsCount + Math.floor(approvedActionIds.length / 2) + 1,
        lastPing: 'Just now',
      }));
    });

    // Mark task step 7 as executed
    setTaskSteps(prev => {
      return prev.map(step => {
        if (step.id === 'step_6') return { ...step, status: 'completed' };
        if (step.id === 'step_7') return { ...step, status: 'executed' };
        if (step.id === 'step_8') return { ...step, status: 'completed' };
        return step;
      });
    });

    const dispatchAudit = createAuditEvent(
      userRole === 'business_owner' ? 'Alex Vance (Admin)' : 'Sarah Lin (Ops)',
      userRole,
      'CONNECTOR_DISPATCHED',
      'Gate',
      'GATE_DISPATCH',
      `Executed ${approvedActionIds.length} approved actions across HubSpot, SendGrid, and Slack. All transactions verified 200 OK.`,
      'success'
    );

    const completeAudit = createAuditEvent(
      'System Audit Ledger',
      'ai_agent',
      'WORKFLOW_COMPLETED',
      'Workflow',
      'RUN_SUCCESS',
      `Workflow cycle concluded. Zero unauthorized records were dispatched. Audit ledger finalized.`,
      'success'
    );

    setAuditLogs(prev => [completeAudit, dispatchAudit, ...prev]);
    setIsDispatching(false);
  };

  // Toggle rule
  const handleToggleRule = (ruleId: string) => {
    const updated = rules.map(r => r.id === ruleId ? { ...r, enabled: !r.enabled } : r);
    setRules(updated);

    // Re-validate records with updated rule set
    const rechecked = processAllRecords(selectedDataset.records, updated, selectedDataset.sourceName);
    setRecords(rechecked);

    const ruleObj = rules.find(r => r.id === ruleId);
    const ruleAudit = createAuditEvent(
      userRole === 'business_owner' ? 'Alex Vance (Admin)' : 'Sarah Lin (Ops)',
      userRole,
      'RULE_CONFIG_CHANGED',
      'Rule',
      ruleId,
      `Rule "${ruleObj?.name}" was ${ruleObj?.enabled ? 'DISABLED' : 'ENABLED'}. Dataset records re-evaluated.`,
      'info'
    );
    setAuditLogs(prev => [ruleAudit, ...prev]);
  };

  // Add rule
  const handleAddRule = (newRuleData: Omit<ValidationRule, 'id'>) => {
    const id = `rule_custom_${Date.now()}`;
    const rule: ValidationRule = { id, ...newRuleData };
    const updated = [...rules, rule];
    setRules(updated);

    const rechecked = processAllRecords(selectedDataset.records, updated, selectedDataset.sourceName);
    setRecords(rechecked);

    const addAudit = createAuditEvent(
      userRole === 'business_owner' ? 'Alex Vance (Admin)' : 'Sarah Lin (Ops)',
      userRole,
      'RULE_CONFIG_CHANGED',
      'Rule',
      id,
      `Added custom rule "${rule.name}" targeting field "${rule.field}".`,
      'info'
    );
    setAuditLogs(prev => [addAudit, ...prev]);
  };

  // Test ping connector
  const handleTestConnectorPing = (connId: string) => {
    const conn = connectors.find(c => c.id === connId);
    setConnectors(prev => prev.map(c => c.id === connId ? { ...c, lastPing: 'Just now (<18ms)' } : c));

    const pingAudit = createAuditEvent(
      'OpsGate Health Prober',
      'ai_agent',
      'RULE_CONFIG_CHANGED',
      'Gate',
      connId,
      `Ping health test verified for connector "${conn?.name}". Gate write barriers remain intact.`,
      'info'
    );
    setAuditLogs(prev => [pingAudit, ...prev]);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      {/* 3-Zone Navigation Header */}
      <TopNav
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        userRole={userRole}
        onChangeRole={setUserRole}
        pendingExceptionsCount={pendingExceptionsCount}
        stagedActionsCount={stagedActionsCount}
      />

      {/* Main Workspace Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {currentTab === 'dashboard' && (
          <DashboardView
            records={records}
            auditLogs={auditLogs}
            rules={rules}
            connectors={connectors}
            onNavigateTab={setCurrentTab}
            onSelectScenario={handleSelectScenario}
          />
        )}

        {currentTab === 'studio' && (
          <WorkflowStudioView
            instruction={instruction}
            onChangeInstruction={setInstruction}
            selectedDataset={selectedDataset}
            allDatasets={allDatasets}
            onSelectDataset={handleSelectScenario}
            taskSteps={taskSteps}
            records={records}
            onGeneratePlanAndValidate={handleGeneratePlanAndValidate}
            onNavigateToReview={() => setCurrentTab('review')}
            isProcessing={isProcessing}
          />
        )}

        {currentTab === 'review' && (
          <ReviewQueueView
            records={records}
            onOpenRecordEditor={(rec) => setEditingRecord(rec)}
            onApproveRecord={handleApproveRecord}
            onRejectRecord={handleRejectRecord}
            onBatchApproveValid={handleBatchApproveValid}
            onNavigateToGate={() => setCurrentTab('gate')}
            userRole={userRole}
          />
        )}

        {currentTab === 'gate' && (
          <ExecutionGateView
            records={records}
            onAuthorizeAndDispatch={handleAuthorizeAndDispatch}
            onNavigateToAudit={() => setCurrentTab('audit')}
            userRole={userRole}
            isDispatching={isDispatching}
          />
        )}

        {currentTab === 'audit' && (
          <AuditTrailView
            auditLogs={auditLogs}
            userRole={userRole}
          />
        )}

        {currentTab === 'rules' && (
          <BusinessRulesView
            rules={rules}
            onToggleRule={handleToggleRule}
            onAddRule={handleAddRule}
            userRole={userRole}
          />
        )}

        {currentTab === 'integrations' && (
          <IntegrationsView
            connectors={connectors}
            onTestConnectorPing={handleTestConnectorPing}
            userRole={userRole}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 px-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800">OpsGate AI</span>
            <span>·</span>
            <span>Review-First Operations Orchestration</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400 font-mono text-[11px]">
            <span>Active Policy: HOLD_ALL_WRITES</span>
            <span>·</span>
            <span>Demomode Sandbox</span>
          </div>
        </div>
      </footer>

      {/* Inline Record Editor Modal */}
      {editingRecord && (
        <InlineRecordEditorModal
          record={editingRecord}
          onClose={() => setEditingRecord(null)}
          onSaveRecord={handleSaveRecord}
          onApproveRecord={handleApproveRecord}
          onRejectRecord={handleRejectRecord}
          onEscalateRecord={handleEscalateRecord}
        />
      )}
    </div>
  );
}

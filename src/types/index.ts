export type UserRole = 'business_owner' | 'ops_staff' | 'ai_agent';

export type WorkflowStatus = 
  | 'draft' 
  | 'planning' 
  | 'plan_ready' 
  | 'validating' 
  | 'review_required' 
  | 'approved' 
  | 'executing' 
  | 'completed' 
  | 'cancelled';

export type TaskStepType = 
  | 'ingest' 
  | 'validate' 
  | 'dedup' 
  | 'route_exception' 
  | 'stage_draft' 
  | 'human_gate' 
  | 'external_dispatch' 
  | 'audit_log';

export type ExternalImpact = 
  | 'none' 
  | 'internal_read' 
  | 'internal_write' 
  | 'staging_safe' 
  | 'external_write_gated';

export interface TaskStep {
  id: string;
  name: string;
  type: TaskStepType;
  targetSystem: string;
  rationale: string;
  status: 'pending' | 'in_progress' | 'completed' | 'blocked_at_gate' | 'approved' | 'executed' | 'skipped';
  requiresApproval: boolean;
  externalImpact: ExternalImpact;
  dependsOn?: string[];
  executionTimeMs?: number;
  outputSummary?: string;
}

export interface ValidationRule {
  id: string;
  name: string;
  description: string;
  field: string;
  ruleType: 'required' | 'email_rfc' | 'phone_format' | 'duplicate_check' | 'numeric_range' | 'custom_policy';
  severity: 'critical' | 'high' | 'medium' | 'low';
  enabled: boolean;
  params?: Record<string, any>;
}

export interface RecordIssue {
  ruleId: string;
  ruleName: string;
  field: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  message: string;
  suggestedFix?: string;
}

export interface StagedAction {
  id: string;
  recordId: string;
  actionType: 'create_crm_contact' | 'send_email' | 'post_slack_alert' | 'update_sheet_row' | 'stage_invoice';
  targetSystem: 'HubSpot CRM' | 'SendGrid / Gmail' | 'Slack #sales-ops' | 'Google Sheets' | 'QuickBooks';
  description: string;
  payload: Record<string, any>;
  status: 'staged' | 'blocked' | 'approved' | 'dispatched' | 'failed';
  requiresGateApproval: boolean;
  dispatchedAt?: string;
  externalResponseId?: string;
}

export interface BusinessRecord {
  id: string; // e.g. "L1001", "INV-882"
  sourceName: string;
  fields: Record<string, any>;
  validationStatus: 'valid' | 'exception' | 'corrected' | 'approved' | 'rejected';
  confidenceScore: number; // 0 - 100
  issues: RecordIssue[];
  reviewStatus: 'pending' | 'approved' | 'rejected' | 'escalated';
  reviewerNotes?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  stagedActions: StagedAction[];
}

export interface AuditEvent {
  id: string;
  seq: number;
  timestamp: string;
  actor: string;
  actorRole: UserRole;
  eventType: 
    | 'INSTRUCTION_RECEIVED'
    | 'PLAN_GENERATED'
    | 'DATA_LOADED'
    | 'RULE_VALIDATION_PASSED'
    | 'EXCEPTION_FLAGGED'
    | 'RECORD_MANUALLY_EDITED'
    | 'GATE_EXECUTION_BLOCKED'
    | 'HUMAN_APPROVAL_GRANTED'
    | 'HUMAN_REJECTION_RECORDED'
    | 'CONNECTOR_DISPATCHED'
    | 'RULE_CONFIG_CHANGED'
    | 'WORKFLOW_COMPLETED';
  objectType: 'Workflow' | 'Record' | 'Task' | 'Gate' | 'Rule';
  objectId: string;
  details: string;
  severity: 'info' | 'warning' | 'critical' | 'success';
  payloadSummary?: string;
  hash: string;
}

export interface ConnectorInfo {
  id: string;
  name: string;
  category: 'Spreadsheets' | 'CRM' | 'Email' | 'Messaging' | 'Accounting';
  status: 'connected' | 'gated' | 'ready';
  safetyPolicy: 'HOLD_ALL_WRITES_UNTIL_MANUAL_APPROVAL';
  lastPing: string;
  pendingActionsCount: number;
  executedActionsCount: number;
  iconName: string;
}

export interface DemoDataset {
  id: string;
  title: string;
  description: string;
  sourceType: string;
  sourceName: string;
  defaultPrompt: string;
  records: Array<{ id: string; fields: Record<string, any> }>;
}

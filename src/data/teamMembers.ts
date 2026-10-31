import { UserRole } from '../types';

export interface TeamMember {
  id: string;
  name: string;
  role: UserRole;
  title: string;
  department: string;
  clearance: string;
  avatar: string;
  avatarBg: string;
  email: string;
  status: string;
  bio: string;
  assignedQueues: string[];
  responsibilities: string[];
  kpiStats: Array<{
    id: string;
    label: string;
    value: string;
    change: string;
    trend: 'up' | 'down' | 'neutral';
    subtext: string;
  }>;
  priorityFilters: {
    recordTypes?: string[];
    minAmount?: number;
    statuses?: string[];
    isExceptionOnly?: boolean;
    requiresExecutiveSignoff?: boolean;
  };
}

export const TEAM_MEMBERS: TeamMember[] = [
  {
    id: 'alex_vance',
    name: 'Alex Vance',
    role: 'business_owner',
    title: 'Founder & Managing Director',
    department: 'Executive Governance & Capital Oversight',
    clearance: 'Level 4 (Executive Dispatcher)',
    avatar: 'AV',
    avatarBg: 'from-amber-400 to-amber-700',
    email: 'alex.vance@opsgate-capital.internal',
    status: 'Active (On Duty)',
    bio: 'Oversees organizational risk, capital exposure thresholds, and policy invariants. Holds sole authority to override executive gate write-barriers for payments exceeding $2,500.',
    assignedQueues: [
      'High-Capital Risk (> $2,500 Exposure)',
      'Executive Gate Final Authorization',
      'System-Wide Compliance & Audit Reviews',
      'Write-Barrier Breach Governance'
    ],
    responsibilities: [
      'Dual-authorization on all financial transactions > $2,500',
      'Approve external connector live write-dispatches',
      'Audit log tamper-evident cryptographic sign-off',
      'Define escalation thresholds and corporate policy rules'
    ],
    kpiStats: [
      {
        id: 'capital_gated',
        label: 'Capital Gated Behind Barrier',
        value: '$14,240',
        change: '+$3,800',
        trend: 'up',
        subtext: 'Held in staging pending executive sign-off'
      },
      {
        id: 'high_risk_exceptions',
        label: 'High-Risk Policy Items',
        value: '2 Flagged',
        change: '-1 from yesterday',
        trend: 'down',
        subtext: 'Requires Level 4 clearance sign-off'
      },
      {
        id: 'executive_overrides',
        label: 'Executive Gate Status',
        value: 'ARMED',
        change: '100% Barrier Integrity',
        trend: 'neutral',
        subtext: 'Zero writes leaked without approval'
      },
      {
        id: 'compliance_score',
        label: 'Audit Chain Integrity',
        value: '100.0%',
        change: 'SHA-256 Validated',
        trend: 'up',
        subtext: 'All event hashes verified & sealed'
      }
    ],
    priorityFilters: {
      requiresExecutiveSignoff: true,
      statuses: ['exception', 'pending'],
      minAmount: 2500
    }
  },
  {
    id: 'sarah_lin',
    name: 'Sarah Lin',
    role: 'ops_staff',
    title: 'Senior Operations Lead & Triage Specialist',
    department: 'Data Operations & Inbound Triage',
    clearance: 'Level 3 (Senior Operator & Rule Editor)',
    avatar: 'SL',
    avatarBg: 'from-emerald-400 to-teal-700',
    email: 'sarah.lin@opsgate-ops.internal',
    status: 'Active (On Duty)',
    bio: 'Directs the inbound data triage queue. Responsible for validating customer contact fields, resolving duplicate identities, and maintaining 99%+ record quality before staging.',
    assignedQueues: [
      'Customer Leads Intake & Enrichment',
      'Identity Deduplication Queue',
      'Missing Required Fields Triage',
      'Email / Phone Syntax Corrections'
    ],
    responsibilities: [
      'Review and manually resolve validation anomalies in inbound leads',
      'Merge or reject duplicate customer records',
      'Batch-approve clean rows with confidence score > 95%',
      'Calibrate deterministic validation rule thresholds'
    ],
    kpiStats: [
      {
        id: 'active_backlog',
        label: 'Inbound Review Backlog',
        value: '3 Pending',
        change: '-4 resolved today',
        trend: 'down',
        subtext: 'Avg triage time: 1.8 mins/record'
      },
      {
        id: 'data_quality',
        label: 'Clean Record Yield',
        value: '91.4%',
        change: '+4.2% this week',
        trend: 'up',
        subtext: 'Valid on initial ingest'
      },
      {
        id: 'duplicate_velocity',
        label: 'Duplicates Intercepted',
        value: '1 Intercepted',
        change: '100% prevented from CRM',
        trend: 'neutral',
        subtext: 'L1003 matched against L1001'
      },
      {
        id: 'manual_fixes',
        label: 'Manual In-Place Fixes',
        value: '12 Today',
        change: '+3 from yesterday',
        trend: 'up',
        subtext: 'RFC email & telephone normalizations'
      }
    ],
    priorityFilters: {
      recordTypes: ['lead', 'customer', 'intake'],
      isExceptionOnly: true
    }
  },
  {
    id: 'marcus_sterling',
    name: 'Marcus Sterling',
    role: 'ops_staff',
    title: 'Finance & Accounts Payable Controller',
    department: 'Finance & AP Governance',
    clearance: 'Level 3 (Finance Gatekeeper)',
    avatar: 'MS',
    avatarBg: 'from-amber-500 to-yellow-800',
    email: 'marcus.sterling@opsgate-finance.internal',
    status: 'Active (On Duty)',
    bio: 'Controls all incoming vendor bills, accounts payable records, credit memo reversals, and QuickBooks staging. Enforces dual-control limits on invoices exceeding $2,500.',
    assignedQueues: [
      'Accounts Payable & Vendor Invoices',
      'Negative or Zero Balance Audits',
      'Duplicate Vendor Bill Detection',
      'QuickBooks Batch Payment Staging'
    ],
    responsibilities: [
      'Audit vendor invoices for matching purchase orders',
      'Enforce anti-duplicate invoice protection',
      'Reject negative-value invoices or route for credit memo processing',
      'Stage authorized payables for QuickBooks connector dispatch'
    ],
    kpiStats: [
      {
        id: 'ap_staged',
        label: 'Staged AP for QuickBooks',
        value: '$8,365',
        change: '3 Bills Ready',
        trend: 'neutral',
        subtext: 'Pending gate release'
      },
      {
        id: 'high_value_bills',
        label: 'Bills > $2,500 Gated',
        value: '1 Gated',
        change: '$3,800 Acme Machine',
        trend: 'neutral',
        subtext: 'Awaiting Alex Vance dual-signoff'
      },
      {
        id: 'duplicate_bills',
        label: 'Duplicate Invoices Caught',
        value: '1 Caught',
        change: 'INV-883 duplicate flag',
        trend: 'down',
        subtext: 'Prevented double-payment hazard'
      },
      {
        id: 'ap_error_rate',
        label: 'Vendor Data Accuracy',
        value: '98.8%',
        change: '+0.5% vs Q3 benchmark',
        trend: 'up',
        subtext: 'Zero unauthorized payouts recorded'
      }
    ],
    priorityFilters: {
      recordTypes: ['invoice', 'vendor_bill', 'payable'],
      minAmount: 0
    }
  },
  {
    id: 'elena_rostova',
    name: 'Elena Rostova',
    role: 'ops_staff',
    title: 'Client Operations & Support Lead',
    department: 'Client Success & Escalations',
    clearance: 'Level 2 (Client Communications & Escalation Desk)',
    avatar: 'ER',
    avatarBg: 'from-purple-400 to-indigo-800',
    email: 'elena.rostova@opsgate-client.internal',
    status: 'Active (On Duty)',
    bio: 'Monitors customer service delivery exceptions, VIP account communications, order shipping discrepancies, and customer-facing email notification drafts.',
    assignedQueues: [
      'Customer Support Ticket Triage',
      'Missing Order / Delivery Inquiries',
      'VIP Account SLA Exception Escalations',
      'Client Notification Draft Staging'
    ],
    responsibilities: [
      'Review order numbers before outbound delivery notifications',
      'Screen AI-drafted customer email replies before transmission',
      'Escalate tier-1 SLA breaches to operations leadership',
      'Ensure tone and policy compliance across CRM communications'
    ],
    kpiStats: [
      {
        id: 'client_exceptions',
        label: 'Pending Inquiries Triage',
        value: '2 In Review',
        change: '1 VIP Account',
        trend: 'down',
        subtext: 'SLA deadline in 42 minutes'
      },
      {
        id: 'drafts_staged',
        label: 'Client Email Drafts Staged',
        value: '4 Drafts',
        change: '0 auto-sent (Gated)',
        trend: 'neutral',
        subtext: 'Awaiting operator verification'
      },
      {
        id: 'vip_coverage',
        label: 'VIP Account Protection',
        value: '100.0%',
        change: 'Zero SLA breaches',
        trend: 'up',
        subtext: 'Strict priority queueing active'
      },
      {
        id: 'avg_resolution',
        label: 'First-Touch Resolution',
        value: '94.2%',
        change: '+3.1% this month',
        trend: 'up',
        subtext: 'Review-first accuracy dividend'
      }
    ],
    priorityFilters: {
      recordTypes: ['ticket', 'support', 'order_inquiry']
    }
  },
  {
    id: 'opsgate_agent',
    name: 'OpsGate AI Agent',
    role: 'ai_agent',
    title: 'Autonomous Workflow Planner & Security Inspector',
    department: 'Automated Operations & Rule Governance',
    clearance: 'Level 1 (Deterministic Safety Gate & SHA-256 Sentry)',
    avatar: 'OG',
    avatarBg: 'from-amber-300 via-amber-500 to-amber-700',
    email: 'opsgate-agent@system.internal',
    status: 'Online (Continuous Monitoring)',
    bio: 'Continuous deterministic engine. Deconstructs plain-language business instructions into 8-step Directed Acyclic Graphs (DAGs), verifies invariants, and signs audit events with SHA-256 hashes.',
    assignedQueues: [
      'Automated Ingestion Pipeline (Sheets, CSVs)',
      'Deterministic RFC Validation Engine',
      'Execution Gate Write Barrier Invariants',
      'Immutable Cryptographic Ledger Hashing'
    ],
    responsibilities: [
      'Generate explainable task plans with target systems and rationale',
      'Enforce zero-write policy prior to explicit human authorization',
      'Compute confidence scores across incoming business records',
      'Seal every state transition with a cryptographic SHA-256 hash'
    ],
    kpiStats: [
      {
        id: 'invariants_verified',
        label: 'Security Barrier Invariants',
        value: '100% Held',
        change: '0 Unauthorized Writes',
        trend: 'up',
        subtext: 'Strict gate arming enforced'
      },
      {
        id: 'rules_evaluated',
        label: 'Rule Evaluations / Sec',
        value: '1,420 /s',
        change: '< 4ms latency',
        trend: 'up',
        subtext: 'Deterministic engine speed'
      },
      {
        id: 'hash_integrity',
        label: 'Cryptographic Chain Status',
        value: 'Valid & Sealed',
        change: 'SHA-256 Verified',
        trend: 'up',
        subtext: 'Immutable audit trail'
      },
      {
        id: 'task_steps',
        label: 'Active DAG Steps',
        value: '8 Steps',
        change: 'Fully Synchronized',
        trend: 'neutral',
        subtext: '1 gate, 1 external write barrier'
      }
    ],
    priorityFilters: {
      statuses: ['pending', 'exception', 'valid', 'approved']
    }
  }
];

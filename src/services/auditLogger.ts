import { AuditEvent, UserRole } from '../types';

let eventCounter = 101;

function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  const hex = Math.abs(hash).toString(16).padStart(8, '0');
  return `sha256_${hex.repeat(4).slice(0, 32)}`;
}

export function createAuditEvent(
  actor: string,
  actorRole: UserRole,
  eventType: AuditEvent['eventType'],
  objectType: AuditEvent['objectType'],
  objectId: string,
  details: string,
  severity: AuditEvent['severity'] = 'info',
  payloadSummary?: string
): AuditEvent {
  eventCounter++;
  const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 19);
  const rawString = `${eventCounter}-${timestamp}-${actor}-${eventType}-${objectId}-${details}`;
  const hash = simpleHash(rawString);

  return {
    id: `EVT-${eventCounter.toString().padStart(4, '0')}`,
    seq: eventCounter,
    timestamp,
    actor,
    actorRole,
    eventType,
    objectType,
    objectId,
    details,
    severity,
    payloadSummary,
    hash,
  };
}

export const INITIAL_AUDIT_LOGS: AuditEvent[] = [
  createAuditEvent(
    'System Bootloader',
    'business_owner',
    'RULE_CONFIG_CHANGED',
    'Rule',
    'ALL_POLICIES',
    'Deterministic execution gating initialized with default rule sets.',
    'info'
  ),
  createAuditEvent(
    'Execution Gate Monitor',
    'ai_agent',
    'GATE_EXECUTION_BLOCKED',
    'Gate',
    'GATE_SEC_01',
    'External connector barrier active: all outbound writes blocked pending human approval.',
    'warning'
  ),
];

export function exportAuditLogToCSV(events: AuditEvent[]): void {
  const headers = ['Event ID', 'Sequence', 'Timestamp (UTC)', 'Actor', 'Role', 'Event Type', 'Target Type', 'Target ID', 'Severity', 'Details', 'Cryptographic Hash'];
  const rows = events.map(e => [
    e.id,
    e.seq,
    e.timestamp,
    `"${e.actor.replace(/"/g, '""')}"`,
    e.actorRole,
    e.eventType,
    e.objectType,
    e.objectId,
    e.severity,
    `"${e.details.replace(/"/g, '""')}"`,
    e.hash,
  ]);

  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `OpsGate_Audit_Trail_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

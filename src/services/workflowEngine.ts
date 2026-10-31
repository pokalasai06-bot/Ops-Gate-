import { BusinessRecord, RecordIssue, StagedAction, TaskStep, ValidationRule } from '../types';

export function generateStructuredTaskPlan(
  instruction: string,
  sourceName: string
): TaskStep[] {
  const lower = instruction.toLowerCase();
  const isInvoice = lower.includes('invoice') || lower.includes('bill') || lower.includes('payable');
  const isTicket = lower.includes('ticket') || lower.includes('support') || lower.includes('complaint');

  const steps: TaskStep[] = [
    {
      id: 'step_1',
      name: 'Ingest Source Records',
      type: 'ingest',
      targetSystem: sourceName.includes('Sheet') ? 'Google Sheets' : 'CSV Ingestion Gateway',
      rationale: `Load raw business rows from "${sourceName}" into memory staging sandbox.`,
      status: 'completed',
      requiresApproval: false,
      externalImpact: 'internal_read',
      executionTimeMs: 120,
      outputSummary: 'Loaded rows into sandboxed memory.',
    },
    {
      id: 'step_2',
      name: 'Deterministic Quality & RFC Validation',
      type: 'validate',
      targetSystem: 'Validation Engine',
      rationale: 'Verify mandatory fields, format syntaxes (RFC 5322), and business range limits.',
      status: 'completed',
      requiresApproval: false,
      externalImpact: 'internal_read',
      dependsOn: ['step_1'],
      executionTimeMs: 180,
      outputSummary: 'Executed rule checks across all fields.',
    },
    {
      id: 'step_3',
      name: 'Cross-Record Duplicate Deduplication',
      type: 'dedup',
      targetSystem: 'Validation Engine',
      rationale: 'Identify cross-row collision of primary identifiers (emails, invoice numbers).',
      status: 'completed',
      requiresApproval: false,
      externalImpact: 'internal_read',
      dependsOn: ['step_2'],
      executionTimeMs: 95,
      outputSummary: 'Scanned for duplicate identifiers.',
    },
    {
      id: 'step_4',
      name: 'Route Exceptions to Human Review Queue',
      type: 'route_exception',
      targetSystem: 'Human Review Queue',
      rationale: 'Segregate non-compliant records for operator examination and inline correction.',
      status: 'completed',
      requiresApproval: false,
      externalImpact: 'internal_write',
      dependsOn: ['step_3'],
      executionTimeMs: 110,
      outputSummary: 'Separated clean records from exception items.',
    },
    {
      id: 'step_5',
      name: isInvoice 
        ? 'Stage Accounts Payable & Bill Drafts' 
        : isTicket 
          ? 'Draft Support Ticket Responses' 
          : 'Stage CRM Contact & Welcome Drafts',
      type: 'stage_draft',
      targetSystem: isInvoice ? 'QuickBooks Staging' : isTicket ? 'Zendesk Drafts' : 'HubSpot Staging',
      rationale: 'Construct outbound payloads in memory only. No external networks contacted.',
      status: 'completed',
      requiresApproval: false,
      externalImpact: 'staging_safe',
      dependsOn: ['step_4'],
      executionTimeMs: 240,
      outputSummary: 'Payloads assembled in isolated staging environment.',
    },
    {
      id: 'step_6',
      name: 'Execution Gate: Block External Dispatch',
      type: 'human_gate',
      targetSystem: 'OpsGate Security Barrier',
      rationale: 'STRICT ENFORCEMENT: Outbound write calls blocked until human supervisor signs off.',
      status: 'blocked_at_gate',
      requiresApproval: true,
      externalImpact: 'external_write_gated',
      dependsOn: ['step_5'],
      executionTimeMs: 0,
      outputSummary: 'Awaiting human sign-off.',
    },
    {
      id: 'step_7',
      name: isInvoice
        ? 'Dispatch Approved Bills to QuickBooks'
        : isTicket
          ? 'Send Customer Replies & Update SLA'
          : 'Dispatch to HubSpot & Send Welcome Emails',
      type: 'external_dispatch',
      targetSystem: isInvoice ? 'QuickBooks Online' : isTicket ? 'Zendesk Outbound' : 'HubSpot & SendGrid',
      rationale: 'Execute only approved records. Stays locked until approval gate is cleared.',
      status: 'pending',
      requiresApproval: true,
      externalImpact: 'external_write_gated',
      dependsOn: ['step_6'],
    },
    {
      id: 'step_8',
      name: 'Record Final Immutable Audit Ledger',
      type: 'audit_log',
      targetSystem: 'Audit Ledger Engine',
      rationale: 'Persist every action, operator decision, timestamp, and connector outcome into tamper-evident log.',
      status: 'pending',
      requiresApproval: false,
      externalImpact: 'internal_write',
      dependsOn: ['step_7'],
    },
  ];

  return steps;
}

export function validateSingleRecord(
  recordId: string,
  fields: Record<string, any>,
  allRecordsFields: Array<{ id: string; fields: Record<string, any> }>,
  rules: ValidationRule[],
  sourceName: string
): { validationStatus: BusinessRecord['validationStatus']; confidenceScore: number; issues: RecordIssue[]; stagedActions: StagedAction[] } {
  const issues: RecordIssue[] = [];
  let scoreDeduction = 0;

  // 1. Required field checks
  const emailRule = rules.find(r => r.id === 'rule_req_email' && r.enabled);
  if (emailRule && ('email' in fields)) {
    const val = (fields.email || '').toString().trim();
    if (!val) {
      issues.push({
        ruleId: emailRule.id,
        ruleName: emailRule.name,
        field: 'email',
        severity: 'critical',
        message: 'Missing mandatory email address. Cannot onboard customer or route email notifications.',
        suggestedFix: 'Provide a valid business email address (e.g. name@company.com).',
      });
      scoreDeduction += 50;
    }
  }

  // 2. RFC 5322 Email regex check
  const rfcRule = rules.find(r => r.id === 'rule_email_rfc' && r.enabled);
  if (rfcRule && ('email' in fields)) {
    const emailStr = (fields.email || '').toString().trim();
    if (emailStr) {
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(emailStr)) {
        issues.push({
          ruleId: rfcRule.id,
          ruleName: rfcRule.name,
          field: 'email',
          severity: 'high',
          message: `Malformed email syntax: "${emailStr}". Missing valid @ domain structure.`,
          suggestedFix: emailStr.includes('-at-') 
            ? `Change "-at-" to "@" and verify domain (e.g. ${emailStr.replace('-at-', '@')}.com)` 
            : 'Enter valid domain format: user@domain.com',
        });
        scoreDeduction += 35;
      }
    }
  }

  // 3. Duplicate check
  const dedupRule = rules.find(r => r.id === 'rule_lead_dedup' && r.enabled);
  if (dedupRule) {
    const emailVal = (fields.email || '').toString().trim().toLowerCase();
    const invoiceVal = (fields.invoice_no || '').toString().trim().toUpperCase();

    if (emailVal) {
      const duplicates = allRecordsFields.filter(
        r => r.id !== recordId && (r.fields.email || '').toString().trim().toLowerCase() === emailVal
      );
      if (duplicates.length > 0) {
        issues.push({
          ruleId: dedupRule.id,
          ruleName: dedupRule.name,
          field: 'email',
          severity: 'high',
          message: `Duplicate customer detected. Email "${emailVal}" is already registered in record ${duplicates[0].id}.`,
          suggestedFix: `Merge with existing customer ${duplicates[0].id} or update contact email.`,
        });
        scoreDeduction += 40;
      }
    }

    if (invoiceVal) {
      const duplicates = allRecordsFields.filter(
        r => r.id !== recordId && (r.fields.invoice_no || '').toString().trim().toUpperCase() === invoiceVal
      );
      if (duplicates.length > 0) {
        issues.push({
          ruleId: dedupRule.id,
          ruleName: 'Duplicate Invoice Check',
          field: 'invoice_no',
          severity: 'critical',
          message: `Duplicate invoice number detected: "${invoiceVal}" matches record ${duplicates[0].id}. High fraud risk.`,
          suggestedFix: 'Verify with supplier whether this is a re-submission or duplicate billing.',
        });
        scoreDeduction += 60;
      }
    }
  }

  // 4. Phone format check
  const phoneRule = rules.find(r => r.id === 'rule_phone_format' && r.enabled);
  if (phoneRule && fields.phone) {
    const rawDigits = (fields.phone || '').toString().replace(/\D/g, '');
    if (rawDigits.length > 0 && rawDigits.length < 7) {
      issues.push({
        ruleId: phoneRule.id,
        ruleName: phoneRule.name,
        field: 'phone',
        severity: 'medium',
        message: `Phone number "${fields.phone}" has fewer than 7 digits.`,
        suggestedFix: 'Update to full phone with area code or international dialer.',
      });
      scoreDeduction += 15;
    }
  }

  // 5. Positive financial values
  const nonNegRule = rules.find(r => r.id === 'rule_non_negative_amount' && r.enabled);
  if (nonNegRule && ('amount' in fields)) {
    const amt = parseFloat(fields.amount);
    if (!isNaN(amt) && amt <= 0) {
      issues.push({
        ruleId: nonNegRule.id,
        ruleName: nonNegRule.name,
        field: 'amount',
        severity: 'critical',
        message: `Negative or zero billing total: $${amt.toFixed(2)}. Invoices cannot possess negative balances.`,
        suggestedFix: 'Change to positive credit memo or correct billing amount.',
      });
      scoreDeduction += 60;
    }
  }

  // 6. Senior review threshold
  const thresholdRule = rules.find(r => r.id === 'rule_approval_threshold' && r.enabled);
  if (thresholdRule && ('amount' in fields)) {
    const amt = parseFloat(fields.amount);
    const limit = thresholdRule.params?.threshold || 2500;
    if (!isNaN(amt) && amt > limit) {
      issues.push({
        ruleId: thresholdRule.id,
        ruleName: thresholdRule.name,
        field: 'amount',
        severity: 'medium',
        message: `Invoice amount $${amt.toLocaleString()} exceeds policy threshold ($${limit.toLocaleString()}). Requires executive authorization.`,
        suggestedFix: 'Route to senior finance director for secondary authorization.',
      });
      scoreDeduction += 10;
    }
  }

  // Calculate final confidence score
  const confidenceScore = Math.max(0, 100 - scoreDeduction);
  const validationStatus: BusinessRecord['validationStatus'] = 
    issues.length === 0 ? 'valid' : 'exception';

  // Construct Staged Actions (simulated payloads staged safely in memory)
  const stagedActions: StagedAction[] = [];
  const customerName = fields.customer_name || 'Customer';
  const email = fields.email || '';

  if (sourceName.toLowerCase().includes('lead') || 'deal_size' in fields) {
    stagedActions.push({
      id: `act_${recordId}_crm`,
      recordId,
      actionType: 'create_crm_contact',
      targetSystem: 'HubSpot CRM',
      description: `Create qualified lead for "${customerName}" (${fields.company || 'Enterprise'})`,
      payload: {
        properties: {
          firstname: customerName.split(' ')[0] || '',
          lastname: customerName.split(' ').slice(1).join(' ') || '',
          email: email,
          phone: fields.phone || '',
          company: fields.company || '',
          lead_status: 'OPEN_QUALIFIED',
          estimated_value: fields.deal_size || '$0',
        },
      },
      status: 'staged',
      requiresGateApproval: true,
    });

    stagedActions.push({
      id: `act_${recordId}_email`,
      recordId,
      actionType: 'send_email',
      targetSystem: 'SendGrid / Gmail',
      description: `Send automated welcome sequence to "${customerName}" <${email}>`,
      payload: {
        to: email,
        subject: `Welcome to OpsGate Partner Network, ${customerName}!`,
        template: 'onboarding_welcome_v2',
        sender: 'sales@opsgate.enterprise.com',
      },
      status: 'staged',
      requiresGateApproval: true,
    });

    stagedActions.push({
      id: `act_${recordId}_slack`,
      recordId,
      actionType: 'post_slack_alert',
      targetSystem: 'Slack #sales-ops',
      description: `Post inbound notification to #sales-leads for ${customerName}`,
      payload: {
        channel: '#sales-leads',
        text: `🚀 New Lead: *${customerName}* (${fields.company || 'New Partner'}) - Size: ${fields.deal_size || 'N/A'}`,
      },
      status: 'staged',
      requiresGateApproval: true,
    });
  } else if (sourceName.toLowerCase().includes('invoice') || 'invoice_no' in fields) {
    stagedActions.push({
      id: `act_${recordId}_qb`,
      recordId,
      actionType: 'stage_invoice',
      targetSystem: 'QuickBooks',
      description: `Stage vendor bill ${fields.invoice_no} ($${fields.amount}) in Accounts Payable`,
      payload: {
        vendorName: customerName,
        invoiceNumber: fields.invoice_no,
        amountDue: fields.amount,
        dueDate: fields.due_date,
        lineItem: fields.category || 'General Operations',
      },
      status: 'staged',
      requiresGateApproval: true,
    });
  } else {
    stagedActions.push({
      id: `act_${recordId}_reply`,
      recordId,
      actionType: 'send_email',
      targetSystem: 'SendGrid / Gmail',
      description: `Send ticket acknowledgment to ${email}`,
      payload: {
        to: email,
        subject: `Support Case #${recordId}: Ticket Received`,
        ticketDetails: fields.issue_type || 'Support Request',
      },
      status: 'staged',
      requiresGateApproval: true,
    });
  }

  return { validationStatus, confidenceScore, issues, stagedActions };
}

export function processAllRecords(
  rawRecords: Array<{ id: string; fields: Record<string, any> }>,
  rules: ValidationRule[],
  sourceName: string
): BusinessRecord[] {
  return rawRecords.map(raw => {
    const { validationStatus, confidenceScore, issues, stagedActions } = validateSingleRecord(
      raw.id,
      raw.fields,
      rawRecords,
      rules,
      sourceName
    );

    return {
      id: raw.id,
      sourceName,
      fields: { ...raw.fields },
      validationStatus,
      confidenceScore,
      issues,
      reviewStatus: 'pending',
      stagedActions,
    };
  });
}

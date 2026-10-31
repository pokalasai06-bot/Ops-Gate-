import { ConnectorInfo, DemoDataset } from '../types';

export const DEMO_DATASETS: DemoDataset[] = [
  {
    id: 'leads_spreadsheet',
    title: 'Customer Leads Intake (Google Sheet)',
    description: 'Fresh inbound inquiries from marketing campaigns waiting for CRM onboarding and welcome outreach.',
    sourceType: 'Google Sheets',
    sourceName: 'Sheet1: Q4 Inbound Leads.xlsx',
    defaultPrompt: 'Review new customer leads in the spreadsheet. Validate emails and duplicates. Create a CRM draft for valid leads, prepare welcome emails, and notify sales. Do not send anything externally until approved.',
    records: [
      {
        id: 'L1001',
        fields: {
          customer_name: 'Ava Chen',
          email: 'ava@acmesupplies.co',
          phone: '+1 (555) 234-5678',
          company: 'Acme Supplies Co',
          status: 'New',
          deal_size: '$4,200',
        },
      },
      {
        id: 'L1002',
        fields: {
          customer_name: 'Marcus Vance',
          email: '', // MISSING EMAIL
          phone: '+1 (555) 345-6789',
          company: 'Vance Logistics',
          status: 'Inquiry',
          deal_size: '$1,850',
        },
      },
      {
        id: 'L1003',
        fields: {
          customer_name: 'Ava Chen',
          email: 'ava@acmesupplies.co', // DUPLICATE OF L1001
          phone: '+1 (555) 234-5678',
          company: 'Acme Supplies Ltd',
          status: 'New',
          deal_size: '$4,200',
        },
      },
      {
        id: 'L1004',
        fields: {
          customer_name: 'Priya Sharma',
          email: 'priya.sharma-at-globex', // MALFORMED EMAIL
          phone: '+1 (555) 890-1234',
          company: 'Globex Corp',
          status: 'Lead',
          deal_size: '$6,400',
        },
      },
      {
        id: 'L1005',
        fields: {
          customer_name: "Liam O'Connor",
          email: 'liam@apexindustrial.ie',
          phone: '+353 1 234 5678',
          company: 'Apex Industrial',
          status: 'Qualified',
          deal_size: '$8,900',
        },
      },
    ],
  },
  {
    id: 'vendor_invoices',
    title: 'Accounts Payable & Vendor Invoices',
    description: 'Pending supplier invoices requiring validation, tax ID check, and payment scheduling.',
    sourceType: 'Accounting CSV',
    sourceName: 'Oct_2026_Vendor_Bills.csv',
    defaultPrompt: 'Audit incoming vendor bills. Verify positive amounts, check for duplicate invoice numbers, flag any payment over $2,500 for owner review, and prepare QuickBooks payment drafts.',
    records: [
      {
        id: 'INV-881',
        fields: {
          customer_name: 'CloudScale Hosting LLC',
          email: 'billing@cloudscale.net',
          phone: '+1 (555) 777-1020',
          invoice_no: 'CS-2026-901',
          amount: 640.0,
          due_date: '2026-11-15',
          category: 'Infrastructure',
        },
      },
      {
        id: 'INV-882',
        fields: {
          customer_name: 'Metro Office Supplies',
          email: 'accounts@metrosupplies.com',
          phone: '+1 (555) 321-9988',
          invoice_no: 'MOS-4410',
          amount: 1450.0,
          due_date: '2026-11-10',
          category: 'Office Supplies',
        },
      },
      {
        id: 'INV-883',
        fields: {
          customer_name: 'Metro Office Supplies',
          email: 'accounts@metrosupplies.com',
          phone: '+1 (555) 321-9988',
          invoice_no: 'MOS-4410', // DUPLICATE INVOICE NUMBER
          amount: 1450.0,
          due_date: '2026-11-10',
          category: 'Office Supplies',
        },
      },
      {
        id: 'INV-884',
        fields: {
          customer_name: 'Apex Equipment Rentals',
          email: 'invoicing@apexequip.org',
          phone: '+1 (555) 444-2211',
          invoice_no: 'AER-1092',
          amount: -320.0, // NEGATIVE AMOUNT ERROR
          due_date: '2026-11-05',
          category: 'Equipment',
        },
      },
      {
        id: 'INV-885',
        fields: {
          customer_name: 'Stratton Legal Partners',
          email: 'remittance@strattonlegal.law',
          phone: '+1 (555) 600-8800',
          invoice_no: 'SLP-803',
          amount: 4800.0, // OVER $2,500 THRESHOLD
          due_date: '2026-11-20',
          category: 'Legal Advisory',
        },
      },
    ],
  },
  {
    id: 'support_tickets',
    title: 'Support Escalations & Order Dispatch',
    description: 'Inbound customer complaints and missing delivery tickets requiring order verification before response.',
    sourceType: 'Zendesk Export',
    sourceName: 'Daily_Support_Queue.json',
    defaultPrompt: 'Triage customer support tickets. Validate email and order IDs, flag urgent escalation tags, draft email replies, and hold all outbound replies until customer service lead signs off.',
    records: [
      {
        id: 'TKT-201',
        fields: {
          customer_name: 'Elena Rostova',
          email: 'elena@rostovadesign.co',
          phone: '+1 (555) 911-0022',
          order_id: 'ORD-7740',
          issue_type: 'Delayed Delivery',
          priority: 'Urgent',
        },
      },
      {
        id: 'TKT-202',
        fields: {
          customer_name: 'Tariq Al-Mansoor',
          email: 'tariq.mansoor-invalid', // INVALID EMAIL
          phone: '+1 (555) 888-3344',
          order_id: 'ORD-7742',
          issue_type: 'Return Request',
          priority: 'Normal',
        },
      },
      {
        id: 'TKT-203',
        fields: {
          customer_name: 'Sophie Martin',
          email: 'sophie.m@atelier.fr',
          phone: '+33 1 42 68 55 00',
          order_id: '', // MISSING ORDER ID
          issue_type: 'Missing Tracking Info',
          priority: 'High',
        },
      },
      {
        id: 'TKT-204',
        fields: {
          customer_name: 'David Kim',
          email: 'david.kim@seoultech.io',
          phone: '+1 (555) 432-1199',
          order_id: 'ORD-7748',
          issue_type: 'Billing Inquiry',
          priority: 'Normal',
        },
      },
    ],
  },
];

export const INITIAL_CONNECTORS: ConnectorInfo[] = [
  {
    id: 'conn_sheets',
    name: 'Google Sheets / Excel',
    category: 'Spreadsheets',
    status: 'connected',
    safetyPolicy: 'HOLD_ALL_WRITES_UNTIL_MANUAL_APPROVAL',
    lastPing: 'Just now',
    pendingActionsCount: 0,
    executedActionsCount: 14,
    iconName: 'FileSpreadsheet',
  },
  {
    id: 'conn_hubspot',
    name: 'HubSpot CRM',
    category: 'CRM',
    status: 'gated',
    safetyPolicy: 'HOLD_ALL_WRITES_UNTIL_MANUAL_APPROVAL',
    lastPing: '2 mins ago',
    pendingActionsCount: 0,
    executedActionsCount: 28,
    iconName: 'UserCheck',
  },
  {
    id: 'conn_sendgrid',
    name: 'SendGrid / Gmail Outreach',
    category: 'Email',
    status: 'gated',
    safetyPolicy: 'HOLD_ALL_WRITES_UNTIL_MANUAL_APPROVAL',
    lastPing: '1 min ago',
    pendingActionsCount: 0,
    executedActionsCount: 42,
    iconName: 'Mail',
  },
  {
    id: 'conn_slack',
    name: 'Slack #operations-alerts',
    category: 'Messaging',
    status: 'gated',
    safetyPolicy: 'HOLD_ALL_WRITES_UNTIL_MANUAL_APPROVAL',
    lastPing: 'Active',
    pendingActionsCount: 0,
    executedActionsCount: 19,
    iconName: 'MessageSquare',
  },
  {
    id: 'conn_quickbooks',
    name: 'QuickBooks Online',
    category: 'Accounting',
    status: 'gated',
    safetyPolicy: 'HOLD_ALL_WRITES_UNTIL_MANUAL_APPROVAL',
    lastPing: '4 mins ago',
    pendingActionsCount: 0,
    executedActionsCount: 9,
    iconName: 'Receipt',
  },
];

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// In-memory team personas definitions
const TEAM_MEMBERS = [
  {
    id: 'alex_vance',
    name: 'Alex Vance',
    role: 'business_owner',
    title: 'Founder & Managing Director',
    department: 'Executive Governance & Capital Risk',
    clearance: 'Level 4 (Executive Dispatcher)',
    avatar: 'AV',
    email: 'alex.vance@opsgate-capital.internal',
    status: 'Active (On Duty)',
    assignedQueues: ['Capital Risk > $2,500', 'Executive Gate Authorization', 'Write-Barrier Governance'],
  },
  {
    id: 'sarah_lin',
    name: 'Sarah Lin',
    role: 'ops_staff',
    title: 'Senior Operations Lead & Triage Specialist',
    department: 'Data Operations & Inbound Triage',
    clearance: 'Level 3 (Senior Operator)',
    avatar: 'SL',
    email: 'sarah.lin@opsgate-ops.internal',
    status: 'Active (On Duty)',
    assignedQueues: ['Customer Leads Intake', 'Duplicate Resolution Queue', 'Field Format Errors'],
  },
  {
    id: 'marcus_sterling',
    name: 'Marcus Sterling',
    role: 'ops_staff',
    title: 'Finance & Accounts Payable Controller',
    department: 'Finance & Treasury Operations',
    clearance: 'Level 3 (Finance Gatekeeper)',
    avatar: 'MS',
    email: 'marcus.sterling@opsgate-finance.internal',
    status: 'Active (On Duty)',
    assignedQueues: ['Vendor Invoices & Bills', 'Invoices > $2,500 Dual-Control', 'QuickBooks Batch Staging'],
  },
  {
    id: 'elena_rostova',
    name: 'Elena Rostova',
    role: 'ops_staff',
    title: 'Client Operations & Support Lead',
    department: 'Client Success & Escalations',
    clearance: 'Level 2 (Client Communications)',
    avatar: 'ER',
    email: 'elena.rostova@opsgate-client.internal',
    status: 'Active (On Duty)',
    assignedQueues: ['VIP Client Inquiries', 'Order Exception Triage', 'Customer Communication Staging'],
  },
  {
    id: 'opsgate_agent',
    name: 'OpsGate AI Agent',
    role: 'ai_agent',
    title: 'Autonomous Workflow Planner & Security Inspector',
    department: 'Automated Operations & Rule Governance',
    clearance: 'Level 1 (Deterministic Safety Gate)',
    avatar: 'OG',
    email: 'opsgate-agent@system.internal',
    status: 'Online (Continuous Monitoring)',
    assignedQueues: ['Task DAG Synthesis', 'Deterministic Validation Engine', 'Cryptographic SHA-256 Chaining'],
  },
];

// Health endpoint
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'healthy',
    system: 'OpsGate AI - Review-First Operations Orchestration',
    gateArmed: true,
    policy: 'HOLD_ALL_WRITES_UNTIL_MANUAL_APPROVAL',
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
  });
});

// Team members list
app.get('/api/team', (_req, res) => {
  res.json({
    count: TEAM_MEMBERS.length,
    members: TEAM_MEMBERS,
  });
});

// Person-specific dashboard endpoint
app.get('/api/dashboards/:personId', (req, res) => {
  const { personId } = req.params;
  const member = TEAM_MEMBERS.find(m => m.id === personId);
  if (!member) {
    return res.status(404).json({ error: `Team member '${personId}' not found.` });
  }

  res.json({
    member,
    generatedAt: new Date().toISOString(),
    gatePolicy: 'HOLD_ALL_WRITES',
  });
});

// Setup Vite middleware in dev or static files in production
async function bootstrap() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[OpsGate AI] Server listening on http://0.0.0.0:${PORT} (env: ${isProd ? 'production' : 'development'})`);
  });
}

bootstrap().catch((err) => {
  console.error('[OpsGate AI] Failed to start server:', err);
  process.exit(1);
});

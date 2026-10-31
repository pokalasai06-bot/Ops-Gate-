import React, { useState } from 'react';
import { ConnectorInfo, UserRole } from '../types';
import { 
  FileSpreadsheet, 
  UserCheck, 
  Mail, 
  MessageSquare, 
  Receipt, 
  ShieldCheck, 
  ShieldAlert, 
  CheckCircle2, 
  RefreshCw,
  ExternalLink,
  Lock
} from 'lucide-react';

interface IntegrationsViewProps {
  connectors: ConnectorInfo[];
  onTestConnectorPing: (connectorId: string) => void;
  userRole: UserRole;
}

export const IntegrationsView: React.FC<IntegrationsViewProps> = ({
  connectors,
  onTestConnectorPing,
  userRole,
}) => {
  const [testingId, setTestingId] = useState<string | null>(null);

  const getIcon = (name: string) => {
    switch (name) {
      case 'FileSpreadsheet':
        return <FileSpreadsheet className="w-5 h-5 text-blue-700" />;
      case 'UserCheck':
        return <UserCheck className="w-5 h-5 text-amber-700" />;
      case 'Mail':
        return <Mail className="w-5 h-5 text-indigo-700" />;
      case 'MessageSquare':
        return <MessageSquare className="w-5 h-5 text-emerald-700" />;
      case 'Receipt':
        return <Receipt className="w-5 h-5 text-rose-700" />;
      default:
        return <FileSpreadsheet className="w-5 h-5 text-slate-700" />;
    }
  };

  const handleTest = async (connId: string) => {
    setTestingId(connId);
    await new Promise(r => setTimeout(r, 600));
    onTestConnectorPing(connId);
    setTestingId(null);
  };

  return (
    <div className="space-y-6 relative">
      {/* Background ambient lighting */}
      <div className="absolute top-10 right-1/4 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-normal text-white" style={{ fontFamily: 'var(--font-serif)' }}>
          External Connectors & Security Policy
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Connected enterprise systems. Every outbound integration is permanently bound to the execution gate barrier.
        </p>
      </div>

      {/* Safety Policy Banner - Luxury Obsidian Vault */}
      <div className="luxury-card p-6 rounded-2xl border-amber-400/40 flex items-start gap-4 text-xs">
        <div className="w-10 h-10 rounded-xl bg-amber-950/60 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0 mt-0.5 shadow-md">
          <Lock className="w-5 h-5 text-amber-400" />
        </div>
        <div>
          <div className="font-bold text-sm text-white">
            Enforced Institutional Policy: No Autonomous Outbound Writes
          </div>
          <div className="mt-1.5 leading-relaxed text-slate-300 font-light">
            All write permissions to HubSpot, SendGrid, Slack, and QuickBooks are isolated. The system architecture prevents any API token from being invoked without an explicit human approval reference recorded in the cryptographic audit log.
          </div>
        </div>
      </div>

      {/* Connectors List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {connectors.map((conn) => {
          const isTesting = testingId === conn.id;

          return (
            <div
              key={conn.id}
              className="luxury-card rounded-2xl p-5 hover:border-amber-400/40 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-xl bg-slate-950/80 border border-white/10 flex items-center justify-center shrink-0 shadow-inner shadow-black/50">
                      {getIcon(conn.iconName)}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white">
                        {conn.name}
                      </h3>
                      <span className="text-xs text-amber-200/60 font-mono">
                        Category: {conn.category}
                      </span>
                    </div>
                  </div>

                  <span className="text-[11px] font-mono font-semibold px-2.5 py-0.5 rounded-full bg-emerald-950/60 text-emerald-300 border border-emerald-500/40">
                    Connected
                  </span>
                </div>

                <div className="mt-5 space-y-2.5 text-xs font-mono">
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Gate Policy:</span>
                    <span className="font-semibold text-amber-300">
                      HOLD_ALL_WRITES
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Lifetime Dispatched:</span>
                    <span className="tabular-nums text-white font-medium">
                      {conn.executedActionsCount} actions
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Health Ping:</span>
                    <span className="text-slate-300">
                      {conn.lastPing}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-3.5 border-t border-white/10 flex items-center justify-between">
                <span className="text-xs text-slate-500 font-mono">
                  Isolated Sandbox Active
                </span>
                <button
                  disabled={isTesting}
                  onClick={() => handleTest(conn.id)}
                  className="px-3.5 py-1.5 text-xs font-medium text-amber-200 bg-slate-900 border border-amber-500/30 hover:border-amber-400 hover:bg-slate-800 rounded-xl transition-all flex items-center gap-1.5 shadow-xs"
                >
                  <RefreshCw className={`w-3.5 h-3.5 text-amber-400 ${isTesting ? 'animate-spin' : ''}`} />
                  <span>{isTesting ? 'Pinging...' : 'Test Connection'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

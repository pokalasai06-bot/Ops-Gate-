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
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
          External Connectors & Security Policy
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 mt-1">
          Connected business tools. Every outbound integration is permanently bound to the execution gate barrier.
        </p>
      </div>

      {/* Safety Policy Banner */}
      <div className="p-5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-3.5 text-xs">
        <Lock className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        <div>
          <div className="font-bold text-sm text-amber-950">
            Enforced Policy: No Direct Outbound Writes
          </div>
          <div className="mt-1 leading-relaxed text-amber-900">
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
              className="bg-white border border-slate-200 rounded-xl p-5 hover:border-slate-300 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                      {getIcon(conn.iconName)}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900">
                        {conn.name}
                      </h3>
                      <span className="text-xs text-slate-500 font-mono">
                        Category: {conn.category}
                      </span>
                    </div>
                  </div>

                  <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                    Connected
                  </span>
                </div>

                <div className="mt-5 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-slate-600">
                    <span>Gate Policy:</span>
                    <span className="font-mono font-semibold text-amber-800">
                      HOLD_ALL_WRITES
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600">
                    <span>Lifetime Dispatched:</span>
                    <span className="font-mono tabular-nums text-slate-900 font-medium">
                      {conn.executedActionsCount} actions
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600">
                    <span>Health Check:</span>
                    <span className="text-slate-500 font-mono">
                      {conn.lastPing}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-400 font-mono">
                  Sandbox active
                </span>
                <button
                  disabled={isTesting}
                  onClick={() => handleTest(conn.id)}
                  className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors flex items-center gap-1.5"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
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

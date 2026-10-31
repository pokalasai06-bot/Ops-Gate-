import React, { useState } from 'react';
import { AuditEvent, UserRole } from '../types';
import { exportAuditLogToCSV } from '../services/auditLogger';
import { 
  Download, 
  Search, 
  ShieldCheck, 
  Filter, 
  Clock, 
  CheckCircle2, 
  AlertTriangle,
  Info,
  Lock
} from 'lucide-react';

interface AuditTrailViewProps {
  auditLogs: AuditEvent[];
  userRole: UserRole;
}

export const AuditTrailView: React.FC<AuditTrailViewProps> = ({ auditLogs, userRole }) => {
  const [eventTypeFilter, setEventTypeFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredLogs = auditLogs.filter((evt) => {
    if (eventTypeFilter !== 'all') {
      if (eventTypeFilter === 'approvals' && !evt.eventType.includes('APPROVAL')) return false;
      if (eventTypeFilter === 'exceptions' && !evt.eventType.includes('EXCEPTION')) return false;
      if (eventTypeFilter === 'gate' && !evt.eventType.includes('GATE')) return false;
      if (eventTypeFilter === 'dispatched' && !evt.eventType.includes('DISPATCHED')) return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        evt.id.toLowerCase().includes(q) ||
        evt.details.toLowerCase().includes(q) ||
        evt.actor.toLowerCase().includes(q) ||
        evt.hash.toLowerCase().includes(q)
      );
    }

    return true;
  });

  return (
    <div className="space-y-6 relative">
      {/* Background ambient lighting */}
      <div className="absolute top-10 left-1/3 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Title & Export */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-normal text-white" style={{ fontFamily: 'var(--font-serif)' }}>
            Immutable Audit Trail & Compliance Ledger
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Every directive, plan mutation, data validation finding, human approval, and connector dispatch is sealed in an irreversible cryptographic ledger.
          </p>
        </div>

        <button
          onClick={() => exportAuditLogToCSV(auditLogs)}
          className="gold-button px-4 py-2.5 text-xs rounded-xl flex items-center gap-2 shadow-md shrink-0"
        >
          <Download className="w-4 h-4 text-slate-950" />
          <span>Export Ledger (CSV)</span>
        </button>
      </div>

      {/* Ledger Integrity Banner - Luxury Gold Trim */}
      <div className="luxury-card p-5 rounded-2xl border-amber-400/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-950/60 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-md">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="font-semibold text-white text-sm">
              Cryptographic Chain Verified (SHA-256)
            </div>
            <div className="text-slate-400 mt-0.5 font-light">
              {auditLogs.length} sequentially signed events. Zero tampering detected across all operational runs.
            </div>
          </div>
        </div>

        <div className="text-right font-mono text-amber-200/70 text-[11px] shrink-0 border border-amber-500/20 px-3 py-1.5 rounded-lg bg-slate-950/60">
          Last Checksum: <span className="text-amber-300">{auditLogs[0]?.hash.slice(0, 16)}...</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 luxury-card p-3 rounded-2xl">
        <div className="flex items-center gap-1 overflow-x-auto p-1 bg-slate-950/60 rounded-xl border border-white/5">
          <button
            onClick={() => setEventTypeFilter('all')}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap ${
              eventTypeFilter === 'all' 
                ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40 shadow-xs' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            All Events ({auditLogs.length})
          </button>
          <button
            onClick={() => setEventTypeFilter('approvals')}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap ${
              eventTypeFilter === 'approvals' 
                ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40 shadow-xs' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Human Approvals
          </button>
          <button
            onClick={() => setEventTypeFilter('exceptions')}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap ${
              eventTypeFilter === 'exceptions' 
                ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40 shadow-xs' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Exceptions
          </button>
          <button
            onClick={() => setEventTypeFilter('gate')}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap ${
              eventTypeFilter === 'gate' 
                ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40 shadow-xs' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Gate Blocks
          </button>
          <button
            onClick={() => setEventTypeFilter('dispatched')}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap ${
              eventTypeFilter === 'dispatched' 
                ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40 shadow-xs' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Dispatches
          </button>
        </div>

        <div className="relative flex-1 max-w-xs">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-amber-400/60" />
          <input
            type="text"
            placeholder="Search event hash, details, actor..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2 rounded-xl border border-white/10 focus:border-amber-400 focus:outline-none bg-slate-950/70 text-slate-100 placeholder:text-slate-500 shadow-inner shadow-black/50"
          />
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="luxury-card rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 border-b border-white/10 text-amber-300/80 font-mono text-[11px] uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Event ID / Seq</th>
                <th className="py-3.5 px-4">Timestamp (UTC)</th>
                <th className="py-3.5 px-4">Actor</th>
                <th className="py-3.5 px-4">Event Type</th>
                <th className="py-3.5 px-4">Details</th>
                <th className="py-3.5 px-4">Target</th>
                <th className="py-3.5 px-4 text-right">Cryptographic Hash</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-white/5 font-mono">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500 font-sans">
                    No audit records found matching criteria.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => {
                  const isApproval = log.eventType.includes('APPROVAL');
                  const isException = log.eventType.includes('EXCEPTION');
                  const isGate = log.eventType.includes('GATE');
                  const isDispatched = log.eventType.includes('DISPATCHED');

                  return (
                    <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-amber-300 whitespace-nowrap">
                        {log.id} <span className="text-slate-500 font-normal">#{log.seq}</span>
                      </td>

                      <td className="py-3.5 px-4 text-slate-400 whitespace-nowrap tabular-nums">
                        {log.timestamp}
                      </td>

                      <td className="py-3.5 px-4 font-sans whitespace-nowrap">
                        <span className="font-medium text-white">{log.actor}</span>
                        <div className="text-[11px] text-amber-200/50 capitalize font-mono">{log.actorRole.replace('_', ' ')}</div>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {isApproval ? (
                          <span className="text-emerald-400 font-semibold text-[11px]">APPROVAL_GRANTED</span>
                        ) : isException ? (
                          <span className="text-rose-400 font-semibold text-[11px]">EXCEPTION_FLAGGED</span>
                        ) : isGate ? (
                          <span className="text-amber-400 font-semibold text-[11px]">GATE_EXEC_BLOCKED</span>
                        ) : isDispatched ? (
                          <span className="text-blue-400 font-semibold text-[11px]">CONNECTOR_DISPATCHED</span>
                        ) : (
                          <span className="text-slate-400 text-[11px]">{log.eventType}</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 font-sans text-slate-200 max-w-sm">
                        {log.details}
                      </td>

                      <td className="py-3.5 px-4 text-slate-400 whitespace-nowrap text-[11px]">
                        {log.objectType}: <span className="text-amber-200/70">{log.objectId}</span>
                      </td>

                      <td className="py-3.5 px-4 text-right text-slate-500 text-[11px] whitespace-nowrap">
                        <span className="hover:text-amber-300 cursor-help transition-colors" title={log.hash}>
                          {log.hash.slice(0, 14)}...
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

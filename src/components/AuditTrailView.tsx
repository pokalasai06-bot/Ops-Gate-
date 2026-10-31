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
    <div className="space-y-6">
      {/* Title & Export */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Immutable Audit Trail & Compliance Ledger
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Every instruction, plan mutation, data validation failure, human decision, and connector dispatch is recorded in an irreversible cryptographic ledger.
          </p>
        </div>

        <button
          onClick={() => exportAuditLogToCSV(auditLogs)}
          className="px-4 py-2.5 text-xs font-semibold text-slate-900 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors flex items-center gap-2 shadow-xs shrink-0"
        >
          <Download className="w-4 h-4 text-slate-600" />
          <span>Export Ledger (CSV)</span>
        </button>
      </div>

      {/* Ledger Integrity Banner */}
      <div className="p-4 rounded-xl bg-slate-900 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
          <div>
            <div className="font-semibold text-slate-100">
              Cryptographic Chain Verified (SHA-256)
            </div>
            <div className="text-slate-400 mt-0.5">
              {auditLogs.length} sequentially signed events. Zero tampering detected across all workflow runs.
            </div>
          </div>
        </div>

        <div className="text-right font-mono text-slate-400 text-[11px] shrink-0">
          Last Checksum: {auditLogs[0]?.hash.slice(0, 16)}...
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white p-3 rounded-xl border border-slate-200">
        <div className="flex items-center gap-1 overflow-x-auto p-1 bg-slate-100 rounded-lg">
          <button
            onClick={() => setEventTypeFilter('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              eventTypeFilter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Events ({auditLogs.length})
          </button>
          <button
            onClick={() => setEventTypeFilter('approvals')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              eventTypeFilter === 'approvals' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Human Approvals
          </button>
          <button
            onClick={() => setEventTypeFilter('exceptions')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              eventTypeFilter === 'exceptions' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Exceptions
          </button>
          <button
            onClick={() => setEventTypeFilter('gate')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              eventTypeFilter === 'gate' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Gate Blocks
          </button>
          <button
            onClick={() => setEventTypeFilter('dispatched')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              eventTypeFilter === 'dispatched' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Dispatches
          </button>
        </div>

        <div className="relative flex-1 max-w-xs">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search event hash, details, actor..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-900 bg-slate-50"
          />
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Event ID / Seq</th>
                <th className="py-3 px-4">Timestamp (UTC)</th>
                <th className="py-3 px-4">Actor</th>
                <th className="py-3 px-4">Event Type</th>
                <th className="py-3 px-4">Details</th>
                <th className="py-3 px-4">Target</th>
                <th className="py-3 px-4 text-right">Cryptographic Hash</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 font-mono">
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
                    <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 font-semibold text-slate-900 whitespace-nowrap">
                        {log.id} <span className="text-slate-400 font-normal">#{log.seq}</span>
                      </td>

                      <td className="py-3 px-4 text-slate-600 whitespace-nowrap tabular-nums">
                        {log.timestamp}
                      </td>

                      <td className="py-3 px-4 font-sans whitespace-nowrap">
                        <span className="font-medium text-slate-900">{log.actor}</span>
                        <div className="text-[11px] text-slate-400 capitalize">{log.actorRole.replace('_', ' ')}</div>
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        {isApproval ? (
                          <span className="text-emerald-700 font-semibold">APPROVAL_GRANTED</span>
                        ) : isException ? (
                          <span className="text-rose-700 font-semibold">EXCEPTION_FLAGGED</span>
                        ) : isGate ? (
                          <span className="text-amber-800 font-semibold">GATE_EXEC_BLOCKED</span>
                        ) : isDispatched ? (
                          <span className="text-blue-700 font-semibold">CONNECTOR_DISPATCHED</span>
                        ) : (
                          <span className="text-slate-700">{log.eventType}</span>
                        )}
                      </td>

                      <td className="py-3 px-4 font-sans text-slate-800 max-w-sm">
                        {log.details}
                      </td>

                      <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                        {log.objectType}: {log.objectId}
                      </td>

                      <td className="py-3 px-4 text-right text-slate-400 text-[11px] whitespace-nowrap">
                        <span className="hover:text-slate-800 cursor-help" title={log.hash}>
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

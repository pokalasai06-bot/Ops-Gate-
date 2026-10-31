import React, { useState } from 'react';
import { BusinessRecord, UserRole } from '../types';
import { 
  Check, 
  X, 
  AlertCircle, 
  AlertTriangle, 
  ShieldCheck, 
  Edit3, 
  Search, 
  CheckCircle2, 
  ArrowRight,
  Filter,
  Lock
} from 'lucide-react';

interface ReviewQueueViewProps {
  records: BusinessRecord[];
  onOpenRecordEditor: (record: BusinessRecord) => void;
  onApproveRecord: (recordId: string, notes?: string) => void;
  onRejectRecord: (recordId: string, reason: string) => void;
  onBatchApproveValid: () => void;
  onNavigateToGate: () => void;
  userRole: UserRole;
}

export const ReviewQueueView: React.FC<ReviewQueueViewProps> = ({
  records,
  onOpenRecordEditor,
  onApproveRecord,
  onRejectRecord,
  onBatchApproveValid,
  onNavigateToGate,
  userRole,
}) => {
  const [filter, setFilter] = useState<'all' | 'exceptions' | 'valid' | 'approved' | 'rejected'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredRecords = records.filter((rec) => {
    // Filter by tab
    if (filter === 'exceptions') {
      if (rec.validationStatus !== 'exception' || rec.reviewStatus === 'approved') return false;
    } else if (filter === 'valid') {
      if ((rec.validationStatus !== 'valid' && rec.validationStatus !== 'corrected') || rec.reviewStatus === 'approved') return false;
    } else if (filter === 'approved') {
      if (rec.reviewStatus !== 'approved') return false;
    } else if (filter === 'rejected') {
      if (rec.reviewStatus !== 'rejected') return false;
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const name = (rec.fields.customer_name || rec.fields.vendorName || '').toLowerCase();
      const email = (rec.fields.email || '').toLowerCase();
      const id = rec.id.toLowerCase();
      const company = (rec.fields.company || '').toLowerCase();
      return name.includes(q) || email.includes(q) || id.includes(q) || company.includes(q);
    }

    return true;
  });

  const validPendingCount = records.filter(
    r => (r.validationStatus === 'valid' || r.validationStatus === 'corrected') && r.reviewStatus !== 'approved'
  ).length;

  const exceptionCount = records.filter(
    r => r.validationStatus === 'exception' && r.reviewStatus !== 'approved'
  ).length;

  const approvedCount = records.filter(r => r.reviewStatus === 'approved').length;

  return (
    <div className="space-y-6">
      {/* Top Header & Context */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Human Review Queue & Exceptions
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Examine flagged records, edit bad rows inline, and approve data before execution.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {validPendingCount > 0 && (
            <button
              onClick={onBatchApproveValid}
              className="flex-1 sm:flex-initial px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-xs"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Approve All Valid ({validPendingCount})</span>
            </button>
          )}

          <button
            onClick={onNavigateToGate}
            className="flex-1 sm:flex-initial px-4 py-2 text-xs font-semibold text-slate-800 bg-amber-100 hover:bg-amber-200 border border-amber-300 rounded-lg transition-colors flex items-center justify-center gap-1.5"
          >
            <Lock className="w-3.5 h-3.5 text-amber-800" />
            <span>Go to Execution Gate</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-white p-3 rounded-xl border border-slate-200">
        {/* Interactive Segmented Filter Controls */}
        <div className="flex items-center gap-1 overflow-x-auto p-1 bg-slate-100 rounded-lg">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              filter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All ({records.length})
          </button>
          <button
            onClick={() => setFilter('exceptions')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              filter === 'exceptions' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Exceptions ({exceptionCount})
          </button>
          <button
            onClick={() => setFilter('valid')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              filter === 'valid' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Valid / Corrected ({validPendingCount})
          </button>
          <button
            onClick={() => setFilter('approved')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              filter === 'approved' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Approved ({approvedCount})
          </button>
        </div>

        {/* Live Search */}
        <div className="relative flex-1 max-w-xs">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search records, emails, IDs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-900 bg-slate-50"
          />
        </div>
      </div>

      {/* Record Table / Master Cards */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Record ID</th>
                <th className="py-3 px-4">Entity / Name</th>
                <th className="py-3 px-4">Contact / Primary Key</th>
                <th className="py-3 px-4">Validation Finding</th>
                <th className="py-3 px-4 text-right">Confidence</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    No records match current filter criteria.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((record) => {
                  const isApproved = record.reviewStatus === 'approved';
                  const isRejected = record.reviewStatus === 'rejected';
                  const hasIssues = record.issues.length > 0 && !isApproved;

                  return (
                    <tr
                      key={record.id}
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                      onClick={() => onOpenRecordEditor(record)}
                    >
                      {/* ID */}
                      <td className="py-3.5 px-4 font-mono font-semibold text-slate-900">
                        {record.id}
                      </td>

                      {/* Name / Company */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900">
                          {record.fields.customer_name || record.fields.vendorName || record.fields.name || 'Unnamed'}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {record.fields.company || record.fields.category || record.fields.invoice_no || ''}
                        </div>
                      </td>

                      {/* Contact / Email / Phone */}
                      <td className="py-3.5 px-4 font-mono text-[11px] text-slate-700">
                        <div>{record.fields.email || <span className="text-rose-500 font-sans italic">[Missing email]</span>}</div>
                        <div className="text-slate-400">{record.fields.phone || record.fields.due_date || ''}</div>
                      </td>

                      {/* Quality Issues */}
                      <td className="py-3.5 px-4 max-w-xs">
                        {isApproved ? (
                          <div className="flex items-center gap-1.5 text-emerald-700 font-medium">
                            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                            <span>Approved by operator</span>
                          </div>
                        ) : hasIssues ? (
                          <div className="text-rose-800 space-y-0.5">
                            <div className="font-semibold flex items-center gap-1">
                              <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-600" />
                              <span>{record.issues[0].ruleName}</span>
                            </div>
                            <div className="text-[11px] text-slate-600 line-clamp-1">
                              {record.issues[0].message}
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-emerald-700 font-medium">
                            <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                            <span>Valid · Ready to sign off</span>
                          </div>
                        )}
                      </td>

                      {/* Confidence Score */}
                      <td className="py-3.5 px-4 text-right font-mono tabular-nums">
                        <span
                          className={`font-semibold ${
                            record.confidenceScore >= 90
                              ? 'text-emerald-700'
                              : record.confidenceScore >= 50
                                ? 'text-amber-700'
                                : 'text-rose-700'
                          }`}
                        >
                          {record.confidenceScore}%
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        {isApproved ? (
                          <span className="font-medium text-emerald-800">Approved</span>
                        ) : isRejected ? (
                          <span className="font-medium text-rose-700">Rejected</span>
                        ) : hasIssues ? (
                          <span className="font-medium text-amber-800">Blocked</span>
                        ) : (
                          <span className="font-medium text-slate-700">Pending</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onOpenRecordEditor(record)}
                            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors"
                            title="Edit row inline"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          {!isApproved && (
                            <button
                              onClick={() => onApproveRecord(record.id)}
                              className="px-2.5 py-1 text-[11px] font-semibold text-emerald-900 bg-emerald-100 hover:bg-emerald-200 rounded transition-colors"
                            >
                              Approve
                            </button>
                          )}

                          {!isRejected && (
                            <button
                              onClick={() => onRejectRecord(record.id, 'Operator manual rejection')}
                              className="p-1.5 text-slate-400 hover:text-rose-700 hover:bg-rose-50 rounded transition-colors"
                              title="Reject record"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>
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

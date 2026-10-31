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
  Lock,
  ChevronDown,
  ChevronUp,
  Download,
  Trash2,
  CheckSquare,
  Square,
  Sparkles,
  Send,
  Eye
} from 'lucide-react';

interface ReviewQueueViewProps {
  records: BusinessRecord[];
  onOpenRecordEditor: (record: BusinessRecord) => void;
  onApproveRecord: (recordId: string, notes?: string) => void;
  onRejectRecord: (recordId: string, reason: string) => void;
  onBatchApproveValid: () => void;
  onBatchApproveSelected?: (recordIds: string[]) => void;
  onBatchRejectSelected?: (recordIds: string[], reason: string) => void;
  onNavigateToGate: () => void;
  userRole: UserRole;
}

export const ReviewQueueView: React.FC<ReviewQueueViewProps> = ({
  records,
  onOpenRecordEditor,
  onApproveRecord,
  onRejectRecord,
  onBatchApproveValid,
  onBatchApproveSelected,
  onBatchRejectSelected,
  onNavigateToGate,
  userRole,
}) => {
  const [filter, setFilter] = useState<'all' | 'exceptions' | 'valid' | 'approved' | 'rejected'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRecordIds, setSelectedRecordIds] = useState<string[]>([]);
  const [expandedRecordIds, setExpandedRecordIds] = useState<Record<string, boolean>>({});

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
  const rejectedCount = records.filter(r => r.reviewStatus === 'rejected').length;

  // Toggle selection for a single record
  const handleToggleSelect = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedRecordIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  // Toggle select all visible
  const handleToggleSelectAll = () => {
    const visibleIds = filteredRecords.map(r => r.id);
    const allSelected = visibleIds.every(id => selectedRecordIds.includes(id));
    if (allSelected) {
      setSelectedRecordIds(prev => prev.filter(id => !visibleIds.includes(id)));
    } else {
      setSelectedRecordIds(prev => Array.from(new Set([...prev, ...visibleIds])));
    }
  };

  // Toggle row expand
  const handleToggleExpandRow = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedRecordIds(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Batch actions
  const handleBatchApprove = () => {
    if (onBatchApproveSelected) {
      onBatchApproveSelected(selectedRecordIds);
    } else {
      selectedRecordIds.forEach(id => onApproveRecord(id, 'Batch authorized by operator'));
    }
    setSelectedRecordIds([]);
  };

  const handleBatchReject = () => {
    if (onBatchRejectSelected) {
      onBatchRejectSelected(selectedRecordIds, 'Batch rejected by operator');
    } else {
      selectedRecordIds.forEach(id => onRejectRecord(id, 'Batch rejected by operator'));
    }
    setSelectedRecordIds([]);
  };

  const handleExportJson = () => {
    const selectedData = records.filter(r => selectedRecordIds.includes(r.id));
    const blob = new Blob([JSON.stringify(selectedData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `opsgate_selection_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 relative">
      {/* Background ambient lighting */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Top Header & Context */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-normal text-white" style={{ fontFamily: 'var(--font-serif)' }}>
            Human Review Queue & Exceptions
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Examine flagged records, select items for batch operations, and resolve exceptions before external execution.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {validPendingCount > 0 && (
            <button
              onClick={onBatchApproveValid}
              className="gold-button flex-1 sm:flex-initial px-4 py-2.5 text-xs rounded-xl flex items-center justify-center gap-2 shadow-md hover:scale-[1.01] transition-transform"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Approve All Valid ({validPendingCount})</span>
            </button>
          )}

          <button
            onClick={onNavigateToGate}
            className="flex-1 sm:flex-initial px-4 py-2.5 text-xs font-semibold text-amber-200 bg-slate-900/80 hover:bg-slate-800 border border-amber-500/30 rounded-xl transition-all flex items-center justify-center gap-2 shadow-inner shadow-black/40 hover:scale-[1.01]"
          >
            <Lock className="w-3.5 h-3.5 text-amber-400" />
            <span>Go to Execution Gate</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 luxury-card p-3 rounded-2xl">
        {/* Interactive Segmented Filter Controls */}
        <div className="flex items-center gap-1.5 overflow-x-auto p-1 bg-slate-950/70 rounded-xl border border-white/5">
          <button
            onClick={() => setFilter('all')}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap cursor-pointer ${
              filter === 'all' 
                ? 'bg-amber-400/25 text-amber-200 border border-amber-400/50 shadow-xs font-semibold' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            All ({records.length})
          </button>
          <button
            onClick={() => setFilter('exceptions')}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap cursor-pointer ${
              filter === 'exceptions' 
                ? 'bg-amber-400/25 text-amber-200 border border-amber-400/50 shadow-xs font-semibold' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Exceptions ({exceptionCount})
          </button>
          <button
            onClick={() => setFilter('valid')}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap cursor-pointer ${
              filter === 'valid' 
                ? 'bg-amber-400/25 text-amber-200 border border-amber-400/50 shadow-xs font-semibold' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Valid / Corrected ({validPendingCount})
          </button>
          <button
            onClick={() => setFilter('approved')}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap cursor-pointer ${
              filter === 'approved' 
                ? 'bg-amber-400/25 text-amber-200 border border-amber-400/50 shadow-xs font-semibold' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Approved ({approvedCount})
          </button>
          <button
            onClick={() => setFilter('rejected')}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap cursor-pointer ${
              filter === 'rejected' 
                ? 'bg-amber-400/25 text-amber-200 border border-amber-400/50 shadow-xs font-semibold' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Rejected ({rejectedCount})
          </button>
        </div>

        {/* Live Search */}
        <div className="relative flex-1 max-w-xs">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-amber-400/60" />
          <input
            type="text"
            placeholder="Search records, emails, IDs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs pl-9 pr-8 py-2 rounded-xl border border-white/10 focus:border-amber-400 focus:outline-none bg-slate-950/70 text-slate-100 placeholder:text-slate-500 shadow-inner shadow-black/50"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-2 text-slate-500 hover:text-white text-xs"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Record Table / Master Cards */}
      <div className="luxury-card rounded-2xl overflow-hidden shadow-xl border-amber-400/20">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/90 border-b border-white/10 text-amber-300/80 font-mono text-[11px] uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-3 w-10 text-center">
                  <button
                    type="button"
                    onClick={handleToggleSelectAll}
                    className="text-slate-400 hover:text-amber-300 transition-colors p-1"
                    title="Select / Deselect all visible records"
                  >
                    {filteredRecords.length > 0 && filteredRecords.every(r => selectedRecordIds.includes(r.id)) ? (
                      <CheckSquare className="w-4 h-4 text-amber-400" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-500" />
                    )}
                  </button>
                </th>
                <th className="py-3.5 px-3">Record ID</th>
                <th className="py-3.5 px-4">Entity / Name</th>
                <th className="py-3.5 px-4">Contact / Primary Key</th>
                <th className="py-3.5 px-4">Validation Finding</th>
                <th className="py-3.5 px-4 text-right">Confidence</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Interactive Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-white/5 font-sans">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    No records match current filter criteria.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((record) => {
                  const isApproved = record.reviewStatus === 'approved';
                  const isRejected = record.reviewStatus === 'rejected';
                  const hasIssues = record.issues.length > 0 && !isApproved;
                  const isSelected = selectedRecordIds.includes(record.id);
                  const isExpanded = expandedRecordIds[record.id];

                  return (
                    <React.Fragment key={record.id}>
                      <tr
                        className={`transition-colors cursor-pointer group ${
                          isSelected 
                            ? 'bg-amber-950/30 border-l-2 border-l-amber-400' 
                            : 'hover:bg-slate-800/40'
                        }`}
                        onClick={() => onOpenRecordEditor(record)}
                      >
                        {/* Interactive Checkbox */}
                        <td className="py-4 px-3 text-center" onClick={(e) => handleToggleSelect(record.id, e)}>
                          <button
                            type="button"
                            className="text-slate-400 hover:text-amber-300 transition-colors p-1"
                          >
                            {isSelected ? (
                              <CheckSquare className="w-4 h-4 text-amber-400" />
                            ) : (
                              <Square className="w-4 h-4 text-slate-600 group-hover:text-slate-400" />
                            )}
                          </button>
                        </td>

                        {/* ID */}
                        <td className="py-4 px-3 font-mono font-semibold text-amber-300">
                          <span className="bg-slate-900 border border-amber-500/25 px-2 py-0.5 rounded-md shadow-inner">
                            {record.id}
                          </span>
                        </td>

                        {/* Name / Company */}
                        <td className="py-4 px-4">
                          <div className="font-semibold text-white group-hover:text-amber-200 transition-colors">
                            {record.fields.customer_name || record.fields.vendorName || record.fields.name || 'Unnamed'}
                          </div>
                          <div className="text-[11px] text-slate-400">
                            {record.fields.company || record.fields.category || record.fields.invoice_no || ''}
                          </div>
                        </td>

                        {/* Contact / Email / Phone */}
                        <td className="py-4 px-4 font-mono text-[11px] text-slate-300">
                          <div>{record.fields.email || <span className="text-rose-400 font-sans italic">[Missing email]</span>}</div>
                          <div className="text-slate-500">{record.fields.phone || record.fields.due_date || ''}</div>
                        </td>

                        {/* Quality Issues */}
                        <td className="py-4 px-4 max-w-xs">
                          {isApproved ? (
                            <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
                              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                              <span>Authorized by operator</span>
                            </div>
                          ) : hasIssues ? (
                            <div className="text-rose-300 space-y-0.5">
                              <div className="font-semibold flex items-center gap-1 text-rose-400">
                                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                <span>{record.issues[0].ruleName}</span>
                              </div>
                              <div className="text-[11px] text-slate-400 line-clamp-1">
                                {record.issues[0].message}
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
                              <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                              <span>Valid · Ready for authorization</span>
                            </div>
                          )}
                        </td>

                        {/* Confidence Score */}
                        <td className="py-4 px-4 text-right font-mono tabular-nums">
                          <span
                            className={`font-semibold ${
                              record.confidenceScore >= 90
                                ? 'text-emerald-400'
                                : record.confidenceScore >= 50
                                  ? 'text-amber-300'
                                  : 'text-rose-400'
                            }`}
                          >
                            {record.confidenceScore}%
                          </span>
                        </td>

                        {/* Status */}
                        <td className="py-4 px-4">
                          {isApproved ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono tracking-wider font-semibold bg-emerald-950/60 text-emerald-300 border border-emerald-500/40">APPROVED</span>
                          ) : isRejected ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono tracking-wider font-semibold bg-rose-950/60 text-rose-300 border border-rose-500/40">REJECTED</span>
                          ) : hasIssues ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono tracking-wider font-semibold bg-amber-950/60 text-amber-300 border border-amber-500/40">BLOCKED</span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono tracking-wider font-semibold bg-slate-900 text-slate-300 border border-white/10">PENDING</span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Inline Peek Expander */}
                            <button
                              onClick={(e) => handleToggleExpandRow(record.id, e)}
                              className="p-1.5 text-slate-400 hover:text-amber-300 hover:bg-slate-800 rounded-lg transition-colors border border-transparent hover:border-slate-700"
                              title={isExpanded ? 'Collapse row details' : 'Quick peek details'}
                            >
                              {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                            </button>

                            {!isApproved && hasIssues && (
                              <button
                                onClick={() => onOpenRecordEditor(record)}
                                className="px-2.5 py-1 text-[11px] font-semibold text-slate-950 bg-gradient-to-r from-amber-300 to-amber-500 hover:from-amber-200 hover:to-amber-400 rounded-lg transition-all shadow-xs flex items-center gap-1 hover:scale-105"
                                title="Review and resolve record exception"
                              >
                                <Edit3 className="w-3 h-3" />
                                <span>Resolve</span>
                              </button>
                            )}

                            {!isApproved && !hasIssues && (
                              <button
                                onClick={() => onApproveRecord(record.id)}
                                className="px-2.5 py-1 text-[11px] font-semibold text-white bg-emerald-700 hover:bg-emerald-600 rounded-lg transition-all shadow-xs flex items-center gap-1 hover:scale-105"
                              >
                                <Check className="w-3 h-3" />
                                <span>Approve</span>
                              </button>
                            )}

                            <button
                              onClick={() => onOpenRecordEditor(record)}
                              className="p-1.5 text-slate-400 hover:text-amber-300 hover:bg-slate-800 rounded-lg transition-colors border border-transparent hover:border-slate-700"
                              title="Inspect & Edit all fields"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>

                            {!isRejected && (
                              <button
                                onClick={() => onRejectRecord(record.id, 'Operator manual rejection')}
                                className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 rounded-lg transition-colors border border-transparent hover:border-rose-500/20"
                                title="Reject record"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>

                      {/* Expanded Row Details */}
                      {isExpanded && (
                        <tr className="bg-slate-950/80 border-b border-white/10 animate-fadeIn">
                          <td colSpan={8} className="p-4 pl-12 space-y-3">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                              {/* Attributes */}
                              <div className="p-3 rounded-xl bg-slate-900 border border-white/5 space-y-1.5 font-mono">
                                <div className="text-[10px] text-amber-300 uppercase font-semibold">Raw Record Attributes</div>
                                {Object.entries(record.fields).map(([k, v]) => (
                                  <div key={k} className="flex justify-between text-[11px]">
                                    <span className="text-slate-400">{k}:</span>
                                    <span className="text-white truncate max-w-[140px]">{String(v)}</span>
                                  </div>
                                ))}
                              </div>

                              {/* Exceptions Detail */}
                              <div className="p-3 rounded-xl bg-slate-900 border border-white/5 space-y-1.5">
                                <div className="text-[10px] text-amber-300 uppercase font-semibold font-mono">Policy Validation Findings</div>
                                {record.issues.length === 0 ? (
                                  <div className="text-emerald-400 flex items-center gap-1 text-[11px]">
                                    <ShieldCheck className="w-3.5 h-3.5" />
                                    <span>All deterministic quality rules passed.</span>
                                  </div>
                                ) : (
                                  record.issues.map((iss, i) => (
                                    <div key={i} className="text-[11px] text-rose-300 bg-rose-950/30 p-1.5 rounded border border-rose-500/20">
                                      <span className="font-mono font-bold text-amber-300">[{iss.ruleId}]</span> {iss.message}
                                    </div>
                                  ))
                                )}
                              </div>

                              {/* Staged Actions Preview */}
                              <div className="p-3 rounded-xl bg-slate-900 border border-white/5 space-y-1.5 font-mono text-[11px]">
                                <div className="text-[10px] text-amber-300 uppercase font-semibold">Staged Connectors ({record.stagedActions.length})</div>
                                {record.stagedActions.map(a => (
                                  <div key={a.id} className="flex items-center justify-between text-slate-300">
                                    <span>{a.targetSystem} ({a.actionType})</span>
                                    <span className="text-amber-400">{a.status}</span>
                                  </div>
                                ))}
                                <div className="pt-2 flex justify-end">
                                  <button
                                    type="button"
                                    onClick={() => onOpenRecordEditor(record)}
                                    className="gold-button px-3 py-1 text-[11px] rounded-lg"
                                  >
                                    Open Full Editor Modal
                                  </button>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Floating Interactive Batch Action Toolbar */}
      {selectedRecordIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-slate-950/95 border border-amber-400/50 gold-glow px-5 py-3 rounded-2xl shadow-2xl backdrop-blur-xl flex items-center gap-4 animate-fadeIn">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-amber-400 text-slate-950 font-bold font-mono text-xs flex items-center justify-center">
              {selectedRecordIds.length}
            </span>
            <span className="text-xs font-semibold text-white">Records Selected</span>
          </div>

          <div className="h-4 w-px bg-white/20"></div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleBatchApprove}
              className="gold-button px-3.5 py-1.5 text-xs rounded-xl flex items-center gap-1.5 shadow"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Approve Selected</span>
            </button>

            <button
              type="button"
              onClick={handleBatchReject}
              className="px-3.5 py-1.5 text-xs rounded-xl bg-rose-950/80 hover:bg-rose-900 border border-rose-500/40 text-rose-200 transition-colors flex items-center gap-1.5"
            >
              <X className="w-3.5 h-3.5" />
              <span>Reject Selected</span>
            </button>

            <button
              type="button"
              onClick={handleExportJson}
              className="px-3 py-1.5 text-xs rounded-xl bg-slate-900 hover:bg-slate-800 border border-white/10 text-slate-300 transition-colors flex items-center gap-1.5"
              title="Export selected records as JSON"
            >
              <Download className="w-3.5 h-3.5 text-amber-400" />
              <span>Export</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedRecordIds([])}
              className="px-2.5 py-1.5 text-xs text-slate-400 hover:text-white transition-colors"
            >
              Clear
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

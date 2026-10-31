import React, { useState } from 'react';
import { ValidationRule, UserRole } from '../types';
import { Plus, Check, Sliders, ShieldCheck, AlertCircle, ToggleLeft, ToggleRight } from 'lucide-react';

interface BusinessRulesViewProps {
  rules: ValidationRule[];
  onToggleRule: (ruleId: string) => void;
  onAddRule: (rule: Omit<ValidationRule, 'id'>) => void;
  userRole: UserRole;
}

export const BusinessRulesView: React.FC<BusinessRulesViewProps> = ({
  rules,
  onToggleRule,
  onAddRule,
  userRole,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newRuleName, setNewRuleName] = useState('');
  const [newRuleDesc, setNewRuleDesc] = useState('');
  const [newRuleField, setNewRuleField] = useState('email');
  const [newRuleType, setNewRuleType] = useState<ValidationRule['ruleType']>('required');
  const [newRuleSeverity, setNewRuleSeverity] = useState<ValidationRule['severity']>('high');

  const handleCreateRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRuleName.trim()) return;

    onAddRule({
      name: newRuleName.trim(),
      description: newRuleDesc.trim() || 'Custom user business policy',
      field: newRuleField,
      ruleType: newRuleType,
      severity: newRuleSeverity,
      enabled: true,
    });

    setNewRuleName('');
    setNewRuleDesc('');
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6 relative">
      {/* Background ambient lighting */}
      <div className="absolute top-10 left-1/4 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-normal text-white" style={{ fontFamily: 'var(--font-serif)' }}>
            Deterministic Business Rules Engine
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Configure institutional data policies that evaluate records before execution staging. Any failure automatically pauses outbound actions.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="gold-button px-4 py-2 text-xs rounded-xl flex items-center gap-2 shadow-md shrink-0"
        >
          <Plus className="w-4 h-4 text-slate-950" />
          <span>Add Custom Rule</span>
        </button>
      </div>

      {/* Rules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {rules.map((rule) => {
          return (
            <div
              key={rule.id}
              className={`p-5 rounded-2xl border transition-all luxury-card ${
                rule.enabled ? 'border-amber-400/30' : 'border-white/5 opacity-50'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm font-bold text-white">
                      {rule.name}
                    </h3>
                    <span className="font-mono text-[11px] text-amber-200/70 border border-amber-500/20 px-2 py-0.5 rounded-md bg-slate-950/40">
                      Target: {rule.field}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 mt-2 leading-relaxed font-light">
                    {rule.description}
                  </p>

                  <div className="flex items-center gap-3 mt-3.5 text-xs font-mono">
                    <span className={`font-semibold capitalize text-[11px] ${
                      rule.severity === 'critical'
                        ? 'text-rose-400'
                        : rule.severity === 'high'
                          ? 'text-amber-400'
                          : 'text-slate-400'
                    }`}>
                      {rule.severity} Severity
                    </span>
                    <span className="text-white/20">·</span>
                    <span className="text-slate-400 text-[11px]">
                      Type: {rule.ruleType}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => onToggleRule(rule.id)}
                  className="p-1 text-slate-400 hover:text-white transition-colors shrink-0"
                  title={rule.enabled ? 'Disable rule' : 'Enable rule'}
                >
                  {rule.enabled ? (
                    <ToggleRight className="w-8 h-8 text-amber-400 drop-shadow-[0_0_8px_rgba(212,175,55,0.4)]" />
                  ) : (
                    <ToggleLeft className="w-8 h-8 text-slate-600" />
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Custom Rule Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <div className="luxury-card rounded-2xl shadow-2xl border-amber-400/40 w-full max-w-lg p-6 bg-slate-950">
            <h3 className="text-lg font-bold text-white">
              Define New Business Rule
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Add a deterministic policy evaluated across all incoming rows.
            </p>

            <form onSubmit={handleCreateRule} className="mt-5 space-y-4 text-xs">
              <div>
                <label className="font-medium text-slate-300 block mb-1">
                  Rule Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Phone Country Code Required"
                  value={newRuleName}
                  onChange={(e) => setNewRuleName(e.target.value)}
                  className="w-full px-3.5 py-2 border border-white/10 rounded-xl bg-slate-900 text-white focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-medium text-slate-300 block mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Explain why this rule exists and how to comply."
                  value={newRuleDesc}
                  onChange={(e) => setNewRuleDesc(e.target.value)}
                  className="w-full px-3.5 py-2 border border-white/10 rounded-xl bg-slate-900 text-white focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-medium text-slate-300 block mb-1">
                    Evaluated Field
                  </label>
                  <select
                    value={newRuleField}
                    onChange={(e) => setNewRuleField(e.target.value)}
                    className="w-full px-3 py-2 border border-white/10 rounded-xl bg-slate-900 text-white focus:outline-none"
                  >
                    <option value="email">Email</option>
                    <option value="phone">Phone</option>
                    <option value="amount">Amount / Total</option>
                    <option value="customer_name">Customer / Company Name</option>
                    <option value="invoice_no">Invoice Number</option>
                  </select>
                </div>

                <div>
                  <label className="font-medium text-slate-300 block mb-1">
                    Severity
                  </label>
                  <select
                    value={newRuleSeverity}
                    onChange={(e) => setNewRuleSeverity(e.target.value as any)}
                    className="w-full px-3 py-2 border border-white/10 rounded-xl bg-slate-900 text-white focus:outline-none"
                  >
                    <option value="critical">Critical (Hard Block)</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low Warning</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-slate-400 hover:text-white transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="gold-button px-5 py-2 rounded-xl font-semibold shadow-md"
                >
                  Create Rule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

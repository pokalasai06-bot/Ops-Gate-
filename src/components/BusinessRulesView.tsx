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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Deterministic Business Rules Engine
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Configure data policies that evaluate records before execution staging. Any failure automatically pauses outbound actions.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-2 shadow-xs shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Custom Rule</span>
        </button>
      </div>

      {/* Rules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {rules.map((rule) => {
          return (
            <div
              key={rule.id}
              className={`p-5 rounded-xl border transition-all bg-white ${
                rule.enabled ? 'border-slate-200 shadow-xs' : 'border-slate-100 opacity-60'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm font-bold text-slate-900">
                      {rule.name}
                    </h3>
                    <span className="font-mono text-[11px] text-slate-500">
                      Target: {rule.field}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                    {rule.description}
                  </p>

                  <div className="flex items-center gap-3 mt-3 text-xs">
                    <span className={`font-semibold capitalize ${
                      rule.severity === 'critical'
                        ? 'text-rose-700'
                        : rule.severity === 'high'
                          ? 'text-amber-700'
                          : 'text-slate-600'
                    }`}>
                      {rule.severity} Severity
                    </span>
                    <span className="text-slate-400">·</span>
                    <span className="text-slate-500 font-mono text-[11px]">
                      Type: {rule.ruleType}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => onToggleRule(rule.id)}
                  className="p-1 text-slate-700 hover:text-slate-900 transition-colors shrink-0"
                  title={rule.enabled ? 'Disable rule' : 'Enable rule'}
                >
                  {rule.enabled ? (
                    <ToggleRight className="w-8 h-8 text-slate-900" />
                  ) : (
                    <ToggleLeft className="w-8 h-8 text-slate-300" />
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Custom Rule Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg p-6">
            <h3 className="text-base font-bold text-slate-900">
              Define New Validation Rule
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Add a deterministic policy evaluated on all incoming rows.
            </p>

            <form onSubmit={handleCreateRule} className="mt-5 space-y-4 text-xs">
              <div>
                <label className="font-medium text-slate-700 block mb-1">
                  Rule Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Phone Country Code Required"
                  value={newRuleName}
                  onChange={(e) => setNewRuleName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-slate-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-medium text-slate-700 block mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Explain why this rule exists and how to comply."
                  value={newRuleDesc}
                  onChange={(e) => setNewRuleDesc(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-slate-900 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-medium text-slate-700 block mb-1">
                    Evaluated Field
                  </label>
                  <select
                    value={newRuleField}
                    onChange={(e) => setNewRuleField(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md bg-white focus:outline-none"
                  >
                    <option value="email">Email</option>
                    <option value="phone">Phone</option>
                    <option value="amount">Amount / Total</option>
                    <option value="customer_name">Customer / Company Name</option>
                    <option value="invoice_no">Invoice Number</option>
                  </select>
                </div>

                <div>
                  <label className="font-medium text-slate-700 block mb-1">
                    Severity
                  </label>
                  <select
                    value={newRuleSeverity}
                    onChange={(e) => setNewRuleSeverity(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md bg-white focus:outline-none"
                  >
                    <option value="critical">Critical (Hard Block)</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low Warning</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3.5 py-2 text-slate-600 hover:text-slate-800 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-white bg-slate-900 hover:bg-slate-800 rounded-md transition-colors font-semibold shadow-xs"
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

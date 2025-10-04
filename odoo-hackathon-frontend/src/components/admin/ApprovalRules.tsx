import { useState } from 'react';
import { Settings, Plus, CreditCard as Edit, Trash2, Users, Percent, UserCheck } from 'lucide-react';
import { ApprovalRule, RuleType } from '../../types';

const MOCK_RULES: ApprovalRule[] = [
  {
    id: '1',
    company_id: '1',
    name: 'Standard Approval Flow',
    rule_type: 'percentage',
    percentage_required: 60,
    approver_ids: ['2', '3', '4'],
    is_active: true,
    created_at: '2025-01-15T10:00:00Z'
  },
  {
    id: '2',
    company_id: '1',
    name: 'CFO Override',
    rule_type: 'specific_approver',
    specific_approver_id: '1',
    approver_ids: ['1'],
    is_active: true,
    created_at: '2025-01-20T14:30:00Z'
  },
];

export function ApprovalRules() {
  const [rules, setRules] = useState(MOCK_RULES);

  const getRuleTypeIcon = (type: RuleType) => {
    switch (type) {
      case 'percentage':
        return <Percent className="w-5 h-5 text-blue-600" />;
      case 'specific_approver':
        return <UserCheck className="w-5 h-5 text-green-600" />;
      case 'hybrid':
        return <Users className="w-5 h-5 text-purple-600" />;
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
      <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center">
              <Settings className="w-7 h-7 mr-3" />
              Approval Rules
            </h2>
            <p className="text-blue-100 mt-1">
              Configure conditional approval workflows
            </p>
          </div>
          <button className="flex items-center space-x-2 px-6 py-3 bg-white text-blue-600 rounded-lg font-medium hover:bg-blue-50 transition-all shadow-lg">
            <Plus className="w-5 h-5" />
            <span>Add Rule</span>
          </button>
        </div>
      </div>

      <div className="p-6 space-y-4">
        {rules.map((rule) => (
          <div
            key={rule.id}
            className="border border-slate-200 rounded-xl p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4 flex-1">
                <div className="p-3 bg-slate-100 rounded-lg">
                  {getRuleTypeIcon(rule.rule_type)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="font-semibold text-slate-900">{rule.name}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      rule.is_active
                        ? 'bg-green-100 text-green-800 border border-green-200'
                        : 'bg-slate-100 text-slate-800 border border-slate-200'
                    }`}>
                      {rule.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="space-y-2 text-sm text-slate-600">
                    <p>
                      <span className="font-medium">Type:</span> {
                        rule.rule_type === 'percentage' ? 'Percentage-based' :
                        rule.rule_type === 'specific_approver' ? 'Specific Approver' :
                        'Hybrid'
                      }
                    </p>
                    {rule.percentage_required && (
                      <p>
                        <span className="font-medium">Required:</span> {rule.percentage_required}% of approvers must approve
                      </p>
                    )}
                    <p>
                      <span className="font-medium">Approvers:</span> {rule.approver_ids.length} assigned
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2 ml-4">
                <button className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors">
                  <Edit className="w-4 h-4" />
                </button>
                <button className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { Plus, Play } from 'lucide-react';
import Layout from '../components/Layout';
import RuleEditor from '../components/RuleEditor';
import { useAppStore } from '../state/useAppStore';
import { listRules, createRule, updateRule } from '../api/rules';
import { listUsers } from '../api/users';
import { evaluateApprovalRule } from '../utils/rules';
import type { ApprovalRule, User, ApprovalStep } from '../types';

export default function Rules() {
  const { company } = useAppStore();
  const [rules, setRules] = useState<ApprovalRule[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [showEditor, setShowEditor] = useState(false);
  const [editingRule, setEditingRule] = useState<ApprovalRule | null>(null);
  const [testResult, setTestResult] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [company]);

  const loadData = async () => {
    if (!company) return;

    try {
      const [rulesData, usersData] = await Promise.all([
        listRules(company.id),
        listUsers(company.id),
      ]);
      setRules(rulesData);
      setUsers(usersData);
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  };

  const handleSaveRule = async (data: any) => {
    if (!company) return;

    try {
      if (editingRule) {
        await updateRule(editingRule.id, data);
      } else {
        await createRule({
          ...data,
          companyId: company.id,
        });
      }
      await loadData();
      setShowEditor(false);
      setEditingRule(null);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to save rule');
    }
  };

  const handleTestRule = (rule: ApprovalRule) => {
    const mockApprovals: ApprovalStep[] = rule.approvalSequence.slice(0, 2).map((id) => {
      const user = users.find((u) => u.id === id);
      return {
        approverId: id,
        approverName: user?.name || 'Unknown',
        status: 'approved' as const,
      };
    });

    const result = evaluateApprovalRule(rule, mockApprovals);
    setTestResult(
      `Test Result:\nApproved: ${result.approved}\nExplanation: ${result.explanation}${
        result.progress
          ? `\nProgress: ${result.progress.current}/${result.progress.required} (${result.progress.percentage.toFixed(0)}%)`
          : ''
      }`
    );
  };

  const handleToggleActive = async (rule: ApprovalRule) => {
    try {
      await updateRule(rule.id, { isActive: !rule.isActive });
      await loadData();
    } catch (error) {
      alert('Failed to toggle rule status');
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Approval Rules</h1>
            <p className="text-gray-600 mt-1">
              Configure automated approval workflows
            </p>
          </div>
          <button
            onClick={() => {
              setEditingRule(null);
              setShowEditor(true);
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            New Rule
          </button>
        </div>

        {testResult && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <pre className="text-sm text-green-900 whitespace-pre-wrap">{testResult}</pre>
            <button
              onClick={() => setTestResult(null)}
              className="mt-2 text-sm text-green-700 hover:text-green-800"
            >
              Dismiss
            </button>
          </div>
        )}

        <div className="space-y-4">
          {rules.map((rule) => (
            <div
              key={rule.id}
              className="bg-white rounded-lg border border-gray-200 p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold text-gray-900">{rule.name}</h3>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        rule.isActive
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {rule.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">Type: {rule.type}</p>
                  {rule.percentageThreshold && (
                    <p className="text-sm text-gray-600">
                      Threshold: {rule.percentageThreshold}%
                    </p>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleTestRule(rule)}
                    className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition flex items-center gap-1 text-sm"
                  >
                    <Play className="w-4 h-4" />
                    Test
                  </button>
                  <button
                    onClick={() => handleToggleActive(rule)}
                    className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition text-sm"
                  >
                    {rule.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                  <button
                    onClick={() => {
                      setEditingRule(rule);
                      setShowEditor(true);
                    }}
                    className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition text-sm"
                  >
                    Edit
                  </button>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  Approval Sequence:
                </h4>
                <div className="flex flex-wrap gap-2">
                  {rule.approvalSequence.map((approverId, index) => {
                    const user = users.find((u) => u.id === approverId);
                    return (
                      <span
                        key={approverId}
                        className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                      >
                        {index + 1}. {user?.name || 'Unknown'} ({user?.role})
                      </span>
                    );
                  })}
                </div>
              </div>

              {rule.specificApproverIds && rule.specificApproverIds.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    Specific Approvers (auto-approve):
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {rule.specificApproverIds.map((approverId) => {
                      const user = users.find((u) => u.id === approverId);
                      return (
                        <span
                          key={approverId}
                          className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                        >
                          {user?.name || 'Unknown'} ({user?.role})
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ))}

          {rules.length === 0 && (
            <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
              <p className="text-gray-600 mb-4">No approval rules configured</p>
              <button
                onClick={() => setShowEditor(true)}
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
              >
                <Plus className="w-5 h-5" />
                Create First Rule
              </button>
            </div>
          )}
        </div>
      </div>

      {showEditor && (
        <RuleEditor
          users={users}
          onSubmit={handleSaveRule}
          onClose={() => {
            setShowEditor(false);
            setEditingRule(null);
          }}
          defaultValues={
            editingRule
              ? {
                  name: editingRule.name,
                  type: editingRule.type,
                  percentageThreshold: editingRule.percentageThreshold,
                  specificApproverIds: editingRule.specificApproverIds,
                  approvalSequence: editingRule.approvalSequence,
                }
              : undefined
          }
        />
      )}
    </Layout>
  );
}

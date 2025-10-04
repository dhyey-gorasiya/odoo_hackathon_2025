import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X } from 'lucide-react';
import type { User } from '../types';

const ruleSchema = z.object({
  name: z.string().min(1, 'Name required'),
  type: z.enum(['percentage', 'specific', 'hybrid']),
  percentageThreshold: z.number().min(1).max(100).optional(),
  specificApproverIds: z.array(z.string()).optional(),
  approvalSequence: z.array(z.string()).min(1, 'At least one approver required'),
});

type RuleFormData = z.infer<typeof ruleSchema>;

interface RuleEditorProps {
  users: User[];
  onSubmit: (data: RuleFormData) => void;
  onClose: () => void;
  defaultValues?: Partial<RuleFormData>;
}

export default function RuleEditor({
  users,
  onSubmit,
  onClose,
  defaultValues,
}: RuleEditorProps) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RuleFormData>({
    resolver: zodResolver(ruleSchema),
    defaultValues: defaultValues || {
      name: '',
      type: 'percentage',
      percentageThreshold: 50,
      specificApproverIds: [],
      approvalSequence: [],
    },
  });

  const ruleType = watch('type');
  const approvers = users.filter((u) =>
    ['manager', 'finance', 'director', 'admin'].includes(u.role)
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">
            {defaultValues ? 'Edit Rule' : 'Create Approval Rule'}
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Rule Name
            </label>
            <input
              {...register('name')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Standard Approval Process"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Rule Type
            </label>
            <select
              {...register('type')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="percentage">Percentage Threshold</option>
              <option value="specific">Specific Approver</option>
              <option value="hybrid">Hybrid (Percentage OR Specific)</option>
            </select>
          </div>

          {(ruleType === 'percentage' || ruleType === 'hybrid') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Percentage Threshold (%)
              </label>
              <input
                {...register('percentageThreshold', { valueAsNumber: true })}
                type="number"
                min="1"
                max="100"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              {errors.percentageThreshold && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.percentageThreshold.message}
                </p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Required percentage of approvers who must approve
              </p>
            </div>
          )}

          {(ruleType === 'specific' || ruleType === 'hybrid') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Specific Approvers (auto-approve if any approves)
              </label>
              <select
                {...register('specificApproverIds')}
                multiple
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                size={4}
              >
                {approvers.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name} ({user.role})
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-gray-500">
                Hold Ctrl/Cmd to select multiple
              </p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Approval Sequence
            </label>
            <select
              {...register('approvalSequence')}
              multiple
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              size={6}
            >
              {approvers.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name} ({user.role})
                </option>
              ))}
            </select>
            {errors.approvalSequence && (
              <p className="mt-1 text-sm text-red-600">
                {errors.approvalSequence.message}
              </p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              Hold Ctrl/Cmd to select multiple in order
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-blue-900 mb-2">Rule Behavior:</h4>
            <ul className="text-xs text-blue-800 space-y-1">
              {ruleType === 'percentage' && (
                <li>
                  Requires {watch('percentageThreshold')}% of approvers in sequence to
                  approve
                </li>
              )}
              {ruleType === 'specific' && (
                <li>Auto-approves if any specific approver approves</li>
              )}
              {ruleType === 'hybrid' && (
                <>
                  <li>Auto-approves if any specific approver approves, OR</li>
                  <li>
                    Approves if {watch('percentageThreshold')}% threshold is met
                  </li>
                </>
              )}
            </ul>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Save Rule
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

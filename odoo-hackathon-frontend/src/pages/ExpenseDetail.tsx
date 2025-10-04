import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { ArrowLeft, Download } from 'lucide-react';
import Layout from '../components/Layout';
import ApprovalTimeline from '../components/ApprovalTimeline';
import { useAppStore } from '../state/useAppStore';
import { getExpense, approveExpense, rejectExpense } from '../api/expenses';
import type { Expense } from '../types';
import { formatCurrency } from '../utils/currency';

export default function ExpenseDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, company } = useAppStore();
  const [expense, setExpense] = useState<Expense | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const { register, watch } = useForm<{ comment: string }>({
    defaultValues: { comment: '' },
  });

  const comment = watch('comment');

  useEffect(() => {
    loadExpense();
  }, [id]);

  const loadExpense = async () => {
    if (!id) return;

    setLoading(true);
    try {
      const data = await getExpense(id);
      setExpense(data);
    } catch (error) {
      console.error('Failed to load expense:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!expense || !user) return;

    setActionLoading(true);
    try {
      await approveExpense(expense.id, user.id, comment || undefined, company?.currency);
      await loadExpense();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to approve expense');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!expense || !user || !comment.trim()) {
      alert('Please provide a comment for rejection');
      return;
    }

    setActionLoading(true);
    try {
      await rejectExpense(expense.id, user.id, comment);
      await loadExpense();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to reject expense');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="text-center py-12">Loading...</div>
      </Layout>
    );
  }

  if (!expense) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-gray-600">Expense not found</p>
        </div>
      </Layout>
    );
  }

  const canApprove =
    expense.approvalTimeline[expense.currentApproverIndex]?.approverId === user?.id &&
    (expense.status === 'submitted' || expense.status === 'pending');

  return (
    <Layout>
      <div className="space-y-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Expense Details</h1>
            <p className="text-gray-600 mt-1">#{expense.id.slice(0, 8)}</p>
          </div>
          <span
            className={`px-4 py-2 text-sm font-medium rounded-full ${
              expense.status === 'approved'
                ? 'bg-green-100 text-green-700'
                : expense.status === 'rejected'
                ? 'bg-red-100 text-red-700'
                : expense.status === 'draft'
                ? 'bg-gray-100 text-gray-700'
                : 'bg-yellow-100 text-yellow-700'
            }`}
          >
            {expense.status}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Expense Information
              </h2>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Description</p>
                  <p className="font-medium text-gray-900">{expense.description}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Category</p>
                  <p className="font-medium text-gray-900">{expense.category}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Amount</p>
                  <p className="font-medium text-gray-900">
                    {formatCurrency(expense.amount, expense.currency)}
                  </p>
                  {expense.convertedAmount && expense.conversionRate && (
                    <p className="text-sm text-gray-500 mt-1">
                      ≈ {formatCurrency(expense.convertedAmount, company?.currency || 'USD')}{' '}
                      (rate {expense.conversionRate.toFixed(4)})
                    </p>
                  )}
                </div>
                <div>
                  <p className="text-sm text-gray-600">Date</p>
                  <p className="font-medium text-gray-900">
                    {new Date(expense.date).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Submitted By</p>
                  <p className="font-medium text-gray-900">{expense.userName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Submitted On</p>
                  <p className="font-medium text-gray-900">
                    {new Date(expense.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Expense Lines
              </h2>
              <div className="space-y-3">
                {expense.lines.map((line) => (
                  <div
                    key={line.id}
                    className="flex justify-between items-start p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{line.description}</p>
                      <p className="text-sm text-gray-600">{line.category}</p>
                    </div>
                    <p className="font-medium text-gray-900">
                      {formatCurrency(line.amount, expense.currency)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {expense.attachments.length > 0 && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Attachments
                </h2>
                <div className="space-y-3">
                  {expense.attachments.map((attachment) => (
                    <div
                      key={attachment.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{attachment.name}</p>
                        <p className="text-sm text-gray-600">
                          {(attachment.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                      <a
                        href={attachment.dataUrl}
                        download={attachment.name}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                      >
                        <Download className="w-5 h-5" />
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Approval Timeline
              </h2>
              <ApprovalTimeline
                timeline={expense.approvalTimeline}
                currentIndex={expense.currentApproverIndex}
              />
            </div>

            {canApprove && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Your Action Required
                </h2>

                <form className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Comment (optional for approval, required for rejection)
                    </label>
                    <textarea
                      {...register('comment')}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Add a comment..."
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={handleApprove}
                      disabled={actionLoading}
                      className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      onClick={handleReject}
                      disabled={actionLoading}
                      className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition disabled:opacity-50"
                    >
                      Reject
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}

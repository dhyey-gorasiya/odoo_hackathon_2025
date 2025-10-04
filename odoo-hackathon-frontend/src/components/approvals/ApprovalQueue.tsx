import { useState } from 'react';
import {
  CheckCircle,
  XCircle,
  Clock,
  User,
  MessageSquare,
  Filter,
  Search
} from 'lucide-react';
import { Expense } from '../../types';

const MOCK_PENDING_EXPENSES: Expense[] = [
  {
    id: '1',
    company_id: '1',
    employee_id: '2',
    amount: 245.50,
    currency: 'USD',
    converted_amount: 245.50,
    description: 'Client dinner at The Capital Grille',
    expense_date: '2025-10-02',
    status: 'pending',
    created_at: '2025-10-02T10:30:00Z',
    updated_at: '2025-10-02T10:30:00Z',
    employee: {
      id: '2',
      company_id: '1',
      email: 'john.doe@example.com',
      full_name: 'John Doe',
      role: 'employee',
      created_at: '',
      updated_at: ''
    },
    category: { id: '1', company_id: '1', name: 'Food & Meals', created_at: '' }
  },
  {
    id: '5',
    company_id: '1',
    employee_id: '3',
    amount: 890.00,
    currency: 'USD',
    converted_amount: 890.00,
    description: 'Conference registration fee',
    expense_date: '2025-10-01',
    status: 'pending',
    created_at: '2025-10-01T15:20:00Z',
    updated_at: '2025-10-01T15:20:00Z',
    employee: {
      id: '3',
      company_id: '1',
      email: 'sarah.smith@example.com',
      full_name: 'Sarah Smith',
      role: 'employee',
      created_at: '',
      updated_at: ''
    },
    category: { id: '5', company_id: '1', name: 'Travel', created_at: '' }
  },
  {
    id: '6',
    company_id: '1',
    employee_id: '2',
    amount: 156.75,
    currency: 'EUR',
    converted_amount: 175.56,
    description: 'Team lunch meeting',
    expense_date: '2025-09-30',
    status: 'pending',
    created_at: '2025-09-30T18:00:00Z',
    updated_at: '2025-09-30T18:00:00Z',
    employee: {
      id: '2',
      company_id: '1',
      email: 'john.doe@example.com',
      full_name: 'John Doe',
      role: 'employee',
      created_at: '',
      updated_at: ''
    },
    category: { id: '1', company_id: '1', name: 'Food & Meals', created_at: '' }
  },
];

export function ApprovalQueue() {
  const [expenses, setExpenses] = useState(MOCK_PENDING_EXPENSES);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [comment, setComment] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const handleApprove = (expenseId: string) => {
    setExpenses(expenses.filter(e => e.id !== expenseId));
    setSelectedExpense(null);
    setComment('');
  };

  const handleReject = (expenseId: string) => {
    if (!comment.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }
    setExpenses(expenses.filter(e => e.id !== expenseId));
    setSelectedExpense(null);
    setComment('');
  };

  const filteredExpenses = expenses.filter(expense =>
    expense.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    expense.employee?.full_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-gradient-to-r from-orange-600 to-red-600 p-6">
          <h2 className="text-2xl font-bold text-white flex items-center">
            <CheckCircle className="w-7 h-7 mr-3" />
            Pending Approvals
          </h2>
          <p className="text-orange-100 mt-1">
            Review and approve expense claims from your team
          </p>
        </div>

        <div className="p-6 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by employee or description..."
                className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
              />
            </div>
            <div className="flex items-center space-x-2 px-4 py-2.5 bg-orange-50 border border-orange-200 rounded-lg">
              <Clock className="w-5 h-5 text-orange-600" />
              <span className="font-medium text-orange-900">
                {filteredExpenses.length} Pending
              </span>
            </div>
          </div>
        </div>

        <div className="divide-y divide-slate-200">
          {filteredExpenses.map((expense) => (
            <div
              key={expense.id}
              className="p-6 hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                  <div className="p-3 bg-orange-100 rounded-lg">
                    <User className="w-6 h-6 text-orange-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="font-semibold text-slate-900">
                        {expense.employee?.full_name}
                      </h3>
                      <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-full">
                        {expense.category?.name}
                      </span>
                    </div>
                    <p className="text-slate-700 mb-2">{expense.description}</p>
                    <div className="flex items-center space-x-4 text-sm text-slate-600">
                      <span>
                        {new Date(expense.expense_date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </span>
                      <span>
                        Submitted {new Date(expense.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right ml-4">
                  <div className="text-xl font-bold text-slate-900 mb-4">
                    ${expense.converted_amount?.toFixed(2)}
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleReject(expense.id)}
                      className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                      title="Reject"
                    >
                      <XCircle className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setSelectedExpense(expense)}
                      className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors font-medium text-sm"
                    >
                      Review
                    </button>
                    <button
                      onClick={() => handleApprove(expense.id)}
                      className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors"
                      title="Approve"
                    >
                      <CheckCircle className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredExpenses.length === 0 && (
          <div className="p-12 text-center">
            <CheckCircle className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600 text-lg">No pending approvals</p>
            <p className="text-slate-500 text-sm mt-1">
              All expenses have been reviewed
            </p>
          </div>
        )}
      </div>

      {selectedExpense && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedExpense(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gradient-to-r from-orange-600 to-red-600 p-6">
              <h3 className="text-xl font-bold text-white">Review Expense</h3>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-slate-600">Employee</span>
                  <p className="font-medium text-slate-900">
                    {selectedExpense.employee?.full_name}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-slate-600">Amount</span>
                  <p className="text-2xl font-bold text-slate-900">
                    ${selectedExpense.converted_amount?.toFixed(2)}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-slate-600">Category</span>
                  <p className="font-medium text-slate-900">
                    {selectedExpense.category?.name}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-slate-600">Date</span>
                  <p className="font-medium text-slate-900">
                    {new Date(selectedExpense.expense_date).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div>
                <span className="text-sm text-slate-600 block mb-2">Description</span>
                <p className="text-slate-900 bg-slate-50 p-4 rounded-lg">
                  {selectedExpense.description}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Comments (Required for rejection)
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none resize-none"
                  placeholder="Add your comments..."
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => handleReject(selectedExpense.id)}
                  className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-all"
                >
                  <XCircle className="w-5 h-5" />
                  <span>Reject</span>
                </button>
                <button
                  onClick={() => setSelectedExpense(null)}
                  className="px-6 py-3 border-2 border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleApprove(selectedExpense.id)}
                  className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-all"
                >
                  <CheckCircle className="w-5 h-5" />
                  <span>Approve</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

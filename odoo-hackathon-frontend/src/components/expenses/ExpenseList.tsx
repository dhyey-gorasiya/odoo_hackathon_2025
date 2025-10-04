import { useState } from 'react';
import {
  Clock,
  CheckCircle,
  XCircle,
  FileText,
  Filter,
  Search,
  Eye
} from 'lucide-react';
import { Expense, ExpenseStatus } from '../../types';

const MOCK_EXPENSES: Expense[] = [
  {
    id: '1',
    company_id: '1',
    employee_id: '1',
    category_id: '1',
    amount: 245.50,
    currency: 'USD',
    converted_amount: 245.50,
    description: 'Client dinner at The Capital Grille',
    expense_date: '2025-10-02',
    status: 'pending',
    created_at: '2025-10-02T10:30:00Z',
    updated_at: '2025-10-02T10:30:00Z',
    category: { id: '1', company_id: '1', name: 'Food & Meals', created_at: '' }
  },
  {
    id: '2',
    company_id: '1',
    employee_id: '1',
    amount: 1200.00,
    currency: 'USD',
    converted_amount: 1200.00,
    description: 'Flight tickets to San Francisco',
    expense_date: '2025-09-28',
    status: 'approved',
    created_at: '2025-09-28T14:20:00Z',
    updated_at: '2025-09-29T09:15:00Z',
    category: { id: '2', company_id: '1', name: 'Travel', created_at: '' }
  },
  {
    id: '3',
    company_id: '1',
    employee_id: '1',
    amount: 450.00,
    currency: 'USD',
    converted_amount: 450.00,
    description: 'Hotel accommodation - 2 nights',
    expense_date: '2025-09-29',
    status: 'approved',
    created_at: '2025-09-29T08:00:00Z',
    updated_at: '2025-09-30T11:30:00Z',
    category: { id: '3', company_id: '1', name: 'Lodging', created_at: '' }
  },
  {
    id: '4',
    company_id: '1',
    employee_id: '1',
    amount: 85.00,
    currency: 'EUR',
    converted_amount: 95.20,
    description: 'Office supplies and stationery',
    expense_date: '2025-10-01',
    status: 'rejected',
    created_at: '2025-10-01T16:45:00Z',
    updated_at: '2025-10-02T08:00:00Z',
    category: { id: '4', company_id: '1', name: 'Office Supplies', created_at: '' }
  },
];

export function ExpenseList() {
  const [filter, setFilter] = useState<ExpenseStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);

  const filteredExpenses = MOCK_EXPENSES.filter(expense => {
    const matchesFilter = filter === 'all' || expense.status === filter;
    const matchesSearch = expense.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getStatusIcon = (status: ExpenseStatus) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'approved':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <FileText className="w-5 h-5 text-slate-600" />;
    }
  };

  const getStatusBadge = (status: ExpenseStatus) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      approved: 'bg-green-100 text-green-800 border-green-200',
      rejected: 'bg-red-100 text-red-800 border-red-200',
      draft: 'bg-slate-100 text-slate-800 border-slate-200',
    };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${styles[status]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-6">
          <h2 className="text-2xl font-bold text-white flex items-center">
            <FileText className="w-7 h-7 mr-3" />
            My Expenses
          </h2>
          <p className="text-blue-100 mt-1">Track and manage your expense claims</p>
        </div>

        <div className="p-6 border-b border-slate-200 bg-slate-50">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search expenses..."
                className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-slate-600" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as ExpenseStatus | 'all')}
                className="px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        </div>

        <div className="divide-y divide-slate-200">
          {filteredExpenses.map((expense) => (
            <div
              key={expense.id}
              className="p-6 hover:bg-slate-50 transition-colors cursor-pointer"
              onClick={() => setSelectedExpense(expense)}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                  <div className="p-3 bg-slate-100 rounded-lg">
                    {getStatusIcon(expense.status)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-slate-900">
                        {expense.description}
                      </h3>
                      {getStatusBadge(expense.status)}
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-slate-600">
                      <span className="flex items-center">
                        <FileText className="w-4 h-4 mr-1" />
                        {expense.category?.name || 'Uncategorized'}
                      </span>
                      <span>
                        {new Date(expense.expense_date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right ml-4">
                  <div className="text-xl font-bold text-slate-900">
                    ${expense.converted_amount?.toFixed(2)}
                  </div>
                  {expense.currency !== 'USD' && (
                    <div className="text-sm text-slate-600">
                      {expense.amount} {expense.currency}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredExpenses.length === 0 && (
          <div className="p-12 text-center">
            <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600 text-lg">No expenses found</p>
            <p className="text-slate-500 text-sm mt-1">Try adjusting your filters</p>
          </div>
        )}
      </div>

      {selectedExpense && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedExpense(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">Expense Details</h3>
                <button
                  onClick={() => setSelectedExpense(null)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <Eye className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Status</span>
                {getStatusBadge(selectedExpense.status)}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Amount</span>
                <span className="text-2xl font-bold text-slate-900">
                  ${selectedExpense.converted_amount?.toFixed(2)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Category</span>
                <span className="font-medium">{selectedExpense.category?.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Date</span>
                <span className="font-medium">
                  {new Date(selectedExpense.expense_date).toLocaleDateString()}
                </span>
              </div>
              <div>
                <span className="text-slate-600 block mb-2">Description</span>
                <p className="text-slate-900">{selectedExpense.description}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

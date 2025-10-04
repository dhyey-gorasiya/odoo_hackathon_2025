import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Receipt, CheckCircle, Clock, XCircle, TrendingUp } from 'lucide-react';
import Layout from '../components/Layout';
import { useAppStore } from '../state/useAppStore';
import { listExpenses } from '../api/expenses';
import type { Expense } from '../types';
import { formatCurrency } from '../utils/currency';

export default function Dashboard() {
  const { user, company } = useAppStore();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadExpenses();
  }, [user]);

  const loadExpenses = async () => {
    setLoading(true);
    try {
      const allExpenses = await listExpenses();
      const userExpenses = user?.role === 'admin'
        ? allExpenses
        : allExpenses.filter(e => e.userId === user?.id);
      setExpenses(userExpenses);
    } catch (error) {
      console.error('Failed to load expenses:', error);
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    {
      label: 'Total Expenses',
      value: expenses.length,
      icon: Receipt,
      color: 'blue',
    },
    {
      label: 'Approved',
      value: expenses.filter(e => e.status === 'approved').length,
      icon: CheckCircle,
      color: 'green',
    },
    {
      label: 'Pending',
      value: expenses.filter(e => e.status === 'pending' || e.status === 'submitted').length,
      icon: Clock,
      color: 'yellow',
    },
    {
      label: 'Rejected',
      value: expenses.filter(e => e.status === 'rejected').length,
      icon: XCircle,
      color: 'red',
    },
  ];

  const totalAmount = expenses
    .filter(e => e.status === 'approved')
    .reduce((sum, e) => sum + e.amount, 0);

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Welcome back, {user?.name}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {stats.map((stat) => {
            const Icon = stat.icon;
            const colorClasses = {
              blue: 'bg-blue-100 text-blue-600',
              green: 'bg-green-100 text-green-600',
              yellow: 'bg-yellow-100 text-yellow-600',
              red: 'bg-red-100 text-red-600',
            };

            return (
              <div
                key={stat.label}
                className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-lg ${colorClasses[stat.color as keyof typeof colorClasses]}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    <p className="text-sm text-gray-600">{stat.label}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-lg bg-green-100 text-green-600">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(totalAmount, company?.currency || 'USD')}
              </p>
              <p className="text-sm text-gray-600">Total Approved Expenses</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Recent Expenses</h2>
          </div>

          {loading ? (
            <div className="p-6 text-center text-gray-500">Loading...</div>
          ) : expenses.length === 0 ? (
            <div className="p-12 text-center">
              <Receipt className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-600 mb-4">No expenses yet</p>
              <Link
                to="/expenses/new"
                className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
              >
                Create Your First Expense
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {expenses.slice(0, 5).map((expense) => (
                    <tr key={expense.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <Link
                          to={`/expenses/${expense.id}`}
                          className="text-blue-600 hover:text-blue-700 font-medium"
                        >
                          {expense.description}
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-gray-900">
                        {formatCurrency(expense.amount, expense.currency)}
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {new Date(expense.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
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
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {expenses.length > 5 && (
            <div className="p-4 border-t border-gray-200 text-center">
              <Link
                to="/expenses"
                className="text-blue-600 hover:text-blue-700 font-medium text-sm"
              >
                View All Expenses →
              </Link>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

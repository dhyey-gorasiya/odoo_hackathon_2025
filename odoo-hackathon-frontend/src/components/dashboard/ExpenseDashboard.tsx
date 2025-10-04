import {
  TrendingUp,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  PieChart,
  BarChart3
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export function ExpenseDashboard() {
  const { user } = useAuth();

  const stats = [
    {
      label: 'Total Expenses',
      value: '$12,485.50',
      change: '+12.5%',
      icon: DollarSign,
      color: 'from-blue-600 to-cyan-600',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600'
    },
    {
      label: 'Pending Approval',
      value: '8',
      change: '-5.3%',
      icon: Clock,
      color: 'from-yellow-600 to-orange-600',
      bgColor: 'bg-yellow-50',
      iconColor: 'text-yellow-600'
    },
    {
      label: 'Approved',
      value: '42',
      change: '+18.2%',
      icon: CheckCircle,
      color: 'from-green-600 to-emerald-600',
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600'
    },
    {
      label: 'Rejected',
      value: '3',
      change: '-2.1%',
      icon: XCircle,
      color: 'from-red-600 to-rose-600',
      bgColor: 'bg-red-50',
      iconColor: 'text-red-600'
    },
  ];

  const categoryData = [
    { name: 'Travel', amount: 4200.00, percentage: 34, color: 'bg-blue-500' },
    { name: 'Food & Meals', amount: 2800.50, percentage: 22, color: 'bg-green-500' },
    { name: 'Lodging', amount: 2100.00, percentage: 17, color: 'bg-yellow-500' },
    { name: 'Transportation', amount: 1850.00, percentage: 15, color: 'bg-orange-500' },
    { name: 'Office Supplies', amount: 1535.00, percentage: 12, color: 'bg-purple-500' },
  ];

  const recentActivity = [
    { type: 'approved', description: 'Flight to San Francisco', amount: 1200.00, date: '2 hours ago' },
    { type: 'pending', description: 'Client dinner', amount: 245.50, date: '5 hours ago' },
    { type: 'approved', description: 'Hotel accommodation', amount: 450.00, date: '1 day ago' },
    { type: 'rejected', description: 'Office supplies', amount: 95.20, date: '2 days ago' },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl p-8 text-white shadow-xl">
        <h1 className="text-3xl font-bold mb-2">
          Welcome back, {user?.full_name}!
        </h1>
        <p className="text-blue-100">
          Here's an overview of your expense activity
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 ${stat.bgColor} rounded-lg`}>
                  <Icon className={`w-6 h-6 ${stat.iconColor}`} />
                </div>
                <span className={`text-sm font-medium ${
                  stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stat.change}
                </span>
              </div>
              <div>
                <p className="text-slate-600 text-sm mb-1">{stat.label}</p>
                <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-900 flex items-center">
              <PieChart className="w-6 h-6 mr-2 text-blue-600" />
              Expenses by Category
            </h2>
            <select className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none">
              <option>This Month</option>
              <option>Last Month</option>
              <option>This Year</option>
            </select>
          </div>
          <div className="space-y-4">
            {categoryData.map((category, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-slate-700">{category.name}</span>
                  <span className="text-slate-900 font-semibold">
                    ${category.amount.toFixed(2)}
                  </span>
                </div>
                <div className="relative h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`absolute top-0 left-0 h-full ${category.color} rounded-full transition-all`}
                    style={{ width: `${category.percentage}%` }}
                  />
                </div>
                <div className="text-xs text-slate-600">{category.percentage}% of total</div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-900 flex items-center">
              <BarChart3 className="w-6 h-6 mr-2 text-blue-600" />
              Recent Activity
            </h2>
          </div>
          <div className="space-y-4">
            {recentActivity.map((activity, index) => {
              const getStatusIcon = () => {
                switch (activity.type) {
                  case 'approved':
                    return <CheckCircle className="w-5 h-5 text-green-600" />;
                  case 'pending':
                    return <Clock className="w-5 h-5 text-yellow-600" />;
                  case 'rejected':
                    return <XCircle className="w-5 h-5 text-red-600" />;
                  default:
                    return null;
                }
              };

              const getStatusBg = () => {
                switch (activity.type) {
                  case 'approved':
                    return 'bg-green-50';
                  case 'pending':
                    return 'bg-yellow-50';
                  case 'rejected':
                    return 'bg-red-50';
                  default:
                    return 'bg-slate-50';
                }
              };

              return (
                <div key={index} className="flex items-center space-x-4 p-4 rounded-lg hover:bg-slate-50 transition-colors">
                  <div className={`p-2 ${getStatusBg()} rounded-lg`}>
                    {getStatusIcon()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900 truncate">
                      {activity.description}
                    </p>
                    <p className="text-sm text-slate-600">{activity.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-slate-900">
                      ${activity.amount.toFixed(2)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-8 text-white shadow-xl">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-2xl font-bold mb-2">Monthly Budget</h3>
            <p className="text-slate-300 mb-6">
              Track your spending against your monthly allowance
            </p>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Spent</span>
                <span className="text-2xl font-bold">$12,485.50</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Budget</span>
                <span className="text-xl font-semibold text-slate-400">$15,000.00</span>
              </div>
            </div>
          </div>
          <div className="p-4 bg-white/10 rounded-xl backdrop-blur-sm">
            <TrendingUp className="w-12 h-12" />
          </div>
        </div>
        <div className="mt-6">
          <div className="flex items-center justify-between text-sm mb-2">
            <span>83% used</span>
            <span>$2,514.50 remaining</span>
          </div>
          <div className="relative h-3 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"
              style={{ width: '83%' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

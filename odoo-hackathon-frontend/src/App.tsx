import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LoginForm } from './components/auth/LoginForm';
import { Sidebar } from './components/layout/Sidebar';
import { ExpenseDashboard } from './components/dashboard/ExpenseDashboard';
import { ExpenseList } from './components/expenses/ExpenseList';
import { ExpenseSubmitForm } from './components/expenses/ExpenseSubmitForm';
import { ApprovalQueue } from './components/approvals/ApprovalQueue';
import { UserManagement } from './components/admin/UserManagement';
import { ApprovalRules } from './components/admin/ApprovalRules';

function AppContent() {
  const { user, isLoading } = useAuth();
  const [activeView, setActiveView] = useState('dashboard');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <LoginForm />;
  }

  const renderView = () => {
    switch (activeView) {
      case 'dashboard':
        return <ExpenseDashboard />;
      case 'expenses':
        return <ExpenseList />;
      case 'submit':
        return <ExpenseSubmitForm />;
      case 'approvals':
        return <ApprovalQueue />;
      case 'users':
        return <UserManagement />;
      case 'settings':
        return <ApprovalRules />;
      default:
        return <ExpenseDashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar activeView={activeView} onViewChange={setActiveView} />
      <main className="flex-1 overflow-y-auto">
        <div className="p-8">
          {renderView()}
        </div>
      </main>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;

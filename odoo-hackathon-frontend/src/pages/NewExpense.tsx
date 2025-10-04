import Layout from '../components/Layout';
import ExpenseForm from '../components/ExpenseForm';

export default function NewExpense() {
  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">New Expense</h1>
        <ExpenseForm />
      </div>
    </Layout>
  );
}

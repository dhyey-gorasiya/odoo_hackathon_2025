import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Save } from 'lucide-react';
import Layout from '../components/Layout';
import { useAppStore } from '../state/useAppStore';
import { setCompanyCookie } from '../utils/cookieStore';
import type { Company } from '../types';

export default function Settings() {
  const { company, setCompany } = useAppStore();
  const [saved, setSaved] = useState(false);

  const { register, handleSubmit } = useForm({
    defaultValues: {
      name: company?.name || '',
      currency: company?.currency || 'USD',
      country: company?.country || '',
    },
  });

  const onSubmit = (data: Partial<Company>) => {
    if (!company) return;

    const updated = { ...company, ...data };
    setCompanyCookie(updated);
    setCompany(updated);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Company Settings</h1>

        {saved && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-sm text-green-800">Settings saved successfully!</p>
          </div>
        )}

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Company Name
              </label>
              <input
                {...register('name')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Default Currency
              </label>
              <select
                {...register('currency')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
                <option value="CAD">CAD</option>
                <option value="AUD">AUD</option>
                <option value="JPY">JPY</option>
                <option value="CHF">CHF</option>
                <option value="INR">INR</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Country
              </label>
              <input
                {...register('country')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2"
            >
              <Save className="w-5 h-5" />
              Save Settings
            </button>
          </form>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-yellow-900 mb-2">
            Security Notice
          </h3>
          <p className="text-sm text-yellow-800">
            This is a prototype application. All data is stored in browser cookies for
            demonstration purposes. In production, sensitive data should be stored
            server-side with proper encryption and HttpOnly cookies for session
            management.
          </p>
        </div>
      </div>
    </Layout>
  );
}

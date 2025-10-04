import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, X, Upload } from 'lucide-react';
import Papa from 'papaparse';
import Layout from '../components/Layout';
import { useAppStore } from '../state/useAppStore';
import { listUsers, createUser, updateUser, bulkImportUsers } from '../api/users';
import type { User, UserRole } from '../types';

const userSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().min(2, 'Name required'),
  role: z.enum(['employee', 'manager', 'finance', 'director', 'admin']),
  managerId: z.string().optional(),
  isManagerApprover: z.boolean().optional(),
});

type UserFormData = z.infer<typeof userSchema>;

export default function Users() {
  const { company } = useAppStore();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showImport, setShowImport] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
  });

  useEffect(() => {
    loadUsers();
  }, [company]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await listUsers(company?.id);
      setUsers(data);
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: UserFormData) => {
    if (!company) return;

    try {
      if (editingUser) {
        await updateUser(editingUser.id, data);
      } else {
        await createUser({
          ...data,
          companyId: company.id,
          isManagerApprover: data.isManagerApprover || false,
        });
      }
      await loadUsers();
      setShowModal(false);
      setEditingUser(null);
      reset();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to save user');
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    reset({
      email: user.email,
      password: user.password,
      name: user.name,
      role: user.role,
      managerId: user.managerId,
      isManagerApprover: user.isManagerApprover,
    });
    setShowModal(true);
  };

  const handleCSVImport = (file: File) => {
    Papa.parse(file, {
      header: true,
      complete: async (results) => {
        const importData = results.data
          .filter((row: any) => row.email && row.name)
          .map((row: any) => ({
            email: row.email,
            password: row.password || 'default123',
            name: row.name,
            role: (row.role || 'employee') as UserRole,
            companyId: company!.id,
            managerId: row.managerId || undefined,
            isManagerApprover: row.isManagerApprover === 'true',
          }));

        try {
          const result = await bulkImportUsers(importData);
          alert(
            `Imported ${result.success.length} users. ${result.errors.length} errors.`
          );
          if (result.errors.length > 0) {
            console.error('Import errors:', result.errors);
          }
          await loadUsers();
          setShowImport(false);
        } catch (error) {
          alert('Failed to import users');
        }
      },
    });
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Users</h1>
          <div className="flex gap-3">
            <button
              onClick={() => setShowImport(true)}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition flex items-center gap-2"
            >
              <Upload className="w-5 h-5" />
              Import CSV
            </button>
            <button
              onClick={() => {
                setEditingUser(null);
                reset({
                  email: '',
                  password: '',
                  name: '',
                  role: 'employee',
                  managerId: undefined,
                  isManagerApprover: false,
                });
                setShowModal(true);
              }}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add User
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          {loading ? (
            <div className="p-12 text-center text-gray-500">Loading...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Manager Approver
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {user.name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{user.email}</td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700">
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {user.isManagerApprover ? 'Yes' : 'No'}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleEdit(user)}
                          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                {editingUser ? 'Edit User' : 'Add User'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  {...register('name')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  {...register('email')}
                  type="email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  {...register('password')}
                  type="password"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <select
                  {...register('role')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="employee">Employee</option>
                  <option value="manager">Manager</option>
                  <option value="finance">Finance</option>
                  <option value="director">Director</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Manager
                </label>
                <select
                  {...register('managerId')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">No Manager</option>
                  {users
                    .filter((u) => u.role === 'manager' || u.role === 'admin')
                    .map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name}
                      </option>
                    ))}
                </select>
              </div>

              <div className="flex items-center">
                <input
                  {...register('isManagerApprover')}
                  type="checkbox"
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label className="ml-2 text-sm text-gray-700">
                  Is Manager Approver
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {editingUser ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showImport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Import Users (CSV)</h2>
              <button
                onClick={() => setShowImport(false)}
                className="p-1 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Upload a CSV file with columns: email, name, password, role, managerId,
                isManagerApprover
              </p>

              <label className="flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 transition">
                <div className="text-center">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Click to upload CSV</p>
                </div>
                <input
                  type="file"
                  accept=".csv"
                  onChange={(e) =>
                    e.target.files?.[0] && handleCSVImport(e.target.files[0])
                  }
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}

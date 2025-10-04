import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Trash2, Loader2, Upload } from 'lucide-react';
import { useAppStore } from '../state/useAppStore';
import { createExpense, updateExpense, submitExpense } from '../api/expenses';
import { getActiveRule } from '../api/rules';
import { listUsers } from '../api/users';
import { convertCurrency, formatCurrency } from '../utils/currency';
import type { Expense, Attachment } from '../types';
import ReceiptScanner from './ReceiptScanner';

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const expenseLineSchema = z.object({
  description: z.string().min(1, 'Description required'),
  amount: z.number().min(0.01, 'Amount must be positive'),
  category: z.string().min(1, 'Category required'),
});

const expenseSchema = z.object({
  amount: z.number().min(0.01, 'Amount must be positive'),
  currency: z.string().min(3, 'Currency required'),
  date: z.string().min(1, 'Date required'),
  category: z.string().min(1, 'Category required'),
  description: z.string().min(1, 'Description required'),
  lines: z.array(expenseLineSchema).min(1, 'At least one line required'),
});

type ExpenseFormData = z.infer<typeof expenseSchema>;

interface ExpenseFormProps {
  expense?: Expense;
  onSave?: (expense: Expense) => void;
}

const CATEGORIES = ['Travel', 'Meals', 'Office Supplies', 'Software', 'Marketing', 'Other'];
const CURRENCIES = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'CHF', 'INR'];

export default function ExpenseForm({ expense, onSave }: ExpenseFormProps) {
  const { user, company } = useAppStore();
  const navigate = useNavigate();
  const [attachments, setAttachments] = useState<Attachment[]>(expense?.attachments || []);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [conversion, setConversion] = useState<{ convertedAmount: number; rate: number } | null>(null);
  const [showScanner, setShowScanner] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseSchema),
    defaultValues: expense
      ? {
          amount: expense.amount,
          currency: expense.currency,
          date: expense.date,
          category: expense.category,
          description: expense.description,
          lines: expense.lines,
        }
      : {
          amount: 0,
          currency: company?.currency || 'USD',
          date: new Date().toISOString().split('T')[0],
          category: '',
          description: '',
          lines: [{ description: '', amount: 0, category: '' }],
        },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'lines',
  });

  const watchAmount = watch('amount');
  const watchCurrency = watch('currency');
  const watchLines = watch('lines');

  useEffect(() => {
    const totalAmount = watchLines.reduce((sum, line) => sum + (line.amount || 0), 0);
    setValue('amount', totalAmount);
  }, [watchLines, setValue]);

  useEffect(() => {
    if (watchCurrency && company?.currency && watchCurrency !== company.currency && watchAmount > 0) {
      convertCurrency(watchAmount, watchCurrency, company.currency)
        .then(setConversion)
        .catch(() => setConversion(null));
    } else {
      setConversion(null);
    }
  }, [watchAmount, watchCurrency, company?.currency]);

  const handleFileUpload = async (files: FileList | null) => {
    if (!files) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      if (file.size > MAX_FILE_SIZE) {
        alert(`File ${file.name} exceeds 5MB limit`);
        continue;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const attachment: Attachment = {
          id: `${Date.now()}-${i}`,
          name: file.name,
          size: file.size,
          type: file.type,
          dataUrl: e.target?.result as string,
        };
        setAttachments((prev) => [...prev, attachment]);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  const handleOCRScan = (data: { amount?: number; date?: string; currency?: string }) => {
    if (data.amount) setValue('amount', data.amount);
    if (data.date) setValue('date', data.date);
    if (data.currency) setValue('currency', data.currency);
    setShowScanner(false);
  };

  const saveDraft = async (data: ExpenseFormData) => {
    if (!user || !company) return;

    const linesWithIds = data.lines.map((line, idx) => ({
      ...line,
      id: expense?.lines[idx]?.id || `line-${Date.now()}-${idx}`,
    }));

    const expenseData = {
      userId: user.id,
      companyId: company.id,
      ...data,
      lines: linesWithIds,
      attachments,
      status: 'draft' as const,
    };

    try {
      const result = expense
        ? await updateExpense(expense.id, expenseData)
        : await createExpense(expenseData);

      if (onSave) {
        onSave(result);
      } else {
        navigate('/expenses');
      }
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to save draft');
    }
  };

  const submitForApproval = async (data: ExpenseFormData) => {
    if (!user || !company) return;

    setIsSubmitting(true);

    try {
      const linesWithIds = data.lines.map((line, idx) => ({
        ...line,
        id: expense?.lines[idx]?.id || `line-${Date.now()}-${idx}`,
      }));

      const expenseData = {
        userId: user.id,
        companyId: company.id,
        ...data,
        lines: linesWithIds,
        attachments,
        status: 'submitted' as const,
      };

      const result = expense
        ? await updateExpense(expense.id, expenseData)
        : await createExpense(expenseData);

      const activeRule = await getActiveRule(company.id);
      let approvalSequence: string[] = [];

      if (user.managerId && user.isManagerApprover) {
        approvalSequence.push(user.managerId);
      }

      if (activeRule) {
        approvalSequence = [...approvalSequence, ...activeRule.approvalSequence];
      } else {
        const users = await listUsers(company.id);
        const approvers = users.filter((u) =>
          ['manager', 'finance', 'director', 'admin'].includes(u.role)
        );
        approvalSequence = [...approvalSequence, ...approvers.map((u) => u.id)];
      }

      await submitExpense(result.id, approvalSequence);

      if (onSave) {
        onSave(result);
      } else {
        navigate('/expenses');
      }
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to submit expense');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {showScanner && (
        <ReceiptScanner
          onScan={handleOCRScan}
          onClose={() => setShowScanner(false)}
        />
      )}

      <form className="space-y-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Expense Details</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date
              </label>
              <input
                {...register('date')}
                type="date"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              {errors.date && (
                <p className="mt-1 text-sm text-red-600">{errors.date.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Currency
              </label>
              <select
                {...register('currency')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {CURRENCIES.map((curr) => (
                  <option key={curr} value={curr}>
                    {curr}
                  </option>
                ))}
              </select>
              {errors.currency && (
                <p className="mt-1 text-sm text-red-600">{errors.currency.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                {...register('category')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select category</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Total Amount
              </label>
              <input
                {...register('amount', { valueAsNumber: true })}
                type="number"
                step="0.01"
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
              />
              {conversion && (
                <p className="mt-1 text-sm text-gray-600">
                  ≈ {formatCurrency(conversion.convertedAmount, company?.currency || 'USD')} (rate {conversion.rate.toFixed(4)})
                </p>
              )}
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              {...register('description')}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Brief description of the expense"
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
            )}
          </div>

          <button
            type="button"
            onClick={() => setShowScanner(true)}
            className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            Scan Receipt (OCR)
          </button>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Expense Lines</h3>
            <button
              type="button"
              onClick={() => append({ description: '', amount: 0, category: '' })}
              className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-1 text-sm"
            >
              <Plus className="w-4 h-4" />
              Add Line
            </button>
          </div>

          <div className="space-y-3">
            {fields.map((field, index) => (
              <div key={field.id} className="flex gap-3 items-start">
                <div className="flex-1">
                  <input
                    {...register(`lines.${index}.description`)}
                    placeholder="Description"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="w-40">
                  <input
                    {...register(`lines.${index}.amount`, { valueAsNumber: true })}
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="w-40">
                  <select
                    {...register(`lines.${index}.category`)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Category</option>
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
                {fields.length > 1 && (
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Attachments</h3>

          <div className="space-y-3">
            <label className="flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 transition">
              <div className="text-center">
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">
                  Click to upload or drag and drop
                </p>
                <p className="text-xs text-gray-500">Max 5MB per file</p>
              </div>
              <input
                type="file"
                multiple
                onChange={(e) => handleFileUpload(e.target.files)}
                className="hidden"
                accept="image/*,.pdf"
              />
            </label>

            {attachments.map((attachment) => (
              <div
                key={attachment.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{attachment.name}</p>
                  <p className="text-xs text-gray-500">
                    {(attachment.size / 1024).toFixed(1)} KB
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => removeAttachment(attachment.id)}
                  className="p-1 text-red-600 hover:bg-red-50 rounded"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleSubmit(saveDraft)}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
          >
            Save Draft
          </button>
          <button
            type="button"
            onClick={handleSubmit(submitForApproval)}
            disabled={isSubmitting}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
            {isSubmitting ? 'Submitting...' : 'Submit for Approval'}
          </button>
        </div>
      </form>
    </div>
  );
}

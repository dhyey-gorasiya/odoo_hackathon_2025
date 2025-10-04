import { v4 as uuidv4 } from 'uuid';
import type { Expense, ExpenseStatus, ExpenseLine, Attachment, ApprovalStep } from '../types';
import { getExpensesCookie, setExpensesCookie, getUsersCookie } from '../utils/cookieStore';
import { convertCurrency } from '../utils/currency';

export interface CreateExpenseDTO {
  userId: string;
  companyId: string;
  amount: number;
  currency: string;
  date: string;
  category: string;
  description: string;
  lines: ExpenseLine[];
  attachments: Attachment[];
  status?: ExpenseStatus;
}

export interface ExpenseFilter {
  userId?: string;
  status?: ExpenseStatus;
  dateFrom?: string;
  dateTo?: string;
}

export async function createExpense(dto: CreateExpenseDTO): Promise<Expense> {
  const expenses = getExpensesCookie();
  const users = getUsersCookie();
  const user = users.find(u => u.id === dto.userId);

  if (!user) {
    throw new Error('User not found');
  }

  const expense: Expense = {
    id: uuidv4(),
    userId: dto.userId,
    userName: user.name,
    companyId: dto.companyId,
    status: dto.status || 'draft',
    amount: dto.amount,
    currency: dto.currency,
    date: dto.date,
    category: dto.category,
    description: dto.description,
    lines: dto.lines,
    attachments: dto.attachments,
    approvalTimeline: [],
    currentApproverIndex: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  expenses.push(expense);
  setExpensesCookie(expenses);

  return expense;
}

export async function updateExpense(id: string, updates: Partial<Expense>): Promise<Expense> {
  const expenses = getExpensesCookie();
  const index = expenses.findIndex(e => e.id === id);

  if (index === -1) {
    throw new Error('Expense not found');
  }

  expenses[index] = {
    ...expenses[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  setExpensesCookie(expenses);

  return expenses[index];
}

export async function listExpenses(filter?: ExpenseFilter): Promise<Expense[]> {
  let expenses = getExpensesCookie();

  if (filter) {
    if (filter.userId) {
      expenses = expenses.filter(e => e.userId === filter.userId);
    }

    if (filter.status) {
      expenses = expenses.filter(e => e.status === filter.status);
    }

    if (filter.dateFrom) {
      expenses = expenses.filter(e => e.date >= filter.dateFrom!);
    }

    if (filter.dateTo) {
      expenses = expenses.filter(e => e.date <= filter.dateTo!);
    }
  }

  return expenses.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function getExpense(id: string): Promise<Expense | null> {
  const expenses = getExpensesCookie();
  return expenses.find(e => e.id === id) || null;
}

export async function submitExpense(id: string, approvalSequence: string[]): Promise<Expense> {
  const expenses = getExpensesCookie();
  const index = expenses.findIndex(e => e.id === id);

  if (index === -1) {
    throw new Error('Expense not found');
  }

  const users = getUsersCookie();
  const expense = expenses[index];

  const approvalTimeline: ApprovalStep[] = approvalSequence.map(approverId => {
    const approver = users.find(u => u.id === approverId);
    return {
      approverId,
      approverName: approver?.name || 'Unknown',
      status: 'pending',
    };
  });

  expenses[index] = {
    ...expense,
    status: 'submitted',
    approvalTimeline,
    currentApproverIndex: 0,
    updatedAt: new Date().toISOString(),
  };

  setExpensesCookie(expenses);

  return expenses[index];
}

export async function approveExpense(
  id: string,
  approverId: string,
  comment?: string,
  companyCurrency?: string
): Promise<Expense> {
  const expenses = getExpensesCookie();
  const index = expenses.findIndex(e => e.id === id);

  if (index === -1) {
    throw new Error('Expense not found');
  }

  const expense = expenses[index];
  const currentStep = expense.approvalTimeline[expense.currentApproverIndex];

  if (!currentStep || currentStep.approverId !== approverId) {
    throw new Error('Not authorized to approve at this step');
  }

  currentStep.status = 'approved';
  currentStep.comment = comment;
  currentStep.timestamp = new Date().toISOString();

  if (expense.currentApproverIndex < expense.approvalTimeline.length - 1) {
    expense.currentApproverIndex++;
    expense.status = 'pending';
  } else {
    expense.status = 'approved';

    if (companyCurrency && expense.currency !== companyCurrency) {
      const conversion = await convertCurrency(expense.amount, expense.currency, companyCurrency);
      expense.convertedAmount = conversion.convertedAmount;
      expense.conversionRate = conversion.rate;
    }
  }

  expenses[index] = {
    ...expense,
    updatedAt: new Date().toISOString(),
  };

  setExpensesCookie(expenses);

  return expenses[index];
}

export async function rejectExpense(id: string, approverId: string, comment: string): Promise<Expense> {
  const expenses = getExpensesCookie();
  const index = expenses.findIndex(e => e.id === id);

  if (index === -1) {
    throw new Error('Expense not found');
  }

  const expense = expenses[index];
  const currentStep = expense.approvalTimeline[expense.currentApproverIndex];

  if (!currentStep || currentStep.approverId !== approverId) {
    throw new Error('Not authorized to reject at this step');
  }

  currentStep.status = 'rejected';
  currentStep.comment = comment;
  currentStep.timestamp = new Date().toISOString();

  expense.status = 'rejected';

  expenses[index] = {
    ...expense,
    updatedAt: new Date().toISOString(),
  };

  setExpensesCookie(expenses);

  return expenses[index];
}

export async function deleteExpense(id: string): Promise<void> {
  const expenses = getExpensesCookie();
  const filtered = expenses.filter(e => e.id !== id);
  setExpensesCookie(filtered);
}

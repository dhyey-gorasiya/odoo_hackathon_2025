export type UserRole = 'employee' | 'manager' | 'finance' | 'director' | 'admin';

export type ExpenseStatus = 'draft' | 'submitted' | 'pending' | 'approved' | 'rejected';

export interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  role: UserRole;
  companyId: string;
  managerId?: string;
  isManagerApprover: boolean;
  createdAt: string;
}

export interface Company {
  id: string;
  name: string;
  currency: string;
  country: string;
  createdAt: string;
}

export interface ExpenseLine {
  id: string;
  description: string;
  amount: number;
  category: string;
}

export interface Attachment {
  id: string;
  name: string;
  size: number;
  type: string;
  dataUrl: string;
}

export interface ApprovalStep {
  approverId: string;
  approverName: string;
  status: 'pending' | 'approved' | 'rejected';
  comment?: string;
  timestamp?: string;
}

export interface Expense {
  id: string;
  userId: string;
  userName: string;
  companyId: string;
  status: ExpenseStatus;
  amount: number;
  currency: string;
  date: string;
  category: string;
  description: string;
  lines: ExpenseLine[];
  attachments: Attachment[];
  approvalTimeline: ApprovalStep[];
  currentApproverIndex: number;
  convertedAmount?: number;
  conversionRate?: number;
  createdAt: string;
  updatedAt: string;
}

export type RuleType = 'percentage' | 'specific' | 'hybrid';

export interface ApprovalRule {
  id: string;
  name: string;
  companyId: string;
  type: RuleType;
  percentageThreshold?: number;
  specificApproverIds?: string[];
  approvalSequence: string[];
  isActive: boolean;
  createdAt: string;
}

export interface Session {
  userId: string;
  companyId: string;
  expiresAt: string;
}

export interface UIPreferences {
  lastCurrency?: string;
  pageSize: number;
  filters: Record<string, unknown>;
}

export interface CurrencyRate {
  base: string;
  rates: Record<string, number>;
  lastUpdated: string;
}

export interface Country {
  name: string;
  currencies: string[];
}

export type UserRole = 'admin' | 'manager' | 'employee';

export type ExpenseStatus = 'draft' | 'pending' | 'approved' | 'rejected';

export type ApprovalStatus = 'pending' | 'approved' | 'rejected';

export type RuleType = 'percentage' | 'specific_approver' | 'hybrid';

export interface User {
  id: string;
  company_id: string;
  email: string;
  full_name: string;
  role: UserRole;
  manager_id?: string;
  created_at: string;
  updated_at: string;
}

export interface Company {
  id: string;
  name: string;
  default_currency: string;
  country?: string;
  created_at: string;
  updated_at: string;
}

export interface ExpenseCategory {
  id: string;
  company_id: string;
  name: string;
  description?: string;
  created_at: string;
}

export interface Expense {
  id: string;
  company_id: string;
  employee_id: string;
  category_id?: string;
  amount: number;
  currency: string;
  converted_amount?: number;
  exchange_rate?: number;
  description: string;
  expense_date: string;
  receipt_url?: string;
  ocr_data?: any;
  status: ExpenseStatus;
  created_at: string;
  updated_at: string;
  employee?: User;
  category?: ExpenseCategory;
}

export interface ApprovalRule {
  id: string;
  company_id: string;
  name: string;
  rule_type: RuleType;
  percentage_required?: number;
  specific_approver_id?: string;
  approver_ids: string[];
  is_active: boolean;
  created_at: string;
}

export interface Approval {
  id: string;
  expense_id: string;
  approver_id: string;
  status: ApprovalStatus;
  comments?: string;
  approval_order: number;
  approved_at?: string;
  created_at: string;
  approver?: User;
}

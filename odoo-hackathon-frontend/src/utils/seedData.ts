import type { User, Company, Expense, ApprovalRule } from '../types';
import {
  setUsersCookie,
  setCompanyCookie,
  setExpensesCookie,
  setRulesCookie,
  setSessionCookie,
} from './cookieStore';

export function seedDemoData(): void {
  const company: Company = {
    id: 'demo-company-1',
    name: 'Demo Corp',
    currency: 'USD',
    country: 'United States',
    createdAt: new Date().toISOString(),
  };

  const users: User[] = [
    {
      id: 'admin-1',
      email: 'admin@demo.com',
      password: 'admin123',
      name: 'Admin User',
      role: 'admin',
      companyId: company.id,
      isManagerApprover: false,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'manager-1',
      email: 'manager@demo.com',
      password: 'manager123',
      name: 'Manager Smith',
      role: 'manager',
      companyId: company.id,
      isManagerApprover: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'finance-1',
      email: 'finance@demo.com',
      password: 'finance123',
      name: 'Finance Director',
      role: 'finance',
      companyId: company.id,
      isManagerApprover: false,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'employee-1',
      email: 'employee@demo.com',
      password: 'employee123',
      name: 'John Employee',
      role: 'employee',
      companyId: company.id,
      managerId: 'manager-1',
      isManagerApprover: false,
      createdAt: new Date().toISOString(),
    },
  ];

  const expenses: Expense[] = [
    {
      id: 'expense-1',
      userId: 'employee-1',
      userName: 'John Employee',
      companyId: company.id,
      status: 'submitted',
      amount: 150.0,
      currency: 'USD',
      date: new Date().toISOString().split('T')[0],
      category: 'Travel',
      description: 'Client meeting transportation',
      lines: [
        {
          id: 'line-1',
          description: 'Taxi to client office',
          amount: 150.0,
          category: 'Travel',
        },
      ],
      attachments: [],
      approvalTimeline: [
        {
          approverId: 'manager-1',
          approverName: 'Manager Smith',
          status: 'pending',
        },
        {
          approverId: 'finance-1',
          approverName: 'Finance Director',
          status: 'pending',
        },
      ],
      currentApproverIndex: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  const rules: ApprovalRule[] = [
    {
      id: 'rule-1',
      name: 'Standard Approval',
      companyId: company.id,
      type: 'percentage',
      percentageThreshold: 50,
      approvalSequence: ['manager-1', 'finance-1'],
      isActive: true,
      createdAt: new Date().toISOString(),
    },
  ];

  setCompanyCookie(company);
  setUsersCookie(users);
  setExpensesCookie(expenses);
  setRulesCookie(rules);

  console.log('Demo data seeded successfully!');
  console.log('Login credentials:');
  console.log('Admin: admin@demo.com / admin123');
  console.log('Manager: manager@demo.com / manager123');
  console.log('Finance: finance@demo.com / finance123');
  console.log('Employee: employee@demo.com / employee123');
}

export function clearDemoData(): void {
  setUsersCookie([]);
  setCompanyCookie(null as any);
  setExpensesCookie([]);
  setRulesCookie([]);
  setSessionCookie(null);
  console.log('Demo data cleared!');
}

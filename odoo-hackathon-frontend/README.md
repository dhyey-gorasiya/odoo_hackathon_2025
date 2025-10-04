# Expense Management Application

A complete, production-quality frontend-only expense management system built with React, TypeScript, and cookie-based persistence.

## Features

### Core Functionality
- **User Authentication**: Signup and login with cookie-based sessions
- **Company Management**: First signup creates company and assigns admin role
- **Expense Submission**: Create expenses with multiple lines, attachments, and currency support
- **OCR Receipt Scanning**: Simulated receipt scanning to extract expense data
- **Multi-level Approval Workflow**: Configurable approval sequences with manager approvals
- **Currency Conversion**: Real-time exchange rates with 12-hour caching
- **User Management**: Create, edit, and bulk import users via CSV
- **Approval Rules Engine**: Percentage, specific approver, and hybrid rule types
- **Cookie Inspector**: Debug panel to view and manage all cookie data

### Technical Highlights
- **Cookie-based Persistence**: All data stored in versioned browser cookies
- **Type-safe**: Full TypeScript implementation
- **Form Validation**: Zod schemas with react-hook-form
- **State Management**: Zustand for app state
- **API Integration**: React Query for external APIs (countries, exchange rates)
- **Responsive Design**: Mobile-first Tailwind CSS styling
- **Accessibility**: Keyboard navigation and ARIA labels

## Tech Stack

- **React 18** with TypeScript
- **Vite** - Build tool
- **React Router v6** - Routing
- **Zustand** - State management
- **React Query** - Server state & caching
- **React Hook Form + Zod** - Form handling & validation
- **Axios** - HTTP client
- **js-cookie** - Cookie management
- **Tailwind CSS** - Styling
- **Lucide React** - Icons
- **PapaParse** - CSV parsing

## Getting Started

### Prerequisites
- Node.js 16+ and npm

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd expense-management-app

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Start development server
npm run dev
```

The application will be available at `http://localhost:5173`

### Demo Data

Use the Cookie Inspector to seed demo data with pre-configured users:

**Login Credentials:**
- Admin: `admin@demo.com` / `admin123`
- Manager: `manager@demo.com` / `manager123`
- Finance: `finance@demo.com` / `finance123`
- Employee: `employee@demo.com` / `employee123`

Or create your own account via the signup page.

## Application Structure

```
src/
├── api/              # Simulated API modules (cookie-backed)
│   ├── auth.ts       # Authentication (signup, login, logout)
│   ├── users.ts      # User management
│   ├── expenses.ts   # Expense CRUD operations
│   ├── rules.ts      # Approval rules management
│   └── countries.ts  # External countries API
├── components/       # Reusable UI components
│   ├── Layout.tsx
│   ├── ExpenseForm.tsx
│   ├── ReceiptScanner.tsx
│   ├── ApprovalTimeline.tsx
│   └── RuleEditor.tsx
├── pages/            # Route pages
│   ├── Signup.tsx
│   ├── Login.tsx
│   ├── Dashboard.tsx
│   ├── Expenses.tsx
│   ├── ExpenseDetail.tsx
│   ├── Users.tsx
│   ├── Rules.tsx
│   ├── Settings.tsx
│   └── CookieInspector.tsx
├── state/            # Zustand stores
│   └── useAppStore.ts
├── utils/            # Utility functions
│   ├── cookieStore.ts    # Cookie persistence helpers
│   ├── currency.ts       # Currency conversion
│   ├── rules.ts          # Approval rule evaluation
│   ├── ocr.ts            # OCR simulation
│   └── seedData.ts       # Demo data seeding
├── types/            # TypeScript type definitions
│   └── index.ts
└── App.tsx           # Main app with routing
```

## Cookie Structure

All data is stored in versioned cookies with 30-day expiry:

- `expapp_users` (v:1) - User accounts
- `expapp_company` (v:1) - Company settings
- `expapp_expenses` (v:1) - Expense records
- `expapp_rules` (v:1) - Approval rules
- `expapp_session` (v:1) - Current session (userId, companyId)
- `expapp_prefs` (v:1) - UI preferences
- `expapp_rates_{CURRENCY}` - Exchange rate cache (12-hour TTL)

## Key Workflows

### Signup Flow
1. User enters details and selects country
2. Currency auto-populated from country (editable)
3. First signup creates company and admin user
4. Subsequent signups create employee users
5. Session cookie created, redirect to dashboard

### Expense Submission
1. Employee creates expense with lines and attachments
2. Optional OCR scan to extract data from receipts
3. Currency conversion shown if different from company currency
4. Save as draft or submit for approval
5. Approval sequence determined by:
   - Manager approver flag (if set, goes to direct manager first)
   - Active approval rule OR default approvers

### Approval Process
1. Expense submitted with approval sequence
2. Each approver reviews in order
3. Approver can approve (with optional comment) or reject (comment required)
4. On approval, moves to next approver
5. Final approval converts currency and marks complete
6. Rejection immediately marks expense as rejected
7. Timeline shows all approver actions with timestamps

### Approval Rules
- **Percentage Rule**: Requires X% of approvers to approve
- **Specific Approver Rule**: Auto-approves if designated approver approves
- **Hybrid Rule**: Percentage threshold OR specific approver (whichever comes first)
- Rules can be tested in sandbox before activation

## Migration to Backend

To replace cookie storage with a real backend:

### 1. API Interfaces
All API functions in `src/api/` are already structured as async functions. Replace implementations:

```typescript
// Before (cookie-backed)
export async function createUser(dto: CreateUserDTO): Promise<User> {
  const users = getUsersCookie();
  // ... cookie logic
}

// After (backend)
export async function createUser(dto: CreateUserDTO): Promise<User> {
  const response = await axios.post('/api/users', dto);
  return response.data;
}
```

### 2. Required Backend Endpoints

**Authentication:**
- `POST /api/auth/signup`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`

**Users:**
- `GET /api/users`
- `POST /api/users`
- `PATCH /api/users/:id`
- `DELETE /api/users/:id`
- `POST /api/users/bulk-import`

**Expenses:**
- `GET /api/expenses`
- `POST /api/expenses`
- `GET /api/expenses/:id`
- `PATCH /api/expenses/:id`
- `POST /api/expenses/:id/submit`
- `POST /api/expenses/:id/approve`
- `POST /api/expenses/:id/reject`

**Rules:**
- `GET /api/rules`
- `POST /api/rules`
- `PATCH /api/rules/:id`
- `DELETE /api/rules/:id`

**Company:**
- `GET /api/company`
- `PATCH /api/company`

### 3. Security Improvements
- Hash passwords server-side (bcrypt)
- Use HttpOnly cookies for session tokens
- Implement CSRF protection
- Add rate limiting
- Validate all inputs server-side
- Use environment variables for secrets

### 4. Database Schema
Recommended tables: users, companies, expenses, expense_lines, attachments, approval_rules, approval_steps

## Scripts

```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run preview    # Preview production build
npm run lint       # Run ESLint
npm run typecheck  # TypeScript type checking
```

## Security Notes

⚠️ **This is a prototype application** ⚠️

- Passwords stored in plain text (cookies)
- No HttpOnly cookie protection
- Client-side only validation
- No CSRF protection
- Cookie storage size limits (~4KB per cookie)

**For production use:**
- Implement proper backend with database
- Use secure password hashing (bcrypt, argon2)
- HttpOnly cookies for sessions
- Server-side validation
- HTTPS required
- Regular security audits

## Browser Compatibility

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

Requires JavaScript and cookies enabled.

## Acceptance Checklist

✅ Signup creates company and admin user
✅ Admin can create users and assign roles/managers
✅ Employee submits expense with currency conversion
✅ Manager approval workflow with timeline
✅ Multi-level approval sequences
✅ Percentage-based approval rules
✅ Specific approver auto-approval
✅ Hybrid rules (percentage OR specific)
✅ Currency conversion with exchange rate caching
✅ OCR receipt scanning (simulated)
✅ CSV user import
✅ Cookie-based persistence with versioning
✅ Cookie Inspector for debugging
✅ Responsive mobile-first design
✅ Accessibility features (ARIA, keyboard nav)

## License

MIT

## Contributing

This is a prototype application. For production deployment, implement proper backend infrastructure.

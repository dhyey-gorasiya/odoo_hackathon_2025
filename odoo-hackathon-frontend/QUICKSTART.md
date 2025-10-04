# Quick Start Guide

Get the expense management app running in 2 minutes.

## Installation

```bash
npm install
npm run dev
```

Open http://localhost:5173

## First-Time Setup

### Option 1: Use Demo Data (Fastest)

1. Navigate to http://localhost:5173/login
2. Click the Database icon in the top-right
3. Click "Seed Demo Data"
4. Return to login and use:
   - **Admin**: `admin@demo.com` / `admin123`
   - **Employee**: `employee@demo.com` / `employee123`

### Option 2: Create New Account

1. Navigate to http://localhost:5173/signup
2. Fill in the form:
   - Name: `John Doe`
   - Email: `john@example.com`
   - Password: `password123`
   - Company: `My Company`
   - Country: `United States` (currency auto-fills to USD)
3. Click "Sign Up"
4. You're now logged in as admin!

## Quick Tour

### As Admin

**Create Users:**
1. Click "Users" in navigation
2. Click "Add User"
3. Fill details, assign role, set manager if needed
4. Click "Create"

**Set Approval Rule:**
1. Click "Approval Rules"
2. Click "New Rule"
3. Choose rule type:
   - **Percentage**: e.g., 50% requires half of approvers
   - **Specific**: auto-approves if certain person approves
   - **Hybrid**: percentage OR specific approver
4. Select approvers in sequence
5. Save and activate

**View All Expenses:**
1. Click "Expenses"
2. See all company expenses
3. Click any expense to see timeline

### As Employee

**Submit Expense:**
1. Click "Expenses" → "New Expense"
2. Enter date, category, description
3. Add expense lines (e.g., "Taxi: $50")
4. (Optional) Click "Scan Receipt (OCR)" to test OCR feature
5. Add attachments if needed
6. Click "Submit for Approval"

**Check Status:**
1. Click "Expenses"
2. See your submitted expenses
3. Click to view approval timeline

### As Manager/Approver

**Approve/Reject Expenses:**
1. Click "Expenses"
2. See expenses awaiting your approval
3. Click expense to view details
4. Scroll to "Your Action Required"
5. Add comment (optional for approve, required for reject)
6. Click "Approve" or "Reject"

## Key Features to Try

### Currency Conversion
1. Create expense in EUR (select from currency dropdown)
2. Watch real-time conversion to company currency (USD)
3. Submit expense - final approval converts and stores rate

### OCR Receipt Scan
1. Create expense
2. Click "Scan Receipt (OCR)"
3. Upload file named: `receipt_125.50_USD_2024-01-15.jpg`
4. See extracted data auto-fill form
5. Edit if needed, then apply

### CSV User Import
1. Go to "Users"
2. Click "Import CSV"
3. Upload CSV with columns: email, name, password, role, managerId, isManagerApprover
4. Example row: `john@test.com,John Doe,pass123,employee,,false`

### Test Approval Rules
1. Create approval rule
2. Click "Test" button
3. See simulated approval result with explanation

### Cookie Inspector
1. Click Database icon (top-right)
2. View all cookie data
3. See exchange rate cache
4. Clear cookies or reseed demo data

## Common Scenarios

### Scenario 1: Basic Expense Flow

```
Employee creates $100 taxi expense
    ↓
Manager reviews and approves
    ↓
Finance reviews and approves
    ↓
Expense marked approved, currency converted
```

**Try it:**
1. Login as employee
2. Create expense
3. Logout, login as manager
4. Approve expense
5. Logout, login as admin/finance
6. Approve again
7. Check expense status (approved!)

### Scenario 2: Manager Approver Flag

```
Employee has "manager approver" enabled
    ↓
Expense goes to direct manager FIRST
    ↓
Then follows normal approval sequence
```

**Try it:**
1. Login as admin
2. Edit employee, set manager and enable "Is Manager Approver"
3. Login as employee, submit expense
4. Expense now requires manager approval before others

### Scenario 3: Specific Approver Rule

```
CFO is set as specific approver
    ↓
When CFO approves, expense auto-approved
    ↓
Other approvers bypassed
```

**Try it:**
1. Create rule type "Specific"
2. Select CFO user as specific approver
3. Activate rule
4. Submit expense as employee
5. Login as CFO, approve
6. Expense immediately approved!

## Troubleshooting

**Can't login?**
- Check email/password
- Use Cookie Inspector → Seed Demo Data
- Or signup new account

**Expenses not showing?**
- Employees only see their own expenses
- Admins/managers see all expenses
- Check status filter (try "All Status")

**Currency conversion not working?**
- Check internet connection (needs exchange rate API)
- May use cached rates (12-hour expiry)
- Fallback to 1:1 if API fails

**Changes not persisting?**
- Data stored in cookies - check cookies enabled
- Don't use incognito/private mode
- Cookie Inspector shows all stored data

**Build errors?**
- Delete node_modules and package-lock.json
- Run `npm install` again
- Try `npm run typecheck` to see errors

## Development

```bash
# Development server
npm run dev

# Type checking
npm run typecheck

# Linting
npm run lint

# Production build
npm run build

# Preview production
npm run preview
```

## Project Structure

```
src/
  api/         - Simulated APIs (cookie-backed)
  components/  - Reusable UI components
  pages/       - Route pages
  state/       - Zustand store
  utils/       - Helper functions
  types/       - TypeScript definitions
```

## Next Steps

1. ✅ Get app running
2. ✅ Explore with demo data
3. ✅ Try creating expenses
4. ✅ Test approval workflows
5. ✅ Experiment with rules
6. ✅ Check Cookie Inspector
7. 📖 Read README.md for full docs
8. 📖 Read IMPLEMENTATION.md for technical details

## Need Help?

- Check README.md for detailed documentation
- View IMPLEMENTATION.md for architecture details
- All code is commented for clarity
- Cookie Inspector shows all data for debugging

---

**Happy testing!** 🚀

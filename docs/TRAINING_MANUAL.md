# ERP DryMix Products - User Training Manual

## Table of Contents
1. [Getting Started](#getting-started)
2. [Dashboard Overview](#dashboard-overview)
3. [Sales Module](#sales-module)
4. [Production Module](#production-module)
5. [Quality Module](#quality-module)
6. [Inventory Module](#inventory-module)
7. [Finance Module](#finance-module)
8. [HR Module](#hr-module)
9. [System Administration](#system-administration)
10. [Tips & Best Practices](#tips--best-practices)

---

## Getting Started

### 1. Login Process

1. Open your web browser
2. Navigate to: `https://erp.yourcompany.com`
3. Enter your credentials:
   - **Email:** Your registered email address
   - **Password:** Your secure password
4. Click "Sign In" button
5. You will be redirected to the dashboard

### 2. First Time Setup

#### Password Change
1. Click on your name in the top-right corner
2. Select "Profile" from dropdown
3. Click "Change Password"
4. Enter current password
5. Enter new password (minimum 8 characters)
6. Confirm new password
7. Click "Update Password"

#### Profile Settings
1. Navigate to Profile → Settings
2. Update your personal information
3. Set your time zone
4. Configure notification preferences
5. Click "Save Changes"

---

## Dashboard Overview

### Key Components

#### 1. Navigation Menu (Left Sidebar)
- **Dashboard:** Main overview screen
- **Sales:** Orders, invoices, projects
- **Products:** Product catalog and management
- **Customers:** Customer database
- **Production:** Orders, batches, reports
- **Quality:** Inspections, tests, certificates
- **Inventory:** Stock, movements, transfers
- **Procurement:** Purchase orders, suppliers
- **Finance:** Accounts, vouchers, reports
- **HR:** Employees, attendance, payroll
- **Planning:** Production plans, forecasts
- **Communication:** Templates, messages
- **Credit Control:** Customers, limits
- **System:** Users, roles, settings

#### 2. Quick Actions (Top Right)
- Create new records
- Access recent items
- View notifications
- User profile settings

#### 3. Search Bar (Top)
- Global search across all modules
- Filter by module, date, status
- Advanced search options

#### 4. Dashboard Widgets (Center)
- KPI Cards: Key performance indicators
- Charts: Visual data representation
- Recent Activity: Latest updates
- Alerts: Important notifications

---

## Sales Module

### 1. Creating Sales Orders

**Step-by-Step Guide:**

1. Navigate to **Sales → Sales Orders**
2. Click **"Create Order"** button (top right)
3. Fill in order details:
   - **Customer:** Select from dropdown
   - **Order Date:** Default is today
   - **Delivery Date:** Select delivery date
   - **Delivery Address:** Enter shipping address
   - **Notes:** Add any special instructions

4. Add order items:
   - Click **"Add Item"**
   - Select product from dropdown
   - Enter quantity
   - Unit price auto-fills
   - Line total calculates automatically
   - Repeat for multiple items

5. Review order summary:
   - Subtotal
   - Tax (18% GST)
   - Grand total

6. Click **"Save Order"** or **"Save & Submit"**

**Pro Tips:**
- Use search to quickly find products
- Add notes for special requirements
- Set priority for urgent orders
- Save as draft if not ready to submit

### 2. Managing Invoices

**Creating Invoice:**

1. Go to **Sales → Invoices**
2. Click **"Create Invoice"**
3. Select sales order to invoice
4. Review items and quantities
5. Add invoice details:
   - Invoice date
   - Due date
   - Payment terms
6. Click **"Generate Invoice"**

**Sending Invoice:**

1. Open invoice
2. Click **"Send Email"** button
3. Review recipient email
4. Add message (optional)
5. Click **"Send"**

**Printing Invoice:**

1. Open invoice
2. Click **"Print"** button
3. Select printer
4. Adjust print settings
5. Click **"Print"**

### 3. Managing Projects

**Creating Project:**

1. Navigate to **Sales → Projects**
2. Click **"Create Project"**
3. Fill in project information:
   - Project name
   - Customer
   - Site address
   - Start date
   - End date
   - Project value
   - Project manager
4. Click **"Save Project"**

**Tracking Progress:**

1. Open project details
2. Update progress percentage
3. Add milestone updates
4. Upload related documents
5. View project timeline

---

## Production Module

### 1. Creating Production Orders

**Steps:**

1. Go to **Production → Orders**
2. Click **"Create Production Order"**
3. Select product to manufacture
4. Enter production details:
   - Target quantity
   - Unit of measure
   - Start date
   - End date
   - Priority level
   - Warehouse location
5. Review BOM components
6. Click **"Save Order"**

**Starting Production:**

1. Open production order
2. Click **"Start Production"**
3. Create production batch
4. Assign workstations
5. Add workers to batch

### 2. Managing Production Batches

**Creating Batch:**

1. From production order, click **"Create Batch"**
2. Enter batch details:
   - Batch number
   - Production line
   - Start time
   - Estimated end time
3. Assign resources:
   - Materials (auto-requisitioned)
   - Equipment
   - Personnel
4. Click **"Start Batch"**

**Updating Batch Progress:**

1. Open batch details
2. Update current quantity
3. Record any issues
4. Add quality checks
5. Complete batch when finished

**Completing Batch:**

1. Update final quantity
2. Record actual time
3. Document any variances
4. Generate batch report
5. Submit to quality inspection

### 3. Production Reports

**Generating Reports:**

1. Go to **Production → Reports**
2. Select report type:
   - Production Summary
   - Batch Performance
   - Resource Utilization
   - Quality Compliance
   - Cost Analysis
3. Set date range
4. Select filters
5. Click **"Generate Report"**

**Exporting Reports:**

1. View generated report
2. Click **"Export"**
3. Select format:
   - PDF (for printing)
   - Excel (for analysis)
   - CSV (for data import)
4. Download file

---

## Quality Module

### 1. Creating Quality Inspections

**Inspection Process:**

1. Navigate to **Quality → Inspections**
2. Click **"Create Inspection"**
3. Select inspection type:
   - Incoming Material
   - In-Process
   - Finished Product
   - Customer Return
4. Enter inspection details:
   - Product/batch
   - Inspection date
   - Inspection standard
   - Inspector
5. Define test parameters:
   - Parameter name
   - Test method
   - Specification limits
   - Acceptance criteria
6. Click **"Save Inspection"**

**Recording Results:**

1. Open inspection
2. For each parameter:
   - Enter actual value
   - Select pass/fail
   - Add comments if needed
3. Upload supporting documents:
   - Test certificates
   - Lab reports
   - Photos
4. Submit inspection
5. System calculates overall result

### 2. Managing Non-Conformance Reports (NCR)

**Creating NCR:**

1. Go to **Quality → NCRs**
2. Click **"Create NCR"**
3. Enter NCR details:
   - Reference (order/batch)
   - Issue description
   - Severity level
   - Discovery date
4. Root Cause Analysis:
   - What happened?
   - Why did it happen?
   - Root cause
5. Corrective Actions:
   - Immediate actions
   - Long-term solutions
   - Responsible person
   - Target completion date
6. Click **"Submit NCR"**

**NCR Workflow:**

1. **Created:** Initial NCR submission
2. **Under Review:** Quality manager reviews
3. **Investigation:** Root cause analysis
4. **Action Plan:** Corrective actions defined
5. **In Progress:** Actions being implemented
6. **Verification:** Actions verified
7. **Closed:** NCR resolved and documented

### 3. Quality Certificates

**Generating Certificate:**

1. Open completed inspection
2. Click **"Generate Certificate"**
3. Review certificate details:
   - Product information
   - Test results summary
   - Compliance statement
4. Customize if needed:
   - Add company logo
   - Include signature
   - Add remarks
5. Click **"Generate PDF"**

**Distributing Certificate:**

1. Download generated PDF
2. Email to customer
3. Attach to delivery documents
4. Archive in quality records

---

## Inventory Module

### 1. Viewing Stock Levels

**Stock Overview:**

1. Navigate to **Inventory → Stock**
2. View real-time stock levels:
   - Available quantity
   - Reserved quantity
   - On-hand quantity
   - Reorder point
   - Safety stock
3. Filter by:
   - Warehouse
   - Product category
   - Stock status
4. Export stock report

### 2. Stock Transfers

**Creating Transfer:**

1. Go to **Inventory → Transfers**
2. Click **"Create Transfer"**
3. Enter transfer details:
   - Source warehouse
   - Destination warehouse
   - Transfer date
4. Add items to transfer:
   - Select product
   - Enter quantity
   - Verify availability
5. Add notes if needed
6. Submit for approval
7. Approved transfer initiates

**Completing Transfer:**

1. Open transfer
2. Verify items received
3. Update actual quantities
4. Note any discrepancies
5. Confirm transfer complete

### 3. Stock Adjustments

**Creating Adjustment:**

1. Navigate to **Inventory → Adjustments**
2. Click **"Create Adjustment"**
3. Enter adjustment details:
   - Warehouse
   - Adjustment date
   - Reason (damage, loss, recount, etc.)
4. Add adjustments:
   - Select product
   - Current quantity
   - Adjusted quantity
   - Difference
   - Reason
5. Upload supporting documents
6. Submit for approval
7. Approved adjustment updates stock

---

## Finance Module

### 1. Chart of Accounts

**Viewing Accounts:**

1. Go to **Finance → Chart of Accounts**
2. View account hierarchy:
   - Assets (1000-1999)
   - Liabilities (2000-2999)
   - Equity (3000-3999)
   - Revenue (4000-4999)
   - Expenses (5000-5999)
3. Expand/collapse account groups
4. Search for specific accounts

**Creating Journal Voucher:**

1. Navigate to **Finance → Vouchers**
2. Click **"Create Voucher"**
3. Enter voucher details:
   - Voucher type (Journal, Receipt, Payment)
   - Voucher date
   - Voucher number (auto-generated)
4. Add journal entries:
   - Select account (debit)
   - Enter amount
   - Select account (credit)
   - Enter amount
   - Add description
5. Balance must be zero
6. Attach supporting documents
7. Submit voucher

### 2. Financial Reports

**Trial Balance:**

1. Go to **Finance → Reports → Trial Balance**
2. Select date range
3. Click **"Generate"**
4. View:
   - Debit balances
   - Credit balances
   - Net difference (should be zero)
5. Export or print

**Balance Sheet:**

1. Navigate to **Finance → Reports → Balance Sheet**
2. Select reporting date
3. Click **"Generate"**
4. View:
   - Total assets
   - Total liabilities
   - Total equity
   - Verify balance (Assets = Liabilities + Equity)

**Profit & Loss:**

1. Go to **Finance → Reports → Profit & Loss**
2. Select period (month, quarter, year)
3. Click **"Generate"**
4. View:
   - Total revenue
   - Total expenses
   - Net profit/loss
5. Export for analysis

---

## HR Module

### 1. Employee Management

**Adding Employee:**

1. Navigate to **HR → Employees**
2. Click **"Add Employee"**
3. Enter personal details:
   - Name
   - Employee ID
   - Contact information
   - Emergency contact
4. Enter employment details:
   - Department
   - Designation
   - Joining date
   - Employment type
5. Enter compensation:
   - Basic salary
   - Allowances
   - Deductions
6. Upload documents:
   - Resume
   - ID proof
   - Educational certificates
7. Click **"Save Employee"**

### 2. Attendance Management

**Recording Attendance:**

1. Go to **HR → Attendance**
2. Select date
3. For each employee:
   - Mark status: Present, Absent, Leave, Holiday
   - Add check-in time
   - Add check-out time
   - Add notes if needed
4. Click **"Save Attendance"**

**Managing Leave:**

1. Navigate to **HR → Leave**
2. View leave requests
3. Process requests:
   - Approve: Updates leave balance
   - Reject: Adds reason to employee record
   - Pending: Awaiting action

### 3. Payroll Processing

**Running Payroll:**

1. Go to **HR → Payroll**
2. Click **"Process Payroll"**
3. Select payroll period:
   - Month
   - Year
4. Review payroll calculations:
   - Days worked
   - Basic salary
   - Allowances
   - Deductions
   - Net salary
5. Process adjustments:
   - Overtime
   - Bonuses
   - Arrears
6. Click **"Process Payroll"**
7. Review generated payslips
8. Finalize payroll

**Generating Payslips:**

1. Open processed payroll
2. Select employee
3. Click **"View Payslip"**
4. Review payslip details
5. Click **"Download PDF"**
6. Email to employee or print

---

## System Administration

### 1. User Management

**Creating User:**

1. Go to **System → Users**
2. Click **"Create User"**
3. Enter user details:
   - Name
   - Email
   - Phone
   - Department
4. Assign role:
   - Super Admin
   - Admin
   - Manager
   - User
5. Set password or send email for setup
6. Set status (Active/Inactive)
7. Click **"Save User"**

**Managing Permissions:**

1. Navigate to **System → Roles**
2. Select role to configure
3. Configure module permissions:
   - Sales: View, Create, Edit, Delete
   - Production: View, Create, Edit, Delete
   - Quality: View, Create, Edit, Delete
   - (And so on for all modules)
4. Configure record-level permissions:
   - All records
   - Own records
   - Department records
5. Click **"Save Role"**

### 2. System Settings

**General Settings:**

1. Go to **System → Settings**
2. Configure:
   - Company name
   - Logo
   - Address
   - Contact details
   - Time zone
   - Currency
   - Tax rates

**Email Configuration:**

1. Navigate to **System → Settings → Email**
2. Configure SMTP:
   - Host (e.g., smtp.gmail.com)
   - Port (e.g., 587)
   - Username
   - Password
   - Encryption (TLS/SSL)
3. Test email configuration
4. Save settings

---

## Tips & Best Practices

### General Tips

1. **Save Frequently:**
   - Use "Save Draft" for lengthy forms
   - Don't leave forms open without saving

2. **Use Search:**
   - Global search for quick access
   - Filter results by module, date, status

3. **Keyboard Shortcuts:**
   - Ctrl+S: Save
   - Ctrl+P: Print
   - Ctrl+F: Find

4. **Data Validation:**
   - Review data before submission
   - Check for required fields
   - Verify calculations

### Module-Specific Tips

**Sales:**
- Create customer profiles for faster order entry
- Use templates for recurring orders
- Track order status regularly
- Follow up on overdue payments

**Production:**
- Plan production in advance
- Monitor batch progress
- Maintain proper documentation
- Communicate with quality team

**Quality:**
- Follow inspection schedules strictly
- Document all test results
- Address issues immediately
- Maintain calibration records

**Inventory:**
- Perform regular stock counts
- Monitor reorder points
- Maintain FIFO principle
- Document all movements

**Finance:**
- Reconcile accounts daily
- Document all transactions
- Follow up on pending payments
- Review reports regularly

### Common Mistakes to Avoid

1. **Incomplete Data:**
   - Always fill required fields
   - Provide complete information

2. **Incorrect Calculations:**
   - Verify all calculations
   - Cross-check totals

3. **Missing Documentation:**
   - Attach supporting documents
   - Keep records organized

4. **Ignoring Alerts:**
   - Review all notifications
   - Take action on warnings

5. **Poor Communication:**
   - Inform relevant team members
   - Share important updates

---

## Getting Help

### Support Resources

1. **User Manual:** Refer to this documentation
2. **Help Desk:** Submit support ticket
3. **Training Videos:** Available in system
4. **FAQ:** Check frequently asked questions
5. **Contact System Administrator:** For urgent issues

### Reporting Issues

1. Navigate to **System → Support**
2. Click **"Submit Ticket"**
3. Enter issue details:
   - Module affected
   - Issue description
   - Steps to reproduce
   - Screenshots if applicable
4. Submit ticket
5. Track ticket status in dashboard

---

## Quick Reference Card

### Common Tasks

| Task | Navigation | Action |
|------|------------|--------|
| Create Order | Sales → Orders | Click "Create Order" |
| Create Invoice | Sales → Invoices | Click "Create Invoice" |
| View Stock | Inventory → Stock | Browse by warehouse |
| Start Production | Production → Orders | Click "Start Production" |
| Record Inspection | Quality → Inspections | Click "Create Inspection" |
| Add Employee | HR → Employees | Click "Add Employee" |
| Generate Report | Finance → Reports | Select report type |
| Create User | System → Users | Click "Create User" |

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| Ctrl + S | Save |
| Ctrl + P | Print |
| Ctrl + F | Find |
| Ctrl + N | New |
| Ctrl + E | Export |
| Ctrl + R | Refresh |
| Esc | Close dialog |
| Enter | Submit form |

### Status Colors

- **Green:** Completed/Approved/Active
- **Yellow:** In Progress/Pending
- **Red:** Failed/Rejected/Inactive
- **Blue:** Draft/New

---

## Conclusion

This ERP system is designed to streamline your business operations. Regular use and adherence to best practices will maximize its benefits.

**Remember:**
- Keep data accurate and up-to-date
- Follow established workflows
- Communicate with team members
- Seek help when needed

**For additional training or support, contact your system administrator.**

---

*Version: 1.0.0*
*Last Updated: 2026-01-15*

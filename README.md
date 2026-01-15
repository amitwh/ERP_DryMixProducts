# ERP DryMix Products

A comprehensive Enterprise Resource Planning system for cementitious dry mix manufacturing industry.

## 🏗️ Tech Stack

### Backend
- **Framework**: Laravel 10+ (PHP 8.1+)
- **Database**: MariaDB 10.11+
- **Cache**: Redis 7+
- **API Authentication**: Laravel Sanctum
- **Python Integration**: Python scripts in `backend/app/Services/Python/`

### Frontend
- **Framework**: React 18+ with TypeScript
- **Build Tool**: Vite
- **Styling**: TailwindCSS
- **State Management**: React Context API
- **Routing**: React Router DOM v6
- **HTTP Client**: Axios
- **Forms**: React Hook Form + Zod validation
- **Tables**: TanStack Table v8
- **Charts**: Recharts
- **Icons**: Lucide React

### Infrastructure
- **Container**: Docker & Docker Compose
- **Web Server**: Nginx
- **Reverse Proxy**: Docker Gateway

---

## 📋 Project Modules

The ERP consists of **21 modules** organized into 3 categories:

### Core Foundation (4 modules)
1. **User & Access Management** - User authentication, roles, permissions
2. **Dashboard & Analytics** - KPI cards, charts, data visualization
3. **Settings & Configuration** - System settings, preferences
4. **Document Management** - Document storage, digital certificates

### Primary Modules (13 modules)
5. **QA/QC Module** - Test forms, NCR, quality reports, certificates
6. **Planning Module** - Production plans, forecasts, MRP, capacity planning
7. **Stores & Inventory Module** - Stock management, transfers, warehouses, movements
8. **Production Module** - Production orders, batches, QC checkpoints, reports
9. **Sales & Customer Management** - Orders, invoices, payments, returns, projects
10. **Procurement Module** - POs, suppliers, RFQs, PRs, approvals
11. **Finance & Accounting** - Ledger, P&L, vouchers, financial reports
12. **HR & Payroll** - Employees, attendance, leave, payroll, payslips
13. **Analytics & Reporting** - Custom reports, data analytics
14. **AI/ML & Predictions** - Demand forecasting, predictions
15. **Communications Module** - SMS, WhatsApp, email templates, logs
16. **Cloud Storage Integration** - File storage, backup
17. **External ERP Integration** - API integrations
18. **Plant Automation Integration** - IoT, PLC integration

### Administrative Modules (3 modules)
19. **Organization Management** - Multi-organization setup
20. **System Administration** - Users, roles, system settings
21. **API & Integration Management** - API keys, webhooks

---

## 🚀 Quick Start

### Prerequisites
- PHP 8.1+
- Composer 2.x
- Node.js 16+
- npm 8.x+
- Docker & Docker Compose
- MariaDB 10.11+
- Redis 7+

### Backend Setup

```bash
# Navigate to backend
cd backend

# Install dependencies
composer install

# Copy environment file
cp .env.example .env

# Generate application key
php artisan key:generate

# Run migrations
php artisan migrate

# Seed database (optional)
php artisan migrate:fresh --seed

# Create storage link
php artisan storage:link

# Start development server
php artisan serve

# Access API at http://localhost:8000/api/v1
```

### Frontend Setup

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Start development server
npm run dev

# Access frontend at http://localhost:3000
```

### Docker Setup

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down

# Restart specific service
docker-compose restart backend
```

---

## 📁 Project Structure

### Backend Structure
```
backend/
├── app/
│   ├── Console/           # Artisan commands
│   ├── Exceptions/         # Exception handlers
│   ├── Http/
│   │   ├── Controllers/
│   │   │   └── Api/       # API controllers (RESTful)
│   ├── Middleware/     # Custom middleware
│   ├── Models/            # Eloquent models
│   ├── Providers/         # Service providers
│   └── Services/          # Business logic services
├── config/                # Laravel configuration
├── database/
│   ├── migrations/        # Database migrations
│   └── seeders/          # Database seeders
├── routes/
│   ├── api.php            # API routes (primary)
│   └── web.php            # Web routes
├── storage/                # Application storage
└── tests/                  # Test suites
```

### Frontend Structure
```
frontend/
├── public/                # Static assets
├── src/
│   ├── components/       # Reusable components
│   │   ├── ui/            # UI components (DataTable, Form, Badge, etc.)
│   ├── pages/            # Page components by module
│   ├── layouts/          # Layout components
│   │   └── MainLayout.tsx  # Main layout with navigation
│   ├── hooks/            # Custom React hooks
│   ├── services/         # API services
│   ├── types/            # TypeScript types
│   ├── utils/            # Utility functions
│   ├── context/          # React contexts (AuthContext, etc.)
│   ├── App.tsx             # Root component
│   └── main.tsx            # Entry point
├── dist/                # Build output (generated)
├── index.html             # HTML entry
├── vite.config.ts         # Vite configuration
├── tailwind.config.js     # TailwindCSS configuration
└── tsconfig.json          # TypeScript configuration
```

---

## 🔐 API Endpoints

All API endpoints are prefixed with `/api/v1/` and require authentication via Bearer token.

### Authentication
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/logout` - User logout
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/refresh` - Refresh access token

### Core
- `GET /api/v1/dashboard/overview` - Dashboard overview
- `GET /api/v1/settings/profile` - User profile
- `PUT /api/v1/settings/profile` - Update profile

### Sales Module
- `GET /api/v1/sales/orders` - List sales orders
- `POST /api/v1/sales/orders` - Create order
- `GET /api/v1/sales/orders/{id}` - Order details
- `PUT /api/v1/sales/orders/{id}` - Update order
- `DELETE /api/v1/sales/orders/{id}` - Delete order
- `GET /api/v1/sales/invoices` - List invoices
- `POST /api/v1/sales/invoices` - Create invoice
- `GET /api/v1/sales/invoices/{id}` - Invoice details
- `GET /api/v1/sales/payments` - Payment history
- `GET /api/v1/sales/customers` - Customer list
- `GET /api/v1/sales/projects` - Project list

### Production Module
- `GET /api/v1/production/orders` - Production orders
- `POST /api/v1/production/orders` - Create production order
- `GET /api/v1/production/orders/{id}` - Order details
- `GET /api/v1/production/batches` - Production batches
- `GET /api/v1/production/batches/{id}` - Batch details
- `GET /api/v1/production/qc-checkpoints` - QC checkpoints
- `GET /api/v1/production/reports` - Production reports

### Inventory Module
- `GET /api/v1/inventory/stock` - Stock items
- `GET /api/v1/inventory/stock/{id}` - Stock details
- `POST /api/v1/inventory/transfers` - Create transfer
- `GET /api/v1/inventory/warehouses` - Warehouse list
- `GET /api/v1/inventory/movements` - Stock movements

### QA/QC Module
- `GET /api/v1/quality/inspections` - Inspections
- `POST /api/v1/quality/inspections` - Create inspection
- `GET /api/v1/quality/inspections/{id}` - Inspection details
- `GET /api/v1/quality/tests` - Quality tests
- `POST /api/v1/quality/tests` - Create test
- `GET /api/v1/quality/ncrs` - Non-conformance reports
- `GET /api/v1/quality/certificates` - Digital certificates
- `GET /api/v1/quality/reports` - Quality reports

### Planning Module
- `GET /api/v1/planning/plans` - Production plans
- `POST /api/v1/planning/plans` - Create plan
- `GET /api/v1/planning/forecasts` - Demand forecasts
- `GET /api/v1/planning/mrp` - Material requirements planning
- `GET /api/v1/planning/capacity` - Capacity planning

### Procurement Module
- `GET /api/v1/procurement/purchase-orders` - Purchase orders
- `POST /api/v1/procurement/purchase-orders` - Create PO
- `GET /api/v1/procurement/purchase-orders/{id}` - PO details
- `GET /api/v1/procurement/suppliers` - Supplier list
- `GET /api/v1/procurement/requests` - PR requests
- `GET /api/v1/procurement/approvals` - Approval queues

### Finance Module
- `GET /api/v1/finance/dashboard` - Finance dashboard
- `GET /api/v1/finance/accounts` - Chart of accounts
- `GET /api/v1/finance/ledgers/{id}` - Account ledger
- `GET /api/v1/finance/vouchers` - Journal vouchers
- `GET /api/v1/finance/profit-loss` - P&L statement
- `GET /api/v1/finance/trial-balance` - Trial balance
- `GET /api/v1/finance/balance-sheet` - Balance sheet
- `GET /api/v1/finance/reports` - Financial reports

### HR & Payroll Module
- `GET /api/v1/hr-payroll/employees` - Employee list
- `GET /api/v1/hr-payroll/employees/{id}` - Employee details
- `POST /api/v1/hr-payroll/employees` - Create employee
- `GET /api/v1/hr-payroll/attendance` - Attendance records
- `GET /api/v1/hr-payroll/leave-requests` - Leave requests
- `GET /api/v1/hr-payroll/payroll-runs` - Payroll runs
- `GET /api/v1/hr-payroll/payslips` - Payslips

### Communications Module
- `GET /api/v1/communication/templates` - Message templates
- `POST /api/v1/communication/templates` - Create template
- `GET /api/v1/communication/templates/{id}` - Template details
-GET /api/v1/communication/sms/send` - Send SMS
- `GET /api/v1/communication/whatsapp/send` - Send WhatsApp
- `GET /api/v1/communication/logs` - Communication logs

### System Administration
- `GET /api/v1/system/users` - User list
- `GET /api/v1/system/users/{id}` - User details
- `POST /api/v1/system/users` - Create user
- `GET /api/v1/system/roles` - Role list
- `GET /api/v1/system/roles/{id}` - Role details
-GET /api/v1/system/permissions` - Permission list
-GET /api/v1/system/organizations` - Organizations
- `GET /api/v1/system/modules` - Module management
- `GET /api/v1/system/settings` - System settings

---

## 🎨 Frontend Pages

### Core Foundation
- `src/pages/DashboardPage.tsx` - Main dashboard with KPI cards
- `src/pages/SettingsProfilePage.tsx` - User profile settings

### Sales Module
- `src/pages/sales/SalesOrdersPage.tsx` - Sales orders list
- `src/pages/sales/SalesOrderDetailPage.tsx` - Order detail
- `src/pages/sales/CreateSalesOrderPage.tsx` - Create order
- `src/pages/sales/InvoicesPage.tsx` - Invoices list
- `src/pages/sales/CreateInvoicePage.tsx` - Create invoice
- `src/pages/sales/CustomersPage.tsx` - Customers list
- `src/pages/sales/CreateCustomerPage.tsx` - Create customer
- `src/pages/sales/ProjectsPage.tsx` - Projects list
- `src/pages/sales/CreateProjectPage.tsx` - Create project

### Production Module
- `src/pages/production/ProductionOrdersPage.tsx` - Production orders
- `src/pages/production/ProductionOrderDetailPage.tsx` - Order detail
- src/pages/production/CreateProductionOrderPage.tsx - Create order
- `src/pages/production/ProductionBatchesPage.tsx` - Production batches
- `src/pages/production/ProductionBatchDetailPage.tsx` - Batch detail
- src/pages/production/WorkStationsPage.tsx` - Workstations
- src/pages/production/ProductionReportsPage.tsx` - Production reports

### QA/QC Module
- `src/pages/quality/QualityInspectionsPage.tsx` - Inspections list
- `src/pages/quality/InspectionDetailPage.tsx` - Inspection detail
- src/pages/quality/CreateInspectionPage.tsx` - Create inspection
- `src/pages/quality/QualityTestsPage.tsx` - Quality tests list
- src/pages/quality/CreateDryMixTestPage.tsx` - Create dry mix test
- `src/pages/quality/CreateRawMaterialTestPage.tsx` - Create raw material test
- src/pages/quality/NCRsPage.tsx` - Non-conformance reports
- `src/pages/quality/NCRDetailPage.tsx` - NCR detail
- `src/pages/quality/CertificatesPage.tsx` - Digital certificates
- `src/pages/quality/QualityReportsPage.tsx` - Quality reports

### Inventory Module
- `src/pages/inventory/InventoryPage.tsx` - Inventory overview
- src/pages/inventory/StockPage.tsx` - Stock items
- src/pages/inventory/StockDetailPage.tsx` - Stock detail
- `src/pages/inventory/CreateStockTransferPage.tsx` - Create transfer
- src/pages/inventory/StockMovementsPage.tsx` - Stock movements
- src/pages/inventory/WarehousePage.tsx` - Warehouse management
- src/pages/inventory/AdjustmentsPage.tsx` - Stock adjustments

### Procurement Module
- `src/pages/procurement/PurchaseOrdersPage.tsx` - Purchase orders
- src/pages/procurement/PurchaseOrderDetailPage.tsx` - PO detail
- src/pages/procurement/CreatePurchaseOrderPage.tsx` - Create PO
- src/pages/procurement/SuppliersPage.tsx` - Supplier list
- src/pages/procurement/CreateSupplierPage.tsx` - Create supplier
- src/pages/procurement/RequestsPage.tsx` - PR requests
- src/pages/procurement/RequestsListPage.tsx` - Request list
- src/pages/procurement/ApprovalsPage.tsx` - Approval queues

### Finance Module
- `src/pages/finance/FinanceDashboardPage.tsx` - Finance dashboard
- `src/pages/finance/AccountsPage.tsx` - Chart of accounts
- `src/pages/finance/LedgerViewPage.tsx` - Account ledger
- `src/pages/finance/VouchersPage.tsx` - Journal vouchers
- `src/pages/finance/ProfitLossPage.tsx` - P&L statement
- src/pages/finance/TrialBalancePage.tsx` - Trial balance
- src/pages/finance/BalanceSheetPage.tsx` - Balance sheet
- src/pages/finance/FinancialReportsPage.tsx` - Financial reports

### HR & Payroll Module
- `src/pages/hr-payroll/EmployeesPage.tsx` - Employee list
- `src/pages/hr-payroll/EmployeeDetailPage.tsx` - Employee detail
- src/pages/hr-payroll/CreateUserPage.tsx` - Create employee
- `src/pages/hr-payroll/AttendancePage.tsx` - Attendance records
- `src/pages/hr-payroll/LeaveManagementPage.tsx` - Leave management
- `src/pages/hr-payroll/PayrollProcessingPage.tsx` - Payroll runs
- src/pages/hr-payroll/PayslipDetailPage.tsx` - Payslip detail

### Planning Module
- `src/pages/planning/ProductionPlansPage.tsx` - Production plans
- `src/pages/planning/ProductionPlanDetailPage.tsx` - Plan detail
- src/pages/planning/DemandForecastPage.tsx` - Demand forecasts
- src/pages/planning/MRPPage.tsx` - Material requirements
- `src/pages/planning/CapacityPlanningPage.tsx` - Capacity planning

### Communications Module
- `src/pages/communication/TemplatesPage.tsx` - Message templates
- `src/pages/communication/TemplateEditorPage.tsx` - Template editor
- `src/pages/communication/SMSComposePage.tsx` - SMS composer
- `src/pages/communication/WhatsAppComposePage.tsx` - WhatsApp composer
- `src/pages/communication/CommunicationLogsPage.tsx` - Communication logs

### System Administration
- `src/pages/system/UsersPage.tsx` - User management
- `src/pages/system/UserDetailPage.tsx` - User detail
- src/pages/system/CreateUserPage.tsx` - Create user
- `src/pages/system/RolesPage.tsx` - Role management
- `src/pages/system/RoleDetailPage.tsx` - Role detail
- src/pages/system/PermissionManagementPage.tsx` - Permission management
- `src/pages/system/OrganizationsPage.tsx` - Organizations
- `src/pages/system/OrganizationDetailPage.tsx` - Organization detail
- `src/pages/system/ModuleManagementPage.tsx` - Module management
- `src/pages/system/SystemSettingsPage.tsx` - System settings

### Authentication
- `src/pages/auth/LoginPage.tsx` - Login page
- `src/pages/auth/RegisterPage.tsx` - Registration page

### Pages from This Session
- `src/pages/sales/CreateProjectPage.tsx` - Create project page
- `src/pages/production/ProductionBatchDetailPage.tsx` - Production batch detail
- `src/pages/quality/InspectionDetailPage.tsx` - Inspection detail
- src/pages/quality/NCRDetailPage.tsx` - NCR detail
- `src/pages/quality/CreateDryMixTestPage.tsx` - Create dry mix test
- src/pages/quality/CreateRawMaterialTestPage.tsx` - Create raw material test
- `src/pages/inventory/StockDetailPage.tsx` - Stock detail
- `src/pages/inventory/CreateStockTransferPage.tsx` - Create stock transfer
- src/pages/inventory/WarehousePage.tsx` - Warehouse management
- `src/pages/inventory/StockMovementsPage.tsx` - Stock movements
- `src/pages/procurement/PurchaseOrderDetailPage.tsx` - Purchase order detail
- src/pages/procurement/CreatePurchaseOrderPage.tsx` - Create purchase order
- `src/pages/finance/FinanceDashboardPage.tsx` - Finance dashboard
- src/pages/finance/LedgerViewPage.tsx` - Account ledger view
- `src/pages/finance/ProfitLossPage.tsx` - Profit & Loss statement
- `src/pages/hr-payroll/EmployeeDetailPage.tsx` - Employee detail page
- src/pages/hr-payroll/LeaveManagementPage.tsx` - Leave management page
- `src/pages/hr-payroll/PayrollProcessingPage.tsx` - Payroll processing page
- src/pages/hr-payroll/PayslipDetailPage.tsx` - Payslip detail page
- src/pages/planning/DemandForecastPage.tsx` - Demand forecasting (already existed)
- `src/pages/planning/ProductionPlanDetailPage.tsx` - Production plan detail
- `src/pages/planning/MRPPage.tsx` - Material requirements planning
- src/pages/planning/CapacityPlanningPage.tsx` - Capacity planning
- `src/pages/communication/TemplateEditorPage.tsx` - Template editor
- `src/pages/communication/SMSComposePage.tsx` - SMS compose page
- src/pages/communication/WhatsAppComposePage.tsx` - WhatsApp compose page
- src/pages/communication/CommunicationLogsPage.tsx` - Communication logs
- `src/pages/system/UserDetailPage.tsx` - User detail page
- src/pages/system/CreateUserPage.tsx` - Create user page
- src/pages/system/RoleDetailPage.tsx` - Role detail page
- src/pages/system/PermissionManagementPage.tsx` - Permission management
- src/pages/system/OrganizationDetailPage.tsx` - Organization detail
- `src/pages/system/SystemSettingsPage.tsx` - System settings
- `src/pages/system/ModuleManagementPage.tsx` - Module management

---

## 🎯 Reusable Components

### UI Components (`src/components/ui/`)
- **DataTable.tsx** - Advanced table with pagination, sorting, filtering using @tanstack/react-table
- **Form.tsx** - Reusable form component with Zod validation and react-hook-form
- **StatusBadge.tsx** - Status display with 10 pre-configured status types
- **ActionMenu.tsx** - Action dropdown using @headlessui/react
- **Alert.tsx** - Alert notifications (success/error/warning/info)
- **Button.tsx** - Button component with variants
- **Card.tsx** - Card container component
- **Input.tsx** - Input component with validation
- **Skeleton.tsx** - Loading skeleton placeholder
- **Badge.tsx** - Badge component

### Other Components
- **KPICard.tsx** - KPI card with trend indicators
- **NotificationPanel.tsx** - Notifications sidebar
- **Charts** - Various chart components using Recharts
- **Navigation** - Navigation sidebar in MainLayout

---

## 🔧 Development Commands

### Backend
```bash
cd backend

# Install dependencies
composer install

# Run development server
php artisan serve

# Run database migrations
php artisan migrate

# Run tests
php artisan test

# Generate application key
php artisan key:generate

# Create storage link
php artisan storage:link

# Clear caches
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear
```

### Frontend
```bash
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint

# Type checking
npx tsc --noEmit
```

### Docker
```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# View logs
docker-compose logs -f [service_name]

# Rebuild specific service
docker-compose build [service_name]

# Execute command in container
docker-compose exec backend php artisan migrate
docker-compose exec frontend npm install
```

---

## 🔒 Environment Configuration

### Backend (.env)
```env
APP_NAME="ERP DryMix"
APP_ENV=local
APP_DEBUG=true
APP_URL=http://localhost:8100

DB_CONNECTION=mysql
DB_HOST=general_server_configs
DB_PORT=3306
DB_DATABASE=db_erp_drymix_prod
DB_USERNAME=amit
DB_PASSWORD=angles

REDIS_HOST=general_server_configs
REDIS_PORT=6379
REDIS_PASSWORD=angles

BROADCAST_DRIVER=log
CACHE_DRIVER=redis
QUEUE_CONNECTION=redis

SESSION_DRIVER=file
SESSION_LIFETIME=120
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:8100/api/v1
VITE_APP_NAME=ERP_DryMix
```

---

## 🧪 Testing

### Backend Tests
```bash
cd backend

# Run all tests
php artisan test

# Run specific test file
php artisan test --filter ProductControllerTest

# Run with coverage
php artisan test --coverage
```

### Frontend Tests
```bash
cd frontend

# Run tests
npm test

# Run with coverage
npm test -- --coverage
```

---

## 📝 Code Conventions

### Backend (Laravel)
- **Models**: Singular, PascalCase (e.g., `User`, `Product`)
- **Controllers**: Singular, PascalCase + "Controller" (e.g., `DashboardController`)
- **Migrations**: Timestamped, snake_case, descriptive
- **Routes**: RESTful resource routes, kebab-case for custom routes
- **Variables/Methods**: camelCase (e.g., `$userName`, `getUsers()`)
- **Constants**: UPPER_SNAKE_CASE

### Frontend (React + TypeScript)
- **Components**: PascalCase (e.g., `DashboardCard`, `KPICard`)
- **Hooks**: camelCase with "use" prefix (e.g., `useDashboardData`, `useKPIMetrics`)
- **Services**: camelCase (e.g., `apiService`, `dashboardService`)
- **Types/Interfaces**: PascalCase (e.g., `User`, `DashboardData`, `KPIMetric`)
- **Files/Folders**: PascalCase for components, kebab-case for utilities

### API Response Format
```typescript
{
  success: true,
  data: any,
  message: "Operation successful"
}
```

### Error Response Format
```typescript
{
  success: false,
  message: "Error message",
  errors?: Record<string, string[]>
}
```

---

## 🔐 Authentication

The application uses Laravel Sanctum for token-based authentication:
- Login endpoint returns an access token
- Token must be included in Authorization header: `Bearer {token}`
- Token stored in localStorage on frontend
- Protected routes require `auth:sanctum` middleware

---

## 🌐 Multi-Tenancy

- **All** database queries must filter by `organization_id`
- Use `$request->get('organization_id')` or `auth()->user()->organization_id`
- Implement `scopeByOrganization()` scope on all models
- Never query without organization scoping

---

## 📊 Important Gotchas

### Multi-Tenancy
- **CRITICAL**: All queries MUST filter by organization_id
- Ensure foreign keys are set correctly

### Soft Deletes
- Most models use soft deletes via `SoftDeletes` trait
- Use `withTrashed()`, `onlyTrashed()`, `restore()` when needed

### Database Relationships
- Always eager load relationships: `with(['organization', 'products'])`
- Use explicit foreign keys in migrations
- Cascade deletes are enabled for most relationships

### JSON Columns
- MariaDB JSON columns for flexible data storage
- Cast JSON columns to array in model: `'specifications' => 'array'`
- Access JSON properties: `$product->specifications['key']`

### Activity Logging
- Use Spatie Activitylog for audit trails
- Implement `getActivitylogOptions()` in models
- Log only relevant fields with `logOnly()`
- Log changes only with `logOnlyDirty()`

### Docker Port Conflicts
- Backend: port 8100 (internal 8000)
- Frontend: port 3100 (internal 80)
- Check port conflicts: `netstat -ano | findstr :8100`
- Modify docker-compose.yml if needed

### CORS Configuration
- Frontend running on different port
- Configure CORS in `config/cors.php`
- Allow frontend origin in CORS settings

---

## 📄 API Documentation

For detailed API documentation, run:
```bash
cd backend

# Generate API docs
php artisan api:docs
```

This will generate OpenAPI/Swagger documentation at `/api/documentation`

---

## 📞 Support & Contact

For questions or issues:
1. Check this README
2. Check `AGENTS.md` for detailed guidelines
3. Review existing code patterns in similar files
4. Run tests to identify issues
5. Check logs for error messages

---

## 📜 License

Proprietary - All Rights Reserved

---

## 🗓️ Roadmap

### Phase 1 ✅ (Completed)
- Core Foundation modules
- Primary modules
- Basic API integration

### Phase 2 ✅ (Completed)
- Advanced Analytics & Reporting
- AI/ML integration
- Cloud storage

### Phase 3 ✅ (Completed)
- External integrations
- Plant automation
- Advanced communication features

### Phase 4 ✅ (Completed)
- System administration
- Module management
- Security enhancements

### Phase 5 ✅ (Completed)
- Frontend pages for all modules
- Reusable UI components
- Documentation

### Future Enhancements
- Real-time notifications
- Advanced AI predictions
- Mobile apps (React Native)
- Offline support via PWA

---

**Last Updated**: 2026-01-15
**Version**: 2.0.0
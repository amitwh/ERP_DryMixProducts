import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { MainLayout } from '@/layouts/MainLayout'
import { FullPageLoading } from '@/components/ui/Loading'

// Auth Pages
import LoginPage from '@/pages/auth/LoginPage'
import RegisterPage from '@/pages/auth/RegisterPage'

// Dashboard
import DashboardPage from '@/pages/DashboardPage'

// Sales Management
import SalesOrdersPage from '@/pages/sales/SalesOrdersPage'

// Quality Control
import QualityInspectionsPage from '@/pages/quality/QualityInspectionsPage'

// Products Management
import ProductsPage from '@/pages/ProductsPage'

// Customers
import CustomersPage from '@/pages/CustomersPage'

// Production
import ProductionOrdersPage from '@/pages/ProductionOrdersPage'

// Inventory
import InventoryStockPage from '@/pages/InventoryStockPage'

// Procurement
import PurchaseOrdersPage from '@/pages/PurchaseOrdersPage'

// HR & Payroll
import EmployeesPage from '@/pages/EmployeesPage'

// System
import UsersPage from '@/pages/UsersPage'

// Settings
import SettingsProfilePage from '@/pages/SettingsProfilePage'

// Finance & Accounting
import ChartOfAccountsPage from '@/pages/finance/ChartOfAccountsPage'
import TrialBalancePage from '@/pages/finance/TrialBalancePage'
import BalanceSheetPage from '@/pages/finance/BalanceSheetPage'
import ProfitLossPage from '@/pages/finance/ProfitLossPage'
import JournalVouchersPage from '@/pages/finance/JournalVouchersPage'
import LedgerViewPage from '@/pages/finance/LedgerViewPage'
import FiscalYearsPage from '@/pages/finance/FiscalYearsPage'
import FinanceDashboardPage from '@/pages/finance/FinanceDashboardPage'

// Placeholder Pages (to be created)
const PlaceholderPage: React.FC<{ title: string }> = ({ title }) => (
  <div className="space-y-6">
    <div>
      <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
      <p className="text-gray-600">This page is under development.</p>
    </div>
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          <svg className="w-6 h-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <div>
          <h3 className="text-lg font-medium text-yellow-900">Coming Soon</h3>
          <p className="mt-2 text-yellow-800">
            The {title} module is currently being developed. Please check back later.
          </p>
        </div>
      </div>
    </div>
  </div>
)

// Protected Route Wrapper
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return <FullPageLoading message="Loading application..." />
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

// Public Route Wrapper (redirect if authenticated)
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return <FullPageLoading message="Loading..." />
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}

// App Component
function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <RegisterPage />
          </PublicRoute>
        }
      />
      <Route
        path="/forgot-password"
        element={
          <PublicRoute>
            <PlaceholderPage title="Forgot Password" />
          </PublicRoute>
        }
      />

      {/* Protected Routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        {/* Dashboard */}
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />

        {/* Sales Management */}
        <Route path="sales" element={<PlaceholderPage title="Sales Management" />} />
        <Route path="sales/orders" element={<SalesOrdersPage />} />
        <Route path="sales/orders/create" element={<PlaceholderPage title="Create Sales Order" />} />
        <Route path="sales/orders/:id" element={<PlaceholderPage title="Sales Order Details" />} />
        <Route path="sales/invoices" element={<PlaceholderPage title="Invoices" />} />
        <Route path="sales/invoices/:id" element={<PlaceholderPage title="Invoice Details" />} />
        <Route path="sales/returns" element={<PlaceholderPage title="Sales Returns" />} />
        <Route path="sales/projects" element={<PlaceholderPage title="Projects" />} />

        {/* Products Management */}
        <Route path="products" element={<ProductsPage />} />
        <Route path="products/categories" element={<PlaceholderPage title="Product Categories" />} />
        <Route path="products/attributes" element={<PlaceholderPage title="Product Attributes" />} />

        {/* Customers */}
        <Route path="customers" element={<CustomersPage />} />
        <Route path="customers/:id" element={<PlaceholderPage title="Customer Details" />} />
        <Route path="customers/create" element={<PlaceholderPage title="Create Customer" />} />

        {/* Production */}
        <Route path="production" element={<ProductionOrdersPage />} />
        <Route path="production/orders" element={<ProductionOrdersPage />} />
        <Route path="production/orders/create" element={<PlaceholderPage title="Create Production Order" />} />
        <Route path="production/orders/:id" element={<PlaceholderPage title="Production Order Details" />} />

        {/* Inventory */}
        <Route path="inventory" element={<PlaceholderPage title="Inventory & Stores" />} />
        <Route path="inventory/stock" element={<InventoryStockPage />} />
        <Route path="inventory/movements" element={<PlaceholderPage title="Stock Movements" />} />
        <Route path="inventory/transfers" element={<PlaceholderPage title="Stock Transfers" />} />
        <Route path="inventory/warehouses" element={<PlaceholderPage title="Warehouses" />} />
        <Route path="inventory/adjustments" element={<PlaceholderPage title="Stock Adjustments" />} />

        {/* Quality Control */}
        <Route path="quality" element={<PlaceholderPage title="Quality Control" />} />
        <Route path="quality/inspections" element={<QualityInspectionsPage />} />
        <Route path="quality/inspections/create" element={<PlaceholderPage title="Create Inspection" />} />
        <Route path="quality/inspections/:id" element={<PlaceholderPage title="Inspection Details" />} />
        <Route path="quality/ncrs" element={<PlaceholderPage title="Non-Conformance Reports" />} />
        <Route path="quality/ncrs/create" element={<PlaceholderPage title="Create NCR" />} />
        <Route path="quality/ncrs/:id" element={<PlaceholderPage title="NCR Details" />} />
        <Route path="quality/dry-mix-tests" element={<QualityInspectionsPage />} />
        <Route path="quality/dry-mix-tests/create" element={<PlaceholderPage title="Create Dry Mix Test" />} />
        <Route path="quality/dry-mix-tests/:id" element={<PlaceholderPage title="Dry Mix Test Details" />} />
        <Route path="quality/raw-material-tests" element={<QualityInspectionsPage />} />
        <Route path="quality/raw-material-tests/create" element={<PlaceholderPage title="Create Raw Material Test" />} />
        <Route path="quality/raw-material-tests/:id" element={<PlaceholderPage title="Raw Material Test Details" />} />

        {/* Finance */}
        <Route path="finance" element={<FinanceDashboardPage />} />
        <Route path="finance/dashboard" element={<FinanceDashboardPage />} />
        <Route path="finance/accounts" element={<ChartOfAccountsPage />} />
        <Route path="finance/accounts/create" element={<PlaceholderPage title="Create Account" />} />
        <Route path="finance/accounts/:id" element={<PlaceholderPage title="Account Details" />} />
        <Route path="finance/charts" element={<ChartOfAccountsPage />} />
        <Route path="finance/vouchers" element={<JournalVouchersPage />} />
        <Route path="finance/vouchers/create" element={<PlaceholderPage title="Create Voucher" />} />
        <Route path="finance/vouchers/:id" element={<PlaceholderPage title="Voucher Details" />} />
        <Route path="finance/ledgers" element={<LedgerViewPage />} />
        <Route path="finance/fiscal-years" element={<FiscalYearsPage />} />
        <Route path="finance/fiscal-years/create" element={<PlaceholderPage title="Create Fiscal Year" />} />
        <Route path="finance/reports" element={<PlaceholderPage title="Financial Reports" />} />
        <Route path="finance/reports/trial-balance" element={<TrialBalancePage />} />
        <Route path="finance/reports/balance-sheet" element={<BalanceSheetPage />} />
        <Route path="finance/reports/profit-loss" element={<ProfitLossPage />} /> />

        {/* Credit Control */}
        <Route path="credit-control" element={<PlaceholderPage title="Credit Control" />} />
        <Route path="credit-control/customers" element={<PlaceholderPage title="Customer Credit" />} />
        <Route path="credit-control/customers/:id" element={<PlaceholderPage title="Customer Credit Details" />} />
        <Route path="credit-control/limits" element={<PlaceholderPage title="Credit Limits" />} />
        <Route path="credit-control/aging" element={<PlaceholderPage title="Aging Reports" />} />
        <Route path="credit-control/collections" element={<PlaceholderPage title="Collections" />} />
        <Route path="credit-control/collections/create" element={<PlaceholderPage title="Record Collection" />} />

        {/* Procurement */}
        <Route path="procurement" element={<PlaceholderPage title="Procurement" />} />
        <Route path="procurement/purchase-orders" element={<PlaceholderPage title="Purchase Orders" />} />
        <Route path="procurement/purchase-orders/create" element={<PlaceholderPage title="Create Purchase Order" />} />
        <Route path="procurement/purchase-orders/:id" element={<PlaceholderPage title="Purchase Order Details" />} />
        <Route path="procurement/grns" element={<PlaceholderPage title="Goods Receipt Notes" />} />
        <Route path="procurement/grns/create" element={<PlaceholderPage title="Create GRN" />} />
        <Route path="procurement/grns/:id" element={<PlaceholderPage title="GRN Details" />} />
        <Route path="procurement/suppliers" element={<PlaceholderPage title="Suppliers" />} />
        <Route path="procurement/suppliers/create" element={<PlaceholderPage title="Create Supplier" />} />
        <Route path="procurement/returns" element={<PlaceholderPage title="Purchase Returns" />} />

        {/* HR & Payroll */}
        <Route path="hr-payroll" element={<PlaceholderPage title="HR & Payroll" />} />
        <Route path="hr-payroll/employees" element={<EmployeesPage />} />
        <Route path="hr-payroll/employees/create" element={<PlaceholderPage title="Create Employee" />} />
        <Route path="hr-payroll/employees/:id" element={<PlaceholderPage title="Employee Details" />} />
        <Route path="hr-payroll/departments" element={<PlaceholderPage title="Departments" />} />
        <Route path="hr-payroll/designations" element={<PlaceholderPage title="Designations" />} />
        <Route path="hr-payroll/attendances" element={<PlaceholderPage title="Attendance" />} />
        <Route path="hr-payroll/attendances/create" element={<PlaceholderPage title="Mark Attendance" />} />
        <Route path="hr-payroll/leave" element={<PlaceholderPage title="Leave Management" />} />
        <Route path="hr-payroll/payroll" element={<PlaceholderPage title="Payroll" />} />
        <Route path="hr-payroll/payslips" element={<PlaceholderPage title="Payslips" />} />
        <Route path="hr-payroll/payslips/:id" element={<PlaceholderPage title="Payslip Details" />} />

        {/* Planning */}
        <Route path="planning" element={<PlaceholderPage title="Planning" />} />
        <Route path="planning/production-plans" element={<PlaceholderPage title="Production Plans" />} />
        <Route path="planning/production-plans/create" element={<PlaceholderPage title="Create Production Plan" />} />
        <Route path="planning/mrp" element={<PlaceholderPage title="Material Requirements Planning" />} />
        <Route path="planning/capacity" element={<PlaceholderPage title="Capacity Planning" />} />
        <Route path="planning/forecasts" element={<PlaceholderPage title="Forecasts" />} />

        {/* Communication */}
        <Route path="communication" element={<PlaceholderPage title="Communication" />} />
        <Route path="communication/templates" element={<PlaceholderPage title="Email Templates" />} />
        <Route path="communication/templates/create" element={<PlaceholderPage title="Create Template" />} />
        <Route path="communication/sms" element={<PlaceholderPage title="SMS" />} />
        <Route path="communication/sms/create" element={<PlaceholderPage title="Send SMS" />} />
        <Route path="communication/whatsapp" element={<PlaceholderPage title="WhatsApp" />} />
        <Route path="communication/whatsapp/create" element={<PlaceholderPage title="Send WhatsApp" />} />
        <Route path="communication/logs" element={<PlaceholderPage title="Communication Logs" />} />

        {/* System Administration */}
        <Route path="system" element={<PlaceholderPage title="System Administration" />} />
        <Route path="system/dashboard" element={<PlaceholderPage title="System Dashboard" />} />
        <Route path="system/users" element={<PlaceholderPage title="Users" />} />
        <Route path="system/users/create" element={<PlaceholderPage title="Create User" />} />
        <Route path="system/users/:id" element={<PlaceholderPage title="User Details" />} />
        <Route path="system/roles" element={<PlaceholderPage title="Roles" />} />
        <Route path="system/roles/create" element={<PlaceholderPage title="Create Role" />} />
        <Route path="system/permissions" element={<PlaceholderPage title="Permissions" />} />
        <Route path="system/organizations" element={<PlaceholderPage title="Organizations" />} />
        <Route path="system/organizations/create" element={<PlaceholderPage title="Create Organization" />} />
        <Route path="system/manufacturing-units" element={<PlaceholderPage title="Manufacturing Units" />} />
        <Route path="system/settings" element={<PlaceholderPage title="System Settings" />} />
        <Route path="system/modules" element={<PlaceholderPage title="Modules" />} />
        <Route path="system/api-keys" element={<PlaceholderPage title="API Keys" />} />
        <Route path="system/logs" element={<PlaceholderPage title="System Logs" />} />
        <Route path="system/backups" element={<PlaceholderPage title="Backups" />} />
        <Route path="system/external-services" element={<PlaceholderPage title="External Services" />} />

        {/* Settings */}
        <Route path="settings" element={<PlaceholderPage title="Settings" />} />
        <Route path="settings/profile" element={<PlaceholderPage title="Profile Settings" />} />
        <Route path="settings/security" element={<PlaceholderPage title="Security Settings" />} />
        <Route path="settings/preferences" element={<PlaceholderPage title="Preferences" />} />
      </Route>

      {/* 404 Not Found */}
      <Route
        path="*"
        element={
          <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
              <p className="text-xl text-gray-600 mb-8">Page not found</p>
              <button
                onClick={() => window.history.back()}
                className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                Go Back
              </button>
            </div>
          </div>
        }
      />
    </Routes>
  )
}

export default App

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
import CreateSalesOrderPage from '@/pages/sales/CreateSalesOrderPage'
import SalesOrderDetailPage from '@/pages/sales/SalesOrderDetailPage'
import InvoicesPage from '@/pages/sales/InvoicesPage'
import CreateInvoicePage from '@/pages/sales/CreateInvoicePage'
import CreateProjectPage from '@/pages/sales/CreateProjectPage'
import ProjectsPage from '@/pages/sales/ProjectsPage'
import ProjectDetailPage from '@/pages/sales/ProjectDetailPage'

// Quality Control
import QualityInspectionsPage from '@/pages/quality/QualityInspectionsPage'
import CreateInspectionPage from '@/pages/qa-qc/CreateInspectionPage'
import InspectionDetailPage from '@/pages/quality/InspectionDetailPage'
import NCRsPage from '@/pages/qa-qc/NCRsPage'
import NCRDetailPage from '@/pages/quality/NCRDetailPage'
import QualityTestsPage from '@/pages/qa-qc/QualityTestsPage'
import CreateDryMixTestPage from '@/pages/quality/CreateDryMixTestPage'
import CreateRawMaterialTestPage from '@/pages/quality/CreateRawMaterialTestPage'
import CertificatesPage from '@/pages/qa-qc/CertificatesPage'
import QualityReportsPage from '@/pages/qa-qc/QualityReportsPage'

// Products Management
import ProductsPage from '@/pages/ProductsPage'
import CreateProductPage from '@/pages/products/CreateProductPage'
import ProductDetailPage from '@/pages/products/ProductDetailPage'

// Customers
import CustomersPage from '@/pages/customers/CustomersListPage'
import CreateCustomerPage from '@/pages/customers/CreateCustomerPage'

// Production
import ProductionOrdersPage from '@/pages/production/ProductionOrdersPage'
import CreateProductionOrderPage from '@/pages/production/CreateProductionOrderPage'
import ProductionOrderDetailPage from '@/pages/production/ProductionOrderDetailPage'
import ProductionBatchesPage from '@/pages/production/ProductionBatchesPage'
import ProductionBatchDetailPage from '@/pages/production/ProductionBatchDetailPage'
import ProductionReportsPage from '@/pages/production/ProductionReportsPage'
import WorkstationsPage from '@/pages/production/WorkstationsPage'

// Inventory
import InventoryStockPage from '@/pages/inventory/InventoryStockPage'
import InventoryMovementsPage from '@/pages/inventory/InventoryMovementsPage'
import StockMovementsPage from '@/pages/inventory/StockMovementsPage'
import StockDetailPage from '@/pages/inventory/StockDetailPage'
import AdjustmentsPage from '@/pages/inventory/AdjustmentsPage'
import WarehousePage from '@/pages/inventory/WarehousePage'
import CreateStockTransferPage from '@/pages/inventory/CreateStockTransferPage'
import InventoryPage from '@/pages/inventory/InventoryPage'

// Procurement
import PurchaseOrdersPage from '@/pages/procurement/PurchaseOrdersPage'
import CreatePurchaseOrderPage from '@/pages/procurement/CreatePurchaseOrderPage'
import PurchaseOrderDetailPage from '@/pages/procurement/PurchaseOrderDetailPage'
import SuppliersPage from '@/pages/procurement/SuppliersPage'
import CreateSupplierPage from '@/pages/procurement/CreateSupplierPage'
import SuppliersListPage from '@/pages/suppliers/SuppliersListPage'
import RequestsPage from '@/pages/procurement/RequestsPage'
import ApprovalsPage from '@/pages/procurement/ApprovalsPage'

// HR & Payroll
import EmployeesPage from '@/pages/hr-payroll/EmployeesPage'
import EmployeeDetailPage from '@/pages/hr-payroll/EmployeeDetailPage'
import AttendancePage from '@/pages/hr-payroll/AttendancePage'
import LeaveManagementPage from '@/pages/hr-payroll/LeaveManagementPage'
import PayrollProcessingPage from '@/pages/hr-payroll/PayrollProcessingPage'
import PayslipDetailPage from '@/pages/hr-payroll/PayslipDetailPage'

// Credit Control
import CreditCustomersPage from '@/pages/credit-control/CreditCustomersPage'
import CreditLimitsPage from '@/pages/credit-control/CreditLimitsPage'

// Planning
import ProductionPlansPage from '@/pages/planning/ProductionPlansPage'
import ProductionPlanDetailPage from '@/pages/planning/ProductionPlanDetailPage'
import DemandForecastPage from '@/pages/planning/DemandForecastPage'
import MRPPage from '@/pages/planning/MRPPage'
import CapacityPlanningPage from '@/pages/planning/CapacityPlanningPage'

// Communication
import TemplatesPage from '@/pages/communication/TemplatesPage'
import TemplateEditorPage from '@/pages/communication/TemplateEditorPage'
import SMSComposePage from '@/pages/communication/SMSComposePage'
import WhatsAppComposePage from '@/pages/communication/WhatsAppComposePage'
import CommunicationLogsPage from '@/pages/communication/CommunicationLogsPage'

// System
import UsersPage from '@/pages/system/UsersPage'
import CreateUserPage from '@/pages/system/CreateUserPage'
import UserDetailPage from '@/pages/system/UserDetailPage'
import RolesPage from '@/pages/system/RolesPage'
import RoleDetailPage from '@/pages/system/RoleDetailPage'
import OrganizationsPage from '@/pages/system/OrganizationsPage'
import OrganizationDetailPage from '@/pages/system/OrganizationDetailPage'
import SystemLogsPage from '@/pages/system/SystemLogsPage'
import BackupsPage from '@/pages/system/BackupsPage'
import SystemSettingsPage from '@/pages/system/SystemSettingsPage'
import ModuleManagementPage from '@/pages/system/ModuleManagementPage'
import PermissionManagementPage from '@/pages/system/PermissionManagementPage'

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
import FinancialReportsPage from '@/pages/finance/FinancialReportsPage'

// Documents
import DocumentsPage from '@/pages/documents/DocumentsPage'
import UploadDocumentPage from '@/pages/documents/UploadDocumentPage'

// Analytics
import AnalyticsPage from '@/pages/analytics/AnalyticsPage'

// Reports
import ReportsPage from '@/pages/reports/ReportsPage'

// Geolocation
import DeliveryTrackingPage from '@/pages/geolocation/DeliveryTrackingPage'
import SiteInspectionsPage from '@/pages/geolocation/SiteInspectionsPage'
import CreateSiteInspectionPage from '@/pages/geolocation/CreateSiteInspectionPage'
import GeoTagsPage from '@/pages/geolocation/GeoTagsPage'

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
        <Route path="sales" element={<SalesOrdersPage />} />
        <Route path="sales/orders" element={<SalesOrdersPage />} />
        <Route path="sales/orders/create" element={<CreateSalesOrderPage />} />
        <Route path="sales/orders/:id" element={<SalesOrderDetailPage />} />
        <Route path="sales/invoices" element={<InvoicesPage />} />
        <Route path="sales/invoices/create" element={<CreateInvoicePage />} />
        <Route path="sales/invoices/:id" element={<InvoicesPage />} />
        <Route path="sales/returns" element={<SalesOrdersPage />} />
        <Route path="sales/projects" element={<ProjectsPage />} />
        <Route path="sales/projects/create" element={<CreateProjectPage />} />
        <Route path="sales/projects/:id" element={<ProjectDetailPage />} />

        {/* Products Management */}
        <Route path="products" element={<ProductsPage />} />
        <Route path="products/create" element={<CreateProductPage />} />
        <Route path="products/categories" element={<ProductsPage />} />
        <Route path="products/attributes" element={<ProductsPage />} />
        <Route path="products/:id" element={<ProductDetailPage />} />

        {/* Customers */}
        <Route path="customers" element={<CustomersPage />} />
        <Route path="customers/create" element={<CreateCustomerPage />} />
        <Route path="customers/:id" element={<CreateCustomerPage />} />

        {/* Production */}
        <Route path="production" element={<ProductionOrdersPage />} />
        <Route path="production/orders" element={<ProductionOrdersPage />} />
        <Route path="production/orders/create" element={<CreateProductionOrderPage />} />
        <Route path="production/orders/:id" element={<ProductionOrderDetailPage />} />
        <Route path="production/batches" element={<ProductionBatchesPage />} />
        <Route path="production/batches/:id" element={<ProductionBatchDetailPage />} />
        <Route path="production/reports" element={<ProductionReportsPage />} />
        <Route path="production/workstations" element={<WorkstationsPage />} />

        {/* Inventory */}
        <Route path="inventory" element={<InventoryPage />} />
        <Route path="inventory/stock" element={<InventoryStockPage />} />
        <Route path="inventory/movements" element={<InventoryMovementsPage />} />
        <Route path="inventory/stock-movements" element={<StockMovementsPage />} />
        <Route path="inventory/stock/:id" element={<StockDetailPage />} />
        <Route path="inventory/transfers" element={<CreateStockTransferPage />} />
        <Route path="inventory/warehouses" element={<WarehousePage />} />
        <Route path="inventory/adjustments" element={<AdjustmentsPage />} />

        {/* Quality Control */}
        <Route path="quality" element={<QualityInspectionsPage />} />
        <Route path="quality/inspections" element={<QualityInspectionsPage />} />
        <Route path="quality/inspections/create" element={<CreateInspectionPage />} />
        <Route path="quality/inspections/:id" element={<InspectionDetailPage />} />
        <Route path="quality/ncrs" element={<NCRsPage />} />
        <Route path="quality/ncrs/create" element={<QualityInspectionsPage />} />
        <Route path="quality/ncrs/:id" element={<NCRDetailPage />} />
        <Route path="quality/dry-mix-tests" element={<QualityTestsPage />} />
        <Route path="quality/dry-mix-tests/create" element={<CreateDryMixTestPage />} />
        <Route path="quality/raw-material-tests" element={<QualityTestsPage />} />
        <Route path="quality/raw-material-tests/create" element={<CreateRawMaterialTestPage />} />
        <Route path="quality/certificates" element={<CertificatesPage />} />
        <Route path="quality/reports" element={<QualityReportsPage />} />

        {/* Finance */}
        <Route path="finance" element={<FinanceDashboardPage />} />
        <Route path="finance/dashboard" element={<FinanceDashboardPage />} />
        <Route path="finance/accounts" element={<ChartOfAccountsPage />} />
        <Route path="finance/accounts/create" element={<ChartOfAccountsPage />} />
        <Route path="finance/accounts/:id" element={<ChartOfAccountsPage />} />
        <Route path="finance/charts" element={<ChartOfAccountsPage />} />
        <Route path="finance/vouchers" element={<JournalVouchersPage />} />
        <Route path="finance/vouchers/create" element={<JournalVouchersPage />} />
        <Route path="finance/vouchers/:id" element={<JournalVouchersPage />} />
        <Route path="finance/ledgers" element={<LedgerViewPage />} />
        <Route path="finance/fiscal-years" element={<FiscalYearsPage />} />
        <Route path="finance/fiscal-years/create" element={<FiscalYearsPage />} />
        <Route path="finance/reports" element={<FinancialReportsPage />} />
        <Route path="finance/reports/trial-balance" element={<TrialBalancePage />} />
        <Route path="finance/reports/balance-sheet" element={<BalanceSheetPage />} />
        <Route path="finance/reports/profit-loss" element={<ProfitLossPage />} />

        {/* Credit Control */}
        <Route path="credit-control" element={<CreditCustomersPage />} />
        <Route path="credit-control/customers" element={<CreditCustomersPage />} />
        <Route path="credit-control/limits" element={<CreditLimitsPage />} />
        <Route path="credit-control/aging" element={<PlaceholderPage title="Aging Reports" />} />
        <Route path="credit-control/collections" element={<PlaceholderPage title="Collections" />} />
        <Route path="credit-control/collections/create" element={<PlaceholderPage title="Record Collection" />} />

        {/* Procurement */}
        <Route path="procurement" element={<PurchaseOrdersPage />} />
        <Route path="procurement/purchase-orders" element={<PurchaseOrdersPage />} />
        <Route path="procurement/purchase-orders/create" element={<CreatePurchaseOrderPage />} />
        <Route path="procurement/purchase-orders/:id" element={<PurchaseOrderDetailPage />} />
        <Route path="procurement/grns" element={<PurchaseOrdersPage />} />
        <Route path="procurement/grns/create" element={<PurchaseOrdersPage />} />
        <Route path="procurement/suppliers" element={<SuppliersPage />} />
        <Route path="procurement/suppliers/create" element={<CreateSupplierPage />} />
        <Route path="procurement/requests" element={<RequestsPage />} />
        <Route path="procurement/approvals" element={<ApprovalsPage />} />
        <Route path="suppliers" element={<SuppliersListPage />} />

        {/* HR & Payroll */}
        <Route path="hr-payroll" element={<EmployeesPage />} />
        <Route path="hr-payroll/employees" element={<EmployeesPage />} />
        <Route path="hr-payroll/employees/:id" element={<EmployeeDetailPage />} />
        <Route path="hr-payroll/attendances" element={<AttendancePage />} />
        <Route path="hr-payroll/attendances/create" element={<AttendancePage />} />
        <Route path="hr-payroll/leave" element={<LeaveManagementPage />} />
        <Route path="hr-payroll/payroll" element={<PayrollProcessingPage />} />
        <Route path="hr-payroll/payslips" element={<PayrollProcessingPage />} />
        <Route path="hr-payroll/payslips/:id" element={<PayslipDetailPage />} />

        {/* Planning */}
        <Route path="planning" element={<ProductionPlansPage />} />
        <Route path="planning/production-plans" element={<ProductionPlansPage />} />
        <Route path="planning/production-plans/create" element={<ProductionPlansPage />} />
        <Route path="planning/production-plans/:id" element={<ProductionPlanDetailPage />} />
        <Route path="planning/forecasts" element={<DemandForecastPage />} />
        <Route path="planning/mrp" element={<MRPPage />} />
        <Route path="planning/capacity" element={<CapacityPlanningPage />} />

        {/* Communication */}
        <Route path="communication" element={<TemplatesPage />} />
        <Route path="communication/templates" element={<TemplatesPage />} />
        <Route path="communication/templates/create" element={<TemplateEditorPage />} />
        <Route path="communication/templates/:id" element={<TemplateEditorPage />} />
        <Route path="communication/sms" element={<SMSComposePage />} />
        <Route path="communication/sms/create" element={<SMSComposePage />} />
        <Route path="communication/whatsapp" element={<WhatsAppComposePage />} />
        <Route path="communication/whatsapp/create" element={<WhatsAppComposePage />} />
        <Route path="communication/logs" element={<CommunicationLogsPage />} />

        {/* System Administration */}
        <Route path="system" element={<UsersPage />} />
        <Route path="system/dashboard" element={<UsersPage />} />
        <Route path="system/users" element={<UsersPage />} />
        <Route path="system/users/create" element={<CreateUserPage />} />
        <Route path="system/users/:id" element={<UserDetailPage />} />
        <Route path="system/roles" element={<RolesPage />} />
        <Route path="system/roles/create" element={<RolesPage />} />
        <Route path="system/roles/:id" element={<RoleDetailPage />} />
        <Route path="system/permissions" element={<PermissionManagementPage />} />
        <Route path="system/organizations" element={<OrganizationsPage />} />
        <Route path="system/organizations/create" element={<OrganizationsPage />} />
        <Route path="system/organizations/:id" element={<OrganizationDetailPage />} />
        <Route path="system/manufacturing-units" element={<OrganizationsPage />} />
        <Route path="system/settings" element={<SystemSettingsPage />} />
        <Route path="system/modules" element={<ModuleManagementPage />} />
        <Route path="system/api-keys" element={<SystemSettingsPage />} />
        <Route path="system/logs" element={<SystemLogsPage />} />
        <Route path="system/backups" element={<BackupsPage />} />
        <Route path="system/external-services" element={<SystemSettingsPage />} />

        {/* Settings */}
        <Route path="settings" element={<SettingsProfilePage />} />
        <Route path="settings/profile" element={<SettingsProfilePage />} />
        <Route path="settings/security" element={<SettingsProfilePage />} />
        <Route path="settings/preferences" element={<SettingsProfilePage />} />

        {/* Documents */}
        <Route path="documents" element={<DocumentsPage />} />
        <Route path="documents/upload" element={<UploadDocumentPage />} />

        {/* Analytics */}
        <Route path="analytics" element={<AnalyticsPage />} />

        {/* Reports */}
        <Route path="reports" element={<ReportsPage />} />

        {/* Geolocation */}
        <Route path="geolocation" element={<DeliveryTrackingPage />} />
        <Route path="geolocation/delivery-tracking" element={<DeliveryTrackingPage />} />
        <Route path="geolocation/inspections" element={<SiteInspectionsPage />} />
        <Route path="geolocation/inspections/create" element={<CreateSiteInspectionPage />} />
        <Route path="geolocation/geo-tags" element={<GeoTagsPage />} />
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

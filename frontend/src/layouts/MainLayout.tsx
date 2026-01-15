import React, { useState } from 'react'
import { Outlet, NavLink, useLocation } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/Button'
import { cn } from '@/utils'
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Users,
  FileText,
  Factory,
  CheckSquare,
  CreditCard,
  UserCheck,
  CalendarClock,
  MessageSquare,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Bell,
  Search,
  Building2,
  Database,
  Link as LinkIcon,
  Printer,
  AlertOctagon,
  Shield,
  BarChart3,
  Brain,
  Cloud,
  Network,
  Zap,
  CreditCard as PaymentIcon,
  Wrench,
  Truck,
  Microscope,
  Leaf,
  Cpu,
  Scale,
  FileCheck,
  Layers,
  Gauge,
  Activity,
  TrendingUp,
} from 'lucide-react'
import { getInitials } from '@/utils'

interface NavItem {
  title: string
  href: string
  icon: React.ReactNode
  badge?: number
  category?: string
}

interface NavCategory {
  title: string
  items: NavItem[]
}

export const MainLayout: React.FC = () => {
  const { user, logout } = useAuth()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  const navCategories: NavCategory[] = [
    {
      title: 'Core Foundation',
      items: [
        {
          title: 'Dashboard',
          href: '/dashboard',
          icon: <LayoutDashboard className="w-5 h-5" />,
        },
        {
          title: 'Users & Access',
          href: '/system/users',
          icon: <UserCheck className="w-5 h-5" />,
        },
        {
          title: 'Settings',
          href: '/settings',
          icon: <Settings className="w-5 h-5" />,
        },
        {
          title: 'Documents',
          href: '/system/documents',
          icon: <FileText className="w-5 h-5" />,
        },
      ],
    },
    {
      title: 'Operations',
      items: [
        {
          title: 'Quality Control',
          href: '/quality',
          icon: <CheckSquare className="w-5 h-5" />,
          badge: 3,
        },
        {
          title: 'Planning',
          href: '/planning',
          icon: <CalendarClock className="w-5 h-5" />,
        },
        {
          title: 'Stores & Inventory',
          href: '/inventory',
          icon: <Database className="w-5 h-5" />,
        },
        {
          title: 'Production',
          href: '/production',
          icon: <Factory className="w-5 h-5" />,
        },
        {
          title: 'Sales',
          href: '/sales',
          icon: <ShoppingCart className="w-5 h-5" />,
        },
        {
          title: 'Procurement',
          href: '/procurement',
          icon: <ShoppingCart className="w-5 h-5" />,
        },
        {
          title: 'Products',
          href: '/products',
          icon: <Package className="w-5 h-5" />,
        },
        {
          title: 'Customers',
          href: '/customers',
          icon: <Users className="w-5 h-5" />,
        },
      ],
    },
    {
      title: 'Finance & HR',
      items: [
        {
          title: 'Finance',
          href: '/finance',
          icon: <FileText className="w-5 h-5" />,
        },
        {
          title: 'Credit Control',
          href: '/credit-control',
          icon: <CreditCard className="w-5 h-5" />,
        },
        {
          title: 'HR & Payroll',
          href: '/hr-payroll',
          icon: <UserCheck className="w-5 h-5" />,
        },
      ],
    },
    {
      title: 'Advanced',
      items: [
        {
          title: 'Analytics',
          href: '/analytics',
          icon: <BarChart3 className="w-5 h-5" />,
        },
        {
          title: 'AI/ML',
          href: '/ai-ml',
          icon: <Brain className="w-5 h-5" />,
        },
        {
          title: 'Communication',
          href: '/communication',
          icon: <MessageSquare className="w-5 h-5" />,
          badge: 5,
        },
      ],
    },
    {
      title: 'Integrations',
      items: [
        {
          title: 'Cloud Storage',
          href: '/cloud-storage',
          icon: <Cloud className="w-5 h-5" />,
        },
        {
          title: 'ERP Integration',
          href: '/erp-integration',
          icon: <Network className="w-5 h-5" />,
        },
        {
          title: 'Plant Automation',
          href: '/plant-automation',
          icon: <Zap className="w-5 h-5" />,
        },
        {
          title: 'Payment Gateway',
          href: '/payment-gateway',
          icon: <PaymentIcon className="w-5 h-5" />,
        },
      ],
    },
    {
      title: 'Enterprise',
      items: [
        {
          title: 'Maintenance',
          href: '/maintenance',
          icon: <Wrench className="w-5 h-5" />,
        },
        {
          title: 'Transport',
          href: '/transport',
          icon: <Truck className="w-5 h-5" />,
        },
        {
          title: 'Quality Intel',
          href: '/quality-intel',
          icon: <Microscope className="w-5 h-5" />,
        },
        {
          title: 'Sustainability',
          href: '/sustainability',
          icon: <Leaf className="w-5 h-5" />,
        },
        {
          title: 'Digital Twin',
          href: '/digital-twin',
          icon: <Cpu className="w-5 h-5" />,
        },
        {
          title: 'Compliance',
          href: '/compliance',
          icon: <Shield className="w-5 h-5" />,
        },
      ],
    },
    {
      title: 'Administration',
      items: [
        {
          title: 'System Admin',
          href: '/system',
          icon: <Settings className="w-5 h-5" />,
        },
      ],
    },
  ]

  const getPageTitle = () => {
    const path = location.pathname
    const titleMap: Record<string, string> = {
      '/dashboard': 'Dashboard & Analytics',
      '/system/users': 'User & Access Management',
      '/system/roles': 'Role Management',
      '/system/permissions': 'Permissions',
      '/settings': 'Settings & Configuration',
      '/system/documents': 'Document Management',
      '/quality': 'Quality Assurance & Control',
      '/quality/inspections': 'Quality Inspections',
      '/quality/ncrs': 'Non-Conformance Reports',
      '/quality/dry-mix-tests': 'Dry Mix Product Tests',
      '/quality/raw-material-tests': 'Raw Material Tests',
      '/planning': 'Production Planning',
      '/planning/production-plans': 'Production Plans',
      '/planning/forecasts': 'Demand Forecasting',
      '/planning/mrp': 'Material Requirements Planning',
      '/planning/capacity': 'Capacity Planning',
      '/inventory': 'Stores & Inventory',
      '/inventory/stock': 'Stock Overview',
      '/inventory/movements': 'Stock Movements',
      '/inventory/transfers': 'Stock Transfers',
      '/inventory/warehouses': 'Warehouse Management',
      '/production': 'Production Management',
      '/production/orders': 'Production Orders',
      '/production/batches': 'Production Batches',
      '/sales': 'Sales & Customer Management',
      '/sales/orders': 'Sales Orders',
      '/sales/invoices': 'Invoices',
      '/sales/returns': 'Sales Returns',
      '/sales/projects': 'Projects',
      '/procurement': 'Procurement',
      '/procurement/purchase-orders': 'Purchase Orders',
      '/procurement/grns': 'Goods Receipt Notes',
      '/procurement/suppliers': 'Suppliers',
      '/products': 'Product Management',
      '/customers': 'Customers',
      '/finance': 'Finance & Accounting',
      '/finance/dashboard': 'Finance Dashboard',
      '/finance/accounts': 'Chart of Accounts',
      '/finance/vouchers': 'Journal Vouchers',
      '/finance/ledgers': 'Ledgers',
      '/finance/reports': 'Financial Reports',
      '/credit-control': 'Credit Control',
      '/credit-control/customers': 'Credit Customers',
      '/credit-control/limits': 'Credit Limits',
      '/credit-control/aging': 'Aging Reports',
      '/credit-control/collections': 'Collections',
      '/hr-payroll': 'HR & Payroll',
      '/hr-payroll/employees': 'Employees',
      '/hr-payroll/attendances': 'Attendance',
      '/hr-payroll/leave': 'Leave Management',
      '/hr-payroll/payroll': 'Payroll',
      '/analytics': 'Analytics & Reporting',
      '/ai-ml': 'AI/ML Predictions',
      '/communication': 'Communications',
      '/communication/templates': 'Message Templates',
      '/communication/sms': 'SMS Messages',
      '/communication/whatsapp': 'WhatsApp Messages',
      '/communication/logs': 'Communication Logs',
      '/cloud-storage': 'Cloud Storage',
      '/erp-integration': 'External ERP Integration',
      '/plant-automation': 'Plant Automation',
      '/payment-gateway': 'Payment Gateway',
      '/maintenance': 'Maintenance Management',
      '/transport': 'Transportation & Logistics',
      '/quality-intel': 'Quality Intelligence',
      '/sustainability': 'Sustainability',
      '/digital-twin': 'Digital Transformation',
      '/compliance': 'Compliance & Regulatory',
      '/system': 'System Administration',
      '/system/modules': 'Module Management',
      '/system/api-keys': 'API Keys',
      '/system/logs': 'System Logs',
      '/system/backups': 'Backups',
      '/system/external-services': 'External Services',
    }
    return titleMap[path] || 'ERP DryMix Products'
  }

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 bg-white border-r border-gray-200 transition-all duration-300',
          sidebarOpen ? 'w-72' : 'w-20'
        )}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
          {sidebarOpen ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 bg-primary-600 rounded-xl">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-gray-900 text-lg">ERP DryMix</h1>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center w-10 h-10 bg-primary-600 rounded-xl">
              <Building2 className="w-6 h-6 text-white" />
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors hidden lg:block"
          >
            {sidebarOpen ? (
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            ) : (
              <ChevronRight className="w-5 h-5 text-gray-600" />
            )}
          </button>
        </div>

        <nav className="p-4 space-y-6 overflow-y-auto h-[calc(100vh-4rem)]">
          {navCategories.map((category) => (
            <div key={category.title} className="space-y-1">
              {sidebarOpen && (
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  {category.title}
                </p>
              )}
              {category.items.map((item) => (
                <NavLink
                  key={item.href}
                  to={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200',
                      'hover:bg-gray-100',
                      isActive ? 'bg-primary-50 text-primary-700 font-medium' : 'text-gray-700'
                    )
                  }
                  end={item.href === '/dashboard'}
                >
                  {item.icon}
                  {sidebarOpen && <span className="flex-1">{item.title}</span>}
                  {item.badge && sidebarOpen && (
                    <span className="bg-error-500 text-white text-xs px-2 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-error-600 hover:bg-error-50 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      <div
        className={cn(
          'flex-1 min-w-0 transition-all duration-300',
          sidebarOpen ? 'lg:ml-72' : 'lg:ml-20'
        )}
      >
        <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-4 lg:px-6">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden"
                onClick={() => setMobileMenuOpen(true)}
              >
                <Menu className="w-5 h-5" />
              </Button>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  {getPageTitle()}
                </h2>
                <p className="text-sm text-gray-600 hidden sm:block">
                  {new Date().toLocaleDateString('en-IN', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden md:block">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search..."
                    className="pl-10 pr-4 py-2 w-64 bg-gray-100 border-0 rounded-lg focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <Button variant="ghost" size="sm" className="relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-error-500 rounded-full" />
              </Button>

              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center justify-center w-8 h-8 bg-primary-600 text-white rounded-full text-sm font-medium">
                    {getInitials(user?.name || 'User')}
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                    <p className="text-xs text-gray-600">{user?.role}</p>
                  </div>
                </button>

                {userMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setUserMenuOpen(false)}
                    />
                    <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                      <NavLink
                        to="/profile"
                        className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-100"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <UserCheck className="w-4 h-4" />
                        Profile
                      </NavLink>
                      <NavLink
                        to="/settings"
                        className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-100"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <Settings className="w-4 h-4" />
                        Settings
                      </NavLink>
                      <hr className="my-2 border-gray-200" />
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2 text-error-600 hover:bg-error-50"
                      >
                        <LogOut className="w-4 h-4" />
                        Logout
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </header>

        <main className="p-4 lg:p-6">
          <Outlet />
        </main>
      </div>

      {mobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
          <aside className="fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-gray-200 lg:hidden overflow-y-auto">
            <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 bg-primary-600 rounded-xl">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="font-bold text-gray-900 text-lg">ERP DryMix</h1>
                </div>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-lg hover:bg-gray-100"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <nav className="p-4 space-y-6">
              {navCategories.map((category) => (
                <div key={category.title} className="space-y-1">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    {category.title}
                  </p>
                  {category.items.map((item) => (
                    <NavLink
                      key={item.href}
                      to={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={({ isActive }) =>
                        cn(
                          'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200',
                          'hover:bg-gray-100',
                          isActive ? 'bg-primary-50 text-primary-700 font-medium' : 'text-gray-700'
                        )
                      }
                      end={item.href === '/dashboard'}
                    >
                      {item.icon}
                      <span className="flex-1">{item.title}</span>
                      {item.badge && (
                        <span className="bg-error-500 text-white text-xs px-2 py-0.5 rounded-full">
                          {item.badge}
                        </span>
                      )}
                    </NavLink>
                  ))}
                </div>
              ))}
            </nav>
          </aside>
        </>
      )}
    </div>
  )
}

export default MainLayout

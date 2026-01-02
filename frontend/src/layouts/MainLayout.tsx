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
  HelpCircle,
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
} from 'lucide-react'
import { getInitials } from '@/utils'

// Navigation Item Interface
interface NavItem {
  title: string
  href: string
  icon: React.ReactNode
  badge?: number
}

// Main Layout Component
export const MainLayout: React.FC = () => {
  const { user, logout } = useAuth()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  // Navigation Items
  const navItems: NavItem[] = [
    {
      title: 'Dashboard',
      href: '/dashboard',
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
      title: 'Sales',
      href: '/sales',
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
    {
      title: 'Production',
      href: '/production',
      icon: <Factory className="w-5 h-5" />,
    },
    {
      title: 'Inventory',
      href: '/inventory',
      icon: <Database className="w-5 h-5" />,
    },
    {
      title: 'Quality',
      href: '/quality',
      icon: <CheckSquare className="w-5 h-5" />,
      badge: 3,
    },
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
      title: 'Procurement',
      href: '/procurement',
      icon: <ShoppingCart className="w-5 h-5" />,
    },
    {
      title: 'HR & Payroll',
      href: '/hr-payroll',
      icon: <UserCheck className="w-5 h-5" />,
    },
    {
      title: 'Planning',
      href: '/planning',
      icon: <CalendarClock className="w-5 h-5" />,
    },
    {
      title: 'Communication',
      href: '/communication',
      icon: <MessageSquare className="w-5 h-5" />,
      badge: 5,
    },
    {
      title: 'System',
      href: '/system',
      icon: <Settings className="w-5 h-5" />,
    },
  ]

  // Get current page title
  const getPageTitle = () => {
    const path = location.pathname
    if (path === '/dashboard') return 'Dashboard'
    if (path.startsWith('/sales')) return 'Sales & Customer Management'
    if (path.startsWith('/products')) return 'Products Management'
    if (path.startsWith('/customers')) return 'Customers'
    if (path.startsWith('/production')) return 'Production'
    if (path.startsWith('/inventory')) return 'Inventory & Stores'
    if (path.startsWith('/quality')) return 'Quality Control'
    if (path.startsWith('/finance')) return 'Finance & Accounting'
    if (path.startsWith('/credit-control')) return 'Credit Control'
    if (path.startsWith('/procurement')) return 'Procurement'
    if (path.startsWith('/hr-payroll')) return 'HR & Payroll'
    if (path.startsWith('/planning')) return 'Planning'
    if (path.startsWith('/communication')) return 'Communication'
    if (path.startsWith('/system')) return 'System Administration'
    return 'ERP DryMix Products'
  }

  // Handle Logout
  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 bg-white border-r border-gray-200 transition-all duration-300',
          sidebarOpen ? 'w-64' : 'w-20'
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
          {sidebarOpen && (
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 bg-primary-600 rounded-xl">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-gray-900">ERP</h1>
                <p className="text-xs text-gray-600">DryMix</p>
              </div>
            </div>
          )}
          {!sidebarOpen && (
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

        {/* Navigation */}
        <nav className="p-4 space-y-1 overflow-y-auto h-[calc(100vh-4rem)]">
          {navItems.map((item) => (
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
              {sidebarOpen && <span>{item.title}</span>}
              {item.badge && sidebarOpen && (
                <span className="ml-auto bg-error-500 text-white text-xs px-2 py-0.5 rounded-full">
                  {item.badge}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <NavLink
            to="/settings"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <Settings className="w-5 h-5" />
            {sidebarOpen && <span>Settings</span>}
          </NavLink>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-error-600 hover:bg-error-50 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div
        className={cn(
          'flex-1 min-w-0 transition-all duration-300',
          sidebarOpen ? 'lg:ml-64' : 'lg:ml-20'
        )}
      >
        {/* Header */}
        <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-4 lg:px-6">
            {/* Left: Mobile Menu & Breadcrumb */}
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

            {/* Right: Search, Notifications, User */}
            <div className="flex items-center gap-4">
              {/* Search */}
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

              {/* Notifications */}
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-error-500 rounded-full" />
              </Button>

              {/* User Menu */}
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

                {/* User Dropdown */}
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

        {/* Page Content */}
        <main className="p-4 lg:p-6">
          <Outlet />
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
          <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 lg:hidden">
            {/* Close Button */}
            <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 bg-primary-600 rounded-xl">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="font-bold text-gray-900">ERP</h1>
                  <p className="text-xs text-gray-600">DryMix</p>
                </div>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-lg hover:bg-gray-100"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* Mobile Navigation */}
            <nav className="p-4 space-y-1 overflow-y-auto h-[calc(100vh-4rem)]">
              {navItems.map((item) => (
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
                  <span>{item.title}</span>
                  {item.badge && (
                    <span className="ml-auto bg-error-500 text-white text-xs px-2 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              ))}
            </nav>
          </aside>
        </>
      )}
    </div>
  )
}

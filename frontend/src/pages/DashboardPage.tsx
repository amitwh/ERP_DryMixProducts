import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { api } from '@/services/api'
import { DashboardStats, ChartData } from '@/types'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { StatusBadge } from '@/components/ui/Badge'
import { Skeleton, SkeletonCard } from '@/components/ui/Loading'
import {
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  Users,
  ShoppingCart,
  Package,
  AlertTriangle,
  Activity,
  MoreHorizontal,
  Plus,
  RefreshCw,
  Clock,
} from 'lucide-react'
import { formatCurrency, formatNumber, formatDate, formatIndianNumber } from '@/utils'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

// Dashboard Page
export const DashboardPage: React.FC = () => {
  const { user } = useAuth()
  const navigate = useNavigate()

  // State
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [salesData, setSalesData] = useState<ChartData | null>(null)
  const [productionData, setProductionData] = useState<ChartData | null>(null)

  // Fetch Dashboard Data
  const fetchDashboardData = async () => {
    try {
      const response = await api.get<DashboardStats>('/dashboard/overview')
      setStats(response.data)

      // Generate sample sales data (replace with actual API)
      setSalesData({
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        datasets: [
          {
            label: 'Sales (₹)',
            data: [4500000, 5200000, 4800000, 6100000, 5900000, 7200000, 6800000, 7500000, 8200000, 7800000, 8500000, 9200000],
            backgroundColor: 'rgba(59, 130, 246, 0.1)' as any,
            borderColor: 'rgba(59, 130, 246, 1)' as any,
          },
        ],
      })

      // Generate sample production data
      setProductionData({
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [
          {
            label: 'Produced (MT)',
            data: [1200, 1450, 1320, 1580, 1490],
            backgroundColor: 'rgba(16, 185, 129, 0.5)' as any,
            borderColor: 'rgba(16, 185, 129, 1)' as any,
          },
        ],
      })
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  // Load Data on Mount
  useEffect(() => {
    fetchDashboardData()
  }, [])

  // Handle Refresh
  const handleRefresh = () => {
    setIsRefreshing(true)
    fetchDashboardData()
  }

  // Stat Card Component
  const StatCard: React.FC<{
    title: string
    value: number | string
    change?: number
    icon: React.ReactNode
    color: string
    isLoading?: boolean
    onClick?: () => void
  }> = ({ title, value, change, icon, color, isLoading, onClick }) => {
    if (isLoading) {
      return <SkeletonCard />
    }

    return (
      <Card
        variant="bordered"
        padding="lg"
        className={onClick ? 'cursor-pointer hover:shadow-lg transition-shadow' : ''}
        onClick={onClick}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              {typeof value === 'number' ? formatIndianNumber(value) : value}
            </h3>
            {change !== undefined && (
              <div className={`flex items-center gap-1 text-sm ${
                change >= 0 ? 'text-success-600' : 'text-error-600'
              }`}>
                {change >= 0 ? (
                  <ArrowUpRight className="w-4 h-4" />
                ) : (
                  <ArrowDownRight className="w-4 h-4" />
                )}
                <span>{Math.abs(change)}% from last month</span>
              </div>
            )}
          </div>
          <div className={`p-3 rounded-xl ${color}`}>
            {icon}
          </div>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">
            Welcome back, {user?.name}!
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />}
            onClick={handleRefresh}
            isLoading={isRefreshing}
          >
            Refresh
          </Button>
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => navigate('/sales/orders/create')}
          >
            New Order
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Sales"
          value={stats?.total_sales || 0}
          change={12.5}
          icon={<TrendingUp className="w-6 h-6 text-white" />}
          color="bg-primary-600"
          isLoading={isLoading}
          onClick={() => navigate('/sales/orders')}
        />
        <StatCard
          title="Total Orders"
          value={stats?.total_orders || 0}
          change={8.2}
          icon={<ShoppingCart className="w-6 h-6 text-white" />}
          color="bg-success-600"
          isLoading={isLoading}
          onClick={() => navigate('/sales/orders')}
        />
        <StatCard
          title="Total Customers"
          value={stats?.total_customers || 0}
          change={5.3}
          icon={<Users className="w-6 h-6 text-white" />}
          color="bg-secondary-600"
          isLoading={isLoading}
          onClick={() => navigate('/customers')}
        />
        <StatCard
          title="Total Products"
          value={stats?.total_products || 0}
          change={2.1}
          icon={<Package className="w-6 h-6 text-white" />}
          color="bg-warning-600"
          isLoading={isLoading}
          onClick={() => navigate('/products')}
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="Pending Orders"
          value={stats?.pending_orders || 0}
          icon={<Clock className="w-6 h-6 text-white" />}
          color="bg-yellow-600"
          isLoading={isLoading}
          onClick={() => navigate('/sales/orders?status=pending')}
        />
        <StatCard
          title="Production in Progress"
          value={stats?.production_in_progress || 0}
          icon={<Activity className="w-6 h-6 text-white" />}
          color="bg-blue-600"
          isLoading={isLoading}
          onClick={() => navigate('/production/orders?status=in_progress')}
        />
        <StatCard
          title="Quality Issues"
          value={stats?.quality_issues || 0}
          change={-3.2}
          icon={<AlertTriangle className="w-6 h-6 text-white" />}
          color="bg-error-600"
          isLoading={isLoading}
          onClick={() => navigate('/quality/inspections?status=failed')}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Trend Chart */}
        <Card variant="bordered" padding="lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Sales Trend</CardTitle>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton height={300} className="rounded" />
            ) : salesData ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={salesData.labels.map((label, i) => ({
                  name: label,
                  sales: salesData.datasets[0].data[i],
                }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="name" stroke="#6B7280" />
                  <YAxis stroke="#6B7280" tickFormatter={(value) => formatIndianNumber(value)} />
                  <Tooltip
                    formatter={(value: number) => [formatCurrency(value), 'Sales']}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="sales"
                    stroke={(salesData.datasets[0].borderColor as string[])?.[0] || '#3B82F6'}
                    fill={(salesData.datasets[0].backgroundColor as string[])?.[0] || '#93C5FD'}
                    strokeWidth={2}
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-500">
                No data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Production Chart */}
        <Card variant="bordered" padding="lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Production (Last 6 Months)</CardTitle>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton height={300} className="rounded" />
            ) : productionData ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={productionData.labels.map((label, i) => ({
                  name: label,
                  produced: productionData.datasets[0].data[i],
                }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="name" stroke="#6B7280" />
                  <YAxis stroke="#6B7280" />
                  <Tooltip formatter={(value: number) => [formatNumber(value, 0) + ' MT', 'Produced']} />
                  <Legend />
                  <Bar
                    dataKey="produced"
                    fill={(productionData.datasets[0].backgroundColor as string[])?.[0] || '#10B981'}
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-500">
                No data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity & Low Stock */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <Card variant="bordered" padding="lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Orders</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/sales/orders')}
              >
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center gap-4">
                    <Skeleton variant="circular" width={40} height={40} />
                    <div className="flex-1">
                      <Skeleton height={16} className="mb-2" />
                      <Skeleton height={12} width="60%" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {/* Sample Orders */}
                {[
                  { id: 'SO-2026-001', customer: 'ABC Construction', amount: 4520000, date: '2026-01-02', status: 'pending' },
                  { id: 'SO-2026-002', customer: 'XYZ Builders', amount: 3280000, date: '2026-01-01', status: 'approved' },
                  { id: 'SO-2026-003', customer: 'LMN Infra', amount: 5150000, date: '2025-12-31', status: 'completed' },
                ].map((order) => (
                  <div key={order.id} className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-gray-900">{order.id}</span>
                        <StatusBadge status={order.status} size="sm" />
                      </div>
                      <p className="text-sm text-gray-600">{order.customer}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{formatCurrency(order.amount)}</p>
                      <p className="text-sm text-gray-500">{formatDate(order.date)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Low Stock Items */}
        <Card variant="bordered" padding="lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Low Stock Alert</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/inventory/stock')}
              >
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} height={48} className="rounded" />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {[
                  { product: 'White Cement', code: 'WC-001', stock: 25, minStock: 50, unit: 'MT' },
                  { product: 'Red Oxide', code: 'RO-002', stock: 10, minStock: 30, unit: 'KG' },
                  { product: 'Polymer Admixture', code: 'PA-003', stock: 5, minStock: 20, unit: 'L' },
                ].map((item) => (
                  <div key={item.code} className="flex items-center justify-between p-3 bg-error-50 border border-error-200 rounded-lg">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{item.product}</p>
                      <p className="text-sm text-gray-600">{item.code}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-error-600">{item.stock} {item.unit}</p>
                      <p className="text-sm text-gray-500">Min: {item.minStock} {item.unit}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default DashboardPage

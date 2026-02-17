import React, { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { api } from '@/services/api'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Loading'
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Package,
  Users,
  AlertTriangle,
  BarChart3,
  LineChart,
  PieChart,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Filter,
} from 'lucide-react'
import {
  LineChart as RechartsLineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { formatCurrency, formatDate } from '@/utils'

interface AnalyticsData {
  revenue: { date: string; amount: number }[]
  production: { date: string; quantity: number }[]
  quality: { passed: number; failed: number; pending: number }
  inventory: { category: string; value: number }[]
  topProducts: { name: string; sales: number }[]
  topCustomers: { name: string; revenue: number }[]
  kpis: {
    revenue: { value: number; change: number; trend: 'up' | 'down' }
    orders: { value: number; change: number; trend: 'up' | 'down' }
    production: { value: number; change: number; trend: 'up' | 'down' }
    quality: { value: number; change: number; trend: 'up' | 'down' }
  }
}

const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899']

export const AnalyticsDashboardPage: React.FC = () => {
  const { user } = useAuth()
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d')
  const [activeTab, setActiveTab] = useState<'overview' | 'sales' | 'production' | 'quality'>('overview')

  useEffect(() => {
    fetchAnalytics()
  }, [dateRange])

  const fetchAnalytics = async () => {
    try {
      setIsLoading(true)
      const response = await api.get<{ data: AnalyticsData }>('/analytics/dashboard', {
        params: {
          organization_id: user?.organizationId,
          range: dateRange,
        },
      })
      setData(response.data.data)
    } catch (error) {
      console.error('Failed to fetch analytics:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const KPICard: React.FC<{
    title: string
    value: string | number
    change: number
    trend: 'up' | 'down'
    icon: React.ReactNode
  }> = ({ title, value, change, trend, icon }) => (
    <Card variant="bordered" padding="md">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          <div className={`flex items-center gap-1 mt-2 ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
            {trend === 'up' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
            <span className="text-sm font-medium">{Math.abs(change)}%</span>
            <span className="text-xs text-gray-500">vs last period</span>
          </div>
        </div>
        <div className={`p-3 rounded-lg ${trend === 'up' ? 'bg-green-100' : 'bg-red-100'}`}>{icon}</div>
      </div>
    </Card>
  )

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} height={120} className="rounded-lg" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton height={300} className="rounded-lg" />
          <Skeleton height={300} className="rounded-lg" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600">Comprehensive business intelligence and insights</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value as typeof dateRange)}
            className="px-3 py-2 border rounded-lg text-sm"
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
            <option value="1y">Last Year</option>
          </select>
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
        </div>
      </div>

      <div className="flex gap-2 border-b">
        {(['overview', 'sales', 'production', 'quality'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {data?.kpis && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <KPICard
            title="Total Revenue"
            value={formatCurrency(data.kpis.revenue.value)}
            change={data.kpis.revenue.change}
            trend={data.kpis.revenue.trend}
            icon={<DollarSign className="w-5 h-5 text-green-600" />}
          />
          <KPICard
            title="Total Orders"
            value={data.kpis.orders.value.toLocaleString()}
            change={data.kpis.orders.change}
            trend={data.kpis.orders.trend}
            icon={<Package className="w-5 h-5 text-blue-600" />}
          />
          <KPICard
            title="Production Output"
            value={`${data.kpis.production.value.toLocaleString()} MT`}
            change={data.kpis.production.change}
            trend={data.kpis.production.trend}
            icon={<Activity className="w-5 h-5 text-purple-600" />}
          />
          <KPICard
            title="Quality Rate"
            value={`${data.kpis.quality.value}%`}
            change={data.kpis.quality.change}
            trend={data.kpis.quality.trend}
            icon={<TrendingUp className="w-5 h-5 text-orange-600" />}
          />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card variant="bordered" padding="lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LineChart className="w-5 h-5" />
              Revenue Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={data?.revenue || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tickFormatter={(v) => formatDate(v)} />
                <YAxis tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Area type="monotone" dataKey="amount" stroke="#3B82F6" fill="#93C5FD" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card variant="bordered" padding="lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Production Volume
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data?.production || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tickFormatter={(v) => formatDate(v)} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="quantity" fill="#10B981" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card variant="bordered" padding="lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="w-5 h-5" />
              Quality Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPieChart>
                <Pie
                  data={[
                    { name: 'Passed', value: data?.quality?.passed || 0 },
                    { name: 'Failed', value: data?.quality?.failed || 0 },
                    { name: 'Pending', value: data?.quality?.pending || 0 },
                  ]}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  label
                >
                  {COLORS.map((color, index) => (
                    <Cell key={`cell-${index}`} fill={color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </RechartsPieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card variant="bordered" padding="lg">
          <CardHeader>
            <CardTitle>Top Products by Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {(data?.topProducts || []).map((product, index) => (
                <div key={product.name} className="flex items-center gap-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm`} style={{ backgroundColor: COLORS[index % COLORS.length] }}>
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{product.name}</p>
                    <div className="w-full bg-gray-100 rounded-full h-2 mt-1">
                      <div
                        className="h-2 rounded-full"
                        style={{
                          width: `${(product.sales / (data?.topProducts?.[0]?.sales || 1)) * 100}%`,
                          backgroundColor: COLORS[index % COLORS.length],
                        }}
                      />
                    </div>
                  </div>
                  <p className="font-semibold">{formatCurrency(product.sales)}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card variant="bordered" padding="lg">
        <CardHeader>
          <CardTitle>Top Customers by Revenue</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 font-medium text-gray-600">Rank</th>
                  <th className="text-left p-3 font-medium text-gray-600">Customer</th>
                  <th className="text-right p-3 font-medium text-gray-600">Revenue</th>
                  <th className="text-right p-3 font-medium text-gray-600">% of Total</th>
                </tr>
              </thead>
              <tbody>
                {(data?.topCustomers || []).map((customer, index) => (
                  <tr key={customer.name} className="border-b hover:bg-gray-50">
                    <td className="p-3">
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      >
                        {index + 1}
                      </div>
                    </td>
                    <td className="p-3 font-medium">{customer.name}</td>
                    <td className="p-3 text-right">{formatCurrency(customer.revenue)}</td>
                    <td className="p-3 text-right text-gray-600">
                      {((customer.revenue / (data?.topCustomers?.reduce((a, b) => a + b.revenue, 0) || 1)) * 100).toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default AnalyticsDashboardPage

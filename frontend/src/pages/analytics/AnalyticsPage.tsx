import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { api } from '@/services/api'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Loading'
import { Alert } from '@/components/ui/Alert'
import { BarChart3, TrendingUp, TrendingDown, Activity, Calendar, PieChart } from 'lucide-react'
import { formatDate, formatNumber, formatCurrency } from '@/utils'

interface AnalyticsData {
  summary: {
    total_revenue: number
    total_cost: number
    profit_margin: number
    production_efficiency: number
    quality_rate: number
    customer_satisfaction: number
    on_time_delivery: number
  }
  sales_trend: Array<{
    date: string
    revenue: number
    orders: number
  }>
  top_products: Array<{
    product_name: string
    revenue: number
    quantity: number
    growth_rate: number
  }>
  performance_metrics: Array<{
    metric_name: string
    current_value: number
    target_value: number
    status: 'on_track' | 'behind' | 'ahead'
  }>
  alerts: Array<{
    type: 'warning' | 'error' | 'info'
    message: string
    module: string
    timestamp: string
  }>
}

export default function AnalyticsPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d')

  useEffect(() => {
    fetchAnalytics()
  }, [timeRange])

  const fetchAnalytics = async () => {
    try {
      setIsLoading(true)
      const response = await api.get<{ data: AnalyticsData }>('/analytics', {
        params: {
          organization_id: user?.organizationId,
          time_range: timeRange,
        },
      })
      setData(response.data)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch analytics')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto p-8">
        <Skeleton height={200} className="rounded mb-6" />
        <Skeleton height={400} className="rounded" />
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600">Comprehensive business analytics and insights</p>
        </div>
        <div className="flex items-center gap-2">
          {(['7d', '30d', '90d', '1y'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                timeRange === range
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : range === '90d' ? '90 Days' : '1 Year'}
            </button>
          ))}
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.print()}
          >
            Export Report
          </Button>
        </div>
      </div>

      {error && <Alert type="error" message={error} onDismiss={() => setError(null)} />}

      {data && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card variant="bordered" padding="lg">
              <div className="text-center">
                <BarChart3 className="w-6 h-6 text-primary-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-600 mb-1">Total Revenue</p>
                <h3 className="text-2xl font-bold text-gray-900">
                  {formatCurrency(data.summary.total_revenue)}
                </h3>
                <p className="text-xs text-success-600 mt-2">
                  <TrendingUp className="w-3 h-3 inline mr-1" />
                  +12.5% from last period
                </p>
              </div>
            </Card>
            <Card variant="bordered" padding="lg">
              <div className="text-center">
                <TrendingUp className="w-6 h-6 text-success-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-600 mb-1">Profit Margin</p>
                <h3 className="text-2xl font-bold text-success-600">
                  {data.summary.profit_margin.toFixed(1)}%
                </h3>
                <p className="text-xs text-success-600 mt-2">
                  <TrendingUp className="w-3 h-3 inline mr-1" />
                  +2.3% from last period
                </p>
              </div>
            </Card>
            <Card variant="bordered" padding="lg">
              <div className="text-center">
                <Activity className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-600 mb-1">Production Efficiency</p>
                <h3 className="text-2xl font-bold text-blue-600">
                  {data.summary.production_efficiency.toFixed(1)}%
                </h3>
                <p className="text-xs text-success-600 mt-2">
                  <TrendingUp className="w-3 h-3 inline mr-1" />
                  +5.8% from last period
                </p>
              </div>
            </Card>
            <Card variant="bordered" padding="lg">
              <div className="text-center">
                <PieChart className="w-6 h-6 text-warning-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-600 mb-1">Quality Rate</p>
                <h3 className="text-2xl font-bold text-warning-600">
                  {data.summary.quality_rate.toFixed(1)}%
                </h3>
                <p className="text-xs text-error-600 mt-2">
                  <TrendingDown className="w-3 h-3 inline mr-1" />
                  -1.2% from last period
                </p>
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card variant="bordered" padding="lg" className="lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Sales Trend
                </h3>
                <Calendar className="w-5 h-5 text-gray-400" />
              </div>
              <div className="space-y-4">
                {data.sales_trend.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">{formatDate(item.date)}</p>
                      <p className="text-xs text-gray-500">
                        {item.orders} orders
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold text-gray-900">
                        {formatCurrency(item.revenue)}
                      </p>
                      <p className="text-xs text-success-600">
                        {index < data.sales_trend.length - 1 &&
                         item.revenue > data.sales_trend[index + 1].revenue
                          ? '+5%'
                          : '-2%'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card variant="bordered" padding="lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Key Metrics
              </h3>
              <div className="space-y-3">
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-1">Customer Satisfaction</p>
                  <p className="text-3xl font-bold text-primary-600">
                    {data.summary.customer_satisfaction.toFixed(1)}%
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-1">On-Time Delivery</p>
                  <p className="text-3xl font-bold text-success-600">
                    {data.summary.on_time_delivery.toFixed(1)}%
                  </p>
                </div>
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card variant="bordered" padding="lg">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Top Products
                </h3>
                <BarChart3 className="w-5 h-5 text-gray-400" />
              </div>
              <div className="space-y-3">
                {data.top_products.map((product, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{product.product_name}</p>
                      <p className="text-sm text-gray-600">
                        {formatNumber(product.quantity)} units
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold text-primary-600">
                        {formatCurrency(product.revenue)}
                      </p>
                      <p className={`text-xs ${
                        product.growth_rate >= 0 ? 'text-success-600' : 'text-error-600'
                      }`}>
                        {product.growth_rate >= 0 ? '+' : ''}
                        {product.growth_rate.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card variant="bordered" padding="lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Performance Metrics
              </h3>
              <div className="space-y-3">
                {data.performance_metrics.map((metric, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium text-gray-900">
                        {metric.metric_name}
                      </p>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        metric.status === 'on_track'
                          ? 'bg-success-100 text-success-800'
                          : metric.status === 'behind'
                          ? 'bg-error-100 text-error-800'
                          : 'bg-warning-100 text-warning-800'
                      }`}>
                        {metric.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-600">Current</p>
                      <p className="text-sm text-gray-600">Target</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-gray-900">
                        {metric.current_value}%
                      </p>
                      <p className="text-sm font-semibold text-gray-900">
                        {metric.target_value}%
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {data.alerts.length > 0 && (
            <Card variant="bordered" padding="lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Recent Alerts ({data.alerts.length})
              </h3>
              <div className="space-y-3">
                {data.alerts.map((alert, index) => (
                  <div
                    key={index}
                    className={`p-4 border rounded-lg ${
                      alert.type === 'error'
                        ? 'border-error-200 bg-error-50'
                        : alert.type === 'warning'
                        ? 'border-warning-200 bg-warning-50'
                        : 'border-blue-200 bg-blue-50'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium text-gray-600">
                            {alert.module}
                          </span>
                          <span className="text-xs text-gray-500">
                            {formatDate(alert.timestamp)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-900">{alert.message}</p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/${alert.module}`)}
                      >
                        View
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  )
}

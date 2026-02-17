import React, { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { api } from '@/services/api'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Loading'
import { Download, Calendar, AlertTriangle, TrendingUp } from 'lucide-react'
import { formatCurrency, formatDate } from '@/utils'

interface AgingBucket {
  range: string
  amount: number
  count: number
  percentage: number
}

interface AgingData {
  customer_id: number
  customer_name: string
  customer_code: string
  total_outstanding: number
  current: number
  days_1_30: number
  days_31_60: number
  days_61_90: number
  days_90_plus: number
}

interface AgingSummary {
  total_outstanding: number
  current: number
  days_1_30: number
  days_31_60: number
  days_61_90: number
  days_90_plus: number
  customers_at_risk: number
}

export const AgingReportsPage: React.FC = () => {
  const { user } = useAuth()
  const [agingData, setAgingData] = useState<AgingData[]>([])
  const [summary, setSummary] = useState<AgingSummary | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [dateRange, setDateRange] = useState<'today' | 'week' | 'month'>('today')

  const fetchAgingData = async () => {
    try {
      setIsLoading(true)
      const response = await api.get<{ data: AgingData[]; summary: AgingSummary }>('/credit-control/aging', {
        params: {
          organization_id: user?.organizationId,
          date_range: dateRange,
        },
      })
      setAgingData(response.data.data || [])
      setSummary(response.data.summary || null)
    } catch (error) {
      console.error('Failed to fetch aging data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchAgingData()
  }, [dateRange])

  const exportReport = () => {
    const csv = [
      'Customer Code,Customer Name,Total Outstanding,Current,1-30 Days,31-60 Days,61-90 Days,90+ Days',
      ...agingData.map((row) =>
        `${row.customer_code},${row.customer_name},${row.total_outstanding},${row.current},${row.days_1_30},${row.days_31_60},${row.days_61_90},${row.days_90_plus}`
      ),
    ].join('\n')
    
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `aging-report-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  const buckets: AgingBucket[] = summary
    ? [
        { range: 'Current', amount: summary.current, count: agingData.filter((d) => d.current > 0).length, percentage: (summary.current / summary.total_outstanding) * 100 },
        { range: '1-30 Days', amount: summary.days_1_30, count: agingData.filter((d) => d.days_1_30 > 0).length, percentage: (summary.days_1_30 / summary.total_outstanding) * 100 },
        { range: '31-60 Days', amount: summary.days_31_60, count: agingData.filter((d) => d.days_31_60 > 0).length, percentage: (summary.days_31_60 / summary.total_outstanding) * 100 },
        { range: '61-90 Days', amount: summary.days_61_90, count: agingData.filter((d) => d.days_61_90 > 0).length, percentage: (summary.days_61_90 / summary.total_outstanding) * 100 },
        { range: '90+ Days', amount: summary.days_90_plus, count: agingData.filter((d) => d.days_90_plus > 0).length, percentage: (summary.days_90_plus / summary.total_outstanding) * 100 },
      ]
    : []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Aging Reports</h1>
          <p className="text-gray-600">Analyze receivables by aging buckets</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value as 'today' | 'week' | 'month')}
            className="px-3 py-2 border rounded-lg text-sm"
          >
            <option value="today">As of Today</option>
            <option value="week">Last Week</option>
            <option value="month">Last Month</option>
          </select>
          <Button variant="outline" size="sm" leftIcon={<Download className="w-4 h-4" />} onClick={exportReport}>
            Export CSV
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} height={120} className="rounded" />
          ))}
        </div>
      ) : (
        <>
          {summary && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card variant="bordered" padding="md">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Total Outstanding</p>
                    <p className="text-xl font-bold text-gray-900">{formatCurrency(summary.total_outstanding)}</p>
                  </div>
                </div>
              </Card>
              <Card variant="bordered" padding="md">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Over 90 Days</p>
                    <p className="text-xl font-bold text-red-600">{formatCurrency(summary.days_90_plus)}</p>
                  </div>
                </div>
              </Card>
              <Card variant="bordered" padding="md">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">31-90 Days</p>
                    <p className="text-xl font-bold text-yellow-600">
                      {formatCurrency(summary.days_31_60 + summary.days_61_90)}
                    </p>
                  </div>
                </div>
              </Card>
              <Card variant="bordered" padding="md">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Customers at Risk</p>
                    <p className="text-xl font-bold text-gray-900">{summary.customers_at_risk}</p>
                  </div>
                </div>
              </Card>
            </div>
          )}

          <Card variant="bordered" padding="lg">
            <CardHeader>
              <CardTitle>Aging Buckets Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {buckets.map((bucket) => (
                  <div key={bucket.range} className="flex items-center gap-4">
                    <div className="w-24 text-sm font-medium text-gray-700">{bucket.range}</div>
                    <div className="flex-1">
                      <div className="w-full bg-gray-100 rounded-full h-8 relative overflow-hidden">
                        <div
                          className={`h-8 rounded-full flex items-center justify-end pr-3 ${
                            bucket.range === 'Current'
                              ? 'bg-green-500'
                              : bucket.range === '1-30 Days'
                              ? 'bg-blue-500'
                              : bucket.range === '31-60 Days'
                              ? 'bg-yellow-500'
                              : bucket.range === '61-90 Days'
                              ? 'bg-orange-500'
                              : 'bg-red-500'
                          }`}
                          style={{ width: `${Math.max(bucket.percentage, 5)}%` }}
                        >
                          <span className="text-xs font-semibold text-white">{bucket.percentage.toFixed(1)}%</span>
                        </div>
                      </div>
                    </div>
                    <div className="w-32 text-right">
                      <p className="font-semibold text-gray-900">{formatCurrency(bucket.amount)}</p>
                      <p className="text-xs text-gray-500">{bucket.count} customers</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card variant="bordered" padding="lg">
            <CardHeader>
              <CardTitle>Customer Aging Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="text-left p-3 font-medium text-gray-700">Customer</th>
                      <th className="text-right p-3 font-medium text-gray-700">Total</th>
                      <th className="text-right p-3 font-medium text-gray-700">Current</th>
                      <th className="text-right p-3 font-medium text-gray-700">1-30</th>
                      <th className="text-right p-3 font-medium text-gray-700">31-60</th>
                      <th className="text-right p-3 font-medium text-gray-700">61-90</th>
                      <th className="text-right p-3 font-medium text-gray-700">90+</th>
                    </tr>
                  </thead>
                  <tbody>
                    {agingData.map((row) => (
                      <tr key={row.customer_id} className="border-b hover:bg-gray-50">
                        <td className="p-3">
                          <div>
                            <p className="font-medium text-gray-900">{row.customer_name}</p>
                            <p className="text-xs text-gray-500">{row.customer_code}</p>
                          </div>
                        </td>
                        <td className="text-right p-3 font-semibold">{formatCurrency(row.total_outstanding)}</td>
                        <td className="text-right p-3 text-green-600">{formatCurrency(row.current)}</td>
                        <td className="text-right p-3 text-blue-600">{formatCurrency(row.days_1_30)}</td>
                        <td className="text-right p-3 text-yellow-600">{formatCurrency(row.days_31_60)}</td>
                        <td className="text-right p-3 text-orange-600">{formatCurrency(row.days_61_90)}</td>
                        <td className="text-right p-3 text-red-600 font-semibold">
                          {row.days_90_plus > 0 && formatCurrency(row.days_90_plus)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}

export default AgingReportsPage

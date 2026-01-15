import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { api } from '@/services/api'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Skeleton } from '@/components/ui/Loading'
import { Alert } from '@/components/ui/Alert'
import { BarChart3, Download, Printer, Filter, Calendar, TrendingUp, Package, CheckCircle, AlertTriangle } from 'lucide-react'
import { formatDate, formatNumber } from '@/utils'

interface ProductionReport {
  id: number
  report_type: 'daily' | 'weekly' | 'monthly' | 'custom'
  start_date: string
  end_date: string
  total_orders: number
  completed_orders: number
  pending_orders: number
  total_production: number
  total_waste: number
  efficiency_rate: number
  avg_efficiency: number
  uom: string
  generated_at: string
}

interface ReportSummary {
  today_production: number
  today_efficiency: number
  week_production: number
  week_efficiency: number
  month_production: number
  month_efficiency: number
  top_products: Array<{
    product_name: string
    quantity: number
    efficiency: number
  }>
  top_workstations: Array<{
    workstation_name: string
    production: number
    efficiency: number
  }>
}

export default function ProductionReportsPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [reports, setReports] = useState<ProductionReport[]>([])
  const [summary, setSummary] = useState<ReportSummary | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [reportType, setReportType] = useState<'daily' | 'weekly' | 'monthly'>('daily')
  const [startDate, setStartDate] = useState(formatDate(new Date().setDate(1), 'YYYY-MM-DD'))
  const [endDate, setEndDate] = useState(formatDate(new Date(), 'YYYY-MM-DD'))

  useEffect(() => {
    fetchReports()
  }, [])

  const fetchReports = async () => {
    try {
      setIsLoading(true)
      const [reportsRes, summaryRes] = await Promise.all([
        api.get<{ data: ProductionReport[] }>('/production/reports', {
          params: {
            organization_id: user?.organizationId,
            start_date: startDate,
            end_date: endDate,
          },
        }),
        api.get<ReportSummary>('/production/reports/summary', {
          params: { organization_id: user?.organizationId },
        }),
      ])

      setReports(reportsRes.data.data || [])
      setSummary(summaryRes.data)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch reports')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGenerateReport = async () => {
    try {
      const response = await api.post<{ data: ProductionReport }>('/production/reports/generate', {
        organization_id: user?.organizationId,
        report_type: 'custom',
        start_date: startDate,
        end_date: endDate,
      })

      navigate(`/production/reports/${response.data.id}`)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to generate report')
    }
  }

  const handleExportReport = async (reportId: number) => {
    try {
      const response = await api.get(`/production/reports/${reportId}/export`, {
        responseType: 'blob',
      })

      const url = window.URL.createObjectURL(new Blob([response.data]))
      const a = document.createElement('a')
      a.href = url
      a.download = `production-report-${reportId}.xlsx`
      a.click()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Failed to export report:', err)
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
          <h1 className="text-2xl font-bold text-gray-900">Production Reports</h1>
          <p className="text-gray-600">Comprehensive production analytics and reporting</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<BarChart3 className="w-4 h-4" />}
            onClick={() => navigate('/production/analytics')}
          >
            Analytics
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleGenerateReport}
          >
            Generate Report
          </Button>
        </div>
      </div>

      {error && <Alert type="error" message={error} onDismiss={() => setError(null)} />}

      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card variant="bordered" padding="lg">
            <div className="text-center">
              <Calendar className="w-6 h-6 text-primary-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-600 mb-1">Today's Production</p>
              <h3 className="text-2xl font-bold text-gray-900">{formatNumber(summary.today_production)} MT</h3>
              <p className="text-xs text-gray-500 mt-1">
                Efficiency: {summary.today_efficiency.toFixed(1)}%
              </p>
            </div>
          </Card>
          <Card variant="bordered" padding="lg">
            <div className="text-center">
              <TrendingUp className="w-6 h-6 text-success-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-600 mb-1">This Week</p>
              <h3 className="text-2xl font-bold text-gray-900">{formatNumber(summary.week_production)} MT</h3>
              <p className="text-xs text-gray-500 mt-1">
                Efficiency: {summary.week_efficiency.toFixed(1)}%
              </p>
            </div>
          </Card>
          <Card variant="bordered" padding="lg">
            <div className="text-center">
              <Package className="w-6 h-6 text-warning-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-600 mb-1">This Month</p>
              <h3 className="text-2xl font-bold text-gray-900">{formatNumber(summary.month_production)} MT</h3>
              <p className="text-xs text-gray-500 mt-1">
                Efficiency: {summary.month_efficiency.toFixed(1)}%
              </p>
            </div>
          </Card>
          <Card variant="bordered" padding="lg">
            <div className="text-center">
              <CheckCircle className="w-6 h-6 text-blue-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-600 mb-1">Completion Rate</p>
              <h3 className="text-2xl font-bold text-gray-900">
                {((summary.week_production / (summary.week_production + summary.week_production * 0.05)) * 100).toFixed(1)}%
              </h3>
              <p className="text-xs text-gray-500 mt-1">On-time deliveries</p>
            </div>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card variant="bordered" padding="lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Generate Custom Report
            </h3>
            <Filter className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Report Type
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value as any)}
                >
                  <option value="daily">Daily Report</option>
                  <option value="weekly">Weekly Report</option>
                  <option value="monthly">Monthly Report</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date
                </label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date
                </label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>
            <Button
              variant="primary"
              onClick={handleGenerateReport}
              className="w-full"
            >
              Generate Report
            </Button>
          </div>
        </Card>

        {summary?.top_products && summary.top_products.length > 0 && (
          <Card variant="bordered" padding="lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Top Products This Month
            </h3>
            <div className="space-y-3">
              {summary.top_products.slice(0, 5).map((product, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{product.product_name}</p>
                    <p className="text-sm text-gray-600">
                      Efficiency: {product.efficiency.toFixed(1)}%
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold text-primary-600">
                      {formatNumber(product.quantity)} MT
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>

      <Card variant="bordered" padding="lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Recent Reports ({reports.length})
          </h3>
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Download className="w-4 h-4" />}
            onClick={() => {
              const csvContent =
                'data:text/csv;charset=utf-8,' +
                'Report Type,Start Date,End Date,Total Orders,Completed,Pending,Production,Efficiency,Generated At\n' +
                reports
                  .map(r =>
                    `${r.report_type},${r.start_date},${r.end_date},${r.total_orders},${r.completed_orders},${r.pending_orders},${r.total_production},${r.efficiency_rate.toFixed(1)}%,${r.generated_at}`
                  )
                  .join('\n')
              const link = document.createElement('a')
              link.setAttribute('href', encodeURI(csvContent))
              link.setAttribute('download', 'production-reports.csv')
              document.body.appendChild(link)
              link.click()
              document.body.removeChild(link)
            }}
          >
            Export All
          </Button>
        </div>

        {reports.length === 0 ? (
          <div className="text-center py-8">
            <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">No reports generated yet</p>
            <Button
              variant="primary"
              size="sm"
              onClick={handleGenerateReport}
            >
              Generate First Report
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {reports.map((report) => (
              <div
                key={report.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      report.report_type === 'daily' ? 'bg-blue-100 text-blue-800' :
                      report.report_type === 'weekly' ? 'bg-green-100 text-green-800' :
                      'bg-purple-100 text-purple-800'
                    }`}>
                      {report.report_type.toUpperCase()}
                    </span>
                    <p className="text-sm text-gray-600">
                      {formatDate(report.start_date)} - {formatDate(report.end_date)}
                    </p>
                  </div>
                  <div className="grid grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Orders</p>
                      <p className="font-semibold text-gray-900">
                        {report.completed_orders}/{report.total_orders}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Production</p>
                      <p className="font-semibold text-gray-900">
                        {formatNumber(report.total_production)} {report.uom}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Waste</p>
                      <p className="font-semibold text-error-600">
                        {formatNumber(report.total_waste)} {report.uom}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Efficiency</p>
                      <p className={`font-semibold ${
                        report.efficiency_rate >= 90 ? 'text-success-600' :
                        report.efficiency_rate >= 70 ? 'text-warning-600' :
                        'text-error-600'
                      }`}>
                        {report.efficiency_rate.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    leftIcon={<Printer className="w-4 h-4" />}
                    onClick={() => navigate(`/production/reports/${report.id}`)}
                  >
                    View
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    leftIcon={<Download className="w-4 h-4" />}
                    onClick={() => handleExportReport(report.id)}
                  >
                    Export
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}

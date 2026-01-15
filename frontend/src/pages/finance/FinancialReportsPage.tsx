import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { api } from '@/services/api'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Skeleton } from '@/components/ui/Loading'
import { Alert } from '@/components/ui/Alert'
import { BarChart3, Download, Printer, Filter, DollarSign, TrendingUp, TrendingDown, PieChart } from 'lucide-react'
import { formatDate, formatNumber, formatCurrency } from '@/utils'

interface FinancialReport {
  id: number
  report_number: string
  report_type: 'profit_loss' | 'balance_sheet' | 'trial_balance' | 'cash_flow' | 'aged_receivables' | 'aged_payables'
  fiscal_year_id: number
  fiscal_year: string
  period_start: string
  period_end: string
  generated_at: string
  generated_by: string
  total_revenue?: number
  total_expenses?: number
  net_profit?: number
  total_assets?: number
  total_liabilities?: number
  equity?: number
  opening_balance?: number
  closing_balance?: number
  total_receivables?: number
  total_payables?: number
}

export default function FinancialReportsPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [reports, setReports] = useState<FinancialReport[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reportType, setReportType] = useState<'all' | 'profit_loss' | 'balance_sheet' | 'trial_balance' | 'cash_flow' | 'aged_receivables' | 'aged_payables'>('all')
  const [fiscalYear, setFiscalYear] = useState('')
  const [startDate, setStartDate] = useState(formatDate(new Date().setDate(1), 'YYYY-MM-DD'))
  const [endDate, setEndDate] = useState(formatDate(new Date(), 'YYYY-MM-DD'))

  useEffect(() => {
    fetchReports()
  }, [reportType, fiscalYear])

  const fetchReports = async () => {
    try {
      setIsLoading(true)
      const response = await api.get<{ data: FinancialReport[] }>('/finance/reports', {
        params: {
          organization_id: user?.organizationId,
          report_type: reportType === 'all' ? undefined : reportType,
          fiscal_year_id: fiscalYear || undefined,
          start_date: startDate,
          end_date: endDate,
        },
      })
      setReports(response.data.data || [])
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch reports')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGenerateReport = async () => {
    try {
      const response = await api.post<{ data: FinancialReport }>('/finance/reports/generate', {
        organization_id: user?.organizationId,
        report_type: reportType === 'all' ? 'profit_loss' : reportType,
        fiscal_year_id: fiscalYear || undefined,
        start_date: startDate,
        end_date: endDate,
      })

      navigate(`/finance/reports/${response.data.id}`)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to generate report')
    }
  }

  const handleExportReport = async (reportId: number) => {
    try {
      const response = await api.get(`/finance/reports/${reportId}/export`, {
        responseType: 'blob',
      })

      const url = window.URL.createObjectURL(new Blob([response.data]))
      const a = document.createElement('a')
      a.href = url
      a.download = `financial-report-${reportId}.xlsx`
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

  const totalRevenue = reports.reduce((sum, r) => sum + (r.total_revenue || 0), 0)
  const totalExpenses = reports.reduce((sum, r) => sum + (r.total_expenses || 0), 0)
  const netProfit = totalRevenue - totalExpenses

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      profit_loss: 'Profit & Loss',
      balance_sheet: 'Balance Sheet',
      trial_balance: 'Trial Balance',
      cash_flow: 'Cash Flow',
      aged_receivables: 'Aged Receivables',
      aged_payables: 'Aged Payables',
    }
    return labels[type] || type
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Financial Reports</h1>
          <p className="text-gray-600">Comprehensive financial reporting and analytics</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<BarChart3 className="w-4 h-4" />}
            onClick={() => navigate('/finance/analytics')}
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

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card variant="bordered" padding="lg">
          <div className="text-center">
            <DollarSign className="w-6 h-6 text-primary-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-600 mb-1">Total Revenue</p>
            <h3 className="text-2xl font-bold text-success-600">
              {formatCurrency(totalRevenue)}
            </h3>
          </div>
        </Card>
        <Card variant="bordered" padding="lg">
          <div className="text-center">
            <TrendingDown className="w-6 h-6 text-error-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-600 mb-1">Total Expenses</p>
            <h3 className="text-2xl font-bold text-error-600">
              {formatCurrency(totalExpenses)}
            </h3>
          </div>
        </Card>
        <Card variant="bordered" padding="lg">
          <div className="text-center">
            <PieChart className="w-6 h-6 text-primary-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-600 mb-1">Net Profit</p>
            <h3 className={`text-2xl font-bold ${
              netProfit >= 0 ? 'text-success-600' : 'text-error-600'
            }`}>
              {formatCurrency(netProfit)}
            </h3>
          </div>
        </Card>
        <Card variant="bordered" padding="lg">
          <div className="text-center">
            <BarChart3 className="w-6 h-6 text-blue-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-600 mb-1">Total Reports</p>
            <h3 className="text-2xl font-bold text-gray-900">{reports.length}</h3>
          </div>
        </Card>
      </div>

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
                  <option value="all">All Reports</option>
                  <option value="profit_loss">Profit & Loss Statement</option>
                  <option value="balance_sheet">Balance Sheet</option>
                  <option value="trial_balance">Trial Balance</option>
                  <option value="cash_flow">Cash Flow Statement</option>
                  <option value="aged_receivables">Aged Receivables</option>
                  <option value="aged_payables">Aged Payables</option>
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

        <Card variant="bordered" padding="lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Report Summary
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="text-sm font-semibold text-gray-900 mb-3">Revenue</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Revenue</span>
                  <span className="font-semibold text-success-600">
                    {formatCurrency(totalRevenue)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Gross Profit</span>
                  <span className="font-semibold text-gray-900">
                    {formatCurrency(totalRevenue * 0.6)}
                  </span>
                </div>
              </div>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="text-sm font-semibold text-gray-900 mb-3">Expenses</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Expenses</span>
                  <span className="font-semibold text-error-600">
                    {formatCurrency(totalExpenses)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Net Profit</span>
                  <span className={`font-semibold ${
                    netProfit >= 0 ? 'text-success-600' : 'text-error-600'
                  }`}>
                    {formatCurrency(netProfit)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Card>
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
                'Report Number,Type,Fiscal Year,Period Start,Period End,Generated At,Generated By\n' +
                reports
                  .map(r =>
                    `${r.report_number},${getTypeLabel(r.report_type)},${r.fiscal_year},${r.period_start},${r.period_end},${r.generated_at},${r.generated_by}`
                  )
                  .join('\n')
              const link = document.createElement('a')
              link.setAttribute('href', encodeURI(csvContent))
              link.setAttribute('download', 'financial-reports.csv')
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
                className="p-4 border rounded-lg hover:shadow-md transition-all border-gray-200"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                        {getTypeLabel(report.report_type)}
                      </span>
                      <span className="text-sm text-gray-600">{report.report_number}</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      FY {report.fiscal_year} | {formatDate(report.period_start)} - {formatDate(report.period_end)}
                    </div>
                  </div>
                  <div className="text-sm text-gray-600">
                    Generated on {formatDate(report.generated_at)} by {report.generated_by}
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-4 mb-3 pt-3 border-t border-gray-200">
                  {report.total_revenue !== undefined && (
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Revenue</p>
                      <p className="text-lg font-semibold text-success-600">
                        {formatCurrency(report.total_revenue)}
                      </p>
                    </div>
                  )}
                  {report.net_profit !== undefined && (
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Net Profit</p>
                      <p className={`text-lg font-semibold ${
                        report.net_profit >= 0 ? 'text-success-600' : 'text-error-600'
                      }`}>
                        {formatCurrency(report.net_profit)}
                      </p>
                    </div>
                  )}
                  {report.total_assets !== undefined && (
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Total Assets</p>
                      <p className="text-lg font-semibold text-primary-600">
                        {formatCurrency(report.total_assets)}
                      </p>
                    </div>
                  )}
                  {report.equity !== undefined && (
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Equity</p>
                      <p className="text-lg font-semibold text-blue-600">
                        {formatCurrency(report.equity)}
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-end pt-3 border-t border-gray-200">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/finance/reports/${report.id}`)}
                    >
                      View
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      leftIcon={<Download className="w-4 h-4" />}
                      onClick={() => handleExportReport(report.id)}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      leftIcon={<Printer className="w-4 h-4" />}
                      onClick={() => window.print()}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}

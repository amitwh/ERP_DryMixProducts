import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { api } from '@/services/api'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Skeleton } from '@/components/ui/Loading'
import { Alert } from '@/components/ui/Alert'
import { BarChart3, Download, Printer, Calendar, TrendingUp, TrendingDown, CheckCircle, AlertTriangle } from 'lucide-react'
import { formatDate, formatNumber } from '@/utils'

interface QualityReport {
  id: number
  report_number: string
  report_type: 'daily' | 'weekly' | 'monthly' | 'custom'
  start_date: string
  end_date: string
  total_inspections: number
  passed_inspections: number
  failed_inspections: number
  pass_rate: number
  total_tests: number
  passed_tests: number
  failed_tests: number
  total_ncrs: number
  open_ncrs: number
  closed_ncrs: number
  generated_at: string
  created_by: string
}

export default function QualityReportsPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [reports, setReports] = useState<QualityReport[]>([])
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
      const response = await api.get<{ data: QualityReport[] }>('/qa/reports', {
        params: {
          organization_id: user?.organization_id,
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
      const response = await api.post<{ data: QualityReport }>('/qa/reports/generate', {
        organization_id: user?.organization_id,
        report_type: 'custom',
        start_date: startDate,
        end_date: endDate,
      })

      navigate(`/qa/reports/${response.data.id}`)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to generate report')
    }
  }

  const handleExportReport = async (reportId: number) => {
    try {
      const response = await api.get(`/qa/reports/${reportId}/export`, {
        responseType: 'blob',
      })

      const url = window.URL.createObjectURL(new Blob([response.data]))
      const a = document.createElement('a')
      a.href = url
      a.download = `quality-report-${reportId}.xlsx`
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

  const totalInspections = reports.reduce((sum, r) => sum + r.total_inspections, 0)
  const overallPassRate = totalInspections > 0
    ? ((reports.reduce((sum, r) => sum + r.passed_inspections, 0) / totalInspections) * 100).toFixed(1)
    : '0'
  const totalTests = reports.reduce((sum, r) => sum + r.total_tests, 0)
  const overallTestPassRate = totalTests > 0
    ? ((reports.reduce((sum, r) => sum + r.passed_tests, 0) / totalTests) * 100).toFixed(1)
    : '0'

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quality Reports</h1>
          <p className="text-gray-600">Comprehensive quality analytics and reporting</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<BarChart3 className="w-4 h-4" />}
            onClick={() => navigate('/qa/analytics')}
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
            <CheckCircle className="w-6 h-6 text-primary-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-600 mb-1">Total Reports</p>
            <h3 className="text-2xl font-bold text-gray-900">{reports.length}</h3>
          </div>
        </Card>
        <Card variant="bordered" padding="lg">
          <div className="text-center">
            <TrendingUp className="w-6 h-6 text-success-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-600 mb-1">Inspection Pass Rate</p>
            <h3 className="text-2xl font-bold text-success-600">{overallPassRate}%</h3>
          </div>
        </Card>
        <Card variant="bordered" padding="lg">
          <div className="text-center">
            <BarChart3 className="w-6 h-6 text-blue-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-600 mb-1">Test Pass Rate</p>
            <h3 className="text-2xl font-bold text-blue-600">{overallTestPassRate}%</h3>
          </div>
        </Card>
        <Card variant="bordered" padding="lg">
          <div className="text-center">
            <AlertTriangle className="w-6 h-6 text-error-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-600 mb-1">Total NCRs</p>
            <h3 className="text-2xl font-bold text-error-600">
              {reports.reduce((sum, r) => sum + r.total_ncrs, 0)}
            </h3>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card variant="bordered" padding="lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Generate Custom Report
            </h3>
            <Calendar className="w-5 h-5 text-gray-400" />
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

        <Card variant="bordered" padding="lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Quality Metrics Overview
          </h3>
          <div className="space-y-4">
            {reports.length > 0 && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="text-sm font-semibold text-gray-900 mb-3">Latest Report Summary</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Inspections</span>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-success-600" />
                      <span className="font-semibold text-gray-900">
                        {reports[0].passed_inspections}/{reports[0].total_inspections} passed
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Tests</span>
                    <div className="flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-blue-600" />
                      <span className="font-semibold text-gray-900">
                        {reports[0].passed_tests}/{reports[0].total_tests} passed
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">NCRs</span>
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-error-600" />
                      <span className="font-semibold text-error-600">
                        {reports[0].open_ncrs} open / {reports[0].total_ncrs} total
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Overall Pass Rate</span>
                    <span className={`font-semibold ${
                      parseFloat(reports[0].pass_rate) >= 90 ? 'text-success-600' :
                      parseFloat(reports[0].pass_rate) >= 70 ? 'text-warning-600' :
                      'text-error-600'
                    }`}>
                      {reports[0].pass_rate}%
                    </span>
                  </div>
                </div>
              </div>
            )}
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
                'Report Number,Type,Start Date,End Date,Inspections (Pass/Total),Tests (Pass/Total),NCRs (Open/Closed),Pass Rate\n' +
                reports
                  .map(r =>
                    `${r.report_number},${r.report_type},${r.start_date},${r.end_date},${r.passed_inspections}/${r.total_inspections},${r.passed_tests}/${r.total_tests},${r.open_ncrs}/${r.total_ncrs},${r.pass_rate}%`
                  )
                  .join('\n')
              const link = document.createElement('a')
              link.setAttribute('href', encodeURI(csvContent))
              link.setAttribute('download', 'quality-reports.csv')
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
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Report</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Period</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Inspections</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Tests</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">NCRs</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Pass Rate</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {reports.map((report) => (
                  <tr key={report.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-gray-900">{report.report_number}</p>
                        <p className="text-sm text-gray-600">
                          by {report.created_by} on {formatDate(report.generated_at)}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-sm text-gray-900">{report.report_type}</p>
                        <p className="text-xs text-gray-600">
                          {formatDate(report.start_date)} - {formatDate(report.end_date)}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <TrendingUp className="w-4 h-4 text-success-600" />
                        <span className="text-sm font-semibold text-gray-900">
                          {report.passed_inspections}/{report.total_inspections}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <BarChart3 className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-semibold text-gray-900">
                          {report.passed_tests}/{report.total_tests}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <AlertTriangle className="w-4 h-4 text-error-600" />
                        <span className="text-sm font-semibold text-error-600">
                          {report.open_ncrs}/{report.total_ncrs}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className={`font-semibold ${
                        parseFloat(report.pass_rate) >= 90 ? 'text-success-600' :
                        parseFloat(report.pass_rate) >= 70 ? 'text-warning-600' :
                        'text-error-600'
                      }`}>
                        {report.pass_rate}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/qa/reports/${report.id}`)}
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
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}

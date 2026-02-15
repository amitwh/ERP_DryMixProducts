import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { api } from '@/services/api'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Skeleton } from '@/components/ui/Loading'
import { Alert } from '@/components/ui/Alert'
import { FileText, Download, Printer, Search, Filter, Plus } from 'lucide-react'
import { formatDate, formatNumber } from '@/utils'

interface Report {
  id: number
  report_number: string
  report_type: string
  title: string
  description: string
  generated_at: string
  generated_by: string
  period_start: string
  period_end: string
  status: 'scheduled' | 'generating' | 'completed' | 'failed'
  file_path?: string
  file_size?: number
  format: 'pdf' | 'excel' | 'csv'
}

export default function ReportsPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [reports, setReports] = useState<Report[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('')

  useEffect(() => {
    fetchReports()
  }, [typeFilter])

  const fetchReports = async () => {
    try {
      setIsLoading(true)
      const response = await api.get<{ data: Report[] }>('/reports', {
        params: {
          organization_id: user?.organization_id,
          report_type: typeFilter || undefined,
        },
      })
      setReports(response.data.data || [])
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch reports')
    } finally {
      setIsLoading(false)
    }
  }

  const filteredReports = reports.filter(report => {
    const matchesSearch =
      searchTerm === '' ||
      report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.report_number.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  const reportTypes = [
    { value: 'sales', label: 'Sales Reports' },
    { value: 'production', label: 'Production Reports' },
    { value: 'quality', label: 'Quality Reports' },
    { value: 'inventory', label: 'Inventory Reports' },
    { value: 'finance', label: 'Financial Reports' },
    { value: 'hr', label: 'HR Reports' },
    { value: 'custom', label: 'Custom Reports' },
  ]

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
          <p className="text-gray-600">Generate and manage business reports</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<FileText className="w-4 h-4" />}
            onClick={() => navigate('/reports/templates')}
          >
            Templates
          </Button>
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => navigate('/reports/create')}
          >
            Create Report
          </Button>
        </div>
      </div>

      {error && <Alert type="error" message={error} onDismiss={() => setError(null)} />}

      <Card variant="bordered" padding="md">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="Search reports..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex items-center gap-2">
            {reportTypes.map((type) => (
              <button
                key={type.value}
                onClick={() => setTypeFilter(type.value === typeFilter ? '' : type.value)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  typeFilter === type.value
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {type.label}
              </button>
            ))}
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Filter className="w-4 h-4" />}
              onClick={() => setTypeFilter('')}
            >
              Reset
            </Button>
          </div>
        </div>
      </Card>

      <Card variant="bordered" padding="lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Reports ({filteredReports.length})
          </h3>
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Download className="w-4 h-4" />}
            onClick={() => window.print()}
          >
            Export List
          </Button>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} height={120} className="rounded" />
            ))}
          </div>
        ) : filteredReports.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">No reports found</p>
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={() => navigate('/reports/create')}
            >
              Create First Report
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredReports.map((report) => (
              <div
                key={report.id}
                className="p-4 border rounded-lg hover:shadow-md transition-all border-gray-200"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-sm text-gray-600">{report.report_number}</span>
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {report.report_type}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        report.status === 'completed'
                          ? 'bg-success-100 text-success-800'
                          : report.status === 'generating'
                          ? 'bg-yellow-100 text-yellow-800'
                          : report.status === 'failed'
                          ? 'bg-error-100 text-error-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {report.status.toUpperCase()}
                      </span>
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900">{report.title}</h4>
                  </div>
                  <div className="flex items-center gap-2">
                    {report.file_path && report.status === 'completed' && (
                      <Button
                        variant="outline"
                        size="sm"
                        leftIcon={<Download className="w-4 h-4" />}
                        onClick={() => window.open(report.file_path, '_blank')}
                      >
                        Download
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      leftIcon={<Printer className="w-4 h-4" />}
                      onClick={() => navigate(`/reports/${report.id}`)}
                    />
                  </div>
                </div>

                <p className="text-sm text-gray-600 mb-3">{report.description}</p>

                <div className="grid grid-cols-4 gap-4 mb-3">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Period</p>
                    <p className="text-sm text-gray-900">
                      {formatDate(report.period_start)} - {formatDate(report.period_end)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Format</p>
                    <p className="text-sm text-gray-900 uppercase">{report.format}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Generated By</p>
                    <p className="text-sm text-gray-900">{report.generated_by}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Generated At</p>
                    <p className="text-sm text-gray-900">{formatDate(report.generated_at)}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                  <div className="text-sm text-gray-600">
                    {report.file_size && (
                      <span>Size: {(report.file_size / 1024).toFixed(2)} KB</span>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/reports/${report.id}`)}
                  >
                    View Details
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

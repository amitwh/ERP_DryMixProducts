import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { api } from '@/services/api'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { Skeleton } from '@/components/ui/Loading'
import { Alert } from '@/components/ui/Alert'
import { Search, Plus, Filter, FileText, AlertTriangle, Download, Printer } from 'lucide-react'
import { formatDate } from '@/utils'

interface NCR {
  id: number
  ncr_number: string
  product_id: number
  product_name: string
  product_code: string
  batch_number?: string
  ncr_type: 'material' | 'process' | 'documentation' | 'other'
  severity: 'low' | 'medium' | 'high' | 'critical'
  description: string
  root_cause?: string
  corrective_action?: string
  preventive_action?: string
  status: 'open' | 'in_progress' | 'resolved' | 'closed'
  raised_by?: string
  raised_date: string
  assigned_to?: string
  due_date?: string
  resolved_date?: string
  created_at: string
}

export default function NCRsPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [ncrs, setNCRs] = useState<NCR[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'in_progress' | 'resolved' | 'closed'>('all')
  const [severityFilter, setSeverityFilter] = useState<'all' | 'low' | 'medium' | 'high' | 'critical'>('all')

  useEffect(() => {
    fetchNCRs()
  }, [statusFilter, severityFilter])

  const fetchNCRs = async () => {
    try {
      setIsLoading(true)
      const response = await api.get<{ data: NCR[] }>('/qa/ncrs', {
        params: {
          organization_id: user?.organization_id,
          status: statusFilter === 'all' ? undefined : statusFilter,
          severity: severityFilter === 'all' ? undefined : severityFilter,
        },
      })
      setNCRs(response.data.data || [])
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch NCRs')
    } finally {
      setIsLoading(false)
    }
  }

  const filteredNCRs = ncrs.filter(ncr => {
    const matchesSearch =
      searchTerm === '' ||
      ncr.ncr_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ncr.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ncr.description.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  const openCount = ncrs.filter(n => n.status === 'open').length
  const criticalCount = ncrs.filter(n => n.severity === 'critical').length
  const overdueCount = ncrs.filter(n => n.due_date && new Date(n.due_date) < new Date() && !['resolved', 'closed'].includes(n.status)).length

  const getSeverityColor = (severity: string) => {
    const colors: Record<string, string> = {
      low: 'bg-blue-100 text-blue-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-orange-100 text-orange-800',
      critical: 'bg-red-100 text-red-800',
    }
    return colors[severity] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Non-Conformity Reports</h1>
          <p className="text-gray-600">Track and manage quality issues and defects</p>
        </div>
        <Button
          variant="primary"
          size="sm"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => navigate('/qa/ncrs/create')}
        >
          Create NCR
        </Button>
      </div>

      {error && <Alert type="error" message={error} onDismiss={() => setError(null)} />}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card variant="bordered" padding="lg">
          <div className="text-center">
            <FileText className="w-6 h-6 text-primary-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-600 mb-1">Total NCRs</p>
            <h3 className="text-2xl font-bold text-gray-900">{ncrs.length}</h3>
          </div>
        </Card>
        <Card variant="bordered" padding="lg">
          <div className="text-center">
            <AlertTriangle className="w-6 h-6 text-error-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-600 mb-1">Open</p>
            <h3 className="text-2xl font-bold text-error-600">{openCount}</h3>
          </div>
        </Card>
        <Card variant="bordered" padding="lg">
          <div className="text-center">
            <AlertTriangle className="w-6 h-6 text-warning-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-600 mb-1">Critical</p>
            <h3 className="text-2xl font-bold text-warning-600">{criticalCount}</h3>
          </div>
        </Card>
        <Card variant="bordered" padding="lg">
          <div className="text-center">
            <AlertTriangle className="w-6 h-6 text-danger-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-600 mb-1">Overdue</p>
            <h3 className="text-2xl font-bold text-danger-600">{overdueCount}</h3>
          </div>
        </Card>
      </div>

      <Card variant="bordered" padding="md">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="Search NCRs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex items-center gap-2">
            {(['open', 'in_progress', 'resolved', 'closed'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  statusFilter === status
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status.replace('_', ' ').toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </Card>

      <Card variant="bordered" padding="lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            NCRs ({filteredNCRs.length})
          </h3>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Filter className="w-4 h-4" />}
              onClick={() => setSeverityFilter('all')}
            >
              All Severities
            </Button>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Download className="w-4 h-4" />}
              onClick={() => {
                const csvContent =
                  'data:text/csv;charset=utf-8,' +
                  'NCR Number,Product,Type,Severity,Description,Status,Raised Date,Resolved Date\n' +
                  filteredNCRs
                    .map(n =>
                      `${n.ncr_number},"${n.product_name}",${n.ncr_type},${n.severity},"${n.description.replace(/"/g, '""')}",${n.status},${n.raised_date},${n.resolved_date || '-'}`
                    )
                    .join('\n')
                const link = document.createElement('a')
                link.setAttribute('href', encodeURI(csvContent))
                link.setAttribute('download', 'ncrs.csv')
                document.body.appendChild(link)
                link.click()
                document.body.removeChild(link)
              }}
            >
              Export
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} height={120} className="rounded" />
            ))}
          </div>
        ) : filteredNCRs.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">No NCRs found</p>
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={() => navigate('/qa/ncrs/create')}
            >
              Create First NCR
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredNCRs.map((ncr) => (
              <div
                key={ncr.id}
                className={`p-4 border rounded-lg hover:shadow-md transition-all ${
                  ncr.severity === 'critical' ? 'border-error-300 bg-error-50' :
                  ncr.severity === 'high' ? 'border-warning-300 bg-warning-50' :
                  ncr.severity === 'medium' ? 'border-yellow-300 bg-yellow-50' :
                  'border-gray-200 bg-white'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(ncr.severity)}`}>
                        {ncr.severity.toUpperCase()}
                      </span>
                      <span className="text-sm text-gray-600">{ncr.ncr_number}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <StatusBadge status={ncr.status} />
                      <span className="text-sm text-gray-600">{ncr.ncr_type}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 mb-3">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Product</p>
                    <p className="font-medium text-gray-900">{ncr.product_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Description</p>
                    <p className="text-sm text-gray-700">{ncr.description}</p>
                  </div>
                  {ncr.root_cause && (
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Root Cause</p>
                      <p className="text-sm text-gray-700">{ncr.root_cause}</p>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-gray-600">
                      Raised: {formatDate(ncr.raised_date)}
                    </span>
                    {ncr.due_date && (
                      <span className={`${
                        ncr.due_date && new Date(ncr.due_date) < new Date() && !['resolved', 'closed'].includes(ncr.status)
                          ? 'text-error-600 font-semibold'
                          : 'text-gray-600'
                      }`}>
                        Due: {formatDate(ncr.due_date)}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/qa/ncrs/${ncr.id}`)}
                    >
                      View Details
                    </Button>
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

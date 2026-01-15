import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { api } from '@/services/api'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Skeleton } from '@/components/ui/Loading'
import { Alert } from '@/components/ui/Alert'
import { Search, Plus, Filter, FileText, Download, Printer, TrendingUp, AlertTriangle } from 'lucide-react'
import { formatDate, formatNumber, formatCurrency } from '@/utils'

interface Inspection {
  id: number
  inspection_number: string
  product_id: number
  product_name: string
  product_code: string
  batch_number: string
  inspection_type: 'incoming' | 'in_process' | 'final'
  status: 'pending' | 'in_progress' | 'completed' | 'failed'
  inspector_name: string
  inspection_date: string
  overall_result: 'pass' | 'fail' | 'pending'
  parameters_tested: number
  parameters_passed: number
  certificate_number?: string
  notes?: string
  created_at: string
}

export default function InspectionsPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [inspections, setInspections] = useState<Inspection[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'in_progress' | 'completed' | 'failed'>('all')
  const [typeFilter, setTypeFilter] = useState('')

  useEffect(() => {
    fetchInspections()
  }, [statusFilter, typeFilter])

  const fetchInspections = async () => {
    try {
      setIsLoading(true)
      const response = await api.get<{ data: Inspection[] }>('/qa/inspections', {
        params: {
          organization_id: user?.organizationId,
          status: statusFilter === 'all' ? undefined : statusFilter,
          inspection_type: typeFilter || undefined,
        },
      })
      setInspections(response.data.data || [])
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch inspections')
    } finally {
      setIsLoading(false)
    }
  }

  const filteredInspections = inspections.filter(insp => {
    const matchesSearch =
      searchTerm === '' ||
      insp.inspection_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      insp.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      insp.batch_number.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  const totalCount = inspections.length
  const completedCount = inspections.filter(i => i.status === 'completed').length
  const failedCount = inspections.filter(i => i.status === 'failed').length
  const passRate = completedCount > 0
    ? ((inspections.filter(i => i.overall_result === 'pass').length / completedCount) * 100).toFixed(1)
    : '0'

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      in_progress: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const getResultColor = (result: string) => {
    return result === 'pass' ? 'bg-success-100 text-success-800' :
           result === 'fail' ? 'bg-error-100 text-error-800' :
           'bg-gray-100 text-gray-800'
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quality Inspections</h1>
          <p className="text-gray-600">Quality control and testing records</p>
        </div>
        <Button
          variant="primary"
          size="sm"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => navigate('/qa/inspections/create')}
        >
          Create Inspection
        </Button>
      </div>

      {error && <Alert type="error" message={error} onDismiss={() => setError(null)} />}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card variant="bordered" padding="lg">
          <div className="text-center">
            <FileText className="w-6 h-6 text-primary-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-600 mb-1">Total Inspections</p>
            <h3 className="text-2xl font-bold text-gray-900">{totalCount}</h3>
          </div>
        </Card>
        <Card variant="bordered" padding="lg">
          <div className="text-center">
            <TrendingUp className="w-6 h-6 text-success-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-600 mb-1">Completed</p>
            <h3 className="text-2xl font-bold text-success-600">{completedCount}</h3>
          </div>
        </Card>
        <Card variant="bordered" padding="lg">
          <div className="text-center">
            <AlertTriangle className="w-6 h-6 text-error-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-600 mb-1">Failed</p>
            <h3 className="text-2xl font-bold text-error-600">{failedCount}</h3>
          </div>
        </Card>
        <Card variant="bordered" padding="lg">
          <div className="text-center">
            <TrendingUp className="w-6 h-6 text-primary-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-600 mb-1">Pass Rate</p>
            <h3 className="text-2xl font-bold text-primary-600">{passRate}%</h3>
          </div>
        </Card>
      </div>

      <Card variant="bordered" padding="md">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="Search inspections..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex items-center gap-2">
            {(['pending', 'in_progress', 'completed', 'failed'] as const).map((status) => (
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
            Inspections ({filteredInspections.length})
          </h3>
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Download className="w-4 h-4" />}
            onClick={() => window.print()}
          >
            Export
          </Button>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} height={120} className="rounded" />
            ))}
          </div>
        ) : filteredInspections.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">No inspections found</p>
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={() => navigate('/qa/inspections/create')}
            >
              Create First Inspection
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredInspections.map((insp) => (
              <div
                key={insp.id}
                className="p-4 border rounded-lg hover:shadow-md transition-all border-gray-200"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-sm text-gray-600">{insp.inspection_number}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(insp.status)}`}>
                        {insp.status.replace('_', ' ').toUpperCase()}
                      </span>
                      <span className="text-sm text-gray-600">{insp.inspection_type}</span>
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900">{insp.product_name}</h4>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getResultColor(insp.overall_result)}`}>
                      {insp.overall_result.toUpperCase()}
                    </span>
                    {insp.certificate_number && (
                      <span className="text-sm text-gray-600">
                        Cert: {insp.certificate_number}
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-4 mb-3">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Product Code</p>
                    <p className="text-sm text-gray-900">{insp.product_code}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Batch Number</p>
                    <p className="text-sm text-gray-900">{insp.batch_number}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Inspection Date</p>
                    <p className="text-sm text-gray-900">{formatDate(insp.inspection_date)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Inspector</p>
                    <p className="text-sm text-gray-900">{insp.inspector_name}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Parameters</p>
                    <p className="text-sm text-gray-900">
                      {insp.parameters_passed}/{insp.parameters_tested} passed
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Result</p>
                    <p className={`text-sm font-semibold ${
                      insp.overall_result === 'pass' ? 'text-success-600' :
                      insp.overall_result === 'fail' ? 'text-error-600' :
                      'text-gray-600'
                    }`}>
                      {insp.overall_result === 'pass' ? 'PASSED' :
                       insp.overall_result === 'fail' ? 'FAILED' :
                       'PENDING'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                  <div className="text-sm text-gray-600">
                    Created on {formatDate(insp.created_at)}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/qa/inspections/${insp.id}`)}
                    >
                      View
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

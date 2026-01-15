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
import { Search, Plus, Filter, FlaskConical, Calendar, Download, Printer, TrendingUp } from 'lucide-react'
import { formatDate, formatNumber } from '@/utils'

interface QualityTest {
  id: number
  test_number: string
  product_id: number
  product_name: string
  product_code: string
  test_type: string
  standard: string
  test_date: string
  status: 'scheduled' | 'in_progress' | 'completed' | 'failed'
  tested_by?: string
  parameters_tested: number
  parameters_passed: number
  parameters_failed: number
  overall_result?: 'pass' | 'fail'
  remarks?: string
  created_at: string
}

export default function QualityTestsPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [tests, setTests] = useState<QualityTest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'scheduled' | 'in_progress' | 'completed' | 'failed'>('all')
  const [testTypeFilter, setTestTypeFilter] = useState('')

  useEffect(() => {
    fetchTests()
  }, [statusFilter, testTypeFilter])

  const fetchTests = async () => {
    try {
      setIsLoading(true)
      const response = await api.get<{ data: QualityTest[] }>('/qa/tests', {
        params: {
          organization_id: user?.organizationId,
          status: statusFilter === 'all' ? undefined : statusFilter,
          test_type: testTypeFilter || undefined,
        },
      })
      setTests(response.data.data || [])
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch tests')
    } finally {
      setIsLoading(false)
    }
  }

  const filteredTests = tests.filter(test => {
    const matchesSearch =
      searchTerm === '' ||
      test.test_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      test.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      test.product_code.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  const completedCount = tests.filter(t => t.status === 'completed').length
  const failedCount = tests.filter(t => t.status === 'failed').length
  const passRate = completedCount > 0
    ? ((tests.filter(t => t.overall_result === 'pass').length / completedCount) * 100).toFixed(1)
    : '0'

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      scheduled: 'bg-blue-100 text-blue-800',
      in_progress: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const getResultColor = (result?: string) => {
    if (!result) return 'bg-gray-100 text-gray-800'
    return result === 'pass' ? 'bg-success-100 text-success-800' : 'bg-error-100 text-error-800'
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quality Tests</h1>
          <p className="text-gray-600">Manage quality control tests and results</p>
        </div>
        <Button
          variant="primary"
          size="sm"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => navigate('/qa/tests/create')}
        >
          Create Test
        </Button>
      </div>

      {error && <Alert type="error" message={error} onDismiss={() => setError(null)} />}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card variant="bordered" padding="lg">
          <div className="text-center">
            <FlaskConical className="w-6 h-6 text-primary-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-600 mb-1">Total Tests</p>
            <h3 className="text-2xl font-bold text-gray-900">{tests.length}</h3>
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
            <Calendar className="w-6 h-6 text-error-600 mx-auto mb-2" />
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
              placeholder="Search tests..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex items-center gap-2">
            {(['scheduled', 'in_progress', 'completed', 'failed'] as const).map((status) => (
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
            Quality Tests ({filteredTests.length})
          </h3>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Filter className="w-4 h-4" />}
              onClick={() => setTestTypeFilter('')}
            >
              All Types
            </Button>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Download className="w-4 h-4" />}
              onClick={() => {
                const csvContent =
                  'data:text/csv;charset=utf-8,' +
                  'Test Number,Product,Type,Standard,Date,Status,Passed,Failed,Result\n' +
                  filteredTests
                    .map(t =>
                      `${t.test_number},"${t.product_name}",${t.test_type},${t.standard},${t.test_date},${t.status},${t.parameters_passed},${t.parameters_failed},${t.overall_result || '-'}`
                    )
                    .join('\n')
                const link = document.createElement('a')
                link.setAttribute('href', encodeURI(csvContent))
                link.setAttribute('download', 'quality-tests.csv')
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
        ) : filteredTests.length === 0 ? (
          <div className="text-center py-12">
            <FlaskConical className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">No tests found</p>
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={() => navigate('/qa/tests/create')}
            >
              Create First Test
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Test</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Product</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Standard</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Date</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Result</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredTests.map((test) => (
                  <tr key={test.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-gray-900">{test.test_number}</p>
                        {test.tested_by && (
                          <p className="text-sm text-gray-600">by {test.tested_by}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-gray-900">{test.product_name}</p>
                        <p className="text-sm text-gray-600">{test.product_code}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-gray-900">{test.test_type}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-gray-600">{test.standard}</p>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <p className="text-sm text-gray-900">{formatDate(test.test_date)}</p>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <StatusBadge status={test.status} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      {test.overall_result && (
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getResultColor(test.overall_result)}`}>
                          {test.overall_result.toUpperCase()}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/qa/tests/${test.id}`)}
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

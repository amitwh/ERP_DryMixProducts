import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { api } from '@/services/api'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { StatusBadge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Loading'
import { Plus, Search, Layers, CheckCircle, XCircle, Clock } from 'lucide-react'
import { formatDate } from '@/utils'

interface ProductionBatch {
  id: number
  batch_number: string
  order_id: number
  order_number?: string
  product_id: number
  product_name: string
  quantity: number
  unit: string
  status: 'planned' | 'in_progress' | 'completed' | 'quality_check' | 'rejected'
  production_date: string
  completion_date?: string
  qc_passed?: boolean
  manufacturing_unit?: string
  created_at: string
}

export const ProductionBatchesPage: React.FC = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [batches, setBatches] = useState<ProductionBatch[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [page, setPage] = useState(1)

  const fetchBatches = async () => {
    try {
      setIsLoading(true)
      const response = await api.get<{ data: ProductionBatch[] }>('/production/batches', {
        params: {
          organization_id: user?.organizationId,
          per_page: 20,
          page,
        },
      })
      setBatches(response.data.data || [])
    } catch (error) {
      console.error('Failed to fetch production batches:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchBatches()
  }, [page])

  const filteredBatches = batches.filter((batch) => {
    const matchesSearch =
      searchTerm === '' ||
      batch.batch_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      batch.product_name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || batch.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const statusColors: Record<string, string> = {
    planned: 'bg-gray-100 text-gray-800',
    in_progress: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    quality_check: 'bg-yellow-100 text-yellow-800',
    rejected: 'bg-red-100 text-red-800',
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Production Batches</h1>
          <p className="text-gray-600">Track production batches and quality checks</p>
        </div>
        <Button
          variant="primary"
          size="sm"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => navigate('/production/batches/create')}
        >
          New Batch
        </Button>
      </div>

      <Card variant="bordered" padding="md">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Search batches..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            {(['all', 'planned', 'in_progress', 'completed', 'quality_check', 'rejected'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  statusFilter === status
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status.replace(/_/g, ' ')}
              </button>
            ))}
          </div>
        </div>
      </Card>

      <Card variant="bordered" padding="lg">
        <CardHeader>
          <CardTitle>Production Batches</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} height={100} className="rounded" />
              ))}
            </div>
          ) : filteredBatches.length === 0 ? (
            <div className="text-center py-8">
              <Layers className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">No production batches found</p>
              <Button
                variant="primary"
                size="sm"
                leftIcon={<Plus className="w-4 h-4" />}
                onClick={() => navigate('/production/batches/create')}
              >
                Create First Batch
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredBatches.map((batch) => (
                <div
                  key={batch.id}
                  className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                        <Layers className="w-5 h-5 text-primary-600" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-gray-900">{batch.batch_number}</span>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[batch.status]}`}>
                            {batch.status.replace(/_/g, ' ')}
                          </span>
                          {batch.qc_passed !== undefined && (
                            <div className="flex items-center gap-1">
                              {batch.qc_passed ? (
                                <CheckCircle className="w-4 h-4 text-green-600" />
                              ) : (
                                <XCircle className="w-4 h-4 text-red-600" />
                              )}
                            </div>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">{batch.product_name}</p>
                        {batch.order_number && (
                          <p className="text-xs text-gray-500">Order: {batch.order_number}</p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{batch.quantity} {batch.unit}</p>
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Clock className="w-3 h-3" />
                        {formatDate(batch.production_date)}
                      </div>
                    </div>
                  </div>
                  {batch.completion_date && (
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">Completed:</span> {formatDate(batch.completion_date)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex items-center justify-center gap-2">
        <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(page - 1)}>
          Previous
        </Button>
        <span className="px-4 py-2">Page {page}</span>
        <Button variant="outline" size="sm" onClick={() => setPage(page + 1)}>
          Next
        </Button>
      </div>
    </div>
  )
}

export default ProductionBatchesPage

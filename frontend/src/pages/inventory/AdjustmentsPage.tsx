import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { api } from '@/services/api'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Skeleton } from '@/components/ui/Loading'
import { Alert } from '@/components/ui/Alert'
import { Search, Plus, Filter, TrendingUp, AlertTriangle, Download, Printer } from 'lucide-react'
import { formatDate, formatNumber } from '@/utils'

interface Adjustment {
  id: number
  adjustment_number: string
  product_id: number
  product_name: string
  product_code: string
  warehouse_id: number
  warehouse_name: string
  adjustment_type: 'addition' | 'deduction' | 'transfer_in' | 'transfer_out'
  quantity_before: number
  quantity_after: number
  quantity_change: number
  uom: string
  reason: string
  reference?: string
  status: 'pending' | 'approved' | 'rejected'
  created_by: string
  created_at: string
  approved_by?: string
  approved_at?: string
}

export default function AdjustmentsPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [adjustments, setAdjustments] = useState<Adjustment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState<'all' | 'addition' | 'deduction' | 'transfer_in' | 'transfer_out'>('all')
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all')

  useEffect(() => {
    fetchAdjustments()
  }, [typeFilter, statusFilter])

  const fetchAdjustments = async () => {
    try {
      setIsLoading(true)
      const response = await api.get<{ data: Adjustment[] }>('/inventory/adjustments', {
        params: {
          organization_id: user?.organizationId,
          adjustment_type: typeFilter === 'all' ? undefined : typeFilter,
          status: statusFilter === 'all' ? undefined : statusFilter,
        },
      })
      setAdjustments(response.data.data || [])
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch adjustments')
    } finally {
      setIsLoading(false)
    }
  }

  const filteredAdjustments = adjustments.filter(adj => {
    const matchesSearch =
      searchTerm === '' ||
      adj.adjustment_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      adj.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      adj.product_code.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  const totalCount = adjustments.length
  const pendingCount = adjustments.filter(a => a.status === 'pending').length
  const approvedCount = adjustments.filter(a => a.status === 'approved').length
  const rejectedCount = adjustments.filter(a => a.status === 'rejected').length
  const totalAdditions = adjustments.filter(a => a.adjustment_type === 'addition').reduce((sum, a) => sum + a.quantity_change, 0)
  const totalDeductions = adjustments.filter(a => a.adjustment_type === 'deduction').reduce((sum, a) => sum + Math.abs(a.quantity_change), 0)

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      addition: 'bg-green-100 text-green-800',
      deduction: 'bg-red-100 text-red-800',
      transfer_in: 'bg-blue-100 text-blue-800',
      transfer_out: 'bg-orange-100 text-orange-800',
    }
    return colors[type] || 'bg-gray-100 text-gray-800'
  }

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      addition: 'Addition',
      deduction: 'Deduction',
      transfer_in: 'Transfer In',
      transfer_out: 'Transfer Out',
    }
    return labels[type] || type
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Stock Adjustments</h1>
          <p className="text-gray-600">Track and manage inventory adjustments</p>
        </div>
        <Button
          variant="primary"
          size="sm"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => navigate('/inventory/adjustments/create')}
        >
          Create Adjustment
        </Button>
      </div>

      {error && <Alert type="error" message={error} onDismiss={() => setError(null)} />}

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card variant="bordered" padding="lg">
          <div className="text-center">
            <TrendingUp className="w-6 h-6 text-primary-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-600 mb-1">Total</p>
            <h3 className="text-2xl font-bold text-gray-900">{totalCount}</h3>
          </div>
        </Card>
        <Card variant="bordered" padding="lg">
          <div className="text-center">
            <AlertTriangle className="w-6 h-6 text-warning-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-600 mb-1">Pending</p>
            <h3 className="text-2xl font-bold text-warning-600">{pendingCount}</h3>
          </div>
        </Card>
        <Card variant="bordered" padding="lg">
          <div className="text-center">
            <TrendingUp className="w-6 h-6 text-success-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-600 mb-1">Approved</p>
            <h3 className="text-2xl font-bold text-success-600">{approvedCount}</h3>
          </div>
        </Card>
        <Card variant="bordered" padding="lg">
          <div className="text-center">
            <TrendingUp className="w-6 h-6 text-error-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-600 mb-1">Rejected</p>
            <h3 className="text-2xl font-bold text-error-600">{rejectedCount}</h3>
          </div>
        </Card>
        <Card variant="bordered" padding="lg">
          <div className="text-center">
            <TrendingUp className="w-6 h-6 text-blue-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-600 mb-1">Net Change</p>
            <h3 className="text-2xl font-bold text-primary-600">
              {formatNumber(totalAdditions - totalDeductions)}
            </h3>
          </div>
        </Card>
      </div>

      <Card variant="bordered" padding="md">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="Search adjustments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex items-center gap-2">
            {(['pending', 'approved', 'rejected'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  statusFilter === status
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status.toUpperCase()}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            {(['addition', 'deduction', 'transfer_in', 'transfer_out'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setTypeFilter(type)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  typeFilter === type
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {getTypeLabel(type)}
              </button>
            ))}
          </div>
        </div>
      </Card>

      <Card variant="bordered" padding="lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Adjustments ({filteredAdjustments.length})
          </h3>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Filter className="w-4 h-4" />}
              onClick={() => {
                setTypeFilter('all')
                setStatusFilter('all')
              }}
            >
              Reset Filters
            </Button>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Download className="w-4 h-4" />}
              onClick={() => {
                const csvContent =
                  'data:text/csv;charset=utf-8,' +
                  'Adjustment,Product,Code,Type,Before,After,Change,Reason,Status,Created Date,Approved Date\n' +
                  filteredAdjustments
                    .map(a =>
                      `${a.adjustment_number},"${a.product_name}",${a.product_code},${getTypeLabel(a.type)},${a.quantity_before},${a.quantity_after},${a.quantity_change},"${a.reason.replace(/"/g, '""')}",${a.status},${a.created_at},${a.approved_at || '-'}`
                    )
                    .join('\n')
                const link = document.createElement('a')
                link.setAttribute('href', encodeURI(csvContent))
                link.setAttribute('download', 'stock-adjustments.csv')
                document.body.appendChild(link)
                link.click()
                document.body.removeChild(link)
              }}
            >
              Export
            </Button>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Printer className="w-4 h-4" />}
              onClick={() => window.print()}
            />
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} height={120} className="rounded" />
            ))}
          </div>
        ) : filteredAdjustments.length === 0 ? (
          <div className="text-center py-12">
            <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">No adjustments found</p>
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={() => navigate('/inventory/adjustments/create')}
            >
              Create First Adjustment
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredAdjustments.map((adj) => (
              <div
                key={adj.id}
                className={`p-4 border rounded-lg hover:shadow-md transition-all ${
                  adj.adjustment_type === 'addition' || adj.adjustment_type === 'transfer_in' ? 'border-green-200' :
                  adj.adjustment_type === 'deduction' || adj.adjustment_type === 'transfer_out' ? 'border-red-200' :
                  'border-gray-200'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(adj.adjustment_type)}`}>
                        {getTypeLabel(adj.adjustment_type)}
                      </span>
                      <span className="text-sm text-gray-600">{adj.adjustment_number}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        adj.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        adj.status === 'approved' ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {adj.status.toUpperCase()}
                      </span>
                      {adj.reference && (
                        <span className="text-sm text-gray-600">Ref: {adj.reference}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Product</p>
                    <p className="font-medium text-gray-900">{adj.product_name}</p>
                    <p className="text-sm text-gray-600">{adj.product_code}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Warehouse</p>
                    <p className="text-sm text-gray-900">{adj.warehouse_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Quantity</p>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-900">{adj.quantity_before}</span>
                      <span className={`text-lg font-semibold ${
                        adj.quantity_change > 0 ? 'text-success-600' : 'text-error-600'
                      }`}>
                        {adj.quantity_change > 0 ? '+' : ''}{formatNumber(adj.quantity_change)}
                      </span>
                      <span className="text-sm text-gray-900">{adj.quantity_after}</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Created</p>
                    <p className="text-sm text-gray-900">{formatDate(adj.created_at)}</p>
                    <p className="text-xs text-gray-600">by {adj.created_by}</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-1">Reason</p>
                  <p className="text-sm text-gray-700">{adj.reason}</p>
                </div>

                {adj.approved_at && (
                  <div className="pt-3 border-t border-gray-200">
                    <p className="text-sm text-gray-600 mb-1">Approved by</p>
                    <p className="text-sm text-gray-900">
                      {adj.approved_by} on {formatDate(adj.approved_at)}
                    </p>
                  </div>
                )}

                <div className="flex items-center justify-end pt-3 border-t border-gray-200">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/inventory/adjustments/${adj.id}`)}
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

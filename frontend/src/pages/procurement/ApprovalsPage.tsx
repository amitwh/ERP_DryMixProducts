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
import { Search, Plus, Filter, ShoppingCart, CheckCircle, XCircle, Download, Printer } from 'lucide-react'
import { formatDate, formatNumber, formatCurrency } from '@/utils'

interface Approval {
  id: number
  approval_number: string
  po_number?: string
  request_id?: number
  request_number?: string
  type: 'purchase_order' | 'purchase_request'
  supplier_name?: string
  product_name?: string
  product_code?: string
  requested_quantity?: number
  uom?: string
  currency?: string
  total_amount?: number
  status: 'pending' | 'approved' | 'rejected'
  submitted_by: string
  submitted_at: string
  approved_by?: string
  approved_at?: string
  rejected_by?: string
  rejected_at?: string
  rejection_reason?: string
  notes?: string
}

export default function ApprovalsPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [approvals, setApprovals] = useState<Approval[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all')
  const [typeFilter, setTypeFilter] = useState<'all' | 'purchase_order' | 'purchase_request'>('all')

  useEffect(() => {
    fetchApprovals()
  }, [statusFilter, typeFilter])

  const fetchApprovals = async () => {
    try {
      setIsLoading(true)
      const response = await api.get<{ data: Approval[] }>('/procurement/approvals', {
        params: {
          organization_id: user?.organizationId,
          status: statusFilter === 'all' ? undefined : statusFilter,
          type: typeFilter === 'all' ? undefined : typeFilter,
        },
      })
      setApprovals(response.data.data || [])
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch approvals')
    } finally {
      setIsLoading(false)
    }
  }

  const filteredApprovals = approvals.filter(approval => {
    const matchesSearch =
      searchTerm === '' ||
      approval.approval_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      approval.product_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      approval.product_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      approval.supplier_name?.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  const totalCount = approvals.length
  const pendingCount = approvals.filter(a => a.status === 'pending').length
  const approvedCount = approvals.filter(a => a.status === 'approved').length
  const rejectedCount = approvals.filter(a => a.status === 'rejected').length
  const totalPendingAmount = approvals
    .filter(a => a.status === 'pending' && a.total_amount !== undefined)
    .reduce((sum, a) => sum + (a.total_amount || 0), 0)

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Procurement Approvals</h1>
          <p className="text-gray-600">Review and manage purchase order approvals</p>
        </div>
      </div>

      {error && <Alert type="error" message={error} onDismiss={() => setError(null)} />}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card variant="bordered" padding="lg">
          <div className="text-center">
            <ShoppingCart className="w-6 h-6 text-primary-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-600 mb-1">Total Approvals</p>
            <h3 className="text-2xl font-bold text-gray-900">{totalCount}</h3>
          </div>
        </Card>
        <Card variant="bordered" padding="lg">
          <div className="text-center">
            <XCircle className="w-6 h-6 text-warning-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-600 mb-1">Pending</p>
            <h3 className="text-2xl font-bold text-warning-600">{pendingCount}</h3>
          </div>
        </Card>
        <Card variant="bordered" padding="lg">
          <div className="text-center">
            <CheckCircle className="w-6 h-6 text-success-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-600 mb-1">Approved</p>
            <h3 className="text-2xl font-bold text-success-600">{approvedCount}</h3>
          </div>
        </Card>
        <Card variant="bordered" padding="lg">
          <div className="text-center">
            <ShoppingCart className="w-6 h-6 text-error-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-600 mb-1">Rejected</p>
            <h3 className="text-2xl font-bold text-error-600">{rejectedCount}</h3>
          </div>
        </Card>
      </div>

      {totalPendingAmount > 0 && (
        <Card variant="bordered" padding="lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Total Pending Amount
              </h3>
              <p className="text-sm text-gray-600">Sum of all pending approvals</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-warning-600">
                {formatCurrency(totalPendingAmount)}
              </p>
            </div>
          </div>
        </Card>
      )}

      <Card variant="bordered" padding="md">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="Search approvals..."
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
            {(['purchase_order', 'purchase_request'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setTypeFilter(type)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  typeFilter === type
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {type.replace('_', ' ').toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </Card>

      <Card variant="bordered" padding="lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Approvals ({filteredApprovals.length})
          </h3>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Filter className="w-4 h-4" />}
              onClick={() => {
                setStatusFilter('all')
                setTypeFilter('all')
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
                  'Approval Number,Type,PO Number,Request,Supplier,Product,Code,Amount,Currency,Status,Submitted Date,Approved Date\n' +
                  filteredApprovals
                    .map(a =>
                      `${a.approval_number},${a.type},${a.po_number || '-'},${a.request_number || '-'},${a.supplier_name || '-'},${a.product_name || '-'},${a.product_code || '-'},${a.total_amount || 0},${a.currency || '-'},${a.status},${a.submitted_at},${a.approved_at || '-'}`
                    )
                    .join('\n')
                const link = document.createElement('a')
                link.setAttribute('href', encodeURI(csvContent))
                link.setAttribute('download', 'approvals.csv')
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
        ) : filteredApprovals.length === 0 ? (
          <div className="text-center py-12">
            <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No approvals found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredApprovals.map((approval) => (
              <div
                key={approval.id}
                className={`p-4 border rounded-lg hover:shadow-md transition-all ${
                  approval.status === 'pending' ? 'border-yellow-200 bg-yellow-50' :
                  approval.status === 'approved' ? 'border-green-200 bg-green-50' :
                  'border-red-200 bg-red-50'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(approval.status)}`}>
                        {approval.status.toUpperCase()}
                      </span>
                      <span className="text-sm text-gray-600">{approval.approval_number}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {approval.type.replace('_', ' ').toUpperCase()}
                      </span>
                      {approval.po_number && (
                        <span className="text-sm text-gray-600">PO: {approval.po_number}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                  {approval.supplier_name && (
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Supplier</p>
                      <p className="text-sm text-gray-900">{approval.supplier_name}</p>
                    </div>
                  )}
                  {approval.product_name && (
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Product</p>
                      <p className="font-medium text-gray-900">{approval.product_name}</p>
                      <p className="text-sm text-gray-600">{approval.product_code}</p>
                    </div>
                  )}
                  {approval.requested_quantity !== undefined && (
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Quantity</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {formatNumber(approval.requested_quantity)} {approval.uom}
                      </p>
                    </div>
                  )}
                  {approval.total_amount !== undefined && (
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Amount</p>
                      <p className="text-lg font-semibold text-primary-600">
                        {formatCurrency(approval.total_amount)}
                      </p>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4 mb-3 pt-3 border-t border-gray-200">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Submitted By</p>
                    <p className="text-sm text-gray-900">{approval.submitted_by}</p>
                    <p className="text-xs text-gray-600">{formatDate(approval.submitted_at)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Submitted Date</p>
                    <p className="text-sm text-gray-900">{formatDate(approval.submitted_at)}</p>
                  </div>
                </div>

                {approval.approved_at && (
                  <div className="pt-3 border-t border-gray-200">
                    <p className="text-sm text-gray-600 mb-1">Approved By</p>
                    <p className="text-sm text-gray-900">
                      {approval.approved_by} on {formatDate(approval.approved_at)}
                    </p>
                  </div>
                )}

                {approval.rejected_at && (
                  <div className="pt-3 border-t border-error-200">
                    <p className="text-sm text-error-600 mb-1">Rejected</p>
                    <p className="text-sm text-gray-900">
                      {approval.rejected_by} on {formatDate(approval.rejected_at)}
                    </p>
                    {approval.rejection_reason && (
                      <p className="text-sm text-error-700 mt-2">Reason: {approval.rejection_reason}</p>
                    )}
                  </div>
                )}

                {approval.notes && (
                  <div className="pt-3 border-t border-gray-200">
                    <p className="text-sm text-gray-600 mb-1">Notes</p>
                    <p className="text-sm text-gray-700">{approval.notes}</p>
                  </div>
                )}

                <div className="flex items-center justify-end pt-3 border-t border-gray-200">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/procurement/approvals/${approval.id}`)}
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

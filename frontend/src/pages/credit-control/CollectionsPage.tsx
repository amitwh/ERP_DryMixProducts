import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { DataTable } from '@/components/ui/DataTable'
import { Badge } from '@/components/ui/Badge'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { Loader2, FileDown, RefreshCw, Search, DollarSign, CheckCircle, Clock, XCircle } from 'lucide-react'
import { toast } from 'sonner'
import creditControlService from '@/services/credit-control.service'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ColumnDef } from '@tanstack/react-table'

// Types
interface Collection {
  id: number
  customer_id: number
  customer_name: string
  customer_code: string
  invoice_number: string
  invoice_date: string
  due_date: string
  amount: number
  amount_paid: number
  balance_amount: number
  collection_date?: string
  payment_method?: string
  reference_number?: string
  status: 'pending' | 'partial' | 'collected' | 'waived' | 'disputed'
  notes?: string
  collector_name?: string
  days_overdue: number
}

interface CollectionSummary {
  total_outstanding: number
  total_collected: number
  total_waived: number
  total_disputed: number
  pending_count: number
  collection_rate: number
  avg_collection_days: number
}

// Collections Page
export const CollectionsPage: React.FC = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [filters, setFilters] = useState({
    status: '',
    search: '',
    date_from: '',
    date_to: '',
  })
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false)
  const [selectedCollection, setSelectedCollection] = useState<Collection | null>(null)
  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    payment_method: 'cash',
    reference_number: '',
    notes: '',
  })

  // Fetch collections
  const { data: collectionsData, isLoading, refetch } = useQuery({
    queryKey: ['collections', filters],
    queryFn: async () => {
      const response = await creditControlService.getCollections(filters)
      return response.data
    },
  })

  // Fetch collection summary
  const { data: summaryData } = useQuery({
    queryKey: ['collection-summary'],
    queryFn: async () => {
      const response = await creditControlService.getCollectionSummary()
      return response.data
    },
  })

  const summary: CollectionSummary = summaryData || {
    total_outstanding: 0,
    total_collected: 0,
    total_waived: 0,
    total_disputed: 0,
    pending_count: 0,
    collection_rate: 0,
    avg_collection_days: 0,
  }

  const collections = (collectionsData || []) as any as Collection[]

  // Record payment mutation
  const recordPaymentMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: typeof paymentForm }) => {
      return creditControlService.recordPayment(id, data)
    },
    onSuccess: () => {
      toast.success('Payment recorded successfully')
      setIsRecordModalOpen(false)
      setSelectedCollection(null)
      queryClient.invalidateQueries({ queryKey: ['collections'] })
      queryClient.invalidateQueries({ queryKey: ['collection-summary'] })
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to record payment')
    },
  })

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(amount)
  }

  // Get status badge variant
  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'success' | 'warning' | 'error' | 'info' | 'default'> = {
      pending: 'warning',
      partial: 'info',
      collected: 'success',
      waived: 'default',
      disputed: 'error',
    }
    return variants[status] || 'default'
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: 'Pending',
      partial: 'Partial',
      collected: 'Collected',
      waived: 'Waived',
      disputed: 'Disputed',
    }
    return labels[status] || status
  }

  // Handle record payment
  const handleRecordPayment = (collection: Collection) => {
    setSelectedCollection(collection)
    setPaymentForm({
      amount: collection.balance_amount.toString(),
      payment_method: 'cash',
      reference_number: '',
      notes: '',
    })
    setIsRecordModalOpen(true)
  }

  // Submit payment
  const handleSubmitPayment = () => {
    if (!selectedCollection) return

    const amount = parseFloat(paymentForm.amount)
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid amount')
      return
    }

    if (amount > selectedCollection.balance_amount) {
      toast.error('Amount cannot exceed balance')
      return
    }

    recordPaymentMutation.mutate({
      id: selectedCollection.id,
      data: paymentForm,
    })
  }

  // Export to CSV
  const handleExport = () => {
    const headers = [
      'Invoice',
      'Customer',
      'Due Date',
      'Amount',
      'Paid',
      'Balance',
      'Status',
      'Days Overdue',
    ]

    const csvContent = [
      headers.join(','),
      ...collections.map((item) =>
        [
          item.invoice_number,
          item.customer_name,
          item.due_date,
          item.amount,
          item.amount_paid,
          item.balance_amount,
          item.status,
          item.days_overdue,
        ].join(',')
      ),
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `collections-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    toast.success('Collections exported successfully')
  }

  // Table columns
  const columns: ColumnDef<Collection, any>[] = [
    {
      header: 'Invoice',
      accessorKey: 'invoice_number',
      cell: ({ row }) => (
        <div>
          <div className="font-medium text-gray-900">{row.original.invoice_number}</div>
          <div className="text-sm text-gray-500">Due: {row.original.due_date}</div>
        </div>
      ),
    },
    {
      header: 'Customer',
      accessorKey: 'customer_name',
      cell: ({ row }) => (
        <div>
          <div className="font-medium text-gray-900">{row.original.customer_name}</div>
          <div className="text-sm text-gray-500">{row.original.customer_code}</div>
        </div>
      ),
    },
    {
      header: 'Amount',
      accessorKey: 'amount',
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{formatCurrency(row.original.amount)}</div>
          <div className="text-sm text-green-600">Paid: {formatCurrency(row.original.amount_paid)}</div>
        </div>
      ),
    },
    {
      header: 'Balance',
      accessorKey: 'balance_amount',
      cell: ({ row }) => (
        <span className="font-semibold text-gray-900">
          {formatCurrency(row.original.balance_amount)}
        </span>
      ),
    },
    {
      header: 'Days Overdue',
      accessorKey: 'days_overdue',
      cell: ({ row }) => (
        <span
          className={`font-medium ${
            row.original.days_overdue > 90
              ? 'text-red-600'
              : row.original.days_overdue > 60
              ? 'text-orange-600'
              : row.original.days_overdue > 30
              ? 'text-yellow-600'
              : 'text-gray-600'
          }`}
        >
          {row.original.days_overdue > 0 ? `${row.original.days_overdue} days` : 'Current'}
        </span>
      ),
    },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: ({ row }) => (
        <Badge variant={getStatusBadge(row.original.status)}>
          {getStatusLabel(row.original.status)}
        </Badge>
      ),
    },
    {
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex gap-2">
          {(row.original.status === 'pending' || row.original.status === 'partial') && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => handleRecordPayment(row.original)}
            >
              Record Payment
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/credit-control/collections/${row.original.id}`)}
          >
            View
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Collections</h1>
          <p className="text-gray-600">
            Manage payment collections and track outstanding receivables
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            leftIcon={<RefreshCw className="w-4 h-4" />}
            onClick={() => refetch()}
          >
            Refresh
          </Button>
          <Button
            variant="primary"
            leftIcon={<FileDown className="w-4 h-4" />}
            onClick={handleExport}
          >
            Export CSV
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Outstanding */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Outstanding</p>
                <p className="text-2xl font-bold text-orange-600 mt-1">
                  {formatCurrency(summary.total_outstanding)}
                </p>
                <p className="text-sm text-gray-500 mt-1">{summary.pending_count} pending</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Collected */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Collected</p>
                <p className="text-2xl font-bold text-green-600 mt-1">
                  {formatCurrency(summary.total_collected)}
                </p>
                <p className="text-sm text-gray-500 mt-1">This month</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Collection Rate */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Collection Rate</p>
                <p className="text-2xl font-bold text-blue-600 mt-1">
                  {summary.collection_rate.toFixed(1)}%
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {summary.avg_collection_days.toFixed(0)} avg days
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Disputed */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Disputed/Waived</p>
                <p className="text-2xl font-bold text-red-600 mt-1">
                  {formatCurrency(summary.total_disputed + summary.total_waived)}
                </p>
                <p className="text-sm text-gray-500 mt-1">Requires attention</p>
              </div>
              <div className="p-3 bg-red-100 rounded-lg">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <Input
                name="search"
                placeholder="Search by invoice or customer..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                leftIcon={<Search className="w-5 h-5" />}
              />
            </div>
            <div className="w-48">
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="partial">Partial</option>
                <option value="collected">Collected</option>
                <option value="disputed">Disputed</option>
                <option value="waived">Waived</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Collections Table */}
      <Card>
        <CardHeader>
          <CardTitle>Collection Items</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
            </div>
          ) : collections.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No collections found</p>
            </div>
          ) : (
            <DataTable data={collections} columns={columns} />
          )}
        </CardContent>
      </Card>

      {/* Record Payment Modal */}
      <Modal
        isOpen={isRecordModalOpen}
        onClose={() => {
          setIsRecordModalOpen(false)
          setSelectedCollection(null)
        }}
        title="Record Payment"
        size="md"
      >
        {selectedCollection && (
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Invoice:</span>
                  <span className="ml-2 font-medium">{selectedCollection.invoice_number}</span>
                </div>
                <div>
                  <span className="text-gray-600">Balance:</span>
                  <span className="ml-2 font-medium">
                    {formatCurrency(selectedCollection.balance_amount)}
                  </span>
                </div>
                <div className="col-span-2">
                  <span className="text-gray-600">Customer:</span>
                  <span className="ml-2 font-medium">{selectedCollection.customer_name}</span>
                </div>
              </div>
            </div>

<form onSubmit={(e) => { e.preventDefault(); handleSubmitPayment(); }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Amount *</label>
                <Input
                  name="amount"
                  type="number"
                  step="0.01"
                  value={paymentForm.amount}
                  onChange={(e) =>
                    setPaymentForm({ ...paymentForm, amount: e.target.value })
                  }
                  placeholder="Enter amount"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method *</label>
                <select
                  name="payment_method"
                  value={paymentForm.payment_method}
                  onChange={(e) =>
                    setPaymentForm({ ...paymentForm, payment_method: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  required
                >
                  <option value="cash">Cash</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="cheque">Cheque</option>
                  <option value="card">Card</option>
                  <option value="upi">UPI</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reference Number</label>
                <Input
                  name="reference_number"
                  value={paymentForm.reference_number}
                  onChange={(e) =>
                    setPaymentForm({ ...paymentForm, reference_number: e.target.value })
                  }
                  placeholder="Enter reference number (transaction ID, cheque number, etc.)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <Input
                  name="notes"
                  value={paymentForm.notes}
                  onChange={(e) =>
                    setPaymentForm({ ...paymentForm, notes: e.target.value })
                  }
                  placeholder="Add notes (optional)"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  fullWidth
                  onClick={() => setIsRecordModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  fullWidth
                  isLoading={recordPaymentMutation.isPending}
                >
                  Record Payment
                </Button>
              </div>
            </form>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default CollectionsPage

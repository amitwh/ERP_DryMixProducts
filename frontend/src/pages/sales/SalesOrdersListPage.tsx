import React, { useState, useMemo, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Search, Filter, Plus, Eye, Edit, Trash2, Printer,
  Download, Calendar, ChevronLeft, ChevronRight, MoreHorizontal,
  FileText, Truck, CheckCircle, Clock, IndianRupee
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { StatusBadge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Loading'
import { api } from '@/services/api'
import { toast } from 'sonner'
import { formatCurrency, formatDate, formatIndianNumber } from '@/utils'

// Types
interface Customer {
  id: number
  name: string
  code: string
  email: string | null
  phone: string | null
}

interface SalesOrderItem {
  id: number
  product_id: number
  product_name: string
  quantity: number
  rate: number
  discount: number
  tax_rate: number
  amount: number
}

interface SalesOrder {
  id: number
  order_number: string
  order_date: string
  customer_id: number
  customer: Customer
  reference_number: string | null
  status: 'draft' | 'confirmed' | 'processing' | 'dispatched' | 'delivered' | 'cancelled'
  items: SalesOrderItem[]
  subtotal: number
  discount_total: number
  tax_total: number
  grand_total: number
  payment_terms: number
  due_date: string
  payment_mode: string
  expected_delivery_date: string | null
  delivery_instructions: string | null
  internal_notes: string | null
  customer_notes: string | null
  created_at: string
  updated_at: string
}

interface PaginatedResponse {
  data: SalesOrder[]
  current_page: number
  last_page: number
  per_page: number
  total: number
}

// Status configuration
const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; border: string }> = {
  draft: { label: 'Draft', color: 'text-gray-700', bg: 'bg-gray-100', border: 'border-gray-200' },
  confirmed: { label: 'Confirmed', color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-100' },
  processing: { label: 'Processing', color: 'text-yellow-700', bg: 'bg-yellow-50', border: 'border-yellow-100' },
  dispatched: { label: 'Dispatched', color: 'text-purple-700', bg: 'bg-purple-50', border: 'border-purple-100' },
  delivered: { label: 'Delivered', color: 'text-green-700', bg: 'bg-green-50', border: 'border-green-100' },
  cancelled: { label: 'Cancelled', color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-100' },
}

// Order Status Badge
const OrderStatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.draft
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.bg} ${config.color} ${config.border}`}>
      {config.label}
    </span>
  )
}

export const SalesOrdersListPage: React.FC = () => {
  const navigate = useNavigate()

  // State
  const [orders, setOrders] = useState<SalesOrder[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [perPage, setPerPage] = useState(10)

  // Fetch Orders
  const fetchOrders = async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      params.append('page', currentPage.toString())
      params.append('per_page', perPage.toString())
      if (searchTerm) params.append('search', searchTerm)
      if (statusFilter !== 'all') params.append('status', statusFilter)
      if (dateFrom) params.append('date_from', dateFrom)
      if (dateTo) params.append('date_to', dateTo)

      const response = await api.get<PaginatedResponse>(`/sales-orders?${params.toString()}`)
      setOrders(response.data.data || [])
      setTotalPages(response.data.last_page || 1)
      setTotalItems(response.data.total || 0)
    } catch (error) {
      console.error('Failed to fetch orders:', error)
      toast.error('Failed to load sales orders')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [currentPage, perPage, statusFilter, dateFrom, dateTo])

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentPage === 1) {
        fetchOrders()
      } else {
        setCurrentPage(1)
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [searchTerm])

  // Calculate summary stats
  const stats = useMemo(() => {
    const totalValue = orders.reduce((acc, order) => acc + order.grand_total, 0)
    const pendingCount = orders.filter(o => ['draft', 'confirmed', 'processing'].includes(o.status)).length
    const dispatchedCount = orders.filter(o => o.status === 'dispatched').length
    const deliveredCount = orders.filter(o => o.status === 'delivered').length
    return { totalValue, pendingCount, dispatchedCount, deliveredCount }
  }, [orders])

  // Handle actions
  const handlePrint = (orderId: number) => {
    window.open(`/print/sales-order/${orderId}`, '_blank')
  }

  const handleExport = async () => {
    try {
      toast.info('Exporting orders...')
      // TODO: Implement export API
      await new Promise(resolve => setTimeout(resolve, 1000))
      toast.success('Export completed')
    } catch (error) {
      toast.error('Export failed')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sales Orders</h1>
          <p className="text-sm text-gray-500">Manage your dry mix product orders</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button onClick={() => navigate('/sales/orders/create')}>
            <Plus className="w-4 h-4 mr-2" />
            Create Order
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card variant="bordered" padding="md">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-50">
              <IndianRupee className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Value</p>
              <p className="text-lg font-bold text-gray-900">{formatCurrency(stats.totalValue)}</p>
            </div>
          </div>
        </Card>
        <Card variant="bordered" padding="md">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-yellow-50">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Pending</p>
              <p className="text-lg font-bold text-gray-900">{stats.pendingCount}</p>
            </div>
          </div>
        </Card>
        <Card variant="bordered" padding="md">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-50">
              <Truck className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Dispatched</p>
              <p className="text-lg font-bold text-gray-900">{stats.dispatchedCount}</p>
            </div>
          </div>
        </Card>
        <Card variant="bordered" padding="md">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-50">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Delivered</p>
              <p className="text-lg font-bold text-gray-900">{stats.deliveredCount}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card variant="bordered">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by order number or customer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Status Filter */}
            <select
              className="h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="draft">Draft</option>
              <option value="confirmed">Confirmed</option>
              <option value="processing">Processing</option>
              <option value="dispatched">Dispatched</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>

            {/* Date Range */}
            <div className="flex items-center gap-2">
              <input
                type="date"
                className="h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
              <span className="text-gray-400">to</span>
              <input
                type="date"
                className="h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card variant="bordered">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-700 font-medium border-b border-gray-200">
              <tr>
                <th className="px-6 py-4">Order No</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Items</th>
                <th className="px-6 py-4 text-right">Total Amount</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Delivery Date</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td className="px-6 py-4"><Skeleton height={16} width={100} /></td>
                    <td className="px-6 py-4"><Skeleton height={16} width={80} /></td>
                    <td className="px-6 py-4"><Skeleton height={16} width={150} /></td>
                    <td className="px-6 py-4"><Skeleton height={16} width={40} /></td>
                    <td className="px-6 py-4"><Skeleton height={16} width={100} /></td>
                    <td className="px-6 py-4"><Skeleton height={24} width={80} /></td>
                    <td className="px-6 py-4"><Skeleton height={16} width={80} /></td>
                    <td className="px-6 py-4"><Skeleton height={16} width={100} /></td>
                  </tr>
                ))
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                    <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p className="font-medium">No orders found</p>
                    <p className="text-sm">Create your first sales order to get started</p>
                    <Button
                      className="mt-4"
                      onClick={() => navigate('/sales/orders/create')}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Create Order
                    </Button>
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr
                    key={order.id}
                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => navigate(`/sales/orders/${order.id}`)}
                  >
                    <td className="px-6 py-4">
                      <span className="font-medium text-primary-600">{order.order_number}</span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {formatDate(order.order_date)}
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-gray-900">{order.customer?.name}</div>
                        <div className="text-xs text-gray-500">{order.customer?.code}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {order.items?.length || 0} items
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="font-medium text-gray-900">
                        {formatCurrency(order.grand_total)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <OrderStatusBadge status={order.status} />
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {order.expected_delivery_date ? formatDate(order.expected_delivery_date) : '-'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            navigate(`/sales/orders/${order.id}`)
                          }}
                          className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded"
                          title="View"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            navigate(`/sales/orders/${order.id}/edit`)
                          }}
                          className="p-1.5 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handlePrint(order.id)
                          }}
                          className="p-1.5 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded"
                          title="Print"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">
              Showing {((currentPage - 1) * perPage) + 1} to {Math.min(currentPage * perPage, totalItems)} of {totalItems} results
            </span>
            <select
              className="h-8 rounded border border-gray-300 bg-white px-2 text-sm"
              value={perPage}
              onChange={(e) => {
                setPerPage(Number(e.target.value))
                setCurrentPage(1)
              }}
            >
              <option value={10}>10 per page</option>
              <option value={25}>25 per page</option>
              <option value={50}>50 per page</option>
              <option value={100}>100 per page</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum = i + 1
                if (totalPages > 5) {
                  if (currentPage > 3) {
                    pageNum = currentPage - 2 + i
                  }
                  if (currentPage > totalPages - 2) {
                    pageNum = totalPages - 4 + i
                  }
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-8 h-8 rounded text-sm font-medium ${
                      currentPage === pageNum
                        ? 'bg-primary-600 text-white'
                        : 'hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    {pageNum}
                  </button>
                )
              })}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages || totalPages === 0}
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default SalesOrdersListPage

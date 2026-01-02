import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { api } from '@/services/api'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { StatusBadge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Loading'
import { Plus, Search, RefreshCw, Factory, Play, Pause, Eye, Package } from 'lucide-react'
import { formatCurrency, formatDate } from '@/utils'

interface ProductionOrder {
  id: number
  order_number: string
  product_id: number
  product_name: string
  batch_number: string
  quantity: number
  unit: string
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
  planned_date: string
  completion_date: string | null
}

export const ProductionOrdersPage: React.FC = () => {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [orders, setOrders] = useState<ProductionOrder[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [page, setPage] = useState(1)

  const fetchOrders = async () => {
    try {
      setIsLoading(true)
      const response = await api.get<{ data: ProductionOrder[] }>('/production/orders', {
        params: {
          organization_id: user?.organizationId,
          per_page: 20,
          page,
          ...(statusFilter !== 'all' && { status: statusFilter }),
        },
      })
      setOrders(response.data.data || [])
    } catch (error) {
      console.error('Failed to fetch orders:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [page, statusFilter])

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      searchTerm === '' ||
      order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.batch_number.toLowerCase().includes(searchTerm.toLowerCase())

    return matchesSearch
  })

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    in_progress: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Production Orders</h1>
          <p className="text-gray-600">Manage production orders and batches</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="primary" size="sm" leftIcon={<Plus className="w-4 h-4" />} onClick={() => navigate('/production/orders/create')}>
            New Order
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card variant="bordered" padding="md">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </Card>

      {/* Orders List */}
      <Card variant="bordered" padding="lg">
        <CardHeader>
          <CardTitle>Production Orders</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} height={100} className="rounded" />)}
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-8">
              <Factory className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">No production orders found</p>
              <Button variant="primary" size="sm" leftIcon={<Plus className="w-4 h-4" />} onClick={() => navigate('/production/orders/create')}>
                Create First Order
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredOrders.map((order) => (
                <div key={order.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center justify-center w-12 h-12 bg-primary-100 rounded-lg">
                    <Factory className="w-6 h-6 text-primary-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-gray-900">{order.order_number}</span>
                      <span className={`px-2 py-0.5 text-xs rounded-full ${statusColors[order.status] || 'bg-gray-100'}`}>
                        {order.status.replace(/_/g, ' ').toUpperCase()}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-gray-900">{order.product_name}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-600">
                      <span className="flex items-center gap-1">
                        <Package className="w-3 h-3" />
                        {order.batch_number}
                      </span>
                      <span>•</span>
                      <span>Qty: {order.quantity} {order.unit}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="space-y-1">
                      <p className="text-xs text-gray-500">Planned: {formatDate(order.planned_date)}</p>
                      {order.completion_date && (
                        <p className="text-xs text-gray-500">Completed: {formatDate(order.completion_date)}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" leftIcon={<Eye className="w-4 h-4" />} onClick={() => navigate(`/production/orders/${order.id}`)}>
                      View
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {orders.length > 0 && (
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(page - 1)}>
            Previous
          </Button>
          <span className="px-4 py-2">Page {page}</span>
          <Button variant="outline" size="sm" onClick={() => setPage(page + 1)}>
            Next
          </Button>
        </div>
      )}
    </div>
  )
}

export default ProductionOrdersPage

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
import { Search, Plus, Filter, Package, Warehouse, TrendingUp, AlertTriangle, Download, Printer } from 'lucide-react'
import { formatDate, formatNumber } from '@/utils'

interface InventoryItem {
  id: number
  product_id: number
  product_name: string
  product_code: string
  warehouse_id: number
  warehouse_name: string
  quantity: number
  uom: string
  unit_cost: number
  total_value: number
  reorder_level: number
  max_level: number
  status: 'in_stock' | 'low_stock' | 'out_of_stock'
  last_movement?: string
}

export default function InventoryPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [items, setItems] = useState<InventoryItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'in_stock' | 'low_stock' | 'out_of_stock'>('all')
  const [warehouseFilter, setWarehouseFilter] = useState('')
  const [warehouses, setWarehouses] = useState<any[]>([])

  useEffect(() => {
    fetchInventory()
    fetchWarehouses()
  }, [statusFilter, warehouseFilter])

  const fetchInventory = async () => {
    try {
      setIsLoading(true)
      const response = await api.get<{ data: InventoryItem[] }>('/inventory/stock', {
        params: {
          organization_id: user?.organization_id,
          status: statusFilter === 'all' ? undefined : statusFilter,
          warehouse_id: warehouseFilter || undefined,
        },
      })
      setItems(response.data.data || [])
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch inventory')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchWarehouses = async () => {
    try {
      const response = await api.get<{ data: any[] }>('/inventory/warehouses', {
        params: { organization_id: user?.organization_id },
      })
      setWarehouses(response.data.data || [])
    } catch (err: any) {
      console.error('Failed to fetch warehouses:', err)
    }
  }

  const filteredItems = items.filter(item => {
    const matchesSearch =
      searchTerm === '' ||
      item.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.product_code.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  const totalValue = items.reduce((sum, item) => sum + item.total_value, 0)
  const lowStockCount = items.filter(item => item.status === 'low_stock').length
  const outOfStockCount = items.filter(item => item.status === 'out_of_stock').length
  const avgCostPerUnit = items.length > 0
    ? items.reduce((sum, item) => sum + item.unit_cost, 0) / items.length
    : 0

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      in_stock: 'bg-green-100 text-green-800',
      low_stock: 'bg-yellow-100 text-yellow-800',
      out_of_stock: 'bg-red-100 text-red-800',
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventory Overview</h1>
          <p className="text-gray-600">Complete inventory management and control</p>
        </div>
        <Button
          variant="primary"
          size="sm"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => navigate('/inventory/stock-adjustments')}
        >
          Adjust Stock
        </Button>
      </div>

      {error && <Alert type="error" message={error} onDismiss={() => setError(null)} />}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card variant="bordered" padding="lg">
          <div className="text-center">
            <Package className="w-6 h-6 text-primary-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-600 mb-1">Total Items</p>
            <h3 className="text-2xl font-bold text-gray-900">{items.length}</h3>
          </div>
        </Card>
        <Card variant="bordered" padding="lg">
          <div className="text-center">
            <Warehouse className="w-6 h-6 text-success-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-600 mb-1">Total Value</p>
            <h3 className="text-2xl font-bold text-success-600">
              ₹{formatNumber(totalValue)}
            </h3>
          </div>
        </Card>
        <Card variant="bordered" padding="lg">
          <div className="text-center">
            <AlertTriangle className="w-6 h-6 text-warning-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-600 mb-1">Low Stock</p>
            <h3 className="text-2xl font-bold text-warning-600">{lowStockCount}</h3>
          </div>
        </Card>
        <Card variant="bordered" padding="lg">
          <div className="text-center">
            <AlertTriangle className="w-6 h-6 text-error-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-600 mb-1">Out of Stock</p>
            <h3 className="text-2xl font-bold text-error-600">{outOfStockCount}</h3>
          </div>
        </Card>
      </div>

      <Card variant="bordered" padding="md">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex items-center gap-2">
            {(['in_stock', 'low_stock', 'out_of_stock'] as const).map((status) => (
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
          <div className="flex items-center gap-2">
            <select
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              value={warehouseFilter}
              onChange={(e) => setWarehouseFilter(e.target.value)}
            >
              <option value="">All Warehouses</option>
              {warehouses.map((wh: any) => (
                <option key={wh.id} value={wh.id.toString()}>
                  {wh.name}
                </option>
              ))}
            </select>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Filter className="w-4 h-4" />}
              onClick={() => {
                setWarehouseFilter('')
                setStatusFilter('all')
              }}
            >
              Reset
            </Button>
          </div>
        </div>
      </Card>

      <Card variant="bordered" padding="lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Inventory Items ({filteredItems.length})
          </h3>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Download className="w-4 h-4" />}
              onClick={() => {
                const csvContent =
                  'data:text/csv;charset=utf-8,' +
                  'Product,Code,Warehouse,Quantity,UOM,Unit Cost,Total Value,Reorder Level,Max Level,Status\n' +
                  filteredItems
                    .map(i =>
                      `"${i.product_name}",${i.product_code},"${i.warehouse_name}",${i.quantity},${i.uom},${i.unit_cost},${i.total_value},${i.reorder_level},${i.max_level},${i.status}`
                    )
                    .join('\n')
                const link = document.createElement('a')
                link.setAttribute('href', encodeURI(csvContent))
                link.setAttribute('download', 'inventory-overview.csv')
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
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">No inventory items found</p>
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={() => navigate('/inventory/products')}
            >
              View Products
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Product</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Warehouse</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Quantity</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">UOM</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Unit Cost</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Total Value</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Stock Status</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-gray-900">{item.product_name}</p>
                        <p className="text-sm text-gray-600">{item.product_code}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-gray-900">{item.warehouse_name}</p>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <p className="font-semibold text-gray-900">{formatNumber(item.quantity)}</p>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <p className="text-sm text-gray-600">{item.uom}</p>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <p className="text-sm text-gray-900">₹{item.unit_cost.toFixed(2)}</p>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <p className="font-semibold text-primary-600">₹{formatNumber(item.total_value)}</p>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <StatusBadge status={item.status} />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/inventory/stock/${item.id}`)}
                        >
                          View
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          leftIcon={<TrendingUp className="w-4 h-4" />}
                          onClick={() => navigate(`/inventory/stock-transfers?product_id=${item.product_id}`)}
                        >
                          Transfer
                        </Button>
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

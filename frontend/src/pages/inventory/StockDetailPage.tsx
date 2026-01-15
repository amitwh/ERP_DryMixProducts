import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { QuickActions } from '@/components/ui/ActionMenu'
import {
  ArrowLeft,
  Package,
  Scale,
  Calendar,
  Warehouse,
  Truck,
  AlertTriangle,
  Plus,
  Minus,
  Edit,
} from 'lucide-react'
import { formatIndianNumber, formatDate } from '@/utils'

interface StockItem {
  id: number
  item_code: string
  item_name: string
  category: string
  current_stock: number
  min_stock: number
  max_stock: number
  reorder_point: number
  uom: string
  unit_cost: number
  total_value: number
  warehouse_id: number
  warehouse_name: string
  location: string
  batch?: string
  expiry_date?: string
  status: 'available' | 'low_stock' | 'out_of_stock' | 'on_hold'
  last_received?: string
  last_issued?: string
}

export default function StockDetailPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [stockItem, setStockItem] = useState<StockItem | null>(null)
  const [movements, setMovements] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchStockItem()
  }, [id])

  const fetchStockItem = async () => {
    try {
      const response = await fetch(`/api/v1/inventory/${id}`)
      const data = await response.json()
      if (data.success) {
        setStockItem(data.data)
        setMovements(data.data.movements || [])
      } else {
        setError(data.message || 'Failed to load stock item')
      }
    } catch (err) {
      setError('Failed to load stock item. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAdjustStock = async (adjustment: number, reason: string) => {
    try {
      await fetch(`/api/v1/inventory/${id}/adjust`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adjustment, reason }),
      })
      alert('Stock adjusted successfully!')
      fetchStockItem()
    } catch (err) {
      console.error('Failed to adjust stock:', err)
      alert('Failed to adjust stock. Please try again.')
    }
  }

  const getStockLevel = (current: number, min: number, max: number) => {
    if (current === 0) return { status: 'out_of_stock', color: 'error', label: 'Out of Stock' }
    if (current <= min) return { status: 'low_stock', color: 'warning', label: 'Low Stock' }
    if (current >= max) return { status: 'overstock', color: 'info', label: 'Over Stock' }
    return { status: 'available', color: 'success', label: 'Available' }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-t-2 border-primary-600" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto mt-8">
        <Alert type="error" message={error} />
        <div className="mt-4">
          <Button variant="outline" onClick={() => navigate('/inventory/stock')}>
            Back to Stock
          </Button>
        </div>
      </div>
    )
  }

  if (!stockItem) return null

  const stockLevel = getStockLevel(stockItem.current_stock, stockItem.min_stock, stockItem.max_stock)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<ArrowLeft className="w-4 h-4" />}
            onClick={() => navigate('/inventory/stock')}
          >
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{stockItem.item_name}</h1>
            <p className="text-gray-600">
              Code: {stockItem.item_code} | Category: {stockItem.category}
            </p>
          </div>
        </div>
        <QuickActions
          onView={() => { }}
          onEdit={() => navigate(`/inventory/stock/${id}/edit`)}
          onPrint={() => window.open(`/api/v1/print/stock-card/${id}`, '_blank')}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <Card variant="bordered" padding="lg" className={stockLevel.color === 'warning' ? 'border-warning-400' : stockLevel.color === 'error' ? 'border-error-400' : ''}>
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">Current Stock</p>
            <div className="flex items-center gap-3">
              <h3 className={`text-3xl font-bold ${
                stockLevel.color === 'success' ? 'text-success-600' :
                stockLevel.color === 'warning' ? 'text-warning-600' :
                stockLevel.color === 'error' ? 'text-error-600' :
                'text-info-600'
              }`}>
                {formatIndianNumber(stockItem.current_stock)} {stockItem.uom}
              </h3>
              <StatusBadge status={stockItem.status} />
            </div>
            <p className="text-sm text-gray-600">{stockLevel.label}</p>
          </div>
        </Card>
        <Card variant="bordered" padding="lg">
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">Total Value</p>
            <h3 className="text-3xl font-bold text-gray-900">
              ₹{formatIndianNumber(stockItem.total_value)}
            </h3>
            <p className="text-sm text-gray-600">
              @ ₹{formatIndianNumber(stockItem.unit_cost)}/{stockItem.uom}
            </p>
          </div>
        </Card>
        <Card variant="bordered" padding="lg">
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">Min Stock Level</p>
            <div className="flex items-center gap-2">
              <h3 className="text-3xl font-bold text-warning-600">
                {formatIndianNumber(stockItem.min_stock)} {stockItem.uom}
              </h3>
              {stockItem.current_stock <= stockItem.min_stock && (
                <AlertTriangle className="w-5 h-5 text-warning-600" />
              )}
            </div>
          </div>
        </Card>
        <Card variant="bordered" padding="lg">
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">Reorder Point</p>
            <div className="flex items-center gap-2">
              <h3 className="text-3xl font-bold text-info-600">
                {formatIndianNumber(stockItem.reorder_point)} {stockItem.uom}
              </h3>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card variant="bordered" padding="lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Location Information</h3>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-600 mb-1">Warehouse</p>
              <p className="font-semibold text-gray-900">{stockItem.warehouse_name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Location</p>
              <p className="font-semibold text-gray-900">{stockItem.location || 'Not specified'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Bin/Location</p>
              <p className="font-semibold text-gray-900">{stockItem.batch || 'Not specified'}</p>
            </div>
          </div>
        </Card>

        <Card variant="bordered" padding="lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Dates</h3>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-600 mb-1">Last Received</p>
              <p className="font-semibold text-gray-900">{stockItem.last_received ? formatDate(stockItem.last_received) : 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Last Issued</p>
              <p className="font-semibold text-gray-900">{stockItem.last_issued ? formatDate(stockItem.last_issued) : 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Expiry Date</p>
              <p className="font-semibold text-gray-900">{stockItem.expiry_date ? formatDate(stockItem.expiry_date) : 'N/A'}</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="space-y-6">
        <Card variant="bordered" padding="lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Stock Movements</h3>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Package className="w-4 h-4" />}
              onClick={() => navigate(`/inventory/movements?item=${id}`)}
            >
              View All
            </Button>
          </div>
          {movements.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No movement history available
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Date
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Type
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Quantity
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Balance
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Reference
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Notes
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {movements.slice(0, 10).map((movement, index) => (
                    <tr key={index}>
                      <td className="px-4 py-4">
                        {formatDate(movement.movement_date)}
                      </td>
                      <td>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          movement.movement_type === 'receipt' ? 'bg-success-100 text-success-800' :
                          movement.movement_type === 'issue' ? 'bg-error-100 text-error-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {movement.movement_type}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        {movement.movement_type === 'receipt' ? '+' : '-'}{formatIndianNumber(Math.abs(movement.quantity))} {stockItem.uom}
                      </td>
                      <td className="px-4 py-4 font-semibold">
                        {formatIndianNumber(movement.balance)} {stockItem.uom}
                      </td>
                      <td className="px-4 py-4">{movement.reference}</td>
                      <td className="px-4 py-4 text-gray-600 text-sm">{movement.notes || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <Card variant="bordered" padding="lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <Button
              variant="outline"
              className="w-full"
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={() => handleAdjustStock(10, 'Manual stock addition')}
            >
              Add Stock (+10 units)
            </Button>
            <Button
              variant="outline"
              className="w-full"
              leftIcon={<Minus className="w-4 h-4" />}
              onClick={() => handleAdjustStock(-10, 'Manual stock removal')}
            >
              Remove Stock (-10 units)
            </Button>
            <Button
              variant="outline"
              className="w-full"
              leftIcon={<Edit className="w-4 h-4" />}
              onClick={() => navigate(`/inventory/stock/${id}/adjust`)}
            >
              Manual Adjustment
            </Button>
            <Button
              variant="outline"
              className="w-full"
              leftIcon={<Warehouse className="w-4 h-4" />}
              onClick={() => navigate(`/inventory/transfers/create?item=${id}`)}
            >
              Transfer Stock
            </Button>
          </div>
        </Card>

        {stockItem.current_stock <= stockItem.reorder_point && (
          <Alert type="warning" message="Stock is at or below reorder point. Consider replenishing." dismissible />
        )}
      </div>
    </div>
  )
}

import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { QuickActions } from '@/components/ui/ActionMenu'
import {
  ArrowLeft,
  Printer,
  Download,
  Factory,
  Calendar,
  Package,
  Scale,
  Activity,
  Clock,
  User,
  Play,
  Pause,
  Square,
  MoreVertical,
} from 'lucide-react'
import { formatIndianNumber, formatDate } from '@/utils'

interface ProductionOrder {
  id: number
  order_number: string
  product_id: number
  product_name: string
  product_code: string
  sales_order_id?: number
  sales_order_number?: string
  status: 'pending' | 'planned' | 'in_production' | 'completed' | 'cancelled'
  planned_quantity: number
  produced_quantity: number
  uom: string
  production_date: string
  completed_date?: string
  bom_id?: number
  recipe_version?: string
  shift?: string
  created_by?: string
  created_at: string
}

export default function ProductionOrderDetailPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [order, setOrder] = useState<ProductionOrder | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchOrder()
  }, [id])

  const fetchOrder = async () => {
    try {
      const response = await fetch(`/api/v1/production-orders/${id}`)
      const data = await response.json()
      if (data.success) {
        setOrder(data.data)
      } else {
        setError(data.message || 'Failed to load production order')
      }
    } catch (err) {
      setError('Failed to load production order. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handlePrint = async () => {
    window.open(`/api/v1/print/production-order/${id}`, '_blank')
  }

  const handleDownload = async () => {
    try {
      const response = await fetch(`/api/v1/print/production-order/${id}`)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `production-order-${id}.pdf`
      a.click()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Failed to download:', err)
    }
  }

  const handleStart = async () => {
    try {
      await fetch(`/api/v1/production-orders/${id}/start`, { method: 'POST' })
      fetchOrder()
    } catch (err) {
      alert('Failed to start production. Please try again.')
    }
  }

  const handlePause = async () => {
    try {
      await fetch(`/api/v1/production-orders/${id}/pause`, { method: 'POST' })
      fetchOrder()
    } catch (err) {
      alert('Failed to pause production. Please try again.')
    }
  }

  const handleComplete = async () => {
    try {
      await fetch(`/api/v1/production-orders/${id}/complete`, { method: 'POST' })
      fetchOrder()
    } catch (err) {
      alert('Failed to complete production. Please try again.')
    }
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
          <Button variant="outline" onClick={() => navigate('/production/orders')}>
            Back to Orders
          </Button>
        </div>
      </div>
    )
  }

  if (!order) return null

  const progressPercentage = order.planned_quantity > 0
    ? ((order.produced_quantity / order.planned_quantity) * 100).toFixed(1)
    : '0'

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<ArrowLeft className="w-4 h-4" />}
            onClick={() => navigate('/production/orders')}
          >
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Production Order {order.order_number}
            </h1>
            <p className="text-gray-600">
              Created on {formatDate(order.created_at)}
            </p>
          </div>
        </div>
        <QuickActions
          onView={() => { }}
          onPrint={handlePrint}
          onDownload={handleDownload}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card variant="bordered" padding="lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Product Information
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Product</p>
                <p className="font-semibold text-gray-900">{order.product_name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Product Code</p>
                <p className="font-semibold text-gray-900">{order.product_code}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Recipe Version</p>
                <p className="font-semibold text-gray-900">{order.recipe_version || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">BOM</p>
                <p className="font-semibold text-gray-900">{order.bom_id ? `BOM-${order.bom_id}` : 'N/A'}</p>
              </div>
            </div>
          </Card>

          <Card variant="bordered" padding="lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Production Status
            </h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Progress</span>
                  <span className="font-semibold text-gray-900">{progressPercentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-primary-600 h-2.5 rounded-full transition-all duration-500"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Planned Quantity</p>
                  <p className="font-semibold text-gray-900">{formatIndianNumber(order.planned_quantity)} {order.uom}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Produced Quantity</p>
                  <p className="font-semibold text-primary-600">{formatIndianNumber(order.produced_quantity)} {order.uom}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Production Date</p>
                  <p className="font-semibold text-gray-900">{formatDate(order.production_date)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Shift</p>
                  <p className="font-semibold text-gray-900">{order.shift || 'Not Assigned'}</p>
                </div>
              </div>
            </div>
          </Card>

          {order.sales_order_number && (
            <Card variant="bordered" padding="lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Linked Sales Order
              </h3>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-900">{order.sales_order_number}</p>
                  <p className="text-sm text-gray-600">Sales Order</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/sales/orders/${order.sales_order_id}`)}
                >
                  View Order
                </Button>
              </div>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card variant="bordered" padding="lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Order Status
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Status</span>
                <StatusBadge status={order.status} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Created By</span>
                <span className="font-semibold">{order.created_by || 'System'}</span>
              </div>
            </div>
          </Card>

          <Card variant="bordered" padding="lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Actions
            </h3>
            <div className="space-y-3">
              {order.status === 'planned' && (
                <Button
                  variant="primary"
                  className="w-full"
                  leftIcon={<Play className="w-4 h-4" />}
                  onClick={handleStart}
                >
                  Start Production
                </Button>
              )}
              {order.status === 'in_production' && (
                <>
                  <Button
                    variant="outline"
                    className="w-full"
                    leftIcon={<Pause className="w-4 h-4" />}
                    onClick={handlePause}
                  >
                    Pause Production
                  </Button>
                  <Button
                    variant="primary"
                    className="w-full"
                    leftIcon={<Square className="w-4 h-4" />}
                    onClick={handleComplete}
                  >
                    Complete Production
                  </Button>
                </>
              )}
              <Button
                variant="outline"
                className="w-full"
                leftIcon={<Printer className="w-4 h-4" />}
                onClick={handlePrint}
              >
                Print Order
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

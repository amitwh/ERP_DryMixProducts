import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { QuickActions } from '@/components/ui/ActionMenu'
import { ArrowLeft, Printer, Download, Mail, FileText, Package, Clock, Calendar } from 'lucide-react'

export default function SalesOrderDetailPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [order, setOrder] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isPrinting, setIsPrinting] = useState(false)

  useEffect(() => {
    fetchOrder()
  }, [id])

  const fetchOrder = async () => {
    try {
      const response = await fetch(`/api/v1/sales-orders/${id}`)
      const data = await response.json()
      if (data.success) {
        setOrder(data.data)
      } else {
        setError(data.message || 'Failed to load order')
      }
    } catch (err) {
      setError('Failed to load order. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handlePrint = async () => {
    setIsPrinting(true)
    try {
      window.open(`/api/v1/print/sales-order/${id}`, '_blank')
    } finally {
      setIsPrinting(false)
    }
  }

  const handleDownload = async () => {
    try {
      const response = await fetch(`/api/v1/print/sales-order/${id}`)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `sales-order-${id}.pdf`
      a.click()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Failed to download:', err)
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
          <Button variant="outline" onClick={() => navigate('/sales/orders')}>
            Back to Orders
          </Button>
        </div>
      </div>
    )
  }

  if (!order) return null

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<ArrowLeft className="w-4 h-4" />}
            onClick={() => navigate('/sales/orders')}
          >
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Sales Order {order.order_number}
            </h1>
            <p className="text-gray-600">
              Created on {new Date(order.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
        <QuickActions
          onView={() => { }}
          onPrint={handlePrint}
          onDownload={handleDownload}
          onSendEmail={() => { }}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card variant="bordered" padding="lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Customer Information
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Customer Name</p>
                <p className="font-semibold text-gray-900">{order.customer?.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Delivery Address</p>
                <p className="font-semibold text-gray-900">{order.delivery_address}</p>
              </div>
            </div>
          </Card>

          <Card variant="bordered" padding="lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Order Items
            </h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Quantity</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Unit Price</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {order.items?.map((item: any, index: number) => (
                    <tr key={index}>
                      <td className="px-4 py-4">
                        <p className="font-semibold text-gray-900">{item.product_name}</p>
                      </td>
                      <td className="px-4 py-4 text-right">{item.quantity} {item.uom}</td>
                      <td className="px-4 py-4 text-right">₹{Number(item.unit_price).toFixed(2)}</td>
                      <td className="px-4 py-4 text-right font-semibold">₹{Number(item.total).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
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
                <span className="text-gray-600">Order Date</span>
                <span className="font-semibold">
                  {new Date(order.order_date).toLocaleDateString()}
                </span>
              </div>
            </div>
          </Card>

          <Card variant="bordered" padding="lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Order Summary
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-semibold">₹{Number(order.subtotal).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tax (18% GST)</span>
                <span className="font-semibold">₹{Number(order.tax_amount).toFixed(2)}</span>
              </div>
              <div className="border-t border-gray-200 pt-3 mt-3">
                <div className="flex justify-between text-lg">
                  <span className="font-bold">Total</span>
                  <span className="font-bold text-primary-600">
                    ₹{Number(order.grand_total).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

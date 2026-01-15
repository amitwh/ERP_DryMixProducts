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
  ShoppingCart,
  Truck,
  Calendar,
  Package,
  User,
  FileText,
  AlertTriangle,
  CheckCircle,
  Clock,
  Play,
  Pause,
  Square,
  MapPin,
  Phone,
  Mail as MailIcon,
  RefreshCw,
} from 'lucide-react'
import { formatIndianNumber, formatDate, formatCurrency } from '@/utils'

interface PurchaseOrder {
  id: number
  po_number: string
  supplier_id: number
  supplier_name: string
  supplier_code: string
  po_date: string
  expected_delivery_date: string
  status: 'draft' | 'pending_approval' | 'approved' | 'sent' | 'partial_received' | 'received' | 'cancelled'
  subtotal: number
  tax_amount: number
  shipping_amount: number
  grand_total: number
  currency: string
  payment_terms: string
  delivery_terms: string
  billing_address: string
  shipping_address: string
  notes?: string
  approved_by?: string
  approved_at?: string
  created_by: string
  created_at: string
  items?: POItem[]
}

interface POItem {
  id: number
  item_id: number
  item_code: string
  item_name: string
  description?: string
  quantity: number
  uom: string
  unit_price: number
  discount: number
  total: number
  received_quantity: number
  pending_quantity: number
  status: 'pending' | 'partially_received' | 'received'
  remarks?: string
}

export default function PurchaseOrderDetailPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [order, setOrder] = useState<PurchaseOrder | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isPrinting, setIsPrinting] = useState(false)

  useEffect(() => {
    fetchOrder()
  }, [id])

  const fetchOrder = async () => {
    try {
      const response = await fetch(`/api/v1/purchase-orders/${id}`)
      const data = await response.json()
      if (data.success) {
        setOrder(data.data)
      } else {
        setError(data.message || 'Failed to load purchase order')
      }
    } catch (err) {
      setError('Failed to load purchase order. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handlePrint = async () => {
    setIsPrinting(true)
    try {
      window.open(`/api/v1/print/purchase-order/${id}`, '_blank')
    } catch (err) {
      console.error('Failed to print:', err)
    } finally {
      setIsPrinting(false)
    }
  }

  const handleDownload = async () => {
    try {
      const response = await fetch(`/api/v1/print/purchase-order/${id}`)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `po-${order?.po_number}.pdf`
      a.click()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Failed to download:', err)
    }
  }

  const handleApprove = async () => {
    try {
      await fetch(`/api/v1/purchase-orders/${id}/approve`, { method: 'POST' })
      alert('PO approved successfully!')
      fetchOrder()
    } catch (err) {
      console.error('Failed to approve:', err)
      alert('Failed to approve PO. Please try again.')
    }
  }

  const handleReject = async () => {
    const reason = prompt('Enter reason for rejection:')
    if (!reason) return

    try {
      await fetch(`/api/v1/purchase-orders/${id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      })
      alert('PO rejected successfully!')
      fetchOrder()
    } catch (err) {
      console.error('Failed to reject:', err)
      alert('Failed to reject PO. Please try again.')
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
          <Button variant="outline" onClick={() => navigate('/procurement/purchase-orders')}>
            Back to POs
          </Button>
        </div>
      </div>
    )
  }

  if (!order) return null

  const receivedQuantity = order.items?.reduce((sum, item) => sum + (item.received_quantity || 0), 0)
  const pendingQuantity = order.items?.reduce((sum, item) => sum + (item.pending_quantity || 0), 0)
  const totalQuantity = order.items?.reduce((sum, item) => sum + item.quantity, 0)
  const progressPercentage = totalQuantity > 0
    ? ((receivedQuantity / totalQuantity) * 100).toFixed(1)
    : '0'

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<ArrowLeft className="w-4 h-4" />}
            onClick={() => navigate('/procurement/purchase-orders')}
          >
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Purchase Order {order.po_number}
            </h1>
            <p className="text-gray-600">
              Created on {formatDate(order.created_at)}
            </p>
          </div>
        </div>
        <QuickActions
          onView={() => { /* Already viewing */ }}
          onPrint={handlePrint}
          onDownload={handleDownload}
          extraActions={[
            { id: 'approve', label: 'Approve', icon: CheckCircle, onClick: handleApprove, disabled: !['pending_approval', 'draft'].includes(order.status) },
            { id: 'reject', label: 'Reject', icon: AlertTriangle, onClick: handleReject, disabled: !['pending_approval', 'draft'].includes(order.status) },
            { id: 'grn', label: 'Create GRN', icon: Truck },
          ]}
        />
      </div>

      <div className={`p-4 rounded-lg border mb-6 ${
        order.status === 'draft' ? 'bg-yellow-50 border-yellow-200' :
        order.status === 'pending_approval' ? 'bg-orange-50 border-orange-200' :
        order.status === 'approved' ? 'bg-green-50 border-green-200' :
        order.status === 'sent' ? 'bg-blue-50 border-blue-200' :
        order.status === 'received' ? 'bg-purple-50 border-purple-200' :
        'bg-gray-50 border-gray-200'
      }`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            <div>
              <p className="text-sm font-medium text-gray-600">Status</p>
              <StatusBadge status={order.status} />
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-600">Supplier</p>
            <p className="font-semibold">{order.supplier_name}</p>
          </div>
        </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card variant="bordered" padding="lg">
            <div className="flex items-center gap-3 mb-4">
              <FileText className="w-6 h-6 text-primary-600" />
              <h3 className="text-lg font-semibold text-gray-900">
                Order Information
              </h3>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">PO Date</p>
                  <p className="font-semibold text-gray-900">{formatDate(order.po_date)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Expected Delivery</p>
                  <p className="font-semibold text-gray-900">{formatDate(order.expected_delivery_date)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Currency</p>
                  <p className="font-semibold text-gray-900">{order.currency}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Payment Terms</p>
                  <p className="font-semibold text-gray-900">{order.payment_terms}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Delivery Terms</p>
                  <p className="font-semibold text-gray-900">{order.delivery_terms}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-1">Billing Address</p>
                <div className="space-y-1">
                  <p className="text-gray-900">{order.billing_address}</p>
                  {order.billing_address !== order.shipping_address && (
                    <p className="text-sm text-gray-600 italic mt-2">Shipping to: {order.shipping_address}</p>
                  )}
                </div>
              </div>

              {order.notes && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">Notes</p>
                  <p className="text-gray-700">{order.notes}</p>
                </div>
              )}
            </div>
          </Card>

          <Card variant="bordered" padding="lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Items ({order.items?.length || 0})
            </h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Item
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      Ordered
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      Unit Price
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      Discount
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      Total
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {order.items?.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                        No items added yet
                      </td>
                    </tr>
                  ) : (
                    order.items.map((item, index) => (
                      <tr key={index}>
                        <td>
                          <div>
                            <p className="font-semibold text-gray-900">{item.item_name}</p>
                            <p className="text-sm text-gray-600">{item.item_code}</p>
                          </div>
                        </td>
                        <td className="text-right">
                          {formatIndianNumber(item.quantity)} {item.uom}
                        </td>
                        <td className="text-right">
                          {formatCurrency(item.unit_price)}
                        </td>
                        <td className="text-right">
                          {item.discount > 0 ? (
                            <span className="text-success-600">-{formatCurrency(item.discount)}</span>
                          ) : (
                            <span>-</span>
                          )}
                        </td>
                        <td className="text-right font-semibold">
                          {formatCurrency(item.total)}
                        </td>
                        <td>
                          <StatusBadge status={item.status} />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                <span>Total Ordered</span>
                <span className="font-semibold text-gray-900">
                  {formatCurrency(order.subtotal)} ({order.currency})
                </span>
              </div>
              <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                <span>Received</span>
                <span className="font-semibold text-green-600">
                  {formatIndianNumber(receivedQuantity)} {totalQuantity > 0 ? `/ ${formatIndianNumber(totalQuantity)}` : ''}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                <span>Pending</span>
                <span className="font-semibold text-warning-600">
                  {formatIndianNumber(pendingQuantity)} {totalQuantity > 0 ? `/ ${formatIndianNumber(totalQuantity)}` : ''}
                </span>
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card variant="bordered" padding="lg">
            <div className="flex items-center gap-3 mb-4">
              <Calendar className="w-6 h-6 text-primary-600" />
              <h3 className="text-lg font-semibold text-gray-900">
                Financial Summary
              </h3>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Subtotal</span>
                <span className="font-semibold text-gray-900">{formatCurrency(order.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Tax ({order.currency})</span>
                <span className="font-semibold text-gray-900">{formatCurrency(order.tax_amount)}</span>
              </div>
              {order.shipping_amount > 0 && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Shipping</span>
                  <span className="font-semibold text-gray-900">{formatCurrency(order.shipping_amount)}</span>
                </div>
              )}
              <div className="flex justify-between pt-4 border-t border-gray-200">
                <span className="text-lg font-bold text-gray-900">Grand Total</span>
                <span className="text-lg font-bold text-primary-600">
                  {formatCurrency(order.grand_total)}
                </span>
              </div>
            </div>
          </Card>

          <Card variant="bordered" padding="lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Approval Status
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Status</span>
                <StatusBadge status={order.status} />
              </div>
              {order.created_by && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Created By</span>
                  <span className="font-semibold text-gray-900">{order.created_by}</span>
                </div>
              )}
              {order.approved_by && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Approved By</span>
                  <span className="font-semibold text-gray-900">{order.approved_by}</span>
                </div>
              )}
              {order.approved_at && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Approved At</span>
                  <span className="font-semibold text-gray-900">{formatDate(order.approved_at)}</span>
                </div>
              )}
            </div>
          </Card>

          <Card variant="bordered" padding="lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Progress
            </h3>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-600">Delivery Progress</span>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2.5">
                      <div
                        className={`h-2.5 bg-primary-600 rounded-full transition-all duration-500`}
                        style={{ width: `${progressPercentage}%` }}
                      />
                    </div>
                  </div>
                  <span className="font-semibold text-gray-900">
                    {progressPercentage}%
                  </span>
                </div>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>{formatIndianNumber(receivedQuantity)} of {formatIndianNumber(totalQuantity)} units received</span>
                <span>{formatIndianNumber(pendingQuantity)} units pending</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

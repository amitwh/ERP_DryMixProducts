import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '@/services/api'
import { SalesOrder, Product, Customer, PaginatedResponse } from '@/types'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { StatusBadge } from '@/components/ui/Badge'
import { Modal, ModalFooter, ModalBody } from '@/components/ui/Modal'
import { FullPageLoading, LoadingOverlay } from '@/components/ui/Loading'
import { Badge } from '@/components/ui/Badge'
import { Loader2, Plus, Edit, Trash2, Search, Filter, Download, Printer, Eye, Check, X, FileText, RefreshCw } from 'lucide-react'
import { formatCurrency, formatDate, formatIndianNumber, cn } from '@/utils'
import { toast } from 'sonner'

// Sales Orders Page
export const SalesOrdersPage: React.FC = () => {
  const navigate = useNavigate()

  // State
  const [orders, setOrders] = useState<SalesOrder[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Filters & Pagination
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [customerFilter, setCustomerFilter] = useState<string>('')
  const [pagination, setPagination] = useState({ page: 1, per_page: 10, total: 0 })

  // Modal State
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<SalesOrder | null>(null)

  // Form State
  const [formData, setFormData] = useState({
    order_date: new Date().toISOString().split('T')[0],
    customer_id: '',
    manufacturing_unit_id: '',
    items: [] as { product_id: string; quantity: number; unit_price: number }[],
    shipping_address: '',
    remarks: '',
  })
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Fetch Data
  const fetchData = async () => {
    try {
      const [ordersRes, customersRes, productsRes] = await Promise.all([
        api.get<PaginatedResponse<SalesOrder>>('/sales/orders', {
          params: {
            page: pagination.page,
            per_page: pagination.per_page,
            search: searchTerm,
            status: statusFilter,
            customer_id: customerFilter,
          },
        }),
        api.get<Customer[]>('/customers'),
        api.get<Product[]>('/products'),
      ])

      setOrders(ordersRes.data.data || [])
      setPagination(ordersRes.data.meta || pagination)
      setCustomers(customersRes.data.data || [])
      setProducts(productsRes.data.data || [])
    } catch (error) {
      console.error('Failed to fetch data:', error)
      toast.error('Failed to load data')
    } finally {
      setIsLoading(false)
    }
  }

  // Load Data on Mount
  React.useEffect(() => {
    fetchData()
  }, [])

  // Refresh Data
  const handleRefresh = () => {
    setIsRefreshing(true)
    fetchData()
  }

  // Handle Search
  const handleSearch = () => {
    setPagination((prev) => ({ ...prev, page: 1 }))
    setIsLoading(true)
    fetchData()
  }

  // Handle Filter Change
  const handleFilterChange = () => {
    setPagination((prev) => ({ ...prev, page: 1 }))
    setIsLoading(true)
    fetchData()
  }

  // Add Item to Form
  const addItem = () => {
    setFormData((prev) => ({
      ...prev,
      items: [...prev.items, { product_id: '', quantity: 1, unit_price: 0 }],
    }))
  }

  // Update Item in Form
  const updateItem = (index: number, field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      ),
    }))
  }

  // Remove Item from Form
  const removeItem = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }))
  }

  // Validate Form
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}

    if (!formData.customer_id) {
      errors.customer_id = 'Customer is required'
    }

    if (!formData.manufacturing_unit_id) {
      errors.manufacturing_unit_id = 'Manufacturing unit is required'
    }

    if (formData.items.length === 0) {
      errors.items = 'At least one item is required'
    } else {
      formData.items.forEach((item, index) => {
        if (!item.product_id) {
          errors[`items_${index}_product_id`] = 'Product is required'
        }
        if (item.quantity <= 0) {
          errors[`items_${index}_quantity`] = 'Quantity must be greater than 0'
        }
        if (item.unit_price <= 0) {
          errors[`items_${index}_unit_price`] = 'Unit price must be greater than 0'
        }
      })
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Handle Create Order
  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      toast.error('Please fix errors in form')
      return
    }

    setIsSubmitting(true)
    try {
      const response = await api.post<SalesOrder>('/sales/orders', formData)
      setOrders((prev) => [response.data, ...prev])
      setShowCreateModal(false)
      toast.success('Sales order created successfully')
    } catch (error: any) {
      console.error('Create order error:', error)
      toast.error(error.message || 'Failed to create order')
    } finally {
      setIsSubmitting(false)
    }
  }

  // View Order
  const viewOrder = async (order: SalesOrder) => {
    setSelectedOrder(order)
    setShowViewModal(true)
  }

  // Print Order
  const printOrder = async (order: SalesOrder) => {
    try {
      window.open(`/api/v1/print/sales-order/${order.id}`, '_blank')
    } catch (error) {
      toast.error('Failed to print order')
    }
  }

  // Calculate Total
  const calculateTotal = () => {
    return formData.items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sales Orders</h1>
          <p className="text-gray-600">Manage your sales orders</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />}
            onClick={handleRefresh}
          >
            Refresh
          </Button>
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => setShowCreateModal(true)}
          >
            New Order
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card variant="bordered" padding="md">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <Input
              placeholder="Search by order number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              leftIcon={<Search className="w-5 h-5" />}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>

          {/* Status Filter */}
          <div className="w-full lg:w-48">
            <select
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value)
                handleFilterChange()
              }}
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {/* Customer Filter */}
          <div className="w-full lg:w-64">
            <select
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              value={customerFilter}
              onChange={(e) => {
                setCustomerFilter(e.target.value)
                handleFilterChange()
              }}
            >
              <option value="">All Customers</option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Orders Table */}
      <LoadingOverlay isLoading={isLoading || isRefreshing}>
        <Card variant="bordered" padding="none">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Order #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Order Date
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-semibold text-gray-900">{order.order_number}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-900">{order.customer?.name || '-'}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-600">{formatDate(order.order_date)}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="font-semibold text-gray-900">
                        {formatCurrency(order.total_amount)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <StatusBadge status={order.status} size="sm" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => viewOrder(order)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => printOrder(order)}
                        >
                          <Printer className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Empty State */}
          {orders.length === 0 && (
            <div className="py-12 text-center">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No orders found
              </h3>
              <p className="text-gray-600 mb-4">
                Get started by creating your first sales order
              </p>
              <Button
                variant="primary"
                leftIcon={<Plus className="w-4 h-4" />}
                onClick={() => setShowCreateModal(true)}
              >
                Create Order
              </Button>
            </div>
          )}
        </Card>
      </LoadingOverlay>

      {/* Create Order Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create Sales Order"
        size="xl"
      >
        <form onSubmit={handleCreateOrder}>
          <ModalBody>
            <div className="space-y-4">
              {/* Order Date */}
              <Input
                type="date"
                name="order_date"
                label="Order Date"
                value={formData.order_date}
                onChange={(e) => setFormData({ ...formData, order_date: e.target.value })}
                required
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Customer */}
                <div>
                  <label className="block mb-1.5 text-sm font-medium text-gray-700">
                    Customer <span className="text-error-600">*</span>
                  </label>
                  <select
                    className={cn(
                      "w-full px-4 py-2 rounded-lg border transition-all",
                      formErrors.customer_id
                        ? "border-error-500 focus:ring-error-500 focus:border-error-500"
                        : "border-gray-300 focus:ring-primary-500 focus:border-primary-500"
                    )}
                    value={formData.customer_id}
                    onChange={(e) => setFormData({ ...formData, customer_id: e.target.value })}
                  >
                    <option value="">Select Customer</option>
                    {customers.map((customer) => (
                      <option key={customer.id} value={customer.id}>
                        {customer.name}
                      </option>
                    ))}
                  </select>
                  {formErrors.customer_id && (
                    <p className="mt-1 text-sm text-error-600">{formErrors.customer_id}</p>
                  )}
                </div>

                {/* Manufacturing Unit */}
                <div>
                  <label className="block mb-1.5 text-sm font-medium text-gray-700">
                    Manufacturing Unit <span className="text-error-600">*</span>
                  </label>
                  <select
                    className={cn(
                      "w-full px-4 py-2 rounded-lg border transition-all",
                      formErrors.manufacturing_unit_id
                        ? "border-error-500 focus:ring-error-500 focus:border-error-500"
                        : "border-gray-300 focus:ring-primary-500 focus:border-primary-500"
                    )}
                    value={formData.manufacturing_unit_id}
                    onChange={(e) => setFormData({ ...formData, manufacturing_unit_id: e.target.value })}
                  >
                    <option value="">Select Unit</option>
                    <option value="1">Unit 1</option>
                    <option value="2">Unit 2</option>
                  </select>
                  {formErrors.manufacturing_unit_id && (
                    <p className="mt-1 text-sm text-error-600">{formErrors.manufacturing_unit_id}</p>
                  )}
                </div>
              </div>

              {/* Items */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Items</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    leftIcon={<Plus className="w-4 h-4" />}
                    onClick={addItem}
                  >
                    Add Item
                  </Button>
                </div>

                {formData.items.map((item, index) => (
                  <div key={index} className="p-4 border border-gray-200 rounded-lg mb-3">
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="font-medium text-gray-900">Item {index + 1}</h4>
                      {formData.items.length > 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItem(index)}
                        >
                          <Trash2 className="w-4 h-4 text-error-600" />
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {/* Product */}
                      <div>
                        <label className="block mb-1.5 text-sm font-medium text-gray-700">
                          Product <span className="text-error-600">*</span>
                        </label>
                        <select
                          className={cn(
                            "w-full px-3 py-2 rounded-lg border text-sm transition-all",
                            formErrors[`items_${index}_product_id`]
                              ? "border-error-500"
                              : "border-gray-300"
                          )}
                          value={item.product_id}
                          onChange={(e) => updateItem(index, 'product_id', e.target.value)}
                        >
                          <option value="">Select Product</option>
                          {products.map((product) => (
                            <option key={product.id} value={product.id}>
                              {product.name}
                            </option>
                          ))}
                        </select>
                        {formErrors[`items_${index}_product_id`] && (
                          <p className="mt-1 text-xs text-error-600">
                            {formErrors[`items_${index}_product_id`]}
                          </p>
                        )}
                      </div>

                      {/* Quantity */}
                      <div>
                        <Input
                          type="number"
                          label="Quantity"
                          value={item.quantity}
                          onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value))}
                          error={formErrors[`items_${index}_quantity`]}
                          min="0"
                          step="1"
                          required
                        />
                      </div>

                      {/* Unit Price */}
                      <div>
                        <Input
                          type="number"
                          label="Unit Price (₹)"
                          value={item.unit_price}
                          onChange={(e) => updateItem(index, 'unit_price', parseFloat(e.target.value))}
                          error={formErrors[`items_${index}_unit_price`]}
                          min="0"
                          step="0.01"
                          required
                        />
                      </div>
                    </div>
                  </div>
                ))}

                {formErrors.items && (
                  <p className="mt-2 text-sm text-error-600">{formErrors.items}</p>
                )}
              </div>

              {/* Shipping Address */}
              <div>
                <label className="block mb-1.5 text-sm font-medium text-gray-700">
                  Shipping Address
                </label>
                <textarea
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                  rows={3}
                  value={formData.shipping_address}
                  onChange={(e) => setFormData({ ...formData, shipping_address: e.target.value })}
                  placeholder="Enter shipping address"
                />
              </div>

              {/* Remarks */}
              <div>
                <label className="block mb-1.5 text-sm font-medium text-gray-700">
                  Remarks
                </label>
                <textarea
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                  rows={2}
                  value={formData.remarks}
                  onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                  placeholder="Enter remarks (optional)"
                />
              </div>
            </div>
          </ModalBody>

          <ModalFooter>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
              <div className="text-left">
                <p className="text-sm text-gray-600">Total Amount</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(calculateTotal())}
                </p>
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={isSubmitting}
                >
                  Create Order
                </Button>
              </div>
            </div>
          </ModalFooter>
        </form>
      </Modal>

      {/* View Order Modal */}
      <Modal
        isOpen={showViewModal}
        onClose={() => setShowViewModal(false)}
        title={`Order #${selectedOrder?.order_number}`}
        size="xl"
      >
        {selectedOrder && (
          <ModalBody>
            <div className="space-y-6">
              {/* Order Details */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Customer</p>
                  <p className="font-semibold text-gray-900">{selectedOrder.customer?.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Order Date</p>
                  <p className="font-semibold text-gray-900">{formatDate(selectedOrder.order_date)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <StatusBadge status={selectedOrder.status} />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Amount</p>
                  <p className="font-semibold text-gray-900">{formatCurrency(selectedOrder.total_amount)}</p>
                </div>
              </div>

              {/* Items Table */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Items</h3>
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase">
                        Product
                      </th>
                      <th className="px-4 py-2 text-right text-xs font-semibold text-gray-600 uppercase">
                        Quantity
                      </th>
                      <th className="px-4 py-2 text-right text-xs font-semibold text-gray-600 uppercase">
                        Unit Price
                      </th>
                      <th className="px-4 py-2 text-right text-xs font-semibold text-gray-600 uppercase">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {selectedOrder.items?.map((item) => (
                      <tr key={item.id}>
                        <td className="px-4 py-2">{item.product?.name}</td>
                        <td className="px-4 py-2 text-right">{item.quantity}</td>
                        <td className="px-4 py-2 text-right">{formatCurrency(item.unit_price)}</td>
                        <td className="px-4 py-2 text-right font-semibold">
                          {formatCurrency(item.total_amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-gray-50">
                      <td colSpan={3} className="px-4 py-2 text-right font-semibold">
                        Grand Total
                      </td>
                      <td className="px-4 py-2 text-right font-bold text-lg">
                        {formatCurrency(selectedOrder.grand_total || selectedOrder.total_amount)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Remarks */}
              {selectedOrder.remarks && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Remarks</h3>
                  <p className="text-gray-600">{selectedOrder.remarks}</p>
                </div>
              )}
            </div>
          </ModalBody>
        )}

        <ModalFooter>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => printOrder(selectedOrder!)}
              leftIcon={<Printer className="w-4 h-4" />}
            >
              Print
            </Button>
            <Button
              variant="primary"
              onClick={() => setShowViewModal(false)}
            >
              Close
            </Button>
          </div>
        </ModalFooter>
      </Modal>
    </div>
  )
}

export default SalesOrdersPage

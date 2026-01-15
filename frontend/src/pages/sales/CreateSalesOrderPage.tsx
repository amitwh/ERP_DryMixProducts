import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import {
  ArrowLeft,
  Plus,
  Minus,
  Search,
  Trash2,
} from 'lucide-react'

interface OrderItem {
  product_id?: number
  product_name?: string
  product_code?: string
  quantity: number
  uom: string
  unit_price: number
  total: number
}

export default function CreateSalesOrderPage() {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const [formData, setFormData] = useState({
    customer_id: '',
    order_date: new Date().toISOString().split('T')[0],
    delivery_date: '',
    payment_terms: 'Net 30 Days',
    delivery_terms: 'EXW Factory',
    delivery_address: '',
    notes: '',
  })

  const [items, setItems] = useState<OrderItem[]>([
    { quantity: 0, uom: 'MT', unit_price: 0, total: 0 },
  ])

  const [searchResults, setSearchResults] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedItemIndex, setSelectedItemIndex] = useState<number | null>(null)

  const calculateTotals = () => {
    const subtotal = items.reduce((sum, item) => sum + item.total, 0)
    const tax = subtotal * 0.18
    return { subtotal, tax, grandTotal: subtotal + tax }
  }

  const { subtotal, tax, grandTotal } = calculateTotals()

  const handleSearchProducts = async (term: string, index: number) => {
    setSearchTerm(term)
    setSelectedItemIndex(index)

    if (term.length < 2) {
      setSearchResults([])
      return
    }

    try {
      const response = await fetch(`/api/v1/products?search=${term}`)
      const data = await response.json()
      setSearchResults(data.data || [])
    } catch (err) {
      console.error('Failed to search products:', err)
    }
  }

  const handleSelectProduct = (product: any, index: number) => {
    const updatedItems = [...items]
    updatedItems[index] = {
      ...updatedItems[index],
      product_id: product.id,
      product_name: product.name,
      product_code: product.code,
      uom: product.uom,
      unit_price: product.price || 0,
      total: (updatedItems[index].quantity || 0) * (product.price || 0),
    }
    setItems(updatedItems)
    setSearchResults([])
    setSearchTerm('')
  }

  const handleItemChange = (index: number, field: keyof OrderItem, value: any) => {
    const updatedItems = [...items]
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: value,
    }

    if (field === 'quantity' || field === 'unit_price') {
      updatedItems[index].total = updatedItems[index].quantity * updatedItems[index].unit_price
    }

    setItems(updatedItems)
  }

  const handleAddItem = () => {
    setItems([...items, { quantity: 0, uom: 'MT', unit_price: 0, total: 0 }])
  }

  const handleRemoveItem = (index: number) => {
    if (items.length === 1) return
    setItems(items.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const response = await fetch('/api/v1/sales-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          items,
          subtotal,
          tax_amount: tax,
          grand_total: grandTotal,
        }),
      })

      const data = await response.json()
      if (data.success) {
        setSuccess(true)
        setTimeout(() => {
          navigate(`/sales/orders/${data.data.id}`)
        }, 2000)
      } else {
        setError(data.message || 'Failed to create sales order')
      }
    } catch (err) {
      setError('Failed to create sales order. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-8">
      {/* Header */}
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
              Create Sales Order
            </h1>
            <p className="text-gray-600">
              Create a new sales order for customer
            </p>
          </div>
        </div>
        <Button
          variant="primary"
          leftIcon={<Save className="w-4 h-4" />}
          onClick={handleSubmit}
          isLoading={isLoading}
        >
          Create Order
        </Button>
      </div>

      {/* Alerts */}
      {error && <Alert type="error" message={error} onDismiss={() => setError(null)} />}
      {success && (
        <Alert
          type="success"
          message="Sales order created successfully! Redirecting..."
          onDismiss={() => setSuccess(false)}
        />
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Customer Details */}
          <div className="lg:col-span-2 space-y-6">
            <Card variant="bordered" padding="lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Customer Information
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Customer *
                  </label>
                  <Input
                    type="select"
                    value={formData.customer_id}
                    onChange={(e) => setFormData({ ...formData, customer_id: e.target.value })}
                    required
                  >
                    <option value="">Select Customer</option>
                    <option value="1">ABC Construction Pvt Ltd</option>
                    <option value="2">XYZ Builders</option>
                    <option value="3">LMN Infrastructure</option>
                  </Input>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Order Date *
                  </label>
                  <Input
                    type="date"
                    value={formData.order_date}
                    onChange={(e) => setFormData({ ...formData, order_date: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Delivery Date
                  </label>
                  <Input
                    type="date"
                    value={formData.delivery_date}
                    onChange={(e) => setFormData({ ...formData, delivery_date: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Terms
                  </label>
                  <Input
                    type="select"
                    value={formData.payment_terms}
                    onChange={(e) => setFormData({ ...formData, payment_terms: e.target.value })}
                  >
                    <option value="Net 30 Days">Net 30 Days</option>
                    <option value="Net 60 Days">Net 60 Days</option>
                    <option value="Net 90 Days">Net 90 Days</option>
                    <option value="Advance 50%">Advance 50%</option>
                    <option value="Full Payment">Full Payment</option>
                  </Input>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Delivery Terms
                  </label>
                  <Input
                    type="select"
                    value={formData.delivery_terms}
                    onChange={(e) => setFormData({ ...formData, delivery_terms: e.target.value })}
                  >
                    <option value="EXW Factory">EXW Factory</option>
                    <option value="FOR Warehouse">FOR Warehouse</option>
                    <option value="CIF Location">CIF Location</option>
                    <option value="FOB Factory">FOB Factory</option>
                  </Input>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Delivery Address
                  </label>
                  <Input
                    type="textarea"
                    value={formData.delivery_address}
                    onChange={(e) => setFormData({ ...formData, delivery_address: e.target.value })}
                    placeholder="Enter delivery address..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes
                  </label>
                  <Input
                    type="textarea"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Enter any special instructions or notes..."
                  />
                </div>
              </div>
            </Card>

            {/* Order Items */}
            <Card variant="bordered" padding="lg">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Order Items
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<Plus className="w-4 h-4" />}
                  onClick={handleAddItem}
                >
                  Add Item
                </Button>
              </div>

              <div className="space-y-4">
                {items.map((item, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-gray-900">
                        Item {index + 1}
                      </h4>
                      {items.length > 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          leftIcon={<Trash2 className="w-4 h-4" />}
                          onClick={() => handleRemoveItem(index)}
                        >
                          Remove
                        </Button>
                      )}
                    </div>

                    {/* Product Search */}
                    <div className="relative">
                      <div className="flex items-center gap-2">
                        <Search className="w-4 h-4 text-gray-400" />
                        <Input
                          type="text"
                          placeholder="Search product..."
                          value={selectedItemIndex === index ? searchTerm : item.product_name || ''}
                          onChange={(e) => handleSearchProducts(e.target.value, index)}
                          className="flex-1"
                        />
                      </div>

                      {/* Search Results Dropdown */}
                      {selectedItemIndex === index && searchResults.length > 0 && (
                        <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                          {searchResults.map((product) => (
                            <div
                              key={product.id}
                              className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                              onClick={() => handleSelectProduct(product, index)}
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="font-semibold text-gray-900">{product.name}</p>
                                  <p className="text-sm text-gray-600">{product.code}</p>
                                </div>
                                <div className="text-right">
                                  <p className="font-semibold text-primary-600">
                                    ₹{Number(product.price).toFixed(2)}
                                  </p>
                                  <p className="text-sm text-gray-600">{product.uom}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Quantity *
                        </label>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(index, 'quantity', Number(e.target.value))}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Unit Price *
                        </label>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.unit_price}
                          onChange={(e) => handleItemChange(index, 'unit_price', Number(e.target.value))}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          UOM
                        </label>
                        <Input
                          type="text"
                          value={item.uom}
                          onChange={(e) => handleItemChange(index, 'uom', e.target.value)}
                          readOnly
                        />
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                      <span className="text-sm font-medium text-gray-600">Item Total</span>
                      <span className="text-lg font-bold text-gray-900">
                        ₹{Number(item.total).toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Right Column - Order Summary */}
          <div className="space-y-6">
            <Card variant="bordered" padding="lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Order Summary
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-semibold">₹{Number(subtotal).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax (18% GST)</span>
                  <span className="font-semibold">₹{Number(tax).toFixed(2)}</span>
                </div>
                <div className="border-t border-gray-200 pt-3 mt-3">
                  <div className="flex justify-between text-lg">
                    <span className="font-bold">Total</span>
                    <span className="font-bold text-primary-600">
                      ₹{Number(grandTotal).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </Card>

            <Card variant="bordered" padding="lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Quick Actions
              </h3>
              <div className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => navigate('/customers/create')}
                >
                  Add New Customer
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => navigate('/products')}
                >
                  View Product Catalog
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => navigate('/planning/production-plans')}
                >
                  Check Production Plan
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </form>
    </div>
  )
}

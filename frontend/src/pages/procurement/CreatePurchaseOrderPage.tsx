import React, { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Form } from '@/components/ui/Form'
import {
  ArrowLeft,
  Save,
  ShoppingCart,
  Truck,
  Search,
  Plus,
  Minus,
  Calculator,
  FileText,
} from 'lucide-react'

export default function CreatePurchaseOrderPage() {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const [formData, setFormData] = useState({
    supplier_id: '',
    po_number: `PO-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`,
    po_date: new Date().toISOString().split('T')[0],
    expected_delivery_date: '',
    currency: 'INR',
    payment_terms: 'Net 30 Days',
    delivery_terms: 'FOB Factory',
    billing_address: '',
    shipping_address: '',
    notes: '',
  })

  const [items, setItems] = useState([{
    item_id: '',
    item_code: '',
    quantity: 0,
    uom: 'MT',
    unit_price: 0,
    discount: 0,
    remarks: '',
  }])

  const [searchResults, setSearchResults] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState('')

  const supplierOptions = [
    { value: '1', label: 'UltraTech Cement Ltd' },
    { value: '2', label: 'ACC Limited' },
    { value: '3', label: 'Dalmia Bharat Cement' },
    { value: '4', label: 'JK Lakshmi Cement' },
  ]

  const itemOptions = [
    { value: '1', label: 'Ordinary Portland Cement (OPC)' },
    { value: '2', label: 'Portland Pozzolana Cement (PPC)' },
    { value: '3', label: 'Ordinary Portland Slag Cement (OPSC)' },
    { value: '4', label: 'Fine Aggregate (Sand)' },
    { value: '5', label: 'Coarse Aggregate (Gravel)' },
    { value: '6', label: 'Fly Ash' },
    { value: '7', label: 'Silica Fume' },
    { value: '8', label: 'Polymer Admixture' },
  ]

  const formFields = [
    {
      name: 'supplier_id',
      label: 'Supplier *',
      type: 'select' as const,
      options: supplierOptions,
      required: true,
    },
    {
      name: 'po_number',
      label: 'PO Number',
      type: 'text' as const,
      placeholder: 'Auto-generated',
      readonly: true,
    },
    {
      name: 'po_date',
      label: 'PO Date *',
      type: 'date' as const,
      required: true,
    },
    {
      name: 'expected_delivery_date',
      label: 'Expected Delivery Date',
      type: 'date' as const,
      required: true,
    },
    {
      name: 'currency',
      label: 'Currency',
      type: 'select' as const,
      options: [
        { value: 'INR', label: 'Indian Rupee (₹)' },
        { value: 'USD', label: 'US Dollar ($)' },
        { value: 'EUR', label: 'Euro (€)' },
      ],
      required: true,
    },
    {
      name: 'payment_terms',
      label: 'Payment Terms',
      type: 'select' as const,
      options: [
        { value: 'Net 30 Days', label: 'Net 30 Days' },
        { value: 'Net 60 Days', label: 'Net 60 Days' },
        { value: 'Advance 50%', label: 'Advance 50%' },
        { value: 'Full Payment', label: 'Full Payment' },
      ],
    },
    {
      name: 'delivery_terms',
      label: 'Delivery Terms',
      type: 'select' as const,
      options: [
        { value: 'FOB Factory', label: 'FOB Factory' },
        { value: 'FOR Warehouse', label: 'FOR Warehouse' },
        { value: 'CIF Location', label: 'CIF Location' },
        { value: 'FOB Factory', label: 'FOB Factory' },
        { value: 'EXW Factory', label: 'EXW Factory' },
      ],
      required: true,
    },
    {
      name: 'billing_address',
      label: 'Billing Address',
      type: 'textarea' as const,
      placeholder: 'Enter full billing address...',
      },
    {
      name: 'shipping_address',
      label: 'Shipping Address',
      type: 'textarea' as const,
      placeholder: 'Enter full shipping address...',
    },
    {
      name: 'notes',
      label: 'Notes',
      type: 'textarea' as const,
      placeholder: 'Enter any additional notes or instructions...',
    },
  ]

  const handleSearchItems = async (term: string, index: number) => {
    setSearchTerm(term)

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

  const handleSelectItem = (product: any, index: number) => {
    const updatedItems = [...items]
    updatedItems[index] = {
      ...updatedItems[index],
      item_id: product.id,
      item_code: product.code,
      item_name: product.name,
      uom: product.uom || 'MT',
      unit_price: product.price || 0,
    }
    }
    setItems(updatedItems)
    setSearchResults([])
    setSearchTerm('')
  }

  const handleItemChange = (index: number, field: string, value: any) => {
    const updatedItems = [...items]
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: value,
    }

    if (field === 'quantity' || field === 'unit_price' || field === 'discount') {
      updatedItems[index].total = Number(updatedItems[index].quantity) * Number(updatedItems[index].unit_price) - Number(updatedItems[index].discount)
    }

    setItems(updatedItems)
  }

  const handleAddItem = () => {
    setItems([...items, {
      item_id: '',
      item_code: '',
      quantity: 0,
      uom: 'MT',
      unit_price: 0,
      discount: 0,
      remarks: '',
    }])
  }

  const handleRemoveItem = (index: number) => {
    if (items.length === 1) return
    setItems(items.filter((_, i) => i !== index))
  }

  const calculateTotals = () => {
    const subtotal = items.reduce((sum, item) => sum + (item.total || 0), 0)
    const tax = subtotal * 0.18
    const grandTotal = subtotal + tax
    return { subtotal, tax, grandTotal }
  }

  const { subtotal, tax, grandTotal } = calculateTotals()

  const handleSubmit = async (data: any) => {
    setIsLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const response = await fetch('/api/v1/purchase-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          items,
          subtotal,
          tax_amount: tax,
          grand_total,
        }),
      })

      const result = await response.json()
      if (result.success) {
        setSuccess(true)
        setTimeout(() => {
          navigate(`/procurement/purchase-orders/${result.data.id}`)
        }, 2000)
      } else {
        setError(result.message || 'Failed to create purchase order')
      }
    } catch (err) {
      setError('Failed to create purchase order. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-8">
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
            <h1 className="text-2xl font-bold text-gray-900">Create Purchase Order</h1>
            <p className="text-gray-600">
              Create a new purchase order for supplier
            </p>
          </div>
        </div>
        <Button
          variant="primary"
          leftIcon={<Save className="w-4 h-4" />}
          onClick={handleSubmit}
          isLoading={isLoading}
          disabled={items.length === 0}
        >
          Create PO
        </Button>
      </div>

      {error && <Alert type="error" message={error} onDismiss={() => setError(null)} />}
      {success && (
        <Alert
          type="success"
          message="Purchase order created successfully! Redirecting..."
          onDismiss={() => setSuccess(false)}
        />
      )}

      <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card variant="bordered" padding="lg">
              <div className="flex items-center gap-3 mb-6">
                <ShoppingCart className="w-6 h-6 text-primary-600" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Supplier Information
                </h3>
              </div>
              <div className="space-y-4">
                {formFields.slice(0, 7).map((field) => (
                  <Input
                    key={field.name}
                    name={field.name}
                    type={field.type}
                    label={field.label}
                    placeholder={field.placeholder}
                    value={formData[field.name as keyof typeof formData] as string}
                    onChange={(e) => setFormData({
                      ...formData,
                      [field.name]: e.target.value,
                    })}
                    options={field.options}
                    required={field.required}
                    readonly={field.readonly}
                  />
                ))}
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            <Card variant="bordered" padding="lg">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  Order Items ({items.length})
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<Plus className="w-4 h-4" />}
                  onClick={handleAddItem}
                  disabled={items.length >= 10}
                >
                  Add Item
                </Button>
              </div>

              {items.map((item, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 space-y-4">
                  <div className="flex justify-end">
                    {index > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        leftIcon={<Minus className="w-4 h-4 text-error-600" />}
                        onClick={() => handleRemoveItem(index)}
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="relative">
                      <div className="flex items-center gap-2">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search product..."
                          value={searchTerm}
                          onChange={(e) => handleSearchItems(e.target.value, index)}
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                      </div>
                      {searchResults.length > 0 && searchTerm.length >= 2 && (
                        <div className="absolute z-50 mt-12 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                          {searchResults.map((product) => (
                            <div
                              key={product.id}
                              className="p-3 hover:bg-gray-50 cursor-pointer"
                              onClick={() => handleSelectItem(product, index)}
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="font-semibold text-gray-900">{product.name}</p>
                                  <p className="text-sm text-gray-600">{product.code}</p>
                                </div>
                                <div className="text-right">
                                  <p className="font-semibold text-primary-600">₹{Number(product.price).toFixed(2)}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <Input
                      name="item_code"
                      type="text"
                      label="Item Code"
                      value={item.item_code}
                      onChange={(e) => handleItemChange(index, 'item_code', e.target.value)}
                      readonly
                    />
                    <Input
                      name="item_name"
                      type="text"
                      label="Item Name"
                      value={item.item_name}
                      onChange={(e) => handleItemChange(index, 'item_name', e.target.value)}
                      readonly
                    />
                    <Input
                      name="quantity"
                      type="number"
                      label="Quantity *"
                      placeholder="0"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                      required
                    />
                    <Input
                      name="uom"
                      type="text"
                      label="UOM"
                      placeholder="MT"
                      value={item.uom}
                      onChange={(e) => handleItemChange(index, 'uom', e.target.value)}
                    />
                    <Input
                      name="unit_price"
                      type="number"
                      label="Unit Price (₹) *"
                      placeholder="0.00"
                      value={item.unit_price}
                      onChange={(e) => handleItemChange(index, 'unit_price', e.target.value)}
                      required
                    />
                    <Input
                      name="discount"
                      type="number"
                      label="Discount (₹)"
                      placeholder="0.00"
                      value={item.discount}
                      onChange={(e) => handleItemChange(index, 'discount', e.target.value)}
                    />
                  </div>
                  <div className="col-span-3">
                    <Input
                      name="remarks"
                      type="textarea"
                      label="Remarks"
                      placeholder="Enter any notes..."
                      rows={3}
                      value={item.remarks}
                      onChange={(e) => handleItemChange(index, 'remarks', e.target.value)}
                    />
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600 mb-1">Line Total</p>
                    <p className="text-lg font-bold text-gray-900">₹{Number(item.total).toFixed(2)}</p>
                  </div>
                </div>
              </div>
            ))}
              </Card>
          </div>
        </div>

        <div className="lg:col-span-1 space-y-6">
          <Card variant="bordered" padding="lg">
            <div className="flex items-center gap-3 mb-6">
              <Calculator className="w-6 h-6 text-primary-600" />
              <h3 className="text-lg font-semibold text-gray-900">
                Order Summary
              </h3>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Subtotal</span>
                <span className="font-semibold text-gray-900">₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Tax (18% GST)</span>
                <span className="font-semibold text-gray-900">₹{tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between pt-4 border-t border-gray-200">
                <span className="text-lg font-bold text-gray-900">Total</span>
                <span className="text-lg font-bold text-primary-600">
                  ₹{grandTotal.toFixed(2)}
                </span>
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
                leftIcon={<ShoppingCart className="w-4 h-4" />}
                onClick={() => navigate('/procurement/suppliers')}
              >
                Manage Suppliers
              </Button>
              <Button
                variant="outline"
                className="w-full"
                leftIcon={<Truck className="w-4 h-4" />}
                onClick={() => navigate('/procurement/grns')}
              >
                View GRNs
              </Button>
              <Button
                variant="outline"
                className="w-full"
                leftIcon={<FileText className="w-4 h-4" />}
                onClick={() => navigate('/procurement/products')}
              >
                View Products
              </Button>
            </div>
          </Card>
        </div>
      </form>
    </div>
  )
}

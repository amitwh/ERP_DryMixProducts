import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { api } from '@/services/api'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Skeleton } from '@/components/ui/Loading'
import { ArrowLeft, Save, DollarSign, FileText, CreditCard } from 'lucide-react'
import { formatCurrency } from '@/utils'

interface Customer {
  id: number
  name: string
  customer_code: string
  outstanding_balance: number
}

interface Invoice {
  id: number
  invoice_number: string
  total_amount: number
  balance_due: number
  invoice_date: string
  due_date: string
}

export const CreateCollectionPage: React.FC = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [customers, setCustomers] = useState<Customer[]>([])
  const [invoices, setInvoices] = useState<Invoice[]>([])

  const [formData, setFormData] = useState({
    customer_id: '',
    amount: '',
    payment_method: 'bank_transfer',
    reference_number: '',
    collection_date: new Date().toISOString().split('T')[0],
    notes: '',
    selected_invoices: [] as number[],
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    fetchCustomers()
  }, [])

  useEffect(() => {
    if (formData.customer_id) {
      fetchInvoices(parseInt(formData.customer_id))
    } else {
      setInvoices([])
    }
  }, [formData.customer_id])

  const fetchCustomers = async () => {
    try {
      setIsLoading(true)
      const response = await api.get<{ data: Customer[] }>('/customers', {
        params: { organization_id: user?.organizationId, has_outstanding: true },
      })
      setCustomers(response.data.data || [])
    } catch (error) {
      console.error('Failed to fetch customers:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchInvoices = async (customerId: number) => {
    try {
      const response = await api.get<{ data: Invoice[] }>(`/customers/${customerId}/invoices`, {
        params: { organization_id: user?.organizationId, outstanding_only: true },
      })
      setInvoices(response.data.data || [])
    } catch (error) {
      console.error('Failed to fetch invoices:', error)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }

  const handleInvoiceToggle = (invoiceId: number) => {
    setFormData((prev) => ({
      ...prev,
      selected_invoices: prev.selected_invoices.includes(invoiceId)
        ? prev.selected_invoices.filter((id) => id !== invoiceId)
        : [...prev.selected_invoices, invoiceId],
    }))
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    if (!formData.customer_id) newErrors.customer_id = 'Customer is required'
    if (!formData.amount || parseFloat(formData.amount) <= 0) newErrors.amount = 'Valid amount is required'
    if (!formData.collection_date) newErrors.collection_date = 'Collection date is required'
    if (formData.payment_method === 'cheque' && !formData.reference_number) {
      newErrors.reference_number = 'Cheque number is required'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    try {
      setIsSubmitting(true)
      await api.post('/credit-control/collections', {
        ...formData,
        organization_id: user?.organizationId,
        customer_id: parseInt(formData.customer_id),
        amount: parseFloat(formData.amount),
      })
      navigate('/credit-control/collections')
    } catch (error: any) {
      console.error('Failed to create collection:', error)
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const selectedCustomer = customers.find((c) => c.id === parseInt(formData.customer_id))

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Record Collection</h1>
          <p className="text-gray-600">Record a new payment collection</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card variant="bordered" padding="lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Collection Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} height={40} className="rounded" />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Customer *</label>
                      <select
                        name="customer_id"
                        value={formData.customer_id}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 ${
                          errors.customer_id ? 'border-red-500' : 'border-gray-300'
                        }`}
                      >
                        <option value="">Select Customer</option>
                        {customers.map((customer) => (
                          <option key={customer.id} value={customer.id}>
                            {customer.customer_code} - {customer.name} ({formatCurrency(customer.outstanding_balance)} outstanding)
                          </option>
                        ))}
                      </select>
                      {errors.customer_id && <p className="text-sm text-red-600 mt-1">{errors.customer_id}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Amount *</label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                          <Input
                            type="number"
                            name="amount"
                            value={formData.amount}
                            onChange={handleInputChange}
                            placeholder="0.00"
                            className={`pl-8 ${errors.amount ? 'border-red-500' : ''}`}
                            step="0.01"
                            min="0"
                          />
                        </div>
                        {errors.amount && <p className="text-sm text-red-600 mt-1">{errors.amount}</p>}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Collection Date *</label>
                        <Input
                          type="date"
                          name="collection_date"
                          value={formData.collection_date}
                          onChange={handleInputChange}
                          className={errors.collection_date ? 'border-red-500' : ''}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method *</label>
                        <select
                          name="payment_method"
                          value={formData.payment_method}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                        >
                          <option value="cash">Cash</option>
                          <option value="bank_transfer">Bank Transfer</option>
                          <option value="cheque">Cheque</option>
                          <option value="upi">UPI</option>
                          <option value="card">Card</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Reference Number</label>
                        <Input
                          type="text"
                          name="reference_number"
                          value={formData.reference_number}
                          onChange={handleInputChange}
                          placeholder="Cheque/Transaction number"
                          className={errors.reference_number ? 'border-red-500' : ''}
                        />
                        {errors.reference_number && <p className="text-sm text-red-600 mt-1">{errors.reference_number}</p>}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                      <textarea
                        name="notes"
                        value={formData.notes}
                        onChange={handleInputChange}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                        placeholder="Add any notes or remarks..."
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {formData.customer_id && invoices.length > 0 && (
              <Card variant="bordered" padding="lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Apply to Invoices
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {invoices.map((invoice) => (
                      <label
                        key={invoice.id}
                        className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                          formData.selected_invoices.includes(invoice.id)
                            ? 'border-primary-500 bg-primary-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={formData.selected_invoices.includes(invoice.id)}
                            onChange={() => handleInvoiceToggle(invoice.id)}
                            className="w-4 h-4 text-primary-600 rounded"
                          />
                          <div>
                            <p className="font-medium text-gray-900">{invoice.invoice_number}</p>
                            <p className="text-sm text-gray-500">
                              Due: {new Date(invoice.due_date).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">{formatCurrency(invoice.balance_due)}</p>
                          <p className="text-xs text-gray-500">Balance Due</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="space-y-6">
            <Card variant="bordered" padding="lg">
              <CardHeader>
                <CardTitle>Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {selectedCustomer && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Customer</span>
                        <span className="font-medium">{selectedCustomer.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Outstanding</span>
                        <span className="font-medium">{formatCurrency(selectedCustomer.outstanding_balance)}</span>
                      </div>
                    </>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Collection Amount</span>
                    <span className="font-semibold text-lg">{formatCurrency(parseFloat(formData.amount) || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment Method</span>
                    <span className="font-medium capitalize">{formData.payment_method.replace('_', ' ')}</span>
                  </div>

                  <div className="pt-4 border-t">
                    <Button type="submit" variant="primary" className="w-full" disabled={isSubmitting} leftIcon={<Save className="w-4 h-4" />}>
                      {isSubmitting ? 'Recording...' : 'Record Collection'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  )
}

export default CreateCollectionPage

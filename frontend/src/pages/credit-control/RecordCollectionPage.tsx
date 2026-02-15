import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Alert } from '@/components/ui/Alert'
import { ArrowLeft, CheckCircle2, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import creditControlService from '@/services/credit-control.service'
import { useMutation, useQuery } from '@tanstack/react-query'

// Types
interface Customer {
  id: number
  name: string
  code: string
  email?: string
  phone?: string
}

interface Invoice {
  id: number
  invoice_number: string
  invoice_date: string
  due_date: string
  total_amount: number
  balance_amount: number
}

// Record Collection Page
export const RecordCollectionPage: React.FC = () => {
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    customer_id: '',
    invoice_id: '',
    amount: '',
    payment_method: 'cash',
    reference_number: '',
    collection_date: new Date().toISOString().split('T')[0],
    notes: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)

  // Fetch customers with pending collections
  const { data: customersData, isLoading: customersLoading } = useQuery({
    queryKey: ['customers-with-pending-collections'],
    queryFn: async () => {
      const response = await creditControlService.getCollections({
        status: 'pending',
      })
      // Extract unique customers from collections
      const collections = response.data || []
      const uniqueCustomers = Array.from(
        new Map(
          collections.map((c: any) => [
            c.customer_id,
            {
              id: c.customer_id,
              name: c.customer_name,
              code: c.customer_code,
            },
          ])
        ).values()
      )
      return uniqueCustomers as Customer[]
    },
    enabled: true,
  })

  const customers: Customer[] = customersData || []

  // Fetch pending invoices for selected customer
  const { data: invoicesData } = useQuery({
    queryKey: ['customer-invoices', formData.customer_id],
    queryFn: async () => {
      const response = await creditControlService.getCollections({
        customer_id: formData.customer_id,
        status: 'pending',
      })
      return response.data || []
    },
    enabled: !!formData.customer_id,
  })

  const invoices: Invoice[] = invoicesData || []

  // Create collection mutation
  const createCollectionMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      return creditControlService.createCollection(data)
    },
    onSuccess: () => {
      toast.success('Collection recorded successfully')
      navigate('/credit-control/collections')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to record collection')
    },
  })

  // Handle customer change
  const handleCustomerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const customerId = e.target.value
    setFormData({ ...formData, customer_id: customerId, invoice_id: '', amount: '' })
    setSelectedInvoice(null)

    const customer = customers.find((c) => c.id === Number(customerId))
    setSelectedCustomer(customer || null)

    // Auto-fill amount if only one invoice
    if (invoicesData && invoicesData.length === 1) {
      const invoice = invoicesData[0]
      setFormData((prev) => ({
        ...prev,
        invoice_id: String(invoice.id),
        amount: String(invoice.balance_amount),
      }))
      setSelectedInvoice(invoice)
    }
  }

  // Handle invoice change
  const handleInvoiceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const invoiceId = e.target.value
    setFormData({ ...formData, invoice_id: invoiceId })

    const invoice = invoices.find((i) => i.id === Number(invoiceId))
    if (invoice) {
      setSelectedInvoice(invoice)
      setFormData((prev) => ({ ...prev, amount: String(invoice.balance_amount) }))
    }
  }

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.customer_id) {
      newErrors.customer_id = 'Customer is required'
    }
    if (!formData.invoice_id) {
      newErrors.invoice_id = 'Invoice is required'
    }
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Valid amount is required'
    }
    if (selectedInvoice && parseFloat(formData.amount) > selectedInvoice.balance_amount) {
      newErrors.amount = `Amount cannot exceed balance (${selectedInvoice.balance_amount})`
    }
    if (!formData.payment_method) {
      newErrors.payment_method = 'Payment method is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      toast.error('Please fix the errors in the form')
      return
    }

    createCollectionMutation.mutate(formData)
  }

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(amount)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/credit-control/collections')}
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Record Collection</h1>
          <p className="text-gray-600">
            Record a payment collection from a customer
          </p>
        </div>
      </div>

      {/* Summary Card (if customer and invoice selected) */}
      {selectedCustomer && selectedInvoice && (
        <Alert
          type="info"
          title={selectedCustomer.name}
          message={`Invoice: ${selectedInvoice.invoice_number} | Due: ${selectedInvoice.due_date} | Balance: ${formatCurrency(selectedInvoice.balance_amount)}`}
        />
      )}

      {/* Form Card */}
      <Card variant="shadow" className="max-w-2xl">
        <CardHeader>
          <CardTitle>Collection Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Customer *</label>
              {customersLoading ? (
                <div className="flex items-center gap-2 text-gray-500">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Loading customers...
                </div>
              ) : (
                <select
                  name="customer_id"
                  value={formData.customer_id}
                  onChange={handleCustomerChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  required
                >
                  <option value="">Select a customer</option>
                  {customers.map((c) => (
                    <option key={c.id} value={String(c.id)}>{c.name} ({c.code})</option>
                  ))}
                </select>
              )}
              {errors.customer_id && <p className="mt-1 text-sm text-red-600">{errors.customer_id}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Invoice *</label>
              <select
                name="invoice_id"
                value={formData.invoice_id}
                onChange={handleInvoiceChange}
                disabled={!formData.customer_id}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:opacity-50"
                required
              >
                <option value="">Select an invoice</option>
                {invoices.map((i) => (
                  <option key={i.id} value={String(i.id)}>
                    {i.invoice_number} - Due: {i.due_date} - Balance: {formatCurrency(i.balance_amount)}
                  </option>
                ))}
              </select>
              {errors.invoice_id && <p className="mt-1 text-sm text-red-600">{errors.invoice_id}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Payment Amount *</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                <Input
                  name="amount"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={handleChange}
                  className="pl-8"
                  required
                />
              </div>
              {selectedInvoice && (
                <p className="text-sm text-gray-500 mt-1">
                  Outstanding balance: {formatCurrency(selectedInvoice.balance_amount)}
                </p>
              )}
              {errors.amount && <p className="mt-1 text-sm text-red-600">{errors.amount}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method *</label>
              <select
                name="payment_method"
                value={formData.payment_method}
                onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                required
              >
                <option value="cash">Cash</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="cheque">Cheque</option>
                <option value="card">Credit/Debit Card</option>
                <option value="upi">UPI</option>
                <option value="online">Online Payment</option>
              </select>
              {errors.payment_method && <p className="mt-1 text-sm text-red-600">{errors.payment_method}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Reference Number</label>
              <Input
                name="reference_number"
                placeholder="Transaction ID, Cheque number, etc."
                value={formData.reference_number}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Collection Date *</label>
              <Input
                name="collection_date"
                type="date"
                value={formData.collection_date}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <Input
                name="notes"
                placeholder="Add any additional notes..."
                value={formData.notes}
                onChange={handleChange}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/credit-control/collections')}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                isLoading={createCollectionMutation.isPending}
                leftIcon={!createCollectionMutation.isPending ? <CheckCircle2 className="w-5 h-5" /> : undefined}
              >
                Record Collection
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default RecordCollectionPage

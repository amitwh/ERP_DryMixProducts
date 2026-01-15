import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Form } from '@/components/ui/Form'
import {
  ArrowLeft,
  Save,
  Package,
  MapPin,
  Phone,
  Mail as MailIcon,
  Calendar,
} from 'lucide-react'

export default function CreateInvoicePage() {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    sales_order_id: '',
    invoice_number: `INV-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`,
    invoice_date: new Date().toISOString().split('T')[0],
    due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    notes: '',
    terms: 'Payment due within 30 days',
  })

  const formFields = [
    {
      name: 'sales_order_id',
      label: 'Sales Order',
      type: 'select' as const,
      options: [
        { value: '1', label: 'SO-2026-001' },
        { value: '2', label: 'SO-2026-002' },
        { value: '3', label: 'SO-2026-003' },
      ],
      required: true,
    },
    {
      name: 'invoice_number',
      label: 'Invoice Number',
      type: 'text' as const,
      placeholder: 'Auto-generated',
      readonly: true,
    },
    {
      name: 'invoice_date',
      label: 'Invoice Date',
      type: 'date' as const,
      required: true,
    },
    {
      name: 'due_date',
      label: 'Due Date',
      type: 'date' as const,
      required: true,
    },
    {
      name: 'notes',
      label: 'Notes',
      type: 'textarea' as const,
      placeholder: 'Enter any additional notes...',
    },
    {
      name: 'terms',
      label: 'Payment Terms',
      type: 'textarea' as const,
      placeholder: 'Enter payment terms...',
    },
  ]

  const handleSubmit = async (data: any) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/v1/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const result = await response.json()
      if (result.success) {
        alert('Invoice created successfully!')
        navigate(`/sales/invoices/${result.data.id}`)
      } else {
        setError(result.message || 'Failed to create invoice')
      }
    } catch (err) {
      setError('Failed to create invoice. Please try again.')
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
            onClick={() => navigate('/sales/invoices')}
          >
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Create Invoice
            </h1>
            <p className="text-gray-600">
              Create a new customer invoice
            </p>
          </div>
        </div>
        <Button
          variant="primary"
          leftIcon={<Save className="w-4 h-4" />}
          onClick={() => {/* Will be handled by Form component */}}
        >
          Create Invoice
        </Button>
      </div>

      {error && (
        <Alert type="error" message={error} onDismiss={() => setError(null)} />
      )}

      <Form
        fields={formFields}
        defaultValues={formData}
        onSubmit={handleSubmit}
        submitButtonText="Create Invoice"
        submitLoading={isLoading}
        onCancel={() => navigate('/sales/invoices')}
      />
    </div>
  )
}

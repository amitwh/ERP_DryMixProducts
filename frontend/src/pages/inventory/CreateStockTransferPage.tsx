import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Form } from '@/components/ui/Form'
import {
  ArrowLeft,
  Save,
  Truck,
  Warehouse,
  MapPin,
  Calendar,
  FileText,
} from 'lucide-react'

export default function CreateStockTransferPage() {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    transfer_number: `TR-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`,
    transfer_date: new Date().toISOString().split('T')[0],
    from_warehouse_id: '',
    to_warehouse_id: '',
    item_id: '',
    quantity: '',
    remarks: '',
    reference_number: '',
    approved_by: '',
  })

  const formFields = [
    {
      name: 'transfer_number',
      label: 'Transfer Number',
      type: 'text' as const,
      placeholder: 'Auto-generated',
      readonly: true,
    },
    {
      name: 'transfer_date',
      label: 'Transfer Date',
      type: 'date' as const,
      required: true,
    },
    {
      name: 'from_warehouse_id',
      label: 'From Warehouse',
      type: 'select' as const,
      options: [
        { value: '1', label: 'Main Warehouse - Factory 1' },
        { value: '2', label: 'Main Warehouse - Factory 2' },
        { value: '3', label: 'Raw Material Warehouse' },
        { value: '4', label: 'Finished Goods Warehouse' },
      ],
      required: true,
    },
    {
      name: 'to_warehouse_id',
      label: 'To Warehouse',
      type: 'select' as const,
      options: [
        { value: '1', label: 'Main Warehouse - Factory 1' },
        { value: '2', label: 'Main Warehouse - Factory 2' },
        { value: '3', label: 'Raw Material Warehouse' },
        { value: '4', label: 'Finished Goods Warehouse' },
      ],
      required: true,
    },
    {
      name: 'item_id',
      label: 'Item',
      type: 'select' as const,
      options: [
        { value: '1', label: 'White Cement - WC-001' },
        { value: '2', label: 'Red Oxide - RO-002' },
        { value: '3', label: 'Polymer Admixture - PA-003' },
        { value: '4', label: 'Sand - SN-001' },
        { value: '5', label: 'Gravel - GV-001' },
      ],
      required: true,
    },
    {
      name: 'quantity',
      label: 'Quantity',
      type: 'number' as const,
      placeholder: 'Enter quantity',
      required: true,
    },
    {
      name: 'reference_number',
      label: 'Reference Number',
      type: 'text' as const,
      placeholder: 'e.g., PO number or project code',
    },
    {
      name: 'approved_by',
      label: 'Approved By',
      type: 'select' as const,
      options: [
        { value: '1', label: 'Warehouse Manager' },
        { value: '2', label: 'Store Manager' },
        { value: '3', label: 'Production Manager' },
      ],
      required: true,
    },
    {
      name: 'remarks',
      label: 'Remarks',
      type: 'textarea' as const,
      placeholder: 'Enter any additional notes...',
    },
  ]

  const handleSubmit = async (data: any) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/v1/inventory/transfers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const result = await response.json()
      if (result.success) {
        alert('Stock transfer created successfully!')
        navigate('/inventory/transfers')
      } else {
        setError(result.message || 'Failed to create transfer')
      }
    } catch (err) {
      setError('Failed to create transfer. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<ArrowLeft className="w-4 h-4" />}
            onClick={() => navigate('/inventory/transfers')}
          >
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Create Stock Transfer</h1>
            <p className="text-gray-600">Transfer stock between warehouses</p>
          </div>
        </div>
        <Button
          variant="primary"
          leftIcon={<Save className="w-4 h-4" />}
          onClick={handleSubmit}
          isLoading={isLoading}
        >
          Create Transfer
        </Button>
      </div>

      {error && (
        <Alert type="error" message={error} onDismiss={() => setError(null)} />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <Card variant="bordered" padding="lg">
            <div className="flex items-center gap-3 mb-6">
              <Truck className="w-6 h-6 text-primary-600" />
              <h3 className="text-lg font-semibold text-gray-900">
                Transfer Information
              </h3>
            </div>
            <div className="space-y-4">
              {formFields.slice(0, 6).map((field) => (
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

          <Card variant="bordered" padding="lg">
            <div className="flex items-center gap-3 mb-6">
              <MapPin className="w-6 h-6 text-warning-600" />
              <h3 className="text-lg font-semibold text-gray-900">
                Additional Details
              </h3>
            </div>
            <div className="space-y-4">
              {formFields.slice(6).map((field) => (
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
                />
              ))}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card variant="bordered" padding="lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Quick Notes
            </h3>
            <div className="space-y-3 text-sm text-gray-600">
              <p>• Verify stock availability before transfer</p>
              <p>• Ensure receiving warehouse has space</p>
              <p>• Transfer requires approval from designated person</p>
              <p>• Track transfer in inventory movements</p>
            </div>
          </Card>

          <Card variant="bordered" padding="lg">
            <div className="space-y-4">
              <Button
                variant="outline"
                className="w-full"
                leftIcon={<Warehouse className="w-4 h-4" />}
                onClick={() => navigate('/inventory/warehouses')}
              >
                Manage Warehouses
              </Button>
              <Button
                variant="outline"
                className="w-full"
                leftIcon={<Calendar className="w-4 h-4" />}
                onClick={() => navigate('/inventory/movements')}
              >
                View Stock Movements
              </Button>
            </div>
          </Card>

          <Card variant="bordered" padding="lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Transfer Approval
            </h3>
            <div className="space-y-3">
              <p className="text-sm text-gray-600">
                The transfer will be created in "Pending" status.
              </p>
              <p className="text-sm text-gray-600">
                The approved person must approve the transfer before stock is moved.
              </p>
              <p className="text-sm text-gray-600">
                Both source and destination warehouses will be notified.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

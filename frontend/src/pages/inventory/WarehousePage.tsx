import React, { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import {
  ArrowLeft,
  Save,
  Warehouse,
  MapPin,
  Package,
  User,
  Phone,
  Mail as MailIcon,
} from 'lucide-react'

export default function WarehousePage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [isEditing, setIsEditing] = useState(id !== undefined)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const [formData, setFormData] = useState({
    warehouse_name: '',
    warehouse_code: `WH-${String(Date.now()).slice(-4)}`,
    location: '',
    address: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'India',
    contact_person: '',
    contact_phone: '',
    contact_email: '',
    capacity: '',
    manager_id: '',
    warehouse_type: 'main',
    status: 'active',
    description: '',
    is_default: false,
  })

  const formFields = [
    {
      name: 'warehouse_name',
      label: 'Warehouse Name *',
      type: 'text' as const,
      placeholder: 'Enter warehouse name',
      required: true,
    },
    {
      name: 'warehouse_code',
      label: 'Warehouse Code',
      type: 'text' as const,
      placeholder: 'Enter warehouse code',
    },
    {
      name: 'warehouse_type',
      label: 'Warehouse Type',
      type: 'select' as const,
      options: [
        { value: 'main', label: 'Main Warehouse' },
        { value: 'raw_material', label: 'Raw Material Warehouse' },
        { value: 'finished_goods', label: 'Finished Goods Warehouse' },
        { value: 'cold_storage', label: 'Cold Storage' },
        { value: 'outdoor', label: 'Outdoor Storage' },
      ],
      required: true,
    },
    {
      name: 'location',
      label: 'Location/Address *',
      type: 'text' as const,
      placeholder: 'Enter full address',
      required: true,
    },
    {
      name: 'city',
      label: 'City',
      type: 'text' as const,
      placeholder: 'Enter city',
    },
    {
      name: 'state',
      label: 'State',
      type: 'select' as const,
      options: [
        { value: 'MH', label: 'Maharashtra' },
        { value: 'GJ', label: 'Gujarat' },
        { value: 'KA', label: 'Karnataka' },
        { value: 'TN', label: 'Tamil Nadu' },
        { value: 'DL', label: 'Delhi' },
        { value: 'UP', label: 'Uttar Pradesh' },
        { value: 'WB', label: 'West Bengal' },
      ],
    },
    {
      name: 'postal_code',
      label: 'Postal Code',
      type: 'text' as const,
      placeholder: 'Enter postal code',
    },
    {
      name: 'capacity',
      label: 'Capacity (MT)',
      type: 'number' as const,
      placeholder: 'Enter warehouse capacity',
    },
    {
      name: 'contact_person',
      label: 'Contact Person',
      type: 'text' as const,
      placeholder: 'Enter contact person name',
    },
    {
      name: 'contact_phone',
      label: 'Contact Phone',
      type: 'text' as const,
      placeholder: 'Enter phone number',
    },
    {
      name: 'contact_email',
      label: 'Contact Email',
      type: 'email' as const,
      placeholder: 'Enter email address',
    },
    {
      name: 'manager_id',
      label: 'Warehouse Manager',
      type: 'select' as const,
      options: [
        { value: '1', label: 'John Smith' },
        { value: '2', label: 'Jane Doe' },
        { value: '3', label: 'Mike Johnson' },
      ],
    },
    {
      name: 'status',
      label: 'Status',
      type: 'select' as const,
      options: [
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' },
        { value: 'under_maintenance', label: 'Under Maintenance' },
      ],
    },
    {
      name: 'is_default',
      label: 'Set as Default Warehouse',
      type: 'checkbox' as const,
    },
    {
      name: 'description',
      label: 'Description',
      type: 'textarea' as const,
      placeholder: 'Enter warehouse description...',
    },
  ]

  const handleSubmit = async (data: any) => {
    setIsLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const response = await fetch(isEditing && id
        ? `/api/v1/inventory/warehouses/${id}`
        : '/api/v1/inventory/warehouses', {
        method: isEditing && id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const result = await response.json()
      if (result.success) {
        setSuccess(true)
        setTimeout(() => {
          navigate('/inventory/warehouses')
        }, 2000)
      } else {
        setError(result.message || 'Failed to save warehouse')
      }
    } catch (err) {
      setError('Failed to save warehouse. Please try again.')
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
            onClick={() => navigate('/inventory/warehouses')}
          >
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isEditing ? 'Edit' : 'Create'} Warehouse
            </h1>
            <p className="text-gray-600">
              {isEditing ? 'Update warehouse information' : 'Add a new warehouse to the system'}
            </p>
          </div>
        </div>
        <Button
          variant="primary"
          leftIcon={<Save className="w-4 h-4" />}
          onClick={handleSubmit}
          isLoading={isLoading}
        >
          {isEditing ? 'Update' : 'Create'} Warehouse
        </Button>
      </div>

      {error && <Alert type="error" message={error} onDismiss={() => setError(null)} />}
      {success && (
        <Alert
          type="success"
          message="Warehouse saved successfully! Redirecting..."
          onDismiss={() => setSuccess(false)}
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card variant="bordered" padding="lg">
            <div className="flex items-center gap-3 mb-6">
              <Warehouse className="w-6 h-6 text-primary-600" />
              <h3 className="text-lg font-semibold text-gray-900">
                Warehouse Information
              </h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {formFields.slice(0, 4).map((field) => (
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
              <MapPin className="w-6 h-6 text-success-600" />
              <h3 className="text-lg font-semibold text-gray-900">
                Location Details
              </h3>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {formFields.slice(4, 8).map((field) => (
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
              <div className="col-span-2">
                <Input
                  name="country"
                  type="text"
                  label="Country"
                  placeholder="Enter country"
                  value={formData.country}
                  onChange={(e) => setFormData({
                    ...formData,
                    country: e.target.value,
                  })}
                  readonly
                />
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card variant="bordered" padding="lg">
            <div className="flex items-center gap-3 mb-6">
              <User className="w-6 h-6 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">
                Contact Information
              </h3>
            </div>
            <div className="space-y-4">
              {formFields.slice(8, 12).map((field) => (
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
                  leftIcon={
                    field.name === 'contact_person' ? <User className="w-5 h-5 text-gray-400" /> :
                    field.name === 'contact_phone' ? <Phone className="w-5 h-5 text-gray-400" /> :
                    field.name === 'contact_email' ? <MailIcon className="w-5 h-5 text-gray-400" /> :
                    undefined
                  }
                />
              ))}
            </div>
          </Card>

          <Card variant="bordered" padding="lg">
            <div className="flex items-center gap-3 mb-6">
              <Package className="w-6 h-6 text-warning-600" />
              <h3 className="text-lg font-semibold text-gray-900">
                Capacity & Settings
              </h3>
            </div>
            <div className="space-y-4">
              {formFields.slice(13, 16).map((field) => (
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
              <div className="pt-4">
                <Input
                  name="description"
                  type="textarea"
                  label="Description"
                  placeholder="Enter warehouse description..."
                  value={formData.description}
                  onChange={(e) => setFormData({
                    ...formData,
                    description: e.target.value,
                  })}
                />
              </div>
            </div>
          </Card>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Warehouse Guidelines
        </h3>
        <div className="space-y-3 text-sm text-gray-600">
          <p>• Warehouse codes must be unique across the organization</p>
          <p>• Set realistic capacity to avoid overstocking alerts</p>
          <p>• Assign a manager responsible for warehouse operations</p>
          <p>• Keep contact information up to date for communications</p>
          <p>• Inactive warehouses cannot receive stock transfers</p>
          <p>• Default warehouse is used for automatic stock allocation</p>
          <p>• Main warehouses serve as primary storage for finished goods</p>
          <p>• Raw material warehouses store ingredients and additives</p>
        </div>
      </div>
    </div>
  )
}

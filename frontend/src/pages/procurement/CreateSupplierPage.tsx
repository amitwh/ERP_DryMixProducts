import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { api } from '@/services/api'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Skeleton } from '@/components/ui/Loading'
import { Alert } from '@/components/ui/Alert'
import { ArrowLeft, Save, Truck, Phone, Mail as MailIcon, MapPin, Globe } from 'lucide-react'

interface ContactPerson {
  name: string
  designation: string
  phone: string
  email: string
}

export default function CreateSupplierPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const [formData, setFormData] = useState({
    supplier_name: '',
    supplier_code: '',
    supplier_type: 'material',
    tax_id: '',
    gstin: '',
    pan: '',
    status: 'active',
    payment_terms: 'Net 30 Days',
    delivery_terms: 'FOB Factory',
    credit_limit: 0,
    currency: 'INR',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'India',
    website: '',
    notes: '',
  })

  const [contacts, setContacts] = useState<ContactPerson[]>([{ name: '', designation: '', phone: '', email: '' }])

  const supplierTypes = [
    { value: 'material', label: 'Material Supplier' },
    { value: 'service', label: 'Service Provider' },
    { value: 'contractor', label: 'Contractor' },
  ]

  const statuses = [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'blacklisted', label: 'Blacklisted' },
  ]

  const currencies = [
    { value: 'INR', label: 'Indian Rupee (₹)' },
    { value: 'USD', label: 'US Dollar ($)' },
    { value: 'EUR', label: 'Euro (€)' },
  ]

  const handleSubmit = async () => {
    if (!formData.supplier_name || !formData.supplier_code) {
      setError('Supplier name and code are required')
      return
    }

    setIsSaving(true)
    setError(null)

    try {
      const response = await api.post('/procurement/suppliers', {
        organization_id: user?.organization_id,
        ...formData,
        contacts,
      })

      if (response.data.success) {
        setSuccess(true)
        setTimeout(() => {
          navigate(`/procurement/suppliers/${response.data.id}`)
        }, 2000)
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create supplier')
    } finally {
      setIsSaving(false)
    }
  }

  const handleAddContact = () => {
    setContacts([...contacts, { name: '', designation: '', phone: '', email: '' }])
  }

  const handleRemoveContact = (index: number) => {
    if (contacts.length > 1) {
      setContacts(contacts.filter((_, i) => i !== index))
    }
  }

  const handleContactChange = (index: number, field: keyof ContactPerson, value: string) => {
    const updatedContacts = [...contacts]
    updatedContacts[index] = { ...updatedContacts[index], [field]: value }
    setContacts(updatedContacts)
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<ArrowLeft className="w-4 h-4" />}
            onClick={() => navigate('/procurement/suppliers')}
          >
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Create Supplier</h1>
            <p className="text-gray-600">
              Add a new supplier to the system
            </p>
          </div>
        </div>
        <Button
          variant="primary"
          leftIcon={<Save className="w-4 h-4" />}
          onClick={handleSubmit}
          isLoading={isSaving}
        >
          Create Supplier
        </Button>
      </div>

      {error && <Alert type="error" message={error} onDismiss={() => setError(null)} />}
      {success && (
        <Alert
          type="success"
          message="Supplier created successfully! Redirecting..."
          onDismiss={() => setSuccess(false)}
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card variant="bordered" padding="lg">
            <div className="flex items-center gap-3 mb-6">
              <Truck className="w-6 h-6 text-primary-600" />
              <h3 className="text-lg font-semibold text-gray-900">
                Supplier Information
              </h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input
                name="supplier_name"
                type="text"
                label="Supplier Name *"
                placeholder="Enter supplier name"
                value={formData.supplier_name}
                onChange={(e) => setFormData({ ...formData, supplier_name: e.target.value })}
                required
              />
              <Input
                name="supplier_code"
                type="text"
                label="Supplier Code *"
                placeholder="Enter supplier code"
                value={formData.supplier_code}
                onChange={(e) => setFormData({ ...formData, supplier_code: e.target.value })}
                required
              />
              <Input
                name="supplier_type"
                type="select"
                label="Supplier Type"
                value={formData.supplier_type}
                onChange={(e) => setFormData({ ...formData, supplier_type: e.target.value })}
                options={supplierTypes}
              />
              <Input
                name="tax_id"
                type="text"
                label="Tax ID (GSTIN)"
                placeholder="Enter GSTIN"
                value={formData.tax_id}
                onChange={(e) => setFormData({ ...formData, tax_id: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                name="credit_limit"
                type="number"
                label="Credit Limit (₹)"
                placeholder="0.00"
                value={formData.credit_limit}
                onChange={(e) => setFormData({ ...formData, credit_limit: parseFloat(e.target.value) || 0 })}
              />
              <Input
                name="currency"
                type="select"
                label="Currency"
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                options={currencies}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                name="payment_terms"
                type="select"
                label="Payment Terms"
                value={formData.payment_terms}
                onChange={(e) => setFormData({ ...formData, payment_terms: e.target.value })}
                options={[
                  { value: 'Net 15 Days', label: 'Net 15 Days' },
                  { value: 'Net 30 Days', label: 'Net 30 Days' },
                  { value: 'Net 45 Days', label: 'Net 45 Days' },
                  { value: 'Net 60 Days', label: 'Net 60 Days' },
                  { value: 'Advance 30%', label: 'Advance 30%' },
                  { value: 'Advance 50%', label: 'Advance 50%' },
                ]}
              />
              <Input
                name="delivery_terms"
                type="select"
                label="Delivery Terms"
                value={formData.delivery_terms}
                onChange={(e) => setFormData({ ...formData, delivery_terms: e.target.value })}
                options={[
                  { value: 'EXW Factory', label: 'EXW Factory' },
                  { value: 'FOB Factory', label: 'FOB Factory' },
                  { value: 'FOR Warehouse', label: 'FOR Warehouse' },
                  { value: 'CIF Location', label: 'CIF Location' },
                  { value: 'DDP Location', label: 'DDP Location' },
                ]}
              />
            </div>
          </Card>

          <Card variant="bordered" padding="lg">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                Contact Persons ({contacts.length})
              </h3>
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Save className="w-4 h-4" />}
                onClick={handleAddContact}
                disabled={contacts.length >= 5}
              >
                Add Contact
              </Button>
            </div>
            <div className="space-y-4">
              {contacts.map((contact, index) => (
                <div key={index} className="p-4 border border-gray-200 rounded-lg">
                  <div className="grid grid-cols-4 gap-4 mb-3">
                    <Input
                      name="name"
                      type="text"
                      label="Name *"
                      placeholder="Contact person name"
                      value={contact.name}
                      onChange={(e) => handleContactChange(index, 'name', e.target.value)}
                      required
                    />
                    <Input
                      name="designation"
                      type="text"
                      label="Designation"
                      placeholder="Job title"
                      value={contact.designation}
                      onChange={(e) => handleContactChange(index, 'designation', e.target.value)}
                    />
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        type="text"
                        label="Phone"
                        placeholder="Phone number"
                        value={contact.phone}
                        onChange={(e) => handleContactChange(index, 'phone', e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <div className="relative">
                      <MailIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        type="email"
                        label="Email"
                        placeholder="Email address"
                        value={contact.email}
                        onChange={(e) => handleContactChange(index, 'email', e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  {contacts.length > 1 && (
                    <div className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveContact(index)}
                      >
                        Remove
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card variant="bordered" padding="lg">
            <div className="flex items-center gap-3 mb-6">
              <MapPin className="w-6 h-6 text-primary-600" />
              <h3 className="text-lg font-semibold text-gray-900">
                Address Information
              </h3>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  name="address_line1"
                  type="text"
                  label="Address Line 1"
                  placeholder="Street address"
                  value={formData.address_line1}
                  onChange={(e) => setFormData({ ...formData, address_line1: e.target.value })}
                />
                <Input
                  name="address_line2"
                  type="text"
                  label="Address Line 2"
                  placeholder="Apartment, suite, unit, etc."
                  value={formData.address_line2}
                  onChange={(e) => setFormData({ ...formData, address_line2: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  name="city"
                  type="text"
                  label="City *"
                  placeholder="Enter city"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  required
                />
                <Input
                  name="state"
                  type="select"
                  label="State *"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  options={[
                    { value: 'MH', label: 'Maharashtra' },
                    { value: 'GJ', label: 'Gujarat' },
                    { value: 'KA', label: 'Karnataka' },
                    { value: 'TN', label: 'Tamil Nadu' },
                    { value: 'DL', label: 'Delhi' },
                    { value: 'UP', label: 'Uttar Pradesh' },
                    { value: 'WB', label: 'West Bengal' },
                  ]}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  name="postal_code"
                  type="text"
                  label="Postal Code"
                  placeholder="Enter postal code"
                  value={formData.postal_code}
                  onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                />
                <Input
                  name="country"
                  type="text"
                  label="Country"
                  placeholder="Enter country"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  readonly
                />
              </div>
            </div>
          </Card>

          <Card variant="bordered" padding="lg">
            <div className="flex items-center gap-3 mb-6">
              <Globe className="w-6 h-6 text-primary-600" />
              <h3 className="text-lg font-semibold text-gray-900">
                Additional Information
              </h3>
            </div>
            <div className="space-y-4">
              <Input
                name="website"
                type="text"
                label="Website"
                placeholder="https://example.com"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              />
              <Input
                name="notes"
                type="textarea"
                label="Notes"
                placeholder="Enter any additional notes..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={4}
              />
              <Input
                name="status"
                type="select"
                label="Status"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                options={statuses}
              />
            </div>
          </Card>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Supplier Guidelines
        </h3>
        <div className="space-y-3 text-sm text-gray-600">
          <p>• Supplier codes must be unique across the organization</p>
          <p>• GSTIN is required for GST-compliant suppliers in India</p>
          <p>• Credit limit determines maximum allowed outstanding balance</p>
          <p>• Payment terms define default payment conditions for POs</p>
          <p>• Delivery terms define shipping and responsibility arrangements</p>
          <p>• At least one contact person is required</p>
          <p>• Multiple contacts can be added for different departments</p>
          <p>• Active suppliers can be used in purchase orders</p>
          <p>• Inactive suppliers cannot be selected for new POs</p>
        </div>
      </div>
    </div>
  )
}

import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { api } from '@/services/api'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Skeleton } from '@/components/ui/Loading'
import { Alert } from '@/components/ui/Alert'
import { ArrowLeft, Save, FileText, Package, Baker, Settings, Info, Plus, Minus } from 'lucide-react'

export default function CreateProductPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    category: '',
    unit: 'MT',
    description: '',
    base_price: '',
    active: true,
  })

  const [specifications, setSpecifications] = useState<any[]>([
    { name: 'standard', value: '' },
    { name: 'bom_components', value: [] as any },
    { name: 'test_parameters', value: [] as any },
  ])

  const categories = [
    { value: 'grouts', label: 'Grouts' },
    { value: 'adhesives', label: 'Adhesives' },
    { value: 'plasters', label: 'Plasters' },
    { value: 'mortars', label: 'Mortars' },
    { value: 'tile_adhesives', label: 'Tile Adhesives' },
    { value: 'wall_putty', label: 'Wall Putty' },
  ]

  const units = [
    { value: 'MT', label: 'Metric Ton' },
    { value: 'KG', label: 'Kilogram' },
    { value: 'BAG', label: 'Bags' },
    { value: 'PCT', label: 'Pieces' },
    { value: 'L', label: 'Liters' },
  ]

  const handleSubmit = async () => {
    if (!formData.name || !formData.category || !formData.code) {
      setError('Name, category, and code are required')
      return
    }

    setIsSaving(true)
    setError(null)

    try {
      const response = await api.post('/products', {
        organization_id: user?.organization_id,
        ...formData,
        base_price: parseFloat(formData.base_price) || 0,
        specifications,
      })

      if (response.data.success) {
        setSuccess(true)
        setTimeout(() => {
          navigate(`/products/${response.data.id}`)
        }, 2000)
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create product')
    } finally {
      setIsSaving(false)
    }
  }

  const addSpecification = () => {
    setSpecifications([...specifications, { name: '', value: '' }])
  }

  const removeSpecification = (index: number) => {
    setSpecifications(specifications.filter((_, i) => i !== index))
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<ArrowLeft className="w-4 h-4" />}
            onClick={() => navigate('/products')}
          >
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Create Product</h1>
            <p className="text-gray-600">
              Add new product to catalog
            </p>
          </div>
        </div>
        <Button
          variant="primary"
          leftIcon={<Save className="w-4 h-4" />}
          onClick={handleSubmit}
          isLoading={isSaving}
        >
          Create Product
        </Button>
      </div>

      {error && <Alert type="error" message={error} onDismiss={() => setError(null)} />}
      {success && (
        <Alert
          type="success"
          message="Product created successfully! Redirecting..."
          onDismiss={() => setSuccess(false)}
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <Card variant="bordered" padding="lg">
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Input
                  name="name"
                  type="text"
                  label="Product Name *"
                  placeholder="Enter product name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
                <Input
                  name="code"
                  type="text"
                  label="Product Code *"
                  placeholder="Auto-generated or enter code"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  required
                />
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    name="category"
                    type="select"
                    label="Category *"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    options={categories}
                    required
                  />
                  <Input
                    name="unit"
                    type="select"
                    label="Unit of Measure *"
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    options={units}
                    required
                  />
                </div>
                <Input
                  name="base_price"
                  type="number"
                  label="Base Price (₹)"
                  placeholder="0.00"
                  value={formData.base_price}
                  onChange={(e) => setFormData({ ...formData, base_price: e.target.value })}
                />
                <Input
                  name="description"
                  type="textarea"
                  label="Description"
                  placeholder="Enter product description..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                />
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.active}
                    onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                    className="w-5 h-5 text-primary-600 rounded"
                    id="product-active"
                  />
                  <label htmlFor="product-active" className="text-sm text-gray-700">
                    Active Product
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card variant="bordered" padding="lg">
            <CardHeader>
              <CardTitle>Specifications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {specifications.map((spec, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-4">
                      <Input
                        type="text"
                        label="Specification Name"
                        placeholder="e.g., IS Standard"
                        value={spec.name}
                        onChange={(e) => {
                          const updated = [...specifications]
                          updated[index].name = e.target.value
                          setSpecifications(updated)
                        }}
                        className="flex-1"
                      />
                      {specifications.length > 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          leftIcon={<Minus className="w-4 h-4 text-error-600" />}
                          onClick={() => removeSpecification(index)}
                        />
                      )}
                    </div>
                    <div>
                      {spec.name === 'bom_components' ? (
                        <div className="space-y-3">
                          <div className="text-sm text-gray-700 mb-2">
                            Bill of Materials (BOM) Components
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            leftIcon={<Plus className="w-4 h-4" />}
                            onClick={() => {
                              const updated = [...specifications]
                              updated[index].value = [
                                { raw_material_id: '', quantity: 0, unit: 'MT', unit_cost: 0 },
                              ]
                              setSpecifications(updated)
                            }}
                          >
                            Add Component
                          </Button>
                        </div>
                      ) : spec.name === 'test_parameters' ? (
                        <div className="space-y-3">
                          <div className="text-sm text-gray-700 mb-2">
                            Test Parameters
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            leftIcon={<Plus className="w-4 h-4" />}
                            onClick={() => {
                              const updated = [...specifications]
                              updated[index].value = [
                                { parameter_name: '', test_method: '', min_value: 0, max_value: 100, unit: '', },
                              ]
                              setSpecifications(updated)
                            }}
                          >
                            Add Parameter
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="text-sm text-gray-700 mb-2">
                            Standard Compliance
                          </div>
                          <Input
                            type="text"
                            placeholder="e.g., IS 15477, EN 12004"
                            value={spec.value}
                            onChange={(e) => {
                              const updated = [...specifications]
                              updated[index].value = e.target.value
                              setSpecifications(updated)
                            }}
                            className="w-full"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<Plus className="w-4 h-4" />}
                  onClick={addSpecification}
                >
                  Add Specification
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card variant="bordered" padding="lg">
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <Beaker2 className="w-6 h-6 text-primary-600" />
              <h3 className="text-lg font-semibold text-gray-900">
                Quick Actions
              </h3>
            </div>
            <div className="space-y-3">
              <Button
                variant="outline"
                className="w-full"
                leftIcon={<Package className="w-4 h-4" />}
                onClick={() => navigate('/production/plans')}
              >
                Create Production Plan
              </Button>
              <Button
                variant="outline"
                className="w-full"
                leftIcon={<FileText className="w-4 h-4" />}
                onClick={() => navigate('/quality/tests')}
              >
                Create Test
              </Button>
            </div>
          </div>
        </Card>
      </div>

      <Card variant="bordered" padding="lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Product Guidelines
        </h3>
        <div className="space-y-3 text-sm text-gray-600">
          <p>• Product codes must be unique across the organization</p>
          <p>• Categories determine where products appear in menus</p>
          <p>• Base price is used for cost calculations and estimates</p>
          <p>• Inactive products cannot be used in production orders</p>
          <p>• Specifications include BOM, test parameters, and compliance standards</p>
          <p>• Units must match actual physical measurement units</p>
          <p>• Multiple specifications can be added for each category</p>
        </div>
      </Card>
    </div>
  )
}

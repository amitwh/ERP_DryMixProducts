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
  TestTube2,
  Plus,
  Minus,
  Calendar,
} from 'lucide-react'

export default function CreateDryMixTestPage() {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const [formData, setFormData] = useState({
    product_id: '',
    test_standard_id: '',
    batch_id: '',
    test_date: new Date().toISOString().split('T')[0],
    lab_temperature: '',
    lab_humidity: '',
    remarks: '',
  })

  const [testData, setTestData] = useState({
    // Mechanical Properties
    compressive_strength_1_day: '',
    compressive_strength_3_day: '',
    compressive_strength_7_day: '',
    compressive_strength_28_day: '',
    flexural_strength: '',
    adhesion_strength: '',
    // Setting Times
    initial_setting_time: '',
    final_setting_time: '',
    // Physical Properties
    water_demand: '',
    water_retention: '',
    flow_diameter: '',
    bulk_density: '',
    air_content: '',
    shelf_life: '',
    // Appearance
    color: '',
    texture: '',
    notes: '',
  })

  const formFields = [
    {
      name: 'product_id',
      label: 'Product',
      type: 'select' as const,
      options: [
        { value: '1', label: 'Non-Shrink Grout (Grade A)' },
        { value: '2', label: 'Tile Adhesive (Grade 1)' },
        { value: '3', label: 'Wall Plaster (Internal)' },
        { value: '4', label: 'Block Jointing Mortar' },
        { value: '5', label: 'Wall Putty' },
      ],
      required: true,
    },
    {
      name: 'test_standard_id',
      label: 'Test Standard',
      type: 'select' as const,
      options: [
        { value: '1', label: 'ASTM C1107 (Grouts)' },
        { value: '2', label: 'IS 5129 (Grouts)' },
        { value: '3', label: 'EN 1504-6 (Grouts)' },
        { value: '4', label: 'IS 15477 (Tile Adhesive)' },
        { value: '5', label: 'EN 12004 (Tile Adhesive)' },
      ],
      required: true,
    },
    {
      name: 'batch_id',
      label: 'Batch Number',
      type: 'text' as const,
      placeholder: 'Enter batch number',
    },
    {
      name: 'test_date',
      label: 'Test Date',
      type: 'date' as const,
      required: true,
    },
    {
      name: 'lab_temperature',
      label: 'Lab Temperature (°C)',
      type: 'number' as const,
      placeholder: '27',
    },
    {
      name: 'lab_humidity',
      label: 'Lab Humidity (%)',
      type: 'number' as const,
      placeholder: '65',
    },
    {
      name: 'remarks',
      label: 'Remarks',
      type: 'textarea' as const,
      placeholder: 'Enter any additional observations...',
    },
  ]

  const handleSubmit = async (data: any) => {
    setIsLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const response = await fetch('/api/v1/dry-mix-product-tests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          ...testData,
        }),
      })

      const result = await response.json()
      if (result.success) {
        setSuccess(true)
        setTimeout(() => {
          navigate('/quality/dry-mix-tests')
        }, 2000)
      } else {
        setError(result.message || 'Failed to create test')
      }
    } catch (err) {
      setError('Failed to create test. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const isComplete = () => {
    return testData.compressive_strength_1_day !== '' &&
           testData.compressive_strength_7_day !== '' &&
           testData.compressive_strength_28_day !== ''
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<ArrowLeft className="w-4 h-4" />}
            onClick={() => navigate('/quality/dry-mix-tests')}
          >
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Create Dry Mix Product Test
            </h1>
            <p className="text-gray-600">
              Record test results for finished products
            </p>
          </div>
        </div>
        <Button
          variant="primary"
          leftIcon={<Save className="w-4 h-4" />}
          onClick={handleSubmit}
          isLoading={isLoading}
          disabled={!isComplete()}
        >
          Save Test
        </Button>
      </div>

      {error && <Alert type="error" message={error} onDismiss={() => setError(null)} />}
      {success && (
        <Alert
          type="success"
          message="Test created successfully! Redirecting..."
          onDismiss={() => setSuccess(false)}
        />
      )}

      <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Basic Information */}
          <div className="lg:col-span-2">
            <Card variant="bordered" padding="lg">
              <div className="flex items-center gap-3 mb-6">
                <TestTube2 className="w-6 h-6 text-primary-600" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Basic Information
                </h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
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
                  />
                ))}
              </div>
            </Card>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Mechanical Properties */}
          <div className="lg:col-span-2">
            <Card variant="bordered" padding="lg">
              <div className="flex items-center gap-3 mb-6">
                <TestTube2 className="w-6 h-6 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Mechanical Properties (N/mm²)
                </h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  name="compressive_strength_1_day"
                  type="number"
                  label="Compressive Strength (1 Day)"
                  placeholder="Enter value..."
                  value={testData.compressive_strength_1_day}
                  onChange={(e) => setTestData({
                    ...testData,
                    compressive_strength_1_day: e.target.value,
                  })}
                  required
                />
                <Input
                  name="compressive_strength_3_day"
                  type="number"
                  label="Compressive Strength (3 Days)"
                  placeholder="Enter value..."
                  value={testData.compressive_strength_3_day}
                  onChange={(e) => setTestData({
                    ...testData,
                    compressive_strength_3_day: e.target.value,
                  })}
                  required
                />
                <Input
                  name="compressive_strength_7_day"
                  type="number"
                  label="Compressive Strength (7 Days)"
                  placeholder="Enter value..."
                  value={testData.compressive_strength_7_day}
                  onChange={(e) => setTestData({
                    ...testData,
                    compressive_strength_7_day: e.target.value,
                  })}
                  required
                />
                <Input
                  name="compressive_strength_28_day"
                  type="number"
                  label="Compressive Strength (28 Days)"
                  placeholder="Enter value..."
                  value={testData.compressive_strength_28_day}
                  onChange={(e) => setTestData({
                    ...testData,
                    compressive_strength_28_day: e.target.value,
                  })}
                  required
                />
                <Input
                  name="flexural_strength"
                  type="number"
                  label="Flexural Strength"
                  placeholder="Enter value..."
                  value={testData.flexural_strength}
                  onChange={(e) => setTestData({
                    ...testData,
                    flexural_strength: e.target.value,
                  })}
                />
                <Input
                  name="adhesion_strength"
                  type="number"
                  label="Adhesion Strength"
                  placeholder="Enter value..."
                  value={testData.adhesion_strength}
                  onChange={(e) => setTestData({
                    ...testData,
                    adhesion_strength: e.target.value,
                  })}
                />
              </div>
            </Card>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Setting Times */}
          <div>
            <Card variant="bordered" padding="lg">
              <div className="flex items-center gap-3 mb-6">
                <Calendar className="w-6 h-6 text-warning-600" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Setting Times
                </h3>
              </div>
              <div className="space-y-4">
                <Input
                  name="initial_setting_time"
                  type="text"
                  label="Initial Setting Time"
                  placeholder="e.g., 30 minutes"
                  value={testData.initial_setting_time}
                  onChange={(e) => setTestData({
                    ...testData,
                    initial_setting_time: e.target.value,
                  })}
                />
                <Input
                  name="final_setting_time"
                  type="text"
                  label="Final Setting Time"
                  placeholder="e.g., 120 minutes"
                  value={testData.final_setting_time}
                  onChange={(e) => setTestData({
                    ...testData,
                    final_setting_time: e.target.value,
                  })}
                />
              </div>
            </Card>
          </div>

          {/* Physical Properties */}
          <div>
            <Card variant="bordered" padding="lg">
              <div className="flex items-center gap-3 mb-6">
                <TestTube2 className="w-6 h-6 text-success-600" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Physical Properties
                </h3>
              </div>
              <div className="space-y-4">
                <Input
                  name="water_demand"
                  type="number"
                  label="Water Demand (%)"
                  placeholder="Enter value..."
                  value={testData.water_demand}
                  onChange={(e) => setTestData({
                    ...testData,
                    water_demand: e.target.value,
                  })}
                />
                <Input
                  name="water_retention"
                  type="number"
                  label="Water Retention (%)"
                  placeholder="Enter value..."
                  value={testData.water_retention}
                  onChange={(e) => setTestData({
                    ...testData,
                    water_retention: e.target.value,
                  })}
                />
                <Input
                  name="flow_diameter"
                  type="number"
                  label="Flow Diameter (mm)"
                  placeholder="Enter value..."
                  value={testData.flow_diameter}
                  onChange={(e) => setTestData({
                    ...testData,
                    flow_diameter: e.target.value,
                  })}
                />
                <Input
                  name="bulk_density"
                  type="number"
                  label="Bulk Density (kg/m³)"
                  placeholder="Enter value..."
                  value={testData.bulk_density}
                  onChange={(e) => setTestData({
                    ...testData,
                    bulk_density: e.target.value,
                  })}
                />
                <Input
                  name="air_content"
                  type="number"
                  label="Air Content (%)"
                  placeholder="Enter value..."
                  value={testData.air_content}
                  onChange={(e) => setTestData({
                    ...testData,
                    air_content: e.target.value,
                  })}
                />
                <Input
                  name="shelf_life"
                  type="text"
                  label="Shelf Life"
                  placeholder="e.g., 12 months from date of manufacture"
                  value={testData.shelf_life}
                  onChange={(e) => setTestData({
                    ...testData,
                    shelf_life: e.target.value,
                  })}
                />
              </div>
            </Card>
          </div>
        </div>

        {/* Appearance */}
        <div className="lg:col-span-2">
          <Card variant="bordered" padding="lg">
            <div className="flex items-center gap-3 mb-6">
              <TestTube2 className="w-6 h-6 text-purple-600" />
              <h3 className="text-lg font-semibold text-gray-900">
                Appearance
              </h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input
                name="color"
                type="text"
                label="Color"
                placeholder="Enter color description..."
                value={testData.color}
                onChange={(e) => setTestData({
                  ...testData,
                  color: e.target.value,
                })}
              />
              <Input
                name="texture"
                type="text"
                label="Texture"
                placeholder="Enter texture description..."
                value={testData.texture}
                onChange={(e) => setTestData({
                  ...testData,
                  texture: e.target.value,
                })}
              />
            </div>
            <div className="mt-4">
              <Input
                name="notes"
                type="textarea"
                label="Additional Notes"
                placeholder="Enter any additional observations..."
                value={testData.notes}
                onChange={(e) => setTestData({
                  ...testData,
                  notes: e.target.value,
                })}
              />
            </div>
          </Card>
        </div>
      </form>

      {/* Completion Status */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            Test Completion Status
          </h3>
          <div className={`px-4 py-2 rounded-lg font-medium ${
            isComplete()
              ? 'bg-success-100 text-success-800'
              : 'bg-warning-100 text-warning-800'
          }`}>
            {isComplete() ? 'Ready to Submit' : 'Incomplete'}
          </div>
        </div>
        <p className="mt-2 text-sm text-gray-600">
          {isComplete()
            ? 'All required fields are completed. You can now save the test.'
            : 'Please complete all required fields (Mechanical Properties - Compressive Strength) before submitting.'}
        </p>
      </div>
    </div>
  )
}

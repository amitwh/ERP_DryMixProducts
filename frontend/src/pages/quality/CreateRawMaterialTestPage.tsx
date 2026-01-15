import React, { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import {
  ArrowLeft,
  Save,
  TestTube2,
  Calendar,
} from 'lucide-react'

export default function CreateRawMaterialTestPage() {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const [formData, setFormData] = useState({
    material_id: '',
    test_standard_id: '',
    supplier_id: '',
    test_date: new Date().toISOString().split('T')[0],
    lab_temperature: '',
    lab_humidity: '',
    remarks: '',
  })

  const [testData, setTestData] = useState({
    // Chemical Analysis (%)
    sio2: '',
    al2o3: '',
    fe2o3: '',
    cao: '',
    mgo: '',
    so3: '',
    k2o: '',
    na2o: '',
    cl: '',
    // Physical Properties
    moisture_content: '',
    loi: '',
    specific_gravity: '',
    bulk_density: '',
    // Particle Size Analysis
    d50: '',
    d90: '',
    d98: '',
    blaine_fineness: '',
    // Functional Properties
    water_reducer: '',
    retention_aid: '',
    defoamer: '',
    // Polymer Properties
    solid_content: '',
    viscosity: '',
    ph: '',
    mfft: '',
  })

  const formFields = [
    {
      name: 'material_id',
      label: 'Raw Material',
      type: 'select' as const,
      options: [
        { value: '1', label: 'Ordinary Portland Cement (OPC)' },
        { value: '2', label: 'Portland Pozzolana Cement (PPC)' },
        { value: '3', label: 'Ordinary Portland Slag Cement (OPSC)' },
        { value: '4', label: 'Fine Aggregate (Sand)' },
        { value: '5', label: 'Coarse Aggregate (Gravel)' },
        { value: '6', label: 'Fly Ash' },
        { value: '7', label: 'Silica Fume' },
        { value: '8', label: 'Polymer Admixture' },
      ],
      required: true,
    },
    {
      name: 'test_standard_id',
      label: 'Test Standard',
      type: 'select' as const,
      options: [
        { value: '1', label: 'IS 4031 (Cement)' },
        { value: '2', label: 'IS 383 (Aggregate)' },
        { value: '3', label: 'IS 8112 (Cement)' },
        { value: '4', label: 'ASTM C150 (Cement)' },
        { value: '5', label: 'ASTM C33 (Aggregate)' },
      ],
      required: true,
    },
    {
      name: 'supplier_id',
      label: 'Supplier',
      type: 'select' as const,
      options: [
        { value: '1', label: 'UltraTech Cement' },
        { value: '2', label: 'ACC Limited' },
        { value: '3', label: 'Dalmia Bharat Cement' },
        { value: '4', label: 'JK Lakshmi Cement' },
      ],
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
      const response = await fetch('/api/v1/raw-material-tests', {
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
          navigate('/quality/raw-material-tests')
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
    return testData.sio2 !== '' &&
           testData.moisture_content !== '' &&
           testData.specific_gravity !== ''
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<ArrowLeft className="w-4 h-4" />}
            onClick={() => navigate('/quality/raw-material-tests')}
          >
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Create Raw Material Test
            </h1>
            <p className="text-gray-600">
              Record test results for raw materials
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
              {formFields.map((field) => (
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chemical Analysis */}
          <div className="lg:col-span-2">
            <Card variant="bordered" padding="lg">
              <div className="flex items-center gap-3 mb-6">
                <TestTube2 className="w-6 h-6 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Chemical Analysis (%)
                </h3>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <Input
                  name="sio2"
                  type="number"
                  label="SiO₂"
                  placeholder="Enter %..."
                  value={testData.sio2}
                  onChange={(e) => setTestData({
                    ...testData,
                    sio2: e.target.value,
                  })}
                  required
                />
                <Input
                  name="al2o3"
                  type="number"
                  label="Al₂O₃"
                  placeholder="Enter %..."
                  value={testData.al2o3}
                  onChange={(e) => setTestData({
                    ...testData,
                    al2o3: e.target.value,
                  })}
                  required
                />
                <Input
                  name="fe2o3"
                  type="number"
                  label="Fe₂O₃"
                  placeholder="Enter %..."
                  value={testData.fe2o3}
                  onChange={(e) => setTestData({
                    ...testData,
                    fe2o3: e.target.value,
                  })}
                />
                <Input
                  name="cao"
                  type="number"
                  label="CaO"
                  placeholder="Enter %..."
                  value={testData.cao}
                  onChange={(e) => setTestData({
                    ...testData,
                    cao: e.target.value,
                  })}
                />
                <Input
                  name="mgo"
                  type="number"
                  label="MgO"
                  placeholder="Enter %..."
                  value={testData.mgo}
                  onChange={(e) => setTestData({
                    ...testData,
                    mgo: e.target.value,
                  })}
                />
                <Input
                  name="so3"
                  type="number"
                  label="SO₃"
                  placeholder="Enter %..."
                  value={testData.so3}
                  onChange={(e) => setTestData({
                    ...testData,
                    so3: e.target.value,
                  })}
                />
                <Input
                  name="k2o"
                  type="number"
                  label="K₂O"
                  placeholder="Enter %..."
                  value={testData.k2o}
                  onChange={(e) => setTestData({
                    ...testData,
                    k2o: e.target.value,
                  })}
                />
                <Input
                  name="na2o"
                  type="number"
                  label="Na₂O"
                  placeholder="Enter %..."
                  value={testData.na2o}
                  onChange={(e) => setTestData({
                    ...testData,
                    na2o: e.target.value,
                  })}
                />
                <Input
                  name="cl"
                  type="number"
                  label="Cl"
                  placeholder="Enter %..."
                  value={testData.cl}
                  onChange={(e) => setTestData({
                    ...testData,
                    cl: e.target.value,
                  })}
                />
              </div>
            </Card>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                  name="moisture_content"
                  type="number"
                  label="Moisture Content (%)"
                  placeholder="Enter %..."
                  value={testData.moisture_content}
                  onChange={(e) => setTestData({
                    ...testData,
                    moisture_content: e.target.value,
                  })}
                  required
                />
                <Input
                  name="loi"
                  type="number"
                  label="Loss on Ignition (%)"
                  placeholder="Enter %..."
                  value={testData.loi}
                  onChange={(e) => setTestData({
                    ...testData,
                    loi: e.target.value,
                  })}
                />
                <Input
                  name="specific_gravity"
                  type="number"
                  label="Specific Gravity"
                  placeholder="Enter value..."
                  value={testData.specific_gravity}
                  onChange={(e) => setTestData({
                    ...testData,
                    specific_gravity: e.target.value,
                  })}
                  required
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
              </div>
            </Card>
          </div>

          {/* Particle Size Analysis */}
          <div>
            <Card variant="bordered" padding="lg">
              <div className="flex items-center gap-3 mb-6">
                <TestTube2 className="w-6 h-6 text-warning-600" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Particle Size Analysis
                </h3>
              </div>
              <div className="space-y-4">
                <Input
                  name="d50"
                  type="number"
                  label="D50 (µm)"
                  placeholder="Enter value..."
                  value={testData.d50}
                  onChange={(e) => setTestData({
                    ...testData,
                    d50: e.target.value,
                  })}
                  required
                />
                <Input
                  name="d90"
                  type="number"
                  label="D90 (µm)"
                  placeholder="Enter value..."
                  value={testData.d90}
                  onChange={(e) => setTestData({
                    ...testData,
                    d90: e.target.value,
                  })}
                />
                <Input
                  name="d98"
                  type="number"
                  label="D98 (µm)"
                  placeholder="Enter value..."
                  value={testData.d98}
                  onChange={(e) => setTestData({
                    ...testData,
                    d98: e.target.value,
                  })}
                />
                <Input
                  name="blaine_fineness"
                  type="number"
                  label="Blaine Fineness (cm²/g)"
                  placeholder="Enter value..."
                  value={testData.blaine_fineness}
                  onChange={(e) => setTestData({
                    ...testData,
                    blaine_fineness: e.target.value,
                  })}
                />
              </div>
            </Card>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Functional Properties */}
          <div>
            <Card variant="bordered" padding="lg">
              <div className="flex items-center gap-3 mb-6">
                <TestTube2 className="w-6 h-6 text-purple-600" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Functional Properties
                </h3>
              </div>
              <div className="space-y-4">
                <Input
                  name="water_reducer"
                  type="number"
                  label="Water Reducer (%)"
                  placeholder="Enter %..."
                  value={testData.water_reducer}
                  onChange={(e) => setTestData({
                    ...testData,
                    water_reducer: e.target.value,
                  })}
                />
                <Input
                  name="retention_aid"
                  type="number"
                  label="Retention Aid (%)"
                  placeholder="Enter %..."
                  value={testData.retention_aid}
                  onChange={(e) => setTestData({
                    ...testData,
                    retention_aid: e.target.value,
                  })}
                />
                <Input
                  name="defoamer"
                  type="number"
                  label="Defoamer (%)"
                  placeholder="Enter %..."
                  value={testData.defoamer}
                  onChange={(e) => setTestData({
                    ...testData,
                    defoamer: e.target.value,
                  })}
                />
              </div>
            </Card>
          </div>

          {/* Polymer Properties */}
          <div>
            <Card variant="bordered" padding="lg">
              <div className="flex items-center gap-3 mb-6">
                <TestTube2 className="w-6 h-6 text-orange-600" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Polymer Properties
                </h3>
              </div>
              <div className="space-y-4">
                <Input
                  name="solid_content"
                  type="number"
                  label="Solid Content (%)"
                  placeholder="Enter %..."
                  value={testData.solid_content}
                  onChange={(e) => setTestData({
                    ...testData,
                    solid_content: e.target.value,
                  })}
                />
                <Input
                  name="viscosity"
                  type="number"
                  label="Viscosity (mPa.s)"
                  placeholder="Enter value..."
                  value={testData.viscosity}
                  onChange={(e) => setTestData({
                    ...testData,
                    viscosity: e.target.value,
                  })}
                />
                <Input
                  name="ph"
                  type="number"
                  label="pH"
                  placeholder="Enter value..."
                  value={testData.ph}
                  onChange={(e) => setTestData({
                    ...testData,
                    ph: e.target.value,
                  })}
                />
                <Input
                  name="mfft"
                  type="number"
                  label="MFFT (°C)"
                  placeholder="Enter value..."
                  value={testData.mfft}
                  onChange={(e) => setTestData({
                    ...testData,
                    mfft: e.target.value,
                  })}
                />
              </div>
            </Card>
          </div>
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
            : 'Please complete all required fields (Chemical Analysis, Physical Properties - Specific Gravity, Particle Size) before submitting.'}
        </p>
      </div>
    </div>
  )
}

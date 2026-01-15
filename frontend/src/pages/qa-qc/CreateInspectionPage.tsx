import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { api } from '@/services/api'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { Skeleton } from '@/components/ui/Loading'
import { Alert } from '@/components/ui/Alert'
import { Search, Plus, ClipboardCheck, FileText, AlertTriangle, CheckCircle, Clock, Calendar, Package } from 'lucide-react'
import { formatDate } from '@/utils'

interface TestParameter {
  id: number
  parameter_name: string
  test_method: string
  min_value: number
  max_value: number
  unit: string
  actual_value?: number
  result?: 'pass' | 'fail' | 'pending'
}

interface Inspection {
  id: number
  inspection_number: string
  product_id: number
  product_name: string
  product_code: string
  batch_number?: string
  inspection_type: 'incoming' | 'in_process' | 'final'
  status: 'pending' | 'in_progress' | 'completed' | 'failed'
  inspector_id?: number
  inspector_name?: string
  inspection_date: string
  test_parameters: TestParameter[]
  overall_result?: 'pass' | 'fail' | 'pending'
  notes?: string
  created_at: string
}

export default function CreateInspectionPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const [products, setProducts] = useState<any[]>([])
  const [batches, setBatches] = useState<any[]>([])

  const [formData, setFormData] = useState({
    product_id: '',
    batch_id: '',
    inspection_type: 'final' as 'incoming' | 'in_process' | 'final',
    inspection_date: new Date().toISOString().split('T')[0],
    inspector_id: user?.id?.toString() || '',
  })

  const [testParameters, setTestParameters] = useState<TestParameter[]>([])
  const [selectedProduct, setSelectedProduct] = useState<any>(null)

  useEffect(() => {
    fetchDropdowns()
  }, [])

  const fetchDropdowns = async () => {
    try {
      setIsLoading(true)
      const [productsRes, batchesRes] = await Promise.all([
        api.get('/products', { params: { organization_id: user?.organizationId } }),
        api.get('/production/batches', { params: { organization_id: user?.organizationId } }),
      ])
      setProducts(productsRes.data.data || [])
      setBatches(batchesRes.data.data || [])
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load dropdown data')
    } finally {
      setIsLoading(false)
    }
  }

  const handleProductChange = async (productId: string) => {
    const product = products.find(p => p.id.toString() === productId)
    setSelectedProduct(product || null)

    if (product?.specifications?.test_parameters) {
      setTestParameters(product.specifications.test_parameters.map((param: any) => ({
        ...param,
        actual_value: undefined,
        result: 'pending',
      })))
    } else {
      setTestParameters([])
    }
  }

  const handleParameterChange = (paramId: number, field: 'actual_value' | 'result', value: any) => {
    const updatedParams = testParameters.map(p =>
      p.id === paramId ? { ...p, [field]: value } : p
    )

    setTestParameters(updatedParams)

    const param = updatedParams.find(p => p.id === paramId)
    if (param && param.actual_value !== undefined) {
      const passed = param.actual_value >= param.min_value && param.actual_value <= param.max_value
      param.result = passed ? 'pass' : 'fail'
    }
  }

  const handleSubmit = async () => {
    if (!formData.product_id || testParameters.length === 0) {
      setError('Please select a product and verify test parameters')
      return
    }

    setIsSaving(true)
    setError(null)

    try {
      const response = await api.post('/qa/inspections', {
        organization_id: user?.organizationId,
        ...formData,
        product_id: parseInt(formData.product_id),
        batch_id: formData.batch_id ? parseInt(formData.batch_id) : null,
        inspector_id: parseInt(formData.inspector_id),
        test_parameters: testParameters.map(p => ({
          parameter_id: p.id,
          actual_value: p.actual_value,
          result: p.result,
        })),
      })

      if (response.data.success) {
        setSuccess(true)
        setTimeout(() => {
          navigate(`/qa/inspections/${response.data.id}`)
        }, 2000)
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create inspection')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto p-8">
        <Skeleton height={200} className="rounded mb-6" />
        <Skeleton height={400} className="rounded" />
      </div>
    )
  }

  const overallResult = testParameters.every(p => p.result === 'pass')
    ? 'pass'
    : testParameters.some(p => p.result === 'fail')
    ? 'fail'
    : 'pending'

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<ArrowLeft className="w-4 h-4" />}
            onClick={() => navigate('/qa/inspections')}
          >
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Create Quality Inspection</h1>
            <p className="text-gray-600">
              Record and document quality inspection results
            </p>
          </div>
        </div>
        <Button
          variant="primary"
          leftIcon={<ClipboardCheck className="w-4 h-4" />}
          onClick={handleSubmit}
          isLoading={isSaving}
        >
          Submit Inspection
        </Button>
      </div>

      {error && <Alert type="error" message={error} onDismiss={() => setError(null)} />}
      {success && (
        <Alert
          type="success"
          message="Inspection created successfully! Redirecting..."
          onDismiss={() => setSuccess(false)}
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card variant="bordered" padding="lg">
            <div className="flex items-center gap-3 mb-6">
              <Package className="w-6 h-6 text-primary-600" />
              <h3 className="text-lg font-semibold text-gray-900">
                Product & Batch Information
              </h3>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  name="product_id"
                  type="select"
                  label="Product *"
                  value={formData.product_id}
                  onChange={(e) => {
                    setFormData({ ...formData, product_id: e.target.value })
                    handleProductChange(e.target.value)
                  }}
                  options={products.map(p => ({ value: p.id.toString(), label: p.name }))}
                  required
                />
                <Input
                  name="batch_id"
                  type="select"
                  label="Batch (Optional)"
                  value={formData.batch_id}
                  onChange={(e) => setFormData({ ...formData, batch_id: e.target.value })}
                  options={[{ value: '', label: 'No Batch' }, ...batches.map(b => ({ value: b.id.toString(), label: b.batch_number }))]}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  name="inspection_type"
                  type="select"
                  label="Inspection Type *"
                  value={formData.inspection_type}
                  onChange={(e) => setFormData({ ...formData, inspection_type: e.target.value as any })}
                  options={[
                    { value: 'incoming', label: 'Incoming Material' },
                    { value: 'in_process', label: 'In-Process' },
                    { value: 'final', label: 'Final Product' },
                  ]}
                  required
                />
                <Input
                  name="inspection_date"
                  type="date"
                  label="Inspection Date *"
                  value={formData.inspection_date}
                  onChange={(e) => setFormData({ ...formData, inspection_date: e.target.value })}
                  required
                />
              </div>
              {selectedProduct && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-900 mb-1">{selectedProduct.name}</p>
                  <p className="text-sm text-gray-600">{selectedProduct.code}</p>
                  {selectedProduct.specifications?.standard && (
                    <p className="text-xs text-gray-500 mt-2">
                      Standard: {selectedProduct.specifications.standard}
                    </p>
                  )}
                </div>
              )}
            </div>
          </Card>

          {testParameters.length > 0 && (
            <Card variant="bordered" padding="lg">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  Test Parameters ({testParameters.length})
                </h3>
                <StatusBadge
                  status={
                    overallResult === 'pass' ? 'completed' :
                    overallResult === 'fail' ? 'failed' :
                    'pending'
                  }
                />
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Parameter</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Method</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Spec Range</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Actual</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Result</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {testParameters.map((param) => (
                      <tr key={param.id}>
                        <td className="px-4 py-3">
                          <p className="font-medium text-gray-900">{param.parameter_name}</p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-sm text-gray-600">{param.test_method}</p>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <p className="text-sm text-gray-600">
                            {param.min_value} - {param.max_value} {param.unit}
                          </p>
                        </td>
                        <td className="px-4 py-3">
                          <Input
                            type="number"
                            placeholder="Enter value"
                            value={param.actual_value || ''}
                            onChange={(e) => handleParameterChange(param.id, 'actual_value', parseFloat(e.target.value))}
                            className="text-right"
                          />
                        </td>
                        <td className="px-4 py-3 text-center">
                          {param.result === 'pass' && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-success-100 text-success-800">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Pass
                            </span>
                          )}
                          {param.result === 'fail' && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-error-100 text-error-800">
                              <AlertTriangle className="w-3 h-3 mr-1" />
                              Fail
                            </span>
                          )}
                          {param.result === 'pending' && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              <Clock className="w-3 h-3 mr-1" />
                              Pending
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card variant="bordered" padding="lg">
            <div className="flex items-center gap-3 mb-6">
              <ClipboardCheck className="w-6 h-6 text-primary-600" />
              <h3 className="text-lg font-semibold text-gray-900">
                Inspection Summary
              </h3>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Overall Result</p>
                <div className={`p-3 rounded-lg text-center font-semibold ${
                  overallResult === 'pass' ? 'bg-success-50 text-success-800' :
                  overallResult === 'fail' ? 'bg-error-50 text-error-800' :
                  'bg-gray-50 text-gray-800'
                }`}>
                  {overallResult === 'pass' && 'PASS'}
                  {overallResult === 'fail' && 'FAIL'}
                  {overallResult === 'pending' && 'PENDING'}
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Parameters Tested</p>
                <p className="text-lg font-bold text-gray-900">{testParameters.length}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Passed</p>
                <p className="text-lg font-bold text-success-600">
                  {testParameters.filter(p => p.result === 'pass').length}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Failed</p>
                <p className="text-lg font-bold text-error-600">
                  {testParameters.filter(p => p.result === 'fail').length}
                </p>
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
                leftIcon={<FileText className="w-4 h-4" />}
                onClick={() => navigate('/qa/inspections')}
              >
                View Inspections
              </Button>
              <Button
                variant="outline"
                className="w-full"
                leftIcon={<Package className="w-4 h-4" />}
                onClick={() => navigate('/production/products')}
              >
                View Products
              </Button>
              <Button
                variant="outline"
                className="w-full"
                leftIcon={<Search className="w-4 h-4" />}
                onClick={() => navigate('/qa/certificates')}
              >
                View Certificates
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

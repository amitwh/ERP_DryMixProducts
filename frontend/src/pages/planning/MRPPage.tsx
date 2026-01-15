import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { api } from '@/services/api'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Skeleton } from '@/components/ui/Loading'
import { Alert } from '@/components/ui/Alert'
import { Search, Calendar, Package, Download, Printer, RefreshCw, AlertTriangle, CheckCircle } from 'lucide-react'
import { formatDate, formatNumber } from '@/utils'

interface MaterialRequirement {
  id: number
  raw_material_id: number
  raw_material_code: string
  raw_material_name: string
  current_stock: number
  required_quantity: number
  shortage_quantity: number
  unit: string
  lead_time_days: number
  order_quantity?: number
  order_date?: string
  status: 'sufficient' | 'shortage' | 'ordered'
  suppliers?: Supplier[]
}

interface Supplier {
  id: number
  name: string
  lead_time: number
  unit_price: number
}

interface MRPAnalysis {
  plan_id: number
  plan_name: string
  plan_number: string
  start_date: string
  end_date: string
  total_materials: number
  materials_with_shortage: number
  total_shortage_value: number
  generated_at: string
}

interface MaterialRequirementInput {
  organization_id: number
  production_plan_id?: number
  forecast_id?: number
  start_date?: string
  end_date?: string
}

export const MRPPage: React.FC = () => {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [materials, setMaterials] = useState<MaterialRequirement[]>([])
  const [analysis, setAnalysis] = useState<MRPAnalysis | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'sufficient' | 'shortage' | 'ordered'>('all')
  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null)
  const [startDate, setStartDate] = useState(formatDate(new Date().setDate(1), 'YYYY-MM-DD'))
  const [endDate, setEndDate] = useState(formatDate(new Date(), 'YYYY-MM-DD'))

  const fetchMRP = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const [materialsRes, analysisRes] = await Promise.all([
        api.get<{ data: MaterialRequirement[] }>('/planning/mrp/requirements', {
          params: {
            organization_id: user?.organizationId,
            production_plan_id: selectedPlanId || undefined,
            status: statusFilter === 'all' ? undefined : statusFilter,
            per_page: 50,
          },
        }),
        api.get<MRPAnalysis>('/planning/mrp/latest-analysis', {
          params: {
            organization_id: user?.organizationId,
          },
        }),
      ])

      setMaterials(materialsRes.data.data || [])
      setAnalysis(analysisRes.data)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch MRP data')
      console.error('Failed to fetch MRP:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchMRP()
  }, [selectedPlanId, statusFilter])

  const handleGenerateMRP = async () => {
    try {
      setIsGenerating(true)
      setError(null)

      const input: MaterialRequirementInput = {
        organization_id: user!.organizationId!,
        production_plan_id: selectedPlanId || undefined,
        start_date: startDate,
        end_date: endDate,
      }

      const response = await api.post<{ data: MaterialRequirement[]; analysis: MRPAnalysis }>('/planning/mrp/generate', input)

      setMaterials(response.data.data || [])
      setAnalysis(response.data.analysis)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to generate MRP')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleCreatePurchaseOrder = async (material: MaterialRequirement) => {
    try {
      const response = await api.post('/procurement/purchase-orders', {
        organization_id: user?.organizationId,
        supplier_id: material.suppliers?.[0]?.id,
        items: [
          {
            raw_material_id: material.raw_material_id,
            quantity: material.shortage_quantity,
            unit_price: material.suppliers?.[0]?.unit_price || 0,
          },
        ],
        expected_delivery_date: new Date(Date.now() + material.lead_time_days * 24 * 60 * 60 * 1000)
          .toISOString()
          .split('T')[0],
      })

      navigate(`/procurement/purchase-orders/${response.data.id}`)
    } catch (error) {
      console.error('Failed to create purchase order:', error)
    }
  }

  const filteredMaterials = materials.filter((material) => {
    const matchesSearch =
      searchTerm === '' ||
      material.raw_material_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      material.raw_material_name.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      sufficient: 'bg-green-100 text-green-800',
      shortage: 'bg-red-100 text-red-800',
      ordered: 'bg-blue-100 text-blue-800',
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const shortageMaterials = materials.filter((m) => m.status === 'shortage')
  const totalShortageValue = shortageMaterials.reduce(
    (sum, m) => sum + (m.suppliers?.[0]?.unit_price || 0) * m.shortage_quantity,
    0
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Material Requirements Planning</h1>
          <p className="text-gray-600">Manage material requirements and procurement</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<RefreshCw className="w-4 h-4" />}
            onClick={fetchMRP}
            isLoading={isLoading}
          >
            Refresh
          </Button>
        </div>
      </div>

      {error && <Alert variant="error" message={error} />}

      <Card variant="bordered" padding="lg">
        <CardHeader>
          <CardTitle>Generate MRP</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Production Plan</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  value={selectedPlanId || ''}
                  onChange={(e) => setSelectedPlanId(e.target.value ? parseInt(e.target.value) : null)}
                >
                  <option value="">Select Plan</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
              </div>
            </div>
            <Button
              variant="primary"
              leftIcon={<Package className="w-4 h-4" />}
              onClick={handleGenerateMRP}
              isLoading={isGenerating}
              disabled={isGenerating || (!selectedPlanId && !startDate && !endDate)}
            >
              Generate MRP
            </Button>
          </div>
        </CardContent>
      </Card>

      {analysis && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card variant="bordered" padding="lg">
            <div className="text-center">
              <Package className="w-6 h-6 text-primary-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-600 mb-1">Total Materials</p>
              <h3 className="text-2xl font-bold text-gray-900">{analysis.total_materials}</h3>
            </div>
          </Card>
          <Card variant="bordered" padding="lg">
            <div className="text-center">
              <AlertTriangle className="w-6 h-6 text-error-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-600 mb-1">With Shortage</p>
              <h3 className="text-2xl font-bold text-error-600">{analysis.materials_with_shortage}</h3>
            </div>
          </Card>
          <Card variant="bordered" padding="lg">
            <div className="text-center">
              <Calendar className="w-6 h-6 text-warning-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-600 mb-1">Total Shortage Value</p>
              <h3 className="text-2xl font-bold text-warning-600">₹{formatNumber(totalShortageValue)}</h3>
            </div>
          </Card>
          <Card variant="bordered" padding="lg">
            <div className="text-center">
              <CheckCircle className="w-6 h-6 text-success-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-600 mb-1">Sufficient</p>
              <h3 className="text-2xl font-bold text-success-600">
                {analysis.total_materials - analysis.materials_with_shortage}
              </h3>
            </div>
          </Card>
        </div>
      )}

      <Card variant="bordered" padding="md">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Search materials..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            {(['all', 'sufficient', 'shortage', 'ordered'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  statusFilter === status
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </Card>

      <Card variant="bordered" padding="lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Material Requirements</CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" leftIcon={<Printer className="w-4 h-4" />} onClick={() => window.print()}>
                Print
              </Button>
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Download className="w-4 h-4" />}
                onClick={() => {
                  const csvContent =
                    'data:text/csv;charset=utf-8,' +
                    'Material Code,Material Name,Current Stock,Required,Shortage,Unit,Lead Time (Days),Status\n' +
                    filteredMaterials
                      .map(
                        (m) =>
                          `${m.raw_material_code},"${m.raw_material_name}",${m.current_stock},${m.required_quantity},${m.shortage_quantity},${m.unit},${m.lead_time_days},${m.status}`
                      )
                      .join('\n')
                  const link = document.createElement('a')
                  link.setAttribute('href', encodeURI(csvContent))
                  link.setAttribute('download', 'mrp-requirements.csv')
                  document.body.appendChild(link)
                  link.click()
                  document.body.removeChild(link)
                }}
              >
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} height={120} className="rounded" />
              ))}
            </div>
          ) : filteredMaterials.length === 0 ? (
            <div className="text-center py-8">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">No material requirements found</p>
              <Button
                variant="primary"
                size="sm"
                leftIcon={<Package className="w-4 h-4" />}
                onClick={handleGenerateMRP}
              >
                Generate MRP
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Material</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Current Stock</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Required</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Shortage</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Lead Time</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Status</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredMaterials.map((material) => (
                    <tr
                      key={material.id}
                      className={`hover:bg-gray-50 ${
                        material.status === 'shortage' ? 'bg-red-50' : material.status === 'sufficient' ? 'bg-green-50' : ''
                      }`}
                    >
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-gray-900">{material.raw_material_name}</p>
                          <p className="text-sm text-gray-600">{material.raw_material_code}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <p className="font-medium text-gray-900">{formatNumber(material.current_stock)} {material.unit}</p>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <p className="font-medium text-primary-600">{formatNumber(material.required_quantity)} {material.unit}</p>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <p className={`font-semibold ${material.shortage_quantity > 0 ? 'text-error-600' : 'text-success-600'}`}>
                          {formatNumber(material.shortage_quantity)} {material.unit}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <p className="text-sm text-gray-900">{material.lead_time_days} days</p>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(material.status)}`}>
                          {material.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {material.status === 'shortage' && material.suppliers && material.suppliers.length > 0 && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCreatePurchaseOrder(material)}
                          >
                            Order
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {shortageMaterials.length > 0 && (
        <Card variant="bordered" padding="lg" className="border-error-200">
          <CardHeader>
            <div className="flex items-center gap-2 text-error-800">
              <AlertTriangle className="w-5 h-5" />
              <CardTitle className="text-error-900">Critical Shortages</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              The following materials have shortages that need immediate attention to avoid production delays.
            </p>
            <div className="space-y-3">
              {shortageMaterials.slice(0, 5).map((material) => (
                <div key={material.id} className="flex items-center justify-between p-3 bg-error-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{material.raw_material_name}</p>
                    <p className="text-sm text-gray-600">{material.raw_material_code}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-xs text-gray-500">Shortage</p>
                      <p className="font-semibold text-error-600">
                        {formatNumber(material.shortage_quantity)} {material.unit}
                      </p>
                    </div>
                    {material.suppliers && material.suppliers.length > 0 && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleCreatePurchaseOrder(material)}
                      >
                        Order Now
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default MRPPage

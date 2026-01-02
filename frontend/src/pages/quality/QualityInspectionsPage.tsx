import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '@/services/api'
import { DryMixProductTest, RawMaterialTest, Product, PaginatedResponse } from '@/types'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { StatusBadge, TestResultBadge } from '@/components/ui/Badge'
import { Modal, ModalFooter, ModalBody } from '@/components/ui/Modal'
import { FullPageLoading, LoadingOverlay } from '@/components/ui/Loading'
import { Input } from '@/components/ui/Input'
import { Loader2, Plus, Search, Filter, RefreshCw, Eye, FileText, FlaskConical, CheckCircle, XCircle, AlertTriangle } from 'lucide-react'
import { formatDate, formatNumber, cn } from '@/utils'
import { toast } from 'sonner'

// Quality Inspections Page
export const QualityInspectionsPage: React.FC = () => {
  const navigate = useNavigate()

  // State
  const [tests, setTests] = useState<(DryMixProductTest | RawMaterialTest)[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Filters & Pagination
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [resultFilter, setResultFilter] = useState<string>('')
  const [activeTab, setActiveTab] = useState<'all' | 'dry_mix' | 'raw_material'>('all')

  // Modal State
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [selectedTest, setSelectedTest] = useState<DryMixProductTest | RawMaterialTest | null>(null)

  // Form State
  const [formData, setFormData] = useState({
    test_date: new Date().toISOString().split('T')[0],
    product_id: '',
    batch_id: '',
    type: 'dry_mix' as 'dry_mix' | 'raw_material',
    // Dry Mix Test Parameters
    compressive_strength_1_day: '',
    compressive_strength_3_day: '',
    compressive_strength_7_day: '',
    compressive_strength_28_day: '',
    flexural_strength: '',
    adhesion_strength: '',
    setting_time_initial: '',
    setting_time_final: '',
    water_demand: '',
    water_retention: '',
    flow_diameter: '',
    bulk_density: '',
    air_content: '',
    // Raw Material Test Parameters
    sio2: '',
    al2o3: '',
    fe2o3: '',
    cao: '',
    mgo: '',
    so3: '',
    k2o: '',
    na2o: '',
    cl: '',
    moisture_content: '',
    loss_on_ignition: '',
    specific_gravity: '',
    bulk_density_rm: '',
    particle_size_d50: '',
    particle_size_d90: '',
    particle_size_d98: '',
    blaine_fineness: '',
    remarks: '',
    recommendations: '',
    standard_reference: '',
  })
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Fetch Data
  const fetchData = async () => {
    try {
      const [testsRes, productsRes] = await Promise.all([
        typeFilter === 'dry_mix'
          ? api.get<PaginatedResponse<DryMixProductTest>>('/quality/dry-mix-product-tests', {
              params: { page: 1, per_page: 50, search: searchTerm, status: statusFilter },
            })
          : typeFilter === 'raw_material'
          ? api.get<PaginatedResponse<RawMaterialTest>>('/quality/raw-material-tests', {
              params: { page: 1, per_page: 50, search: searchTerm, status: statusFilter },
            })
          : Promise.resolve({ data: { data: [], meta: {} } }),
        api.get<Product[]>('/products'),
      ])

      const testsData = testsRes.data.data || []
      setTests(testsData)
      setProducts(productsRes.data.data || [])
    } catch (error) {
      console.error('Failed to fetch data:', error)
      toast.error('Failed to load data')
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  // Load Data on Mount
  React.useEffect(() => {
    fetchData()
  }, [])

  // Refresh Data
  const handleRefresh = () => {
    setIsRefreshing(true)
    fetchData()
  }

  // Handle Search
  const handleSearch = () => {
    setIsLoading(true)
    fetchData()
  }

  // Handle Tab Change
  const handleTabChange = (tab: 'all' | 'dry_mix' | 'raw_material') => {
    setActiveTab(tab)
    setTypeFilter(tab === 'all' ? '' : tab)
    setIsLoading(true)
    fetchData()
  }

  // Validate Form
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}

    if (!formData.test_date) {
      errors.test_date = 'Test date is required'
    }

    if (!formData.product_id) {
      errors.product_id = 'Product is required'
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Handle Create Test
  const handleCreateTest = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      toast.error('Please fix errors in form')
      return
    }

    setIsSubmitting(true)
    try {
      const payload = {
        test_date: formData.test_date,
        product_id: parseInt(formData.product_id),
        batch_id: formData.batch_id ? parseInt(formData.batch_id) : null,
        // Parse numeric fields
        ...(formData.type === 'dry_mix' && {
          compressive_strength_1_day: formData.compressive_strength_1_day ? parseFloat(formData.compressive_strength_1_day) : null,
          compressive_strength_3_day: formData.compressive_strength_3_day ? parseFloat(formData.compressive_strength_3_day) : null,
          compressive_strength_7_day: formData.compressive_strength_7_day ? parseFloat(formData.compressive_strength_7_day) : null,
          compressive_strength_28_day: formData.compressive_strength_28_day ? parseFloat(formData.compressive_strength_28_day) : null,
          flexural_strength: formData.flexural_strength ? parseFloat(formData.flexural_strength) : null,
          adhesion_strength: formData.adhesion_strength ? parseFloat(formData.adhesion_strength) : null,
          setting_time_initial: formData.setting_time_initial ? parseFloat(formData.setting_time_initial) : null,
          setting_time_final: formData.setting_time_final ? parseFloat(formData.setting_time_final) : null,
          water_demand: formData.water_demand ? parseFloat(formData.water_demand) : null,
          water_retention: formData.water_retention ? parseFloat(formData.water_retention) : null,
          flow_diameter: formData.flow_diameter ? parseFloat(formData.flow_diameter) : null,
          bulk_density: formData.bulk_density ? parseFloat(formData.bulk_density) : null,
          air_content: formData.air_content ? parseFloat(formData.air_content) : null,
        }),
        ...(formData.type === 'raw_material' && {
          sio2: formData.sio2 ? parseFloat(formData.sio2) : null,
          al2o3: formData.al2o3 ? parseFloat(formData.al2o3) : null,
          fe2o3: formData.fe2o3 ? parseFloat(formData.fe2o3) : null,
          cao: formData.cao ? parseFloat(formData.cao) : null,
          mgo: formData.mgo ? parseFloat(formData.mgo) : null,
          so3: formData.so3 ? parseFloat(formData.so3) : null,
          k2o: formData.k2o ? parseFloat(formData.k2o) : null,
          na2o: formData.na2o ? parseFloat(formData.na2o) : null,
          cl: formData.cl ? parseFloat(formData.cl) : null,
          moisture_content: formData.moisture_content ? parseFloat(formData.moisture_content) : null,
          loss_on_ignition: formData.loss_on_ignition ? parseFloat(formData.loss_on_ignition) : null,
          specific_gravity: formData.specific_gravity ? parseFloat(formData.specific_gravity) : null,
          bulk_density_rm: formData.bulk_density_rm ? parseFloat(formData.bulk_density_rm) : null,
          particle_size_d50: formData.particle_size_d50 ? parseFloat(formData.particle_size_d50) : null,
          particle_size_d90: formData.particle_size_d90 ? parseFloat(formData.particle_size_d90) : null,
          particle_size_d98: formData.particle_size_d98 ? parseFloat(formData.particle_size_d98) : null,
          blaine_fineness: formData.blaine_fineness ? parseFloat(formData.blaine_fineness) : null,
        }),
        remarks: formData.remarks,
        recommendations: formData.recommendations,
        standard_reference: formData.standard_reference,
      }

      const endpoint = formData.type === 'dry_mix'
        ? '/quality/dry-mix-product-tests'
        : '/quality/raw-material-tests'

      const response = await api.post(endpoint, payload)
      setTests((prev) => [response.data, ...prev])
      setShowCreateModal(false)
      toast.success('Test created successfully')
    } catch (error: any) {
      console.error('Create test error:', error)
      toast.error(error.message || 'Failed to create test')
    } finally {
      setIsSubmitting(false)
    }
  }

  // View Test
  const viewTest = (test: DryMixProductTest | RawMaterialTest) => {
    setSelectedTest(test)
    setShowViewModal(true)
  }

  // Print Test
  const printTest = async (test: DryMixProductTest | RawMaterialTest) => {
    try {
      const endpoint = 'compressive_strength_28_day' in test
        ? '/quality/dry-mix-product-tests'
        : '/quality/raw-material-tests'
      window.open(`/api/v1/print/${endpoint}/${test.id}`, '_blank')
    } catch (error) {
      toast.error('Failed to print test')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quality Tests</h1>
          <p className="text-gray-600">Manage quality inspections and tests</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />}
            onClick={handleRefresh}
          >
            Refresh
          </Button>
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => setShowCreateModal(true)}
          >
            New Test
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Card variant="bordered" padding="none">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => handleTabChange('all')}
              className={cn(
                'px-6 py-4 text-sm font-medium border-b-2 transition-colors',
                activeTab === 'all'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              )}
            >
              All Tests
            </button>
            <button
              onClick={() => handleTabChange('dry_mix')}
              className={cn(
                'px-6 py-4 text-sm font-medium border-b-2 transition-colors',
                activeTab === 'dry_mix'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              )}
            >
              Dry Mix Products
            </button>
            <button
              onClick={() => handleTabChange('raw_material')}
              className={cn(
                'px-6 py-4 text-sm font-medium border-b-2 transition-colors',
                activeTab === 'raw_material'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              )}
            >
              Raw Materials
            </button>
          </nav>
        </div>
      </Card>

      {/* Filters */}
      <Card variant="bordered" padding="md">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <Input
              placeholder="Search by test number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              leftIcon={<Search className="w-5 h-5" />}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>

          {/* Status Filter */}
          <div className="w-full lg:w-48">
            <select
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value)
                handleFilterChange?.()
              }}
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Tests Table */}
      <LoadingOverlay isLoading={isLoading || isRefreshing}>
        <Card variant="bordered" padding="none">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Test #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Test Date
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Result
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {tests.map((test) => (
                  <tr key={test.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-semibold text-gray-900">{test.test_number}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-900">{test.product?.name || '-'}</span>
                      {test.batch_id && (
                        <span className="ml-2 text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                          Batch: {test.batch_id}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-600">{formatDate(test.test_date)}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <StatusBadge status={test.status} size="sm" />
                    </td>
                    <td className="px-6 py-4 text-center">
                      {test.test_result && (
                        <TestResultBadge result={test.test_result} size="sm" />
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => viewTest(test)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        {test.test_result && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => printTest(test)}
                          >
                            <FileText className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Empty State */}
          {tests.length === 0 && (
            <div className="py-12 text-center">
              <FlaskConical className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No tests found
              </h3>
              <p className="text-gray-600 mb-4">
                Get started by creating your first quality test
              </p>
              <Button
                variant="primary"
                leftIcon={<Plus className="w-4 h-4" />}
                onClick={() => setShowCreateModal(true)}
              >
                Create Test
              </Button>
            </div>
          )}
        </Card>
      </LoadingOverlay>

      {/* Create Test Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create Quality Test"
        size="xl"
      >
        <form onSubmit={handleCreateTest}>
          <ModalBody>
            <div className="space-y-4">
              {/* Test Type Selection */}
              <div>
                <label className="block mb-1.5 text-sm font-medium text-gray-700">
                  Test Type <span className="text-error-600">*</span>
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="type"
                      value="dry_mix"
                      checked={formData.type === 'dry_mix'}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value as 'dry_mix' | 'raw_material' })}
                      className="w-4 h-4 text-primary-600"
                    />
                    <span className="text-sm">Dry Mix Product</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="type"
                      value="raw_material"
                      checked={formData.type === 'raw_material'}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value as 'dry_mix' | 'raw_material' })}
                      className="w-4 h-4 text-primary-600"
                    />
                    <span className="text-sm">Raw Material</span>
                  </label>
                </div>
              </div>

              {/* Test Date */}
              <Input
                type="date"
                name="test_date"
                label="Test Date"
                value={formData.test_date}
                onChange={(e) => setFormData({ ...formData, test_date: e.target.value })}
                error={formErrors.test_date}
                required
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Product */}
                <div>
                  <label className="block mb-1.5 text-sm font-medium text-gray-700">
                    Product <span className="text-error-600">*</span>
                  </label>
                  <select
                    className={cn(
                      "w-full px-4 py-2 rounded-lg border transition-all",
                      formErrors.product_id
                        ? "border-error-500 focus:ring-error-500 focus:border-error-500"
                        : "border-gray-300 focus:ring-primary-500 focus:border-primary-500"
                    )}
                    value={formData.product_id}
                    onChange={(e) => setFormData({ ...formData, product_id: e.target.value })}
                  >
                    <option value="">Select Product</option>
                    {products.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name}
                      </option>
                    ))}
                  </select>
                  {formErrors.product_id && (
                    <p className="mt-1 text-sm text-error-600">{formErrors.product_id}</p>
                  )}
                </div>

                {/* Batch ID */}
                <Input
                  type="number"
                  name="batch_id"
                  label="Batch ID (Optional)"
                  value={formData.batch_id}
                  onChange={(e) => setFormData({ ...formData, batch_id: e.target.value })}
                />
              </div>

              {/* Dry Mix Parameters */}
              {formData.type === 'dry_mix' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Dry Mix Test Parameters</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Input
                      type="number"
                      label="Compressive Strength (1 Day)"
                      value={formData.compressive_strength_1_day}
                      onChange={(e) => setFormData({ ...formData, compressive_strength_1_day: e.target.value })}
                      step="0.01"
                    />
                    <Input
                      type="number"
                      label="Compressive Strength (3 Day)"
                      value={formData.compressive_strength_3_day}
                      onChange={(e) => setFormData({ ...formData, compressive_strength_3_day: e.target.value })}
                      step="0.01"
                    />
                    <Input
                      type="number"
                      label="Compressive Strength (7 Day)"
                      value={formData.compressive_strength_7_day}
                      onChange={(e) => setFormData({ ...formData, compressive_strength_7_day: e.target.value })}
                      step="0.01"
                    />
                    <Input
                      type="number"
                      label="Compressive Strength (28 Day)"
                      value={formData.compressive_strength_28_day}
                      onChange={(e) => setFormData({ ...formData, compressive_strength_28_day: e.target.value })}
                      step="0.01"
                    />
                    <Input
                      type="number"
                      label="Flexural Strength (MPa)"
                      value={formData.flexural_strength}
                      onChange={(e) => setFormData({ ...formData, flexural_strength: e.target.value })}
                      step="0.01"
                    />
                    <Input
                      type="number"
                      label="Adhesion Strength (MPa)"
                      value={formData.adhesion_strength}
                      onChange={(e) => setFormData({ ...formData, adhesion_strength: e.target.value })}
                      step="0.01"
                    />
                    <Input
                      type="number"
                      label="Setting Time (Initial) (min)"
                      value={formData.setting_time_initial}
                      onChange={(e) => setFormData({ ...formData, setting_time_initial: e.target.value })}
                      step="0.1"
                    />
                    <Input
                      type="number"
                      label="Setting Time (Final) (min)"
                      value={formData.setting_time_final}
                      onChange={(e) => setFormData({ ...formData, setting_time_final: e.target.value })}
                      step="0.1"
                    />
                    <Input
                      type="number"
                      label="Water Demand (%)"
                      value={formData.water_demand}
                      onChange={(e) => setFormData({ ...formData, water_demand: e.target.value })}
                      step="0.1"
                    />
                    <Input
                      type="number"
                      label="Water Retention (%)"
                      value={formData.water_retention}
                      onChange={(e) => setFormData({ ...formData, water_retention: e.target.value })}
                      step="0.1"
                    />
                    <Input
                      type="number"
                      label="Flow Diameter (mm)"
                      value={formData.flow_diameter}
                      onChange={(e) => setFormData({ ...formData, flow_diameter: e.target.value })}
                      step="0.1"
                    />
                    <Input
                      type="number"
                      label="Bulk Density (kg/m³)"
                      value={formData.bulk_density}
                      onChange={(e) => setFormData({ ...formData, bulk_density: e.target.value })}
                      step="0.1"
                    />
                    <Input
                      type="number"
                      label="Air Content (%)"
                      value={formData.air_content}
                      onChange={(e) => setFormData({ ...formData, air_content: e.target.value })}
                      step="0.1"
                    />
                  </div>
                </div>
              )}

              {/* Raw Material Parameters */}
              {formData.type === 'raw_material' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Raw Material Test Parameters</h3>

                  {/* Chemical Analysis */}
                  <div>
                    <h4 className="text-md font-medium text-gray-700 mb-3">Chemical Analysis (%)</h4>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <Input
                        type="number"
                        label="SiO₂"
                        value={formData.sio2}
                        onChange={(e) => setFormData({ ...formData, sio2: e.target.value })}
                        step="0.01"
                      />
                      <Input
                        type="number"
                        label="Al₂O₃"
                        value={formData.al2o3}
                        onChange={(e) => setFormData({ ...formData, al2o3: e.target.value })}
                        step="0.01"
                      />
                      <Input
                        type="number"
                        label="Fe₂O₃"
                        value={formData.fe2o3}
                        onChange={(e) => setFormData({ ...formData, fe2o3: e.target.value })}
                        step="0.01"
                      />
                      <Input
                        type="number"
                        label="CaO"
                        value={formData.cao}
                        onChange={(e) => setFormData({ ...formData, cao: e.target.value })}
                        step="0.01"
                      />
                      <Input
                        type="number"
                        label="MgO"
                        value={formData.mgo}
                        onChange={(e) => setFormData({ ...formData, mgo: e.target.value })}
                        step="0.01"
                      />
                      <Input
                        type="number"
                        label="SO₃"
                        value={formData.so3}
                        onChange={(e) => setFormData({ ...formData, so3: e.target.value })}
                        step="0.01"
                      />
                      <Input
                        type="number"
                        label="K₂O"
                        value={formData.k2o}
                        onChange={(e) => setFormData({ ...formData, k2o: e.target.value })}
                        step="0.01"
                      />
                      <Input
                        type="number"
                        label="Na₂O"
                        value={formData.na2o}
                        onChange={(e) => setFormData({ ...formData, na2o: e.target.value })}
                        step="0.01"
                      />
                      <Input
                        type="number"
                        label="Cl"
                        value={formData.cl}
                        onChange={(e) => setFormData({ ...formData, cl: e.target.value })}
                        step="0.01"
                      />
                    </div>
                  </div>

                  {/* Physical Properties */}
                  <div>
                    <h4 className="text-md font-medium text-gray-700 mb-3">Physical Properties</h4>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <Input
                        type="number"
                        label="Moisture Content (%)"
                        value={formData.moisture_content}
                        onChange={(e) => setFormData({ ...formData, moisture_content: e.target.value })}
                        step="0.01"
                      />
                      <Input
                        type="number"
                        label="Loss on Ignition (%)"
                        value={formData.loss_on_ignition}
                        onChange={(e) => setFormData({ ...formData, loss_on_ignition: e.target.value })}
                        step="0.01"
                      />
                      <Input
                        type="number"
                        label="Specific Gravity"
                        value={formData.specific_gravity}
                        onChange={(e) => setFormData({ ...formData, specific_gravity: e.target.value })}
                        step="0.01"
                      />
                      <Input
                        type="number"
                        label="Bulk Density (kg/m³)"
                        value={formData.bulk_density_rm}
                        onChange={(e) => setFormData({ ...formData, bulk_density_rm: e.target.value })}
                        step="0.1"
                      />
                    </div>
                  </div>

                  {/* Particle Size */}
                  <div>
                    <h4 className="text-md font-medium text-gray-700 mb-3">Particle Size (µm)</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Input
                        type="number"
                        label="D50"
                        value={formData.particle_size_d50}
                        onChange={(e) => setFormData({ ...formData, particle_size_d50: e.target.value })}
                        step="0.1"
                      />
                      <Input
                        type="number"
                        label="D90"
                        value={formData.particle_size_d90}
                        onChange={(e) => setFormData({ ...formData, particle_size_d90: e.target.value })}
                        step="0.1"
                      />
                      <Input
                        type="number"
                        label="D98"
                        value={formData.particle_size_d98}
                        onChange={(e) => setFormData({ ...formData, particle_size_d98: e.target.value })}
                        step="0.1"
                      />
                      <Input
                        type="number"
                        label="Blaine Fineness (cm²/g)"
                        value={formData.blaine_fineness}
                        onChange={(e) => setFormData({ ...formData, blaine_fineness: e.target.value })}
                        step="0.1"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Remarks & Recommendations */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1.5 text-sm font-medium text-gray-700">
                    Remarks
                  </label>
                  <textarea
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                    rows={3}
                    value={formData.remarks}
                    onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                    placeholder="Enter remarks"
                  />
                </div>
                <div>
                  <label className="block mb-1.5 text-sm font-medium text-gray-700">
                    Recommendations
                  </label>
                  <textarea
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                    rows={3}
                    value={formData.recommendations}
                    onChange={(e) => setFormData({ ...formData, recommendations: e.target.value })}
                    placeholder="Enter recommendations"
                  />
                </div>
              </div>

              {/* Standard Reference */}
              <Input
                label="Standard Reference"
                value={formData.standard_reference}
                onChange={(e) => setFormData({ ...formData, standard_reference: e.target.value })}
                placeholder="e.g., IS 456:2000"
              />
            </div>
          </ModalBody>

          <ModalFooter>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowCreateModal(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                isLoading={isSubmitting}
              >
                Create Test
              </Button>
            </div>
          </ModalFooter>
        </form>
      </Modal>

      {/* View Test Modal */}
      <Modal
        isOpen={showViewModal}
        onClose={() => setShowViewModal(false)}
        title={`Test #${selectedTest?.test_number}`}
        size="xl"
      >
        {selectedTest && (
          <>
            <ModalBody>
              <div className="space-y-6">
                {/* Test Details */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Product</p>
                    <p className="font-semibold text-gray-900">{selectedTest.product?.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Test Date</p>
                    <p className="font-semibold text-gray-900">{formatDate(selectedTest.test_date)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Status</p>
                    <StatusBadge status={selectedTest.status} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Result</p>
                    {selectedTest.test_result && <TestResultBadge result={selectedTest.test_result} />}
                  </div>
                </div>

                {/* Test Parameters */}
                {'compressive_strength_28_day' in selectedTest ? (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Dry Mix Test Parameters</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {selectedTest.compressive_strength_1_day && (
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <p className="text-xs text-gray-600">Compressive Strength (1 Day)</p>
                          <p className="font-semibold text-gray-900">{formatNumber(selectedTest.compressive_strength_1_day)} MPa</p>
                        </div>
                      )}
                      {selectedTest.compressive_strength_28_day && (
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <p className="text-xs text-gray-600">Compressive Strength (28 Day)</p>
                          <p className="font-semibold text-gray-900">{formatNumber(selectedTest.compressive_strength_28_day)} MPa</p>
                        </div>
                      )}
                      {selectedTest.flexural_strength && (
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <p className="text-xs text-gray-600">Flexural Strength</p>
                          <p className="font-semibold text-gray-900">{formatNumber(selectedTest.flexural_strength)} MPa</p>
                        </div>
                      )}
                      {selectedTest.adhesion_strength && (
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <p className="text-xs text-gray-600">Adhesion Strength</p>
                          <p className="font-semibold text-gray-900">{formatNumber(selectedTest.adhesion_strength)} MPa</p>
                        </div>
                      )}
                      {selectedTest.flow_diameter && (
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <p className="text-xs text-gray-600">Flow Diameter</p>
                          <p className="font-semibold text-gray-900">{formatNumber(selectedTest.flow_diameter)} mm</p>
                        </div>
                      )}
                      {selectedTest.bulk_density && (
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <p className="text-xs text-gray-600">Bulk Density</p>
                          <p className="font-semibold text-gray-900">{formatNumber(selectedTest.bulk_density)} kg/m³</p>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Raw Material Test Parameters</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {selectedTest.sio2 && (
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <p className="text-xs text-gray-600">SiO₂</p>
                          <p className="font-semibold text-gray-900">{formatNumber(selectedTest.sio2)}%</p>
                        </div>
                      )}
                      {selectedTest.cao && (
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <p className="text-xs text-gray-600">CaO</p>
                          <p className="font-semibold text-gray-900">{formatNumber(selectedTest.cao)}%</p>
                        </div>
                      )}
                      {selectedTest.so3 && (
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <p className="text-xs text-gray-600">SO₃</p>
                          <p className="font-semibold text-gray-900">{formatNumber(selectedTest.so3)}%</p>
                        </div>
                      )}
                      {selectedTest.cl && (
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <p className="text-xs text-gray-600">Cl</p>
                          <p className="font-semibold text-gray-900">{formatNumber(selectedTest.cl)}%</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Remarks & Recommendations */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedTest.remarks && (
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Remarks</h4>
                      <p className="text-sm text-gray-600">{selectedTest.remarks}</p>
                    </div>
                  )}
                  {selectedTest.recommendations && (
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <h4 className="text-sm font-medium text-blue-700 mb-2">Recommendations</h4>
                      <p className="text-sm text-blue-600">{selectedTest.recommendations}</p>
                    </div>
                  )}
                </div>

                {/* Test Result Status */}
                {selectedTest.test_result && (
                  <div className={cn(
                    "p-4 rounded-lg flex items-center gap-3",
                    selectedTest.test_result === 'pass' && "bg-success-50 border border-success-200",
                    selectedTest.test_result === 'fail' && "bg-error-50 border border-error-200",
                    selectedTest.test_result === 'marginal' && "bg-warning-50 border border-warning-200",
                  )}>
                    {selectedTest.test_result === 'pass' && <CheckCircle className="w-6 h-6 text-success-600" />}
                    {selectedTest.test_result === 'fail' && <XCircle className="w-6 h-6 text-error-600" />}
                    {selectedTest.test_result === 'marginal' && <AlertTriangle className="w-6 h-6 text-warning-600" />}
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900">
                        Test Result: {selectedTest.test_result.toUpperCase()}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {selectedTest.test_result === 'pass' && 'The product meets all quality standards.'}
                        {selectedTest.test_result === 'fail' && 'The product does not meet quality standards. Review recommendations.'}
                        {selectedTest.test_result === 'marginal' && 'The product marginally meets standards. Monitor closely.'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </ModalBody>

            <ModalFooter>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => printTest(selectedTest)}
                  leftIcon={<FileText className="w-4 h-4" />}
                >
                  Print Report
                </Button>
                <Button
                  variant="primary"
                  onClick={() => setShowViewModal(false)}
                >
                  Close
                </Button>
              </div>
            </ModalFooter>
          </>
        )}
      </Modal>
    </div>
  )
}

// Add placeholder for handleFilterChange
const handleFilterChange = () => {
  // Implement filter logic
}

export default QualityInspectionsPage

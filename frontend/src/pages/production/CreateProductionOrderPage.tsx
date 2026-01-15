import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { api } from '@/services/api'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Skeleton } from '@/components/ui/Loading'
import { Alert } from '@/components/ui/Alert'
import { ArrowLeft, Save, Plus, Package, Calendar, Search, Printer, Download } from 'lucide-react'
import { formatDate, formatNumber } from '@/utils'

interface Product {
  id: number
  name: string
  code: string
  specifications: any
}

interface Warehouse {
  id: number
  name: string
  code: string
}

interface BOMComponent {
  raw_material_id: number
  raw_material_code: string
  raw_material_name: string
  quantity: number
  unit: string
  unit_cost: number
}

interface ProductionPlan {
  id: number
  plan_number: string
  plan_name: string
  target_quantity: number
  uom: string
}

export default function CreateProductionOrderPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const [products, setProducts] = useState<Product[]>([])
  const [warehouses, setWarehouses] = useState<Warehouse[]>([])
  const [plans, setPlans] = useState<ProductionPlan[]>([])

  const [formData, setFormData] = useState({
    product_id: '',
    plan_id: '',
    warehouse_id: '',
    order_number: `PO-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`,
    order_date: new Date().toISOString().split('T')[0],
    target_quantity: 0,
    uom: 'MT',
    priority: 'normal',
    start_date: '',
    end_date: '',
    notes: '',
  })

  const [components, setComponents] = useState<BOMComponent[]>([])
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)

  useEffect(() => {
    fetchDropdowns()
  }, [])

  const fetchDropdowns = async () => {
    try {
      setIsLoading(true)
      const [productsRes, warehousesRes, plansRes] = await Promise.all([
        api.get<{ data: Product[] }>('/products', { params: { organization_id: user?.organizationId } }),
        api.get<{ data: Warehouse[] }>('/inventory/warehouses', { params: { organization_id: user?.organizationId } }),
        api.get<{ data: ProductionPlan[] }>('/planning/production-plans', { params: { organization_id: user?.organizationId } }),
      ])
      setProducts(productsRes.data.data || [])
      setWarehouses(warehousesRes.data.data || [])
      setPlans(plansRes.data.data || [])
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load dropdown data')
    } finally {
      setIsLoading(false)
    }
  }

  const handleProductChange = async (productId: string) => {
    const product = products.find(p => p.id.toString() === productId)
    setSelectedProduct(product || null)

    if (product?.specifications?.bom_components) {
      setComponents(product.specifications.bom_components)
    } else {
      setComponents([])
    }
  }

  const handleSubmit = async () => {
    if (!formData.product_id || !formData.warehouse_id || !formData.target_quantity) {
      setError('Please fill in all required fields')
      return
    }

    setIsSaving(true)
    setError(null)

    try {
      const response = await api.post('/production/production-orders', {
        organization_id: user?.organizationId,
        ...formData,
        product_id: parseInt(formData.product_id),
        plan_id: formData.plan_id ? parseInt(formData.plan_id) : null,
        warehouse_id: parseInt(formData.warehouse_id),
        bom_components: components,
      })

      if (response.data.success) {
        setSuccess(true)
        setTimeout(() => {
          navigate(`/production/production-orders/${response.data.id}`)
        }, 2000)
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create production order')
    } finally {
      setIsSaving(false)
    }
  }

  const calculateMaterialRequirements = () => {
    return components.map(comp => ({
      ...comp,
      required_quantity: comp.quantity * formData.target_quantity,
    }))
  }

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto p-8">
        <Skeleton height={200} className="rounded mb-6" />
        <Skeleton height={400} className="rounded" />
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<ArrowLeft className="w-4 h-4" />}
            onClick={() => navigate('/production/production-orders')}
          >
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Create Production Order</h1>
            <p className="text-gray-600">
              Create a new production order for product manufacturing
            </p>
          </div>
        </div>
        <Button
          variant="primary"
          leftIcon={<Save className="w-4 h-4" />}
          onClick={handleSubmit}
          isLoading={isSaving}
        >
          Create Order
        </Button>
      </div>

      {error && <Alert type="error" message={error} onDismiss={() => setError(null)} />}
      {success && (
        <Alert
          type="success"
          message="Production order created successfully! Redirecting..."
          onDismiss={() => setSuccess(false)}
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <Card variant="bordered" padding="lg">
            <div className="flex items-center gap-3 mb-6">
              <Package className="w-6 h-6 text-primary-600" />
              <h3 className="text-lg font-semibold text-gray-900">
                Product Information
              </h3>
            </div>
            <div className="space-y-4">
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
                name="plan_id"
                type="select"
                label="Production Plan (Optional)"
                value={formData.plan_id}
                onChange={(e) => setFormData({ ...formData, plan_id: e.target.value })}
                options={[{ value: '', label: 'No Plan' }, ...plans.map(p => ({ value: p.id.toString(), label: p.plan_name }))]}
              />
              <Input
                name="warehouse_id"
                type="select"
                label="Warehouse *"
                value={formData.warehouse_id}
                onChange={(e) => setFormData({ ...formData, warehouse_id: e.target.value })}
                options={warehouses.map(w => ({ value: w.id.toString(), label: w.name }))}
                required
              />
              <Input
                name="order_number"
                type="text"
                label="Order Number"
                value={formData.order_number}
                onChange={(e) => setFormData({ ...formData, order_number: e.target.value })}
                readonly
              />
            </div>
          </Card>

          <Card variant="bordered" padding="lg">
            <div className="flex items-center gap-3 mb-6">
              <Calendar className="w-6 h-6 text-primary-600" />
              <h3 className="text-lg font-semibold text-gray-900">
                Schedule Information
              </h3>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  name="order_date"
                  type="date"
                  label="Order Date *"
                  value={formData.order_date}
                  onChange={(e) => setFormData({ ...formData, order_date: e.target.value })}
                  required
                />
                <Input
                  name="start_date"
                  type="date"
                  label="Start Date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  name="end_date"
                  type="date"
                  label="End Date"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                />
                <Input
                  name="priority"
                  type="select"
                  label="Priority"
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  options={[
                    { value: 'low', label: 'Low' },
                    { value: 'normal', label: 'Normal' },
                    { value: 'high', label: 'High' },
                    { value: 'urgent', label: 'Urgent' },
                  ]}
                />
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card variant="bordered" padding="lg">
            <div className="flex items-center gap-3 mb-6">
              <Plus className="w-6 h-6 text-primary-600" />
              <h3 className="text-lg font-semibold text-gray-900">
                Quantity Details
              </h3>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  name="target_quantity"
                  type="number"
                  label="Target Quantity *"
                  placeholder="0"
                  value={formData.target_quantity}
                  onChange={(e) => setFormData({ ...formData, target_quantity: parseInt(e.target.value) || 0 })}
                  required
                />
                <Input
                  name="uom"
                  type="select"
                  label="Unit of Measure"
                  value={formData.uom}
                  onChange={(e) => setFormData({ ...formData, uom: e.target.value })}
                  options={[
                    { value: 'MT', label: 'Metric Ton' },
                    { value: 'KG', label: 'Kilogram' },
                    { value: 'BAG', label: 'Bags' },
                    { value: 'PCT', label: 'Pieces' },
                  ]}
                />
              </div>
              <Input
                name="notes"
                type="textarea"
                label="Notes"
                placeholder="Enter any additional notes..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={4}
              />
            </div>
          </Card>

          {components.length > 0 && (
            <Card variant="bordered" padding="lg">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  BOM Components ({components.length})
                </h3>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    leftIcon={<Printer className="w-4 h-4" />}
                    onClick={() => window.print()}
                  >
                    Print
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    leftIcon={<Download className="w-4 h-4" />}
                    onClick={() => {
                      const csvContent =
                        'data:text/csv;charset=utf-8,' +
                        'Material Code,Material Name,Quantity,Unit,Unit Cost,Required\n' +
                        calculateMaterialRequirements()
                          .map(m => `${m.raw_material_code},"${m.raw_material_name}",${m.quantity},${m.unit},${m.unit_cost},${m.required_quantity}`)
                          .join('\n')
                      const link = document.createElement('a')
                      link.setAttribute('href', encodeURI(csvContent))
                      link.setAttribute('download', 'bom-requirements.csv')
                      document.body.appendChild(link)
                      link.click()
                      document.body.removeChild(link)
                    }}
                  >
                    Export
                  </Button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Material</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Per Unit</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Required</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Cost</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {calculateMaterialRequirements().map((comp, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div>
                            <p className="font-medium text-gray-900">{comp.raw_material_name}</p>
                            <p className="text-sm text-gray-600">{comp.raw_material_code}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right">
                          {formatNumber(comp.quantity)} {comp.unit}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <p className="font-semibold text-primary-600">
                            {formatNumber(comp.required_quantity)} {comp.unit}
                          </p>
                        </td>
                        <td className="px-4 py-3 text-right">
                          ₹{(comp.unit_cost * comp.required_quantity).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50">
                    <tr>
                      <td colSpan={3} className="px-4 py-3 text-right font-semibold text-gray-900">
                        Total Estimated Cost
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-primary-600">
                        ₹{calculateMaterialRequirements()
                          .reduce((sum, c) => sum + c.unit_cost * c.required_quantity, 0)
                          .toFixed(2)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </Card>
          )}

          <Card variant="bordered" padding="lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Quick Actions
            </h3>
            <div className="space-y-3">
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
                onClick={() => navigate('/planning/production-plans')}
              >
                View Production Plans
              </Button>
              <Button
                variant="outline"
                className="w-full"
                leftIcon={<Calendar className="w-4 h-4" />}
                onClick={() => navigate('/production/batches')}
              >
                View Production Batches
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

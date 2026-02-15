import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { api } from '@/services/api'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { Skeleton } from '@/components/ui/Loading'
import { Alert } from '@/components/ui/Alert'
import { ArrowLeft, Edit, Download, Printer, Plus, Trash2, Package, Settings, BarChart3, Activity, Users } from 'lucide-react'
import { formatDate, formatNumber, formatCurrency } from '@/utils'

interface Product {
  id: number
  name: string
  code: string
  category: string
  unit: string
  base_price: number
  active: boolean
  specifications: any
  created_at: string
  updated_at: string
  bom_count?: number
  test_count?: number
}

export default function ProductDetailPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { user } = useAuth()
  const [product, setProduct] = useState<Product | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tab, setTab] = useState<'overview' | 'specifications' | 'production' | 'history'>('overview')

  useEffect(() => {
    fetchProduct()
  }, [id])

  const fetchProduct = async () => {
    try {
      const response = await api.get<{ data: Product }>(`/products/${id}`, {
        params: { organization_id: user?.organization_id }
      })
      setProduct(response.data)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load product')
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateStatus = async (active: boolean) => {
    try {
      await api.put(`/products/${id}/status`, { active })
      setProduct(prev => prev ? { ...prev, active } : null)
      alert('Product status updated successfully!')
    } catch (err) {
      console.error('Failed to update status:', err)
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

  if (error) {
    return (
      <div className="max-w-4xl mx-auto mt-8">
        <Alert type="error" message={error} />
        <div className="mt-4">
          <Button variant="outline" onClick={() => navigate('/products')}>
            Back to Products
          </Button>
        </div>
      </div>
    )
  }

  if (!product) return null

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-8">
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
            <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>
            <p className="text-gray-600">
              {product.code} | {product.category}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge status={product.active ? 'active' : 'inactive'} />
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Edit className="w-4 h-4" />}
            onClick={() => navigate(`/products/${id}/edit`)}
          >
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Download className="w-4 h-4" />}
            onClick={() => {
              const csvContent = `data:text/csv;charset=utf-8,Product Name,Code,Category,Unit,Base Price,Status,Created At\n"${product.name}",${product.code},${product.category},${product.unit},${product.base_price},${product.active ? 'Active' : 'Inactive'},${product.created_at}`
              const link = document.createElement('a')
              link.setAttribute('href', encodeURI(csvContent))
              link.setAttribute('download', `product-${product.code}.csv`)
              document.body.appendChild(link)
              link.click()
              document.body.removeChild(link)
            }}
          >
            Export
          </Button>
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Printer className="w-4 h-4" />}
            onClick={() => window.print()}
          >
            Print
          </Button>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex space-x-1 border-b border-gray-200">
          <button
            onClick={() => setTab('overview')}
            className={`px-4 py-2 text-sm font-medium ${
              tab === 'overview'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-gray-600 hover:text-primary-600'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setTab('specifications')}
            className={`px-4 py-2 text-sm font-medium ${
              tab === 'specifications'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-gray-600 hover:text-primary-600'
            }`}
          >
            Specifications
          </button>
          <button
            onClick={() => setTab('production')}
            className={`px-4 py-2 text-sm font-medium ${
              tab === 'production'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-gray-600 hover:text-primary-600'
            }`}
          >
            Production
          </button>
          <button
            onClick={() => setTab('history')}
            className={`px-4 py-2 text-sm font-medium ${
              tab === 'history'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-gray-600 hover:text-primary-600'
            }`}
          >
            History
          </button>
        </div>
      </div>

      {tab === 'overview' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <Card variant="bordered" padding="lg">
              <div className="text-center">
                <Package className="w-6 h-6 text-primary-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-600 mb-1">Base Price</p>
                <h3 className="text-2xl font-bold text-gray-900">
                  {formatCurrency(product.base_price)}
                </h3>
              </div>
            </Card>
            <Card variant="bordered" padding="lg">
              <div className="text-center">
                <Activity className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-600 mb-1">Status</p>
                <h3 className="text-2xl font-bold text-gray-900">
                  {product.active ? 'Active' : 'Inactive'}
                </h3>
              </div>
            </Card>
            <Card variant="bordered" padding="lg">
              <div className="text-center">
                <BarChart3 className="w-6 h-6 text-warning-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-600 mb-1">BOM Items</p>
                <h3 className="text-2xl font-bold text-gray-900">
                  {product.bom_count || 0}
                </h3>
              </div>
            </Card>
            <Card variant="bordered" padding="lg">
              <div className="text-center">
                <Users className="w-6 h-6 text-success-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-600 mb-1">Test Parameters</p>
                <h3 className="text-2xl font-bold text-gray-900">
                  {product.test_count || 0}
                </h3>
              </div>
            </Card>
          </div>

          <Card variant="bordered" padding="lg">
            <div className="flex items-center gap-3 mb-6">
              <Settings className="w-6 h-6 text-primary-600" />
              <h3 className="text-lg font-semibold text-gray-900">
                Product Actions
              </h3>
            </div>
            <div className="space-y-3">
              <Button
                variant="outline"
                className="w-full"
                leftIcon={<Edit className="w-4 h-4" />}
                onClick={() => navigate(`/products/${id}/edit`)}
              >
                Edit Product Details
              </Button>
              <Button
                variant="outline"
                className="w-full"
                leftIcon={<Activity className="w-4 h-4" />}
                onClick={() => navigate(`/quality/tests/create?product_id=${id}`)}
              >
                Create Test
              </Button>
              <Button
                variant="outline"
                className="w-full"
                leftIcon={<Package className="w-4 h-4" />}
                onClick={() => navigate(`/production/orders/create?product_id=${id}`)}
              >
                Create Production Order
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => navigate(`/documents?reference_id=${id}&reference_type=product`)}
              >
                View Documents
              </Button>
            </div>

            <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600 mb-3">
                {product.active
                  ? 'This product is active and can be used in production orders and sales orders.'
                  : 'This product is inactive and will not appear in dropdowns.'}
              </p>
              <div className="flex-1">
                {product.active ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleUpdateStatus(false)}
                  >
                    Deactivate
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleUpdateStatus(true)}
                  >
                    Activate
                  </Button>
                )}
              </div>
            </div>
          </Card>
        </>
      )}

      {tab === 'specifications' && (
        <Card variant="bordered" padding="lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">
            Product Specifications
          </h3>
          {product.specifications && typeof product.specifications === 'object' ? (
            <div className="space-y-6">
              {Object.entries(product.specifications).map(([key, value]: any) => (
                <div key={key} className="border border-gray-200 rounded-lg p-4">
                  <h4 className="text-md font-semibold text-gray-900 capitalize mb-3">
                    {key.replace(/_/g, ' ')}
                  </h4>
                  {key === 'bom_components' && Array.isArray(value) ? (
                    <div className="space-y-2">
                      <div className="grid grid-cols-4 gap-4">
                        {value.map((comp: any, i: number) => (
                          <div key={i} className="bg-gray-50 p-3 rounded">
                            <p className="text-sm text-gray-600">
                              {comp.raw_material_id}
                            </p>
                            <p className="text-sm text-gray-600">
                              {formatNumber(comp.quantity)} {comp.unit}
                            </p>
                            <p className="text-sm text-gray-600">
                              {formatCurrency(comp.unit_cost)}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : key === 'test_parameters' && Array.isArray(value) ? (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-gray-100">
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Parameter</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Test Method</th>
                            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Min</th>
                            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Max</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Unit</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {value.map((param: any, i: number) => (
                            <tr key={i}>
                              <td className="px-4 py-3">
                                <p className="text-sm font-medium text-gray-900">{param.parameter_name}</p>
                              </td>
                              <td className="px-4 py-3">
                                <p className="text-sm text-gray-600">{param.test_method}</p>
                              </td>
                              <td className="px-4 py-3 text-right">
                                <p className="text-sm text-gray-900">{param.min_value}</p>
                              </td>
                              <td className="px-4 py-3 text-right">
                                <p className="text-sm text-gray-900">{param.max_value}</p>
                              </td>
                              <td className="px-4 py-3 text-left">
                                <p className="text-sm text-gray-600">{param.unit}</p>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-sm text-gray-700">
                      <p>No specifications added yet</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Settings className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p>No specifications available</p>
            </div>
          )}
        </Card>
      )}

      {tab === 'production' && (
        <Card variant="bordered" padding="lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">
            Production History
          </h3>
          <div className="space-y-3">
            {product.production_orders && product.production_orders.length > 0 ? (
              product.production_orders.map((order, index) => (
                <div key={order.id || index} className="border border-gray-200 rounded-lg p-4 hover:border-primary-300 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Order Number</p>
                      <p className="font-semibold text-gray-900">{order.order_number}</p>
                    </div>
                    <StatusBadge status={order.status} />
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Production Date</p>
                      <p className="font-medium text-gray-900">{formatDate(order.production_date)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Quantity</p>
                      <p className="font-medium text-gray-900">{formatNumber(order.quantity)} {order.uom}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Batch</p>
                      <p className="font-medium text-gray-900">{order.batch_number || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Line</p>
                      <p className="font-medium text-gray-900">{order.production_line || 'N/A'}</p>
                    </div>
                  </div>
                  {order.notes && (
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Notes</p>
                      <p className="text-gray-700">{order.notes}</p>
                    </div>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => navigate(`/production/orders/${order.id}`)}
                  >
                    View Details
                  </Button>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="mb-4">No production history available</p>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => navigate(`/production/orders?product_id=${id}`)}
                >
                  Create Production Order
                </Button>
              </div>
            )}
          </div>
        </Card>
      )}

      {tab === 'history' && (
        <Card variant="bordered" padding="lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">
            Product History
          </h3>
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">
                Created On
              </p>
              <p className="text-sm text-gray-900">{formatDate(product.created_at)}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">
                Last Updated
              </p>
              <p className="text-sm text-gray-900">{formatDate(product.updated_at)}</p>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}

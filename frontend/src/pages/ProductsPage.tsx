import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { api } from '@/services/api'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { StatusBadge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Loading'
import { Plus, Search, RefreshCw, Package, Eye, Pencil, Trash2, Filter } from 'lucide-react'
import { formatCurrency, formatDate } from '@/utils'

interface Product {
  id: number
  product_code: string
  product_name: string
  product_type: string
  category: string
  price: number
  unit: string
  min_stock: number
  max_stock: number
  current_stock: number
  status: 'active' | 'inactive'
}

export const ProductsPage: React.FC = () => {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState<string>('all')
  const [page, setPage] = useState(1)

  const fetchProducts = async () => {
    try {
      setIsLoading(true)
      const response = await api.get<{ data: Product[] }>('/products', {
        params: {
          organization_id: user?.organization_id,
          per_page: 20,
          page,
        },
      })
      setProducts(response.data.data || [])
    } catch (error) {
      console.error('Failed to fetch products:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [page])

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      searchTerm === '' ||
      product.product_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.product_name.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesType = selectedType === 'all' || product.product_type === selectedType

    return matchesSearch && matchesType
  })

  const productTypes = ['all', 'non_shrink_grout', 'tile_adhesive', 'wall_plaster', 'block_jointing_mortar', 'wall_putty', 'other']

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-600">Manage product catalog and pricing</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => navigate('/products/create')}
          >
            New Product
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card variant="bordered" padding="md">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-600" />
            {productTypes.map((type) => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedType === type
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {type === 'all' ? 'All Types' : type.replace(/_/g, ' ').toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Products List */}
      <Card variant="bordered" padding="lg">
        <CardHeader>
          <CardTitle>Products</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} height={80} className="rounded" />
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-8">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">No products found</p>
              <Button
                variant="primary"
                size="sm"
                leftIcon={<Plus className="w-4 h-4" />}
                onClick={() => navigate('/products/create')}
              >
                Create First Product
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center justify-center w-12 h-12 bg-primary-100 rounded-lg">
                    <Package className="w-6 h-6 text-primary-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-gray-900">{product.product_code}</span>
                      <StatusBadge status={product.status} size="sm" />
                    </div>
                    <p className="text-sm font-medium text-gray-900">{product.product_name}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-600">
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full">
                        {product.category}
                      </span>
                      <span>•</span>
                      <span>{product.product_type.replace(/_/g, ' ')}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="space-y-1">
                      <div>
                        <p className="text-xs text-gray-500">Price</p>
                        <p className="font-semibold text-gray-900">{formatCurrency(product.price)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Stock</p>
                        <p className={`font-semibold ${
                          product.current_stock <= product.min_stock
                            ? 'text-error-600'
                            : 'text-success-600'
                        }`}>
                          {product.current_stock} {product.unit}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      leftIcon={<Eye className="w-4 h-4" />}
                      onClick={() => navigate(`/products/${product.id}`)}
                    >
                      View
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {products.length > 0 && (
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(page - 1)}>
            Previous
          </Button>
          <span className="px-4 py-2">Page {page}</span>
          <Button variant="outline" size="sm" onClick={() => setPage(page + 1)}>
            Next
          </Button>
        </div>
      )}
    </div>
  )
}

export default ProductsPage

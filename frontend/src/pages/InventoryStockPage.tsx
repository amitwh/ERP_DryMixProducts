import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { api } from '@/services/api'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { StatusBadge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Loading'
import { Plus, Search, RefreshCw, Package, TrendingUp, TrendingDown, ArrowRightLeft, ArrowRightLeft, Eye } from 'lucide-react'
import { formatCurrency, formatDate } from '@/utils'

interface StockItem {
  id: number
  product_code: string
  product_name: string
  current_stock: number
  unit: string
  min_stock: number
  max_stock: number
  warehouse: string
  last_updated: string
}

export const InventoryStockPage: React.FC = () => {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [stock, setStock] = useState<StockItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [page, setPage] = useState(1)

  const fetchStock = async () => {
    try {
      setIsLoading(true)
      const response = await api.get<{ data: StockItem[] }>('/inventory/stock', {
        params: {
          organization_id: user?.organizationId,
          per_page: 20,
          page,
        },
      })
      setStock(response.data.data || [])
    } catch (error) {
      console.error('Failed to fetch stock:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchStock()
  }, [page])

  const filteredStock = stock.filter((item) => {
    const matchesSearch =
      searchTerm === '' ||
      item.product_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.warehouse.toLowerCase().includes(searchTerm.toLowerCase())

    return matchesSearch
  })

  const lowStockItems = stock.filter((item) => item.current_stock <= item.min_stock)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventory Stock</h1>
          <p className="text-gray-600">Real-time stock levels across warehouses</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" leftIcon={<RefreshCw className="w-4 h-4" />} onClick={fetchStock} isLoading={isLoading}>
            Refresh
          </Button>
          <Button variant="primary" size="sm" leftIcon={<Plus className="w-4 h-4" />} onClick={() => navigate('/inventory/stock/create')}>
            New Entry
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card variant="bordered" padding="lg">
          <div className="text-center">
            <Package className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-600 mb-1">Total Products</p>
            <h3 className="text-2xl font-bold text-gray-900">{stock.length}</h3>
          </div>
        </Card>
        <Card variant="bordered" padding="lg">
          <div className="text-center">
            <TrendingUp className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-600 mb-1">Total Stock Value</p>
            <h3 className="text-2xl font-bold text-gray-900">₹25,00,000</h3>
          </div>
        </Card>
        <Card variant="bordered" padding="lg" className="border-orange-300 bg-orange-50">
          <div className="text-center">
            <TrendingDown className="w-8 h-8 text-orange-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-600 mb-1">Low Stock Items</p>
            <h3 className="text-2xl font-bold text-orange-600">{lowStockItems.length}</h3>
          </div>
        </Card>
        <Card variant="bordered" padding="lg" className="border-red-300 bg-red-50">
          <div className="text-center">
            <div className="w-8 h-8 text-red-600 mx-auto mb-2 flex items-center justify-center text-2xl">
              !
            </div>
            <p className="text-sm font-medium text-gray-600 mb-1">Out of Stock</p>
            <h3 className="text-2xl font-bold text-red-600">0</h3>
          </div>
        </Card>
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
        </div>
      </Card>

      {/* Stock Table */}
      <Card variant="bordered" padding="lg">
        <CardHeader>
          <CardTitle>Stock Levels</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} height={60} className="rounded" />)}
            </div>
          ) : filteredStock.length === 0 ? (
            <div className="text-center py-8">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No stock found</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredStock.map((item) => (
                <div
                  key={item.id}
                  className={`flex items-center gap-4 p-4 rounded-lg hover:bg-gray-50 transition-colors ${
                    item.current_stock <= item.min_stock
                      ? 'bg-orange-50 border-2 border-orange-300'
                      : 'bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-center w-10 h-10 bg-white rounded-full shadow">
                    <Package className="w-5 h-5 text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-gray-900">{item.product_code}</span>
                      <span className="text-sm text-gray-600">{item.product_name}</span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-600">
                      <span>Warehouse: {item.warehouse}</span>
                      <span>Updated: {formatDate(item.last_updated)}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="space-y-1">
                      <div>
                        <p className="text-xs text-gray-500">Stock</p>
                        <p
                          className={`font-semibold ${
                            item.current_stock <= item.min_stock ? 'text-orange-600' : 'text-gray-900'
                          }`}
                        >
                          {item.current_stock} {item.unit}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 justify-end">
                        <div>
                          <p className="text-xs text-gray-500">Min</p>
                          <p className="font-semibold text-gray-700">{item.min_stock}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Max</p>
                          <p className="font-semibold text-gray-700">{item.max_stock}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" leftIcon={<ArrowRightLeft className="w-4 h-4" />}>
                      Out
                    </Button>
                    <Button variant="outline" size="sm" leftIcon={<ArrowRightLeft className="w-4 h-4" />}>
                      In
                    </Button>
                    <Button variant="ghost" size="sm" leftIcon={<Eye className="w-4 h-4" />}>
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
      {stock.length > 0 && (
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

export default InventoryStockPage

import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { api } from '@/services/api'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Skeleton } from '@/components/ui/Loading'
import { Plus, Search, Package, AlertTriangle, TrendingUp, Warehouse } from 'lucide-react'
import { formatDate } from '@/utils'

interface InventoryItem {
  id: number
  product_code: string
  product_name: string
  category: string
  current_stock: number
  unit: string
  min_stock: number
  max_stock: number
  reorder_level: number
  avg_cost: number
  location?: string
  last_updated: string
}

export const InventoryStockPage: React.FC = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [items, setItems] = useState<InventoryItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [stockFilter, setStockFilter] = useState<'all' | 'low' | 'normal' | 'high'>('all')
  const [page, setPage] = useState(1)

  const fetchInventory = async () => {
    try {
      setIsLoading(true)
      const response = await api.get<{ data: InventoryItem[] }>('/inventory/stock', {
        params: {
          organization_id: user?.organization_id,
          per_page: 20,
          page,
        },
      })
      setItems(response.data.data || [])
    } catch (error) {
      console.error('Failed to fetch inventory:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchInventory()
  }, [page])

  const getStockStatus = (item: InventoryItem): 'low' | 'normal' | 'high' => {
    if (item.current_stock <= item.min_stock) return 'low'
    if (item.current_stock >= item.max_stock) return 'high'
    return 'normal'
  }

  const filteredItems = items.filter((item) => {
    const matchesSearch =
      searchTerm === '' ||
      item.product_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.product_name.toLowerCase().includes(searchTerm.toLowerCase())
    const stockStatus = getStockStatus(item)
    const matchesStock = stockFilter === 'all' || stockStatus === stockFilter
    return matchesSearch && matchesStock
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventory Stock</h1>
          <p className="text-gray-600">Monitor current inventory levels and stock status</p>
        </div>
        <Button
          variant="primary"
          size="sm"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => navigate('/inventory/transactions')}
        >
          Add Stock
        </Button>
      </div>

      <Card variant="bordered" padding="md">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Search inventory..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            {(['all', 'low', 'normal', 'high'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setStockFilter(filter)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  stockFilter === filter
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {filter === 'all' ? 'All' : filter}
              </button>
            ))}
          </div>
        </div>
      </Card>

      <Card variant="bordered" padding="lg">
        <CardHeader>
          <CardTitle>Inventory Items</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} height={90} className="rounded" />
              ))}
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-8">
              <Warehouse className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">No inventory items found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Product</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Category</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Current Stock</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Range</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Location</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.map((item) => {
                    const stockStatus = getStockStatus(item)
                    return (
                      <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                              <Package className="w-5 h-5 text-primary-600" />
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">{item.product_code}</p>
                              <p className="text-sm text-gray-600">{item.product_name}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                            {item.category}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <p className={`font-semibold ${stockStatus === 'low' ? 'text-error-600' : 'text-gray-900'}`}>
                            {item.current_stock} {item.unit}
                          </p>
                        </td>
                        <td className="py-3 px-4">
                          <p className="text-sm text-gray-600">
                            {item.min_stock} - {item.max_stock} {item.unit}
                          </p>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            {stockStatus === 'low' ? (
                              <span className="flex items-center gap-1 text-error-600">
                                <AlertTriangle className="w-4 h-4" />
                                <span className="text-sm font-medium">Low Stock</span>
                              </span>
                            ) : stockStatus === 'high' ? (
                              <span className="flex items-center gap-1 text-warning-600">
                                <TrendingUp className="w-4 h-4" />
                                <span className="text-sm font-medium">High Stock</span>
                              </span>
                            ) : (
                              <span className="flex items-center gap-1 text-success-600">
                                <div className="w-2 h-2 bg-success-500 rounded-full" />
                                <span className="text-sm font-medium">Normal</span>
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {item.location || '-'}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex items-center justify-center gap-2">
        <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(page - 1)}>
          Previous
        </Button>
        <span className="px-4 py-2">Page {page}</span>
        <Button variant="outline" size="sm" onClick={() => setPage(page + 1)}>
          Next
        </Button>
      </div>
    </div>
  )
}

export default InventoryStockPage

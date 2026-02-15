import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { api } from '@/services/api'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Skeleton } from '@/components/ui/Loading'
import { Plus, Search, ArrowUpRight, ArrowDownRight, Package, Calendar, User } from 'lucide-react'
import { formatDate } from '@/utils'

interface Movement {
  id: number
  movement_number: string
  movement_type: 'in' | 'out' | 'transfer' | 'adjustment'
  product_id: number
  product_name: string
  product_code: string
  quantity: number
  unit: string
  reference_type?: string
  reference_number?: string
  from_location?: string
  to_location?: string
  remarks?: string
  created_by?: string
  created_at: string
}

export const InventoryMovementsPage: React.FC = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [movements, setMovements] = useState<Movement[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState<'all' | 'in' | 'out' | 'transfer' | 'adjustment'>('all')
  const [page, setPage] = useState(1)

  const fetchMovements = async () => {
    try {
      setIsLoading(true)
      const response = await api.get<{ data: Movement[] }>('/inventory/movements', {
        params: {
          organization_id: user?.organization_id,
          per_page: 20,
          page,
        },
      })
      setMovements(response.data.data || [])
    } catch (error) {
      console.error('Failed to fetch movements:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchMovements()
  }, [page])

  const filteredMovements = movements.filter((movement) => {
    const matchesSearch =
      searchTerm === '' ||
      movement.movement_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      movement.product_name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = typeFilter === 'all' || movement.movement_type === typeFilter
    return matchesSearch && matchesType
  })

  const typeColors: Record<string, string> = {
    in: 'bg-green-100 text-green-800',
    out: 'bg-red-100 text-red-800',
    transfer: 'bg-blue-100 text-blue-800',
    adjustment: 'bg-yellow-100 text-yellow-800',
  }

  const typeIcons: Record<string, React.ReactNode> = {
    in: <ArrowDownRight className="w-4 h-4" />,
    out: <ArrowUpRight className="w-4 h-4" />,
    transfer: <ArrowDownRight className="w-4 h-4" />,
    adjustment: <ArrowDownRight className="w-4 h-4" />,
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventory Movements</h1>
          <p className="text-gray-600">Track all inventory stock movements and transactions</p>
        </div>
        <Button
          variant="primary"
          size="sm"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => navigate('/inventory/movements/create')}
        >
          Record Movement
        </Button>
      </div>

      <Card variant="bordered" padding="md">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Search movements..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            {(['all', 'in', 'out', 'transfer', 'adjustment'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setTypeFilter(type)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  typeFilter === type
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {type.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </Card>

      <Card variant="bordered" padding="lg">
        <CardHeader>
          <CardTitle>Movement History</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} height={100} className="rounded" />
              ))}
            </div>
          ) : filteredMovements.length === 0 ? (
            <div className="text-center py-8">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">No inventory movements found</p>
              <Button
                variant="primary"
                size="sm"
                leftIcon={<Plus className="w-4 h-4" />}
                onClick={() => navigate('/inventory/movements/create')}
              >
                Record First Movement
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredMovements.map((movement) => (
                <div
                  key={movement.id}
                  className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        movement.movement_type === 'in' ? 'bg-green-100' :
                        movement.movement_type === 'out' ? 'bg-red-100' :
                        movement.movement_type === 'transfer' ? 'bg-blue-100' : 'bg-yellow-100'
                      }`}>
                        {typeIcons[movement.movement_type]}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-gray-900">{movement.movement_number}</span>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${typeColors[movement.movement_type]}`}>
                            {movement.movement_type.toUpperCase()}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Package className="w-3 h-3" />
                          {movement.product_name} ({movement.product_code})
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold ${movement.movement_type === 'out' ? 'text-error-600' : 'text-success-600'}`}>
                        {movement.movement_type === 'out' ? '-' : '+'}{movement.quantity} {movement.unit}
                      </p>
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Calendar className="w-3 h-3" />
                        {formatDate(movement.created_at)}
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                    {movement.from_location && (
                      <div>
                        <span className="font-medium">From:</span> {movement.from_location}
                      </div>
                    )}
                    {movement.to_location && (
                      <div>
                        <span className="font-medium">To:</span> {movement.to_location}
                      </div>
                    )}
                    {movement.reference_number && (
                      <div>
                        <span className="font-medium">Ref:</span> {movement.reference_type} #{movement.reference_number}
                      </div>
                    )}
                    {movement.created_by && (
                      <div className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {movement.created_by}
                      </div>
                    )}
                  </div>
                  {movement.remarks && (
                    <div className="mt-2 text-sm text-gray-600">
                      <span className="font-medium">Remarks:</span> {movement.remarks}
                    </div>
                  )}
                </div>
              ))}
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

export default InventoryMovementsPage

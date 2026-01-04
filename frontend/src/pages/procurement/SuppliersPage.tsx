import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { api } from '@/services/api'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { StatusBadge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Loading'
import { Plus, Search, Building2, Phone, Mail, MapPin, Star, Package } from 'lucide-react'

interface Supplier {
  id: number
  supplier_code: string
  name: string
  contact_person?: string
  phone: string
  email?: string
  address: string
  category?: string
  rating?: number
  status: 'active' | 'inactive' | 'blocked'
  total_orders?: number
  total_supply?: number
  last_delivery?: string
  payment_terms?: string
}

export const SuppliersPage: React.FC = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'blocked'>('all')
  const [page, setPage] = useState(1)

  const fetchSuppliers = async () => {
    try {
      setIsLoading(true)
      const response = await api.get<{ data: Supplier[] }>('/procurement/suppliers', {
        params: {
          organization_id: user?.organizationId,
          per_page: 20,
          page,
        },
      })
      setSuppliers(response.data.data || [])
    } catch (error) {
      console.error('Failed to fetch suppliers:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchSuppliers()
  }, [page])

  const filteredSuppliers = suppliers.filter((supplier) => {
    const matchesSearch =
      searchTerm === '' ||
      supplier.supplier_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || supplier.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const renderStars = (rating?: number) => {
    if (!rating) return '-'
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${star <= rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`}
          />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Suppliers</h1>
          <p className="text-gray-600">Manage supplier information and relationships</p>
        </div>
        <Button
          variant="primary"
          size="sm"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => navigate('/procurement/suppliers/create')}
        >
          New Supplier
        </Button>
      </div>

      <Card variant="bordered" padding="md">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Search suppliers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            {(['all', 'active', 'inactive', 'blocked'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  statusFilter === status
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </Card>

      <Card variant="bordered" padding="lg">
        <CardHeader>
          <CardTitle>Supplier List</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} height={120} className="rounded" />
              ))}
            </div>
          ) : filteredSuppliers.length === 0 ? (
            <div className="text-center py-8">
              <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">No suppliers found</p>
              <Button
                variant="primary"
                size="sm"
                leftIcon={<Plus className="w-4 h-4" />}
                onClick={() => navigate('/procurement/suppliers/create')}
              >
                Add First Supplier
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredSuppliers.map((supplier) => (
                <div
                  key={supplier.id}
                  className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                        <Building2 className="w-5 h-5 text-primary-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-gray-900">{supplier.supplier_code}</span>
                          <StatusBadge status={supplier.status} size="sm" />
                        </div>
                        <p className="text-sm text-gray-600">{supplier.name}</p>
                        {supplier.contact_person && (
                          <p className="text-xs text-gray-500">{supplier.contact_person}</p>
                        )}
                      </div>
                    </div>
                    {supplier.rating && (
                      <div className="flex items-center gap-2">
                        {renderStars(supplier.rating)}
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Phone className="w-3 h-3" />
                      {supplier.phone}
                    </div>
                    {supplier.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="w-3 h-3" />
                        {supplier.email}
                      </div>
                    )}
                    {supplier.category && (
                      <div className="flex items-center gap-2">
                        <Package className="w-3 h-3" />
                        {supplier.category}
                      </div>
                    )}
                    {supplier.payment_terms && (
                      <div>
                        <span className="font-medium">Terms:</span> {supplier.payment_terms} days
                      </div>
                    )}
                  </div>

                  {supplier.address && (
                    <div className="flex items-start gap-2 text-sm text-gray-600">
                      <MapPin className="w-3 h-3 mt-0.5" />
                      <span className="line-clamp-2">{supplier.address}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-200 text-sm">
                    {supplier.total_orders && (
                      <div>
                        <span className="font-medium">Orders:</span> {supplier.total_orders}
                      </div>
                    )}
                    {supplier.total_supply && (
                      <div>
                        <span className="font-medium">Total Supply:</span> {supplier.total_supply} MT
                      </div>
                    )}
                    {supplier.last_delivery && (
                      <div>
                        <span className="font-medium">Last Delivery:</span> {supplier.last_delivery}
                      </div>
                    )}
                  </div>
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

export default SuppliersPage

import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { api } from '@/services/api'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { StatusBadge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Loading'
import { Plus, Search, Filter, DollarSign, Calendar, CheckCircle, Clock, XCircle } from 'lucide-react'
import { formatCurrency, formatDate } from '@/utils'

interface Collection {
  id: number
  collection_number: string
  customer_id: number
  customer_name: string
  customer_code: string
  amount: number
  payment_method: 'cash' | 'bank_transfer' | 'cheque' | 'upi' | 'card'
  reference_number?: string
  status: 'pending' | 'confirmed' | 'rejected' | 'bounced'
  collection_date: string
  invoice_numbers?: string[]
  notes?: string
  created_at: string
}

interface CollectionStats {
  total_collected: number
  pending_collections: number
  confirmed_today: number
  bounced_count: number
}

export const CollectionsPage: React.FC = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [collections, setCollections] = useState<Collection[]>([])
  const [stats, setStats] = useState<CollectionStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'confirmed' | 'rejected' | 'bounced'>('all')
  const [dateFilter, setDateFilter] = useState<'today' | 'week' | 'month' | 'all'>('all')

  const fetchCollections = async () => {
    try {
      setIsLoading(true)
      const response = await api.get<{ data: Collection[]; stats: CollectionStats }>('/credit-control/collections', {
        params: {
          organization_id: user?.organizationId,
          status: statusFilter === 'all' ? undefined : statusFilter,
          date_range: dateFilter === 'all' ? undefined : dateFilter,
        },
      })
      setCollections(response.data.data || [])
      setStats(response.data.stats || null)
    } catch (error) {
      console.error('Failed to fetch collections:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchCollections()
  }, [statusFilter, dateFilter])

  const filteredCollections = collections.filter((collection) => {
    const matchesSearch =
      searchTerm === '' ||
      collection.collection_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      collection.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (collection.reference_number && collection.reference_number.toLowerCase().includes(searchTerm.toLowerCase()))
    return matchesSearch
  })

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-600" />
      case 'rejected':
      case 'bounced':
        return <XCircle className="w-4 h-4 text-red-600" />
      default:
        return null
    }
  }

  const getPaymentMethodLabel = (method: string) => {
    const labels: Record<string, string> = {
      cash: 'Cash',
      bank_transfer: 'Bank Transfer',
      cheque: 'Cheque',
      upi: 'UPI',
      card: 'Card',
    }
    return labels[method] || method
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Collections</h1>
          <p className="text-gray-600">Track and manage payment collections</p>
        </div>
        <Button variant="primary" size="sm" leftIcon={<Plus className="w-4 h-4" />} onClick={() => navigate('/credit-control/collections/create')}>
          Record Collection
        </Button>
      </div>

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card variant="bordered" padding="md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Total Collected</p>
                <p className="text-xl font-bold text-gray-900">{formatCurrency(stats.total_collected)}</p>
              </div>
            </div>
          </Card>
          <Card variant="bordered" padding="md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Pending</p>
                <p className="text-xl font-bold text-yellow-600">{formatCurrency(stats.pending_collections)}</p>
              </div>
            </div>
          </Card>
          <Card variant="bordered" padding="md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Confirmed Today</p>
                <p className="text-xl font-bold text-gray-900">{formatCurrency(stats.confirmed_today)}</p>
              </div>
            </div>
          </Card>
          <Card variant="bordered" padding="md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <XCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Bounced</p>
                <p className="text-xl font-bold text-red-600">{stats.bounced_count}</p>
              </div>
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
                placeholder="Search by collection #, customer, or reference..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-600" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
              className="px-3 py-2 border rounded-lg text-sm"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="rejected">Rejected</option>
              <option value="bounced">Bounced</option>
            </select>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value as typeof dateFilter)}
              className="px-3 py-2 border rounded-lg text-sm"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
          </div>
        </div>
      </Card>

      <Card variant="bordered" padding="lg">
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} height={100} className="rounded" />
              ))}
            </div>
          ) : filteredCollections.length === 0 ? (
            <div className="text-center py-8">
              <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No collections found</p>
              <Button
                variant="primary"
                size="sm"
                className="mt-4"
                onClick={() => navigate('/credit-control/collections/create')}
              >
                Record First Collection
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredCollections.map((collection) => (
                <div
                  key={collection.id}
                  className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                  onClick={() => navigate(`/credit-control/collections/${collection.id}`)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                        <DollarSign className="w-5 h-5 text-primary-600" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-gray-900">{collection.collection_number}</span>
                          {getStatusIcon(collection.status)}
                          <StatusBadge status={collection.status} size="sm" />
                        </div>
                        <p className="text-sm text-gray-600">{collection.customer_name}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-gray-900">{formatCurrency(collection.amount)}</p>
                      <p className="text-xs text-gray-500">{getPaymentMethodLabel(collection.payment_method)}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(collection.collection_date)}</span>
                      </div>
                      {collection.reference_number && (
                        <span className="text-gray-600">Ref: {collection.reference_number}</span>
                      )}
                      {collection.invoice_numbers && collection.invoice_numbers.length > 0 && (
                        <span className="text-gray-600">Invoices: {collection.invoice_numbers.join(', ')}</span>
                      )}
                    </div>
                  </div>

                  {collection.notes && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <p className="text-sm text-gray-600">{collection.notes}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default CollectionsPage

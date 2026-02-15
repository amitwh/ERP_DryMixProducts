import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { api } from '@/services/api'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Skeleton } from '@/components/ui/Loading'
import { Plus, Search, Lock, Unlock, Edit, DollarSign } from 'lucide-react'
import { formatCurrency } from '@/utils'

interface CreditLimit {
  id: number
  customer_id: number
  customer_name: string
  customer_code: string
  credit_limit: number
  used_amount: number
  remaining_amount: number
  credit_score?: number
  payment_terms: string
  status: 'active' | 'inactive' | 'suspended'
  last_updated: string
}

export const CreditLimitsPage: React.FC = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [limits, setLimits] = useState<CreditLimit[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'suspended'>('all')
  const [page, setPage] = useState(1)

  const fetchLimits = async () => {
    try {
      setIsLoading(true)
      const response = await api.get<{ data: CreditLimit[] }>('/credit-control/limits', {
        params: {
          organization_id: user?.organization_id,
          per_page: 20,
          page,
        },
      })
      setLimits(response.data.data || [])
    } catch (error) {
      console.error('Failed to fetch credit limits:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchLimits()
  }, [page])

  const filteredLimits = limits.filter((limit) => {
    const matchesSearch =
      searchTerm === '' ||
      limit.customer_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      limit.customer_name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || limit.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Credit Limits</h1>
          <p className="text-gray-600">Manage customer credit limits and terms</p>
        </div>
        <Button
          variant="primary"
          size="sm"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => navigate('/credit-control/limits/create')}
        >
          Set Limit
        </Button>
      </div>

      <Card variant="bordered" padding="md">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Search credit limits..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            {(['all', 'active', 'inactive', 'suspended'] as const).map((status) => (
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
          <CardTitle>Credit Limits Management</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} height={120} className="rounded" />
              ))}
            </div>
          ) : filteredLimits.length === 0 ? (
            <div className="text-center py-8">
              <Lock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">No credit limits found</p>
              <Button
                variant="primary"
                size="sm"
                leftIcon={<Plus className="w-4 h-4" />}
                onClick={() => navigate('/credit-control/limits/create')}
              >
                Set First Limit
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Customer</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Credit Limit</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Used</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Available</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Utilization</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Payment Terms</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLimits.map((limit) => {
                    const utilization = limit.credit_limit > 0 ? (limit.used_amount / limit.credit_limit) * 100 : 0
                    return (
                      <tr key={limit.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-semibold text-gray-900">{limit.customer_name}</p>
                            <p className="text-sm text-gray-600">{limit.customer_code}</p>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1">
                            <DollarSign className="w-4 h-4 text-gray-400" />
                            <span className="font-semibold text-gray-900">{formatCurrency(limit.credit_limit)}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <p className={`font-semibold ${utilization >= 90 ? 'text-error-600' : 'text-gray-900'}`}>
                            {formatCurrency(limit.used_amount)}
                          </p>
                        </td>
                        <td className="py-3 px-4">
                          <p className={`font-semibold ${limit.remaining_amount > 0 ? 'text-success-600' : 'text-error-600'}`}>
                            {formatCurrency(limit.remaining_amount)}
                          </p>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <div className="w-24 bg-gray-200 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full ${
                                  utilization >= 90 ? 'bg-error-500' :
                                  utilization >= 70 ? 'bg-warning-500' : 'bg-success-500'
                                }`}
                                style={{ width: `${Math.min(utilization, 100)}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium">{utilization.toFixed(1)}%</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {limit.payment_terms} days
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            {limit.status === 'active' ? (
                              <Unlock className="w-4 h-4 text-success-600" />
                            ) : (
                              <Lock className="w-4 h-4 text-error-600" />
                            )}
                            <span className={`text-sm font-medium ${
                              limit.status === 'active' ? 'text-success-600' :
                              limit.status === 'suspended' ? 'text-error-600' : 'text-gray-600'
                            }`}>
                              {limit.status}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            leftIcon={<Edit className="w-4 h-4" />}
                            onClick={() => navigate(`/credit-control/limits/${limit.id}/edit`)}
                          >
                            Edit
                          </Button>
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

export default CreditLimitsPage

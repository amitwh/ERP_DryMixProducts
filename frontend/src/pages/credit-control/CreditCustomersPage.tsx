import React, { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { api } from '@/services/api'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Skeleton } from '@/components/ui/Loading'
import { Search, CreditCard, DollarSign, AlertTriangle, ShieldCheck } from 'lucide-react'
import { formatCurrency } from '@/utils'

interface CreditCustomer {
  id: number
  customer_code: string
  name: string
  credit_limit: number
  outstanding_balance: number
  available_credit: number
  credit_utilization: number
  payment_terms: string
  credit_score?: number
  status: 'active' | 'inactive' | 'blocked' | 'warning'
  last_payment_date?: string
  overdue_amount?: number
}

export const CreditCustomersPage: React.FC = () => {
  const { user } = useAuth()
  const [customers, setCustomers] = useState<CreditCustomer[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'blocked' | 'warning'>('all')
  const [page, setPage] = useState(1)

  const fetchCustomers = async () => {
    try {
      setIsLoading(true)
      const response = await api.get<{ data: CreditCustomer[] }>('/credit-control/customers', {
        params: {
          organization_id: user?.organization_id,
          per_page: 20,
          page,
        },
      })
      setCustomers(response.data.data || [])
    } catch (error) {
      console.error('Failed to fetch credit customers:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchCustomers()
  }, [page])

  const filteredCustomers = customers.filter((customer) => {
    const matchesSearch =
      searchTerm === '' ||
      customer.customer_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || customer.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: string, utilization: number) => {
    if (status === 'blocked') return 'bg-red-100 text-red-800'
    if (status === 'warning') return 'bg-yellow-100 text-yellow-800'
    if (utilization > 90) return 'bg-orange-100 text-orange-800'
    return 'bg-green-100 text-green-800'
  }

  const getUtilizationColor = (utilization: number) => {
    if (utilization >= 90) return 'text-error-600'
    if (utilization >= 70) return 'text-warning-600'
    return 'text-success-600'
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Credit Control</h1>
          <p className="text-gray-600">Monitor customer credit limits and outstanding balances</p>
        </div>
      </div>

      <Card variant="bordered" padding="md">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Search customers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            {(['all', 'active', 'warning', 'blocked'] as const).map((status) => (
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
          <CardTitle>Customer Credit Overview</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} height={140} className="rounded" />
              ))}
            </div>
          ) : filteredCustomers.length === 0 ? (
            <div className="text-center py-8">
              <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No credit customers found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredCustomers.map((customer) => (
                <div
                  key={customer.id}
                  className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                        <CreditCard className="w-5 h-5 text-primary-600" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-gray-900">{customer.customer_code}</span>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(customer.status, customer.credit_utilization)}`}>
                            {customer.status.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">{customer.name}</p>
                      </div>
                    </div>
                    {customer.credit_score && (
                      <div className="flex items-center gap-2">
                        <ShieldCheck className={`w-5 h-5 ${customer.credit_score >= 700 ? 'text-success-600' : customer.credit_score >= 500 ? 'text-warning-600' : 'text-error-600'}`} />
                        <span className="text-sm font-semibold text-gray-900">{customer.credit_score}</span>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Credit Limit</p>
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4 text-gray-400" />
                        <p className="font-semibold text-gray-900">{formatCurrency(customer.credit_limit)}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Outstanding</p>
                      <p className={`font-semibold ${customer.outstanding_balance > 0 ? 'text-error-600' : 'text-gray-900'}`}>
                        {formatCurrency(customer.outstanding_balance)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Available</p>
                      <p className={`font-semibold ${customer.available_credit > 0 ? 'text-success-600' : 'text-error-600'}`}>
                        {formatCurrency(customer.available_credit)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Utilization</p>
                      <p className={`font-semibold ${getUtilizationColor(customer.credit_utilization)}`}>
                        {customer.credit_utilization.toFixed(1)}%
                      </p>
                    </div>
                  </div>

                  <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        customer.credit_utilization >= 90 ? 'bg-error-500' :
                        customer.credit_utilization >= 70 ? 'bg-warning-500' : 'bg-success-500'
                      }`}
                      style={{ width: `${Math.min(customer.credit_utilization, 100)}%` }}
                    />
                  </div>

                  {(customer.overdue_amount && customer.overdue_amount > 0) && (
                    <div className="flex items-center gap-2 text-sm text-error-600 bg-error-50 p-2 rounded">
                      <AlertTriangle className="w-4 h-4" />
                      <span>Overdue: {formatCurrency(customer.overdue_amount)}</span>
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

export default CreditCustomersPage

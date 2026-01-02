import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { api } from '@/services/api'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { StatusBadge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Loading'
import { Plus, Search, Calendar, Target, Package, TrendingUp } from 'lucide-react'
import { formatDate } from '@/utils'

interface ProductionPlan {
  id: number
  plan_number: string
  plan_name: string
  start_date: string
  end_date: string
  product_id: number
  product_name: string
  planned_quantity: number
  unit: string
  status: 'draft' | 'approved' | 'in_progress' | 'completed' | 'cancelled'
  progress?: number
  manufacturing_unit?: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  created_by?: string
}

export const ProductionPlansPage: React.FC = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [plans, setPlans] = useState<ProductionPlan[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [page, setPage] = useState(1)

  const fetchPlans = async () => {
    try {
      setIsLoading(true)
      const response = await api.get<{ data: ProductionPlan[] }>('/planning/production-plans', {
        params: {
          organization_id: user?.organizationId,
          per_page: 20,
          page,
        },
      })
      setPlans(response.data.data || [])
    } catch (error) {
      console.error('Failed to fetch production plans:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchPlans()
  }, [page])

  const filteredPlans = plans.filter((plan) => {
    const matchesSearch =
      searchTerm === '' ||
      plan.plan_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plan.plan_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plan.product_name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || plan.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const priorityColors: Record<string, string> = {
    low: 'bg-gray-100 text-gray-800',
    medium: 'bg-blue-100 text-blue-800',
    high: 'bg-orange-100 text-orange-800',
    urgent: 'bg-red-100 text-red-800',
  }

  const getProgressColor = (progress?: number) => {
    if (!progress) return 'bg-gray-200'
    if (progress >= 100) return 'bg-success-500'
    if (progress >= 75) return 'bg-primary-500'
    if (progress >= 50) return 'bg-blue-500'
    return 'bg-warning-500'
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Production Plans</h1>
          <p className="text-gray-600">Manage production planning and scheduling</p>
        </div>
        <Button
          variant="primary"
          size="sm"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => navigate('/planning/production-plans/create')}
        >
          New Plan
        </Button>
      </div>

      <Card variant="bordered" padding="md">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Search production plans..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            {(['all', 'draft', 'approved', 'in_progress', 'completed', 'cancelled'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  statusFilter === status
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status.replace(/_/g, ' ')}
              </button>
            ))}
          </div>
        </div>
      </Card>

      <Card variant="bordered" padding="lg">
        <CardHeader>
          <CardTitle>Production Plans</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} height={140} className="rounded" />
              ))}
            </div>
          ) : filteredPlans.length === 0 ? (
            <div className="text-center py-8">
              <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">No production plans found</p>
              <Button
                variant="primary"
                size="sm"
                leftIcon={<Plus className="w-4 h-4" />}
                onClick={() => navigate('/planning/production-plans/create')}
              >
                Create First Plan
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredPlans.map((plan) => (
                <div
                  key={plan.id}
                  className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                        <Target className="w-5 h-5 text-primary-600" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-gray-900">{plan.plan_number}</span>
                          <StatusBadge status={plan.status} size="sm" />
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${priorityColors[plan.priority]}`}>
                            {plan.priority.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">{plan.plan_name}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{plan.planned_quantity} {plan.unit}</p>
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Package className="w-3 h-3" />
                        {plan.product_name}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3 text-sm">
                    <div>
                      <p className="text-gray-500">Start Date</p>
                      <p className="font-medium text-gray-900">{formatDate(plan.start_date)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">End Date</p>
                      <p className="font-medium text-gray-900">{formatDate(plan.end_date)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Status</p>
                      <div className="flex items-center gap-1">
                        <StatusBadge status={plan.status} size="sm" />
                      </div>
                    </div>
                    {plan.manufacturing_unit && (
                      <div>
                        <p className="text-gray-500">Unit</p>
                        <p className="font-medium text-gray-900">{plan.manufacturing_unit}</p>
                      </div>
                    )}
                  </div>

                  {plan.progress !== undefined && (
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-gray-600">Progress</span>
                        <span className="text-sm font-medium text-gray-900">{plan.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${getProgressColor(plan.progress)}`}
                          style={{ width: `${Math.min(plan.progress, 100)}%` }}
                        />
                      </div>
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

export default ProductionPlansPage

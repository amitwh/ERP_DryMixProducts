import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { api } from '@/services/api'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { StatusBadge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Loading'
import { Alert } from '@/components/ui/Alert'
import { ActionMenu } from '@/components/ui/ActionMenu'
import {
  ArrowLeft,
  Calendar,
  Package,
  Target,
  Factory,
  BarChart,
  AlertCircle,
  CheckCircle,
  Clock,
  Edit,
  Play,
  Pause,
  MoreVertical,
  Plus,
} from 'lucide-react'
import { formatDate, formatNumber } from '@/utils'

interface ProductionPlan {
  id: number
  organization_id: number
  plan_number: string
  plan_name: string
  status: 'draft' | 'planned' | 'in_progress' | 'completed' | 'cancelled'
  start_date: string
  end_date: string
  capacity_utilization?: number
  total_production_target: number
  total_achieved: number
  progress_percentage: number
  created_by?: string
  created_at: string
  updated_at: string
}

interface PlanItem {
  id: number
  production_plan_id: number
  product_id: number
  product_code: string
  product_name: string
  production_target: number
  production_achieved: number
  unit: string
  priority: 'high' | 'medium' | 'low'
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
  start_date: string
  end_date: string
  bom?: BillOfMaterial[]
}

interface BillOfMaterial {
  raw_material_id: number
  raw_material_code: string
  raw_material_name: string
  quantity: number
  unit: string
}

interface CapacityAnalysis {
  total_capacity: number
  used_capacity: number
  available_capacity: number
  utilization_percentage: number
  bottleneck_stations?: string[]
}

interface PlanSummary {
  total_items: number
  high_priority_items: number
  on_track_items: number
  delayed_items: number
}

export const ProductionPlanDetailPage: React.FC = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()

  const [plan, setPlan] = useState<ProductionPlan | null>(null)
  const [planItems, setPlanItems] = useState<PlanItem[]>([])
  const [capacityAnalysis, setCapacityAnalysis] = useState<CapacityAnalysis | null>(null)
  const [summary, setSummary] = useState<PlanSummary | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedItem, setExpandedItem] = useState<number | null>(null)

  const fetchPlanDetails = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const [planRes, itemsRes, capacityRes, summaryRes] = await Promise.all([
        api.get<ProductionPlan>(`/planning/production-plans/${id}`, {
          params: { organization_id: user?.organization_id },
        }),
        api.get<{ data: PlanItem[] }>(`/planning/production-plans/${id}/items`, {
          params: { organization_id: user?.organization_id },
        }),
        api.get<CapacityAnalysis>(`/planning/production-plans/${id}/capacity-analysis`, {
          params: { organization_id: user?.organization_id },
        }),
        api.get<PlanSummary>(`/planning/production-plans/${id}/summary`, {
          params: { organization_id: user?.organization_id },
        }),
      ])

      setPlan(planRes.data)
      setPlanItems(itemsRes.data.data || [])
      setCapacityAnalysis(capacityRes.data)
      setSummary(summaryRes.data)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch production plan details')
      console.error('Failed to fetch production plan:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (id) {
      fetchPlanDetails()
    }
  }, [id])

  const handleEdit = () => {
    navigate(`/planning/production-plans/${id}/edit`)
  }

  const handleStatusChange = async (newStatus: string) => {
    try {
      await api.patch(`/planning/production-plans/${id}`, {
        status: newStatus,
        organization_id: user?.organization_id,
      })
      fetchPlanDetails()
    } catch (error) {
      console.error('Failed to update plan status:', error)
    }
  }

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      high: 'bg-red-100 text-red-800',
      medium: 'bg-yellow-100 text-yellow-800',
      low: 'bg-green-100 text-green-800',
    }
    return colors[priority] || 'bg-gray-100 text-gray-800'
  }

  const getProgressColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-success-500'
    if (percentage >= 70) return 'bg-primary-500'
    if (percentage >= 50) return 'bg-warning-500'
    return 'bg-error-500'
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Production Plan Details</h1>
          <p className="text-gray-600">Loading plan information...</p>
        </div>
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} height={200} className="rounded" />
          ))}
        </div>
      </div>
    )
  }

  if (error || !plan) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Production Plan Details</h1>
        </div>
        <Alert type="error" message={error || 'Production plan not found'} />
        <Button variant="outline" onClick={() => navigate('/planning/production-plans')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Plans
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{plan.plan_name}</h1>
          <p className="text-gray-600">
            {plan.plan_number} | {formatDate(plan.start_date)} - {formatDate(plan.end_date)}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<ArrowLeft className="w-4 h-4" />}
            onClick={() => navigate('/planning/production-plans')}
          >
            Back
          </Button>
          <ActionMenu
            actions={[
              { label: 'Edit Plan', onClick: handleEdit, icon: Edit },
              ...(plan.status === 'draft'
                ? [
                    { label: 'Start Plan', onClick: () => handleStatusChange('in_progress'), icon: Play },
                  ]
                : []),
              ...(plan.status === 'in_progress'
                ? [
                    { label: 'Pause Plan', onClick: () => handleStatusChange('planned'), icon: Pause },
                    { label: 'Complete Plan', onClick: () => handleStatusChange('completed'), icon: CheckCircle },
                  ]
                : []),
            ]}
          />
        </div>
      </div>

      <Alert type={plan.status === 'in_progress' ? 'info' : plan.status === 'completed' ? 'success' : 'warning'} message={`Plan Status: ${plan.status.toUpperCase().replace(/_/g, ' ')}`} />

      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card variant="bordered" padding="lg">
            <div className="text-center">
              <Package className="w-6 h-6 text-primary-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-600 mb-1">Total Items</p>
              <h3 className="text-2xl font-bold text-gray-900">{summary.total_items}</h3>
            </div>
          </Card>
          <Card variant="bordered" padding="lg">
            <div className="text-center">
              <Target className="w-6 h-6 text-error-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-600 mb-1">High Priority</p>
              <h3 className="text-2xl font-bold text-error-600">{summary.high_priority_items}</h3>
            </div>
          </Card>
          <Card variant="bordered" padding="lg">
            <div className="text-center">
              <CheckCircle className="w-6 h-6 text-success-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-600 mb-1">On Track</p>
              <h3 className="text-2xl font-bold text-success-600">{summary.on_track_items}</h3>
            </div>
          </Card>
          <Card variant="bordered" padding="lg">
            <div className="text-center">
              <AlertCircle className="w-6 h-6 text-warning-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-600 mb-1">Delayed</p>
              <h3 className="text-2xl font-bold text-warning-600">{summary.delayed_items}</h3>
            </div>
          </Card>
        </div>
      )}

      <Card variant="bordered" padding="lg">
        <CardHeader>
          <CardTitle>Plan Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <p className="text-sm text-gray-500 mb-1">Status</p>
              <StatusBadge status={plan.status} />
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Progress</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${getProgressColor(plan.progress_percentage)}`}
                    style={{ width: `${plan.progress_percentage}%` }}
                  />
                </div>
                <span className="text-sm font-bold">{plan.progress_percentage.toFixed(1)}%</span>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Production Target</p>
              <p className="text-lg font-bold text-gray-900">{formatNumber(plan.total_production_target)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Achieved</p>
              <p className="text-lg font-bold text-primary-600">{formatNumber(plan.total_achieved)}</p>
            </div>
          </div>

          {plan.capacity_utilization && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-500 mb-2">Capacity Utilization</p>
              <div className="flex items-center gap-3">
                <div className="flex-1 bg-gray-200 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full ${
                      plan.capacity_utilization >= 90
                        ? 'bg-error-500'
                        : plan.capacity_utilization >= 70
                          ? 'bg-warning-500'
                          : 'bg-success-500'
                    }`}
                    style={{ width: `${plan.capacity_utilization}%` }}
                  />
                </div>
                <span className="text-lg font-bold">{plan.capacity_utilization.toFixed(1)}%</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {capacityAnalysis && (
        <Card variant="bordered" padding="lg">
          <CardHeader>
            <CardTitle>Capacity Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Total Capacity</p>
                <h3 className="text-2xl font-bold text-gray-900">{formatNumber(capacityAnalysis.total_capacity)}</h3>
              </div>
              <div className="text-center p-4 bg-primary-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Used Capacity</p>
                <h3 className="text-2xl font-bold text-primary-600">{formatNumber(capacityAnalysis.used_capacity)}</h3>
              </div>
              <div className="text-center p-4 bg-success-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Available Capacity</p>
                <h3 className="text-2xl font-bold text-success-600">{formatNumber(capacityAnalysis.available_capacity)}</h3>
              </div>
            </div>

            {capacityAnalysis.bottleneck_stations && capacityAnalysis.bottleneck_stations.length > 0 && (
              <div className="mt-4 p-4 bg-warning-50 rounded-lg">
                <div className="flex items-center gap-2 text-warning-800 mb-2">
                  <AlertCircle className="w-5 h-5" />
                  <span className="font-semibold">Bottleneck Stations</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {capacityAnalysis.bottleneck_stations.map((station, index) => (
                    <span key={index} className="px-3 py-1 bg-warning-100 text-warning-800 rounded-full text-sm">
                      {station}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Card variant="bordered" padding="lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Production Items</CardTitle>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={() => navigate(`/planning/production-plans/${id}/items/create`)}
            >
              Add Item
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {planItems.length === 0 ? (
            <div className="text-center py-8">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">No production items in this plan</p>
              <Button
                variant="primary"
                size="sm"
                leftIcon={<Plus className="w-4 h-4" />}
                onClick={() => navigate(`/planning/production-plans/${id}/items/create`)}
              >
                Add First Item
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {planItems.map((item) => (
                <div key={item.id} className="border border-gray-200 rounded-lg overflow-hidden">
                  <div
                    className="p-4 bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer flex items-center justify-between"
                    onClick={() => setExpandedItem(expandedItem === item.id ? null : item.id)}
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                        <Package className="w-5 h-5 text-primary-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-gray-900">{item.product_name}</span>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(item.priority)}`}>
                            {item.priority.toUpperCase()}
                          </span>
                          <StatusBadge status={item.status} />
                        </div>
                        <p className="text-sm text-gray-600">{item.product_code}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-6 mr-4">
                      <div className="text-right">
                        <p className="text-xs text-gray-500">Target</p>
                        <p className="font-semibold text-gray-900">{formatNumber(item.production_target)} {item.unit}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">Achieved</p>
                        <p className="font-semibold text-primary-600">{formatNumber(item.production_achieved)} {item.unit}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">Progress</p>
                        <p className="font-semibold text-gray-900">
                          {((item.production_achieved / item.production_target) * 100).toFixed(1)}%
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">Due</p>
                        <p className="font-semibold text-gray-900">{formatDate(item.end_date)}</p>
                      </div>
                    </div>

                    <MoreVertical className="w-5 h-5 text-gray-400" />
                  </div>

                  {expandedItem === item.id && item.bom && (
                    <div className="p-4 border-t border-gray-200 bg-white">
                      <div className="flex items-center gap-2 mb-3">
                        <BarChart className="w-5 h-5 text-gray-600" />
                        <h4 className="font-semibold text-gray-900">Bill of Materials</h4>
                      </div>
                      <div className="space-y-2">
                        {item.bom.map((material, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                            <div>
                              <p className="font-medium text-gray-900">{material.raw_material_name}</p>
                              <p className="text-sm text-gray-600">{material.raw_material_code}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-bold text-gray-900">
                                {formatNumber(material.quantity)} {material.unit}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card variant="bordered" padding="lg">
        <CardHeader>
          <CardTitle>Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>

            <div className="space-y-6 ml-10">
              <div className="relative">
                <div className="absolute -left-10 w-6 h-6 bg-primary-600 rounded-full flex items-center justify-center">
                  <Calendar className="w-3 h-3 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Plan Created</p>
                  <p className="font-semibold text-gray-900">{formatDate(plan.created_at)}</p>
                </div>
              </div>

              <div className="relative">
                <div
                  className={`absolute -left-10 w-6 h-6 rounded-full flex items-center justify-center ${
                    plan.status === 'completed'
                      ? 'bg-success-600'
                      : plan.status === 'in_progress'
                        ? 'bg-primary-600'
                        : 'bg-gray-300'
                  }`}
                >
                  {plan.status === 'in_progress' ? (
                    <Clock className="w-3 h-3 text-white" />
                  ) : plan.status === 'completed' ? (
                    <CheckCircle className="w-3 h-3 text-white" />
                  ) : (
                    <div className="w-3 h-3 bg-white rounded-full"></div>
                  )}
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Start Date</p>
                  <p className="font-semibold text-gray-900">{formatDate(plan.start_date)}</p>
                </div>
              </div>

              <div className="relative">
                <div
                  className={`absolute -left-10 w-6 h-6 rounded-full flex items-center justify-center ${
                    plan.status === 'completed'
                      ? 'bg-success-600'
                      : plan.status === 'in_progress'
                        ? 'bg-warning-600'
                        : 'bg-gray-300'
                  }`}
                >
                  <Factory className="w-3 h-3 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">End Date</p>
                  <p className="font-semibold text-gray-900">{formatDate(plan.end_date)}</p>
                </div>
              </div>

              {plan.status === 'completed' && (
                <div className="relative">
                  <div className="absolute -left-10 w-6 h-6 bg-success-600 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-3 h-3 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Completed On</p>
                    <p className="font-semibold text-gray-900">{formatDate(plan.updated_at)}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default ProductionPlanDetailPage

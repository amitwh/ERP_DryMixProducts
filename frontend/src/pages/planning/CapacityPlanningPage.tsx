import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { api } from '@/services/api'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { StatusBadge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Loading'
import { Alert } from '@/components/ui/Alert'
import {
  ArrowLeft,
  Factory,
  Users,
  TrendingUp,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Edit,
  Save,
  RefreshCw,
  BarChart,
  Clock,
  Target,
  Settings,
  Plus,
} from 'lucide-react'
import { formatDate, formatNumber } from '@/utils'

interface Resource {
  id: number
  resource_name: string
  resource_type: 'machine' | 'labor' | 'equipment' | 'facility'
  capacity: number
  capacity_unit: string
  utilized_capacity: number
  available_capacity: number
  utilization_percentage: number
  efficiency_rate?: number
  status: 'active' | 'maintenance' | 'inactive'
  last_maintenance?: string
}

interface ResourceAllocation {
  id: number
  resource_id: number
  resource_name: string
  production_plan_id?: number
  production_plan_name?: string
  product_id?: number
  product_name?: string
  allocated_capacity: number
  allocated_unit: string
  start_date: string
  end_date: string
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
  priority: 'high' | 'medium' | 'low'
}

interface CapacityPlan {
  id: number
  organization_id: number
  plan_number: string
  plan_name: string
  status: 'draft' | 'active' | 'completed'
  start_date: string
  end_date: string
  total_capacity: number
  utilized_capacity: number
  overall_utilization: number
  bottleneck_resources?: string[]
  created_at: string
  updated_at: string
}

interface CapacityMetrics {
  total_resources: number
  active_resources: number
  maintenance_resources: number
  average_utilization: number
  efficiency_rate: number
  total_allocations: number
  upcoming_allocations: number
}

export const CapacityPlanningPage: React.FC = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()

  const [plan, setPlan] = useState<CapacityPlan | null>(null)
  const [resources, setResources] = useState<Resource[]>([])
  const [allocations, setAllocations] = useState<ResourceAllocation[]>([])
  const [metrics, setMetrics] = useState<CapacityMetrics | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'resources' | 'allocations' | 'analysis'>('resources')
  const [resourceFilter, setResourceFilter] = useState<'all' | 'machine' | 'labor' | 'equipment' | 'facility'>('all')
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null)

  const tabs = [
    { id: 'resources' as const, label: 'Resources', icon: Factory },
    { id: 'allocations' as const, label: 'Allocations', icon: Target },
    { id: 'analysis' as const, label: 'Analysis', icon: BarChart },
  ]

  const fetchCapacityPlan = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const [planRes, resourcesRes, allocationsRes, metricsRes] = await Promise.all([
        api.get<CapacityPlan>(`/planning/capacity-plans/${id}`, {
          params: { organization_id: user?.organization_id },
        }),
        api.get<{ data: Resource[] }>(`/planning/capacity-plans/${id}/resources`, {
          params: { organization_id: user?.organization_id },
        }),
        api.get<{ data: ResourceAllocation[] }>(`/planning/capacity-plans/${id}/allocations`, {
          params: { organization_id: user?.organization_id },
        }),
        api.get<CapacityMetrics>(`/planning/capacity-plans/${id}/metrics`, {
          params: { organization_id: user?.organization_id },
        }),
      ])

      setPlan(planRes.data)
      setResources(resourcesRes.data.data || [])
      setAllocations(allocationsRes.data.data || [])
      setMetrics(metricsRes.data)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch capacity plan details')
      console.error('Failed to fetch capacity plan:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (id) {
      fetchCapacityPlan()
    }
  }, [id])

  const handleUpdateCapacity = async (resourceId: number, newCapacity: number) => {
    try {
      setIsSaving(true)
      await api.patch(`/planning/resources/${resourceId}`, {
        capacity: newCapacity,
        organization_id: user?.organization_id,
      })
      fetchCapacityPlan()
    } catch (error) {
      console.error('Failed to update capacity:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const filteredResources = resources.filter((resource) => {
    return resourceFilter === 'all' || resource.resource_type === resourceFilter
  })

  const getUtilizationColor = (percentage: number) => {
    if (percentage >= 90) return 'text-error-600'
    if (percentage >= 70) return 'text-warning-600'
    if (percentage >= 50) return 'text-primary-600'
    return 'text-success-600'
  }

  const getResourceTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      machine: 'bg-blue-100 text-blue-800',
      labor: 'bg-green-100 text-green-800',
      equipment: 'bg-purple-100 text-purple-800',
      facility: 'bg-orange-100 text-orange-800',
    }
    return colors[type] || 'bg-gray-100 text-gray-800'
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Capacity Planning</h1>
          <p className="text-gray-600">Loading capacity plan information...</p>
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
          <h1 className="text-2xl font-bold text-gray-900">Capacity Planning</h1>
        </div>
        <Alert type="error" message={error || 'Capacity plan not found'} />
        <Button variant="outline" onClick={() => navigate('/planning/capacity-plans')}>
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
            onClick={() => navigate('/planning/capacity-plans')}
          >
            Back
          </Button>
          <Button
            variant="outline"
            size="sm"
            leftIcon={<RefreshCw className="w-4 h-4" />}
            onClick={fetchCapacityPlan}
            isLoading={isSaving}
          >
            Refresh
          </Button>
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => navigate(`/planning/capacity-plans/${id}/allocations/create`)}
          >
            Add Allocation
          </Button>
        </div>
      </div>

      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card variant="bordered" padding="lg">
            <div className="text-center">
              <Factory className="w-6 h-6 text-primary-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-600 mb-1">Total Resources</p>
              <h3 className="text-2xl font-bold text-gray-900">{metrics.total_resources}</h3>
            </div>
          </Card>
          <Card variant="bordered" padding="lg">
            <div className="text-center">
              <Users className="w-6 h-6 text-success-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-600 mb-1">Active</p>
              <h3 className="text-2xl font-bold text-success-600">{metrics.active_resources}</h3>
            </div>
          </Card>
          <Card variant="bordered" padding="lg">
            <div className="text-center">
              <BarChart className="w-6 h-6 text-primary-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-600 mb-1">Avg Utilization</p>
              <h3 className="text-2xl font-bold text-primary-600">
                {metrics.average_utilization.toFixed(1)}%
              </h3>
            </div>
          </Card>
          <Card variant="bordered" padding="lg">
            <div className="text-center">
              <TrendingUp className="w-6 h-6 text-success-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-600 mb-1">Efficiency Rate</p>
              <h3 className="text-2xl font-bold text-success-600">{metrics.efficiency_rate.toFixed(1)}%</h3>
            </div>
          </Card>
        </div>
      )}

      {plan.bottleneck_resources && plan.bottleneck_resources.length > 0 && (
        <Alert type="warning" message={`Bottleneck Resources: ${plan.bottleneck_resources.join(', ')}`} />
      )}

      <div className="flex items-center gap-2 border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-3 border-b-2 -mb-px text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'resources' && (
        <Card variant="bordered" padding="lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Resources</CardTitle>
              <div className="flex items-center gap-2">
                {(['all', 'machine', 'labor', 'equipment', 'facility'] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => setResourceFilter(type)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      resourceFilter === type
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {filteredResources.length === 0 ? (
              <div className="text-center py-8">
                <Factory className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No resources found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredResources.map((resource) => (
                  <div key={resource.id} className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                          <Factory className="w-5 h-5 text-primary-600" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-gray-900">{resource.resource_name}</span>
                            <span
                              className={`px-2 py-0.5 rounded-full text-xs font-medium ${getResourceTypeColor(resource.resource_type)}`}
                            >
                              {resource.resource_type}
                            </span>
                            <StatusBadge status={resource.status} />
                          </div>
                          <p className="text-sm text-gray-600">
                            {resource.last_maintenance ? `Last Maintenance: ${formatDate(resource.last_maintenance)}` : 'No maintenance record'}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        leftIcon={<Settings className="w-4 h-4" />}
                        onClick={() => setSelectedResource(resource)}
                      >
                        Configure
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                      <div>
                        <p className="text-sm text-gray-500">Capacity</p>
                        <p className="text-lg font-semibold text-gray-900">
                          {formatNumber(resource.capacity)} {resource.capacity_unit}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Utilized</p>
                        <p className="text-lg font-semibold text-primary-600">
                          {formatNumber(resource.utilized_capacity)} {resource.capacity_unit}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Available</p>
                        <p className="text-lg font-semibold text-success-600">
                          {formatNumber(resource.available_capacity)} {resource.capacity_unit}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Utilization</p>
                        <p className={`text-lg font-bold ${getUtilizationColor(resource.utilization_percentage)}`}>
                          {resource.utilization_percentage.toFixed(1)}%
                        </p>
                      </div>
                    </div>

                    {resource.efficiency_rate && (
                      <div className="pt-3 border-t border-gray-200">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-600">Efficiency Rate</span>
                          <span className="text-sm font-medium text-gray-900">{resource.efficiency_rate.toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              resource.efficiency_rate >= 90
                                ? 'bg-success-500'
                                : resource.efficiency_rate >= 70
                                  ? 'bg-primary-500'
                                  : 'bg-warning-500'
                            }`}
                            style={{ width: `${resource.efficiency_rate}%` }}
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
      )}

      {activeTab === 'allocations' && (
        <Card variant="bordered" padding="lg">
          <CardHeader>
            <CardTitle>Resource Allocations</CardTitle>
          </CardHeader>
          <CardContent>
            {allocations.length === 0 ? (
              <div className="text-center py-8">
                <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">No allocations found</p>
                <Button
                  variant="primary"
                  size="sm"
                  leftIcon={<Plus className="w-4 h-4" />}
                  onClick={() => navigate(`/planning/capacity-plans/${id}/allocations/create`)}
                >
                  Add First Allocation
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {allocations.map((allocation) => (
                  <div key={allocation.id} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                          <Factory className="w-5 h-5 text-primary-600" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-gray-900">{allocation.resource_name}</span>
                            <StatusBadge status={allocation.status} />
                            {allocation.priority === 'high' && (
                              <span className="px-2 py-0.5 bg-red-100 text-red-800 rounded-full text-xs font-medium">
                                HIGH PRIORITY
                              </span>
                            )}
                          </div>
                          {allocation.product_name && (
                            <p className="text-sm text-gray-600">For: {allocation.product_name}</p>
                          )}
                          {allocation.production_plan_name && (
                            <p className="text-sm text-gray-600">Plan: {allocation.production_plan_name}</p>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        leftIcon={<Edit className="w-4 h-4" />}
                        onClick={() => navigate(`/planning/allocations/${allocation.id}/edit`)}
                      >
                        Edit
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                      <div>
                        <p className="text-gray-500">Allocated Capacity</p>
                        <p className="font-medium text-primary-600">
                          {formatNumber(allocation.allocated_capacity)} {allocation.allocated_unit}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Start Date</p>
                        <p className="font-medium text-gray-900">{formatDate(allocation.start_date)}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">End Date</p>
                        <p className="font-medium text-gray-900">{formatDate(allocation.end_date)}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Priority</p>
                        <p
                          className={`font-semibold ${
                            allocation.priority === 'high'
                              ? 'text-error-600'
                              : allocation.priority === 'medium'
                                ? 'text-warning-600'
                                : 'text-success-600'
                          }`}
                        >
                          {allocation.priority.toUpperCase()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === 'analysis' && metrics && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card variant="bordered" padding="lg">
            <CardHeader>
              <CardTitle>Utilization Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Overall Utilization</span>
                    <span className="text-lg font-bold text-primary-600">{plan.overall_utilization.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full ${
                        plan.overall_utilization >= 90
                          ? 'bg-error-500'
                          : plan.overall_utilization >= 70
                            ? 'bg-warning-500'
                            : 'bg-success-500'
                      }`}
                      style={{ width: `${plan.overall_utilization}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Total Capacity</p>
                    <p className="text-lg font-bold text-gray-900">{formatNumber(plan.total_capacity)}</p>
                  </div>
                  <div className="p-3 bg-primary-50 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Utilized Capacity</p>
                    <p className="text-lg font-bold text-primary-600">{formatNumber(plan.utilized_capacity)}</p>
                  </div>
                </div>

                {plan.overall_utilization > 80 && (
                  <div className="p-3 bg-warning-50 rounded-lg border border-warning-200">
                    <div className="flex items-center gap-2 text-warning-800">
                      <AlertTriangle className="w-5 h-5" />
                      <span className="font-medium">High utilization detected. Consider capacity expansion.</span>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card variant="bordered" padding="lg">
            <CardHeader>
              <CardTitle>Resource Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-success-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-success-600" />
                    <span className="font-medium text-gray-900">Active Resources</span>
                  </div>
                  <span className="text-2xl font-bold text-success-600">{metrics.active_resources}</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-warning-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-warning-600" />
                    <span className="font-medium text-gray-900">Under Maintenance</span>
                  </div>
                  <span className="text-2xl font-bold text-warning-600">{metrics.maintenance_resources}</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-primary-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-primary-600" />
                    <span className="font-medium text-gray-900">Total Allocations</span>
                  </div>
                  <span className="text-2xl font-bold text-primary-600">{metrics.total_allocations}</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-secondary-600" />
                    <span className="font-medium text-gray-900">Upcoming Allocations</span>
                  </div>
                  <span className="text-2xl font-bold text-secondary-600">{metrics.upcoming_allocations}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

export default CapacityPlanningPage

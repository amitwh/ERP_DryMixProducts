import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { api } from '@/services/api'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { Skeleton } from '@/components/ui/Loading'
import { Alert } from '@/components/ui/Alert'
import { Search, Plus, Filter, Settings, Activity, PauseCircle, CheckCircle, Wrench } from 'lucide-react'
import { formatDate } from '@/utils'

interface Workstation {
  id: number
  name: string
  code: string
  type: 'mixing' | 'packaging' | 'quality_control' | 'storage'
  location: string
  status: 'active' | 'maintenance' | 'inactive'
  capacity_per_hour: number
  uom: string
  current_efficiency: number
  last_maintenance?: string
  next_maintenance?: string
  assigned_staff?: number
  operating_hours_today?: number
}

export default function WorkstationsPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [workstations, setWorkstations] = useState<Workstation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'maintenance' | 'inactive'>('all')
  const [typeFilter, setTypeFilter] = useState<'all' | 'mixing' | 'packaging' | 'quality_control' | 'storage'>('all')

  useEffect(() => {
    fetchWorkstations()
  }, [statusFilter, typeFilter])

  const fetchWorkstations = async () => {
    try {
      setIsLoading(true)
      const response = await api.get<{ data: Workstation[] }>('/production/workstations', {
        params: {
          organization_id: user?.organization_id,
          status: statusFilter === 'all' ? undefined : statusFilter,
          type: typeFilter === 'all' ? undefined : typeFilter,
        },
      })
      setWorkstations(response.data.data || [])
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch workstations')
    } finally {
      setIsLoading(false)
    }
  }

  const filteredWorkstations = workstations.filter(ws => {
    const matchesSearch =
      searchTerm === '' ||
      ws.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ws.code.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  const activeCount = workstations.filter(ws => ws.status === 'active').length
  const maintenanceCount = workstations.filter(ws => ws.status === 'maintenance').length
  const avgEfficiency = workstations.length > 0
    ? workstations.reduce((sum, ws) => sum + ws.current_efficiency, 0) / workstations.length
    : 0

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      mixing: 'Mixing Station',
      packaging: 'Packaging Line',
      quality_control: 'Quality Control',
      storage: 'Storage Area',
    }
    return labels[type] || type
  }

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      mixing: 'bg-blue-100 text-blue-800',
      packaging: 'bg-green-100 text-green-800',
      quality_control: 'bg-purple-100 text-purple-800',
      storage: 'bg-orange-100 text-orange-800',
    }
    return colors[type] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Workstations</h1>
          <p className="text-gray-600">Manage production workstations and equipment</p>
        </div>
        <Button
          variant="primary"
          size="sm"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => navigate('/production/workstations/create')}
        >
          Add Workstation
        </Button>
      </div>

      {error && <Alert type="error" message={error} onDismiss={() => setError(null)} />}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card variant="bordered" padding="lg">
          <div className="text-center">
            <Wrench className="w-6 h-6 text-primary-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-600 mb-1">Total Workstations</p>
            <h3 className="text-2xl font-bold text-gray-900">{workstations.length}</h3>
          </div>
        </Card>
        <Card variant="bordered" padding="lg">
          <div className="text-center">
            <Activity className="w-6 h-6 text-success-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-600 mb-1">Active</p>
            <h3 className="text-2xl font-bold text-success-600">{activeCount}</h3>
          </div>
        </Card>
        <Card variant="bordered" padding="lg">
          <div className="text-center">
            <PauseCircle className="w-6 h-6 text-warning-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-600 mb-1">Under Maintenance</p>
            <h3 className="text-2xl font-bold text-warning-600">{maintenanceCount}</h3>
          </div>
        </Card>
        <Card variant="bordered" padding="lg">
          <div className="text-center">
            <CheckCircle className="w-6 h-6 text-primary-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-600 mb-1">Avg Efficiency</p>
            <h3 className="text-2xl font-bold text-primary-600">{avgEfficiency.toFixed(1)}%</h3>
          </div>
        </Card>
      </div>

      <Card variant="bordered" padding="md">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="Search workstations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex items-center gap-2">
            {(['active', 'maintenance', 'inactive'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  statusFilter === status
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>
      </Card>

      <Card variant="bordered" padding="lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            All Workstations ({filteredWorkstations.length})
          </h3>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Filter className="w-4 h-4" />}
              onClick={() => setTypeFilter('all')}
            >
              All Types
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/production/workstations/settings')}
            >
              Settings
          </Button>
        </div>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} height={120} className="rounded" />
            ))}
          </div>
        ) : filteredWorkstations.length === 0 ? (
          <div className="text-center py-12">
            <Wrench className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">No workstations found</p>
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={() => navigate('/production/workstations/create')}
            >
              Add First Workstation
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredWorkstations.map((workstation) => (
              <Card
                key={workstation.id}
                variant="bordered"
                padding="lg"
                className="cursor-pointer hover:border-primary-300 transition-colors"
                onClick={() => navigate(`/production/workstations/${workstation.id}`)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">{workstation.name}</h4>
                    <p className="text-sm text-gray-600">{workstation.code}</p>
                  </div>
                  <StatusBadge status={workstation.status} />
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(workstation.type)}`}>
                      {getTypeLabel(workstation.type)}
                    </span>
                    <span className="text-sm text-gray-600">{workstation.location}</span>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 mb-1">Capacity</p>
                    <p className="font-semibold text-gray-900">
                      {workstation.capacity_per_hour} {workstation.uom}/hour
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 mb-1">Current Efficiency</p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            workstation.current_efficiency >= 90 ? 'bg-success-500' :
                            workstation.current_efficiency >= 70 ? 'bg-warning-500' :
                            'bg-error-500'
                          }`}
                          style={{ width: `${workstation.current_efficiency}%` }}
                        />
                      </div>
                      <span className="text-sm font-semibold text-gray-900">
                        {workstation.current_efficiency.toFixed(0)}%
                      </span>
                    </div>
                  </div>

                  {workstation.assigned_staff !== undefined && (
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Assigned Staff</p>
                      <p className="font-semibold text-gray-900">{workstation.assigned_staff} workers</p>
                    </div>
                  )}

                  {workstation.next_maintenance && (
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Next Maintenance</p>
                      <p className="font-semibold text-warning-600">{formatDate(workstation.next_maintenance)}</p>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="text-sm">
                    {workstation.operating_hours_today !== undefined && (
                      <span className="text-gray-600">
                        Operating today: {workstation.operating_hours_today.toFixed(1)}h
                      </span>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      navigate(`/production/workstations/${workstation.id}`)
                    }}
                  >
                    View Details
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}

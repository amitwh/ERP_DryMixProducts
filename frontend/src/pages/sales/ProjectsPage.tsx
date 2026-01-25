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
import { Search, Plus, Filter, MapPin, Calendar, Users, TrendingUp, AlertTriangle, Download, Printer } from 'lucide-react'
import { formatDate, formatNumber, formatCurrency } from '@/utils'

interface Project {
  id: number
  project_number: string
  project_name: string
  customer_id: number
  customer_name: string
  customer_code: string
  site_address: string
  city: string
  state: string
  start_date: string
  end_date?: string
  status: 'planning' | 'in_progress' | 'on_hold' | 'completed' | 'cancelled'
  project_value: number
  currency: string
  progress_percentage: number
  assigned_team: number
  project_manager_id: number
  project_manager_name: string
  created_at: string
}

export default function ProjectsPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'planning' | 'in_progress' | 'on_hold' | 'completed' | 'cancelled'>('all')
  const [managerFilter, setManagerFilter] = useState('')

  useEffect(() => {
    fetchProjects()
  }, [statusFilter, managerFilter])

  const fetchProjects = async () => {
    try {
      setIsLoading(true)
      const response = await api.get<{ data: Project[] }>('/sales/projects', {
        params: {
          organization_id: user?.organizationId,
          status: statusFilter === 'all' ? undefined : statusFilter,
          project_manager_id: managerFilter || undefined,
        },
      })
      setProjects(response.data.data || [])
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch projects')
    } finally {
      setIsLoading(false)
    }
  }

  const filteredProjects = projects.filter(project => {
    const matchesSearch =
      searchTerm === '' ||
      project.project_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.project_number.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  const totalCount = projects.length
  const planningCount = projects.filter(p => p.status === 'planning').length
  const inProgressCount = projects.filter(p => p.status === 'in_progress').length
  const completedCount = projects.filter(p => p.status === 'completed').length
  const totalValue = projects.reduce((sum, p) => sum + p.project_value, 0)
  const avgProgress = projects.length > 0
    ? projects.reduce((sum, p) => sum + p.progress_percentage, 0) / projects.length
    : 0

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      planning: 'bg-blue-100 text-blue-800',
      in_progress: 'bg-yellow-100 text-yellow-800',
      on_hold: 'bg-orange-100 text-orange-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
          <p className="text-gray-600">Manage customer projects and installations</p>
        </div>
        <Button
          variant="primary"
          size="sm"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => navigate('/sales/projects/create')}
        >
          Create Project
        </Button>
      </div>

      {error && <Alert type="error" message={error} onDismiss={() => setError(null)} />}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card variant="bordered" padding="lg">
          <div className="text-center">
            <MapPin className="w-6 h-6 text-primary-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-600 mb-1">Total Projects</p>
            <h3 className="text-2xl font-bold text-gray-900">{totalCount}</h3>
          </div>
        </Card>
        <Card variant="bordered" padding="lg">
          <div className="text-center">
            <TrendingUp className="w-6 h-6 text-warning-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-600 mb-1">In Progress</p>
            <h3 className="text-2xl font-bold text-warning-600">{inProgressCount}</h3>
          </div>
        </Card>
        <Card variant="bordered" padding="lg">
          <div className="text-center">
            <Calendar className="w-6 h-6 text-success-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-600 mb-1">Completed</p>
            <h3 className="text-2xl font-bold text-success-600">{completedCount}</h3>
          </div>
        </Card>
        <Card variant="bordered" padding="lg">
          <div className="text-center">
            <TrendingUp className="w-6 h-6 text-blue-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-600 mb-1">Avg Progress</p>
            <h3 className="text-2xl font-bold text-blue-600">{avgProgress.toFixed(1)}%</h3>
          </div>
        </Card>
      </div>

      <Card variant="bordered" padding="lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex items-center gap-2">
            {(['planning', 'in_progress', 'on_hold', 'completed', 'cancelled'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  statusFilter === status
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status.replace('_', ' ').toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Projects ({filteredProjects.length})
          </h3>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Filter className="w-4 h-4" />}
              onClick={() => {
                setManagerFilter('')
                setStatusFilter('all')
              }}
            >
              Reset Filters
            </Button>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Download className="w-4 h-4" />}
              onClick={() => {
                const csvContent =
                  'data:text/csv;charset=utf-8,' +
                  'Project Number,Name,Customer,Location,Status,Start Date,End Date,Value,Currency,Progress,Manager,Created At\n' +
                  filteredProjects
                    .map(p =>
                      `${p.project_number},"${p.project_name}","${p.customer_name}","${p.site_address}",${p.status},${p.start_date},${p.end_date || '-'},${p.project_value},${p.currency},${p.progress_percentage}%,"${p.project_manager_name}",${p.created_at}`
                    )
                    .join('\n')
                const link = document.createElement('a')
                link.setAttribute('href', encodeURI(csvContent))
                link.setAttribute('download', 'projects.csv')
                document.body.appendChild(link)
                link.click()
                document.body.removeChild(link)
              }}
            >
              Export
            </Button>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Printer className="w-4 h-4" />}
              onClick={() => window.print()}
            />
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} height={120} className="rounded" />
            ))}
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="text-center py-12">
            <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">No projects found</p>
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={() => navigate('/sales/projects/create')}
            >
              Create First Project
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProjects.map((project) => (
              <div
                key={project.id}
                className="border border-gray-200 rounded-lg hover:border-primary-300 transition-colors p-6 cursor-pointer"
                onClick={() => navigate(`/sales/projects/${project.id}`)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-sm text-gray-600">{project.project_number}</span>
                      <StatusBadge status={project.status} />
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900">{project.project_name}</h4>
                  </div>
                  <div className="flex items-center gap-3">
                    <Users className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{project.assigned_team}</span>
                  </div>
                </div>

                <div className="space-y-3 mb-3">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Customer</p>
                    <p className="font-medium text-gray-900">{project.customer_name}</p>
                    <p className="text-sm text-gray-600">{project.customer_code}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Location</p>
                    <p className="text-sm text-gray-900">
                      {project.site_address}, {project.city}, {project.state}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Start Date</p>
                      <p className="font-medium text-gray-900">{formatDate(project.start_date)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">End Date</p>
                      <p className="font-medium text-gray-900">{project.end_date ? formatDate(project.end_date) : '-'}</p>
                    </div>
                  </div>
                </div>

                <div className="mb-3">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-gray-600">Progress</p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            project.progress_percentage >= 75 ? 'bg-success-500' :
                            project.progress_percentage >= 50 ? 'bg-warning-500' :
                            'bg-error-500'
                          }`}
                          style={{ width: `${project.progress_percentage}%` }}
                        />
                      </div>
                      <span className="text-sm font-semibold text-gray-900">
                        {project.progress_percentage.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-3 pt-3 border-t border-gray-200">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Project Value</p>
                    <p className="text-lg font-semibold text-primary-600">
                      {formatCurrency(project.project_value)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Manager</p>
                    <p className="text-sm text-gray-900">{project.project_manager_name}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                  <div className="text-sm text-gray-600">
                    Created on {formatDate(project.created_at)}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/sales/projects/${project.id}`)}
                  >
                    View Details
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}

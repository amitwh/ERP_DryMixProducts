import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { api } from '@/services/api'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { Skeleton } from '@/components/ui/Loading'
import { Alert } from '@/components/ui/Alert'
import { ArrowLeft, Download, Printer, MapPin, FileText, Package, CheckCircle, AlertTriangle, Plus, Edit, XCircle } from 'lucide-react'
import { formatDate, formatCurrency } from '@/utils'

interface ProjectDetail {
  id: number
  project_number: string
  project_name: string
  customer_id: number
  customer_name: string
  customer_code: string
  customer_address: string
  customer_phone: string
  customer_email: string
  site_address: string
  site_city: string
  site_state: string
  site_contact_name: string
  site_contact_phone: string
  start_date: string
  end_date: string
  expected_end_date: string
  status: 'planning' | 'in_progress' | 'on_hold' | 'completed' | 'cancelled'
  project_value: number
  currency: string
  progress_percentage: number
  assigned_team: number
  project_manager_id: number
  project_manager_name: string
  project_manager_phone: string
  notes: string
  created_at: string
  created_by: string
}

export default function ProjectDetailPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { user } = useAuth()
  const [project, setProject] = useState<ProjectDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchProject()
  }, [id])

  const fetchProject = async () => {
    try {
      const response = await api.get<{ data: ProjectDetail }>(`/sales/projects/${id}`, {
        params: { organization_id: user?.organizationId }
      })
      setProject(response.data)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load project')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDownload = async () => {
    try {
      const response = await api.get(`/sales/projects/${id}/export`, {
        responseType: 'blob',
      })

      const url = window.URL.createObjectURL(new Blob([response.data]))
      const a = document.createElement('a')
      a.href = url
      a.download = `project-${project?.project_number}.pdf`
      a.click()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Failed to download:', err)
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto p-8">
        <Skeleton height={200} className="rounded mb-6" />
        <Skeleton height={400} className="rounded" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto mt-8">
        <Alert type="error" message={error} />
        <div className="mt-4">
          <Button variant="outline" onClick={() => navigate('/sales/projects')}>
            Back to Projects
          </Button>
        </div>
      </div>
    )
  }

  if (!project) return null

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<ArrowLeft className="w-4 h-4" />}
            onClick={() => navigate('/sales/projects')}
          >
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{project.project_name}</h1>
            <p className="text-gray-600">
              Project {project.project_number}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge status={project.status} />
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Download className="w-4 h-4" />}
            onClick={handleDownload}
          >
            Export
          </Button>
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Printer className="w-4 h-4" />}
            onClick={() => window.print()}
          >
            Print
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card variant="bordered" padding="lg">
            <div className="flex items-center gap-3 mb-6">
              <Package className="w-6 h-6 text-primary-600" />
              <h3 className="text-lg font-semibold text-gray-900">
                Customer Information
              </h3>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-600 mb-1">Customer Name</p>
                <p className="font-semibold text-gray-900">{project.customer_name}</p>
                <p className="text-sm text-gray-600">{project.customer_code}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Contact</p>
                <p className="text-sm text-gray-900">{project.customer_phone}</p>
                <p className="text-sm text-gray-600">{project.customer_email}</p>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm text-gray-600 mb-1">Address</p>
              <p className="text-gray-700">{project.customer_address}</p>
            </div>
          </Card>

          <Card variant="bordered" padding="lg">
            <div className="flex items-center gap-3 mb-6">
              <MapPin className="w-6 h-6 text-primary-600" />
              <h3 className="text-lg font-semibold text-gray-900">
                Site Information
              </h3>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Site Address</p>
                <p className="text-gray-700">{project.site_address}</p>
                <p className="text-sm text-gray-600">
                  {project.site_city}, {project.site_state}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Site Contact</p>
                  <p className="text-sm text-gray-900">{project.site_contact_name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Phone</p>
                  <p className="text-sm text-gray-900">{project.site_contact_phone}</p>
                </div>
              </div>
            </div>
          </Card>

          <Card variant="bordered" padding="lg">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                Progress Overview
              </h3>
            </div>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-600">Overall Progress</p>
                  <p className="font-semibold text-gray-900">
                    {project.progress_percentage.toFixed(1)}%
                  </p>
                </div>
                <div className="flex-1 bg-gray-200 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full ${
                      project.progress_percentage >= 75 ? 'bg-success-500' :
                      project.progress_percentage >= 50 ? 'bg-warning-500' :
                      'bg-error-500'
                    }`}
                    style={{ width: `${project.progress_percentage}%` }}
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Start Date</p>
                  <p className="text-sm text-gray-900">{formatDate(project.start_date)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">End Date</p>
                  <p className="text-sm text-gray-900">{project.end_date ? formatDate(project.end_date) : '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Expected</p>
                  <p className={`text-sm text-gray-900 ${
                    new Date(project.expected_end_date) < new Date()
                      ? 'text-error-600 font-semibold'
                      : ''
                  }`}>
                    {formatDate(project.expected_end_date)}
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card variant="bordered" padding="lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Quick Actions
            </h3>
            <div className="space-y-3">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => navigate(`/sales/orders/create?project_id=${id}`)}
              >
                Create Sales Order
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => navigate(`/production/orders/create?project_id=${id}`)}
              >
                Create Production Order
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => navigate(`/documents?reference_id=${id}&reference_type=project`)}
              >
                View Documents
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => navigate(`/reports?project_id=${id}`)}
              >
                Generate Report
              </Button>
            </div>
          </Card>

          <Card variant="bordered" padding="lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Project Manager
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600 mb-1">Name</p>
                <p className="font-semibold text-gray-900">{project.project_manager_name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Phone</p>
                <p className="text-sm text-gray-900">{project.project_manager_phone}</p>
              </div>
            </div>
          </Card>

          <Card variant="bordered" padding="lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Timeline
            </h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className={`w-3 h-3 rounded-full mt-1 ${
                  project.status === 'planning' ? 'bg-blue-500' :
                  project.status === 'in_progress' ? 'bg-yellow-500' :
                  project.status === 'completed' ? 'bg-success-500' :
                  'bg-gray-400'
                }`} />
                <div>
                  <p className="text-sm font-medium text-gray-900">Planning Phase</p>
                  <p className="text-xs text-gray-600">Started: {formatDate(project.start_date)}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-3 h-3 rounded-full bg-gray-300 mt-1" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Execution Phase</p>
                  <p className="text-xs text-gray-600">In Progress</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-3 h-3 rounded-full bg-gray-300 mt-1" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Completion Phase</p>
                  <p className="text-xs text-gray-600">Expected: {formatDate(project.expected_end_date)}</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

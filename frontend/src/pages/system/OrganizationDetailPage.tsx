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
  Building,
  Users,
  Shield,
  Settings,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Database,
  HardDrive,
  Edit,
  Trash2,
  MoreVertical,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react'
import { formatDate, formatNumber, formatCurrency } from '@/utils'
import { toast } from 'sonner'

interface Organization {
  id: number
  name: string
  code: string
  email?: string
  phone?: string
  address?: string
  city?: string
  state?: string
  country?: string
  pin_code?: string
  logo_url?: string
  status: 'active' | 'inactive' | 'suspended'
  max_users: number
  max_storage_gb: number
  max_products: number
  subscription_plan?: string
  subscription_start?: string
  subscription_end?: string
  created_at: string
  updated_at: string
}

interface UsageStats {
  total_users: number
  active_users: number
  total_products: number
  active_products: number
  storage_used_gb: number
  storage_percentage: number
  api_calls_this_month: number
  api_calls_limit: number
}

interface ModuleConfig {
  id: number
  module_name: string
  is_enabled: boolean
  features_enabled: string[]
  last_modified: string
}

export const OrganizationDetailPage: React.FC = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()

  const [organization, setOrganization] = useState<Organization | null>(null)
  const [usageStats, setUsageStats] = useState<UsageStats | null>(null)
  const [moduleConfigs, setModuleConfigs] = useState<ModuleConfig[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'usage' | 'modules' | 'settings'>('overview')

  const tabs = [
    { id: 'overview' as const, label: 'Overview', icon: Building },
    { id: 'usage' as const, label: 'Usage', icon: TrendingUp },
    { id: 'modules' as const, label: 'Modules', icon: Settings },
    { id: 'settings' as const, label: 'Settings', icon: Database },
  ]

  const fetchOrganizationDetails = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const [orgRes, usageRes, modulesRes] = await Promise.all([
        api.get<Organization>(`/system/organizations/${id}`, {
          params: { organization_id: user?.organizationId },
        }),
        api.get<UsageStats>(`/system/organizations/${id}/usage`, {
          params: { organization_id: user?.organizationId },
        }),
        api.get<{ data: ModuleConfig[] }>(`/system/organizations/${id}/modules`, {
          params: { organization_id: user?.organizationId },
        }),
      ])

      setOrganization(orgRes.data)
      setUsageStats(usageRes.data)
      setModuleConfigs(modulesRes.data.data || [])
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch organization details')
      console.error('Failed to fetch organization:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (id) {
      fetchOrganizationDetails()
    }
  }, [id])

  const handleEdit = () => {
    navigate(`/system/organizations/${id}/edit`)
  }

  const handleToggleModule = async (moduleId: number, isEnabled: boolean) => {
    try {
      setIsUpdating(true)
      await api.patch(`/system/organizations/${id}/modules/${moduleId}`, {
        is_enabled: !isEnabled,
        organization_id: user?.organizationId,
      })
      toast.success('Module status updated')
      fetchOrganizationDetails()
    } catch (error) {
      toast.error('Failed to update module status')
    } finally {
      setIsUpdating(false)
    }
  }

  const getStorageColor = (percentage: number) => {
    if (percentage >= 90) return 'text-error-600'
    if (percentage >= 70) return 'text-warning-600'
    return 'text-success-600'
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Organization Details</h1>
          <p className="text-gray-600">Loading organization information...</p>
        </div>
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} height={200} className="rounded" />
          ))}
        </div>
      </div>
    )
  }

  if (error || !organization) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Organization Details</h1>
        </div>
        <Alert variant="error" message={error || 'Organization not found'} />
        <Button variant="outline" onClick={() => navigate('/system/organizations')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Organizations
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{organization.name}</h1>
          <p className="text-gray-600">
            {organization.code} | {organization.subscription_plan || 'Custom'} Plan
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<ArrowLeft className="w-4 h-4" />}
            onClick={() => navigate('/system/organizations')}
          >
            Back
          </Button>
          <ActionMenu
            actions={[
              { label: 'Edit Organization', onClick: handleEdit, icon: Edit },
              { label: 'Delete Organization', onClick: () => {}, icon: Trash2, danger: true },
            ]}
          />
        </div>
      </div>

      <Alert variant={organization.status === 'active' ? 'success' : 'warning'} message={`Status: ${organization.status.toUpperCase()}`} />

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

      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card variant="bordered" padding="lg">
            <CardHeader>
              <CardTitle>Organization Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Organization Name</p>
                  <p className="text-gray-900">{organization.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Code</p>
                  <p className="text-gray-900">{organization.code}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Email</p>
                  <p className="text-gray-900">{organization.email || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Phone</p>
                  <p className="text-gray-900">{organization.phone || 'N/A'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card variant="bordered" padding="lg">
            <CardHeader>
              <CardTitle>Address</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Address</p>
                  <p className="text-gray-900">{organization.address || 'N/A'}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">City</p>
                    <p className="text-gray-900">{organization.city || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">State</p>
                    <p className="text-gray-900">{organization.state || 'N/A'}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Country</p>
                    <p className="text-gray-900">{organization.country || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">PIN Code</p>
                    <p className="text-gray-900">{organization.pin_code || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card variant="bordered" padding="lg">
            <CardHeader>
              <CardTitle>Subscription</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Plan</p>
                  <p className="text-gray-900">{organization.subscription_plan || 'Custom'}</p>
                </div>
                {organization.subscription_start && (
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Start Date</p>
                    <p className="text-gray-900">{formatDate(organization.subscription_start)}</p>
                  </div>
                )}
                {organization.subscription_end && (
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">End Date</p>
                    <p className="text-gray-900">{formatDate(organization.subscription_end)}</p>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                  <div className="p-3 bg-primary-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <Users className="w-4 h-4 text-primary-600" />
                      <span className="text-sm font-medium text-gray-700">Max Users</span>
                    </div>
                    <p className="text-2xl font-bold text-primary-600">{organization.max_users}</p>
                  </div>
                  <div className="p-3 bg-success-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <HardDrive className="w-4 h-4 text-success-600" />
                      <span className="text-sm font-medium text-gray-700">Storage</span>
                    </div>
                    <p className="text-2xl font-bold text-success-600">{organization.max_storage_gb} GB</p>
                  </div>
                </div>
                <div className="pt-4">
                  <div className="p-3 bg-secondary-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <Database className="w-4 h-4 text-secondary-600" />
                      <span className="text-sm font-medium text-gray-700">Max Products</span>
                    </div>
                    <p className="text-2xl font-bold text-secondary-600">{organization.max_products}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card variant="bordered" padding="lg">
            <CardHeader>
              <CardTitle>Status & Dates</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Status</p>
                  <StatusBadge status={organization.status} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Created On</p>
                  <p className="text-gray-900">{formatDate(organization.created_at)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Last Updated</p>
                  <p className="text-gray-900">{formatDate(organization.updated_at)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'usage' && usageStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card variant="bordered" padding="lg">
            <div className="text-center">
              <Users className="w-6 h-6 text-primary-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-600 mb-1">Active Users</p>
              <h3 className="text-2xl font-bold text-gray-900">
                {usageStats.active_users} / {usageStats.total_users}
              </h3>
            </div>
          </Card>
          <Card variant="bordered" padding="lg">
            <div className="text-center">
              <Database className="w-6 h-6 text-success-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-600 mb-1">Storage Used</p>
              <h3 className={`text-2xl font-bold ${getStorageColor(usageStats.storage_percentage)}`}>
                {usageStats.storage_used_gb.toFixed(1)} GB
              </h3>
              <p className="text-xs text-gray-600">{usageStats.storage_percentage.toFixed(1)}%</p>
            </div>
          </Card>
          <Card variant="bordered" padding="lg">
            <div className="text-center">
              <Settings className="w-6 h-6 text-secondary-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-600 mb-1">Active Products</p>
              <h3 className="text-2xl font-bold text-gray-900">
                {usageStats.active_products} / {usageStats.total_products}
              </h3>
            </div>
          </Card>
          <Card variant="bordered" padding="lg">
            <div className="text-center">
              <Shield className="w-6 h-6 text-primary-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-600 mb-1">API Calls</p>
              <h3 className="text-2xl font-bold text-gray-900">
                {usageStats.api_calls_this_month} / {usageStats.api_calls_limit}
              </h3>
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'modules' && (
        <Card variant="bordered" padding="lg">
          <CardHeader>
            <CardTitle>Module Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {moduleConfigs.map((config) => (
                <div
                  key={config.id}
                  className={`p-4 rounded-lg border-2 ${
                    config.is_enabled
                      ? 'border-success-200 bg-success-50'
                      : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Settings className="w-5 h-5 text-gray-600" />
                      <div>
                        <p className="font-semibold text-gray-900">{config.module_name}</p>
                        <p className="text-sm text-gray-600">
                          {config.features_enabled.length} features enabled
                        </p>
                      </div>
                    </div>
                    <Button
                      variant={config.is_enabled ? 'outline' : 'primary'}
                      size="sm"
                      onClick={() => handleToggleModule(config.id, config.is_enabled)}
                      isLoading={isUpdating}
                    >
                      {config.is_enabled ? 'Disable' : 'Enable'}
                    </Button>
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <p className="text-xs text-gray-500 mb-2">Enabled Features:</p>
                    <div className="flex flex-wrap gap-2">
                      {config.features_enabled.map((feature, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-white rounded-full text-xs text-gray-700"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-3">
                    Last modified: {formatDate(config.last_modified)}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'settings' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card variant="bordered" padding="lg">
            <CardHeader>
              <CardTitle>Limits & Configuration</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Max Users</p>
                  <p className="text-lg font-semibold text-gray-900">{organization.max_users}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Max Storage</p>
                  <p className="text-lg font-semibold text-gray-900">{organization.max_storage_gb} GB</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Max Products</p>
                  <p className="text-lg font-semibold text-gray-900">{organization.max_products}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card variant="bordered" padding="lg">
            <CardHeader>
              <CardTitle>Contact & Support</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2 text-blue-800">
                    <Mail className="w-5 h-5" />
                    <span className="font-semibold">Email Support</span>
                  </div>
                  <p className="text-sm mt-1 text-blue-700">support@drymixerp.com</p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-2 text-green-800">
                    <Phone className="w-5 h-5" />
                    <span className="font-semibold">Phone Support</span>
                  </div>
                  <p className="text-sm mt-1 text-green-700">+91 1800-XXX-XXXX</p>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg">
                  <div className="flex items-center gap-2 text-purple-800">
                    <MapPin className="w-5 h-5" />
                    <span className="font-semibold">Documentation</span>
                  </div>
                  <p className="text-sm mt-1 text-purple-700">https://docs.drymixerp.com</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

export default OrganizationDetailPage

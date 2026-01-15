import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { api } from '@/services/api'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { StatusBadge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Loading'
import { Alert } from '@/components/ui/Alert'
import { Search, Filter, Grid, List, Settings, Save, RefreshCw, ToggleLeft, ToggleRight, Eye, Lock } from 'lucide-react'
import { formatDate } from '@/utils'
import { toast } from 'sonner'

interface Module {
  id: number
  module_name: string
  display_name: string
  description?: string
  category: 'core' | 'primary' | 'advanced' | 'integrations' | 'administrative'
  is_enabled: boolean
  version: string
  features: string[]
  dependencies?: string[]
  depends_on?: string[]
  settings_required: boolean
  configuration?: ModuleConfig
  last_modified: string
}

interface ModuleConfig {
  id: number
  module_id: number
  config_key: string
  config_value: string
  display_name: string
  description?: string
}

interface ModuleStats {
  total_modules: number
  enabled_modules: number
  core_modules: number
  primary_modules: number
  advanced_modules: number
  integrations_modules: number
  administrative_modules: number
}

export const ModuleManagementPage: React.FC = () => {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [modules, setModules] = useState<Module[]>([])
  const [stats, setStats] = useState<ModuleStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'core' | 'primary' | 'advanced' | 'integrations' | 'administrative'>('all')
  const [statusFilter, setStatusFilter] = useState<'all' | 'enabled' | 'disabled'>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  const categories = [
    { id: 'all' as const, label: 'All Modules', icon: Grid },
    { id: 'core' as const, label: 'Core Foundation', icon: Settings },
    { id: 'primary' as const, label: 'Primary', icon: Grid },
    { id: 'advanced' as const, label: 'Advanced', icon: List },
    { id: 'integrations' as const, label: 'Integrations', icon: ToggleLeft },
    { id: 'administrative' as const, label: 'Administrative', icon: Lock },
  ]

  const fetchModules = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const [modulesRes, statsRes] = await Promise.all([
        api.get<{ data: Module[] }>('/system/modules', {
          params: {
            organization_id: user?.organizationId,
            per_page: 50,
          },
        }),
        api.get<ModuleStats>('/system/modules/stats', {
          params: {
            organization_id: user?.organizationId,
          },
        }),
      ])

      setModules(modulesRes.data.data || [])
      setStats(statsRes.data)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch modules')
      console.error('Failed to fetch modules:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchModules()
  }, [])

  const filteredModules = modules.filter((module) => {
    const matchesSearch =
      searchTerm === '' ||
      module.module_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      module.display_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (module.description && module.description.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesCategory = categoryFilter === 'all' || module.category === categoryFilter
    const matchesStatus = statusFilter === 'all' || (statusFilter === 'enabled' ? module.is_enabled : !module.is_enabled)
    return matchesSearch && matchesCategory && matchesStatus
  })

  const handleToggleModule = async (moduleId: number, isEnabled: boolean) => {
    try {
      setIsSaving(true)
      await api.patch(`/system/modules/${moduleId}`, {
        is_enabled: !isEnabled,
        organization_id: user?.organizationId,
      })
      toast.success(`Module ${isEnabled ? 'disabled' : 'enabled'} successfully`)
      fetchModules()
    } catch (error) {
      toast.error('Failed to update module status')
    } finally {
      setIsSaving(false)
    }
  }

  const handleConfigure = (moduleId: number) => {
    navigate(`/system/modules/${moduleId}/configure`)
  }

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      core: 'bg-blue-100 text-blue-800',
      primary: 'bg-green-100 text-green-800',
      advanced: 'bg-purple-100 text-purple-800',
      integrations: 'bg-orange-100 text-orange-800',
      administrative: 'bg-gray-100 text-gray-800',
    }
    return colors[category] || 'bg-gray-100 text-gray-800'
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Module Management</h1>
          <p className="text-gray-600">Loading modules...</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} height={200} className="rounded" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Module Management</h1>
          <p className="text-gray-600">Enable, configure, and manage ERP modules</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<RefreshCw className="w-4 h-4" />}
            onClick={fetchModules}
          >
            Refresh
          </Button>
        </div>
      </div>

      {error && <Alert variant="error" message={error} />}

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card variant="bordered" padding="lg">
            <div className="text-center">
              <Settings className="w-6 h-6 text-primary-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-600 mb-1">Total Modules</p>
              <h3 className="text-2xl font-bold text-gray-900">{stats.total_modules}</h3>
            </div>
          </Card>
          <Card variant="bordered" padding="lg">
            <div className="text-center">
              <Grid className="w-6 h-6 text-success-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-600 mb-1">Enabled</p>
              <h3 className="text-2xl font-bold text-success-600">{stats.enabled_modules}</h3>
            </div>
          </Card>
          <Card variant="bordered" padding="lg">
            <div className="text-center">
              <ToggleLeft className="w-6 h-6 text-secondary-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-600 mb-1">Core Modules</p>
              <h3 className="text-2xl font-bold text-gray-900">{stats.core_modules}</h3>
            </div>
          </Card>
          <Card variant="bordered" padding="lg">
            <div className="text-center">
              <List className="w-6 h-6 text-warning-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-600 mb-1">Primary</p>
              <h3 className="text-2xl font-bold text-gray-900">{stats.primary_modules}</h3>
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
                placeholder="Search modules..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setCategoryFilter(category.id)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  categoryFilter === category.id
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            {['all', 'enabled', 'disabled'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status as 'all' | 'enabled' | 'disabled')}
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
          <div className="flex items-center gap-2 border-l border-gray-200 pl-4">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-primary-50 text-primary-600' : 'hover:bg-gray-100'}`}
            >
              <Grid className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-primary-50 text-primary-600' : 'hover:bg-gray-100'}`}
            >
              <List className="w-5 h-5" />
            </button>
          </div>
        </div>
      </Card>

      <Card variant="bordered" padding="lg">
        <CardHeader>
          <CardTitle>Available Modules</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Skeleton key={i} height={150} className="rounded" />
              ))}
            </div>
          ) : filteredModules.length === 0 ? (
            <div className="text-center py-8">
              <Settings className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No modules found</p>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredModules.map((module) => (
                <div
                  key={module.id}
                  className={`p-4 rounded-lg border-2 transition-all hover:shadow-lg ${
                    module.is_enabled
                      ? 'border-success-200 bg-white'
                      : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Settings className="w-5 h-5 text-gray-600" />
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-gray-900">{module.display_name}</p>
                          <StatusBadge status={module.is_enabled ? 'active' : 'inactive'} />
                        </div>
                        <p className="text-xs text-gray-600">{module.module_name}</p>
                      </div>
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{module.description || 'No description'}</p>

                  <div className="mb-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(module.category)}`}>
                      {module.category}
                    </span>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <span>Version:</span>
                      <span className="font-medium">{module.version}</span>
                    </div>
                    {module.dependencies && module.dependencies.length > 0 && (
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <span>Dependencies:</span>
                        <span>{module.dependencies.join(', ')}</span>
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-gray-200">
                    <p className="text-xs text-gray-500 mb-2">
                      {module.features.length} features available
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {module.features.slice(0, 4).map((feature, index) => (
                        <span key={index} className="px-2 py-1 bg-gray-100 rounded text-xs text-gray-700">
                          {feature}
                        </span>
                      ))}
                      {module.features.length > 4 && (
                        <span className="px-2 py-1 bg-gray-100 rounded text-xs text-gray-700">
                          +{module.features.length - 4} more
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {module.settings_required && (
                      <Button
                        variant="outline"
                        size="sm"
                        leftIcon={<Eye className="w-4 h-4" />}
                        onClick={() => handleConfigure(module.id)}
                      >
                        Configure
                      </Button>
                    )}
                    <Button
                      variant={module.is_enabled ? 'outline' : 'primary'}
                      size="sm"
                      onClick={() => handleToggleModule(module.id, module.is_enabled)}
                      isLoading={isSaving}
                    >
                      {module.is_enabled ? 'Disable' : 'Enable'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredModules.map((module) => (
                <div
                  key={module.id}
                  className={`p-4 rounded-lg border-2 transition-all hover:shadow-lg ${
                    module.is_enabled
                      ? 'border-success-200 bg-white'
                      : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Settings className="w-5 h-5 text-gray-600" />
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-gray-900">{module.display_name}</p>
                          <StatusBadge status={module.is_enabled ? 'active' : 'inactive'} />
                        </div>
                        <p className="text-xs text-gray-600">{module.module_name}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {module.settings_required && (
                        <Button
                          variant="outline"
                          size="sm"
                          leftIcon={<Eye className="w-4 h-4" />}
                          onClick={() => handleConfigure(module.id)}
                        >
                          Configure
                        </Button>
                      )}
                      <Button
                        variant={module.is_enabled ? 'outline' : 'primary'}
                        size="sm"
                        onClick={() => handleToggleModule(module.id, module.is_enabled)}
                        isLoading={isSaving}
                      >
                        {module.is_enabled ? 'Disable' : 'Enable'}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default ModuleManagementPage

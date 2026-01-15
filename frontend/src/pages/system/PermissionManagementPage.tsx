import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { api } from '@/services/api'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Skeleton } from '@/components/ui/Loading'
import { Search, Filter, CheckSquare, Settings, Shield, Save, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'

interface Permission {
  id: number
  name: string
  module: string
  action: string
  description?: string
}

interface Role {
  id: number
  name: string
  description?: string
  permissions: Permission[]
}

export const PermissionManagementPage: React.FC = () => {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [permissions, setPermissions] = useState<Permission[]>([])
  const [roles, setRoles] = useState<Role[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [moduleFilter, setModuleFilter] = useState('all')
  const [selectedPermissions, setSelectedPermissions] = useState<Set<number>>(new Set())
  const [isSaving, setIsSaving] = useState(false)
  const [page, setPage] = useState(1)

  const modules = ['all', 'sales', 'production', 'quality', 'inventory', 'procurement', 'finance', 'hr', 'planning', 'communication', 'system']

  const fetchPermissions = async () => {
    try {
      setIsLoading(true)
      const [permRes, rolesRes] = await Promise.all([
        api.get<{ data: Permission[] }>('/system/permissions', {
          params: {
            organization_id: user?.organizationId,
            per_page: 100,
          },
        }),
        api.get<{ data: Role[] }>('/system/roles', {
          params: {
            organization_id: user?.organizationId,
            per_page: 50,
          },
        }),
      ])

      setPermissions(permRes.data.data || [])
      setRoles(rolesRes.data.data || [])
    } catch (error) {
      console.error('Failed to fetch permissions:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchPermissions()
  }, [])

  const filteredPermissions = permissions.filter((permission) => {
    const matchesSearch =
      searchTerm === '' ||
      permission.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      permission.module.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (permission.description && permission.description.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesModule = moduleFilter === 'all' || permission.module === moduleFilter
    return matchesSearch && matchesModule
  })

  const groupedPermissions = filteredPermissions.reduce((acc, permission) => {
    if (!acc[permission.module]) {
      acc[permission.module] = []
    }
    acc[permission.module].push(permission)
    return acc
  }, {} as Record<string, Permission[]>)

  const handleTogglePermission = (permissionId: number) => {
    const newSelected = new Set(selectedPermissions)
    if (newSelected.has(permissionId)) {
      newSelected.delete(permissionId)
    } else {
      newSelected.add(permissionId)
    }
    setSelectedPermissions(newSelected)
  }

  const handleSelectAll = () => {
    if (selectedPermissions.size === filteredPermissions.length) {
      setSelectedPermissions(new Set())
    } else {
      setSelectedPermissions(new Set(filteredPermissions.map((p) => p.id)))
    }
  }

  const handleCreateRole = async () => {
    if (selectedPermissions.size === 0) {
      toast.error('Please select at least one permission')
      return
    }

    try {
      setIsSaving(true)
      const response = await api.post<{ data: Role }>('/system/roles', {
        organization_id: user?.organizationId,
        name: `New Role (${new Date().toISOString().split('T')[0]})`,
        description: 'Custom role created from permissions',
        permission_ids: Array.from(selectedPermissions),
      })

      toast.success('Role created successfully')
      navigate(`/system/roles/${response.data.id}`)
    } catch (error) {
      toast.error('Failed to create role')
    } finally {
      setIsSaving(false)
    }
  }

  const getModuleIcon = (module: string) => {
    return <Settings className="w-4 h-4" />
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Permission Management</h1>
          <p className="text-gray-600">Manage system permissions and roles</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<RefreshCw className="w-4 h-4" />}
            onClick={fetchPermissions}
            isLoading={isLoading}
          >
            Refresh
          </Button>
        </div>
      </div>

      <Card variant="bordered" padding="md">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Search permissions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            {modules.map((module) => (
              <button
                key={module}
                onClick={() => setModuleFilter(module)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
                  moduleFilter === module
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {module}
              </button>
            ))}
          </div>
        </div>
      </Card>

      <Card variant="bordered" padding="lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Permissions</CardTitle>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSelectAll}
              >
                {selectedPermissions.size === filteredPermissions.length ? 'Deselect All' : 'Select All'}
              </Button>
              {selectedPermissions.size > 0 && (
                <Button
                  variant="primary"
                  size="sm"
                  leftIcon={<Shield className="w-4 h-4" />}
                  onClick={handleCreateRole}
                  isLoading={isSaving}
                >
                  Create Role ({selectedPermissions.size})
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} height={80} className="rounded" />
              ))}
            </div>
          ) : Object.keys(groupedPermissions).length === 0 ? (
            <div className="text-center py-8">
              <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No permissions found</p>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedPermissions).map(([module, perms]) => (
                <div key={module}>
                  <div className="flex items-center gap-2 mb-3">
                    {getModuleIcon(module)}
                    <h4 className="text-lg font-semibold text-gray-900 capitalize">{module} Module</h4>
                    <span className="text-sm text-gray-600">({perms.length} permissions)</span>
                  </div>
                  <div className="space-y-2">
                    {perms.map((permission) => (
                      <div
                        key={permission.id}
                        className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                          selectedPermissions.has(permission.id)
                            ? 'border-primary-600 bg-primary-50'
                            : 'border-gray-200 hover:border-primary-300'
                        }`}
                        onClick={() => handleTogglePermission(permission.id)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-semibold text-gray-900">{permission.name}</p>
                              {selectedPermissions.has(permission.id) && (
                                <CheckSquare className="w-5 h-5 text-primary-600" />
                              )}
                            </div>
                            <p className="text-sm text-gray-600 capitalize">{permission.action}</p>
                            {permission.description && (
                              <p className="text-xs text-gray-500 mt-1">{permission.description}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
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

export default PermissionManagementPage

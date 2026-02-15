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
  Shield,
  Users,
  Edit,
  Trash2,
  MoreVertical,
  Settings,
  Plus,
  CheckSquare,
} from 'lucide-react'
import { formatDate } from '@/utils'
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
  organization_id: number
  name: string
  description?: string
  is_default: boolean
  permissions: Permission[]
  user_count?: number
  created_at: string
  updated_at: string
}

export const RoleDetailPage: React.FC = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()

  const [role, setRole] = useState<Role | null>(null)
  const [allPermissions, setAllPermissions] = useState<Permission[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'permissions' | 'users'>('overview')

  const tabs = [
    { id: 'overview' as const, label: 'Overview', icon: Shield },
    { id: 'permissions' as const, label: 'Permissions', icon: Settings },
    { id: 'users' as const, label: 'Users', icon: Users },
  ]

  const fetchRoleDetails = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const [roleRes, permissionsRes] = await Promise.all([
        api.get<Role>(`/system/roles/${id}`, {
          params: { organization_id: user?.organization_id },
        }),
        api.get<{ data: Permission[] }>('/system/permissions', {
          params: { organization_id: user?.organization_id, per_page: 100 },
        }),
      ])

      setRole(roleRes.data)
      setAllPermissions(permissionsRes.data.data || [])
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch role details')
      console.error('Failed to fetch role details:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (id) {
      fetchRoleDetails()
    }
  }, [id])

  const handleEdit = () => {
    navigate(`/system/roles/${id}/edit`)
  }

  const handleTogglePermission = async (permissionId: number, hasPermission: boolean) => {
    try {
      if (hasPermission) {
        await api.delete(`/system/roles/${id}/permissions/${permissionId}`, {
          params: { organization_id: user?.organization_id },
        })
      } else {
        await api.post(`/system/roles/${id}/permissions`, {
          permission_id: permissionId,
          organization_id: user?.organization_id,
        })
      }
      toast.success(hasPermission ? 'Permission removed' : 'Permission added')
      fetchRoleDetails()
    } catch (error) {
      toast.error('Failed to update permissions')
    }
  }

  const handleDeleteRole = async () => {
    if (!window.confirm('Are you sure you want to delete this role? This action cannot be undone.')) {
      return
    }

    try {
      await api.delete(`/system/roles/${id}`, {
        params: { organization_id: user?.organization_id },
      })
      toast.success('Role deleted successfully')
      navigate('/system/roles')
    } catch (error) {
      toast.error('Failed to delete role')
    }
  }

  const groupedPermissions = allPermissions.reduce((acc, permission) => {
    if (!acc[permission.module]) {
      acc[permission.module] = []
    }
    acc[permission.module].push(permission)
    return acc
  }, {} as Record<string, Permission[]>)

  const rolePermissions = role?.permissions.map((p) => p.id) || []
  const unassignedPermissions = allPermissions.filter((p) => !rolePermissions.includes(p.id))

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Role Details</h1>
          <p className="text-gray-600">Loading role information...</p>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} height={200} className="rounded" />
          ))}
        </div>
      </div>
    )
  }

  if (error || !role) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Role Details</h1>
        </div>
        <Alert type="error" message={error || 'Role not found'} />
        <Button variant="outline" onClick={() => navigate('/system/roles')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Roles
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{role.name}</h1>
          <p className="text-gray-600">
            {role.description || 'No description'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<ArrowLeft className="w-4 h-4" />}
            onClick={() => navigate('/system/roles')}
          >
            Back
          </Button>
          <ActionMenu
            actions={[
              { label: 'Edit Role', onClick: handleEdit, icon: Edit },
              { label: 'Delete Role', onClick: handleDeleteRole, icon: Trash2, danger: true },
            ]}
          />
        </div>
      </div>

      <Alert
        variant={role.is_default ? 'info' : 'success'}
        message={role.is_default ? 'This is a default system role and cannot be fully deleted' : 'Custom role'}
      />

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
              <CardTitle>Role Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Role Name</p>
                  <p className="text-gray-900">{role.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Description</p>
                  <p className="text-gray-900">{role.description || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Organization ID</p>
                  <p className="text-gray-900">{role.organization_id}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Type</p>
                  <StatusBadge status={role.is_default ? 'default' : 'custom'} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card variant="bordered" padding="lg">
            <CardHeader>
              <CardTitle>Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-primary-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Shield className="w-5 h-5 text-primary-600" />
                      <span className="text-sm font-medium text-gray-700">Total Permissions</span>
                    </div>
                    <span className="text-2xl font-bold text-primary-600">
                      {role.permissions.length}
                    </span>
                  </div>
                </div>
                <div className="p-4 bg-success-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-success-600" />
                      <span className="text-sm font-medium text-gray-700">Users with this Role</span>
                    </div>
                    <span className="text-2xl font-bold text-success-600">
                      {role.user_count || 0}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'permissions' && (
        <Card variant="bordered" padding="lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Role Permissions</CardTitle>
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Plus className="w-4 h-4" />}
                onClick={() => navigate(`/system/roles/${id}/permissions/edit`)}
              >
                Manage Permissions
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {role.permissions.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">Assigned Permissions</h4>
                  <div className="space-y-2">
                    {role.permissions.map((permission) => (
                      <div
                        key={permission.id}
                        className="p-3 bg-green-50 rounded-lg flex items-center justify-between"
                      >
                        <div>
                          <p className="font-medium text-gray-900">{permission.name}</p>
                          <p className="text-sm text-gray-600">
                            {permission.module} - {permission.action}
                          </p>
                        </div>
                        <button
                          onClick={() => handleTogglePermission(permission.id, true)}
                          className="text-red-600 hover:text-red-800 p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {unassignedPermissions.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">Available Permissions</h4>
                  <div className="space-y-2">
                    {unassignedPermissions.slice(0, 10).map((permission) => (
                      <div
                        key={permission.id}
                        className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 flex items-center justify-between"
                      >
                        <div>
                          <p className="font-medium text-gray-900">{permission.name}</p>
                          <p className="text-sm text-gray-600">
                            {permission.module} - {permission.action}
                          </p>
                        </div>
                        <button
                          onClick={() => handleTogglePermission(permission.id, false)}
                          className="text-green-600 hover:text-green-800"
                        >
                          <CheckSquare className="w-5 h-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {Object.keys(groupedPermissions).map((module) => (
                <div key={module}>
                  <h4 className="text-sm font-semibold text-gray-900 mb-3 capitalize">{module} Module</h4>
                  <div className="space-y-2">
                    {groupedPermissions[module].slice(0, 5).map((permission) => (
                      <div
                        key={permission.id}
                        className={`p-3 rounded-lg flex items-center justify-between ${
                          rolePermissions.includes(permission.id)
                            ? 'bg-green-50'
                            : 'bg-gray-50'
                        }`}
                      >
                        <div>
                          <p className="font-medium text-gray-900">{permission.name}</p>
                          <p className="text-sm text-gray-600">{permission.action}</p>
                        </div>
                        <button
                          onClick={() => handleTogglePermission(permission.id, rolePermissions.includes(permission.id))}
                          className={rolePermissions.includes(permission.id)
                            ? 'text-red-600 hover:text-red-800'
                            : 'text-green-600 hover:text-green-800'
                          }
                        >
                          {rolePermissions.includes(permission.id) ? (
                            <Trash2 className="w-4 h-4" />
                          ) : (
                            <CheckSquare className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'users' && (
        <Card variant="bordered" padding="lg">
          <CardHeader>
            <CardTitle>Users with this Role</CardTitle>
          </CardHeader>
          <CardContent>
            {role.user_count === 0 ? (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">No users assigned to this role</p>
                <Button
                  variant="primary"
                  size="sm"
                  leftIcon={<Plus className="w-4 h-4" />}
                  onClick={() => navigate('/system/users/create')}
                >
                  Assign User
                </Button>
              </div>
            ) : (
              <div className="p-4 bg-primary-50 rounded-lg">
                <div className="flex items-center justify-center gap-4">
                  <Users className="w-8 h-8 text-primary-600" />
                  <div>
                    <p className="text-3xl font-bold text-primary-600">{role.user_count}</p>
                    <p className="text-sm text-gray-600">Users have this role</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default RoleDetailPage

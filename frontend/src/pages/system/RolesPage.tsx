import React, { useState, useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Loading } from '@/components/ui/Loading'

interface Role {
  id: number
  name: string
  guard_name: string
  permissions_count: number
  users_count: number
  created_at: string
}

interface Permission {
  id: number
  name: string
  module: string
}

const RolesPage: React.FC = () => {
  const [roles, setRoles] = useState<Role[]>([])
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)

  useEffect(() => {
    fetchRoles()
    fetchPermissions()
  }, [])

  const fetchRoles = async () => {
    try {
      setLoading(true)
      // const response = await SystemService.getRoles()
      setRoles([])
    } catch (error) {
      console.error('Failed to fetch roles:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchPermissions = async () => {
    try {
      // const response = await SystemService.getPermissions()
      setPermissions([])
    } catch (error) {
      console.error('Failed to fetch permissions:', error)
    }
  }

  if (loading) {
    return <Loading message="Loading roles..." />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Roles & Permissions</h1>
          <p className="text-gray-600">Manage user roles and access permissions</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>Create Role</Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Roles List */}
        <Card className="lg:col-span-1">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Roles</h2>
            <p className="text-sm text-gray-600">{roles.length} roles</p>
          </div>
          <div className="p-4 space-y-2 max-h-96 overflow-y-auto">
            {roles.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No roles found</p>
            ) : (
              roles.map((role) => (
                <div
                  key={role.id}
                  onClick={() => setSelectedRole(role)}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedRole?.id === role.id
                      ? 'bg-primary-100 border-2 border-primary-500'
                      : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
                  }`}
                >
                  <div className="font-medium text-gray-900">{role.name}</div>
                  <div className="text-sm text-gray-600 mt-1">
                    {role.permissions_count} permissions • {role.users_count} users
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Permissions */}
        <Card className="lg:col-span-2">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              {selectedRole ? selectedRole.name : 'Select a Role'}
            </h2>
            <p className="text-sm text-gray-600">Manage permissions</p>
          </div>
          <div className="p-4 max-h-96 overflow-y-auto">
            {selectedRole ? (
              <div className="space-y-4">
                {['system', 'production', 'sales', 'inventory', 'finance', 'hr', 'quality'].map((module) => (
                  <div key={module} className="border border-gray-200 rounded-lg">
                    <div className="p-3 bg-gray-50 rounded-t-lg font-medium text-gray-900 capitalize">
                      {module}
                    </div>
                    <div className="p-3 space-y-2">
                      {permissions
                        .filter((p) => p.module === module)
                        .map((permission) => (
                          <label key={permission.id} className="flex items-center space-x-3">
                            <input
                              type="checkbox"
                              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                            />
                            <span className="text-sm text-gray-700">{permission.name}</span>
                          </label>
                        ))}
                      {permissions.filter((p) => p.module === module).length === 0 && (
                        <p className="text-sm text-gray-500">No permissions defined</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-64 text-gray-500">
                Select a role to view and manage permissions
              </div>
            )}
          </div>
          {selectedRole && (
            <div className="p-4 border-t border-gray-200 flex justify-end gap-2">
              <Button variant="secondary">Cancel</Button>
              <Button>Save Changes</Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}

export default RolesPage

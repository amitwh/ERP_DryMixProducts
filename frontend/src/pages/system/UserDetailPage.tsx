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
  User,
  Shield,
  Calendar,
  Mail,
  Phone,
  MapPin,
  Building,
  Edit,
  Trash2,
  Lock,
  Unlock,
  MoreVertical,
  Activity,
  Key,
  AlertTriangle,
} from 'lucide-react'
import { formatDate, formatDateTime } from '@/utils'
import { toast } from 'sonner'

interface User {
  id: number
  organization_id: number
  first_name: string
  last_name: string
  email: string
  phone?: string
  status: 'active' | 'inactive' | 'suspended'
  role_id: number
  role_name: string
  department?: string
  designation?: string
  avatar?: string
  last_login_at?: string
  created_at: string
  updated_at: string
}

interface ActivityLog {
  id: number
  user_id: number
  action: string
  entity_type?: string
  entity_id?: number
  ip_address?: string
  user_agent?: string
  created_at: string
}

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

export const UserDetailPage: React.FC = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()

  const [userData, setUserData] = useState<User | null>(null)
  const [roles, setRoles] = useState<Role[]>([])
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'roles' | 'activity' | 'security'>('overview')

  const tabs = [
    { id: 'overview' as const, label: 'Overview', icon: User },
    { id: 'roles' as const, label: 'Roles & Permissions', icon: Shield },
    { id: 'activity' as const, label: 'Activity Log', icon: Activity },
    { id: 'security' as const, label: 'Security', icon: Lock },
  ]

  const fetchUserDetails = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const [userRes, rolesRes, activityRes] = await Promise.all([
        api.get<User>(`/system/users/${id}`, {
          params: { organization_id: user?.organization_id },
        }),
        api.get<{ data: Role[] }>('/system/roles', {
          params: { organization_id: user?.organization_id, per_page: 50 },
        }),
        api.get<{ data: ActivityLog[] }>(`/system/users/${id}/activity-logs`, {
          params: { organization_id: user?.organization_id, per_page: 20 },
        }),
      ])

      setUserData(userRes.data)
      setRoles(rolesRes.data.data || [])
      setActivityLogs(activityRes.data.data || [])
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch user details')
      console.error('Failed to fetch user details:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (id) {
      fetchUserDetails()
    }
  }, [id])

  const handleEdit = () => {
    navigate(`/system/users/${id}/edit`)
  }

  const handleStatusChange = async (newStatus: string) => {
    try {
      setIsUpdating(true)
      await api.patch(`/system/users/${id}`, {
        status: newStatus,
        organization_id: user?.organization_id,
      })
      toast.success('User status updated successfully')
      fetchUserDetails()
    } catch (error) {
      toast.error('Failed to update user status')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDeleteUser = async () => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return
    }

    try {
      setIsUpdating(true)
      await api.delete(`/system/users/${id}`, {
        params: { organization_id: user?.organization_id },
      })
      toast.success('User deleted successfully')
      navigate('/system/users')
    } catch (error) {
      toast.error('Failed to delete user')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleResetPassword = async () => {
    if (!window.confirm('Are you sure you want to send a password reset email to this user?')) {
      return
    }

    try {
      setIsUpdating(true)
      await api.post(`/system/users/${id}/reset-password`, {
        organization_id: user?.organization_id,
      })
      toast.success('Password reset email sent successfully')
    } catch (error) {
      toast.error('Failed to send password reset email')
    } finally {
      setIsUpdating(false)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Details</h1>
          <p className="text-gray-600">Loading user information...</p>
        </div>
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} height={200} className="rounded" />
          ))}
        </div>
      </div>
    )
  }

  if (error || !userData) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Details</h1>
        </div>
        <Alert type="error" message={error || 'User not found'} />
        <Button variant="outline" onClick={() => navigate('/system/users')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Users
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Details</h1>
          <p className="text-gray-600">
            {userData.first_name} {userData.last_name} - {userData.email}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<ArrowLeft className="w-4 h-4" />}
            onClick={() => navigate('/system/users')}
          >
            Back
          </Button>
          <ActionMenu
            actions={[
              { label: 'Edit User', onClick: handleEdit, icon: Edit },
              ...(userData.status === 'active'
                ? [{ label: 'Suspend User', onClick: () => handleStatusChange('suspended'), icon: Lock }]
                : [{ label: 'Activate User', onClick: () => handleStatusChange('active'), icon: Unlock }]),
              { label: 'Reset Password', onClick: handleResetPassword, icon: Key },
              { label: 'Delete User', onClick: handleDeleteUser, icon: Trash2 },
            ]}
          />
        </div>
      </div>

      <Alert type={userData.status === 'active' ? 'success' : 'warning'} message={`User Status: ${userData.status.toUpperCase()}`} />

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
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Full Name</p>
                  <p className="text-gray-900">
                    {userData.first_name} {userData.last_name}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Email</p>
                  <p className="text-gray-900">{userData.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Phone</p>
                  <p className="text-gray-900">{userData.phone || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Status</p>
                  <StatusBadge status={userData.status} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card variant="bordered" padding="lg">
            <CardHeader>
              <CardTitle>Organization Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Role</p>
                  <p className="text-gray-900">{userData.role_name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Department</p>
                  <p className="text-gray-900">{userData.department || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Designation</p>
                  <p className="text-gray-900">{userData.designation || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Organization ID</p>
                  <p className="text-gray-900">{userData.organization_id}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'roles' && (
        <Card variant="bordered" padding="lg">
          <CardHeader>
            <CardTitle>Roles & Permissions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-primary-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Shield className="w-6 h-6 text-primary-600" />
                  <div>
                    <p className="text-lg font-semibold text-gray-900">{userData.role_name}</p>
                    <p className="text-sm text-gray-600">Current Role</p>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-700 mb-3">Available Roles</p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {roles.map((role) => (
                    <div
                      key={role.id}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                        role.id === userData.role_id
                          ? 'border-primary-600 bg-primary-50'
                          : 'border-gray-200 hover:border-primary-300'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Shield className="w-4 h-4 text-gray-600" />
                        <p className="font-medium text-gray-900">{role.name}</p>
                      </div>
                      <p className="text-xs text-gray-600">{role.permissions?.length || 0} permissions</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'activity' && (
        <Card variant="bordered" padding="lg">
          <CardHeader>
            <CardTitle>Activity Log</CardTitle>
          </CardHeader>
          <CardContent>
            {activityLogs.length === 0 ? (
              <div className="text-center py-8">
                <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No activity logs found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {activityLogs.slice(0, 20).map((log) => (
                  <div key={log.id} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Activity className="w-4 h-4 text-primary-600" />
                          <p className="font-medium text-gray-900">{log.action}</p>
                        </div>
                        {log.entity_type && (
                          <p className="text-sm text-gray-600">
                            {log.entity_type} {log.entity_id ? `#${log.entity_id}` : ''}
                          </p>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">
                        {formatDateTime(log.created_at)}
                      </p>
                    </div>
                    {log.ip_address && (
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span>IP: {log.ip_address}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === 'security' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card variant="bordered" padding="lg">
            <CardHeader>
              <CardTitle>Login Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Last Login</p>
                  <p className="text-gray-900">
                    {userData.last_login_at ? formatDateTime(userData.last_login_at) : 'Never'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Created On</p>
                  <p className="text-gray-900">{formatDate(userData.created_at)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Last Updated</p>
                  <p className="text-gray-900">{formatDate(userData.updated_at)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card variant="bordered" padding="lg">
            <CardHeader>
              <CardTitle>Security Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button
                  variant="outline"
                  className="w-full"
                  leftIcon={<Key className="w-4 h-4" />}
                  onClick={handleResetPassword}
                  isLoading={isUpdating}
                >
                  Send Password Reset Email
                </Button>

                {userData.status === 'active' ? (
                  <Button
                    variant="outline"
                    className="w-full"
                    leftIcon={<Lock className="w-4 h-4" />}
                    onClick={() => handleStatusChange('suspended')}
                    isLoading={isUpdating}
                  >
                    Suspend User
                  </Button>
                ) : (
                  <Button
                    variant="primary"
                    className="w-full"
                    leftIcon={<Unlock className="w-4 h-4" />}
                    onClick={() => handleStatusChange('active')}
                    isLoading={isUpdating}
                  >
                    Activate User
                  </Button>
                )}

                <div className="p-4 bg-warning-50 rounded-lg border border-warning-200">
                  <div className="flex items-center gap-2 text-warning-800">
                    <AlertTriangle className="w-5 h-5" />
                    <span className="font-medium">Danger Zone</span>
                  </div>
                  <p className="text-sm text-warning-700 mt-2">
                    Deleting a user will permanently remove their access and data.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full mt-3 border-error-500 text-error-600 hover:bg-error-50"
                    leftIcon={<Trash2 className="w-4 h-4" />}
                    onClick={handleDeleteUser}
                    isLoading={isUpdating}
                  >
                    Delete User
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

export default UserDetailPage

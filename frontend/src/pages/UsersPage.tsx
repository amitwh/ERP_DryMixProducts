import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { api } from '@/services/api'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { StatusBadge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Loading'
import { Plus, Search, RefreshCw, Users, Shield, Key, Eye, Pencil, Trash2, Mail } from 'lucide-react'
import { formatDate } from '@/utils'

interface SystemUser {
  id: number
  name: string
  email: string
  role: string
  department: string
  status: 'active' | 'inactive' | 'locked'
  last_login: string | null
}

export const UsersPage: React.FC = () => {
  const { user: currentUser } = useAuth()
  const navigate = useNavigate()

  const [users, setUsers] = useState<SystemUser[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [page, setPage] = useState(1)

  const fetchUsers = async () => {
    try {
      setIsLoading(true)
      const response = await api.get<{ data: SystemUser[] }>('/system/users', {
        params: {
          organization_id: currentUser?.organization_id,
          per_page: 20,
          page,
        },
      })
      setUsers(response.data.data || [])
    } catch (error) {
      console.error('Failed to fetch users:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [page])

  const filteredUsers = users.filter((userItem) => {
    const matchesSearch =
      searchTerm === '' ||
      userItem.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      userItem.email.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesRole = roleFilter === 'all' || userItem.role === roleFilter
    const matchesStatus = statusFilter === 'all' || userItem.status === statusFilter

    return matchesSearch && matchesRole && matchesStatus
  })

  const roles = ['all', 'Admin', 'Manager', 'User', 'Viewer']
  const statuses = ['all', 'active', 'inactive', 'locked']

  const statusColors: Record<string, string> = {
    active: 'bg-green-100 text-green-800',
    inactive: 'bg-gray-100 text-gray-800',
    locked: 'bg-red-100 text-red-800',
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">System Users</h1>
          <p className="text-gray-600">Manage user accounts and access</p>
        </div>
        <Button variant="primary" size="sm" leftIcon={<Plus className="w-4 h-4" />} onClick={() => navigate('/system/users/create')}>
          Add User
        </Button>
      </div>

      {/* Filters */}
      <Card variant="bordered" padding="md">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
          >
            {roles.map((role) => (
              <option key={role} value={role}>
                {role === 'all' ? 'All Roles' : role}
              </option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
          >
            {statuses.map((status) => (
              <option key={status} value={status}>
                {status === 'all' ? 'All Status' : status.replace(/_/g, ' ').toUpperCase()}
              </option>
            ))}
          </select>
        </div>
      </Card>

      {/* Users List */}
      <Card variant="bordered" padding="lg">
        <CardHeader>
          <CardTitle>Users</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} height={80} className="rounded" />)}
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">No users found</p>
              <Button variant="primary" size="sm" leftIcon={<Plus className="w-4 h-4" />} onClick={() => navigate('/system/users/create')}>
                Create First User
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredUsers.map((userItem) => (
                <div key={userItem.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center justify-center w-12 h-12 bg-primary-100 rounded-full">
                    <Users className="w-6 h-6 text-primary-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-gray-900">{userItem.name}</span>
                      <span className={`px-2 py-0.5 text-xs rounded-full ${statusColors[userItem.status] || 'bg-gray-100'}`}>
                        {userItem.status.replace(/_/g, ' ').toUpperCase()}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        {userItem.email}
                      </span>
                      <span>•</span>
                      <span>{userItem.role}</span>
                      <span>•</span>
                      <span>{userItem.department}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="space-y-1">
                      <p className="text-xs text-gray-500">Last Login</p>
                      <p className="font-semibold text-gray-900">{userItem.last_login ? formatDate(userItem.last_login) : 'Never'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" leftIcon={<Shield className="w-4 h-4" />} onClick={() => navigate(`/system/users/${userItem.id}/permissions`)}>
                      Permissions
                    </Button>
                    <Button variant="ghost" size="sm" leftIcon={<Eye className="w-4 h-4" />} onClick={() => navigate(`/system/users/${userItem.id}`)}>
                      View
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {users.length > 0 && (
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(page - 1)}>
            Previous
          </Button>
          <span className="px-4 py-2">Page {page}</span>
          <Button variant="outline" size="sm" onClick={() => setPage(page + 1)}>
            Next
          </Button>
        </div>
      )}
    </div>
  )
}

export default UsersPage

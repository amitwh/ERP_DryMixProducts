import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { DataTable, Column } from '@/components/ui/DataTable'
import { Badge } from '@/components/ui/Badge'
import { Input } from '@/components/ui/Input'
import { Loader2, Plus, Search, RefreshCw, User as UserIcon, Mail, Building2 } from 'lucide-react'
import { toast } from 'sonner'
import systemService from '@/services/system.service'
import { useQuery } from '@tanstack/react-query'

// Types
interface User {
  id: number
  name: string
  email: string
  phone?: string
  organization?: {
    id: number
    name: string
  }
  manufacturingUnit?: {
    id: number
    name: string
  }
  roles?: Array<{
    id: number
    name: string
  }>
  status: 'active' | 'inactive' | 'suspended'
  last_login_at?: string
  created_at: string
}

const UsersPage: React.FC = () => {
  const navigate = useNavigate()
  const { user: currentUser } = useAuth()
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [roleFilter, setRoleFilter] = useState('')

  // Fetch users
  const { data: usersData, isLoading, refetch } = useQuery({
    queryKey: ['users', { search: searchQuery, status: statusFilter, role: roleFilter }],
    queryFn: async () => {
      return systemService.getUsers({
        search: searchQuery,
        status: statusFilter,
        role: roleFilter,
      })
    },
  })

  const users: User[] = usersData?.data || []

  // Get status badge variant
  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'success' | 'error' | 'warning' | 'default'> = {
      active: 'success',
      inactive: 'default',
      suspended: 'error',
    }
    return variants[status] || 'default'
  }

  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Never'
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  // Get user initials
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  // Table columns
  const columns: Column<User>[] = [
    {
      header: 'User',
      accessorKey: 'name',
      cell: (item) => (
        <div className="flex items-center">
          <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-semibold text-sm">
            {getInitials(item.name)}
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">{item.name}</div>
            <div className="text-sm text-gray-500">{item.email}</div>
          </div>
        </div>
      ),
    },
    {
      header: 'Organization',
      accessorKey: 'organization',
      cell: (item) => (
        <div className="flex items-center text-sm text-gray-900">
          <Building2 className="w-4 h-4 mr-2 text-gray-400" />
          {item.organization?.name || '-'}
        </div>
      ),
    },
    {
      header: 'Roles',
      accessorKey: 'roles',
      cell: (item) => (
        <div className="flex gap-1 flex-wrap">
          {item.roles && item.roles.length > 0 ? (
            item.roles.map((role) => (
              <Badge key={role.id} variant="info" size="sm">
                {role.name}
              </Badge>
            ))
          ) : (
            <span className="text-gray-500">-</span>
          )}
        </div>
      ),
    },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: (item) => (
        <Badge variant={getStatusBadge(item.status)}>
          {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
        </Badge>
      ),
    },
    {
      header: 'Last Login',
      accessorKey: 'last_login_at',
      cell: (item) => (
        <span className="text-sm text-gray-600">{formatDate(item.last_login_at)}</span>
      ),
    },
    {
      header: 'Actions',
      cell: (item) => (
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/system/users/${item.id}`)}
          >
            View
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/system/users/${item.id}/edit`)}
          >
            Edit
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
          <p className="text-gray-600">
            Manage system users and their access permissions
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            leftIcon={<RefreshCw className="w-4 h-4" />}
            onClick={() => refetch()}
          >
            Refresh
          </Button>
          <Button
            variant="primary"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => navigate('/system/users/create')}
          >
            Create User
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{users.length}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <UserIcon className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Users</p>
                <p className="text-2xl font-bold text-green-600 mt-1">
                  {users.filter((u) => u.status === 'active').length}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <UserIcon className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Inactive</p>
                <p className="text-2xl font-bold text-gray-600 mt-1">
                  {users.filter((u) => u.status === 'inactive').length}
                </p>
              </div>
              <div className="p-3 bg-gray-100 rounded-lg">
                <UserIcon className="w-6 h-6 text-gray-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Suspended</p>
                <p className="text-2xl font-bold text-red-600 mt-1">
                  {users.filter((u) => u.status === 'suspended').length}
                </p>
              </div>
              <div className="p-3 bg-red-100 rounded-lg">
                <UserIcon className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search & Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <Input
                name="search"
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                leftIcon={<Search className="w-5 h-5" />}
              />
            </div>
            <div className="w-40">
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-12">
              <UserIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No users found</p>
              <Button
                variant="primary"
                className="mt-4"
                leftIcon={<Plus className="w-4 h-4" />}
                onClick={() => navigate('/system/users/create')}
              >
                Create First User
              </Button>
            </div>
          ) : (
            <DataTable
              data={users}
              columns={columns}
              pagination={{ pageSize: 20 }}
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default UsersPage

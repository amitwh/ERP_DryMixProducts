import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { api } from '@/services/api'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { StatusBadge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Loading'
import { ActionMenu } from '@/components/ui/ActionMenu'
import { Search, Calendar, Plus, Filter, Clock, CheckCircle, XCircle, User } from 'lucide-react'
import { formatDate, formatDateTime } from '@/utils'

interface LeaveRequest {
  id: number
  employee_id: number
  employee_name: string
  employee_code: string
  leave_type_id: number
  leave_type_name: string
  start_date: string
  end_date: string
  total_days: number
  reason?: string
  status: 'pending' | 'approved' | 'rejected' | 'cancelled'
  approved_by_id?: number
  approved_by_name?: string
  approved_at?: string
  rejection_reason?: string
  applied_on: string
}

interface LeaveBalance {
  leave_type_id: number
  leave_type_name: string
  total_allocated: number
  used: number
  balance: number
}

interface Stats {
  pending: number
  approved: number
  rejected: number
  on_leave: number
}

export const LeaveManagementPage: React.FC = () => {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([])
  const [leaveBalances, setLeaveBalances] = useState<LeaveBalance[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected' | 'cancelled'>('all')
  const [selectedEmployee, setSelectedEmployee] = useState<string>('')
  const [dateFilter, setDateFilter] = useState('')
  const [page, setPage] = useState(1)

  const fetchLeaveRequests = async () => {
    try {
      setIsLoading(true)
      const [requestsRes, balancesRes, statsRes] = await Promise.all([
        api.get<{ data: LeaveRequest[] }>('/hr-payroll/leave-requests', {
          params: {
            organization_id: user?.organizationId,
            employee_id: selectedEmployee || undefined,
            status: statusFilter === 'all' ? undefined : statusFilter,
            date: dateFilter || undefined,
            per_page: 20,
            page,
          },
        }),
        api.get<LeaveBalance[]>('/hr-payroll/leave-balance', {
          params: {
            organization_id: user?.organizationId,
            employee_id: selectedEmployee || undefined,
          },
        }),
        api.get<Stats>('/hr-payroll/leave-stats', {
          params: {
            organization_id: user?.organizationId,
          },
        }),
      ])

      setLeaveRequests(requestsRes.data.data || [])
      setLeaveBalances(balancesRes.data)
      setStats(statsRes.data)
    } catch (error) {
      console.error('Failed to fetch leave requests:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchLeaveRequests()
  }, [page, statusFilter, selectedEmployee, dateFilter])

  const filteredRequests = leaveRequests.filter((request) => {
    const matchesSearch =
      searchTerm === '' ||
      request.employee_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.employee_name.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  const handleApprove = async (id: number) => {
    try {
      await api.patch(`/hr-payroll/leave-requests/${id}/approve`, {
        organization_id: user?.organizationId,
      })
      fetchLeaveRequests()
    } catch (error) {
      console.error('Failed to approve leave request:', error)
    }
  }

  const handleReject = async (id: number, reason?: string) => {
    try {
      await api.patch(`/hr-payroll/leave-requests/${id}/reject`, {
        organization_id: user?.organizationId,
        rejection_reason: reason,
      })
      fetchLeaveRequests()
    } catch (error) {
      console.error('Failed to reject leave request:', error)
    }
  }

  const handleCancel = async (id: number) => {
    try {
      await api.patch(`/hr-payroll/leave-requests/${id}/cancel`, {
        organization_id: user?.organizationId,
      })
      fetchLeaveRequests()
    } catch (error) {
      console.error('Failed to cancel leave request:', error)
    }
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      cancelled: 'bg-gray-100 text-gray-800',
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Leave Management</h1>
          <p className="text-gray-600">Manage employee leave requests and balances</p>
        </div>
        <Button
          variant="primary"
          size="sm"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => navigate('/hr-payroll/leave-requests/create')}
        >
          New Leave Request
        </Button>
      </div>

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card variant="bordered" padding="lg">
            <div className="text-center">
              <Clock className="w-6 h-6 text-warning-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-600 mb-1">Pending</p>
              <h3 className="text-2xl font-bold text-warning-600">{stats.pending}</h3>
            </div>
          </Card>
          <Card variant="bordered" padding="lg">
            <div className="text-center">
              <CheckCircle className="w-6 h-6 text-success-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-600 mb-1">Approved</p>
              <h3 className="text-2xl font-bold text-success-600">{stats.approved}</h3>
            </div>
          </Card>
          <Card variant="bordered" padding="lg">
            <div className="text-center">
              <XCircle className="w-6 h-6 text-error-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-600 mb-1">Rejected</p>
              <h3 className="text-2xl font-bold text-error-600">{stats.rejected}</h3>
            </div>
          </Card>
          <Card variant="bordered" padding="lg">
            <div className="text-center">
              <User className="w-6 h-6 text-blue-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-600 mb-1">On Leave</p>
              <h3 className="text-2xl font-bold text-blue-600">{stats.on_leave}</h3>
            </div>
          </Card>
        </div>
      )}

      <Card variant="bordered" padding="md">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Search employees..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-48"
            />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {(['all', 'pending', 'approved', 'rejected', 'cancelled'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  statusFilter === status
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {leaveBalances.length > 0 && (
        <Card variant="bordered" padding="lg">
          <CardHeader>
            <CardTitle>Leave Balance Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {leaveBalances.map((balance) => (
                <div key={balance.leave_type_id} className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-600 mb-1">{balance.leave_type_name}</p>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-500">Total: {balance.total_allocated}</p>
                      <p className="text-xs text-gray-500">Used: {balance.used}</p>
                    </div>
                    <p className="text-2xl font-bold text-primary-600">{balance.balance}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card variant="bordered" padding="lg">
        <CardHeader>
          <CardTitle>Leave Requests</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} height={120} className="rounded" />
              ))}
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No leave requests found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredRequests.map((request) => (
                <div
                  key={request.id}
                  className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-primary-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{request.employee_name}</p>
                        <p className="text-sm text-gray-600">{request.employee_code}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={request.status} />
                      <ActionMenu
                        actions={[
                          ...(request.status === 'pending'
                            ? [
                                { label: 'Approve', onClick: () => handleApprove(request.id) },
                                { label: 'Reject', onClick: () => handleReject(request.id) },
                              ]
                            : []),
                          ...(request.status === 'approved'
                            ? [{ label: 'Cancel', onClick: () => handleCancel(request.id) }]
                            : []),
                        ]}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm mb-2">
                    <div>
                      <p className="text-gray-500">Leave Type</p>
                      <p className="font-medium text-gray-900">{request.leave_type_name}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Start Date</p>
                      <p className="font-medium text-gray-900">{formatDate(request.start_date)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">End Date</p>
                      <p className="font-medium text-gray-900">{formatDate(request.end_date)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Total Days</p>
                      <p className="font-medium text-primary-600">{request.total_days} days</p>
                    </div>
                  </div>

                  {request.reason && (
                    <div className="mb-2 text-sm">
                      <p className="text-gray-500">Reason:</p>
                      <p className="text-gray-900">{request.reason}</p>
                    </div>
                  )}

                  {request.rejection_reason && (
                    <div className="mb-2 text-sm text-red-600">
                      <p className="text-gray-500">Rejection Reason:</p>
                      <p>{request.rejection_reason}</p>
                    </div>
                  )}

                  <div className="text-sm text-gray-600">
                    <p>Applied on: {formatDateTime(request.applied_on)}</p>
                    {request.approved_at && (
                      <p>
                        {request.status === 'approved' && 'Approved'} by {request.approved_by_name} on{' '}
                        {formatDateTime(request.approved_at)}
                      </p>
                    )}
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

export default LeaveManagementPage

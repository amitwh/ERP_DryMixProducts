import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { api } from '@/services/api'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Skeleton } from '@/components/ui/Loading'
import { Search, Calendar, Clock, CheckCircle, XCircle, User } from 'lucide-react'
import { formatDate, formatDateTime } from '@/utils'

interface AttendanceRecord {
  id: number
  employee_id: number
  employee_name: string
  employee_code: string
  date: string
  check_in?: string
  check_out?: string
  status: 'present' | 'absent' | 'half_day' | 'late' | 'on_leave'
  work_hours?: number
  shift?: string
  notes?: string
}

export const AttendancePage: React.FC = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [records, setRecords] = useState<AttendanceRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'present' | 'absent' | 'late' | 'on_leave'>('all')
  const [dateFilter, setDateFilter] = useState('')
  const [page, setPage] = useState(1)

  const fetchAttendance = async () => {
    try {
      setIsLoading(true)
      const response = await api.get<{ data: AttendanceRecord[] }>('/hr-payroll/attendance', {
        params: {
          organization_id: user?.organizationId,
          per_page: 20,
          page,
          date: dateFilter || undefined,
        },
      })
      setRecords(response.data.data || [])
    } catch (error) {
      console.error('Failed to fetch attendance:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchAttendance()
  }, [page, dateFilter])

  const filteredRecords = records.filter((record) => {
    const matchesSearch =
      searchTerm === '' ||
      record.employee_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.employee_name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || record.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      present: 'bg-green-100 text-green-800',
      absent: 'bg-red-100 text-red-800',
      half_day: 'bg-yellow-100 text-yellow-800',
      late: 'bg-orange-100 text-orange-800',
      on_leave: 'bg-blue-100 text-blue-800',
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present':
        return <CheckCircle className="w-4 h-4 text-success-600" />
      case 'absent':
        return <XCircle className="w-4 h-4 text-error-600" />
      case 'late':
        return <Clock className="w-4 h-4 text-warning-600" />
      default:
        return <Calendar className="w-4 h-4 text-gray-400" />
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Attendance</h1>
          <p className="text-gray-600">Track employee attendance and working hours</p>
        </div>
        <Button
          variant="primary"
          size="sm"
          leftIcon={<Calendar className="w-4 h-4" />}
          onClick={() => navigate('/hr-payroll/attendance/create')}
        >
          Mark Attendance
        </Button>
      </div>

      <Card variant="bordered" padding="md">
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
          <div>
            <Input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-48"
            />
          </div>
          <div className="flex items-center gap-2">
            {(['all', 'present', 'absent', 'late', 'on_leave'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  statusFilter === status
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status.replace(/_/g, ' ')}
              </button>
            ))}
          </div>
        </div>
      </Card>

      <Card variant="bordered" padding="lg">
        <CardHeader>
          <CardTitle>Attendance Records</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} height={100} className="rounded" />
              ))}
            </div>
          ) : filteredRecords.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No attendance records found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredRecords.map((record) => (
                <div
                  key={record.id}
                  className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-primary-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{record.employee_name}</p>
                        <p className="text-sm text-gray-600">{record.employee_code}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(record.status)}
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(record.status)}`}>
                          {record.status.replace(/_/g, ' ').toUpperCase()}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(record.date)}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                    {record.check_in && (
                      <div>
                        <p className="text-gray-500">Check In</p>
                        <p className="font-medium text-gray-900">{formatDateTime(record.check_in).split(',')[1] || record.check_in}</p>
                      </div>
                    )}
                    {record.check_out && (
                      <div>
                        <p className="text-gray-500">Check Out</p>
                        <p className="font-medium text-gray-900">{formatDateTime(record.check_out).split(',')[1] || record.check_out}</p>
                      </div>
                    )}
                    {record.work_hours !== undefined && (
                      <div>
                        <p className="text-gray-500">Work Hours</p>
                        <p className="font-medium text-gray-900">{record.work_hours} hrs</p>
                      </div>
                    )}
                    {record.shift && (
                      <div>
                        <p className="text-gray-500">Shift</p>
                        <p className="font-medium text-gray-900">{record.shift}</p>
                      </div>
                    )}
                  </div>

                  {record.notes && (
                    <div className="mt-2 text-sm text-gray-600">
                      <span className="font-medium">Notes:</span> {record.notes}
                    </div>
                  )}
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

export default AttendancePage

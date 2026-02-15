import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { api } from '@/services/api'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { StatusBadge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Loading'
import { Plus, Search, Users, UserCheck, Calendar, Mail, Phone, Briefcase } from 'lucide-react'
import { formatDate } from '@/utils'

interface Employee {
  id: number
  employee_code: string
  name: string
  email: string
  phone: string
  department?: string
  designation?: string
  join_date: string
  status: 'active' | 'inactive' | 'on_leave' | 'resigned'
  basic_salary?: number
  work_location?: string
  avatar?: string
}

export const EmployeesPage: React.FC = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [employees, setEmployees] = useState<Employee[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'on_leave' | 'resigned'>('all')
  const [page, setPage] = useState(1)

  const fetchEmployees = async () => {
    try {
      setIsLoading(true)
      const response = await api.get<{ data: Employee[] }>('/hr-payroll/employees', {
        params: {
          organization_id: user?.organization_id,
          per_page: 20,
          page,
        },
      })
      setEmployees(response.data.data || [])
    } catch (error) {
      console.error('Failed to fetch employees:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchEmployees()
  }, [page])

  const filteredEmployees = employees.filter((employee) => {
    const matchesSearch =
      searchTerm === '' ||
      employee.employee_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || employee.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Employees</h1>
          <p className="text-gray-600">Manage employee information and records</p>
        </div>
        <Button
          variant="primary"
          size="sm"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => navigate('/hr-payroll/employees/create')}
        >
          New Employee
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
          <div className="flex items-center gap-2">
            {(['all', 'active', 'inactive', 'on_leave', 'resigned'] as const).map((status) => (
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
          <CardTitle>Employee Directory</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} height={100} className="rounded" />
              ))}
            </div>
          ) : filteredEmployees.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">No employees found</p>
              <Button
                variant="primary"
                size="sm"
                leftIcon={<Plus className="w-4 h-4" />}
                onClick={() => navigate('/hr-payroll/employees/create')}
              >
                Add First Employee
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Employee</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Contact</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Department</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Designation</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Joined</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEmployees.map((employee) => (
                    <tr key={employee.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center text-white font-semibold">
                            {getInitials(employee.name)}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{employee.name}</p>
                            <p className="text-sm text-gray-600">{employee.employee_code}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="space-y-1 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <Mail className="w-3 h-3" />
                            {employee.email}
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="w-3 h-3" />
                            {employee.phone}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Briefcase className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-900">{employee.department || '-'}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-900">
                        {employee.designation || '-'}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="w-3 h-3" />
                          {formatDate(employee.join_date)}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <UserCheck className={`w-4 h-4 ${
                            employee.status === 'active' ? 'text-success-600' :
                            employee.status === 'on_leave' ? 'text-warning-600' : 'text-gray-400'
                          }`} />
                          <StatusBadge status={employee.status} size="sm" />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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

export default EmployeesPage

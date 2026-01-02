import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { api } from '@/services/api'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { StatusBadge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Loading'
import { Plus, Search, RefreshCw, Users, Mail, Phone, MapPin, Eye, Pencil, Briefcase, CalendarClock } from 'lucide-react'
import { formatDate } from '@/utils'

interface Employee {
  id: number
  employee_code: string
  full_name: string
  email: string
  phone: string
  designation: string
  department: string
  status: 'active' | 'inactive' | 'on_leave'
  joining_date: string
}

export const EmployeesPage: React.FC = () => {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [employees, setEmployees] = useState<Employee[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [departmentFilter, setDepartmentFilter] = useState<string>('all')
  const [page, setPage] = useState(1)

  const fetchEmployees = async () => {
    try {
      setIsLoading(true)
      const response = await api.get<{ data: Employee[] }>('/hr-payroll/employees', {
        params: {
          organization_id: user?.organizationId,
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
      employee.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesDepartment = departmentFilter === 'all' || employee.department === departmentFilter

    return matchesSearch && matchesDepartment
  })

  const departments = ['all', 'Production', 'Sales', 'Finance', 'HR', 'Quality', 'Procurement', 'Inventory']

  const statusColors: Record<string, string> = {
    active: 'bg-green-100 text-green-800',
    inactive: 'bg-red-100 text-red-800',
    on_leave: 'bg-yellow-100 text-yellow-800',
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Employees</h1>
          <p className="text-gray-600">Manage workforce and payroll</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => navigate('/hr-payroll/employees/create')}
          >
            New Employee
          </Button>
        </div>
      </div>

      {/* Filters */}
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
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
          >
            {departments.map((dept) => (
              <option key={dept} value={dept}>{dept === 'all' ? 'All Departments' : dept}</option>
            ))}
          </select>
        </div>
      </Card>

      {/* Employees List */}
      <Card variant="bordered" padding="lg">
        <CardHeader>
          <CardTitle>Employees</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} height={80} className="rounded" />)}
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
            <div className="space-y-3">
              {filteredEmployees.map((employee) => (
                <div key={employee.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center justify-center w-12 h-12 bg-primary-100 rounded-full">
                    <Users className="w-6 h-6 text-primary-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-gray-900">{employee.employee_code}</span>
                      <StatusBadge status={employee.status} size="sm" />
                    </div>
                    <p className="text-sm font-medium text-gray-900">{employee.full_name}</p>
                    <div className="flex items-center gap-4 mt-1 text-xs text-gray-600">
                      <span className="flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        {employee.email}
                      </span>
                      <span className="flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        {employee.phone}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-600">
                      <span className="flex items-center gap-1">
                        <Briefcase className="w-3 h-3" />
                        {employee.designation}
                      </span>
                      <span className="flex items-center gap-1">
                        <CalendarClock className="w-3 h-3" />
                        {formatDate(employee.joining_date)}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="space-y-1">
                      <div>
                        <p className="text-xs text-gray-500">Status</p>
                        <div className={`inline-block px-2 py-0.5 text-xs rounded-full ${statusColors[employee.status] || 'bg-gray-100'}`}>
                          {employee.status.replace(/_/g, ' ').toUpperCase()}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" leftIcon={<Eye className="w-4 h-4" />} onClick={() => navigate(`/hr-payroll/employees/${employee.id}`)}>
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
      {employees.length > 0 && (
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

export default EmployeesPage

import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { api } from '@/services/api'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { StatusBadge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Loading'
import { Alert } from '@/components/ui/Alert'
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Briefcase,
  DollarSign,
  FileText,
  Edit,
  Shield,
} from 'lucide-react'
import { formatDate, formatCurrency, formatDateTime } from '@/utils'
import { toast } from 'sonner'

interface Employee {
  id: number
  employee_code: string
  first_name: string
  last_name: string
  email?: string
  phone?: string
  address?: string
  city?: string
  state?: string
  country?: string
  pin_code?: string
  date_of_birth?: string
  gender?: 'male' | 'female' | 'other'
  marital_status?: 'single' | 'married' | 'divorced' | 'widowed'
  blood_group?: string
  emergency_contact_name?: string
  emergency_contact_phone?: string
  emergency_contact_relation?: string
  employment_type: 'full_time' | 'part_time' | 'contract' | 'intern'
  employment_status: 'active' | 'inactive' | 'terminated' | 'on_leave'
  hire_date: string
  designation?: string
  department?: string
  reporting_to_id?: number
  salary: number
  ctc: number
  bank_name?: string
  bank_account_number?: string
  ifsc_code?: string
  pf_number?: string
  esi_number?: string
  aadhar_number?: string
  pan_number?: string
  organization_id: number
  created_at: string
  updated_at: string
}

interface LeaveBalance {
  leave_type_id: number
  leave_type_name: string
  total_allocated: number
  used: number
  balance: number
}

interface AttendanceSummary {
  present: number
  absent: number
  late: number
  half_day: number
  total_days: number
}

interface PayrollSummary {
  basic_salary: number
  allowances: number
  deductions: number
  net_salary: number
}

export const EmployeeDetailPage: React.FC = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()

  const [employee, setEmployee] = useState<Employee | null>(null)
  const [leaveBalances, setLeaveBalances] = useState<LeaveBalance[]>([])
  const [attendanceSummary, setAttendanceSummary] = useState<AttendanceSummary | null>(null)
  const [payrollSummary, setPayrollSummary] = useState<PayrollSummary | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'leave' | 'attendance' | 'payroll'>('overview')

  const tabs = [
    { id: 'overview' as const, label: 'Overview', icon: User },
    { id: 'leave' as const, label: 'Leave Balance', icon: Calendar },
    { id: 'attendance' as const, label: 'Attendance', icon: Shield },
    { id: 'payroll' as const, label: 'Payroll', icon: DollarSign },
  ]

  const fetchEmployee = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const [employeeRes, leaveRes, attendanceRes, payrollRes] = await Promise.all([
        api.get<Employee>(`/hr-payroll/employees/${id}`, {
          params: { organization_id: user?.organization_id },
        }),
        api.get<LeaveBalance[]>(`/hr-payroll/employees/${id}/leave-balance`, {
          params: { organization_id: user?.organization_id },
        }),
        api.get<AttendanceSummary>(`/hr-payroll/employees/${id}/attendance-summary`, {
          params: { organization_id: user?.organization_id },
        }),
        api.get<PayrollSummary>(`/hr-payroll/employees/${id}/payroll-summary`, {
          params: { organization_id: user?.organization_id },
        }),
      ])

      setEmployee(employeeRes.data)
      setLeaveBalances(leaveRes.data)
      setAttendanceSummary(attendanceRes.data)
      setPayrollSummary(payrollRes.data)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch employee details')
      console.error('Failed to fetch employee:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (id) {
      fetchEmployee()
    }
  }, [id])

  const handleEdit = () => {
    navigate(`/hr-payroll/employees/${id}/edit`)
  }

  const handleStatusChange = async (newStatus: string) => {
    try {
      await api.patch(`/hr-payroll/employees/${id}`, {
        employment_status: newStatus,
        organization_id: user?.organization_id,
      })
      toast.success('Employee status updated successfully')
      fetchEmployee()
    } catch (err) {
      toast.error('Failed to update employee status')
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Employee Details</h1>
          <p className="text-gray-600">Loading employee information...</p>
        </div>
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} height={150} className="rounded" />
          ))}
        </div>
      </div>
    )
  }

  if (error || !employee) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Employee Details</h1>
        </div>
        <Alert type="error" message={error || 'Employee not found'} />
        <Button variant="outline" onClick={() => navigate('/hr-payroll/employees')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Employees
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Employee Details</h1>
          <p className="text-gray-600">
            {employee.first_name} {employee.last_name} - {employee.employee_code}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<ArrowLeft className="w-4 h-4" />}
            onClick={() => navigate('/hr-payroll/employees')}
          >
            Back
          </Button>
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Edit className="w-4 h-4" />}
            onClick={handleEdit}
          >
            Edit Employee
          </Button>
        </div>
      </div>

      <Alert
        variant={employee.employment_status === 'active' ? 'success' : 'warning'}
        message={`Employee is ${employee.employment_status.replace(/_/g, ' ').toUpperCase()}`}
      />

      <Card variant="bordered" padding="lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-primary-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {employee.first_name} {employee.last_name}
                </h2>
                <p className="text-sm text-gray-600">{employee.employee_code}</p>
              </div>
            </div>
            <StatusBadge status={employee.employment_status} />
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-600">{employee.designation || 'N/A'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-600">{employee.email || 'N/A'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-600">{employee.phone || 'N/A'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-600">Hired: {formatDate(employee.hire_date)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

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
                    {employee.first_name} {employee.last_name}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Email</p>
                  <p className="text-gray-900">{employee.email || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Phone</p>
                  <p className="text-gray-900">{employee.phone || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Address</p>
                  <p className="text-gray-900">
                    {employee.address ? `${employee.address}, ${employee.city || ''}, ${employee.state || ''}, ${employee.country || ''} - ${employee.pin_code || ''}` : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Date of Birth</p>
                  <p className="text-gray-900">{employee.date_of_birth ? formatDate(employee.date_of_birth) : 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Gender</p>
                  <p className="text-gray-900">{employee.gender || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Marital Status</p>
                  <p className="text-gray-900">{employee.marital_status || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Blood Group</p>
                  <p className="text-gray-900">{employee.blood_group || 'N/A'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card variant="bordered" padding="lg">
            <CardHeader>
              <CardTitle>Emergency Contact</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Contact Name</p>
                  <p className="text-gray-900">{employee.emergency_contact_name || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Contact Phone</p>
                  <p className="text-gray-900">{employee.emergency_contact_phone || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Relationship</p>
                  <p className="text-gray-900">{employee.emergency_contact_relation || 'N/A'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card variant="bordered" padding="lg">
            <CardHeader>
              <CardTitle>Employment Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Employment Type</p>
                  <p className="text-gray-900">{employee.employment_type.replace(/_/g, ' ')}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Designation</p>
                  <p className="text-gray-900">{employee.designation || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Department</p>
                  <p className="text-gray-900">{employee.department || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Hire Date</p>
                  <p className="text-gray-900">{formatDate(employee.hire_date)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card variant="bordered" padding="lg">
            <CardHeader>
              <CardTitle>Bank & Tax Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Bank Name</p>
                  <p className="text-gray-900">{employee.bank_name || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Account Number</p>
                  <p className="text-gray-900">{employee.bank_account_number || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">IFSC Code</p>
                  <p className="text-gray-900">{employee.ifsc_code || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">PF Number</p>
                  <p className="text-gray-900">{employee.pf_number || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">ESI Number</p>
                  <p className="text-gray-900">{employee.esi_number || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Aadhar Number</p>
                  <p className="text-gray-900">{employee.aadhar_number || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">PAN Number</p>
                  <p className="text-gray-900">{employee.pan_number || 'N/A'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'leave' && (
        <Card variant="bordered" padding="lg">
          <CardHeader>
            <CardTitle>Leave Balance</CardTitle>
          </CardHeader>
          <CardContent>
            {leaveBalances.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p>No leave balance data available</p>
              </div>
            ) : (
              <div className="space-y-4">
                {leaveBalances.map((balance) => (
                  <div
                    key={balance.leave_type_id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-gray-900">{balance.leave_type_name}</p>
                      <p className="text-sm text-gray-600">
                        Total: {balance.total_allocated} days
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-primary-600">
                        {balance.balance} days
                      </p>
                      <p className="text-xs text-gray-600">
                        Used: {balance.used} / {balance.total_allocated}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === 'attendance' && attendanceSummary && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card variant="bordered" padding="lg">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600 mb-2">Total Days</p>
              <h3 className="text-3xl font-bold text-gray-900">{attendanceSummary.total_days}</h3>
            </div>
          </Card>
          <Card variant="bordered" padding="lg">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600 mb-2">Present</p>
              <h3 className="text-3xl font-bold text-success-600">{attendanceSummary.present}</h3>
            </div>
          </Card>
          <Card variant="bordered" padding="lg">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600 mb-2">Absent</p>
              <h3 className="text-3xl font-bold text-error-600">{attendanceSummary.absent}</h3>
            </div>
          </Card>
          <Card variant="bordered" padding="lg">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600 mb-2">Late</p>
              <h3 className="text-3xl font-bold text-warning-600">{attendanceSummary.late}</h3>
            </div>
          </Card>
          <Card variant="bordered" padding="lg">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600 mb-2">Half Day</p>
              <h3 className="text-3xl font-bold text-secondary-600">{attendanceSummary.half_day}</h3>
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'payroll' && payrollSummary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card variant="bordered" padding="lg">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600 mb-2">Basic Salary</p>
              <h3 className="text-2xl font-bold text-gray-900">{formatCurrency(payrollSummary.basic_salary)}</h3>
            </div>
          </Card>
          <Card variant="bordered" padding="lg">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600 mb-2">Allowances</p>
              <h3 className="text-2xl font-bold text-success-600">{formatCurrency(payrollSummary.allowances)}</h3>
            </div>
          </Card>
          <Card variant="bordered" padding="lg">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600 mb-2">Deductions</p>
              <h3 className="text-2xl font-bold text-error-600">{formatCurrency(payrollSummary.deductions)}</h3>
            </div>
          </Card>
          <Card variant="bordered" padding="lg">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600 mb-2">Net Salary</p>
              <h3 className="text-2xl font-bold text-primary-600">{formatCurrency(payrollSummary.net_salary)}</h3>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}

export default EmployeeDetailPage

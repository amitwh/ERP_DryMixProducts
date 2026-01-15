import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { api } from '@/services/api'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Skeleton } from '@/components/ui/Loading'
import { Alert } from '@/components/ui/Alert'
import {
  Calendar,
  DollarSign,
  Users,
  CheckCircle,
  AlertCircle,
  Download,
  Printer,
  RefreshCw,
  ChevronRight,
  Eye,
  Edit,
} from 'lucide-react'
import { formatDate, formatCurrency } from '@/utils'
import { toast } from 'sonner'

interface PayrollRun {
  id: number
  organization_id: number
  pay_period_start: string
  pay_period_end: string
  pay_date?: string
  total_employees: number
  total_basic_salary: number
  total_allowances: number
  total_deductions: number
  total_net_salary: number
  status: 'draft' | 'processing' | 'completed' | 'failed'
  processed_at?: string
  created_at: string
  updated_at: string
}

interface PayrollEmployee {
  id: number
  employee_id: number
  employee_code: string
  employee_name: string
  designation: string
  department: string
  basic_salary: number
  allowances: number
  deductions: number
  net_salary: number
  days_present: number
  days_absent: number
  work_days: number
}

interface PayrollStats {
  active_employees: number
  total_monthly_salary: number
  last_payroll_date?: string
  next_payroll_date?: string
}

export const PayrollProcessingPage: React.FC = () => {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [payrollRuns, setPayrollRuns] = useState<PayrollRun[]>([])
  const [stats, setStats] = useState<PayrollStats | null>(null)
  const [selectedRun, setSelectedRun] = useState<PayrollRun | null>(null)
  const [employees, setEmployees] = useState<PayrollEmployee[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const [startDate, setStartDate] = useState(formatDate(new Date().setDate(1), 'YYYY-MM-DD'))
  const [endDate, setEndDate] = useState(formatDate(new Date(), 'YYYY-MM-DD'))
  const [showPreview, setShowPreview] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchPayrollRuns = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const [runsRes, statsRes] = await Promise.all([
        api.get<{ data: PayrollRun[] }>('/hr-payroll/payroll-runs', {
          params: {
            organization_id: user?.organizationId,
            per_page: 10,
          },
        }),
        api.get<PayrollStats>('/hr-payroll/payroll-stats', {
          params: {
            organization_id: user?.organizationId,
          },
        }),
      ])

      setPayrollRuns(runsRes.data.data || [])
      setStats(statsRes.data)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch payroll data')
      console.error('Failed to fetch payroll runs:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchPayrollRuns()
  }, [])

  const fetchEmployees = async (runId: number) => {
    try {
      const response = await api.get<{ data: PayrollEmployee[] }>(`/hr-payroll/payroll-runs/${runId}/employees`, {
        params: {
          organization_id: user?.organizationId,
        },
      })
      setEmployees(response.data.data || [])
    } catch (error) {
      console.error('Failed to fetch employees:', error)
    }
  }

  const handlePreviewPayroll = async () => {
    try {
      setIsProcessing(true)
      setError(null)

      const response = await api.post<{ data: PayrollEmployee[] }>('/hr-payroll/payroll-runs/preview', {
        organization_id: user?.organizationId,
        pay_period_start: startDate,
        pay_period_end: endDate,
      })

      setEmployees(response.data.data || [])
      setShowPreview(true)
      toast.success('Payroll preview generated successfully')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to generate payroll preview')
      toast.error('Failed to generate payroll preview')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleProcessPayroll = async () => {
    if (!window.confirm('Are you sure you want to process payroll for all employees? This action cannot be undone.')) {
      return
    }

    try {
      setIsProcessing(true)
      setError(null)

      const response = await api.post<{ data: PayrollRun }>('/hr-payroll/payroll-runs', {
        organization_id: user?.organizationId,
        pay_period_start: startDate,
        pay_period_end: endDate,
        pay_date: new Date().toISOString().split('T')[0],
      })

      setPayrollRuns([response.data.data, ...payrollRuns])
      setShowPreview(false)
      toast.success('Payroll processed successfully')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to process payroll')
      toast.error('Failed to process payroll')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleViewRun = (run: PayrollRun) => {
    setSelectedRun(run)
    setShowPreview(false)
    fetchEmployees(run.id)
  }

  const handlePrint = () => {
    window.print()
  }

  const handleExport = () => {
    if (employees.length === 0) return

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      'Employee Code,Employee Name,Designation,Department,Basic Salary,Allowances,Deductions,Net Salary,Days Present,Days Absent\n' +
      employees
        .map(
          (emp) =>
            `${emp.employee_code},"${emp.employee_name}","${emp.designation}","${emp.department}",${emp.basic_salary},${emp.allowances},${emp.deductions},${emp.net_salary},${emp.days_present},${emp.days_absent}`
        )
        .join('\n')

    const link = document.createElement('a')
    link.setAttribute('href', encodeURI(csvContent))
    link.setAttribute('download', `payroll-${startDate}-to-${endDate}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      draft: 'bg-gray-100 text-gray-800',
      processing: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payroll Processing</h1>
          <p className="text-gray-600">Process and manage employee payroll</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<RefreshCw className="w-4 h-4" />}
            onClick={fetchPayrollRuns}
            isLoading={isLoading}
          >
            Refresh
          </Button>
        </div>
      </div>

      {error && <Alert variant="error" message={error} />}

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card variant="bordered" padding="lg">
            <div className="text-center">
              <Users className="w-6 h-6 text-primary-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-600 mb-1">Active Employees</p>
              <h3 className="text-2xl font-bold text-gray-900">{stats.active_employees}</h3>
            </div>
          </Card>
          <Card variant="bordered" padding="lg">
            <div className="text-center">
              <DollarSign className="w-6 h-6 text-success-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-600 mb-1">Total Monthly Salary</p>
              <h3 className="text-2xl font-bold text-success-600">{formatCurrency(stats.total_monthly_salary)}</h3>
            </div>
          </Card>
          {stats.last_payroll_date && (
            <Card variant="bordered" padding="lg">
              <div className="text-center">
                <Calendar className="w-6 h-6 text-secondary-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-600 mb-1">Last Payroll</p>
                <h3 className="text-2xl font-bold text-gray-900">{formatDate(stats.last_payroll_date)}</h3>
              </div>
            </Card>
          )}
          {stats.next_payroll_date && (
            <Card variant="bordered" padding="lg">
              <div className="text-center">
                <Calendar className="w-6 h-6 text-warning-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-600 mb-1">Next Payroll</p>
                <h3 className="text-2xl font-bold text-gray-900">{formatDate(stats.next_payroll_date)}</h3>
              </div>
            </Card>
          )}
        </div>
      )}

      <Card variant="bordered" padding="lg">
        <CardHeader>
          <CardTitle>Process New Payroll</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Pay Period Start</label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Pay Period End</label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                leftIcon={<Eye className="w-4 h-4" />}
                onClick={handlePreviewPayroll}
                isLoading={isProcessing}
                disabled={isProcessing}
              >
                Preview Payroll
              </Button>
              <Button
                variant="primary"
                leftIcon={<CheckCircle className="w-4 h-4" />}
                onClick={handleProcessPayroll}
                isLoading={isProcessing}
                disabled={isProcessing}
              >
                Process Payroll
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {payrollRuns.length > 0 && (
        <Card variant="bordered" padding="lg">
          <CardHeader>
            <CardTitle>Payroll History</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} height={120} className="rounded" />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {payrollRuns.map((run) => (
                  <div
                    key={run.id}
                    className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                    onClick={() => handleViewRun(run)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {formatDate(run.pay_period_start)} - {formatDate(run.pay_period_end)}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {run.pay_date ? `Pay Date: ${formatDate(run.pay_date)}` : 'Pending'}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(run.status)}`}
                        >
                          {run.status.toUpperCase()}
                        </span>
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Employees</p>
                        <p className="font-medium text-gray-900">{run.total_employees}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Basic Salary</p>
                        <p className="font-medium text-gray-900">{formatCurrency(run.total_basic_salary)}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Allowances</p>
                        <p className="font-medium text-success-600">{formatCurrency(run.total_allowances)}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Deductions</p>
                        <p className="font-medium text-error-600">{formatCurrency(run.total_deductions)}</p>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-600">Total Net Salary:</span>
                        <span className="text-2xl font-bold text-primary-600">
                          {formatCurrency(run.total_net_salary)}
                        </span>
                      </div>
                    </div>

                    {run.status === 'failed' && (
                      <div className="mt-3 p-3 bg-red-50 rounded-lg">
                        <div className="flex items-center gap-2 text-red-800">
                          <AlertCircle className="w-5 h-5" />
                          <span className="font-medium">Payroll processing failed</span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {(showPreview || selectedRun) && (
        <Card variant="bordered" padding="lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                {showPreview ? 'Payroll Preview' : `Payroll: ${formatDate(selectedRun?.pay_period_start)} - ${formatDate(selectedRun?.pay_period_end)}`}
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<Printer className="w-4 h-4" />}
                  onClick={handlePrint}
                >
                  Print
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<Download className="w-4 h-4" />}
                  onClick={handleExport}
                >
                  Export
                </Button>
                {!showPreview && (
                  <Button
                    variant="outline"
                    size="sm"
                    leftIcon={<Edit className="w-4 h-4" />}
                    onClick={() => setSelectedRun(null)}
                  >
                    Close
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Employee</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Designation</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Basic</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Allowances</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Deductions</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Net Salary</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Present</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Absent</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {employees.map((emp) => (
                    <tr key={emp.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-gray-900">{emp.employee_name}</p>
                          <p className="text-sm text-gray-600">{emp.employee_code}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">{emp.designation}</td>
                      <td className="px-4 py-3 text-right text-sm text-gray-900">
                        {formatCurrency(emp.basic_salary)}
                      </td>
                      <td className="px-4 py-3 text-right text-sm text-success-600">
                        {formatCurrency(emp.allowances)}
                      </td>
                      <td className="px-4 py-3 text-right text-sm text-error-600">
                        {formatCurrency(emp.deductions)}
                      </td>
                      <td className="px-4 py-3 text-right text-sm font-semibold text-primary-600">
                        {formatCurrency(emp.net_salary)}
                      </td>
                      <td className="px-4 py-3 text-center text-sm text-gray-900">{emp.days_present}</td>
                      <td className="px-4 py-3 text-center text-sm text-gray-900">{emp.days_absent}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {employees.length > 0 && (
              <div className="mt-4 p-4 bg-gray-100 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Total Basic</p>
                    <p className="text-lg font-bold text-gray-900">
                      {formatCurrency(employees.reduce((sum, emp) => sum + emp.basic_salary, 0))}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Total Allowances</p>
                    <p className="text-lg font-bold text-success-600">
                      {formatCurrency(employees.reduce((sum, emp) => sum + emp.allowances, 0))}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Total Deductions</p>
                    <p className="text-lg font-bold text-error-600">
                      {formatCurrency(employees.reduce((sum, emp) => sum + emp.deductions, 0))}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Total Net Salary</p>
                    <p className="text-2xl font-bold text-primary-600">
                      {formatCurrency(employees.reduce((sum, emp) => sum + emp.net_salary, 0))}
                    </p>
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

export default PayrollProcessingPage

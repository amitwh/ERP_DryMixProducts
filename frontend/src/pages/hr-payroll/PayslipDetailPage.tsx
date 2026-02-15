import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { api } from '@/services/api'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Loading'
import { Alert } from '@/components/ui/Alert'
import {
  ArrowLeft,
  Download,
  Printer,
  User,
  DollarSign,
  Calendar,
  Building,
  FileText,
  Shield,
  TrendingUp,
  TrendingDown,
} from 'lucide-react'
import { formatCurrency, formatDate } from '@/utils'

interface Payslip {
  id: number
  employee_id: number
  employee_name: string
  employee_code: string
  designation: string
  department: string
  payroll_run_id: number
  pay_period_start: string
  pay_period_end: string
  pay_date: string
  work_days: number
  days_present: number
  days_absent: number
  basic_salary: number
  gross_salary: number
  total_deductions: number
  net_salary: number
  payment_mode: string
  bank_name?: string
  bank_account_number?: string
  organization_name: string
  organization_address: string
  created_at: string
}

interface Earning {
  name: string
  amount: number
}

interface Deduction {
  name: string
  amount: number
}

interface PayslipDetails {
  payslip: Payslip
  earnings: Earning[]
  deductions: Deduction[]
  tax_summary: {
    gross_salary: number
    taxable_income: number
    tax_deduction: number
    pf_contribution: number
    esi_contribution: number
    professional_tax: number
  }
}

export const PayslipDetailPage: React.FC = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()

  const [data, setData] = useState<PayslipDetails | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPayslip = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await api.get<PayslipDetails>(`/hr-payroll/payslips/${id}`, {
        params: {
          organization_id: user?.organization_id,
        },
      })

      setData(response.data)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch payslip details')
      console.error('Failed to fetch payslip:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (id) {
      fetchPayslip()
    }
  }, [id])

  const handlePrint = () => {
    window.print()
  }

  const handleDownloadPDF = async () => {
    try {
      const response = await api.get(`/hr-payroll/payslips/${id}/pdf`, {
        params: {
          organization_id: user?.organization_id,
        },
        responseType: 'blob',
      })

      const blob = new Blob([response.data], { type: 'application/pdf' })
      const link = document.createElement('a')
      link.href = window.URL.createObjectURL(blob)
      link.download = `payslip-${data?.payslip.employee_code}-${data?.payslip.pay_period_start}.pdf`
      link.click()
    } catch (error) {
      console.error('Failed to download PDF:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payslip</h1>
          <p className="text-gray-600">Loading payslip information...</p>
        </div>
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} height={200} className="rounded" />
          ))}
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payslip</h1>
        </div>
        <Alert type="error" message={error || 'Payslip not found'} />
        <Button variant="outline" onClick={() => navigate('/hr-payroll/payslips')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Payslips
        </Button>
      </div>
    )
  }

  const { payslip, earnings, deductions, tax_summary } = data

  return (
    <div className="space-y-6 print:space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payslip</h1>
          <p className="text-gray-600">
            {payslip.employee_name} - {payslip.pay_period_start} to {payslip.pay_period_end}
          </p>
        </div>
        <div className="flex items-center gap-3 no-print">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<ArrowLeft className="w-4 h-4" />}
            onClick={() => navigate('/hr-payroll/payslips')}
          >
            Back
          </Button>
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
            onClick={handleDownloadPDF}
          >
            Download PDF
          </Button>
        </div>
      </div>

      <Card variant="bordered" padding="lg" className="print:border print:border-gray-300">
        <CardContent>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-6 border-b-2 border-gray-200">
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">{payslip.organization_name}</h2>
                <p className="text-sm text-gray-600">{payslip.organization_address}</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-primary-600">PAYSLIP</p>
                <p className="text-sm text-gray-600">Pay Period: {formatDate(payslip.pay_period_start)} - {formatDate(payslip.pay_period_end)}</p>
                <p className="text-sm text-gray-600">Pay Date: {formatDate(payslip.pay_date)}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-6 border-b-2 border-gray-200">
              <div>
                <p className="text-xs font-semibold text-gray-500 mb-1">EMPLOYEE NAME</p>
                <p className="text-lg font-semibold text-gray-900">{payslip.employee_name}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 mb-1">EMPLOYEE CODE</p>
                <p className="text-lg font-semibold text-gray-900">{payslip.employee_code}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 mb-1">DESIGNATION</p>
                <p className="text-lg font-semibold text-gray-900">{payslip.designation}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 mb-1">DEPARTMENT</p>
                <p className="text-lg font-semibold text-gray-900">{payslip.department}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 mb-1">WORK DAYS</p>
                <p className="text-lg font-semibold text-gray-900">{payslip.work_days}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 mb-1">DAYS PRESENT</p>
                <p className="text-lg font-semibold text-success-600">{payslip.days_present}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-success-600" />
                  Earnings
                </h3>
                <div className="space-y-3">
                  {earnings.map((earning, index) => (
                    <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100">
                      <p className="text-sm text-gray-900">{earning.name}</p>
                      <p className="text-sm font-semibold text-success-600">{formatCurrency(earning.amount)}</p>
                    </div>
                  ))}
                  <div className="flex items-center justify-between py-3 bg-gray-50 rounded-lg px-4">
                    <p className="text-base font-bold text-gray-900">Gross Salary</p>
                    <p className="text-lg font-bold text-success-600">{formatCurrency(tax_summary.gross_salary)}</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <TrendingDown className="w-5 h-5 text-error-600" />
                  Deductions
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <p className="text-sm text-gray-600">Tax Deduction</p>
                    <p className="text-sm font-semibold text-error-600">{formatCurrency(tax_summary.tax_deduction)}</p>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <p className="text-sm text-gray-600">PF Contribution</p>
                    <p className="text-sm font-semibold text-error-600">{formatCurrency(tax_summary.pf_contribution)}</p>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <p className="text-sm text-gray-600">ESI Contribution</p>
                    <p className="text-sm font-semibold text-error-600">{formatCurrency(tax_summary.esi_contribution)}</p>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <p className="text-sm text-gray-600">Professional Tax</p>
                    <p className="text-sm font-semibold text-error-600">{formatCurrency(tax_summary.professional_tax)}</p>
                  </div>
                  {deductions.map((deduction, index) => (
                    <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100">
                      <p className="text-sm text-gray-900">{deduction.name}</p>
                      <p className="text-sm font-semibold text-error-600">{formatCurrency(deduction.amount)}</p>
                    </div>
                  ))}
                  <div className="flex items-center justify-between py-3 bg-gray-50 rounded-lg px-4">
                    <p className="text-base font-bold text-gray-900">Total Deductions</p>
                    <p className="text-lg font-bold text-error-600">{formatCurrency(payslip.total_deductions)}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 p-6 bg-primary-50 rounded-lg border-2 border-primary-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <DollarSign className="w-8 h-8 text-primary-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Net Salary</p>
                    <p className="text-xs text-gray-500">For the period {formatDate(payslip.pay_period_start)} to {formatDate(payslip.pay_period_end)}</p>
                  </div>
                </div>
                <p className="text-4xl font-bold text-primary-600">{formatCurrency(payslip.net_salary)}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t-2 border-gray-200">
              <div className="space-y-2">
                <p className="text-xs font-semibold text-gray-500">PAYMENT MODE</p>
                <p className="text-sm text-gray-900 capitalize">{payslip.payment_mode.replace(/_/g, ' ')}</p>
              </div>
              {payslip.bank_name && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-gray-500">BANK DETAILS</p>
                  <p className="text-sm text-gray-900">
                    {payslip.bank_name} - {payslip.bank_account_number}
                  </p>
                </div>
              )}
            </div>

            <div className="pt-6 border-t-2 border-gray-200 text-center">
              <p className="text-xs text-gray-500">This is a computer-generated payslip and does not require a signature.</p>
              <p className="text-xs text-gray-500">For any queries, please contact the HR department.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default PayslipDetailPage

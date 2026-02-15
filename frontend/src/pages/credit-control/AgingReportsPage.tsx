import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { DataTable } from '@/components/ui/DataTable'
import { Badge } from '@/components/ui/Badge'
import { Alert } from '@/components/ui/Alert'
import { Loader2, FileDown, RefreshCw, TrendingUp, AlertTriangle, DollarSign } from 'lucide-react'
import { toast } from 'sonner'
import creditControlService from '@/services/credit-control.service'
import { useQuery } from '@tanstack/react-query'
import { ColumnDef } from '@tanstack/react-table'

// Types
interface AgingBuckets {
  current: number
  days30: number
  days60: number
  days90: number
  days120: number
  total: number
}

interface AgingReportItem {
  id: number
  customer_id: number
  customer_name: string
  customer_code: string
  credit_limit: number
  current_balance: number
  aging: AgingBuckets
  overdue_amount: number
  risk_level: 'low' | 'medium' | 'high' | 'critical'
  last_payment_date?: string
  contact_person?: string
  email?: string
  phone?: string
}

interface AgingSummary {
  total_receivables: number
  total_current: number
  total_overdue: number
  total_30_days: number
  total_60_days: number
  total_90_days: number
  total_120_plus: number
  customer_count: number
  high_risk_count: number
  collection_rate: number
}

// Aging Reports Page
export const AgingReportsPage: React.FC = () => {
  const navigate = useNavigate()
  const [filters, _setFilters] = useState({
    risk_level: '',
    search: '',
  })

  // Fetch aging report
  const { data: agingData, isLoading, refetch } = useQuery({
    queryKey: ['aging-report', filters],
    queryFn: async () => {
      const response = await creditControlService.getAgingReport(filters)
      return response.data
    },
  })

  const summary: AgingSummary = agingData?.summary || {
    total_receivables: 0,
    total_current: 0,
    total_overdue: 0,
    total_30_days: 0,
    total_60_days: 0,
    total_90_days: 0,
    total_120_plus: 0,
    customer_count: 0,
    high_risk_count: 0,
    collection_rate: 0,
  }

  const agingItems: AgingReportItem[] = agingData?.items || []

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(amount)
  }

  // Get risk badge variant
  const getRiskBadge = (level: string) => {
    const variants: Record<string, 'success' | 'warning' | 'error' | 'info'> = {
      low: 'success',
      medium: 'warning',
      high: 'error',
      critical: 'error',
    }
    return variants[level] || 'info'
  }

  // Export to CSV
  const handleExport = () => {
    const headers = [
      'Customer',
      'Code',
      'Current',
      '0-30 Days',
      '31-60 Days',
      '61-90 Days',
      '91-120 Days',
      '120+ Days',
      'Total Overdue',
      'Risk Level',
    ]

    const csvContent = [
      headers.join(','),
      ...agingItems.map((item) =>
        [
          item.customer_name,
          item.customer_code,
          item.aging.current,
          item.aging.days30,
          item.aging.days60,
          item.aging.days90,
          item.aging.days120,
          item.aging.total - item.aging.current,
          item.risk_level,
        ].join(',')
      ),
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `aging-report-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    toast.success('Aging report exported successfully')
  }

  // Table columns
  const columns: ColumnDef<AgingReportItem, any>[] = [
    {
      header: 'Customer',
      accessorKey: 'customer_name',
      cell: ({ row }) => (
        <div>
          <div className="font-medium text-gray-900">{row.original.customer_name}</div>
          <div className="text-sm text-gray-500">{row.original.customer_code}</div>
        </div>
      ),
    },
    {
      header: 'Current',
      accessorKey: 'aging.current',
      cell: ({ row }) => (
        <span className="font-medium text-green-600">
          {formatCurrency(row.original.aging.current)}
        </span>
      ),
    },
    {
      header: '1-30 Days',
      accessorKey: 'aging.days30',
      cell: ({ row }) => (
        <span className={row.original.aging.days30 > 0 ? 'font-medium text-yellow-600' : ''}>
          {formatCurrency(row.original.aging.days30)}
        </span>
      ),
    },
    {
      header: '31-60 Days',
      accessorKey: 'aging.days60',
      cell: ({ row }) => (
        <span className={row.original.aging.days60 > 0 ? 'font-medium text-orange-600' : ''}>
          {formatCurrency(row.original.aging.days60)}
        </span>
      ),
    },
    {
      header: '61-90 Days',
      accessorKey: 'aging.days90',
      cell: ({ row }) => (
        <span className={row.original.aging.days90 > 0 ? 'font-medium text-red-600' : ''}>
          {formatCurrency(row.original.aging.days90)}
        </span>
      ),
    },
    {
      header: '90+ Days',
      accessorKey: 'aging.days120',
      cell: ({ row }) => (
        <span className={row.original.aging.days120 > 0 ? 'font-bold text-red-700' : ''}>
          {formatCurrency(row.original.aging.days120)}
        </span>
      ),
    },
    {
      header: 'Total Balance',
      accessorKey: 'current_balance',
      cell: ({ row }) => (
        <span className="font-semibold">{formatCurrency(row.original.current_balance)}</span>
      ),
    },
    {
      header: 'Risk Level',
      accessorKey: 'risk_level',
      cell: ({ row }) => (
        <Badge variant={getRiskBadge(row.original.risk_level)}>
          {row.original.risk_level.charAt(0).toUpperCase() + row.original.risk_level.slice(1)}
        </Badge>
      ),
    },
    {
      header: 'Actions',
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(`/credit-control/customers/${row.original.customer_id}`)}
        >
          View Details
        </Button>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Aging Reports</h1>
          <p className="text-gray-600">
            Track accounts receivable aging and collection status
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
            leftIcon={<FileDown className="w-4 h-4" />}
            onClick={handleExport}
          >
            Export CSV
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Receivables */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Receivables</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {formatCurrency(summary.total_receivables)}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {summary.customer_count} customers
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Current */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Current</p>
                <p className="text-2xl font-bold text-green-600 mt-1">
                  {formatCurrency(summary.total_current)}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {summary.total_receivables ? ((summary.total_current / summary.total_receivables) * 100).toFixed(1) : '0.0'}% of total
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Overdue */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Overdue</p>
                <p className="text-2xl font-bold text-orange-600 mt-1">
                  {formatCurrency(summary.total_overdue)}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {summary.high_risk_count} high risk
                </p>
              </div>
              <div className="p-3 bg-orange-100 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Collection Rate */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Collection Rate</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {summary.collection_rate.toFixed(1)}%
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Last 30 days
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Aging Buckets Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Aging Buckets Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-green-700 font-medium">Current</p>
              <p className="text-xl font-bold text-green-800 mt-1">
                {formatCurrency(summary.total_current)}
              </p>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-700 font-medium">1-30 Days</p>
              <p className="text-xl font-bold text-yellow-800 mt-1">
                {formatCurrency(summary.total_30_days)}
              </p>
            </div>
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <p className="text-sm text-orange-700 font-medium">31-60 Days</p>
              <p className="text-xl font-bold text-orange-800 mt-1">
                {formatCurrency(summary.total_60_days)}
              </p>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-700 font-medium">61-90 Days</p>
              <p className="text-xl font-bold text-red-800 mt-1">
                {formatCurrency(summary.total_90_days)}
              </p>
            </div>
            <div className="bg-red-100 border border-red-300 rounded-lg p-4">
              <p className="text-sm text-red-800 font-medium">90+ Days</p>
              <p className="text-xl font-bold text-red-900 mt-1">
                {formatCurrency(summary.total_120_plus)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* High Risk Alert */}
      {summary.high_risk_count > 0 && (
        <Alert
          type="warning"
          title="High Risk Customers Detected"
          message={`${summary.high_risk_count} customers have overdue payments exceeding 90 days. Immediate action recommended.`}
        />
      )}

      {/* Aging Report Table */}
      <Card>
        <CardHeader>
          <CardTitle>Customer Aging Details</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
            </div>
          ) : agingItems.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No aging data found</p>
            </div>
          ) : (
            <DataTable
              data={agingItems}
              columns={columns}
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default AgingReportsPage

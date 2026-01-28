import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { DataTable, Column } from '@/components/ui/DataTable'
import { Badge } from '@/components/ui/Badge'
import { Alert } from '@/components/ui/Alert'
import { Loader2, FileDown, RefreshCw, TrendingUp, AlertTriangle, DollarSign } from 'lucide-react'
import { toast } from 'sonner'
import creditControlService from '@/services/credit-control.service'
import { useQuery } from '@tanstack/react-query'

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
  const [filters, setFilters] = useState({
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
  const columns: Column<AgingReportItem>[] = [
    {
      header: 'Customer',
      accessorKey: 'customer_name',
      cell: (item) => (
        <div>
          <div className="font-medium text-gray-900">{item.customer_name}</div>
          <div className="text-sm text-gray-500">{item.customer_code}</div>
        </div>
      ),
    },
    {
      header: 'Current',
      accessorKey: 'aging.current',
      cell: (item) => (
        <span className="font-medium text-green-600">
          {formatCurrency(item.aging.current)}
        </span>
      ),
    },
    {
      header: '1-30 Days',
      accessorKey: 'aging.days30',
      cell: (item) => (
        <span className={item.aging.days30 > 0 ? 'font-medium text-yellow-600' : ''}>
          {formatCurrency(item.aging.days30)}
        </span>
      ),
    },
    {
      header: '31-60 Days',
      accessorKey: 'aging.days60',
      cell: (item) => (
        <span className={item.aging.days60 > 0 ? 'font-medium text-orange-600' : ''}>
          {formatCurrency(item.aging.days60)}
        </span>
      ),
    },
    {
      header: '61-90 Days',
      accessorKey: 'aging.days90',
      cell: (item) => (
        <span className={item.aging.days90 > 0 ? 'font-medium text-red-600' : ''}>
          {formatCurrency(item.aging.days90)}
        </span>
      ),
    },
    {
      header: '90+ Days',
      accessorKey: 'aging.days120',
      cell: (item) => (
        <span className={item.aging.days120 > 0 ? 'font-bold text-red-700' : ''}>
          {formatCurrency(item.aging.days120)}
        </span>
      ),
    },
    {
      header: 'Total Balance',
      accessorKey: 'current_balance',
      cell: (item) => (
        <span className="font-semibold">{formatCurrency(item.current_balance)}</span>
      ),
    },
    {
      header: 'Risk Level',
      accessorKey: 'risk_level',
      cell: (item) => (
        <Badge variant={getRiskBadge(item.risk_level)}>
          {item.risk_level.charAt(0).toUpperCase() + item.risk_level.slice(1)}
        </Badge>
      ),
    },
    {
      header: 'Actions',
      cell: (item) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(`/credit-control/customers/${item.customer_id}`)}
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
                  {((summary.total_current / summary.total_receivables) * 100).toFixed(1)}% of total
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
        <Alert variant="warning">
          <AlertTriangle className="w-5 h-5" />
          <Alert.Content>
            <p className="font-medium">High Risk Customers Detected</p>
            <p className="text-sm">
              {summary.high_risk_count} customers have overdue payments exceeding 90 days.
              Immediate action recommended.
            </p>
          </Alert.Content>
        </Alert>
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
              pagination={{ pageSize: 20 }}
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default AgingReportsPage

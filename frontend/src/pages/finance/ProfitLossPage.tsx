import React, { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { api } from '@/services/api'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Skeleton } from '@/components/ui/Loading'
import {
  Download,
  Printer,
  Calendar,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  DollarSign,
} from 'lucide-react'
import { formatCurrency, formatDate } from '@/utils'

interface AccountBalance {
  account_code: string
  account_name: string
  balance: number
}

interface ProfitLossData {
  revenue: AccountBalance[]
  expenses: AccountBalance[]
  total_revenue: number
  total_expenses: number
  net_profit: number
  period: {
    start_date: string
    end_date: string
  }
}

export const ProfitLossPage: React.FC = () => {
  const { user } = useAuth()

  const [data, setData] = useState<ProfitLossData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [startDate, setStartDate] = useState(formatDate(String(new Date().setDate(1)), 'YYYY-MM-DD'))
  const [endDate, setEndDate] = useState(formatDate(new Date(), 'YYYY-MM-DD'))

  const fetchProfitLoss = async () => {
    try {
      setIsLoading(true)
      const response = await api.get<ProfitLossData>('/finance/profit-and-loss', {
        params: {
          organization_id: user?.organization_id,
          start_date: startDate,
          end_date: endDate,
        },
      })
      setData(response.data)
    } catch (error) {
      console.error('Failed to fetch profit and loss:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchProfitLoss()
  }, [startDate, endDate])

  const handlePrint = () => {
    window.print()
  }

  const handleExport = () => {
    if (!data) return

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      'Section,Account Code,Account Name,Balance\n' +
      data.revenue.map((acc) => `Revenue,${acc.account_code},${acc.account_name},${acc.balance}`).join('\n') +
      '\n' +
      data.expenses.map((acc) => `Expenses,${acc.account_code},${acc.account_name},${acc.balance}`).join('\n') +
      '\n' +
      `Net Profit,${data.net_profit}\n` +
      `Total Revenue,${data.total_revenue}\n` +
      `Total Expenses,${data.total_expenses}`

    const link = document.createElement('a')
    link.setAttribute('href', encodeURI(csvContent))
    link.setAttribute('download', `profit-loss-${startDate}-to-${endDate}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const isProfit = (data?.net_profit || 0) >= 0
  const profitPercentage = data?.total_revenue
    ? ((data.net_profit / data.total_revenue) * 100).toFixed(2)
    : '0.00'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Profit & Loss Statement</h1>
          <p className="text-gray-600">
            {formatDate(startDate)} to {formatDate(endDate)}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-600" />
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-auto"
            />
            <span className="text-gray-600">to</span>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-auto"
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            leftIcon={<RefreshCw className="w-4 h-4" />}
            onClick={fetchProfitLoss}
            isLoading={isLoading}
          >
            Refresh
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
            onClick={handleExport}
          >
            Export
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      {data && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card variant="bordered" padding="lg">
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <p className="text-sm font-medium text-gray-600 mb-1">Total Revenue</p>
              <h3 className="text-2xl font-bold text-success-600">
                {formatCurrency(data.total_revenue)}
              </h3>
            </div>
          </Card>
          <Card variant="bordered" padding="lg">
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <TrendingDown className="w-6 h-6 text-red-600" />
              </div>
              <p className="text-sm font-medium text-gray-600 mb-1">Total Expenses</p>
              <h3 className="text-2xl font-bold text-error-600">
                {formatCurrency(data.total_expenses)}
              </h3>
            </div>
          </Card>
          <Card variant="bordered" padding="lg">
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <DollarSign className="w-6 h-6 text-blue-600" />
              </div>
              <p className="text-sm font-medium text-gray-600 mb-1">Net {isProfit ? 'Profit' : 'Loss'}</p>
              <h3
                className={`text-2xl font-bold ${isProfit ? 'text-success-600' : 'text-error-600'}`}
              >
                {formatCurrency(Math.abs(data.net_profit))}
              </h3>
            </div>
          </Card>
          <Card variant="bordered" padding="lg">
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <DollarSign className="w-6 h-6 text-purple-600" />
              </div>
              <p className="text-sm font-medium text-gray-600 mb-1">Profit Margin</p>
              <h3 className="text-2xl font-bold text-primary-600">{profitPercentage}%</h3>
            </div>
          </Card>
        </div>
      )}

      {/* Revenue and Expenses */}
      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <Skeleton key={i} height={400} className="rounded" />
          ))}
        </div>
      ) : data ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue */}
          <Card variant="bordered" padding="lg">
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-success-100">
                  <TrendingUp className="w-5 h-5 text-success-600" />
                </div>
                <CardTitle>Revenue</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {data.revenue.map((account) => (
                  <div
                    key={account.account_code}
                    className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{account.account_code}</p>
                      <p className="text-xs text-gray-600">{account.account_name}</p>
                    </div>
                    <p className="font-semibold text-success-600">{formatCurrency(account.balance)}</p>
                  </div>
                ))}
                {data.revenue.length === 0 && (
                  <div className="text-center py-4 text-gray-500 text-sm">No revenue accounts found</div>
                )}
              </div>
              <div className="mt-4 pt-4 border-t-2 border-success-200">
                <div className="flex items-center justify-between">
                  <p className="text-lg font-bold text-gray-900">Total Revenue</p>
                  <p className="text-2xl font-bold text-success-600">
                    {formatCurrency(data.total_revenue)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Expenses */}
          <Card variant="bordered" padding="lg">
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-error-100">
                  <TrendingDown className="w-5 h-5 text-error-600" />
                </div>
                <CardTitle>Expenses</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {data.expenses.map((account) => (
                  <div
                    key={account.account_code}
                    className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{account.account_code}</p>
                      <p className="text-xs text-gray-600">{account.account_name}</p>
                    </div>
                    <p className="font-semibold text-error-600">{formatCurrency(account.balance)}</p>
                  </div>
                ))}
                {data.expenses.length === 0 && (
                  <div className="text-center py-4 text-gray-500 text-sm">No expense accounts found</div>
                )}
              </div>
              <div className="mt-4 pt-4 border-t-2 border-error-200">
                <div className="flex items-center justify-between">
                  <p className="text-lg font-bold text-gray-900">Total Expenses</p>
                  <p className="text-2xl font-bold text-error-600">
                    {formatCurrency(data.total_expenses)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card variant="bordered" padding="lg" className="text-center">
          <p className="text-gray-500">No data available</p>
        </Card>
      )}

      {/* Net Profit/Loss Summary */}
      {data && (
        <Card variant="bordered" padding="lg">
          <CardHeader>
            <CardTitle>Profit & Loss Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-success-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">Total Revenue</p>
                <p className="text-3xl font-bold text-success-600">
                  {formatCurrency(data.total_revenue)}
                </p>
              </div>
              <div className="text-center p-4 bg-error-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">Total Expenses</p>
                <p className="text-3xl font-bold text-error-600">
                  {formatCurrency(data.total_expenses)}
                </p>
              </div>
              <div
                className={`text-center p-4 rounded-lg ${
                  isProfit ? 'bg-success-50' : 'bg-error-50'
                }`}
              >
                <p className="text-sm text-gray-600 mb-2">Net {isProfit ? 'Profit' : 'Loss'}</p>
                <p
                  className={`text-3xl font-bold ${isProfit ? 'text-success-600' : 'text-error-600'}`}
                >
                  {formatCurrency(Math.abs(data.net_profit))}
                </p>
                <p className="text-sm mt-2 font-medium text-gray-700">
                  {isProfit ? `Profit Margin: ${profitPercentage}%` : `Loss Margin: ${profitPercentage}%`}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default ProfitLossPage

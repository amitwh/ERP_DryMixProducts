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
  Building,
  DollarSign,
  Scale,
} from 'lucide-react'
import { formatCurrency, formatDate } from '@/utils'

interface AccountBalance {
  account_code: string
  account_name: string
  balance: number
}

interface BalanceSheetData {
  assets: AccountBalance[]
  liabilities: AccountBalance[]
  equity: AccountBalance[]
  as_of_date: string
}

export const BalanceSheetPage: React.FC = () => {
  const { user } = useAuth()

  const [data, setData] = useState<BalanceSheetData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [asOfDate, setAsOfDate] = useState(formatDate(new Date(), 'YYYY-MM-DD'))

  const fetchBalanceSheet = async () => {
    try {
      setIsLoading(true)
      const response = await api.get<BalanceSheetData>('/finance/balance-sheet', {
        params: {
          organization_id: user?.organizationId,
          as_of_date: asOfDate,
        },
      })
      setData(response.data)
    } catch (error) {
      console.error('Failed to fetch balance sheet:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchBalanceSheet()
  }, [asOfDate])

  const handlePrint = () => {
    window.print()
  }

  const handleExport = () => {
    if (!data) return

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      'Section,Account Code,Account Name,Balance\n' +
      data.assets.map((acc) => `Assets,${acc.account_code},${acc.account_name},${acc.balance}`).join('\n') +
      '\n' +
      data.liabilities.map((acc) => `Liabilities,${acc.account_code},${acc.account_name},${acc.balance}`).join('\n') +
      '\n' +
      data.equity.map((acc) => `Equity,${acc.account_code},${acc.account_name},${acc.balance}`).join('\n')

    const link = document.createElement('a')
    link.setAttribute('href', encodeURI(csvContent))
    link.setAttribute('download', `balance-sheet-${asOfDate}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const totalAssets = data?.assets.reduce((sum, acc) => sum + acc.balance, 0) || 0
  const totalLiabilities = data?.liabilities.reduce((sum, acc) => sum + acc.balance, 0) || 0
  const totalEquity = data?.equity.reduce((sum, acc) => sum + acc.balance, 0) || 0
  const totalLiabilitiesAndEquity = totalLiabilities + totalEquity
  const isBalanced = Math.abs(totalAssets - totalLiabilitiesAndEquity) < 0.01

  const AccountSection: React.FC<{
    title: string
    accounts: AccountBalance[]
    icon: React.ReactNode
    color: string
  }> = ({ title, accounts, icon, color }) => {
    const total = accounts.reduce((sum, acc) => sum + acc.balance, 0)

    return (
      <Card variant="bordered" padding="lg" className="h-full">
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-lg ${color}`}>{icon}</div>
            <CardTitle>{title}</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {accounts.map((account) => (
              <div
                key={account.account_code}
                className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{account.account_code}</p>
                  <p className="text-xs text-gray-600">{account.account_name}</p>
                </div>
                <p className="font-semibold text-gray-900">{formatCurrency(account.balance)}</p>
              </div>
            ))}
            {accounts.length === 0 && (
              <div className="text-center py-4 text-gray-500 text-sm">No accounts found</div>
            )}
          </div>
          <div className="mt-4 pt-4 border-t-2 border-gray-200">
            <div className="flex items-center justify-between">
              <p className="text-lg font-bold text-gray-900">Total</p>
              <p className={`text-2xl font-bold ${color.replace('bg-', 'text-').replace('-100', '-600')}`}>
                {formatCurrency(total)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Balance Sheet</h1>
          <p className="text-gray-600">As of {formatDate(asOfDate)}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-600" />
            <Input
              type="date"
              value={asOfDate}
              onChange={(e) => setAsOfDate(e.target.value)}
              className="w-auto"
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            leftIcon={<RefreshCw className="w-4 h-4" />}
            onClick={fetchBalanceSheet}
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card variant="bordered" padding="lg">
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <DollarSign className="w-6 h-6 text-blue-600" />
            </div>
            <p className="text-sm font-medium text-gray-600 mb-1">Total Assets</p>
            <h3 className="text-2xl font-bold text-primary-600">{formatCurrency(totalAssets)}</h3>
          </div>
        </Card>
        <Card variant="bordered" padding="lg">
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Building className="w-6 h-6 text-red-600" />
            </div>
            <p className="text-sm font-medium text-gray-600 mb-1">Total Liabilities</p>
            <h3 className="text-2xl font-bold text-error-600">{formatCurrency(totalLiabilities)}</h3>
          </div>
        </Card>
        <Card variant="bordered" padding="lg">
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
            <p className="text-sm font-medium text-gray-600 mb-1">Total Equity</p>
            <h3 className="text-2xl font-bold text-secondary-600">{formatCurrency(totalEquity)}</h3>
          </div>
        </Card>
        <Card variant="bordered" padding="lg">
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Scale className="w-6 h-6 text-green-600" />
            </div>
            <p className="text-sm font-medium text-gray-600 mb-1">Balance Status</p>
            <div className="flex items-center justify-center gap-2 mt-2">
              {isBalanced ? (
                <>
                  <div className="w-3 h-3 rounded-full bg-success-600"></div>
                  <span className="text-lg font-bold text-success-600">Balanced</span>
                </>
              ) : (
                <>
                  <div className="w-3 h-3 rounded-full bg-error-600"></div>
                  <span className="text-lg font-bold text-error-600">Not Balanced</span>
                </>
              )}
            </div>
          </div>
        </Card>
      </div>

      {/* Balance Sheet */}
      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} height={400} className="rounded" />
          ))}
        </div>
      ) : data ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AccountSection
            title="Assets"
            accounts={data.assets}
            icon={<DollarSign className="w-5 h-5 text-white" />}
            color="bg-blue-500"
          />
          <div className="space-y-6">
            <AccountSection
              title="Liabilities"
              accounts={data.liabilities}
              icon={<Building className="w-5 h-5 text-white" />}
              color="bg-red-500"
            />
            <AccountSection
              title="Equity"
              accounts={data.equity}
              icon={<TrendingUp className="w-5 h-5 text-white" />}
              color="bg-purple-500"
            />
          </div>
        </div>
      ) : (
        <Card variant="bordered" padding="lg" className="text-center">
          <p className="text-gray-500">No data available</p>
        </Card>
      )}

      {/* Balance Verification */}
      {data && (
        <Card variant="bordered" padding="lg">
          <CardHeader>
            <CardTitle>Balance Verification</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">Total Assets</p>
                <p className="text-3xl font-bold text-primary-600">{formatCurrency(totalAssets)}</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">Liabilities + Equity</p>
                <p className="text-3xl font-bold text-gray-900">
                  {formatCurrency(totalLiabilitiesAndEquity)}
                </p>
              </div>
            </div>
            <div className="mt-4 p-4 rounded-lg text-center">
              <p className="text-sm text-gray-600 mb-2">Difference</p>
              <p
                className={`text-2xl font-bold ${
                  isBalanced ? 'text-success-600' : 'text-error-600'
                }`}
              >
                {formatCurrency(Math.abs(totalAssets - totalLiabilitiesAndEquity))}
              </p>
              <p
                className={`text-sm mt-2 font-medium ${
                  isBalanced ? 'text-success-600' : 'text-error-600'
                }`}
              >
                {isBalanced
                  ? 'Assets = Liabilities + Equity ✓'
                  : 'Balance sheet is not balanced ✗'}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default BalanceSheetPage

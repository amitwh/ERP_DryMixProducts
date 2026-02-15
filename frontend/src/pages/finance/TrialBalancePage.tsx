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
  CheckCircle,
  XCircle,
  ArrowUp,
  ArrowDown,
} from 'lucide-react'
import { formatCurrency, formatDate } from '@/utils'

interface TrialBalanceAccount {
  account_code: string
  account_name: string
  account_type: string
  debit: number
  credit: number
  net_balance: number
}

interface TrialBalanceData {
  accounts: TrialBalanceAccount[]
  total_debit: number
  total_credit: number
  is_balanced: boolean
}

export const TrialBalancePage: React.FC = () => {
  const { user } = useAuth()

  const [data, setData] = useState<TrialBalanceData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [asOfDate, setAsOfDate] = useState(formatDate(new Date(), 'YYYY-MM-DD'))

  const fetchTrialBalance = async () => {
    try {
      setIsLoading(true)
      const response = await api.get<TrialBalanceData>('/finance/trial-balance', {
        params: {
          organization_id: user?.organization_id,
          as_of_date: asOfDate,
        },
      })
      setData(response.data)
    } catch (error) {
      console.error('Failed to fetch trial balance:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchTrialBalance()
  }, [asOfDate])

  const handlePrint = () => {
    window.print()
  }

  const handleExport = () => {
    if (!data) return

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      'Account Code,Account Name,Account Type,Debit,Credit,Net Balance\n' +
      data.accounts
        .map(
          (acc) =>
            `${acc.account_code},${acc.account_name},${acc.account_type},${acc.debit},${acc.credit},${acc.net_balance}`
        )
        .join('\n')

    const link = document.createElement('a')
    link.setAttribute('href', encodeURI(csvContent))
    link.setAttribute('download', `trial-balance-${asOfDate}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const AccountRow: React.FC<{ account: TrialBalanceAccount }> = ({ account }) => {
    const isDebit = account.net_balance >= 0

    return (
      <div className="flex items-center gap-4 py-3 px-4 border-b border-gray-200 hover:bg-gray-50 transition-colors">
        <div className="flex-1">
          <p className="font-semibold text-gray-900">{account.account_code}</p>
          <p className="text-sm text-gray-600">{account.account_name}</p>
          <span className="inline-block px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-700 mt-1">
            {account.account_type}
          </span>
        </div>
        <div className="text-right w-32">
          <p className={`font-semibold ${account.debit > 0 ? 'text-gray-900' : 'text-gray-400'}`}>
            {account.debit > 0 ? formatCurrency(account.debit) : '-'}
          </p>
        </div>
        <div className="text-right w-32">
          <p className={`font-semibold ${account.credit > 0 ? 'text-gray-900' : 'text-gray-400'}`}>
            {account.credit > 0 ? formatCurrency(account.credit) : '-'}
          </p>
        </div>
        <div className="text-right w-40">
          <p className={`font-bold ${isDebit ? 'text-primary-600' : 'text-secondary-600'}`}>
            {formatCurrency(Math.abs(account.net_balance))}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Trial Balance</h1>
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
            onClick={fetchTrialBalance}
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
              <p className="text-sm font-medium text-gray-600 mb-1">Total Debit</p>
              <h3 className="text-2xl font-bold text-primary-600">{formatCurrency(data.total_debit)}</h3>
            </div>
          </Card>
          <Card variant="bordered" padding="lg">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600 mb-1">Total Credit</p>
              <h3 className="text-2xl font-bold text-secondary-600">{formatCurrency(data.total_credit)}</h3>
            </div>
          </Card>
          <Card variant="bordered" padding="lg">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600 mb-1">Difference</p>
              <h3 className={`text-2xl font-bold ${data.is_balanced ? 'text-success-600' : 'text-error-600'}`}>
                {formatCurrency(Math.abs(data.total_debit - data.total_credit))}
              </h3>
            </div>
          </Card>
          <Card variant="bordered" padding="lg">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600 mb-1">Status</p>
              <div className="flex items-center justify-center gap-2 mt-2">
                {data.is_balanced ? (
                  <>
                    <CheckCircle className="w-6 h-6 text-success-600" />
                    <span className="text-lg font-bold text-success-600">Balanced</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-6 h-6 text-error-600" />
                    <span className="text-lg font-bold text-error-600">Not Balanced</span>
                  </>
                )}
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Trial Balance Table */}
      <Card variant="bordered" padding="lg">
        <CardHeader>
          <CardTitle>Account Balances</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} height={60} className="rounded" />
              ))}
            </div>
          ) : data?.accounts && data.accounts.length > 0 ? (
            <div>
              {/* Table Header */}
              <div className="flex items-center gap-4 py-3 px-4 bg-gray-50 border-b-2 border-gray-200">
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">Account</p>
                </div>
                <div className="text-right w-32">
                  <p className="font-semibold text-gray-900 flex items-center justify-end gap-1">
                    <ArrowDown className="w-4 h-4" />
                    Debit
                  </p>
                </div>
                <div className="text-right w-32">
                  <p className="font-semibold text-gray-900 flex items-center justify-end gap-1">
                    <ArrowUp className="w-4 h-4" />
                    Credit
                  </p>
                </div>
                <div className="text-right w-40">
                  <p className="font-semibold text-gray-900">Net Balance</p>
                </div>
              </div>

              {/* Table Body */}
              {data.accounts.map((account) => (
                <AccountRow key={account.account_code} account={account} />
              ))}

              {/* Table Footer */}
              {data && (
                <div className="flex items-center gap-4 py-3 px-4 bg-gray-100 border-t-2 border-gray-300 font-bold mt-4">
                  <div className="flex-1">
                    <p className="text-gray-900">Total</p>
                  </div>
                  <div className="text-right w-32">
                    <p className="text-gray-900">{formatCurrency(data.total_debit)}</p>
                  </div>
                  <div className="text-right w-32">
                    <p className="text-gray-900">{formatCurrency(data.total_credit)}</p>
                  </div>
                  <div className="text-right w-40">
                    <p className="text-gray-900">
                      {formatCurrency(Math.abs(data.total_debit - data.total_credit))}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No accounts found</p>
            </div>
          )}
        </CardContent>
      </Card>

      {!data?.is_balanced && data && (
        <Card variant="bordered" padding="lg" className="border-error-300 bg-error-50">
          <div className="flex items-center gap-3">
            <XCircle className="w-8 h-8 text-error-600 flex-shrink-0" />
            <div>
              <h3 className="text-lg font-bold text-error-900 mb-1">Trial Balance Not Balanced</h3>
              <p className="text-error-700">
                The trial balance shows a difference of{' '}
                <strong>{formatCurrency(Math.abs(data.total_debit - data.total_credit))}</strong>
                between debits and credits. Please review your journal entries and account balances.
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}

export default TrialBalancePage

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
  Search,
} from 'lucide-react'
import { formatCurrency, formatDate } from '@/utils'

interface LedgerEntry {
  id: number
  entry_date: string
  reference: string
  entry_type: 'debit' | 'credit'
  debit_amount: number
  credit_amount: number
  balance: number
  narration?: string
}

interface Account {
  id: number
  account_code: string
  account_name: string
  account_type: string
}

interface LedgerData {
  account: Account
  opening_balance: number
  closing_balance: number
  transactions: LedgerEntry[]
}

export const LedgerViewPage: React.FC = () => {
  const { user } = useAuth()

  const [data, setData] = useState<LedgerData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [startDate, setStartDate] = useState(formatDate(String(new Date().setMonth(0)), 'YYYY-MM-DD'))
  const [endDate, setEndDate] = useState(formatDate(new Date(), 'YYYY-MM-DD'))
  const [searchTerm, setSearchTerm] = useState('')

  const fetchLedger = async () => {
    try {
      setIsLoading(true)
      const response = await api.get<LedgerData>('/finance/ledgers', {
        params: {
          organization_id: user?.organization_id,
          account_id: 1,
          start_date: startDate,
          end_date: endDate,
        },
      })
      setData(response.data)
    } catch (error) {
      console.error('Failed to fetch ledger:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchLedger()
  }, [startDate, endDate])

  const handlePrint = () => {
    window.print()
  }

  const handleExport = () => {
    if (!data) return

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      'Date,Reference,Type,Debit,Credit,Balance,Narration\n' +
      data.transactions
        .map(
          (t) =>
            `${t.entry_date},${t.reference},${t.entry_type},${t.debit_amount},${t.credit_amount},${t.balance},"${t.narration || ''}"`
        )
        .join('\n')

    const link = document.createElement('a')
    link.setAttribute('href', encodeURI(csvContent))
    link.setAttribute('download', `ledger-${startDate}-to-${endDate}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const filteredTransactions = data?.transactions.filter((t) => {
    const matchesSearch =
      searchTerm === '' ||
      t.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.narration && t.narration.toLowerCase().includes(searchTerm.toLowerCase()))

    return matchesSearch
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Ledger</h1>
          <p className="text-gray-600">
            {data?.account.account_code} - {data?.account.account_name}
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
            onClick={fetchLedger}
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card variant="bordered" padding="lg">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600 mb-1">Opening Balance</p>
              <h3 className="text-2xl font-bold text-gray-900">
                {formatCurrency(data.opening_balance)}
              </h3>
            </div>
          </Card>
          <Card variant="bordered" padding="lg">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600 mb-1">Total Debit</p>
              <h3 className="text-2xl font-bold text-primary-600">
                {formatCurrency(filteredTransactions?.reduce((sum, t) => sum + t.debit_amount, 0) || 0)}
              </h3>
            </div>
          </Card>
          <Card variant="bordered" padding="lg">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600 mb-1">Total Credit</p>
              <h3 className="text-2xl font-bold text-secondary-600">
                {formatCurrency(filteredTransactions?.reduce((sum, t) => sum + t.credit_amount, 0) || 0)}
              </h3>
            </div>
          </Card>
        </div>
      )}

      {/* Search */}
      <Card variant="bordered" padding="md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search transactions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
      </Card>

      {/* Ledger Transactions */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} height={60} className="rounded" />
          ))}
        </div>
      ) : filteredTransactions && filteredTransactions.length > 0 ? (
        <Card variant="bordered" padding="lg">
          <CardHeader>
            <CardTitle>Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {/* Opening Balance */}
              <div className="flex items-center gap-4 p-3 bg-gray-100 rounded-lg font-bold">
                <div className="flex-1">
                  <p className="text-sm text-gray-600">Opening Balance</p>
                </div>
                <p className="text-xl text-gray-900">{formatCurrency(data?.opening_balance || 0)}</p>
              </div>

              {/* Transactions */}
              {filteredTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-gray-900">{transaction.reference}</span>
                      <span
                        className={`px-2 py-0.5 text-xs rounded-full ${
                          transaction.entry_type === 'debit'
                            ? 'bg-primary-100 text-primary-800'
                            : 'bg-secondary-100 text-secondary-800'
                        }`}
                      >
                        {transaction.entry_type.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{formatDate(transaction.entry_date)}</p>
                    {transaction.narration && <p className="text-xs text-gray-500 mt-1">{transaction.narration}</p>}
                  </div>
                  <div className="text-right w-24">
                    <p
                      className={`font-semibold ${
                        transaction.entry_type === 'debit' ? 'text-primary-600' : 'text-gray-400'
                      }`}
                    >
                      {transaction.debit_amount > 0 ? formatCurrency(transaction.debit_amount) : '-'}
                    </p>
                  </div>
                  <div className="text-right w-24">
                    <p
                      className={`font-semibold ${
                        transaction.entry_type === 'credit' ? 'text-secondary-600' : 'text-gray-400'
                      }`}
                    >
                      {transaction.credit_amount > 0 ? formatCurrency(transaction.credit_amount) : '-'}
                    </p>
                  </div>
                  <div className="text-right w-32">
                    <p className={`font-bold ${transaction.balance >= 0 ? 'text-gray-900' : 'text-error-600'}`}>
                      {formatCurrency(transaction.balance)}
                    </p>
                  </div>
                </div>
              ))}

              {/* Closing Balance */}
              {data && (
                <div className="flex items-center gap-4 p-3 bg-gray-100 rounded-lg font-bold mt-2">
                  <div className="flex-1">
                    <p className="text-sm text-gray-600">Closing Balance</p>
                  </div>
                  <p className={`text-xl ${data.closing_balance >= 0 ? 'text-gray-900' : 'text-error-600'}`}>
                    {formatCurrency(data.closing_balance)}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card variant="bordered" padding="lg" className="text-center">
          <p className="text-gray-500">No transactions found for this period</p>
        </Card>
      )}
    </div>
  )
}

export default LedgerViewPage

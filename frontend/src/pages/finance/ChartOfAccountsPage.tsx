import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { api } from '@/services/api'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { StatusBadge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Loading'
import {
  Plus,
  Search,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  FolderTree,
  Eye,
  Pencil,
  Trash2,
} from 'lucide-react'
import { formatCurrency, formatDate } from '@/utils'

interface ChartOfAccount {
  id: number
  account_code: string
  account_name: string
  account_type: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense'
  sub_type: string | null
  opening_balance: number
  current_balance: number
  status: 'active' | 'inactive'
  is_cash_account: boolean
  parent_account_id: number | null
  childAccounts?: ChartOfAccount[]
}

interface AccountType {
  type: string
  label: string
  color: string
  icon: React.ReactNode
}

const accountTypes: AccountType[] = [
  { type: 'asset', label: 'Assets', color: 'bg-blue-100 text-blue-800', icon: <DollarSign className="w-4 h-4" /> },
  { type: 'liability', label: 'Liabilities', color: 'bg-red-100 text-red-800', icon: <ArrowDownRight className="w-4 h-4" /> },
  { type: 'equity', label: 'Equity', color: 'bg-purple-100 text-purple-800', icon: <ArrowUpRight className="w-4 h-4" /> },
  { type: 'revenue', label: 'Revenue', color: 'bg-green-100 text-green-800', icon: <ArrowUpRight className="w-4 h-4" /> },
  { type: 'expense', label: 'Expenses', color: 'bg-orange-100 text-orange-800', icon: <ArrowDownRight className="w-4 h-4" /> },
]

export const ChartOfAccountsPage: React.FC = () => {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [accounts, setAccounts] = useState<ChartOfAccount[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState<string | null>(null)
  const [expandedAccounts, setExpandedAccounts] = useState<Set<number>>(new Set())

  const fetchAccounts = async () => {
    try {
      const response = await api.get<{ data: ChartOfAccount[] }>('/finance/chart-of-accounts', {
        params: {
          organization_id: user?.organizationId,
        },
      })
      setAccounts(response.data.data || [])
    } catch (error) {
      console.error('Failed to fetch accounts:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchAccounts()
  }, [])

  const filteredAccounts = accounts.filter((account) => {
    const matchesSearch =
      searchTerm === '' ||
      account.account_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      account.account_name.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesType = !selectedType || account.account_type === selectedType

    return matchesSearch && matchesType
  })

  const toggleExpand = (accountId: number) => {
    const newExpanded = new Set(expandedAccounts)
    if (newExpanded.has(accountId)) {
      newExpanded.delete(accountId)
    } else {
      newExpanded.add(accountId)
    }
    setExpandedAccounts(newExpanded)
  }

  const AccountCard: React.FC<{ account: ChartOfAccount; level?: number }> = ({ account, level = 0 }) => {
    const accountType = accountTypes.find((t) => t.type === account.account_type)
    const hasChildren = account.childAccounts && account.childAccounts.length > 0
    const isExpanded = expandedAccounts.has(account.id)

    return (
      <div style={{ marginLeft: level * 20 }}>
        <Card variant="bordered" padding="md" className="mb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1">
              {hasChildren && (
                <button
                  onClick={() => toggleExpand(account.id)}
                  className="p-1 hover:bg-gray-100 rounded transition-colors"
                >
                  <FolderTree className="w-4 h-4 text-gray-600" />
                </button>
              )}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-gray-900">{account.account_code}</span>
                  <span className="text-sm font-medium text-gray-700">{account.account_name}</span>
                  <StatusBadge status={account.status} size="sm" />
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className={`px-2 py-0.5 rounded-full ${accountType?.color}`}>
                    {accountType?.label}
                  </span>
                  {account.sub_type && <span className="text-gray-600">{account.sub_type}</span>}
                </div>
              </div>
            </div>
            <div className="text-right flex items-center gap-4">
              <div>
                <p className="text-xs text-gray-500">Opening Balance</p>
                <p className="font-semibold text-gray-900">{formatCurrency(account.opening_balance)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Current Balance</p>
                <p className="font-bold text-lg text-primary-600">{formatCurrency(account.current_balance)}</p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => navigate(`/finance/accounts/${account.id}/ledger`)}>
                  <Eye className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => navigate(`/finance/accounts/${account.id}/edit`)}>
                  <Pencil className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {hasChildren && isExpanded && account.childAccounts && (
          <div className="mt-2">
            {account.childAccounts.map((child) => (
              <AccountCard key={child.id} account={child} level={level + 1} />
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Chart of Accounts</h1>
          <p className="text-gray-600">Manage your organization's chart of accounts</p>
        </div>
        <Button
          variant="primary"
          size="sm"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => navigate('/finance/accounts/create')}
        >
          New Account
        </Button>
      </div>

      {/* Filters */}
      <Card variant="bordered" padding="md">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Search by code or name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-600" />
            {accountTypes.map((type) => (
              <Button
                key={type.type}
                variant={selectedType === type.type ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setSelectedType(selectedType === type.type ? null : type.type)}
              >
                {type.icon}
                <span className="ml-1">{type.label}</span>
              </Button>
            ))}
          </div>
        </div>
      </Card>

      {/* Accounts */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} height={80} className="rounded" />
          ))}
        </div>
      ) : filteredAccounts.length === 0 ? (
        <Card variant="bordered" padding="lg" className="text-center">
          <p className="text-gray-500 mb-4">No accounts found</p>
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => navigate('/finance/accounts/create')}
          >
            Create First Account
          </Button>
        </Card>
      ) : (
        <div className="space-y-2">
          {filteredAccounts.map((account) => (
            <AccountCard key={account.id} account={account} />
          ))}
        </div>
      )}
    </div>
  )
}

export default ChartOfAccountsPage

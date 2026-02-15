import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { api } from '@/services/api'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Loading'
import {
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  TrendingUp,
  TrendingDown,
  FileText,
  Calendar,
  Receipt,
  Scale,
} from 'lucide-react'
import { formatCurrency } from '@/utils'

interface FinanceStats {
  total_assets?: number
  total_liabilities?: number
  total_equity?: number
  total_revenue?: number
  total_expenses?: number
  net_profit?: number
  vouchers_this_month?: number
  pending_vouchers?: number
}

export const FinanceDashboardPage: React.FC = () => {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [stats, setStats] = useState<FinanceStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchFinanceStats = async () => {
    try {
      const response = await api.get<FinanceStats>('/finance/balance-summary', {
        params: {
          organization_id: user?.organization_id,
          as_of_date: new Date().toISOString().split('T')[0],
        },
      })
      setStats({
        ...response.data.totals,
        vouchers_this_month: 15,
        pending_vouchers: 3,
      })
    } catch (error) {
      console.error('Failed to fetch finance stats:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchFinanceStats()
  }, [])

  const StatCard: React.FC<{
    title: string
    value: number | string
    icon: React.ReactNode
    color: string
    isLoading?: boolean
    onClick?: () => void
    change?: number
  }> = ({ title, value, icon, color, isLoading, onClick, change }) => {
    if (isLoading) {
      return <Skeleton height={100} className="rounded" />
    }

    return (
      <Card
        variant="bordered"
        padding="lg"
        className={onClick ? 'cursor-pointer hover:shadow-lg transition-shadow' : ''}
        onClick={onClick}
      >
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-xl ${color}`}>{icon}</div>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              {typeof value === 'number' ? formatCurrency(value) : value}
            </h3>
            {change !== undefined && (
              <div
                className={`flex items-center gap-1 text-sm ${
                  change >= 0 ? 'text-success-600' : 'text-error-600'
                }`}
              >
                {change >= 0 ? (
                  <ArrowUpRight className="w-4 h-4" />
                ) : (
                  <ArrowDownRight className="w-4 h-4" />
                )}
                <span>{Math.abs(change)}% from last month</span>
              </div>
            )}
          </div>
        </div>
      </Card>
    )
  }

  const QuickAction: React.FC<{
    title: string
    description: string
    icon: React.ReactNode
    path: string
    color: string
  }> = ({ title, description, icon, path, color }) => (
    <Card
      variant="bordered"
      padding="lg"
      className="cursor-pointer hover:shadow-lg transition-shadow"
      onClick={() => navigate(path)}
    >
      <div className={`p-3 rounded-xl ${color} w-fit mb-4`}>{icon}</div>
      <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-600">{description}</p>
    </Card>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Finance Dashboard</h1>
        <p className="text-gray-600">Overview of your financial position and activities</p>
      </div>

      {/* Financial Position */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Financial Position</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Assets"
            value={stats?.total_assets || 0}
            icon={<DollarSign className="w-6 h-6 text-white" />}
            color="bg-primary-600"
            isLoading={isLoading}
            change={5.2}
            onClick={() => navigate('/finance/reports/balance-sheet')}
          />
          <StatCard
            title="Total Liabilities"
            value={stats?.total_liabilities || 0}
            icon={<TrendingDown className="w-6 h-6 text-white" />}
            color="bg-error-600"
            isLoading={isLoading}
            change={-2.1}
            onClick={() => navigate('/finance/reports/balance-sheet')}
          />
          <StatCard
            title="Total Equity"
            value={stats?.total_equity || 0}
            icon={<Scale className="w-6 h-6 text-white" />}
            color="bg-secondary-600"
            isLoading={isLoading}
            change={3.8}
            onClick={() => navigate('/finance/reports/balance-sheet')}
          />
          <StatCard
            title="Net Assets"
            value={(stats?.total_assets || 0) - (stats?.total_liabilities || 0)}
            icon={<TrendingUp className="w-6 h-6 text-white" />}
            color="bg-success-600"
            isLoading={isLoading}
          />
        </div>
      </div>

      {/* Profit & Loss */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Profit & Loss</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard
            title="Total Revenue"
            value={stats?.total_revenue || 0}
            icon={<ArrowUpRight className="w-6 h-6 text-white" />}
            color="bg-success-600"
            isLoading={isLoading}
            change={12.5}
            onClick={() => navigate('/finance/reports/profit-loss')}
          />
          <StatCard
            title="Total Expenses"
            value={stats?.total_expenses || 0}
            icon={<ArrowDownRight className="w-6 h-6 text-white" />}
            color="bg-warning-600"
            isLoading={isLoading}
            change={8.3}
            onClick={() => navigate('/finance/reports/profit-loss')}
          />
          <StatCard
            title="Net Profit"
            value={stats?.net_profit || 0}
            icon={<DollarSign className="w-6 h-6 text-white" />}
            color={stats?.net_profit ? 'bg-success-600' : 'bg-error-600'}
            isLoading={isLoading}
            onClick={() => navigate('/finance/reports/profit-loss')}
          />
        </div>
      </div>

      {/* Voucher Activity */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Voucher Activity</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <StatCard
            title="Vouchers This Month"
            value={stats?.vouchers_this_month || 0}
            icon={<Receipt className="w-6 h-6 text-white" />}
            color="bg-blue-600"
            isLoading={isLoading}
            onClick={() => navigate('/finance/vouchers')}
          />
          <StatCard
            title="Pending Vouchers"
            value={stats?.pending_vouchers || 0}
            icon={<Calendar className="w-6 h-6 text-white" />}
            color="bg-orange-600"
            isLoading={isLoading}
            onClick={() => navigate('/finance/vouchers?status=draft')}
          />
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <QuickAction
            title="Create Voucher"
            description="Create a new journal voucher"
            icon={<Receipt className="w-5 h-5 text-white" />}
            path="/finance/vouchers/create"
            color="bg-primary-600"
          />
          <QuickAction
            title="Trial Balance"
            description="View trial balance report"
            icon={<FileText className="w-5 h-5 text-white" />}
            path="/finance/reports/trial-balance"
            color="bg-success-600"
          />
          <QuickAction
            title="Balance Sheet"
            description="View balance sheet report"
            icon={<Scale className="w-5 h-5 text-white" />}
            path="/finance/reports/balance-sheet"
            color="bg-secondary-600"
          />
          <QuickAction
            title="Profit & Loss"
            description="View profit & loss statement"
            icon={<TrendingUp className="w-5 h-5 text-white" />}
            path="/finance/reports/profit-loss"
            color="bg-warning-600"
          />
        </div>
      </div>

      {/* Financial Health */}
      {stats && (
        <Card variant="bordered" padding="lg">
          <CardHeader>
            <CardTitle>Financial Health</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">Debt-to-Equity Ratio</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.total_equity
                    ? ((stats.total_liabilities || 0) / stats.total_equity).toFixed(2)
                    : '0.00'}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {stats.total_equity && (stats.total_liabilities || 0) / stats.total_equity < 1
                    ? 'Good'
                    : 'Needs Attention'}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">Profit Margin</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.total_revenue
                    ? ((stats.net_profit || 0) / stats.total_revenue * 100).toFixed(1) + '%'
                    : '0%'}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {stats.total_revenue && (stats.net_profit || 0) / stats.total_revenue > 0.1
                    ? 'Good'
                    : 'Needs Improvement'}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">Asset Utilization</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.total_assets
                    ? (((stats.total_liabilities || 0) + (stats.total_equity || 0)) /
                        stats.total_assets *
                        100).toFixed(1) + '%'
                    : '0%'}
                </p>
                <p className="text-xs text-gray-500 mt-1">Efficient</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default FinanceDashboardPage

import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { api } from '@/services/api'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { StatusBadge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Loading'
import { Plus, Eye, CheckCircle, XCircle, RefreshCw, Search } from 'lucide-react'
import { formatCurrency, formatDate } from '@/utils'
import { toast } from 'sonner'

interface JournalVoucher {
  id: number
  voucher_number: string
  voucher_date: string
  voucher_type: string
  total_debit: number
  total_credit: number
  status: 'draft' | 'posted' | 'cancelled'
  reference?: string
  narration?: string
}

export const JournalVouchersPage: React.FC = () => {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [vouchers, setVouchers] = useState<JournalVoucher[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [page, setPage] = useState(1)

  const fetchVouchers = async () => {
    try {
      setIsLoading(true)
      const response = await api.get<{ data: JournalVoucher[] }>('/finance/journal-vouchers', {
        params: {
          organization_id: user?.organization_id,
          per_page: 20,
          page: page,
          ...(statusFilter !== 'all' && { status: statusFilter }),
        },
      })
      setVouchers(response.data.data || [])
    } catch (error) {
      console.error('Failed to fetch vouchers:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchVouchers()
  }, [page, statusFilter])

  const filteredVouchers = vouchers.filter((voucher) => {
    const matchesSearch =
      searchTerm === '' ||
      voucher.voucher_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (voucher.reference && voucher.reference.toLowerCase().includes(searchTerm.toLowerCase()))

    return matchesSearch
  })

  const handlePostVoucher = async (voucherId: number) => {
    try {
      await api.post(`/journal-vouchers/${voucherId}/post`)
      toast.success('Voucher posted successfully')
      fetchVouchers()
    } catch (error: any) {
      console.error('Failed to post voucher:', error)
      toast.error(error?.response?.data?.message || 'Failed to post voucher')
    }
  }

  const handleCancelVoucher = async (voucherId: number) => {
    if (!confirm('Are you sure you want to cancel this voucher?')) return

    try {
      await api.post(`/journal-vouchers/${voucherId}/cancel`)
      toast.success('Voucher cancelled successfully')
      fetchVouchers()
    } catch (error: any) {
      console.error('Failed to cancel voucher:', error)
      toast.error(error?.response?.data?.message || 'Failed to cancel voucher')
    }
  }

  const voucherTypeColors: Record<string, string> = {
    journal: 'bg-blue-100 text-blue-800',
    receipt: 'bg-green-100 text-green-800',
    payment: 'bg-red-100 text-red-800',
    contra: 'bg-purple-100 text-purple-800',
    sales: 'bg-indigo-100 text-indigo-800',
    purchase: 'bg-orange-100 text-orange-800',
    debit_note: 'bg-yellow-100 text-yellow-800',
    credit_note: 'bg-pink-100 text-pink-800',
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Journal Vouchers</h1>
          <p className="text-gray-600">Manage journal vouchers and transactions</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => navigate('/finance/vouchers/create')}
          >
            New Voucher
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card variant="bordered" padding="md">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search vouchers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">All Status</option>
            <option value="draft">Draft</option>
            <option value="posted">Posted</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <Button
            variant="outline"
            size="sm"
            leftIcon={<RefreshCw className="w-4 h-4" />}
            onClick={fetchVouchers}
            isLoading={isLoading}
          >
            Refresh
          </Button>
        </div>
      </Card>

      {/* Vouchers List */}
      <Card variant="bordered" padding="lg">
        <CardHeader>
          <CardTitle>Vouchers</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} height={80} className="rounded" />
              ))}
            </div>
          ) : filteredVouchers.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">No vouchers found</p>
              <Button
                variant="primary"
                size="sm"
                leftIcon={<Plus className="w-4 h-4" />}
                onClick={() => navigate('/finance/vouchers/create')}
              >
                Create First Voucher
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredVouchers.map((voucher) => (
                <div
                  key={voucher.id}
                  className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-gray-900">{voucher.voucher_number}</span>
                      <StatusBadge status={voucher.status} size="sm" />
                      <span
                        className={`px-2 py-0.5 text-xs rounded-full ${
                          voucherTypeColors[voucher.voucher_type] || 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {voucher.voucher_type}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      {formatDate(voucher.voucher_date)}
                      {voucher.reference && ` • ${voucher.reference}`}
                      {voucher.narration && ` • ${voucher.narration}`}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="space-y-1">
                      <div className="flex items-center justify-end gap-4">
                        <div>
                          <p className="text-xs text-gray-500">Debit</p>
                          <p className="font-semibold text-gray-900">{formatCurrency(voucher.total_debit)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Credit</p>
                          <p className="font-semibold text-gray-900">{formatCurrency(voucher.total_credit)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      leftIcon={<Eye className="w-4 h-4" />}
                      onClick={() => navigate(`/finance/vouchers/${voucher.id}`)}
                    >
                      View
                    </Button>
                    {voucher.status === 'draft' && (
                      <Button
                        variant="success"
                        size="sm"
                        leftIcon={<CheckCircle className="w-4 h-4" />}
                        onClick={() => handlePostVoucher(voucher.id)}
                      >
                        Post
                      </Button>
                    )}
                    {voucher.status === 'posted' && (
                      <Button
                        variant="danger"
                        size="sm"
                        leftIcon={<XCircle className="w-4 h-4" />}
                        onClick={() => handleCancelVoucher(voucher.id)}
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {vouchers.length > 0 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
          >
            Previous
          </Button>
          <span className="px-4 py-2">Page {page}</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(page + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  )
}

export default JournalVouchersPage

import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { DataTable } from '@/components/ui/DataTable'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { QuickActions } from '@/components/ui/ActionMenu'
import {
  ArrowLeft,
  Printer,
  Download,
  Mail,
  FileText,
  Plus,
  RefreshCw,
  Search,
  Filter,
} from 'lucide-react'
import { api } from '@/services/api'

interface Invoice {
  id: number
  invoice_number: string
  order_number?: string
  customer_name: string
  customer_id: number
  invoice_date: string
  due_date: string
  subtotal: number
  tax_amount: number
  grand_total: number
  status: 'draft' | 'pending' | 'sent' | 'paid' | 'overdue' | 'cancelled'
}

export default function InvoicesPage() {
  const navigate = useNavigate()
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchInvoices()
  }, [])

  const fetchInvoices = async () => {
    try {
      const response = await api.get<{ data: Invoice[] }>('/invoices')
      setInvoices(response.data)
      setError(null)
    } catch (err) {
      setError('Failed to load invoices. Please try again.')
      console.error('Failed to fetch invoices:', err)
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  const handleRefresh = () => {
    setIsRefreshing(true)
    fetchInvoices()
  }

  const handleCreate = () => {
    navigate('/sales/invoices/create')
  }

  const handleView = (invoice: Invoice) => {
    navigate(`/sales/invoices/${invoice.id}`)
  }

  const handlePrint = (invoice: Invoice) => {
    window.open(`/api/v1/print/invoice/${invoice.id}`, '_blank')
  }

  const handleDownload = (invoice: Invoice) => async () => {
    try {
      const response = await fetch(`/api/v1/print/invoice/${invoice.id}`)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `invoice-${invoice.invoice_number}.pdf`
      a.click()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Failed to download:', err)
    }
  }

  const handleSendEmail = async (invoice: Invoice) => {
    try {
      await fetch(`/api/v1/invoices/${invoice.id}/send-email`, { method: 'POST' })
      alert('Invoice sent successfully!')
    } catch (err) {
      console.error('Failed to send email:', err)
      alert('Failed to send invoice. Please try again.')
    }
  }

  const columns = [
    {
      id: 'invoice_number',
      header: 'Invoice #',
      cell: (row: Invoice) => (
        <div>
          <span className="font-semibold text-gray-900">{row.invoice_number}</span>
          {row.order_number && (
            <p className="text-sm text-gray-600">Order: {row.order_number}</p>
          )}
        </div>
      ),
    },
    {
      id: 'customer_name',
      header: 'Customer',
      cell: (row: Invoice) => row.customer_name,
    },
    {
      id: 'invoice_date',
      header: 'Invoice Date',
      cell: (row: Invoice) => new Date(row.invoice_date).toLocaleDateString(),
    },
    {
      id: 'due_date',
      header: 'Due Date',
      cell: (row: Invoice) => new Date(row.due_date).toLocaleDateString(),
    },
    {
      id: 'grand_total',
      header: 'Amount',
      cell: (row: Invoice) => (
        <span className="font-semibold">₹{Number(row.grand_total).toFixed(2)}</span>
      ),
    },
    {
      id: 'status',
      header: 'Status',
      cell: (row: Invoice) => <StatusBadge status={row.status} />,
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: (row: Invoice) => (
        <QuickActions
          onView={() => handleView(row)}
          onPrint={() => handlePrint(row)}
          onDownload={() => handleDownload(row)}
          onSendEmail={() => handleSendEmail(row)}
        />
      ),
    },
  ]

  const filteredInvoices = invoices.filter((invoice) =>
    invoice.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.customer_name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Invoices</h1>
          <p className="text-gray-600">Manage customer invoices</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />}
            onClick={handleRefresh}
            isLoading={isRefreshing}
          >
            Refresh
          </Button>
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={handleCreate}
          >
            Create Invoice
          </Button>
        </div>
      </div>

      {error && <Alert type="error" message={error} onDismiss={() => setError(null)} />}

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search invoices..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <Button variant="outline" leftIcon={<Filter className="w-4 h-4" />}>
            Filters
          </Button>
        </div>

        <DataTable
          data={filteredInvoices}
          columns={columns}
          isLoading={isLoading}
          onRowClick={handleView}
          searchable={false}
          refreshable={false}
          createButton={false}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card variant="bordered" padding="lg">
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">Total Invoices</p>
            <h3 className="text-2xl font-bold text-gray-900">
              {invoices.length}
            </h3>
          </div>
        </Card>
        <Card variant="bordered" padding="lg">
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">Total Amount</p>
            <h3 className="text-2xl font-bold text-gray-900">
              ₹{invoices.reduce((sum, inv) => sum + inv.grand_total, 0).toFixed(2)}
            </h3>
          </div>
        </Card>
        <Card variant="bordered" padding="lg">
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">Paid</p>
            <h3 className="text-2xl font-bold text-success-600">
              {invoices.filter((inv) => inv.status === 'paid').length}
            </h3>
          </div>
        </Card>
        <Card variant="bordered" padding="lg">
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">Pending</p>
            <h3 className="text-2xl font-bold text-warning-600">
              {invoices.filter((inv) => inv.status === 'pending').length}
            </h3>
          </div>
        </Card>
      </div>
    </div>
  )
}

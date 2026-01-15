import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { DataTable } from '@/components/ui/DataTable'
import { StatusBadge } from '@/components/ui/StatusBadge'
import {
  ArrowLeft,
  Package,
  ArrowUpRight,
  ArrowDownLeft,
  Plus,
  RefreshCw,
  Search,
  Filter,
} from 'lucide-react'
import { formatIndianNumber, formatDate } from '@/utils'

interface Movement {
  id: number
  movement_number: string
  movement_type: 'receipt' | 'issue' | 'transfer_in' | 'transfer_out' | 'adjustment' | 'production_receipt' | 'production_consumption' | 'return'
  item_id: number
  item_code: string
  item_name: string
  quantity: number
  uom: string
  balance: number
  movement_date: string
  reference?: string
  source_warehouse?: string
  destination_warehouse?: string
  performed_by?: string
  approved_by?: string
  notes?: string
}

export default function StockMovementsPage() {
  const navigate = useNavigate()
  const [movements, setMovements] = useState<Movement[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState<string>('all')
  const [selectedPeriod, setSelectedPeriod] = useState<string>('30')

  useEffect(() => {
    fetchMovements()
  }, [])

  const fetchMovements = async () => {
    try {
      const params = new URLSearchParams()
      if (selectedType !== 'all') params.append('type', selectedType)
      if (selectedPeriod !== '30') params.append('period', selectedPeriod)
      if (searchTerm) params.append('search', searchTerm)

      const response = await fetch(`/api/v1/stock-movements?${params.toString()}`)
      const data = await response.json()
      if (data.success) {
        setMovements(data.data)
        setError(null)
      } else {
        setError(data.message || 'Failed to load movements')
      }
    } catch (err) {
      setError('Failed to load movements. Please try again.')
      console.error('Failed to fetch movements:', err)
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  const handleRefresh = () => {
    setIsRefreshing(true)
    fetchMovements()
  }

  const handleCreate = () => {
    navigate('/inventory/movements/create')
  }

  const handleView = (movement: Movement) => {
    navigate(`/inventory/movements/${movement.id}`)
  }

  const getMovementTypeIcon = (type: string) => {
    switch (type) {
      case 'receipt':
      case 'transfer_in':
        return <ArrowUpRight className="w-5 h-5 text-success-600" />
      case 'issue':
      case 'transfer_out':
        return <ArrowDownLeft className="w-5 h-5 text-error-600" />
      case 'production_receipt':
        return <Package className="w-5 h-5 text-primary-600" />
      case 'production_consumption':
      case 'adjustment':
        return <Package className="w-5 h-5 text-warning-600" />
      case 'return':
        return <Package className="w-5 h-5 text-info-600" />
      default:
        return <Package className="w-5 h-5 text-gray-600" />
    }
  }

  const getMovementTypeLabel = (type: string) => {
    switch (type) {
      case 'receipt': return 'Receipt'
      case 'issue': return 'Issue'
      case 'transfer_in': return 'Transfer In'
      case 'transfer_out': return 'Transfer Out'
      case 'production_receipt': return 'Production Receipt'
      case 'production_consumption': return 'Production Consumption'
      case 'adjustment': return 'Adjustment'
      case 'return': return 'Return'
      default: return type
    }
  }

  const columns = [
    {
      id: 'movement_number',
      header: 'Movement #',
      cell: (row: Movement) => (
        <div className="flex items-center gap-2">
          {getMovementTypeIcon(row.movement_type)}
          <span className="font-semibold">{row.movement_number}</span>
        </div>
      ),
    },
    {
      id: 'item_name',
      header: 'Item',
      cell: (row: Movement) => (
        <div>
          <p className="font-semibold text-gray-900">{row.item_name}</p>
          <p className="text-sm text-gray-600">{row.item_code}</p>
        </div>
      ),
    },
    {
      id: 'movement_type',
      header: 'Type',
      cell: (row: Movement) => getMovementTypeLabel(row.movement_type),
    },
    {
      id: 'quantity',
      header: 'Quantity',
      cell: (row: Movement) => (
        <span className={`font-semibold ${
          ['issue', 'transfer_out'].includes(row.movement_type)
            ? 'text-error-600' :
            ['receipt', 'transfer_in'].includes(row.movement_type)
            ? 'text-success-600' :
            'text-gray-700'
        }`}>
          {row.movement_type === 'receipt' || row.movement_type === 'transfer_in' ? '+' : '-'}
          {formatIndianNumber(row.quantity)} {row.uom}
        </span>
      ),
    },
    {
      id: 'balance',
      header: 'Balance',
      cell: (row: Movement) => (
        <span className={`font-semibold ${
          row.balance < 0 ? 'text-error-600' : 'text-gray-700'
        }`}>
          {formatIndianNumber(row.balance)} {row.uom}
        </span>
      ),
    },
    {
      id: 'movement_date',
      header: 'Date',
      cell: (row: Movement) => formatDate(row.movement_date),
    },
    {
      id: 'performed_by',
      header: 'Performed By',
      cell: (row: Movement) => row.performed_by || 'System',
    },
    {
      id: 'reference',
      header: 'Reference',
      cell: (row: Movement) => row.reference || '-',
    },
  ]

  const filteredMovements = movements.filter((movement) =>
    movement.movement_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    movement.item_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    movement.item_code.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const summaryCards = [
    {
      title: 'Total Movements',
      value: movements.length,
      icon: <Package className="w-6 h-6 text-primary-600" />,
      color: 'bg-primary-50',
    },
    {
      title: 'Total Receipts',
      value: movements.filter((m) => m.movement_type === 'receipt').length,
      icon: <ArrowUpRight className="w-6 h-6 text-success-600" />,
      color: 'bg-success-50',
    },
    {
      title: 'Total Issues',
      value: movements.filter((m) => m.movement_type === 'issue').length,
      icon: <ArrowDownLeft className="w-6 h-6 text-error-600" />,
      color: 'bg-error-50',
    },
    {
      title: 'Net Movements',
      value: movements.filter((m) => ['receipt', 'production_receipt'].includes(m.movement_type)).length -
            movements.filter((m) => ['issue', 'production_consumption'].includes(m.movement_type)).length,
      icon: <Package className="w-6 h-6 text-info-600" />,
      color: 'bg-info-50',
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Stock Movements</h1>
          <p className="text-gray-600">Track all stock movements across warehouses</p>
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
            Record Movement
          </Button>
        </div>
      </div>

      {error && <Alert type="error" message={error} onDismiss={() => setError(null)} />}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {summaryCards.map((card, index) => (
          <Card
            key={index}
            variant="bordered"
            padding="lg"
            className={card.color}
          >
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">{card.title}</p>
              <h3 className="text-2xl font-bold text-gray-900">
                {card.value}
              </h3>
            </div>
          </Card>
        ))}
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search movements..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <Button variant="outline" leftIcon={<Filter className="w-4 h-4" />}>
            Filters
          </Button>
        </div>

        <div className="flex items-center gap-4">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="all">All Types</option>
            <option value="receipt">Receipts</option>
            <option value="issue">Issues</option>
            <option value="transfer_in">Transfers In</option>
            <option value="transfer_out">Transfers Out</option>
            <option value="adjustment">Adjustments</option>
            <option value="production_receipt">Production Receipts</option>
            <option value="production_consumption">Production Consumption</option>
            <option value="return">Returns</option>
          </select>
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="7">Last 7 Days</option>
            <option value="30">Last 30 Days</option>
            <option value="90">Last 90 Days</option>
            <option value="365">Last Year</option>
          </select>
        </div>

        <DataTable
          data={filteredMovements}
          columns={columns}
          isLoading={isLoading}
          onRowClick={handleView}
          searchable={false}
          refreshable={false}
          createButton={false}
        />
      </div>
    </div>
  )
}

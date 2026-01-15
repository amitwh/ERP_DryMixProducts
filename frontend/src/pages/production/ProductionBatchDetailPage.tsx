import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { QuickActions } from '@/components/ui/ActionMenu'
import {
  ArrowLeft,
  Printer,
  Download,
  Package,
  Calendar,
  Clock,
  Scale,
  Activity,
  User,
} from 'lucide-react'
import { formatIndianNumber, formatDate } from '@/utils'

interface ProductionBatch {
  id: number
  batch_number: string
  production_order_id: number
  order_number: string
  product_id: number
  product_name: string
  product_code: string
  status: 'pending' | 'mixing' | 'discharging' | 'completed' | 'on_hold'
  batch_quantity: number
  produced_quantity: number
  uom: string
  batch_date: string
  shift?: string
  machine_id?: number
  machine_name?: string
  operator_id?: number
  operator_name?: string
  started_at?: string
  completed_at?: string
  remarks?: string
}

interface Consumption {
  material_id: number
  material_name: string
  material_code: string
  planned_quantity: number
  actual_quantity: number
  uom: string
  variance: number
  variance_percentage: number
}

export default function ProductionBatchDetailPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [batch, setBatch] = useState<ProductionBatch | null>(null)
  const [consumption, setConsumption] = useState<Consumption[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchBatch()
  }, [id])

  const fetchBatch = async () => {
    try {
      const response = await fetch(`/api/v1/production-batches/${id}`)
      const data = await response.json()
      if (data.success) {
        setBatch(data.data)
        setConsumption(data.data.consumption || [])
      } else {
        setError(data.message || 'Failed to load batch')
      }
    } catch (err) {
      setError('Failed to load batch. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handlePrint = async () => {
    window.open(`/api/v1/print/production-batch/${id}`, '_blank')
  }

  const handleDownload = async () => {
    try {
      const response = await fetch(`/api/v1/print/production-batch/${id}`)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `batch-${batch?.batch_number}.pdf`
      a.click()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Failed to download:', err)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-t-2 border-primary-600" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto mt-8">
        <Alert type="error" message={error} />
        <div className="mt-4">
          <Button variant="outline" onClick={() => navigate('/production/batches')}>
            Back to Batches
          </Button>
        </div>
      </div>
    )
  }

  if (!batch) return null

  const progressPercentage = batch.batch_quantity > 0
    ? ((batch.produced_quantity / batch.batch_quantity) * 100).toFixed(1)
    : '0'

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<ArrowLeft className="w-4 h-4" />}
            onClick={() => navigate('/production/batches')}
          >
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Batch {batch.batch_number}
            </h1>
            <p className="text-gray-600">
              Order: {batch.order_number}
            </p>
          </div>
        </div>
        <QuickActions
          onView={() => { }}
          onPrint={handlePrint}
          onDownload={handleDownload}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card variant="bordered" padding="lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Batch Information
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Product</p>
                <p className="font-semibold text-gray-900">{batch.product_name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Product Code</p>
                <p className="font-semibold text-gray-900">{batch.product_code}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Batch Quantity</p>
                <p className="font-semibold text-gray-900">{formatIndianNumber(batch.batch_quantity)} {batch.uom}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Produced</p>
                <p className="font-semibold text-primary-600">{formatIndianNumber(batch.produced_quantity)} {batch.uom}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Batch Date</p>
                <p className="font-semibold text-gray-900">{formatDate(batch.batch_date)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Shift</p>
                <p className="font-semibold text-gray-900">{batch.shift || 'Not Assigned'}</p>
              </div>
            </div>

            <div className="mt-4">
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Progress</span>
                <span className="font-semibold text-gray-900">{progressPercentage}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-primary-600 h-2.5 rounded-full transition-all duration-500"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>
          </Card>

          <Card variant="bordered" padding="lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Material Consumption
            </h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Material
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      Planned
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      Actual
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      Variance
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {consumption.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                        No consumption data available
                      </td>
                    </tr>
                  ) : (
                    consumption.map((item, index) => (
                      <tr key={index}>
                        <td className="px-4 py-4">
                          <div>
                            <p className="font-semibold text-gray-900">{item.material_name}</p>
                            <p className="text-sm text-gray-600">{item.material_code}</p>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-right">
                          {formatIndianNumber(item.planned_quantity)} {item.uom}
                        </td>
                        <td className="px-4 py-4 text-right">
                          {formatIndianNumber(item.actual_quantity)} {item.uom}
                        </td>
                        <td className={`px-4 py-4 text-right font-semibold ${
                          Math.abs(item.variance_percentage) > 10 ? 'text-error-600' :
                          Math.abs(item.variance_percentage) > 5 ? 'text-warning-600' : 'text-success-600'
                        }`}>
                          {item.variance > 0 ? '+' : ''}{formatIndianNumber(item.variance)} {item.uom}
                          <span className="text-xs text-gray-600 block">
                            ({item.variance > 0 ? '+' : ''}{item.variance_percentage.toFixed(1)}%)
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card variant="bordered" padding="lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Batch Status
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Status</span>
                <StatusBadge status={batch.status} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Machine</span>
                <span className="font-semibold">{batch.machine_name || 'Not Assigned'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Operator</span>
                <span className="font-semibold">{batch.operator_name || 'Not Assigned'}</span>
              </div>
              {batch.started_at && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Started At</span>
                  <span className="font-semibold">{formatDate(batch.started_at)}</span>
                </div>
              )}
              {batch.completed_at && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Completed At</span>
                  <span className="font-semibold">{formatDate(batch.completed_at)}</span>
                </div>
              )}
            </div>
          </Card>

          {batch.remarks && (
            <Card variant="bordered" padding="lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Remarks
              </h3>
              <p className="text-gray-700">{batch.remarks}</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

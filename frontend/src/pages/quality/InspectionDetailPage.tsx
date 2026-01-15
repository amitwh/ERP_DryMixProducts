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
  CheckSquare,
  AlertTriangle,
  Image as ImageIcon,
  MapPin,
  Calendar,
  User,
  FileText,
} from 'lucide-react'
import { formatDate } from '@/utils'

interface Inspection {
  id: number
  inspection_number: string
  inspection_type: string
  inspection_date: string
  location?: string
  inspector_id?: number
  inspector_name?: string
  status: 'pending' | 'in_progress' | 'completed' | 'passed' | 'failed'
  total_items: number
  passed_items: number
  failed_items: number
  observations_count: number
  remarks?: string
  attachments?: string[]
  product_id?: number
  product_name?: string
  batch_id?: number
  batch_number?: string
}

interface ChecklistItem {
  id: number
  description: string
  category: string
  status: 'pass' | 'fail' | 'na'
  photo_evidence?: string
  remarks?: string
}

export default function InspectionDetailPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [inspection, setInspection] = useState<Inspection | null>(null)
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isPrinting, setIsPrinting] = useState(false)

  useEffect(() => {
    fetchInspection()
  }, [id])

  const fetchInspection = async () => {
    try {
      const response = await fetch(`/api/v1/inspections/${id}`)
      const data = await response.json()
      if (data.success) {
        setInspection(data.data)
        setChecklistItems(data.data.checklist_items || [])
      } else {
        setError(data.message || 'Failed to load inspection')
      }
    } catch (err) {
      setError('Failed to load inspection. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handlePrint = async () => {
    setIsPrinting(true)
    try {
      window.open(`/api/v1/print/inspection/${id}`, '_blank')
    } catch (err) {
      console.error('Failed to print:', err)
    } finally {
      setIsPrinting(false)
    }
  }

  const handleDownload = async () => {
    try {
      const response = await fetch(`/api/v1/print/inspection/${id}`)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `inspection-${id}.pdf`
      a.click()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Failed to download:', err)
    }
  }

  const handleComplete = async () => {
    try {
      await fetch(`/api/v1/inspections/${id}/complete`, { method: 'POST' })
      alert('Inspection marked as completed!')
      fetchInspection()
    } catch (err) {
      console.error('Failed to complete:', err)
      alert('Failed to complete inspection. Please try again.')
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
          <Button variant="outline" onClick={() => navigate('/quality/inspections')}>
            Back to Inspections
          </Button>
        </div>
      </div>
    )
  }

  if (!inspection) return null

  const passRate = inspection.total_items > 0
    ? ((inspection.passed_items / inspection.total_items) * 100).toFixed(1)
    : '0'

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<ArrowLeft className="w-4 h-4" />}
            onClick={() => navigate('/quality/inspections')}
          >
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Inspection {inspection.inspection_number}
            </h1>
            <p className="text-gray-600">
              {inspection.inspection_type} on {formatDate(inspection.inspection_date)}
            </p>
          </div>
        </div>
        <QuickActions
          onView={() => { /* Already viewing */ }}
          onPrint={handlePrint}
          onDownload={handleDownload}
        />
      </div>

      {inspection.status === 'pending' && (
        <Alert type="warning" message="This inspection is pending completion." />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card variant="bordered" padding="lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Inspection Details
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Inspection Type</p>
                <p className="font-semibold text-gray-900">{inspection.inspection_type}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Status</p>
                <StatusBadge status={inspection.status} />
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Inspection Date</p>
                <p className="font-semibold text-gray-900">{formatDate(inspection.inspection_date)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Inspector</p>
                <p className="font-semibold text-gray-900">{inspection.inspector_name || 'Not Assigned'}</p>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-gray-600 mb-1">Location</p>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <p className="font-semibold text-gray-900">{inspection.location || 'N/A'}</p>
                </div>
              </div>
              {(inspection.product_name || inspection.batch_number) && (
                <div className="col-span-2">
                  <p className="text-sm text-gray-600 mb-1">Reference</p>
                  <p className="font-semibold text-gray-900">
                    {inspection.product_name && `Product: ${inspection.product_name}`}
                    {inspection.batch_number && ` | Batch: ${inspection.batch_number}`}
                  </p>
                </div>
              )}
            </div>
          </Card>

          <Card variant="bordered" padding="lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Checklist Items
            </h3>
            <div className="space-y-3">
              {checklistItems.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No checklist items available
                </div>
              ) : (
                checklistItems.map((item, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border ${
                      item.status === 'pass' ? 'border-success-200 bg-success-50' :
                      item.status === 'fail' ? 'border-error-200 bg-error-50' :
                      'border-gray-200 bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-xs font-medium uppercase ${
                            item.status === 'pass' ? 'text-success-700' :
                            item.status === 'fail' ? 'text-error-700' :
                            'text-gray-600'
                          }`}>
                            {item.category}
                          </span>
                          <span className="text-sm text-gray-600">#{index + 1}</span>
                        </div>
                        <p className="font-medium text-gray-900 mb-1">{item.description}</p>
                        {item.remarks && (
                          <p className="text-sm text-gray-600 italic">{item.remarks}</p>
                        )}
                      </div>
                      <div className="ml-4">
                        {item.status === 'pass' && (
                          <CheckSquare className="w-6 h-6 text-success-600" />
                        )}
                        {item.status === 'fail' && (
                          <AlertTriangle className="w-6 h-6 text-error-600" />
                        )}
                        {item.status === 'na' && (
                          <div className="w-6 h-6 rounded-full border-2 border-gray-300" />
                        )}
                      </div>
                    </div>
                    {item.photo_evidence && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <ImageIcon className="w-4 h-4" />
                          Photo evidence available
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </Card>

          {inspection.remarks && (
            <Card variant="bordered" padding="lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Remarks
              </h3>
              <p className="text-gray-700">{inspection.remarks}</p>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card variant="bordered" padding="lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Inspection Summary
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Items</span>
                <span className="font-semibold text-gray-900 text-xl">{inspection.total_items}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-success-600">Passed</span>
                <span className="font-semibold text-success-600 text-xl">{inspection.passed_items}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-error-600">Failed</span>
                <span className="font-semibold text-error-600 text-xl">{inspection.failed_items}</span>
              </div>
              <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                <span className="text-gray-600">Pass Rate</span>
                <span className={`font-bold text-2xl ${
                  parseFloat(passRate) >= 95 ? 'text-success-600' :
                  parseFloat(passRate) >= 80 ? 'text-warning-600' :
                  'text-error-600'
                }`}>
                  {passRate}%
                </span>
              </div>
            </div>
          </Card>

          <Card variant="bordered" padding="lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Actions
            </h3>
            <div className="space-y-3">
              <Button
                variant="outline"
                className="w-full"
                leftIcon={<Printer className="w-4 h-4" />}
                onClick={handlePrint}
                isLoading={isPrinting}
              >
                Print Report
              </Button>
              <Button
                variant="outline"
                className="w-full"
                leftIcon={<Download className="w-4 h-4" />}
                onClick={handleDownload}
              >
                Download PDF
              </Button>
              {inspection.status === 'in_progress' && (
                <Button
                  variant="primary"
                  className="w-full"
                  leftIcon={<CheckSquare className="w-4 h-4" />}
                  onClick={handleComplete}
                >
                  Complete Inspection
                </Button>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

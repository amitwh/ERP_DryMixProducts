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
  AlertTriangle,
  FileText,
  Calendar,
  MapPin,
  User,
  TrendingUp,
  Search,
  HelpCircle,
} from 'lucide-react'
import { formatDate } from '@/utils'

interface NCR {
  id: number
  ncr_number: string
  title: string
  description: string
  category: string
  severity: 'minor' | 'major' | 'critical'
  source: string
  detected_by?: string
  detected_date: string
  product_id?: number
  product_name?: string
  batch_id?: number
  batch_number?: string
  quantity_affected?: number
  status: 'open' | 'investigation' | 'corrective_action' | 'preventive_action' | 'verification' | 'closed'
  root_cause?: string
  corrective_action?: string
  corrective_responsible?: string
  corrective_target_date?: string
  corrective_actual_date?: string
  preventive_action?: string
  preventive_responsible?: string
  preventive_target_date?: string
  preventive_actual_date?: string
  verification?: string
  verification_result?: 'effective' | 'not_effective' | 'needs_improvement'
  verified_by?: string
  verification_date?: string
  lessons_learned?: string
}

export default function NCRDetailPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [ncr, setNCR] = useState<NCR | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isPrinting, setIsPrinting] = useState(false)

  useEffect(() => {
    fetchNCR()
  }, [id])

  const fetchNCR = async () => {
    try {
      const response = await fetch(`/api/v1/ncrs/${id}`)
      const data = await response.json()
      if (data.success) {
        setNCR(data.data)
      } else {
        setError(data.message || 'Failed to load NCR')
      }
    } catch (err) {
      setError('Failed to load NCR. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handlePrint = async () => {
    setIsPrinting(true)
    try {
      window.open(`/api/v1/print/ncr/${id}`, '_blank')
    } catch (err) {
      console.error('Failed to print:', err)
    } finally {
      setIsPrinting(false)
    }
  }

  const handleDownload = async () => {
    try {
      const response = await fetch(`/api/v1/print/ncr/${id}`)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `ncr-${ncr?.ncr_number}.pdf`
      a.click()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Failed to download:', err)
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-error-100 text-error-800 border-error-200'
      case 'major': return 'bg-warning-100 text-warning-800 border-warning-200'
      case 'minor': return 'bg-info-100 text-info-800 border-info-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-error-100 text-error-800 border-error-200'
      case 'investigation': return 'bg-warning-100 text-warning-800 border-warning-200'
      case 'corrective_action': return 'bg-info-100 text-info-800 border-info-200'
      case 'preventive_action': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'verification': return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'closed': return 'bg-success-100 text-success-800 border-success-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
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
          <Button variant="outline" onClick={() => navigate('/quality/ncrs')}>
            Back to NCRs
          </Button>
        </div>
      </div>
    )
  }

  if (!ncr) return null

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<ArrowLeft className="w-4 h-4" />}
            onClick={() => navigate('/quality/ncrs')}
          >
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              NCR {ncr.ncr_number}
            </h1>
            <p className="text-gray-600">
              {ncr.title}
            </p>
          </div>
        </div>
        <QuickActions
          onView={() => { /* Already viewing */ }}
          onPrint={handlePrint}
          onDownload={handleDownload}
        />
      </div>

      <div className={`p-4 rounded-lg border mb-6 ${getSeverityColor(ncr.severity)}`}>
        <div className="flex items-center gap-4">
          <AlertTriangle className="w-8 h-8" />
          <div>
            <p className="text-sm font-medium uppercase">Severity: {ncr.severity}</p>
            <p className="text-xs text-gray-700">Category: {ncr.category}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card variant="bordered" padding="lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              NCR Information
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Title</p>
                <p className="font-semibold text-gray-900">{ncr.title}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Description</p>
                <p className="text-gray-700">{ncr.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Detected By</p>
                  <p className="font-semibold text-gray-900">{ncr.detected_by || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Detected Date</p>
                  <p className="font-semibold text-gray-900">{formatDate(ncr.detected_date)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Source</p>
                  <p className="font-semibold text-gray-900">{ncr.source}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Status</p>
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(ncr.status)}`}>
                    {ncr.status.replace('_', ' ')}
                  </div>
                </div>
              </div>
              {(ncr.product_name || ncr.batch_number) && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Product</p>
                    <p className="font-semibold text-gray-900">{ncr.product_name || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Batch</p>
                    <p className="font-semibold text-gray-900">{ncr.batch_number || 'N/A'}</p>
                  </div>
                </div>
              )}
            </div>
          </Card>

          <Card variant="bordered" padding="lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Root Cause Analysis
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Root Cause</p>
                <p className="text-gray-700">{ncr.root_cause || 'Not documented'}</p>
              </div>
              {ncr.root_cause && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Search className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-blue-900 font-medium mb-1">5 Whys Analysis</p>
                      <p className="text-sm text-blue-800">
                        Root cause was identified using the 5 Whys methodology to ensure comprehensive understanding.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Card>

          <Card variant="bordered" padding="lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Corrective & Preventive Actions
            </h3>
            <div className="space-y-4">
              <div className="border-l-4 border-warning-400 pl-4">
                <h4 className="font-medium text-gray-900 mb-2">Corrective Action</h4>
                <p className="text-gray-700 mb-2">{ncr.corrective_action || 'Not defined'}</p>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Responsible</p>
                    <p className="font-medium">{ncr.corrective_responsible || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Target Date</p>
                    <p className="font-medium">{ncr.corrective_target_date ? formatDate(ncr.corrective_target_date) : 'N/A'}</p>
                  </div>
                </div>
              </div>
              <div className="border-l-4 border-blue-400 pl-4">
                <h4 className="font-medium text-gray-900 mb-2">Preventive Action</h4>
                <p className="text-gray-700 mb-2">{ncr.preventive_action || 'Not defined'}</p>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Responsible</p>
                    <p className="font-medium">{ncr.preventive_responsible || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Target Date</p>
                    <p className="font-medium">{ncr.preventive_target_date ? formatDate(ncr.preventive_target_date) : 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <Card variant="bordered" padding="lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Verification & Lessons
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Verification</p>
                <p className="text-gray-700">{ncr.verification || 'Not verified'}</p>
              </div>
              {ncr.verification_result && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">Verification Result</p>
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    ncr.verification_result === 'effective' ? 'bg-success-100 text-success-800' :
                    ncr.verification_result === 'not_effective' ? 'bg-error-100 text-error-800' :
                    'bg-warning-100 text-warning-800'
                  }`}>
                    {ncr.verification_result.replace('_', ' ')}
                  </div>
                </div>
              )}
              {ncr.verified_by && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Verified By</p>
                    <p className="font-medium">{ncr.verified_by}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Verification Date</p>
                    <p className="font-medium">{ncr.verification_date ? formatDate(ncr.verification_date) : 'N/A'}</p>
                  </div>
                </div>
              )}
              {ncr.lessons_learned && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">Lessons Learned</p>
                  <p className="text-gray-700">{ncr.lessons_learned}</p>
                </div>
              )}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card variant="bordered" padding="lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Quick Actions
            </h3>
            <div className="space-y-3">
              <Button
                variant="outline"
                className="w-full"
                leftIcon={<Printer className="w-4 h-4" />}
                onClick={handlePrint}
                isLoading={isPrinting}
              >
                Print NCR
              </Button>
              <Button
                variant="outline"
                className="w-full"
                leftIcon={<Download className="w-4 h-4" />}
                onClick={handleDownload}
              >
                Download PDF
              </Button>
            </div>
          </Card>

          <Card variant="bordered" padding="lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Process Flow
            </h3>
            <div className="space-y-3">
              {['open', 'investigation', 'corrective_action', 'preventive_action', 'verification', 'closed'].map((status, index) => (
                <div
                  key={status}
                  className={`flex items-center gap-3 p-3 rounded-lg border ${
                    status === ncr.status ? 'border-primary-400 bg-primary-50' : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    index === 0 ? 'bg-error-600 text-white' :
                    index === 1 ? 'bg-warning-600 text-white' :
                    index === 2 ? 'bg-info-600 text-white' :
                    index === 3 ? 'bg-blue-600 text-white' :
                    index === 4 ? 'bg-purple-600 text-white' :
                    'bg-success-600 text-white'
                  }`}>
                    {index + 1}
                  </div>
                  <span className="text-sm font-medium capitalize text-gray-700">
                    {status.replace('_', ' ')}
                  </span>
                  {status === ncr.status && (
                    <TrendingUp className="w-4 h-4 text-primary-600" />
                  )}
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

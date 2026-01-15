import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { api } from '@/services/api'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { Skeleton } from '@/components/ui/Loading'
import { Alert } from '@/components/ui/Alert'
import { Search, Plus, Filter, Award, Calendar, Download, Printer, QRCode } from 'lucide-react'
import { formatDate, formatNumber } from '@/utils'

interface Certificate {
  id: number
  certificate_number: string
  inspection_id: number
  inspection_number: string
  product_id: number
  product_name: string
  product_code: string
  batch_number?: string
  certificate_type: string
  standard: string
  test_date: string
  expiry_date?: string
  status: 'draft' | 'issued' | 'expired' | 'revoked'
  issued_by?: string
  issued_date?: string
  qr_code_url?: string
  created_at: string
}

export default function CertificatesPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'issued' | 'expired' | 'revoked'>('all')
  const [typeFilter, setTypeFilter] = useState('')

  useEffect(() => {
    fetchCertificates()
  }, [statusFilter, typeFilter])

  const fetchCertificates = async () => {
    try {
      setIsLoading(true)
      const response = await api.get<{ data: Certificate[] }>('/qa/certificates', {
        params: {
          organization_id: user?.organizationId,
          status: statusFilter === 'all' ? undefined : statusFilter,
          certificate_type: typeFilter || undefined,
        },
      })
      setCertificates(response.data.data || [])
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch certificates')
    } finally {
      setIsLoading(false)
    }
  }

  const filteredCertificates = certificates.filter(cert => {
    const matchesSearch =
      searchTerm === '' ||
      cert.certificate_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cert.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cert.product_code.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  const issuedCount = certificates.filter(c => c.status === 'issued').length
  const expiredCount = certificates.filter(c => c.status === 'expired').length
  const expiringSoonCount = certificates.filter(c =>
    c.expiry_date && c.status === 'issued' &&
    new Date(c.expiry_date) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  ).length

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      draft: 'bg-gray-100 text-gray-800',
      issued: 'bg-green-100 text-green-800',
      expired: 'bg-red-100 text-red-800',
      revoked: 'bg-orange-100 text-orange-800',
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const handleViewQRCode = (certificate: Certificate) => {
    if (certificate.qr_code_url) {
      window.open(certificate.qr_code_url, '_blank')
    }
  }

  const handleDownloadCertificate = async (certificateId: number) => {
    try {
      const response = await api.get(`/qa/certificates/${certificateId}/download`, {
        responseType: 'blob',
      })

      const url = window.URL.createObjectURL(new Blob([response.data]))
      const a = document.createElement('a')
      a.href = url
      a.download = `certificate-${certificateId}.pdf`
      a.click()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Failed to download certificate:', err)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quality Certificates</h1>
          <p className="text-gray-600">Digital certificates and compliance documents</p>
        </div>
        <Button
          variant="primary"
          size="sm"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => navigate('/qa/inspections/create')}
        >
          Create Certificate
        </Button>
      </div>

      {error && <Alert type="error" message={error} onDismiss={() => setError(null)} />}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card variant="bordered" padding="lg">
          <div className="text-center">
            <Award className="w-6 h-6 text-primary-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-600 mb-1">Total Certificates</p>
            <h3 className="text-2xl font-bold text-gray-900">{certificates.length}</h3>
          </div>
        </Card>
        <Card variant="bordered" padding="lg">
          <div className="text-center">
            <Award className="w-6 h-6 text-success-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-600 mb-1">Active</p>
            <h3 className="text-2xl font-bold text-success-600">{issuedCount}</h3>
          </div>
        </Card>
        <Card variant="bordered" padding="lg">
          <div className="text-center">
            <Calendar className="w-6 h-6 text-warning-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-600 mb-1">Expiring Soon</p>
            <h3 className="text-2xl font-bold text-warning-600">{expiringSoonCount}</h3>
          </div>
        </Card>
        <Card variant="bordered" padding="lg">
          <div className="text-center">
            <Award className="w-6 h-6 text-error-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-600 mb-1">Expired</p>
            <h3 className="text-2xl font-bold text-error-600">{expiredCount}</h3>
          </div>
        </Card>
      </div>

      <Card variant="bordered" padding="md">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="Search certificates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex items-center gap-2">
            {(['draft', 'issued', 'expired', 'revoked'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  statusFilter === status
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </Card>

      <Card variant="bordered" padding="lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Certificates ({filteredCertificates.length})
          </h3>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Filter className="w-4 h-4" />}
              onClick={() => setTypeFilter('')}
            >
              All Types
            </Button>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Download className="w-4 h-4" />}
              onClick={() => {
                const csvContent =
                  'data:text/csv;charset=utf-8,' +
                  'Certificate Number,Product,Type,Standard,Test Date,Expiry Date,Status,Issued Date\n' +
                  filteredCertificates
                    .map(c =>
                      `${c.certificate_number},"${c.product_name}",${c.certificate_type},${c.standard},${c.test_date},${c.expiry_date || '-'},${c.status},${c.issued_date || '-'}`
                    )
                    .join('\n')
                const link = document.createElement('a')
                link.setAttribute('href', encodeURI(csvContent))
                link.setAttribute('download', 'certificates.csv')
                document.body.appendChild(link)
                link.click()
                document.body.removeChild(link)
              }}
            >
              Export
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} height={120} className="rounded" />
            ))}
          </div>
        ) : filteredCertificates.length === 0 ? (
          <div className="text-center py-12">
            <Award className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">No certificates found</p>
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={() => navigate('/qa/inspections/create')}
            >
              Generate First Certificate
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Certificate</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Product</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Standard</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Test Date</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Expiry</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Status</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredCertificates.map((cert) => (
                  <tr key={cert.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-gray-900">{cert.certificate_number}</p>
                        <p className="text-sm text-gray-600">{cert.inspection_number}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-gray-900">{cert.product_name}</p>
                        <p className="text-sm text-gray-600">{cert.product_code}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-gray-900">{cert.certificate_type}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-gray-600">{cert.standard}</p>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <p className="text-sm text-gray-900">{formatDate(cert.test_date)}</p>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <p className={`text-sm ${
                        cert.expiry_date && new Date(cert.expiry_date) < new Date()
                          ? 'text-error-600 font-semibold'
                          : 'text-gray-900'
                      }`}>
                        {cert.expiry_date ? formatDate(cert.expiry_date) : '-'}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <StatusBadge status={cert.status} />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/qa/certificates/${cert.id}`)}
                        >
                          View
                        </Button>
                        {cert.qr_code_url && (
                          <Button
                            variant="outline"
                            size="sm"
                            leftIcon={<QRCode className="w-4 h-4" />}
                            onClick={() => handleViewQRCode(cert)}
                          />
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          leftIcon={<Download className="w-4 h-4" />}
                          onClick={() => handleDownloadCertificate(cert.id)}
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          leftIcon={<Printer className="w-4 h-4" />}
                          onClick={() => window.print()}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}

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
import { Search, Plus, Filter, FileText, Download, Printer, Eye, Trash2, Edit } from 'lucide-react'
import { formatDate, formatNumber } from '@/utils'

interface Document {
  id: number
  document_number: string
  document_type: string
  category: string
  title: string
  description: string
  file_name: string
  file_size: number
  file_type: string
  storage_path: string
  module: string
  reference_id?: number
  reference_type?: string
  version: number
  status: 'draft' | 'published' | 'archived'
  uploaded_by: string
  uploaded_at: string
  expiry_date?: string
  download_count: number
  tags?: string[]
}

export default function DocumentsPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [documents, setDocuments] = useState<Document[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [moduleFilter, setModuleFilter] = useState('')

  useEffect(() => {
    fetchDocuments()
  }, [categoryFilter, moduleFilter])

  const fetchDocuments = async () => {
    try {
      setIsLoading(true)
      const response = await api.get<{ data: Document[] }>('/documents', {
        params: {
          organization_id: user?.organizationId,
          category: categoryFilter || undefined,
          module: moduleFilter || undefined,
        },
      })
      setDocuments(response.data.data || [])
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch documents')
    } finally {
      setIsLoading(false)
    }
  }

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch =
      searchTerm === '' ||
      doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.document_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.file_name.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  const totalCount = documents.length
  const draftCount = documents.filter(d => d.status === 'draft').length
  const publishedCount = documents.filter(d => d.status === 'published').length
  const totalSize = documents.reduce((sum, d) => sum + d.file_size, 0)

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      draft: 'bg-gray-100 text-gray-800',
      published: 'bg-green-100 text-green-800',
      archived: 'bg-orange-100 text-orange-800',
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Documents</h1>
          <p className="text-gray-600">Organize and manage all documents</p>
        </div>
        <Button
          variant="primary"
          size="sm"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => navigate('/documents/upload')}
        >
          Upload Document
        </Button>
      </div>

      {error && <Alert type="error" message={error} onDismiss={() => setError(null)} />}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card variant="bordered" padding="lg">
          <div className="text-center">
            <FileText className="w-6 h-6 text-primary-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-600 mb-1">Total Documents</p>
            <h3 className="text-2xl font-bold text-gray-900">{totalCount}</h3>
          </div>
        </Card>
        <Card variant="bordered" padding="lg">
          <div className="text-center">
            <Eye className="w-6 h-6 text-success-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-600 mb-1">Published</p>
            <h3 className="text-2xl font-bold text-success-600">{publishedCount}</h3>
          </div>
        </Card>
        <Card variant="bordered" padding="lg">
          <div className="text-center">
            <Edit className="w-6 h-6 text-warning-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-600 mb-1">Drafts</p>
            <h3 className="text-2xl font-bold text-warning-600">{draftCount}</h3>
          </div>
        </Card>
        <Card variant="bordered" padding="lg">
          <div className="text-center">
            <Download className="w-6 h-6 text-blue-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-600 mb-1">Total Size</p>
            <h3 className="text-2xl font-bold text-blue-600">{formatFileSize(totalSize)}</h3>
          </div>
        </Card>
      </div>

      <Card variant="bordered" padding="md">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="Search documents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex items-center gap-2">
            <select
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="">All Categories</option>
              <option value="contracts">Contracts</option>
              <option value="invoices">Invoices</option>
              <option value="quality">Quality Documents</option>
              <option value="technical">Technical Specs</option>
              <option value="policies">Policies</option>
            </select>
            <select
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              value={moduleFilter}
              onChange={(e) => setModuleFilter(e.target.value)}
            >
              <option value="">All Modules</option>
              <option value="sales">Sales</option>
              <option value="procurement">Procurement</option>
              <option value="production">Production</option>
              <option value="quality">Quality</option>
              <option value="finance">Finance</option>
            </select>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Filter className="w-4 h-4" />}
              onClick={() => {
                setCategoryFilter('')
                setModuleFilter('')
              }}
            >
              Reset
            </Button>
          </div>
        </div>
      </Card>

      <Card variant="bordered" padding="lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Documents ({filteredDocuments.length})
          </h3>
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Download className="w-4 h-4" />}
            onClick={() => window.print()}
          >
            Export List
          </Button>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} height={120} className="rounded" />
            ))}
          </div>
        ) : filteredDocuments.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">No documents found</p>
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={() => navigate('/documents/upload')}
            >
              Upload First Document
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredDocuments.map((doc) => (
              <div
                key={doc.id}
                className="p-4 border rounded-lg hover:shadow-md transition-all border-gray-200"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-sm text-gray-600">{doc.document_number}</span>
                      <StatusBadge status={doc.status} />
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {doc.category}
                      </span>
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900">{doc.title}</h4>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-600">
                      v{doc.version}
                    </span>
                    <span className="text-sm text-gray-600">
                      {formatNumber(doc.download_count)} downloads
                    </span>
                  </div>
                </div>

                <p className="text-sm text-gray-600 mb-3">{doc.description}</p>

                <div className="grid grid-cols-4 gap-4 mb-3">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">File Name</p>
                    <p className="text-sm text-gray-900 truncate">{doc.file_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Size</p>
                    <p className="text-sm text-gray-900">{formatFileSize(doc.file_size)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Uploaded By</p>
                    <p className="text-sm text-gray-900">{doc.uploaded_by}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Uploaded At</p>
                    <p className="text-sm text-gray-900">{formatDate(doc.uploaded_at)}</p>
                  </div>
                </div>

                {doc.expiry_date && (
                  <div className="mb-3">
                    <p className="text-sm text-gray-600 mb-1">Expires On</p>
                    <p className={`text-sm ${
                      new Date(doc.expiry_date) < new Date()
                        ? 'text-error-600 font-semibold'
                        : 'text-gray-900'
                    }`}>
                      {formatDate(doc.expiry_date)}
                    </p>
                  </div>
                )}

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-200">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/documents/${doc.id}`)}
                  >
                    View
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    leftIcon={<Download className="w-4 h-4" />}
                    onClick={() => {
                      window.open(doc.storage_path, '_blank')
                    }}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    leftIcon={<Edit className="w-4 h-4" />}
                    onClick={() => navigate(`/documents/${doc.id}/edit`)}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    leftIcon={<Printer className="w-4 h-4" />}
                    onClick={() => window.print()}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}

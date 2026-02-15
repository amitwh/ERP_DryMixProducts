import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { api } from '@/services/api'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Alert } from '@/components/ui/Alert'
import { ArrowLeft, Upload, FileText, Plus } from 'lucide-react'

export default function UploadDocumentPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const [formData, setFormData] = useState({
    document_type: '',
    category: '',
    title: '',
    description: '',
    version: 1,
    status: 'draft',
    module: '',
    reference_id: '',
    reference_type: '',
    expiry_date: '',
    tags: '',
    is_public: false,
    access_level: 'restricted',
  })

  const [files, setFiles] = useState<File[]>([])
  const [dragActive, setDragActive] = useState(false)

  const categories = [
    { value: 'contracts', label: 'Contracts' },
    { value: 'invoices', label: 'Invoices' },
    { value: 'quality', label: 'Quality Documents' },
    { value: 'technical', label: 'Technical Specifications' },
    { value: 'policies', label: 'Policies & Procedures' },
    { value: 'reports', label: 'Reports' },
    { value: 'certificates', label: 'Certificates' },
  ]

  const modules = [
    { value: 'sales', label: 'Sales' },
    { value: 'procurement', label: 'Procurement' },
    { value: 'production', label: 'Production' },
    { value: 'quality', label: 'Quality Control' },
    { value: 'inventory', label: 'Inventory' },
    { value: 'finance', label: 'Finance' },
    { value: 'hr', label: 'HR & Payroll' },
  ]

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    const droppedFiles = Array.from(e.dataTransfer.files)
    setFiles([...files, ...droppedFiles])
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || [])
    setFiles([...files, ...selectedFiles])
  }

  const handleRemoveFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index))
  }

  const handleSubmit = async () => {
    if (!formData.title || files.length === 0) {
      setError('Title and at least one file are required')
      return
    }

    setIsUploading(true)
    setError(null)

    try {
      const formDataWithFiles = new FormData()
      formDataWithFiles.append('organization_id', user?.organization_id?.toString() || '')
      Object.keys(formData).forEach(key => {
        formDataWithFiles.append(key, (formData as Record<string, any>)[key])
      })

      files.forEach((file, index) => {
        formDataWithFiles.append(`files[${index}]`, file)
      })

      const response = await api.post('/documents/upload', formDataWithFiles, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      if (response.data.success) {
        setSuccess(true)
        setTimeout(() => {
          navigate('/documents')
        }, 2000)
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to upload document')
    } finally {
      setIsUploading(false)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
  }

  const totalSize = files.reduce((sum, file) => sum + file.size, 0)

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<ArrowLeft className="w-4 h-4" />}
            onClick={() => navigate('/documents')}
          >
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Upload Document</h1>
            <p className="text-gray-600">
              Add new documents to the system
            </p>
          </div>
        </div>
        <Button
          variant="primary"
          leftIcon={<Upload className="w-4 h-4" />}
          onClick={handleSubmit}
          isLoading={isUploading}
        >
          Upload
        </Button>
      </div>

      {error && <Alert type="error" message={error} onDismiss={() => setError(null)} />}
      {success && (
        <Alert
          type="success"
          message="Document uploaded successfully! Redirecting..."
          onDismiss={() => setSuccess(false)}
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <Card variant="bordered" padding="lg">
            <div className="flex items-center gap-3 mb-6">
              <Upload className="w-6 h-6 text-primary-600" />
              <h3 className="text-lg font-semibold text-gray-900">
                File Upload
              </h3>
            </div>
            
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-300 hover:border-primary-400'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                type="file"
                multiple
                onChange={handleFileSelect}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer"
              >
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-lg font-medium text-gray-700 mb-2">
                  Drop files here or click to browse
                </p>
                <p className="text-sm text-gray-500">
                  PDF, DOC, XLS, Images up to 50MB
                </p>
              </label>
            </div>

            {files.length > 0 && (
              <div className="space-y-3 mt-4">
                {files.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <FileText className="w-5 h-5 text-gray-400" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {file.name}
                        </p>
                        <p className="text-xs text-gray-600">
                          {formatFileSize(file.size)}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveFile(index)}
                    >
                      <Plus className="w-4 h-4 text-error-600 rotate-45" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {files.length > 0 && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-900 mb-2">
                  Upload Summary
                </p>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Files: {files.length}</span>
                  <span className="text-gray-600">Total: {formatFileSize(totalSize)}</span>
                </div>
              </div>
            )}
          </Card>
        </div>

        <div className="space-y-6">
          <Card variant="bordered" padding="lg">
            <div className="flex items-center gap-3 mb-6">
              <FileText className="w-6 h-6 text-primary-600" />
              <h3 className="text-lg font-semibold text-gray-900">
                Document Details
              </h3>
            </div>
            
            <div className="space-y-4">
              <Input
                name="title"
                type="text"
                label="Document Title *"
                placeholder="Enter document title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="Enter document description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category *
                  </label>
                  <select
                    name="category"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    required
                  >
                    <option value="">Select category...</option>
                    {categories.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Module *
                  </label>
                  <select
                    name="module"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    value={formData.module}
                    onChange={(e) => setFormData({ ...formData, module: e.target.value })}
                    required
                  >
                    <option value="">Select module...</option>
                    {modules.map((mod) => (
                      <option key={mod.value} value={mod.value}>
                        {mod.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  name="version"
                  type="number"
                  label="Version"
                  placeholder="1"
                  value={formData.version}
                  onChange={(e) => setFormData({ ...formData, version: parseInt(e.target.value) || 1 })}
                  min="1"
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    name="status"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>
              <Input
                name="tags"
                type="text"
                label="Tags"
                placeholder="tag1, tag2, tag3"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              />
            </div>
          </Card>

          <Card variant="bordered" padding="lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Access & Permissions
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-900">Is Public</p>
                  <p className="text-xs text-gray-600">Allow access to all users</p>
                </div>
                <input
                  type="checkbox"
                  checked={formData.is_public}
                  onChange={(e) => setFormData({ ...formData, is_public: e.target.checked })}
                  className="w-5 h-5 text-primary-600 rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Access Level
                </label>
                <select
                  name="access_level"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  value={formData.access_level}
                  onChange={(e) => setFormData({ ...formData, access_level: e.target.value })}
                >
                  <option value="public">Public</option>
                  <option value="restricted">Restricted</option>
                  <option value="confidential">Confidential</option>
                </select>
              </div>
              <Input
                name="expiry_date"
                type="date"
                label="Expiry Date (Optional)"
                placeholder="Select expiry date"
                value={formData.expiry_date}
                onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
              />
            </div>
          </Card>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Document Guidelines
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
          <div className="space-y-2">
            <p>• Supported formats: PDF, DOC, DOCX, XLS, XLSX, PNG, JPG</p>
            <p>• Maximum file size: 50MB per file</p>
            <p>• Maximum files per upload: 10</p>
            <p>• Public documents are accessible to all users</p>
          </div>
          <div className="space-y-2">
            <p>• Confidential documents require special permissions</p>
            <p>• Version control helps track document changes</p>
            <p>• Tags help with document search and filtering</p>
            <p>• Expired documents are automatically archived</p>
          </div>
        </div>
      </div>
    </div>
  )
}

import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { api } from '@/services/api'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Skeleton } from '@/components/ui/Loading'
import { Alert } from '@/components/ui/Alert'
import { ArrowLeft, Save, Send, Eye, Code, FileText, Type, Zap, Settings, Plus } from 'lucide-react'
import { formatDate } from '@/utils'
import { toast } from 'sonner'

interface Variable {
  name: string
  display_name: string
  description?: string
}

interface Template {
  id: number
  organization_id: number
  name: string
  template_type: 'sms' | 'whatsapp' | 'email'
  category?: string
  subject?: string
  body: string
  variables?: Variable[]
  is_active: boolean
  created_at: string
  updated_at: string
}

interface AvailableVariable {
  name: string
  display_name: string
  description: string
  category: 'customer' | 'order' | 'product' | 'employee' | 'system'
}

export const TemplateEditorPage: React.FC = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()

  const [template, setTemplate] = useState<Partial<Template>>({
    name: '',
    template_type: 'sms',
    body: '',
    is_active: true,
  })
  const [availableVariables, setAvailableVariables] = useState<AvailableVariable[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [previewMode, setPreviewMode] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const templateTypes = [
    { value: 'sms' as const, label: 'SMS', icon: Type },
    { value: 'whatsapp' as const, label: 'WhatsApp', icon: Zap },
    { value: 'email' as const, label: 'Email', icon: FileText },
  ]

  const categories = [
    'Order Notifications',
    'Payment Reminders',
    'Promotions',
    'Employee Communications',
    'System Alerts',
    'Other',
  ]

  const fetchTemplate = async () => {
    if (!id) {
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      const [templateRes, variablesRes] = await Promise.all([
        api.get<Template>(`/communication/templates/${id}`, {
          params: { organization_id: user?.organizationId },
        }),
        api.get<AvailableVariable[]>('/communication/templates/variables'),
      ])

      setTemplate(templateRes.data)
      setAvailableVariables(variablesRes.data)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch template')
      console.error('Failed to fetch template:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchTemplate()
  }, [id])

  const fetchAvailableVariables = async () => {
    try {
      const response = await api.get<AvailableVariable[]>('/communication/templates/variables')
      setAvailableVariables(response.data)
    } catch (error) {
      console.error('Failed to fetch variables:', error)
    }
  }

  useEffect(() => {
    fetchAvailableVariables()
  }, [])

  const handleSave = async () => {
    try {
      setIsSaving(true)
      setError(null)

      const payload = {
        organization_id: user?.organizationId,
        name: template.name,
        template_type: template.template_type || 'sms',
        category: template.category,
        subject: template.subject,
        body: template.body,
        is_active: template.is_active,
      }

      if (id) {
        await api.put(`/communication/templates/${id}`, payload)
        toast.success('Template updated successfully')
      } else {
        await api.post('/communication/templates', payload)
        toast.success('Template created successfully')
      }

      navigate('/communication/templates')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save template')
      toast.error('Failed to save template')
    } finally {
      setIsSaving(false)
    }
  }

  const handleTest = async () => {
    try {
      setIsSaving(true)
      await api.post(`/communication/templates/${id || 'new'}/test`, {
        organization_id: user?.organizationId,
        body: template.body,
      })
      toast.success('Test message sent successfully')
    } catch (error) {
      toast.error('Failed to send test message')
    } finally {
      setIsSaving(false)
    }
  }

  const insertVariable = (variableName: string) => {
    const textarea = document.querySelector('textarea[name="body"]') as HTMLTextAreaElement
    if (textarea) {
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const text = template.body || ''
      const newText = text.substring(0, start) + `{{${variableName}}}` + text.substring(end)
      setTemplate({ ...template, body: newText })

      setTimeout(() => {
        textarea.focus()
        textarea.selectionStart = textarea.selectionEnd = start + variableName.length + 2
      }, 0)
    }
  }

  const renderPreview = (body: string) => {
    let preview = body
    availableVariables.forEach((variable) => {
      const regex = new RegExp(`{${variable.name}}`, 'g')
      preview = preview.replace(regex, `[${variable.display_name}]`)
    })
    return preview
  }

  const getCharacterCount = () => {
    return (template.body || '').length
  }

  const getEstimatedSegments = () => {
    const length = getCharacterCount()
    return Math.ceil(length / 160)
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Template Editor</h1>
          <p className="text-gray-600">Loading template information...</p>
        </div>
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} height={150} className="rounded" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Template Editor</h1>
          <p className="text-gray-600">{id ? 'Edit' : 'Create new'} message template</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<ArrowLeft className="w-4 h-4" />}
            onClick={() => navigate('/communication/templates')}
          >
            Back
          </Button>
        </div>
      </div>

      {error && <Alert variant="error" message={error} />}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card variant="bordered" padding="lg">
          <CardHeader>
            <CardTitle>Template Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Template Name</label>
                <Input
                  type="text"
                  placeholder="Enter template name"
                  value={template.name}
                  onChange={(e) => setTemplate({ ...template, name: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Template Type</label>
                <div className="grid grid-cols-3 gap-3">
                  {templateTypes.map((type) => (
                    <button
                      key={type.value}
                      onClick={() => setTemplate({ ...template, template_type: type.value })}
                      className={`flex items-center justify-center gap-2 p-4 border-2 rounded-lg transition-colors ${
                        template.template_type === type.value
                          ? 'border-primary-600 bg-primary-50'
                          : 'border-gray-200 hover:border-primary-300'
                      }`}
                    >
                      <type.icon className="w-5 h-5" />
                      <span className="text-sm font-medium">{type.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  value={template.category || ''}
                  onChange={(e) => setTemplate({ ...template, category: e.target.value })}
                >
                  <option value="">Select category</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {template.template_type === 'email' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                  <Input
                    type="text"
                    placeholder="Enter email subject"
                    value={template.subject || ''}
                    onChange={(e) => setTemplate({ ...template, subject: e.target.value })}
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Message Body</label>
                <textarea
                  name="body"
                  rows={10}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="Enter message body..."
                  value={template.body || ''}
                  onChange={(e) => setTemplate({ ...template, body: e.target.value })}
                />
                <div className="mt-2 flex items-center justify-between text-sm text-gray-600">
                  <span>Characters: {getCharacterCount()}</span>
                  {template.template_type === 'sms' && (
                    <span>Estimated segments: {getEstimatedSegments()}</span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={template.is_active}
                  onChange={(e) => setTemplate({ ...template, is_active: e.target.checked })}
                  className="w-4 h-4 text-primary-600 rounded"
                />
                <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                  Active Template
                </label>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  leftIcon={<Eye className="w-4 h-4" />}
                  onClick={() => setPreviewMode(!previewMode)}
                >
                  {previewMode ? 'Hide Preview' : 'Show Preview'}
                </Button>
                <Button
                  variant="primary"
                  leftIcon={<Save className="w-4 h-4" />}
                  onClick={handleSave}
                  isLoading={isSaving}
                >
                  Save Template
                </Button>
                {id && (
                  <Button
                    variant="outline"
                    leftIcon={<Send className="w-4 h-4" />}
                    onClick={handleTest}
                    isLoading={isSaving}
                  >
                    Test Message
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card variant="bordered" padding="lg">
          <CardHeader>
            <CardTitle>Available Variables</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Click on a variable to insert it into your message body
              </p>

              {['customer', 'order', 'product', 'employee', 'system'].map((category) => {
                const categoryVariables = availableVariables.filter((v) => v.category === category)
                if (categoryVariables.length === 0) return null

                return (
                  <div key={category}>
                    <h4 className="text-sm font-semibold text-gray-900 mb-2 capitalize">{category}</h4>
                    <div className="grid grid-cols-1 gap-2">
                      {categoryVariables.map((variable) => (
                        <button
                          key={variable.name}
                          onClick={() => insertVariable(variable.name)}
                          className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-left"
                        >
                          <Code className="w-4 h-4 text-gray-400" />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">{variable.display_name}</p>
                            <p className="text-xs text-gray-600">{variable.name}</p>
                          </div>
                          <Plus className="w-4 h-4 text-primary-600" />
                        </button>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {previewMode && (
        <Card variant="bordered" padding="lg">
          <CardHeader>
            <CardTitle>Message Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-900 whitespace-pre-wrap">{renderPreview(template.body || '')}</p>
            </div>
            <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                <span>Template: {template.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <Type className="w-4 h-4" />
                <span>Type: {template.template_type}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default TemplateEditorPage

import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { api } from '@/services/api'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Skeleton } from '@/components/ui/Loading'
import { Plus, Search, FileText, Send, Mail, MessageSquare, Filter } from 'lucide-react'
import { formatDate } from '@/utils'

interface Template {
  id: number
  template_name: string
  template_type: 'email' | 'sms' | 'whatsapp'
  category: string
  subject?: string
  content: string
  variables: string[]
  status: 'active' | 'inactive'
  usage_count?: number
  created_by?: string
  created_at: string
}

export const TemplatesPage: React.FC = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [templates, setTemplates] = useState<Template[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState<'all' | 'email' | 'sms' | 'whatsapp'>('all')
  const [page, setPage] = useState(1)

  const fetchTemplates = async () => {
    try {
      setIsLoading(true)
      const response = await api.get<{ data: Template[] }>('/communication/templates', {
        params: {
          organization_id: user?.organizationId,
          per_page: 20,
          page,
        },
      })
      setTemplates(response.data.data || [])
    } catch (error) {
      console.error('Failed to fetch templates:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchTemplates()
  }, [page])

  const filteredTemplates = templates.filter((template) => {
    const matchesSearch =
      searchTerm === '' ||
      template.template_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.category.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = typeFilter === 'all' || template.template_type === typeFilter
    return matchesSearch && matchesType
  })

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'email':
        return <Mail className="w-4 h-4" />
      case 'sms':
      case 'whatsapp':
        return <MessageSquare className="w-4 h-4" />
      default:
        return <FileText className="w-4 h-4" />
    }
  }

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      email: 'bg-blue-100 text-blue-800',
      sms: 'bg-green-100 text-green-800',
      whatsapp: 'bg-emerald-100 text-emerald-800',
    }
    return colors[type] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Communication Templates</h1>
          <p className="text-gray-600">Manage email, SMS, and WhatsApp templates</p>
        </div>
        <Button
          variant="primary"
          size="sm"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => navigate('/communication/templates/create')}
        >
          New Template
        </Button>
      </div>

      <Card variant="bordered" padding="md">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Search templates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-600" />
            {(['all', 'email', 'sms', 'whatsapp'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setTypeFilter(type)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  typeFilter === type
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {type.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </Card>

      <Card variant="bordered" padding="lg">
        <CardHeader>
          <CardTitle>Templates</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} height={120} className="rounded" />
              ))}
            </div>
          ) : filteredTemplates.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">No templates found</p>
              <Button
                variant="primary"
                size="sm"
                leftIcon={<Plus className="w-4 h-4" />}
                onClick={() => navigate('/communication/templates/create')}
              >
                Create First Template
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTemplates.map((template) => (
                <div
                  key={template.id}
                  className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        template.template_type === 'email' ? 'bg-blue-100' :
                        template.template_type === 'sms' ? 'bg-green-100' : 'bg-emerald-100'
                      }`}>
                        {getTypeIcon(template.template_type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-gray-900">{template.template_name}</span>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getTypeColor(template.template_type)}`}>
                            {template.template_type.toUpperCase()}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            template.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {template.status}
                          </span>
                        </div>
                        {template.subject && (
                          <p className="text-sm text-gray-600">{template.subject}</p>
                        )}
                      </div>
                    </div>
                    {template.usage_count !== undefined && (
                      <div className="text-right">
                        <p className="text-sm text-gray-500">Usage</p>
                        <p className="font-semibold text-gray-900">{template.usage_count}</p>
                      </div>
                    )}
                  </div>

                  <div className="mb-3">
                    <p className="text-sm text-gray-500 mb-1">Content Preview</p>
                    <p className="text-sm text-gray-600 line-clamp-2">{template.content}</p>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-4 text-gray-600">
                      <div>
                        <span className="font-medium">Category:</span> {template.category}
                      </div>
                      {template.variables.length > 0 && (
                        <div>
                          <span className="font-medium">Variables:</span> {template.variables.join(', ')}
                        </div>
                      )}
                    </div>
                    <div className="text-xs text-gray-500">
                      Created: {formatDate(template.created_at)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex items-center justify-center gap-2">
        <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(page - 1)}>
          Previous
        </Button>
        <span className="px-4 py-2">Page {page}</span>
        <Button variant="outline" size="sm" onClick={() => setPage(page + 1)}>
          Next
        </Button>
      </div>
    </div>
  )
}

export default TemplatesPage

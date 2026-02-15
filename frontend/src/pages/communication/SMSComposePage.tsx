import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { api } from '@/services/api'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Skeleton } from '@/components/ui/Loading'
import { Alert } from '@/components/ui/Alert'
import { Send, Users, Search, Plus, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'

interface Template {
  id: number
  name: string
  template_type: 'sms' | 'whatsapp'
  category?: string
  body: string
}

interface Recipient {
  id: number
  name: string
  phone_number?: string
  type: 'customer' | 'employee' | 'supplier'
}

interface SMSQueue {
  id: number
  name: string
  recipient_type: 'customer' | 'employee' | 'supplier' | 'custom'
  recipients: Recipient[]
  template?: Template
  custom_message?: string
  status: 'draft' | 'scheduled' | 'processing' | 'completed' | 'failed'
  scheduled_at?: string
  created_at: string
}

interface SMSComposeProps {
  templateId?: number
  recipientType?: 'customer' | 'employee' | 'supplier'
  defaultMessage?: string
}

export const SMSComposePage: React.FC<SMSComposeProps> = ({
  templateId,
  defaultMessage,
}) => {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [templates, setTemplates] = useState<Template[]>([])
  const [recipients, setRecipients] = useState<Recipient[]>([])
  const [selectedRecipients, setSelectedRecipients] = useState<Recipient[]>([])
  const [message, setMessage] = useState('')
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)
  const [scheduledDate, setScheduledDate] = useState('')
  const [scheduledTime, setScheduledTime] = useState('')
  const [_isLoading, _setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [recipientFilter, setRecipientFilter] = useState<'all' | 'customer' | 'employee' | 'supplier'>('all')

  const fetchTemplates = async () => {
    try {
      const response = await api.get<{ data: Template[] }>('/communication/templates', {
        params: {
          organization_id: user?.organization_id,
          template_type: 'sms',
        },
      })
      setTemplates(response.data.data || [])
    } catch (error) {
      console.error('Failed to fetch templates:', error)
    }
  }

  const fetchRecipients = async () => {
    try {
      const response = await api.get<{ data: Recipient[] }>('/communication/recipients', {
        params: {
          organization_id: user?.organization_id,
          type: recipientFilter === 'all' ? undefined : recipientFilter,
        },
      })
      setRecipients(response.data.data || [])
    } catch (error) {
      console.error('Failed to fetch recipients:', error)
    }
  }

  useEffect(() => {
    fetchTemplates()
    fetchRecipients()
    if (defaultMessage) {
      setMessage(defaultMessage)
    }
  }, [recipientFilter])

  useEffect(() => {
    if (templateId) {
      const template = templates.find((t) => t.id === templateId)
      if (template) {
        setSelectedTemplate(template)
        setMessage(template.body)
      }
    }
  }, [templateId, templates])

  const handleTemplateChange = (templateId: string) => {
    const template = templates.find((t) => t.id === parseInt(templateId))
    if (template) {
      setSelectedTemplate(template)
      setMessage(template.body)
    }
  }

  const handleRecipientToggle = (recipient: Recipient) => {
    if (selectedRecipients.find((r) => r.id === recipient.id)) {
      setSelectedRecipients(selectedRecipients.filter((r) => r.id !== recipient.id))
    } else {
      setSelectedRecipients([...selectedRecipients, recipient])
    }
  }

  const handleSelectAll = () => {
    if (selectedRecipients.length === filteredRecipients.length) {
      setSelectedRecipients([])
    } else {
      setSelectedRecipients(filteredRecipients)
    }
  }

  const filteredRecipients = recipients.filter((recipient) => {
    const matchesFilter = recipientFilter === 'all' || recipient.type === recipientFilter
    const matchesSearch =
      searchTerm === '' ||
      recipient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (recipient.phone_number && recipient.phone_number.includes(searchTerm))
    return matchesFilter && matchesSearch
  })

  const getRecipientTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      customer: 'bg-blue-100 text-blue-800',
      employee: 'bg-green-100 text-green-800',
      supplier: 'bg-purple-100 text-purple-800',
    }
    return colors[type] || 'bg-gray-100 text-gray-800'
  }

  const handleSendSMS = async () => {
    if (selectedRecipients.length === 0) {
      setError('Please select at least one recipient')
      return
    }

    if (!message.trim()) {
      setError('Please enter a message')
      return
    }

    try {
      setIsSending(true)
      setError(null)

      const payload = {
        organization_id: user?.organization_id,
        recipient_ids: selectedRecipients.map((r) => r.id),
        template_id: selectedTemplate?.id,
        custom_message: message,
        scheduled_at: scheduledDate && scheduledTime ? `${scheduledDate} ${scheduledTime}` : undefined,
      }

      const response = await api.post<{ data: SMSQueue }>('/communication/sms/send', payload)

      toast.success(`SMS sent to ${selectedRecipients.length} recipients`)
      navigate(`/communication/sms/queue/${response.data.data.id}`)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send SMS')
      toast.error('Failed to send SMS')
    } finally {
      setIsSending(false)
    }
  }

  const getCharacterCount = () => {
    return message.length
  }

  const getEstimatedSegments = () => {
    const length = getCharacterCount()
    return Math.ceil(length / 160)
  }

  const getEstimatedCost = () => {
    const segments = getEstimatedSegments()
    return segments * 0.05 // Example: ₹0.05 per segment
  }

  if (_isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Compose SMS</h1>
          <p className="text-gray-600">Loading...</p>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} height={200} className="rounded" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Compose SMS</h1>
          <p className="text-gray-600">Send SMS messages to recipients</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<RefreshCw className="w-4 h-4" />}
            onClick={() => {
              fetchTemplates()
              fetchRecipients()
            }}
          >
            Refresh
          </Button>
        </div>
      </div>

      {error && <Alert type="error" message={error} />}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card variant="bordered" padding="lg">
          <CardHeader>
            <CardTitle>Message Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Template (Optional)</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  value={selectedTemplate?.id || ''}
                  onChange={(e) => handleTemplateChange(e.target.value)}
                >
                  <option value="">Select template...</option>
                  {templates.map((template) => (
                    <option key={template.id} value={template.id}>
                      {template.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                <textarea
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="Enter your message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
                <div className="mt-2 flex items-center justify-between text-sm text-gray-600">
                  <div className="flex items-center gap-4">
                    <span>Characters: {getCharacterCount()}</span>
                    <span>Segments: {getEstimatedSegments()}</span>
                  </div>
                  <span>Estimated cost: ₹{getEstimatedCost().toFixed(2)}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Schedule Date</label>
                  <Input
                    type="date"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Schedule Time</label>
                  <Input
                    type="time"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                  />
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Selected Recipients</span>
                  <span className="text-sm text-gray-600">{selectedRecipients.length} selected</span>
                </div>
                {selectedRecipients.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {selectedRecipients.slice(0, 5).map((recipient) => (
                      <span key={recipient.id} className="px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-xs">
                        {recipient.name}
                      </span>
                    ))}
                    {selectedRecipients.length > 5 && (
                      <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">
                        +{selectedRecipients.length - 5} more
                      </span>
                    )}
                  </div>
                )}
              </div>

              <Button
                variant="primary"
                leftIcon={<Send className="w-4 h-4" />}
                onClick={handleSendSMS}
                isLoading={isSending}
                disabled={isSending || selectedRecipients.length === 0 || !message.trim()}
              >
                {scheduledDate && scheduledTime ? 'Schedule SMS' : 'Send Now'}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card variant="bordered" padding="lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Select Recipients</CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSelectAll}
                >
                  {selectedRecipients.length === filteredRecipients.length ? 'Deselect All' : 'Select All'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<Plus className="w-4 h-4" />}
                  onClick={() => navigate('/communication/recipients/create')}
                >
                  Add Recipient
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="relative mb-3">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    type="text"
                    placeholder="Search recipients..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex items-center gap-2">
                  {(['all', 'customer', 'employee', 'supplier'] as const).map((type) => (
                    <button
                      key={type}
                      onClick={() => setRecipientFilter(type)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        recipientFilter === type
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {filteredRecipients.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No recipients found</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[500px] overflow-y-auto">
                  {filteredRecipients.map((recipient) => (
                    <div
                      key={recipient.id}
                      onClick={() => handleRecipientToggle(recipient)}
                      className={`p-3 rounded-lg cursor-pointer transition-colors ${
                        selectedRecipients.find((r) => r.id === recipient.id)
                          ? 'bg-primary-50 border-2 border-primary-600'
                          : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                            <Users className="w-5 h-5 text-primary-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{recipient.name}</p>
                            {recipient.phone_number && (
                              <p className="text-sm text-gray-600">{recipient.phone_number}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-medium ${getRecipientTypeColor(recipient.type)}`}
                          >
                            {recipient.type}
                          </span>
                          <div className="w-6 h-6 rounded-full border-2 flex items-center justify-center">
                            {selectedRecipients.find((r) => r.id === recipient.id) && (
                              <div className="w-3 h-3 bg-primary-600 rounded-full" />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default SMSComposePage

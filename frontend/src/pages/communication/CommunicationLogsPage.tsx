import React, { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { api } from '@/services/api'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Skeleton } from '@/components/ui/Loading'
import {
  Search,
  Download,
  RefreshCw,
  Filter,
  MessageCircle,
  MessageSquare,
  Mail,
  Send,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
} from 'lucide-react'
import { formatDate, formatDateTime, formatCurrency } from '@/utils'

interface CommunicationLog {
  id: number
  recipient_type: 'customer' | 'employee' | 'supplier'
  recipient_name: string
  recipient_contact: string
  channel: 'sms' | 'whatsapp' | 'email'
  template_id?: number
  template_name?: string
  message: string
  status: 'pending' | 'sent' | 'delivered' | 'read' | 'failed'
  sent_at?: string
  delivered_at?: string
  read_at?: string
  failed_at?: string
  error_message?: string
  cost?: number
  media_count?: number
  segment_count?: number
  created_by?: string
  created_at?: string
}

interface LogsSummary {
  total_logs: number
  sent_today: number
  delivered_today: number
  failed_today: number
  total_cost_today: number
  delivery_rate: number
}

interface CostAnalysis {
  channel: string
  total_cost: number
  message_count: number
  avg_cost_per_message: number
}

interface Stats {
  sms_sent: number
  whatsApp_sent: number
  email_sent: number
  total_cost: number
}

export const CommunicationLogsPage: React.FC = () => {
  const { user } = useAuth()

  const [logs, setLogs] = useState<CommunicationLog[]>([])
  const [summary, setSummary] = useState<LogsSummary | null>(null)
  const [stats, setStats] = useState<Stats | null>(null)
  const [costAnalysis, setCostAnalysis] = useState<CostAnalysis[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [channelFilter, setChannelFilter] = useState<'all' | 'sms' | 'whatsapp' | 'email'>('all')
  const [statusFilter, setStatusFilter] = useState<'all' | 'sent' | 'delivered' | 'read' | 'failed'>('all')
  const [dateFilter, setDateFilter] = useState('')
  const [page, setPage] = useState(1)

  const fetchLogs = async () => {
    try {
      setIsLoading(true)
      const [logsRes, summaryRes, statsRes, costRes] = await Promise.all([
        api.get<{ data: CommunicationLog[] }>('/communication/logs', {
          params: {
            organization_id: user?.organization_id,
            channel: channelFilter === 'all' ? undefined : channelFilter,
            status: statusFilter === 'all' ? undefined : statusFilter,
            date: dateFilter || undefined,
            per_page: 50,
            page,
          },
        }),
        api.get<LogsSummary>('/communication/logs/summary', {
          params: {
            organization_id: user?.organization_id,
          },
        }),
        api.get<Stats>('/communication/logs/stats', {
          params: {
            organization_id: user?.organization_id,
            period: 'today',
          },
        }),
        api.get<CostAnalysis[]>('/communication/logs/cost-analysis', {
          params: {
            organization_id: user?.organization_id,
            period: 'month',
          },
        }),
      ])

      setLogs(logsRes.data.data || [])
      setSummary(summaryRes.data)
      setStats(statsRes.data)
      setCostAnalysis(costRes.data)
    } catch (error) {
      console.error('Failed to fetch communication logs:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchLogs()
  }, [page, channelFilter, statusFilter, dateFilter])

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      searchTerm === '' ||
      log.recipient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.recipient_contact.includes(searchTerm.toLowerCase()) ||
      (log.message && log.message.toLowerCase().includes(searchTerm.toLowerCase()))
    return matchesSearch
  })

  const handleExport = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      'Date,Channel,Recipient,Contact,Status,Cost,Segments\n' +
      filteredLogs
        .map(
          (log) =>
            `${formatDate(log.created_at || log.sent_at || '')},${log.channel},"${log.recipient_name}",${log.recipient_contact},${log.status},${log.cost || 0},${log.segment_count || 0}`
        )
        .join('\n')

    const link = document.createElement('a')
    link.setAttribute('href', encodeURI(csvContent))
    link.setAttribute('download', `communication-logs-${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'sms':
        return <MessageCircle className="w-4 h-4" />
      case 'whatsapp':
        return <MessageSquare className="w-4 h-4" />
      case 'email':
        return <Mail className="w-4 h-4" />
      default:
        return <Send className="w-4 h-4" />
    }
  }

  const getChannelColor = (channel: string) => {
    const colors: Record<string, string> = {
      sms: 'bg-blue-100 text-blue-800',
      whatsApp: 'bg-green-100 text-green-800',
      email: 'bg-purple-100 text-purple-800',
    }
    return colors[channel] || 'bg-gray-100 text-gray-800'
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
      case 'read':
        return <CheckCircle className="w-4 h-4 text-success-600" />
      case 'failed':
        return <XCircle className="w-4 h-4 text-error-600" />
      case 'pending':
        return <Clock className="w-4 h-4 text-warning-600" />
      default:
        return <Send className="w-4 h-4 text-gray-400" />
    }
  }


  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Communication Logs</h1>
          <p className="text-gray-600">Track all sent messages and communication history</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<RefreshCw className="w-4 h-4" />}
            onClick={fetchLogs}
            isLoading={isLoading}
          >
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Download className="w-4 h-4" />}
            onClick={handleExport}
          >
            Export
          </Button>
        </div>
      </div>

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card variant="bordered" padding="lg">
            <div className="text-center">
              <MessageCircle className="w-6 h-6 text-blue-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-600 mb-1">SMS Sent</p>
              <h3 className="text-2xl font-bold text-gray-900">{stats.sms_sent}</h3>
            </div>
          </Card>
          <Card variant="bordered" padding="lg">
            <div className="text-center">
              <MessageSquare className="w-6 h-6 text-green-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-600 mb-1">WhatsApp Sent</p>
              <h3 className="text-2xl font-bold text-gray-900">{stats.whatsApp_sent}</h3>
            </div>
          </Card>
          <Card variant="bordered" padding="lg">
            <div className="text-center">
              <Mail className="w-6 h-6 text-purple-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-600 mb-1">Email Sent</p>
              <h3 className="text-2xl font-bold text-gray-900">{stats.email_sent}</h3>
            </div>
          </Card>
          <Card variant="bordered" padding="lg">
            <div className="text-center">
              <TrendingUp className="w-6 h-6 text-primary-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-600 mb-1">Delivery Rate</p>
              <h3 className="text-2xl font-bold text-success-600">
                {summary?.delivery_rate.toFixed(1) || 0}%
              </h3>
            </div>
          </Card>
          <Card variant="bordered" padding="lg">
            <div className="text-center">
              <Download className="w-6 h-6 text-error-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-600 mb-1">Total Cost</p>
              <h3 className="text-2xl font-bold text-error-600">{formatCurrency(stats.total_cost)}</h3>
            </div>
          </Card>
        </div>
      )}

      {costAnalysis.length > 0 && (
        <Card variant="bordered" padding="lg">
          <CardHeader>
            <CardTitle>Cost Analysis (This Month)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {costAnalysis.map((analysis) => (
                <div key={analysis.channel} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-3">
                    {getChannelIcon(analysis.channel)}
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getChannelColor(analysis.channel)}`}>
                      {analysis.channel.toUpperCase()}
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Total Cost</span>
                      <span className="font-semibold text-gray-900">{formatCurrency(analysis.total_cost)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Messages</span>
                      <span className="font-semibold text-gray-900">{analysis.message_count}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Avg/Message</span>
                      <span className="font-semibold text-primary-600">
                        {formatCurrency(analysis.avg_cost_per_message)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card variant="bordered" padding="md">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Search logs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <Input type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} className="w-48" />
            </div>
            <div className="flex items-center gap-2">
              {(['all', 'sms', 'whatsapp', 'email'] as const).map((channel) => (
                <button
                  key={channel}
                  onClick={() => setChannelFilter(channel)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    channelFilter === channel
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {getChannelIcon(channel)}
                  {channel}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              {(['all', 'sent', 'delivered', 'read', 'failed'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    statusFilter === status
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Card>

      <Card variant="bordered" padding="lg">
        <CardHeader>
          <CardTitle>Communication History</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} height={100} className="rounded" />
              ))}
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="text-center py-8">
              <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No communication logs found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredLogs.map((log) => (
                <div
                  key={log.id}
                  className={`p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors ${
                    log.status === 'failed' ? 'border-l-4 border-l-error-500' : ''
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${getChannelColor(log.channel)}`}>
                        {getChannelIcon(log.channel)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-gray-900">{log.recipient_name}</span>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getChannelColor(log.channel)}`}>
                            {log.channel.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">{log.recipient_contact}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(log.status)}
                        <span className="text-sm font-medium">{log.status.toUpperCase()}</span>
                      </div>
                      <span className="text-sm text-gray-600">
                        {formatDateTime(log.created_at || log.sent_at || '')}
                      </span>
                    </div>
                  </div>

                  <div className="mb-3 p-3 bg-white rounded-lg">
                    <p className="text-sm text-gray-700 line-clamp-2">{log.message}</p>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                    <div>
                      <p className="text-gray-500">Status</p>
                      <div className="flex items-center gap-1">
                        {getStatusIcon(log.status)}
                        <p className="font-medium">{log.status}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-gray-500">Template</p>
                      <p className="font-medium">{log.template_name || 'Custom'}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Cost</p>
                      <p className="font-medium text-gray-900">{log.cost ? formatCurrency(log.cost) : 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Segments</p>
                      <p className="font-medium">{log.segment_count || 1}</p>
                    </div>
                  </div>

                  {log.error_message && (
                    <div className="mt-3 p-3 bg-error-50 rounded-lg">
                      <div className="flex items-center gap-2 text-error-800">
                        <XCircle className="w-4 h-4" />
                        <p className="text-sm font-medium">{log.error_message}</p>
                      </div>
                    </div>
                  )}

                  {log.status === 'delivered' && log.delivered_at && (
                    <div className="mt-2 text-xs text-gray-600">
                      Delivered: {formatDateTime(log.delivered_at)}
                    </div>
                  )}

                  {log.status === 'read' && log.read_at && (
                    <div className="mt-2 text-xs text-success-600">
                      Read: {formatDateTime(log.read_at)}
                    </div>
                  )}
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

export default CommunicationLogsPage

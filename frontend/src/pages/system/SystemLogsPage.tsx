import React, { useState, useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Loading } from '@/components/ui/Loading'

interface SystemLog {
  id: number
  level: string
  message: string
  context: any
  user_id?: number
  ip_address: string
  user_agent: string
  created_at: string
}

const SystemLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<SystemLog[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedLevel, setSelectedLevel] = useState<string>('all')
  const [page, setPage] = useState(1)

  useEffect(() => {
    fetchLogs()
  }, [page, selectedLevel])

  const fetchLogs = async () => {
    try {
      setLoading(true)
      // const response = await SystemService.getSystemLogs({ page, level: selectedLevel })
      setLogs([])
    } catch (error) {
      console.error('Failed to fetch logs:', error)
    } finally {
      setLoading(false)
    }
  }

  const getLevelColor = (level: string) => {
    const colors: Record<string, string> = {
      emergency: 'bg-red-900 text-red-100',
      alert: 'bg-red-700 text-red-100',
      critical: 'bg-red-600 text-red-100',
      error: 'bg-red-500 text-white',
      warning: 'bg-yellow-500 text-white',
      notice: 'bg-blue-500 text-white',
      info: 'bg-green-500 text-white',
      debug: 'bg-gray-500 text-white',
    }
    return colors[level] || 'bg-gray-500 text-white'
  }

  if (loading) {
    return <Loading message="Loading system logs..." />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">System Logs</h1>
          <p className="text-gray-600">Monitor and analyze system activity</p>
        </div>
        <Button variant="secondary">Export Logs</Button>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex gap-4 items-center">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Log Level</label>
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All Levels</option>
              <option value="emergency">Emergency</option>
              <option value="alert">Alert</option>
              <option value="critical">Critical</option>
              <option value="error">Error</option>
              <option value="warning">Warning</option>
              <option value="notice">Notice</option>
              <option value="info">Info</option>
              <option value="debug">Debug</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
            <input
              type="date"
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <input
              type="text"
              placeholder="Search logs..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div className="flex gap-2 self-end">
            <Button variant="secondary">Reset</Button>
            <Button>Apply Filters</Button>
          </div>
        </div>
      </Card>

      {/* Logs */}
      <Card>
        <div className="divide-y divide-gray-200">
          {logs.length === 0 ? (
            <div className="p-12 text-center text-gray-500">No logs found</div>
          ) : (
            logs.map((log) => (
              <div key={log.id} className="p-4 hover:bg-gray-50">
                <div className="flex items-start gap-4">
                  <span className={`px-2 py-1 text-xs font-medium rounded ${getLevelColor(log.level)}`}>
                    {log.level.toUpperCase()}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm text-gray-900">
                        {new Date(log.created_at).toLocaleString()}
                      </span>
                      {log.user_id && (
                        <span className="text-xs text-gray-500">User ID: {log.user_id}</span>
                      )}
                      <span className="text-xs text-gray-500">IP: {log.ip_address}</span>
                    </div>
                    <p className="mt-1 text-gray-900">{log.message}</p>
                    {log.context && (
                      <details className="mt-2">
                        <summary className="text-sm text-gray-600 cursor-pointer hover:text-gray-900">
                          View Context
                        </summary>
                        <pre className="mt-2 p-4 bg-gray-100 rounded text-xs overflow-x-auto">
                          {JSON.stringify(log.context, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {logs.length > 0 && (
          <div className="p-4 border-t border-gray-200 flex justify-between items-center">
            <span className="text-sm text-gray-600">
              Showing page {page}
            </span>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" disabled={page === 1} onClick={() => setPage(p - 1)}>
                Previous
              </Button>
              <Button variant="secondary" size="sm" onClick={() => setPage(p + 1)}>
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}

export default SystemLogsPage

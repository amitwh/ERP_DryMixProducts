import React, { useState, useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Loading } from '@/components/ui/Loading'

interface SystemSetting {
  id: string
  category: string
  key: string
  label: string
  type: 'text' | 'number' | 'boolean' | 'select' | 'textarea'
  value: any
  options?: string[]
  description?: string
}

const SystemSettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<SystemSetting[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeCategory, setActiveCategory] = useState('general')

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      setLoading(true)
      // const response = await SystemService.getSystemSettings()
      setSettings([
        { id: '1', category: 'general', key: 'app_name', label: 'Application Name', type: 'text', value: 'ERP DryMix', description: 'The name of your application' },
        { id: '2', category: 'general', key: 'timezone', label: 'Timezone', type: 'select', value: 'Asia/Kolkata', options: ['Asia/Kolkata', 'UTC', 'America/New_York'], description: 'System timezone' },
        { id: '3', category: 'general', key: 'date_format', label: 'Date Format', type: 'select', value: 'DD/MM/YYYY', options: ['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD'], description: 'Default date format' },
        { id: '4', category: 'security', key: 'session_timeout', label: 'Session Timeout (minutes)', type: 'number', value: 60, description: 'Auto-logout after inactivity' },
        { id: '5', category: 'security', key: 'password_min_length', label: 'Min Password Length', type: 'number', value: 8, description: 'Minimum password characters' },
        { id: '6', category: 'security', key: 'two_factor_auth', label: 'Two-Factor Authentication', type: 'boolean', value: false, description: 'Require 2FA for all users' },
        { id: '7', category: 'email', key: 'smtp_host', label: 'SMTP Host', type: 'text', value: 'smtp.gmail.com', description: 'Email server host' },
        { id: '8', category: 'email', key: 'smtp_port', label: 'SMTP Port', type: 'number', value: 587, description: 'Email server port' },
        { id: '9', category: 'email', key: 'from_email', label: 'From Email', type: 'text', value: 'noreply@erp-drymix.com', description: 'Default sender email' },
        { id: '10', category: 'storage', key: 'storage_type', label: 'Storage Type', type: 'select', value: 'local', options: ['local', 's3', 'azure', 'gcp'], description: 'File storage backend' },
        { id: '11', category: 'storage', key: 'max_file_size', label: 'Max File Size (MB)', type: 'number', value: 10, description: 'Maximum upload file size' },
        { id: '12', category: 'api', key: 'rate_limit', label: 'Rate Limit (requests/minute)', type: 'number', value: 60, description: 'API rate limiting' },
        { id: '13', category: 'api', key: 'api_timeout', label: 'API Timeout (seconds)', type: 'number', value: 30, description: 'Request timeout duration' },
      ])
    } catch (error) {
      console.error('Failed to fetch settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateSetting = (key: string, value: any) => {
    setSettings(settings.map(s => s.key === key ? { ...s, value } : s))
  }

  const handleSaveSettings = async () => {
    try {
      setSaving(true)
      // await SystemService.updateSystemSettings(settings)
      alert('Settings saved successfully!')
    } catch (error) {
      console.error('Failed to save settings:', error)
      alert('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  const renderSettingInput = (setting: SystemSetting) => {
    switch (setting.type) {
      case 'boolean':
        return (
          <input
            type="checkbox"
            checked={setting.value}
            onChange={(e) => handleUpdateSetting(setting.key, e.target.checked)}
            className="h-5 w-5 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
          />
        )
      case 'select':
        return (
          <select
            value={setting.value}
            onChange={(e) => handleUpdateSetting(setting.key, e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
          >
            {setting.options?.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        )
      case 'number':
        return (
          <input
            type="number"
            value={setting.value}
            onChange={(e) => handleUpdateSetting(setting.key, parseInt(e.target.value))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
          />
        )
      case 'textarea':
        return (
          <textarea
            value={setting.value}
            onChange={(e) => handleUpdateSetting(setting.key, e.target.value)}
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
          />
        )
      default:
        return (
          <input
            type="text"
            value={setting.value}
            onChange={(e) => handleUpdateSetting(setting.key, e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
          />
        )
    }
  }

  const categories = ['general', 'security', 'email', 'storage', 'api']
  const filteredSettings = settings.filter(s => s.category === activeCategory)

  if (loading) {
    return <Loading message="Loading settings..." />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">System Settings</h1>
          <p className="text-gray-600">Configure system-wide settings and preferences</p>
        </div>
        <Button onClick={handleSaveSettings} disabled={saving}>
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <Card className="lg:col-span-1">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Categories</h2>
          </div>
          <div className="p-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                  activeCategory === category
                    ? 'bg-primary-100 text-primary-900 font-medium'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <div className="capitalize">{category}</div>
              </button>
            ))}
          </div>
        </Card>

        {/* Settings */}
        <Card className="lg:col-span-3">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 capitalize">{activeCategory} Settings</h2>
          </div>
          <div className="p-6 space-y-6">
            {filteredSettings.map((setting) => (
              <div key={setting.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="block text-sm font-medium text-gray-900">
                      {setting.label}
                    </label>
                    {setting.description && (
                      <p className="text-sm text-gray-600">{setting.description}</p>
                    )}
                  </div>
                </div>
                <div className="max-w-md">
                  {renderSettingInput(setting)}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}

export default SystemSettingsPage

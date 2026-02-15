import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { api } from '@/services/api'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Skeleton } from '@/components/ui/Loading'
import { Alert } from '@/components/ui/Alert'
import { Save, RefreshCw, Database, Settings, Server, Shield, Bell, Globe, Clock, HardDrive } from 'lucide-react'
import { toast } from 'sonner'

interface SystemSetting {
  id: number
  category: 'general' | 'security' | 'notifications' | 'performance' | 'backup' | 'api'
  setting_key: string
  setting_value: string
  setting_type: 'string' | 'number' | 'boolean' | 'json'
  display_name: string
  description?: string
  is_system: boolean
  updated_at: string
}

interface SettingsByCategory {
  [category: string]: SystemSetting[]
}

export const SystemSettingsPage: React.FC = () => {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [settings, setSettings] = useState<SettingsByCategory>({})
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [activeCategory, setActiveCategory] = useState<'general' | 'security' | 'notifications' | 'performance' | 'backup' | 'api'>('general')
  const [error, setError] = useState<string | null>(null)
  const [modifiedSettings, setModifiedSettings] = useState<Record<string, string>>({})

  const categories = [
    { id: 'general' as const, label: 'General', icon: Settings },
    { id: 'security' as const, label: 'Security', icon: Shield },
    { id: 'notifications' as const, label: 'Notifications', icon: Bell },
    { id: 'performance' as const, label: 'Performance', icon: Server },
    { id: 'backup' as const, label: 'Backup', icon: Database },
    { id: 'api' as const, label: 'API', icon: Globe },
  ]

  const fetchSettings = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await api.get<{ data: SystemSetting[] }>('/system/settings', {
        params: {
          organization_id: user?.organization_id,
          per_page: 100,
        },
      })

      const grouped = response.data.data.reduce((acc, setting) => {
        if (!acc[setting.category]) {
          acc[setting.category] = []
        }
        acc[setting.category].push(setting)
        return acc
      }, {} as SettingsByCategory)

      setSettings(grouped)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch system settings')
      console.error('Failed to fetch settings:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchSettings()
  }, [])

  const handleSave = async () => {
    try {
      setIsSaving(true)
      setError(null)

      const updates = Object.entries(modifiedSettings).map(([key, value]) => {
        const categorySettings = settings[activeCategory] || []
        const setting = categorySettings.find((s) => s.setting_key === key)

        return {
          id: setting?.id,
          setting_key: key,
          setting_value: value,
          organization_id: user?.organization_id,
        }
      })

      await Promise.all(
        updates.map((update) => api.patch(`/system/settings/${update.id}`, update))
      )

      setModifiedSettings({})
      toast.success('Settings saved successfully')
      fetchSettings()
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save settings')
      toast.error('Failed to save settings')
    } finally {
      setIsSaving(false)
    }
  }

  const handleReset = async (settingId: number, settingKey: string) => {
    try {
      setIsSaving(true)
      await api.post(`/system/settings/${settingId}/reset`, {
        organization_id: user?.organization_id,
      })
      setModifiedSettings({ ...modifiedSettings, [settingKey]: '' })
      fetchSettings()
      toast.success('Setting reset to default')
    } catch (error) {
      toast.error('Failed to reset setting')
    } finally {
      setIsSaving(false)
    }
  }

  const renderSettingInput = (setting: SystemSetting) => {
    const currentValue = modifiedSettings[setting.setting_key] || setting.setting_value

    switch (setting.setting_type) {
      case 'boolean':
        return (
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id={setting.setting_key}
              checked={currentValue === 'true'}
              onChange={(e) => setModifiedSettings({ ...modifiedSettings, [setting.setting_key]: e.target.checked ? 'true' : 'false' })}
              disabled={setting.is_system}
              className="w-5 h-5 text-primary-600 rounded"
            />
            <label htmlFor={setting.setting_key} className="text-sm text-gray-700">
              {setting.is_system ? 'System setting (read-only)' : ''}
            </label>
          </div>
        )
      case 'number':
        return (
          <Input
            type="number"
            value={currentValue}
            onChange={(e) => setModifiedSettings({ ...modifiedSettings, [setting.setting_key]: e.target.value })}
            disabled={setting.is_system}
            className={setting.is_system ? 'opacity-50' : ''}
          />
        )
      case 'json':
        return (
          <textarea
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 font-mono text-sm"
            value={currentValue}
            onChange={(e) => setModifiedSettings({ ...modifiedSettings, [setting.setting_key]: e.target.value })}
            disabled={setting.is_system}
            placeholder={JSON.stringify({ example: 'value' }, null, 2)}
          />
        )
      default:
        return (
          <Input
            type="text"
            value={currentValue}
            onChange={(e) => setModifiedSettings({ ...modifiedSettings, [setting.setting_key]: e.target.value })}
            disabled={setting.is_system}
            className={setting.is_system ? 'opacity-50' : ''}
          />
        )
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">System Settings</h1>
          <p className="text-gray-600">Loading system settings...</p>
        </div>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} height={150} className="rounded" />
          ))}
        </div>
      </div>
    )
  }

  const hasUnsavedChanges = Object.keys(modifiedSettings).length > 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">System Settings</h1>
          <p className="text-gray-600">Configure system-wide settings and preferences</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<RefreshCw className="w-4 h-4" />}
            onClick={fetchSettings}
          >
            Refresh
          </Button>
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Save className="w-4 h-4" />}
            onClick={handleSave}
            isLoading={isSaving}
            disabled={isSaving || !hasUnsavedChanges}
          >
            Save Changes
          </Button>
        </div>
      </div>

      {error && <Alert type="error" message={error} />}

      <div className="flex items-center gap-2 border-b border-gray-200">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setActiveCategory(category.id)}
            className={`flex items-center gap-2 px-4 py-3 border-b-2 -mb-px text-sm font-medium transition-colors ${
              activeCategory === category.id
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <category.icon className="w-4 h-4" />
            {category.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Card variant="bordered" padding="lg">
            <CardHeader>
              <CardTitle>Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setActiveCategory(category.id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${
                      activeCategory === category.id
                        ? 'bg-primary-50 border-2 border-primary-600'
                        : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                    }`}
                  >
                    <category.icon className="w-5 h-5" />
                    <div>
                      <p className="font-medium text-gray-900">{category.label}</p>
                      <p className="text-xs text-gray-600">
                        {settings[category.id]?.length || 0} settings
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card variant="bordered" padding="lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{categories.find((c) => c.id === activeCategory)?.label} Settings</CardTitle>
                {hasUnsavedChanges && (
                  <div className="flex items-center gap-2 text-sm text-primary-600">
                    <Clock className="w-4 h-4" />
                    <span>Unsaved changes ({Object.keys(modifiedSettings).length})</span>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {settings[activeCategory]?.map((setting) => (
                  <div key={setting.id} className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 mb-1">{setting.display_name}</p>
                        {setting.description && (
                          <p className="text-sm text-gray-600">{setting.description}</p>
                        )}
                        <p className="text-xs text-gray-500 mt-1">Key: {setting.setting_key}</p>
                      </div>
                      {!setting.is_system && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleReset(setting.id, setting.setting_key)}
                        >
                          Reset
                        </Button>
                      )}
                    </div>
                    <div className="max-w-md">{renderSettingInput(setting)}</div>
                  </div>
                ))}
                {(!settings[activeCategory] || settings[activeCategory].length === 0) && (
                  <div className="text-center py-8">
                    <Settings className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No settings found for this category</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card variant="bordered" padding="lg">
          <div className="text-center">
            <Database className="w-6 h-6 text-primary-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-600 mb-1">Storage Usage</p>
            <h3 className="text-2xl font-bold text-gray-900">45.2 GB</h3>
            <p className="text-xs text-gray-600">of 100 GB</p>
          </div>
        </Card>
        <Card variant="bordered" padding="lg">
          <div className="text-center">
            <Server className="w-6 h-6 text-success-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-600 mb-1">Active Sessions</p>
            <h3 className="text-2xl font-bold text-gray-900">24</h3>
            <p className="text-xs text-gray-600">Current users</p>
          </div>
        </Card>
        <Card variant="bordered" padding="lg">
          <div className="text-center">
            <Clock className="w-6 h-6 text-warning-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-600 mb-1">Uptime</p>
            <h3 className="text-2xl font-bold text-gray-900">99.9%</h3>
            <p className="text-xs text-gray-600">Last 30 days</p>
          </div>
        </Card>
        <Card variant="bordered" padding="lg">
          <div className="text-center">
            <Shield className="w-6 h-6 text-secondary-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-600 mb-1">API Calls Today</p>
            <h3 className="text-2xl font-bold text-gray-900">1,234</h3>
            <p className="text-xs text-gray-600">Limit: 10,000</p>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default SystemSettingsPage

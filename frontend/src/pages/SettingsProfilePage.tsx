import React, { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { api } from '@/services/api'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Skeleton } from '@/components/ui/Loading'
import { Save, User, Shield, Bell, Monitor, Palette, Globe, RefreshCw } from 'lucide-react'

interface UserProfile {
  id: number
  full_name: string
  email: string
  phone: string
  avatar: string | null
  language: string
  timezone: string
  ui_theme: string
  ui_font: string
}

interface UserSettings {
  email_notifications: boolean
  sms_notifications: boolean
  two_factor_enabled: boolean
  password_changed_at: string | null
}

export const SettingsProfilePage: React.FC = () => {
  const { user } = useAuth()

  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [settings, setSettings] = useState<UserSettings | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [notificationType, setNotificationType] = useState<'success' | 'error'>('success')
  const [notification, setNotification] = useState('')

  const fetchProfile = async () => {
    try {
      setIsLoading(true)
      const response = await api.get<{ data: UserProfile }>('/settings/profile')
      setProfile(response.data)
    } catch (error) {
      console.error('Failed to fetch profile:', error)
      showNotification('Failed to load profile', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchSettings = async () => {
    try {
      const response = await api.get<{ data: UserSettings }>('/settings/preferences')
      setSettings(response.data)
    } catch (error) {
      console.error('Failed to fetch settings:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchProfile()
    fetchSettings()
  }, [])

  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification(message)
    setNotificationType(type)
    setTimeout(() => setNotification(''), 3000)
  }

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      await api.put('/settings/profile', {
        full_name: profile?.full_name,
        phone: profile?.phone,
        language: profile?.language,
        timezone: profile?.timezone,
      })

      showNotification('Profile updated successfully', 'success')
    } catch (error) {
      console.error('Failed to update profile:', error)
      showNotification('Failed to update profile', 'error')
    } finally {
      setIsSaving(false)
    }
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      await api.post('/settings/change-password', {
        current_password: e.currentTarget.current_password.value,
        new_password: e.currentTarget.new_password.value,
      })

      showNotification('Password changed successfully', 'success')
      e.currentTarget.reset()
    } catch (error) {
      console.error('Failed to change password:', error)
      showNotification('Failed to change password', 'error')
    } finally {
      setIsSaving(false)
    }
  }

  const handleSettingsUpdate = async () => {
    setIsSaving(true)

    try {
      await api.put('/settings/preferences', settings)

      showNotification('Settings saved successfully', 'success')
    } catch (error) {
      console.error('Failed to update settings:', error)
      showNotification('Failed to update settings', 'error')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Notification */}
      {notification && (
        <div
          className={`p-4 rounded-lg mb-4 ${
            notificationType === 'success' ? 'bg-green-50 border-green-300' : 'bg-error-50 border-error-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {notificationType === 'success' ? (
              <span className="text-success-600 text-lg">✓</span>
            ) : (
              <span className="text-error-600 text-lg">✕</span>
            )}
            <span className="text-gray-900">{notification}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
        <p className="text-gray-600">Manage your profile and preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile Information */}
        <Card variant="bordered" padding="lg">
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton height={60} className="rounded" />
                <Skeleton height={60} className="rounded" />
                <Skeleton height={60} className="rounded" />
              </div>
            ) : profile ? (
              <form onSubmit={handleProfileUpdate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  <Input
                    type="text"
                    value={profile.full_name}
                    onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <Input
                    type="email"
                    value={profile.email}
                    disabled
                    className="w-full bg-gray-50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                  <Input
                    type="tel"
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
                  <select
                    value={profile.language}
                    onChange={(e) => setProfile({ ...profile, language: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="en">English</option>
                    <option value="hi">Hindi</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
                  <select
                    value={profile.timezone}
                    onChange={(e) => setProfile({ ...profile, timezone: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                    <option value="UTC">UTC</option>
                    <option value="America/New_York">America/New York (EST)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">UI Theme</label>
                  <select
                    value={profile.ui_theme}
                    onChange={(e) => setProfile({ ...profile, ui_theme: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                  </select>
                </div>

                <div className="flex items-center gap-4 pt-4">
                  <Button
                    type="submit"
                    variant="primary"
                    leftIcon={<Save className="w-4 h-4" />}
                    disabled={isSaving}
                  >
                    {isSaving ? 'Saving...' : 'Save Profile'}
                  </Button>
                </div>
              </form>
            ) : (
              <Skeleton height={300} className="rounded" />
            )}
          </CardContent>
        </Card>

        {/* Change Password */}
        <Card variant="bordered" padding="lg">
          <CardHeader>
            <CardTitle>Change Password</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                <Input
                  type="password"
                  name="current_password"
                  required
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                <Input
                  type="password"
                  name="new_password"
                  required
                  minLength={8}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
                <Input
                  type="password"
                  name="confirm_password"
                  required
                  minLength={8}
                  className="w-full"
                />
              </div>

              {settings?.password_changed_at && (
                <p className="text-xs text-gray-500 mt-2">
                  Last changed: {new Date(settings.password_changed_at).toLocaleString()}
                </p>
              )}

              <div className="flex items-center gap-4 pt-4">
                <Button
                  type="submit"
                  variant="primary"
                  leftIcon={<Save className="w-4 h-4" />}
                  disabled={isSaving}
                >
                  {isSaving ? 'Changing...' : 'Change Password'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Notifications */}
      <Card variant="bordered" padding="lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Notifications</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              leftIcon={<RefreshCw className="w-4 h-4" />}
              onClick={fetchSettings}
              isLoading={isLoading}
            >
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              <Skeleton height={60} className="rounded" />
              <Skeleton height={60} className="rounded" />
            </div>
          ) : settings ? (
            <div className="space-y-3">
              <label className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-medium text-gray-700">Email Notifications</span>
                  <p className="text-xs text-gray-500">Receive notifications via email</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.email_notifications}
                  onChange={(e) => setSettings({ ...settings, email_notifications: e.target.checked })}
                  className="w-5 h-5 text-primary-600 rounded"
                />
              </label>

              <label className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-medium text-gray-700">SMS Notifications</span>
                  <p className="text-xs text-gray-500">Receive notifications via SMS</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.sms_notifications}
                  onChange={(e) => setSettings({ ...settings, sms_notifications: e.target.checked })}
                  className="w-5 h-5 text-primary-600 rounded"
                />
              </label>

              <label className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-medium text-gray-700">Two-Factor Authentication</span>
                  <p className="text-xs text-gray-500">Add extra security to your account</p>
                </div>
                <div className={`w-12 h-5 rounded ${
                  settings.two_factor_enabled ? 'bg-success-100' : 'bg-gray-200'
                }`}>
                  <span className="text-sm font-medium text-gray-700">
                    {settings.two_factor_enabled ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
              </label>

              <div className="flex items-center gap-4 pt-4">
                <Button
                  variant="primary"
                  leftIcon={<Save className="w-4 h-4" />}
                  onClick={handleSettingsUpdate}
                  disabled={isSaving}
                >
                  {isSaving ? 'Saving...' : 'Save Settings'}
                </Button>
              </div>
            </div>
          ) : (
            <Skeleton height={200} className="rounded" />
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default SettingsProfilePage

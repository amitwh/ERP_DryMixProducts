import BaseService from './base.service'
import { ApiResponse, PaginatedResponse } from './base.service'

// Types
export interface CommunicationTemplate {
  id: number
  template_code: string
  template_name: string
  type: string
  subject: string
  body: string
  status: string
  created_at: string
}

export interface CommunicationLog {
  id: number
  template_id: number
  recipient: string
  channel: string
  status: string
  sent_at: string
  delivered_at: string
  error_message: string
}

export interface NotificationPreference {
  id: number
  user_id: number
  notification_type: string
  channel: string
  enabled: boolean
  created_at: string
}

class CommunicationService extends BaseService {
  // Templates
  async getTemplates(params?: Record<string, any>): Promise<PaginatedResponse<CommunicationTemplate>> {
    return this.get('/communication-templates', params)
  }

  async createTemplate(data: any): Promise<ApiResponse<CommunicationTemplate>> {
    return this.post('/communication-templates', data)
  }

  async updateTemplate(id: number, data: any): Promise<ApiResponse<CommunicationTemplate>> {
    return this.put(`/communication-templates/${id}`, data)
  }

  async deleteTemplate(id: number): Promise<void> {
    return this.delete(`/communication-templates/${id}`)
  }

  // Communication Logs
  async getCommunicationLogs(params?: Record<string, any>): Promise<PaginatedResponse<CommunicationLog>> {
    return this.get('/communication-logs', params)
  }

  // Send Messages
  async sendMessage(data: any): Promise<ApiResponse<any>> {
    return this.post('/communication/send-message', data)
  }

  async bulkSend(data: any): Promise<ApiResponse<any>> {
    return this.post('/communication/bulk-send', data)
  }

  // Notification Preferences
  async getNotificationPreferences(params?: Record<string, any>): Promise<PaginatedResponse<NotificationPreference>> {
    return this.get('/notification-preferences', params)
  }

  async updateNotificationPreference(id: number, data: any): Promise<ApiResponse<NotificationPreference>> {
    return this.put(`/notification-preferences/${id}`, data)
  }

  // Statistics
  async getCommunicationStatistics(): Promise<any> {
    return this.get('/communication/statistics')
  }
}

export default new CommunicationService()

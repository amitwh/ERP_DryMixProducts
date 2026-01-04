import apiClient from './api'

// Types
export interface ApiResponse<T> {
  data: T
  message?: string
  errors?: Record<string, string[]>
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: {
    current_page: number
    last_page: number
    per_page: number
    total: number
  }
}

// Base Service Class
class BaseService {
  protected apiClient = apiClient

  protected async get<T>(url: string, params?: Record<string, any>): Promise<T> {
    const response = await this.apiClient.get(url, { params })
    return response.data
  }

  protected async post<T>(url: string, data: any): Promise<T> {
    const response = await this.apiClient.post(url, data)
    return response.data
  }

  protected async put<T>(url: string, data: any): Promise<T> {
    const response = await this.apiClient.put(url, data)
    return response.data
  }

  protected async patch<T>(url: string, data: any): Promise<T> {
    const response = await this.apiClient.patch(url, data)
    return response.data
  }

  protected async delete<T>(url: string): Promise<T> {
    const response = await this.apiClient.delete(url)
    return response.data
  }
}

export default BaseService

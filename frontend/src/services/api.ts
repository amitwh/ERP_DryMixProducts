import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios'
import { toast } from 'sonner'

// API Base URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1'

// API Response Interface
interface ApiResponse<T = any> {
  success: boolean
  data: T
  message?: string
  errors?: Record<string, string[]>
}

// Create Axios Instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
})

// Request Interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem('auth_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response Interceptor
apiClient.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    return response.data
  },
  (error: AxiosError<ApiResponse>) => {
    const { response, message } = error

    if (response) {
      const { status, data } = response

      switch (status) {
        case 400:
          toast.error(data?.message || 'Bad Request')
          break
        case 401:
          toast.error('Unauthorized. Please login again.')
          localStorage.removeItem('auth_token')
          localStorage.removeItem('user')
          window.location.href = '/login'
          break
        case 403:
          toast.error('Forbidden. You do not have permission.')
          break
        case 404:
          toast.error('Resource not found.')
          break
        case 422:
          toast.error(data?.message || 'Validation error')
          break
        case 500:
          toast.error('Server error. Please try again later.')
          break
        default:
          toast.error(data?.message || message || 'An error occurred')
      }
    } else if (message === 'Network Error') {
      toast.error('Network error. Please check your connection.')
    } else {
      toast.error(message || 'An error occurred')
    }

    return Promise.reject(error)
  }
)

// API Service Methods
export const api = {
  // GET Request
  get<T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return apiClient.get(url, config)
  },

  // POST Request
  post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return apiClient.post(url, data, config)
  },

  // PUT Request
  put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return apiClient.put(url, data, config)
  },

  // PATCH Request
  patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return apiClient.patch(url, data, config)
  },

  // DELETE Request
  delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return apiClient.delete(url, config)
  },

  // Upload File
  upload<T = any>(url: string, file: File, onProgress?: (progress: number) => void): Promise<ApiResponse<T>> {
    const formData = new FormData()
    formData.append('file', file)

    return apiClient.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total && onProgress) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          onProgress(progress)
        }
      },
    })
  },
}

// Export default api client for advanced usage
export default apiClient

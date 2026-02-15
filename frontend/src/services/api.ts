import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  AxiosError,
  InternalAxiosRequestConfig,
} from 'axios'
import { toast } from 'sonner'

// API Base URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1'

// Validate API base URL
if (!API_BASE_URL || API_BASE_URL === 'undefined') {
  throw new Error('VITE_API_BASE_URL is not defined in environment variables')
}

// API Response Interface
export interface ApiResponse<T = any> {
  success: boolean
  data: T
  message?: string
  errors?: Record<string, string[]>
}

// API Error Interface
export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public details?: any
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

// Create Axios Instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true, // Important for httpOnly cookies
})

// Request cancellation map
const pendingRequests = new Map<string, AbortController>()

// Generate request key for cancellation
const getRequestKey = (config: InternalAxiosRequestConfig): string => {
  return `${config.method}:${config.url}:${JSON.stringify(config.params)}`
}

// Request Interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Cancel previous request with same key
    const requestKey = getRequestKey(config)
    if (pendingRequests.has(requestKey)) {
      const controller = pendingRequests.get(requestKey)!
      controller.abort()
    }

    // Create new abort controller
    const controller = new AbortController()
    config.signal = controller.signal
    pendingRequests.set(requestKey, controller)

    // Log in development
    if (import.meta.env.DEV) {
      console.log('📤 API Request:', {
        method: config.method?.toUpperCase(),
        url: config.url,
        params: config.params,
      })
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
    // Clean up pending request
    const requestKey = getRequestKey(response.config)
    pendingRequests.delete(requestKey)

    // Log in development
    if (import.meta.env.DEV) {
      console.log('📥 API Response:', {
        status: response.status,
        url: response.config.url,
        data: response.data,
      })
    }

    return response.data
  },
  async (error: AxiosError<ApiResponse>) => {
    // Clean up pending request
    if (error.config) {
      const requestKey = getRequestKey(error.config)
      pendingRequests.delete(requestKey)
    }

    const { response, request } = error

    // Log in development
    if (import.meta.env.DEV) {
      console.log('❌ API Error:', {
        status: response?.status,
        url: request?.url,
        message: error.message,
        response: response?.data,
      })
    }

    // Handle 401 Unauthorized - try to refresh token
    if (response?.status === 401 && request && !request._retry) {
      request._retry = true

      try {
        // Attempt to refresh token
        await apiClient.post('/auth/refresh')

        // Retry original request
        return apiClient(request)
      } catch (refreshError) {
        // Refresh failed, redirect to login
        toast.error('Your session has expired. Please login again.')

        // Redirect to login
        if (window.location.pathname !== '/login') {
          window.location.href = '/login'
        }

        return Promise.reject(refreshError)
      }
    }

    // Handle other errors
    let errorMessage = 'An unexpected error occurred'
    let errorCode = 'UNKNOWN_ERROR'

    if (response) {
      const { status, data } = response

      switch (status) {
        case 400:
          errorMessage = data?.message || 'Invalid request. Please check your input.'
          errorCode = 'BAD_REQUEST'
          break
        case 401:
          errorMessage = 'Unauthorized. Please login again.'
          errorCode = 'UNAUTHORIZED'
          break
        case 403:
          errorMessage = "You don't have permission to perform this action."
          errorCode = 'FORBIDDEN'
          break
        case 404:
          errorMessage = 'The requested resource was not found.'
          errorCode = 'NOT_FOUND'
          break
        case 422:
          // Show validation errors individually
          if (data?.errors) {
            Object.values(data.errors)
              .flat()
              .forEach((err) => toast.error(err as string))
            errorMessage = 'Validation failed'
            errorCode = 'VALIDATION_ERROR'
          } else {
            errorMessage = data?.message || 'Validation failed'
            errorCode = 'VALIDATION_ERROR'
          }
          break
        case 429:
          errorMessage = 'Too many requests. Please wait a moment.'
          errorCode = 'TOO_MANY_REQUESTS'
          break
        case 500:
          errorMessage = 'Something went wrong. Our team has been notified.'
          errorCode = 'INTERNAL_SERVER_ERROR'
          break
        case 503:
          errorMessage = 'Service is currently unavailable. Please try again later.'
          errorCode = 'SERVICE_UNAVAILABLE'
          break
        default:
          errorMessage = data?.message || 'An unexpected error occurred'
          errorCode = `ERROR_${status}`
      }
    } else if (error.code === 'ECONNABORTED') {
      // Request cancelled
      errorMessage = 'Request cancelled'
      errorCode = 'REQUEST_CANCELLED'
    } else if (error.message === 'Network Error') {
      errorMessage = 'Network error. Please check your connection.'
      errorCode = 'NETWORK_ERROR'
    } else {
      errorMessage = error.message || 'An unexpected error occurred'
      errorCode = 'UNKNOWN_ERROR'
    }

    // Show toast for non-validation errors
    if (errorCode !== 'VALIDATION_ERROR' && errorCode !== 'REQUEST_CANCELLED') {
      toast.error(errorMessage)
    }

    // Return ApiError
    return Promise.reject(
      new ApiError(
        response?.status || 0,
        errorCode,
        errorMessage,
        response?.data
      )
    )
  }
)

// API Service Methods
export const api = {
  // GET Request
  get<T = any>(
    url: string,
    config?: AxiosRequestConfig & { silent?: boolean }
  ): Promise<ApiResponse<T>> {
    return apiClient.get(url, config)
  },

  // POST Request
  post<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig & { silent?: boolean }
  ): Promise<ApiResponse<T>> {
    return apiClient.post(url, data, config)
  },

  // PUT Request
  put<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig & { silent?: boolean }
  ): Promise<ApiResponse<T>> {
    return apiClient.put(url, data, config)
  },

  // PATCH Request
  patch<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig & { silent?: boolean }
  ): Promise<ApiResponse<T>> {
    return apiClient.patch(url, data, config)
  },

  // DELETE Request
  delete<T = any>(
    url: string,
    config?: AxiosRequestConfig & { silent?: boolean }
  ): Promise<ApiResponse<T>> {
    return apiClient.delete(url, config)
  },

  // Upload File
  upload<T = any>(
    url: string,
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<ApiResponse<T>> {
    // Validate file
    const validation = validateFile(file)
    if (!validation.valid) {
      toast.error(validation.error!)
      return Promise.reject(new ApiError(400, 'INVALID_FILE', validation.error!))
    }

    const formData = new FormData()
    formData.append('file', file)

    return apiClient.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total && onProgress) {
          const progress = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          )
          onProgress(progress)
        }
      },
    })
  },
}

// File validation
const validateFile = (file: File): { valid: boolean; error?: string } => {
  // Check file type
  const allowedTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'text/csv',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ]

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error:
        'Invalid file type. Only JPEG, PNG, GIF, WebP, PDF, and CSV files are allowed.',
    }
  }

  // Check file size (max 10MB)
  const maxSize = 10 * 1024 * 1024
  if (file.size > maxSize) {
    return { valid: false, error: 'File size exceeds 10MB limit.' }
  }

  return { valid: true }
}

// Export api client for advanced usage
export default apiClient

import { api } from './api'

// User Interface
export interface User {
  id: number
  name: string
  email: string
  role?: string
  permissions?: string[]
  organization_id?: number
  created_at?: string
}

// Login Request
export interface LoginRequest {
  email: string
  password: string
  organization_id?: number
}

// Login Response
export interface LoginResponse {
  token: string
  user: User
  expires_in?: number
}

// Register Request
export interface RegisterRequest {
  name: string
  email: string
  password: string
  password_confirmation: string
  role?: string
  organization_id?: number
}

// Auth Service
export const authService = {
  // Login
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>('/auth/login', credentials)
    const { token, user } = response.data

    // Store token and user
    localStorage.setItem('auth_token', token)
    localStorage.setItem('user', JSON.stringify(user))

    return response.data
  },

  // Register
  async register(data: RegisterRequest): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>('/auth/register', data)
    const { token, user } = response.data

    // Store token and user
    localStorage.setItem('auth_token', token)
    localStorage.setItem('user', JSON.stringify(user))

    return response.data
  },

  // Logout
  async logout(): Promise<void> {
    await api.post('/auth/logout')

    // Clear storage
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user')
  },

  // Get Current User
  async getCurrentUser(): Promise<User> {
    const response = await api.get<User>('/auth/me')
    return response.data
  },

  // Refresh Token
  async refreshToken(): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>('/auth/refresh')
    const { token, user } = response.data

    // Update token
    localStorage.setItem('auth_token', token)
    localStorage.setItem('user', JSON.stringify(user))

    return response.data
  },

  // Forgot Password
  async forgotPassword(email: string): Promise<void> {
    await api.post('/auth/forgot-password', { email })
  },

  // Reset Password
  async resetPassword(data: { token: string; email: string; password: string; password_confirmation: string }): Promise<void> {
    await api.post('/auth/reset-password', data)
  },

  // Change Password
  async changePassword(data: { current_password: string; password: string; password_confirmation: string }): Promise<void> {
    await api.post('/auth/change-password', data)
  },

  // Update Profile
  async updateProfile(data: Partial<User>): Promise<User> {
    const response = await api.put<User>('/auth/profile', data)

    // Update user in storage
    localStorage.setItem('user', JSON.stringify(response.data))

    return response.data
  },

  // Check if authenticated
  isAuthenticated(): boolean {
    const token = localStorage.getItem('auth_token')
    return !!token
  },

  // Get stored user
  getStoredUser(): User | null {
    const user = localStorage.getItem('user')
    return user ? JSON.parse(user) : null
  },

  // Get token
  getToken(): string | null {
    return localStorage.getItem('auth_token')
  },
}

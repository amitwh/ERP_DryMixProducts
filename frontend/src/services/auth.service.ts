import { api } from './api'

// User Interface
export interface User {
  id: number
  organization_id?: number
  organization?: Organization
  manufacturing_unit_id?: number
  manufacturingUnit?: ManufacturingUnit
  name: string
  email: string
  phone?: string
  avatar?: string
  status: 'active' | 'inactive' | 'suspended'
  roles?: Role[]
  permissions?: string[]
  last_login_at?: string
  created_at?: string
  updated_at?: string
}

// Organization Interface
export interface Organization {
  id: number
  name: string
  code: string
}

// Manufacturing Unit Interface
export interface ManufacturingUnit {
  id: number
  name: string
  code: string
}

// Role Interface
export interface Role {
  id: number
  name: string
  guard_name: string
}

// Login Request
export interface LoginRequest {
  email: string
  password: string
}

// Login Response
export interface LoginResponse {
  success: boolean
  message: string
  data: {
    user: User
  }
}

// Register Request
export interface RegisterRequest {
  organization_id: number
  manufacturing_unit_id?: number
  name: string
  email: string
  password: string
  password_confirmation: string
  phone?: string
}

// Auth Service
export const authService = {
  /**
   * Login user
   */
  async login(credentials: LoginRequest): Promise<User> {
    const response = await api.post<{ user: User }>(
      '/auth/login',
      credentials
    )

    // Token is now in httpOnly cookie, handled by browser
    const user = response.data.user

    // Store user in localStorage (non-sensitive data only)
    localStorage.setItem('user', JSON.stringify(user))

    return user
  },

  /**
   * Register user
   */
  async register(data: RegisterRequest): Promise<User> {
    const response = await api.post<{ user: User }>(
      '/auth/register',
      data
    )

    const user = response.data.user

    // Store user in localStorage
    localStorage.setItem('user', JSON.stringify(user))

    return user
  },

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    await api.post('/auth/logout')

    // Clear user from localStorage
    localStorage.removeItem('user')

    // Cookies are cleared by server
  },

  /**
   * Get current user
   */
  async getCurrentUser(): Promise<User> {
    const response = await api.get<User>('/auth/me')

    // Update user in localStorage
    localStorage.setItem('user', JSON.stringify(response.data))

    return response.data
  },

  /**
   * Refresh access token
   */
  async refreshToken(): Promise<void> {
    // Token refresh is handled automatically by API interceptor
    // This method can be used manually if needed
    await api.post('/auth/refresh')
  },

  /**
   * Forgot password
   */
  async forgotPassword(email: string): Promise<void> {
    await api.post('/auth/forgot-password', { email })
  },

  /**
   * Reset password
   */
  async resetPassword(data: {
    token: string
    email: string
    password: string
    password_confirmation: string
  }): Promise<void> {
    await api.post('/auth/reset-password', data)
  },

  /**
   * Change password
   */
  async changePassword(data: {
    current_password: string
    password: string
    password_confirmation: string
  }): Promise<void> {
    await api.post('/auth/change-password', data)
  },

  /**
   * Update profile
   */
  async updateProfile(data: Partial<User>): Promise<User> {
    const response = await api.put<User>('/auth/profile', data)

    // Update user in localStorage
    localStorage.setItem('user', JSON.stringify(response.data))

    return response.data
  },

  /**
   * Check if authenticated (has valid token in cookie)
   */
  isAuthenticated(): boolean {
    // Since token is in httpOnly cookie, we can't access it directly
    // Check if user exists in localStorage as proxy
    const user = this.getStoredUser()
    return !!user
  },

  /**
   * Get stored user
   */
  getStoredUser(): User | null {
    try {
      const user = localStorage.getItem('user')
      return user ? JSON.parse(user) : null
    } catch (error) {
      console.error('Failed to parse stored user:', error)
      return null
    }
  },

  /**
   * Get user from API (useful for token validation)
   */
  async validateToken(): Promise<boolean> {
    try {
      await this.getCurrentUser()
      return true
    } catch (error) {
      return false
    }
  },
}

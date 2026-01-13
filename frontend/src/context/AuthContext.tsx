import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import { authService, User, LoginRequest, RegisterRequest } from '@/services/auth.service'
import { toast } from 'sonner'

// Auth Context Interface
interface AuthContextType {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (credentials: LoginRequest) => Promise<void>
  register: (data: RegisterRequest) => Promise<void>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
  updateUser: (user: User) => void
}

// Create Context
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Provider Props
interface AuthProviderProps {
  children: ReactNode
}

// Auth Provider Component
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Initialize Auth on Mount
  useEffect(() => {
    const initAuth = async () => {
      const storedUser = localStorage.getItem('user')

      if (storedUser) {
        // User was previously logged in, verify with API
        try {
          const currentUser = await authService.getCurrentUser()
          setToken('httponly')
          setUser(currentUser)
        } catch (error) {
          // Token invalid or expired, clear local state
          localStorage.removeItem('user')
          setUser(null)
          setToken(null)
        }
      }

      setIsLoading(false)
    }

    initAuth()
  }, [])

  // Login Function
  const login = useCallback(async (credentials: LoginRequest) => {
    setIsLoading(true)
    try {
      const loggedInUser = await authService.login(credentials)

      // Token is in httpOnly cookie, not accessible to JavaScript
      setToken('httponly') // Marker indicating we have a session
      setUser(loggedInUser)

      toast.success('Login successful! Welcome back.')
    } catch (error) {
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Register Function
  const register = useCallback(async (data: RegisterRequest) => {
    setIsLoading(true)
    try {
      const registeredUser = await authService.register(data)

      // Token is in httpOnly cookie, not accessible to JavaScript
      setToken('httponly') // Marker indicating we have a session
      setUser(registeredUser)

      toast.success('Registration successful! Welcome to ERP.')
    } catch (error) {
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Logout Function
  const logout = useCallback(async () => {
    setIsLoading(true)
    try {
      await authService.logout()
      setUser(null)
      setToken(null)
      toast.success('Logged out successfully.')
    } catch (error) {
      // Force logout even on error
      setUser(null)
      setToken(null)
      toast.info('Logged out.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Refresh User Function
  const refreshUser = useCallback(async () => {
    try {
      const newUser = await authService.getCurrentUser()
      setUser(newUser)
      localStorage.setItem('user', JSON.stringify(newUser))
    } catch (error) {
      throw error
    }
  }, [])

  // Update User Function
  const updateUser = useCallback((updatedUser: User) => {
    setUser(updatedUser)
    localStorage.setItem('user', JSON.stringify(updatedUser))
  }, [])

  // Context Value
  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: !!token && !!user,
    isLoading,
    login,
    register,
    logout,
    refreshUser,
    updateUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// Custom Hook to use Auth Context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

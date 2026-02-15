import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/Card'
import { Building2, Mail, Lock, ArrowRight } from 'lucide-react'
import { toast } from 'sonner'

// Login Page
export const LoginPage: React.FC = () => {
  const navigate = useNavigate()
  const { login, isAuthenticated } = useAuth()

  // Form State
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    organization_id: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)

  // Redirect if already authenticated
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard')
    }
  }, [isAuthenticated, navigate])

  // Handle Input Change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  // Validate Form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.email) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format'
    }

    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      toast.error('Please fix the errors in the form')
      return
    }

    setIsLoading(true)
    try {
      await login(formData)
      toast.success('Login successful! Redirecting...')
      navigate('/dashboard')
    } catch (error: any) {
      console.error('Login error:', error)
      toast.error(error.message || 'Login failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-50 px-4">
      <div className="w-full max-w-md">
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-600 rounded-2xl mb-4 shadow-lg">
            <Building2 className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            ERP DryMix Products
          </h1>
          <p className="text-gray-600">
            Sign in to your account
          </p>
        </div>

        {/* Login Card */}
        <Card variant="shadow">
          <CardHeader>
            <CardTitle className="text-center">Welcome Back</CardTitle>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <Input
                name="email"
                type="email"
                label="Email Address"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                error={errors.email}
                leftIcon={<Mail className="w-5 h-5" />}
                required
                autoComplete="email"
              />

              {/* Password */}
              <Input
                name="password"
                type="password"
                label="Password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                error={errors.password}
                leftIcon={<Lock className="w-5 h-5" />}
                showPasswordToggle
                required
                autoComplete="current-password"
              />

              {/* Organization ID (Optional) */}
              <Input
                name="organization_id"
                type="text"
                label="Organization ID (Optional)"
                placeholder="Enter your organization ID"
                value={formData.organization_id}
                onChange={handleChange}
                leftIcon={<Building2 className="w-5 h-5" />}
                helperText="Required only if you belong to multiple organizations"
              />

              {/* Submit Button */}
              <Button
                type="submit"
                variant="primary"
                fullWidth
                size="lg"
                isLoading={isLoading}
                rightIcon={!isLoading && <ArrowRight className="w-5 h-5" />}
              >
                Sign In
              </Button>
            </form>
          </CardContent>

          <CardFooter className="flex-col gap-4">
            {/* Default Credentials Hint */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm">
              <p className="font-medium text-blue-900 mb-2">Demo Credentials:</p>
              <p className="text-blue-800">Email: admin@erp.com</p>
              <p className="text-blue-800">Password: admin123</p>
            </div>

            {/* Forgot Password */}
            <div className="text-center">
              <Link
                to="/forgot-password"
                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                Forgot your password?
              </Link>
            </div>

            {/* Register */}
            <div className="text-center">
              <span className="text-sm text-gray-600">
                Don't have an account?{' '}
              </span>
              <Link
                to="/register"
                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                Create one
              </Link>
            </div>
          </CardFooter>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-500">
          <p>© 2026 ERP DryMix Products. All rights reserved.</p>
        </div>
      </div>
    </div>
  )
}

export default LoginPage

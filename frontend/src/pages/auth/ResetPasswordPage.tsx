import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/Card'
import { Building2, Lock, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import { authService } from '@/services/auth.service'

// Reset Password Page
export const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  // Get token and email from URL
  const token = searchParams.get('token') || ''
  const emailFromUrl = searchParams.get('email') || ''

  // Form State
  const [formData, setFormData] = useState({
    email: emailFromUrl,
    password: '',
    password_confirmation: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [isTokenValid, setIsTokenValid] = useState<boolean | null>(null)

  // Validate token on mount
  useEffect(() => {
    const validateToken = async () => {
      if (!token || !emailFromUrl) {
        setIsTokenValid(false)
        toast.error('Invalid reset link. Please request a new one.')
        return
      }

      try {
        // Optionally verify token before showing form
        setIsTokenValid(true)
      } catch {
        setIsTokenValid(false)
        toast.error('Invalid or expired reset link. Please request a new one.')
      }
    }

    validateToken()
  }, [token, emailFromUrl])

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
    } else if (formData.password.length < 12) {
      newErrors.password = 'Password must be at least 12 characters long'
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/.test(formData.password)) {
      newErrors.password =
        'Password must contain uppercase, lowercase, number, and special character'
    }

    if (formData.password !== formData.password_confirmation) {
      newErrors.password_confirmation = 'Passwords do not match'
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
      await authService.resetPassword({
        token,
        email: formData.email,
        password: formData.password,
        password_confirmation: formData.password_confirmation,
      })
      setIsSuccess(true)
      toast.success('Password has been reset successfully. Please login with your new password.')
    } catch (error: any) {
      console.error('Reset password error:', error)
      toast.error(error.message || 'Failed to reset password. The link may have expired.')
    } finally {
      setIsLoading(false)
    }
  }

  // Invalid Token State
  if (isTokenValid === false) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-50 px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-600 rounded-2xl mb-4 shadow-lg">
              <Building2 className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              ERP DryMix Products
            </h1>
          </div>

          <Card variant="shadow">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
                  <AlertCircle className="w-8 h-8 text-red-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  Invalid Reset Link
                </h2>
                <p className="text-gray-600 mb-6">
                  The password reset link is invalid or has expired. Please request a new one.
                </p>

                <Button
                  variant="primary"
                  fullWidth
                  onClick={() => navigate('/forgot-password')}
                >
                  Request New Link
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Success State
  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-50 px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-600 rounded-2xl mb-4 shadow-lg">
              <Building2 className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              ERP DryMix Products
            </h1>
          </div>

          <Card variant="shadow">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                  <CheckCircle2 className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  Password Reset Successful
                </h2>
                <p className="text-gray-600 mb-6">
                  Your password has been reset successfully. You can now login with your new password.
                </p>

                <Button
                  variant="primary"
                  fullWidth
                  onClick={() => navigate('/login')}
                >
                  Go to Login
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Loading State
  if (isTokenValid === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-50 px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4" />
          <p className="text-gray-600">Verifying reset link...</p>
        </div>
      </div>
    )
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
            Set a new password
          </p>
        </div>

        {/* Reset Password Card */}
        <Card variant="shadow">
          <CardHeader>
            <CardTitle className="text-center">Create New Password</CardTitle>
          </CardHeader>

          <CardContent>
            <p className="text-gray-600 text-sm mb-6 text-center">
              Please enter your new password below.
            </p>

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
                required
                autoComplete="email"
              />

              {/* New Password */}
              <Input
                name="password"
                type="password"
                label="New Password"
                placeholder="Enter new password"
                value={formData.password}
                onChange={handleChange}
                error={errors.password}
                leftIcon={<Lock className="w-5 h-5" />}
                showPasswordToggle
                required
                autoComplete="new-password"
                helperText="Must be 12+ characters with uppercase, lowercase, number, and special character"
              />

              {/* Confirm Password */}
              <Input
                name="password_confirmation"
                type="password"
                label="Confirm New Password"
                placeholder="Confirm new password"
                value={formData.password_confirmation}
                onChange={handleChange}
                error={errors.password_confirmation}
                leftIcon={<Lock className="w-5 h-5" />}
                showPasswordToggle
                required
                autoComplete="new-password"
              />

              {/* Submit Button */}
              <Button
                type="submit"
                variant="primary"
                fullWidth
                size="lg"
                isLoading={isLoading}
              >
                Reset Password
              </Button>
            </form>
          </CardContent>

          <CardFooter>
            {/* Back to Login */}
            <div className="text-center w-full">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Login
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

export default ResetPasswordPage

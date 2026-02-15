import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/Card'
import { Building2, Mail, ArrowLeft, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'
import { authService } from '@/services/auth.service'

// Forgot Password Page
export const ForgotPasswordPage: React.FC = () => {
  // Form State
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | undefined>(undefined)
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  // Validate Email
  const validateEmail = (): boolean => {
    if (!email) {
      setError('Email is required')
      return false
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Invalid email format')
      return false
    }
    setError(undefined)
    return true
  }

  // Handle Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateEmail()) {
      return
    }

    setIsLoading(true)
    try {
      await authService.forgotPassword(email)
      setIsSuccess(true)
      toast.success('If an account exists with this email, a password reset link has been sent.')
    } catch (error: any) {
      console.error('Forgot password error:', error)
      // Still show success for security (don't reveal if email exists)
      setIsSuccess(true)
      toast.info('If an account exists with this email, a password reset link has been sent.')
    } finally {
      setIsLoading(false)
    }
  }

  // Success State
  if (isSuccess) {
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
          </div>

          {/* Success Card */}
          <Card variant="shadow">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                  <CheckCircle2 className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  Check Your Email
                </h2>
                <p className="text-gray-600 mb-6">
                  We've sent a password reset link to{' '}
                  <span className="font-medium text-gray-900">{email}</span>
                </p>
                <p className="text-sm text-gray-500 mb-6">
                  The link will expire in 60 minutes. If you don't receive the email,
                  please check your spam folder or try again.
                </p>

                {/* Back to Login */}
                <Button
                  variant="outline"
                  fullWidth
                  leftIcon={<ArrowLeft className="w-5 h-5" />}
                  onClick={() => (window.location.href = '/login')}
                >
                  Back to Login
                </Button>
              </div>
            </CardContent>
          </Card>
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
            Reset your password
          </p>
        </div>

        {/* Forgot Password Card */}
        <Card variant="shadow">
          <CardHeader>
            <CardTitle className="text-center">Forgot Password?</CardTitle>
          </CardHeader>

          <CardContent>
            <p className="text-gray-600 text-sm mb-6 text-center">
              Enter your email address and we'll send you a link to reset your password.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <Input
                name="email"
                type="email"
                label="Email Address"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  setError(undefined)
                }}
                error={error}
                leftIcon={<Mail className="w-5 h-5" />}
                required
                autoComplete="email"
              />

              {/* Submit Button */}
              <Button
                type="submit"
                variant="primary"
                fullWidth
                size="lg"
                isLoading={isLoading}
              >
                Send Reset Link
              </Button>
            </form>
          </CardContent>

          <CardFooter className="flex-col gap-4">
            {/* Back to Login */}
            <div className="text-center">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Login
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

export default ForgotPasswordPage

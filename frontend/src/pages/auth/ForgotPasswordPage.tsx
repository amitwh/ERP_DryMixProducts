import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '@/services/api'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Mail, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react'

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      await api.post('/auth/forgot-password', { email })
      setIsSuccess(true)
    } catch (err: any) {
      console.error('Forgot password error:', err)
      setError(err.response?.data?.message || 'Failed to send reset link. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <Card variant="bordered" padding="lg">
            <CardContent>
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Check Your Email</h2>
                <p className="text-gray-600 mb-6">
                  We've sent a password reset link to <span className="font-medium">{email}</span>. Please check your inbox and follow the instructions to reset your password.
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  Didn't receive the email? Check your spam folder or
                </p>
                <Button variant="outline" onClick={() => setIsSuccess(false)}>
                  Try Again
                </Button>
              </div>
            </CardContent>
          </Card>
          <p className="mt-6 text-center text-sm text-gray-600">
            <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500 flex items-center justify-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Login
            </Link>
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary-100 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-primary-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Forgot Password?</h1>
          <p className="mt-2 text-gray-600">Enter your email address and we'll send you a link to reset your password.</p>
        </div>

        <Card variant="bordered" padding="lg">
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <p className="text-sm">{error}</p>
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <Button type="submit" variant="primary" className="w-full" disabled={isLoading}>
                {isLoading ? 'Sending...' : 'Send Reset Link'}
              </Button>
            </div>
          </form>
        </Card>

        <p className="mt-6 text-center text-sm text-gray-600">
          Remember your password?{' '}
          <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}

export default ForgotPasswordPage

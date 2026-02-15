import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { User, Mail, Lock, Phone, ArrowRight, Building2 } from 'lucide-react'
import { toast } from 'sonner'

// Register Page
export const RegisterPage: React.FC = () => {
  const navigate = useNavigate()
  const { register, isAuthenticated } = useAuth()

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    password_confirmation: '',
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

    if (!formData.name) {
      newErrors.name = 'Name is required'
    } else if (formData.name.length < 2) {
      newErrors.name = 'Name must be at least 2 characters'
    }

    if (!formData.email) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format'
    }

    if (!formData.phone) {
      newErrors.phone = 'Phone is required'
    } else if (!/^(\+91[\-\s]?)?[0]?(91)?[6789]\d{9}$/.test(formData.phone)) {
      newErrors.phone = 'Invalid Indian phone number'
    }

    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters'
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
      toast.error('Please fix errors in form')
      return
    }

    setIsLoading(true)
    try {
      await register({
        organization_id: Number(formData.organization_id) || 1,
        name: formData.name,
        email: formData.email,
        password: formData.password,
        password_confirmation: formData.password_confirmation,
        phone: formData.phone,
      })
      toast.success('Registration successful! Welcome to ERP.')
      navigate('/dashboard')
    } catch (error: any) {
      console.error('Registration error:', error)
      toast.error(error.message || 'Registration failed. Please try again.')
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
            Create your account
          </p>
        </div>

        {/* Register Card */}
        <Card variant="shadow">
          <CardHeader>
            <CardTitle className="text-center">Register</CardTitle>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name */}
              <Input
                name="name"
                type="text"
                label="Full Name"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleChange}
                error={errors.name}
                leftIcon={<User className="w-5 h-5" />}
                required
                autoComplete="name"
              />

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

              {/* Phone */}
              <Input
                name="phone"
                type="tel"
                label="Phone Number"
                placeholder="Enter your phone number"
                value={formData.phone}
                onChange={handleChange}
                error={errors.phone}
                leftIcon={<Phone className="w-5 h-5" />}
                required
                autoComplete="tel"
              />

              {/* Password */}
              <Input
                name="password"
                type="password"
                label="Password"
                placeholder="Create a password"
                value={formData.password}
                onChange={handleChange}
                error={errors.password}
                leftIcon={<Lock className="w-5 h-5" />}
                showPasswordToggle
                helperText="Minimum 8 characters"
                required
                autoComplete="new-password"
              />

              {/* Confirm Password */}
              <Input
                name="password_confirmation"
                type="password"
                label="Confirm Password"
                placeholder="Confirm your password"
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
                rightIcon={!isLoading && <ArrowRight className="w-5 h-5" />}
              >
                Create Account
              </Button>
            </form>
          </CardContent>

          <div className="px-6 py-4 border-t border-gray-200 text-center">
            <p className="text-sm text-gray-600 mb-2">
              By registering, you agree to our{' '}
              <a href="#" className="text-primary-600 hover:text-primary-700 font-medium">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="#" className="text-primary-600 hover:text-primary-700 font-medium">
                Privacy Policy
              </a>
            </p>
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link
                to="/login"
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                Sign in
              </Link>
            </p>
          </div>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-500">
          <p>© 2026 ERP DryMix Products. All rights reserved.</p>
        </div>
      </div>
    </div>
  )
}

export default RegisterPage

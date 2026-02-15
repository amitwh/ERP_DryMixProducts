import React from 'react'
import { Eye, EyeOff, AlertCircle } from 'lucide-react'
import { cn } from '@/utils'

// Input Props
export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string
  error?: string
  helperText?: string
  size?: 'sm' | 'md' | 'lg'
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  showPasswordToggle?: boolean
}

// Input Component
export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  size = 'md',
  leftIcon,
  rightIcon,
  showPasswordToggle = false,
  type = 'text',
  className,
  id,
  ...props
}) => {
  const [showPassword, setShowPassword] = React.useState(false)
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`

  // Toggle Password Visibility
  const togglePassword = () => setShowPassword(!showPassword)

  // Determine Input Type
  const inputType = showPasswordToggle && type === 'password' ? (showPassword ? 'text' : 'password') : type

  // Size Styles (right padding only, left padding handled separately for icons)
  const sizeStyles: Record<string, string> = {
    sm: 'pr-3 py-1.5 text-sm',
    md: 'pr-4 py-2 text-base',
    lg: 'pr-5 py-3 text-lg',
  }

  // Left padding based on icon presence
  const leftPadding = leftIcon ? 'pl-12' : (size === 'sm' ? 'pl-3' : size === 'lg' ? 'pl-5' : 'pl-4')

  return (
    <div className="w-full">
      {/* Label */}
      {label && (
        <label
          htmlFor={inputId}
          className="block mb-1.5 text-sm font-medium text-gray-700"
        >
          {label}
          {props.required && <span className="text-error-600 ml-1">*</span>}
        </label>
      )}

      {/* Input Wrapper */}
      <div className="relative">
        {/* Left Icon */}
        {leftIcon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
            {leftIcon}
          </div>
        )}

        {/* Input */}
        <input
          id={inputId}
          type={inputType}
          className={cn(
            // Base styles
            'w-full rounded-lg border',
            'text-gray-900 placeholder-gray-500',
            'transition-all duration-200',
            'focus:outline-none focus:ring-2',
            'disabled:opacity-50 disabled:cursor-not-allowed',

            // Size styles (pr-* and py-*)
            sizeStyles[size],

            // Left padding (handles icon spacing)
            leftPadding,

            // Right Icon padding override
            (rightIcon || showPasswordToggle) && 'pr-10',

            // Error styles
            error
              ? 'border-error-500 focus:ring-error-500 focus:border-error-500'
              : 'border-gray-300 focus:ring-primary-500 focus:border-primary-500'
          )}
          {...props}
        />

        {/* Right Icon (Error, Success, or Custom) */}
        {rightIcon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
            {rightIcon}
          </div>
        )}

        {/* Password Toggle */}
        {showPasswordToggle && type === 'password' && !rightIcon && (
          <button
            type="button"
            onClick={togglePassword}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
            tabIndex={-1}
          >
            {showPassword ? (
              <EyeOff className="w-5 h-5" />
            ) : (
              <Eye className="w-5 h-5" />
            )}
          </button>
        )}

        {/* Error Icon */}
        {error && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-error-600">
            <AlertCircle className="w-5 h-5" />
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <p className="mt-1.5 text-sm text-error-600 flex items-center gap-1.5">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </p>
      )}

      {/* Helper Text */}
      {helperText && !error && (
        <p className="mt-1.5 text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  )
}

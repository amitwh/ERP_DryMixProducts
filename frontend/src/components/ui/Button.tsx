import React from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '@/utils'

// Button Props
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'ghost' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  fullWidth?: boolean
}

// Button Component
export const Button: React.FC<ButtonProps> = ({
  children,
  className,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  disabled,
  ...props
}) => {
  // Variant Styles
  const variantStyles: Record<string, string> = {
    primary: 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500',
    secondary: 'bg-secondary-600 text-white hover:bg-secondary-700 focus:ring-secondary-500',
    success: 'bg-success-600 text-white hover:bg-success-700 focus:ring-success-500',
    warning: 'bg-warning-600 text-white hover:bg-warning-700 focus:ring-warning-500',
    danger: 'bg-error-600 text-white hover:bg-error-700 focus:ring-error-500',
    ghost: 'bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-500',
    outline: 'border-2 border-primary-600 text-primary-600 hover:bg-primary-50 focus:ring-primary-500',
  }

  // Size Styles
  const sizeStyles: Record<string, string> = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  }

  return (
    <button
      className={cn(
        // Base styles
        'inline-flex items-center justify-center gap-2 rounded-lg font-medium',
        'transition-all duration-200',
        'focus:outline-none focus:ring-2 focus:ring-offset-2',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        'active:scale-95',

        // Variant styles
        variantStyles[variant],

        // Size styles
        sizeStyles[size],

        // Full width
        fullWidth && 'w-full',

        className
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {/* Left Icon */}
      {leftIcon && !isLoading && <span className="flex-shrink-0">{leftIcon}</span>}

      {/* Loading Spinner */}
      {isLoading && <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" />}

      {/* Children */}
      {children}

      {/* Right Icon */}
      {rightIcon && !isLoading && <span className="flex-shrink-0">{rightIcon}</span>}
    </button>
  )
}

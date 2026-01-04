import React from 'react'
import { CheckCircle, XCircle, Clock, AlertCircle, MinusCircle } from 'lucide-react'
import { cn } from '@/utils'

// Badge Props
export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'rejected' | 'approved'
  size?: 'sm' | 'md' | 'lg'
  icon?: boolean
}

// Badge Component
export const Badge: React.FC<BadgeProps> = ({
  children,
  className,
  variant = 'default',
  size = 'md',
  icon = false,
  ...props
}) => {
  // Variant Styles
  const variantStyles: Record<string, { bg: string; text: string; icon: any }> = {
    default: { bg: 'bg-gray-100', text: 'text-gray-800', icon: null },
    success: { bg: 'bg-success-100', text: 'text-success-800', icon: CheckCircle },
    warning: { bg: 'bg-warning-100', text: 'text-warning-800', icon: AlertCircle },
    error: { bg: 'bg-error-100', text: 'text-error-800', icon: XCircle },
    info: { bg: 'bg-blue-100', text: 'text-blue-800', icon: null },
    pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: Clock },
    in_progress: { bg: 'bg-blue-100', text: 'text-blue-800', icon: Clock },
    completed: { bg: 'bg-success-100', text: 'text-success-800', icon: CheckCircle },
    cancelled: { bg: 'bg-gray-100', text: 'text-gray-800', icon: MinusCircle },
    rejected: { bg: 'bg-error-100', text: 'text-error-800', icon: XCircle },
    approved: { bg: 'bg-success-100', text: 'text-success-800', icon: CheckCircle },
  }

  const styles = variantStyles[variant]

  // Size Styles
  const sizeStyles: Record<string, string> = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base',
  }

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-medium',
        styles.bg,
        styles.text,
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {/* Icon */}
      {icon && styles.icon && (
        <styles.icon className="w-3.5 h-3.5" />
      )}

      {/* Children */}
      {children}
    </div>
  )
}

// Status Badge (Convenience wrapper)
export const StatusBadge: React.FC<{ status: string; showIcon?: boolean } & Omit<BadgeProps, 'variant'>> = ({
  status,
  showIcon = true,
  ...props
}) => {
  // Map status to variant
  const variantMap: Record<string, BadgeProps['variant']> = {
    pending: 'pending',
    in_progress: 'in_progress',
    completed: 'completed',
    cancelled: 'cancelled',
    rejected: 'rejected',
    approved: 'approved',
    failed: 'error',
    success: 'success',
    warning: 'warning',
    error: 'error',
    info: 'info',
  }

  return (
    <Badge variant={variantMap[status] || 'default'} icon={showIcon} {...props}>
      {status.replace('_', ' ').toUpperCase()}
    </Badge>
  )
}

// Test Result Badge
export const TestResultBadge: React.FC<{ result: string; showIcon?: boolean } & Omit<BadgeProps, 'variant'>> = ({
  result,
  showIcon = true,
  ...props
}) => {
  const variantMap: Record<string, BadgeProps['variant']> = {
    pass: 'success',
    fail: 'error',
    marginal: 'warning',
  }

  return (
    <Badge variant={variantMap[result] || 'default'} icon={showIcon} {...props}>
      {result.toUpperCase()}
    </Badge>
  )
}

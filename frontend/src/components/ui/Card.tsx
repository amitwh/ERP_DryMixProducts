import React from 'react'
import { cn } from '@/utils'

// Card Props
export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'bordered' | 'shadow'
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

// Card Component
export const Card: React.FC<CardProps> = ({
  children,
  className,
  variant = 'default',
  padding = 'md',
  ...props
}) => {
  // Variant Styles
  const variantStyles: Record<string, string> = {
    default: 'bg-white',
    bordered: 'bg-white border border-gray-200',
    shadow: 'bg-white shadow-lg',
  }

  // Padding Styles
  const paddingStyles: Record<string, string> = {
    none: 'p-0',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  }

  return (
    <div
      className={cn(
        'rounded-lg',
        variantStyles[variant],
        paddingStyles[padding],
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

// Card Header Component
export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className,
  ...props
}) => {
  return (
    <div className={cn('mb-4', className)} {...props}>
      {children}
    </div>
  )
}

// Card Title Component
export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({
  children,
  className,
  ...props
}) => {
  return (
    <h3
      className={cn('text-lg font-semibold text-gray-900', className)}
      {...props}
    >
      {children}
    </h3>
  )
}

// Card Description Component
export const CardDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({
  children,
  className,
  ...props
}) => {
  return (
    <p
      className={cn('text-sm text-gray-500 mt-1', className)}
      {...props}
    >
      {children}
    </p>
  )
}

// Card Content Component
export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className,
  ...props
}) => {
  return (
    <div className={cn('', className)} {...props}>
      {children}
    </div>
  )
}

// Card Footer Component
export const CardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className,
  ...props
}) => {
  return (
    <div className={cn('mt-4 pt-4 border-t border-gray-200', className)} {...props}>
      {children}
    </div>
  )
}

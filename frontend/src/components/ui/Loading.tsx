import React from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '@/utils'

// Loading Spinner Props
export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  color?: string
  className?: string
}

// Loading Spinner Component (aliased as Loading for backward compatibility)
export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  color = 'currentColor',
  className,
}) => {
  const sizeStyles: Record<string, string> = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12',
  }

  return (
    <Loader2
      className={cn('animate-spin', sizeStyles[size], className)}
      style={{ color }}
    />
  )
}

// Full Page Loading Props
export interface FullPageLoadingProps {
  message?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

// Full Page Loading Component
export const FullPageLoading: React.FC<FullPageLoadingProps> = ({
  message = 'Loading...',
  size = 'lg',
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4">
        <LoadingSpinner size={size} className="text-primary-600" />
        <p className="text-gray-600 font-medium">{message}</p>
      </div>
    </div>
  )
}

// Loading Overlay Props
export interface LoadingOverlayProps {
  isLoading: boolean
  message?: string
  children?: React.ReactNode
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

// Loading Overlay Component
export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  isLoading,
  message = 'Loading...',
  children,
  size = 'md',
  className,
}) => {
  return (
    <div className={cn('relative', className)}>
      {children}

      {isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm rounded-lg">
          <LoadingSpinner size={size} className="text-primary-600" />
          <p className="text-gray-600 font-medium mt-3">{message}</p>
        </div>
      )}
    </div>
  )
}

// Skeleton Props
export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'circular' | 'rectangular'
  width?: string | number
  height?: string | number
  animation?: 'pulse' | 'wave' | 'none'
}

// Skeleton Component
export const Skeleton: React.FC<SkeletonProps> = ({
  variant = 'rectangular',
  width,
  height,
  animation = 'pulse',
  className,
  ...props
}) => {
  const baseStyles = 'bg-gray-200'

  const variantStyles: Record<string, string> = {
    text: 'h-4 w-3/4 rounded',
    circular: 'rounded-full w-10 h-10',
    rectangular: 'rounded-md',
  }

  const animationStyles: Record<string, string> = {
    pulse: 'animate-pulse',
    wave: 'animate-[shimmer_2s_infinite]',
    none: '',
  }

  const style: React.CSSProperties = {
    ...(width && { width: typeof width === 'number' ? `${width}px` : width }),
    ...(height && { height: typeof height === 'number' ? `${height}px` : height }),
  }

  return (
    <div
      className={cn(
        baseStyles,
        variantStyles[variant],
        animationStyles[animation],
        className
      )}
      style={style}
      {...props}
    />
  )
}

// Skeleton Card Component
export const SkeletonCard: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={cn('bg-white rounded-lg p-4 shadow', className)}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <Skeleton variant="circular" width={40} height={40} />
        <div className="flex-1">
          <Skeleton variant="text" height={20} className="mb-2" />
          <Skeleton variant="text" width="60%" height={16} />
        </div>
      </div>

      {/* Content */}
      <Skeleton variant="text" height={16} className="mb-2" />
      <Skeleton variant="text" height={16} className="mb-4" />

      {/* Footer */}
      <div className="flex justify-between items-center pt-4 border-t border-gray-200">
        <Skeleton variant="text" width="30%" height={16} />
        <Skeleton variant="rectangular" width={80} height={32} className="rounded" />
      </div>
    </div>
  )
}

// Skeleton Table Component
export const SkeletonTable: React.FC<{ rows?: number; columns?: number; className?: string }> = ({
  rows = 5,
  columns = 4,
  className,
}) => {
  return (
    <div className={cn('bg-white rounded-lg shadow overflow-hidden', className)}>
      {/* Header */}
      <div className="flex bg-gray-50 px-4 py-3 border-b border-gray-200">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton
            key={`header-${i}`}
            variant="text"
            width={`${100 / columns}%`}
            className="mx-2"
          />
        ))}
      </div>

      {/* Rows */}
      <div className="divide-y divide-gray-200">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={`row-${rowIndex}`} className="flex px-4 py-3">
            {Array.from({ length: columns }).map((_, colIndex) => (
              <Skeleton
                key={`cell-${rowIndex}-${colIndex}`}
                variant="text"
                width={`${Math.random() * 50 + 50}%`}
                className="mx-2"
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

// Add custom shimmer animation to global styles
// This would typically go in index.css
export const SkeletonStyles = () => (
  <style>
    {`
      @keyframes shimmer {
        0% { background-position: -200% 0; }
        100% { background-position: 200% 0; }
      }
      .animate-\\[shimmer_2s_infinite\\] {
        background: linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%);
        background-size: 200% 100%;
        animation: shimmer 2s infinite;
      }
    `}
  </style>
)

// Alias for backward compatibility
export const Loading = LoadingSpinner

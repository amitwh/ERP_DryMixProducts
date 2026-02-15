import { AlertCircle, CheckCircle, Info, XCircle, X } from 'lucide-react'

export type AlertType = 'success' | 'error' | 'warning' | 'info'

interface AlertProps {
  type?: AlertType
  title?: string
  message: string
  dismissible?: boolean
  onDismiss?: () => void
  className?: string
}

const alertStyles = {
  success: { bg: 'bg-green-50', border: 'border-green-200', icon: 'text-green-400' },
  error: { bg: 'bg-red-50', border: 'border-red-200', icon: 'text-red-400' },
  warning: { bg: 'bg-yellow-50', border: 'border-yellow-200', icon: 'text-yellow-400' },
  info: { bg: 'bg-blue-50', border: 'border-blue-200', icon: 'text-blue-400' },
}

const alertIcons = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertCircle,
  info: Info,
}

export function Alert({
  type = 'info',
  title,
  message,
  dismissible = false,
  onDismiss,
  className = '',
}: AlertProps) {
  const style = alertStyles[type]
  const Icon = alertIcons[type]

  return (
    <div className={`${style.bg} ${style.border} border rounded-md p-4 ${className}`}>
      <div className="flex">
        <div className="flex-shrink-0">
          <Icon className={`h-5 w-5 ${style.icon}`} />
        </div>
        <div className="ml-3 flex-1">
          {title && (
            <h3 className="text-sm font-medium text-gray-800">{title}</h3>
          )}
          <div className="text-sm text-gray-700">{message}</div>
        </div>
        {dismissible && onDismiss && (
          <div className="ml-auto pl-3">
            <button
              onClick={onDismiss}
              className="inline-flex rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-gray-600"
            >
              <span className="sr-only">Dismiss</span>
              <X className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
  errorInfo?: ErrorInfo
}

/**
 * Error Boundary Component
 *
 * Catches JavaScript errors in child components,
 * logs those errors, and displays a fallback UI
 */
export class ErrorBoundary extends Component<Props, State> {
  public state: State = { hasError: false }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo)

    // Log to error tracking service in production
    if (import.meta.env.PROD) {
      this.logErrorToService(error, errorInfo)
    }

    this.setState({ errorInfo })
  }

  private logErrorToService = (error: Error, errorInfo: ErrorInfo) => {
    // Send error to Sentry, LogRocket, or custom error tracking service
    // Example for Sentry:
    // Sentry.captureException(error, { extra: { errorInfo } })

    // Example for custom API:
    fetch('/api/error-log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        error: error.toString(),
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent,
      }),
    }).catch(console.error)
  }

  private handleReload = () => {
    window.location.reload()
  }

  private handleGoHome = () => {
    window.location.href = '/'
  }

  public render() {
    if (this.state.hasError) {
      return this.props.fallback || <this.DefaultFallback />
    }

    return this.props.children
  }

  private DefaultFallback = () => (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card variant="bordered" className="max-w-md w-full">
        <CardContent className="p-8">
          <div className="text-center space-y-6">
            {/* Error Icon */}
            <div className="flex justify-center">
              <div className="p-4 bg-error-100 rounded-full">
                <AlertTriangle className="w-12 h-12 text-error-600" />
              </div>
            </div>

            {/* Error Title */}
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-gray-900">
                Something went wrong
              </h1>
              <p className="text-gray-600">
                {this.state.error?.message ||
                  'An unexpected error occurred. Our team has been notified.'}
              </p>
            </div>

            {/* Error Details (Development Only) */}
            {import.meta.env.DEV && this.state.error && (
              <div className="text-left">
                <details className="group">
                  <summary className="cursor-pointer text-sm font-medium text-gray-700 mb-2">
                    Error Details
                    <span className="ml-2 text-gray-400 group-open:rotate-90 inline-block transition-transform">
                      ▶
                    </span>
                  </summary>
                  <div className="mt-2 p-4 bg-gray-100 rounded-lg overflow-auto max-h-48">
                    <pre className="text-xs text-gray-800 whitespace-pre-wrap">
                      {this.state.error.toString()}
                      {'\n\n'}
                      {this.state.errorInfo?.componentStack}
                    </pre>
                  </div>
                </details>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                variant="outline"
                size="sm"
                leftIcon={<RefreshCw className="w-4 h-4" />}
                onClick={this.handleReload}
              >
                Reload Page
              </Button>
              <Button
                variant="primary"
                size="sm"
                leftIcon={<Home className="w-4 h-4" />}
                onClick={this.handleGoHome}
              >
                Go to Dashboard
              </Button>
            </div>

            {/* Support Contact */}
            {import.meta.env.PROD && (
              <p className="text-sm text-gray-600">
                Need help?{' '}
                <a
                  href="mailto:support@erpdrymix.com"
                  className="text-primary-600 hover:text-primary-700 font-medium"
                >
                  Contact Support
                </a>
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

/**
 * Hook to trigger errors programmatically (for testing)
 */
export const useErrorHandler = () => {
  return (error: Error) => {
    throw error
  }
}

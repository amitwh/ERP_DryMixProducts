import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { api } from '@/services/api'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Skeleton } from '@/components/ui/Loading'
import { Plus, Search, TrendingUp, Calendar, BarChart, Package, Target } from 'lucide-react'
import { formatDate } from '@/utils'

interface Forecast {
  id: number
  forecast_number: string
  forecast_type: 'monthly' | 'quarterly' | 'yearly'
  start_date: string
  end_date: string
  product_id?: number
  product_name?: string
  category?: string
  predicted_demand: number
  unit: string
  confidence_level?: number
  status: 'pending' | 'review' | 'approved'
  created_by?: string
  last_updated: string
}

export const DemandForecastPage: React.FC = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [forecasts, setForecasts] = useState<Forecast[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<'all' | 'monthly' | 'quarterly' | 'yearly'>('all')
  const [page, setPage] = useState(1)

  const fetchForecasts = async () => {
    try {
      setIsLoading(true)
      const response = await api.get<{ data: Forecast[] }>('/planning/demand-forecasts', {
        params: {
          organization_id: user?.organization_id,
          per_page: 20,
          page,
        },
      })
      setForecasts(response.data.data || [])
    } catch (error) {
      console.error('Failed to fetch demand forecasts:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchForecasts()
  }, [page])

  const filteredForecasts = forecasts.filter((forecast) => {
    const matchesSearch =
      searchTerm === '' ||
      forecast.forecast_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (forecast.product_name && forecast.product_name.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesStatus = statusFilter === 'all' || forecast.status === statusFilter
    const matchesType = typeFilter === 'all' || forecast.forecast_type === typeFilter
    return matchesSearch && matchesStatus && matchesType
  })

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      review: 'bg-blue-100 text-blue-800',
      approved: 'bg-green-100 text-green-800',
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const getConfidenceColor = (confidence?: number) => {
    if (!confidence) return 'text-gray-600'
    if (confidence >= 80) return 'text-success-600'
    if (confidence >= 60) return 'text-primary-600'
    if (confidence >= 40) return 'text-warning-600'
    return 'text-error-600'
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Demand Forecast</h1>
          <p className="text-gray-600">AI-powered demand forecasting and analysis</p>
        </div>
        <Button
          variant="primary"
          size="sm"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => navigate('/planning/demand-forecasts/create')}
        >
          Generate Forecast
        </Button>
      </div>

      <Card variant="bordered" padding="md">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Search forecasts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            {(['all', 'monthly', 'quarterly', 'yearly'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setTypeFilter(type)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  typeFilter === type
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            {(['all', 'pending', 'review', 'approved'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  statusFilter === status
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </Card>

      <Card variant="bordered" padding="lg">
        <CardHeader>
          <CardTitle>Demand Forecasts</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} height={130} className="rounded" />
              ))}
            </div>
          ) : filteredForecasts.length === 0 ? (
            <div className="text-center py-8">
              <BarChart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">No demand forecasts found</p>
              <Button
                variant="primary"
                size="sm"
                leftIcon={<Plus className="w-4 h-4" />}
                onClick={() => navigate('/planning/demand-forecasts/create')}
              >
                Generate First Forecast
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredForecasts.map((forecast) => (
                <div
                  key={forecast.id}
                  className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                        <TrendingUp className="w-5 h-5 text-primary-600" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-gray-900">{forecast.forecast_number}</span>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(forecast.status)}`}>
                            {forecast.status.toUpperCase()}
                          </span>
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                            {forecast.forecast_type}
                          </span>
                        </div>
                        {forecast.product_name && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Package className="w-3 h-3" />
                            {forecast.product_name}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-2">
                        <Target className="w-4 h-4 text-gray-400" />
                        <p className="font-bold text-gray-900">{forecast.predicted_demand} {forecast.unit}</p>
                      </div>
                      {forecast.confidence_level && (
                        <p className={`text-sm font-medium ${getConfidenceColor(forecast.confidence_level)}`}>
                          {forecast.confidence_level}% confidence
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                    <div>
                      <p className="text-gray-500">Start Date</p>
                      <p className="font-medium text-gray-900">{formatDate(forecast.start_date)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">End Date</p>
                      <p className="font-medium text-gray-900">{formatDate(forecast.end_date)}</p>
                    </div>
                    {forecast.category && (
                      <div>
                        <p className="text-gray-500">Category</p>
                        <p className="font-medium text-gray-900">{forecast.category}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-gray-500">Last Updated</p>
                      <p className="font-medium text-gray-900">{formatDate(forecast.last_updated)}</p>
                    </div>
                  </div>

                  {forecast.confidence_level && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-gray-600">Confidence Level</span>
                        <span className="text-sm font-medium">{forecast.confidence_level}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${
                            forecast.confidence_level >= 80 ? 'bg-success-500' :
                            forecast.confidence_level >= 60 ? 'bg-primary-500' :
                            forecast.confidence_level >= 40 ? 'bg-warning-500' : 'bg-error-500'
                          }`}
                          style={{ width: `${forecast.confidence_level}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex items-center justify-center gap-2">
        <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(page - 1)}>
          Previous
        </Button>
        <span className="px-4 py-2">Page {page}</span>
        <Button variant="outline" size="sm" onClick={() => setPage(page + 1)}>
          Next
        </Button>
      </div>
    </div>
  )
}

export default DemandForecastPage

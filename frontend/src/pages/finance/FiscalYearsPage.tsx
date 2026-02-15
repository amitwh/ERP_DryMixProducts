import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { api } from '@/services/api'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { StatusBadge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Loading'
import { Plus, RefreshCw, Calendar } from 'lucide-react'
import { formatDate } from '@/utils'

interface FiscalYear {
  id: number
  name: string
  start_date: string
  end_date: string
  status: 'upcoming' | 'current' | 'closed'
  is_locked: boolean
  created_at: string
}

export const FiscalYearsPage: React.FC = () => {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [years, setYears] = useState<FiscalYear[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchFiscalYears = async () => {
    try {
      setIsLoading(true)
      const response = await api.get<{ data: FiscalYear[] }>('/finance/fiscal-years', {
        params: {
          organization_id: user?.organization_id,
        },
      })
      setYears(response.data.data || [])
    } catch (error) {
      console.error('Failed to fetch fiscal years:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchFiscalYears()
  }, [])

  const formatDateRange = (start: string, end: string) => {
    return `${formatDate(start)} - ${formatDate(end)}`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Fiscal Years</h1>
          <p className="text-gray-600">Manage fiscal years for financial reporting</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<RefreshCw className="w-4 h-4" />}
            onClick={fetchFiscalYears}
            isLoading={isLoading}
          >
            Refresh
          </Button>
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => navigate('/finance/fiscal-years/create')}
          >
            New Fiscal Year
          </Button>
        </div>
      </div>

      {/* Fiscal Years */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} height={100} className="rounded" />
          ))}
        </div>
      ) : years.length === 0 ? (
        <Card variant="bordered" padding="lg" className="text-center">
          <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 mb-4">No fiscal years found</p>
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => navigate('/finance/fiscal-years/create')}
          >
            Create First Fiscal Year
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {years.map((year) => (
            <Card
              key={year.id}
              variant="bordered"
              padding="lg"
              className={`hover:shadow-lg transition-shadow cursor-pointer ${
                year.status === 'current' ? 'border-primary-500 border-2' : ''
              }`}
            >
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">{year.name}</h3>
                    <StatusBadge status={year.status} />
                  </div>
                  {year.is_locked && (
                    <div className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs font-medium">
                      Locked
                    </div>
                  )}
                </div>

                {/* Date Range */}
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDateRange(year.start_date, year.end_date)}</span>
                </div>

                {/* Status Details */}
                <div className="pt-4 border-t border-gray-200">
                  {year.status === 'current' && (
                    <p className="text-sm text-primary-600 font-medium">
                      This is the current active fiscal year
                    </p>
                  )}
                  {year.status === 'upcoming' && (
                    <p className="text-sm text-gray-600">
                      Starts on {formatDate(year.start_date)}
                    </p>
                  )}
                  {year.status === 'closed' && (
                    <p className="text-sm text-gray-600">
                      Ended on {formatDate(year.end_date)}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      View Details
                    </Button>
                    {year.status === 'current' && !year.is_locked && (
                      <Button variant="success" size="sm" className="flex-1">
                        Close Year
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Statistics */}
      {years.length > 0 && (
        <Card variant="bordered" padding="lg">
          <CardHeader>
            <CardTitle>Fiscal Year Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-success-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Active Year</p>
                <p className="text-2xl font-bold text-success-600">
                  {years.filter((y) => y.status === 'current').length}
                </p>
              </div>
              <div className="text-center p-4 bg-warning-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Upcoming Years</p>
                <p className="text-2xl font-bold text-warning-600">
                  {years.filter((y) => y.status === 'upcoming').length}
                </p>
              </div>
              <div className="text-center p-4 bg-gray-100 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Closed Years</p>
                <p className="text-2xl font-bold text-gray-900">
                  {years.filter((y) => y.status === 'closed').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default FiscalYearsPage

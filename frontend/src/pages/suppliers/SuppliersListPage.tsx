import React, { useState, useMemo, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Search, Plus, Star, Download, Filter, MoreHorizontal,
  Phone, Mail, MapPin, Building2, ChevronLeft, ChevronRight
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { StatusBadge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Loading'
import { api } from '@/services/api'
import { toast } from 'sonner'
import { formatDate } from '@/utils'

// Types
interface Supplier {
  id: number
  code: string
  name: string
  contact_person: string | null
  email: string | null
  phone: string | null
  mobile: string | null
  address: string | null
  city: string | null
  state: string | null
  country: string
  postal_code: string | null
  gst_number: string | null
  pan_number: string | null
  category: string
  payment_days: number
  payment_method: string | null
  bank_name: string | null
  account_number: string | null
  ifsc_code: string | null
  rating: number
  status: string
  created_at: string
  updated_at: string
}

interface PaginatedResponse {
  data: Supplier[]
  current_page: number
  last_page: number
  per_page: number
  total: number
}

// Status Badge Component
const SupplierStatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const statusConfig: Record<string, { color: string; bg: string }> = {
    active: { color: 'text-green-800', bg: 'bg-green-100' },
    inactive: { color: 'text-gray-800', bg: 'bg-gray-100' },
    blocked: { color: 'text-red-800', bg: 'bg-red-100' },
    pending: { color: 'text-yellow-800', bg: 'bg-yellow-100' },
  }
  const config = statusConfig[status] || statusConfig.pending
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.color}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  )
}

// Rating Stars Component
const RatingStars: React.FC<{ rating: number }> = ({ rating }) => {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={14}
          fill={star <= rating ? 'currentColor' : 'none'}
          className={star <= rating ? 'text-yellow-400' : 'text-gray-300'}
        />
      ))}
      <span className="ml-1 text-xs text-gray-500">({rating})</span>
    </div>
  )
}

// Category options
const CATEGORIES = [
  'Raw Material',
  'Packaging',
  'Chemicals',
  'Equipment',
  'Services',
  'Logistics',
  'Maintenance',
  'Other'
]

export const SuppliersListPage: React.FC = () => {
  const navigate = useNavigate()

  // State
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterCity, setFilterCity] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [perPage, setPerPage] = useState(10)
  const [showFilters, setShowFilters] = useState(false)

  // Fetch Suppliers
  const fetchSuppliers = async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      params.append('page', currentPage.toString())
      params.append('per_page', perPage.toString())
      if (searchTerm) params.append('search', searchTerm)
      if (filterCategory !== 'all') params.append('category', filterCategory)
      if (filterStatus !== 'all') params.append('status', filterStatus)
      if (filterCity !== 'all') params.append('city', filterCity)

      const response = await api.get<PaginatedResponse>(`/suppliers?${params.toString()}`)
      setSuppliers(response.data.data || [])
      setTotalPages(response.data.last_page || 1)
      setTotalItems(response.data.total || 0)
    } catch (error) {
      console.error('Failed to fetch suppliers:', error)
      toast.error('Failed to load suppliers')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchSuppliers()
  }, [currentPage, perPage, filterCategory, filterStatus, filterCity])

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentPage === 1) {
        fetchSuppliers()
      } else {
        setCurrentPage(1)
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [searchTerm])

  // Get unique cities for filter
  const cities = useMemo(() => {
    const uniqueCities = [...new Set(suppliers.map(s => s.city).filter(Boolean))]
    return uniqueCities.sort()
  }, [suppliers])

  // Export to Excel
  const handleExport = async () => {
    try {
      toast.info('Exporting suppliers...')
      // TODO: Implement export API
      await new Promise(resolve => setTimeout(resolve, 1000))
      toast.success('Export completed')
    } catch (error) {
      toast.error('Export failed')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Suppliers</h1>
          <p className="text-sm text-gray-500">Manage your supplier database and track performance</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button onClick={() => navigate('/procurement/suppliers/create')}>
            <Plus className="w-4 h-4 mr-2" />
            Add Supplier
          </Button>
        </div>
      </div>

      {/* Filters Card */}
      <Card variant="bordered">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by name, code, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Quick Filters */}
            <div className="flex flex-wrap gap-2">
              <select
                className="h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
              >
                <option value="all">All Categories</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>

              <select
                className="h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="blocked">Blocked</option>
                <option value="pending">Pending</option>
              </select>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="w-4 h-4 mr-2" />
                More Filters
              </Button>
            </div>
          </div>

          {/* Extended Filters */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200 flex flex-wrap gap-4">
              <select
                className="h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                value={filterCity}
                onChange={(e) => setFilterCity(e.target.value)}
              >
                <option value="all">All Cities</option>
                {cities.map((city) => (
                  <option key={city} value={city!}>{city}</option>
                ))}
              </select>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setFilterCategory('all')
                  setFilterStatus('all')
                  setFilterCity('all')
                  setSearchTerm('')
                }}
              >
                Clear Filters
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Table */}
      <Card variant="bordered">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-700 font-medium border-b border-gray-200">
              <tr>
                <th className="px-6 py-4">Code</th>
                <th className="px-6 py-4">Supplier</th>
                <th className="px-6 py-4">Contact</th>
                <th className="px-6 py-4">City</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Rating</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {isLoading ? (
                // Loading skeleton
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td className="px-6 py-4"><Skeleton height={16} width={80} /></td>
                    <td className="px-6 py-4"><Skeleton height={16} width={150} /></td>
                    <td className="px-6 py-4"><Skeleton height={16} width={120} /></td>
                    <td className="px-6 py-4"><Skeleton height={16} width={80} /></td>
                    <td className="px-6 py-4"><Skeleton height={16} width={100} /></td>
                    <td className="px-6 py-4"><Skeleton height={16} width={80} /></td>
                    <td className="px-6 py-4"><Skeleton height={24} width={60} /></td>
                    <td className="px-6 py-4"><Skeleton height={16} width={60} /></td>
                  </tr>
                ))
              ) : suppliers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                    <Building2 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p className="font-medium">No suppliers found</p>
                    <p className="text-sm">Try adjusting your search or filters</p>
                  </td>
                </tr>
              ) : (
                suppliers.map((supplier) => (
                  <tr
                    key={supplier.id}
                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => navigate(`/procurement/suppliers/${supplier.id}`)}
                  >
                    <td className="px-6 py-4">
                      <span className="font-medium text-gray-900">{supplier.code}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-gray-900">{supplier.name}</div>
                        {supplier.email && (
                          <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                            <Mail className="w-3 h-3" />
                            {supplier.email}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-gray-900">{supplier.contact_person || '-'}</div>
                        {supplier.phone && (
                          <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                            <Phone className="w-3 h-3" />
                            {supplier.phone}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {supplier.city ? (
                        <div className="flex items-center gap-1 text-gray-600">
                          <MapPin className="w-3 h-3" />
                          {supplier.city}
                        </div>
                      ) : '-'}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-medium">
                        {supplier.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <RatingStars rating={supplier.rating || 0} />
                    </td>
                    <td className="px-6 py-4">
                      <SupplierStatusBadge status={supplier.status} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            navigate(`/procurement/suppliers/${supplier.id}`)
                          }}
                        >
                          View
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            navigate(`/procurement/suppliers/${supplier.id}/edit`)
                          }}
                        >
                          Edit
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">
              Showing {((currentPage - 1) * perPage) + 1} to {Math.min(currentPage * perPage, totalItems)} of {totalItems} results
            </span>
            <select
              className="h-8 rounded border border-gray-300 bg-white px-2 text-sm"
              value={perPage}
              onChange={(e) => {
                setPerPage(Number(e.target.value))
                setCurrentPage(1)
              }}
            >
              <option value={10}>10 per page</option>
              <option value={25}>25 per page</option>
              <option value={50}>50 per page</option>
              <option value={100}>100 per page</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum = i + 1
                if (totalPages > 5) {
                  if (currentPage > 3) {
                    pageNum = currentPage - 2 + i
                  }
                  if (currentPage > totalPages - 2) {
                    pageNum = totalPages - 4 + i
                  }
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-8 h-8 rounded text-sm font-medium ${
                      currentPage === pageNum
                        ? 'bg-primary-600 text-white'
                        : 'hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    {pageNum}
                  </button>
                )
              })}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages || totalPages === 0}
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default SuppliersListPage

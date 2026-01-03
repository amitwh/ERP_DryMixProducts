import React, { useState, useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Loading } from '@/components/ui/Loading'
import { KPICard } from '@/components/KPICard'

interface Organization {
  id: number
  name: string
  code: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  country: string
  status: string
  users_count: number
  units_count: number
  created_at: string
}

const OrganizationsPage: React.FC = () => {
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)

  useEffect(() => {
    fetchOrganizations()
  }, [])

  const fetchOrganizations = async () => {
    try {
      setLoading(true)
      // const response = await SystemService.getOrganizations()
      setOrganizations([])
    } catch (error) {
      console.error('Failed to fetch organizations:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <Loading message="Loading organizations..." />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Organizations</h1>
          <p className="text-gray-600">Manage organizations and their configurations</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>Create Organization</Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <KPICard title="Total Organizations" value={organizations.length} icon="🏢" />
        <KPICard title="Active Organizations" value={organizations.filter(o => o.status === 'active').length} icon="✅" />
        <KPICard title="Total Users" value={organizations.reduce((acc, o) => acc + o.users_count, 0)} icon="👥" />
        <KPICard title="Total Units" value={organizations.reduce((acc, o) => acc + o.units_count, 0)} icon="🏭" />
      </div>

      {/* Organizations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {organizations.length === 0 ? (
          <Card className="col-span-full p-12 text-center text-gray-500">
            No organizations found. Create your first organization.
          </Card>
        ) : (
          organizations.map((org) => (
            <Card key={org.id} className="hover:shadow-lg transition-shadow">
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold text-gray-900">{org.name}</h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        org.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {org.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">Code: {org.code}</p>
                    <div className="mt-4 space-y-2 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <span>📧</span>
                        <span className="truncate">{org.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span>📞</span>
                        <span>{org.phone || 'N/A'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span>📍</span>
                        <span>{org.city}, {org.state}, {org.country}</span>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-gray-600">Users</div>
                        <div className="text-lg font-semibold text-gray-900">{org.users_count}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Units</div>
                        <div className="text-lg font-semibold text-gray-900">{org.units_count}</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                  <Button variant="secondary" size="sm" className="flex-1">Edit</Button>
                  <Button variant="primary" size="sm" className="flex-1">View Details</Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}

export default OrganizationsPage

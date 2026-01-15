import React, { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Form } from '@/components/ui/Form'
import { MapPin, Phone, Mail as MailIcon, Calendar } from 'lucide-react'

export default function ProjectsPage() {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const formFields = [
    {
      name: 'project_name',
      label: 'Project Name *',
      type: 'text' as const,
      placeholder: 'Enter project name',
      required: true,
    },
    {
      name: 'customer_id',
      label: 'Customer *',
      type: 'select' as const,
      options: [
        { value: '1', label: 'ABC Construction Pvt Ltd' },
        { value: '2', label: 'XYZ Builders' },
        { value: '3', label: 'LMN Infrastructure' },
      ],
      required: true,
    },
    {
      name: 'project_code',
      label: 'Project Code',
      type: 'text' as const,
      placeholder: 'PRJ-001',
      required: true,
    },
    {
      name: 'start_date',
      label: 'Start Date *',
      type: 'date' as const,
      required: true,
    },
    {
      name: 'end_date',
      label: 'End Date',
      type: 'date' as const,
    },
    {
      name: 'location',
      label: 'Location',
      type: 'text' as const,
      placeholder: 'Enter project location',
    },
    {
      name: 'contact_person',
      label: 'Contact Person',
      type: 'text' as const,
      placeholder: 'Enter contact person name',
    },
    {
      name: 'contact_phone',
      label: 'Contact Phone',
      type: 'text' as const,
      placeholder: 'Enter contact phone number',
    },
    {
      name: 'contact_email',
      label: 'Contact Email',
      type: 'email' as const,
      placeholder: 'Enter contact email',
    },
    {
      name: 'description',
      label: 'Description',
      type: 'textarea' as const,
      placeholder: 'Enter project description...',
    },
  ]

  const handleSubmit = async (data: any) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/v1/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const result = await response.json()
      if (result.success) {
        alert('Project created successfully!')
        navigate(`/sales/projects`)
      } else {
        setError(result.message || 'Failed to create project')
      }
    } catch (err) {
      setError('Failed to create project. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Create Project</h1>
          <p className="text-gray-600">Create a new customer project</p>
        </div>
      </div>

      {error && (
        <Alert type="error" message={error} onDismiss={() => setError(null)} />
      )}

      <Form
        fields={formFields}
        onSubmit={handleSubmit}
        submitButtonText="Create Project"
        submitLoading={isLoading}
        onCancel={() => navigate('/sales/projects')}
      />
    </div>
  )
}

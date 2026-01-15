import React, { useState } from 'react'
import { Badge } from './Badge'
import { Button } from './Button'

type StatusType = 'draft' | 'active' | 'inactive' | 'pending' | 'completed' | 'rejected' | 'approved' | 'in-progress' | 'on-hold' | 'cancelled'

interface StatusBadgeProps {
  status: StatusType | string
  className?: string
}

const statusStyles: Record<StatusType, { bg: string; text: string }> = {
  draft: { bg: 'bg-gray-100', text: 'text-gray-800' },
  active: { bg: 'bg-green-100', text: 'text-green-800' },
  inactive: { bg: 'bg-red-100', text: 'text-red-800' },
  pending: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
  completed: { bg: 'bg-blue-100', text: 'text-blue-800' },
  rejected: { bg: 'bg-red-100', text: 'text-red-800' },
  approved: { bg: 'bg-green-100', text: 'text-green-800' },
  'in-progress': { bg: 'bg-purple-100', text: 'text-purple-800' },
  'on-hold': { bg: 'bg-orange-100', text: 'text-orange-800' },
  cancelled: { bg: 'bg-gray-100', text: 'text-gray-800' },
}

export function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const style = statusStyles[status as StatusType] || statusStyles.draft
  const displayStatus = status.replace('-', ' ').replace(/\b\w/g, (c) => c.toUpperCase())
  
  return (
    <Badge className={`${style.bg} ${style.text} ${className}`}>
      {displayStatus}
    </Badge>
  )
}

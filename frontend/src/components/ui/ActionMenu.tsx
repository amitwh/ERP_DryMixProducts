import React, { useState } from 'react'
import { Menu, Transition } from '@headlessui/react'
import { ChevronDown, Download, Printer, MoreVertical, Pencil, Trash2, Eye, FileText, RefreshCw } from 'lucide-react'
import { Button } from './Button'

type ActionItem = {
  id: string
  label: string
  icon?: React.ComponentType<{ className?: string }>
  onClick?: () => void
  disabled?: boolean
  danger?: boolean
}

interface ActionMenuProps {
  items: ActionItem[]
  position?: 'left' | 'right'
}

export function ActionMenu({ items, position = 'right' }: ActionMenuProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Menu as="div" className="relative inline-block text-left">
      <div>
        <Menu.Button className="inline-flex items-center p-2 rounded-full hover:bg-gray-100 transition-colors">
          <MoreVertical className="h-4 w-4 text-gray-600" />
        </Menu.Button>
      </div>

      <Transition
        as={React.Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items
          className={`absolute ${position === 'right' ? 'right-0' : 'left-0'} z-50 mt-2 w-56 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none`}
        >
          <div className="py-1">
            {items.map((item) => (
              <Menu.Item key={item.id}>
                {({ active, disabled }) => (
                  <button
                    onClick={() => {
                      item.onClick?.()
                      setIsOpen(false)
                    }}
                    disabled={disabled || item.disabled}
                    className={`${
                      active ? 'bg-gray-100' : ''
                    } ${item.danger ? 'text-red-600' : 'text-gray-700'} ${
                      disabled || item.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                    } group flex items-center px-4 py-2 text-sm w-full`}
                  >
                    {item.icon && (
                      <item.icon className="mr-3 h-4 w-4 text-gray-400 group-hover:text-gray-500" />
                    )}
                    {item.label}
                  </button>
                )}
              </Menu.Item>
            ))}
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  )
}

interface QuickActionsProps {
  onView?: () => void
  onEdit?: () => void
  onDelete?: () => void
  onPrint?: () => void
  onDownload?: () => void
  onRefresh?: () => void
  extraActions?: ActionItem[]
}

export function QuickActions({
  onView,
  onEdit,
  onDelete,
  onPrint,
  onDownload,
  onRefresh,
  extraActions = [],
}: QuickActionsProps) {
  const items: ActionItem[] = [
    ...(onView ? [{ id: 'view', label: 'View', icon: Eye, onClick: onView }] : []),
    ...(onEdit ? [{ id: 'edit', label: 'Edit', icon: Pencil, onClick: onEdit }] : []),
    ...(onDelete ? [{ id: 'delete', label: 'Delete', icon: Trash2, onClick: onDelete, danger: true }] : []),
    ...(onPrint ? [{ id: 'print', label: 'Print', icon: Printer, onClick: onPrint }] : []),
    ...(onDownload ? [{ id: 'download', label: 'Download', icon: Download, onClick: onDownload }] : []),
    ...(onRefresh ? [{ id: 'refresh', label: 'Refresh', icon: RefreshCw, onClick: onRefresh }] : []),
    ...extraActions,
  ]

  return <ActionMenu items={items} />
}

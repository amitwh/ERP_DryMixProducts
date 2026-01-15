import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from './Button'
import { Input } from './Input'

type FormField = {
  name: string
  label: string
  type?: 'text' | 'number' | 'email' | 'password' | 'date' | 'select' | 'textarea' | 'checkbox' | 'file'
  placeholder?: string
  required?: boolean
  options?: { value: string | number; label: string }[]
  validation?: z.ZodTypeAny
  readonly?: boolean
  disabled?: boolean
}

type FormProps = {
  fields: FormField[]
  onSubmit: (data: any) => void
  defaultValues?: Record<string, any>
  submitButtonText?: string
  submitDisabled?: boolean
  submitLoading?: boolean
  onCancel?: () => void
  isLoading?: boolean
}

export function Form({
  fields,
  onSubmit,
  defaultValues,
  submitButtonText = 'Submit',
  submitDisabled = false,
  submitLoading = false,
  onCancel,
  isLoading = false,
}: FormProps) {
  const validationSchema = React.useMemo(() => {
    const schemaObj: Record<string, z.ZodTypeAny> = {}
    fields.forEach((field) => {
      if (field.validation) {
        schemaObj[field.name] = field.required
          ? field.validation
          : field.validation.optional()
      } else if (field.required) {
        schemaObj[field.name] = z.string().min(1, `${field.label} is required`)
      } else {
        schemaObj[field.name] = z.string().optional()
      }
    })
    return z.object(schemaObj)
  }, [fields])

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(validationSchema),
    defaultValues,
  })

  React.useEffect(() => {
    if (defaultValues) {
      reset(defaultValues)
    }
  }, [defaultValues, reset])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-t-2 border-primary-600" />
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {fields.map((field) => (
          <div
            key={field.name}
            className={field.type === 'textarea' ? 'md:col-span-2' : ''}
          >
            <label
              htmlFor={field.name}
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            
            {field.type === 'select' ? (
              <select
                id={field.name}
                {...register(field.name)}
                disabled={field.disabled || field.readonly}
                className="w-full rounded-md border-gray-300 border shadow-sm focus:border-primary-500 focus:ring-primary-500 px-4 py-2"
              >
                <option value="">Select {field.label}</option>
                {field.options?.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            ) : field.type === 'textarea' ? (
              <textarea
                id={field.name}
                {...register(field.name)}
                disabled={field.disabled || field.readonly}
                placeholder={field.placeholder}
                rows={4}
                className="w-full rounded-md border-gray-300 border shadow-sm focus:border-primary-500 focus:ring-primary-500 px-4 py-2"
              />
            ) : field.type === 'checkbox' ? (
              <div className="flex items-center mt-2">
                <input
                  id={field.name}
                  type="checkbox"
                  {...register(field.name)}
                  disabled={field.disabled || field.readonly}
                  className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
              </div>
            ) : field.type === 'file' ? (
              <input
                id={field.name}
                type="file"
                {...register(field.name)}
                disabled={field.disabled}
                className="w-full rounded-md border-gray-300 border shadow-sm focus:border-primary-500 focus:ring-primary-500"
              />
            ) : (
              <input
                id={field.name}
                type={field.type || 'text'}
                {...register(field.name)}
                disabled={field.disabled || field.readonly}
                placeholder={field.placeholder}
                readOnly={field.readonly}
                className="w-full rounded-md border-gray-300 border shadow-sm focus:border-primary-500 focus:ring-primary-500 px-4 py-2"
              />
            )}
            
            {errors[field.name] && (
              <p className="mt-2 text-sm text-red-600">
                {errors[field.name]?.message as string}
              </p>
            )}
          </div>
        ))}
      </div>

      <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          disabled={submitDisabled || submitLoading}
        >
          {submitLoading ? 'Submitting...' : submitButtonText}
        </Button>
      </div>
    </form>
  )
}

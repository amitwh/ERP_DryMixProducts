import { z } from 'zod'

/**
 * Customer validation schema
 */
export const customerSchema = z.object({
  customer_code: z
    .string()
    .min(1, 'Customer code is required')
    .max(50, 'Customer code must not exceed 50 characters')
    .regex(/^[A-Z0-9-]+$/, 'Customer code must contain only uppercase letters, numbers, and hyphens'),
  name: z
    .string()
    .min(2, 'Customer name must be at least 2 characters')
    .max(255, 'Customer name must not exceed 255 characters'),
  address: z
    .string()
    .min(5, 'Address is required')
    .max(500, 'Address must not exceed 500 characters'),
  phone: z
    .string()
    .min(10, 'Phone number must be at least 10 digits')
    .max(20, 'Phone number must not exceed 20 digits')
    .regex(/^[+]?[\d\s-()]+$/, 'Invalid phone number format'),
  email: z
    .string()
    .email('Invalid email address')
    .max(255, 'Email must not exceed 255 characters')
    .optional()
    .or(z.literal('')),
  contact_person: z
    .string()
    .min(2, 'Contact person name must be at least 2 characters')
    .max(255, 'Contact person name must not exceed 255 characters')
    .optional(),
  payment_terms: z
    .string()
    .default('30')
    .refine(
      (val) => {
        const num = parseInt(val)
        return !isNaN(num) && num > 0 && num <= 365
      },
      'Payment terms must be between 1 and 365 days'
    ),
  credit_limit: z
    .string()
    .min(1, 'Credit limit is required')
    .refine(
      (val) => {
        const num = parseFloat(val)
        return !isNaN(num) && num >= 0
      },
      'Credit limit must be a positive number'
    ),
})

export type CustomerFormData = z.infer<typeof customerSchema>

/**
 * Product validation schema
 */
export const productSchema = z.object({
  code: z
    .string()
    .min(1, 'Product code is required')
    .max(50, 'Product code must not exceed 50 characters')
    .regex(/^[A-Z0-9-]+$/, 'Product code must contain only uppercase letters, numbers, and hyphens'),
  name: z
    .string()
    .min(2, 'Product name must be at least 2 characters')
    .max(255, 'Product name must not exceed 255 characters'),
  category: z
    .string()
    .min(1, 'Category is required')
    .max(100, 'Category must not exceed 100 characters'),
  unit_of_measure: z
    .string()
    .min(1, 'Unit of measure is required')
    .max(20, 'Unit of measure must not exceed 20 characters'),
  standard_cost: z
    .string()
    .min(1, 'Standard cost is required')
    .refine(
      (val) => {
        const num = parseFloat(val)
        return !isNaN(num) && num >= 0
      },
      'Standard cost must be a positive number'
    ),
  selling_price: z
    .string()
    .min(1, 'Selling price is required')
    .refine(
      (val) => {
        const num = parseFloat(val)
        return !isNaN(num) && num >= 0
      },
      'Selling price must be a positive number'
    ),
  minimum_stock: z
    .string()
    .default('0')
    .refine(
      (val) => {
        const num = parseFloat(val)
        return !isNaN(num) && num >= 0
      },
      'Minimum stock must be a positive number'
    ),
  reorder_level: z
    .string()
    .default('0')
    .refine(
      (val) => {
        const num = parseFloat(val)
        return !isNaN(num) && num >= 0
      },
      'Reorder level must be a positive number'
    ),
  gst_rate: z
    .string()
    .default('18')
    .refine(
      (val) => {
        const num = parseFloat(val)
        return !isNaN(num) && num >= 0 && num <= 100
      },
      'GST rate must be between 0 and 100'
    ),
  description: z
    .string()
    .max(2000, 'Description must not exceed 2000 characters')
    .optional()
    .or(z.literal('')),
})

export type ProductFormData = z.infer<typeof productSchema>

/**
 * Login validation schema
 */
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email address'),
  password: z
    .string()
    .min(1, 'Password is required'),
})

export type LoginFormData = z.infer<typeof loginSchema>

/**
 * Register validation schema
 */
export const registerSchema = z.object({
  organization_id: z
    .number()
    .int('Organization ID must be a valid integer')
    .positive('Organization ID must be a positive number'),
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(255, 'Name must not exceed 255 characters'),
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email address'),
  password: z
    .string()
    .min(12, 'Password must be at least 12 characters long')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[@$!%*#?&]/, 'Password must contain at least one special character (@$!%*#?&)'),
  password_confirmation: z
    .string()
    .min(1, 'Password confirmation is required'),
  phone: z
    .string()
    .min(10, 'Phone number must be at least 10 digits')
    .max(20, 'Phone number must not exceed 20 digits')
    .regex(/^[+]?[\d\s-()]+$/, 'Invalid phone number format')
    .optional(),
}).refine((data) => data.password === data.password_confirmation, {
  message: 'Passwords do not match',
  path: ['password_confirmation'],
})

export type RegisterFormData = z.infer<typeof registerSchema>

/**
 * Sales order validation schema
 */
export const salesOrderSchema = z.object({
  customer_id: z
    .number()
    .int('Customer ID must be a valid integer')
    .positive('Customer is required'),
  project_id: z
    .number()
    .int('Project ID must be a valid integer')
    .positive('Project ID must be a positive number')
    .optional(),
  order_date: z
    .string()
    .min(1, 'Order date is required')
    .refine(
      (val) => {
        const date = new Date(val)
        return !isNaN(date.getTime())
      },
      'Invalid order date'
    ),
  expected_delivery_date: z
    .string()
    .min(1, 'Expected delivery date is required')
    .refine(
      (val) => {
        const date = new Date(val)
        return !isNaN(date.getTime())
      },
      'Invalid expected delivery date'
    )
    .optional(),
  shipping_address: z
    .string()
    .min(5, 'Shipping address is required')
    .max(500, 'Shipping address must not exceed 500 characters'),
  payment_terms: z
    .string()
    .default('30')
    .refine(
      (val) => {
        const num = parseInt(val)
        return !isNaN(num) && num > 0 && num <= 365
      },
      'Payment terms must be between 1 and 365 days'
    ),
  notes: z
    .string()
    .max(2000, 'Notes must not exceed 2000 characters')
    .optional()
    .or(z.literal('')),
})

export type SalesOrderFormData = z.infer<typeof salesOrderSchema>

/**
 * Password change validation schema
 */
export const passwordChangeSchema = z.object({
  current_password: z
    .string()
    .min(1, 'Current password is required'),
  password: z
    .string()
    .min(12, 'Password must be at least 12 characters long')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[@$!%*#?&]/, 'Password must contain at least one special character (@$!%*#?&)'),
  password_confirmation: z
    .string()
    .min(1, 'Password confirmation is required'),
}).refine((data) => data.password === data.password_confirmation, {
  message: 'Passwords do not match',
  path: ['password_confirmation'],
})

export type PasswordChangeFormData = z.infer<typeof passwordChangeSchema>

/**
 * Search filter schema
 */
export const searchFilterSchema = z.object({
  search: z
    .string()
    .max(255, 'Search term must not exceed 255 characters')
    .optional(),
  status: z
    .enum(['draft', 'confirmed', 'processing', 'completed', 'cancelled'])
    .optional(),
  date_from: z
    .string()
    .optional(),
  date_to: z
    .string()
    .optional(),
  page: z
    .number()
    .int()
    .positive()
    .default(1),
  per_page: z
    .number()
    .int()
    .positive()
    .max(100)
    .default(15),
})

export type SearchFilterFormData = z.infer<typeof searchFilterSchema>

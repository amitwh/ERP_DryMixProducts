// Common Types

// Pagination
export interface PaginationParams {
  page?: number
  per_page?: number
  sort_by?: string
  sort_order?: 'asc' | 'desc'
}

export interface PaginationMeta {
  current_page: number
  from?: number
  last_page: number
  per_page: number
  to?: number
  total: number
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: PaginationMeta
  links?: {
    first?: string
    last?: string
    prev?: string | null
    next?: string | null
  }
}

// API Response
export interface ApiResponse<T = any> {
  success: boolean
  data: T
  message?: string
  errors?: Record<string, string[]>
}

// Status Types
export type Status = 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'failed' | 'approved' | 'rejected'
export type TestStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled'
export type TestResult = 'pass' | 'fail' | 'marginal'

// Common Entity Types
export interface Organization {
  id: number
  name: string
  code?: string
  address?: string
  phone?: string
  email?: string
  website?: string
  logo?: string
  currency?: string
  timezone?: string
  settings?: Record<string, any>
  created_at?: string
}

export interface User {
  id: number
  name: string
  email: string
  phone?: string
  avatar?: string
  role?: string
  permissions?: string[]
  organization_id?: number
  organization?: Organization
  department_id?: number
  designation_id?: number
  is_active?: boolean
  last_login_at?: string
  created_at?: string
}

export interface Role {
  id: number
  name: string
  slug?: string
  description?: string
  permissions?: Permission[]
  is_system?: boolean
  created_at?: string
}

export interface Permission {
  id: number
  name: string
  slug?: string
  module?: string
  description?: string
  created_at?: string
}

// Product & Customer Types
export interface Product {
  id: number
  name: string
  code?: string
  type?: string
  category?: string
  description?: string
  unit?: string
  price?: number
  cost?: number
  organization_id?: number
  manufacturing_unit_id?: number
  attributes?: Record<string, any>
  images?: string[]
  is_active?: boolean
  created_at?: string
}

export interface Customer {
  id: number
  name: string
  customer_code?: string
  address?: string
  phone?: string
  email?: string
  contact_person?: string
  payment_terms?: string
  credit_limit?: number
  outstanding_balance?: number
  organization_id?: number
  sales_orders?: SalesOrder[]
  invoices?: Invoice[]
  created_at?: string
}

// Sales Types
export interface SalesOrder {
  id: number
  order_number: string
  order_date: string
  customer_id: number
  customer?: Customer
  items?: SalesOrderItem[]
  total_amount: number
  tax_amount?: number
  grand_total?: number
  status: Status
  shipping_address?: string
  remarks?: string
  organization_id?: number
  manufacturing_unit_id?: number
  created_at?: string
}

export interface SalesOrderItem {
  id: number
  sales_order_id: number
  product_id: number
  product?: Product
  quantity: number
  unit_price: number
  total_amount: number
  specifications?: string
}

export interface Invoice {
  id: number
  invoice_number: string
  invoice_date: string
  due_date?: string
  customer_id: number
  customer?: Customer
  order_id?: number
  order?: SalesOrder
  items?: InvoiceItem[]
  total_amount: number
  tax_amount?: number
  grand_total?: number
  paid_amount?: number
  balance_amount?: number
  status: Status
  organization_id?: number
  created_at?: string
}

export interface InvoiceItem {
  id: number
  invoice_id: number
  product_id: number
  product?: Product
  quantity: number
  unit_price: number
  total_amount: number
}

// Quality Control Types
export interface DryMixProductTest {
  id: number
  test_number: string
  test_date: string
  product_id: number
  product?: Product
  batch_id?: number
  status: TestStatus
  test_result?: TestResult
  tested_by?: User
  verified_by?: User
  approved_by?: User
  // Test Parameters
  compressive_strength_1_day?: number
  compressive_strength_3_day?: number
  compressive_strength_7_day?: number
  compressive_strength_28_day?: number
  flexural_strength?: number
  adhesion_strength?: number
  setting_time_initial?: number
  setting_time_final?: number
  water_demand?: number
  water_retention?: number
  flow_diameter?: number
  bulk_density?: number
  air_content?: number
  shelf_life?: number
  color?: string
  texture?: string
  appearance_notes?: string
  remarks?: string
  recommendations?: string
  meets_standard?: boolean
  standard_reference?: string
  standard_limits?: Record<string, any>
  organization_id?: number
  created_at?: string
}

export interface RawMaterialTest {
  id: number
  test_number: string
  test_date: string
  raw_material_id: number
  raw_material?: Product
  supplier_batch_id?: number
  status: TestStatus
  test_result?: TestResult
  tested_by?: User
  verified_by?: User
  approved_by?: User
  // Chemical Analysis
  sio2?: number
  al2o3?: number
  fe2o3?: number
  cao?: number
  mgo?: number
  so3?: number
  k2o?: number
  na2o?: number
  cl?: number
  // Physical Properties
  moisture_content?: number
  loss_on_ignition?: number
  specific_gravity?: number
  bulk_density?: number
  // Particle Size
  particle_size_d50?: number
  particle_size_d90?: number
  particle_size_d98?: number
  blaine_fineness?: number
  // Additional Properties
  water_reducer?: number
  retention_aid?: number
  defoamer?: number
  solid_content?: number
  viscosity?: number
  ph_value?: number
  minimum_film_forming_temperature?: number
  fineness_modulus?: number
  water_absorption?: number
  silt_content?: number
  organic_impurities?: number
  remarks?: string
  recommendations?: string
  meets_standard?: boolean
  standard_reference?: string
  standard_limits?: Record<string, any>
  organization_id?: number
  created_at?: string
}

// Dashboard Types
export interface DashboardStats {
  total_sales?: number
  total_orders?: number
  total_customers?: number
  total_products?: number
  pending_orders?: number
  production_in_progress?: number
  quality_issues?: number
  low_stock_items?: number
}

export interface ChartData {
  labels: string[]
  datasets: {
    label: string
    data: number[]
    backgroundColor?: string[]
    borderColor?: string[]
  }[]
}

// Form Types
export interface FormData {
  [key: string]: any
}

export interface FormField {
  name: string
  label: string
  type: 'text' | 'email' | 'password' | 'number' | 'select' | 'textarea' | 'date' | 'checkbox' | 'radio' | 'file'
  placeholder?: string
  required?: boolean
  options?: { label: string; value: any }[]
  validation?: string
  disabled?: boolean
}

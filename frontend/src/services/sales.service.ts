import BaseService from './base.service'
import { ApiResponse, PaginatedResponse } from './base.service'

// Types
export interface Customer {
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
  credit_limit?: number
  outstanding_balance?: number
}

export interface SalesOrder {
  id: number
  order_number: string
  customer_id: number
  order_date: string
  delivery_date: string
  status: string
  total_amount: number
  items: any[]
}

export interface Invoice {
  id: number
  invoice_number: string
  sales_order_id: number
  customer_id: number
  invoice_date: string
  due_date: string
  status: string
  total_amount: number
  paid_amount: number
  balance_amount: number
  items: any[]
}

export interface CreateCustomerData {
  name: string
  code: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  country: string
  credit_limit?: number
  payment_terms?: string
}

class SalesService extends BaseService {
  // Customers
  async getCustomers(params?: Record<string, any>): Promise<PaginatedResponse<Customer>> {
    return this.get('/customers', params)
  }

  async getCustomer(id: number): Promise<ApiResponse<Customer>> {
    return this.get(`/customers/${id}`)
  }

  async createCustomer(data: CreateCustomerData): Promise<ApiResponse<Customer>> {
    return this.post('/customers', data)
  }

  async updateCustomer(id: number, data: Partial<CreateCustomerData>): Promise<ApiResponse<Customer>> {
    return this.put(`/customers/${id}`, data)
  }

  async deleteCustomer(id: number): Promise<void> {
    return this.delete(`/customers/${id}`)
  }

  async getCustomerLedger(id: number, params?: Record<string, any>): Promise<any> {
    return this.get(`/customers/${id}/ledger`, params)
  }

  // Sales Orders
  async getSalesOrders(params?: Record<string, any>): Promise<PaginatedResponse<SalesOrder>> {
    return this.get('/sales-orders', params)
  }

  async getSalesOrder(id: number): Promise<ApiResponse<SalesOrder>> {
    return this.get(`/sales-orders/${id}`)
  }

  async createSalesOrder(data: any): Promise<ApiResponse<SalesOrder>> {
    return this.post('/sales-orders', data)
  }

  async updateSalesOrder(id: number, data: any): Promise<ApiResponse<SalesOrder>> {
    return this.put(`/sales-orders/${id}`, data)
  }

  async deleteSalesOrder(id: number): Promise<void> {
    return this.delete(`/sales-orders/${id}`)
  }

  // Invoices
  async getInvoices(params?: Record<string, any>): Promise<PaginatedResponse<Invoice>> {
    return this.get('/invoices', params)
  }

  async getInvoice(id: number): Promise<ApiResponse<Invoice>> {
    return this.get(`/invoices/${id}`)
  }

  async createInvoice(data: any): Promise<ApiResponse<Invoice>> {
    return this.post('/invoices', data)
  }

  async updateInvoice(id: number, data: any): Promise<ApiResponse<Invoice>> {
    return this.put(`/invoices/${id}`, data)
  }

  async deleteInvoice(id: number): Promise<void> {
    return this.delete(`/invoices/${id}`)
  }
}

export default new SalesService()

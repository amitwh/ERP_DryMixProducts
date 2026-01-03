import BaseService from './base.service'
import { ApiResponse, PaginatedResponse } from './base.service'

// Types
export interface Supplier {
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
  rating?: number
}

export interface PurchaseOrder {
  id: number
  order_number: string
  supplier_id: number
  order_date: string
  delivery_date: string
  status: string
  total_amount: number
  items: any[]
}

class ProcurementService extends BaseService {
  // Suppliers
  async getSuppliers(params?: Record<string, any>): Promise<PaginatedResponse<Supplier>> {
    return this.get('/suppliers', params)
  }

  async getSupplier(id: number): Promise<ApiResponse<Supplier>> {
    return this.get(`/suppliers/${id}`)
  }

  async getSupplierPerformance(id: number): Promise<any> {
    return this.get(`/suppliers/${id}/performance`)
  }

  async createSupplier(data: any): Promise<ApiResponse<Supplier>> {
    return this.post('/suppliers', data)
  }

  async updateSupplier(id: number, data: any): Promise<ApiResponse<Supplier>> {
    return this.put(`/suppliers/${id}`, data)
  }

  async deleteSupplier(id: number): Promise<void> {
    return this.delete(`/suppliers/${id}`)
  }

  // Purchase Orders
  async getPurchaseOrders(params?: Record<string, any>): Promise<PaginatedResponse<PurchaseOrder>> {
    return this.get('/purchase-orders', params)
  }

  async getPurchaseOrder(id: number): Promise<ApiResponse<PurchaseOrder>> {
    return this.get(`/purchase-orders/${id}`)
  }

  async createPurchaseOrder(data: any): Promise<ApiResponse<PurchaseOrder>> {
    return this.post('/purchase-orders', data)
  }

  async updatePurchaseOrder(id: number, data: any): Promise<ApiResponse<PurchaseOrder>> {
    return this.put(`/purchase-orders/${id}`, data)
  }

  async deletePurchaseOrder(id: number): Promise<void> {
    return this.delete(`/purchase-orders/${id}`)
  }

  async approvePurchaseOrder(id: number): Promise<ApiResponse<PurchaseOrder>> {
    return this.post(`/purchase-orders/${id}/approve`, {})
  }
}

export default new ProcurementService()

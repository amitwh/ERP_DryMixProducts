import BaseService from './base.service'
import { ApiResponse, PaginatedResponse } from './base.service'

// Types
export interface Product {
  id: number
  name: string
  code: string
  category: string
  unit: string
  status: string
  price: number
}

export interface CreateProductData {
  name: string
  code: string
  category: string
  unit: string
  price: number
  description?: string
  specifications?: Record<string, any>
}

export interface ProductionOrder {
  id: number
  order_number: string
  product_id: number
  quantity: number
  status: string
  start_date: string
  end_date: string
}

export interface ProductionBatch {
  id: number
  batch_number: string
  order_id: number
  status: string
  start_time: string
  end_time: string
}

class ProductionService extends BaseService {
  // Products
  async getProducts(params?: Record<string, any>): Promise<PaginatedResponse<Product>> {
    return this.get('/products', params)
  }

  async getProduct(id: number): Promise<ApiResponse<Product>> {
    return this.get(`/products/${id}`)
  }

  async createProduct(data: CreateProductData): Promise<ApiResponse<Product>> {
    return this.post('/products', data)
  }

  async updateProduct(id: number, data: Partial<CreateProductData>): Promise<ApiResponse<Product>> {
    return this.put(`/products/${id}`, data)
  }

  async deleteProduct(id: number): Promise<void> {
    return this.delete(`/products/${id}`)
  }

  // Production Orders
  async getProductionOrders(params?: Record<string, any>): Promise<PaginatedResponse<ProductionOrder>> {
    return this.get('/production-orders', params)
  }

  async getProductionOrder(id: number): Promise<ApiResponse<ProductionOrder>> {
    return this.get(`/production-orders/${id}`)
  }

  async createProductionOrder(data: any): Promise<ApiResponse<ProductionOrder>> {
    return this.post('/production-orders', data)
  }

  async updateProductionOrder(id: number, data: any): Promise<ApiResponse<ProductionOrder>> {
    return this.put(`/production-orders/${id}`, data)
  }

  async deleteProductionOrder(id: number): Promise<void> {
    return this.delete(`/production-orders/${id}`)
  }

  async completeProductionOrder(id: number): Promise<ApiResponse<ProductionOrder>> {
    return this.post(`/production-orders/${id}/complete`, {})
  }

  // Production Batches
  async getProductionBatches(params?: Record<string, any>): Promise<PaginatedResponse<ProductionBatch>> {
    return this.get('/production-batches', params)
  }

  async getProductionBatch(id: number): Promise<ApiResponse<ProductionBatch>> {
    return this.get(`/production-batches/${id}`)
  }

  async createProductionBatch(data: any): Promise<ApiResponse<ProductionBatch>> {
    return this.post('/production-batches', data)
  }

  async updateProductionBatch(id: number, data: any): Promise<ApiResponse<ProductionBatch>> {
    return this.put(`/production-batches/${id}`, data)
  }

  async deleteProductionBatch(id: number): Promise<void> {
    return this.delete(`/production-batches/${id}`)
  }

  // BOM
  async getBOMs(params?: Record<string, any>): Promise<PaginatedResponse<any>> {
    return this.get('/bill-of-materials', params)
  }

  async getBOM(id: number): Promise<ApiResponse<any>> {
    return this.get(`/bill-of-materials/${id}`)
  }

  async createBOM(data: any): Promise<ApiResponse<any>> {
    return this.post('/bill-of-materials', data)
  }

  async updateBOM(id: number, data: any): Promise<ApiResponse<any>> {
    return this.put(`/bill-of-materials/${id}`, data)
  }

  async deleteBOM(id: number): Promise<void> {
    return this.delete(`/bill-of-materials/${id}`)
  }

  async activateBOM(id: number): Promise<ApiResponse<any>> {
    return this.post(`/bill-of-materials/${id}/activate`, {})
  }

  async getBOMCostAnalysis(id: number): Promise<ApiResponse<any>> {
    return this.get(`/bill-of-materials/${id}/cost-analysis`)
  }
}

export default new ProductionService()

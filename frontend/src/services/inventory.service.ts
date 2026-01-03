import BaseService from './base.service'
import { ApiResponse, PaginatedResponse } from './base.service'

// Types
export interface InventoryItem {
  id: number
  product_id: number
  product_name: string
  quantity: number
  unit: string
  unit_id: number
  location: string
  status: string
}

export interface StockTransaction {
  id: number
  item_id: number
  transaction_type: string
  quantity: number
  reference_number: string
  reference_type: string
  transaction_date: string
  notes: string
}

export interface GoodsReceiptNote {
  id: number
  grn_number: string
  purchase_order_id: number
  supplier_id: number
  received_date: string
  status: string
  items: any[]
}

class InventoryService extends BaseService {
  // Inventory Stock
  async getInventory(params?: Record<string, any>): Promise<PaginatedResponse<InventoryItem>> {
    return this.get('/inventory', params)
  }

  async getInventoryAlerts(): Promise<any> {
    return this.get('/inventory-alerts')
  }

  async updateInventory(id: number, data: any): Promise<ApiResponse<InventoryItem>> {
    return this.put(`/inventory/${id}`, data)
  }

  // Stock Transactions
  async getStockTransactions(params?: Record<string, any>): Promise<PaginatedResponse<StockTransaction>> {
    return this.get('/stock-transactions', params)
  }

  async getStockTransactionsSummary(): Promise<any> {
    return this.get('/stock-transactions-summary')
  }

  async createStockTransaction(data: any): Promise<ApiResponse<StockTransaction>> {
    return this.post('/stock-transactions', data)
  }

  async getStockTransaction(id: number): Promise<ApiResponse<StockTransaction>> {
    return this.get(`/stock-transactions/${id}`)
  }

  // Goods Receipt Notes
  async getGRNs(params?: Record<string, any>): Promise<PaginatedResponse<GoodsReceiptNote>> {
    return this.get('/goods-receipt-notes', params)
  }

  async getGRN(id: number): Promise<ApiResponse<GoodsReceiptNote>> {
    return this.get(`/goods-receipt-notes/${id}`)
  }

  async createGRN(data: any): Promise<ApiResponse<GoodsReceiptNote>> {
    return this.post('/goods-receipt-notes', data)
  }

  async updateGRN(id: number, data: any): Promise<ApiResponse<GoodsReceiptNote>> {
    return this.put(`/goods-receipt-notes/${id}`, data)
  }

  async deleteGRN(id: number): Promise<void> {
    return this.delete(`/goods-receipt-notes/${id}`)
  }
}

export default new InventoryService()

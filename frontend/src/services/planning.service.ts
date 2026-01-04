import BaseService from './base.service'
import { ApiResponse, PaginatedResponse } from './base.service'

// Types
export interface ProductionPlan {
  id: number
  plan_number: string
  plan_type: string
  start_date: string
  end_date: string
  status: string
  total_quantity: number
  items: any[]
}

export interface DemandForecast {
  id: number
  forecast_number: string
  product_id: number
  forecast_date: string
  forecast_quantity: number
  actual_quantity: number
  accuracy_percentage: number
}

export interface MaterialRequirement {
  id: number
  plan_id: number
  material_id: number
  required_quantity: number
  available_quantity: number
  shortage_quantity: number
  order_quantity: number
  order_date: string
  status: string
}

class PlanningService extends BaseService {
  // Production Plans
  async getProductionPlans(params?: Record<string, any>): Promise<PaginatedResponse<ProductionPlan>> {
    return this.get('/production-plans', params)
  }

  async getProductionPlan(id: number): Promise<ApiResponse<ProductionPlan>> {
    return this.get(`/production-plans/${id}`)
  }

  async createProductionPlan(data: any): Promise<ApiResponse<ProductionPlan>> {
    return this.post('/production-plans', data)
  }

  async updateProductionPlan(id: number, data: any): Promise<ApiResponse<ProductionPlan>> {
    return this.put(`/production-plans/${id}`, data)
  }

  async deleteProductionPlan(id: number): Promise<void> {
    return this.delete(`/production-plans/${id}`)
  }

  async approveProductionPlan(id: number): Promise<ApiResponse<ProductionPlan>> {
    return this.post(`/production-plans/${id}/approve`, {})
  }

  // Demand Forecasts
  async getDemandForecasts(params?: Record<string, any>): Promise<PaginatedResponse<DemandForecast>> {
    return this.get('/demand-forecasts', params)
  }

  async getDemandForecast(id: number): Promise<ApiResponse<DemandForecast>> {
    return this.get(`/demand-forecasts/${id}`)
  }

  async createDemandForecast(data: any): Promise<ApiResponse<DemandForecast>> {
    return this.post('/demand-forecasts', data)
  }

  async updateDemandForecast(id: number, data: any): Promise<ApiResponse<DemandForecast>> {
    return this.put(`/demand-forecasts/${id}`, data)
  }

  async deleteDemandForecast(id: number): Promise<void> {
    return this.delete(`/demand-forecasts/${id}`)
  }

  // Material Requirements
  async getMaterialRequirements(params?: Record<string, any>): Promise<PaginatedResponse<MaterialRequirement>> {
    return this.get('/material-requirements', params)
  }

  // MRP Analysis
  async getMRPAnalysis(params?: Record<string, any>): Promise<any> {
    return this.get('/planning/mrp-analysis', params)
  }

  // Capacity Analysis
  async getCapacityAnalysis(params?: Record<string, any>): Promise<any> {
    return this.get('/planning/capacity-analysis', params)
  }
}

export default new PlanningService()

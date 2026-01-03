import BaseService from './base.service'
import { ApiResponse, PaginatedResponse } from './base.service'

// Types
export interface CreditControl {
  id: number
  customer_id: number
  credit_limit: number
  current_balance: number
  available_credit: number
  status: string
  credit_score: number
  risk_level: string
  last_review_date: string
}

export interface Collection {
  id: number
  customer_id: number
  invoice_id: number
  amount: number
  collection_date: string
  payment_method: string
  reference_number: string
  status: string
}

export interface CreditReview {
  id: number
  credit_control_id: number
  review_date: string
  review_type: string
  old_limit: number
  new_limit: number
  notes: string
  status: string
  approved_by: number
}

class CreditControlService extends BaseService {
  // Credit Controls
  async getCreditControls(params?: Record<string, any>): Promise<PaginatedResponse<CreditControl>> {
    return this.get('/credit-controls', params)
  }

  async getCreditControl(id: number): Promise<ApiResponse<CreditControl>> {
    return this.get(`/credit-controls/${id}`)
  }

  async createCreditControl(data: any): Promise<ApiResponse<CreditControl>> {
    return this.post('/credit-controls', data)
  }

  async updateCreditControl(id: number, data: any): Promise<ApiResponse<CreditControl>> {
    return this.put(`/credit-controls/${id}`, data)
  }

  async deleteCreditControl(id: number): Promise<void> {
    return this.delete(`/credit-controls/${id}`)
  }

  async placeOnHold(id: number): Promise<ApiResponse<CreditControl>> {
    return this.post(`/credit-controls/${id}/place-on-hold`, {})
  }

  async releaseHold(id: number): Promise<ApiResponse<CreditControl>> {
    return this.post(`/credit-controls/${id}/release-hold`, {})
  }

  async getCreditControlTransactions(id: number, params?: Record<string, any>): Promise<any> {
    return this.get(`/credit-controls/${id}/transactions`, params)
  }

  async getAgingReport(params?: Record<string, any>): Promise<any> {
    return this.get('/credit-controls/aging-report', params)
  }

  async getCreditScoreDistribution(): Promise<any> {
    return this.get('/credit-controls/credit-score-distribution')
  }

  async getRiskAnalysis(): Promise<any> {
    return this.get('/credit-controls/risk-analysis')
  }

  async createCreditReview(id: number, data: any): Promise<ApiResponse<CreditReview>> {
    return this.post(`/credit-controls/${id}/create-review`, data)
  }

  async approveCreditReview(reviewId: number): Promise<ApiResponse<CreditReview>> {
    return this.post(`/credit-reviews/${reviewId}/approve`, {})
  }

  async sendReminder(id: number, data: any): Promise<any> {
    return this.post(`/credit-controls/${id}/send-reminder`, data)
  }

  async getCreditControlStatistics(): Promise<any> {
    return this.get('/credit-controls/statistics')
  }

  // Collections
  async getCollections(params?: Record<string, any>): Promise<PaginatedResponse<Collection>> {
    return this.get('/collections', params)
  }

  async getCollection(id: number): Promise<ApiResponse<Collection>> {
    return this.get(`/collections/${id}`)
  }

  async createCollection(data: any): Promise<ApiResponse<Collection>> {
    return this.post('/collections', data)
  }

  async updateCollection(id: number, data: any): Promise<ApiResponse<Collection>> {
    return this.put(`/collections/${id}`, data)
  }

  async deleteCollection(id: number): Promise<void> {
    return this.delete(`/collections/${id}`)
  }

  async recordPayment(id: number, data: any): Promise<ApiResponse<Collection>> {
    return this.post(`/collections/${id}/record-payment`, data)
  }

  async waiveAmount(id: number, data: any): Promise<ApiResponse<Collection>> {
    return this.post(`/collections/${id}/waive-amount`, data)
  }

  async markAsDisputed(id: number, data: any): Promise<ApiResponse<Collection>> {
    return this.post(`/collections/${id}/mark-as-disputed`, data)
  }

  async getCollectionSummary(): Promise<any> {
    return this.get('/collections/summary')
  }
}

export default new CreditControlService()

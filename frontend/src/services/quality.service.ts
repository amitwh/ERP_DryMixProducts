import BaseService from './base.service'
import { ApiResponse, PaginatedResponse } from './base.service'

// Types
export interface Inspection {
  id: number
  inspection_number: string
  product_id: number
  batch_id: number
  inspection_date: string
  inspector_id: number
  status: string
  result: string
  parameters: any[]
}

export interface NCR {
  id: number
  ncr_number: string
  title: string
  description: string
  severity: string
  status: string
  raised_by: number
  raised_date: string
  closed_by: number
  closed_date: string
}

export interface QualityDocument {
  id: number
  document_number: string
  title: string
  type: string
  status: string
  created_at: string
  approved_by: number
}

export interface Test {
  id: number
  test_number: string
  test_type: string
  product_id: number
  test_date: string
  result: string
  parameters: any[]
}

class QualityService extends BaseService {
  // Inspections
  async getInspections(params?: Record<string, any>): Promise<PaginatedResponse<Inspection>> {
    return this.get('/inspections', params)
  }

  async getInspection(id: number): Promise<ApiResponse<Inspection>> {
    return this.get(`/inspections/${id}`)
  }

  async createInspection(data: any): Promise<ApiResponse<Inspection>> {
    return this.post('/inspections', data)
  }

  async updateInspection(id: number, data: any): Promise<ApiResponse<Inspection>> {
    return this.put(`/inspections/${id}`, data)
  }

  async deleteInspection(id: number): Promise<void> {
    return this.delete(`/inspections/${id}`)
  }

  // NCRs
  async getNCRs(params?: Record<string, any>): Promise<PaginatedResponse<NCR>> {
    return this.get('/ncrs', params)
  }

  async getNCR(id: number): Promise<ApiResponse<NCR>> {
    return this.get(`/ncrs/${id}`)
  }

  async createNCR(data: any): Promise<ApiResponse<NCR>> {
    return this.post('/ncrs', data)
  }

  async updateNCR(id: number, data: any): Promise<ApiResponse<NCR>> {
    return this.put(`/ncrs/${id}`, data)
  }

  async deleteNCR(id: number): Promise<void> {
    return this.delete(`/ncrs/${id}`)
  }

  async closeNCR(id: number): Promise<ApiResponse<NCR>> {
    return this.post(`/ncrs/${id}/close`, {})
  }

  async getNCRStatistics(): Promise<any> {
    return this.get('/ncrs-statistics')
  }

  // Quality Documents
  async getQualityDocuments(params?: Record<string, any>): Promise<PaginatedResponse<QualityDocument>> {
    return this.get('/quality-documents', params)
  }

  async getQualityDocument(id: number): Promise<ApiResponse<QualityDocument>> {
    return this.get(`/quality-documents/${id}`)
  }

  async createQualityDocument(data: any): Promise<ApiResponse<QualityDocument>> {
    return this.post('/quality-documents', data)
  }

  async updateQualityDocument(id: number, data: any): Promise<ApiResponse<QualityDocument>> {
    return this.put(`/quality-documents/${id}`, data)
  }

  async deleteQualityDocument(id: number): Promise<void> {
    return this.delete(`/quality-documents/${id}`)
  }

  async approveQualityDocument(id: number): Promise<ApiResponse<QualityDocument>> {
    return this.post(`/quality-documents/${id}/approve`, {})
  }

  async rejectQualityDocument(id: number): Promise<ApiResponse<QualityDocument>> {
    return this.post(`/quality-documents/${id}/reject`, {})
  }
}

export default new QualityService()

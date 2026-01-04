import BaseService from './base.service'
import { ApiResponse, PaginatedResponse } from './base.service'

// Types
export interface ChartOfAccount {
  id: number
  account_code: string
  account_name: string
  account_type: string
  parent_id: number | null
  balance: number
  status: string
}

export interface JournalVoucher {
  id: number
  voucher_number: string
  voucher_date: string
  voucher_type: string
  status: string
  total_debit: number
  total_credit: number
  description: string
  entries: any[]
}

export interface FiscalYear {
  id: number
  year: string
  start_date: string
  end_date: string
  status: string
  is_active: boolean
}

export interface Ledger {
  account_id: number
  account_name: string
  transactions: any[]
  opening_balance: number
  closing_balance: number
}

class FinanceService extends BaseService {
  // Chart of Accounts
  async getChartOfAccounts(params?: Record<string, any>): Promise<PaginatedResponse<ChartOfAccount>> {
    return this.get('/chart-of-accounts', params)
  }

  async getChartOfAccount(id: number): Promise<ApiResponse<ChartOfAccount>> {
    return this.get(`/chart-of-accounts/${id}`)
  }

  async createChartOfAccount(data: any): Promise<ApiResponse<ChartOfAccount>> {
    return this.post('/chart-of-accounts', data)
  }

  async updateChartOfAccount(id: number, data: any): Promise<ApiResponse<ChartOfAccount>> {
    return this.put(`/chart-of-accounts/${id}`, data)
  }

  async deleteChartOfAccount(id: number): Promise<void> {
    return this.delete(`/chart-of-accounts/${id}`)
  }

  async getAccountBalance(id: number): Promise<any> {
    return this.get(`/chart-of-accounts/${id}/balance`)
  }

  async getAccountRunningBalance(id: number, params?: Record<string, any>): Promise<any> {
    return this.get(`/chart-of-accounts/${id}/running-balance`, params)
  }

  async reconcileAccountBalance(id: number): Promise<any> {
    return this.get(`/chart-of-accounts/${id}/reconcile`)
  }

  // Journal Vouchers
  async getJournalVouchers(params?: Record<string, any>): Promise<PaginatedResponse<JournalVoucher>> {
    return this.get('/journal-vouchers', params)
  }

  async getJournalVoucher(id: number): Promise<ApiResponse<JournalVoucher>> {
    return this.get(`/journal-vouchers/${id}`)
  }

  async createJournalVoucher(data: any): Promise<ApiResponse<JournalVoucher>> {
    return this.post('/journal-vouchers', data)
  }

  async updateJournalVoucher(id: number, data: any): Promise<ApiResponse<JournalVoucher>> {
    return this.put(`/journal-vouchers/${id}`, data)
  }

  async deleteJournalVoucher(id: number): Promise<void> {
    return this.delete(`/journal-vouchers/${id}`)
  }

  async postJournalVoucher(id: number): Promise<ApiResponse<JournalVoucher>> {
    return this.post(`/journal-vouchers/${id}/post`, {})
  }

  async cancelJournalVoucher(id: number): Promise<ApiResponse<JournalVoucher>> {
    return this.post(`/journal-vouchers/${id}/cancel`, {})
  }

  // Fiscal Years
  async getFiscalYears(params?: Record<string, any>): Promise<PaginatedResponse<FiscalYear>> {
    return this.get('/fiscal-years', params)
  }

  async getFiscalYear(id: number): Promise<ApiResponse<FiscalYear>> {
    return this.get(`/fiscal-years/${id}`)
  }

  async createFiscalYear(data: any): Promise<ApiResponse<FiscalYear>> {
    return this.post('/fiscal-years', data)
  }

  async updateFiscalYear(id: number, data: any): Promise<ApiResponse<FiscalYear>> {
    return this.put(`/fiscal-years/${id}`, data)
  }

  async deleteFiscalYear(id: number): Promise<void> {
    return this.delete(`/fiscal-years/${id}`)
  }

  // Ledger
  async getLedgers(params?: Record<string, any>): Promise<any> {
    return this.get('/ledgers', params)
  }

  async getAccountLedger(id: number, params?: Record<string, any>): Promise<any> {
    return this.get(`/chart-of-accounts/${id}/ledger`, params)
  }

  // Reports
  async getTrialBalance(params?: Record<string, any>): Promise<any> {
    return this.get('/finance/trial-balance', params)
  }

  async getBalanceSheet(params?: Record<string, any>): Promise<any> {
    return this.get('/finance/balance-sheet', params)
  }

  async getProfitAndLoss(params?: Record<string, any>): Promise<any> {
    return this.get('/finance/profit-and-loss', params)
  }

  async getBalanceSummary(): Promise<any> {
    return this.get('/finance/balance-summary')
  }
}

export default new FinanceService()

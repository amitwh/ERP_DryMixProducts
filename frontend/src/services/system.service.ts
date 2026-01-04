import BaseService from './base.service'
import { ApiResponse, PaginatedResponse } from './base.service'

// Types
export interface User {
  id: number
  name: string
  email: string
  role?: string
  created_at: string
}

export interface Role {
  id: number
  name: string
  guard_name: string
  permissions: Permission[]
}

export interface Permission {
  id: number
  name: string
}

export interface Organization {
  id: number
  name: string
  code: string
  status: string
}

export interface ManufacturingUnit {
  id: number
  name: string
  code: string
  address: string
}

export interface CreateUserData {
  name: string
  email: string
  password: string
  role_id?: number
  org_id?: number
  unit_id?: number
}

export interface UpdateUserData {
  name?: string
  email?: string
  role_id?: number
  status?: string
}

class SystemService extends BaseService {
  // Organizations
  async getOrganizations(params?: Record<string, any>): Promise<PaginatedResponse<Organization>> {
    return this.get('/organizations', params)
  }

  async getOrganization(id: number): Promise<ApiResponse<Organization>> {
    return this.get(`/organizations/${id}`)
  }

  async createOrganization(data: any): Promise<ApiResponse<Organization>> {
    return this.post('/organizations', data)
  }

  async updateOrganization(id: number, data: any): Promise<ApiResponse<Organization>> {
    return this.put(`/organizations/${id}`, data)
  }

  async deleteOrganization(id: number): Promise<void> {
    return this.delete(`/organizations/${id}`)
  }

  // Manufacturing Units
  async getManufacturingUnits(params?: Record<string, any>): Promise<PaginatedResponse<ManufacturingUnit>> {
    return this.get('/manufacturing-units', params)
  }

  async getManufacturingUnit(id: number): Promise<ApiResponse<ManufacturingUnit>> {
    return this.get(`/manufacturing-units/${id}`)
  }

  async createManufacturingUnit(data: any): Promise<ApiResponse<ManufacturingUnit>> {
    return this.post('/manufacturing-units', data)
  }

  async updateManufacturingUnit(id: number, data: any): Promise<ApiResponse<ManufacturingUnit>> {
    return this.put(`/manufacturing-units/${id}`, data)
  }

  async deleteManufacturingUnit(id: number): Promise<void> {
    return this.delete(`/manufacturing-units/${id}`)
  }

  // Users
  async getUsers(params?: Record<string, any>): Promise<PaginatedResponse<User>> {
    return this.get('/users', params)
  }

  async getUser(id: number): Promise<ApiResponse<User>> {
    return this.get(`/users/${id}`)
  }

  async createUser(data: CreateUserData): Promise<ApiResponse<User>> {
    return this.post('/users', data)
  }

  async updateUser(id: number, data: UpdateUserData): Promise<ApiResponse<User>> {
    return this.put(`/users/${id}`, data)
  }

  async deleteUser(id: number): Promise<void> {
    return this.delete(`/users/${id}`)
  }

  // Roles
  async getRoles(params?: Record<string, any>): Promise<PaginatedResponse<Role>> {
    return this.get('/roles', params)
  }

  async getRole(id: number): Promise<ApiResponse<Role>> {
    return this.get(`/roles/${id}`)
  }

  async createRole(data: any): Promise<ApiResponse<Role>> {
    return this.post('/roles', data)
  }

  async updateRole(id: number, data: any): Promise<ApiResponse<Role>> {
    return this.put(`/roles/${id}`, data)
  }

  async deleteRole(id: number): Promise<void> {
    return this.delete(`/roles/${id}`)
  }

  // Permissions
  async getPermissions(params?: Record<string, any>): Promise<PaginatedResponse<Permission>> {
    return this.get('/permissions', params)
  }

  // System Statistics
  async getSystemStatistics(): Promise<any> {
    return this.get('/system/statistics')
  }

  async getSystemHealth(): Promise<any> {
    return this.get('/system/health')
  }
}

export default new SystemService()

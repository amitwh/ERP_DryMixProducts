import BaseService from './base.service'
import { ApiResponse, PaginatedResponse } from './base.service'

// Types
export interface Employee {
  id: number
  name: string
  code: string
  email: string
  phone: string
  designation: string
  department: string
  date_of_joining: string
  status: string
  salary?: number
}

export interface Attendance {
  id: number
  employee_id: number
  attendance_date: string
  check_in_time: string
  check_out_time: string
  status: string
  work_hours: number
}

export interface LeaveRequest {
  id: number
  employee_id: number
  leave_type: string
  start_date: string
  end_date: string
  reason: string
  status: string
  approved_by: number
  approved_date: string
}

export interface Department {
  id: number
  name: string
  code: string
  manager_id: number
  status: string
}

class HRService extends BaseService {
  // Employees
  async getEmployees(params?: Record<string, any>): Promise<PaginatedResponse<Employee>> {
    return this.get('/employees', params)
  }

  async getEmployee(id: number): Promise<ApiResponse<Employee>> {
    return this.get(`/employees/${id}`)
  }

  async createEmployee(data: any): Promise<ApiResponse<Employee>> {
    return this.post('/employees', data)
  }

  async updateEmployee(id: number, data: any): Promise<ApiResponse<Employee>> {
    return this.put(`/employees/${id}`, data)
  }

  async deleteEmployee(id: number): Promise<void> {
    return this.delete(`/employees/${id}`)
  }

  // Attendance
  async getAttendances(params?: Record<string, any>): Promise<PaginatedResponse<Attendance>> {
    return this.get('/attendances', params)
  }

  async getAttendance(id: number): Promise<ApiResponse<Attendance>> {
    return this.get(`/attendances/${id}`)
  }

  async createAttendance(data: any): Promise<ApiResponse<Attendance>> {
    return this.post('/attendances', data)
  }

  async updateAttendance(id: number, data: any): Promise<ApiResponse<Attendance>> {
    return this.put(`/attendances/${id}`, data)
  }

  async deleteAttendance(id: number): Promise<void> {
    return this.delete(`/attendances/${id}`)
  }

  // Leave Requests
  async getLeaveRequests(params?: Record<string, any>): Promise<PaginatedResponse<LeaveRequest>> {
    return this.get('/leave-requests', params)
  }

  async getLeaveRequest(id: number): Promise<ApiResponse<LeaveRequest>> {
    return this.get(`/leave-requests/${id}`)
  }

  async createLeaveRequest(data: any): Promise<ApiResponse<LeaveRequest>> {
    return this.post('/leave-requests', data)
  }

  async updateLeaveRequest(id: number, data: any): Promise<ApiResponse<LeaveRequest>> {
    return this.put(`/leave-requests/${id}`, data)
  }

  async deleteLeaveRequest(id: number): Promise<void> {
    return this.delete(`/leave-requests/${id}`)
  }

  async approveLeaveRequest(id: number): Promise<ApiResponse<LeaveRequest>> {
    return this.post(`/leave-requests/${id}/approve`, {})
  }

  async rejectLeaveRequest(id: number): Promise<ApiResponse<LeaveRequest>> {
    return this.post(`/leave-requests/${id}/reject`, {})
  }

  // Departments
  async getDepartments(params?: Record<string, any>): Promise<PaginatedResponse<Department>> {
    return this.get('/departments', params)
  }

  async createDepartment(data: any): Promise<ApiResponse<Department>> {
    return this.post('/departments', data)
  }

  // HR Statistics
  async getHRStatistics(): Promise<any> {
    return this.get('/hr/statistics')
  }
}

export default new HRService()

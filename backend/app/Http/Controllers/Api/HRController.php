<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Employee;
use App\Models\Attendance;
use App\Models\LeaveRequest;
use App\Models\Payslip;
use App\Models\Department;
use App\Models\Designation;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class HRController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => [
                'message' => 'HR & Payroll Module',
                'endpoints' => [
                    '/employees' => 'Employee management',
                    '/departments' => 'Department management',
                    '/designations' => 'Designation management',
                    '/attendances' => 'Attendance tracking',
                    '/leave-requests' => 'Leave management',
                    '/payslips' => 'Payslip management',
                ]
            ]
        ]);
    }

    // Employees
    public function employees(Request $request): JsonResponse
    {
        $organizationId = $request->get('organization_id');

        $employees = Employee::query()
            ->when($organizationId, fn($q) => $q->where('organization_id', $organizationId))
            ->with(['department', 'designation', 'grade', 'manufacturingUnit', 'user'])
            ->when($request->has('status'), fn($q) => $q->where('status', $request->status))
            ->when($request->has('department_id'), fn($q) => $q->where('department_id', $request->department_id))
            ->orderBy('created_at', 'desc')
            ->paginate($request->get('per_page', 20));

        return response()->json([
            'success' => true,
            'data' => $employees,
        ]);
    }

    public function storeEmployee(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'organization_id' => 'required|exists:organizations,id',
            'manufacturing_unit_id' => 'nullable|exists:manufacturing_units,id',
            'user_id' => 'nullable|exists:users,id',
            'employee_code' => 'required|string|unique:employees,employee_code',
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'middle_name' => 'nullable|string|max:255',
            'email' => 'required|email|unique:employees,email',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string',
            'city' => 'nullable|string|max:100',
            'state' => 'nullable|string|max:100',
            'country' => 'nullable|string|max:100',
            'postal_code' => 'nullable|string|max:20',
            'national_id' => 'nullable|string',
            'tax_id' => 'nullable|string',
            'department_id' => 'nullable|exists:departments,id',
            'designation_id' => 'nullable|exists:designations,id',
            'grade_id' => 'nullable|exists:grades,id',
            'join_date' => 'required|date',
            'employment_type' => 'required|in:permanent,contract,probation,intern',
            'status' => 'nullable|in:active,inactive,on_leave,resigned,terminated',
            'bank_name' => 'nullable|string',
            'bank_account_number' => 'nullable|string',
            'bank_ifsc_code' => 'nullable|string',
            'notes' => 'nullable|string',
        ]);

        $employee = Employee::create(array_merge($validated, [
            'status' => $validated['status'] ?? 'active',
            'created_by' => auth()->id(),
        ]));

        return response()->json([
            'success' => true,
            'data' => $employee->load(['department', 'designation']),
            'message' => 'Employee created successfully',
        ], 201);
    }

    // Attendances
    public function attendances(Request $request): JsonResponse
    {
        $organizationId = $request->get('organization_id');

        $attendances = Attendance::query()
            ->when($organizationId, fn($q) => $q->where('organization_id', $organizationId))
            ->with(['employee', 'employee.department', 'employee.designation', 'approvedBy'])
            ->when($request->has('employee_id'), fn($q) => $q->where('employee_id', $request->employee_id))
            ->when($request->has('date'), fn($q) => $q->where('attendance_date', $request->date))
            ->when($request->has('status'), fn($q) => $q->where('status', $request->status))
            ->orderBy('attendance_date', 'desc')
            ->paginate($request->get('per_page', 50));

        return response()->json([
            'success' => true,
            'data' => $attendances,
        ]);
    }

    public function storeAttendance(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'organization_id' => 'required|exists:organizations,id',
            'employee_id' => 'required|exists:employees,id',
            'attendance_date' => 'required|date|unique:attendances,organization_id,employee_id,attendance_date',
            'check_in' => 'nullable|date_format:H:i',
            'check_out' => 'nullable|date_format:H:i|after:check_in',
            'break_start' => 'nullable|date_format:H:i',
            'break_end' => 'nullable|date_format:H:i|after:break_start',
            'status' => 'required|in:present,absent,half_day,late,leave,holiday',
            'remarks' => 'nullable|string',
        ]);

        $attendance = Attendance::create($validated);

        // Calculate working hours
        if ($attendance->check_in && $attendance->check_out) {
            $checkIn = strtotime($attendance->check_in);
            $checkOut = strtotime($attendance->check_out);
            $workingMinutes = ($checkOut - $checkIn) / 60;

            if ($attendance->break_start && $attendance->break_end) {
                $breakStart = strtotime($attendance->break_start);
                $breakEnd = strtotime($attendance->break_end);
                $workingMinutes -= ($breakEnd - $breakStart) / 60;
            }

            $attendance->update(['working_hours' => max(0, $workingMinutes / 60)]);
        }

        return response()->json([
            'success' => true,
            'data' => $attendance,
            'message' => 'Attendance recorded successfully',
        ], 201);
    }

    // Leave Requests
    public function leaveRequests(Request $request): JsonResponse
    {
        $organizationId = $request->get('organization_id');

        $requests = LeaveRequest::query()
            ->when($organizationId, fn($q) => $q->where('organization_id', $organizationId))
            ->with(['employee', 'employee.department', 'leaveType', 'approvedBy'])
            ->when($request->has('employee_id'), fn($q) => $q->where('employee_id', $request->employee_id))
            ->when($request->has('status'), fn($q) => $q->where('status', $request->status))
            ->orderBy('created_at', 'desc')
            ->paginate($request->get('per_page', 20));

        return response()->json([
            'success' => true,
            'data' => $requests,
        ]);
    }

    public function storeLeaveRequest(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'organization_id' => 'required|exists:organizations,id',
            'employee_id' => 'required|exists:employees,id',
            'leave_type_id' => 'required|exists:leave_types,id',
            'start_date' => 'required|date|after_or_equal:today',
            'end_date' => 'required|date|after_or_equal:start_date',
            'reason' => 'nullable|string',
        ]);

        // Calculate total days
        $startDate = strtotime($validated['start_date']);
        $endDate = strtotime($validated['end_date']);
        $totalDays = ceil(($endDate - $startDate) / (60 * 60 * 24)) + 1;

        $leaveRequest = LeaveRequest::create(array_merge($validated, [
            'total_days' => $totalDays,
            'status' => 'pending',
            'applied_date' => today(),
        ]));

        return response()->json([
            'success' => true,
            'data' => $leaveRequest,
            'message' => 'Leave request submitted successfully',
        ], 201);
    }

    public function approveLeaveRequest(Request $request, LeaveRequest $leaveRequest): JsonResponse
    {
        $validated = $request->validate([
            'reason' => 'nullable|string|max:500',
        ]);

        $leaveRequest->approve(auth()->id(), $validated['reason'] ?? null);

        return response()->json([
            'success' => true,
            'message' => 'Leave request approved',
        ]);
    }

    public function rejectLeaveRequest(Request $request, LeaveRequest $leaveRequest): JsonResponse
    {
        $validated = $request->validate([
            'reason' => 'required|string|max:500',
        ]);

        $leaveRequest->reject(auth()->id(), $validated['reason']);

        return response()->json([
            'success' => true,
            'message' => 'Leave request rejected',
        ]);
    }

    // Departments
    public function departments(Request $request): JsonResponse
    {
        $organizationId = $request->get('organization_id');

        $departments = Department::query()
            ->when($organizationId, fn($q) => $q->where('organization_id', $organizationId))
            ->with(['parentDepartment', 'departmentHead'])
            ->where('is_active', true)
            ->orderBy('department_name')
            ->paginate($request->get('per_page', 50));

        return response()->json([
            'success' => true,
            'data' => $departments,
        ]);
    }

    public function storeDepartment(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'organization_id' => 'required|exists:organizations,id',
            'parent_department_id' => 'nullable|exists:departments,id',
            'department_code' => 'required|string|unique:departments,department_code',
            'department_name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'department_head_id' => 'nullable|exists:employees,id',
        ]);

        $department = Department::create($validated);

        return response()->json([
            'success' => true,
            'data' => $department,
            'message' => 'Department created successfully',
        ], 201);
    }

    // Statistics
    public function statistics(Request $request): JsonResponse
    {
        $organizationId = $request->get('organization_id');

        $stats = [
            'total_employees' => Employee::when($organizationId, fn($q) => $q->where('organization_id', $organizationId))->where('status', 'active')->count(),
            'on_leave' => Employee::when($organizationId, fn($q) => $q->where('organization_id', $organizationId))->where('status', 'on_leave')->count(),
            'new_hires_this_month' => Employee::when($organizationId, fn($q) => $q->where('organization_id', $organizationId))
                ->whereMonth('join_date', now()->month)
                ->whereYear('join_date', now()->year)
                ->count(),
            'pending_leave_requests' => LeaveRequest::when($organizationId, fn($q) => $q->where('organization_id', $organizationId))
                ->where('status', 'pending')
                ->count(),
            'attendance_today' => Attendance::when($organizationId, fn($q) => $q->where('organization_id', $organizationId))
                ->where('attendance_date', today())
                ->where('status', 'present')
                ->count(),
            'absent_today' => Attendance::when($organizationId, fn($q) => $q->where('organization_id', $organizationId))
                ->where('attendance_date', today())
                ->where('status', 'absent')
                ->count(),
            'total_departments' => Department::when($organizationId, fn($q) => $q->where('organization_id', $organizationId))
                ->where('is_active', true)
                ->count(),
        ];

        return response()->json([
            'success' => true,
            'data' => $stats,
        ]);
    }
}

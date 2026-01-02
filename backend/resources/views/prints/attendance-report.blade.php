@extends('prints.layout')

@section('content')
<div class="page">
    <!-- Header -->
    <div class="header">
        <div class="header-left">
            <div class="company-name">{{ $company->name ?? 'ERP DryMix Products' }}</div>
            <div class="company-details">
                @if($company->address){{ $company->address }}@endif
                @if($company->phone) | Tel: {{ $company->phone }}@endif
            </div>
        </div>
        <div class="header-right">
            <div class="report-title">{{ $title }}</div>
            <div class="report-meta">
                Period: {{ $period['start_date'] }} to {{ $period['end_date'] }}<br>
                Generated: {{ now()->format('d-m-Y') }}
            </div>
        </div>
    </div>

    <!-- Content -->
    <div class="content">
        <!-- Summary -->
        <div class="section">
            <div class="section-title">ATTENDANCE SUMMARY</div>
            <div style="padding: 5mm; border: 2px solid {{ $theme['primary_color'] ?? '#2563EB' }}; border-radius: 5px; background: #EEF2FF;">
                <div class="info-grid">
                    <div class="info-item">
                        <span class="info-label">Total Employees:</span>
                        <span class="info-value text-bold">{{ $attendances->pluck('employee_id')->unique()->count() }}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Total Records:</span>
                        <span class="info-value text-bold">{{ $attendances->count() }}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Present Days:</span>
                        <span class="info-value text-bold" style="color: #059669;">{{ $attendances->where('status', 'present')->count() }}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Absent Days:</span>
                        <span class="info-value text-bold" style="color: #DC2626;">{{ $attendances->where('status', 'absent')->count() }}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Late Arrivals:</span>
                        <span class="info-value text-bold" style="color: #D97706;">{{ $attendances->where('is_late', true)->count() }}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Leave Days:</span>
                        <span class="info-value text-bold" style="color: #7C3AED;">{{ $attendances->where('status', 'leave')->count() }}</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- Attendance Details -->
        <div class="section">
            <div class="section-title">ATTENDANCE DETAILS</div>
            <table class="table">
                <thead>
                    <tr>
                        <th width="8%">Sr. No.</th>
                        <th width="20%">Employee</th>
                        <th width="12%" class="text-center">Date</th>
                        <th width="12%" class="text-center">Check In</th>
                        <th width="12%" class="text-center">Check Out</th>
                        <th width="10%" class="text-center">Work Hours</th>
                        <th width="12%" class="text-center">Status</th>
                        <th width="14%" class="text-center">Approved By</th>
                    </tr>
                </thead>
                <tbody>
                    @forelse($attendances->take(50) as $index => $attendance)
                        <tr>
                            <td>{{ $index + 1 }}</td>
                            <td>
                                <strong>{{ $attendance->employee->name }}</strong>
                                @if($attendance->employee->employee_code)
                                <br><span class="text-sm">Code: {{ $attendance->employee->employee_code }}</span>
                                @endif
                                @if($attendance->employee->designation)
                                <br><span class="text-sm">{{ $attendance->employee->designation->name }}</span>
                                @endif
                            </td>
                            <td class="text-center">{{ $attendance->attendance_date->format('d-m-Y') }}</td>
                            <td class="text-center">
                                @if($attendance->check_in_time)
                                    {{ $attendance->check_in_time->format('H:i') }}
                                    @if($attendance->is_late)
                                        <span class="text-sm" style="color: #DC2626;">(Late)</span>
                                    @endif
                                @else
                                    -
                                @endif
                            </td>
                            <td class="text-center">
                                @if($attendance->check_out_time)
                                    {{ $attendance->check_out_time->format('H:i') }}
                                @else
                                    -
                                @endif
                            </td>
                            <td class="text-center">
                                @if($attendance->work_hours)
                                    {{ number_format($attendance->work_hours, 2) }} hrs
                                @else
                                    -
                                @endif
                            </td>
                            <td class="text-center">
                                @if($attendance->status === 'present')
                                    <span class="status approved" style="padding: 2mm 5mm;">PRESENT</span>
                                @elseif($attendance->status === 'absent')
                                    <span class="status fail" style="padding: 2mm 5mm;">ABSENT</span>
                                @elseif($attendance->status === 'leave')
                                    <span class="status" style="background: #7C3AED; color: white; padding: 2mm 5mm;">LEAVE</span>
                                @elseif($attendance->status === 'holiday')
                                    <span class="status" style="background: #6B7280; color: white; padding: 2mm 5mm;">HOLIDAY</span>
                                @else
                                    <span class="status pending" style="padding: 2mm 5mm;">-</span>
                                @endif
                            </td>
                            <td class="text-center">
                                @if($attendance->approvedBy)
                                    {{ $attendance->approvedBy->name }}
                                @else
                                    -
                                @endif
                            </td>
                        </tr>
                    @empty
                        <tr>
                            <td colspan="8" class="text-center">No attendance records found</td>
                        </tr>
                    @endforelse
                </tbody>
            </table>
        </div>

        <!-- Employee-wise Summary -->
        <div class="section">
            <div class="section-title">EMPLOYEE-WISE SUMMARY</div>
            <table class="table">
                <thead>
                    <tr>
                        <th width="10%">Sr. No.</th>
                        <th width="35%">Employee</th>
                        <th width="10%" class="text-center">Present</th>
                        <th width="10%" class="text-center">Absent</th>
                        <th width="10%" class="text-center">Leave</th>
                        <th width="10%" class="text-center">Late</th>
                        <th width="15%" class="text-right">Total Hours</th>
                    </tr>
                </thead>
                <tbody>
                    @forelse($attendances->groupBy('employee_id')->take(30) as $employeeId => $records)
                        @php
                            $employee = $records->first()->employee;
                            $presentCount = $records->where('status', 'present')->count();
                            $absentCount = $records->where('status', 'absent')->count();
                            $leaveCount = $records->where('status', 'leave')->count();
                            $lateCount = $records->where('is_late', true)->count();
                            $totalHours = $records->sum('work_hours') ?? 0;
                        @endphp
                        <tr>
                            <td>{{ $loop->iteration }}</td>
                            <td>
                                <strong>{{ $employee->name }}</strong>
                                @if($employee->department)
                                <br><span class="text-sm">{{ $employee->department->name }}</span>
                                @endif
                            </td>
                            <td class="text-center text-bold" style="color: #059669;">{{ $presentCount }}</td>
                            <td class="text-center" style="color: #DC2626;">{{ $absentCount }}</td>
                            <td class="text-center" style="color: #7C3AED;">{{ $leaveCount }}</td>
                            <td class="text-center" style="color: #D97706;">{{ $lateCount }}</td>
                            <td class="amount text-right text-bold">{{ number_format($totalHours, 2) }}</td>
                        </tr>
                    @empty
                        <tr>
                            <td colspan="7" class="text-center">No employee data found</td>
                        </tr>
                    @endforelse
                </tbody>
            </table>
        </div>

        <!-- Remarks -->
        <div class="section">
            <div class="section-title">REMARKS</div>
            <ul style="margin: 0; padding-left: 25px;">
                <li>Employees with irregular attendance (absent > 5 days) should be reviewed by HR</li>
                <li>Late arrivals (>30 minutes) are marked as late and affect performance</li>
                <li>Leave requests should be submitted in advance for approval</li>
                <li>Attendance is calculated based on check-in and check-out times</li>
            </ul>
        </div>

        <!-- Signature Section -->
        <div class="signature-section">
            <div class="signature">
                <div class="signature-label">Prepared By</div>
                <div class="signature-line"></div>
            </div>
            <div class="signature">
                <div class="signature-label">HR Manager</div>
                <div class="signature-line"></div>
            </div>
            <div class="signature">
                <div class="signature-label">Department Head</div>
                <div class="signature-line"></div>
            </div>
        </div>
    </div>

    <!-- Footer -->
    <div class="footer">
        <div class="footer-left">
            Generated on: {{ now()->format('d-m-Y H:i:s') }} | ERP DryMix Products
        </div>
        <div class="footer-right">
            Page 1 of 1 | HR & Payroll
        </div>
    </div>
</div>
@endsection

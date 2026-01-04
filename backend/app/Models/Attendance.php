<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Attendance extends Model
{
    use HasFactory;

    protected $fillable = [
        'organization_id',
        'employee_id',
        'attendance_date',
        'check_in',
        'check_out',
        'break_start',
        'break_end',
        'working_hours',
        'status',
        'approval_status',
        'remarks',
        'approved_by',
    ];

    protected $casts = [
        'attendance_date' => 'date',
        'check_in' => 'datetime',
        'check_out' => 'datetime',
        'break_start' => 'datetime',
        'break_end' => 'datetime',
        'working_hours' => 'decimal:2',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function organization()
    {
        return $this->belongsTo(Organization::class);
    }

    public function employee()
    {
        return $this->belongsTo(Employee::class);
    }

    public function approvedBy()
    {
        return $this->belongsTo(User::class);
    }

    public function scopeByOrganization($query, $organizationId)
    {
        return $query->where('organization_id', $organizationId);
    }

    public function scopeByEmployee($query, $employeeId)
    {
        return $query->where('employee_id', $employeeId);
    }

    public function scopeByDate($query, $date)
    {
        return $query->where('attendance_date', $date);
    }

    public function scopePresent($query)
    {
        return $query->where('status', 'present');
    }

    public function scopeAbsent($query)
    {
        return $query->where('status', 'absent');
    }

    public function isLate()
    {
        if (!$this->check_in) {
            return false;
        }

        $checkInTime = $this->check_in->format('H:i:s');
        return $checkInTime > '09:00:00';
    }

    public function getIsOvertimeAttribute()
    {
        if (!$this->check_out || !$this->check_in) {
            return false;
        }

        $workingMinutes = $this->working_hours * 60;
        return $workingMinutes > 480; // 8 hours = 480 minutes
    }
}

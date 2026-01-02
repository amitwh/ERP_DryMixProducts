<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Employee extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'organization_id',
        'manufacturing_unit_id',
        'user_id',
        'employee_code',
        'first_name',
        'last_name',
        'middle_name',
        'gender',
        'date_of_birth',
        'email',
        'phone',
        'address',
        'city',
        'state',
        'country',
        'postal_code',
        'national_id',
        'tax_id',
        'department_id',
        'designation_id',
        'grade_id',
        'join_date',
        'confirmation_date',
        'employment_type',
        'status',
        'bank_name',
        'bank_account_number',
        'bank_ifsc_code',
        'emergency_contact_name',
        'emergency_contact_phone',
        'notes',
        'created_by',
    ];

    protected $casts = [
        'date_of_birth' => 'date',
        'join_date' => 'date',
        'confirmation_date' => 'date',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    // Relationships
    public function organization()
    {
        return $this->belongsTo(Organization::class);
    }

    public function manufacturingUnit()
    {
        return $this->belongsTo(ManufacturingUnit::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function department()
    {
        return $this->belongsTo(Department::class);
    }

    public function designation()
    {
        return $this->belongsTo(Designation::class);
    }

    public function grade()
    {
        return $this->belongsTo(Grade::class);
    }

    public function attendances()
    {
        return $this->hasMany(Attendance::class);
    }

    public function leaveRequests()
    {
        return $this->hasMany(LeaveRequest::class);
    }

    public function payslips()
    {
        return $this->hasMany(Payslip::class);
    }

    public function departmentHead()
    {
        return $this->hasOne(Department::class, 'department_head_id');
    }

    // Scopes
    public function scopeByOrganization($query, $organizationId)
    {
        return $query->where('organization_id', $organizationId);
    }

    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeByUnit($query, $unitId)
    {
        return $query->where('manufacturing_unit_id', $unitId);
    }

    public function scopeByDepartment($query, $departmentId)
    {
        return $query->where('department_id', $departmentId);
    }

    // Accessors
    public function getFullNameAttribute()
    {
        $fullName = $this->first_name . ' ' . $this->last_name;
        if ($this->middle_name) {
            $fullName = $this->first_name . ' ' . $this->middle_name . ' ' . $this->last_name;
        }
        return $fullName;
    }

    public function getServicePeriodAttribute()
    {
        return $this->join_date ? $this->join_date->diffInDays(now()) . ' days' : 'N/A';
    }

    public function getAgeAttribute()
    {
        return $this->date_of_birth ? $this->date_of_birth->age : null;
    }

    // Methods
    public function isOnLeave($date = null)
    {
        $date = $date ?? today();
        return $this->leaveRequests()
            ->where('status', 'approved')
            ->where('start_date', '<=', $date)
            ->where('end_date', '>=', $date)
            ->exists();
    }

    public function getAttendanceForDate($date)
    {
        return $this->attendances()
            ->where('attendance_date', $date)
            ->first();
    }

    public function getLeaveBalance($leaveTypeId)
    {
        $leaveType = LeaveType::find($leaveTypeId);
        if (!$leaveType) {
            return 0;
        }

        // Calculate used leave
        $usedDays = $this->leaveRequests()
            ->where('leave_type_id', $leaveTypeId)
            ->where('status', 'approved')
            ->where('start_date', '>=', now()->startOfYear())
            ->sum('total_days');

        return $leaveType->days_allowed - $usedDays;
    }
}

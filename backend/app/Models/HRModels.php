<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Department extends Model
{
    use HasFactory;

    protected $fillable = [
        'organization_id',
        'parent_department_id',
        'department_code',
        'department_name',
        'description',
        'department_head_id',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function organization()
    {
        return $this->belongsTo(Organization::class);
    }

    public function parentDepartment()
    {
        return $this->belongsTo(Department::class, 'parent_department_id');
    }

    public function childDepartments()
    {
        return $this->hasMany(Department::class, 'parent_department_id');
    }

    public function departmentHead()
    {
        return $this->belongsTo(Employee::class, 'department_head_id');
    }

    public function employees()
    {
        return $this->hasMany(Employee::class);
    }

    public function scopeByOrganization($query, $organizationId)
    {
        return $query->where('organization_id', $organizationId);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}

class Designation extends Model
{
    use HasFactory;

    protected $fillable = [
        'organization_id',
        'designation_code',
        'designation_name',
        'description',
        'grade_level',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function organization()
    {
        return $this->belongsTo(Organization::class);
    }

    public function employees()
    {
        return $this->hasMany(Employee::class);
    }

    public function scopeByOrganization($query, $organizationId)
    {
        return $query->where('organization_id', $organizationId);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}

class Grade extends Model
{
    use HasFactory;

    protected $fillable = [
        'organization_id',
        'grade_code',
        'grade_name',
        'min_salary',
        'max_salary',
        'description',
        'is_active',
    ];

    protected $casts = [
        'min_salary' => 'decimal:2',
        'max_salary' => 'decimal:2',
        'is_active' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function organization()
    {
        return $this->belongsTo(Organization::class);
    }

    public function employees()
    {
        return $this->hasMany(Employee::class);
    }

    public function scopeByOrganization($query, $organizationId)
    {
        return $query->where('organization_id', $organizationId);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}

class LeaveType extends Model
{
    use HasFactory;

    protected $fillable = [
        'organization_id',
        'leave_code',
        'leave_name',
        'is_paid',
        'days_allowed',
        'requires_approval',
        'can_carry_forward',
        'max_carry_forward_days',
        'description',
        'is_active',
    ];

    protected $casts = [
        'is_paid' => 'boolean',
        'requires_approval' => 'boolean',
        'can_carry_forward' => 'boolean',
        'is_active' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function organization()
    {
        return $this->belongsTo(Organization::class);
    }

    public function leaveRequests()
    {
        return $this->hasMany(LeaveRequest::class);
    }

    public function scopeByOrganization($query, $organizationId)
    {
        return $query->where('organization_id', $organizationId);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}

class LeaveRequest extends Model
{
    use HasFactory;

    protected $fillable = [
        'organization_id',
        'employee_id',
        'leave_type_id',
        'start_date',
        'end_date',
        'total_days',
        'reason',
        'status',
        'rejection_reason',
        'applied_date',
        'approved_by',
        'approved_date',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'total_days' => 'decimal:2',
        'applied_date' => 'date',
        'approved_date' => 'date',
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

    public function leaveType()
    {
        return $this->belongsTo(LeaveType::class);
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

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeApproved($query)
    {
        return $query->where('status', 'approved');
    }

    public function approve($userId, $reason = null)
    {
        $this->update([
            'status' => 'approved',
            'approved_by' => $userId,
            'approved_date' => now(),
            'rejection_reason' => $reason,
        ]);
    }

    public function reject($userId, $reason)
    {
        $this->update([
            'status' => 'rejected',
            'approved_by' => $userId,
            'approved_date' => now(),
            'rejection_reason' => $reason,
        ]);
    }
}

class PayrollPeriod extends Model
{
    use HasFactory;

    protected $fillable = [
        'organization_id',
        'fiscal_year_id',
        'period_name',
        'start_date',
        'end_date',
        'payment_date',
        'status',
        'is_locked',
        'created_by',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'payment_date' => 'date',
        'is_locked' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function organization()
    {
        return $this->belongsTo(Organization::class);
    }

    public function fiscalYear()
    {
        return $this->belongsTo(FiscalYear::class);
    }

    public function payslips()
    {
        return $this->hasMany(Payslip::class);
    }

    public function createdBy()
    {
        return $this->belongsTo(User::class);
    }

    public function scopeByOrganization($query, $organizationId)
    {
        return $query->where('organization_id', $organizationId);
    }

    public function scopeDraft($query)
    {
        return $query->where('status', 'draft');
    }

    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }
}

class SalaryComponent extends Model
{
    use HasFactory;

    protected $fillable = [
        'organization_id',
        'component_code',
        'component_name',
        'component_type',
        'calculation_type',
        'value',
        'percentage_of',
        'is_taxable',
        'is_pf_eligible',
        'is_esi_eligible',
        'display_order',
        'is_active',
    ];

    protected $casts = [
        'value' => 'decimal:2',
        'is_taxable' => 'boolean',
        'is_pf_eligible' => 'boolean',
        'is_esi_eligible' => 'boolean',
        'is_active' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function organization()
    {
        return $this->belongsTo(Organization::class);
    }

    public function payslipComponents()
    {
        return $this->hasMany(PayslipComponent::class);
    }

    public function scopeByOrganization($query, $organizationId)
    {
        return $query->where('organization_id', $organizationId);
    }

    public function scopeEarnings($query)
    {
        return $query->where('component_type', 'earning');
    }

    public function scopeDeductions($query)
    {
        return $query->where('component_type', 'deduction');
    }
}

class PayslipComponent extends Model
{
    use HasFactory;

    protected $fillable = [
        'payslip_id',
        'salary_component_id',
        'amount',
        'calculated_amount',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'calculated_amount' => 'decimal:2',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function payslip()
    {
        return $this->belongsTo(Payslip::class);
    }

    public function salaryComponent()
    {
        return $this->belongsTo(SalaryComponent::class);
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Payslip extends Model
{
    use HasFactory;

    protected $fillable = [
        'organization_id',
        'payroll_period_id',
        'employee_id',
        'payslip_number',
        'basic_salary',
        'gross_salary',
        'total_deductions',
        'net_salary',
        'working_days',
        'paid_days',
        'leave_days',
        'status',
        'created_by',
    ];

    protected $casts = [
        'basic_salary' => 'decimal:2',
        'gross_salary' => 'decimal:2',
        'total_deductions' => 'decimal:2',
        'net_salary' => 'decimal:2',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function organization()
    {
        return $this->belongsTo(Organization::class);
    }

    public function payrollPeriod()
    {
        return $this->belongsTo(PayrollPeriod::class);
    }

    public function employee()
    {
        return $this->belongsTo(Employee::class);
    }

    public function components()
    {
        return $this->hasMany(PayslipComponent::class);
    }

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function scopeByOrganization($query, $organizationId)
    {
        return $query->where('organization_id', $organizationId);
    }

    public function scopeByEmployee($query, $employeeId)
    {
        return $query->where('employee_id', $employeeId);
    }

    public function scopeByPeriod($query, $periodId)
    {
        return $query->where('payroll_period_id', $periodId);
    }

    public function finalize()
    {
        $this->update(['status' => 'finalized']);
    }

    public function markAsPaid()
    {
        $this->update(['status' => 'paid']);
    }
}

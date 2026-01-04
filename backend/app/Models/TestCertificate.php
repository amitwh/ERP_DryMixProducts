<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;

class TestCertificate extends Model
{
    use HasFactory, SoftDeletes, LogsActivity;

    protected $fillable = [
        'org_id',
        'unit_id',
        'certificate_number',
        'certificate_type',
        'material_id',
        'product_id',
        'batch_id',
        'test_result_id',
        'customer_id',
        'po_reference',
        'issue_date',
        'valid_until',
        'certificate_template',
        'certificate_data',
        'standards_followed',
        'overall_result',
        'remarks',
        'tested_by',
        'reviewed_by',
        'approved_by',
        'approval_status',
        'signature_path',
        'stamp_path',
        'qr_code_data',
        'public_link',
        'public_access',
        'password_protected',
        'password',
        'delivery_method',
        'delivery_status',
        'delivered_at',
        'view_count',
        'download_count',
    ];

    protected $casts = [
        'issue_date' => 'date',
        'valid_until' => 'date',
        'certificate_data' => 'array',
        'standards_followed' => 'array',
        'public_access' => 'boolean',
        'password_protected' => 'boolean',
        'delivered_at' => 'datetime',
        'view_count' => 'integer',
        'download_count' => 'integer',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    protected $hidden = [
        'password',
    ];

    public function organization()
    {
        return $this->belongsTo(Organization::class);
    }

    public function unit()
    {
        return $this->belongsTo(ManufacturingUnit::class);
    }

    public function material()
    {
        return $this->belongsTo(\App\Models\RawMaterial::class);
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function testResult()
    {
        return $this->morphTo();
    }

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    public function testedBy()
    {
        return $this->belongsTo(User::class, 'tested_by');
    }

    public function reviewedBy()
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    public function approvedBy()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function scopeApproved($query)
    {
        return $query->where('approval_status', 'approved');
    }

    public function scopeByOrganization($query, $organizationId)
    {
        return $query->where('org_id', $organizationId);
    }

    public function scopeByType($query, $type)
    {
        return $query->where('certificate_type', $type);
    }

    public function scopeByCustomer($query, $customerId)
    {
        return $query->where('customer_id', $customerId);
    }

    public function scopePublic($query)
    {
        return $query->where('public_access', true);
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['certificate_number', 'certificate_type', 'overall_result', 'approval_status'])
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs();
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;

class Snag extends Model
{
    use HasFactory, SoftDeletes, LogsActivity;

    protected $fillable = [
        'org_id',
        'unit_id',
        'snag_number',
        'snag_type',
        'severity',
        'priority',
        'title',
        'description',
        'location',
        'product_id',
        'batch_id',
        'reported_by',
        'reported_date',
        'assigned_to',
        'assigned_date',
        'target_date',
        'status',
        'root_cause',
        'correction_action',
        'preventive_action',
        'photos_before',
        'photos_after',
        'verification_by',
        'verification_date',
        'verification_notes',
        'closure_date',
        'resolution_summary',
        'cost_impact',
        'time_impact_hours',
        'attachments',
    ];

    protected $casts = [
        'reported_date' => 'datetime',
        'assigned_date' => 'datetime',
        'target_date' => 'date',
        'verification_date' => 'datetime',
        'closure_date' => 'datetime',
        'photos_before' => 'array',
        'photos_after' => 'array',
        'cost_impact' => 'decimal:2',
        'time_impact_hours' => 'decimal:2',
        'attachments' => 'array',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    public function organization()
    {
        return $this->belongsTo(Organization::class);
    }

    public function unit()
    {
        return $this->belongsTo(ManufacturingUnit::class);
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function reportedBy()
    {
        return $this->belongsTo(User::class, 'reported_by');
    }

    public function assignedTo()
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    public function verificationBy()
    {
        return $this->belongsTo(User::class, 'verification_by');
    }

    public function scopeActive($query)
    {
        return $query->whereIn('status', ['open', 'in_progress', 'resolved']);
    }

    public function scopeByOrganization($query, $organizationId)
    {
        return $query->where('org_id', $organizationId);
    }

    public function scopeBySeverity($query, $severity)
    {
        return $query->where('severity', $severity);
    }

    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['snag_number', 'title', 'severity', 'status'])
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs();
    }
}

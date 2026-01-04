<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;

class TrialRegister extends Model
{
    use HasFactory, SoftDeletes, LogsActivity;

    protected $fillable = [
        'org_id',
        'unit_id',
        'trial_number',
        'trial_type',
        'product_id',
        'title',
        'objective',
        'description',
        'requested_by',
        'assigned_to',
        'priority',
        'start_date',
        'target_date',
        'completion_date',
        'status',
        'trial_data',
        'results_summary',
        'conclusion',
        'conversion_to_production',
        'production_batch_id',
        'cost_analysis',
        'attachments',
        'approval_workflow',
    ];

    protected $casts = [
        'start_date' => 'date',
        'target_date' => 'date',
        'completion_date' => 'date',
        'trial_data' => 'array',
        'conversion_to_production' => 'boolean',
        'cost_analysis' => 'array',
        'attachments' => 'array',
        'approval_workflow' => 'array',
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

    public function requestedBy()
    {
        return $this->belongsTo(User::class, 'requested_by');
    }

    public function assignedTo()
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    public function scopeActive($query)
    {
        return $query->whereIn('status', ['approved', 'in_progress']);
    }

    public function scopeByOrganization($query, $organizationId)
    {
        return $query->where('org_id', $organizationId);
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['trial_number', 'title', 'trial_type', 'status'])
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs();
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;

class Observation extends Model
{
    use HasFactory, LogsActivity;

    protected $fillable = [
        'org_id',
        'unit_id',
        'observation_number',
        'observation_type',
        'severity',
        'category',
        'title',
        'description',
        'location',
        'activity_type',
        'observed_by',
        'observed_date',
        'evidence_photos',
        'videos',
        'witness_names',
        'immediate_action_taken',
        'risk_assessment',
        'status',
        'investigation_by',
        'investigation_date',
        'investigation_findings',
        'root_cause',
        'corrective_action_required',
        'corrective_actions',
        'assigned_to',
        'target_date',
        'completed_date',
        'verification_by',
        'verified',
        'verified_date',
    ];

    protected $casts = [
        'observed_date' => 'datetime',
        'evidence_photos' => 'array',
        'videos' => 'array',
        'witness_names' => 'array',
        'risk_assessment' => 'array',
        'investigation_date' => 'date',
        'corrective_action_required' => 'boolean',
        'corrective_actions' => 'array',
        'target_date' => 'date',
        'completed_date' => 'date',
        'verified' => 'boolean',
        'verified_date' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function organization()
    {
        return $this->belongsTo(Organization::class);
    }

    public function unit()
    {
        return $this->belongsTo(ManufacturingUnit::class);
    }

    public function observedBy()
    {
        return $this->belongsTo(User::class, 'observed_by');
    }

    public function investigationBy()
    {
        return $this->belongsTo(User::class, 'investigation_by');
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
        return $query->whereIn('status', ['reported', 'under_investigation', 'action_in_progress']);
    }

    public function scopeByOrganization($query, $organizationId)
    {
        return $query->where('org_id', $organizationId);
    }

    public function scopeByType($query, $type)
    {
        return $query->where('observation_type', $type);
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['observation_number', 'title', 'observation_type', 'severity', 'status'])
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs();
    }
}

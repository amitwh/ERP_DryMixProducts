<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;

class WorkmanshipInspection extends Model
{
    use HasFactory, LogsActivity;

    protected $fillable = [
        'org_id',
        'project_id',
        'activity_id',
        'inspection_number',
        'inspection_date',
        'work_area',
        'work_type',
        'contractor_id',
        'worker_team',
        'supervisor',
        'work_stage',
        'acceptance_criteria',
        'inspection_parameters',
        'measurements_taken',
        'tolerances',
        'deviations',
        'overall_quality',
        'rework_required',
        'rework_area',
        'rework_instructions',
        'approved',
        'approved_by',
        'approved_date',
        'photos',
        'sketches',
        'inspected_by',
    ];

    protected $casts = [
        'inspection_date' => 'date',
        'acceptance_criteria' => 'array',
        'inspection_parameters' => 'array',
        'measurements_taken' => 'array',
        'tolerances' => 'array',
        'deviations' => 'array',
        'rework_required' => 'boolean',
        'approved' => 'boolean',
        'approved_date' => 'datetime',
        'photos' => 'array',
        'sketches' => 'array',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function organization()
    {
        return $this->belongsTo(Organization::class);
    }

    public function project()
    {
        return $this->belongsTo(ConstructionProject::class);
    }

    public function activity()
    {
        return $this->belongsTo(ConstructionActivity::class);
    }

    public function contractor()
    {
        return $this->belongsTo(Customer::class);
    }

    public function approvedBy()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function inspectedBy()
    {
        return $this->belongsTo(User::class, 'inspected_by');
    }

    public function scopeByOrganization($query, $organizationId)
    {
        return $query->where('org_id', $organizationId);
    }

    public function scopeApproved($query)
    {
        return $query->where('approved', true);
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['inspection_number', 'overall_quality', 'approved'])
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs();
    }
}

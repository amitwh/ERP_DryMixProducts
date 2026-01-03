<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;

class Rfi extends Model
{
    use HasFactory, LogsActivity;

    protected $fillable = [
        'org_id',
        'project_id',
        'rfi_number',
        'rfi_title',
        'spec_section',
        'submitted_by',
        'submitted_date',
        'urgency',
        'required_by_date',
        'assigned_to',
        'status',
        'question',
        'response',
        'drawing_references',
        'photos',
        'response_by',
        'response_date',
        'response_time_hours',
        'documents',
    ];

    protected $casts = [
        'submitted_date' => 'date',
        'required_by_date' => 'date',
        'response_date' => 'date',
        'response_time_hours' => 'integer',
        'drawing_references' => 'array',
        'photos' => 'array',
        'documents' => 'array',
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

    public function submittedBy()
    {
        return $this->belongsTo(User::class, 'submitted_by');
    }

    public function assignedTo()
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    public function responseBy()
    {
        return $this->belongsTo(User::class, 'response_by');
    }

    public function scopeByOrganization($query, $organizationId)
    {
        return $query->where('org_id', $organizationId);
    }

    public function scopeByProject($query, $projectId)
    {
        return $query->where('project_id', $projectId);
    }

    public function scopePending($query)
    {
        return $query->whereIn('status', ['draft', 'submitted', 'assigned']);
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['rfi_number', 'rfi_title', 'status'])
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs();
    }
}

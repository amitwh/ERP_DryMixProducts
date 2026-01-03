<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;

class Submittal extends Model
{
    use HasFactory, LogsActivity;

    protected $fillable = [
        'org_id',
        'project_id',
        'submittal_number',
        'submittal_title',
        'submittal_type',
        'spec_section',
        'required_by_date',
        'submitted_by',
        'submitted_date',
        'revision_number',
        'submittal_status',
        'documents',
        'review_comments',
        'reviewed_by',
        'review_date',
        'final_approval_date',
        'distribution_list',
    ];

    protected $casts = [
        'required_by_date' => 'date',
        'submitted_date' => 'date',
        'revision_number' => 'integer',
        'documents' => 'array',
        'review_date' => 'date',
        'final_approval_date' => 'date',
        'distribution_list' => 'array',
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

    public function reviewedBy()
    {
        return $this->belongsTo(User::class, 'reviewed_by');
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
        return $query->whereIn('submittal_status', ['pending', 'submitted', 'under_review']);
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['submittal_number', 'submittal_title', 'submittal_status'])
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs();
    }
}

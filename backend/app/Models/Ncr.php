<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;

class Ncr extends Model
{
    use HasFactory, SoftDeletes, LogsActivity;

    protected $fillable = [
        'organization_id',
        'project_id',
        'ncr_number',
        'ncr_date',
        'raised_by',
        'non_conformance_type',
        'severity',
        'description',
        'location',
        'responsible_person_id',
        'root_cause',
        'corrective_action',
        'preventive_action',
        'target_date',
        'closure_date',
        'status',
        'verified_by',
        'verification_date',
        'attachments',
    ];

    protected $casts = [
        'ncr_date' => 'date',
        'target_date' => 'date',
        'closure_date' => 'date',
        'verification_date' => 'date',
        'attachments' => 'array',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['ncr_number', 'status', 'severity'])
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs();
    }

    // Relationships
    public function organization()
    {
        return $this->belongsTo(Organization::class);
    }

    public function project()
    {
        return $this->belongsTo(Project::class);
    }

    public function raisedBy()
    {
        return $this->belongsTo(User::class, 'raised_by');
    }

    public function responsiblePerson()
    {
        return $this->belongsTo(User::class, 'responsible_person_id');
    }

    public function verifiedBy()
    {
        return $this->belongsTo(User::class, 'verified_by');
    }

    // Scopes
    public function scopeOpen($query)
    {
        return $query->whereIn('status', ['open', 'under_investigation', 'action_taken']);
    }

    public function scopeCritical($query)
    {
        return $query->where('severity', 'critical');
    }

    public function scopeOverdue($query)
    {
        return $query->where('target_date', '<', now())
                     ->where('status', '!=', 'closed');
    }
}

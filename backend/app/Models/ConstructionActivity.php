<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;

class ConstructionActivity extends Model
{
    use HasFactory, SoftDeletes, LogsActivity;

    protected $fillable = [
        'project_id',
        'activity_code',
        'activity_name',
        'activity_type',
        'parent_activity_id',
        'sequence_number',
        'start_date',
        'estimated_end_date',
        'actual_start_date',
        'actual_end_date',
        'status',
        'planned_budget',
        'actual_cost',
        'progress_percentage',
        'contractor_id',
        'specifications',
        'drawings',
    ];

    protected $casts = [
        'start_date' => 'date',
        'estimated_end_date' => 'date',
        'actual_start_date' => 'date',
        'actual_end_date' => 'date',
        'planned_budget' => 'decimal:2',
        'actual_cost' => 'decimal:2',
        'progress_percentage' => 'decimal:2',
        'specifications' => 'array',
        'drawings' => 'array',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    public function project()
    {
        return $this->belongsTo(ConstructionProject::class);
    }

    public function parentActivity()
    {
        return $this->belongsTo(ConstructionActivity::class, 'parent_activity_id');
    }

    public function childActivities()
    {
        return $this->hasMany(ConstructionActivity::class, 'parent_activity_id');
    }

    public function contractor()
    {
        return $this->belongsTo(Customer::class);
    }

    public function siteInspections()
    {
        return $this->hasMany(SiteInspection::class, 'activity_id');
    }

    public function materialInspections()
    {
        return $this->hasMany(SiteMaterialInspection::class, 'activity_id');
    }

    public function workmanshipInspections()
    {
        return $this->hasMany(WorkmanshipInspection::class, 'activity_id');
    }

    public function submittals()
    {
        return $this->hasMany(Submittal::class);
    }

    public function scopeActive($query)
    {
        return $query->whereIn('status', ['not_started', 'in_progress']);
    }

    public function scopeByProject($query, $projectId)
    {
        return $query->where('project_id', $projectId);
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['activity_name', 'activity_code', 'status', 'progress_percentage'])
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs();
    }
}

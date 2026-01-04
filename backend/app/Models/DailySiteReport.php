<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;

class DailySiteReport extends Model
{
    use HasFactory, LogsActivity;

    protected $fillable = [
        'org_id',
        'project_id',
        'report_date',
        'report_number',
        'weather_conditions',
        'max_temp',
        'min_temp',
        'rainfall_mm',
        'humidity_percent',
        'wind_conditions',
        'overall_progress',
        'key_achievements',
        'challenges_issues',
        'activities_completed',
        'activities_in_progress',
        'activities_planned',
        'manpower_on_site',
        'equipment_on_site',
        'materials_delivered',
        'materials_consumed',
        'inspections_conducted',
        'tests_conducted',
        'safety_incidents',
        'delays',
        'approvals_obtained',
        'photos',
        'next_day_plan',
        'prepared_by',
        'reviewed_by',
    ];

    protected $casts = [
        'report_date' => 'date',
        'max_temp' => 'decimal:2',
        'min_temp' => 'decimal:2',
        'rainfall_mm' => 'decimal:2',
        'humidity_percent' => 'decimal:2',
        'activities_completed' => 'array',
        'activities_in_progress' => 'array',
        'activities_planned' => 'array',
        'manpower_on_site' => 'array',
        'equipment_on_site' => 'array',
        'materials_delivered' => 'array',
        'materials_consumed' => 'array',
        'inspections_conducted' => 'array',
        'tests_conducted' => 'array',
        'safety_incidents' => 'array',
        'approvals_obtained' => 'array',
        'photos' => 'array',
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

    public function preparedBy()
    {
        return $this->belongsTo(User::class, 'prepared_by');
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

    public function scopeByDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('report_date', [$startDate, $endDate]);
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['report_number', 'report_date'])
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs();
    }
}

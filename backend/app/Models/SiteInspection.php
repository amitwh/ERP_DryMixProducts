<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;

class SiteInspection extends Model
{
    use HasFactory, LogsActivity;

    protected $fillable = [
        'organization_id',
        'unit_id',
        'project_id',
        'activity_id',
        'inspection_number',
        'inspection_date',
        'inspection_type',
        'inspection_category',
        'inspected_by',
        'supervised_by',
        'contractor_representative',
        'weather_conditions',
        'ambient_temp',
        'relative_humidity',
        'inspection_data',
        'overall_result',
        'non_conformances',
        'observations',
        'photos',
        'videos',
        'immediate_actions',
        'follow_up_required',
        'follow_up_actions',
        'follow_up_target_date',
        'inspector_signature',
        'contractor_signature',
        // Geolocation fields
        'latitude',
        'longitude',
        'accuracy',
        'altitude',
        'geotagged_address',
        'location_verified',
        'location_verified_by',
        'location_verified_at',
    ];

    protected $casts = [
        'inspection_date' => 'date',
        'ambient_temp' => 'decimal:2',
        'relative_humidity' => 'decimal:2',
        'inspection_data' => 'array',
        'non_conformances' => 'array',
        'photos' => 'array',
        'videos' => 'array',
        'follow_up_target_date' => 'date',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        // Geolocation casts
        'latitude' => 'decimal:8',
        'longitude' => 'decimal:8',
        'accuracy' => 'decimal:2',
        'altitude' => 'decimal:2',
        'location_verified' => 'boolean',
        'location_verified_at' => 'datetime',
    ];

    public function organization()
    {
        return $this->belongsTo(Organization::class);
    }

    public function unit()
    {
        return $this->belongsTo(ManufacturingUnit::class);
    }

    public function project()
    {
        return $this->belongsTo(ConstructionProject::class);
    }

    public function activity()
    {
        return $this->belongsTo(ConstructionActivity::class);
    }

    public function inspectedBy()
    {
        return $this->belongsTo(User::class, 'inspected_by');
    }

    public function supervisedBy()
    {
        return $this->belongsTo(User::class, 'supervised_by');
    }

    public function scopeByOrganization($query, $organizationId)
    {
        return $query->where('organization_id', $organizationId);
    }

    public function scopeByProject($query, $projectId)
    {
        return $query->where('project_id', $projectId);
    }

    public function scopeByType($query, $type)
    {
        return $query->where('inspection_type', $type);
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['inspection_number', 'inspection_type', 'overall_result'])
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs();
    }
}

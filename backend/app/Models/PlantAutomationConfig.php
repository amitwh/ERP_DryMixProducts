<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;

class PlantAutomationConfig extends Model
{
    use HasFactory, SoftDeletes, LogsActivity;

    protected $fillable = [
        'org_id',
        'unit_id',
        'device_name',
        'device_type',
        'device_manufacturer',
        'device_model',
        'ip_address',
        'port',
        'protocol',
        'slave_id',
        'connection_params',
        'polling_frequency',
        'is_active',
        'is_connected',
        'last_connected_at',
        'last_disconnected_at',
        'connection_error',
        'device_capabilities',
        'description',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'connection_params' => 'array',
        'device_capabilities' => 'array',
        'is_active' => 'boolean',
        'is_connected' => 'boolean',
        'last_connected_at' => 'datetime',
        'last_disconnected_at' => 'datetime',
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

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function updatedBy()
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    public function tags()
    {
        return $this->hasMany(PlantAutomationTag::class, 'config_id');
    }

    public function dataLogs()
    {
        return $this->hasMany(PlantAutomationDataLog::class, 'config_id');
    }

    public function alarms()
    {
        return $this->hasMany(PlantAutomationAlarm::class, 'config_id');
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeConnected($query)
    {
        return $query->where('is_connected', true);
    }

    public function scopeByOrganization($query, $organizationId)
    {
        return $query->where('org_id', $organizationId);
    }

    public function scopeByUnit($query, $unitId)
    {
        return $query->where('unit_id', $unitId);
    }

    public function scopeByType($query, $type)
    {
        return $query->where('device_type', $type);
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['device_name', 'device_type', 'is_active', 'is_connected'])
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs();
    }
}

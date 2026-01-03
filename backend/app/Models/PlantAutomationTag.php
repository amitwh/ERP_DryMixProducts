<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PlantAutomationTag extends Model
{
    use HasFactory;

    protected $fillable = [
        'config_id',
        'tag_name',
        'tag_display_name',
        'tag_type',
        'data_type',
        'address',
        'scan_rate',
        'unit_of_measure',
        'min_value',
        'max_value',
        'default_value',
        'scaling_params',
        'alarm_thresholds',
        'is_active',
        'is_logged',
        'description',
    ];

    protected $casts = [
        'scaling_params' => 'array',
        'alarm_thresholds' => 'array',
        'is_active' => 'boolean',
        'is_logged' => 'boolean',
        'address' => 'integer',
        'scan_rate' => 'integer',
        'min_value' => 'decimal:4',
        'max_value' => 'decimal:4',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function config()
    {
        return $this->belongsTo(PlantAutomationConfig::class);
    }

    public function dataLogs()
    {
        return $this->hasMany(PlantAutomationDataLog::class, 'tag_id');
    }

    public function alarms()
    {
        return $this->hasMany(PlantAutomationAlarm::class, 'tag_id');
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeLogged($query)
    {
        return $query->where('is_logged', true);
    }

    public function scopeByConfig($query, $configId)
    {
        return $query->where('config_id', $configId);
    }

    public function scopeByType($query, $type)
    {
        return $query->where('tag_type', $type);
    }

    public function scopeByDataType($query, $dataType)
    {
        return $query->where('data_type', $dataType);
    }

    public function getFormattedValueAttribute($rawValue)
    {
        // Apply scaling parameters if configured
        if ($this->scaling_params) {
            $scaling = $this->scaling_params;
            $rawValue = ($rawValue * ($scaling['multiplier'] ?? 1)) + ($scaling['offset'] ?? 0);
        }

        // Format based on data type
        switch ($this->data_type) {
            case 'float32':
            case 'float64':
                return round($rawValue, 4);
            case 'bool':
                return (bool)$rawValue;
            default:
                return $rawValue;
        }
    }

    public function getUnitAttribute(): ?string
    {
        return $this->unit_of_measure;
    }
}

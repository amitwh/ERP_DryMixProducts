<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;

class Prediction extends Model
{
    use HasFactory, SoftDeletes, LogsActivity;

    protected $fillable = [
        'org_id',
        'unit_id',
        'model_id',
        'prediction_type',
        'entity_type',
        'entity_id',
        'prediction_date',
        'prediction_horizon_days',
        'predicted_value',
        'confidence_lower',
        'confidence_upper',
        'confidence_percentage',
        'input_data',
        'actual_value',
        'actual_recorded_at',
        'accuracy_percentage',
        'status',
        'notes',
    ];

    protected $casts = [
        'prediction_date' => 'datetime',
        'predicted_value' => 'decimal:2',
        'confidence_lower' => 'decimal:2',
        'confidence_upper' => 'decimal:2',
        'confidence_percentage' => 'decimal:2',
        'input_data' => 'array',
        'actual_value' => 'decimal:2',
        'actual_recorded_at' => 'datetime',
        'accuracy_percentage' => 'decimal:2',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    protected $hidden = [
        'input_data',
    ];

    public function organization()
    {
        return $this->belongsTo(Organization::class);
    }

    public function unit()
    {
        return $this->belongsTo(ManufacturingUnit::class, 'unit_id');
    }

    public function model()
    {
        return $this->belongsTo(MlModel::class, 'model_id');
    }

    public function scopeActive($query)
    {
        return $query->where('status', 'predicted');
    }

    public function scopeByOrganization($query, $organizationId)
    {
        return $query->where('org_id', $organizationId);
    }

    public function scopeByType($query, $type)
    {
        return $query->where('prediction_type', $type);
    }

    public function scopeByEntity($query, $entityType, $entityId)
    {
        return $query->where('entity_type', $entityType)
                    ->where('entity_id', $entityId);
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['prediction_type', 'predicted_value', 'status', 'accuracy_percentage'])
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs();
    }
}

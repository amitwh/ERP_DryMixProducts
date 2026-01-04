<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;

class Anomaly extends Model
{
    use HasFactory, SoftDeletes, LogsActivity;

    protected $fillable = [
        'org_id',
        'unit_id',
        'anomaly_type',
        'severity',
        'detected_at',
        'entity_type',
        'entity_id',
        'anomaly_description',
        'expected_value',
        'actual_value',
        'deviation_percentage',
        'anomaly_score',
        'confidence_percentage',
        'model_id',
        'probable_cause',
        'recommended_action',
        'status',
        'investigated_by',
        'investigation_summary',
        'resolution_summary',
        'resolved_by',
        'resolved_at',
        'notes',
    ];

    protected $casts = [
        'detected_at' => 'datetime',
        'expected_value' => 'decimal:2',
        'actual_value' => 'decimal:2',
        'deviation_percentage' => 'decimal:2',
        'anomaly_score' => 'decimal:4',
        'confidence_percentage' => 'decimal:2',
        'resolved_at' => 'datetime',
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
        return $this->belongsTo(ManufacturingUnit::class, 'unit_id');
    }

    public function model()
    {
        return $this->belongsTo(MlModel::class, 'model_id');
    }

    public function investigatedBy()
    {
        return $this->belongsTo(User::class, 'investigated_by');
    }

    public function resolvedBy()
    {
        return $this->belongsTo(User::class, 'resolved_by');
    }

    public function scopeActive($query)
    {
        return $query->whereIn('status', ['detected', 'investigating', 'action_in_progress']);
    }

    public function scopeByOrganization($query, $organizationId)
    {
        return $query->where('org_id', $organizationId);
    }

    public function scopeByType($query, $type)
    {
        return $query->where('anomaly_type', $type);
    }

    public function scopeBySeverity($query, $severity)
    {
        return $query->where('severity', $severity);
    }

    public function scopeByEntity($query, $entityType, $entityId)
    {
        return $query->where('entity_type', $entityType)
                    ->where('entity_id', $entityId);
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['anomaly_type', 'severity', 'status', 'resolution_summary'])
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs();
    }
}

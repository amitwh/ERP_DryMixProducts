<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;

class MlModel extends Model
{
    use HasFactory, SoftDeletes, LogsActivity;

    protected $fillable = [
        'org_id',
        'model_code',
        'model_name',
        'model_type',
        'target_variable',
        'input_features',
        'algorithm',
        'model_version',
        'accuracy_score',
        'precision_score',
        'recall_score',
        'f1_score',
        'last_trained_at',
        'next_training_date',
        'training_frequency_days',
        'is_active',
        'model_file_path',
        'training_data_source',
        'model_parameters',
        'feature_importance',
    ];

    protected $casts = [
        'input_features' => 'array',
        'accuracy_score' => 'decimal:4',
        'precision_score' => 'decimal:4',
        'recall_score' => 'decimal:4',
        'f1_score' => 'decimal:4',
        'last_trained_at' => 'datetime',
        'next_training_date' => 'date',
        'is_active' => 'boolean',
        'model_parameters' => 'array',
        'feature_importance' => 'array',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    protected $hidden = [
        'model_file_path',
    ];

    public function organization()
    {
        return $this->belongsTo(Organization::class);
    }

    public function predictions()
    {
        return $this->hasMany(Prediction::class, 'model_id');
    }

    public function anomalies()
    {
        return $this->hasMany(Anomaly::class, 'model_id');
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeByOrganization($query, $organizationId)
    {
        return $query->where('org_id', $organizationId);
    }

    public function scopeByType($query, $type)
    {
        return $query->where('model_type', $type);
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['model_name', 'model_type', 'is_active', 'model_version'])
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs();
    }
}

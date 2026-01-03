<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;

class FeatureToggle extends Model
{
    use HasFactory, LogsActivity;

    protected $fillable = [
        'org_id',
        'feature_name',
        'display_name',
        'description',
        'is_enabled',
        'is_beta',
        'is_global',
        'feature_config',
        'enabled_date',
        'disabled_date',
        'enabled_by',
        'version',
    ];

    protected $casts = [
        'is_enabled' => 'boolean',
        'is_beta' => 'boolean',
        'is_global' => 'boolean',
        'feature_config' => 'array',
        'enabled_date' => 'date',
        'disabled_date' => 'date',
        'enabled_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function organization()
    {
        return $this->belongsTo(Organization::class);
    }

    public function enabledBy()
    {
        return $this->belongsTo(User::class, 'enabled_by');
    }

    public function scopeEnabled($query)
    {
        return $query->where('is_enabled', true);
    }

    public function scopeDisabled($query)
    {
        return $query->where('is_enabled', false);
    }

    public function scopeBeta($query)
    {
        return $query->where('is_beta', true);
    }

    public function scopeGlobal($query)
    {
        return $query->where('is_global', true);
    }

    public function scopeByOrganization($query, $organizationId)
    {
        return $query->where('org_id', $organizationId);
    }

    public function scopeByName($query, $name)
    {
        return $query->where('feature_name', $name);
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['feature_name', 'is_enabled', 'is_beta'])
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs();
    }

    protected static function boot()
    {
        parent::boot();

        static::saving(function ($feature) {
            if ($feature->isDirty('is_enabled')) {
                if ($feature->is_enabled) {
                    $feature->enabled_date = now()->toDateString();
                    $feature->disabled_date = null;
                    $feature->enabled_at = now();
                } else {
                    $feature->disabled_date = now()->toDateString();
                }
            }
        });
    }
}

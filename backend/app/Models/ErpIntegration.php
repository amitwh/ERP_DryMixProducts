<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;

class ErpIntegration extends Model
{
    use HasFactory, SoftDeletes, LogsActivity;

    protected $fillable = [
        'org_id',
        'integration_name',
        'integration_type',
        'integration_provider',
        'api_endpoint',
        'api_key',
        'api_secret',
        'access_token',
        'refresh_token',
        'token_expires_at',
        'connection_settings',
        'sync_settings',
        'field_mappings',
        'sync_frequency',
        'sync_time',
        'last_sync_at',
        'next_sync_at',
        'sync_status',
        'last_sync_error',
        'sync_statistics',
        'is_active',
        'is_auto_sync',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'connection_settings' => 'array',
        'sync_settings' => 'array',
        'field_mappings' => 'array',
        'sync_statistics' => 'array',
        'is_active' => 'boolean',
        'is_auto_sync' => 'boolean',
        'token_expires_at' => 'datetime',
        'last_sync_at' => 'datetime',
        'next_sync_at' => 'datetime',
        'sync_time' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    protected $hidden = [
        'api_key',
        'api_secret',
        'access_token',
        'refresh_token',
    ];

    public function organization()
    {
        return $this->belongsTo(Organization::class);
    }

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function updatedBy()
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    public function syncLogs()
    {
        return $this->hasMany(ErpSyncLog::class, 'integration_id');
    }

    public function fieldMappings()
    {
        return $this->hasMany(ErpFieldMapping::class, 'integration_id');
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
        return $query->where('integration_type', $type);
    }

    public function scopeByProvider($query, $provider)
    {
        return $query->where('integration_provider', $provider);
    }

    public function scopeReadyForSync($query)
    {
        return $query->where('is_active', true)
            ->where('is_auto_sync', true)
            ->where('sync_status', '!=', 'syncing')
            ->where(function ($q) {
                $q->whereNull('next_sync_at')->orWhere('next_sync_at', '<=', now());
            });
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['integration_name', 'integration_type', 'sync_status', 'is_active'])
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs();
    }
}

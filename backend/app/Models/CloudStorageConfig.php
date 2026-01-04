<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;

class CloudStorageConfig extends Model
{
    use HasFactory, SoftDeletes, LogsActivity;

    protected $fillable = [
        'org_id',
        'storage_provider',
        'bucket_name',
        'region',
        'access_key',
        'secret_key',
        'endpoint_url',
        'cdn_domain',
        'default_path',
        'encryption',
        'visibility',
        'is_active',
        'is_default',
        'provider_settings',
        'test_connection_at',
        'connection_status',
        'connection_error',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'is_default' => 'boolean',
        'connection_status' => 'boolean',
        'provider_settings' => 'array',
        'test_connection_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    protected $hidden = [
        'secret_key',
        'access_key',
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

    public function files()
    {
        return $this->hasMany(CloudStorageFile::class, 'config_id');
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeDefault($query)
    {
        return $query->where('is_default', true);
    }

    public function scopeByOrganization($query, $organizationId)
    {
        return $query->where('org_id', $organizationId);
    }

    public function scopeByProvider($query, $provider)
    {
        return $query->where('storage_provider', $provider);
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['storage_provider', 'bucket_name', 'is_active', 'connection_status'])
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs();
    }

    protected static function boot()
    {
        parent::boot();

        static::saving(function ($config) {
            // Ensure only one default config per organization
            if ($config->is_default && $config->isDirty('is_default')) {
                static::where('org_id', $config->org_id)
                    ->where('id', '!=', $config->id ?? 0)
                    ->update(['is_default' => false]);
            }
        });
    }
}

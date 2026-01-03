<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;

class ModuleConfiguration extends Model
{
    use HasFactory, LogsActivity;

    protected $fillable = [
        'org_id',
        'module_name',
        'module_type',
        'module_version',
        'is_enabled',
        'is_required',
        'module_settings',
        'permissions',
        'installed_date',
        'uninstalled_date',
        'dependencies',
        'notes',
        'installed_by',
    ];

    protected $casts = [
        'is_enabled' => 'boolean',
        'is_required' => 'boolean',
        'module_settings' => 'array',
        'permissions' => 'array',
        'dependencies' => 'array',
        'installed_date' => 'date',
        'uninstalled_date' => 'date',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function organization()
    {
        return $this->belongsTo(Organization::class);
    }

    public function installedBy()
    {
        return $this->belongsTo(User::class, 'installed_by');
    }

    public function scopeEnabled($query)
    {
        return $query->where('is_enabled', true);
    }

    public function scopeDisabled($query)
    {
        return $query->where('is_enabled', false);
    }

    public function scopeRequired($query)
    {
        return $query->where('is_required', true);
    }

    public function scopeByOrganization($query, $organizationId)
    {
        return $query->where('org_id', $organizationId);
    }

    public function scopeByType($query, $type)
    {
        return $query->where('module_type', $type);
    }

    public function scopeByName($query, $name)
    {
        return $query->where('module_name', $name);
    }

    public function scopeInstalled($query)
    {
        return $query->whereNull('uninstalled_date');
    }

    public function scopeUninstalled($query)
    {
        return $query->whereNotNull('uninstalled_date');
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['module_name', 'is_enabled', 'module_version'])
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs();
    }
}

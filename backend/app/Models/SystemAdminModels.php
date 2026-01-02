<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Module extends Model
{
    use HasFactory;

    protected $fillable = [
        'module_code',
        'module_name',
        'module_description',
        'version',
        'is_core',
        'is_active',
        'icon',
        'display_order',
        'permissions',
        'menu_items',
    ];

    protected $casts = [
        'is_core' => 'boolean',
        'is_active' => 'boolean',
        'permissions' => 'array',
        'menu_items' => 'array',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function organizationModules()
    {
        return $this->hasMany(OrganizationModule::class);
    }

    public function scopeCore($query)
    {
        return $query->where('is_core', true);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}

class OrganizationModule extends Model
{
    use HasFactory;

    protected $fillable = [
        'organization_id',
        'module_id',
        'is_enabled',
        'subscription_start',
        'subscription_end',
        'feature_flags',
        'configuration',
    ];

    protected $casts = [
        'is_enabled' => 'boolean',
        'subscription_start' => 'date',
        'subscription_end' => 'date',
        'feature_flags' => 'array',
        'configuration' => 'array',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function organization()
    {
        return $this->belongsTo(Organization::class);
    }

    public function module()
    {
        return $this->belongsTo(Module::class);
    }

    public function scopeByOrganization($query, $organizationId)
    {
        return $query->where('organization_id', $organizationId);
    }

    public function scopeEnabled($query)
    {
        return $query->where('is_enabled', true);
    }

    public function hasFeature($feature)
    {
        $flags = $this->feature_flags ?? [];
        return in_array($feature, $flags, true);
    }
}

class ApiKey extends Model
{
    use HasFactory;

    protected $fillable = [
        'organization_id',
        'user_id',
        'api_key',
        'name',
        'description',
        'permissions',
        'allowed_ips',
        'rate_limits',
        'expires_at',
        'last_used_at',
        'usage_count',
        'is_active',
        'is_revoked',
        'created_by',
    ];

    protected $casts = [
        'permissions' => 'array',
        'allowed_ips' => 'array',
        'rate_limits' => 'array',
        'expires_at' => 'date',
        'last_used_at' => 'datetime',
        'is_active' => 'boolean',
        'is_revoked' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    protected $hidden = [
        'api_key',
    ];

    public function organization()
    {
        return $this->belongsTo(Organization::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function apiLogs()
    {
        return $this->hasMany(ApiLog::class);
    }

    public function scopeByOrganization($query, $organizationId)
    {
        return $query->where('organization_id', $organizationId);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true)->where('is_revoked', false);
    }

    public function scopeNotExpired($query)
    {
        return $query->where(function($q) {
            $q->whereNull('expires_at')->orWhere('expires_at', '>', now());
        });
    }

    public function isValid()
    {
        return $this->is_active && !$this->is_revoked && (!$this->expires_at || $this->expires_at->isFuture());
    }

    public function recordUsage()
    {
        $this->update([
            'last_used_at' => now(),
            'usage_count' => $this->usage_count + 1,
        ]);
    }

    public function revoke()
    {
        $this->update(['is_revoked' => true]);
    }
}

class ApiLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'organization_id',
        'api_key_id',
        'user_id',
        'method',
        'endpoint',
        'request_headers',
        'request_body',
        'response_status',
        'response_headers',
        'response_body',
        'response_time_ms',
        'ip_address',
        'user_agent',
        'requested_at',
    ];

    protected $casts = [
        'request_headers' => 'array',
        'request_body' => 'array',
        'response_headers' => 'array',
        'response_body' => 'array',
        'requested_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function organization()
    {
        return $this->belongsTo(Organization::class);
    }

    public function apiKey()
    {
        return $this->belongsTo(ApiKey::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function scopeByOrganization($query, $organizationId)
    {
        return $query->where('organization_id', $organizationId);
    }

    public function scopeByStatus($query, $status)
    {
        return $query->where('response_status', $status);
    }

    public function scopeSlow($query, $threshold = 1000)
    {
        return $query->where('response_time_ms', '>', $threshold);
    }

    public function scopeErrors($query)
    {
        return $query->where('response_status', '>=', 400);
    }
}

class SystemLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'organization_id',
        'user_id',
        'log_level',
        'channel',
        'message',
        'context',
        'exception_trace',
        'request_id',
        'logged_at',
    ];

    protected $casts = [
        'context' => 'array',
        'logged_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function organization()
    {
        return $this->belongsTo(Organization::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function scopeByOrganization($query, $organizationId)
    {
        return $query->where('organization_id', $organizationId);
    }

    public function scopeByLevel($query, $level)
    {
        return $query->where('log_level', $level);
    }

    public function scopeErrors($query)
    {
        return $query->whereIn('log_level', ['emergency', 'alert', 'critical', 'error']);
    }

    public function scopeWarnings($query)
    {
        return $query->whereIn('log_level', ['warning', 'notice']);
    }

    public function scopeByChannel($query, $channel)
    {
        return $query->where('channel', $channel);
    }
}

class SystemBackup extends Model
{
    use HasFactory;

    protected $fillable = [
        'organization_id',
        'backup_name',
        'backup_type',
        'size_mb',
        'status',
        'file_path',
        'storage_type',
        'included_tables',
        'started_at',
        'completed_at',
        'error_message',
        'is_restorable',
        'created_by',
    ];

    protected $casts = [
        'size_mb' => 'decimal:2',
        'included_tables' => 'array',
        'started_at' => 'datetime',
        'completed_at' => 'datetime',
        'is_restorable' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function organization()
    {
        return $this->belongsTo(Organization::class);
    }

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function scopeByOrganization($query, $organizationId)
    {
        return $query->where('organization_id', $organizationId);
    }

    public function scopeByType($query, $type)
    {
        return $query->where('backup_type', $type);
    }

    public function scopeSuccessful($query)
    {
        return $query->where('status', 'completed');
    }

    public function scopeRestorable($query)
    {
        return $query->where('is_restorable', true);
    }

    public function getDurationAttribute()
    {
        if ($this->started_at && $this->completed_at) {
            return $this->started_at->diffInMinutes($this->completed_at);
        }
        return null;
    }
}

class ScheduledTask extends Model
{
    use HasFactory;

    protected $fillable = [
        'organization_id',
        'task_name',
        'task_type',
        'command',
        'parameters',
        'schedule_expression',
        'frequency',
        'next_run_at',
        'last_run_at',
        'last_success_at',
        'run_count',
        'success_count',
        'failure_count',
        'last_error',
        'status',
        'is_running',
        'notify_on_failure',
        'notification_recipients',
        'created_by',
    ];

    protected $casts = [
        'parameters' => 'array',
        'schedule_expression' => 'string',
        'next_run_at' => 'datetime',
        'last_run_at' => 'datetime',
        'last_success_at' => 'datetime',
        'is_running' => 'boolean',
        'notify_on_failure' => 'boolean',
        'notification_recipients' => 'array',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function organization()
    {
        return $this->belongsTo(Organization::class);
    }

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function scopeByOrganization($query, $organizationId)
    {
        return $query->where('organization_id', $organizationId);
    }

    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeDueNow($query)
    {
        return $query->where('next_run_at', '<=', now());
    }

    public function markAsRunning()
    {
        $this->update(['is_running' => true]);
    }

    public function markAsCompleted($success = true, $error = null)
    {
        $updates = [
            'is_running' => false,
            'last_run_at' => now(),
            'run_count' => $this->run_count + 1,
        ];

        if ($success) {
            $updates['last_success_at'] = now();
            $updates['success_count'] = $this->success_count + 1;
            $updates['last_error'] = null;
        } else {
            $updates['failure_count'] = $this->failure_count + 1;
            $updates['last_error'] = $error;
        }

        $this->update($updates);
    }

    public function scheduleNextRun()
    {
        $nextRun = now();
        switch ($this->frequency) {
            case 'daily':
                $nextRun->addDay();
                break;
            case 'weekly':
                $nextRun->addWeek();
                break;
            case 'monthly':
                $nextRun->addMonth();
                break;
            case 'hourly':
                $nextRun->addHour();
                break;
            case 'once':
                $this->update(['status' => 'completed']);
                return;
            default:
                // Use cron expression if available, else default to daily
                $nextRun->addDay();
        }

        $this->update(['next_run_at' => $nextRun]);
    }
}

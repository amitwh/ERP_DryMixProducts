<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ErpSyncLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'integration_id',
        'sync_type',
        'entity_type',
        'direction',
        'started_at',
        'completed_at',
        'status',
        'records_processed',
        'records_success',
        'records_failed',
        'failed_records',
        'error_message',
        'sync_data',
        'duration_seconds',
        'summary',
    ];

    protected $casts = [
        'started_at' => 'datetime',
        'completed_at' => 'datetime',
        'records_processed' => 'integer',
        'records_success' => 'integer',
        'records_failed' => 'integer',
        'failed_records' => 'array',
        'sync_data' => 'array',
        'summary' => 'array',
        'duration_seconds' => 'decimal:2',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function integration()
    {
        return $this->belongsTo(ErpIntegration::class, 'integration_id');
    }

    public function scopeByIntegration($query, $integrationId)
    {
        return $query->where('integration_id', $integrationId);
    }

    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    public function scopeByEntityType($query, $entityType)
    {
        return $query->where('entity_type', $entityType);
    }

    public function scopeByDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('started_at', [$startDate, $endDate]);
    }

    public function scopeRecent($query, $days = 7)
    {
        return $query->where('started_at', '>=', now()->subDays($days));
    }

    public function scopeInProgress($query)
    {
        return $query->where('status', 'in_progress');
    }

    public function getDurationFormattedAttribute(): string
    {
        if (!$this->duration_seconds) return 'N/A';
        return gmdate('H:i:s', $this->duration_seconds);
    }

    public function getSuccessRateAttribute(): float
    {
        if ($this->records_processed === 0) return 0;
        return round(($this->records_success / $this->records_processed) * 100, 2);
    }
}

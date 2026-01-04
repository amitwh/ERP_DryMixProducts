<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PlantAutomationAlarm extends Model
{
    use HasFactory;

    protected $fillable = [
        'config_id',
        'tag_id',
        'alarm_code',
        'alarm_type',
        'severity',
        'status',
        'description',
        'trigger_value',
        'threshold_value',
        'occurred_at',
        'acknowledged_at',
        'cleared_at',
        'acknowledged_by',
        'acknowledgement_note',
        'acknowledgement_duration_seconds',
        'alarm_data',
    ];

    protected $casts = [
        'trigger_value' => 'decimal:8',
        'threshold_value' => 'decimal:8',
        'occurred_at' => 'datetime',
        'acknowledged_at' => 'datetime',
        'cleared_at' => 'datetime',
        'acknowledgement_duration_seconds' => 'integer',
        'alarm_data' => 'array',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function config()
    {
        return $this->belongsTo(PlantAutomationConfig::class);
    }

    public function tag()
    {
        return $this->belongsTo(PlantAutomationTag::class);
    }

    public function acknowledgedBy()
    {
        return $this->belongsTo(User::class, 'acknowledged_by');
    }

    public function scopeByConfig($query, $configId)
    {
        return $query->where('config_id', $configId);
    }

    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    public function scopeBySeverity($query, $severity)
    {
        return $query->where('severity', $severity);
    }

    public function scopeByType($query, $type)
    {
        return $query->where('alarm_type', $type);
    }

    public function scopeByDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('occurred_at', [$startDate, $endDate]);
    }

    public function scopeRecent($query, $hours = 24)
    {
        return $query->where('occurred_at', '>=', now()->subHours($hours));
    }

    public function scopeActive($query)
    {
        return $query->whereIn('status', ['active', 'acknowledged']);
    }

    public function scopeUnacknowledged($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeAcknowledged($query)
    {
        return $query->where('status', 'acknowledged');
    }

    public function acknowledge($userId, $note = null)
    {
        $this->update([
            'status' => 'acknowledged',
            'acknowledged_at' => now(),
            'acknowledged_by' => $userId,
            'acknowledgement_note' => $note,
            'acknowledgement_duration_seconds' => $this->occurred_at->diffInSeconds(now()),
        ]);
    }

    public function clear()
    {
        $this->update([
            'status' => 'cleared',
            'cleared_at' => now(),
        ]);
    }

    public function getDurationInSecondsAttribute(): ?int
    {
        $endTime = $this->cleared_at ?? $this->acknowledged_at ?? now();
        return $this->occurred_at->diffInSeconds($endTime);
    }

    public function getDurationFormattedAttribute(): ?string
    {
        $seconds = $this->duration_in_seconds;
        if (!$seconds) return 'N/A';

        $hours = floor($seconds / 3600);
        $minutes = floor(($seconds % 3600) / 60);
        $secs = $seconds % 60;

        return sprintf('%02d:%02d:%02d', $hours, $minutes, $secs);
    }
}

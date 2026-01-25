<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder;

class DeliveryWaypoint extends Model
{
    use HasFactory;

    protected $table = 'delivery_waypoints';

    protected $fillable = [
        'delivery_tracking_id',
        'sequence',
        'waypoint_type',
        'name',
        'latitude',
        'longitude',
        'address',
        'expected_arrival',
        'actual_arrival',
        'duration_minutes',
        'notes',
        'status',
    ];

    protected $casts = [
        'sequence' => 'integer',
        'latitude' => 'decimal:8',
        'longitude' => 'decimal:8',
        'expected_arrival' => 'datetime',
        'actual_arrival' => 'datetime',
        'duration_minutes' => 'integer',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    const TYPE_ORIGIN = 'origin';
    const TYPE_STOP = 'stop';
    const TYPE_DESTINATION = 'destination';

    const STATUS_PENDING = 'pending';
    const STATUS_ARRIVED = 'arrived';
    const STATUS_DEPARTED = 'departed';
    const STATUS_SKIPPED = 'skipped';

    public static function getTypes(): array
    {
        return [
            self::TYPE_ORIGIN,
            self::TYPE_STOP,
            self::TYPE_DESTINATION,
        ];
    }

    public static function getStatuses(): array
    {
        return [
            self::STATUS_PENDING,
            self::STATUS_ARRIVED,
            self::STATUS_DEPARTED,
            self::STATUS_SKIPPED,
        ];
    }

    // Relationships
    public function deliveryTracking()
    {
        return $this->belongsTo(DeliveryTracking::class, 'delivery_tracking_id');
    }

    // Scopes
    public function scopeByType(Builder $query, string $type): Builder
    {
        return $query->where('waypoint_type', $type);
    }

    public function scopeByStatus(Builder $query, string $status): Builder
    {
        return $query->where('status', $status);
    }

    public function scopePending(Builder $query): Builder
    {
        return $query->where('status', self::STATUS_PENDING);
    }

    public function scopeCompleted(Builder $query): Builder
    {
        return $query->whereIn('status', [self::STATUS_DEPARTED, self::STATUS_SKIPPED]);
    }

    public function scopeOrdered(Builder $query): Builder
    {
        return $query->orderBy('sequence');
    }

    // Accessors
    public function getCoordinatesAttribute(): array
    {
        return [
            'latitude' => (float) $this->latitude,
            'longitude' => (float) $this->longitude,
        ];
    }

    public function getIsCompletedAttribute(): bool
    {
        return in_array($this->status, [
            self::STATUS_DEPARTED,
            self::STATUS_SKIPPED,
        ]);
    }

    public function getIsOnTimeAttribute(): ?bool
    {
        if (!$this->actual_arrival || !$this->expected_arrival) {
            return null;
        }
        return $this->actual_arrival <= $this->expected_arrival;
    }

    public function getDelayMinutesAttribute(): ?int
    {
        if (!$this->actual_arrival || !$this->expected_arrival) {
            return null;
        }
        $diff = $this->actual_arrival->diffInMinutes($this->expected_arrival, false);
        return $diff > 0 ? $diff : 0;
    }

    // Methods
    public function markAsArrived(): void
    {
        $this->update([
            'status' => self::STATUS_ARRIVED,
            'actual_arrival' => now(),
        ]);
    }

    public function markAsDeparted(): void
    {
        $this->update([
            'status' => self::STATUS_DEPARTED,
        ]);
    }

    public function skip(string $reason = null): void
    {
        $this->update([
            'status' => self::STATUS_SKIPPED,
            'notes' => $reason ?? $this->notes,
        ]);
    }

    /**
     * Get the next waypoint in sequence
     */
    public function getNextWaypoint(): ?self
    {
        return static::where('delivery_tracking_id', $this->delivery_tracking_id)
            ->where('sequence', '>', $this->sequence)
            ->orderBy('sequence')
            ->first();
    }

    /**
     * Get the previous waypoint in sequence
     */
    public function getPreviousWaypoint(): ?self
    {
        return static::where('delivery_tracking_id', $this->delivery_tracking_id)
            ->where('sequence', '<', $this->sequence)
            ->orderBy('sequence', 'desc')
            ->first();
    }
}

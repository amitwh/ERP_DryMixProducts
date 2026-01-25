<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;

class DeliveryTracking extends Model
{
    use HasFactory, LogsActivity;

    protected $table = 'delivery_tracking';

    protected $fillable = [
        'org_id',
        'sales_order_id',
        'vehicle_number',
        'driver_name',
        'driver_phone',
        'origin_latitude',
        'origin_longitude',
        'origin_address',
        'destination_latitude',
        'destination_longitude',
        'destination_address',
        'current_latitude',
        'current_longitude',
        'estimated_distance_km',
        'estimated_duration_minutes',
        'actual_distance_km',
        'status',
        'dispatched_at',
        'estimated_arrival',
        'actual_arrival',
        'delivery_notes',
        'proof_of_delivery',
        'recipient_name',
        'recipient_signature',
    ];

    protected $casts = [
        'origin_latitude' => 'decimal:8',
        'origin_longitude' => 'decimal:8',
        'destination_latitude' => 'decimal:8',
        'destination_longitude' => 'decimal:8',
        'current_latitude' => 'decimal:8',
        'current_longitude' => 'decimal:8',
        'estimated_distance_km' => 'decimal:2',
        'estimated_duration_minutes' => 'integer',
        'actual_distance_km' => 'decimal:2',
        'dispatched_at' => 'datetime',
        'estimated_arrival' => 'datetime',
        'actual_arrival' => 'datetime',
        'proof_of_delivery' => 'array',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    const STATUS_PENDING = 'pending';
    const STATUS_DISPATCHED = 'dispatched';
    const STATUS_IN_TRANSIT = 'in_transit';
    const STATUS_ARRIVED = 'arrived';
    const STATUS_DELIVERED = 'delivered';
    const STATUS_FAILED = 'failed';
    const STATUS_RETURNED = 'returned';

    public static function getStatuses(): array
    {
        return [
            self::STATUS_PENDING,
            self::STATUS_DISPATCHED,
            self::STATUS_IN_TRANSIT,
            self::STATUS_ARRIVED,
            self::STATUS_DELIVERED,
            self::STATUS_FAILED,
            self::STATUS_RETURNED,
        ];
    }

    // Relationships
    public function organization()
    {
        return $this->belongsTo(Organization::class, 'org_id');
    }

    public function salesOrder()
    {
        return $this->belongsTo(SalesOrder::class, 'sales_order_id');
    }

    public function waypoints()
    {
        return $this->hasMany(DeliveryWaypoint::class, 'delivery_tracking_id')
                    ->orderBy('sequence');
    }

    public function locationHistory()
    {
        return $this->hasMany(LocationHistory::class, 'entity_id')
                    ->where('entity_type', 'delivery_tracking')
                    ->orderBy('recorded_at', 'desc');
    }

    // Scopes
    public function scopeByOrganization(Builder $query, int $organizationId): Builder
    {
        return $query->where('org_id', $organizationId);
    }

    public function scopeByStatus(Builder $query, string $status): Builder
    {
        return $query->where('status', $status);
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->whereIn('status', [
            self::STATUS_DISPATCHED,
            self::STATUS_IN_TRANSIT,
        ]);
    }

    public function scopeDispatchedBetween(Builder $query, $start, $end): Builder
    {
        return $query->whereBetween('dispatched_at', [$start, $end]);
    }

    // Accessors
    public function getOriginCoordinatesAttribute(): array
    {
        return [
            'latitude' => (float) $this->origin_latitude,
            'longitude' => (float) $this->origin_longitude,
        ];
    }

    public function getDestinationCoordinatesAttribute(): array
    {
        return [
            'latitude' => (float) $this->destination_latitude,
            'longitude' => (float) $this->destination_longitude,
        ];
    }

    public function getCurrentCoordinatesAttribute(): ?array
    {
        if (!$this->current_latitude || !$this->current_longitude) {
            return null;
        }
        return [
            'latitude' => (float) $this->current_latitude,
            'longitude' => (float) $this->current_longitude,
        ];
    }

    public function getIsActiveAttribute(): bool
    {
        return in_array($this->status, [
            self::STATUS_DISPATCHED,
            self::STATUS_IN_TRANSIT,
        ]);
    }

    public function getIsCompletedAttribute(): bool
    {
        return in_array($this->status, [
            self::STATUS_DELIVERED,
            self::STATUS_FAILED,
            self::STATUS_RETURNED,
        ]);
    }

    public function getRemainingDistanceKmAttribute(): ?float
    {
        if (!$this->current_latitude || !$this->current_longitude) {
            return null;
        }

        return LocationHistory::calculateDistance(
            (float) $this->current_latitude,
            (float) $this->current_longitude,
            (float) $this->destination_latitude,
            (float) $this->destination_longitude
        );
    }

    // Methods
    public function updateCurrentLocation(float $latitude, float $longitude): void
    {
        $this->update([
            'current_latitude' => $latitude,
            'current_longitude' => $longitude,
        ]);

        LocationHistory::create([
            'org_id' => $this->org_id,
            'entity_type' => 'delivery_tracking',
            'entity_id' => $this->id,
            'latitude' => $latitude,
            'longitude' => $longitude,
            'recorded_at' => now(),
        ]);
    }

    public function markAsDispatched(): void
    {
        $this->update([
            'status' => self::STATUS_DISPATCHED,
            'dispatched_at' => now(),
        ]);
    }

    public function markAsDelivered(string $recipientName, ?string $signature = null): void
    {
        $this->update([
            'status' => self::STATUS_DELIVERED,
            'actual_arrival' => now(),
            'recipient_name' => $recipientName,
            'recipient_signature' => $signature,
        ]);
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['status', 'vehicle_number', 'driver_name'])
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs();
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder;

class LocationHistory extends Model
{
    use HasFactory;

    protected $table = 'location_history';

    protected $fillable = [
        'org_id',
        'entity_type',
        'entity_id',
        'latitude',
        'longitude',
        'altitude',
        'accuracy',
        'heading',
        'speed',
        'recorded_at',
        'metadata',
    ];

    protected $casts = [
        'latitude' => 'decimal:8',
        'longitude' => 'decimal:8',
        'altitude' => 'decimal:2',
        'accuracy' => 'decimal:2',
        'heading' => 'decimal:2',
        'speed' => 'decimal:2',
        'recorded_at' => 'datetime',
        'metadata' => 'array',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    // Relationships
    public function organization()
    {
        return $this->belongsTo(Organization::class, 'org_id');
    }

    /**
     * Get the parent entity (polymorphic)
     */
    public function entity()
    {
        return $this->morphTo('entity', 'entity_type', 'entity_id');
    }

    // Scopes
    public function scopeByOrganization(Builder $query, int $organizationId): Builder
    {
        return $query->where('org_id', $organizationId);
    }

    public function scopeByEntity(Builder $query, string $entityType, int $entityId): Builder
    {
        return $query->where('entity_type', $entityType)
                     ->where('entity_id', $entityId);
    }

    public function scopeRecordedBetween(Builder $query, $start, $end): Builder
    {
        return $query->whereBetween('recorded_at', [$start, $end]);
    }

    public function scopeNearLocation(Builder $query, float $lat, float $lng, float $radiusKm): Builder
    {
        // Haversine formula for distance calculation
        $haversine = "(6371 * acos(cos(radians(?))
                       * cos(radians(latitude))
                       * cos(radians(longitude) - radians(?))
                       + sin(radians(?))
                       * sin(radians(latitude))))";

        return $query->selectRaw("*, {$haversine} AS distance", [$lat, $lng, $lat])
                     ->havingRaw("distance < ?", [$radiusKm])
                     ->orderBy('distance');
    }

    // Accessors
    public function getCoordinatesAttribute(): array
    {
        return [
            'latitude' => (float) $this->latitude,
            'longitude' => (float) $this->longitude,
        ];
    }

    public function getGeoJsonPointAttribute(): array
    {
        return [
            'type' => 'Point',
            'coordinates' => [(float) $this->longitude, (float) $this->latitude],
        ];
    }

    // Static Methods
    public static function calculateDistance(float $lat1, float $lng1, float $lat2, float $lng2): float
    {
        $earthRadius = 6371; // km

        $dLat = deg2rad($lat2 - $lat1);
        $dLng = deg2rad($lng2 - $lng1);

        $a = sin($dLat / 2) * sin($dLat / 2) +
             cos(deg2rad($lat1)) * cos(deg2rad($lat2)) *
             sin($dLng / 2) * sin($dLng / 2);

        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));

        return $earthRadius * $c;
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Builder;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;

class GeoTag extends Model
{
    use HasFactory, SoftDeletes, LogsActivity;

    protected $table = 'geo_tags';

    protected $fillable = [
        'organization_id',
        'entity_type',
        'entity_id',
        'tag_type',
        'name',
        'description',
        'latitude',
        'longitude',
        'accuracy',
        'altitude',
        'address',
        'photos',
        'notes',
        'tagged_by',
        'tagged_at',
        'verified',
        'verified_by',
        'verified_at',
        'metadata',
    ];

    protected $casts = [
        'latitude' => 'decimal:8',
        'longitude' => 'decimal:8',
        'accuracy' => 'decimal:2',
        'altitude' => 'decimal:2',
        'photos' => 'array',
        'tagged_at' => 'datetime',
        'verified' => 'boolean',
        'verified_at' => 'datetime',
        'metadata' => 'array',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    const TYPE_SITE = 'site';
    const TYPE_DELIVERY = 'delivery';
    const TYPE_INSPECTION = 'inspection';
    const TYPE_INCIDENT = 'incident';
    const TYPE_SAMPLE = 'sample';
    const TYPE_EQUIPMENT = 'equipment';
    const TYPE_MATERIAL = 'material';
    const TYPE_OTHER = 'other';

    public static function getTypes(): array
    {
        return [
            self::TYPE_SITE,
            self::TYPE_DELIVERY,
            self::TYPE_INSPECTION,
            self::TYPE_INCIDENT,
            self::TYPE_SAMPLE,
            self::TYPE_EQUIPMENT,
            self::TYPE_MATERIAL,
            self::TYPE_OTHER,
        ];
    }

    // Relationships
    public function organization()
    {
        return $this->belongsTo(Organization::class, 'organization_id');
    }

    public function taggedByUser()
    {
        return $this->belongsTo(User::class, 'tagged_by');
    }

    public function verifiedByUser()
    {
        return $this->belongsTo(User::class, 'verified_by');
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
        return $query->where('organization_id', $organizationId);
    }

    public function scopeByEntity(Builder $query, string $entityType, ?int $entityId = null): Builder
    {
        $query->where('entity_type', $entityType);
        if ($entityId !== null) {
            $query->where('entity_id', $entityId);
        }
        return $query;
    }

    public function scopeByType(Builder $query, string $tagType): Builder
    {
        return $query->where('tag_type', $tagType);
    }

    public function scopeVerified(Builder $query): Builder
    {
        return $query->where('verified', true);
    }

    public function scopeUnverified(Builder $query): Builder
    {
        return $query->where('verified', false);
    }

    public function scopeTaggedBetween(Builder $query, $start, $end): Builder
    {
        return $query->whereBetween('tagged_at', [$start, $end]);
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

    public function getPhotosCountAttribute(): int
    {
        return is_array($this->photos) ? count($this->photos) : 0;
    }

    // Methods
    public function verify(int $userId): void
    {
        $this->update([
            'verified' => true,
            'verified_by' => $userId,
            'verified_at' => now(),
        ]);
    }

    public function unverify(): void
    {
        $this->update([
            'verified' => false,
            'verified_by' => null,
            'verified_at' => null,
        ]);
    }

    public function addPhoto(string $photoPath): void
    {
        $photos = $this->photos ?? [];
        $photos[] = $photoPath;
        $this->update(['photos' => $photos]);
    }

    public function removePhoto(string $photoPath): void
    {
        $photos = $this->photos ?? [];
        $photos = array_filter($photos, fn($p) => $p !== $photoPath);
        $this->update(['photos' => array_values($photos)]);
    }

    /**
     * Calculate distance to another point
     */
    public function distanceTo(float $lat, float $lng): float
    {
        return LocationHistory::calculateDistance(
            (float) $this->latitude,
            (float) $this->longitude,
            $lat,
            $lng
        );
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['name', 'tag_type', 'verified'])
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs();
    }
}

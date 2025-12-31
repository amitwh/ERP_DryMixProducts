<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;

class ManufacturingUnit extends Model
{
    use HasFactory, SoftDeletes, LogsActivity;

    protected $fillable = [
        'organization_id',
        'name',
        'code',
        'type',
        'address',
        'city',
        'state',
        'country',
        'postal_code',
        'phone',
        'email',
        'capacity_per_day',
        'capacity_unit',
        'status',
        'settings',
    ];

    protected $casts = [
        'capacity_per_day' => 'decimal:2',
        'settings' => 'array',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['name', 'code', 'status', 'capacity_per_day'])
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs();
    }

    // Relationships
    public function organization()
    {
        return $this->belongsTo(Organization::class);
    }

    public function users()
    {
        return $this->hasMany(User::class);
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeByOrganization($query, $organizationId)
    {
        return $query->where('organization_id', $organizationId);
    }

    public function scopeProduction($query)
    {
        return $query->where('type', 'production');
    }

    // Accessors
    public function getIsActiveAttribute()
    {
        return $this->status === 'active';
    }

    public function getFullAddressAttribute()
    {
        return trim("{$this->address}, {$this->city}, {$this->state} {$this->postal_code}");
    }
}

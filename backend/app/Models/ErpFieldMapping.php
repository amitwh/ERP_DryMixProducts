<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ErpFieldMapping extends Model
{
    use HasFactory;

    protected $fillable = [
        'integration_id',
        'local_entity',
        'local_field',
        'external_entity',
        'external_field',
        'data_type',
        'is_required',
        'default_value',
        'transformation_rule',
        'is_active',
    ];

    protected $casts = [
        'is_required' => 'boolean',
        'is_active' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function integration()
    {
        return $this->belongsTo(ErpIntegration::class, 'integration_id');
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeByIntegration($query, $integrationId)
    {
        return $query->where('integration_id', $integrationId);
    }

    public function scopeByLocalEntity($query, $entity)
    {
        return $query->where('local_entity', $entity);
    }

    public function scopeRequired($query)
    {
        return $query->where('is_required', true);
    }
}

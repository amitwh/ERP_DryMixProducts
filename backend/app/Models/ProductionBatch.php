<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProductionBatch extends Model
{
    use HasFactory;

    protected $fillable = [
        'production_order_id',
        'batch_number',
        'batch_date',
        'quantity',
        'unit_of_measure',
        'start_time',
        'end_time',
        'quality_status',
        'quality_checked_by',
        'quality_remarks',
        'status',
        'material_consumption',
        'quality_parameters',
    ];

    protected $casts = [
        'batch_date' => 'date',
        'start_time' => 'datetime',
        'end_time' => 'datetime',
        'quantity' => 'decimal:2',
        'material_consumption' => 'array',
        'quality_parameters' => 'array',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    // Relationships
    public function productionOrder()
    {
        return $this->belongsTo(ProductionOrder::class);
    }

    public function qualityCheckedBy()
    {
        return $this->belongsTo(User::class, 'quality_checked_by');
    }

    public function materialConsumptions()
    {
        return $this->hasMany(MaterialConsumption::class);
    }

    // Accessors
    public function getDurationAttribute()
    {
        if ($this->start_time && $this->end_time) {
            return $this->start_time->diffInHours($this->end_time);
        }
        return null;
    }

    public function getIsQualityPassedAttribute()
    {
        return $this->quality_status === 'passed';
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MaterialConsumption extends Model
{
    use HasFactory;

    protected $fillable = [
        'production_batch_id',
        'raw_material_id',
        'planned_quantity',
        'actual_quantity',
        'unit_of_measure',
        'variance',
        'issued_by',
        'issued_at',
        'remarks',
    ];

    protected $casts = [
        'planned_quantity' => 'decimal:2',
        'actual_quantity' => 'decimal:2',
        'variance' => 'decimal:2',
        'issued_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    // Relationships
    public function productionBatch()
    {
        return $this->belongsTo(ProductionBatch::class);
    }

    public function rawMaterial()
    {
        return $this->belongsTo(Product::class, 'raw_material_id');
    }

    public function issuedBy()
    {
        return $this->belongsTo(User::class, 'issued_by');
    }

    // Accessors
    public function getVariancePercentageAttribute()
    {
        if ($this->planned_quantity > 0) {
            return (($this->actual_quantity - $this->planned_quantity) / $this->planned_quantity) * 100;
        }
        return 0;
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BomItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'bill_of_material_id',
        'raw_material_id',
        'quantity',
        'unit_of_measure',
        'wastage_percentage',
        'sequence',
        'notes',
    ];

    protected $casts = [
        'quantity' => 'decimal:2',
        'wastage_percentage' => 'decimal:2',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    // Relationships
    public function billOfMaterial()
    {
        return $this->belongsTo(BillOfMaterial::class);
    }

    public function rawMaterial()
    {
        return $this->belongsTo(Product::class, 'raw_material_id');
    }

    // Accessors
    public function getQuantityWithWastageAttribute()
    {
        return $this->quantity * (1 + $this->wastage_percentage / 100);
    }
}

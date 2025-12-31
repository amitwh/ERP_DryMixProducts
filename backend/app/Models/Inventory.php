<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Inventory extends Model
{
    use HasFactory;

    protected $table = 'inventory';

    protected $fillable = [
        'organization_id',
        'manufacturing_unit_id',
        'product_id',
        'quantity_on_hand',
        'quantity_reserved',
        'quantity_available',
        'minimum_stock',
        'maximum_stock',
        'reorder_level',
        'location',
        'last_stock_take_date',
    ];

    protected $casts = [
        'quantity_on_hand' => 'decimal:2',
        'quantity_reserved' => 'decimal:2',
        'quantity_available' => 'decimal:2',
        'minimum_stock' => 'decimal:2',
        'maximum_stock' => 'decimal:2',
        'reorder_level' => 'decimal:2',
        'last_stock_take_date' => 'date',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    // Relationships
    public function organization()
    {
        return $this->belongsTo(Organization::class);
    }

    public function manufacturingUnit()
    {
        return $this->belongsTo(ManufacturingUnit::class);
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function stockTransactions()
    {
        return $this->hasMany(StockTransaction::class, 'product_id', 'product_id')
                    ->where('manufacturing_unit_id', $this->manufacturing_unit_id);
    }

    // Scopes
    public function scopeLowStock($query)
    {
        return $query->whereColumn('quantity_available', '<=', 'reorder_level');
    }

    public function scopeOutOfStock($query)
    {
        return $query->where('quantity_available', '<=', 0);
    }

    // Accessors
    public function getStockStatusAttribute()
    {
        if ($this->quantity_available <= 0) {
            return 'out_of_stock';
        } elseif ($this->quantity_available <= $this->reorder_level) {
            return 'low_stock';
        } elseif ($this->quantity_available >= $this->maximum_stock) {
            return 'overstock';
        }
        return 'normal';
    }
}

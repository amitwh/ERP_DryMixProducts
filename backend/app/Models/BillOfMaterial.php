<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class BillOfMaterial extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'organization_id',
        'product_id',
        'bom_number',
        'version',
        'effective_date',
        'expiry_date',
        'output_quantity',
        'output_unit',
        'status',
        'notes',
    ];

    protected $casts = [
        'effective_date' => 'date',
        'expiry_date' => 'date',
        'output_quantity' => 'decimal:2',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    // Relationships
    public function organization()
    {
        return $this->belongsTo(Organization::class);
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function items()
    {
        return $this->hasMany(BomItem::class);
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('status', 'active')
                     ->where('effective_date', '<=', now())
                     ->where(function($q) {
                         $q->whereNull('expiry_date')
                           ->orWhere('expiry_date', '>=', now());
                     });
    }

    // Accessors
    public function getIsActiveAttribute()
    {
        return $this->status === 'active' 
               && $this->effective_date <= now()
               && (!$this->expiry_date || $this->expiry_date >= now());
    }

    public function getTotalMaterialCostAttribute()
    {
        return $this->items->sum(function($item) {
            return $item->quantity * ($item->rawMaterial->standard_cost ?? 0);
        });
    }
}

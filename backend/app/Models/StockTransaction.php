<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StockTransaction extends Model
{
    use HasFactory;

    protected $fillable = [
        'organization_id',
        'manufacturing_unit_id',
        'product_id',
        'transaction_number',
        'transaction_type',
        'quantity',
        'unit_of_measure',
        'reference_type',
        'reference_id',
        'reason',
        'created_by',
        'transaction_date',
        'metadata',
    ];

    protected $casts = [
        'quantity' => 'decimal:2',
        'transaction_date' => 'datetime',
        'metadata' => 'array',
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

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function reference()
    {
        return $this->morphTo();
    }

    // Scopes
    public function scopeReceipts($query)
    {
        return $query->where('transaction_type', 'receipt');
    }

    public function scopeIssues($query)
    {
        return $query->where('transaction_type', 'issue');
    }

    public function scopeByDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('transaction_date', [$startDate, $endDate]);
    }
}

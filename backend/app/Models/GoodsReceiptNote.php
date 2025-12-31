<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class GoodsReceiptNote extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'organization_id',
        'purchase_order_id',
        'supplier_id',
        'manufacturing_unit_id',
        'grn_number',
        'grn_date',
        'vehicle_number',
        'driver_name',
        'lr_number',
        'remarks',
        'received_by',
        'inspected_by',
        'status',
        'attachments',
    ];

    protected $casts = [
        'grn_date' => 'date',
        'attachments' => 'array',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    // Relationships
    public function organization()
    {
        return $this->belongsTo(Organization::class);
    }

    public function purchaseOrder()
    {
        return $this->belongsTo(PurchaseOrder::class);
    }

    public function supplier()
    {
        return $this->belongsTo(Supplier::class);
    }

    public function manufacturingUnit()
    {
        return $this->belongsTo(ManufacturingUnit::class);
    }

    public function receivedBy()
    {
        return $this->belongsTo(User::class, 'received_by');
    }

    public function inspectedBy()
    {
        return $this->belongsTo(User::class, 'inspected_by');
    }

    // Scopes
    public function scopeAccepted($query)
    {
        return $query->where('status', 'accepted');
    }

    public function scopePendingInspection($query)
    {
        return $query->where('status', 'pending_inspection');
    }
}

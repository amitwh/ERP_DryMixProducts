<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Supplier extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'organization_id',
        'name',
        'code',
        'supplier_type',
        'contact_person',
        'phone',
        'email',
        'address',
        'city',
        'state',
        'country',
        'postal_code',
        'gstin',
        'pan',
        'payment_terms_days',
        'credit_limit',
        'rating',
        'status',
        'certifications',
    ];

    protected $casts = [
        'credit_limit' => 'decimal:2',
        'certifications' => 'array',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    // Relationships
    public function organization()
    {
        return $this->belongsTo(Organization::class);
    }

    public function purchaseOrders()
    {
        return $this->hasMany(PurchaseOrder::class);
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeByRating($query, $rating)
    {
        return $query->where('rating', $rating);
    }
}

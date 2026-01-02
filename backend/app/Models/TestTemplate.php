<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TestTemplate extends Model
{
    use HasFactory;

    protected $fillable = [
        'organization_id',
        'template_code',
        'template_name',
        'test_type',
        'product_id',
        'selected_parameters',
        'parameter_limits',
        'instructions',
        'standard_id',
        'is_default',
        'is_active',
        'created_by',
    ];

    protected $casts = [
        'selected_parameters' => 'array',
        'parameter_limits' => 'array',
        'is_default' => 'boolean',
        'is_active' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function organization()
    {
        return $this->belongsTo(Organization::class);
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function standard()
    {
        return $this->belongsTo(TestStandard::class);
    }

    public function createdBy()
    {
        return $this->belongsTo(User::class);
    }

    public function scopeByOrganization($query, $organizationId)
    {
        return $query->where('organization_id', $organizationId);
    }

    public function scopeByTestType($query, $testType)
    {
        return $query->where('test_type', $testType);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeDefault($query)
    {
        return $query->where('is_default', true);
    }
}

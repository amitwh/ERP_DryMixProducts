<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Kpi extends Model
{
    use HasFactory;

    protected $table = 'kpis';

    protected $fillable = [
        'org_id',
        'kpi_code',
        'kpi_name',
        'kpi_category',
        'description',
        'calculation_formula',
        'uom',
        'target_value',
        'tolerance_percentage',
        'frequency',
        'data_source',
        'is_active',
    ];

    protected $casts = [
        'target_value' => 'decimal:2',
        'tolerance_percentage' => 'decimal:2',
        'is_active' => 'boolean',
    ];

    public function organization()
    {
        return $this->belongsTo(Organization::class);
    }

    public function values()
    {
        return $this->hasMany(KpiValue::class);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeByCategory($query, $category)
    {
        return $query->where('kpi_category', $category);
    }
}

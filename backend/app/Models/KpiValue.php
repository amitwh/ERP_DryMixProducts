<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class KpiValue extends Model
{
    use HasFactory;

    protected $table = 'kpi_values';

    protected $fillable = [
        'kpi_id',
        'org_id',
        'unit_id',
        'record_date',
        'actual_value',
        'target_value',
        'variance',
        'variance_percentage',
        'achievement_percentage',
        'status',
        'trend',
        'notes',
        'calculated_at',
    ];

    protected $casts = [
        'actual_value' => 'decimal:2',
        'target_value' => 'decimal:2',
        'variance' => 'decimal:2',
        'variance_percentage' => 'decimal:2',
        'achievement_percentage' => 'decimal:2',
        'record_date' => 'date',
        'calculated_at' => 'datetime',
    ];

    public function kpi()
    {
        return $this->belongsTo(Kpi::class);
    }

    public function organization()
    {
        return $this->belongsTo(Organization::class);
    }

    public function unit()
    {
        return $this->belongsTo(ManufacturingUnit::class);
    }

    public function scopeByKpi($query, $kpiId)
    {
        return $query->where('kpi_id', $kpiId);
    }

    public function scopeByDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('record_date', [$startDate, $endDate]);
    }
}

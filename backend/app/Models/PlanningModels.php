<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class ProductionPlan extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'organization_id',
        'manufacturing_unit_id',
        'product_id',
        'plan_number',
        'plan_name',
        'plan_type',
        'start_date',
        'end_date',
        'planned_quantity',
        'actual_quantity',
        'capacity_percentage',
        'status',
        'notes',
        'created_by',
        'approved_by',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'planned_quantity' => 'decimal:3',
        'actual_quantity' => 'decimal:3',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

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

    public function materialRequirements()
    {
        return $this->hasMany(MaterialRequirement::class);
    }

    public function productionSchedules()
    {
        return $this->hasMany(ProductionSchedule::class);
    }

    public function scopeByOrganization($query, $organizationId)
    {
        return $query->where('organization_id', $organizationId);
    }

    public function scopeByUnit($query, $unitId)
    {
        return $query->where('manufacturing_unit_id', $unitId);
    }

    public function getProgressPercentageAttribute()
    {
        if ($this->planned_quantity > 0) {
            return ($this->actual_quantity / $this->planned_quantity) * 100;
        }
        return 0;
    }
}

class MaterialRequirement extends Model
{
    use HasFactory;

    protected $fillable = [
        'organization_id',
        'production_plan_id',
        'raw_material_id',
        'required_quantity',
        'available_quantity',
        'to_purchase',
        'status',
        'required_by_date',
        'notes',
    ];

    protected $casts = [
        'required_quantity' => 'decimal:3',
        'available_quantity' => 'decimal:3',
        'to_purchase' => 'decimal:3',
        'required_by_date' => 'date',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function organization()
    {
        return $this->belongsTo(Organization::class);
    }

    public function productionPlan()
    {
        return $this->belongsTo(ProductionPlan::class);
    }

    public function rawMaterial()
    {
        return $this->belongsTo(Product::class, 'raw_material_id');
    }

    public function scopeByOrganization($query, $organizationId)
    {
        return $query->where('organization_id', $organizationId);
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }
}

class CapacityPlan extends Model
{
    use HasFactory;

    protected $fillable = [
        'organization_id',
        'manufacturing_unit_id',
        'production_line_id',
        'plan_number',
        'start_date',
        'end_date',
        'available_hours',
        'planned_hours',
        'used_hours',
        'buffer_hours',
        'utilization_percentage',
        'status',
        'notes',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function organization()
    {
        return $this->belongsTo(Organization::class);
    }

    public function manufacturingUnit()
    {
        return $this->belongsTo(ManufacturingUnit::class);
    }

    public function scopeByOrganization($query, $organizationId)
    {
        return $query->where('organization_id', $organizationId);
    }

    public function calculateUtilization()
    {
        if ($this->available_hours > 0) {
            $this->utilization_percentage = round(($this->used_hours / $this->available_hours) * 100, 2);
        }
        $this->save();
    }
}

class DemandForecast extends Model
{
    use HasFactory;

    protected $fillable = [
        'organization_id',
        'product_id',
        'customer_id',
        'forecast_date',
        'forecast_period_months',
        'forecasted_quantity',
        'actual_quantity',
        'accuracy_percentage',
        'forecast_type',
        'notes',
        'created_by',
    ];

    protected $casts = [
        'forecast_date' => 'date',
        'forecasted_quantity' => 'decimal:3',
        'actual_quantity' => 'decimal:3',
        'accuracy_percentage' => 'decimal:2',
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

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    public function scopeByOrganization($query, $organizationId)
    {
        return $query->where('organization_id', $organizationId);
    }

    public function calculateAccuracy()
    {
        if ($this->actual_quantity > 0) {
            $error = abs($this->forecasted_quantity - $this->actual_quantity);
            $this->accuracy_percentage = round(100 - (($error / $this->actual_quantity) * 100), 2);
        }
        $this->save();
    }
}

class ProductionSchedule extends Model
{
    use HasFactory;

    protected $fillable = [
        'organization_id',
        'manufacturing_unit_id',
        'production_plan_id',
        'production_order_id',
        'schedule_date',
        'shift_id',
        'production_line_id',
        'product_id',
        'planned_quantity',
        'actual_quantity',
        'status',
        'start_time',
        'end_time',
        'notes',
    ];

    protected $casts = [
        'schedule_date' => 'date',
        'planned_quantity' => 'decimal:3',
        'actual_quantity' => 'decimal:3',
        'start_time' => 'datetime',
        'end_time' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function organization()
    {
        return $this->belongsTo(Organization::class);
    }

    public function manufacturingUnit()
    {
        return $this->belongsTo(ManufacturingUnit::class);
    }

    public function productionPlan()
    {
        return $this->belongsTo(ProductionPlan::class);
    }

    public function productionOrder()
    {
        return $this->belongsTo(ProductionOrder::class);
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function scopeByOrganization($query, $organizationId)
    {
        return $query->where('organization_id', $organizationId);
    }

    public function scopeByDate($query, $date)
    {
        return $query->where('schedule_date', $date);
    }

    public function getDurationAttribute()
    {
        if ($this->start_time && $this->end_time) {
            return $this->start_time->diffInMinutes($this->end_time);
        }
        return 0;
    }
}

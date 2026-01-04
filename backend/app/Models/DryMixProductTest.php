<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DryMixProductTest extends Model
{
    use HasFactory;

    protected $table = 'dry_mix_product_tests';

    protected $fillable = [
        'organization_id',
        'manufacturing_unit_id',
        'product_id',
        'batch_id',
        'test_number',
        'test_date',
        'sample_id',
        'compressive_strength_1_day',
        'compressive_strength_3_day',
        'compressive_strength_7_day',
        'compressive_strength_28_day',
        'flexural_strength',
        'adhesion_strength',
        'setting_time_initial',
        'setting_time_final',
        'water_demand',
        'water_retention',
        'flow_diameter',
        'bulk_density',
        'air_content',
        'shelf_life',
        'color',
        'texture',
        'appearance_notes',
        'test_result',
        'status',
        'remarks',
        'recommendations',
        'meets_standard',
        'standard_reference',
        'standard_limits',
        'tested_by',
        'verified_by',
        'approved_by',
        'tested_at',
        'verified_at',
        'approved_at',
        'created_by',
    ];

    protected $casts = [
        'test_date' => 'date',
        'standard_limits' => 'array',
        'tested_at' => 'datetime',
        'verified_at' => 'datetime',
        'approved_at' => 'datetime',
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

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function batch()
    {
        return $this->belongsTo(ProductionBatch::class, 'batch_id');
    }

    public function testedBy()
    {
        return $this->belongsTo(User::class, 'tested_by');
    }

    public function verifiedBy()
    {
        return $this->belongsTo(User::class, 'verified_by');
    }

    public function approvedBy()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function scopeByOrganization($query, $organizationId)
    {
        return $query->where('organization_id', $organizationId);
    }

    public function scopeByProduct($query, $productId)
    {
        return $query->where('product_id', $productId);
    }

    public function scopeByBatch($query, $batchId)
    {
        return $query->where('batch_id', $batchId);
    }

    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    public function scopePassed($query)
    {
        return $query->where('test_result', 'pass');
    }

    public function scopeFailed($query)
    {
        return $query->where('test_result', 'fail');
    }

    public function markAsTested($userId)
    {
        $this->update([
            'status' => 'completed',
            'tested_by' => $userId,
            'tested_at' => now(),
            'test_result' => $this->calculateResult(),
        ]);
    }

    public function markAsVerified($userId, $result, $remarks = null)
    {
        $this->update([
            'verified_by' => $userId,
            'verified_at' => now(),
            'test_result' => $result,
            'remarks' => $remarks ?? $this->remarks,
        ]);
    }

    public function markAsApproved($userId)
    {
        $this->update([
            'approved_by' => $userId,
            'approved_at' => now(),
        ]);
    }

    public function calculateResult()
    {
        $limits = $this->standard_limits ?? [];
        $params = [
            'compressive_strength_28_day' => $this->compressive_strength_28_day,
            'setting_time_initial' => $this->setting_time_initial,
            'flow_diameter' => $this->flow_diameter,
        ];

        $failed = 0;
        $passed = 0;

        foreach ($params as $key => $value) {
            if ($value === null) continue;

            if (isset($limits[$key])) {
                $min = $limits[$key]['min'] ?? null;
                $max = $limits[$key]['max'] ?? null;

                if ($min !== null && $value < $min) {
                    $failed++;
                    continue;
                }

                if ($max !== null && $value > $max) {
                    $failed++;
                    continue;
                }

                $passed++;
            }
        }

        if ($failed > 0) return 'fail';
        if ($passed > 0) return 'pass';
        return 'marginal';
    }

    public function getCompressiveStrengthProgressAttribute()
    {
        $strength = [];
        if ($this->compressive_strength_1_day) {
            $strength[1] = $this->compressive_strength_1_day;
        }
        if ($this->compressive_strength_3_day) {
            $strength[3] = $this->compressive_strength_3_day;
        }
        if ($this->compressive_strength_7_day) {
            $strength[7] = $this->compressive_strength_7_day;
        }
        if ($this->compressive_strength_28_day) {
            $strength[28] = $this->compressive_strength_28_day;
        }
        return $strength;
    }
}

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
        // Check if all mandatory parameters meet standards
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

class RawMaterialTest extends Model
{
    use HasFactory;

    protected $table = 'raw_material_tests';

    protected $fillable = [
        'organization_id',
        'manufacturing_unit_id',
        'raw_material_id',
        'supplier_batch_id',
        'test_number',
        'test_date',
        'sample_id',
        'sio2',
        'al2o3',
        'fe2o3',
        'cao',
        'mgo',
        'so3',
        'k2o',
        'na2o',
        'cl',
        'moisture_content',
        'loss_on_ignition',
        'specific_gravity',
        'bulk_density',
        'particle_size_d50',
        'particle_size_d90',
        'particle_size_d98',
        'blaine_fineness',
        'water_reducer',
        'retention_aid',
        'defoamer',
        'solid_content',
        'viscosity',
        'ph_value',
        'minimum_film_forming_temperature',
        'fineness_modulus',
        'water_absorption',
        'silt_content',
        'organic_impurities',
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

    public function rawMaterial()
    {
        return $this->belongsTo(Product::class, 'raw_material_id');
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

    public function scopeByRawMaterial($query, $materialId)
    {
        return $query->where('raw_material_id', $materialId);
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
        $params = $this->getAttributes();

        $failed = 0;
        $passed = 0;

        foreach ($params as $key => $value) {
            // Skip non-numeric fields
            if ($value === null || !is_numeric($value)) continue;

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

    public function getChemicalCompositionAttribute()
    {
        return [
            'sio2' => $this->sio2,
            'al2o3' => $this->al2o3,
            'fe2o3' => $this->fe2o3,
            'cao' => $this->cao,
            'mgo' => $this->mgo,
            'so3' => $this->so3,
            'k2o' => $this->k2o,
            'na2o' => $this->na2o,
            'cl' => $this->cl,
        ];
    }
}

class TestParameter extends Model
{
    use HasFactory;

    protected $fillable = [
        'organization_id',
        'parameter_code',
        'parameter_name',
        'test_type',
        'parameter_category',
        'unit',
        'min_value',
        'max_value',
        'target_value',
        'is_mandatory',
        'display_order',
        'is_active',
        'notes',
    ];

    protected $casts = [
        'is_mandatory' => 'boolean',
        'is_active' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function organization()
    {
        return $this->belongsTo(Organization::class);
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

    public function scopeMandatory($query)
    {
        return $query->where('is_mandatory', true);
    }
}

class TestStandard extends Model
{
    use HasFactory;

    protected $fillable = [
        'organization_id',
        'standard_code',
        'standard_name',
        'test_type',
        'issuing_body',
        'effective_date',
        'is_current',
        'description',
        'is_active',
    ];

    protected $casts = [
        'effective_date' => 'date',
        'is_current' => 'boolean',
        'is_active' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function organization()
    {
        return $this->belongsTo(Organization::class);
    }

    public function scopeByOrganization($query, $organizationId)
    {
        return $query->where('organization_id', $organizationId);
    }

    public function scopeByTestType($query, $testType)
    {
        return $query->where('test_type', $testType);
    }

    public function scopeCurrent($query)
    {
        return $query->where('is_current', true);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}

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

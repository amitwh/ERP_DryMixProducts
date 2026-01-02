<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

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

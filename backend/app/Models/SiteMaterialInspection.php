<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;

class SiteMaterialInspection extends Model
{
    use HasFactory, LogsActivity;

    protected $fillable = [
        'org_id',
        'project_id',
        'activity_id',
        'inspection_number',
        'inspection_date',
        'material_id',
        'material_name',
        'batch_number',
        'supplier_id',
        'delivery_challan_number',
        'quantity_delivered',
        'uom',
        'sample_taken',
        'sample_number',
        'sample_tested',
        'test_result_id',
        'inspection_data',
        'condition',
        'visual_defects',
        'dimensions_checked',
        'dimensional_results',
        'storage_conditions',
        'recommendations',
        'inspected_by',
        'site_engineer_id',
    ];

    protected $casts = [
        'inspection_date' => 'date',
        'quantity_delivered' => 'decimal:3',
        'sample_taken' => 'boolean',
        'sample_tested' => 'boolean',
        'dimensions_checked' => 'boolean',
        'inspection_data' => 'array',
        'dimensional_results' => 'array',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function organization()
    {
        return $this->belongsTo(Organization::class);
    }

    public function project()
    {
        return $this->belongsTo(ConstructionProject::class);
    }

    public function activity()
    {
        return $this->belongsTo(ConstructionActivity::class);
    }

    public function material()
    {
        return $this->belongsTo(\App\Models\RawMaterial::class, 'material_id');
    }

    public function supplier()
    {
        return $this->belongsTo(Supplier::class);
    }

    public function testResult()
    {
        return $this->belongsTo(\App\Models\RawMaterialTest::class, 'test_result_id');
    }

    public function inspectedBy()
    {
        return $this->belongsTo(User::class, 'inspected_by');
    }

    public function siteEngineer()
    {
        return $this->belongsTo(User::class, 'site_engineer_id');
    }

    public function scopeByOrganization($query, $organizationId)
    {
        return $query->where('org_id', $organizationId);
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['inspection_number', 'condition'])
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs();
    }
}

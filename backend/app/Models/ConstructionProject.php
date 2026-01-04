<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;

class ConstructionProject extends Model
{
    use HasFactory, SoftDeletes, LogsActivity;

    protected $fillable = [
        'org_id',
        'customer_id',
        'project_code',
        'project_name',
        'project_type',
        'project_address',
        'city',
        'state',
        'country',
        'pincode',
        'latitude',
        'longitude',
        'contract_value',
        'currency',
        'start_date',
        'estimated_end_date',
        'actual_end_date',
        'project_status',
        'project_manager_id',
        'site_engineer_id',
        'qc_manager_id',
        'safety_officer_id',
        'description',
        'specifications',
        'contract_documents',
    ];

    protected $casts = [
        'latitude' => 'decimal:6',
        'longitude' => 'decimal:6',
        'contract_value' => 'decimal:2',
        'start_date' => 'date',
        'estimated_end_date' => 'date',
        'actual_end_date' => 'date',
        'specifications' => 'array',
        'contract_documents' => 'array',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    public function organization()
    {
        return $this->belongsTo(Organization::class);
    }

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    public function projectManager()
    {
        return $this->belongsTo(User::class, 'project_manager_id');
    }

    public function siteEngineer()
    {
        return $this->belongsTo(User::class, 'site_engineer_id');
    }

    public function qcManager()
    {
        return $this->belongsTo(User::class, 'qc_manager_id');
    }

    public function safetyOfficer()
    {
        return $this->belongsTo(User::class, 'safety_officer_id');
    }

    public function activities()
    {
        return $this->hasMany(ConstructionActivity::class, 'project_id');
    }

    public function siteInspections()
    {
        return $this->hasMany(SiteInspection::class, 'project_id');
    }

    public function materialInspections()
    {
        return $this->hasMany(SiteMaterialInspection::class, 'project_id');
    }

    public function workmanshipInspections()
    {
        return $this->hasMany(WorkmanshipInspection::class, 'project_id');
    }

    public function submittals()
    {
        return $this->hasMany(Submittal::class, 'project_id');
    }

    public function rfis()
    {
        return $this->hasMany(Rfi::class, 'project_id');
    }

    public function dailyReports()
    {
        return $this->hasMany(DailySiteReport::class, 'project_id');
    }

    public function scopeActive($query)
    {
        return $query->where('project_status', 'in_progress');
    }

    public function scopeByOrganization($query, $organizationId)
    {
        return $query->where('org_id', $organizationId);
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['project_name', 'project_code', 'project_status'])
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs();
    }
}

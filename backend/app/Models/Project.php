<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;

class Project extends Model
{
    use HasFactory, SoftDeletes, LogsActivity;

    protected $fillable = [
        'organization_id',
        'customer_id',
        'name',
        'code',
        'description',
        'location',
        'city',
        'state',
        'start_date',
        'expected_end_date',
        'actual_end_date',
        'contract_value',
        'billed_amount',
        'status',
        'project_manager_id',
        'milestones',
        'settings',
    ];

    protected $casts = [
        'start_date' => 'date',
        'expected_end_date' => 'date',
        'actual_end_date' => 'date',
        'contract_value' => 'decimal:2',
        'billed_amount' => 'decimal:2',
        'milestones' => 'array',
        'settings' => 'array',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['name', 'status', 'contract_value'])
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs();
    }

    // Relationships
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

    public function qualityDocuments()
    {
        return $this->hasMany(QualityDocument::class);
    }

    public function inspections()
    {
        return $this->hasMany(Inspection::class);
    }

    public function ncrs()
    {
        return $this->hasMany(Ncr::class);
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeByOrganization($query, $organizationId)
    {
        return $query->where('organization_id', $organizationId);
    }

    // Accessors
    public function getRemainingValueAttribute()
    {
        return $this->contract_value - $this->billed_amount;
    }

    public function getProgressPercentageAttribute()
    {
        if ($this->contract_value > 0) {
            return ($this->billed_amount / $this->contract_value) * 100;
        }
        return 0;
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;

class Checklist extends Model
{
    use HasFactory, SoftDeletes, LogsActivity;

    protected $fillable = [
        'org_id',
        'unit_id',
        'checklist_code',
        'checklist_name',
        'category',
        'description',
        'checklist_type',
        'is_active',
        'frequency',
        'applicable_areas',
        'target_roles',
        'checklist_items',
        'pass_criteria',
        'total_score',
        'passing_score',
        'created_by',
        'version',
        'effective_date',
        'review_date',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'applicable_areas' => 'array',
        'target_roles' => 'array',
        'checklist_items' => 'array',
        'pass_criteria' => 'array',
        'effective_date' => 'date',
        'review_date' => 'date',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    public function organization()
    {
        return $this->belongsTo(Organization::class);
    }

    public function unit()
    {
        return $this->belongsTo(ManufacturingUnit::class);
    }

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function executions()
    {
        return $this->hasMany(ChecklistExecution::class, 'checklist_id');
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeByOrganization($query, $organizationId)
    {
        return $query->where('org_id', $organizationId);
    }

    public function scopeByCategory($query, $category)
    {
        return $query->where('category', $category);
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['checklist_name', 'checklist_code', 'is_active'])
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs();
    }
}

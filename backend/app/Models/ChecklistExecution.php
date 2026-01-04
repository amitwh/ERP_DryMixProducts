<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;

class ChecklistExecution extends Model
{
    use HasFactory, LogsActivity;

    protected $fillable = [
        'org_id',
        'unit_id',
        'checklist_id',
        'execution_number',
        'execution_date',
        'execution_time',
        'executed_by',
        'reference_type',
        'reference_id',
        'status',
        'total_score',
        'obtained_score',
        'result',
        'responses',
        'observations',
        'photos',
        'failures',
        'corrective_actions',
        'reviewed_by',
        'review_date',
        'signature_path',
    ];

    protected $casts = [
        'execution_date' => 'date',
        'execution_time' => 'time',
        'responses' => 'array',
        'photos' => 'array',
        'failures' => 'array',
        'review_date' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function organization()
    {
        return $this->belongsTo(Organization::class);
    }

    public function unit()
    {
        return $this->belongsTo(ManufacturingUnit::class);
    }

    public function checklist()
    {
        return $this->belongsTo(Checklist::class);
    }

    public function executedBy()
    {
        return $this->belongsTo(User::class, 'executed_by');
    }

    public function reviewedBy()
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    public function scopeByOrganization($query, $organizationId)
    {
        return $query->where('org_id', $organizationId);
    }

    public function scopeByChecklist($query, $checklistId)
    {
        return $query->where('checklist_id', $checklistId);
    }

    public function scopeByDate($query, $date)
    {
        return $query->where('execution_date', $date);
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['execution_number', 'result', 'status'])
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs();
    }
}

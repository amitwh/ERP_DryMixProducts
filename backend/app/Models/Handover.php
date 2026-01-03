<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;

class Handover extends Model
{
    use HasFactory, LogsActivity;

    protected $fillable = [
        'org_id',
        'from_unit_id',
        'to_unit_id',
        'handover_number',
        'handover_type',
        'title',
        'description',
        'project_id',
        'batch_id',
        'material_id',
        'quantity',
        'uom',
        'handover_date',
        'handover_time',
        'from_responsible_person',
        'to_responsible_person',
        'status',
        'handover_checklist',
        'acceptance_criteria',
        'documents_bundle',
        'observations',
        'notes',
        'photos',
        'from_signature_path',
        'to_signature_path',
        'from_signed_at',
        'to_signed_at',
        'accepted',
        'accepted_at',
        'rejection_reason',
        'post_handover_support',
    ];

    protected $casts = [
        'handover_date' => 'date',
        'handover_time' => 'time',
        'quantity' => 'decimal:3',
        'handover_checklist' => 'array',
        'acceptance_criteria' => 'array',
        'documents_bundle' => 'array',
        'photos' => 'array',
        'from_signed_at' => 'datetime',
        'to_signed_at' => 'datetime',
        'accepted' => 'boolean',
        'accepted_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function organization()
    {
        return $this->belongsTo(Organization::class);
    }

    public function fromUnit()
    {
        return $this->belongsTo(ManufacturingUnit::class, 'from_unit_id');
    }

    public function toUnit()
    {
        return $this->belongsTo(ManufacturingUnit::class, 'to_unit_id');
    }

    public function fromResponsiblePerson()
    {
        return $this->belongsTo(User::class, 'from_responsible_person');
    }

    public function toResponsiblePerson()
    {
        return $this->belongsTo(User::class, 'to_responsible_person');
    }

    public function scopeByOrganization($query, $organizationId)
    {
        return $query->where('org_id', $organizationId);
    }

    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    public function scopeByType($query, $type)
    {
        return $query->where('handover_type', $type);
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['handover_number', 'title', 'handover_type', 'status', 'accepted'])
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs();
    }
}

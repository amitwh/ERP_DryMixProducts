<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DocumentWorkflow extends Model
{
    use HasFactory;

    protected $fillable = [
        'org_id',
        'workflow_name',
        'workflow_type',
        'description',
        'workflow_steps',
        'notification_settings',
        'routing_rules',
        'is_active',
        'created_by',
    ];

    protected $casts = [
        'workflow_steps' => 'array',
        'notification_settings' => 'array',
        'routing_rules' => 'array',
        'is_active' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function organization()
    {
        return $this->belongsTo(Organization::class);
    }

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function executions()
    {
        return $this->hasMany(DocumentWorkflowExecution::class);
    }

    public function scopeByOrganization($query, $organizationId)
    {
        return $query->where('org_id', $organizationId);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeByType($query, $type)
    {
        return $query->where('workflow_type', $type);
    }
}

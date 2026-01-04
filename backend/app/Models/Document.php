<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;

class Document extends Model
{
    use HasFactory, SoftDeletes, LogsActivity;

    protected $fillable = [
        'org_id',
        'document_number',
        'title',
        'document_type',
        'category',
        'sub_category_id',
        'description',
        'file_name',
        'file_path',
        'file_type',
        'mime_type',
        'file_size',
        'version',
        'is_latest',
        'parent_document_id',
        'status',
        'visibility',
        'effective_date',
        'expiry_date',
        'access_permissions',
        'metadata',
        'ocr_data',
        'ocr_status',
        'ocr_processed_at',
        'created_by',
        'approved_by',
        'approved_at',
        'rejection_reason',
        'published_at',
        'related_type',
        'related_id',
        'tags',
        'view_count',
        'download_count',
        'last_accessed_at',
    ];

    protected $casts = [
        'file_size' => 'decimal:2',
        'is_latest' => 'boolean',
        'effective_date' => 'date',
        'expiry_date' => 'date',
        'access_permissions' => 'array',
        'metadata' => 'array',
        'ocr_data' => 'array',
        'ocr_processed_at' => 'datetime',
        'approved_at' => 'datetime',
        'published_at' => 'datetime',
        'last_accessed_at' => 'datetime',
        'tags' => 'array',
        'view_count' => 'integer',
        'download_count' => 'integer',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    public function organization()
    {
        return $this->belongsTo(Organization::class);
    }

    public function subCategory()
    {
        return $this->belongsTo(DocumentCategory::class, 'sub_category_id');
    }

    public function parentDocument()
    {
        return $this->belongsTo(Document::class, 'parent_document_id');
    }

    public function versions()
    {
        return $this->hasMany(Document::class, 'parent_document_id')->orderBy('version');
    }

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function approvedBy()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function documentVersions()
    {
        return $this->hasMany(DocumentVersion::class);
    }

    public function approvals()
    {
        return $this->hasMany(DocumentApproval::class);
    }

    public function accessLogs()
    {
        return $this->hasMany(DocumentAccessLog::class);
    }

    public function workflowExecutions()
    {
        return $this->hasMany(DocumentWorkflowExecution::class);
    }

    public function related()
    {
        return $this->morphTo();
    }

    public function scopeByOrganization($query, $organizationId)
    {
        return $query->where('org_id', $organizationId);
    }

    public function scopeByType($query, $type)
    {
        return $query->where('document_type', $type);
    }

    public function scopeByCategory($query, $category)
    {
        return $query->where('category', $category);
    }

    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    public function scopeByVisibility($query, $visibility)
    {
        return $query->where('visibility', $visibility);
    }

    public function scopeLatestVersions($query)
    {
        return $query->where('is_latest', true);
    }

    public function scopePublished($query)
    {
        return $query->where('status', 'approved')->whereNotNull('published_at');
    }

    public function scopeDraft($query)
    {
        return $query->where('status', 'draft');
    }

    public function scopePendingApproval($query)
    {
        return $query->where('status', 'pending_approval');
    }

    public function scopeExpired($query)
    {
        return $query->where('expiry_date', '<', now());
    }

    public function scopeEffective($query)
    {
        return $query->where('effective_date', '<=', now());
    }

    public function scopeByTag($query, $tag)
    {
        return $query->whereJsonContains('tags', $tag);
    }

    public function scopeByRelated($query, $type, $id)
    {
        return $query->where('related_type', $type)->where('related_id', $id);
    }

    public function scopeSearch($query, $search)
    {
        return $query->where(function ($q) use ($search) {
            $q->where('title', 'like', "%{$search}%")
                ->orWhere('document_number', 'like', "%{$search}%")
                ->orWhere('description', 'like', "%{$search}%")
                ->orWhereJsonContains('tags', $search)
                ->orWhereJsonContains('ocr_data', $search);
        });
    }

    public function getFormattedSizeAttribute(): string
    {
        $bytes = $this->file_size;
        if ($bytes == 0) return '0 Bytes';
        $k = 1024;
        $sizes = ['Bytes', 'KB', 'MB', 'GB'];
        $i = floor(log($bytes) / log($k));
        return round($bytes / pow($k, $i), 2) . ' ' . $sizes[$i];
    }

    public function incrementView()
    {
        $this->increment('view_count');
        $this->update(['last_accessed_at' => now()]);
    }

    public function incrementDownload()
    {
        $this->increment('download_count');
        $this->update(['last_accessed_at' => now()]);
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['title', 'document_type', 'status', 'visibility', 'version'])
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs();
    }
}

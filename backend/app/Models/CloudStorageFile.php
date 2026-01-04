<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;

class CloudStorageFile extends Model
{
    use HasFactory, LogsActivity;

    protected $fillable = [
        'org_id',
        'config_id',
        'file_name',
        'file_path',
        'file_type',
        'mime_type',
        'file_size',
        'extension',
        'file_hash',
        'visibility',
        'storage_provider',
        'external_url',
        'cdn_url',
        'metadata',
        'uploaded_by',
        'related_type',
        'related_id',
        'parent_id',
        'version',
        'is_latest',
        'is_thumbnail',
        'last_accessed_at',
    ];

    protected $casts = [
        'file_size' => 'decimal:2',
        'metadata' => 'array',
        'is_latest' => 'boolean',
        'is_thumbnail' => 'boolean',
        'last_accessed_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function organization()
    {
        return $this->belongsTo(Organization::class);
    }

    public function config()
    {
        return $this->belongsTo(CloudStorageConfig::class);
    }

    public function uploadedBy()
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }

    public function parent()
    {
        return $this->belongsTo(CloudStorageFile::class, 'parent_id');
    }

    public function versions()
    {
        return $this->hasMany(CloudStorageFile::class, 'parent_id');
    }

    public function related()
    {
        return $this->morphTo();
    }

    public function scopePublic($query)
    {
        return $query->where('visibility', 'public');
    }

    public function scopePrivate($query)
    {
        return $query->where('visibility', 'private');
    }

    public function scopeByOrganization($query, $organizationId)
    {
        return $query->where('org_id', $organizationId);
    }

    public function scopeByConfig($query, $configId)
    {
        return $query->where('config_id', $configId);
    }

    public function scopeLatestVersions($query)
    {
        return $query->where('is_latest', true);
    }

    public function scopeByType($query, $fileType)
    {
        return $query->where('file_type', $fileType);
    }

    public function scopeByHash($query, $hash)
    {
        return $query->where('file_hash', $hash);
    }

    public function getPublicUrlAttribute(): ?string
    {
        return $this->cdn_url ?? $this->external_url;
    }

    public function getFormattedSizeAttribute(): string
    {
        $bytes = $this->file_size;
        if ($bytes == 0) return '0 Bytes';
        $k = 1024;
        $sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        $i = floor(log($bytes) / log($k));
        return round($bytes / pow($k, $i), 2) . ' ' . $sizes[$i];
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['file_name', 'file_path', 'file_size', 'visibility'])
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs();
    }
}

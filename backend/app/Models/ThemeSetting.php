<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;

class ThemeSetting extends Model
{
    use HasFactory, LogsActivity;

    protected $fillable = [
        'org_id',
        'user_id',
        'theme_type',
        'primary_color',
        'secondary_color',
        'accent_color',
        'background_color',
        'text_color',
        'border_color',
        'font_settings',
        'custom_css',
        'logo_settings',
        'branding_settings',
        'is_default',
        'created_by',
    ];

    protected $casts = [
        'font_settings' => 'array',
        'custom_css' => 'array',
        'logo_settings' => 'array',
        'branding_settings' => 'array',
        'is_default' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function organization()
    {
        return $this->belongsTo(Organization::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function scopeByOrganization($query, $organizationId)
    {
        return $query->where('org_id', $organizationId);
    }

    public function scopeByUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    public function scopeDefault($query)
    {
        return $query->where('is_default', true);
    }

    public function scopeOrganizationThemes($query)
    {
        return $query->whereNull('user_id');
    }

    public function scopeUserThemes($query)
    {
        return $query->whereNotNull('user_id');
    }

    public function scopeByThemeType($query, $type)
    {
        return $query->where('theme_type', $type);
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['theme_type', 'primary_color', 'is_default'])
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs();
    }

    protected static function boot()
    {
        parent::boot();

        static::saving(function ($theme) {
            // Ensure only one default theme per organization
            if ($theme->is_default && $theme->isDirty('is_default') && $theme->org_id) {
                static::where('org_id', $theme->org_id)
                    ->where('id', '!=', $theme->id ?? 0)
                    ->whereNull('user_id')
                    ->update(['is_default' => false]);
            }
        });
    }
}

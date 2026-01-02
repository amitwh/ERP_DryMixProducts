<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SystemSetting extends Model
{
    use HasFactory;

    protected $table = 'system_settings';

    protected $fillable = [
        'org_id',
        'unit_id',
        'setting_key',
        'setting_value',
        'setting_type',
        'category',
        'display_name',
        'description',
        'is_public',
        'is_editable',
        'validation_rules',
        'options',
    ];

    protected $casts = [
        'setting_value' => 'array',
        'validation_rules' => 'array',
        'options' => 'array',
        'is_public' => 'boolean',
        'is_editable' => 'boolean',
    ];

    public function organization()
    {
        return $this->belongsTo(Organization::class);
    }

    public function unit()
    {
        return $this->belongsTo(ManufacturingUnit::class);
    }

    public function scopeByCategory($query, $category)
    {
        return $query->where('category', $category);
    }

    public function scopePublic($query)
    {
        return $query->where('is_public', true);
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PlantAutomationDataLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'config_id',
        'tag_id',
        'logged_at',
        'value',
        'string_value',
        'bool_value',
        'quality',
        'error_message',
    ];

    protected $casts = [
        'logged_at' => 'datetime',
        'value' => 'decimal:8',
        'bool_value' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function config()
    {
        return $this->belongsTo(PlantAutomationConfig::class);
    }

    public function tag()
    {
        return $this->belongsTo(PlantAutomationTag::class);
    }

    public function scopeByConfig($query, $configId)
    {
        return $query->where('config_id', $configId);
    }

    public function scopeByTag($query, $tagId)
    {
        return $query->where('tag_id', $tagId);
    }

    public function scopeByDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('logged_at', [$startDate, $endDate]);
    }

    public function scopeByQuality($query, $quality)
    {
        return $query->where('quality', $quality);
    }

    public function scopeRecent($query, $minutes = 60)
    {
        return $query->where('logged_at', '>=', now()->subMinutes($minutes));
    }

    public function getActualValueAttribute()
    {
        $tag = $this->tag;

        switch ($tag->data_type) {
            case 'bool':
                return $this->bool_value;
            case 'string':
                return $this->string_value;
            default:
                return $this->value;
        }
    }

    public function getFormattedValueAttribute()
    {
        if (!$this->tag) {
            return $this->value;
        }

        return $this->tag->getFormattedValueAttribute($this->getActualValueAttribute());
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ActivityLog extends Model
{
    use HasFactory;

    protected $table = 'activity_log';

    protected $fillable = [
        'org_id',
        'user_id',
        'action',
        'module',
        'record_type',
        'record_id',
        'details',
        'ip_address',
        'user_agent',
        'created_at',
    ];

    protected $casts = [
        'details' => 'array',
    ];

    public $timestamps = false;

    public function organization()
    {
        return $this->belongsTo(Organization::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public static function log(array $data): self
    {
        return self::create([
            'org_id' => $data['org_id'] ?? null,
            'user_id' => $data['user_id'] ?? auth()->id(),
            'action' => $data['action'],
            'module' => $data['module'] ?? null,
            'record_type' => $data['record_type'] ?? null,
            'record_id' => $data['record_id'] ?? null,
            'details' => $data['details'] ?? null,
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
        ]);
    }
}

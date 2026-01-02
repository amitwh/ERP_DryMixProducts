<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Permission extends Model
{
    use HasFactory;

    protected $fillable = [
        'module_code',
        'permission_code',
        'permission_name',
        'description',
        'action_type',
        'metadata',
    ];

    protected $casts = [
        'metadata' => 'array',
    ];

    public function roles()
    {
        return $this->belongsToMany(Role::class, 'role_permissions')
                    ->withPivot('is_allowed', 'constraints')
                    ->withTimestamps();
    }

    public function scopeByModule($query, string $moduleCode)
    {
        return $query->where('module_code', $moduleCode);
    }

    public function scopeByAction($query, string $actionType)
    {
        return $query->where('action_type', $actionType);
    }
}

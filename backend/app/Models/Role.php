<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Role extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'org_id',
        'role_code',
        'role_name',
        'description',
        'is_system_role',
        'is_active',
        'permissions',
    ];

    protected $casts = [
        'is_system_role' => 'boolean',
        'is_active' => 'boolean',
        'permissions' => 'array',
    ];

    public function organization()
    {
        return $this->belongsTo(Organization::class);
    }

    public function users()
    {
        return $this->hasMany(User::class);
    }

    public function permissions()
    {
        return $this->belongsToMany(Permission::class, 'role_permissions')
                    ->withPivot('is_allowed', 'constraints')
                    ->withTimestamps();
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeSystem($query)
    {
        return $query->where('is_system_role', true);
    }

    public function hasPermission(string $permissionCode): bool
    {
        if ($this->permissions) {
            return in_array($permissionCode, $this->permissions);
        }

        return $this->permissions()->where('permission_code', $permissionCode)
                           ->where('is_allowed', true)
                           ->exists();
    }
}

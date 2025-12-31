<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RoleAndPermissionSeeder extends Seeder
{
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // Create permissions
        $permissions = [
            // Organization permissions
            'view-organizations',
            'create-organizations',
            'edit-organizations',
            'delete-organizations',
            
            // Manufacturing Unit permissions
            'view-manufacturing-units',
            'create-manufacturing-units',
            'edit-manufacturing-units',
            'delete-manufacturing-units',
            
            // User permissions
            'view-users',
            'create-users',
            'edit-users',
            'delete-users',
            
            // Role & Permission management
            'manage-roles',
            'manage-permissions',
        ];

        foreach ($permissions as $permission) {
            Permission::create(['name' => $permission]);
        }

        // Create roles and assign permissions
        $superAdmin = Role::create(['name' => 'super-admin']);
        $superAdmin->givePermissionTo(Permission::all());

        $admin = Role::create(['name' => 'admin']);
        $admin->givePermissionTo([
            'view-organizations',
            'view-manufacturing-units',
            'create-manufacturing-units',
            'edit-manufacturing-units',
            'view-users',
            'create-users',
            'edit-users',
        ]);

        $manager = Role::create(['name' => 'manager']);
        $manager->givePermissionTo([
            'view-organizations',
            'view-manufacturing-units',
            'view-users',
        ]);

        $user = Role::create(['name' => 'user']);
        $user->givePermissionTo([
            'view-organizations',
            'view-manufacturing-units',
        ]);
    }
}

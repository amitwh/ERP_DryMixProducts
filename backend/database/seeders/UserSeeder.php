<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Organization;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $organization1 = Organization::where('code', 'CSL001')->first();
        $organization2 = Organization::where('code', 'DMI001')->first();

        // Super Admin
        $superAdmin = User::create([
            'organization_id' => $organization1->id,
            'name' => 'Super Admin',
            'email' => 'admin@erp.com',
            'password' => Hash::make('admin123'),
            'phone' => '+91-9999999999',
            'status' => 'active',
        ]);
        $superAdmin->assignRole('super-admin');

        // Admin for Organization 1
        $admin1 = User::create([
            'organization_id' => $organization1->id,
            'name' => 'John Doe',
            'email' => 'john.doe@concretesolutions.com',
            'password' => Hash::make('admin123'),
            'phone' => '+91-9876543210',
            'status' => 'active',
        ]);
        $admin1->assignRole('admin');

        // Manager for Organization 1
        $manager1 = User::create([
            'organization_id' => $organization1->id,
            'name' => 'Jane Smith',
            'email' => 'jane.smith@concretesolutions.com',
            'password' => Hash::make('admin123'),
            'phone' => '+91-9876543211',
            'status' => 'active',
        ]);
        $manager1->assignRole('manager');

        // Admin for Organization 2
        $admin2 = User::create([
            'organization_id' => $organization2->id,
            'name' => 'Robert Johnson',
            'email' => 'robert.johnson@drymixindustries.com',
            'password' => Hash::make('admin123'),
            'phone' => '+91-9876543212',
            'status' => 'active',
        ]);
        $admin2->assignRole('admin');

        // Regular User
        $user = User::create([
            'organization_id' => $organization1->id,
            'name' => 'Alice Brown',
            'email' => 'alice.brown@concretesolutions.com',
            'password' => Hash::make('admin123'),
            'phone' => '+91-9876543213',
            'status' => 'active',
        ]);
        $user->assignRole('user');
    }
}

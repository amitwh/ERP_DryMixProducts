<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\ManufacturingUnit;
use App\Models\Organization;

class ManufacturingUnitSeeder extends Seeder
{
    public function run(): void
    {
        $organization1 = Organization::where('code', 'CSL001')->first();
        $organization2 = Organization::where('code', 'DMI001')->first();

        $units = [
            [
                'organization_id' => $organization1->id,
                'name' => 'Mumbai Production Plant',
                'code' => 'MPP001',
                'type' => 'production',
                'address' => '789 Factory Road',
                'city' => 'Mumbai',
                'state' => 'Maharashtra',
                'country' => 'India',
                'postal_code' => '400002',
                'phone' => '+91-22-11111111',
                'email' => 'mumbai@concretesolutions.com',
                'capacity_per_day' => 500.00,
                'capacity_unit' => 'MT',
                'status' => 'active',
                'settings' => [
                    'shifts' => 3,
                    'operating_hours' => '24x7',
                ],
            ],
            [
                'organization_id' => $organization1->id,
                'name' => 'Thane Warehouse',
                'code' => 'THW001',
                'type' => 'warehouse',
                'address' => '321 Storage Complex',
                'city' => 'Thane',
                'state' => 'Maharashtra',
                'country' => 'India',
                'postal_code' => '400601',
                'phone' => '+91-22-22222222',
                'email' => 'thane@concretesolutions.com',
                'capacity_per_day' => null,
                'capacity_unit' => null,
                'status' => 'active',
            ],
            [
                'organization_id' => $organization2->id,
                'name' => 'Pune Manufacturing Hub',
                'code' => 'PMH001',
                'type' => 'production',
                'address' => '654 Industrial Zone',
                'city' => 'Pune',
                'state' => 'Maharashtra',
                'country' => 'India',
                'postal_code' => '411002',
                'phone' => '+91-20-33333333',
                'email' => 'pune@drymixindustries.com',
                'capacity_per_day' => 750.00,
                'capacity_unit' => 'MT',
                'status' => 'active',
                'settings' => [
                    'shifts' => 2,
                    'operating_hours' => '16 hours',
                ],
            ],
        ];

        foreach ($units as $unit) {
            ManufacturingUnit::create($unit);
        }
    }
}

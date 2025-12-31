<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Organization;

class OrganizationSeeder extends Seeder
{
    public function run(): void
    {
        $organizations = [
            [
                'name' => 'Concrete Solutions Ltd',
                'code' => 'CSL001',
                'registration_number' => 'REG123456',
                'tax_number' => 'TAX789012',
                'address' => '123 Industrial Area',
                'city' => 'Mumbai',
                'state' => 'Maharashtra',
                'country' => 'India',
                'postal_code' => '400001',
                'phone' => '+91-22-12345678',
                'email' => 'info@concretesolutions.com',
                'website' => 'https://concretesolutions.com',
                'status' => 'active',
                'settings' => [
                    'currency' => 'INR',
                    'timezone' => 'Asia/Kolkata',
                    'financial_year_start' => '04-01',
                ],
            ],
            [
                'name' => 'DryMix Industries Pvt Ltd',
                'code' => 'DMI001',
                'registration_number' => 'REG654321',
                'tax_number' => 'TAX210987',
                'address' => '456 Business Park',
                'city' => 'Pune',
                'state' => 'Maharashtra',
                'country' => 'India',
                'postal_code' => '411001',
                'phone' => '+91-20-98765432',
                'email' => 'contact@drymixindustries.com',
                'website' => 'https://drymixindustries.com',
                'status' => 'active',
                'settings' => [
                    'currency' => 'INR',
                    'timezone' => 'Asia/Kolkata',
                    'financial_year_start' => '04-01',
                ],
            ],
        ];

        foreach ($organizations as $org) {
            Organization::create($org);
        }
    }
}

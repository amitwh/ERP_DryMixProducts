<?php

namespace Database\Seeders;

use App\Models\Organization;
use App\Models\ManufacturingUnit;
use App\Models\User;
use App\Models\Customer;
use App\Models\Supplier;
use App\Models\Product;
use App\Models\Inventory;
use App\Models\ChartOfAccount;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DemoDataSeeder extends Seeder
{
    public function run(): void
    {
        $organization = Organization::updateOrCreate(
            ['code' => 'DMC001'],
            [
                'name' => 'DryMix Manufacturing Co.',
                'email' => 'info@drymix.com',
                'phone' => '+91-9876543210',
                'address' => '123 Industrial Area',
                'city' => 'Mumbai',
                'state' => 'Maharashtra',
                'country' => 'India',
                'postal_code' => '400001',
                'website' => 'https://drymix.com',
                'status' => 'active',
                'settings' => json_encode([
                    'currency' => 'INR',
                    'timezone' => 'Asia/Kolkata',
                    'date_format' => 'd-m-Y',
                ]),
            ]
        );

        $mfgUnit = ManufacturingUnit::updateOrCreate(
            ['organization_id' => $organization->id, 'code' => 'MPU001'],
            [
                'name' => 'Main Production Unit',
                'type' => 'production',
                'address' => '123 Industrial Area',
                'city' => 'Mumbai',
                'state' => 'Maharashtra',
                'country' => 'India',
                'status' => 'active',
                'capacity_per_day' => 5000,
                'capacity_unit' => 'MT',
            ]
        );

        $admin = User::updateOrCreate(
            ['email' => 'admin@drymix.com'],
            [
                'organization_id' => $organization->id,
                'manufacturing_unit_id' => $mfgUnit->id,
                'name' => 'Admin User',
                'password' => Hash::make('password'),
                'status' => 'active',
            ]
        );

        for ($i = 1; $i <= 5; $i++) {
            User::updateOrCreate(
                ['email' => "manager{$i}@drymix.com"],
                [
                    'organization_id' => $organization->id,
                    'manufacturing_unit_id' => $mfgUnit->id,
                    'name' => "Manager User {$i}",
                    'password' => Hash::make('password'),
                    'status' => 'active',
                ]
            );
        }

        for ($i = 1; $i <= 10; $i++) {
            User::updateOrCreate(
                ['email' => "user{$i}@drymix.com"],
                [
                    'organization_id' => $organization->id,
                    'manufacturing_unit_id' => $mfgUnit->id,
                    'name' => "User {$i}",
                    'password' => Hash::make('password'),
                    'status' => 'active',
                ]
            );
        }

        for ($i = 1; $i <= 20; $i++) {
            Customer::updateOrCreate(
                ['organization_id' => $organization->id, 'code' => 'CUST' . str_pad($i, 4, '0', STR_PAD_LEFT)],
                [
                    'name' => "Customer {$i}",
                    'customer_type' => 'corporate',
                    'contact_person' => "Contact Person {$i}",
                    'phone' => '+91-' . rand(9000000000, 9999999999),
                    'email' => "customer{$i}@example.com",
                    'billing_address' => "{$i} Business Park",
                    'shipping_address' => "{$i} Business Park",
                    'city' => 'Mumbai',
                    'state' => 'Maharashtra',
                    'country' => 'India',
                    'postal_code' => '40000' . $i,
                    'credit_limit' => rand(100000, 500000),
                    'credit_days' => 30,
                    'status' => 'active',
                ]
            );
        }

        for ($i = 1; $i <= 10; $i++) {
            Supplier::updateOrCreate(
                ['organization_id' => $organization->id, 'code' => 'SUPP' . str_pad($i, 4, '0', STR_PAD_LEFT)],
                [
                    'name' => "Supplier {$i}",
                    'contact_person' => "Contact Person {$i}",
                    'phone' => '+91-' . rand(9000000000, 9999999999),
                    'email' => "supplier{$i}@example.com",
                    'address' => "{$i} Industrial Area",
                    'city' => 'Mumbai',
                    'state' => 'Maharashtra',
                    'country' => 'India',
                    'postal_code' => '40000' . $i,
                    'status' => 'active',
                ]
            );
        }

        $products = [
            ['name' => 'Premium Tile Adhesive', 'code' => 'TA-PREM', 'selling_price' => 450],
            ['name' => 'Standard Tile Adhesive', 'code' => 'TA-STD', 'selling_price' => 320],
            ['name' => 'Gypsum Wall Plaster', 'code' => 'WP-GYP', 'selling_price' => 280],
            ['name' => 'Cement Wall Plaster', 'code' => 'WP-CEM', 'selling_price' => 250],
            ['name' => 'Block Jointing Mortar', 'code' => 'BJM-001', 'selling_price' => 380],
            ['name' => 'White Wall Putty', 'code' => 'WPU-WHT', 'selling_price' => 350],
            ['name' => 'Non-Shrink Grout', 'code' => 'NSG-001', 'selling_price' => 520],
            ['name' => 'Self-Leveling Compound', 'code' => 'SLC-001', 'selling_price' => 680],
            ['name' => 'Waterproofing Membrane', 'code' => 'WPM-001', 'selling_price' => 850],
            ['name' => 'Epoxy Tile Grout', 'code' => 'ETG-001', 'selling_price' => 420],
        ];

        foreach ($products as $product) {
            $prod = Product::updateOrCreate(
                ['organization_id' => $organization->id, 'code' => $product['code']],
                [
                    'name' => $product['name'],
                    'sku' => $product['code'] . '-SKU',
                    'type' => 'dry_mix',
                    'unit_of_measure' => 'kg',
                    'standard_cost' => $product['selling_price'] * 0.7,
                    'selling_price' => $product['selling_price'],
                    'minimum_stock' => 50,
                    'reorder_level' => 100,
                    'status' => 'active',
                ]
            );

            Inventory::updateOrCreate(
                [
                    'organization_id' => $organization->id,
                    'manufacturing_unit_id' => $mfgUnit->id,
                    'product_id' => $prod->id,
                ],
                [
                    'quantity_on_hand' => rand(100, 1000),
                    'quantity_reserved' => 0,
                    'quantity_available' => rand(100, 1000),
                    'minimum_stock' => 50,
                    'maximum_stock' => 2000,
                    'reorder_level' => 100,
                    'location' => 'Aisle A',
                ]
            );
        }

        $this->createChartOfAccounts($organization->id);

        $this->command->info('Demo data seeded successfully!');
        $this->command->info('Admin login: admin@drymix.com / password');
    }

    private function createChartOfAccounts($organizationId): void
    {
        $accounts = [
            ['account_code' => '1000', 'account_name' => 'Assets', 'account_type' => 'asset', 'sub_type' => ''],
            ['account_code' => '1100', 'account_name' => 'Cash', 'account_type' => 'asset', 'sub_type' => 'current_asset', 'is_cash_account' => true],
            ['account_code' => '1200', 'account_name' => 'Bank', 'account_type' => 'asset', 'sub_type' => 'current_asset'],
            ['account_code' => '1300', 'account_name' => 'Accounts Receivable', 'account_type' => 'asset', 'sub_type' => 'current_asset'],
            ['account_code' => '1400', 'account_name' => 'Inventory', 'account_type' => 'asset', 'sub_type' => 'current_asset'],
            ['account_code' => '1500', 'account_name' => 'Fixed Assets', 'account_type' => 'asset', 'sub_type' => 'fixed_asset'],
            
            ['account_code' => '2000', 'account_name' => 'Liabilities', 'account_type' => 'liability', 'sub_type' => ''],
            ['account_code' => '2100', 'account_name' => 'Accounts Payable', 'account_type' => 'liability', 'sub_type' => 'current_liability'],
            ['account_code' => '2200', 'account_name' => 'Short Term Loans', 'account_type' => 'liability', 'sub_type' => 'current_liability'],
            ['account_code' => '2300', 'account_name' => 'Long Term Loans', 'account_type' => 'liability', 'sub_type' => 'long_term_liability'],
            
            ['account_code' => '3000', 'account_name' => 'Equity', 'account_type' => 'equity', 'sub_type' => ''],
            ['account_code' => '3100', 'account_name' => 'Share Capital', 'account_type' => 'equity', 'sub_type' => 'share_capital'],
            ['account_code' => '3200', 'account_name' => 'Retained Earnings', 'account_type' => 'equity', 'sub_type' => 'retained_earnings'],
            
            ['account_code' => '4000', 'account_name' => 'Revenue', 'account_type' => 'revenue', 'sub_type' => ''],
            ['account_code' => '4100', 'account_name' => 'Sales Revenue', 'account_type' => 'revenue', 'sub_type' => 'sales'],
            ['account_code' => '4200', 'account_name' => 'Other Income', 'account_type' => 'revenue', 'sub_type' => 'other_income'],
            
            ['account_code' => '5000', 'account_name' => 'Expenses', 'account_type' => 'expense', 'sub_type' => ''],
            ['account_code' => '5100', 'account_name' => 'Cost of Goods Sold', 'account_type' => 'expense', 'sub_type' => 'direct_expense'],
            ['account_code' => '5200', 'account_name' => 'Salaries', 'account_type' => 'expense', 'sub_type' => 'indirect_expense'],
            ['account_code' => '5300', 'account_name' => 'Utilities', 'account_type' => 'expense', 'sub_type' => 'indirect_expense'],
            ['account_code' => '5400', 'account_name' => 'Depreciation', 'account_type' => 'expense', 'sub_type' => 'depreciation'],
        ];

        foreach ($accounts as $account) {
            ChartOfAccount::updateOrCreate(
                ['organization_id' => $organizationId, 'account_code' => $account['account_code']],
                [
                    'account_name' => $account['account_name'],
                    'account_type' => $account['account_type'],
                    'sub_type' => $account['sub_type'] ?? '',
                    'status' => 'active',
                    'is_cash_account' => $account['is_cash_account'] ?? false,
                    'opening_balance' => 0,
                    'current_balance' => 0,
                ]
            );
        }
    }
}

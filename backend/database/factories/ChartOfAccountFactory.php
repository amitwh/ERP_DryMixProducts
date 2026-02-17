<?php

namespace Database\Factories;

use App\Models\ChartOfAccount;
use App\Models\Organization;
use Illuminate\Database\Eloquent\Factories\Factory;

class ChartOfAccountFactory extends Factory
{
    protected $model = ChartOfAccount::class;

    public function definition(): array
    {
        $accountTypes = ['asset', 'liability', 'equity', 'revenue', 'expense'];
        $subTypes = [
            'asset' => ['current_asset', 'fixed_asset', 'intangible_asset'],
            'liability' => ['current_liability', 'long_term_liability'],
            'equity' => ['share_capital', 'retained_earnings', 'reserves'],
            'revenue' => ['sales', 'other_income', 'interest_income'],
            'expense' => ['direct_expense', 'indirect_expense', 'depreciation'],
        ];

        $accountType = $this->faker->randomElement($accountTypes);

        return [
            'organization_id' => Organization::factory(),
            'account_code' => $this->faker->unique()->numerify('##-###'),
            'account_name' => $this->faker->words(2, true) . ' Account',
            'account_type' => $accountType,
            'sub_type' => $this->faker->randomElement($subTypes[$accountType]),
            'opening_balance' => $this->faker->randomFloat(2, 0, 100000),
            'current_balance' => $this->faker->randomFloat(2, 0, 150000),
            'status' => 'active',
            'is_cash_account' => $this->faker->boolean(20),
            'is_bank_account' => $this->faker->boolean(20),
            'parent_account_id' => null,
            'description' => $this->faker->optional()->sentence(),
        ];
    }

    public function asset(): static
    {
        return $this->state(fn (array $attributes) => [
            'account_type' => 'asset',
            'sub_type' => 'current_asset',
        ]);
    }

    public function liability(): static
    {
        return $this->state(fn (array $attributes) => [
            'account_type' => 'liability',
            'sub_type' => 'current_liability',
        ]);
    }

    public function revenue(): static
    {
        return $this->state(fn (array $attributes) => [
            'account_type' => 'revenue',
            'sub_type' => 'sales',
        ]);
    }

    public function expense(): static
    {
        return $this->state(fn (array $attributes) => [
            'account_type' => 'expense',
            'sub_type' => 'direct_expense',
        ]);
    }

    public function cashAccount(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_cash_account' => true,
            'account_name' => 'Cash',
            'account_type' => 'asset',
            'sub_type' => 'current_asset',
        ]);
    }

    public function bankAccount(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_bank_account' => true,
            'account_name' => 'Bank Account - ' . $this->faker->company(),
            'account_type' => 'asset',
            'sub_type' => 'current_asset',
        ]);
    }
}

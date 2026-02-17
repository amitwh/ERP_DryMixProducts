<?php

namespace Database\Factories;

use App\Models\Inventory;
use App\Models\Product;
use App\Models\Warehouse;
use App\Models\Organization;
use Illuminate\Database\Eloquent\Factories\Factory;

class InventoryFactory extends Factory
{
    protected $model = Inventory::class;

    public function definition(): array
    {
        return [
            'organization_id' => Organization::factory(),
            'product_id' => Product::factory(),
            'warehouse_id' => Warehouse::factory(),
            'quantity' => $this->faker->numberBetween(0, 1000),
            'reserved_quantity' => $this->faker->numberBetween(0, 100),
            'available_quantity' => $this->faker->numberBetween(0, 900),
            'minimum_stock' => $this->faker->numberBetween(10, 50),
            'maximum_stock' => $this->faker->numberBetween(500, 2000),
            'reorder_level' => $this->faker->numberBetween(20, 100),
            'reorder_quantity' => $this->faker->numberBetween(50, 200),
            'cost_price' => $this->faker->randomFloat(2, 50, 1000),
            'selling_price' => $this->faker->randomFloat(2, 100, 2000),
            'batch_number' => $this->faker->optional()->regexify('BATCH[0-9]{6}'),
            'expiry_date' => $this->faker->optional()->dateTimeBetween('+1 month', '+2 years'),
            'location' => $this->faker->optional()->regexify('[A-Z][0-9]{2}-[0-9]{3}'),
            'status' => 'active',
            'last_stock_check' => $this->faker->optional()->dateTimeThisMonth(),
        ];
    }

    public function lowStock(): static
    {
        return $this->state(fn (array $attributes) => [
            'quantity' => 5,
            'minimum_stock' => 20,
            'reorder_level' => 50,
        ]);
    }

    public function outOfStock(): static
    {
        return $this->state(fn (array $attributes) => [
            'quantity' => 0,
            'available_quantity' => 0,
        ]);
    }

    public function overStocked(): static
    {
        return $this->state(fn (array $attributes) => [
            'quantity' => 3000,
            'maximum_stock' => 1000,
        ]);
    }
}

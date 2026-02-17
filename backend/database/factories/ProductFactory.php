<?php

namespace Database\Factories;

use App\Models\Product;
use App\Models\Organization;
use Illuminate\Database\Eloquent\Factories\Factory;

class ProductFactory extends Factory
{
    protected $model = Product::class;

    public function definition(): array
    {
        $productTypes = [
            'tile_adhesive',
            'wall_plaster',
            'block_jointing_mortar',
            'wall_putty',
            'non_shrink_grout',
            'self_leveling_compound',
            'waterproofing_membrane',
            'epoxy_coating',
            'tile_grout',
            'floor_screed',
        ];

        return [
            'organization_id' => Organization::factory(),
            'product_code' => 'PROD' . $this->faker->unique()->numerify('####'),
            'name' => $this->faker->words(3, true),
            'description' => $this->faker->sentence(),
            'product_type' => $this->faker->randomElement($productTypes),
            'category' => $this->faker->randomElement(['standard', 'premium', 'economy']),
            'unit_of_measure' => $this->faker->randomElement(['kg', 'ton', 'bag', 'ltr']),
            'selling_price' => $this->faker->randomFloat(2, 100, 5000),
            'cost_price' => $this->faker->randomFloat(2, 50, 3000),
            'minimum_stock' => $this->faker->numberBetween(10, 100),
            'maximum_stock' => $this->faker->numberBetween(500, 5000),
            'reorder_level' => $this->faker->numberBetween(20, 200),
            'weight' => $this->faker->randomFloat(2, 1, 50),
            'volume' => $this->faker->randomFloat(2, 0.1, 5),
            'status' => 'active',
            'specifications' => [
                'standard' => $this->faker->randomElement(['IS 15477', 'ASTM C1107', 'EN 12004']),
                'shelf_life' => $this->faker->numberBetween(6, 24) . ' months',
            ],
        ];
    }

    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'inactive',
        ]);
    }

    public function tileAdhesive(): static
    {
        return $this->state(fn (array $attributes) => [
            'product_type' => 'tile_adhesive',
            'unit_of_measure' => 'kg',
        ]);
    }

    public function premium(): static
    {
        return $this->state(fn (array $attributes) => [
            'category' => 'premium',
            'selling_price' => $this->faker->randomFloat(2, 2000, 5000),
        ]);
    }
}

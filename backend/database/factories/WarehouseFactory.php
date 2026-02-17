<?php

namespace Database\Factories;

use App\Models\Warehouse;
use App\Models\Organization;
use Illuminate\Database\Eloquent\Factories\Factory;

class WarehouseFactory extends Factory
{
    protected $model = Warehouse::class;

    public function definition(): array
    {
        return [
            'organization_id' => Organization::factory(),
            'code' => $this->faker->unique()->lexify('WH???'),
            'name' => $this->faker->city() . ' Warehouse',
            'address' => $this->faker->streetAddress(),
            'city' => $this->faker->city(),
            'state' => $this->faker->state(),
            'country' => $this->faker->country(),
            'postal_code' => $this->faker->postcode(),
            'phone' => $this->faker->phoneNumber(),
            'email' => $this->faker->companyEmail(),
            'manager_name' => $this->faker->name(),
            'capacity' => $this->faker->numberBetween(1000, 50000),
            'unit' => 'sq_ft',
            'status' => 'active',
            'is_default' => false,
            'type' => $this->faker->randomElement(['raw_material', 'finished_goods', 'general']),
            'settings' => [
                'operating_hours' => '09:00-18:00',
                'working_days' => ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
            ],
        ];
    }

    public function default(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_default' => true,
        ]);
    }

    public function rawMaterial(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => 'raw_material',
            'name' => 'Raw Material Store',
        ]);
    }

    public function finishedGoods(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => 'finished_goods',
            'name' => 'Finished Goods Store',
        ]);
    }
}

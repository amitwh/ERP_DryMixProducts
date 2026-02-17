<?php

namespace Database\Factories;

use App\Models\Customer;
use App\Models\Organization;
use Illuminate\Database\Eloquent\Factories\Factory;

class CustomerFactory extends Factory
{
    protected $model = Customer::class;

    public function definition(): array
    {
        return [
            'organization_id' => Organization::factory(),
            'customer_code' => 'CUST' . $this->faker->unique()->numerify('####'),
            'name' => $this->faker->company(),
            'email' => $this->faker->companyEmail(),
            'phone' => $this->faker->phoneNumber(),
            'address' => $this->faker->streetAddress(),
            'city' => $this->faker->city(),
            'state' => $this->faker->state(),
            'country' => $this->faker->country(),
            'postal_code' => $this->faker->postcode(),
            'gst_number' => $this->faker->optional()->regexify('[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][0-9][A-Z][0-9]'),
            'pan_number' => $this->faker->optional()->regexify('[A-Z]{5}[0-9]{4}[A-Z]'),
            'credit_limit' => $this->faker->randomFloat(2, 10000, 1000000),
            'payment_terms' => $this->faker->randomElement(['Net 15', 'Net 30', 'Net 45', 'Net 60']),
            'status' => 'active',
            'type' => $this->faker->randomElement(['regular', 'wholesale', 'retail', 'distributor']),
            'notes' => $this->faker->optional()->sentence(),
        ];
    }

    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'inactive',
        ]);
    }

    public function wholesale(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => 'wholesale',
            'credit_limit' => 500000,
        ]);
    }
}

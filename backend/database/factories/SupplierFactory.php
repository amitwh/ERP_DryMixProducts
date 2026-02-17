<?php

namespace Database\Factories;

use App\Models\Supplier;
use App\Models\Organization;
use Illuminate\Database\Eloquent\Factories\Factory;

class SupplierFactory extends Factory
{
    protected $model = Supplier::class;

    public function definition(): array
    {
        return [
            'organization_id' => Organization::factory(),
            'supplier_code' => 'SUP' . $this->faker->unique()->numerify('####'),
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
            'contact_person' => $this->faker->name(),
            'contact_phone' => $this->faker->phoneNumber(),
            'payment_terms' => $this->faker->randomElement(['Net 15', 'Net 30', 'Net 45', 'Net 60']),
            'status' => 'active',
            'rating' => $this->faker->randomFloat(1, 1, 5),
            'type' => $this->faker->randomElement(['regular', 'preferred', 'occasional']),
            'notes' => $this->faker->optional()->sentence(),
            'bank_details' => [
                'bank_name' => $this->faker->company(),
                'account_number' => $this->faker->numerify('################'),
                'ifsc_code' => $this->faker->regexify('[A-Z]{4}0[A-Z0-9]{6}'),
            ],
        ];
    }

    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'inactive',
        ]);
    }

    public function preferred(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => 'preferred',
            'rating' => 4.5,
        ]);
    }
}

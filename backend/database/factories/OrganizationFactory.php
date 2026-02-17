<?php

namespace Database\Factories;

use App\Models\Organization;
use Illuminate\Database\Eloquent\Factories\Factory;

class OrganizationFactory extends Factory
{
    protected $model = Organization::class;

    public function definition(): array
    {
        return [
            'name' => $this->faker->company(),
            'code' => $this->faker->unique()->lexify('ORG???'),
            'email' => $this->faker->companyEmail(),
            'phone' => $this->faker->phoneNumber(),
            'address' => $this->faker->streetAddress(),
            'city' => $this->faker->city(),
            'state' => $this->faker->state(),
            'country' => $this->faker->country(),
            'postal_code' => $this->faker->postcode(),
            'website' => $this->faker->url(),
            'logo' => null,
            'status' => 'active',
            'settings' => [
                'currency' => 'USD',
                'timezone' => 'UTC',
                'date_format' => 'Y-m-d',
            ],
        ];
    }
}

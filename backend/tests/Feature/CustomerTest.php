<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Organization;
use App\Models\Customer;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Laravel\Sanctum\Sanctum;

class CustomerTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;
    protected Organization $organization;

    protected function setUp(): void
    {
        parent::setUp();
        
        $this->organization = Organization::factory()->create();
        $this->user = User::factory()->create([
            'organization_id' => $this->organization->id,
            'status' => 'active',
        ]);
        Sanctum::actingAs($this->user);
    }

    public function test_can_list_customers(): void
    {
        Customer::factory()->count(5)->create([
            'organization_id' => $this->organization->id,
        ]);

        $response = $this->getJson('/api/v1/customers?organization_id=' . $this->organization->id);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => [
                    'data' => [
                        '*' => [
                            'id',
                            'customer_code',
                            'name',
                            'email',
                        ],
                    ],
                ],
            ]);
    }

    public function test_can_create_customer(): void
    {
        $customerData = [
            'organization_id' => $this->organization->id,
            'customer_code' => 'CUST001',
            'name' => 'Test Customer',
            'email' => 'customer@test.com',
            'phone' => '+1234567890',
            'address' => '123 Test Street',
            'city' => 'Test City',
            'state' => 'Test State',
            'country' => 'Test Country',
            'postal_code' => '12345',
            'status' => 'active',
        ];

        $response = $this->postJson('/api/v1/customers', $customerData);

        $response->assertStatus(201)
            ->assertJson([
                'success' => true,
                'data' => [
                    'customer_code' => 'CUST001',
                    'name' => 'Test Customer',
                ],
            ]);

        $this->assertDatabaseHas('customers', [
            'customer_code' => 'CUST001',
            'organization_id' => $this->organization->id,
        ]);
    }

    public function test_can_show_customer(): void
    {
        $customer = Customer::factory()->create([
            'organization_id' => $this->organization->id,
        ]);

        $response = $this->getJson('/api/v1/customers/' . $customer->id);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'id' => $customer->id,
                ],
            ]);
    }

    public function test_can_update_customer(): void
    {
        $customer = Customer::factory()->create([
            'organization_id' => $this->organization->id,
        ]);

        $updateData = [
            'name' => 'Updated Customer Name',
            'email' => 'updated@test.com',
        ];

        $response = $this->putJson('/api/v1/customers/' . $customer->id, $updateData);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'name' => 'Updated Customer Name',
                ],
            ]);

        $this->assertDatabaseHas('customers', [
            'id' => $customer->id,
            'name' => 'Updated Customer Name',
        ]);
    }

    public function test_can_delete_customer(): void
    {
        $customer = Customer::factory()->create([
            'organization_id' => $this->organization->id,
        ]);

        $response = $this->deleteJson('/api/v1/customers/' . $customer->id);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
            ]);

        $this->assertSoftDeleted('customers', [
            'id' => $customer->id,
        ]);
    }

    public function test_cannot_access_customers_from_other_organization(): void
    {
        $otherOrg = Organization::factory()->create();
        $customer = Customer::factory()->create([
            'organization_id' => $otherOrg->id,
        ]);

        $response = $this->getJson('/api/v1/customers/' . $customer->id);

        $response->assertStatus(404);
    }

    public function test_validation_fails_for_invalid_customer_data(): void
    {
        $response = $this->postJson('/api/v1/customers', [
            'organization_id' => $this->organization->id,
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['name', 'customer_code']);
    }
}

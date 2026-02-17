<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Organization;
use App\Models\ProductionOrder;
use App\Models\ProductionBatch;
use App\Models\Product;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Laravel\Sanctum\Sanctum;

class ProductionTest extends TestCase
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

    public function test_can_list_production_orders(): void
    {
        ProductionOrder::factory()->count(5)->create([
            'organization_id' => $this->organization->id,
        ]);

        $response = $this->getJson('/api/v1/production/orders?organization_id=' . $this->organization->id);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data',
            ]);
    }

    public function test_can_create_production_order(): void
    {
        $product = Product::factory()->create([
            'organization_id' => $this->organization->id,
        ]);

        $orderData = [
            'organization_id' => $this->organization->id,
            'order_number' => 'PO001',
            'product_id' => $product->id,
            'quantity' => 1000,
            'unit_of_measure' => 'kg',
            'planned_start_date' => now()->format('Y-m-d'),
            'planned_end_date' => now()->addDays(7)->format('Y-m-d'),
            'status' => 'draft',
            'priority' => 'normal',
        ];

        $response = $this->postJson('/api/v1/production/orders', $orderData);

        $response->assertStatus(201)
            ->assertJson([
                'success' => true,
                'data' => [
                    'order_number' => 'PO001',
                ],
            ]);

        $this->assertDatabaseHas('production_orders', [
            'order_number' => 'PO001',
            'organization_id' => $this->organization->id,
        ]);
    }

    public function test_can_update_production_order_status(): void
    {
        $order = ProductionOrder::factory()->create([
            'organization_id' => $this->organization->id,
            'status' => 'draft',
        ]);

        $response = $this->putJson('/api/v1/production/orders/' . $order->id, [
            'status' => 'confirmed',
        ]);

        $response->assertStatus(200);

        $this->assertDatabaseHas('production_orders', [
            'id' => $order->id,
            'status' => 'confirmed',
        ]);
    }

    public function test_can_create_production_batch(): void
    {
        $order = ProductionOrder::factory()->create([
            'organization_id' => $this->organization->id,
        ]);

        $batchData = [
            'organization_id' => $this->organization->id,
            'production_order_id' => $order->id,
            'batch_number' => 'BATCH001',
            'quantity' => 500,
            'unit_of_measure' => 'kg',
            'production_date' => now()->format('Y-m-d'),
            'status' => 'in_progress',
        ];

        $response = $this->postJson('/api/v1/production/batches', $batchData);

        $response->assertStatus(201)
            ->assertJson([
                'success' => true,
            ]);

        $this->assertDatabaseHas('production_batches', [
            'batch_number' => 'BATCH001',
            'organization_id' => $this->organization->id,
        ]);
    }

    public function test_can_list_production_batches(): void
    {
        $order = ProductionOrder::factory()->create([
            'organization_id' => $this->organization->id,
        ]);
        ProductionBatch::factory()->count(3)->create([
            'organization_id' => $this->organization->id,
            'production_order_id' => $order->id,
        ]);

        $response = $this->getJson('/api/v1/production/batches?organization_id=' . $this->organization->id);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data',
            ]);
    }

    public function test_can_filter_production_orders_by_status(): void
    {
        ProductionOrder::factory()->create([
            'organization_id' => $this->organization->id,
            'status' => 'completed',
        ]);
        ProductionOrder::factory()->create([
            'organization_id' => $this->organization->id,
            'status' => 'in_progress',
        ]);

        $response = $this->getJson('/api/v1/production/orders?organization_id=' . $this->organization->id . '&status=completed');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
            ]);
    }
}

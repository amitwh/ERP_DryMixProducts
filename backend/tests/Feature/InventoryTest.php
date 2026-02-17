<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Organization;
use App\Models\Inventory;
use App\Models\StockTransaction;
use App\Models\Warehouse;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Laravel\Sanctum\Sanctum;

class InventoryTest extends TestCase
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

    public function test_can_list_inventory(): void
    {
        Inventory::factory()->count(5)->create([
            'organization_id' => $this->organization->id,
        ]);

        $response = $this->getJson('/api/v1/inventory?organization_id=' . $this->organization->id);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data',
            ]);
    }

    public function test_can_create_stock_receipt(): void
    {
        $warehouse = Warehouse::factory()->create([
            'organization_id' => $this->organization->id,
        ]);

        $transactionData = [
            'organization_id' => $this->organization->id,
            'warehouse_id' => $warehouse->id,
            'transaction_type' => 'receipt',
            'transaction_number' => 'GRN001',
            'quantity' => 100,
            'unit_of_measure' => 'kg',
            'transaction_date' => now()->format('Y-m-d'),
            'reference_type' => 'purchase_order',
            'notes' => 'Test receipt',
        ];

        $response = $this->postJson('/api/v1/inventory/transactions', $transactionData);

        $response->assertStatus(201)
            ->assertJson([
                'success' => true,
            ]);

        $this->assertDatabaseHas('stock_transactions', [
            'transaction_number' => 'GRN001',
            'organization_id' => $this->organization->id,
        ]);
    }

    public function test_can_create_stock_issue(): void
    {
        $warehouse = Warehouse::factory()->create([
            'organization_id' => $this->organization->id,
        ]);
        $inventory = Inventory::factory()->create([
            'organization_id' => $this->organization->id,
            'warehouse_id' => $warehouse->id,
            'quantity' => 500,
        ]);

        $transactionData = [
            'organization_id' => $this->organization->id,
            'warehouse_id' => $warehouse->id,
            'inventory_id' => $inventory->id,
            'transaction_type' => 'issue',
            'transaction_number' => 'ISS001',
            'quantity' => 50,
            'unit_of_measure' => 'kg',
            'transaction_date' => now()->format('Y-m-d'),
            'reference_type' => 'production',
            'notes' => 'Test issue',
        ];

        $response = $this->postJson('/api/v1/inventory/transactions', $transactionData);

        $response->assertStatus(201)
            ->assertJson([
                'success' => true,
            ]);
    }

    public function test_can_list_stock_transactions(): void
    {
        StockTransaction::factory()->count(5)->create([
            'organization_id' => $this->organization->id,
        ]);

        $response = $this->getJson('/api/v1/inventory/transactions?organization_id=' . $this->organization->id);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data',
            ]);
    }

    public function test_can_get_stock_alerts(): void
    {
        Inventory::factory()->create([
            'organization_id' => $this->organization->id,
            'quantity' => 5,
            'reorder_level' => 50,
        ]);

        $response = $this->getJson('/api/v1/inventory/alerts?organization_id=' . $this->organization->id);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data',
            ]);
    }

    public function test_can_adjust_stock(): void
    {
        $warehouse = Warehouse::factory()->create([
            'organization_id' => $this->organization->id,
        ]);
        $inventory = Inventory::factory()->create([
            'organization_id' => $this->organization->id,
            'warehouse_id' => $warehouse->id,
            'quantity' => 100,
        ]);

        $response = $this->postJson('/api/v1/inventory/adjust', [
            'organization_id' => $this->organization->id,
            'inventory_id' => $inventory->id,
            'adjustment_type' => 'increase',
            'quantity' => 50,
            'reason' => 'Stock count correction',
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
            ]);
    }
}

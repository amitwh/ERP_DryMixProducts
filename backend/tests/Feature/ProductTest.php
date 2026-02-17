<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Organization;
use App\Models\Product;
use App\Models\Category;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Laravel\Sanctum\Sanctum;

class ProductTest extends TestCase
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

    public function test_can_list_products(): void
    {
        Product::factory()->count(5)->create([
            'organization_id' => $this->organization->id,
        ]);

        $response = $this->getJson('/api/v1/products?organization_id=' . $this->organization->id);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data',
            ]);
    }

    public function test_can_create_product(): void
    {
        $productData = [
            'organization_id' => $this->organization->id,
            'product_code' => 'PROD001',
            'name' => 'Test Product',
            'description' => 'Test product description',
            'product_type' => 'tile_adhesive',
            'unit_of_measure' => 'kg',
            'selling_price' => 100.00,
            'cost_price' => 80.00,
            'status' => 'active',
        ];

        $response = $this->postJson('/api/v1/products', $productData);

        $response->assertStatus(201)
            ->assertJson([
                'success' => true,
                'data' => [
                    'product_code' => 'PROD001',
                    'name' => 'Test Product',
                ],
            ]);

        $this->assertDatabaseHas('products', [
            'product_code' => 'PROD001',
            'organization_id' => $this->organization->id,
        ]);
    }

    public function test_can_show_product(): void
    {
        $product = Product::factory()->create([
            'organization_id' => $this->organization->id,
        ]);

        $response = $this->getJson('/api/v1/products/' . $product->id);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'id' => $product->id,
                ],
            ]);
    }

    public function test_can_update_product(): void
    {
        $product = Product::factory()->create([
            'organization_id' => $this->organization->id,
        ]);

        $updateData = [
            'name' => 'Updated Product Name',
            'selling_price' => 150.00,
        ];

        $response = $this->putJson('/api/v1/products/' . $product->id, $updateData);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
            ]);

        $this->assertDatabaseHas('products', [
            'id' => $product->id,
            'name' => 'Updated Product Name',
        ]);
    }

    public function test_can_delete_product(): void
    {
        $product = Product::factory()->create([
            'organization_id' => $this->organization->id,
        ]);

        $response = $this->deleteJson('/api/v1/products/' . $product->id);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
            ]);

        $this->assertSoftDeleted('products', [
            'id' => $product->id,
        ]);
    }

    public function test_can_filter_products_by_type(): void
    {
        Product::factory()->create([
            'organization_id' => $this->organization->id,
            'product_type' => 'tile_adhesive',
        ]);
        Product::factory()->create([
            'organization_id' => $this->organization->id,
            'product_type' => 'wall_plaster',
        ]);

        $response = $this->getJson('/api/v1/products?organization_id=' . $this->organization->id . '&product_type=tile_adhesive');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
            ]);
    }

    public function test_can_search_products(): void
    {
        Product::factory()->create([
            'organization_id' => $this->organization->id,
            'name' => 'Special Tile Adhesive',
            'product_code' => 'STA001',
        ]);
        Product::factory()->create([
            'organization_id' => $this->organization->id,
            'name' => 'Regular Grout',
            'product_code' => 'RG001',
        ]);

        $response = $this->getJson('/api/v1/products?organization_id=' . $this->organization->id . '&search=Tile');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
            ]);
    }
}

<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Organization;
use App\Models\Role;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Laravel\Sanctum\Sanctum;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    protected Organization $organization;
    protected Role $role;

    protected function setUp(): void
    {
        parent::setUp();
        
        $this->organization = Organization::factory()->create();
        $this->role = Role::factory()->create([
            'organization_id' => $this->organization->id,
        ]);
    }

    public function test_user_can_login_with_valid_credentials(): void
    {
        $user = User::factory()->create([
            'organization_id' => $this->organization->id,
            'email' => 'test@example.com',
            'password' => bcrypt('password123'),
            'status' => 'active',
        ]);

        $response = $this->postJson('/api/v1/auth/login', [
            'email' => 'test@example.com',
            'password' => 'password123',
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => [
                    'user' => [
                        'id',
                        'email',
                        'name',
                    ],
                    'token',
                ],
                'message',
            ]);
    }

    public function test_user_cannot_login_with_invalid_credentials(): void
    {
        $user = User::factory()->create([
            'organization_id' => $this->organization->id,
            'email' => 'test@example.com',
            'password' => bcrypt('password123'),
        ]);

        $response = $this->postJson('/api/v1/auth/login', [
            'email' => 'test@example.com',
            'password' => 'wrongpassword',
        ]);

        $response->assertStatus(401)
            ->assertJson([
                'success' => false,
            ]);
    }

    public function test_user_can_register(): void
    {
        $response = $this->postJson('/api/v1/auth/register', [
            'name' => 'Test User',
            'email' => 'newuser@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'organization_id' => $this->organization->id,
        ]);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'success',
                'data' => [
                    'user' => [
                        'id',
                        'email',
                        'name',
                    ],
                    'token',
                ],
            ]);

        $this->assertDatabaseHas('users', [
            'email' => 'newuser@example.com',
        ]);
    }

    public function test_user_can_logout(): void
    {
        $user = User::factory()->create([
            'organization_id' => $this->organization->id,
            'status' => 'active',
        ]);
        Sanctum::actingAs($user);

        $response = $this->postJson('/api/v1/auth/logout');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
            ]);
    }

    public function test_user_can_get_profile(): void
    {
        $user = User::factory()->create([
            'organization_id' => $this->organization->id,
            'status' => 'active',
        ]);
        Sanctum::actingAs($user);

        $response = $this->getJson('/api/v1/auth/user');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => [
                    'id',
                    'email',
                    'name',
                ],
            ]);
    }

    public function test_unauthenticated_user_cannot_access_protected_routes(): void
    {
        $response = $this->getJson('/api/v1/auth/user');

        $response->assertStatus(401);
    }

    public function test_user_can_request_password_reset(): void
    {
        $user = User::factory()->create([
            'organization_id' => $this->organization->id,
            'email' => 'reset@example.com',
        ]);

        $response = $this->postJson('/api/v1/auth/forgot-password', [
            'email' => 'reset@example.com',
        ]);

        $response->assertStatus(200);
    }
}

<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Organization;
use App\Models\ChartOfAccount;
use App\Models\JournalVoucher;
use App\Models\JournalEntry;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Laravel\Sanctum\Sanctum;

class FinanceTest extends TestCase
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

    public function test_can_list_chart_of_accounts(): void
    {
        ChartOfAccount::factory()->count(5)->create([
            'organization_id' => $this->organization->id,
        ]);

        $response = $this->getJson('/api/v1/finance/chart-of-accounts?organization_id=' . $this->organization->id);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data',
            ]);
    }

    public function test_can_create_account(): void
    {
        $accountData = [
            'organization_id' => $this->organization->id,
            'account_code' => 'ACC001',
            'account_name' => 'Cash Account',
            'account_type' => 'asset',
            'sub_type' => 'current_asset',
            'opening_balance' => 10000.00,
            'status' => 'active',
        ];

        $response = $this->postJson('/api/v1/finance/chart-of-accounts', $accountData);

        $response->assertStatus(201)
            ->assertJson([
                'success' => true,
                'data' => [
                    'account_code' => 'ACC001',
                    'account_name' => 'Cash Account',
                ],
            ]);

        $this->assertDatabaseHas('chart_of_accounts', [
            'account_code' => 'ACC001',
            'organization_id' => $this->organization->id,
        ]);
    }

    public function test_can_create_journal_voucher(): void
    {
        $debitAccount = ChartOfAccount::factory()->create([
            'organization_id' => $this->organization->id,
            'account_type' => 'asset',
        ]);
        $creditAccount = ChartOfAccount::factory()->create([
            'organization_id' => $this->organization->id,
            'account_type' => 'liability',
        ]);

        $voucherData = [
            'organization_id' => $this->organization->id,
            'voucher_number' => 'JV001',
            'voucher_date' => now()->format('Y-m-d'),
            'description' => 'Test Journal Entry',
            'entries' => [
                [
                    'account_id' => $debitAccount->id,
                    'debit' => 1000.00,
                    'credit' => 0,
                    'description' => 'Debit entry',
                ],
                [
                    'account_id' => $creditAccount->id,
                    'debit' => 0,
                    'credit' => 1000.00,
                    'description' => 'Credit entry',
                ],
            ],
        ];

        $response = $this->postJson('/api/v1/finance/journal-vouchers', $voucherData);

        $response->assertStatus(201)
            ->assertJson([
                'success' => true,
            ]);

        $this->assertDatabaseHas('journal_vouchers', [
            'voucher_number' => 'JV001',
            'organization_id' => $this->organization->id,
        ]);
    }

    public function test_journal_voucher_must_balance(): void
    {
        $debitAccount = ChartOfAccount::factory()->create([
            'organization_id' => $this->organization->id,
            'account_type' => 'asset',
        ]);
        $creditAccount = ChartOfAccount::factory()->create([
            'organization_id' => $this->organization->id,
            'account_type' => 'liability',
        ]);

        $voucherData = [
            'organization_id' => $this->organization->id,
            'voucher_number' => 'JV002',
            'voucher_date' => now()->format('Y-m-d'),
            'description' => 'Unbalanced Entry',
            'entries' => [
                [
                    'account_id' => $debitAccount->id,
                    'debit' => 1000.00,
                    'credit' => 0,
                ],
                [
                    'account_id' => $creditAccount->id,
                    'debit' => 0,
                    'credit' => 500.00,
                ],
            ],
        ];

        $response = $this->postJson('/api/v1/finance/journal-vouchers', $voucherData);

        $response->assertStatus(422);
    }

    public function test_can_get_trial_balance(): void
    {
        ChartOfAccount::factory()->count(3)->create([
            'organization_id' => $this->organization->id,
        ]);

        $response = $this->getJson('/api/v1/finance/reports/trial-balance?organization_id=' . $this->organization->id);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => [
                    'accounts',
                    'total_debit',
                    'total_credit',
                ],
            ]);
    }

    public function test_can_get_balance_sheet(): void
    {
        ChartOfAccount::factory()->create([
            'organization_id' => $this->organization->id,
            'account_type' => 'asset',
        ]);
        ChartOfAccount::factory()->create([
            'organization_id' => $this->organization->id,
            'account_type' => 'liability',
        ]);
        ChartOfAccount::factory()->create([
            'organization_id' => $this->organization->id,
            'account_type' => 'equity',
        ]);

        $response = $this->getJson('/api/v1/finance/reports/balance-sheet?organization_id=' . $this->organization->id);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data',
            ]);
    }

    public function test_can_get_profit_and_loss(): void
    {
        ChartOfAccount::factory()->create([
            'organization_id' => $this->organization->id,
            'account_type' => 'revenue',
        ]);
        ChartOfAccount::factory()->create([
            'organization_id' => $this->organization->id,
            'account_type' => 'expense',
        ]);

        $response = $this->getJson('/api/v1/finance/reports/profit-loss?organization_id=' . $this->organization->id);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data',
            ]);
    }
}

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Chart of Accounts
        Schema::create('chart_of_accounts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organization_id')->constrained()->onDelete('cascade');
            $table->string('account_code')->unique();
            $table->string('account_name');
            $table->string('account_type');
            $table->string('sub_type')->nullable();
            $table->foreignId('parent_account_id')->nullable()->constrained('chart_of_accounts')->onDelete('set null');
            $table->decimal('opening_balance', 15, 2)->default(0);
            $table->decimal('current_balance', 15, 2)->default(0);
            $table->enum('status', ['active', 'inactive'])->default('active');
            $table->boolean('is_cash_account')->default(false);
            $table->text('description')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['organization_id', 'account_code']);
            $table->index(['organization_id', 'account_type']);
        });

        // Fiscal Years
        Schema::create('fiscal_years', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organization_id')->constrained()->onDelete('cascade');
            $table->string('name');
            $table->date('start_date');
            $table->date('end_date');
            $table->enum('status', ['upcoming', 'current', 'closed'])->default('upcoming');
            $table->boolean('is_locked')->default(false);
            $table->foreignId('created_by')->nullable();
            $table->timestamps();

            $table->index(['organization_id', 'start_date']);
            $table->index('status');
        });

        // Journal Vouchers
        Schema::create('journal_vouchers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organization_id')->constrained()->onDelete('cascade');
            $table->foreignId('fiscal_year_id')->constrained()->onDelete('restrict');
            $table->string('voucher_number')->unique();
            $table->date('voucher_date');
            $table->enum('voucher_type', ['journal', 'receipt', 'payment', 'contra', 'sales', 'purchase', 'debit_note', 'credit_note'])->default('journal');
            $table->string('reference')->nullable();
            $table->text('narration')->nullable();
            $table->decimal('total_debit', 15, 2)->default(0);
            $table->decimal('total_credit', 15, 2)->default(0);
            $table->enum('status', ['draft', 'posted', 'cancelled'])->default('draft');
            $table->foreignId('created_by')->nullable();
            $table->foreignId('approved_by')->nullable();
            $table->timestamps();

            $table->index(['organization_id', 'voucher_date']);
            $table->index('voucher_type');
            $table->index('status');
        });

        // Journal Entries
        Schema::create('journal_entries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('journal_voucher_id')->constrained()->onDelete('cascade');
            $table->foreignId('account_id')->constrained('chart_of_accounts')->onDelete('restrict');
            $table->enum('entry_type', ['debit', 'credit']);
            $table->decimal('amount', 15, 2)->default(0);
            $table->text('description')->nullable();
            $table->foreignId('related_customer_id')->nullable();
            $table->foreignId('related_supplier_id')->nullable();
            $table->foreignId('cost_center_id')->nullable();
            $table->timestamps();

            $table->index('journal_voucher_id');
            $table->index('account_id');
            $table->index('entry_type');
        });

        // Ledgers
        Schema::create('ledgers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organization_id')->constrained()->onDelete('cascade');
            $table->foreignId('account_id')->constrained('chart_of_accounts')->onDelete('cascade');
            $table->date('entry_date');
            $table->foreignId('journal_entry_id')->nullable()->constrained()->onDelete('set null');
            $table->string('reference')->nullable();
            $table->enum('entry_type', ['debit', 'credit']);
            $table->decimal('debit_amount', 15, 2)->default(0);
            $table->decimal('credit_amount', 15, 2)->default(0);
            $table->decimal('balance', 15, 2)->default(0);
            $table->text('narration')->nullable();
            $table->timestamps();

            $table->index(['organization_id', 'account_id', 'entry_date'], 'ledgers_org_acct_date_idx');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ledgers');
        Schema::dropIfExists('journal_entries');
        Schema::dropIfExists('journal_vouchers');
        Schema::dropIfExists('fiscal_years');
        Schema::dropIfExists('chart_of_accounts');
    }
};

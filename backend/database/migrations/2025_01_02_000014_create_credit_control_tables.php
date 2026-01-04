<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('credit_controls', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organization_id')->constrained()->onDelete('cascade');
            $table->foreignId('customer_id')->constrained()->onDelete('cascade');
            $table->decimal('credit_limit', 15, 2)->default(0);
            $table->decimal('current_balance', 15, 2)->default(0);
            $table->decimal('available_credit', 15, 2)->default(0);
            $table->integer('credit_days')->default(30);
            $table->enum('payment_terms', ['cod', 'advance', 'net_15', 'net_30', 'net_45', 'net_60', 'net_90', 'custom'])->default('net_30');
            $table->string('custom_payment_terms')->nullable();
            $table->enum('credit_status', ['good', 'watch', 'hold', 'blocked'])->default('good');
            $table->integer('credit_score')->default(100);
            $table->enum('risk_level', ['low', 'medium', 'high', 'critical'])->default('low');
            $table->date('credit_review_date')->nullable();
            $table->text('credit_notes')->nullable();
            $table->boolean('credit_hold')->default(false);
            $table->date('credit_hold_date')->nullable();
            $table->string('credit_hold_reason')->nullable();
            $table->foreignId('created_by')->nullable();
            $table->foreignId('approved_by')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['organization_id', 'customer_id']);
            $table->index('credit_status');
            $table->index('credit_hold');
        });

        Schema::create('payment_reminders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organization_id')->constrained()->onDelete('cascade');
            $table->foreignId('customer_id')->nullable()->constrained()->onDelete('set null');
            $table->foreignId('invoice_id')->nullable();
            $table->enum('reminder_type', ['payment_due', 'overdue', 'credit_hold', 'collection_call', 'legal_notice'])->default('payment_due');
            $table->integer('days_before_due')->default(7);
            $table->enum('status', ['pending', 'sent', 'acknowledged', 'ignored'])->default('pending');
            $table->dateTime('scheduled_at');
            $table->dateTime('sent_at')->nullable();
            $table->enum('method', ['email', 'sms', 'whatsapp', 'post', 'phone'])->default('email');
            $table->text('message')->nullable();
            $table->string('recipient_email')->nullable();
            $table->string('recipient_phone')->nullable();
            $table->text('response')->nullable();
            $table->dateTime('response_at')->nullable();
            $table->integer('attempt_count')->default(0);
            $table->foreignId('created_by')->nullable();
            $table->timestamps();

            $table->index(['organization_id', 'customer_id']);
            $table->index('status');
            $table->index('scheduled_at');
        });

        Schema::create('collections', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organization_id')->constrained()->onDelete('cascade');
            $table->foreignId('customer_id')->constrained()->onDelete('cascade');
            $table->string('collection_number')->unique();
            $table->date('collection_date');
            $table->decimal('amount_due', 15, 2)->default(0);
            $table->decimal('amount_collected', 15, 2)->default(0);
            $table->decimal('amount_waived', 15, 2)->default(0);
            $table->decimal('balance_remaining', 15, 2)->default(0);
            $table->enum('collection_status', ['pending', 'partial', 'collected', 'disputed', 'written_off'])->default('pending');
            $table->enum('payment_method', ['cash', 'cheque', 'bank_transfer', 'card', 'online', 'offset'])->default('bank_transfer');
            $table->string('reference_number')->nullable();
            $table->string('bank_name')->nullable();
            $table->string('cheque_number')->nullable();
            $table->date('cheque_date')->nullable();
            $table->text('collection_notes')->nullable();
            $table->text('dispute_reason')->nullable();
            $table->foreignId('collected_by')->nullable();
            $table->timestamps();

            $table->index(['organization_id', 'customer_id']);
            $table->index('collection_date');
            $table->index('collection_status');
        });

        Schema::create('credit_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organization_id')->constrained()->onDelete('cascade');
            $table->foreignId('customer_id')->constrained()->onDelete('cascade');
            $table->foreignId('invoice_id')->nullable();
            $table->foreignId('collection_id')->nullable();
            $table->enum('transaction_type', ['invoice', 'payment', 'credit_note', 'debit_note', 'adjustment', 'refund'])->default('invoice');
            $table->decimal('amount', 15, 2)->default(0);
            $table->decimal('balance_before', 15, 2)->default(0);
            $table->decimal('balance_after', 15, 2)->default(0);
            $table->string('reference')->nullable();
            $table->text('description')->nullable();
            $table->dateTime('transaction_date');
            $table->timestamps();

            $table->index(['organization_id', 'customer_id']);
            $table->index('transaction_date');
            $table->index('transaction_type');
        });

        Schema::create('credit_reviews', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organization_id')->constrained()->onDelete('cascade');
            $table->foreignId('customer_id')->constrained()->onDelete('cascade');
            $table->foreignId('credit_control_id')->nullable();
            $table->date('review_date');
            $table->decimal('old_credit_limit', 15, 2)->default(0);
            $table->decimal('new_credit_limit', 15, 2)->default(0);
            $table->integer('old_credit_score')->default(100);
            $table->integer('new_credit_score')->default(100);
            $table->enum('old_risk_level', ['low', 'medium', 'high', 'critical'])->default('low');
            $table->enum('new_risk_level', ['low', 'medium', 'high', 'critical'])->default('low');
            $table->enum('old_status', ['good', 'watch', 'hold', 'blocked'])->default('good');
            $table->enum('new_status', ['good', 'watch', 'hold', 'blocked'])->default('good');
            $table->text('review_notes')->nullable();
            $table->text('justification')->nullable();
            $table->boolean('approved')->default(false);
            $table->foreignId('reviewed_by')->nullable();
            $table->foreignId('approved_by')->nullable();
            $table->timestamps();

            $table->index(['organization_id', 'customer_id']);
            $table->index('review_date');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('credit_reviews');
        Schema::dropIfExists('credit_transactions');
        Schema::dropIfExists('collections');
        Schema::dropIfExists('payment_reminders');
        Schema::dropIfExists('credit_controls');
    }
};

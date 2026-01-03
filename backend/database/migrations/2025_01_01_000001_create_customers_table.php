<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('customers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organization_id')->constrained()->onDelete('cascade');
            $table->string('name');
            $table->string('code')->unique();
            $table->string('customer_type')->default('corporate');
            $table->string('contact_person')->nullable();
            $table->string('phone');
            $table->string('email')->nullable();
            $table->text('billing_address')->nullable();
            $table->text('shipping_address')->nullable();
            $table->string('city')->nullable();
            $table->string('state')->nullable();
            $table->string('country')->default('India');
            $table->string('postal_code')->nullable();
            $table->string('gstin')->nullable();
            $table->string('pan')->nullable();
            $table->decimal('credit_limit', 15, 2)->default(0);
            $table->integer('credit_days')->default(30);
            $table->decimal('outstanding_balance', 15, 2)->default(0);
            $table->enum('status', ['active', 'inactive', 'blacklisted'])->default('active');
            $table->json('settings')->nullable();
            $table->timestamps();
            $table->softDeletes();
            
            $table->index(['organization_id', 'status']);
            $table->index('code');
            $table->index('gstin');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('customers');
    }
};

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sales_orders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organization_id')->constrained()->onDelete('cascade');
            $table->foreignId('customer_id')->constrained()->onDelete('cascade');
            $table->foreignId('project_id')->nullable()->constrained()->onDelete('set null');
            $table->string('order_number')->unique();
            $table->date('order_date');
            $table->date('expected_delivery_date')->nullable();
            $table->date('actual_delivery_date')->nullable();
            $table->text('shipping_address')->nullable();
            $table->string('payment_terms')->default('30 days');
            $table->decimal('subtotal', 15, 2)->default(0);
            $table->decimal('tax_amount', 15, 2)->default(0);
            $table->decimal('discount_amount', 15, 2)->default(0);
            $table->decimal('total_amount', 15, 2)->default(0);
            $table->enum('status', ['draft', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'])->default('draft');
            $table->foreignId('sales_person_id')->nullable()->constrained('users')->onDelete('set null');
            $table->text('notes')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();
            $table->softDeletes();
            
            $table->index(['organization_id', 'customer_id', 'status'], 'sales_orders_org_cust_stat_idx');
            $table->index('order_number');
            $table->index('order_date');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sales_orders');
    }
};

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organization_id')->constrained()->onDelete('cascade');
            $table->string('name');
            $table->string('code')->unique();
            $table->string('sku')->unique();
            $table->enum('type', ['dry_mix', 'raw_material', 'finished_good', 'semi_finished'])->default('dry_mix');
            $table->text('description')->nullable();
            $table->string('unit_of_measure')->default('MT');
            $table->decimal('standard_cost', 15, 2)->default(0);
            $table->decimal('selling_price', 15, 2)->default(0);
            $table->decimal('minimum_stock', 15, 2)->default(0);
            $table->decimal('reorder_level', 15, 2)->default(0);
            $table->integer('shelf_life_days')->nullable();
            $table->string('hsn_code')->nullable();
            $table->decimal('gst_rate', 5, 2)->default(18.00);
            $table->enum('status', ['active', 'inactive', 'discontinued'])->default('active');
            $table->json('specifications')->nullable();
            $table->json('quality_parameters')->nullable();
            $table->timestamps();
            $table->softDeletes();
            
            $table->index(['organization_id', 'type', 'status'], 'products_org_type_stat_idx');
            $table->index('code');
            $table->index('sku');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};

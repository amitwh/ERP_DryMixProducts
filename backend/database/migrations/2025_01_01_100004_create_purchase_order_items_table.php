<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('purchase_order_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('purchase_order_id')->constrained()->onDelete('cascade');
            $table->foreignId('product_id')->constrained()->onDelete('cascade');
            $table->decimal('quantity', 15, 2);
            $table->string('unit_of_measure');
            $table->decimal('unit_price', 15, 2);
            $table->decimal('tax_percentage', 5, 2)->default(18);
            $table->decimal('line_total', 15, 2);
            $table->decimal('received_quantity', 15, 2)->default(0);
            $table->text('specifications')->nullable();
            $table->timestamps();
            
            $table->index(['purchase_order_id', 'product_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('purchase_order_items');
    }
};

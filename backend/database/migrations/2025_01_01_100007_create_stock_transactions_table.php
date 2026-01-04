<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('stock_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organization_id')->constrained()->onDelete('cascade');
            $table->foreignId('manufacturing_unit_id')->constrained()->onDelete('cascade');
            $table->foreignId('product_id')->constrained()->onDelete('cascade');
            $table->string('transaction_number')->unique();
            $table->enum('transaction_type', ['receipt', 'issue', 'transfer', 'adjustment', 'return'])->default('receipt');
            $table->decimal('quantity', 15, 2);
            $table->string('unit_of_measure');
            $table->string('reference_type')->nullable(); // sales_order, purchase_order, production_order
            $table->unsignedBigInteger('reference_id')->nullable();
            $table->text('reason')->nullable();
            $table->foreignId('created_by')->constrained('users')->onDelete('cascade');
            $table->timestamp('transaction_date');
            $table->json('metadata')->nullable();
            $table->timestamps();
            
            $table->index(['organization_id', 'product_id', 'transaction_type']);
            $table->index('transaction_number');
            $table->index('transaction_date');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('stock_transactions');
    }
};

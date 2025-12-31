<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('bill_of_materials', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organization_id')->constrained()->onDelete('cascade');
            $table->foreignId('product_id')->constrained()->onDelete('cascade');
            $table->string('bom_number')->unique();
            $table->integer('version')->default(1);
            $table->date('effective_date');
            $table->date('expiry_date')->nullable();
            $table->decimal('output_quantity', 15, 2)->default(1);
            $table->string('output_unit')->default('MT');
            $table->enum('status', ['draft', 'active', 'inactive', 'superseded'])->default('draft');
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->softDeletes();
            
            $table->index(['organization_id', 'product_id', 'status']);
            $table->index('bom_number');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bill_of_materials');
    }
};

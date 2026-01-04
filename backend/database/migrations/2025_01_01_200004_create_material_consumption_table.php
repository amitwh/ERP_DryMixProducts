<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('material_consumption', function (Blueprint $table) {
            $table->id();
            $table->foreignId('production_batch_id')->constrained()->onDelete('cascade');
            $table->foreignId('raw_material_id')->constrained('products')->onDelete('cascade');
            $table->decimal('planned_quantity', 15, 2);
            $table->decimal('actual_quantity', 15, 2);
            $table->string('unit_of_measure');
            $table->decimal('variance', 15, 2)->default(0);
            $table->foreignId('issued_by')->constrained('users')->onDelete('cascade');
            $table->timestamp('issued_at');
            $table->text('remarks')->nullable();
            $table->timestamps();
            
            $table->index(['production_batch_id', 'raw_material_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('material_consumption');
    }
};

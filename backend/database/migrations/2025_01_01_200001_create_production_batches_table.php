<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('production_batches', function (Blueprint $table) {
            $table->id();
            $table->foreignId('production_order_id')->constrained()->onDelete('cascade');
            $table->string('batch_number')->unique();
            $table->date('batch_date');
            $table->decimal('quantity', 15, 2);
            $table->string('unit_of_measure');
            $table->timestamp('start_time')->nullable();
            $table->timestamp('end_time')->nullable();
            $table->enum('quality_status', ['pending', 'passed', 'failed', 'rework'])->default('pending');
            $table->foreignId('quality_checked_by')->nullable()->constrained('users')->onDelete('set null');
            $table->text('quality_remarks')->nullable();
            $table->enum('status', ['in_progress', 'completed', 'cancelled'])->default('in_progress');
            $table->json('material_consumption')->nullable();
            $table->json('quality_parameters')->nullable();
            $table->timestamps();
            
            $table->index(['production_order_id', 'status']);
            $table->index('batch_number');
            $table->index('batch_date');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('production_batches');
    }
};

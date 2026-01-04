<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('production_orders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organization_id')->constrained()->onDelete('cascade');
            $table->foreignId('manufacturing_unit_id')->constrained()->onDelete('cascade');
            $table->foreignId('product_id')->constrained()->onDelete('cascade');
            $table->foreignId('sales_order_id')->nullable()->constrained()->onDelete('set null');
            $table->string('order_number')->unique();
            $table->date('order_date');
            $table->date('planned_start_date')->nullable();
            $table->date('actual_start_date')->nullable();
            $table->date('planned_completion_date')->nullable();
            $table->date('actual_completion_date')->nullable();
            $table->decimal('planned_quantity', 15, 2);
            $table->decimal('actual_quantity', 15, 2)->default(0);
            $table->string('unit_of_measure')->default('MT');
            $table->enum('priority', ['low', 'normal', 'high', 'urgent'])->default('normal');
            $table->enum('status', ['draft', 'scheduled', 'in_progress', 'completed', 'cancelled'])->default('draft');
            $table->foreignId('supervisor_id')->nullable()->constrained('users')->onDelete('set null');
            $table->text('notes')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();
            $table->softDeletes();
            
            $table->index(['organization_id', 'manufacturing_unit_id', 'status']);
            $table->index('order_number');
            $table->index(['order_date', 'planned_completion_date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('production_orders');
    }
};

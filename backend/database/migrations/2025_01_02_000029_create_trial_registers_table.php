<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('trial_registers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('org_id')->constrained('organizations')->onDelete('cascade');
            $table->foreignId('unit_id')->constrained('manufacturing_units')->onDelete('cascade');
            $table->string('trial_number', 50)->notNull();
            $table->enum('trial_type', ['product_development', 'formulation', 'material_test', 'process_optimization', 'customer_request'])->notNull();
            $table->foreignId('product_id')->nullable()->constrained('products')->onDelete('set null');
            $table->string('title', 200)->notNull();
            $table->text('objective')->nullable();
            $table->text('description')->nullable();
            $table->foreignId('requested_by')->constrained('users')->onDelete('cascade');
            $table->foreignId('assigned_to')->nullable()->constrained('users')->onDelete('set null');
            $table->enum('priority', ['low', 'medium', 'high', 'urgent'])->default('medium');
            $table->date('start_date')->nullable();
            $table->date('target_date')->nullable();
            $table->date('completion_date')->nullable();
            $table->enum('status', ['requested', 'approved', 'in_progress', 'completed', 'cancelled', 'on_hold'])->default('requested');
            $table->json('trial_data')->nullable()->comment('Trial parameters and observations');
            $table->text('results_summary')->nullable();
            $table->text('conclusion')->nullable();
            $table->boolean('conversion_to_production')->default(false);
            $table->unsignedBigInteger('production_batch_id')->nullable();
            $table->json('cost_analysis')->nullable();
            $table->json('attachments')->nullable();
            $table->json('approval_workflow')->nullable();
            $table->timestamps();

            $table->unique(['org_id', 'unit_id', 'trial_number']);
            $table->index('status');
            $table->index(['start_date', 'target_date', 'completion_date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('trial_registers');
    }
};

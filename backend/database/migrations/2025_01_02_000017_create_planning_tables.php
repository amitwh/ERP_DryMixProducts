<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Production Plans
        Schema::create('production_plans', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organization_id')->constrained()->onDelete('cascade');
            $table->foreignId('manufacturing_unit_id')->constrained()->onDelete('cascade');
            $table->foreignId('product_id')->constrained()->onDelete('cascade');
            $table->string('plan_number')->unique();
            $table->string('plan_name');
            $table->enum('plan_type', ['monthly', 'quarterly', 'yearly', 'custom'])->default('monthly');
            $table->date('start_date');
            $table->date('end_date');
            $table->decimal('planned_quantity', 15, 3)->default(0);
            $table->decimal('actual_quantity', 15, 3)->default(0);
            $table->integer('capacity_percentage')->default(100);
            $table->enum('status', ['draft', 'approved', 'in_progress', 'completed', 'cancelled'])->default('draft');
            $table->text('notes')->nullable();
            $table->foreignId('created_by')->nullable();
            $table->foreignId('approved_by')->nullable();
            $table->timestamps();

            $table->index(['organization_id', 'start_date']);
            $table->index('status');
            $table->index('product_id');
        });

        // Material Requirements Planning (MRP)
        Schema::create('material_requirements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organization_id')->constrained()->onDelete('cascade');
            $table->foreignId('production_plan_id')->constrained()->onDelete('cascade');
            $table->foreignId('raw_material_id')->nullable(); // References products table for raw materials
            $table->decimal('required_quantity', 15, 3)->default(0);
            $table->decimal('available_quantity', 15, 3)->default(0);
            $table->decimal('to_purchase', 15, 3)->default(0);
            $table->enum('status', ['pending', 'approved', 'ordered'])->default('pending');
            $table->date('required_by_date');
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['organization_id', 'production_plan_id']);
            $table->index('required_by_date');
        });

        // Capacity Planning
        Schema::create('capacity_plans', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organization_id')->constrained()->onDelete('cascade');
            $table->foreignId('manufacturing_unit_id')->constrained()->onDelete('cascade');
            $table->foreignId('production_line_id')->nullable();
            $table->string('plan_number')->unique();
            $table->date('start_date');
            $table->date('end_date');
            $table->integer('available_hours')->default(0);
            $table->integer('planned_hours')->default(0);
            $table->integer('used_hours')->default(0);
            $table->integer('buffer_hours')->default(0);
            $table->integer('utilization_percentage')->default(0);
            $table->enum('status', ['planned', 'in_use', 'completed'])->default('planned');
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['organization_id', 'start_date']);
            $table->index('status');
        });

        // Demand Forecasts
        Schema::create('demand_forecasts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organization_id')->constrained()->onDelete('cascade');
            $table->foreignId('product_id')->constrained()->onDelete('cascade');
            $table->foreignId('customer_id')->nullable()->constrained()->onDelete('set null');
            $table->date('forecast_date');
            $table->integer('forecast_period_months')->default(1);
            $table->decimal('forecasted_quantity', 15, 3)->default(0);
            $table->decimal('actual_quantity', 15, 3)->default(0);
            $table->decimal('accuracy_percentage', 5, 2)->default(0);
            $table->enum('forecast_type', ['sales', 'production', 'procurement'])->default('sales');
            $table->text('notes')->nullable();
            $table->foreignId('created_by')->nullable();
            $table->timestamps();

            $table->index(['organization_id', 'forecast_date']);
            $table->index('product_id');
        });

        // Production Schedules
        Schema::create('production_schedules', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organization_id')->constrained()->onDelete('cascade');
            $table->foreignId('manufacturing_unit_id')->constrained()->onDelete('cascade');
            $table->foreignId('production_plan_id')->constrained()->onDelete('cascade');
            $table->foreignId('production_order_id')->nullable()->constrained()->onDelete('set null');
            $table->date('schedule_date');
            $table->foreignId('shift_id')->nullable();
            $table->foreignId('production_line_id')->nullable();
            $table->foreignId('product_id')->constrained()->onDelete('cascade');
            $table->decimal('planned_quantity', 15, 3)->default(0);
            $table->decimal('actual_quantity', 15, 3)->default(0);
            $table->enum('status', ['scheduled', 'started', 'paused', 'completed', 'cancelled'])->default('scheduled');
            $table->dateTime('start_time')->nullable();
            $table->dateTime('end_time')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['organization_id', 'schedule_date']);
            $table->index('status');
            $table->index('product_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('production_schedules');
        Schema::dropIfExists('demand_forecasts');
        Schema::dropIfExists('capacity_plans');
        Schema::dropIfExists('material_requirements');
        Schema::dropIfExists('production_plans');
    }
};

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('kpis', function (Blueprint $table) {
            $table->id();
            $table->foreignId('org_id')->constrained('organizations')->onDelete('cascade');
            $table->string('kpi_code', 50)->unique();
            $table->string('kpi_name', 200)->notNull();
            $table->enum('kpi_category', ['quality', 'production', 'efficiency', 'cost', 'safety', 'sales', 'inventory', 'customer_satisfaction'])->notNull();
            $table->text('description')->nullable();
            $table->text('calculation_formula')->nullable();
            $table->string('uom', 20)->nullable();
            $table->decimal('target_value', 15, 2)->nullable();
            $table->decimal('tolerance_percentage', 5, 2)->nullable();
            $table->enum('frequency', ['daily', 'weekly', 'monthly', 'quarterly', 'annually'])->default('monthly');
            $table->string('data_source', 100)->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();

            $table->unique(['org_id', 'kpi_code']);
            $table->index('kpi_category');
            $table->index('is_active');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('kpis');
    }
};

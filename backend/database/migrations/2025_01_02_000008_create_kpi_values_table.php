<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('kpi_values', function (Blueprint $table) {
            $table->id();
            $table->foreignId('kpi_id')->constrained('kpis')->onDelete('cascade');
            $table->foreignId('org_id')->constrained('organizations')->onDelete('cascade');
            $table->foreignId('unit_id')->nullable()->constrained('manufacturing_units')->onDelete('cascade');
            $table->date('record_date')->notNull();
            $table->decimal('actual_value', 15, 2)->nullable();
            $table->decimal('target_value', 15, 2)->nullable();
            $table->decimal('variance', 15, 2)->nullable();
            $table->decimal('variance_percentage', 5, 2)->nullable();
            $table->decimal('achievement_percentage', 5, 2)->nullable();
            $table->enum('status', ['below_target', 'on_target', 'above_target'])->default('on_target');
            $table->enum('trend', ['improving', 'stable', 'declining'])->nullable();
            $table->text('notes')->nullable();
            $table->timestamp('calculated_at')->useCurrent();

            $table->unique(['kpi_id', 'org_id', 'unit_id', 'record_date']);
            $table->index('record_date');
            $table->index(['kpi_id', 'record_date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('kpi_values');
    }
};

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('predictions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('org_id')->constrained('organizations')->onDelete('cascade');
            $table->foreignId('unit_id')->nullable()->constrained('manufacturing_units')->onDelete('cascade');
            $table->foreignId('model_id')->constrained('ml_models')->onDelete('cascade');
            $table->enum('prediction_type', ['demand', 'production', 'quality', 'equipment_failure', 'inventory', 'price', 'sales', 'anomaly'])->notNull();
            $table->string('entity_type', 50)->nullable();
            $table->unsignedBigInteger('entity_id')->nullable();
            $table->timestamp('prediction_date')->notNull();
            $table->integer('prediction_horizon_days')->nullable();
            $table->decimal('predicted_value', 15, 2)->nullable();
            $table->decimal('confidence_lower', 15, 2)->nullable();
            $table->decimal('confidence_upper', 15, 2)->nullable();
            $table->decimal('confidence_percentage', 5, 2)->nullable();
            $table->json('input_data')->nullable();
            $table->decimal('actual_value', 15, 2)->nullable();
            $table->timestamp('actual_recorded_at')->nullable();
            $table->decimal('accuracy_percentage', 5, 2)->nullable();
            $table->enum('status', ['predicted', 'actual_recorded', 'verified', 'expired'])->default('predicted');
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index('prediction_date');
            $table->index(['prediction_type', 'entity_type', 'entity_id']);
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('predictions');
    }
};

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('anomalies', function (Blueprint $table) {
            $table->id();
            $table->foreignId('org_id')->constrained('organizations')->onDelete('cascade');
            $table->foreignId('unit_id')->nullable()->constrained('manufacturing_units')->onDelete('cascade');
            $table->enum('anomaly_type', ['quality', 'production', 'equipment', 'inventory', 'sales', 'financial', 'process'])->notNull();
            $table->enum('severity', ['low', 'medium', 'high', 'critical'])->notNull();
            $table->timestamp('detected_at')->useCurrent();
            $table->string('entity_type', 50)->nullable();
            $table->unsignedBigInteger('entity_id')->nullable();
            $table->text('anomaly_description')->nullable();
            $table->decimal('expected_value', 15, 2)->nullable();
            $table->decimal('actual_value', 15, 2)->nullable();
            $table->decimal('deviation_percentage', 5, 2)->nullable();
            $table->decimal('anomaly_score', 10, 4)->nullable();
            $table->decimal('confidence_percentage', 5, 2)->nullable();
            $table->foreignId('model_id')->nullable()->constrained('ml_models')->onDelete('set null');
            $table->text('probable_cause')->nullable();
            $table->text('recommended_action')->nullable();
            $table->enum('status', ['detected', 'investigating', 'resolved', 'false_positive', 'ignored'])->default('detected');
            $table->foreignId('investigated_by')->nullable()->constrained('users')->onDelete('set null');
            $table->text('investigation_summary')->nullable();
            $table->text('resolution_summary')->nullable();
            $table->foreignId('resolved_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamp('resolved_at')->nullable();
            $table->timestamps();

            $table->index('anomaly_type');
            $table->index('severity');
            $table->index('detected_at');
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('anomalies');
    }
};

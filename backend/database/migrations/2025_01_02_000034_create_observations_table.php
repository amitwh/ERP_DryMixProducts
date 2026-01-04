<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('observations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('org_id')->constrained('organizations')->onDelete('cascade');
            $table->foreignId('unit_id')->constrained('manufacturing_units')->onDelete('cascade');
            $table->string('observation_number', 50)->notNull();
            $table->enum('observation_type', ['safety', 'quality', 'process', 'environmental', 'efficiency', 'waste', 'compliance'])->notNull();
            $table->enum('severity', ['low', 'medium', 'high', 'critical'])->notNull();
            $table->string('category', 100)->nullable();
            $table->string('title', 200)->notNull();
            $table->text('description')->nullable();
            $table->string('location', 200)->nullable();
            $table->string('activity_type', 100)->nullable();
            $table->foreignId('observed_by')->constrained('users')->onDelete('cascade');
            $table->timestamp('observed_date')->useCurrent();
            $table->json('evidence_photos')->nullable();
            $table->json('videos')->nullable();
            $table->json('witness_names')->nullable();
            $table->text('immediate_action_taken')->nullable();
            $table->json('risk_assessment')->nullable();
            $table->enum('status', ['reported', 'under_investigation', 'action_in_progress', 'resolved', 'closed'])->default('reported');
            $table->foreignId('investigation_by')->nullable()->constrained('users')->onDelete('set null');
            $table->date('investigation_date')->nullable();
            $table->text('investigation_findings')->nullable();
            $table->text('root_cause')->nullable();
            $table->boolean('corrective_action_required')->default(false);
            $table->json('corrective_actions')->nullable();
            $table->foreignId('assigned_to')->nullable()->constrained('users')->onDelete('set null');
            $table->date('target_date')->nullable();
            $table->date('completed_date')->nullable();
            $table->foreignId('verification_by')->nullable()->constrained('users')->onDelete('set null');
            $table->boolean('verified')->default(false);
            $table->timestamp('verified_date')->nullable();
            $table->timestamps();

            $table->unique(['org_id', 'unit_id', 'observation_number']);
            $table->index('observation_type');
            $table->index('status');
            $table->index('observed_date');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('observations');
    }
};

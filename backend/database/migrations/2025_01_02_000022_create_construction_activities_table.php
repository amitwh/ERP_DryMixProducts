<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('construction_activities', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained('construction_projects')->onDelete('cascade');
            $table->string('activity_code', 50)->notNull();
            $table->string('activity_name', 200)->notNull();
            $table->enum('activity_type', ['foundation', 'superstructure', 'finishing', 'electrical', 'plumbing', 'hvac', 'external', 'landscaping'])->notNull();
            $table->foreignId('parent_activity_id')->nullable()->constrained('construction_activities', 'id')->onDelete('cascade');
            $table->integer('sequence_number')->nullable();
            $table->date('start_date')->nullable();
            $table->date('estimated_end_date')->nullable();
            $table->date('actual_start_date')->nullable();
            $table->date('actual_end_date')->nullable();
            $table->enum('status', ['not_started', 'in_progress', 'completed', 'on_hold', 'delayed'])->default('not_started');
            $table->decimal('planned_budget', 15, 2)->nullable();
            $table->decimal('actual_cost', 15, 2)->nullable();
            $table->decimal('progress_percentage', 5, 2)->default(0);
            $table->foreignId('contractor_id')->nullable()->constrained('customers')->onDelete('set null');
            $table->json('specifications')->nullable();
            $table->json('drawings')->nullable();
            $table->timestamps();

            $table->unique(['project_id', 'activity_code']);
            $table->index('status');
            $table->index(['start_date', 'estimated_end_date']);
            $table->index('contractor_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('construction_activities');
    }
};

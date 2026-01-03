<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('checklists', function (Blueprint $table) {
            $table->id();
            $table->foreignId('org_id')->constrained('organizations')->onDelete('cascade');
            $table->foreignId('unit_id')->nullable()->constrained('manufacturing_units')->onDelete('cascade');
            $table->string('checklist_code', 50)->notNull();
            $table->string('checklist_name', 200)->notNull();
            $table->enum('category', ['safety', 'quality', 'process', 'pre_start', 'post_production', 'maintenance', 'loading', 'shipping'])->notNull();
            $table->text('description')->nullable();
            $table->enum('checklist_type', ['predefined', 'custom'])->default('predefined');
            $table->boolean('is_active')->default(true);
            $table->enum('frequency', ['once', 'daily', 'weekly', 'monthly', 'quarterly', 'annually', 'per_batch', 'per_shift'])->default('daily');
            $table->json('applicable_areas')->nullable();
            $table->json('target_roles')->nullable();
            $table->json('checklist_items')->nullable()->comment('Array of checklist items with criteria');
            $table->json('pass_criteria')->nullable();
            $table->integer('total_score')->nullable();
            $table->integer('passing_score')->nullable();
            $table->foreignId('created_by')->constrained('users')->onDelete('cascade');
            $table->string('version', 20)->default('1.0');
            $table->date('effective_date')->nullable();
            $table->date('review_date')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->unique(['org_id', 'checklist_code']);
            $table->index('category');
            $table->index('is_active');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('checklists');
    }
};

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('site_inspections', function (Blueprint $table) {
            $table->id();
            $table->foreignId('org_id')->constrained('organizations')->onDelete('cascade');
            $table->foreignId('unit_id')->nullable()->constrained('manufacturing_units')->onDelete('cascade');
            $table->foreignId('project_id')->nullable()->constrained('construction_projects')->onDelete('cascade');
            $table->foreignId('activity_id')->nullable()->constrained('construction_activities')->onDelete('cascade');
            $table->string('inspection_number', 50)->notNull();
            $table->date('inspection_date')->notNull();
            $table->enum('inspection_type', ['pre_construction', 'in_progress', 'post_construction', 'material_delivery', 'safety', 'quality'])->notNull();
            $table->string('inspection_category', 100)->nullable();
            $table->foreignId('inspected_by')->constrained('users')->onDelete('cascade');
            $table->foreignId('supervised_by')->nullable()->constrained('users')->onDelete('set null');
            $table->string('contractor_representative', 200)->nullable();
            $table->string('weather_conditions', 100)->nullable();
            $table->decimal('ambient_temp', 6, 2)->nullable();
            $table->decimal('relative_humidity', 5, 2)->nullable();
            $table->json('inspection_data')->nullable()->comment('Detailed inspection items and results');
            $table->enum('overall_result', ['satisfactory', 'acceptable_with_observation', 'unsatisfactory'])->default('satisfactory');
            $table->json('non_conformances')->nullable();
            $table->text('observations')->nullable();
            $table->json('photos')->nullable();
            $table->json('videos')->nullable();
            $table->text('immediate_actions')->nullable();
            $table->boolean('follow_up_required')->default(false);
            $table->text('follow_up_actions')->nullable();
            $table->date('follow_up_target_date')->nullable();
            $table->string('inspector_signature', 500)->nullable();
            $table->string('contractor_signature', 500)->nullable();
            $table->timestamps();

            $table->unique(['org_id', 'unit_id', 'inspection_number']);
            $table->index(['project_id', 'inspection_date']);
            $table->index('activity_id');
            $table->index('inspection_type');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('site_inspections');
    }
};

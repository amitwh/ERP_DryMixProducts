<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('workmanship_inspections', function (Blueprint $table) {
            $table->id();
            $table->foreignId('org_id')->constrained('organizations')->onDelete('cascade');
            $table->foreignId('project_id')->constrained('construction_projects')->onDelete('cascade');
            $table->foreignId('activity_id')->constrained('construction_activities')->onDelete('cascade');
            $table->string('inspection_number', 50)->notNull();
            $table->date('inspection_date')->notNull();
            $table->string('work_area', 200)->nullable();
            $table->string('work_type', 100)->nullable();
            $table->foreignId('contractor_id')->nullable()->constrained('customers')->onDelete('set null');
            $table->string('worker_team', 100)->nullable();
            $table->string('supervisor', 100)->nullable();
            $table->string('work_stage', 100)->nullable();
            $table->json('acceptance_criteria')->nullable();
            $table->json('inspection_parameters')->nullable();
            $table->json('measurements_taken')->nullable();
            $table->json('tolerances')->nullable();
            $table->json('deviations')->nullable();
            $table->enum('overall_quality', ['excellent', 'good', 'acceptable', 'poor'])->default('good');
            $table->boolean('rework_required')->default(false);
            $table->text('rework_area')->nullable();
            $table->text('rework_instructions')->nullable();
            $table->boolean('approved')->default(false);
            $table->foreignId('approved_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamp('approved_date')->nullable();
            $table->json('photos')->nullable();
            $table->json('sketches')->nullable();
            $table->foreignId('inspected_by')->constrained('users')->onDelete('cascade');
            $table->timestamps();

            $table->unique(['org_id', 'project_id', 'inspection_number'], 'work_insp_org_proj_insp_num_unq');
            $table->index('activity_id');
            $table->index('contractor_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('workmanship_inspections');
    }
};

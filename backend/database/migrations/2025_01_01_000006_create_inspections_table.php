<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('inspections', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organization_id')->constrained()->onDelete('cascade');
            $table->foreignId('project_id')->nullable()->constrained()->onDelete('cascade');
            $table->foreignId('manufacturing_unit_id')->nullable()->constrained()->onDelete('set null');
            $table->string('inspection_number')->unique();
            $table->string('inspection_type'); // material, process, final, daily
            $table->date('inspection_date');
            $table->time('inspection_time')->nullable();
            $table->foreignId('inspector_id')->constrained('users')->onDelete('cascade');
            $table->string('location')->nullable();
            $table->text('scope')->nullable();
            $table->enum('result', ['pass', 'fail', 'conditional_pass', 'pending'])->default('pending');
            $table->text('observations')->nullable();
            $table->text('recommendations')->nullable();
            $table->json('checklist_items')->nullable();
            $table->json('attachments')->nullable();
            $table->enum('status', ['scheduled', 'in_progress', 'completed', 'cancelled'])->default('scheduled');
            $table->timestamps();
            $table->softDeletes();
            
            $table->index(['organization_id', 'inspection_type', 'status'], 'inspections_org_type_stat_idx');
            $table->index('inspection_number');
            $table->index('project_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('inspections');
    }
};

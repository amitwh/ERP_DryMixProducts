<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ncrs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organization_id')->constrained()->onDelete('cascade');
            $table->foreignId('project_id')->nullable()->constrained()->onDelete('cascade');
            $table->string('ncr_number')->unique();
            $table->date('ncr_date');
            $table->foreignId('raised_by')->constrained('users')->onDelete('cascade');
            $table->string('non_conformance_type'); // material, process, documentation, safety
            $table->string('severity')->default('minor'); // critical, major, minor
            $table->text('description');
            $table->string('location')->nullable();
            $table->foreignId('responsible_person_id')->nullable()->constrained('users')->onDelete('set null');
            $table->text('root_cause')->nullable();
            $table->text('corrective_action')->nullable();
            $table->text('preventive_action')->nullable();
            $table->date('target_date')->nullable();
            $table->date('closure_date')->nullable();
            $table->enum('status', ['open', 'under_investigation', 'action_taken', 'closed', 'cancelled'])->default('open');
            $table->foreignId('verified_by')->nullable()->constrained('users')->onDelete('set null');
            $table->date('verification_date')->nullable();
            $table->json('attachments')->nullable();
            $table->timestamps();
            $table->softDeletes();
            
            $table->index(['organization_id', 'status', 'severity'], 'ncrs_org_stat_sev_idx');
            $table->index('ncr_number');
            $table->index('project_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ncrs');
    }
};

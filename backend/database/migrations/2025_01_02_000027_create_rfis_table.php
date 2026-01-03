<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('rfis', function (Blueprint $table) {
            $table->id();
            $table->foreignId('org_id')->constrained('organizations')->onDelete('cascade');
            $table->foreignId('project_id')->constrained('construction_projects')->onDelete('cascade');
            $table->string('rfi_number', 50)->notNull();
            $table->string('rfi_title', 200)->notNull();
            $table->string('spec_section', 50)->nullable();
            $table->foreignId('submitted_by')->constrained('users')->onDelete('cascade');
            $table->date('submitted_date')->nullable();
            $table->enum('urgency', ['low', 'medium', 'high', 'critical'])->default('medium');
            $table->date('required_by_date')->nullable();
            $table->foreignId('assigned_to')->nullable()->constrained('users')->onDelete('set null');
            $table->enum('status', ['draft', 'submitted', 'assigned', 'answered', 'closed'])->default('draft');
            $table->text('question')->notNull();
            $table->text('response')->nullable();
            $table->json('drawing_references')->nullable();
            $table->json('photos')->nullable();
            $table->foreignId('response_by')->nullable()->constrained('users')->onDelete('set null');
            $table->date('response_date')->nullable();
            $table->integer('response_time_hours')->nullable();
            $table->json('documents')->nullable();
            $table->timestamps();

            $table->unique(['org_id', 'project_id', 'rfi_number']);
            $table->index('status');
            $table->index(['submitted_date', 'required_by_date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('rfis');
    }
};

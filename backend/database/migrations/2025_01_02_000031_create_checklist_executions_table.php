<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('checklist_executions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('org_id')->constrained('organizations')->onDelete('cascade');
            $table->foreignId('unit_id')->constrained('manufacturing_units')->onDelete('cascade');
            $table->foreignId('checklist_id')->constrained('checklists')->onDelete('cascade');
            $table->string('execution_number', 50)->notNull();
            $table->date('execution_date')->notNull();
            $table->time('execution_time')->nullable();
            $table->foreignId('executed_by')->constrained('users')->onDelete('cascade');
            $table->string('reference_type', 50)->nullable();
            $table->unsignedBigInteger('reference_id')->nullable();
            $table->enum('status', ['in_progress', 'completed', 'failed'])->default('in_progress');
            $table->integer('total_score')->nullable();
            $table->integer('obtained_score')->nullable();
            $table->enum('result', ['pass', 'fail'])->default('pass');
            $table->json('responses')->nullable()->comment('Checklist item responses');
            $table->text('observations')->nullable();
            $table->json('photos')->nullable();
            $table->json('failures')->nullable();
            $table->text('corrective_actions')->nullable();
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamp('review_date')->nullable();
            $table->string('signature_path', 500)->nullable();
            $table->timestamps();

            $table->unique(['org_id', 'unit_id', 'execution_number']);
            $table->index(['checklist_id', 'execution_date']);
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('checklist_executions');
    }
};

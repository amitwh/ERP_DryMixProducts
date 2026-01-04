<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('submittals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('org_id')->constrained('organizations')->onDelete('cascade');
            $table->foreignId('project_id')->constrained('construction_projects')->onDelete('cascade');
            $table->string('submittal_number', 50)->notNull();
            $table->string('submittal_title', 200)->notNull();
            $table->enum('submittal_type', ['material', 'shop_drawing', 'sample', 'method_statement', 'test_report', 'technical_data'])->notNull();
            $table->string('spec_section', 50)->nullable();
            $table->date('required_by_date')->nullable();
            $table->foreignId('submitted_by')->constrained('users')->onDelete('cascade');
            $table->date('submitted_date')->nullable();
            $table->integer('revision_number')->default(1);
            $table->enum('submittal_status', ['pending', 'submitted', 'under_review', 'approved', 'approved_as_noted', 'revise_and_resubmit', 'rejected'])->default('pending');
            $table->json('documents')->nullable();
            $table->text('review_comments')->nullable();
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->onDelete('set null');
            $table->date('review_date')->nullable();
            $table->date('final_approval_date')->nullable();
            $table->json('distribution_list')->nullable();
            $table->timestamps();

            $table->unique(['org_id', 'project_id', 'submittal_number']);
            $table->index('submittal_status');
            $table->index('required_by_date');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('submittals');
    }
};

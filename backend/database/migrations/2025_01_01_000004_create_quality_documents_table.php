<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('quality_documents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organization_id')->constrained()->onDelete('cascade');
            $table->foreignId('project_id')->nullable()->constrained()->onDelete('cascade');
            $table->string('document_number')->unique();
            $table->string('document_type'); // ITR, QAP, Checklist, ITP, Test_Report
            $table->string('title');
            $table->text('description')->nullable();
            $table->integer('revision_number')->default(0);
            $table->date('issue_date');
            $table->foreignId('prepared_by')->constrained('users')->onDelete('cascade');
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->onDelete('set null');
            $table->foreignId('approved_by')->nullable()->constrained('users')->onDelete('set null');
            $table->enum('status', ['draft', 'under_review', 'approved', 'rejected', 'superseded'])->default('draft');
            $table->text('rejection_reason')->nullable();
            $table->json('attachments')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();
            $table->softDeletes();
            
            $table->index(['organization_id', 'document_type', 'status']);
            $table->index('document_number');
            $table->index('project_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('quality_documents');
    }
};

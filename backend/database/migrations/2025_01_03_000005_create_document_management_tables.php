<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Create document_categories first (referenced by documents)
        Schema::create('document_categories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('org_id')->constrained('organizations')->onDelete('cascade');
            $table->foreignId('parent_id')->nullable()->constrained('document_categories')->onDelete('cascade')->comment('For nested categories');
            $table->string('name', 200)->notNull();
            $table->string('slug', 255)->notNull();
            $table->text('description')->nullable();
            $table->string('icon', 50)->nullable()->comment('FontAwesome or similar icon name');
            $table->string('color', 7)->nullable()->comment('Hex color code');
            $table->integer('sort_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->unique(['org_id', 'slug']);
            $table->index('parent_id');
            $table->index('is_active');
        });

        Schema::create('documents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('org_id')->constrained('organizations')->onDelete('cascade');
            $table->string('document_number', 100)->notNull()->comment('Unique document identifier');
            $table->string('title', 500)->notNull()->comment('Document title');
            $table->string('document_type', 100)->notNull()->comment('Policy, procedure, contract, invoice, etc.');
            $table->string('category', 100)->notNull()->comment('HR, Finance, Quality, etc.');
            $table->foreignId('sub_category_id')->nullable()->constrained('document_categories')->onDelete('set null');
            $table->text('description')->nullable();
            $table->string('file_name', 500)->notNull();
            $table->string('file_path', 500)->notNull();
            $table->string('file_type', 100)->notNull()->comment('pdf, docx, xlsx, jpg, png');
            $table->string('mime_type', 200)->nullable();
            $table->decimal('file_size', 15, 2)->nullable()->comment('Size in bytes');
            $table->string('version', 20)->notNull()->default('1.0');
            $table->boolean('is_latest')->default(true)->comment('Is this the latest version?');
            $table->foreignId('parent_document_id')->nullable()->constrained('documents', 'id')->onDelete('cascade')->comment('Parent document for versioning');
            $table->enum('status', ['draft', 'pending_approval', 'approved', 'rejected', 'archived'])->default('draft');
            $table->enum('visibility', ['public', 'private', 'internal', 'restricted'])->default('private');
            $table->date('effective_date')->nullable()->comment('When document becomes effective');
            $table->date('expiry_date')->nullable()->comment('When document expires');
            $table->json('access_permissions')->nullable()->comment('Role/department-based access');
            $table->json('metadata')->nullable()->comment('Custom metadata fields');
            $table->json('ocr_data')->nullable()->comment('Extracted text from OCR');
            $table->text('ocr_status')->nullable()->comment('pending, processing, completed, failed');
            $table->timestamp('ocr_processed_at')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->onDelete('set null');
            $table->foreignId('approved_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamp('approved_at')->nullable();
            $table->text('rejection_reason')->nullable();
            $table->timestamp('published_at')->nullable()->comment('When document was first published');
            $table->string('related_type', 100)->nullable()->comment('Polymorphic relation type');
            $table->unsignedBigInteger('related_id')->nullable()->comment('Polymorphic relation ID');
            $table->json('tags')->nullable()->comment('Document tags for search');
            $table->integer('view_count')->default(0);
            $table->integer('download_count')->default(0);
            $table->timestamp('last_accessed_at')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->unique(['org_id', 'document_number']);
            $table->unique(['org_id', 'parent_document_id', 'version'], 'docs_org_parent_ver_unq');
            $table->index(['document_type', 'category']);
            $table->index('status');
            $table->index('visibility');
            $table->index(['related_type', 'related_id']);
            $table->index(['parent_document_id', 'is_latest']);
            $table->index('created_at');
            $table->index('published_at');
        });

        Schema::create('document_versions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('document_id')->constrained('documents')->onDelete('cascade');
            $table->string('version', 20)->notNull();
            $table->string('file_name', 500)->notNull();
            $table->string('file_path', 500)->notNull();
            $table->string('file_hash', 64)->nullable()->comment('MD5 or SHA256 hash');
            $table->decimal('file_size', 15, 2)->nullable();
            $table->text('change_notes')->nullable()->comment('What changed in this version');
            $table->json('diff_data')->nullable()->comment('Detailed diff with previous version');
            $table->foreignId('created_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamps();

            $table->unique(['document_id', 'version']);
            $table->index(['document_id', 'version']);
        });

        Schema::create('document_approvals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('document_id')->constrained('documents')->onDelete('cascade');
            $table->foreignId('version_id')->nullable()->constrained('document_versions')->onDelete('set null');
            $table->foreignId('approver_id')->constrained('users')->onDelete('cascade');
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending');
            $table->text('comments')->nullable();
            $table->timestamp('reviewed_at')->nullable();
            $table->integer('sort_order')->default(0)->comment('Approval order');
            $table->timestamps();

            $table->index(['document_id', 'approver_id']);
            $table->index('status');
        });

        Schema::create('document_access_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('document_id')->constrained('documents')->onDelete('cascade');
            $table->foreignId('version_id')->nullable()->constrained('document_versions')->onDelete('set null');
            $table->foreignId('user_id')->nullable()->constrained('users')->onDelete('set null');
            $table->string('action', 50)->notNull()->comment('viewed, downloaded, edited, deleted, shared');
            $table->string('ip_address', 50)->nullable();
            $table->text('user_agent')->nullable();
            $table->json('additional_data')->nullable()->comment('Additional context about the action');
            $table->timestamp('accessed_at')->notNull();

            $table->index(['document_id', 'accessed_at']);
            $table->index('user_id');
            $table->index('action');
        });

        Schema::create('document_workflows', function (Blueprint $table) {
            $table->id();
            $table->foreignId('org_id')->constrained('organizations')->onDelete('cascade');
            $table->string('workflow_name', 200)->notNull();
            $table->string('workflow_type', 100)->notNull()->comment('document approval, review process');
            $table->text('description')->nullable();
            $table->json('workflow_steps')->notNull()->comment('Sequence of approval steps');
            $table->json('notification_settings')->nullable()->comment('Email/In-app notification settings');
            $table->json('routing_rules')->nullable()->comment('Conditions for routing');
            $table->boolean('is_active')->default(true);
            $table->foreignId('created_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamps();

            $table->index('org_id');
            $table->index('is_active');
        });

        Schema::create('document_workflow_executions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('document_id')->constrained('documents')->onDelete('cascade');
            $table->foreignId('workflow_id')->nullable()->constrained('document_workflows')->onDelete('set null');
            $table->foreignId('started_by')->nullable()->constrained('users')->onDelete('set null');
            $table->enum('status', ['in_progress', 'completed', 'cancelled', 'failed'])->default('in_progress');
            $table->json('current_step')->nullable()->comment('Current workflow step');
            $table->json('execution_data')->nullable()->comment('Workflow execution history');
            $table->timestamp('started_at')->notNull();
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();

            $table->index(['document_id', 'status']);
            $table->index('workflow_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('document_workflow_executions');
        Schema::dropIfExists('document_workflows');
        Schema::dropIfExists('document_access_logs');
        Schema::dropIfExists('document_approvals');
        Schema::dropIfExists('document_versions');
        Schema::dropIfExists('documents');
        Schema::dropIfExists('document_categories');
    }
};

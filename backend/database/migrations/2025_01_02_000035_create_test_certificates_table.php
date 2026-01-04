<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('test_certificates', function (Blueprint $table) {
            $table->id();
            $table->foreignId('org_id')->constrained('organizations')->onDelete('cascade');
            $table->foreignId('unit_id')->constrained('manufacturing_units')->onDelete('cascade');
            $table->string('certificate_number', 50)->notNull();
            $table->enum('certificate_type', ['raw_material', 'finished_product', 'batch', 'third_party', 'internal'])->notNull();
            $table->foreignId('material_id')->nullable()->constrained('raw_materials')->onDelete('set null');
            $table->foreignId('product_id')->nullable()->constrained('products')->onDelete('set null');
            $table->unsignedBigInteger('batch_id')->nullable();
            $table->foreignId('test_result_id')->nullable()->constrained()->onDelete('set null');
            $table->foreignId('customer_id')->nullable()->constrained('customers')->onDelete('set null');
            $table->string('po_reference', 100)->nullable();
            $table->date('issue_date')->nullable();
            $table->date('valid_until')->nullable();
            $table->string('certificate_template', 100)->nullable();
            $table->json('certificate_data')->nullable()->comment('Test results summary');
            $table->json('standards_followed')->nullable();
            $table->enum('overall_result', ['pass', 'fail', 'conditional'])->notNull();
            $table->text('remarks')->nullable();
            $table->foreignId('tested_by')->constrained('users')->onDelete('cascade');
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->onDelete('set null');
            $table->foreignId('approved_by')->nullable()->constrained('users')->onDelete('set null');
            $table->enum('approval_status', ['draft', 'pending_review', 'approved', 'rejected'])->default('draft');
            $table->string('signature_path', 500)->nullable();
            $table->string('stamp_path', 500)->nullable();
            $table->string('qr_code_data', 500)->nullable();
            $table->string('public_link', 500)->nullable();
            $table->boolean('public_access')->default(false);
            $table->boolean('password_protected')->default(false);
            $table->string('password', 255)->nullable();
            $table->enum('delivery_method', ['print', 'email', 'portal', 'whatsapp', 'all'])->default('portal');
            $table->enum('delivery_status', ['pending', 'sent', 'delivered', 'failed'])->default('pending');
            $table->timestamp('delivered_at')->nullable();
            $table->integer('view_count')->default(0);
            $table->integer('download_count')->default(0);
            $table->timestamps();
            $table->softDeletes();

            $table->unique(['org_id', 'certificate_number']);
            $table->index('certificate_type');
            $table->index('approval_status');
            $table->index('issue_date');
            $table->index('valid_until');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('test_certificates');
    }
};

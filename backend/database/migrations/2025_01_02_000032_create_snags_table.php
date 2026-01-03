<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('snags', function (Blueprint $table) {
            $table->id();
            $table->foreignId('org_id')->constrained('organizations')->onDelete('cascade');
            $table->foreignId('unit_id')->constrained('manufacturing_units')->onDelete('cascade');
            $table->string('snag_number', 50)->notNull();
            $table->enum('snag_type', ['quality', 'workmanship', 'material', 'safety', 'equipment', 'packaging', 'documentation'])->notNull();
            $table->enum('severity', ['minor', 'major', 'critical'])->notNull();
            $table->enum('priority', ['low', 'medium', 'high', 'urgent'])->default('medium');
            $table->string('title', 200)->notNull();
            $table->text('description')->nullable();
            $table->string('location', 200)->nullable();
            $table->foreignId('product_id')->nullable()->constrained('products')->onDelete('set null');
            $table->unsignedBigInteger('batch_id')->nullable();
            $table->foreignId('reported_by')->constrained('users')->onDelete('cascade');
            $table->timestamp('reported_date')->useCurrent();
            $table->foreignId('assigned_to')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamp('assigned_date')->nullable();
            $table->date('target_date')->nullable();
            $table->enum('status', ['open', 'in_progress', 'resolved', 'verified', 'closed', 'rejected'])->default('open');
            $table->text('root_cause')->nullable();
            $table->text('correction_action')->nullable();
            $table->text('preventive_action')->nullable();
            $table->json('photos_before')->nullable();
            $table->json('photos_after')->nullable();
            $table->foreignId('verification_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamp('verification_date')->nullable();
            $table->text('verification_notes')->nullable();
            $table->timestamp('closure_date')->nullable();
            $table->text('resolution_summary')->nullable();
            $table->decimal('cost_impact', 15, 2)->nullable();
            $table->decimal('time_impact_hours', 10, 2)->nullable();
            $table->json('attachments')->nullable();
            $table->timestamps();

            $table->unique(['org_id', 'unit_id', 'snag_number']);
            $table->index('status');
            $table->index('severity');
            $table->index('priority');
            $table->index('reported_date');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('snags');
    }
};

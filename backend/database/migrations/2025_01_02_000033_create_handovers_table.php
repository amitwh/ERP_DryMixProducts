<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('handovers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('org_id')->constrained('organizations')->onDelete('cascade');
            $table->foreignId('from_unit_id')->constrained('manufacturing_units')->onDelete('cascade');
            $table->foreignId('to_unit_id')->constrained('manufacturing_units')->onDelete('cascade');
            $table->string('handover_number', 50)->notNull();
            $table->enum('handover_type', ['project', 'batch', 'material', 'equipment', 'construction_site', 'phase'])->notNull();
            $table->string('title', 200)->notNull();
            $table->text('description')->nullable();
            $table->unsignedBigInteger('project_id')->nullable();
            $table->unsignedBigInteger('batch_id')->nullable();
            $table->foreignId('material_id')->nullable()->constrained('raw_materials')->onDelete('set null');
            $table->decimal('quantity', 15, 3)->nullable();
            $table->string('uom', 20)->nullable();
            $table->date('handover_date')->nullable();
            $table->time('handover_time')->nullable();
            $table->foreignId('from_responsible_person')->constrained('users')->onDelete('cascade');
            $table->foreignId('to_responsible_person')->constrained('users')->onDelete('cascade');
            $table->enum('status', ['planned', 'ready', 'in_progress', 'completed', 'rejected', 'cancelled'])->default('planned');
            $table->json('handover_checklist')->nullable();
            $table->json('acceptance_criteria')->nullable();
            $table->json('documents_bundle')->nullable()->comment('List of documents attached');
            $table->text('observations')->nullable();
            $table->text('notes')->nullable();
            $table->json('photos')->nullable();
            $table->string('from_signature_path', 500)->nullable();
            $table->string('to_signature_path', 500)->nullable();
            $table->timestamp('from_signed_at')->nullable();
            $table->timestamp('to_signed_at')->nullable();
            $table->boolean('accepted')->default(false);
            $table->timestamp('accepted_at')->nullable();
            $table->text('rejection_reason')->nullable();
            $table->text('post_handover_support')->nullable();
            $table->timestamps();

            $table->unique(['org_id', 'handover_number']);
            $table->index('status');
            $table->index('handover_date');
            $table->index(['from_unit_id', 'to_unit_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('handovers');
    }
};

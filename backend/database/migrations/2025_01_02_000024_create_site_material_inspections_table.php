<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('site_material_inspections', function (Blueprint $table) {
            $table->id();
            $table->foreignId('org_id')->constrained('organizations')->onDelete('cascade');
            $table->foreignId('project_id')->constrained('construction_projects')->onDelete('cascade');
            $table->foreignId('activity_id')->nullable()->constrained('construction_activities')->onDelete('cascade');
            $table->string('inspection_number', 50)->notNull();
            $table->date('inspection_date')->notNull();
            $table->foreignId('material_id')->nullable()->constrained('raw_materials')->onDelete('set null');
            $table->string('material_name', 200)->nullable();
            $table->string('batch_number', 100)->nullable();
            $table->foreignId('supplier_id')->nullable()->constrained('suppliers')->onDelete('set null');
            $table->string('delivery_challan_number', 100)->nullable();
            $table->decimal('quantity_delivered', 15, 3)->nullable();
            $table->string('uom', 20)->nullable();
            $table->boolean('sample_taken')->default(false);
            $table->string('sample_number', 50)->nullable();
            $table->boolean('sample_tested')->default(false);
            $table->foreignId('test_result_id')->nullable()->constrained('raw_material_tests')->onDelete('set null');
            $table->json('inspection_data')->nullable()->comment('Visual inspection parameters');
            $table->enum('condition', ['satisfactory', 'acceptable', 'unsatisfactory', 'requires_test'])->default('satisfactory');
            $table->text('visual_defects')->nullable();
            $table->boolean('dimensions_checked')->default(false);
            $table->json('dimensional_results')->nullable();
            $table->text('storage_conditions')->nullable();
            $table->text('recommendations')->nullable();
            $table->foreignId('inspected_by')->constrained('users')->onDelete('cascade');
            $table->foreignId('site_engineer_id')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamps();

            $table->unique(['org_id', 'project_id', 'inspection_number']);
            $table->index(['material_id', 'inspection_date']);
            $table->index('activity_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('site_material_inspections');
    }
};

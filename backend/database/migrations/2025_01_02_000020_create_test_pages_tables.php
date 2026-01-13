<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Dry Mix Product Tests
        Schema::create('dry_mix_product_tests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organization_id')->constrained()->onDelete('cascade');
            $table->foreignId('manufacturing_unit_id')->constrained()->onDelete('cascade');
            $table->foreignId('product_id')->constrained()->onDelete('cascade');
            $table->foreignId('batch_id')->nullable()->constrained('production_batches')->onDelete('set null');
            $table->string('test_number')->unique();
            $table->date('test_date');
            $table->string('sample_id')->nullable();

            // Test Parameters
            $table->decimal('compressive_strength_1_day', 10, 2)->nullable();
            $table->decimal('compressive_strength_3_day', 10, 2)->nullable();
            $table->decimal('compressive_strength_7_day', 10, 2)->nullable();
            $table->decimal('compressive_strength_28_day', 10, 2)->nullable();

            $table->decimal('flexural_strength', 10, 2)->nullable();
            $table->decimal('adhesion_strength', 10, 2)->nullable();

            $table->decimal('setting_time_initial', 10, 2)->nullable();
            $table->decimal('setting_time_final', 10, 2)->nullable();

            $table->decimal('water_demand', 10, 2)->nullable(); // %
            $table->decimal('water_retention', 10, 2)->nullable(); // %

            $table->decimal('flow_diameter', 10, 2)->nullable(); // mm

            $table->decimal('bulk_density', 10, 2)->nullable(); // kg/m³
            $table->decimal('air_content', 10, 2)->nullable(); // %

            $table->decimal('shelf_life', 10, 2)->nullable(); // months

            // Quality Parameters
            $table->string('color')->nullable();
            $table->string('texture')->nullable();
            $table->text('appearance_notes')->nullable();

            // Results
            $table->enum('test_result', ['pending', 'pass', 'fail', 'marginal'])->default('pending');
            $table->enum('status', ['pending', 'in_progress', 'completed', 'cancelled'])->default('pending');
            $table->text('remarks')->nullable();
            $table->text('recommendations')->nullable();

            // Compliance
            $table->boolean('meets_standard')->nullable();
            $table->string('standard_reference')->nullable(); // IS, ASTM, EN, etc.
            $table->json('standard_limits')->nullable(); // Limits for each parameter

            // Approval
            $table->foreignId('tested_by')->nullable();
            $table->foreignId('verified_by')->nullable();
            $table->foreignId('approved_by')->nullable();
            $table->timestamp('tested_at')->nullable();
            $table->timestamp('verified_at')->nullable();
            $table->timestamp('approved_at')->nullable();

            $table->foreignId('created_by')->nullable();
            $table->timestamps();

            $table->index(['organization_id', 'test_date']);
            $table->index('product_id');
            $table->index('batch_id');
            $table->index('status');
            $table->index('test_result');
        });

        // Raw Material Tests
        Schema::create('raw_material_tests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organization_id')->constrained()->onDelete('cascade');
            $table->foreignId('manufacturing_unit_id')->constrained()->onDelete('cascade');
            $table->foreignId('raw_material_id')->constrained('products')->onDelete('cascade');
            $table->foreignId('supplier_batch_id')->nullable();
            $table->string('test_number')->unique();
            $table->date('test_date');
            $table->string('sample_id')->nullable();

            // Chemical Analysis
            $table->decimal('sio2', 10, 2)->nullable(); // Silicon Dioxide %
            $table->decimal('al2o3', 10, 2)->nullable(); // Aluminum Oxide %
            $table->decimal('fe2o3', 10, 2)->nullable(); // Iron Oxide %
            $table->decimal('cao', 10, 2)->nullable(); // Calcium Oxide %
            $table->decimal('mgo', 10, 2)->nullable(); // Magnesium Oxide %
            $table->decimal('so3', 10, 2)->nullable(); // Sulfur Trioxide %
            $table->decimal('k2o', 10, 2)->nullable(); // Potassium Oxide %
            $table->decimal('na2o', 10, 2)->nullable(); // Sodium Oxide %
            $table->decimal('cl', 10, 2)->nullable(); // Chloride %

            // Physical Properties
            $table->decimal('moisture_content', 10, 2)->nullable(); // %
            $table->decimal('loss_on_ignition', 10, 2)->nullable(); // %
            $table->decimal('specific_gravity', 10, 3)->nullable();
            $table->decimal('bulk_density', 10, 2)->nullable(); // kg/m³

            // Particle Size Analysis
            $table->decimal('particle_size_d50', 10, 3)->nullable(); // µm
            $table->decimal('particle_size_d90', 10, 3)->nullable(); // µm
            $table->decimal('particle_size_d98', 10, 3)->nullable(); // µm
            $table->decimal('blaine_fineness', 10, 2)->nullable(); // m²/kg

            // Functional Properties (depending on material type)
            $table->decimal('water_reducer', 10, 2)->nullable(); // %
            $table->decimal('retention_aid', 10, 2)->nullable(); // %
            $table->decimal('defoamer', 10, 2)->nullable(); // %

            // Polymer Properties (if applicable)
            $table->decimal('solid_content', 10, 2)->nullable(); // %
            $table->decimal('viscosity', 10, 2)->nullable(); // mPa·s
            $table->decimal('ph_value', 10, 2)->nullable();
            $table->decimal('minimum_film_forming_temperature', 10, 2)->nullable(); // °C

            // Aggregate Properties (if applicable)
            $table->decimal('fineness_modulus', 10, 2)->nullable();
            $table->decimal('water_absorption', 10, 2)->nullable(); // %
            $table->decimal('silt_content', 10, 2)->nullable(); // %
            $table->decimal('organic_impurities', 10, 2)->nullable(); // %

            // Results
            $table->enum('test_result', ['pending', 'pass', 'fail', 'marginal'])->default('pending');
            $table->enum('status', ['pending', 'in_progress', 'completed', 'cancelled'])->default('pending');
            $table->text('remarks')->nullable();
            $table->text('recommendations')->nullable();

            // Compliance
            $table->boolean('meets_standard')->nullable();
            $table->string('standard_reference')->nullable(); // IS, ASTM, EN, etc.
            $table->json('standard_limits')->nullable(); // Limits for each parameter

            // Approval
            $table->foreignId('tested_by')->nullable();
            $table->foreignId('verified_by')->nullable();
            $table->foreignId('approved_by')->nullable();
            $table->timestamp('tested_at')->nullable();
            $table->timestamp('verified_at')->nullable();
            $table->timestamp('approved_at')->nullable();

            $table->foreignId('created_by')->nullable();
            $table->timestamps();

            $table->index(['organization_id', 'test_date']);
            $table->index('raw_material_id');
            $table->index('status');
            $table->index('test_result');
        });

        // Test Parameters Configuration
        Schema::create('test_parameters', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organization_id')->constrained()->onDelete('cascade');
            $table->string('parameter_code')->unique();
            $table->string('parameter_name');
            $table->enum('test_type', ['dry_mix_product', 'raw_material']);
            $table->string('parameter_category'); // mechanical, chemical, physical, functional
            $table->string('unit');
            $table->decimal('min_value', 10, 2)->nullable();
            $table->decimal('max_value', 10, 2)->nullable();
            $table->decimal('target_value', 10, 2)->nullable();
            $table->boolean('is_mandatory')->default(true);
            $table->integer('display_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['organization_id', 'test_type', 'is_active'], 'test_params_org_type_active_idx');
        });

        // Test Standards
        Schema::create('test_standards', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organization_id')->constrained()->onDelete('cascade');
            $table->string('standard_code')->unique(); // IS:1542, ASTM C618, etc.
            $table->string('standard_name');
            $table->enum('test_type', ['dry_mix_product', 'raw_material']);
            $table->string('issuing_body'); // IS, ASTM, EN, JIS, etc.
            $table->date('effective_date')->nullable();
            $table->boolean('is_current')->default(true);
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index(['organization_id', 'test_type', 'is_active'], 'test_stds_org_type_active_idx');
        });

        // Test Templates
        Schema::create('test_templates', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organization_id')->constrained()->onDelete('cascade');
            $table->string('template_code')->unique();
            $table->string('template_name');
            $table->enum('test_type', ['dry_mix_product', 'raw_material']);
            $table->foreignId('product_id')->nullable(); // NULL if template is for all products
            $table->json('selected_parameters'); // Array of parameter IDs
            $table->json('parameter_limits')->nullable(); // Custom limits for this template
            $table->text('instructions')->nullable();
            $table->foreignId('standard_id')->nullable()->constrained('test_standards');
            $table->boolean('is_default')->default(false);
            $table->boolean('is_active')->default(true);
            $table->foreignId('created_by')->nullable();
            $table->timestamps();

            $table->index(['organization_id', 'test_type', 'is_active'], 'test_tpls_org_type_active_idx');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('test_templates');
        Schema::dropIfExists('test_standards');
        Schema::dropIfExists('test_parameters');
        Schema::dropIfExists('raw_material_tests');
        Schema::dropIfExists('dry_mix_product_tests');
    }
};

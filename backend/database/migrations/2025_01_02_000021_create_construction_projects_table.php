<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('construction_projects', function (Blueprint $table) {
            $table->id();
            $table->foreignId('org_id')->constrained('organizations')->onDelete('cascade');
            $table->foreignId('customer_id')->constrained()->onDelete('cascade');
            $table->string('project_code', 50)->notNull();
            $table->string('project_name', 200)->notNull();
            $table->enum('project_type', ['residential', 'commercial', 'industrial', 'infrastructure', 'renovation'])->notNull();
            $table->text('project_address')->nullable();
            $table->string('city', 100)->nullable();
            $table->string('state', 100)->nullable();
            $table->string('country', 100)->nullable();
            $table->string('pincode', 20)->nullable();
            $table->decimal('latitude', 10, 6)->nullable();
            $table->decimal('longitude', 10, 6)->nullable();
            $table->decimal('contract_value', 15, 2)->nullable();
            $table->string('currency', 10)->default('INR');
            $table->date('start_date')->nullable();
            $table->date('estimated_end_date')->nullable();
            $table->date('actual_end_date')->nullable();
            $table->enum('project_status', ['planning', 'in_progress', 'on_hold', 'completed', 'cancelled'])->default('planning');
            $table->foreignId('project_manager_id')->nullable()->constrained('users')->onDelete('set null');
            $table->foreignId('site_engineer_id')->nullable()->constrained('users')->onDelete('set null');
            $table->foreignId('qc_manager_id')->nullable()->constrained('users')->onDelete('set null');
            $table->foreignId('safety_officer_id')->nullable()->constrained('users')->onDelete('set null');
            $table->text('description')->nullable();
            $table->json('specifications')->nullable();
            $table->json('contract_documents')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->unique(['org_id', 'project_code']);
            $table->index('project_status');
            $table->index(['start_date', 'estimated_end_date']);
            $table->index('customer_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('construction_projects');
    }
};

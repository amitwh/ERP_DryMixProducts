<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('daily_site_reports', function (Blueprint $table) {
            $table->id();
            $table->foreignId('org_id')->constrained('organizations')->onDelete('cascade');
            $table->foreignId('project_id')->constrained('construction_projects')->onDelete('cascade');
            $table->date('report_date')->notNull();
            $table->string('report_number', 50)->notNull();
            $table->string('weather_conditions', 200)->nullable();
            $table->decimal('max_temp', 6, 2)->nullable();
            $table->decimal('min_temp', 6, 2)->nullable();
            $table->decimal('rainfall_mm', 6, 2)->nullable();
            $table->decimal('humidity_percent', 5, 2)->nullable();
            $table->string('wind_conditions', 100)->nullable();
            $table->text('overall_progress')->nullable();
            $table->text('key_achievements')->nullable();
            $table->text('challenges_issues')->nullable();
            $table->json('activities_completed')->nullable();
            $table->json('activities_in_progress')->nullable();
            $table->json('activities_planned')->nullable();
            $table->json('manpower_on_site')->nullable();
            $table->json('equipment_on_site')->nullable();
            $table->json('materials_delivered')->nullable();
            $table->json('materials_consumed')->nullable();
            $table->json('inspections_conducted')->nullable();
            $table->json('tests_conducted')->nullable();
            $table->json('safety_incidents')->nullable();
            $table->text('delays')->nullable();
            $table->json('approvals_obtained')->nullable();
            $table->json('photos')->nullable();
            $table->text('next_day_plan')->nullable();
            $table->foreignId('prepared_by')->constrained('users')->onDelete('cascade');
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamps();

            $table->unique(['org_id', 'project_id', 'report_date']);
            $table->index('report_date');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('daily_site_reports');
    }
};

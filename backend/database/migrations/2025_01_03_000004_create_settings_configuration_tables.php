<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // system_settings table already exists from 2025_01_02_000013 migration
        // Skip creating it again

        Schema::create('feature_toggles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('org_id')->nullable()->constrained('organizations')->onDelete('cascade');
            $table->string('feature_name', 100)->notNull()->unique()->comment('Feature identifier');
            $table->string('display_name', 200)->notNull()->comment('Human-readable name');
            $table->text('description')->nullable()->comment('Feature description');
            $table->boolean('is_enabled')->default(false)->comment('Is feature enabled?');
            $table->boolean('is_beta')->default(false)->comment('Is this in beta?');
            $table->boolean('is_global')->default(true)->comment('Is this global or org-specific?');
            $table->json('feature_config')->nullable()->comment('Additional configuration');
            $table->date('enabled_date')->nullable()->comment('When feature was enabled');
            $table->date('disabled_date')->nullable()->comment('When feature was disabled');
            $table->foreignId('enabled_by')->nullable()->constrained('users')->onDelete('set null');
            $table->string('version', 20)->nullable()->comment('Feature version');
            $table->timestamps();

            $table->index(['org_id', 'feature_name']);
            $table->index('is_enabled');
        });

        Schema::create('module_configurations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('org_id')->nullable()->constrained('organizations')->onDelete('cascade');
            $table->string('module_name', 100)->notNull()->comment('Module identifier');
            $table->string('module_type', 50)->notNull()->comment('core, add-on, integration');
            $table->string('module_version', 20)->nullable()->comment('Installed version');
            $table->boolean('is_enabled')->default(true)->comment('Is module enabled?');
            $table->boolean('is_required')->default(false)->comment('Is this module required?');
            $table->json('module_settings')->nullable()->comment('Module-specific configuration');
            $table->json('permissions')->nullable()->comment('Module permissions required');
            $table->date('installed_date')->nullable();
            $table->date('uninstalled_date')->nullable();
            $table->json('dependencies')->nullable()->comment('Module dependencies');
            $table->text('notes')->nullable()->comment('Installation notes');
            $table->foreignId('installed_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamps();

            $table->unique(['org_id', 'module_name']);
            $table->index('is_enabled');
            $table->index('module_type');
        });

        Schema::create('theme_settings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('org_id')->nullable()->constrained('organizations')->onDelete('cascade');
            $table->foreignId('user_id')->nullable()->constrained('users')->onDelete('cascade');
            $table->enum('theme_type', ['light', 'dark', 'auto'])->default('light');
            $table->string('primary_color', 7)->default('#3B82F6')->comment('Hex color code');
            $table->string('secondary_color', 7)->default('#6B7280');
            $table->string('accent_color', 7)->default('#10B981');
            $table->string('background_color', 7)->default('#F9FAFB');
            $table->string('text_color', 7)->default('#1F2937');
            $table->string('border_color', 7)->default('#E5E7EB');
            $table->json('font_settings')->nullable()->comment('Font family, size, etc.');
            $table->json('custom_css')->nullable()->comment('Custom CSS rules');
            $table->json('logo_settings')->nullable()->comment('Logo URL, size, position');
            $table->json('branding_settings')->nullable()->comment('Company name, tagline, etc.');
            $table->boolean('is_default')->default(false)->comment('Is this default theme?');
            $table->foreignId('created_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamps();

            $table->index(['org_id', 'user_id']);
            $table->index('is_default');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('theme_settings');
        Schema::dropIfExists('module_configurations');
        Schema::dropIfExists('feature_toggles');
        // system_settings is managed by 2025_01_02_000013 migration
    }
};

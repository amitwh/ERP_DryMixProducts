<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('system_settings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('org_id')->nullable()->constrained('organizations')->onDelete('cascade');
            $table->foreignId('unit_id')->nullable()->constrained('manufacturing_units')->onDelete('cascade');
            $table->string('setting_key', 100)->notNull();
            $table->text('setting_value')->nullable();
            $table->string('setting_type', 50)->default('string')->comment('string, integer, boolean, json, file');
            $table->string('category', 50)->nullable()->comment('general, security, notification, ui, integration');
            $table->string('display_name', 200)->nullable();
            $table->text('description')->nullable();
            $table->boolean('is_public')->default(false)->comment('Whether setting is accessible to all users');
            $table->boolean('is_editable')->default(true);
            $table->json('validation_rules')->nullable()->comment('Validation rules for the setting');
            $table->json('options')->nullable()->comment('Available options for select type');
            $table->foreignId('created_by')->nullable()->constrained('users')->onDelete('set null');
            $table->foreignId('updated_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamps();

            $table->unique(['org_id', 'setting_key']);
            $table->index('category');
            $table->index('setting_key');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('system_settings');
    }
};

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('roles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('org_id')->constrained('organizations')->onDelete('cascade');
            $table->string('role_code', 50)->unique();
            $table->string('role_name', 100)->notNull();
            $table->text('description')->nullable();
            $table->boolean('is_system_role')->default(false);
            $table->boolean('is_active')->default(true);
            $table->json('permissions')->nullable()->comment('Array of permission codes');
            $table->timestamps();
            $table->softDeletes();

            $table->unique(['org_id', 'role_code']);
            $table->index('org_id');
            $table->index('role_code');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('roles');
    }
};

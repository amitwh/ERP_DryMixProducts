<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('permissions', function (Blueprint $table) {
            $table->id();
            $table->string('module_code', 50)->notNull();
            $table->string('permission_code', 100)->notNull();
            $table->string('permission_name', 200)->notNull();
            $table->text('description')->nullable();
            $table->enum('action_type', ['create', 'read', 'update', 'delete', 'export', 'import', 'approve', 'reject'])->default('read');
            $table->json('metadata')->nullable()->comment('Additional permission metadata');
            $table->timestamps();

            $table->unique(['module_code', 'permission_code']);
            $table->index('module_code');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('permissions');
    }
};

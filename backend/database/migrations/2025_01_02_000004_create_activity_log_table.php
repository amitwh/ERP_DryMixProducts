<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('activity_log', function (Blueprint $table) {
            $table->id();
            $table->foreignId('org_id')->constrained('organizations')->onDelete('cascade');
            $table->foreignId('user_id')->nullable()->constrained('users')->onDelete('set null');
            $table->string('action', 50)->notNull();
            $table->string('module', 50)->nullable();
            $table->string('record_type', 50)->nullable();
            $table->unsignedBigInteger('record_id')->nullable();
            $table->json('details')->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->timestamp('created_at')->useCurrent();

            $table->index('action');
            $table->index('module');
            $table->index(['user_id', 'created_at']);
            $table->index(['org_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('activity_log');
    }
};

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Security fields - added without 'after' to avoid column reference issues
            $table->timestamp('password_changed_at')->nullable()->after('email');
            $table->boolean('mfa_enabled')->default(false);
            $table->string('mfa_secret', 255)->nullable();
            $table->timestamp('mfa_enabled_at')->nullable();
            $table->json('trusted_devices')->nullable();
            $table->unsignedInteger('failed_login_attempts')->default(0);
            $table->timestamp('last_login')->nullable();
            $table->boolean('is_locked')->default(false);
            $table->timestamp('locked_until')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'last_login',
                'failed_login_attempts',
                'password_changed_at',
                'mfa_enabled',
                'mfa_secret',
                'mfa_enabled_at',
                'trusted_devices',
                'is_locked',
                'locked_until'
            ]);
        });
    }
};

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->timestamp('last_login')->nullable()->after('failed_login_attempts');
            $table->unsignedInteger('failed_login_attempts')->default(0)->after('password_changed_at');
            $table->timestamp('password_changed_at')->nullable()->after('email');
            $table->boolean('mfa_enabled')->default(false)->after('password_changed_at');
            $table->string('mfa_secret', 255)->nullable()->after('mfa_enabled');
            $table->timestamp('mfa_enabled_at')->nullable()->after('mfa_secret');
            $table->json('trusted_devices')->nullable()->after('mfa_enabled_at');
            $table->boolean('is_locked')->default(false)->after('failed_login_attempts');
            $table->timestamp('locked_until')->nullable()->after('is_locked');
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

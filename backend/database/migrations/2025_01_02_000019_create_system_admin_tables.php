<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Module Management
        Schema::create('modules', function (Blueprint $table) {
            $table->id();
            $table->string('module_code')->unique();
            $table->string('module_name');
            $table->string('module_description')->nullable();
            $table->string('version')->default('1.0.0');
            $table->boolean('is_core')->default(true);
            $table->boolean('is_active')->default(true);
            $table->string('icon')->nullable();
            $table->integer('display_order')->default(0);
            $table->json('permissions')->nullable();
            $table->json('menu_items')->nullable();
            $table->timestamps();

            $table->index('module_code');
            $table->index('is_active');
        });

        // Organization Modules
        Schema::create('organization_modules', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organization_id')->constrained()->onDelete('cascade');
            $table->foreignId('module_id')->constrained()->onDelete('cascade');
            $table->boolean('is_enabled')->default(true);
            $table->date('subscription_start')->nullable();
            $table->date('subscription_end')->nullable();
            $table->json('feature_flags')->nullable();
            $table->text('configuration')->nullable();
            $table->timestamps();

            $table->unique(['organization_id', 'module_id']);
            $table->index(['organization_id', 'is_enabled']);
        });

        // API Keys
        Schema::create('api_keys', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organization_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('cascade');
            $table->string('api_key')->unique();
            $table->string('name');
            $table->text('description')->nullable();
            $table->json('permissions')->nullable();
            $table->json('allowed_ips')->nullable();
            $table->json('rate_limits')->nullable();
            $table->date('expires_at')->nullable();
            $table->dateTime('last_used_at')->nullable();
            $table->integer('usage_count')->default(0);
            $table->boolean('is_active')->default(true);
            $table->boolean('is_revoked')->default(false);
            $table->foreignId('created_by')->nullable();
            $table->timestamps();

            $table->index('api_key');
            $table->index(['organization_id', 'is_active']);
        });

        // API Logs
        Schema::create('api_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organization_id')->nullable()->constrained()->onDelete('set null');
            $table->foreignId('api_key_id')->nullable()->constrained()->onDelete('set null');
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('set null');
            $table->string('method');
            $table->string('endpoint');
            $table->text('request_headers')->nullable();
            $table->text('request_body')->nullable();
            $table->integer('response_status')->nullable();
            $table->text('response_headers')->nullable();
            $table->text('response_body')->nullable();
            $table->integer('response_time_ms')->default(0);
            $table->string('ip_address')->nullable();
            $table->string('user_agent')->nullable();
            $table->dateTime('requested_at');
            $table->timestamps();

            $table->index(['organization_id', 'requested_at']);
            $table->index('api_key_id');
            $table->index('response_status');
            $table->index('endpoint');
        });

        // System Logs
        Schema::create('system_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organization_id')->nullable()->constrained()->onDelete('set null');
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('set null');
            $table->enum('log_level', ['emergency', 'alert', 'critical', 'error', 'warning', 'notice', 'info', 'debug'])->default('info');
            $table->string('channel')->default('app');
            $table->text('message');
            $table->json('context')->nullable();
            $table->text('exception_trace')->nullable();
            $table->string('request_id')->nullable();
            $table->dateTime('logged_at');
            $table->timestamps();

            $table->index(['organization_id', 'logged_at']);
            $table->index('log_level');
            $table->index('channel');
        });

        // System Backups
        Schema::create('system_backups', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organization_id')->nullable()->constrained()->onDelete('set null');
            $table->string('backup_name');
            $table->enum('backup_type', ['full', 'incremental', 'manual', 'scheduled'])->default('manual');
            $table->decimal('size_mb', 10, 2)->default(0);
            $table->enum('status', ['pending', 'in_progress', 'completed', 'failed'])->default('pending');
            $table->string('file_path')->nullable();
            $table->string('storage_type')->default('local');
            $table->json('included_tables')->nullable();
            $table->dateTime('started_at')->nullable();
            $table->dateTime('completed_at')->nullable();
            $table->text('error_message')->nullable();
            $table->boolean('is_restorable')->default(true);
            $table->foreignId('created_by')->nullable();
            $table->timestamps();

            $table->index(['organization_id', 'status']);
            $table->index('backup_type');
        });

        // Scheduled Tasks
        Schema::create('scheduled_tasks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organization_id')->nullable()->constrained()->onDelete('set null');
            $table->string('task_name');
            $table->string('task_type'); // backup, report, email, sync, etc.
            $table->text('command')->nullable();
            $table->json('parameters')->nullable();
            $table->string('schedule_expression'); // cron expression
            $table->enum('frequency', ['once', 'daily', 'weekly', 'monthly', 'custom'])->default('daily');
            $table->dateTime('next_run_at');
            $table->dateTime('last_run_at')->nullable();
            $table->dateTime('last_success_at')->nullable();
            $table->integer('run_count')->default(0);
            $table->integer('success_count')->default(0);
            $table->integer('failure_count')->default(0);
            $table->text('last_error')->nullable();
            $table->enum('status', ['active', 'paused', 'disabled'])->default('active');
            $table->boolean('is_running')->default(false);
            $table->boolean('notify_on_failure')->default(true);
            $table->json('notification_recipients')->nullable();
            $table->foreignId('created_by')->nullable();
            $table->timestamps();

            $table->index(['organization_id', 'status']);
            $table->index('next_run_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('scheduled_tasks');
        Schema::dropIfExists('system_backups');
        Schema::dropIfExists('system_logs');
        Schema::dropIfExists('api_logs');
        Schema::dropIfExists('api_keys');
        Schema::dropIfExists('organization_modules');
        Schema::dropIfExists('modules');
    }
};

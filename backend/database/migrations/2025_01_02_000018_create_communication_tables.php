<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Communication Templates
        Schema::create('communication_templates', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organization_id')->constrained()->onDelete('cascade');
            $table->string('template_code')->unique();
            $table->string('template_name');
            $table->enum('channel', ['email', 'sms', 'whatsapp', 'push', 'in_app']);
            $table->string('subject')->nullable();
            $table->text('body');
            $table->json('variables')->nullable(); // Available variables like {customer_name}, {invoice_number}, etc.
            $table->enum('template_type', ['invoice', 'payment_reminder', 'order_confirmation', 'delivery_update', 'welcome', 'notification', 'alert'])->default('notification');
            $table->boolean('is_active')->default(true);
            $table->foreignId('created_by')->nullable();
            $table->timestamps();

            $table->index(['organization_id', 'channel']);
            $table->index('template_type');
        });

        // Communication Logs
        Schema::create('communication_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organization_id')->constrained()->onDelete('cascade');
            $table->foreignId('template_id')->nullable()->constrained('communication_templates')->onDelete('set null');
            $table->enum('channel', ['email', 'sms', 'whatsapp', 'push', 'in_app']);
            $table->string('message_type');
            $table->foreignId('recipient_id')->nullable();
            $table->enum('recipient_type', ['customer', 'supplier', 'employee', 'user', 'other'])->nullable();
            $table->string('recipient_email')->nullable();
            $table->string('recipient_phone')->nullable();
            $table->string('recipient_whatsapp')->nullable();
            $table->string('subject')->nullable();
            $table->text('body');
            $table->json('attachments')->nullable();
            $table->enum('status', ['queued', 'sent', 'delivered', 'failed', 'cancelled'])->default('queued');
            $table->dateTime('sent_at')->nullable();
            $table->dateTime('delivered_at')->nullable();
            $table->string('message_id')->nullable(); // External ID from service provider
            $table->text('error_message')->nullable();
            $table->integer('retry_count')->default(0);
            $table->text('response_data')->nullable();
            $table->foreignId('reference_id')->nullable(); // ID of related record (invoice, order, etc.)
            $table->string('reference_type')->nullable(); // Type of reference record
            $table->foreignId('created_by')->nullable();
            $table->timestamps();

            $table->index(['organization_id', 'channel', 'status'], 'comm_logs_org_chan_stat_idx');
            $table->index('recipient_type');
            $table->index('reference_type');
            $table->index('created_at');
        });

        // WhatsApp Specific
        Schema::create('whatsapp_messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('communication_log_id')->constrained()->onDelete('cascade');
            $table->string('wa_message_id')->unique(); // WhatsApp Business API message ID
            $table->string('phone_number');
            $table->text('message_content');
            $table->enum('status', ['sent', 'delivered', 'read', 'failed']);
            $table->dateTime('sent_at')->nullable();
            $table->dateTime('delivered_at')->nullable();
            $table->dateTime('read_at')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();

            $table->index('wa_message_id');
            $table->index('phone_number');
        });

        // Email Specific
        Schema::create('email_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('communication_log_id')->constrained()->onDelete('cascade');
            $table->string('message_id')->unique();
            $table->string('to_email');
            $table->string('from_email');
            $table->string('cc_emails')->nullable();
            $table->string('bcc_emails')->nullable();
            $table->string('subject');
            $table->text('body');
            $table->text('html_body')->nullable();
            $table->json('attachments')->nullable();
            $table->enum('status', ['queued', 'sent', 'delivered', 'opened', 'clicked', 'failed', 'bounced']);
            $table->dateTime('sent_at')->nullable();
            $table->dateTime('opened_at')->nullable();
            $table->dateTime('clicked_at')->nullable();
            $table->integer('open_count')->default(0);
            $table->integer('click_count')->default(0);
            $table->text('error_message')->nullable();
            $table->string('bounce_reason')->nullable();
            $table->timestamps();

            $table->index('message_id');
            $table->index('to_email');
            $table->index('status');
        });

        // SMS Specific
        Schema::create('sms_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('communication_log_id')->constrained()->onDelete('cascade');
            $table->string('sms_id')->unique();
            $table->string('phone_number');
            $table->text('message');
            $table->enum('status', ['queued', 'sent', 'delivered', 'failed']);
            $table->integer('segments')->default(1);
            $table->dateTime('sent_at')->nullable();
            $table->dateTime('delivered_at')->nullable();
            $table->text('error_message')->nullable();
            $table->decimal('cost', 10, 4)->default(0);
            $table->string('provider')->nullable();
            $table->timestamps();

            $table->index('sms_id');
            $table->index('phone_number');
        });

        // Notification Preferences
        Schema::create('notification_preferences', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organization_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('cascade');
            $table->foreignId('customer_id')->nullable()->constrained()->onDelete('cascade');
            $table->foreignId('employee_id')->nullable()->constrained()->onDelete('cascade');
            $table->enum('entity_type', ['user', 'customer', 'employee']);
            $table->json('preferences'); // { "invoice": ["email", "sms"], "payment_reminder": ["whatsapp"] }
            $table->boolean('enable_notifications')->default(true);
            $table->time('quiet_hours_start')->nullable();
            $table->time('quiet_hours_end')->nullable();
            $table->timestamps();

            $table->index(['organization_id', 'entity_type']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notification_preferences');
        Schema::dropIfExists('sms_logs');
        Schema::dropIfExists('email_logs');
        Schema::dropIfExists('whatsapp_messages');
        Schema::dropIfExists('communication_logs');
        Schema::dropIfExists('communication_templates');
    }
};

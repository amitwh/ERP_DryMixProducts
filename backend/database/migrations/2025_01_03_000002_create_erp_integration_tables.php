<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('erp_integrations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('org_id')->constrained('organizations')->onDelete('cascade');
            $table->string('integration_name', 100)->notNull()->comment('e.g., SAP, Oracle, QuickBooks');
            $table->string('integration_type', 50)->notNull()->comment('accounting, crm, inventory, hr');
            $table->string('integration_provider', 100)->notNull()->comment('sage, netsuite, xero, quickbooks, sap');
            $table->string('api_endpoint', 500)->nullable()->comment('API base URL');
            $table->string('api_key', 255)->nullable()->comment('API key or token');
            $table->text('api_secret')->nullable()->comment('API secret or client secret');
            $table->string('access_token', 500)->nullable()->comment('OAuth access token');
            $table->string('refresh_token', 500)->nullable()->comment('OAuth refresh token');
            $table->timestamp('token_expires_at')->nullable()->comment('OAuth token expiry');
            $table->json('connection_settings')->nullable()->comment('Additional connection parameters');
            $table->json('sync_settings')->nullable()->comment('Sync configuration');
            $table->json('field_mappings')->nullable()->comment('Field mapping between systems');
            $table->enum('sync_frequency', ['manual', 'hourly', 'daily', 'weekly', 'realtime'])->default('daily');
            $table->time('sync_time')->nullable()->comment('Scheduled sync time');
            $table->timestamp('last_sync_at')->nullable();
            $table->timestamp('next_sync_at')->nullable();
            $table->enum('sync_status', ['idle', 'syncing', 'success', 'failed', 'paused'])->default('idle');
            $table->text('last_sync_error')->nullable()->comment('Last sync error message');
            $table->json('sync_statistics')->nullable()->comment('Records synced, failed, etc.');
            $table->boolean('is_active')->default(false);
            $table->boolean('is_auto_sync')->default(true);
            $table->foreignId('created_by')->nullable()->constrained('users')->onDelete('set null');
            $table->foreignId('updated_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamps();
            $table->softDeletes();

            $table->unique(['org_id', 'integration_name']);
            $table->index('is_active');
            $table->index('sync_status');
            $table->index('next_sync_at');
        });

        Schema::create('erp_sync_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('integration_id')->constrained('erp_integrations')->onDelete('cascade');
            $table->string('sync_type', 50)->notNull()->comment('full, incremental, entity');
            $table->string('entity_type', 100)->nullable()->comment('products, customers, orders, etc.');
            $table->enum('direction', ['inbound', 'outbound', 'bidirectional'])->default('bidirectional');
            $table->timestamp('started_at')->notNull();
            $table->timestamp('completed_at')->nullable();
            $table->enum('status', ['in_progress', 'completed', 'failed', 'cancelled'])->default('in_progress');
            $table->integer('records_processed')->default(0)->comment('Total records attempted');
            $table->integer('records_success')->default(0)->comment('Successfully synced');
            $table->integer('records_failed')->default(0)->comment('Failed records');
            $table->json('failed_records')->nullable()->comment('Details of failed records');
            $table->text('error_message')->nullable();
            $table->json('sync_data')->nullable()->comment('Request/response data samples');
            $table->decimal('duration_seconds', 10, 2)->nullable()->comment('Sync duration in seconds');
            $table->json('summary')->nullable()->comment('Sync summary statistics');
            $table->timestamps();

            $table->index(['integration_id', 'started_at']);
            $table->index('status');
            $table->index('entity_type');
        });

        Schema::create('erp_field_mappings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('integration_id')->constrained('erp_integrations')->onDelete('cascade');
            $table->string('local_entity', 100)->notNull()->comment('Product, Customer, Order');
            $table->string('local_field', 100)->notNull()->comment('Field name in our system');
            $table->string('external_entity', 100)->notNull()->comment('Corresponding entity in ERP');
            $table->string('external_field', 100)->notNull()->comment('Field name in ERP system');
            $table->string('data_type', 50)->notNull()->comment('string, number, date, boolean');
            $table->boolean('is_required')->default(false);
            $table->string('default_value', 255)->nullable();
            $table->text('transformation_rule')->nullable()->comment('Field transformation logic');
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->unique(['integration_id', 'local_entity', 'local_field'], 'erp_fmap_intg_loc_ent_fld_unq');
            $table->index(['integration_id', 'local_entity']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('erp_field_mappings');
        Schema::dropIfExists('erp_sync_logs');
        Schema::dropIfExists('erp_integrations');
    }
};

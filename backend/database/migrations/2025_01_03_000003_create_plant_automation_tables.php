<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('plant_automation_configs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('org_id')->constrained('organizations')->onDelete('cascade');
            $table->foreignId('unit_id')->constrained('manufacturing_units')->onDelete('cascade');
            $table->string('device_name', 200)->notNull()->comment('PLC, SCADA, sensor system name');
            $table->string('device_type', 50)->notNull()->comment('plc, scada, sensor, actuator, plc_module');
            $table->string('device_manufacturer', 100)->nullable()->comment('Siemens, Rockwell, Schneider, etc.');
            $table->string('device_model', 100)->nullable();
            $table->string('ip_address', 50)->nullable();
            $table->integer('port')->nullable()->comment('Modbus port or TCP/IP port');
            $table->enum('protocol', ['modbus_tcp', 'modbus_rtu', 'opc_ua', 'opc_da', 'ethernet_ip', 'profibus', 'profinet'])->nullable();
            $table->string('slave_id', 20)->nullable()->comment('Modbus slave ID');
            $table->json('connection_params')->nullable()->comment('Additional connection parameters');
            $table->enum('polling_frequency', ['continuous', '1_sec', '5_sec', '10_sec', '30_sec', '1_min', '5_min'])->default('30_sec');
            $table->boolean('is_active')->default(false);
            $table->boolean('is_connected')->default(false);
            $table->timestamp('last_connected_at')->nullable();
            $table->timestamp('last_disconnected_at')->nullable();
            $table->text('connection_error')->nullable();
            $table->json('device_capabilities')->nullable()->comment('Supported features and data types');
            $table->text('description')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->onDelete('set null');
            $table->foreignId('updated_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamps();
            $table->softDeletes();

            $table->unique(['org_id', 'unit_id', 'device_name']);
            $table->index('is_active');
            $table->index('is_connected');
            $table->index('device_type');
        });

        Schema::create('plant_automation_tags', function (Blueprint $table) {
            $table->id();
            $table->foreignId('config_id')->constrained('plant_automation_configs')->onDelete('cascade');
            $table->string('tag_name', 200)->notNull()->comment('Register name or tag address');
            $table->string('tag_display_name', 200)->nullable()->comment('Human-readable name');
            $table->string('tag_type', 50)->notNull()->comment('input, output, holding_register, input_register');
            $table->string('data_type', 50)->notNull()->comment('bool, int8, int16, int32, uint16, uint32, float32, string');
            $table->integer('address')->nullable()->comment('Modbus register address');
            $table->integer('scan_rate')->default(1000)->comment('Scan rate in milliseconds');
            $table->string('unit_of_measure', 20)->nullable()->comment('kg, m, c, bar, etc.');
            $table->decimal('min_value', 15, 4)->nullable();
            $table->decimal('max_value', 15, 4)->nullable();
            $table->string('default_value', 100)->nullable();
            $table->json('scaling_params')->nullable()->comment('Min/max scaling, offset, multiplier');
            $table->json('alarm_thresholds')->nullable()->comment('High, low, critical thresholds');
            $table->boolean('is_active')->default(true);
            $table->boolean('is_logged')->default(true)->comment('Whether to log tag values');
            $table->string('description', 500)->nullable();
            $table->timestamps();

            $table->unique(['config_id', 'tag_name']);
            $table->index('is_active');
            $table->index('is_logged');
            $table->index('tag_type');
        });

        Schema::create('plant_automation_data_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('config_id')->constrained('plant_automation_configs')->onDelete('cascade');
            $table->foreignId('tag_id')->constrained('plant_automation_tags')->onDelete('cascade');
            $table->timestamp('logged_at')->notNull()->comment('When the data was captured');
            $table->decimal('value', 20, 8)->nullable()->comment('Numeric value');
            $table->text('string_value')->nullable()->comment('String value');
            $table->boolean('bool_value')->nullable()->comment('Boolean value');
            $table->enum('quality', ['good', 'bad', 'uncertain', 'forced'])->default('good');
            $table->text('error_message')->nullable();
            $table->index(['config_id', 'tag_id', 'logged_at'], 'auto_logs_cfg_tag_time_idx');
            $table->index('logged_at');
            $table->index('quality');
        });

        Schema::create('plant_automation_alarms', function (Blueprint $table) {
            $table->id();
            $table->foreignId('config_id')->constrained('plant_automation_configs')->onDelete('cascade');
            $table->foreignId('tag_id')->nullable()->constrained('plant_automation_tags')->onDelete('set null');
            $table->string('alarm_code', 50)->nullable();
            $table->enum('alarm_type', ['digital', 'analog', 'system', 'communication', 'device'])->notNull();
            $table->enum('severity', ['information', 'warning', 'minor', 'major', 'critical'])->notNull();
            $table->enum('status', ['active', 'acknowledged', 'cleared', 'suppressed'])->default('active');
            $table->text('description')->nullable();
            $table->decimal('trigger_value', 20, 8)->nullable();
            $table->decimal('threshold_value', 20, 8)->nullable();
            $table->timestamp('occurred_at')->notNull();
            $table->timestamp('acknowledged_at')->nullable();
            $table->timestamp('cleared_at')->nullable();
            $table->foreignId('acknowledged_by')->nullable()->constrained('users')->onDelete('set null');
            $table->text('acknowledgement_note')->nullable();
            $table->integer('acknowledgement_duration_seconds')->nullable();
            $table->json('alarm_data')->nullable()->comment('Additional alarm details');
            $table->timestamps();

            $table->index(['config_id', 'occurred_at']);
            $table->index('status');
            $table->index('severity');
            $table->index('occurred_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('plant_automation_alarms');
        Schema::dropIfExists('plant_automation_data_logs');
        Schema::dropIfExists('plant_automation_tags');
        Schema::dropIfExists('plant_automation_configs');
    }
};

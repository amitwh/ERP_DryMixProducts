<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ml_models', function (Blueprint $table) {
            $table->id();
            $table->foreignId('org_id')->constrained('organizations')->onDelete('cascade');
            $table->string('model_code', 50)->unique();
            $table->string('model_name', 200)->notNull();
            $table->enum('model_type', ['forecast', 'classification', 'regression', 'anomaly_detection', 'recommendation', 'clustering'])->notNull();
            $table->string('target_variable', 100)->nullable();
            $table->json('input_features')->nullable()->comment('List of input features');
            $table->string('algorithm', 100)->nullable();
            $table->string('model_version', 20)->nullable();
            $table->decimal('accuracy_score', 5, 4)->nullable();
            $table->decimal('precision_score', 5, 4)->nullable();
            $table->decimal('recall_score', 5, 4)->nullable();
            $table->decimal('f1_score', 5, 4)->nullable();
            $table->timestamp('last_trained_at')->nullable();
            $table->date('next_training_date')->nullable();
            $table->integer('training_frequency_days')->nullable();
            $table->boolean('is_active')->default(true);
            $table->string('model_file_path', 500)->nullable();
            $table->string('training_data_source', 200)->nullable();
            $table->json('model_parameters')->nullable();
            $table->json('feature_importance')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->unique(['org_id', 'model_code']);
            $table->index('model_type');
            $table->index('is_active');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ml_models');
    }
};

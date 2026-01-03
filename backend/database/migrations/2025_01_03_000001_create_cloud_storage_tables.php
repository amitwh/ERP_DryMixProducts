<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cloud_storage_configs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('org_id')->constrained('organizations')->onDelete('cascade');
            $table->string('storage_provider', 50)->notNull()->comment('s3, azure, gcp, minio, dropbox');
            $table->string('bucket_name', 255)->nullable();
            $table->string('region', 100)->nullable();
            $table->string('access_key', 255)->nullable()->comment('Access key or client ID');
            $table->text('secret_key')->nullable()->comment('Secret key or client secret');
            $table->string('endpoint_url', 500)->nullable()->comment('Custom endpoint for MinIO or other providers');
            $table->string('cdn_domain', 255)->nullable()->comment('CDN domain for file URLs');
            $table->string('default_path', 255)->default('uploads')->comment('Default folder path');
            $table->enum('encryption', ['none', 'aes256', 'aws:kms'])->default('none');
            $table->enum('visibility', ['public', 'private', 'authenticated'])->default('private');
            $table->boolean('is_active')->default(false);
            $table->boolean('is_default')->default(false);
            $table->json('provider_settings')->nullable()->comment('Provider-specific settings');
            $table->timestamp('test_connection_at')->nullable();
            $table->boolean('connection_status')->default(false)->comment('Last connection test result');
            $table->text('connection_error')->nullable()->comment('Last connection error message');
            $table->foreignId('created_by')->nullable()->constrained('users')->onDelete('set null');
            $table->foreignId('updated_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamps();
            $table->softDeletes();

            $table->unique(['org_id', 'storage_provider']);
            $table->index('is_active');
            $table->index('is_default');
        });

        Schema::create('cloud_storage_files', function (Blueprint $table) {
            $table->id();
            $table->foreignId('org_id')->constrained('organizations')->onDelete('cascade');
            $table->foreignId('config_id')->constrained('cloud_storage_configs')->onDelete('set null');
            $table->string('file_name', 500)->notNull();
            $table->string('file_path', 500)->notNull();
            $table->string('file_type', 100)->notNull();
            $table->string('mime_type', 200)->nullable();
            $table->decimal('file_size', 15, 2)->nullable()->comment('Size in bytes');
            $table->string('extension', 20)->nullable();
            $table->string('file_hash', 64)->nullable()->comment('MD5 or SHA256 hash');
            $table->enum('visibility', ['public', 'private', 'authenticated'])->default('private');
            $table->string('storage_provider', 50)->notNull()->comment('s3, azure, gcp, minio');
            $table->string('external_url', 1000)->nullable()->comment('CDN or public URL');
            $table->string('cdn_url', 1000)->nullable()->comment('CDN-accelerated URL');
            $table->json('metadata')->nullable()->comment('Custom metadata');
            $table->foreignId('uploaded_by')->nullable()->constrained('users')->onDelete('set null');
            $table->foreignId('related_type')->nullable()->comment('Polymorphic relation type');
            $table->unsignedBigInteger('related_id')->nullable()->comment('Polymorphic relation ID');
            $table->foreignId('parent_id')->nullable()->constrained('cloud_storage_files')->onDelete('cascade')->comment('For versioning or folder structure');
            $table->unsignedInteger('version')->nullable()->comment('File version number');
            $table->boolean('is_latest')->default(true)->comment('Is this the latest version?');
            $table->boolean('is_thumbnail')->default(false);
            $table->timestamp('last_accessed_at')->nullable();
            $table->timestamps();

            $table->index(['config_id', 'file_path']);
            $table->index(['related_type', 'related_id']);
            $table->index('file_hash');
            $table->index('uploaded_by');
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cloud_storage_files');
        Schema::dropIfExists('cloud_storage_configs');
    }
};

<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CloudStorageConfig;
use App\Models\CloudStorageFile;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Aws\S3\S3Client;
use Aws\Exception\AwsException;

class CloudStorageController extends Controller
{
    /**
     * Get all storage configs for organization
     */
    public function index(Request $request)
    {
        $configs = CloudStorageConfig::byOrganization($request->org_id)
            ->withCount('files')
            ->latest()
            ->get();

        return response()->json([
            'data' => $configs,
        ]);
    }

    /**
     * Create new storage config
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'org_id' => 'required|exists:organizations,id',
            'storage_provider' => 'required|in:s3,azure,gcp,minio,dropbox',
            'bucket_name' => 'required|string|max:255',
            'region' => 'nullable|string|max:100',
            'access_key' => 'required|string|max:255',
            'secret_key' => 'required|string',
            'endpoint_url' => 'nullable|string|max:500',
            'cdn_domain' => 'nullable|string|max:255',
            'default_path' => 'nullable|string|max:255',
            'encryption' => 'nullable|in:none,aes256,aws:kms',
            'visibility' => 'nullable|in:public,private,authenticated',
            'is_active' => 'boolean',
            'is_default' => 'boolean',
            'provider_settings' => 'nullable|array',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $config = CloudStorageConfig::create($request->all());

        return response()->json([
            'data' => $config,
            'message' => 'Storage configuration created successfully',
        ], 201);
    }

    /**
     * Show specific storage config
     */
    public function show(Request $request, $id)
    {
        $config = CloudStorageConfig::byOrganization($request->org_id)
            ->withCount('files')
            ->findOrFail($id);

        return response()->json(['data' => $config]);
    }

    /**
     * Update storage config
     */
    public function update(Request $request, $id)
    {
        $config = CloudStorageConfig::byOrganization($request->org_id)
            ->findOrFail($id);

        $validator = Validator::make($request->all(), [
            'storage_provider' => 'sometimes|required|in:s3,azure,gcp,minio,dropbox',
            'bucket_name' => 'sometimes|required|string|max:255',
            'region' => 'nullable|string|max:100',
            'access_key' => 'required|string|max:255',
            'secret_key' => 'required|string',
            'endpoint_url' => 'nullable|string|max:500',
            'cdn_domain' => 'nullable|string|max:255',
            'default_path' => 'nullable|string|max:255',
            'encryption' => 'nullable|in:none,aes256,aws:kms',
            'visibility' => 'nullable|in:public,private,authenticated',
            'is_active' => 'boolean',
            'is_default' => 'boolean',
            'provider_settings' => 'nullable|array',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $config->update($request->all());

        return response()->json([
            'data' => $config,
            'message' => 'Storage configuration updated successfully',
        ]);
    }

    /**
     * Delete storage config
     */
    public function destroy(Request $request, $id)
    {
        $config = CloudStorageConfig::byOrganization($request->org_id)
            ->findOrFail($id);

        // Don't allow deletion if it's the default config
        if ($config->is_default) {
            return response()->json([
                'message' => 'Cannot delete default storage configuration',
            ], 400);
        }

        $config->delete();

        return response()->json([
            'message' => 'Storage configuration deleted successfully',
        ]);
    }

    /**
     * Test storage connection
     */
    public function testConnection(Request $request, $id)
    {
        $config = CloudStorageConfig::byOrganization($request->org_id)
            ->findOrFail($id);

        try {
            // Test S3 connection
            if (in_array($config->storage_provider, ['s3', 'minio'])) {
                $s3 = new S3Client([
                    'version' => 'latest',
                    'region' => $config->region ?? 'us-east-1',
                    'endpoint' => $config->endpoint_url,
                    'credentials' => [
                        'key' => $config->access_key,
                        'secret' => $config->secret_key,
                    ],
                ]);

                $s3->headBucket([
                    'Bucket' => $config->bucket_name,
                ]);
            }

            $config->update([
                'test_connection_at' => now(),
                'connection_status' => true,
                'connection_error' => null,
            ]);

            return response()->json([
                'message' => 'Connection successful',
                'data' => [
                    'tested_at' => now(),
                    'status' => 'connected',
                ],
            ]);
        } catch (\Exception $e) {
            $config->update([
                'test_connection_at' => now(),
                'connection_status' => false,
                'connection_error' => $e->getMessage(),
            ]);

            return response()->json([
                'message' => 'Connection failed',
                'data' => [
                    'tested_at' => now(),
                    'status' => 'failed',
                    'error' => $e->getMessage(),
                ],
            ], 400);
        }
    }

    /**
     * Upload file to cloud storage
     */
    public function upload(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'file' => 'required|file|max:10240', // 10MB
            'config_id' => 'nullable|exists:cloud_storage_configs,id',
            'visibility' => 'nullable|in:public,private,authenticated',
            'related_type' => 'nullable|string|max:100',
            'related_id' => 'nullable|integer',
            'parent_id' => 'nullable|exists:cloud_storage_files,id',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $file = $request->file('file');
        $configId = $request->config_id ?? CloudStorageConfig::default()->first()?->id;

        if (!$configId) {
            return response()->json([
                'message' => 'No active storage configuration found',
            ], 400);
        }

        $config = CloudStorageConfig::findOrFail($configId);
        $orgId = $request->org_id ?? $config->org_id;

        // Generate file path
        $fileName = time() . '_' . Str::random(20) . '.' . $file->getClientOriginalExtension();
        $filePath = $config->default_path . '/' . date('Y/m/d') . '/' . $fileName;
        $fileHash = hash_file('sha256', $file->getRealPath());

        // Upload to S3/Cloud
        $s3 = new S3Client([
            'version' => 'latest',
            'region' => $config->region ?? 'us-east-1',
            'endpoint' => $config->endpoint_url,
            'credentials' => [
                'key' => $config->access_key,
                'secret' => $config->secret_key,
            ],
        ]);

        $result = $s3->putObject([
            'Bucket' => $config->bucket_name,
            'Key' => $filePath,
            'SourceFile' => $file->getRealPath(),
            'ContentType' => $file->getMimeType(),
            'ACL' => $request->visibility ?? 'private',
        ]);

        // Get public URL
        $publicUrl = null;
        if ($request->visibility === 'public' || $config->visibility === 'public') {
            $publicUrl = "https://{$config->bucket_name}.s3.{$config->region}.amazonaws.com/{$filePath}";
            if ($config->cdn_domain) {
                $publicUrl = str_replace(
                    "https://{$config->bucket_name}.s3.{$config->region}.amazonaws.com",
                    "https://{$config->cdn_domain}",
                    $publicUrl
                );
            }
        }

        // Create database record
        $storageFile = CloudStorageFile::create([
            'org_id' => $orgId,
            'config_id' => $configId,
            'file_name' => $file->getClientOriginalName(),
            'file_path' => $filePath,
            'file_type' => $this->getFileTypeFromExtension($file->getClientOriginalExtension()),
            'mime_type' => $file->getMimeType(),
            'file_size' => $file->getSize(),
            'extension' => $file->getClientOriginalExtension(),
            'file_hash' => $fileHash,
            'visibility' => $request->visibility ?? $config->visibility,
            'storage_provider' => $config->storage_provider,
            'external_url' => $publicUrl,
            'metadata' => [
                'original_name' => $file->getClientOriginalName(),
                'mime_type' => $file->getMimeType(),
            ],
            'uploaded_by' => auth()->id(),
            'related_type' => $request->related_type,
            'related_id' => $request->related_id,
            'parent_id' => $request->parent_id,
            'version' => $request->parent_id ? CloudStorageFile::where('parent_id', $request->parent_id)->max('version') + 1 : 1,
        ]);

        return response()->json([
            'data' => $storageFile,
            'message' => 'File uploaded successfully',
        ], 201);
    }

    /**
     * Get file info and download URL
     */
    public function getFile(Request $request, $id)
    {
        $file = CloudStorageFile::byOrganization($request->org_id)
            ->with('config')
            ->findOrFail($id);

        // Generate presigned URL for private files
        if ($file->visibility !== 'public') {
            $s3 = new S3Client([
                'version' => 'latest',
                'region' => $file->config->region ?? 'us-east-1',
                'endpoint' => $file->config->endpoint_url,
                'credentials' => [
                    'key' => $file->config->access_key,
                    'secret' => $file->config->secret_key,
                ],
            ]);

            $command = $s3->getCommand('GetObject', [
                'Bucket' => $file->config->bucket_name,
                'Key' => $file->file_path,
            ]);

            $presignedUrl = (string) $s3->createPresignedRequest($command, '+15 minutes');

            return response()->json([
                'data' => [
                    ...$file->toArray(),
                    'download_url' => $presignedUrl,
                    'expires_at' => now()->addMinutes(15)->toIso8601String(),
                ],
            ]);
        }

        // Public file
        return response()->json([
            'data' => [
                ...$file->toArray(),
                'download_url' => $file->public_url,
            ],
        ]);
    }

    /**
     * Delete file from storage
     */
    public function deleteFile(Request $request, $id)
    {
        $file = CloudStorageFile::byOrganization($request->org_id)
            ->with('config')
            ->findOrFail($id);

        // Delete from S3
        $s3 = new S3Client([
            'version' => 'latest',
            'region' => $file->config->region ?? 'us-east-1',
            'endpoint' => $file->config->endpoint_url,
            'credentials' => [
                'key' => $file->config->access_key,
                'secret' => $file->config->secret_key,
            ],
        ]);

        $s3->deleteObject([
            'Bucket' => $file->config->bucket_name,
            'Key' => $file->file_path,
        ]);

        // Delete from database
        $file->delete();

        return response()->json([
            'message' => 'File deleted successfully',
        ]);
    }

    /**
     * Get storage usage statistics
     */
    public function getStatistics(Request $request)
    {
        $configId = $request->query('config_id');
        $query = CloudStorageFile::byOrganization($request->org_id);

        if ($configId) {
            $query->byConfig($configId);
        }

        $totalFiles = $query->count();
        $totalSize = $query->sum('file_size');

        // Group by file type
        $byType = CloudStorageFile::byOrganization($request->org_id)
            ->when($configId, fn($q) => $q->byConfig($configId))
            ->selectRaw('file_type, COUNT(*) as count, SUM(file_size) as size')
            ->groupBy('file_type')
            ->get();

        return response()->json([
            'data' => [
                'total_files' => $totalFiles,
                'total_size' => $totalSize,
                'total_size_formatted' => $this->formatBytes($totalSize),
                'by_type' => $byType,
            ],
        ]);
    }

    private function formatBytes($bytes)
    {
        if ($bytes == 0) return '0 Bytes';
        $k = 1024;
        $sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        $i = floor(log($bytes) / log($k));
        return round($bytes / pow($k, $i), 2) . ' ' . $sizes[$i];
    }

    /**
     * Determines the file type category based on the provided file extension.
     *
     * @param string $extension The file extension (e.g., 'pdf', 'jpg', '.docx').
     * @return string The category of the file. Defaults to 'other' if not found.
     */
    private function getFileTypeFromExtension(string $extension): string
    {
        if (empty($extension)) {
            return 'other';
        }

        $normalizedExtension = strtolower(trim(ltrim($extension, '.')));

        $extensionMap = [
            // Documents
            'pdf' => 'document', 'doc' => 'document', 'docx' => 'document',
            'txt' => 'document', 'rtf' => 'document', 'odt' => 'document',
            // Images
            'jpg' => 'image', 'jpeg' => 'image', 'png' => 'image',
            'gif' => 'image', 'webp' => 'image', 'svg' => 'image',
            'bmp' => 'image', 'ico' => 'image', 'tiff' => 'image',
            // Videos
            'mp4' => 'video', 'avi' => 'video', 'mov' => 'video',
            'wmv' => 'video', 'flv' => 'video', 'mkv' => 'video', 'webm' => 'video',
            // Audio
            'mp3' => 'audio', 'wav' => 'audio', 'ogg' => 'audio',
            'flac' => 'audio', 'aac' => 'audio', 'wma' => 'audio',
            // Archives
            'zip' => 'archive', 'rar' => 'archive', '7z' => 'archive',
            'tar' => 'archive', 'gz' => 'archive', 'bz2' => 'archive',
            // Spreadsheets
            'xls' => 'spreadsheet', 'xlsx' => 'spreadsheet',
            'csv' => 'spreadsheet', 'ods' => 'spreadsheet',
            // Presentations
            'ppt' => 'presentation', 'pptx' => 'presentation',
            'odp' => 'presentation', 'key' => 'presentation',
            // Code
            'php' => 'code', 'js' => 'code', 'py' => 'code',
            'html' => 'code', 'htm' => 'code', 'css' => 'code',
            'json' => 'code', 'xml' => 'code', 'sql' => 'code',
            'java' => 'code', 'ts' => 'code', 'tsx' => 'code',
        ];

        return $extensionMap[$normalizedExtension] ?? 'other';
    }
}

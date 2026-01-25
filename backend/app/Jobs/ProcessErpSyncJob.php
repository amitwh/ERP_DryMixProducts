<?php

namespace App\Jobs;

use App\Models\ErpIntegration;
use App\Models\ErpSyncLog;
use Exception;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Throwable;

/**
 * ProcessErpSyncJob
 *
 * Handles the synchronization process for a specific ERP integration.
 * This job processes data transfer, updates statistics, and manages
 * the status of both the integration and the sync log.
 */
class ProcessErpSyncJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * The number of times the job may be attempted.
     */
    public int $tries = 3;

    /**
     * The maximum number of seconds the job can run before timing out.
     */
    public int $timeout = 300;

    /**
     * The ID of the ErpIntegration.
     */
    protected int $integrationId;

    /**
     * The ID of the ErpSyncLog.
     */
    protected int $syncLogId;

    /**
     * Create a new job instance.
     */
    public function __construct(int $integrationId, int $syncLogId)
    {
        $this->integrationId = $integrationId;
        $this->syncLogId = $syncLogId;
        $this->onQueue('erp-sync');
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        $startTime = microtime(true);

        try {
            $integration = ErpIntegration::lockForUpdate()->findOrFail($this->integrationId);
            $syncLog = ErpSyncLog::findOrFail($this->syncLogId);

            if ($syncLog->integration_id !== $this->integrationId) {
                throw new Exception("Sync Log ID {$this->syncLogId} does not belong to Integration ID {$this->integrationId}.");
            }

            $this->updateStatus($integration, $syncLog, 'processing');

            Log::info("ERP Sync Started", [
                'integration_id' => $this->integrationId,
                'sync_log_id' => $this->syncLogId,
            ]);

            // Perform the synchronization
            $stats = $this->performDataSync($integration);

            $duration = round(microtime(true) - $startTime, 4);
            $finalStatus = ($stats['failed'] > 0) ? 'completed_with_errors' : 'completed';

            DB::transaction(function () use ($integration, $syncLog, $stats, $duration, $finalStatus) {
                $syncLog->update([
                    'status' => $finalStatus,
                    'records_processed' => $stats['total'],
                    'records_success' => $stats['success'],
                    'records_failed' => $stats['failed'],
                    'completed_at' => now(),
                    'duration_seconds' => $duration,
                    'error_message' => null,
                ]);

                $integration->update([
                    'sync_status' => 'synced',
                    'last_synced_at' => now(),
                ]);
            });

            Log::info("ERP Sync Completed", [
                'integration_id' => $this->integrationId,
                'sync_log_id' => $this->syncLogId,
                'duration' => $duration,
                'stats' => $stats,
            ]);

        } catch (Throwable $exception) {
            $duration = round(microtime(true) - $startTime, 4);
            $this->handleFailure($exception, $duration);
            throw $exception;
        }
    }

    /**
     * Perform the data synchronization process.
     */
    protected function performDataSync(ErpIntegration $integration): array
    {
        // Simulate processing based on integration type
        $entityTypes = $this->getEntityTypesForIntegration($integration);

        $total = 0;
        $success = 0;
        $failed = 0;

        foreach ($entityTypes as $entityType) {
            $records = $this->syncEntityType($integration, $entityType);
            $total += $records['total'];
            $success += $records['success'];
            $failed += $records['failed'];
        }

        return [
            'total' => $total,
            'success' => $success,
            'failed' => $failed,
        ];
    }

    /**
     * Get entity types to sync based on integration type.
     */
    protected function getEntityTypesForIntegration(ErpIntegration $integration): array
    {
        return match ($integration->integration_type) {
            'accounting' => ['invoices', 'payments', 'journal_entries'],
            'crm' => ['customers', 'contacts', 'opportunities'],
            'inventory' => ['products', 'stock_levels', 'movements'],
            'hr' => ['employees', 'attendance', 'payroll'],
            default => ['general'],
        };
    }

    /**
     * Sync a specific entity type.
     */
    protected function syncEntityType(ErpIntegration $integration, string $entityType): array
    {
        // Simulate sync processing
        usleep(rand(100000, 500000)); // 100-500ms delay

        $total = rand(5, 50);
        $failed = rand(0, 2);
        $success = $total - $failed;

        Log::debug("Synced entity type", [
            'integration_id' => $integration->id,
            'entity_type' => $entityType,
            'records' => $total,
        ]);

        return [
            'total' => $total,
            'success' => $success,
            'failed' => $failed,
        ];
    }

    /**
     * Update the status of integration and log models.
     */
    protected function updateStatus(ErpIntegration $integration, ErpSyncLog $syncLog, string $status): void
    {
        $integrationStatus = match ($status) {
            'processing' => 'syncing',
            'completed', 'completed_with_errors' => 'synced',
            'failed' => 'error',
            default => 'idle',
        };

        DB::transaction(function () use ($integration, $syncLog, $status, $integrationStatus) {
            $syncLog->update(['status' => $status]);
            $integration->update(['sync_status' => $integrationStatus]);
        });
    }

    /**
     * Handle job failure.
     */
    protected function handleFailure(Throwable $exception, float $duration): void
    {
        Log::error("ERP Sync Job Failed", [
            'integration_id' => $this->integrationId,
            'sync_log_id' => $this->syncLogId,
            'error' => $exception->getMessage(),
        ]);

        try {
            $syncLog = ErpSyncLog::find($this->syncLogId);
            $integration = ErpIntegration::find($this->integrationId);

            if ($syncLog && $integration) {
                DB::transaction(function () use ($syncLog, $integration, $exception, $duration) {
                    $syncLog->update([
                        'status' => 'failed',
                        'completed_at' => now(),
                        'duration_seconds' => $duration,
                        'error_message' => substr($exception->getMessage(), 0, 255),
                    ]);

                    $integration->update(['sync_status' => 'error']);
                });
            }
        } catch (Throwable $dbException) {
            Log::critical("Failed to update ERP Sync Log status after job failure", [
                'sync_log_id' => $this->syncLogId,
                'db_error' => $dbException->getMessage(),
            ]);
        }
    }
}

<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ErpIntegration;
use App\Models\ErpSyncLog;
use App\Models\ErpFieldMapping;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;
use GuzzleHttp\Client;

class ErpIntegrationController extends Controller
{
    /**
     * Get all ERP integrations
     */
    public function index(Request $request)
    {
        $integrations = ErpIntegration::byOrganization($request->org_id)
            ->latest()
            ->get();

        return response()->json([
            'data' => $integrations,
        ]);
    }

    /**
     * Create new ERP integration
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'org_id' => 'required|exists:organizations,id',
            'integration_name' => 'required|string|max:100',
            'integration_type' => 'required|in:accounting,crm,inventory,hr',
            'integration_provider' => 'required|in:sage,netsuite,xero,quickbooks,sap,oracle,dynamics,odoo',
            'api_endpoint' => 'nullable|string|max:500',
            'api_key' => 'nullable|string|max:255',
            'api_secret' => 'nullable|string',
            'sync_frequency' => 'nullable|in:manual,hourly,daily,weekly,realtime',
            'sync_time' => 'nullable|date_format:H:i',
            'is_active' => 'boolean',
            'is_auto_sync' => 'boolean',
            'connection_settings' => 'nullable|array',
            'sync_settings' => 'nullable|array',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $integration = ErpIntegration::create($request->all());

        return response()->json([
            'data' => $integration,
            'message' => 'ERP integration created successfully',
        ], 201);
    }

    /**
     * Show specific ERP integration
     */
    public function show(Request $request, $id)
    {
        $integration = ErpIntegration::byOrganization($request->org_id)
            ->withCount('syncLogs')
            ->with(['syncLogs' => fn($q) => $q->latest()->limit(10)])
            ->findOrFail($id);

        return response()->json(['data' => $integration]);
    }

    /**
     * Update ERP integration
     */
    public function update(Request $request, $id)
    {
        $integration = ErpIntegration::byOrganization($request->org_id)
            ->findOrFail($id);

        $validator = Validator::make($request->all(), [
            'integration_name' => 'sometimes|required|string|max:100',
            'integration_type' => 'sometimes|required|in:accounting,crm,inventory,hr',
            'integration_provider' => 'sometimes|required|in:sage,netsuite,xero,quickbooks,sap,oracle,dynamics,odoo',
            'api_endpoint' => 'nullable|string|max:500',
            'api_key' => 'nullable|string|max:255',
            'api_secret' => 'nullable|string',
            'sync_frequency' => 'nullable|in:manual,hourly,daily,weekly,realtime',
            'sync_time' => 'nullable|date_format:H:i',
            'is_active' => 'boolean',
            'is_auto_sync' => 'boolean',
            'connection_settings' => 'nullable|array',
            'sync_settings' => 'nullable|array',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $integration->update($request->all());

        return response()->json([
            'data' => $integration,
            'message' => 'ERP integration updated successfully',
        ]);
    }

    /**
     * Delete ERP integration
     */
    public function destroy(Request $request, $id)
    {
        $integration = ErpIntegration::byOrganization($request->org_id)
            ->findOrFail($id);

        $integration->delete();

        return response()->json([
            'message' => 'ERP integration deleted successfully',
        ]);
    }

    /**
     * Test ERP connection
     */
    public function testConnection(Request $request, $id)
    {
        $integration = ErpIntegration::byOrganization($request->org_id)
            ->findOrFail($id);

        try {
            $client = new Client([
                'base_uri' => $integration->api_endpoint,
                'timeout' => 30,
            ]);

            // Test connection based on provider
            $response = $client->request('GET', '/api/health', [
                'headers' => [
                    'Authorization' => 'Bearer ' . $integration->api_key,
                ],
            ]);

            return response()->json([
                'message' => 'Connection successful',
                'data' => [
                    'status' => 'connected',
                    'provider' => $integration->integration_provider,
                ],
            ]);
        } catch (\Exception $e) {
            Log::error('ERP connection test failed', [
                'integration_id' => $id,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'message' => 'Connection failed',
                'data' => [
                    'status' => 'failed',
                    'error' => $e->getMessage(),
                ],
            ], 400);
        }
    }

    /**
     * Trigger manual sync
     */
    public function triggerSync(Request $request, $id)
    {
        $integration = ErpIntegration::byOrganization($request->org_id)
            ->findOrFail($id);

        if (!$integration->is_active) {
            return response()->json([
                'message' => 'Cannot sync inactive integration',
            ], 400);
        }

        if ($integration->sync_status === 'syncing') {
            return response()->json([
                'message' => 'Sync already in progress',
            ], 400);
        }

        // Create sync log
        $syncLog = ErpSyncLog::create([
            'integration_id' => $integration->id,
            'sync_type' => 'manual',
            'entity_type' => 'all',
            'direction' => 'bidirectional',
            'started_at' => now(),
            'status' => 'in_progress',
            'records_processed' => 0,
            'records_success' => 0,
            'records_failed' => 0,
        ]);

        // Update integration status
        $integration->update([
            'sync_status' => 'syncing',
            'last_sync_at' => now(),
        ]);

        // TODO: Queue background job for actual sync
        // ProcessErpSyncJob::dispatch($integration->id, $syncLog->id);

        return response()->json([
            'message' => 'Sync triggered successfully',
            'data' => [
                'sync_log_id' => $syncLog->id,
                'status' => 'syncing',
            ],
        ]);
    }

    /**
     * Get sync logs
     */
    public function getSyncLogs(Request $request, $id)
    {
        $integration = ErpIntegration::byOrganization($request->org_id)
            ->findOrFail($id);

        $logs = ErpSyncLog::byIntegration($id)
            ->latest()
            ->paginate($request->get('per_page', 20));

        return response()->json([
            'data' => $logs->items(),
            'meta' => [
                'current_page' => $logs->currentPage(),
                'last_page' => $logs->lastPage(),
                'per_page' => $logs->perPage(),
                'total' => $logs->total(),
            ],
        ]);
    }

    /**
     * Get field mappings
     */
    public function getFieldMappings(Request $request, $id)
    {
        $integration = ErpIntegration::byOrganization($request->org_id)
            ->findOrFail($id);

        $mappings = ErpFieldMapping::byIntegration($id)
            ->active()
            ->get();

        return response()->json(['data' => $mappings]);
    }

    /**
     * Create field mapping
     */
    public function storeFieldMapping(Request $request, $id)
    {
        $integration = ErpIntegration::byOrganization($request->org_id)
            ->findOrFail($id);

        $validator = Validator::make($request->all(), [
            'local_entity' => 'required|string|max:100',
            'local_field' => 'required|string|max:100',
            'external_entity' => 'required|string|max:100',
            'external_field' => 'required|string|max:100',
            'data_type' => 'required|in:string,number,date,boolean,array',
            'is_required' => 'boolean',
            'default_value' => 'nullable|string|max:255',
            'transformation_rule' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $mapping = ErpFieldMapping::create([
            'integration_id' => $integration->id,
            ...$request->all(),
        ]);

        return response()->json([
            'data' => $mapping,
            'message' => 'Field mapping created successfully',
        ], 201);
    }

    /**
     * Update field mapping
     */
    public function updateFieldMapping(Request $request, $integrationId, $mappingId)
    {
        $integration = ErpIntegration::byOrganization($request->org_id)
            ->findOrFail($integrationId);

        $mapping = ErpFieldMapping::byIntegration($integrationId)
            ->findOrFail($mappingId);

        $mapping->update($request->all());

        return response()->json([
            'data' => $mapping,
            'message' => 'Field mapping updated successfully',
        ]);
    }

    /**
     * Delete field mapping
     */
    public function deleteFieldMapping(Request $request, $integrationId, $mappingId)
    {
        $integration = ErpIntegration::byOrganization($request->org_id)
            ->findOrFail($integrationId);

        $mapping = ErpFieldMapping::byIntegration($integrationId)
            ->findOrFail($mappingId);

        $mapping->delete();

        return response()->json([
            'message' => 'Field mapping deleted successfully',
        ]);
    }

    /**
     * Get sync statistics
     */
    public function getSyncStatistics(Request $request, $id)
    {
        $integration = ErpIntegration::byOrganization($request->org_id)
            ->findOrFail($id);

        $logs = ErpSyncLog::byIntegration($id)
            ->recent(30)
            ->get();

        $stats = [
            'total_syncs' => $logs->count(),
            'successful_syncs' => $logs->where('status', 'completed')->count(),
            'failed_syncs' => $logs->where('status', 'failed')->count(),
            'total_records_processed' => $logs->sum('records_processed'),
            'total_records_success' => $logs->sum('records_success'),
            'total_records_failed' => $logs->sum('records_failed'),
            'average_duration' => $logs->avg('duration_seconds'),
            'average_success_rate' => $logs->avg(function ($log) {
                return $log->records_processed > 0 ? ($log->records_success / $log->records_processed) * 100 : 0;
            }),
            'last_sync_status' => $logs->first()?->status ?? 'never',
            'last_sync_at' => $logs->first()?->started_at,
        ];

        return response()->json([
            'data' => $stats,
        ]);
    }
}

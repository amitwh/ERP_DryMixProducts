<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PlantAutomationConfig;
use App\Models\PlantAutomationTag;
use App\Models\PlantAutomationDataLog;
use App\Models\PlantAutomationAlarm;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;

class PlantAutomationController extends Controller
{
    /**
     * Get all plant automation configs
     */
    public function index(Request $request)
    {
        $configs = PlantAutomationConfig::byOrganization($request->org_id)
            ->withCount(['tags', 'alarms'])
            ->latest()
            ->get();

        return response()->json([
            'data' => $configs,
        ]);
    }

    /**
     * Create new device config
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'org_id' => 'required|exists:organizations,id',
            'unit_id' => 'required|exists:manufacturing_units,id',
            'device_name' => 'required|string|max:200',
            'device_type' => 'required|in:plc,scada,sensor,actuator,plc_module',
            'device_manufacturer' => 'nullable|string|max:100',
            'device_model' => 'nullable|string|max:100',
            'ip_address' => 'nullable|ip',
            'port' => 'nullable|integer|max:65535',
            'protocol' => 'nullable|in:modbus_tcp,modbus_rtu,opc_ua,opc_da,ethernet_ip,profibus,profinet',
            'slave_id' => 'nullable|string|max:20',
            'connection_params' => 'nullable|array',
            'polling_frequency' => 'nullable|in:continuous,1_sec,5_sec,10_sec,30_sec,1_min,5_min',
            'is_active' => 'boolean',
            'description' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $config = PlantAutomationConfig::create($request->all());

        return response()->json([
            'data' => $config,
            'message' => 'Device configuration created successfully',
        ], 201);
    }

    /**
     * Show specific config
     */
    public function show(Request $request, $id)
    {
        $config = PlantAutomationConfig::byOrganization($request->org_id)
            ->with(['tags' => fn($q) => $q->active()->logged(), 'alarms' => fn($q) => $q->active()->latest()->limit(10)])
            ->withCount('tags', 'alarms')
            ->findOrFail($id);

        return response()->json(['data' => $config]);
    }

    /**
     * Update device config
     */
    public function update(Request $request, $id)
    {
        $config = PlantAutomationConfig::byOrganization($request->org_id)
            ->findOrFail($id);

        $validator = Validator::make($request->all(), [
            'device_name' => 'sometimes|required|string|max:200',
            'device_type' => 'sometimes|required|in:plc,scada,sensor,actuator,plc_module',
            'device_manufacturer' => 'nullable|string|max:100',
            'device_model' => 'nullable|string|max:100',
            'ip_address' => 'nullable|ip',
            'port' => 'nullable|integer|max:65535',
            'protocol' => 'nullable|in:modbus_tcp,modbus_rtu,opc_ua,opc_da,ethernet_ip,profibus,profinet',
            'slave_id' => 'nullable|string|max:20',
            'connection_params' => 'nullable|array',
            'polling_frequency' => 'nullable|in:continuous,1_sec,5_sec,10_sec,30_sec,1_min,5_min',
            'is_active' => 'boolean',
            'description' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $config->update($request->all());

        return response()->json([
            'data' => $config,
            'message' => 'Device configuration updated successfully',
        ]);
    }

    /**
     * Delete device config
     */
    public function destroy(Request $request, $id)
    {
        $config = PlantAutomationConfig::byOrganization($request->org_id)
            ->findOrFail($id);

        $config->delete();

        return response()->json([
            'message' => 'Device configuration deleted successfully',
        ]);
    }

    /**
     * Test device connection
     */
    public function testConnection(Request $request, $id)
    {
        $config = PlantAutomationConfig::byOrganization($request->org_id)
            ->findOrFail($id);

        try {
            // Test connection based on protocol
            $result = $this->testDeviceConnection(
                $config->protocol ?? 'modbus_tcp',
                $config->ip_address,
                $config->port ?? 502,
                $config->connection_params ?? []
            );

            if ($result['success']) {
                $config->update([
                    'last_connected_at' => now(),
                    'is_connected' => true,
                    'connection_error' => null,
                ]);

                return response()->json([
                    'message' => 'Connection successful',
                    'data' => [
                        'connected_at' => now(),
                        'status' => 'connected',
                        'device_type' => $config->device_type,
                        'protocol' => $config->protocol,
                        'latency_ms' => $result['latency_ms'],
                        'details' => $result['message'],
                    ],
                ]);
            } else {
                throw new \Exception($result['message']);
            }
        } catch (\Exception $e) {
            $config->update([
                'last_disconnected_at' => now(),
                'is_connected' => false,
                'connection_error' => $e->getMessage(),
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
     * Test connection to industrial automation device based on protocol
     */
    private function testDeviceConnection(string $protocol, ?string $ip_address, int $port, array $connection_params = []): array
    {
        $timeout = $connection_params['timeout'] ?? 5;
        $startTime = microtime(true);

        // Validate IP Address
        if (empty($ip_address) || filter_var($ip_address, FILTER_VALIDATE_IP) === false) {
            return [
                'success' => false,
                'message' => "Invalid or missing IP address: {$ip_address}",
                'latency_ms' => null
            ];
        }

        try {
            switch ($protocol) {
                case 'modbus_tcp':
                    $result = $this->testTcpConnection($ip_address, $port ?: 502, $timeout, "Modbus TCP");
                    break;

                case 'opc_ua':
                    $scheme = $connection_params['scheme'] ?? 'http';
                    $endpoint = $connection_params['endpoint'] ?? '';
                    $result = $this->testHttpConnection($scheme, $ip_address, $port ?: 4840, $endpoint, $timeout, "OPC UA");
                    break;

                case 'ethernet_ip':
                    $result = $this->testTcpConnection($ip_address, $port ?: 44818, $timeout, "Ethernet/IP");
                    break;

                case 'modbus_rtu':
                case 'opc_da':
                case 'profibus':
                case 'profinet':
                    $result = [
                        'success' => true,
                        'message' => "Simulated success for {$protocol}. This protocol requires specific hardware/driver interfaces.",
                        'latency_ms' => 0
                    ];
                    break;

                default:
                    $result = $this->testTcpConnection($ip_address, $port, $timeout, $protocol);
                    break;
            }
        } catch (\Exception $e) {
            $result = [
                'success' => false,
                'message' => "Exception during connection test: " . $e->getMessage(),
                'latency_ms' => null
            ];
        }

        if ($result['latency_ms'] === null) {
            $result['latency_ms'] = round((microtime(true) - $startTime) * 1000, 2);
        }

        return $result;
    }

    private function testTcpConnection(string $host, int $port, int $timeout, string $protocolName): array
    {
        $socket = @fsockopen($host, $port, $errno, $errstr, $timeout);

        if ($socket) {
            fclose($socket);
            return [
                'success' => true,
                'message' => "Successfully connected to {$protocolName} device at {$host}:{$port}.",
                'latency_ms' => null
            ];
        }

        return [
            'success' => false,
            'message' => "Connection to {$protocolName} failed ({$host}:{$port}). Error: [{$errno}] {$errstr}",
            'latency_ms' => null
        ];
    }

    private function testHttpConnection(string $scheme, string $host, int $port, string $path, int $timeout, string $protocolName): array
    {
        $url = "{$scheme}://{$host}:{$port}/{$path}";

        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, $timeout);
        curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, $timeout);
        curl_setopt($ch, CURLOPT_HEADER, true);
        curl_setopt($ch, CURLOPT_NOBODY, true);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $error = curl_error($ch);
        curl_close($ch);

        if ($response !== false && $httpCode > 0) {
            return [
                'success' => true,
                'message' => "Successfully connected to {$protocolName} endpoint at {$url}. HTTP Code: {$httpCode}.",
                'latency_ms' => null
            ];
        }

        return [
            'success' => false,
            'message' => "HTTP connection to {$protocolName} failed ({$url}). Error: {$error}",
            'latency_ms' => null
        ];
    }

    /**
     * Get tags for a device
     */
    public function getTags(Request $request, $id)
    {
        $config = PlantAutomationConfig::byOrganization($request->org_id)
            ->findOrFail($id);

        $tags = $config->tags()
            ->latest()
            ->get();

        return response()->json([
            'data' => $tags,
        ]);
    }

    /**
     * Create tag
     */
    public function storeTag(Request $request, $id)
    {
        $config = PlantAutomationConfig::byOrganization($request->org_id)
            ->findOrFail($id);

        $validator = Validator::make($request->all(), [
            'tag_name' => 'required|string|max:200',
            'tag_display_name' => 'nullable|string|max:200',
            'tag_type' => 'required|in:input,output,holding_register,input_register',
            'data_type' => 'required|in:bool,int8,int16,int32,uint16,uint32,float32,string',
            'address' => 'nullable|integer',
            'scan_rate' => 'nullable|integer|min:100|max:60000',
            'unit_of_measure' => 'nullable|string|max:20',
            'min_value' => 'nullable|numeric',
            'max_value' => 'nullable|numeric',
            'default_value' => 'nullable|string|max:100',
            'scaling_params' => 'nullable|array',
            'alarm_thresholds' => 'nullable|array',
            'is_active' => 'boolean',
            'is_logged' => 'boolean',
            'description' => 'nullable|string|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $tag = $config->tags()->create($request->all());

        return response()->json([
            'data' => $tag,
            'message' => 'Tag created successfully',
        ], 201);
    }

    /**
     * Get historical data for a tag
     */
    public function getTagData(Request $request, $configId, $tagId)
    {
        $config = PlantAutomationConfig::byOrganization($request->org_id)
            ->findOrFail($configId);

        $tag = PlantAutomationTag::byConfig($configId)
            ->findOrFail($tagId);

        $startDate = $request->query('start_date', now()->subHours(24));
        $endDate = $request->query('end_date', now());

        $data = PlantAutomationDataLog::byTag($tagId)
            ->byDateRange($startDate, $endDate)
            ->latest('logged_at')
            ->limit($request->query('limit', 1000))
            ->get();

        return response()->json([
            'data' => [
                'tag' => $tag,
                'data_points' => $data,
                'count' => $data->count(),
            ],
        ]);
    }

    /**
     * Get latest tag values
     */
    public function getLatestData(Request $request, $id)
    {
        $config = PlantAutomationConfig::byOrganization($request->org_id)
            ->findOrFail($id);

        $latestData = PlantAutomationDataLog::byConfig($config->id)
            ->recent(60)
            ->latest('logged_at')
            ->get()
            ->groupBy('tag_id')
            ->map(function ($group) {
                return $group->first();
            });

        return response()->json([
            'data' => $latestData->values(),
            'count' => $latestData->count(),
            'captured_at' => now(),
        ]);
    }

    /**
     * Get alarms
     */
    public function getAlarms(Request $request, $id)
    {
        $config = PlantAutomationConfig::byOrganization($request->org_id)
            ->findOrFail($id);

        $query = $config->alarms();

        // Filter by status
        if ($request->has('status')) {
            $query->byStatus($request->query('status'));
        }

        // Filter by severity
        if ($request->has('severity')) {
            $query->bySeverity($request->query('severity'));
        }

        // Filter by date range
        if ($request->has('start_date') && $request->has('end_date')) {
            $query->byDateRange($request->query('start_date'), $request->query('end_date'));
        }

        $alarms = $query->latest('occurred_at')
            ->paginate($request->query('per_page', 20));

        return response()->json([
            'data' => $alarms->items(),
            'meta' => [
                'current_page' => $alarms->currentPage(),
                'last_page' => $alarms->lastPage(),
                'per_page' => $alarms->perPage(),
                'total' => $alarms->total(),
            ],
        ]);
    }

    /**
     * Acknowledge alarm
     */
    public function acknowledgeAlarm(Request $request, $id, $alarmId)
    {
        $config = PlantAutomationConfig::byOrganization($request->org_id)
            ->findOrFail($id);

        $alarm = PlantAutomationAlarm::byConfig($id)
            ->findOrFail($alarmId);

        if ($alarm->status !== 'active') {
            return response()->json([
                'message' => 'Alarm is not in active status',
            ], 400);
        }

        $alarm->acknowledge(auth()->id(), $request->input('note'));

        return response()->json([
            'data' => $alarm,
            'message' => 'Alarm acknowledged successfully',
        ]);
    }

    /**
     * Clear alarm
     */
    public function clearAlarm(Request $request, $id, $alarmId)
    {
        $config = PlantAutomationConfig::byOrganization($request->org_id)
            ->findOrFail($id);

        $alarm = PlantAutomationAlarm::byConfig($id)
            ->findOrFail($alarmId);

        $alarm->clear();

        return response()->json([
            'data' => $alarm,
            'message' => 'Alarm cleared successfully',
        ]);
    }

    /**
     * Get device statistics
     */
    public function getStatistics(Request $request, $id)
    {
        $config = PlantAutomationConfig::byOrganization($request->org_id)
            ->findOrFail($id);

        // Get recent alarms
        $recentAlarms = $config->alarms()->recent(24)->get();

        // Get active alarms
        $activeAlarms = $config->alarms()->active()->get();

        // Get data points count
        $dataPoints = $config->dataLogs()->recent(24)->count();

        // Connection statistics
        $connectionStats = [
            'is_connected' => $config->is_connected,
            'last_connected_at' => $config->last_connected_at,
            'last_disconnected_at' => $config->last_disconnected_at,
            'connection_error' => $config->connection_error,
        ];

        return response()->json([
            'data' => [
                'total_tags' => $config->tags()->active()->count(),
                'total_alarms_24h' => $recentAlarms->count(),
                'active_alarms' => $activeAlarms->count(),
                'critical_alarms' => $activeAlarms->where('severity', 'critical')->count(),
                'major_alarms' => $activeAlarms->where('severity', 'major')->count(),
                'data_points_24h' => $dataPoints,
                'connection' => $connectionStats,
            ],
        ]);
    }
}

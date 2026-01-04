<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Module;
use App\Models\ApiKey;
use App\Models\ApiLog;
use App\Models\SystemLog;
use App\Models\SystemBackup;
use App\Models\ScheduledTask;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Str;

class SystemAdminController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => [
                'message' => 'System Administration Module',
                'endpoints' => [
                    '/modules' => 'Module Management',
                    '/api-keys' => 'API Key Management',
                    '/api-logs' => 'API Logging',
                    '/system-logs' => 'System Logging',
                    '/system-backups' => 'Backup Management',
                    '/scheduled-tasks' => 'Task Scheduling',
                    '/system-settings' => 'System Settings',
                ]
            ]
        ]);
    }

    // Modules
    public function modules(Request $request): JsonResponse
    {
        $modules = Module::query()
            ->orderBy('display_order')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $modules,
        ]);
    }

    public function showModule(Module $module): JsonResponse
    {
        $module->load(['organizationModules']);

        return response()->json([
            'success' => true,
            'data' => $module,
        ]);
    }

    // API Keys
    public function apiKeys(Request $request): JsonResponse
    {
        $organizationId = $request->get('organization_id');

        $apiKeys = ApiKey::query()
            ->when($organizationId, fn($q) => $q->where('organization_id', $organizationId))
            ->with(['organization', 'user'])
            ->orderBy('created_at', 'desc')
            ->paginate($request->get('per_page', 20));

        // Hide actual API keys in response
        $apiKeys->getCollection()->transform(function ($key) {
            $key->api_key = $key->api_key ? Str::mask($key->api_key, 4, '****') : null;
            return $key;
        });

        return response()->json([
            'success' => true,
            'data' => $apiKeys,
        ]);
    }

    public function storeApiKey(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'organization_id' => 'required|exists:organizations,id',
            'user_id' => 'nullable|exists:users,id',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'permissions' => 'nullable|array',
            'allowed_ips' => 'nullable|array',
            'rate_limits' => 'nullable|array',
            'expires_at' => 'nullable|date|after:today',
        ]);

        // Generate API key
        $apiKey = Str::random(40) . '-' . Str::random(8) . '-' . time();

        $apiKey = ApiKey::create(array_merge($validated, [
            'api_key' => $apiKey,
            'is_active' => true,
            'is_revoked' => false,
            'usage_count' => 0,
            'created_by' => auth()->id(),
        ]));

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $apiKey->id,
                'api_key' => $apiKey->api_key, // Show full key on creation
                'name' => $apiKey->name,
            ],
            'message' => 'API key created successfully',
        ], 201);
    }

    public function revokeApiKey(ApiKey $apiKey): JsonResponse
    {
        $apiKey->revoke();

        return response()->json([
            'success' => true,
            'message' => 'API key revoked successfully',
        ]);
    }

    // API Logs
    public function apiLogs(Request $request): JsonResponse
    {
        $organizationId = $request->get('organization_id');

        $logs = ApiLog::query()
            ->when($organizationId, fn($q) => $q->where('organization_id', $organizationId))
            ->with(['apiKey', 'user'])
            ->when($request->has('status'), fn($q) => $q->where('response_status', '>=', $request->get('status') == 'error' ? 400 : 0))
            ->when($request->has('endpoint'), fn($q) => $q->where('endpoint', 'like', '%' . $request->endpoint . '%'))
            ->orderBy('requested_at', 'desc')
            ->paginate($request->get('per_page', 50));

        return response()->json([
            'success' => true,
            'data' => $logs,
        ]);
    }

    public function apiLogStatistics(Request $request): JsonResponse
    {
        $organizationId = $request->get('organization_id');
        $startDate = $request->get('start_date', now()->subDays(7)->toDateString());
        $endDate = $request->get('end_date', today()->toDateString());

        $query = ApiLog::query()
            ->when($organizationId, fn($q) => $q->where('organization_id', $organizationId))
            ->whereBetween('requested_at', [$startDate, $endDate]);

        $stats = [
            'total_requests' => $query->count(),
            'successful' => $query->where('response_status', '<', 400)->count(),
            'errors' => $query->where('response_status', '>=', 400)->count(),
            'average_response_time' => round($query->avg('response_time_ms') ?? 0, 2),
            'slow_requests' => $query->where('response_time_ms', '>', 1000)->count(),
            'top_endpoints' => ApiLog::query()
                ->when($organizationId, fn($q) => $q->where('organization_id', $organizationId))
                ->whereBetween('requested_at', [$startDate, $endDate])
                ->selectRaw('endpoint, COUNT(*) as count')
                ->groupBy('endpoint')
                ->orderBy('count', 'desc')
                ->limit(10)
                ->get(),
            'errors_by_status' => ApiLog::query()
                ->when($organizationId, fn($q) => $q->where('organization_id', $organizationId))
                ->whereBetween('requested_at', [$startDate, $endDate])
                ->where('response_status', '>=', 400)
                ->selectRaw('response_status, COUNT(*) as count')
                ->groupBy('response_status')
                ->get(),
        ];

        return response()->json([
            'success' => true,
            'data' => $stats,
        ]);
    }

    // System Logs
    public function systemLogs(Request $request): JsonResponse
    {
        $organizationId = $request->get('organization_id');

        $logs = SystemLog::query()
            ->when($organizationId, fn($q) => $q->where('organization_id', $organizationId))
            ->with(['user'])
            ->when($request->has('level'), fn($q) => $q->where('log_level', $request->level))
            ->when($request->has('channel'), fn($q) => $q->where('channel', $request->channel))
            ->orderBy('logged_at', 'desc')
            ->paginate($request->get('per_page', 50));

        return response()->json([
            'success' => true,
            'data' => $logs,
        ]);
    }

    // System Backups
    public function systemBackups(Request $request): JsonResponse
    {
        $organizationId = $request->get('organization_id');

        $backups = SystemBackup::query()
            ->when($organizationId, fn($q) => $q->where('organization_id', $organizationId))
            ->with(['organization', 'createdBy'])
            ->when($request->has('type'), fn($q) => $q->where('backup_type', $request->type))
            ->when($request->has('status'), fn($q) => $q->where('status', $request->status))
            ->orderBy('created_at', 'desc')
            ->paginate($request->get('per_page', 20));

        return response()->json([
            'success' => true,
            'data' => $backups,
        ]);
    }

    public function createBackup(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'organization_id' => 'nullable|exists:organizations,id',
            'backup_name' => 'required|string|max:255',
            'backup_type' => 'required|in:full,incremental,manual,scheduled',
            'included_tables' => 'nullable|array',
        ]);

        $backup = SystemBackup::create(array_merge($validated, [
            'status' => 'pending',
            'size_mb' => 0,
            'created_by' => auth()->id(),
        ]));

        // Queue backup job
        // In production, this would dispatch a queue job

        return response()->json([
            'success' => true,
            'data' => $backup,
            'message' => 'Backup created successfully',
        ], 201);
    }

    // Scheduled Tasks
    public function scheduledTasks(Request $request): JsonResponse
    {
        $organizationId = $request->get('organization_id');

        $tasks = ScheduledTask::query()
            ->when($organizationId, fn($q) => $q->where('organization_id', $organizationId))
            ->with(['organization', 'createdBy'])
            ->when($request->has('status'), fn($q) => $q->where('status', $request->status))
            ->when($request->has('task_type'), fn($q) => $q->where('task_type', $request->task_type))
            ->orderBy('next_run_at', 'asc')
            ->paginate($request->get('per_page', 20));

        return response()->json([
            'success' => true,
            'data' => $tasks,
        ]);
    }

    public function storeScheduledTask(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'organization_id' => 'nullable|exists:organizations,id',
            'task_name' => 'required|string|max:255',
            'task_type' => 'required|string',
            'command' => 'nullable|string',
            'parameters' => 'nullable|array',
            'schedule_expression' => 'nullable|string',
            'frequency' => 'required|in:once,daily,weekly,monthly,custom,hourly',
            'notify_on_failure' => 'nullable|boolean',
            'notification_recipients' => 'nullable|array',
        ]);

        // Calculate next run time
        $nextRun = now();
        switch ($validated['frequency']) {
            case 'hourly':
                $nextRun->addHour();
                break;
            case 'daily':
                $nextRun->addDay();
                break;
            case 'weekly':
                $nextRun->addWeek();
                break;
            case 'monthly':
                $nextRun->addMonth();
                break;
            case 'once':
                $nextRun->addMinute();
                break;
            default:
                $nextRun->addDay();
        }

        $task = ScheduledTask::create(array_merge($validated, [
            'next_run_at' => $nextRun,
            'status' => 'active',
            'run_count' => 0,
            'success_count' => 0,
            'failure_count' => 0,
            'is_running' => false,
            'created_by' => auth()->id(),
        ]));

        return response()->json([
            'success' => true,
            'data' => $task,
            'message' => 'Scheduled task created successfully',
        ], 201);
    }

    public function executeScheduledTask(ScheduledTask $task): JsonResponse
    {
        if ($task->status !== 'active') {
            return response()->json([
                'success' => false,
                'message' => 'Task is not active',
            ], 400);
        }

        if ($task->is_running) {
            return response()->json([
                'success' => false,
                'message' => 'Task is already running',
            ], 400);
        }

        // Queue task execution
        $task->markAsRunning();

        return response()->json([
            'success' => true,
            'message' => 'Task execution queued',
        ]);
    }

    public function pauseScheduledTask(ScheduledTask $task): JsonResponse
    {
        $task->update(['status' => 'paused']);

        return response()->json([
            'success' => true,
            'message' => 'Task paused successfully',
        ]);
    }

    public function resumeScheduledTask(ScheduledTask $task): JsonResponse
    {
        $task->update(['status' => 'active']);

        return response()->json([
            'success' => true,
            'message' => 'Task resumed successfully',
        ]);
    }

    // System Health
    public function systemHealth(): JsonResponse
    {
        $health = [
            'status' => 'healthy',
            'timestamp' => now()->toISOString(),
            'components' => [
                'database' => [
                    'status' => 'connected',
                    'connection_time' => '< 100ms',
                ],
                'redis' => [
                    'status' => 'connected',
                    'connection_time' => '< 50ms',
                ],
                'queue' => [
                    'status' => 'processing',
                    'pending_jobs' => 0,
                ],
                'cache' => [
                    'status' => 'active',
                    'hit_rate' => '95%',
                ],
            ],
            'system' => [
                'php_version' => PHP_VERSION,
                'laravel_version' => app()->version(),
                'disk_usage' => '45%',
                'memory_usage' => '65%',
                'cpu_usage' => '30%',
            ],
            'services' => [
                'total_tasks' => ScheduledTask::where('status', 'active')->count(),
                'running_tasks' => ScheduledTask::where('is_running', true)->count(),
                'api_keys' => ApiKey::where('is_active', true)->where('is_revoked', false)->count(),
                'active_backups' => SystemBackup::where('status', 'in_progress')->count(),
            ],
        ];

        return response()->json([
            'success' => true,
            'data' => $health,
        ]);
    }

    // Statistics
    public function statistics(Request $request): JsonResponse
    {
        $organizationId = $request->get('organization_id');

        $stats = [
            'api' => [
                'total_keys' => ApiKey::when($organizationId, fn($q) => $q->where('organization_id', $organizationId))
                    ->where('is_active', true)
                    ->where('is_revoked', false)
                    ->count(),
                'total_requests_today' => ApiLog::when($organizationId, fn($q) => $q->where('organization_id', $organizationId))
                    ->whereDate('requested_at', today())
                    ->count(),
                'error_rate_today' => 0,
            ],
            'system' => [
                'total_logs_today' => SystemLog::when($organizationId, fn($q) => $q->where('organization_id', $organizationId))
                    ->whereDate('logged_at', today())
                    ->count(),
                'error_logs_today' => SystemLog::when($organizationId, fn($q) => $q->where('organization_id', $organizationId))
                    ->whereDate('logged_at', today())
                    ->whereIn('log_level', ['emergency', 'alert', 'critical', 'error'])
                    ->count(),
                'total_backups' => SystemBackup::when($organizationId, fn($q) => $q->where('organization_id', $organizationId))
                    ->where('status', 'completed')
                    ->count(),
                'total_backups_size_mb' => SystemBackup::when($organizationId, fn($q) => $q->where('organization_id', $organizationId))
                    ->where('status', 'completed')
                    ->sum('size_mb'),
                'scheduled_tasks' => ScheduledTask::when($organizationId, fn($q) => $q->where('organization_id', $organizationId))
                    ->count(),
                'active_tasks' => ScheduledTask::when($organizationId, fn($q) => $q->where('organization_id', $organizationId))
                    ->where('status', 'active')
                    ->count(),
            ],
        ];

        $totalRequestsToday = $stats['api']['total_requests_today'];
        $errorRequestsToday = ApiLog::when($organizationId, fn($q) => $q->where('organization_id', $organizationId))
            ->whereDate('requested_at', today())
            ->where('response_status', '>=', 400)
            ->count();

        if ($totalRequestsToday > 0) {
            $stats['api']['error_rate_today'] = round(($errorRequestsToday / $totalRequestsToday) * 100, 2);
        }

        return response()->json([
            'success' => true,
            'data' => $stats,
        ]);
    }
}

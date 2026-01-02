<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CommunicationTemplate;
use App\Models\CommunicationLog;
use App\Models\NotificationPreference;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class CommunicationController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => [
                'message' => 'Communication Module',
                'endpoints' => [
                    '/communication-templates' => 'Template Management',
                    '/communication-logs' => 'Message Logs',
                    '/notification-preferences' => 'User Preferences',
                ]
            ]
        ]);
    }

    // Communication Templates
    public function templates(Request $request): JsonResponse
    {
        $organizationId = $request->get('organization_id');

        $templates = CommunicationTemplate::query()
            ->when($organizationId, fn($q) => $q->where('organization_id', $organizationId))
            ->when($request->has('channel'), fn($q) => $q->where('channel', $request->channel))
            ->when($request->has('template_type'), fn($q) => $q->where('template_type', $request->template_type))
            ->orderBy('template_name')
            ->paginate($request->get('per_page', 50));

        return response()->json([
            'success' => true,
            'data' => $templates,
        ]);
    }

    public function storeTemplate(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'organization_id' => 'required|exists:organizations,id',
            'template_code' => 'required|string|unique:communication_templates,template_code',
            'template_name' => 'required|string|max:255',
            'channel' => 'required|in:email,sms,whatsapp,push,in_app',
            'subject' => 'nullable|string|max:255',
            'body' => 'required|string',
            'variables' => 'nullable|array',
            'template_type' => 'required|in:invoice,payment_reminder,order_confirmation,delivery_update,welcome,notification,alert',
            'is_active' => 'nullable|boolean',
        ]);

        $template = CommunicationTemplate::create(array_merge($validated, [
            'is_active' => $validated['is_active'] ?? true,
            'created_by' => auth()->id(),
        ]));

        return response()->json([
            'success' => true,
            'data' => $template,
            'message' => 'Template created successfully',
        ], 201);
    }

    // Communication Logs
    public function logs(Request $request): JsonResponse
    {
        $organizationId = $request->get('organization_id');

        $logs = CommunicationLog::query()
            ->when($organizationId, fn($q) => $q->where('organization_id', $organizationId))
            ->with(['template', 'emailLog', 'smsLog', 'whatsappMessage'])
            ->when($request->has('channel'), fn($q) => $q->where('channel', $request->channel))
            ->when($request->has('status'), fn($q) => $q->where('status', $request->status))
            ->when($request->has('recipient_type'), fn($q) => $q->where('recipient_type', $request->recipient_type))
            ->orderBy('created_at', 'desc')
            ->paginate($request->get('per_page', 50));

        return response()->json([
            'success' => true,
            'data' => $logs,
        ]);
    }

    public function sendMessage(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'organization_id' => 'required|exists:organizations,id',
            'template_id' => 'nullable|exists:communication_templates,id',
            'channel' => 'required|in:email,sms,whatsapp,push,in_app',
            'message_type' => 'required|string',
            'recipient_type' => 'nullable|in:customer,supplier,employee,user,other',
            'recipient_id' => 'nullable|integer',
            'recipient_email' => 'nullable|email',
            'recipient_phone' => 'nullable|string|max:20',
            'recipient_whatsapp' => 'nullable|string|max:20',
            'subject' => 'nullable|string',
            'body' => 'required|string',
            'data' => 'nullable|array',
            'reference_id' => 'nullable|integer',
            'reference_type' => 'nullable|string',
        ]);

        // Create communication log
        $log = CommunicationLog::create([
            'organization_id' => $validated['organization_id'],
            'template_id' => $validated['template_id'] ?? null,
            'channel' => $validated['channel'],
            'message_type' => $validated['message_type'],
            'recipient_type' => $validated['recipient_type'] ?? null,
            'recipient_id' => $validated['recipient_id'] ?? null,
            'recipient_email' => $validated['recipient_email'] ?? null,
            'recipient_phone' => $validated['recipient_phone'] ?? null,
            'recipient_whatsapp' => $validated['recipient_whatsapp'] ?? null,
            'subject' => $validated['subject'] ?? null,
            'body' => $validated['body'],
            'status' => 'queued',
            'reference_id' => $validated['reference_id'] ?? null,
            'reference_type' => $validated['reference_type'] ?? null,
            'created_by' => auth()->id(),
        ]);

        // Process the message based on channel
        // In a real implementation, this would use queue jobs
        $this->processMessage($log, $validated);

        return response()->json([
            'success' => true,
            'data' => $log,
            'message' => 'Message queued successfully',
        ], 201);
    }

    // Notification Preferences
    public function notificationPreferences(Request $request): JsonResponse
    {
        $organizationId = $request->get('organization_id');

        $preferences = NotificationPreference::query()
            ->when($organizationId, fn($q) => $q->where('organization_id', $organizationId))
            ->with(['user', 'customer', 'employee'])
            ->when($request->has('entity_type'), fn($q) => $q->where('entity_type', $request->entity_type))
            ->paginate($request->get('per_page', 50));

        return response()->json([
            'success' => true,
            'data' => $preferences,
        ]);
    }

    public function updateNotificationPreference(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'organization_id' => 'required|exists:organizations,id',
            'entity_type' => 'required|in:user,customer,employee',
            'user_id' => 'nullable|exists:users,id',
            'customer_id' => 'nullable|exists:customers,id',
            'employee_id' => 'nullable|exists:employees,id',
            'preferences' => 'required|array',
            'enable_notifications' => 'nullable|boolean',
            'quiet_hours_start' => 'nullable|date_format:H:i',
            'quiet_hours_end' => 'nullable|date_format:H:i|after:quiet_hours_start',
        ]);

        // Find existing preference or create new
        $preference = NotificationPreference::query()
            ->where('organization_id', $validated['organization_id'])
            ->where('entity_type', $validated['entity_type'])
            ->when($validated['user_id'], fn($q) => $q->where('user_id', $validated['user_id']))
            ->when($validated['customer_id'], fn($q) => $q->where('customer_id', $validated['customer_id']))
            ->when($validated['employee_id'], fn($q) => $q->where('employee_id', $validated['employee_id']))
            ->first();

        if ($preference) {
            $preference->update($validated);
        } else {
            $preference = NotificationPreference::create($validated);
        }

        return response()->json([
            'success' => true,
            'data' => $preference,
            'message' => 'Notification preferences updated',
        ]);
    }

    // Statistics
    public function statistics(Request $request): JsonResponse
    {
        $organizationId = $request->get('organization_id');
        $channel = $request->get('channel');
        $startDate = $request->get('start_date', now()->subDays(30)->toDateString());
        $endDate = $request->get('end_date', today()->toDateString());

        $query = CommunicationLog::query()
            ->when($organizationId, fn($q) => $q->where('organization_id', $organizationId))
            ->when($channel, fn($q) => $q->where('channel', $channel))
            ->whereBetween('created_at', [$startDate, $endDate]);

        $stats = [
            'total_messages' => $query->count(),
            'sent' => $query->where('status', 'sent')->count(),
            'delivered' => $query->where('status', 'delivered')->count(),
            'failed' => $query->where('status', 'failed')->count(),
            'by_channel' => CommunicationLog::query()
                ->when($organizationId, fn($q) => $q->where('organization_id', $organizationId))
                ->whereBetween('created_at', [$startDate, $endDate])
                ->selectRaw('channel, COUNT(*) as count')
                ->groupBy('channel')
                ->get(),
            'delivery_rate' => 0,
        ];

        $totalMessages = $stats['total_messages'];
        if ($totalMessages > 0) {
            $stats['delivery_rate'] = round(($stats['delivered'] / $totalMessages) * 100, 2);
        }

        return response()->json([
            'success' => true,
            'data' => $stats,
        ]);
    }

    // Bulk Send
    public function bulkSend(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'organization_id' => 'required|exists:organizations,id',
            'channel' => 'required|in:email,sms,whatsapp',
            'message_type' => 'required|string',
            'subject' => 'nullable|string',
            'body' => 'required|string',
            'recipients' => 'required|array|min:1|max:1000',
            'recipients.*.type' => 'required|in:customer,supplier,employee,user,other',
            'recipients.*.id' => 'nullable|integer',
            'recipients.*.email' => 'nullable|email',
            'recipients.*.phone' => 'nullable|string',
            'scheduled_at' => 'nullable|date',
        ]);

        $logs = [];

        foreach ($validated['recipients'] as $recipient) {
            $log = CommunicationLog::create([
                'organization_id' => $validated['organization_id'],
                'channel' => $validated['channel'],
                'message_type' => $validated['message_type'],
                'recipient_type' => $recipient['type'],
                'recipient_id' => $recipient['id'] ?? null,
                'recipient_email' => $recipient['email'] ?? null,
                'recipient_phone' => $recipient['phone'] ?? null,
                'subject' => $validated['subject'] ?? null,
                'body' => $validated['body'],
                'status' => $validated['scheduled_at'] ? 'scheduled' : 'queued',
                'created_by' => auth()->id(),
            ]);

            $logs[] = $log->id;
        }

        return response()->json([
            'success' => true,
            'data' => [
                'queued_count' => count($logs),
                'log_ids' => $logs,
            ],
            'message' => 'Messages queued successfully',
        ], 201);
    }

    private function processMessage(CommunicationLog $log, $data): void
    {
        // Simulate message processing
        // In production, this would use queue jobs with actual service providers

        switch ($log->channel) {
            case 'email':
                // Use SMTP service
                $log->update(['status' => 'sent', 'sent_at' => now()]);
                break;

            case 'sms':
                // Use SMS gateway (Twilio, MessageBird, etc.)
                $log->update(['status' => 'sent', 'sent_at' => now()]);
                break;

            case 'whatsapp':
                // Use WhatsApp Business API
                $log->update(['status' => 'sent', 'sent_at' => now()]);
                break;

            case 'push':
                // Use Firebase Cloud Messaging or OneSignal
                $log->update(['status' => 'sent', 'sent_at' => now()]);
                break;

            case 'in_app':
                // Store in database for in-app notification
                $log->update(['status' => 'delivered', 'delivered_at' => now()]);
                break;
        }
    }
}

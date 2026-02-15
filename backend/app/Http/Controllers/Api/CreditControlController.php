<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CreditControl;
use App\Models\PaymentReminder;
use App\Models\Collection;
use App\Models\CreditTransaction;
use App\Models\CreditReview;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class CreditControlController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $organizationId = $request->get('organization_id');

        $creditControls = CreditControl::query()
            ->when($organizationId, fn($q) => $q->where('organization_id', $organizationId))
            ->with(['customer', 'customer.organization'])
            ->when($request->has('status'), fn($q) => $q->where('credit_status', $request->status))
            ->when($request->has('risk_level'), fn($q) => $q->where('risk_level', $request->risk_level))
            ->when($request->has('credit_hold'), fn($q) => $q->where('credit_hold', $request->boolean('credit_hold')))
            ->paginate($request->get('per_page', 20));

        return response()->json([
            'success' => true,
            'data' => $creditControls,
        ]);
    }

    public function show(CreditControl $creditControl): JsonResponse
    {
        $creditControl->load([
            'customer',
            'customer.organization',
            'collections',
            'creditTransactions',
            'creditReviews',
            'paymentReminders',
        ]);

        return response()->json([
            'success' => true,
            'data' => $creditControl,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'organization_id' => 'required|exists:organizations,id',
            'customer_id' => 'required|exists:customers,id',
            'credit_limit' => 'required|numeric|min:0',
            'credit_days' => 'nullable|integer|min:0',
            'payment_terms' => 'nullable|in:cod,advance,net_15,net_30,net_45,net_60,net_90,custom',
            'custom_payment_terms' => 'nullable|string|max:255',
            'credit_notes' => 'nullable|string',
        ]);

        $creditControl = CreditControl::create($validated);
        $creditControl->updateAvailableCredit();
        $creditControl->updateCreditScore();
        $creditControl->updateCreditStatus();

        return response()->json([
            'success' => true,
            'data' => $creditControl,
            'message' => 'Credit control created successfully',
        ], 201);
    }

    public function update(Request $request, CreditControl $creditControl): JsonResponse
    {
        $validated = $request->validate([
            'credit_limit' => 'sometimes|required|numeric|min:0',
            'credit_days' => 'sometimes|integer|min:0',
            'payment_terms' => 'sometimes|in:cod,advance,net_15,net_30,net_45,net_60,net_90,custom',
            'custom_payment_terms' => 'sometimes|string|max:255',
            'credit_notes' => 'sometimes|string',
        ]);

        $creditControl->update($validated);
        $creditControl->updateAvailableCredit();
        $creditControl->updateCreditScore();
        $creditControl->updateCreditStatus();

        return response()->json([
            'success' => true,
            'data' => $creditControl,
            'message' => 'Credit control updated successfully',
        ]);
    }

    public function placeOnHold(Request $request, CreditControl $creditControl): JsonResponse
    {
        $validated = $request->validate([
            'reason' => 'required|string|max:500',
        ]);

        $creditControl->placeOnHold($validated['reason']);

        return response()->json([
            'success' => true,
            'message' => 'Credit hold placed successfully',
        ]);
    }

    public function releaseHold(CreditControl $creditControl): JsonResponse
    {
        $creditControl->releaseHold();

        return response()->json([
            'success' => true,
            'message' => 'Credit hold released successfully',
        ]);
    }

    public function transactions(Request $request, CreditControl $creditControl): JsonResponse
    {
        $startDate = $request->get('start_date');
        $endDate = $request->get('end_date');

        $query = $creditControl->creditTransactions()
            ->orderBy('transaction_date', 'desc');

        if ($startDate && $endDate) {
            $query->whereBetween('transaction_date', [$startDate, $endDate]);
        }

        $transactions = $query->paginate($request->get('per_page', 20));

        return response()->json([
            'success' => true,
            'data' => $transactions,
        ]);
    }

    public function agingReport(Request $request): JsonResponse
    {
        $organizationId = $request->get('organization_id');

        $agingBuckets = [
            '0_30' => 0,
            '31_60' => 0,
            '61_90' => 0,
            '91_120' => 0,
            'over_120' => 0,
        ];

        $creditControls = CreditControl::query()
            ->when($organizationId, fn($q) => $q->where('organization_id', $organizationId))
            ->where('current_balance', '>', 0)
            ->get();

        foreach ($creditControls as $cc) {
            $daysOverdue = $cc->days_overdue;
            $amount = $cc->current_balance;

            if ($daysOverdue <= 30) {
                $agingBuckets['0_30'] += $amount;
            } elseif ($daysOverdue <= 60) {
                $agingBuckets['31_60'] += $amount;
            } elseif ($daysOverdue <= 90) {
                $agingBuckets['61_90'] += $amount;
            } elseif ($daysOverdue <= 120) {
                $agingBuckets['91_120'] += $amount;
            } else {
                $agingBuckets['over_120'] += $amount;
            }
        }

        return response()->json([
            'success' => true,
            'data' => [
                'buckets' => $agingBuckets,
                'total_overdue' => array_sum($agingBuckets),
                'customer_count' => $creditControls->count(),
            ],
        ]);
    }

    public function creditScoreDistribution(Request $request): JsonResponse
    {
        $organizationId = $request->get('organization_id');

        $distribution = CreditControl::query()
            ->when($organizationId, fn($q) => $q->where('organization_id', $organizationId))
            ->selectRaw('
                CASE
                    WHEN credit_score >= 80 THEN "Excellent"
                    WHEN credit_score >= 60 THEN "Good"
                    WHEN credit_score >= 40 THEN "Fair"
                    WHEN credit_score >= 20 THEN "Poor"
                    ELSE "Very Poor"
                END as score_range,
                COUNT(*) as count,
                AVG(credit_score) as avg_score
            ')
            ->groupBy('score_range')
            ->orderBy('avg_score', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $distribution,
        ]);
    }

    public function riskAnalysis(Request $request): JsonResponse
    {
        $organizationId = $request->get('organization_id');

        $analysis = [
            'total_customers' => CreditControl::when($organizationId, fn($q) => $q->where('organization_id', $organizationId))->count(),
            'low_risk' => CreditControl::when($organizationId, fn($q) => $q->where('organization_id', $organizationId))->where('risk_level', 'low')->count(),
            'medium_risk' => CreditControl::when($organizationId, fn($q) => $q->where('organization_id', $organizationId))->where('risk_level', 'medium')->count(),
            'high_risk' => CreditControl::when($organizationId, fn($q) => $q->where('organization_id', $organizationId))->where('risk_level', 'high')->count(),
            'critical_risk' => CreditControl::when($organizationId, fn($q) => $q->where('organization_id', $organizationId))->where('risk_level', 'critical')->count(),
            'on_hold' => CreditControl::when($organizationId, fn($q) => $q->where('organization_id', $organizationId))->where('credit_hold', true)->count(),
            'over_limit' => CreditControl::when($organizationId, fn($q) => $q->where('organization_id', $organizationId))
                ->whereRaw('current_balance > credit_limit')
                ->count(),
            'total_exposure' => CreditControl::when($organizationId, fn($q) => $q->where('organization_id', $organizationId))
                ->sum('current_balance'),
            'total_credit_limit' => CreditControl::when($organizationId, fn($q) => $q->where('organization_id', $organizationId))
                ->sum('credit_limit'),
            'avg_credit_utilization' => 0,
        ];

        if ($analysis['total_credit_limit'] > 0) {
            $analysis['avg_credit_utilization'] = round(
                ($analysis['total_exposure'] / $analysis['total_credit_limit']) * 100,
                2
            );
        }

        return response()->json([
            'success' => true,
            'data' => $analysis,
        ]);
    }

    public function createReview(Request $request, CreditControl $creditControl): JsonResponse
    {
        $validated = $request->validate([
            'new_credit_limit' => 'required|numeric|min:0',
            'review_notes' => 'nullable|string',
            'justification' => 'required|string',
        ]);

        $review = CreditReview::create([
            'organization_id' => $creditControl->organization_id,
            'customer_id' => $creditControl->customer_id,
            'credit_control_id' => $creditControl->id,
            'review_date' => now(),
            'old_credit_limit' => $creditControl->credit_limit,
            'new_credit_limit' => $validated['new_credit_limit'],
            'old_credit_score' => $creditControl->credit_score,
            'old_risk_level' => $creditControl->risk_level,
            'old_status' => $creditControl->credit_status,
            'review_notes' => $validated['review_notes'] ?? null,
            'justification' => $validated['justification'],
            'reviewed_by' => auth()->id(),
        ]);

        return response()->json([
            'success' => true,
            'data' => $review,
            'message' => 'Credit review created successfully',
        ], 201);
    }

    public function approveReview(Request $request, CreditReview $review): JsonResponse
    {
        $review->load('creditControl');

        $review->update([
            'approved' => true,
            'approved_by' => auth()->id(),
            'new_credit_score' => $review->creditControl->credit_score ?? null,
            'new_risk_level' => $review->creditControl->risk_level ?? null,
            'new_status' => $review->creditControl->credit_status ?? null,
        ]);

        // Update credit control if approved
        if ($review->approved) {
            $review->creditControl->update([
                'credit_limit' => $review->new_credit_limit,
            ]);
            $review->creditControl->updateAvailableCredit();
        }

        return response()->json([
            'success' => true,
            'message' => 'Credit review approved successfully',
        ]);
    }

    public function sendReminder(Request $request, CreditControl $creditControl): JsonResponse
    {
        $validated = $request->validate([
            'reminder_type' => 'required|in:payment_due,overdue,credit_hold,collection_call,legal_notice',
            'method' => 'required|in:email,sms,whatsapp,post,phone',
            'message' => 'nullable|string',
        ]);

        $creditControl->load('customer');

        $reminder = PaymentReminder::create([
            'organization_id' => $creditControl->organization_id,
            'customer_id' => $creditControl->customer_id,
            'reminder_type' => $validated['reminder_type'],
            'status' => 'pending',
            'scheduled_at' => now(),
            'method' => $validated['method'],
            'message' => $validated['message'] ?? null,
            'recipient_email' => $creditControl->customer->email ?? null,
            'recipient_phone' => $creditControl->customer->phone ?? null,
            'created_by' => auth()->id(),
        ]);

        return response()->json([
            'success' => true,
            'data' => $reminder,
            'message' => 'Payment reminder scheduled successfully',
        ], 201);
    }

    public function statistics(Request $request): JsonResponse
    {
        $organizationId = $request->get('organization_id');

        $stats = [
            'total_credit_limit' => CreditControl::when($organizationId, fn($q) => $q->where('organization_id', $organizationId))->sum('credit_limit'),
            'total_outstanding' => CreditControl::when($organizationId, fn($q) => $q->where('organization_id', $organizationId))->sum('current_balance'),
            'total_available' => CreditControl::when($organizationId, fn($q) => $q->where('organization_id', $organizationId))->sum('available_credit'),
            'avg_credit_score' => CreditControl::when($organizationId, fn($q) => $q->where('organization_id', $organizationId))->avg('credit_score'),
            'good_standing' => CreditControl::when($organizationId, fn($q) => $q->where('organization_id', $organizationId))->where('credit_status', 'good')->count(),
            'on_watch' => CreditControl::when($organizationId, fn($q) => $q->where('organization_id', $organizationId))->where('credit_status', 'watch')->count(),
            'on_hold' => CreditControl::when($organizationId, fn($q) => $q->where('organization_id', $organizationId))->where('credit_status', 'hold')->count(),
            'blocked' => CreditControl::when($organizationId, fn($q) => $q->where('organization_id', $organizationId))->where('credit_status', 'blocked')->count(),
        ];

        return response()->json([
            'success' => true,
            'data' => $stats,
        ]);
    }
}

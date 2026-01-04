<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Collection;
use App\Models\CreditControl;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class CollectionController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $organizationId = $request->get('organization_id');

        $collections = Collection::query()
            ->when($organizationId, fn($q) => $q->where('organization_id', $organizationId))
            ->with(['customer', 'customer.organization', 'collectedBy'])
            ->when($request->has('status'), fn($q) => $q->where('collection_status', $request->status))
            ->when($request->has('customer_id'), fn($q) => $q->where('customer_id', $request->customer_id))
            ->when($request->has('from_date'), fn($q) => $q->where('collection_date', '>=', $request->from_date))
            ->when($request->has('to_date'), fn($q) => $q->where('collection_date', '<=', $request->to_date))
            ->orderBy('collection_date', 'desc')
            ->paginate($request->get('per_page', 20));

        return response()->json([
            'success' => true,
            'data' => $collections,
        ]);
    }

    public function show(Collection $collection): JsonResponse
    {
        $collection->load([
            'customer',
            'customer.organization',
            'customer.creditControl',
            'collectedBy',
            'creditTransactions',
        ]);

        return response()->json([
            'success' => true,
            'data' => $collection,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'organization_id' => 'required|exists:organizations,id',
            'customer_id' => 'required|exists:customers,id',
            'collection_date' => 'required|date',
            'amount_due' => 'required|numeric|min:0',
            'collection_notes' => 'nullable|string',
        ]);

        // Generate collection number
        $collectionNumber = 'COL-' . date('Ymd') . '-' . str_pad(Collection::count() + 1, 4, '0', STR_PAD_LEFT);

        $collection = Collection::create(array_merge($validated, [
            'collection_number' => $collectionNumber,
            'amount_collected' => 0,
            'amount_waived' => 0,
            'balance_remaining' => $validated['amount_due'],
            'collection_status' => 'pending',
        ]));

        return response()->json([
            'success' => true,
            'data' => $collection,
            'message' => 'Collection created successfully',
        ], 201);
    }

    public function recordPayment(Request $request, Collection $collection): JsonResponse
    {
        $validated = $request->validate([
            'amount' => 'required|numeric|min:0',
            'payment_method' => 'required|in:cash,cheque,bank_transfer,card,online,offset',
            'reference_number' => 'nullable|string|max:100',
            'bank_name' => 'nullable|string|max:100',
            'cheque_number' => 'nullable|string|max:50',
            'cheque_date' => 'nullable|date',
            'collection_notes' => 'nullable|string',
        ]);

        $collection->payment_method = $validated['payment_method'];
        $collection->reference_number = $validated['reference_number'] ?? null;
        $collection->bank_name = $validated['bank_name'] ?? null;
        $collection->cheque_number = $validated['cheque_number'] ?? null;
        $collection->cheque_date = $validated['cheque_date'] ?? null;

        if (!empty($validated['collection_notes'])) {
            $collection->collection_notes .= "\n" . $validated['collection_notes'];
        }

        $collection->recordPayment($validated['amount'], $validated['payment_method'], $validated['reference_number'] ?? null);

        return response()->json([
            'success' => true,
            'data' => $collection,
            'message' => 'Payment recorded successfully',
        ]);
    }

    public function waiveAmount(Request $request, Collection $collection): JsonResponse
    {
        $validated = $request->validate([
            'amount' => 'required|numeric|min:0',
            'reason' => 'required|string|max:500',
        ]);

        $collection->waiveAmount($validated['amount'], $validated['reason']);

        return response()->json([
            'success' => true,
            'data' => $collection,
            'message' => 'Amount waived successfully',
        ]);
    }

    public function markAsDisputed(Request $request, Collection $collection): JsonResponse
    {
        $validated = $request->validate([
            'dispute_reason' => 'required|string|max:500',
        ]);

        $collection->markAsDisputed($validated['dispute_reason']);

        return response()->json([
            'success' => true,
            'data' => $collection,
            'message' => 'Collection marked as disputed',
        ]);
    }

    public function destroy(Collection $collection): JsonResponse
    {
        $collection->delete();

        return response()->json([
            'success' => true,
            'message' => 'Collection deleted successfully',
        ]);
    }

    public function summary(Request $request): JsonResponse
    {
        $organizationId = $request->get('organization_id');
        $startDate = $request->get('start_date', now()->startOfMonth());
        $endDate = $request->get('end_date', now()->endOfMonth());

        $summary = Collection::query()
            ->whereBetween('collection_date', [$startDate, $endDate])
            ->when($organizationId, fn($q) => $q->where('organization_id', $organizationId))
            ->selectRaw('
                collection_status,
                COUNT(*) as count,
                SUM(amount_due) as total_due,
                SUM(amount_collected) as total_collected,
                SUM(amount_waived) as total_waived,
                SUM(balance_remaining) as total_remaining,
                AVG(amount_collected / NULLIF(amount_due, 0)) * 100 as avg_collection_rate
            ')
            ->groupBy('collection_status')
            ->get();

        $totals = [
            'total_collections' => Collection::whereBetween('collection_date', [$startDate, $endDate])
                ->when($organizationId, fn($q) => $q->where('organization_id', $organizationId))
                ->count(),
            'total_amount_due' => Collection::whereBetween('collection_date', [$startDate, $endDate])
                ->when($organizationId, fn($q) => $q->where('organization_id', $organizationId))
                ->sum('amount_due'),
            'total_amount_collected' => Collection::whereBetween('collection_date', [$startDate, $endDate])
                ->when($organizationId, fn($q) => $q->where('organization_id', $organizationId))
                ->sum('amount_collected'),
            'total_amount_waived' => Collection::whereBetween('collection_date', [$startDate, $endDate])
                ->when($organizationId, fn($q) => $q->where('organization_id', $organizationId))
                ->sum('amount_waived'),
            'collection_rate' => 0,
        ];

        if ($totals['total_amount_due'] > 0) {
            $totals['collection_rate'] = round(
                ($totals['total_amount_collected'] / $totals['total_amount_due']) * 100,
                2
            );
        }

        return response()->json([
            'success' => true,
            'data' => [
                'by_status' => $summary,
                'totals' => $totals,
            ],
        ]);
    }
}

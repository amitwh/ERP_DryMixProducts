<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\StockTransaction;
use App\Models\Inventory;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class StockTransactionController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = StockTransaction::query();

        if ($request->has('organization_id')) {
            $query->where('organization_id', $request->organization_id);
        }

        if ($request->has('manufacturing_unit_id')) {
            $query->where('manufacturing_unit_id', $request->manufacturing_unit_id);
        }

        if ($request->has('product_id')) {
            $query->where('product_id', $request->product_id);
        }

        if ($request->has('transaction_type')) {
            $query->where('transaction_type', $request->transaction_type);
        }

        if ($request->has('start_date') && $request->has('end_date')) {
            $query->byDateRange($request->start_date, $request->end_date);
        }

        $perPage = $request->get('per_page', 15);
        $transactions = $query->with(['product', 'manufacturingUnit', 'createdBy'])->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $transactions,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'organization_id' => 'required|exists:organizations,id',
            'manufacturing_unit_id' => 'required|exists:manufacturing_units,id',
            'product_id' => 'required|exists:products,id',
            'transaction_number' => 'required|string|unique:stock_transactions,transaction_number',
            'transaction_type' => 'required|in:receipt,issue,transfer,adjustment,return',
            'quantity' => 'required|numeric',
            'transaction_date' => 'required|date',
            'created_by' => 'required|exists:users,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        DB::beginTransaction();
        try {
            $transaction = StockTransaction::create($request->all());

            // Update inventory
            $inventory = Inventory::where('manufacturing_unit_id', $request->manufacturing_unit_id)
                                  ->where('product_id', $request->product_id)
                                  ->first();

            if ($inventory) {
                $quantity = $request->quantity;
                
                switch ($request->transaction_type) {
                    case 'receipt':
                    case 'return':
                        $inventory->quantity_on_hand += $quantity;
                        break;
                    case 'issue':
                        $inventory->quantity_on_hand -= $quantity;
                        break;
                    case 'adjustment':
                        $inventory->quantity_on_hand = $quantity;
                        break;
                }

                $inventory->quantity_available = $inventory->quantity_on_hand - $inventory->quantity_reserved;
                $inventory->save();
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Stock transaction recorded successfully',
                'data' => $transaction->load(['product', 'manufacturingUnit', 'createdBy']),
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to record stock transaction',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function show(StockTransaction $stockTransaction): JsonResponse
    {
        $stockTransaction->load(['product', 'manufacturingUnit', 'createdBy']);

        return response()->json([
            'success' => true,
            'data' => $stockTransaction,
        ]);
    }

    public function summary(Request $request): JsonResponse
    {
        $query = StockTransaction::query();

        if ($request->has('organization_id')) {
            $query->where('organization_id', $request->organization_id);
        }

        if ($request->has('manufacturing_unit_id')) {
            $query->where('manufacturing_unit_id', $request->manufacturing_unit_id);
        }

        if ($request->has('start_date') && $request->has('end_date')) {
            $query->byDateRange($request->start_date, $request->end_date);
        }

        $summary = [
            'total_receipts' => $query->clone()->receipts()->sum('quantity'),
            'total_issues' => $query->clone()->issues()->sum('quantity'),
            'total_transactions' => $query->count(),
        ];

        return response()->json([
            'success' => true,
            'data' => $summary,
        ]);
    }
}

<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\GoodsReceiptNote;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;

class GoodsReceiptNoteController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = GoodsReceiptNote::query();

        if ($request->has('organization_id')) {
            $query->where('organization_id', $request->organization_id);
        }

        if ($request->has('purchase_order_id')) {
            $query->where('purchase_order_id', $request->purchase_order_id);
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $perPage = $request->get('per_page', 15);
        $grns = $query->with(['purchaseOrder', 'supplier', 'receivedBy', 'inspectedBy'])->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $grns,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'organization_id' => 'required|exists:organizations,id',
            'purchase_order_id' => 'required|exists:purchase_orders,id',
            'supplier_id' => 'required|exists:suppliers,id',
            'grn_number' => 'required|string|unique:goods_receipt_notes,grn_number',
            'grn_date' => 'required|date',
            'received_by' => 'required|exists:users,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        $grn = GoodsReceiptNote::create($request->all());

        return response()->json([
            'success' => true,
            'message' => 'GRN created successfully',
            'data' => $grn->load(['purchaseOrder', 'supplier', 'receivedBy']),
        ], 201);
    }

    public function show(GoodsReceiptNote $goodsReceiptNote): JsonResponse
    {
        $goodsReceiptNote->load(['purchaseOrder.items.product', 'supplier', 'receivedBy', 'inspectedBy']);

        return response()->json([
            'success' => true,
            'data' => $goodsReceiptNote,
        ]);
    }

    public function update(Request $request, GoodsReceiptNote $goodsReceiptNote): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'status' => 'in:pending_inspection,accepted,partially_accepted,rejected',
            'inspected_by' => 'nullable|exists:users,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        $goodsReceiptNote->update($request->all());

        return response()->json([
            'success' => true,
            'message' => 'GRN updated successfully',
            'data' => $goodsReceiptNote->load(['purchaseOrder', 'supplier', 'inspectedBy']),
        ]);
    }

    public function destroy(GoodsReceiptNote $goodsReceiptNote): JsonResponse
    {
        $goodsReceiptNote->delete();

        return response()->json([
            'success' => true,
            'message' => 'GRN deleted successfully',
        ]);
    }
}

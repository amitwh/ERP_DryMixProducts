<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ProductionOrder;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;

class ProductionOrderController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = ProductionOrder::query();

        if ($request->has('organization_id')) {
            $query->where('organization_id', $request->organization_id);
        }

        if ($request->has('manufacturing_unit_id')) {
            $query->where('manufacturing_unit_id', $request->manufacturing_unit_id);
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('priority')) {
            $query->byPriority($request->priority);
        }

        $perPage = $request->get('per_page', 15);
        $orders = $query->with(['product', 'manufacturingUnit', 'supervisor', 'batches'])->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $orders,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'organization_id' => 'required|exists:organizations,id',
            'manufacturing_unit_id' => 'required|exists:manufacturing_units,id',
            'product_id' => 'required|exists:products,id',
            'order_number' => 'required|string|unique:production_orders,order_number',
            'order_date' => 'required|date',
            'planned_quantity' => 'required|numeric|min:0.01',
            'planned_start_date' => 'nullable|date',
            'planned_completion_date' => 'nullable|date|after:planned_start_date',
            'priority' => 'in:low,normal,high,urgent',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        $order = ProductionOrder::create($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Production order created successfully',
            'data' => $order->load(['product', 'manufacturingUnit', 'supervisor']),
        ], 201);
    }

    public function show(ProductionOrder $productionOrder): JsonResponse
    {
        $productionOrder->load(['product', 'manufacturingUnit', 'supervisor', 'batches.materialConsumptions']);

        return response()->json([
            'success' => true,
            'data' => $productionOrder,
        ]);
    }

    public function update(Request $request, ProductionOrder $productionOrder): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'planned_quantity' => 'sometimes|numeric|min:0.01',
            'actual_quantity' => 'sometimes|numeric|min:0',
            'status' => 'in:draft,scheduled,in_progress,completed,cancelled',
            'priority' => 'in:low,normal,high,urgent',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        $productionOrder->update($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Production order updated successfully',
            'data' => $productionOrder->load(['product', 'manufacturingUnit']),
        ]);
    }

    public function destroy(ProductionOrder $productionOrder): JsonResponse
    {
        if ($productionOrder->status !== 'draft') {
            return response()->json([
                'success' => false,
                'message' => 'Only draft production orders can be deleted',
            ], 400);
        }

        $productionOrder->delete();

        return response()->json([
            'success' => true,
            'message' => 'Production order deleted successfully',
        ]);
    }

    public function complete(ProductionOrder $productionOrder): JsonResponse
    {
        if ($productionOrder->status !== 'in_progress') {
            return response()->json([
                'success' => false,
                'message' => 'Only in-progress orders can be completed',
            ], 400);
        }

        $productionOrder->update([
            'status' => 'completed',
            'actual_completion_date' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Production order completed successfully',
            'data' => $productionOrder,
        ]);
    }
}

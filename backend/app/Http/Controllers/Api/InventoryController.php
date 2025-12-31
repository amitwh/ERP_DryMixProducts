<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Inventory;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;

class InventoryController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Inventory::query();

        if ($request->has('organization_id')) {
            $query->where('organization_id', $request->organization_id);
        }

        if ($request->has('manufacturing_unit_id')) {
            $query->where('manufacturing_unit_id', $request->manufacturing_unit_id);
        }

        if ($request->has('product_id')) {
            $query->where('product_id', $request->product_id);
        }

        if ($request->has('low_stock')) {
            $query->lowStock();
        }

        if ($request->has('out_of_stock')) {
            $query->outOfStock();
        }

        $perPage = $request->get('per_page', 15);
        $inventory = $query->with(['product', 'manufacturingUnit'])->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $inventory,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'organization_id' => 'required|exists:organizations,id',
            'manufacturing_unit_id' => 'required|exists:manufacturing_units,id',
            'product_id' => 'required|exists:products,id',
            'quantity_on_hand' => 'required|numeric|min:0',
            'minimum_stock' => 'nullable|numeric|min:0',
            'maximum_stock' => 'nullable|numeric|min:0',
            'reorder_level' => 'nullable|numeric|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        $inventoryData = $request->all();
        $inventoryData['quantity_available'] = $inventoryData['quantity_on_hand'] - ($inventoryData['quantity_reserved'] ?? 0);

        $inventory = Inventory::create($inventoryData);

        return response()->json([
            'success' => true,
            'message' => 'Inventory record created successfully',
            'data' => $inventory->load(['product', 'manufacturingUnit']),
        ], 201);
    }

    public function show(Inventory $inventory): JsonResponse
    {
        $inventory->load(['product', 'manufacturingUnit', 'stockTransactions']);

        return response()->json([
            'success' => true,
            'data' => $inventory,
        ]);
    }

    public function update(Request $request, Inventory $inventory): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'quantity_on_hand' => 'sometimes|numeric|min:0',
            'quantity_reserved' => 'sometimes|numeric|min:0',
            'minimum_stock' => 'nullable|numeric|min:0',
            'maximum_stock' => 'nullable|numeric|min:0',
            'reorder_level' => 'nullable|numeric|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        $data = $request->all();
        if ($request->has('quantity_on_hand') || $request->has('quantity_reserved')) {
            $qtyOnHand = $request->get('quantity_on_hand', $inventory->quantity_on_hand);
            $qtyReserved = $request->get('quantity_reserved', $inventory->quantity_reserved);
            $data['quantity_available'] = $qtyOnHand - $qtyReserved;
        }

        $inventory->update($data);

        return response()->json([
            'success' => true,
            'message' => 'Inventory updated successfully',
            'data' => $inventory->load(['product', 'manufacturingUnit']),
        ]);
    }

    public function destroy(Inventory $inventory): JsonResponse
    {
        $inventory->delete();

        return response()->json([
            'success' => true,
            'message' => 'Inventory record deleted successfully',
        ]);
    }

    public function alerts(Request $request): JsonResponse
    {
        $query = Inventory::query();

        if ($request->has('organization_id')) {
            $query->where('organization_id', $request->organization_id);
        }

        $lowStock = $query->lowStock()->with(['product', 'manufacturingUnit'])->get();
        $outOfStock = $query->outOfStock()->with(['product', 'manufacturingUnit'])->get();

        return response()->json([
            'success' => true,
            'data' => [
                'low_stock' => $lowStock,
                'out_of_stock' => $outOfStock,
                'low_stock_count' => $lowStock->count(),
                'out_of_stock_count' => $outOfStock->count(),
            ],
        ]);
    }
}

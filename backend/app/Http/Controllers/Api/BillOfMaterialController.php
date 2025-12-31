<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\BillOfMaterial;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class BillOfMaterialController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = BillOfMaterial::query();

        if ($request->has('organization_id')) {
            $query->where('organization_id', $request->organization_id);
        }

        if ($request->has('product_id')) {
            $query->where('product_id', $request->product_id);
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('active')) {
            $query->active();
        }

        $perPage = $request->get('per_page', 15);
        $boms = $query->with(['product', 'items.rawMaterial'])->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $boms,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'organization_id' => 'required|exists:organizations,id',
            'product_id' => 'required|exists:products,id',
            'bom_number' => 'required|string|unique:bill_of_materials,bom_number',
            'effective_date' => 'required|date',
            'output_quantity' => 'required|numeric|min:0.01',
            'items' => 'required|array|min:1',
            'items.*.raw_material_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|numeric|min:0.01',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        DB::beginTransaction();
        try {
            $bom = BillOfMaterial::create($request->except('items'));

            foreach ($request->items as $index => $item) {
                $bom->items()->create([
                    'raw_material_id' => $item['raw_material_id'],
                    'quantity' => $item['quantity'],
                    'unit_of_measure' => $item['unit_of_measure'] ?? 'KG',
                    'wastage_percentage' => $item['wastage_percentage'] ?? 0,
                    'sequence' => $index + 1,
                    'notes' => $item['notes'] ?? null,
                ]);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Bill of Material created successfully',
                'data' => $bom->load(['product', 'items.rawMaterial']),
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to create BOM',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function show(BillOfMaterial $billOfMaterial): JsonResponse
    {
        $billOfMaterial->load(['product', 'items.rawMaterial']);

        return response()->json([
            'success' => true,
            'data' => $billOfMaterial,
        ]);
    }

    public function update(Request $request, BillOfMaterial $billOfMaterial): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'effective_date' => 'sometimes|date',
            'expiry_date' => 'nullable|date|after:effective_date',
            'status' => 'in:draft,active,inactive,superseded',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        $billOfMaterial->update($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Bill of Material updated successfully',
            'data' => $billOfMaterial->load(['product', 'items.rawMaterial']),
        ]);
    }

    public function activate(BillOfMaterial $billOfMaterial): JsonResponse
    {
        if ($billOfMaterial->status === 'active') {
            return response()->json([
                'success' => false,
                'message' => 'BOM is already active',
            ], 400);
        }

        // Deactivate other BOMs for the same product
        BillOfMaterial::where('product_id', $billOfMaterial->product_id)
                      ->where('status', 'active')
                      ->update(['status' => 'superseded']);

        $billOfMaterial->update(['status' => 'active']);

        return response()->json([
            'success' => true,
            'message' => 'Bill of Material activated successfully',
            'data' => $billOfMaterial,
        ]);
    }

    public function destroy(BillOfMaterial $billOfMaterial): JsonResponse
    {
        if ($billOfMaterial->status === 'active') {
            return response()->json([
                'success' => false,
                'message' => 'Active BOMs cannot be deleted',
            ], 400);
        }

        $billOfMaterial->delete();

        return response()->json([
            'success' => true,
            'message' => 'Bill of Material deleted successfully',
        ]);
    }

    public function costAnalysis(BillOfMaterial $billOfMaterial): JsonResponse
    {
        $billOfMaterial->load(['items.rawMaterial']);

        $totalCost = $billOfMaterial->items->sum(function($item) {
            return $item->quantity_with_wastage * ($item->rawMaterial->standard_cost ?? 0);
        });

        return response()->json([
            'success' => true,
            'data' => [
                'bom' => $billOfMaterial,
                'total_material_cost' => $totalCost,
                'cost_per_unit' => $billOfMaterial->output_quantity > 0 
                    ? $totalCost / $billOfMaterial->output_quantity 
                    : 0,
            ],
        ]);
    }
}

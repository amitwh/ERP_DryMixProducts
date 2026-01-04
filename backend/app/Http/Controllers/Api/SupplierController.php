<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Supplier;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;

class SupplierController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Supplier::query();

        if ($request->has('organization_id')) {
            $query->where('organization_id', $request->organization_id);
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('rating')) {
            $query->byRating($request->rating);
        }

        if ($request->has('search')) {
            $query->where(function($q) use ($request) {
                $q->where('name', 'like', "%{$request->search}%")
                  ->orWhere('code', 'like', "%{$request->search}%")
                  ->orWhere('email', 'like', "%{$request->search}%")
                  ->orWhere('gstin', 'like', "%{$request->search}%");
            });
        }

        $perPage = $request->get('per_page', 15);
        $suppliers = $query->with('organization')->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $suppliers,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'organization_id' => 'required|exists:organizations,id',
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:50|unique:suppliers,code',
            'phone' => 'required|string|max:20',
            'email' => 'nullable|email|max:255',
            'supplier_type' => 'in:manufacturer,trader,importer',
            'rating' => 'in:excellent,good,average,poor',
            'status' => 'in:active,inactive,blacklisted',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        $supplier = Supplier::create($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Supplier created successfully',
            'data' => $supplier->load('organization'),
        ], 201);
    }

    public function show(Supplier $supplier): JsonResponse
    {
        $supplier->load(['organization', 'purchaseOrders']);

        return response()->json([
            'success' => true,
            'data' => $supplier,
        ]);
    }

    public function update(Request $request, Supplier $supplier): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|max:255',
            'code' => 'sometimes|required|string|max:50|unique:suppliers,code,' . $supplier->id,
            'phone' => 'sometimes|required|string|max:20',
            'email' => 'nullable|email|max:255',
            'rating' => 'in:excellent,good,average,poor',
            'status' => 'in:active,inactive,blacklisted',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        $supplier->update($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Supplier updated successfully',
            'data' => $supplier->load('organization'),
        ]);
    }

    public function destroy(Supplier $supplier): JsonResponse
    {
        $supplier->delete();

        return response()->json([
            'success' => true,
            'message' => 'Supplier deleted successfully',
        ]);
    }

    public function performance(Supplier $supplier): JsonResponse
    {
        $totalPOs = $supplier->purchaseOrders()->count();
        $completedPOs = $supplier->purchaseOrders()->where('status', 'received')->count();
        $totalValue = $supplier->purchaseOrders()->sum('total_amount');

        return response()->json([
            'success' => true,
            'data' => [
                'supplier' => $supplier,
                'total_orders' => $totalPOs,
                'completed_orders' => $completedPOs,
                'total_value' => $totalValue,
                'rating' => $supplier->rating,
            ],
        ]);
    }
}

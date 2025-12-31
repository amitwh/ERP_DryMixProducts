<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ManufacturingUnit;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;

class ManufacturingUnitController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = ManufacturingUnit::query();

        if ($request->has('organization_id')) {
            $query->byOrganization($request->organization_id);
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('type')) {
            $query->where('type', $request->type);
        }

        if ($request->has('search')) {
            $query->where(function($q) use ($request) {
                $q->where('name', 'like', "%{$request->search}%")
                  ->orWhere('code', 'like', "%{$request->search}%");
            });
        }

        $perPage = $request->get('per_page', 15);
        $units = $query->with('organization')->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $units,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'organization_id' => 'required|exists:organizations,id',
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:50|unique:manufacturing_units,code',
            'type' => 'required|in:production,warehouse,office',
            'capacity_per_day' => 'nullable|numeric|min:0',
            'capacity_unit' => 'nullable|string|max:50',
            'status' => 'in:active,inactive,maintenance',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        $unit = ManufacturingUnit::create($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Manufacturing unit created successfully',
            'data' => $unit->load('organization'),
        ], 201);
    }

    public function show(ManufacturingUnit $manufacturingUnit): JsonResponse
    {
        $manufacturingUnit->load(['organization', 'users']);

        return response()->json([
            'success' => true,
            'data' => $manufacturingUnit,
        ]);
    }

    public function update(Request $request, ManufacturingUnit $manufacturingUnit): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|max:255',
            'code' => 'sometimes|required|string|max:50|unique:manufacturing_units,code,' . $manufacturingUnit->id,
            'type' => 'sometimes|required|in:production,warehouse,office',
            'capacity_per_day' => 'nullable|numeric|min:0',
            'status' => 'in:active,inactive,maintenance',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        $manufacturingUnit->update($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Manufacturing unit updated successfully',
            'data' => $manufacturingUnit->load('organization'),
        ]);
    }

    public function destroy(ManufacturingUnit $manufacturingUnit): JsonResponse
    {
        $manufacturingUnit->delete();

        return response()->json([
            'success' => true,
            'message' => 'Manufacturing unit deleted successfully',
        ]);
    }
}

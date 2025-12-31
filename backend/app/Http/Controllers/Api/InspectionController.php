<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Inspection;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;

class InspectionController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Inspection::query();

        if ($request->has('organization_id')) {
            $query->where('organization_id', $request->organization_id);
        }

        if ($request->has('project_id')) {
            $query->where('project_id', $request->project_id);
        }

        if ($request->has('inspection_type')) {
            $query->byType($request->inspection_type);
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('result')) {
            $query->where('result', $request->result);
        }

        $perPage = $request->get('per_page', 15);
        $inspections = $query->with(['organization', 'project', 'inspector'])->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $inspections,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'organization_id' => 'required|exists:organizations,id',
            'project_id' => 'nullable|exists:projects,id',
            'inspection_number' => 'required|string|unique:inspections,inspection_number',
            'inspection_type' => 'required|string',
            'inspection_date' => 'required|date',
            'inspector_id' => 'required|exists:users,id',
            'result' => 'in:pass,fail,conditional_pass,pending',
            'status' => 'in:scheduled,in_progress,completed,cancelled',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        $inspection = Inspection::create($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Inspection created successfully',
            'data' => $inspection->load(['organization', 'project', 'inspector']),
        ], 201);
    }

    public function show(Inspection $inspection): JsonResponse
    {
        $inspection->load(['organization', 'project', 'inspector', 'manufacturingUnit']);

        return response()->json([
            'success' => true,
            'data' => $inspection,
        ]);
    }

    public function update(Request $request, Inspection $inspection): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'inspection_date' => 'sometimes|required|date',
            'result' => 'in:pass,fail,conditional_pass,pending',
            'status' => 'in:scheduled,in_progress,completed,cancelled',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        $inspection->update($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Inspection updated successfully',
            'data' => $inspection->load(['organization', 'project', 'inspector']),
        ]);
    }

    public function destroy(Inspection $inspection): JsonResponse
    {
        $inspection->delete();

        return response()->json([
            'success' => true,
            'message' => 'Inspection deleted successfully',
        ]);
    }
}

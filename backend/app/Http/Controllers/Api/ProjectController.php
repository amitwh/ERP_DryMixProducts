<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Project;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;

class ProjectController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Project::query();

        if ($request->has('organization_id')) {
            $query->byOrganization($request->organization_id);
        }

        if ($request->has('customer_id')) {
            $query->where('customer_id', $request->customer_id);
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('search')) {
            $query->where(function($q) use ($request) {
                $q->where('name', 'like', "%{$request->search}%")
                  ->orWhere('code', 'like', "%{$request->search}%")
                  ->orWhere('location', 'like', "%{$request->search}%");
            });
        }

        $perPage = $request->get('per_page', 15);
        $projects = $query->with(['organization', 'customer', 'projectManager'])->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $projects,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'organization_id' => 'required|exists:organizations,id',
            'customer_id' => 'nullable|exists:customers,id',
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:50|unique:projects,code',
            'start_date' => 'nullable|date',
            'expected_end_date' => 'nullable|date|after:start_date',
            'contract_value' => 'nullable|numeric|min:0',
            'project_manager_id' => 'nullable|exists:users,id',
            'status' => 'in:planning,active,on_hold,completed,cancelled',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        $project = Project::create($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Project created successfully',
            'data' => $project->load(['organization', 'customer', 'projectManager']),
        ], 201);
    }

    public function show(Project $project): JsonResponse
    {
        $project->load(['organization', 'customer', 'projectManager', 'qualityDocuments', 'inspections', 'ncrs']);

        return response()->json([
            'success' => true,
            'data' => $project,
        ]);
    }

    public function update(Request $request, Project $project): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|max:255',
            'code' => 'sometimes|required|string|max:50|unique:projects,code,' . $project->id,
            'start_date' => 'nullable|date',
            'expected_end_date' => 'nullable|date',
            'contract_value' => 'nullable|numeric|min:0',
            'status' => 'in:planning,active,on_hold,completed,cancelled',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        $project->update($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Project updated successfully',
            'data' => $project->load(['organization', 'customer', 'projectManager']),
        ]);
    }

    public function destroy(Project $project): JsonResponse
    {
        $project->delete();

        return response()->json([
            'success' => true,
            'message' => 'Project deleted successfully',
        ]);
    }
}

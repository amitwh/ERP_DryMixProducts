<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Ncr;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;

class NcrController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Ncr::query();

        if ($request->has('organization_id')) {
            $query->where('organization_id', $request->organization_id);
        }

        if ($request->has('project_id')) {
            $query->where('project_id', $request->project_id);
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('severity')) {
            $query->where('severity', $request->severity);
        }

        if ($request->has('open')) {
            $query->open();
        }

        if ($request->has('critical')) {
            $query->critical();
        }

        if ($request->has('overdue')) {
            $query->overdue();
        }

        $perPage = $request->get('per_page', 15);
        $ncrs = $query->with(['project', 'raisedBy', 'responsiblePerson', 'verifiedBy'])->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $ncrs,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'organization_id' => 'required|exists:organizations,id',
            'project_id' => 'nullable|exists:projects,id',
            'ncr_number' => 'required|string|unique:ncrs,ncr_number',
            'ncr_date' => 'required|date',
            'raised_by' => 'required|exists:users,id',
            'non_conformance_type' => 'required|string',
            'severity' => 'required|in:critical,major,minor',
            'description' => 'required|string',
            'target_date' => 'nullable|date|after:ncr_date',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        $ncr = Ncr::create($request->all());

        return response()->json([
            'success' => true,
            'message' => 'NCR created successfully',
            'data' => $ncr->load(['project', 'raisedBy']),
        ], 201);
    }

    public function show(Ncr $ncr): JsonResponse
    {
        $ncr->load(['project', 'raisedBy', 'responsiblePerson', 'verifiedBy']);

        return response()->json([
            'success' => true,
            'data' => $ncr,
        ]);
    }

    public function update(Request $request, Ncr $ncr): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'status' => 'in:open,under_investigation,action_taken,closed,cancelled',
            'root_cause' => 'nullable|string',
            'corrective_action' => 'nullable|string',
            'preventive_action' => 'nullable|string',
            'responsible_person_id' => 'nullable|exists:users,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        $ncr->update($request->all());

        return response()->json([
            'success' => true,
            'message' => 'NCR updated successfully',
            'data' => $ncr->load(['project', 'responsiblePerson']),
        ]);
    }

    public function close(Request $request, Ncr $ncr): JsonResponse
    {
        if ($ncr->status === 'closed') {
            return response()->json([
                'success' => false,
                'message' => 'NCR is already closed',
            ], 400);
        }

        $validator = Validator::make($request->all(), [
            'verified_by' => 'required|exists:users,id',
            'verification_date' => 'required|date',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        $ncr->update([
            'status' => 'closed',
            'closure_date' => now(),
            'verified_by' => $request->verified_by,
            'verification_date' => $request->verification_date,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'NCR closed successfully',
            'data' => $ncr->load(['verifiedBy']),
        ]);
    }

    public function destroy(Ncr $ncr): JsonResponse
    {
        if ($ncr->status === 'closed') {
            return response()->json([
                'success' => false,
                'message' => 'Closed NCRs cannot be deleted',
            ], 400);
        }

        $ncr->delete();

        return response()->json([
            'success' => true,
            'message' => 'NCR deleted successfully',
        ]);
    }

    public function statistics(Request $request): JsonResponse
    {
        $query = Ncr::query();

        if ($request->has('organization_id')) {
            $query->where('organization_id', $request->organization_id);
        }

        $stats = [
            'total' => $query->count(),
            'open' => $query->clone()->open()->count(),
            'closed' => $query->clone()->where('status', 'closed')->count(),
            'critical' => $query->clone()->critical()->count(),
            'overdue' => $query->clone()->overdue()->count(),
            'by_severity' => [
                'critical' => $query->clone()->where('severity', 'critical')->count(),
                'major' => $query->clone()->where('severity', 'major')->count(),
                'minor' => $query->clone()->where('severity', 'minor')->count(),
            ],
        ];

        return response()->json([
            'success' => true,
            'data' => $stats,
        ]);
    }
}

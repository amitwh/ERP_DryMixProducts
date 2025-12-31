<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\QualityDocument;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;

class QualityDocumentController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = QualityDocument::query();

        if ($request->has('organization_id')) {
            $query->where('organization_id', $request->organization_id);
        }

        if ($request->has('project_id')) {
            $query->where('project_id', $request->project_id);
        }

        if ($request->has('document_type')) {
            $query->byType($request->document_type);
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $perPage = $request->get('per_page', 15);
        $documents = $query->with(['project', 'preparedBy', 'reviewedBy', 'approvedBy'])->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $documents,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'organization_id' => 'required|exists:organizations,id',
            'project_id' => 'nullable|exists:projects,id',
            'document_number' => 'required|string|unique:quality_documents,document_number',
            'document_type' => 'required|string',
            'title' => 'required|string|max:255',
            'issue_date' => 'required|date',
            'prepared_by' => 'required|exists:users,id',
            'status' => 'in:draft,under_review,approved,rejected,superseded',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        $document = QualityDocument::create($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Quality document created successfully',
            'data' => $document->load(['project', 'preparedBy']),
        ], 201);
    }

    public function show(QualityDocument $qualityDocument): JsonResponse
    {
        $qualityDocument->load(['project', 'preparedBy', 'reviewedBy', 'approvedBy', 'revisions']);

        return response()->json([
            'success' => true,
            'data' => $qualityDocument,
        ]);
    }

    public function update(Request $request, QualityDocument $qualityDocument): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'title' => 'sometimes|required|string|max:255',
            'status' => 'in:draft,under_review,approved,rejected,superseded',
            'reviewed_by' => 'nullable|exists:users,id',
            'approved_by' => 'nullable|exists:users,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        $qualityDocument->update($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Quality document updated successfully',
            'data' => $qualityDocument->load(['project', 'preparedBy', 'reviewedBy', 'approvedBy']),
        ]);
    }

    public function approve(Request $request, QualityDocument $qualityDocument): JsonResponse
    {
        if ($qualityDocument->status !== 'under_review') {
            return response()->json([
                'success' => false,
                'message' => 'Only documents under review can be approved',
            ], 400);
        }

        $qualityDocument->update([
            'status' => 'approved',
            'approved_by' => $request->user()->id,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Quality document approved successfully',
            'data' => $qualityDocument->load(['approvedBy']),
        ]);
    }

    public function reject(Request $request, QualityDocument $qualityDocument): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'rejection_reason' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        $qualityDocument->update([
            'status' => 'rejected',
            'rejection_reason' => $request->rejection_reason,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Quality document rejected',
            'data' => $qualityDocument,
        ]);
    }

    public function destroy(QualityDocument $qualityDocument): JsonResponse
    {
        if ($qualityDocument->status === 'approved') {
            return response()->json([
                'success' => false,
                'message' => 'Approved documents cannot be deleted',
            ], 400);
        }

        $qualityDocument->delete();

        return response()->json([
            'success' => true,
            'message' => 'Quality document deleted successfully',
        ]);
    }
}

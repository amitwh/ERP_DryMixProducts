<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Document;
use App\Models\DocumentCategory;
use App\Models\DocumentVersion;
use App\Models\DocumentApproval;
use App\Models\DocumentAccessLog;
use App\Models\DocumentWorkflow;
use App\Models\DocumentWorkflowExecution;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class DocumentManagementController extends Controller
{
    /**
     * Get all documents
     */
    public function index(Request $request)
    {
        $query = Document::byOrganization($request->org_id);

        // Filters
        if ($request->has('type')) {
            $query->byType($request->query('type'));
        }
        if ($request->has('category')) {
            $query->byCategory($request->query('category'));
        }
        if ($request->has('status')) {
            $query->byStatus($request->query('status'));
        }
        if ($request->has('visibility')) {
            $query->byVisibility($request->query('visibility'));
        }
        if ($request->has('tag')) {
            $query->byTag($request->query('tag'));
        }
        if ($request->has('search')) {
            $query->search($request->query('search'));
        }
        if ($request->has('related_type') && $request->has('related_id')) {
            $query->byRelated($request->query('related_type'), $request->query('related_id'));
        }

        $documents = $query->latest()
            ->paginate($request->query('per_page', 20));

        return response()->json([
            'data' => $documents->items(),
            'meta' => [
                'current_page' => $documents->currentPage(),
                'last_page' => $documents->lastPage(),
                'per_page' => $documents->perPage(),
                'total' => $documents->total(),
            ],
        ]);
    }

    /**
     * Create new document
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'org_id' => 'required|exists:organizations,id',
            'document_number' => 'required|string|max:100',
            'title' => 'required|string|max:500',
            'document_type' => 'required|string|max:100',
            'category' => 'required|string|max:100',
            'sub_category_id' => 'nullable|exists:document_categories,id',
            'description' => 'nullable|string',
            'file' => 'required|file|max:10240',
            'visibility' => 'nullable|in:public,private,internal,restricted',
            'tags' => 'nullable|array',
            'effective_date' => 'nullable|date',
            'expiry_date' => 'nullable|date|after:effective_date',
            'related_type' => 'nullable|string|max:100',
            'related_id' => 'nullable|integer',
            'access_permissions' => 'nullable|array',
            'metadata' => 'nullable|array',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $file = $request->file('file');
        $fileName = time() . '_' . Str::random(20) . '.' . $file->getClientOriginalExtension();
        $filePath = 'documents/' . date('Y/m/d') . '/' . $fileName;
        $fileHash = hash_file('sha256', $file->getRealPath());

        // Store file
        Storage::disk('public')->put($filePath, file_get_contents($file->getRealPath()));

        $document = Document::create([
            'org_id' => $request->org_id,
            'document_number' => $request->document_number,
            'title' => $request->title,
            'document_type' => $request->document_type,
            'category' => $request->category,
            'sub_category_id' => $request->sub_category_id,
            'description' => $request->description,
            'file_name' => $file->getClientOriginalName(),
            'file_path' => $filePath,
            'file_type' => $file->getClientOriginalExtension(),
            'mime_type' => $file->getMimeType(),
            'file_size' => $file->getSize(),
            'version' => '1.0',
            'is_latest' => true,
            'status' => 'draft',
            'visibility' => $request->visibility ?? 'private',
            'effective_date' => $request->effective_date,
            'expiry_date' => $request->expiry_date,
            'related_type' => $request->related_type,
            'related_id' => $request->related_id,
            'access_permissions' => $request->access_permissions,
            'metadata' => $request->metadata,
            'tags' => $request->tags,
            'ocr_status' => 'pending',
            'created_by' => auth()->id(),
        ]);

        // Create version record
        DocumentVersion::create([
            'document_id' => $document->id,
            'version' => '1.0',
            'file_name' => $document->file_name,
            'file_path' => $document->file_path,
            'file_hash' => $fileHash,
            'file_size' => $document->file_size,
            'created_by' => auth()->id(),
        ]);

        return response()->json([
            'data' => $document,
            'message' => 'Document created successfully',
        ], 201);
    }

    /**
     * Show specific document
     */
    public function show(Request $request, $id)
    {
        $document = Document::byOrganization($request->org_id)
            ->with(['subCategory', 'createdBy', 'approvals' => fn($q) => $q->latest()])
            ->findOrFail($id);

        // Log access
        DocumentAccessLog::create([
            'document_id' => $document->id,
            'user_id' => auth()->id(),
            'action' => 'viewed',
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'accessed_at' => now(),
        ]);

        $document->incrementView();

        return response()->json(['data' => $document]);
    }

    /**
     * Update document
     */
    public function update(Request $request, $id)
    {
        $document = Document::byOrganization($request->org_id)
            ->findOrFail($id);

        $validator = Validator::make($request->all(), [
            'title' => 'sometimes|required|string|max:500',
            'document_type' => 'sometimes|required|string|max:100',
            'category' => 'sometimes|required|string|max:100',
            'sub_category_id' => 'nullable|exists:document_categories,id',
            'description' => 'nullable|string',
            'visibility' => 'nullable|in:public,private,internal,restricted',
            'tags' => 'nullable|array',
            'effective_date' => 'nullable|date',
            'expiry_date' => 'nullable|date|after:effective_date',
            'access_permissions' => 'nullable|array',
            'metadata' => 'nullable|array',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $document->update($request->all());

        return response()->json([
            'data' => $document,
            'message' => 'Document updated successfully',
        ]);
    }

    /**
     * Delete document
     */
    public function destroy(Request $request, $id)
    {
        $document = Document::byOrganization($request->org_id)
            ->findOrFail($id);

        // Delete file
        Storage::disk('public')->delete($document->file_path);

        // Soft delete
        $document->delete();

        return response()->json([
            'message' => 'Document deleted successfully',
        ]);
    }

    /**
     * Download document
     */
    public function download(Request $request, $id)
    {
        $document = Document::byOrganization($request->org_id)
            ->findOrFail($id);

        // Log download
        DocumentAccessLog::create([
            'document_id' => $document->id,
            'user_id' => auth()->id(),
            'action' => 'downloaded',
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'accessed_at' => now(),
        ]);

        $document->incrementDownload();

        return Storage::disk('public')->download($document->file_path, $document->file_name);
    }

    /**
     * Submit for approval
     */
    public function submitForApproval(Request $request, $id)
    {
        $document = Document::byOrganization($request->org_id)
            ->findOrFail($id);

        if ($document->status !== 'draft') {
            return response()->json([
                'message' => 'Only draft documents can be submitted for approval',
            ], 400);
        }

        $document->update([
            'status' => 'pending_approval',
        ]);

        return response()->json([
            'data' => $document,
            'message' => 'Document submitted for approval',
        ]);
    }

    /**
     * Approve document
     */
    public function approve(Request $request, $id)
    {
        $document = Document::byOrganization($request->org_id)
            ->findOrFail($id);

        if ($document->status !== 'pending_approval') {
            return response()->json([
                'message' => 'Document is not pending approval',
            ], 400);
        }

        $document->update([
            'status' => 'approved',
            'approved_by' => auth()->id(),
            'approved_at' => now(),
            'published_at' => $document->published_at ?? now(),
        ]);

        return response()->json([
            'data' => $document,
            'message' => 'Document approved successfully',
        ]);
    }

    /**
     * Reject document
     */
    public function reject(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'rejection_reason' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $document = Document::byOrganization($request->org_id)
            ->findOrFail($id);

        if ($document->status !== 'pending_approval') {
            return response()->json([
                'message' => 'Document is not pending approval',
            ], 400);
        }

        $document->update([
            'status' => 'rejected',
            'rejection_reason' => $request->rejection_reason,
        ]);

        return response()->json([
            'data' => $document,
            'message' => 'Document rejected successfully',
        ]);
    }

    /**
     * Create new version
     */
    public function createVersion(Request $request, $id)
    {
        $document = Document::byOrganization($request->org_id)
            ->findOrFail($id);

        $validator = Validator::make($request->all(), [
            'file' => 'required|file|max:10240',
            'change_notes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $file = $request->file('file');
        $fileName = time() . '_' . Str::random(20) . '.' . $file->getClientOriginalExtension();
        $filePath = 'documents/' . date('Y/m/d') . '/' . $fileName;
        $fileHash = hash_file('sha256', $file->getRealPath());

        // Store file
        Storage::disk('public')->put($filePath, file_get_contents($file->getRealPath()));

        // Calculate new version
        $currentVersion = (float)$document->version;
        $newVersion = number_format($currentVersion + 0.1, 1);

        // Mark old version as not latest
        $document->update(['is_latest' => false]);

        // Create new document version
        $newDocument = $document->replicate([
            'id',
            'document_number',
            'view_count',
            'download_count',
        ]);

        $newDocument->update([
            'file_name' => $file->getClientOriginalName(),
            'file_path' => $filePath,
            'file_type' => $file->getClientOriginalExtension(),
            'mime_type' => $file->getMimeType(),
            'file_size' => $file->getSize(),
            'version' => $newVersion,
            'is_latest' => true,
            'status' => 'draft',
            'created_by' => auth()->id(),
        ]);

        // Create version record
        DocumentVersion::create([
            'document_id' => $newDocument->id,
            'version' => $newVersion,
            'file_name' => $newDocument->file_name,
            'file_path' => $newDocument->file_path,
            'file_hash' => $fileHash,
            'file_size' => $newDocument->file_size,
            'change_notes' => $request->change_notes,
            'created_by' => auth()->id(),
        ]);

        return response()->json([
            'data' => $newDocument,
            'message' => 'Document version created successfully',
        ], 201);
    }

    /**
     * Get document versions
     */
    public function getVersions(Request $request, $id)
    {
        $document = Document::byOrganization($request->org_id)
            ->findOrFail($id);

        $versions = $document->versions()
            ->latest()
            ->get();

        return response()->json([
            'data' => $versions,
        ]);
    }

    /**
     * Get document access logs
     */
    public function getAccessLogs(Request $request, $id)
    {
        $document = Document::byOrganization($request->org_id)
            ->findOrFail($id);

        $logs = $document->accessLogs()
            ->latest('accessed_at')
            ->paginate($request->query('per_page', 20));

        return response()->json([
            'data' => $logs->items(),
            'meta' => [
                'current_page' => $logs->currentPage(),
                'last_page' => $logs->lastPage(),
                'per_page' => $logs->perPage(),
                'total' => $logs->total(),
            ],
        ]);
    }

    /**
     * Get document categories
     */
    public function getCategories(Request $request)
    {
        $categories = DocumentCategory::byOrganization($request->org_id)
            ->active()
            ->with('children')
            ->orderBy('sort_order')
            ->get();

        return response()->json([
            'data' => $categories,
        ]);
    }

    /**
     * Create category
     */
    public function storeCategory(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'org_id' => 'required|exists:organizations,id',
            'parent_id' => 'nullable|exists:document_categories,id',
            'name' => 'required|string|max:200',
            'slug' => 'required|string|max:255|unique:document_categories,slug',
            'description' => 'nullable|string',
            'icon' => 'nullable|string|max:50',
            'color' => 'nullable|string|max:7|regex:/^#[0-9A-Fa-f]{6}$/',
            'sort_order' => 'nullable|integer',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $category = DocumentCategory::create($request->all());

        return response()->json([
            'data' => $category,
            'message' => 'Category created successfully',
        ], 201);
    }
}

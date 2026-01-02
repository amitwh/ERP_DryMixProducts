<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DryMixProductTest;
use App\Models\RawMaterialTest;
use App\Models\TestParameter;
use App\Models\TestStandard;
use App\Models\TestTemplate;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class TestPageController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => [
                'message' => 'Test Pages Module',
                'endpoints' => [
                    '/test-pages/dry-mix-product-tests' => 'Dry Mix Product Tests',
                    '/test-pages/raw-material-tests' => 'Raw Material Tests',
                    '/test-pages/test-parameters' => 'Test Parameters Configuration',
                    '/test-pages/test-standards' => 'Test Standards',
                    '/test-pages/test-templates' => 'Test Templates',
                ]
            ]
        ]);
    }

    // Dry Mix Product Tests
    public function dryMixProductTests(Request $request): JsonResponse
    {
        $organizationId = $request->get('organization_id');

        $tests = DryMixProductTest::query()
            ->when($organizationId, function($q, $id) {
                return $q->where('organization_id', $id);
            })
            ->with(['product', 'batch', 'testedBy', 'verifiedBy', 'approvedBy'])
            ->when($request->has('product_id'), function($q) use ($request) {
                return $q->where('product_id', $request->product_id);
            })
            ->when($request->has('batch_id'), function($q) use ($request) {
                return $q->where('batch_id', $request->batch_id);
            })
            ->when($request->has('status'), function($q) use ($request) {
                return $q->where('status', $request->status);
            })
            ->when($request->has('test_result'), function($q) use ($request) {
                return $q->where('test_result', $request->test_result);
            })
            ->orderBy('test_date', 'desc')
            ->paginate($request->get('per_page', 20));

        return response()->json([
            'success' => true,
            'data' => $tests,
        ]);
    }

    public function storeDryMixProductTest(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'organization_id' => 'required|exists:organizations,id',
            'manufacturing_unit_id' => 'required|exists:manufacturing_units,id',
            'product_id' => 'required|exists:products,id',
            'batch_id' => 'nullable|exists:production_batches,id',
            'test_number' => 'required|string|unique:dry_mix_product_tests,test_number',
            'test_date' => 'required|date',
            'sample_id' => 'nullable|string',
            'compressive_strength_1_day' => 'nullable|numeric|min:0',
            'compressive_strength_3_day' => 'nullable|numeric|min:0',
            'compressive_strength_7_day' => 'nullable|numeric|min:0',
            'compressive_strength_28_day' => 'nullable|numeric|min:0',
            'flexural_strength' => 'nullable|numeric|min:0',
            'adhesion_strength' => 'nullable|numeric|min:0',
            'setting_time_initial' => 'nullable|numeric|min:0',
            'setting_time_final' => 'nullable|numeric|min:0',
            'water_demand' => 'nullable|numeric|min:0|max:100',
            'water_retention' => 'nullable|numeric|min:0|max:100',
            'flow_diameter' => 'nullable|numeric|min:0',
            'bulk_density' => 'nullable|numeric|min:0',
            'air_content' => 'nullable|numeric|min:0|max:100',
            'shelf_life' => 'nullable|numeric|min:0',
            'color' => 'nullable|string|max:100',
            'texture' => 'nullable|string|max:100',
            'appearance_notes' => 'nullable|string',
            'status' => 'nullable|in:pending,in_progress,completed,cancelled',
            'remarks' => 'nullable|string',
            'recommendations' => 'nullable|string',
            'meets_standard' => 'nullable|boolean',
            'standard_reference' => 'nullable|string',
            'standard_limits' => 'nullable|array',
            'created_by' => 'nullable|exists:users,id',
        ]);

        $test = DryMixProductTest::create(array_merge($validated, [
            'status' => $validated['status'] ?? 'pending',
            'created_by' => $validated['created_by'] ?? auth()->id(),
        ]));

        return response()->json([
            'success' => true,
            'data' => $test,
            'message' => 'Dry mix product test created successfully',
        ], 201);
    }

    public function showDryMixProductTest(DryMixProductTest $test): JsonResponse
    {
        $test->load(['product', 'batch', 'testedBy', 'verifiedBy', 'approvedBy', 'organization']);

        return response()->json([
            'success' => true,
            'data' => $test,
        ]);
    }

    public function updateDryMixProductTest(Request $request, DryMixProductTest $test): JsonResponse
    {
        $validated = $request->validate([
            'test_date' => 'nullable|date',
            'sample_id' => 'nullable|string',
            'compressive_strength_1_day' => 'nullable|numeric|min:0',
            'compressive_strength_3_day' => 'nullable|numeric|min:0',
            'compressive_strength_7_day' => 'nullable|numeric|min:0',
            'compressive_strength_28_day' => 'nullable|numeric|min:0',
            'flexural_strength' => 'nullable|numeric|min:0',
            'adhesion_strength' => 'nullable|numeric|min:0',
            'setting_time_initial' => 'nullable|numeric|min:0',
            'setting_time_final' => 'nullable|numeric|min:0',
            'water_demand' => 'nullable|numeric|min:0|max:100',
            'water_retention' => 'nullable|numeric|min:0|max:100',
            'flow_diameter' => 'nullable|numeric|min:0',
            'bulk_density' => 'nullable|numeric|min:0',
            'air_content' => 'nullable|numeric|min:0|max:100',
            'shelf_life' => 'nullable|numeric|min:0',
            'color' => 'nullable|string|max:100',
            'texture' => 'nullable|string|max:100',
            'appearance_notes' => 'nullable|string',
            'status' => 'nullable|in:pending,in_progress,completed,cancelled',
            'remarks' => 'nullable|string',
            'recommendations' => 'nullable|string',
            'meets_standard' => 'nullable|boolean',
            'standard_reference' => 'nullable|string',
            'standard_limits' => 'nullable|array',
        ]);

        $test->update($validated);

        return response()->json([
            'success' => true,
            'data' => $test,
            'message' => 'Dry mix product test updated successfully',
        ]);
    }

    public function deleteDryMixProductTest(DryMixProductTest $test): JsonResponse
    {
        $test->delete();

        return response()->json([
            'success' => true,
            'message' => 'Dry mix product test deleted successfully',
        ]);
    }

    public function testDryMixProductTest(DryMixProductTest $test): JsonResponse
    {
        $userId = request()->input('user_id', auth()->id());
        $test->markAsTested($userId);

        return response()->json([
            'success' => true,
            'message' => 'Test marked as completed',
        ]);
    }

    public function verifyDryMixProductTest(Request $request, DryMixProductTest $test): JsonResponse
    {
        $validated = $request->validate([
            'result' => 'required|in:pass,fail,marginal',
            'remarks' => 'nullable|string',
        ]);

        $test->markAsVerified(auth()->id(), $validated['result'], $validated['remarks'] ?? null);

        return response()->json([
            'success' => true,
            'message' => 'Test verified successfully',
        ]);
    }

    public function approveDryMixProductTest(DryMixProductTest $test): JsonResponse
    {
        $test->markAsApproved(auth()->id());

        return response()->json([
            'success' => true,
            'message' => 'Test approved successfully',
        ]);
    }

    // Raw Material Tests
    public function rawMaterialTests(Request $request): JsonResponse
    {
        $organizationId = $request->get('organization_id');

        $tests = RawMaterialTest::query()
            ->when($organizationId, function($q, $id) {
                return $q->where('organization_id', $id);
            })
            ->with(['rawMaterial', 'testedBy', 'verifiedBy', 'approvedBy'])
            ->when($request->has('raw_material_id'), function($q) use ($request) {
                return $q->where('raw_material_id', $request->raw_material_id);
            })
            ->when($request->has('status'), function($q) use ($request) {
                return $q->where('status', $request->status);
            })
            ->when($request->has('test_result'), function($q) use ($request) {
                return $q->where('test_result', $request->test_result);
            })
            ->orderBy('test_date', 'desc')
            ->paginate($request->get('per_page', 20));

        return response()->json([
            'success' => true,
            'data' => $tests,
        ]);
    }

    public function storeRawMaterialTest(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'organization_id' => 'required|exists:organizations,id',
            'manufacturing_unit_id' => 'required|exists:manufacturing_units,id',
            'raw_material_id' => 'required|exists:products,id',
            'supplier_batch_id' => 'nullable|integer',
            'test_number' => 'required|string|unique:raw_material_tests,test_number',
            'test_date' => 'required|date',
            'sample_id' => 'nullable|string',
            // Chemical analysis
            'sio2' => 'nullable|numeric|min:0|max:100',
            'al2o3' => 'nullable|numeric|min:0|max:100',
            'fe2o3' => 'nullable|numeric|min:0|max:100',
            'cao' => 'nullable|numeric|min:0|max:100',
            'mgo' => 'nullable|numeric|min:0|max:100',
            'so3' => 'nullable|numeric|min:0|max:100',
            'k2o' => 'nullable|numeric|min:0|max:100',
            'na2o' => 'nullable|numeric|min:0|max:100',
            'cl' => 'nullable|numeric|min:0|max:100',
            // Physical properties
            'moisture_content' => 'nullable|numeric|min:0|max:100',
            'loss_on_ignition' => 'nullable|numeric|min:0|max:100',
            'specific_gravity' => 'nullable|numeric|min:0',
            'bulk_density' => 'nullable|numeric|min:0',
            // Particle size
            'particle_size_d50' => 'nullable|numeric|min:0',
            'particle_size_d90' => 'nullable|numeric|min:0',
            'particle_size_d98' => 'nullable|numeric|min:0',
            'blaine_fineness' => 'nullable|numeric|min:0',
            // Additional properties
            'water_reducer' => 'nullable|numeric|min:0',
            'retention_aid' => 'nullable|numeric|min:0',
            'defoamer' => 'nullable|numeric|min:0',
            'solid_content' => 'nullable|numeric|min:0|max:100',
            'viscosity' => 'nullable|numeric|min:0',
            'ph_value' => 'nullable|numeric|min:0|max:14',
            'minimum_film_forming_temperature' => 'nullable|numeric',
            'fineness_modulus' => 'nullable|numeric|min:0',
            'water_absorption' => 'nullable|numeric|min:0|max:100',
            'silt_content' => 'nullable|numeric|min:0|max:100',
            'organic_impurities' => 'nullable|numeric|min:0|max:100',
            'status' => 'nullable|in:pending,in_progress,completed,cancelled',
            'remarks' => 'nullable|string',
            'recommendations' => 'nullable|string',
            'meets_standard' => 'nullable|boolean',
            'standard_reference' => 'nullable|string',
            'standard_limits' => 'nullable|array',
            'created_by' => 'nullable|exists:users,id',
        ]);

        $test = RawMaterialTest::create(array_merge($validated, [
            'status' => $validated['status'] ?? 'pending',
            'created_by' => $validated['created_by'] ?? auth()->id(),
        ]));

        return response()->json([
            'success' => true,
            'data' => $test,
            'message' => 'Raw material test created successfully',
        ], 201);
    }

    public function showRawMaterialTest(RawMaterialTest $test): JsonResponse
    {
        $test->load(['rawMaterial', 'testedBy', 'verifiedBy', 'approvedBy', 'organization']);

        return response()->json([
            'success' => true,
            'data' => $test,
        ]);
    }

    public function updateRawMaterialTest(Request $request, RawMaterialTest $test): JsonResponse
    {
        $validated = $request->validate([
            'test_date' => 'nullable|date',
            'sample_id' => 'nullable|string',
            // Chemical analysis
            'sio2' => 'nullable|numeric|min:0|max:100',
            'al2o3' => 'nullable|numeric|min:0|max:100',
            'fe2o3' => 'nullable|numeric|min:0|max:100',
            'cao' => 'nullable|numeric|min:0|max:100',
            'mgo' => 'nullable|numeric|min:0|max:100',
            'so3' => 'nullable|numeric|min:0|max:100',
            'k2o' => 'nullable|numeric|min:0|max:100',
            'na2o' => 'nullable|numeric|min:0|max:100',
            'cl' => 'nullable|numeric|min:0|max:100',
            // Physical properties
            'moisture_content' => 'nullable|numeric|min:0|max:100',
            'loss_on_ignition' => 'nullable|numeric|min:0|max:100',
            'specific_gravity' => 'nullable|numeric|min:0',
            'bulk_density' => 'nullable|numeric|min:0',
            // Particle size
            'particle_size_d50' => 'nullable|numeric|min:0',
            'particle_size_d90' => 'nullable|numeric|min:0',
            'particle_size_d98' => 'nullable|numeric|min:0',
            'blaine_fineness' => 'nullable|numeric|min:0',
            // Additional properties
            'water_reducer' => 'nullable|numeric|min:0',
            'retention_aid' => 'nullable|numeric|min:0',
            'defoamer' => 'nullable|numeric|min:0',
            'solid_content' => 'nullable|numeric|min:0|max:100',
            'viscosity' => 'nullable|numeric|min:0',
            'ph_value' => 'nullable|numeric|min:0|max:14',
            'minimum_film_forming_temperature' => 'nullable|numeric',
            'fineness_modulus' => 'nullable|numeric|min:0',
            'water_absorption' => 'nullable|numeric|min:0|max:100',
            'silt_content' => 'nullable|numeric|min:0|max:100',
            'organic_impurities' => 'nullable|numeric|min:0|max:100',
            'status' => 'nullable|in:pending,in_progress,completed,cancelled',
            'remarks' => 'nullable|string',
            'recommendations' => 'nullable|string',
            'meets_standard' => 'nullable|boolean',
            'standard_reference' => 'nullable|string',
            'standard_limits' => 'nullable|array',
        ]);

        $test->update($validated);

        return response()->json([
            'success' => true,
            'data' => $test,
            'message' => 'Raw material test updated successfully',
        ]);
    }

    public function deleteRawMaterialTest(RawMaterialTest $test): JsonResponse
    {
        $test->delete();

        return response()->json([
            'success' => true,
            'message' => 'Raw material test deleted successfully',
        ]);
    }

    // Test Parameters
    public function testParameters(Request $request): JsonResponse
    {
        $organizationId = $request->get('organization_id');

        $parameters = TestParameter::query()
            ->when($organizationId, function($q, $id) {
                return $q->where('organization_id', $id);
            })
            ->when($request->has('test_type'), function($q) use ($request) {
                return $q->where('test_type', $request->test_type);
            })
            ->when($request->has('parameter_category'), function($q) use ($request) {
                return $q->where('parameter_category', $request->parameter_category);
            })
            ->orderBy('display_order')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $parameters,
        ]);
    }

    public function storeTestParameter(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'organization_id' => 'required|exists:organizations,id',
            'parameter_code' => 'required|string|unique:test_parameters,parameter_code',
            'parameter_name' => 'required|string|max:255',
            'test_type' => 'required|in:dry_mix_product,raw_material',
            'parameter_category' => 'required|string|max:100',
            'unit' => 'nullable|string|max:50',
            'min_value' => 'nullable|numeric',
            'max_value' => 'nullable|numeric',
            'target_value' => 'nullable|numeric',
            'is_mandatory' => 'nullable|boolean',
            'display_order' => 'nullable|integer|min:0',
            'is_active' => 'nullable|boolean',
            'notes' => 'nullable|string',
        ]);

        $parameter = TestParameter::create(array_merge($validated, [
            'is_mandatory' => $validated['is_mandatory'] ?? true,
            'is_active' => $validated['is_active'] ?? true,
            'display_order' => $validated['display_order'] ?? 0,
        ]));

        return response()->json([
            'success' => true,
            'data' => $parameter,
            'message' => 'Test parameter created successfully',
        ], 201);
    }

    // Test Standards
    public function testStandards(Request $request): JsonResponse
    {
        $organizationId = $request->get('organization_id');

        $standards = TestStandard::query()
            ->when($organizationId, function($q, $id) {
                return $q->where('organization_id', $id);
            })
            ->when($request->has('test_type'), function($q) use ($request) {
                return $q->where('test_type', $request->test_type);
            })
            ->when($request->has('is_current'), function($q) use ($request) {
                return $q->where('is_current', $request->is_current);
            })
            ->orderBy('effective_date', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $standards,
        ]);
    }

    public function storeTestStandard(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'organization_id' => 'required|exists:organizations,id',
            'standard_code' => 'required|string|unique:test_standards,standard_code',
            'standard_name' => 'required|string|max:255',
            'test_type' => 'required|in:dry_mix_product,raw_material',
            'issuing_body' => 'required|string|max:50',
            'effective_date' => 'nullable|date',
            'is_current' => 'nullable|boolean',
            'description' => 'nullable|string',
            'is_active' => 'nullable|boolean',
        ]);

        $standard = TestStandard::create(array_merge($validated, [
            'is_current' => $validated['is_current'] ?? true,
            'is_active' => $validated['is_active'] ?? true,
        ]));

        return response()->json([
            'success' => true,
            'data' => $standard,
            'message' => 'Test standard created successfully',
        ], 201);
    }

    // Test Templates
    public function testTemplates(Request $request): JsonResponse
    {
        $organizationId = $request->get('organization_id');

        $templates = TestTemplate::query()
            ->when($organizationId, function($q, $id) {
                return $q->where('organization_id', $id);
            })
            ->with(['product', 'standard'])
            ->when($request->has('test_type'), function($q) use ($request) {
                return $q->where('test_type', $request->test_type);
            })
            ->when($request->has('is_default'), function($q) use ($request) {
                return $q->where('is_default', $request->is_default);
            })
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $templates,
        ]);
    }

    public function storeTestTemplate(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'organization_id' => 'required|exists:organizations,id',
            'template_code' => 'required|string|unique:test_templates,template_code',
            'template_name' => 'required|string|max:255',
            'test_type' => 'required|in:dry_mix_product,raw_material',
            'product_id' => 'nullable|exists:products,id',
            'selected_parameters' => 'required|array',
            'parameter_limits' => 'nullable|array',
            'instructions' => 'nullable|string',
            'standard_id' => 'nullable|exists:test_standards,id',
            'is_default' => 'nullable|boolean',
            'is_active' => 'nullable|boolean',
            'created_by' => 'nullable|exists:users,id',
        ]);

        $template = TestTemplate::create(array_merge($validated, [
            'is_default' => $validated['is_default'] ?? false,
            'is_active' => $validated['is_active'] ?? true,
            'created_by' => $validated['created_by'] ?? auth()->id(),
        ]));

        return response()->json([
            'success' => true,
            'data' => $template,
            'message' => 'Test template created successfully',
        ], 201);
    }

    // Statistics
    public function statistics(Request $request): JsonResponse
    {
        $organizationId = $request->get('organization_id');

        $stats = [
            'dry_mix_product_tests' => [
                'total' => DryMixProductTest::where('organization_id', $organizationId)->count(),
                'completed' => DryMixProductTest::where('organization_id', $organizationId)->where('status', 'completed')->count(),
                'passed' => DryMixProductTest::where('organization_id', $organizationId)->where('test_result', 'pass')->count(),
                'failed' => DryMixProductTest::where('organization_id', $organizationId)->where('test_result', 'fail')->count(),
            ],
            'raw_material_tests' => [
                'total' => RawMaterialTest::where('organization_id', $organizationId)->count(),
                'completed' => RawMaterialTest::where('organization_id', $organizationId)->where('status', 'completed')->count(),
                'passed' => RawMaterialTest::where('organization_id', $organizationId)->where('test_result', 'pass')->count(),
                'failed' => RawMaterialTest::where('organization_id', $organizationId)->where('test_result', 'fail')->count(),
            ],
            'test_parameters' => TestParameter::where('organization_id', $organizationId)->active()->count(),
            'test_standards' => TestStandard::where('organization_id', $organizationId)->active()->count(),
            'test_templates' => TestTemplate::where('organization_id', $organizationId)->active()->count(),
        ];

        return response()->json([
            'success' => true,
            'data' => $stats,
        ]);
    }
}

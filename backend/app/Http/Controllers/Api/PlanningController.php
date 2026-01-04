<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ProductionPlan;
use App\Models\MaterialRequirement;
use App\Models\DemandForecast;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class PlanningController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => [
                'message' => 'Planning Module',
                'endpoints' => [
                    '/production-plans' => 'Production Plans',
                    '/material-requirements' => 'Material Requirements (MRP)',
                    '/capacity-plans' => 'Capacity Planning',
                    '/demand-forecasts' => 'Demand Forecasts',
                    '/production-schedules' => 'Production Schedules',
                ]
            ]
        ]);
    }

    // Production Plans
    public function productionPlans(Request $request): JsonResponse
    {
        $organizationId = $request->get('organization_id');

        $plans = ProductionPlan::query()
            ->when($organizationId, fn($q) => $q->where('organization_id', $organizationId))
            ->with(['organization', 'manufacturingUnit', 'product', 'createdBy', 'approvedBy'])
            ->when($request->has('status'), fn($q) => $q->where('status', $request->status))
            ->when($request->has('product_id'), fn($q) => $q->where('product_id', $request->product_id))
            ->orderBy('start_date', 'desc')
            ->paginate($request->get('per_page', 20));

        return response()->json([
            'success' => true,
            'data' => $plans,
        ]);
    }

    public function storeProductionPlan(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'organization_id' => 'required|exists:organizations,id',
            'manufacturing_unit_id' => 'required|exists:manufacturing_units,id',
            'product_id' => 'required|exists:products,id',
            'plan_name' => 'required|string|max:255',
            'plan_type' => 'required|in:monthly,quarterly,yearly,custom',
            'start_date' => 'required|date|after_or_equal:today',
            'end_date' => 'required|date|after:start_date',
            'planned_quantity' => 'required|numeric|min:0',
            'capacity_percentage' => 'nullable|integer|min:0|max:150',
            'notes' => 'nullable|string',
        ]);

        // Generate plan number
        $planNumber = 'PP-' . date('Ymd') . '-' . (ProductionPlan::count() + 1);

        $plan = ProductionPlan::create(array_merge($validated, [
            'plan_number' => $planNumber,
            'actual_quantity' => 0,
            'status' => 'draft',
            'created_by' => auth()->id(),
        ]));

        return response()->json([
            'success' => true,
            'data' => $plan,
            'message' => 'Production plan created successfully',
        ], 201);
    }

    public function approveProductionPlan(ProductionPlan $plan): JsonResponse
    {
        if ($plan->status === 'approved') {
            return response()->json([
                'success' => false,
                'message' => 'Plan already approved',
            ], 400);
        }

        $plan->update([
            'status' => 'approved',
            'approved_by' => auth()->id(),
        ]);

        // Generate material requirements
        $this->generateMaterialRequirements($plan);

        return response()->json([
            'success' => true,
            'message' => 'Production plan approved and material requirements generated',
        ]);
    }

    // Material Requirements
    public function materialRequirements(Request $request): JsonResponse
    {
        $organizationId = $request->get('organization_id');

        $requirements = MaterialRequirement::query()
            ->when($organizationId, fn($q) => $q->where('organization_id', $organizationId))
            ->with(['productionPlan', 'rawMaterial'])
            ->when($request->has('status'), fn($q) => $q->where('status', $request->status))
            ->when($request->has('production_plan_id'), fn($q) => $q->where('production_plan_id', $request->production_plan_id))
            ->orderBy('required_by_date')
            ->paginate($request->get('per_page', 50));

        return response()->json([
            'success' => true,
            'data' => $requirements,
        ]);
    }

    // Demand Forecasts
    public function demandForecasts(Request $request): JsonResponse
    {
        $organizationId = $request->get('organization_id');

        $forecasts = DemandForecast::query()
            ->when($organizationId, fn($q) => $q->where('organization_id', $organizationId))
            ->with(['product', 'customer'])
            ->when($request->has('forecast_type'), fn($q) => $q->where('forecast_type', $request->forecast_type))
            ->orderBy('forecast_date', 'desc')
            ->paginate($request->get('per_page', 50));

        return response()->json([
            'success' => true,
            'data' => $forecasts,
        ]);
    }

    public function storeDemandForecast(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'organization_id' => 'required|exists:organizations,id',
            'product_id' => 'required|exists:products,id',
            'customer_id' => 'nullable|exists:customers,id',
            'forecast_date' => 'required|date',
            'forecast_period_months' => 'nullable|integer|min:1|max:36',
            'forecasted_quantity' => 'required|numeric|min:0',
            'forecast_type' => 'required|in:sales,production,procurement',
            'notes' => 'nullable|string',
        ]);

        $forecast = DemandForecast::create(array_merge($validated, [
            'actual_quantity' => 0,
            'accuracy_percentage' => 0,
            'created_by' => auth()->id(),
        ]));

        return response()->json([
            'success' => true,
            'data' => $forecast,
            'message' => 'Demand forecast created successfully',
        ], 201);
    }

    // MRP Analysis
    public function mrpAnalysis(Request $request): JsonResponse
    {
        $organizationId = $request->get('organization_id');
        $productId = $request->get('product_id');

        if (!$productId) {
            return response()->json([
                'success' => false,
                'message' => 'Product ID is required',
            ], 422);
        }

        // Get BOM for the product
        $bom = \App\Models\BillOfMaterial::where('product_id', $productId)
            ->where('organization_id', $organizationId)
            ->where('status', 'active')
            ->with('bomItems')
            ->first();

        if (!$bom) {
            return response()->json([
                'success' => false,
                'message' => 'No active Bill of Materials found for this product',
            ], 404);
        }

        // Calculate material requirements
        $materialRequirements = [];
        foreach ($bom->bomItems as $item) {
            $rawMaterial = \App\Models\Inventory::where('product_id', $item->raw_material_id)
                ->where('organization_id', $organizationId)
                ->first();

            $materialRequirements[] = [
                'raw_material_id' => $item->raw_material_id,
                'raw_material_name' => $item->rawMaterial->name ?? 'Unknown',
                'required_quantity' => $item->quantity,
                'unit' => $item->unit,
                'available_quantity' => $rawMaterial->current_quantity ?? 0,
                'to_purchase' => max(0, $item->quantity - ($rawMaterial->current_quantity ?? 0)),
                'reorder_level' => $rawMaterial->reorder_level ?? 0,
                'status' => ($rawMaterial->current_quantity ?? 0) >= $item->quantity ? 'Available' : 'Shortage',
            ];
        }

        return response()->json([
            'success' => true,
            'data' => [
                'product_id' => $productId,
                'bom_id' => $bom->id,
                'material_requirements' => $materialRequirements,
                'total_materials' => count($materialRequirements),
                'shortage_count' => collect($materialRequirements)->where('status', 'Shortage')->count(),
            ],
        ]);
    }

    // Capacity Analysis
    public function capacityAnalysis(Request $request): JsonResponse
    {
        $organizationId = $request->get('organization_id');
        $unitId = $request->get('manufacturing_unit_id');
        $startDate = $request->get('start_date', now()->startOfMonth()->toDateString());
        $endDate = $request->get('end_date', now()->endOfMonth()->toDateString());

        $query = \App\Models\ProductionOrder::query()
            ->when($organizationId, fn($q) => $q->where('organization_id', $organizationId))
            ->when($unitId, fn($q) => $q->where('manufacturing_unit_id', $unitId))
            ->whereBetween('planned_start_date', [$startDate, $endDate]);

        $totalOrders = $query->count();
        $totalPlannedQuantity = $query->sum('planned_quantity');
        $totalActualQuantity = $query->sum('actual_quantity');

        // Assume 8 hours per day x 30 days = 240 hours per month capacity
        $availableHours = 240; // This should be calculated from capacity plans
        $plannedHours = $totalOrders * 8; // Assume 8 hours per order (simplified)

        $analysis = [
            'period' => [
                'start_date' => $startDate,
                'end_date' => $endDate,
            ],
            'total_orders' => $totalOrders,
            'total_planned_quantity' => $totalPlannedQuantity,
            'total_actual_quantity' => $totalActualQuantity,
            'quantity_variance' => $totalActualQuantity - $totalPlannedQuantity,
            'quantity_variance_percentage' => $totalPlannedQuantity > 0
                ? round((($totalActualQuantity - $totalPlannedQuantity) / $totalPlannedQuantity) * 100, 2)
                : 0,
            'capacity' => [
                'available_hours' => $availableHours,
                'planned_hours' => $plannedHours,
                'utilization_percentage' => $availableHours > 0
                    ? round(($plannedHours / $availableHours) * 100, 2)
                    : 0,
                'remaining_hours' => max(0, $availableHours - $plannedHours),
            ],
        ];

        return response()->json([
            'success' => true,
            'data' => $analysis,
        ]);
    }

    private function generateMaterialRequirements(ProductionPlan $plan)
    {
        // Get BOM for the product
        $bom = \App\Models\BillOfMaterial::where('product_id', $plan->product_id)
            ->where('organization_id', $plan->organization_id)
            ->where('status', 'active')
            ->with('bomItems')
            ->first();

        if (!$bom) {
            return;
        }

        // Create material requirements for each BOM item
        foreach ($bom->bomItems as $item) {
            $requiredQuantity = $item->quantity * $plan->planned_quantity;

            // Check available stock
            $inventory = \App\Models\Inventory::where('product_id', $item->raw_material_id)
                ->where('organization_id', $plan->organization_id)
                ->first();

            $availableQuantity = $inventory->current_quantity ?? 0;
            $toPurchase = max(0, $requiredQuantity - $availableQuantity);

            MaterialRequirement::create([
                'organization_id' => $plan->organization_id,
                'production_plan_id' => $plan->id,
                'raw_material_id' => $item->raw_material_id,
                'required_quantity' => $requiredQuantity,
                'available_quantity' => $availableQuantity,
                'to_purchase' => $toPurchase,
                'status' => $toPurchase > 0 ? 'pending' : 'available',
                'required_by_date' => $plan->start_date,
            ]);
        }
    }
}

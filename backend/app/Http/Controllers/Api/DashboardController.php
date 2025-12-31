<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Organization;
use App\Models\Customer;
use App\Models\Supplier;
use App\Models\Product;
use App\Models\SalesOrder;
use App\Models\PurchaseOrder;
use App\Models\Invoice;
use App\Models\Inventory;
use App\Models\ProductionOrder;
use App\Models\Ncr;
use App\Models\Inspection;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function overview(Request $request): JsonResponse
    {
        $organizationId = $request->get('organization_id');

        $data = [
            'sales' => [
                'total_orders' => SalesOrder::when($organizationId, fn($q) => $q->where('organization_id', $organizationId))->count(),
                'pending_orders' => SalesOrder::when($organizationId, fn($q) => $q->where('organization_id', $organizationId))
                    ->pending()->count(),
                'total_value' => SalesOrder::when($organizationId, fn($q) => $q->where('organization_id', $organizationId))
                    ->sum('total_amount'),
                'month_value' => SalesOrder::when($organizationId, fn($q) => $q->where('organization_id', $organizationId))
                    ->whereMonth('order_date', now()->month)
                    ->sum('total_amount'),
            ],
            'procurement' => [
                'total_orders' => PurchaseOrder::when($organizationId, fn($q) => $q->where('organization_id', $organizationId))->count(),
                'pending_orders' => PurchaseOrder::when($organizationId, fn($q) => $q->where('organization_id', $organizationId))
                    ->pending()->count(),
                'total_value' => PurchaseOrder::when($organizationId, fn($q) => $q->where('organization_id', $organizationId))
                    ->sum('total_amount'),
            ],
            'inventory' => [
                'total_products' => Product::when($organizationId, fn($q) => $q->where('organization_id', $organizationId))->count(),
                'low_stock_items' => Inventory::when($organizationId, fn($q) => $q->where('organization_id', $organizationId))
                    ->lowStock()->count(),
                'out_of_stock_items' => Inventory::when($organizationId, fn($q) => $q->where('organization_id', $organizationId))
                    ->outOfStock()->count(),
            ],
            'production' => [
                'total_orders' => ProductionOrder::when($organizationId, fn($q) => $q->where('organization_id', $organizationId))->count(),
                'in_progress' => ProductionOrder::when($organizationId, fn($q) => $q->where('organization_id', $organizationId))
                    ->inProgress()->count(),
                'completed_today' => ProductionOrder::when($organizationId, fn($q) => $q->where('organization_id', $organizationId))
                    ->whereDate('actual_completion_date', today())->count(),
            ],
            'quality' => [
                'total_ncrs' => Ncr::when($organizationId, fn($q) => $q->where('organization_id', $organizationId))->count(),
                'open_ncrs' => Ncr::when($organizationId, fn($q) => $q->where('organization_id', $organizationId))
                    ->open()->count(),
                'critical_ncrs' => Ncr::when($organizationId, fn($q) => $q->where('organization_id', $organizationId))
                    ->critical()->count(),
                'overdue_ncrs' => Ncr::when($organizationId, fn($q) => $q->where('organization_id', $organizationId))
                    ->overdue()->count(),
                'inspections_today' => Inspection::when($organizationId, fn($q) => $q->where('organization_id', $organizationId))
                    ->whereDate('inspection_date', today())->count(),
            ],
            'financials' => [
                'total_receivables' => Invoice::when($organizationId, fn($q) => $q->where('organization_id', $organizationId))
                    ->unpaid()->sum('outstanding_amount'),
                'overdue_invoices' => Invoice::when($organizationId, fn($q) => $q->where('organization_id', $organizationId))
                    ->overdue()->count(),
                'total_customers' => Customer::when($organizationId, fn($q) => $q->where('organization_id', $organizationId))
                    ->active()->count(),
                'total_suppliers' => Supplier::when($organizationId, fn($q) => $q->where('organization_id', $organizationId))
                    ->active()->count(),
            ],
        ];

        return response()->json([
            'success' => true,
            'data' => $data,
        ]);
    }

    public function salesTrend(Request $request): JsonResponse
    {
        $organizationId = $request->get('organization_id');
        $months = $request->get('months', 6);

        $trend = SalesOrder::when($organizationId, fn($q) => $q->where('organization_id', $organizationId))
            ->selectRaw('DATE_FORMAT(order_date, "%Y-%m") as month, COUNT(*) as orders, SUM(total_amount) as value')
            ->where('order_date', '>=', now()->subMonths($months))
            ->groupBy('month')
            ->orderBy('month')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $trend,
        ]);
    }

    public function topCustomers(Request $request): JsonResponse
    {
        $organizationId = $request->get('organization_id');
        $limit = $request->get('limit', 10);

        $customers = Customer::when($organizationId, fn($q) => $q->where('organization_id', $organizationId))
            ->withCount('projects')
            ->orderBy('outstanding_balance', 'desc')
            ->limit($limit)
            ->get();

        return response()->json([
            'success' => true,
            'data' => $customers,
        ]);
    }

    public function topProducts(Request $request): JsonResponse
    {
        $organizationId = $request->get('organization_id');
        $limit = $request->get('limit', 10);

        $products = DB::table('sales_order_items')
            ->join('products', 'sales_order_items.product_id', '=', 'products.id')
            ->join('sales_orders', 'sales_order_items.sales_order_id', '=', 'sales_orders.id')
            ->when($organizationId, fn($q) => $q->where('sales_orders.organization_id', $organizationId))
            ->select(
                'products.id',
                'products.name',
                'products.code',
                DB::raw('SUM(sales_order_items.quantity) as total_quantity'),
                DB::raw('SUM(sales_order_items.line_total) as total_value')
            )
            ->groupBy('products.id', 'products.name', 'products.code')
            ->orderBy('total_value', 'desc')
            ->limit($limit)
            ->get();

        return response()->json([
            'success' => true,
            'data' => $products,
        ]);
    }

    public function qualityMetrics(Request $request): JsonResponse
    {
        $organizationId = $request->get('organization_id');

        $totalInspections = Inspection::when($organizationId, fn($q) => $q->where('organization_id', $organizationId))
            ->completed()->count();
        
        $passedInspections = Inspection::when($organizationId, fn($q) => $q->where('organization_id', $organizationId))
            ->completed()->passed()->count();

        $passRate = $totalInspections > 0 ? ($passedInspections / $totalInspections) * 100 : 0;

        $metrics = [
            'total_inspections' => $totalInspections,
            'passed_inspections' => $passedInspections,
            'failed_inspections' => $totalInspections - $passedInspections,
            'pass_rate' => round($passRate, 2),
            'total_ncrs' => Ncr::when($organizationId, fn($q) => $q->where('organization_id', $organizationId))->count(),
            'open_ncrs' => Ncr::when($organizationId, fn($q) => $q->where('organization_id', $organizationId))->open()->count(),
            'critical_ncrs' => Ncr::when($organizationId, fn($q) => $q->where('organization_id', $organizationId))->critical()->count(),
        ];

        return response()->json([
            'success' => true,
            'data' => $metrics,
        ]);
    }

    public function productionMetrics(Request $request): JsonResponse
    {
        $organizationId = $request->get('organization_id');

        $totalOrders = ProductionOrder::when($organizationId, fn($q) => $q->where('organization_id', $organizationId))->count();
        $completedOrders = ProductionOrder::when($organizationId, fn($q) => $q->where('organization_id', $organizationId))
            ->where('status', 'completed')->count();

        $completionRate = $totalOrders > 0 ? ($completedOrders / $totalOrders) * 100 : 0;

        $metrics = [
            'total_orders' => $totalOrders,
            'completed_orders' => $completedOrders,
            'in_progress_orders' => ProductionOrder::when($organizationId, fn($q) => $q->where('organization_id', $organizationId))
                ->inProgress()->count(),
            'completion_rate' => round($completionRate, 2),
            'total_quantity_planned' => ProductionOrder::when($organizationId, fn($q) => $q->where('organization_id', $organizationId))
                ->sum('planned_quantity'),
            'total_quantity_actual' => ProductionOrder::when($organizationId, fn($q) => $q->where('organization_id', $organizationId))
                ->sum('actual_quantity'),
        ];

        return response()->json([
            'success' => true,
            'data' => $metrics,
        ]);
    }
}

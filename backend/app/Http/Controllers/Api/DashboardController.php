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
        $organizationId = auth()->user()->organization_id;

        $data = [
            'sales' => [
                'total_orders' => SalesOrder::where('organization_id', $organizationId)->count(),
                'pending_orders' => SalesOrder::where('organization_id', $organizationId)
                    ->pending()->count(),
                'total_value' => SalesOrder::where('organization_id', $organizationId)
                    ->sum('total_amount'),
                'month_value' => SalesOrder::where('organization_id', $organizationId)
                    ->whereMonth('order_date', now()->month)
                    ->sum('total_amount'),
            ],
            'procurement' => [
                'total_orders' => PurchaseOrder::where('organization_id', $organizationId)->count(),
                'pending_orders' => PurchaseOrder::where('organization_id', $organizationId)
                    ->pending()->count(),
                'total_value' => PurchaseOrder::where('organization_id', $organizationId)
                    ->sum('total_amount'),
            ],
            'inventory' => [
                'total_products' => Product::where('organization_id', $organizationId)->count(),
                'low_stock_items' => Inventory::where('organization_id', $organizationId)
                    ->lowStock()->count(),
                'out_of_stock_items' => Inventory::where('organization_id', $organizationId)
                    ->outOfStock()->count(),
            ],
            'production' => [
                'total_orders' => ProductionOrder::where('organization_id', $organizationId)->count(),
                'in_progress' => ProductionOrder::where('organization_id', $organizationId)
                    ->inProgress()->count(),
                'completed_today' => ProductionOrder::where('organization_id', $organizationId)
                    ->whereDate('actual_completion_date', today())->count(),
            ],
            'quality' => [
                'total_ncrs' => Ncr::where('organization_id', $organizationId)->count(),
                'open_ncrs' => Ncr::where('organization_id', $organizationId)
                    ->open()->count(),
                'critical_ncrs' => Ncr::where('organization_id', $organizationId)
                    ->critical()->count(),
                'overdue_ncrs' => Ncr::where('organization_id', $organizationId)
                    ->overdue()->count(),
                'inspections_today' => Inspection::where('organization_id', $organizationId)
                    ->whereDate('inspection_date', today())->count(),
            ],
            'financials' => [
                'total_receivables' => Invoice::where('organization_id', $organizationId)
                    ->unpaid()->sum('outstanding_amount'),
                'overdue_invoices' => Invoice::where('organization_id', $organizationId)
                    ->overdue()->count(),
                'total_customers' => Customer::where('organization_id', $organizationId)
                    ->active()->count(),
                'total_suppliers' => Supplier::where('organization_id', $organizationId)
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
        $organizationId = auth()->user()->organization_id;
        $months = $request->get('months', 6);

        $trend = SalesOrder::where('organization_id', $organizationId)
            ->select(DB::raw('DATE_FORMAT(order_date, "%Y-%m") as month'), DB::raw('COUNT(*) as orders'), DB::raw('SUM(total_amount) as value'))
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
        $organizationId = auth()->user()->organization_id;
        $limit = min((int) $request->get('limit', 10), 100);

        $customers = Customer::where('organization_id', $organizationId)
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
            ->where('sales_orders.organization_id', auth()->user()->organization_id)
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
        $organizationId = auth()->user()->organization_id;

        $totalInspections = Inspection::where('organization_id', $organizationId)
            ->completed()->count();
        
        $passedInspections = Inspection::where('organization_id', $organizationId)
            ->completed()->passed()->count();

        $passRate = $totalInspections > 0 ? ($passedInspections / $totalInspections) * 100 : 0;

        $metrics = [
            'total_inspections' => $totalInspections,
            'passed_inspections' => $passedInspections,
            'failed_inspections' => $totalInspections - $passedInspections,
            'pass_rate' => round($passRate, 2),
            'total_ncrs' => Ncr::where('organization_id', $organizationId)->count(),
            'open_ncrs' => Ncr::where('organization_id', $organizationId)->open()->count(),
            'critical_ncrs' => Ncr::where('organization_id', $organizationId)->critical()->count(),
        ];

        return response()->json([
            'success' => true,
            'data' => $metrics,
        ]);
    }

    public function productionMetrics(Request $request): JsonResponse
    {
        $organizationId = auth()->user()->organization_id;

        $totalOrders = ProductionOrder::where('organization_id', $organizationId)->count();
        $completedOrders = ProductionOrder::where('organization_id', $organizationId)
            ->where('status', 'completed')->count();

        $completionRate = $totalOrders > 0 ? ($completedOrders / $totalOrders) * 100 : 0;

        $metrics = [
            'total_orders' => $totalOrders,
            'completed_orders' => $completedOrders,
            'in_progress_orders' => ProductionOrder::where('organization_id', $organizationId)
                ->inProgress()->count(),
            'completion_rate' => round($completionRate, 2),
            'total_quantity_planned' => ProductionOrder::where('organization_id', $organizationId)
                ->sum('planned_quantity'),
            'total_quantity_actual' => ProductionOrder::where('organization_id', $organizationId)
                ->sum('actual_quantity'),
        ];

        return response()->json([
            'success' => true,
            'data' => $metrics,
        ]);
    }
}

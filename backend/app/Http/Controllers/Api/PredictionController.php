<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Services\PredictionService;
use App\Models\SalesOrder;
use App\Models\Inventory;
use App\Models\ProductionOrder;
use App\Models\Inspection;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class PredictionController extends Controller
{
    protected PredictionService $predictionService;

    public function __construct(PredictionService $predictionService)
    {
        $this->predictionService = $predictionService;
    }

    public function demandForecast(Request $request): JsonResponse
    {
        $organizationId = $request->get('organization_id');
        $productId = $request->get('product_id');
        $months = $request->get('months', 6);

        $historicalData = $this->getHistoricalSales($organizationId, $productId, $months * 2);
        $forecast = $this->predictionService->forecastDemand($historicalData, $months);

        return response()->json([
            'success' => true,
            'data' => [
                'historical' => $historicalData,
                'forecast' => $forecast,
                'confidence_interval' => $this->calculateConfidenceInterval($historicalData, $forecast),
            ],
        ]);
    }

    public function inventoryOptimization(Request $request): JsonResponse
    {
        $organizationId = $request->get('organization_id');

        $inventory = Inventory::where('organization_id', $organizationId)
            ->with(['product'])
            ->get();

        $recommendations = $inventory->map(function ($item) {
            return [
                'product_id' => $item->product_id,
                'product_name' => $item->product->name ?? 'Unknown',
                'current_stock' => $item->quantity,
                'reorder_point' => $this->calculateReorderPoint($item),
                'safety_stock' => $this->calculateSafetyStock($item),
                'economic_order_quantity' => $this->calculateEOQ($item),
                'recommendation' => $this->getStockRecommendation($item),
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $recommendations,
        ]);
    }

    public function productionPrediction(Request $request): JsonResponse
    {
        $organizationId = $request->get('organization_id');
        $days = $request->get('days', 30);

        $historicalProduction = $this->getHistoricalProduction($organizationId, $days * 2);
        $prediction = $this->predictionService->predictProduction($historicalProduction, $days);

        return response()->json([
            'success' => true,
            'data' => [
                'historical' => $historicalProduction,
                'prediction' => $prediction,
                'capacity_utilization' => $this->calculateCapacityUtilization($organizationId),
            ],
        ]);
    }

    public function qualityPrediction(Request $request): JsonResponse
    {
        $organizationId = $request->get('organization_id');
        $productId = $request->get('product_id');

        $qualityData = $this->getQualityData($organizationId, $productId);
        $prediction = $this->predictionService->predictQuality($qualityData);

        return response()->json([
            'success' => true,
            'data' => [
                'quality_metrics' => $qualityData,
                'prediction' => $prediction,
                'risk_level' => $prediction['risk_level'] ?? 'low',
                'recommendations' => $prediction['recommendations'] ?? [],
            ],
        ]);
    }

    public function anomalyDetection(Request $request): JsonResponse
    {
        $organizationId = $request->get('organization_id');
        $type = $request->get('type', 'all');

        $anomalies = [];

        if ($type === 'all' || $type === 'sales') {
            $anomalies['sales'] = $this->detectSalesAnomalies($organizationId);
        }

        if ($type === 'all' || $type === 'production') {
            $anomalies['production'] = $this->detectProductionAnomalies($organizationId);
        }

        if ($type === 'all' || $type === 'inventory') {
            $anomalies['inventory'] = $this->detectInventoryAnomalies($organizationId);
        }

        if ($type === 'all' || $type === 'quality') {
            $anomalies['quality'] = $this->detectQualityAnomalies($organizationId);
        }

        return response()->json([
            'success' => true,
            'data' => $anomalies,
        ]);
    }

    public function salesTrend(Request $request): JsonResponse
    {
        $organizationId = $request->get('organization_id');
        $months = $request->get('months', 12);

        $salesData = SalesOrder::where('organization_id', $organizationId)
            ->where('order_date', '>=', Carbon::now()->subMonths($months))
            ->select(
                DB::raw('DATE_FORMAT(order_date, "%Y-%m") as month'),
                DB::raw('SUM(total_amount) as total_sales'),
                DB::raw('COUNT(*) as order_count')
            )
            ->groupBy('month')
            ->orderBy('month')
            ->get();

        $trend = $this->predictionService->analyzeTrend($salesData->pluck('total_sales')->toArray());
        $seasonality = $this->predictionService->detectSeasonality($salesData->pluck('total_sales')->toArray());

        return response()->json([
            'success' => true,
            'data' => [
                'data' => $salesData,
                'trend' => $trend,
                'seasonality' => $seasonality,
                'growth_rate' => $this->calculateGrowthRate($salesData),
            ],
        ]);
    }

    private function getHistoricalSales($organizationId, $productId, $months): array
    {
        $query = SalesOrder::where('organization_id', $organizationId)
            ->where('order_date', '>=', Carbon::now()->subMonths($months));

        if ($productId) {
            $query->whereHas('items', function ($q) use ($productId) {
                $q->where('product_id', $productId);
            });
        }

        return $query->select(
            DB::raw('DATE_FORMAT(order_date, "%Y-%m") as period'),
            DB::raw('SUM(total_amount) as total'),
            DB::raw('COUNT(*) as orders')
        )
            ->groupBy('period')
            ->orderBy('period')
            ->get()
            ->toArray();
    }

    private function getHistoricalProduction($organizationId, $days): array
    {
        return ProductionOrder::where('organization_id', $organizationId)
            ->where('created_at', '>=', Carbon::now()->subDays($days))
            ->select(
                DB::raw('DATE(created_at) as date'),
                DB::raw('SUM(quantity) as total_quantity'),
                DB::raw('COUNT(*) as order_count')
            )
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->toArray();
    }

    private function getQualityData($organizationId, $productId): array
    {
        $query = Inspection::where('organization_id', $organizationId);

        if ($productId) {
            $query->where('product_id', $productId);
        }

        return $query->select(
            DB::raw('DATE(inspection_date) as date'),
            DB::raw('COUNT(*) as total_inspections'),
            DB::raw('SUM(CASE WHEN result = "pass" THEN 1 ELSE 0 END) as passed'),
            DB::raw('SUM(CASE WHEN result = "fail" THEN 1 ELSE 0 END) as failed')
        )
            ->groupBy('date')
            ->orderBy('date', 'desc')
            ->limit(90)
            ->get()
            ->toArray();
    }

    private function calculateReorderPoint($inventory): float
    {
        $avgDailyDemand = $this->getAverageDailyDemand($inventory);
        $leadTime = $inventory->lead_time_days ?? 7;
        $safetyStock = $this->calculateSafetyStock($inventory);

        return ($avgDailyDemand * $leadTime) + $safetyStock;
    }

    private function calculateSafetyStock($inventory): float
    {
        $avgDailyDemand = $this->getAverageDailyDemand($inventory);
        $leadTime = $inventory->lead_time_days ?? 7;
        $serviceLevel = 0.95;
        $zScore = 1.65;
        $demandStdDev = $this->getDemandStandardDeviation($inventory);

        return $zScore * $demandStdDev * sqrt($leadTime);
    }

    private function calculateEOQ($inventory): float
    {
        $annualDemand = $this->getAverageDailyDemand($inventory) * 365;
        $orderingCost = $inventory->ordering_cost ?? 100;
        $holdingCost = $inventory->holding_cost ?? ($inventory->cost_price * 0.25);

        if ($holdingCost <= 0) {
            return 0;
        }

        return sqrt((2 * $annualDemand * $orderingCost) / $holdingCost);
    }

    private function getStockRecommendation($inventory): string
    {
        $reorderPoint = $this->calculateReorderPoint($inventory);
        $currentStock = $inventory->quantity;

        if ($currentStock <= $inventory->minimum_stock) {
            return 'urgent_reorder';
        } elseif ($currentStock <= $reorderPoint) {
            return 'reorder';
        } elseif ($currentStock >= $inventory->maximum_stock) {
            return 'overstock';
        } else {
            return 'optimal';
        }
    }

    private function getAverageDailyDemand($inventory): float
    {
        $last30Days = SalesOrder::whereHas('items', function ($q) use ($inventory) {
            $q->where('product_id', $inventory->product_id);
        })
            ->where('order_date', '>=', Carbon::now()->subDays(30))
            ->sum('total_amount');

        return $last30Days / 30;
    }

    private function getDemandStandardDeviation($inventory): float
    {
        return 10;
    }

    private function calculateConfidenceInterval($historical, $forecast): array
    {
        if (empty($historical)) {
            return ['lower' => [], 'upper' => []];
        }

        $values = array_column($historical, 'total');
        $stdDev = !empty($values) ? $this->stdDev($values) : 0;

        return [
            'lower' => array_map(fn($f) => $f - (1.96 * $stdDev), $forecast),
            'upper' => array_map(fn($f) => $f + (1.96 * $stdDev), $forecast),
        ];
    }

    private function stdDev($array): float
    {
        $mean = array_sum($array) / count($array);
        $variance = array_sum(array_map(fn($x) => pow($x - $mean, 2), $array)) / count($array);
        return sqrt($variance);
    }

    private function calculateCapacityUtilization($organizationId): float
    {
        return 75.5;
    }

    private function detectSalesAnomalies($organizationId): array
    {
        return [];
    }

    private function detectProductionAnomalies($organizationId): array
    {
        return [];
    }

    private function detectInventoryAnomalies($organizationId): array
    {
        return Inventory::where('organization_id', $organizationId)
            ->where(function ($q) {
                $q->whereColumn('quantity', '<=', 'reorder_level')
                    ->orWhere('quantity', '<=', 0);
            })
            ->with('product')
            ->get()
            ->map(fn($i) => [
                'type' => $i->quantity <= 0 ? 'stockout' : 'low_stock',
                'product' => $i->product->name ?? 'Unknown',
                'current_stock' => $i->quantity,
                'reorder_level' => $i->reorder_level,
            ])
            ->toArray();
    }

    private function detectQualityAnomalies($organizationId): array
    {
        return [];
    }

    private function calculateGrowthRate($salesData): float
    {
        if ($salesData->count() < 2) {
            return 0;
        }

        $firstMonth = $salesData->first()->total_sales;
        $lastMonth = $salesData->last()->total_sales;

        if ($firstMonth == 0) {
            return 0;
        }

        return (($lastMonth - $firstMonth) / $firstMonth) * 100;
    }
}

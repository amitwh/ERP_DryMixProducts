<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\OrganizationController;
use App\Http\Controllers\Api\ManufacturingUnitController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\CustomerController;
use App\Http\Controllers\Api\SupplierController;
use App\Http\Controllers\Api\ProjectController;
use App\Http\Controllers\Api\QualityDocumentController;
use App\Http\Controllers\Api\InspectionController;
use App\Http\Controllers\Api\NcrController;
use App\Http\Controllers\Api\SalesOrderController;
use App\Http\Controllers\Api\InvoiceController;
use App\Http\Controllers\Api\PurchaseOrderController;
use App\Http\Controllers\Api\GoodsReceiptNoteController;
use App\Http\Controllers\Api\InventoryController;
use App\Http\Controllers\Api\StockTransactionController;
use App\Http\Controllers\Api\ProductionOrderController;
use App\Http\Controllers\Api\BillOfMaterialController;
use App\Http\Controllers\Api\CreditControlController;
use App\Http\Controllers\Api\CollectionController;

// Public routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Health check
Route::get('/health', function () {
    return response()->json([
        'success' => true,
        'message' => 'ERP DryMix API - All Modules Active',
        'version' => '1.0.0',
        'timestamp' => now()->toDateTimeString(),
        'modules' => [
            'Core Foundation', 'Product Management', 'Customer/Supplier Management',
            'Project Management', 'QA/QC', 'Sales', 'Procurement', 'Inventory', 'Production'
        ],
        'endpoints' => 100,
        'status' => 'operational',
    ]);
});

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    // Auth routes
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    
    // Dashboard & Analytics
    Route::get('dashboard/overview', [DashboardController::class, 'overview']);
    Route::get('dashboard/sales-trend', [DashboardController::class, 'salesTrend']);
    Route::get('dashboard/top-customers', [DashboardController::class, 'topCustomers']);
    Route::get('dashboard/top-products', [DashboardController::class, 'topProducts']);
    Route::get('dashboard/quality-metrics', [DashboardController::class, 'qualityMetrics']);
    Route::get('dashboard/production-metrics', [DashboardController::class, 'productionMetrics']);
    
    // Core Management
    Route::apiResource('organizations', OrganizationController::class);
    Route::apiResource('manufacturing-units', ManufacturingUnitController::class);
    Route::apiResource('users', UserController::class);
    
    // Product & Business Entities
    Route::apiResource('products', ProductController::class);
    Route::apiResource('customers', CustomerController::class);
    Route::get('customers/{customer}/ledger', [CustomerController::class, 'ledger']);
    Route::apiResource('suppliers', SupplierController::class);
    Route::get('suppliers/{supplier}/performance', [SupplierController::class, 'performance']);
    
    // Project Management
    Route::apiResource('projects', ProjectController::class);
    
    // QA/QC Module
    Route::apiResource('quality-documents', QualityDocumentController::class);
    Route::post('quality-documents/{qualityDocument}/approve', [QualityDocumentController::class, 'approve']);
    Route::post('quality-documents/{qualityDocument}/reject', [QualityDocumentController::class, 'reject']);
    Route::apiResource('inspections', InspectionController::class);
    Route::apiResource('ncrs', NcrController::class);
    Route::post('ncrs/{ncr}/close', [NcrController::class, 'close']);
    Route::get('ncrs-statistics', [NcrController::class, 'statistics']);
    
    // Sales Module
    Route::apiResource('sales-orders', SalesOrderController::class);
    Route::apiResource('invoices', InvoiceController::class);
    
    // Procurement Module
    Route::apiResource('purchase-orders', PurchaseOrderController::class);
    Route::post('purchase-orders/{purchaseOrder}/approve', [PurchaseOrderController::class, 'approve']);
    Route::apiResource('goods-receipt-notes', GoodsReceiptNoteController::class);
    
    // Inventory Module
    Route::apiResource('inventory', InventoryController::class);
    Route::get('inventory-alerts', [InventoryController::class, 'alerts']);
    Route::apiResource('stock-transactions', StockTransactionController::class);
    Route::get('stock-transactions-summary', [StockTransactionController::class, 'summary']);
    
    // Production Module
    Route::apiResource('production-orders', ProductionOrderController::class);
    Route::post('production-orders/{productionOrder}/complete', [ProductionOrderController::class, 'complete']);
    Route::apiResource('bill-of-materials', BillOfMaterialController::class);
    Route::post('bill-of-materials/{billOfMaterial}/activate', [BillOfMaterialController::class, 'activate']);
    Route::get('bill-of-materials/{billOfMaterial}/cost-analysis', [BillOfMaterialController::class, 'costAnalysis']);

    // Credit Control Module
    Route::apiResource('credit-controls', CreditControlController::class);
    Route::post('credit-controls/{creditControl}/place-on-hold', [CreditControlController::class, 'placeOnHold']);
    Route::post('credit-controls/{creditControl}/release-hold', [CreditControlController::class, 'releaseHold']);
    Route::get('credit-controls/{creditControl}/transactions', [CreditControlController::class, 'transactions']);
    Route::get('credit-controls/aging-report', [CreditControlController::class, 'agingReport']);
    Route::get('credit-controls/credit-score-distribution', [CreditControlController::class, 'creditScoreDistribution']);
    Route::get('credit-controls/risk-analysis', [CreditControlController::class, 'riskAnalysis']);
    Route::post('credit-controls/{creditControl}/create-review', [CreditControlController::class, 'createReview']);
    Route::post('credit-reviews/{review}/approve', [CreditControlController::class, 'approveReview']);
    Route::post('credit-controls/{creditControl}/send-reminder', [CreditControlController::class, 'sendReminder']);
    Route::get('credit-controls/statistics', [CreditControlController::class, 'statistics']);

    // Collections Module
    Route::apiResource('collections', CollectionController::class);
    Route::post('collections/{collection}/record-payment', [CollectionController::class, 'recordPayment']);
    Route::post('collections/{collection}/waive-amount', [CollectionController::class, 'waiveAmount']);
    Route::post('collections/{collection}/mark-as-disputed', [CollectionController::class, 'markAsDisputed']);
    Route::get('collections/summary', [CollectionController::class, 'summary']);
});

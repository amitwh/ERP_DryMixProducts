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

    // Finance & Accounting Module
    Route::get('finance', [FinanceController::class, 'index']);
    Route::apiResource('chart-of-accounts', FinanceController::class)->parameters([
        'chart-of-account' => 'chartOfAccount'
    ]);
    Route::get('chart-of-accounts/{chartOfAccount}/ledger', [FinanceController::class, 'ledgers']);
    Route::apiResource('journal-vouchers', FinanceController::class)->parameters([
        'journal-voucher' => 'journalVoucher'
    ]);
    Route::post('journal-vouchers/{journalVoucher}/post', [FinanceController::class, 'postJournalVoucher']);
    Route::post('journal-vouchers/{journalVoucher}/cancel', [FinanceController::class, 'cancelJournalVoucher']);
    Route::apiResource('fiscal-years', FinanceController::class)->parameters([
        'fiscal-year' => 'fiscalYear'
    ]);
    Route::get('ledgers', [FinanceController::class, 'ledgers']);
    Route::get('finance/trial-balance', [FinanceController::class, 'trialBalance']);
    Route::get('finance/balance-sheet', [FinanceController::class, 'balanceSheet']);
    Route::get('finance/profit-and-loss', [FinanceController::class, 'profitAndLoss']);

    // HR & Payroll Module
    Route::get('hr', [HRController::class, 'index']);
    Route::apiResource('employees', HRController::class)->parameters([
        'employee' => 'employee'
    ]);
    Route::apiResource('attendances', HRController::class)->parameters([
        'attendance' => 'attendance'
    ]);
    Route::apiResource('leave-requests', HRController::class)->parameters([
        'leave-request' => 'leaveRequest'
    ]);
    Route::post('leave-requests/{leaveRequest}/approve', [HRController::class, 'approveLeaveRequest']);
    Route::post('leave-requests/{leaveRequest}/reject', [HRController::class, 'rejectLeaveRequest']);
    Route::get('departments', [HRController::class, 'departments']);
    Route::post('departments', [HRController::class, 'storeDepartment']);
    Route::get('hr/statistics', [HRController::class, 'statistics']);

    // Planning Module
    Route::get('planning', [PlanningController::class, 'index']);
    Route::apiResource('production-plans', PlanningController::class)->parameters([
        'production-plan' => 'productionPlan'
    ]);
    Route::post('production-plans/{productionPlan}/approve', [PlanningController::class, 'approveProductionPlan']);
    Route::get('material-requirements', [PlanningController::class, 'materialRequirements']);
    Route::apiResource('demand-forecasts', PlanningController::class)->parameters([
        'demand-forecast' => 'demandForecast'
    ]);
    Route::get('planning/mrp-analysis', [PlanningController::class, 'mrpAnalysis']);
    Route::get('planning/capacity-analysis', [PlanningController::class, 'capacityAnalysis']);

    // Communication Module
    Route::get('communication', [CommunicationController::class, 'index']);
    Route::get('communication-templates', [CommunicationController::class, 'templates']);
    Route::post('communication-templates', [CommunicationController::class, 'storeTemplate']);
    Route::get('communication-logs', [CommunicationController::class, 'logs']);
    Route::post('communication/send-message', [CommunicationController::class, 'sendMessage']);
    Route::get('notification-preferences', [CommunicationController::class, 'notificationPreferences']);
    Route::post('notification-preferences', [CommunicationController::class, 'updateNotificationPreference']);
    Route::get('communication/statistics', [CommunicationController::class, 'statistics']);
    Route::post('communication/bulk-send', [CommunicationController::class, 'bulkSend']);

    // System Administration Module
    Route::get('system', [SystemAdminController::class, 'index']);
    Route::get('modules', [SystemAdminController::class, 'modules']);
    Route::get('modules/{module}', [SystemAdminController::class, 'showModule']);
    Route::get('api-keys', [SystemAdminController::class, 'apiKeys']);
    Route::post('api-keys', [SystemAdminController::class, 'storeApiKey']);
    Route::post('api-keys/{apiKey}/revoke', [SystemAdminController::class, 'revokeApiKey']);
    Route::get('api-logs', [SystemAdminController::class, 'apiLogs']);
    Route::get('api-logs/statistics', [SystemAdminController::class, 'apiLogStatistics']);
    Route::get('system-logs', [SystemAdminController::class, 'systemLogs']);
    Route::get('system-backups', [SystemAdminController::class, 'systemBackups']);
    Route::post('system-backups', [SystemAdminController::class, 'createBackup']);
    Route::get('scheduled-tasks', [SystemAdminController::class, 'scheduledTasks']);
    Route::post('scheduled-tasks', [SystemAdminController::class, 'storeScheduledTask']);
    Route::post('scheduled-tasks/{task}/execute', [SystemAdminController::class, 'executeScheduledTask']);
    Route::post('scheduled-tasks/{task}/pause', [SystemAdminController::class, 'pauseScheduledTask']);
    Route::post('scheduled-tasks/{task}/resume', [SystemAdminController::class, 'resumeScheduledTask']);
    Route::get('system/health', [SystemAdminController::class, 'systemHealth']);
    Route::get('system/statistics', [SystemAdminController::class, 'statistics']);

    // Print & Export
    Route::prefix('print')->group(function () {
        Route::get('sales-order/{order}', [PrintController::class, 'salesOrder']);
        Route::get('invoice/{invoice}', [PrintController::class, 'invoice']);
        Route::get('purchase-order/{order}', [PrintController::class, 'purchaseOrder']);
        Route::get('grn/{grn}', [PrintController::class, 'goodsReceiptNote']);
        Route::get('production-order/{order}', [PrintController::class, 'productionOrder']);
        Route::get('bom', [PrintController::class, 'billOfMaterials']);
        Route::get('inspection/{inspection}', [PrintController::class, 'inspectionReport']);
        Route::get('ncr/{ncr}', [PrintController::class, 'ncrReport']);
        Route::get('customer-ledger', [PrintController::class, 'customerLedger']);
        Route::get('stock-report', [PrintController::class, 'stockReport']);
        Route::get('credit-control/{creditControl}', [PrintController::class, 'creditControlReport']);
        Route::get('collection/{collection}', [PrintController::class, 'collectionReport']);
        Route::get('aging-report', [PrintController::class, 'agingReport']);
        Route::get('payslip/{payslip}', [PrintController::class, 'payslip']);
        Route::get('attendance-report', [PrintController::class, 'attendanceReport']);
        Route::get('dry-mix-product-test/{test}', [PrintController::class, 'dryMixProductTest']);
        Route::get('raw-material-test/{test}', [PrintController::class, 'rawMaterialTest']);
        Route::get('trial-balance', [PrintController::class, 'trialBalance']);
        Route::get('balance-sheet', [PrintController::class, 'balanceSheet']);
        Route::get('profit-loss', [PrintController::class, 'profitAndLoss']);
    });

    // Test Pages Module
    Route::prefix('test-pages')->group(function () {
        Route::get('/', [TestPageController::class, 'index']);

        // Dry Mix Product Tests
        Route::get('dry-mix-product-tests', [TestPageController::class, 'dryMixProductTests']);
        Route::post('dry-mix-product-tests', [TestPageController::class, 'storeDryMixProductTest']);
        Route::get('dry-mix-product-tests/{test}', [TestPageController::class, 'showDryMixProductTest']);
        Route::put('dry-mix-product-tests/{test}', [TestPageController::class, 'updateDryMixProductTest']);
        Route::delete('dry-mix-product-tests/{test}', [TestPageController::class, 'deleteDryMixProductTest']);
        Route::post('dry-mix-product-tests/{test}/test', [TestPageController::class, 'testDryMixProductTest']);
        Route::post('dry-mix-product-tests/{test}/verify', [TestPageController::class, 'verifyDryMixProductTest']);
        Route::post('dry-mix-product-tests/{test}/approve', [TestPageController::class, 'approveDryMixProductTest']);

        // Raw Material Tests
        Route::get('raw-material-tests', [TestPageController::class, 'rawMaterialTests']);
        Route::post('raw-material-tests', [TestPageController::class, 'storeRawMaterialTest']);
        Route::get('raw-material-tests/{test}', [TestPageController::class, 'showRawMaterialTest']);
        Route::put('raw-material-tests/{test}', [TestPageController::class, 'updateRawMaterialTest']);
        Route::delete('raw-material-tests/{test}', [TestPageController::class, 'deleteRawMaterialTest']);

        // Test Parameters
        Route::get('test-parameters', [TestPageController::class, 'testParameters']);
        Route::post('test-parameters', [TestPageController::class, 'storeTestParameter']);

        // Test Standards
        Route::get('test-standards', [TestPageController::class, 'testStandards']);
        Route::post('test-standards', [TestPageController::class, 'storeTestStandard']);

        // Test Templates
        Route::get('test-templates', [TestPageController::class, 'testTemplates']);
        Route::post('test-templates', [TestPageController::class, 'storeTestTemplate']);

        // Statistics
        Route::get('statistics', [TestPageController::class, 'statistics']);
    });

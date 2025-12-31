<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\OrganizationController;
use App\Http\Controllers\Api\ManufacturingUnitController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\ProjectController;
use App\Http\Controllers\Api\InspectionController;
use App\Http\Controllers\Api\SalesOrderController;
use App\Http\Controllers\Api\InvoiceController;
use App\Http\Controllers\Api\PurchaseOrderController;
use App\Http\Controllers\Api\GoodsReceiptNoteController;
use App\Http\Controllers\Api\InventoryController;
use App\Http\Controllers\Api\StockTransactionController;

// Public routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Health check
Route::get('/health', function () {
    return response()->json([
        'success' => true,
        'message' => 'ERP DryMix API is running',
        'version' => '1.0.0',
        'timestamp' => now()->toDateTimeString(),
    ]);
});

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    // Auth routes
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    
    // Organizations
    Route::apiResource('organizations', OrganizationController::class);
    
    // Manufacturing Units
    Route::apiResource('manufacturing-units', ManufacturingUnitController::class);
    
    // Users
    Route::apiResource('users', UserController::class);
    
    // Products
    Route::apiResource('products', ProductController::class);
    
    // Projects
    Route::apiResource('projects', ProjectController::class);
    
    // Inspections
    Route::apiResource('inspections', InspectionController::class);
    
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
});

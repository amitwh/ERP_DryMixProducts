<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Models\Customer;
use App\Models\Product;
use App\Models\Supplier;
use App\Models\SalesOrder;
use App\Models\Inventory;
use Maatwebsite\Excel\Facades\Excel;
use App\Exports\GenericExport;
use App\Imports\GenericImport;
use Illuminate\Support\Facades\Validator;

class ExportImportController extends Controller
{
    public function export(Request $request): JsonResponse
    {
        $type = $request->get('type');
        $format = $request->get('format', 'xlsx');
        $organizationId = $request->get('organization_id');

        $allowedTypes = ['customers', 'products', 'suppliers', 'sales_orders', 'inventory'];
        if (!in_array($type, $allowedTypes)) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid export type',
            ], 400);
        }

        $data = $this->getData($type, $organizationId);
        $filename = $type . '_' . date('Y-m-d_His') . '.' . $format;

        $export = new GenericExport($data['data'], $data['headers']);

        $path = 'exports/' . $filename;
        
        if ($format === 'csv') {
            Excel::store($export, $path, 'local', \Maatwebsite\Excel\Excel::CSV);
        } else {
            Excel::store($export, $path, 'local');
        }

        return response()->json([
            'success' => true,
            'data' => [
                'filename' => $filename,
                'download_url' => url('/api/v1/export/download/' . $filename),
                'records' => count($data['data']),
            ],
        ]);
    }

    public function import(Request $request): JsonResponse
    {
        $request->validate([
            'file' => 'required|file|mimes:xlsx,xls,csv',
            'type' => 'required|string',
        ]);

        $type = $request->get('type');
        $organizationId = $request->get('organization_id');

        $allowedTypes = ['customers', 'products', 'suppliers'];
        if (!in_array($type, $allowedTypes)) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid import type',
            ], 400);
        }

        try {
            $file = $request->file('file');
            $import = new GenericImport($type, $organizationId);
            Excel::import($import, $file);

            return response()->json([
                'success' => true,
                'data' => [
                    'imported' => $import->getImportedCount(),
                    'skipped' => $import->getSkippedCount(),
                    'errors' => $import->getErrors(),
                ],
                'message' => "Successfully imported {$import->getImportedCount()} records",
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Import failed: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function downloadTemplate(Request $request): JsonResponse
    {
        $type = $request->get('type');
        
        $templates = [
            'customers' => [
                ['customer_code', 'name', 'email', 'phone', 'address', 'city', 'state', 'country', 'postal_code', 'gst_number', 'credit_limit', 'payment_terms'],
                ['CUST001', 'Example Customer', 'customer@example.com', '+1234567890', '123 Street', 'Mumbai', 'Maharashtra', 'India', '400001', '27AABCT1234M1Z5', '100000', 'Net 30'],
            ],
            'products' => [
                ['product_code', 'name', 'description', 'product_type', 'unit_of_measure', 'selling_price', 'cost_price', 'minimum_stock', 'maximum_stock'],
                ['PROD001', 'Example Product', 'Product description', 'tile_adhesive', 'kg', '500', '350', '50', '1000'],
            ],
            'suppliers' => [
                ['supplier_code', 'name', 'email', 'phone', 'address', 'city', 'state', 'country', 'postal_code', 'gst_number', 'contact_person', 'payment_terms'],
                ['SUP001', 'Example Supplier', 'supplier@example.com', '+1234567890', '456 Industrial', 'Mumbai', 'Maharashtra', 'India', '400002', '27AABCS5678N1Z5', 'John Doe', 'Net 30'],
            ],
        ];

        if (!isset($templates[$type])) {
            return response()->json([
                'success' => false,
                'message' => 'Template not found',
            ], 404);
        }

        $filename = $type . '_template.xlsx';
        $export = new GenericExport([$templates[$type][1]], $templates[$type][0]);
        
        Excel::store($export, 'templates/' . $filename, 'local');

        return response()->json([
            'success' => true,
            'data' => [
                'filename' => $filename,
                'download_url' => url('/api/v1/export/download/' . $filename),
            ],
        ]);
    }

    private function getData(string $type, int $organizationId): array
    {
        switch ($type) {
            case 'customers':
                return [
                    'data' => Customer::where('organization_id', $organizationId)->get()->toArray(),
                    'headers' => ['ID', 'Code', 'Name', 'Email', 'Phone', 'City', 'Status'],
                ];
            case 'products':
                return [
                    'data' => Product::where('organization_id', $organizationId)->get()->toArray(),
                    'headers' => ['ID', 'Code', 'Name', 'Type', 'Unit', 'Selling Price', 'Cost Price', 'Status'],
                ];
            case 'suppliers':
                return [
                    'data' => Supplier::where('organization_id', $organizationId)->get()->toArray(),
                    'headers' => ['ID', 'Code', 'Name', 'Email', 'Phone', 'City', 'Status'],
                ];
            case 'sales_orders':
                return [
                    'data' => SalesOrder::where('organization_id', $organizationId)->get()->toArray(),
                    'headers' => ['ID', 'Order Number', 'Customer', 'Date', 'Total', 'Status'],
                ];
            case 'inventory':
                return [
                    'data' => Inventory::where('organization_id', $organizationId)->with('product')->get()->map(function ($item) {
                        return [
                            'id' => $item->id,
                            'product' => $item->product->name ?? 'N/A',
                            'quantity' => $item->quantity,
                            'available' => $item->available_quantity,
                            'reorder_level' => $item->reorder_level,
                        ];
                    })->toArray(),
                    'headers' => ['ID', 'Product', 'Quantity', 'Available', 'Reorder Level'],
                ];
            default:
                return ['data' => [], 'headers' => []];
        }
    }
}

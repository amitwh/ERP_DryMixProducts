<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SalesOrder;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class SalesOrderController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = SalesOrder::query()->where('organization_id', auth()->user()->organization_id);

        if ($request->has('customer_id')) {
            $query->where('customer_id', $request->customer_id);
        }

        if ($request->has('status')) {
            $query->byStatus($request->status);
        }

        if ($request->has('search')) {
            $query->where(function($q) use ($request) {
                $q->where('order_number', 'like', "%{$request->search}%")
                  ->orWhereHas('customer', function($q2) use ($request) {
                      $q2->where('name', 'like', "%{$request->search}%");
                  });
            });
        }

        $perPage = min((int) $request->get('per_page', 15), 100);
        $orders = $query->with(['customer', 'project', 'salesPerson', 'items.product'])->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $orders,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'customer_id' => 'required|exists:customers,id',
            'order_number' => 'required|string|unique:sales_orders,order_number',
            'order_date' => 'required|date',
            'expected_delivery_date' => 'nullable|date|after:order_date',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|numeric|min:0.01',
            'items.*.unit_price' => 'required|numeric|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        DB::beginTransaction();
        try {
            $orderData = array_merge($request->except('items'), [
                'organization_id' => auth()->user()->organization_id,
            ]);
            $orderData['subtotal'] = 0;
            $orderData['tax_amount'] = 0;
            $orderData['total_amount'] = 0;

            $order = SalesOrder::create($orderData);

            foreach ($request->items as $item) {
                $lineTotal = $item['quantity'] * $item['unit_price'];
                $discount = $lineTotal * ($item['discount_percentage'] ?? 0) / 100;
                $taxableAmount = $lineTotal - $discount;
                $tax = $taxableAmount * ($item['tax_percentage'] ?? 18) / 100;
                
                $order->items()->create([
                    'product_id' => $item['product_id'],
                    'quantity' => $item['quantity'],
                    'unit_of_measure' => $item['unit_of_measure'] ?? 'MT',
                    'unit_price' => $item['unit_price'],
                    'discount_percentage' => $item['discount_percentage'] ?? 0,
                    'tax_percentage' => $item['tax_percentage'] ?? 18,
                    'line_total' => $lineTotal,
                ]);

                $orderData['subtotal'] += $lineTotal;
                $orderData['tax_amount'] += $tax;
            }

            $orderData['total_amount'] = $orderData['subtotal'] + $orderData['tax_amount'] - ($orderData['discount_amount'] ?? 0);
            $order->update($orderData);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Sales order created successfully',
                'data' => $order->load(['customer', 'items.product']),
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to create sales order',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function show(SalesOrder $salesOrder): JsonResponse
    {
        $salesOrder->load(['customer', 'project', 'salesPerson', 'items.product', 'invoices']);

        return response()->json([
            'success' => true,
            'data' => $salesOrder,
        ]);
    }

    public function update(Request $request, SalesOrder $salesOrder): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'expected_delivery_date' => 'nullable|date',
            'status' => 'in:draft,confirmed,processing,shipped,delivered,cancelled',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        $salesOrder->update($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Sales order updated successfully',
            'data' => $salesOrder->load(['customer', 'items.product']),
        ]);
    }

    public function destroy(SalesOrder $salesOrder): JsonResponse
    {
        if ($salesOrder->status !== 'draft') {
            return response()->json([
                'success' => false,
                'message' => 'Only draft orders can be deleted',
            ], 400);
        }

        $salesOrder->delete();

        return response()->json([
            'success' => true,
            'message' => 'Sales order deleted successfully',
        ]);
    }
}

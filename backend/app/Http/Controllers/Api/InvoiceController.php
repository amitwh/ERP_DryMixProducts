<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Invoice;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;

class InvoiceController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Invoice::query();

        if ($request->has('organization_id')) {
            $query->where('organization_id', $request->organization_id);
        }

        if ($request->has('customer_id')) {
            $query->where('customer_id', $request->customer_id);
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('overdue')) {
            $query->overdue();
        }

        if ($request->has('unpaid')) {
            $query->unpaid();
        }

        $perPage = $request->get('per_page', 15);
        $invoices = $query->with(['customer', 'salesOrder'])->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $invoices,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'organization_id' => 'required|exists:organizations,id',
            'customer_id' => 'required|exists:customers,id',
            'sales_order_id' => 'nullable|exists:sales_orders,id',
            'invoice_number' => 'required|string|unique:invoices,invoice_number',
            'invoice_date' => 'required|date',
            'due_date' => 'required|date|after:invoice_date',
            'subtotal' => 'required|numeric|min:0',
            'tax_amount' => 'required|numeric|min:0',
            'total_amount' => 'required|numeric|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        $invoiceData = $request->all();
        $invoiceData['outstanding_amount'] = $invoiceData['total_amount'];
        $invoiceData['paid_amount'] = 0;

        $invoice = Invoice::create($invoiceData);

        return response()->json([
            'success' => true,
            'message' => 'Invoice created successfully',
            'data' => $invoice->load(['customer', 'salesOrder']),
        ], 201);
    }

    public function show(Invoice $invoice): JsonResponse
    {
        $invoice->load(['customer', 'salesOrder']);

        return response()->json([
            'success' => true,
            'data' => $invoice,
        ]);
    }

    public function update(Request $request, Invoice $invoice): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'due_date' => 'sometimes|date',
            'paid_amount' => 'sometimes|numeric|min:0|max:' . $invoice->total_amount,
            'status' => 'in:draft,sent,partially_paid,paid,overdue,cancelled',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        if ($request->has('paid_amount')) {
            $paidAmount = $request->paid_amount;
            $invoice->paid_amount = $paidAmount;
            $invoice->outstanding_amount = $invoice->total_amount - $paidAmount;
            
            if ($paidAmount >= $invoice->total_amount) {
                $invoice->status = 'paid';
            } elseif ($paidAmount > 0) {
                $invoice->status = 'partially_paid';
            }
        }

        $invoice->update($request->except(['paid_amount']));

        return response()->json([
            'success' => true,
            'message' => 'Invoice updated successfully',
            'data' => $invoice->load(['customer', 'salesOrder']),
        ]);
    }

    public function destroy(Invoice $invoice): JsonResponse
    {
        if ($invoice->status !== 'draft') {
            return response()->json([
                'success' => false,
                'message' => 'Only draft invoices can be deleted',
            ], 400);
        }

        $invoice->delete();

        return response()->json([
            'success' => true,
            'message' => 'Invoice deleted successfully',
        ]);
    }
}

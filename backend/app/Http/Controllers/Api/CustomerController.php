<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;

class CustomerController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Customer::query()->where('organization_id', auth()->user()->organization_id);

        if ($request->has('status')) {

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('search')) {
            $query->where(function($q) use ($request) {
                $q->where('name', 'like', "%{$request->search}%")
                  ->orWhere('code', 'like', "%{$request->search}%")
                  ->orWhere('email', 'like', "%{$request->search}%")
                  ->orWhere('gstin', 'like', "%{$request->search}%");
            });
        }

        $perPage = min((int) $request->get('per_page', 15), 100);
        $customers = $query->with('organization')->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $customers,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:50|unique:customers,code',
            'phone' => 'required|string|max:20',
            'email' => 'nullable|email|max:255',
            'gstin' => 'nullable|string|max:15',
            'credit_limit' => 'nullable|numeric|min:0',
            'credit_days' => 'nullable|integer|min:0',
            'status' => 'in:active,inactive,blacklisted',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        $customer = Customer::create(array_merge($request->all(), [
            'organization_id' => auth()->user()->organization_id,
        ]));

        return response()->json([
            'success' => true,
            'message' => 'Customer created successfully',
            'data' => $customer->load('organization'),
        ], 201);
    }

    public function show(Customer $customer): JsonResponse
    {
        $customer->load(['organization', 'projects']);

        return response()->json([
            'success' => true,
            'data' => $customer,
        ]);
    }

    public function update(Request $request, Customer $customer): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|max:255',
            'code' => 'sometimes|required|string|max:50|unique:customers,code,' . $customer->id,
            'phone' => 'sometimes|required|string|max:20',
            'email' => 'nullable|email|max:255',
            'credit_limit' => 'nullable|numeric|min:0',
            'outstanding_balance' => 'nullable|numeric',
            'status' => 'in:active,inactive,blacklisted',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        $customer->update($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Customer updated successfully',
            'data' => $customer->load('organization'),
        ]);
    }

    public function destroy(Customer $customer): JsonResponse
    {
        $customer->delete();

        return response()->json([
            'success' => true,
            'message' => 'Customer deleted successfully',
        ]);
    }

    public function ledger(Customer $customer): JsonResponse
    {
        $customer->load(['organization', 'projects']);

        return response()->json([
            'success' => true,
            'data' => [
                'customer' => $customer,
                'credit_limit' => $customer->credit_limit,
                'outstanding_balance' => $customer->outstanding_balance,
                'available_credit' => $customer->available_credit,
            ],
        ]);
    }
}

@extends('prints.layout')

@section('content')
<div class="page">
    <!-- Header -->
    <div class="header">
        <div class="header-left">
            <div class="company-name">{{ $company->name ?? 'ERP DryMix Products' }}</div>
            <div class="company-details">
                @if($company->address){{ $company->address }}@endif
                @if($company->phone) | Tel: {{ $company->phone }}@endif
                | Unit: {{ $order->manufacturingUnit->name }}
            </div>
        </div>
        <div class="header-right">
            <div class="report-title">{{ $title }}</div>
            <div class="report-meta">
                PO #: {{ $order->order_number }}<br>
                PO Date: {{ $order->order_date->format('d-m-Y') }}<br>
                Status: <span class="status {{ $order->status }}">{{ $order->status }}</span>
            </div>
        </div>
    </div>

    <!-- Content -->
    <div class="content">
        <!-- Supplier Information -->
        <div class="section">
            <div class="section-title">SUPPLIER DETAILS</div>
            <div class="two-columns">
                <div class="column">
                    <strong>Supplier Name:</strong> {{ $order->supplier->name }}<br>
                    <strong>Supplier Code:</strong> {{ $order->supplier->supplier_code ?? '-' }}<br>
                    <strong>Contact Person:</strong> {{ $order->supplier->contact_person ?? '-' }}
                </div>
                <div class="column">
                    <strong>Address:</strong> {{ $order->supplier->address ?? '-' }}<br>
                    <strong>Phone:</strong> {{ $order->supplier->phone ?? '-' }}<br>
                    <strong>Email:</strong> {{ $order->supplier->email ?? '-' }}
                </div>
            </div>
        </div>

        <!-- Order Information -->
        <div class="section">
            <div class="section-title">ORDER INFORMATION</div>
            <div class="info-grid">
                <div class="info-item">
                    <span class="info-label">PO Number:</span>
                    <span class="info-value">{{ $order->order_number }}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">PO Date:</span>
                    <span class="info-value">{{ $order->order_date->format('d-m-Y') }}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Expected Delivery:</span>
                    <span class="info-value">{{ $order->expected_delivery_date?->format('d-m-Y') ?? 'TBD' }}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Payment Terms:</span>
                    <span class="info-value">{{ $order->payment_terms ?? '-' }}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Manufacturing Unit:</span>
                    <span class="info-value">{{ $order->manufacturingUnit->name }}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Currency:</span>
                    <span class="info-value">{{ $order->currency ?? 'USD' }}</span>
                </div>
            </div>
        </div>

        <!-- Order Items -->
        <div class="section">
            <div class="section-title">ORDER ITEMS</div>
            <table class="table">
                <thead>
                    <tr>
                        <th width="10%">Sr. No.</th>
                        <th width="30%">Material Name</th>
                        <th width="15%" class="text-center">Qty</th>
                        <th width="10%" class="text-center">Unit</th>
                        <th width="15%" class="text-right">Rate</th>
                        <th width="20%" class="text-right">Amount</th>
                    </tr>
                </thead>
                <tbody>
                    @forelse($order->items as $index => $item)
                        <tr>
                            <td>{{ $index + 1 }}</td>
                            <td>
                                <strong>{{ $item->rawMaterial->name }}</strong>
                                @if($item->rawMaterial->code)
                                <br><span class="text-sm">Code: {{ $item->rawMaterial->code }}</span>
                                @endif
                                @if($item->specifications)
                                <br><span class="text-sm">{{ $item->specifications }}</span>
                                @endif
                            </td>
                            <td class="text-center">{{ number_format($item->quantity, 3) }}</td>
                            <td class="text-center">{{ $item->unit }}</td>
                            <td class="amount text-right">{{ number_format($item->unit_price, 2) }}</td>
                            <td class="amount text-right">{{ number_format($item->total_amount, 2) }}</td>
                        </tr>
                    @empty
                        <tr>
                            <td colspan="6" class="text-center">No items found</td>
                        </tr>
                    @endforelse
                </tbody>
                <tfoot>
                    <tr class="total-row">
                        <td colspan="5" class="text-right"><strong>Subtotal:</strong></td>
                        <td class="amount text-right"><strong>{{ number_format($order->total_amount, 2) }}</strong></td>
                    </tr>
                    <tr class="total-row">
                        <td colspan="5" class="text-right"><strong>Tax ({{ $order->tax_percentage ?? 0 }}%):</strong></td>
                        <td class="amount text-right"><strong>{{ number_format($order->tax_amount ?? 0, 2) }}</strong></td>
                    </tr>
                    <tr class="total-row">
                        <td colspan="5" class="text-right"><strong>Grand Total:</strong></td>
                        <td class="amount text-right"><strong>{{ number_format($order->grand_total ?? $order->total_amount, 2) }}</strong></td>
                    </tr>
                </tfoot>
            </table>
        </div>

        <!-- Delivery Details -->
        @if($order->delivery_address || $order->shipping_method)
        <div class="section">
            <div class="section-title">DELIVERY DETAILS</div>
            <table class="table table-no-border">
                <tr>
                    <td width="20%"><strong>Delivery Address:</strong></td>
                    <td>{{ $order->delivery_address ?? 'Same as supplier' }}</td>
                </tr>
                <tr>
                    <td><strong>Shipping Method:</strong></td>
                    <td>{{ $order->shipping_method ?? '-' }}</td>
                </tr>
                <tr>
                    <td><strong>Delivery Terms:</strong></td>
                    <td>{{ $order->delivery_terms ?? '-' }}</td>
                </tr>
            </table>
        </div>
        @endif

        <!-- Remarks -->
        @if($order->remarks)
        <div class="section">
            <div class="section-title">REMARKS</div>
            <p>{{ $order->remarks }}</p>
        </div>
        @endif

        <!-- Signature Section -->
        <div class="signature-section">
            <div class="signature">
                <div class="signature-label">Prepared By</div>
                <div class="signature-line"></div>
            </div>
            <div class="signature">
                <div class="signature-label">Reviewed By</div>
                <div class="signature-line"></div>
            </div>
            <div class="signature">
                <div class="signature-label">Authorized By</div>
                <div class="signature-line"></div>
            </div>
            <div class="signature">
                <div class="signature-label">Supplier Acknowledgement</div>
                <div class="signature-line"></div>
                <div class="signature-label">Signature & Date</div>
            </div>
        </div>
    </div>

    <!-- Footer -->
    <div class="footer">
        <div class="footer-left">
            Generated on: {{ now()->format('d-m-Y H:i:s') }} | ERP DryMix Products
        </div>
        <div class="footer-right">
            Page 1 of 1
        </div>
    </div>
</div>
@endsection

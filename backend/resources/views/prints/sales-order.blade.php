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
                @if($company->email) | Email: {{ $company->email }}@endif
            </div>
        </div>
        <div class="header-right">
            <div class="report-title">{{ $title }}</div>
            <div class="report-meta">
                Sales Order #: {{ $order->order_number }}<br>
                Date: {{ $order->order_date->format('d-m-Y') }}<br>
                Status: <span class="status {{ $order->status }}">{{ $order->status }}</span>
            </div>
        </div>
    </div>

    <!-- Content -->
    <div class="content">
        <!-- Customer Information -->
        <div class="section">
            <div class="section-title">CUSTOMER DETAILS</div>
            <div class="two-columns">
                <div class="column">
                    <strong>Customer Name:</strong> {{ $order->customer->name }}<br>
                    <strong>Customer Code:</strong> {{ $order->customer->customer_code }}<br>
                    <strong>Contact Person:</strong> {{ $order->customer->contact_person ?? '-' }}
                </div>
                <div class="column">
                    <strong>Billing Address:</strong> {{ $order->customer->address ?? '-' }}<br>
                    <strong>Phone:</strong> {{ $order->customer->phone ?? '-' }}<br>
                    <strong>Email:</strong> {{ $order->customer->email ?? '-' }}
                </div>
            </div>
        </div>

        <!-- Order Information -->
        <div class="section">
            <div class="section-title">ORDER INFORMATION</div>
            <div class="info-grid">
                <div class="info-item">
                    <span class="info-label">Order Number:</span>
                    <span class="info-value">{{ $order->order_number }}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Order Date:</span>
                    <span class="info-value">{{ $order->order_date->format('d-m-Y') }}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Expected Delivery:</span>
                    <span class="info-value">{{ $order->expected_delivery_date?->format('d-m-Y') ?? 'TBD' }}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Payment Terms:</span>
                    <span class="info-value">{{ $order->customer->payment_terms ?? '-' }}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Project:</span>
                    <span class="info-value">{{ $order->project?->name ?? '-' }}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Manufacturing Unit:</span>
                    <span class="info-value">{{ $order->manufacturingUnit->name }}</span>
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
                        <th width="30%">Product Name</th>
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
                                <strong>{{ $item->product->name }}</strong>
                                @if($item->product->code)
                                <br><span class="text-sm">Code: {{ $item->product->code }}</span>
                                @endif
                                @if($item->description)
                                <br><span class="text-sm">{{ $item->description }}</span>
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

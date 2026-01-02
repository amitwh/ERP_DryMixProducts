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
            </div>
        </div>
        <div class="header-right">
            <div class="report-title">{{ $title }}</div>
            <div class="report-meta">
                Customer: {{ $customer->name }}<br>
                Customer Code: {{ $customer->customer_code }}<br>
                As of: {{ now()->format('d-m-Y') }}
            </div>
        </div>
    </div>

    <!-- Content -->
    <div class="content">
        <!-- Customer Information -->
        <div class="section">
            <div class="section-title">CUSTOMER INFORMATION</div>
            <div class="two-columns">
                <div class="column">
                    <strong>Customer Name:</strong> {{ $customer->name }}<br>
                    <strong>Customer Code:</strong> {{ $customer->customer_code }}<br>
                    <strong>Payment Terms:</strong> {{ $customer->payment_terms ?? '-' }}<br>
                    <strong>Credit Limit:</strong> {{ number_format($customer->credit_limit ?? 0, 2) }}
                </div>
                <div class="column">
                    <strong>Billing Address:</strong> {{ $customer->address ?? '-' }}<br>
                    <strong>Phone:</strong> {{ $customer->phone ?? '-' }}<br>
                    <strong>Email:</strong> {{ $customer->email ?? '-' }}<br>
                    <strong>Contact Person:</strong> {{ $customer->contact_person ?? '-' }}
                </div>
            </div>
        </div>

        <!-- Sales Orders -->
        @if($customer->salesOrders && $customer->salesOrders->count() > 0)
        <div class="section">
            <div class="section-title">SALES ORDERS</div>
            <table class="table">
                <thead>
                    <tr>
                        <th width="15%">Order #</th>
                        <th width="20%" class="text-center">Order Date</th>
                        <th width="30%">Product</th>
                        <th width="15%" class="text-right">Order Amount</th>
                        <th width="20%" class="text-center">Status</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($customer->salesOrders->take(10) as $order)
                        <tr>
                            <td>{{ $order->order_number }}</td>
                            <td class="text-center">{{ $order->order_date->format('d-m-Y') }}</td>
                            <td>{{ $order->items->first()?->product?->name ?? '-' }}</td>
                            <td class="amount text-right">{{ number_format($order->total_amount, 2) }}</td>
                            <td class="text-center">
                                <span class="status {{ $order->status }}">{{ strtoupper($order->status) }}</span>
                            </td>
                        </tr>
                    @endforeach
                </tbody>
            </table>
        </div>
        @endif

        <!-- Invoices -->
        @if($customer->invoices && $customer->invoices->count() > 0)
        <div class="section">
            <div class="section-title">INVOICES</div>
            <table class="table">
                <thead>
                    <tr>
                        <th width="15%">Invoice #</th>
                        <th width="20%" class="text-center">Invoice Date</th>
                        <th width="15%" class="text-center">Due Date</th>
                        <th width="15%" class="text-right">Amount</th>
                        <th width="15%" class="text-right">Paid</th>
                        <th width="20%" class="text-right">Balance</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($customer->invoices->take(10) as $invoice)
                        <tr>
                            <td>{{ $invoice->invoice_number }}</td>
                            <td class="text-center">{{ $invoice->invoice_date->format('d-m-Y') }}</td>
                            <td class="text-center">{{ $invoice->due_date?->format('d-m-Y') ?? '-' }}</td>
                            <td class="amount text-right">{{ number_format($invoice->total_amount, 2) }}</td>
                            <td class="amount text-right">{{ number_format($invoice->paid_amount ?? 0, 2) }}</td>
                            <td class="amount text-right text-bold">{{ number_format($invoice->balance_amount, 2) }}</td>
                        </tr>
                    @endforeach
                </tbody>
                <tfoot>
                    <tr class="total-row">
                        <td colspan="3" class="text-right"><strong>Total Outstanding:</strong></td>
                        <td colspan="3" class="amount text-right"><strong>{{ number_format($customer->outstanding_balance ?? 0, 2) }}</strong></td>
                    </tr>
                </tfoot>
            </table>
        </div>
        @endif

        <!-- Credit Control -->
        @if($customer->creditControl)
        <div class="section">
            <div class="section-title">CREDIT CONTROL</div>
            <div class="info-grid">
                <div class="info-item">
                    <span class="info-label">Credit Limit:</span>
                    <span class="info-value text-bold">{{ number_format($customer->credit_limit ?? 0, 2) }}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Current Balance:</span>
                    <span class="info-value text-bold">{{ number_format($customer->outstanding_balance ?? 0, 2) }}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Available Credit:</span>
                    <span class="info-value text-bold">
                        @php
                            $availableCredit = ($customer->credit_limit ?? 0) - ($customer->outstanding_balance ?? 0);
                        @endphp
                        {{ number_format($availableCredit, 2) }}
                    </span>
                </div>
                <div class="info-item">
                    <span class="info-label">Aging Days:</span>
                    <span class="info-value text-bold">{{ $customer->creditControl->aging_days ?? 0 }} Days</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Credit Status:</span>
                    <span class="info-value">
                        @if($availableCredit > 0)
                            <span class="status approved">GOOD</span>
                        @elseif($availableCredit <= 0 && $customer->outstanding_balance > 0)
                            <span class="status rejected">EXCEEDED</span>
                        @else
                            <span class="status completed">CLEAR</span>
                        @endif
                    </span>
                </div>
                <div class="info-item">
                    <span class="info-label">Last Payment Date:</span>
                    <span class="info-value">{{ $customer->last_payment_date?->format('d-m-Y') ?? '-' }}</span>
                </div>
            </div>
        </div>
        @endif

        <!-- Summary -->
        <div class="section">
            <div class="section-title">SUMMARY</div>
            <div style="padding: 5mm; border: 2px solid {{ $theme['primary_color'] ?? '#2563EB' }}; border-radius: 5px; background: #EEF2FF;">
                <div class="info-grid">
                    <div class="info-item">
                        <span class="info-label">Total Orders:</span>
                        <span class="info-value text-bold">{{ $customer->salesOrders?->count() ?? 0 }}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Total Invoices:</span>
                        <span class="info-value text-bold">{{ $customer->invoices?->count() ?? 0 }}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Total Business:</span>
                        <span class="info-value text-bold">{{ number_format($customer->total_business_value ?? 0, 2) }}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Outstanding Balance:</span>
                        <span class="info-value text-bold" style="color: {{ $customer->outstanding_balance > 0 ? '#DC2626' : '#059669' }};">
                            {{ number_format($customer->outstanding_balance ?? 0, 2) }}
                        </span>
                    </div>
                </div>
            </div>
        </div>

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
            Page 1 of 1 | Credit Control
        </div>
    </div>
</div>
@endsection

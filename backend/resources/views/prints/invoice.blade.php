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
                @if($company->tax_id) | GST: {{ $company->tax_id }}@endif
            </div>
        </div>
        <div class="header-right">
            <div class="report-title">{{ $title }}</div>
            <div class="report-meta">
                Invoice #: {{ $invoice->invoice_number }}<br>
                Invoice Date: {{ $invoice->invoice_date->format('d-m-Y') }}<br>
                Due Date: {{ $invoice->due_date?->format('d-m-Y') ?? 'TBD' }}<br>
                Status: <span class="status {{ $invoice->status }}">{{ $invoice->status }}</span>
            </div>
        </div>
    </div>

    <!-- Content -->
    <div class="content">
        <!-- Invoice To -->
        <div class="section">
            <div class="section-title">INVOICE TO</div>
            <div class="two-columns">
                <div class="column">
                    <strong>{{ $invoice->customer->name }}</strong><br>
                    Customer Code: {{ $invoice->customer->customer_code }}<br>
                    GSTIN: {{ $invoice->customer->tax_id ?? '-' }}<br>
                    Contact: {{ $invoice->customer->contact_person ?? '-' }}
                </div>
                <div class="column">
                    <strong>Bill To:</strong> {{ $invoice->customer->address ?? '-' }}<br>
                    <strong>Ship To:</strong> {{ $invoice->customer->address ?? '-' }}<br>
                    Phone: {{ $invoice->customer->phone ?? '-' }}<br>
                    Email: {{ $invoice->customer->email ?? '-' }}
                </div>
            </div>
        </div>

        <!-- Order Details -->
        <div class="section">
            <div class="section-title">INVOICE DETAILS</div>
            <div class="info-grid">
                <div class="info-item">
                    <span class="info-label">Invoice Number:</span>
                    <span class="info-value">{{ $invoice->invoice_number }}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Invoice Date:</span>
                    <span class="info-value">{{ $invoice->invoice_date->format('d-m-Y') }}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">PO Number:</span>
                    <span class="info-value">{{ $invoice->po_number ?? '-' }}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Sales Order:</span>
                    <span class="info-value">{{ $invoice->order?->order_number ?? '-' }}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Due Date:</span>
                    <span class="info-value">{{ $invoice->due_date?->format('d-m-Y') ?? '-' }}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Payment Terms:</span>
                    <span class="info-value">{{ $invoice->payment_terms ?? '-' }}</span>
                </div>
            </div>
        </div>

        <!-- Invoice Items -->
        <div class="section">
            <div class="section-title">INVOICE ITEMS</div>
            <table class="table">
                <thead>
                    <tr>
                        <th width="8%">Sr. No.</th>
                        <th width="32%">Product Name</th>
                        <th width="15%" class="text-center">Qty</th>
                        <th width="10%" class="text-center">Unit</th>
                        <th width="10%" class="text-center">Tax %</th>
                        <th width="15%" class="text-right">Rate</th>
                        <th width="10%" class="text-right">Amount</th>
                    </tr>
                </thead>
                <tbody>
                    @forelse($invoice->items as $index => $item)
                        <tr>
                            <td>{{ $index + 1 }}</td>
                            <td>
                                <strong>{{ $item->product->name }}</strong>
                                @if($item->product->code)
                                <br><span class="text-sm">Code: {{ $item->product->code }}</span>
                                @endif
                            </td>
                            <td class="text-center">{{ number_format($item->quantity, 3) }}</td>
                            <td class="text-center">{{ $item->unit }}</td>
                            <td class="text-center">{{ $item->tax_percentage ?? 0 }}%</td>
                            <td class="amount text-right">{{ number_format($item->unit_price, 2) }}</td>
                            <td class="amount text-right">{{ number_format($item->total_amount, 2) }}</td>
                        </tr>
                    @empty
                        <tr>
                            <td colspan="7" class="text-center">No items found</td>
                        </tr>
                    @endforelse
                </tbody>
                <tfoot>
                    <tr class="total-row">
                        <td colspan="6" class="text-right"><strong>Subtotal:</strong></td>
                        <td class="amount text-right"><strong>{{ number_format($invoice->subtotal ?? $invoice->total_amount, 2) }}</strong></td>
                    </tr>
                    <tr class="total-row">
                        <td colspan="6" class="text-right"><strong>Tax ({{ $invoice->tax_percentage ?? 0 }}%):</strong></td>
                        <td class="amount text-right"><strong>{{ number_format($invoice->tax_amount ?? 0, 2) }}</strong></td>
                    </tr>
                    @if($invoice->discount_amount > 0)
                    <tr class="total-row">
                        <td colspan="6" class="text-right"><strong>Discount:</strong></td>
                        <td class="amount text-right"><strong>({{ number_format($invoice->discount_amount, 2) }})</strong></td>
                    </tr>
                    @endif
                    <tr class="total-row">
                        <td colspan="6" class="text-right"><strong>Grand Total:</strong></td>
                        <td class="amount text-right"><strong>{{ number_format($invoice->total_amount, 2) }}</strong></td>
                    </tr>
                </tfoot>
            </table>
        </div>

        <!-- Payment Details -->
        <div class="section">
            <div class="section-title">PAYMENT DETAILS</div>
            <div class="info-grid">
                <div class="info-item">
                    <span class="info-label">Bank Name:</span>
                    <span class="info-value">{{ $company->bank_name ?? '-' }}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Account Number:</span>
                    <span class="info-value">{{ $company->bank_account_number ?? '-' }}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">IFSC Code:</span>
                    <span class="info-value">{{ $company->bank_ifsc_code ?? '-' }}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Account Type:</span>
                    <span class="info-value">Current Account</span>
                </div>
            </div>
        </div>

        <!-- Terms -->
        <div class="section">
            <div class="section-title">TERMS & CONDITIONS</div>
            <ol style="margin-left: 20px; font-size: 11px; color: #374151;">
                <li>Payment due within {{ $invoice->payment_terms ?? 30 }} days from invoice date.</li>
                <li>Interest @ 24% per annum will be charged on overdue payments.</li>
                <li>Goods once sold will not be taken back.</li>
                <li>Subject to local jurisdiction only.</li>
                <li>GST as applicable.</li>
            </ol>
        </div>

        <!-- Signature Section -->
        <div class="signature-section">
            <div class="signature">
                <div class="signature-label">For {{ $company->name ?? 'ERP DryMix Products' }}</div>
                <div class="signature-line"></div>
                <div class="signature-label">Authorized Signatory</div>
            </div>
            <div class="signature">
                <div class="signature-label">Customer Acceptance</div>
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

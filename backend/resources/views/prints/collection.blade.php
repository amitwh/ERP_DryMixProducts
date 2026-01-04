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
                Collection #: {{ $collection->collection_number }}<br>
                Collection Date: {{ $collection->collection_date->format('d-m-Y') }}<br>
                Status: <span class="status {{ $collection->status }}">{{ $collection->status }}</span>
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
                    <strong>Customer Name:</strong> {{ $collection->customer->name }}<br>
                    <strong>Customer Code:</strong> {{ $collection->customer->customer_code }}<br>
                    <strong>Contact Person:</strong> {{ $collection->customer->contact_person ?? '-' }}
                </div>
                <div class="column">
                    <strong>Address:</strong> {{ $collection->customer->address ?? '-' }}<br>
                    <strong>Phone:</strong> {{ $collection->customer->phone ?? '-' }}<br>
                    <strong>Email:</strong> {{ $collection->customer->email ?? '-' }}
                </div>
            </div>
        </div>

        <!-- Collection Details -->
        <div class="section">
            <div class="section-title">COLLECTION DETAILS</div>
            <div class="info-grid">
                <div class="info-item">
                    <span class="info-label">Collection Number:</span>
                    <span class="info-value">{{ $collection->collection_number }}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Collection Date:</span>
                    <span class="info-value">{{ $collection->collection_date->format('d-m-Y') }}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Collection Method:</span>
                    <span class="info-value text-bold">{{ ucfirst($collection->collection_method) }}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Reference Number:</span>
                    <span class="info-value">{{ $collection->reference_number ?? '-' }}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Bank Account:</span>
                    <span class="info-value">{{ $collection->bank_account ?? '-' }}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Collected By:</span>
                    <span class="info-value">{{ $collection->collectedBy->name ?? '-' }}</span>
                </div>
            </div>
        </div>

        <!-- Collection Breakdown -->
        <div class="section">
            <div class="section-title">COLLECTION BREAKDOWN</div>
            <table class="table">
                <thead>
                    <tr>
                        <th width="10%">Sr. No.</th>
                        <th width="30%">Invoice #</th>
                        <th width="15%" class="text-center">Invoice Date</th>
                        <th width="15%" class="text-center">Due Date</th>
                        <th width="15%" class="text-right">Amount</th>
                        <th width="15%" class="text-right">Collected</th>
                    </tr>
                </thead>
                <tbody>
                    @forelse($collection->breakdown ?? [] as $index => $item)
                        <tr>
                            <td>{{ $index + 1 }}</td>
                            <td>
                                <strong>{{ $item->invoice_number }}</strong>
                            </td>
                            <td class="text-center">{{ $item->invoice_date?->format('d-m-Y') ?? '-' }}</td>
                            <td class="text-center">{{ $item->due_date?->format('d-m-Y') ?? '-' }}</td>
                            <td class="amount text-right">{{ number_format($item->amount, 2) }}</td>
                            <td class="amount text-right text-bold">{{ number_format($item->collected, 2) }}</td>
                        </tr>
                    @empty
                        <tr>
                            <td colspan="6" class="text-center">No invoice breakdown found</td>
                        </tr>
                    @endforelse
                </tbody>
                <tfoot>
                    <tr class="total-row">
                        <td colspan="5" class="text-right"><strong>Total Amount:</strong></td>
                        <td class="amount text-right"><strong>{{ number_format($collection->total_amount, 2) }}</strong></td>
                    </tr>
                    <tr class="total-row">
                        <td colspan="5" class="text-right"><strong>Discount:</strong></td>
                        <td class="amount text-right"><strong>({{ number_format($collection->discount_amount ?? 0, 2) }})</strong></td>
                    </tr>
                    <tr class="total-row">
                        <td colspan="5" class="text-right"><strong>Net Collected:</strong></td>
                        <td class="amount text-right"><strong>{{ number_format($collection->net_amount ?? $collection->total_amount, 2) }}</strong></td>
                    </tr>
                </tfoot>
            </table>
        </div>

        <!-- Bank Details -->
        @if($collection->bank_account || $collection->transaction_id)
        <div class="section">
            <div class="section-title">BANK DETAILS</div>
            <table class="table table-no-border">
                <tr>
                    <td width="25%"><strong>Bank Account:</strong></td>
                    <td>{{ $collection->bank_account ?? '-' }}</td>
                </tr>
                <tr>
                    <td><strong>Transaction ID:</strong></td>
                    <td>{{ $collection->transaction_id ?? '-' }}</td>
                </tr>
                <tr>
                    <td><strong>Payment Date:</strong></td>
                    <td>{{ $collection->payment_date?->format('d-m-Y') ?? '-' }}</td>
                </tr>
                <tr>
                    <td><strong>Clearance Date:</strong></td>
                    <td>{{ $collection->clearance_date?->format('d-m-Y') ?? '-' }}</td>
                </tr>
            </table>
        </div>
        @endif

        <!-- Receipt Note -->
        <div class="section">
            <div class="section-title">RECEIPT NOTE</div>
            <div style="padding: 8mm; border: 2px solid {{ $theme['primary_color'] ?? '#2563EB' }}; border-radius: 5px; text-align: center; background: #EEF2FF;">
                <p style="font-size: 14px; margin: 0;">
                    We hereby acknowledge receipt of payment of <strong>
                        {{ number_format($collection->net_amount ?? $collection->total_amount, 2) }}
                    </strong> from <strong>{{ $collection->customer->name }}</strong>.
                </p>
                <p style="font-size: 12px; margin-top: 3mm;">
                    Payment received via <strong>{{ ucfirst($collection->collection_method) }}</strong>
                    @if($collection->reference_number)
                    with Reference Number: <strong>{{ $collection->reference_number }}</strong>
                    @endif
                </p>
            </div>
        </div>

        <!-- Remarks -->
        @if($collection->remarks)
        <div class="section">
            <div class="section-title">REMARKS</div>
            <p>{{ $collection->remarks }}</p>
        </div>
        @endif

        <!-- Signature Section -->
        <div class="signature-section">
            <div class="signature">
                <div class="signature-label">Collected By</div>
                <div class="signature-line"></div>
                <div class="signature-label">{{ $collection->collectedBy->name ?? '-' }}</div>
            </div>
            <div class="signature">
                <div class="signature-label">Verified By</div>
                <div class="signature-line"></div>
            </div>
            <div class="signature">
                <div class="signature-label">Customer Signature</div>
                <div class="signature-line"></div>
                <div class="signature-label">Date & Signature</div>
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

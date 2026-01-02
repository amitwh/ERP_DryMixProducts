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
                As of: {{ $as_of_date }}<br>
                Generated: {{ now()->format('d-m-Y H:i') }}
            </div>
        </div>
    </div>

    <!-- Content -->
    <div class="content">
        <!-- Summary -->
        <div class="section">
            <div class="section-title">SUMMARY</div>
            <div style="padding: 5mm; border: 2px solid {{ $theme['primary_color'] ?? '#2563EB' }}; border-radius: 5px; background: #EEF2FF;">
                <div class="info-grid">
                    <div class="info-item">
                        <span class="info-label">Total Customers:</span>
                        <span class="info-value text-bold">{{ $agingData->count() }}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Total Outstanding:</span>
                        <span class="info-value text-bold" style="color: #DC2626;">
                            {{ number_format($agingData->sum('outstanding'), 2) }}
                        </span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Over 90 Days:</span>
                        <span class="info-value text-bold" style="color: #DC2626;">
                            {{ number_format($agingData->where('bucket', '90+ Days')->sum('outstanding'), 2) }}
                        </span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Healthy (0-30 Days):</span>
                        <span class="info-value text-bold" style="color: #059669;">
                            {{ number_format($agingData->where('bucket', 'Current')->sum('outstanding'), 2) }}
                        </span>
                    </div>
                </div>
            </div>
        </div>

        <!-- Aging Details -->
        <div class="section">
            <div class="section-title">AGING DETAILS</div>
            <table class="table">
                <thead>
                    <tr>
                        <th width="20%">Customer</th>
                        <th width="15%" class="text-center">Customer Code</th>
                        <th width="12%" class="text-center">Current</th>
                        <th width="12%" class="text-center">31-60 Days</th>
                        <th width="12%" class="text-center">61-90 Days</th>
                        <th width="12%" class="text-center">90+ Days</th>
                        <th width="17%" class="text-right">Total Outstanding</th>
                    </tr>
                </thead>
                <tbody>
                    @forelse($agingData as $item)
                        <tr>
                            <td><strong>{{ $item->customer->name }}</strong></td>
                            <td class="text-center">{{ $item->customer->customer_code }}</td>
                            <td class="text-center">
                                @php
                                    $current = $item->bucket === 'Current' ? $item->outstanding : 0;
                                @endphp
                                {{ number_format($current, 2) }}
                            </td>
                            <td class="text-center">
                                @php
                                    $bucket31_60 = $item->bucket === '31-60 Days' ? $item->outstanding : 0;
                                @endphp
                                {{ number_format($bucket31_60, 2) }}
                            </td>
                            <td class="text-center">
                                @php
                                    $bucket61_90 = $item->bucket === '61-90 Days' ? $item->outstanding : 0;
                                @endphp
                                {{ number_format($bucket61_90, 2) }}
                            </td>
                            <td class="text-center" style="color: #DC2626; font-weight: bold;">
                                @php
                                    $bucket90Plus = $item->bucket === '90+ Days' ? $item->outstanding : 0;
                                @endphp
                                {{ number_format($bucket90Plus, 2) }}
                            </td>
                            <td class="amount text-right text-bold" style="color: #DC2626;">
                                {{ number_format($item->outstanding, 2) }}
                            </td>
                        </tr>
                    @empty
                        <tr>
                            <td colspan="7" class="text-center">No aging data found</td>
                        </tr>
                    @endforelse
                </tbody>
                <tfoot>
                    <tr class="total-row">
                        <td colspan="6" class="text-right"><strong>Current:</strong></td>
                        <td class="amount text-right"><strong>{{ number_format($agingData->where('bucket', 'Current')->sum('outstanding'), 2) }}</strong></td>
                    </tr>
                    <tr class="total-row">
                        <td colspan="6" class="text-right"><strong>31-60 Days:</strong></td>
                        <td class="amount text-right"><strong>{{ number_format($agingData->where('bucket', '31-60 Days')->sum('outstanding'), 2) }}</strong></td>
                    </tr>
                    <tr class="total-row">
                        <td colspan="6" class="text-right"><strong>61-90 Days:</strong></td>
                        <td class="amount text-right"><strong style="color: #D97706;">{{ number_format($agingData->where('bucket', '61-90 Days')->sum('outstanding'), 2) }}</strong></td>
                    </tr>
                    <tr class="total-row">
                        <td colspan="6" class="text-right"><strong>90+ Days:</strong></td>
                        <td class="amount text-right"><strong style="color: #DC2626;">{{ number_format($agingData->where('bucket', '90+ Days')->sum('outstanding'), 2) }}</strong></td>
                    </tr>
                    <tr class="total-row">
                        <td colspan="6" class="text-right"><strong>Grand Total:</strong></td>
                        <td class="amount text-right"><strong>{{ number_format($agingData->sum('outstanding'), 2) }}</strong></td>
                    </tr>
                </tfoot>
            </table>
        </div>

        <!-- Critical Accounts -->
        @if($agingData->where('bucket', '90+ Days')->count() > 0)
        <div class="section">
            <div class="section-title" style="background: #FEE2E2; color: #991B1B;">CRITICAL ACCOUNTS (90+ Days)</div>
            <table class="table">
                <thead>
                    <tr>
                        <th width="10%">Sr. No.</th>
                        <th width="30%">Customer</th>
                        <th width="15%">Contact</th>
                        <th width="15%">Phone</th>
                        <th width="15%" class="text-center">Aging Days</th>
                        <th width="15%" class="text-right">Outstanding</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($agingData->where('bucket', '90+ Days') as $index => $item)
                        <tr>
                            <td>{{ $index + 1 }}</td>
                            <td><strong>{{ $item->customer->name }}</strong></td>
                            <td>{{ $item->customer->contact_person ?? '-' }}</td>
                            <td>{{ $item->customer->phone ?? '-' }}</td>
                            <td class="text-center text-bold" style="color: #DC2626;">
                                {{ $item->aging_days }} Days
                            </td>
                            <td class="amount text-right text-bold" style="color: #DC2626;">
                                {{ number_format($item->outstanding, 2) }}
                            </td>
                        </tr>
                    @endforeach
                </tbody>
            </table>
        </div>
        @endif

        <!-- Recommendations -->
        <div class="section">
            <div class="section-title">RECOMMENDATIONS</div>
            <div style="padding: 5mm; border: 1px solid #E5E7EB; border-radius: 3px; background: #F9FAFB;">
                <ol style="margin: 0; padding-left: 25px;">
                    <li><strong>Immediate Action:</strong> Contact all customers with >90 days outstanding</li>
                    <li><strong>Credit Hold:</strong> Consider putting credit hold on accounts >60 days</li>
                    <li><strong>Payment Plans:</strong> Establish payment plans for large overdue amounts</li>
                    <li><strong>Review Terms:</strong> Re-evaluate payment terms for high-risk customers</li>
                    <li><strong>Escalation:</strong> Escalate critical accounts to management</li>
                </ol>
            </div>
        </div>

        <!-- Signature Section -->
        <div class="signature-section">
            <div class="signature">
                <div class="signature-label">Prepared By</div>
                <div class="signature-line"></div>
            </div>
            <div class="signature">
                <div class="signature-label">Credit Manager</div>
                <div class="signature-line"></div>
            </div>
            <div class="signature">
                <div class="signature-label">Finance Director</div>
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

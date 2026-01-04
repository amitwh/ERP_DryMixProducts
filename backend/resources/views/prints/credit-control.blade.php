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
                Customer: {{ $creditControl->customer->name }}<br>
                Credit Limit: {{ number_format($creditControl->credit_limit, 2) }}<br>
                As of: {{ now()->format('d-m-Y') }}
            </div>
        </div>
    </div>

    <!-- Content -->
    <div class="content">
        <!-- Customer Information -->
        <div class="section">
            <div class="section-title">CUSTOMER INFORMATION</div>
            <div class="info-grid">
                <div class="info-item">
                    <span class="info-label">Customer Name:</span>
                    <span class="info-value text-bold">{{ $creditControl->customer->name }}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Customer Code:</span>
                    <span class="info-value">{{ $creditControl->customer->customer_code }}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Credit Limit:</span>
                    <span class="info-value text-bold">{{ number_format($creditControl->credit_limit, 2) }}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Payment Terms:</span>
                    <span class="info-value">{{ $creditControl->payment_terms ?? '30 Days' }}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Current Balance:</span>
                    <span class="info-value text-bold">{{ number_format($creditControl->current_balance ?? 0, 2) }}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Available Credit:</span>
                    <span class="info-value text-bold">
                        @php
                            $availableCredit = $creditControl->credit_limit - ($creditControl->current_balance ?? 0);
                        @endphp
                        {{ number_format($availableCredit, 2) }}
                    </span>
                </div>
            </div>
        </div>

        <!-- Credit Status -->
        <div class="section">
            <div class="section-title">CREDIT STATUS</div>
            <table class="table table-no-border">
                <tr>
                    <td width="25%"><strong>Credit Status:</strong></td>
                    <td>
                        @if($creditControl->credit_status === 'approved')
                            <span class="status approved">APPROVED</span>
                        @elseif($creditControl->credit_status === 'review')
                            <span class="status in-progress">UNDER REVIEW</span>
                        @elseif($creditControl->credit_status === 'restricted')
                            <span class="status fail" style="background: #F97316; color: white;">RESTRICTED</span>
                        @elseif($creditControl->credit_status === 'suspended')
                            <span class="status cancelled">SUSPENDED</span>
                        @else
                            <span class="status pending">PENDING</span>
                        @endif
                    </td>
                </tr>
                <tr>
                    <td><strong>Credit Score:</strong></td>
                    <td>
                        @php
                            $score = $creditControl->credit_score ?? 0;
                            $scoreColor = $score >= 80 ? '#059669' : ($score >= 60 ? '#D97706' : '#DC2626');
                        @endphp
                        <span style="font-size: 18px; font-weight: bold; color: {{ $scoreColor }};">
                            {{ $score }}/100
                        </span>
                    </td>
                </tr>
                <tr>
                    <td><strong>Aging Days:</strong></td>
                    <td>{{ $creditControl->aging_days ?? 0 }} Days</td>
                </tr>
                <tr>
                    <td><strong>Last Payment Date:</strong></td>
                    <td>{{ $creditControl->last_payment_date?->format('d-m-Y') ?? '-' }}</td>
                </tr>
                <tr>
                    <td><strong>Last Collection Date:</strong></td>
                    <td>{{ $creditControl->last_collection_date?->format('d-m-Y') ?? '-' }}</td>
                </tr>
                <tr>
                    <td><strong>Overdue Amount:</strong></td>
                    <td style="color: #DC2626; font-weight: bold;">
                        {{ number_format($creditControl->overdue_amount ?? 0, 2) }}
                    </td>
                </tr>
            </table>
        </div>

        <!-- Transactions -->
        @if($creditControl->transactions && $creditControl->transactions->count() > 0)
        <div class="section">
            <div class="section-title">RECENT TRANSACTIONS</div>
            <table class="table">
                <thead>
                    <tr>
                        <th width="15%">Date</th>
                        <th width="25%">Type</th>
                        <th width="20%">Reference</th>
                        <th width="20%" class="text-right">Amount</th>
                        <th width="20%" class="text-right">Balance</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($creditControl->transactions->take(10) as $transaction)
                        <tr>
                            <td>{{ $transaction->transaction_date?->format('d-m-Y') ?? '-' }}</td>
                            <td>
                                @if($transaction->transaction_type === 'invoice')
                                    <span class="status" style="background: #DBEAFE; color: #1E40AF; padding: 2mm 5mm;">INVOICE</span>
                                @elseif($transaction->transaction_type === 'payment')
                                    <span class="status approved" style="padding: 2mm 5mm;">PAYMENT</span>
                                @elseif($transaction->transaction_type === 'credit_note')
                                    <span class="status" style="background: #D1FAE5; color: #065F46; padding: 2mm 5mm;">CREDIT NOTE</span>
                                @elseif($transaction->transaction_type === 'debit_note')
                                    <span class="status rejected" style="padding: 2mm 5mm;">DEBIT NOTE</span>
                                @else
                                    {{ strtoupper($transaction->transaction_type) }}
                                @endif
                            </td>
                            <td>{{ $transaction->reference_number ?? '-' }}</td>
                            <td class="amount text-right">
                                @if($transaction->transaction_type === 'invoice' || $transaction->transaction_type === 'debit_note')
                                    <span style="color: #DC2626;">-</span>
                                @else
                                    <span style="color: #059669;">+</span>
                                @endif
                                {{ number_format(abs($transaction->amount), 2) }}
                            </td>
                            <td class="amount text-right text-bold">{{ number_format($transaction->balance, 2) }}</td>
                        </tr>
                    @endforeach
                </tbody>
            </table>
        </div>
        @endif

        <!-- Aging Breakdown -->
        <div class="section">
            <div class="section-title">AGING BREAKDOWN</div>
            <div style="padding: 5mm; border: 1px solid #E5E7EB; border-radius: 3px; background: #F9FAFB;">
                <div class="info-grid">
                    <div class="info-item">
                        <span class="info-label">Current (0-30 Days):</span>
                        <span class="info-value text-bold">{{ number_format($creditControl->aging_current ?? 0, 2) }}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">31-60 Days:</span>
                        <span class="info-value text-bold">{{ number_format($creditControl->aging_31_60 ?? 0, 2) }}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">61-90 Days:</span>
                        <span class="info-value text-bold" style="color: #D97706;">{{ number_format($creditControl->aging_61_90 ?? 0, 2) }}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">90+ Days:</span>
                        <span class="info-value text-bold" style="color: #DC2626;">{{ number_format($creditControl->aging_90_plus ?? 0, 2) }}</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- Remarks -->
        @if($creditControl->remarks)
        <div class="section">
            <div class="section-title">REMARKS</div>
            <p>{{ $creditControl->remarks }}</p>
        </div>
        @endif

        <!-- Signature Section -->
        <div class="signature-section">
            <div class="signature">
                <div class="signature-label">Credit Manager</div>
                <div class="signature-line"></div>
            </div>
            <div class="signature">
                <div class="signature-label">Finance Manager</div>
                <div class="signature-line"></div>
            </div>
            <div class="signature">
                <div class="signature-label">Approved By</div>
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

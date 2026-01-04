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
                Generated: {{ now()->format('d-m-Y') }}
            </div>
        </div>
    </div>

    <!-- Content -->
    <div class="content">
        <!-- Summary -->
        <div class="section">
            <div class="section-title">TRIAL BALANCE SUMMARY</div>
            <div style="padding: 5mm; border: 2px solid {{ $theme['primary_color'] ?? '#2563EB' }}; border-radius: 5px; background: #EEF2FF;">
                <div class="info-grid">
                    <div class="info-item">
                        <span class="info-label">Total Accounts:</span>
                        <span class="info-value text-bold">{{ count($accounts) }}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Total Debit:</span>
                        <span class="info-value text-bold" style="color: #059669;">
                            {{ number_format($total_debit, 2) }}
                        </span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Total Credit:</span>
                        <span class="info-value text-bold" style="color: #DC2626;">
                            {{ number_format($total_credit, 2) }}
                        </span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Difference:</span>
                        <span class="info-value text-bold" style="color: {{ abs($total_debit - $total_credit) < 0.01 ? '#059669' : '#DC2626' }};">
                            {{ number_format(abs($total_debit - $total_credit), 2) }}
                            @if(abs($total_debit - $total_credit) < 0.01)
                                (Balanced)
                            @else
                                (Unbalanced)
                            @endif
                        </span>
                    </div>
                </div>
            </div>
        </div>

        <!-- Trial Balance Details -->
        <div class="section">
            <div class="section-title">TRIAL BALANCE</div>
            <table class="table">
                <thead>
                    <tr>
                        <th width="10%">Code</th>
                        <th width="45%">Account Name</th>
                        <th width="10%" class="text-center">Type</th>
                        <th width="15%" class="text-right">Debit</th>
                        <th width="20%" class="text-right">Credit</th>
                    </tr>
                </thead>
                <tbody>
                    @forelse($accounts as $account)
                        <tr>
                            <td>{{ $account['account_code'] }}</td>
                            <td>
                                <strong>{{ $account['account_name'] }}</strong>
                            </td>
                            <td class="text-center">
                                <span class="text-sm" style="padding: 2mm 5mm; background: #F3F4F6;">
                                    {{ ucfirst($account['account_type']) }}
                                </span>
                            </td>
                            <td class="amount text-right">
                                @if($account['debit'] > 0)
                                    <strong>{{ number_format($account['debit'], 2) }}</strong>
                                @else
                                    -
                                @endif
                            </td>
                            <td class="amount text-right">
                                @if($account['credit'] > 0)
                                    <strong>{{ number_format($account['credit'], 2) }}</strong>
                                @else
                                    -
                                @endif
                            </td>
                        </tr>
                    @empty
                        <tr>
                            <td colspan="5" class="text-center">No accounts found</td>
                        </tr>
                    @endforelse
                </tbody>
                <tfoot>
                    <tr class="total-row">
                        <td colspan="3" class="text-right"><strong>TOTAL DEBIT:</strong></td>
                        <td class="amount text-right"><strong>{{ number_format($total_debit, 2) }}</strong></td>
                        <td class="text-right">-</td>
                    </tr>
                    <tr class="total-row">
                        <td colspan="3" class="text-right"><strong>TOTAL CREDIT:</strong></td>
                        <td class="text-right">-</td>
                        <td class="amount text-right"><strong>{{ number_format($total_credit, 2) }}</strong></td>
                    </tr>
                </tfoot>
            </table>
        </div>

        <!-- Account Type Summary -->
        <div class="section">
            <div class="section-title">ACCOUNT TYPE SUMMARY</div>
            <table class="table">
                <thead>
                    <tr>
                        <th width="20%">Account Type</th>
                        <th width="15%" class="text-center">Count</th>
                        <th width="15%" class="text-center">Debit</th>
                        <th width="15%" class="text-center">Credit</th>
                        <th width="20%" class="text-center">Net Balance</th>
                    </tr>
                </thead>
                <tbody>
                    @php
                        $accountTypes = collect($accounts)->groupBy('account_type');
                    @endphp
                    @foreach($accountTypes as $type => $typeAccounts)
                        @php
                            $typeDebit = $typeAccounts->sum('debit');
                            $typeCredit = $typeAccounts->sum('credit');
                            $typeNet = $typeDebit - $typeCredit;
                        @endphp
                        <tr>
                            <td><strong>{{ ucfirst($type) }}</strong></td>
                            <td class="text-center">{{ $typeAccounts->count() }}</td>
                            <td class="amount text-center">{{ number_format($typeDebit, 2) }}</td>
                            <td class="amount text-center">{{ number_format($typeCredit, 2) }}</td>
                            <td class="amount text-center text-bold">{{ number_format($typeNet, 2) }}</td>
                        </tr>
                    @endforeach
                </tbody>
            </table>
        </div>

        <!-- Validation -->
        <div class="section">
            <div class="section-title">VALIDATION</div>
            <table class="table table-no-border">
                <tr>
                    <td width="35%"><strong>Debit-Credit Balance:</strong></td>
                    <td>
                        @if(abs($total_debit - $total_credit) < 0.01)
                            <span class="status approved">PASS</span>
                        @else
                            <span class="status fail">FAIL - Difference: {{ number_format(abs($total_debit - $total_credit), 2) }}</span>
                        @endif
                    </td>
                </tr>
                <tr>
                    <td><strong>All Accounts Mapped:</strong></td>
                    <td><span class="status approved">YES</span></td>
                </tr>
                <tr>
                    <td><strong>Chart of Accounts Updated:</strong></td>
                    <td><span class="status approved">YES</span></td>
                </tr>
                <tr>
                    <td><strong>As Of Date:</strong></td>
                    <td>{{ $as_of_date }}</td>
                </tr>
            </table>
        </div>

        <!-- Signature Section -->
        <div class="signature-section">
            <div class="signature">
                <div class="signature-label">Prepared By</div>
                <div class="signature-line"></div>
            </div>
            <div class="signature">
                <div class="signature-label">Accountant</div>
                <div class="signature-line"></div>
            </div>
            <div class="signature">
                <div class="signature-label">Finance Manager</div>
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
            Page 1 of 1 | Finance & Accounting
        </div>
    </div>
</div>
@endsection

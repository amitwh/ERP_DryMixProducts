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
        <!-- Assets -->
        <div class="section">
            <div class="section-title">ASSETS</div>
            <table class="table">
                <thead>
                    <tr>
                        <th width="15%">Code</th>
                        <th width="55%">Account Name</th>
                        <th width="30%" class="text-right">Amount</th>
                    </tr>
                </thead>
                <tbody>
                    @forelse($assets as $account)
                        <tr>
                            <td>{{ $account->account_code }}</td>
                            <td>
                                <strong>{{ $account->account_name }}</strong>
                                @if($account->notes)
                                <br><span class="text-sm">{{ $account->notes }}</span>
                                @endif
                            </td>
                            <td class="amount text-right text-bold">{{ number_format($account->balance ?? 0, 2) }}</td>
                        </tr>
                    @empty
                        <tr>
                            <td colspan="3" class="text-center">No assets found</td>
                        </tr>
                    @endforelse
                </tbody>
                <tfoot>
                    <tr class="total-row">
                        <td colspan="2" class="text-right"><strong>TOTAL ASSETS:</strong></td>
                        <td class="amount text-right"><strong>{{ number_format($assets->sum('balance') ?? 0, 2) }}</strong></td>
                    </tr>
                </tfoot>
            </table>
        </div>

        <!-- Liabilities -->
        <div class="section">
            <div class="section-title">LIABILITIES</div>
            <table class="table">
                <thead>
                    <tr>
                        <th width="15%">Code</th>
                        <th width="55%">Account Name</th>
                        <th width="30%" class="text-right">Amount</th>
                    </tr>
                </thead>
                <tbody>
                    @forelse($liabilities as $account)
                        <tr>
                            <td>{{ $account->account_code }}</td>
                            <td>
                                <strong>{{ $account->account_name }}</strong>
                                @if($account->notes)
                                <br><span class="text-sm">{{ $account->notes }}</span>
                                @endif
                            </td>
                            <td class="amount text-right text-bold">{{ number_format($account->balance ?? 0, 2) }}</td>
                        </tr>
                    @empty
                        <tr>
                            <td colspan="3" class="text-center">No liabilities found</td>
                        </tr>
                    @endforelse
                </tbody>
                <tfoot>
                    <tr class="total-row">
                        <td colspan="2" class="text-right"><strong>TOTAL LIABILITIES:</strong></td>
                        <td class="amount text-right"><strong>{{ number_format($liabilities->sum('balance') ?? 0, 2) }}</strong></td>
                    </tr>
                </tfoot>
            </table>
        </div>

        <!-- Equity -->
        <div class="section">
            <div class="section-title">EQUITY</div>
            <table class="table">
                <thead>
                    <tr>
                        <th width="15%">Code</th>
                        <th width="55%">Account Name</th>
                        <th width="30%" class="text-right">Amount</th>
                    </tr>
                </thead>
                <tbody>
                    @forelse($equity as $account)
                        <tr>
                            <td>{{ $account->account_code }}</td>
                            <td>
                                <strong>{{ $account->account_name }}</strong>
                                @if($account->notes)
                                <br><span class="text-sm">{{ $account->notes }}</span>
                                @endif
                            </td>
                            <td class="amount text-right text-bold">{{ number_format($account->balance ?? 0, 2) }}</td>
                        </tr>
                    @empty
                        <tr>
                            <td colspan="3" class="text-center">No equity accounts found</td>
                        </tr>
                    @endforelse
                </tbody>
                <tfoot>
                    <tr class="total-row">
                        <td colspan="2" class="text-right"><strong>TOTAL EQUITY:</strong></td>
                        <td class="amount text-right"><strong>{{ number_format($equity->sum('balance') ?? 0, 2) }}</strong></td>
                    </tr>
                </tfoot>
            </table>
        </div>

        <!-- Balance Sheet Summary -->
        <div class="section">
            <div class="section-title">BALANCE SHEET SUMMARY</div>
            <div style="padding: 5mm; border: 2px solid {{ $theme['primary_color'] ?? '#2563EB' }}; border-radius: 5px; background: #EEF2FF;">
                <div class="info-grid">
                    <div class="info-item">
                        <span class="info-label">Total Assets:</span>
                        <span class="info-value text-bold">{{ number_format($assets->sum('balance') ?? 0, 2) }}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Total Liabilities:</span>
                        <span class="info-value text-bold" style="color: #DC2626;">
                            {{ number_format($liabilities->sum('balance') ?? 0, 2) }}
                        </span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Total Equity:</span>
                        <span class="info-value text-bold">{{ number_format($equity->sum('balance') ?? 0, 2) }}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Liabilities + Equity:</span>
                        <span class="info-value text-bold">
                            {{ number_format(($liabilities->sum('balance') ?? 0) + ($equity->sum('balance') ?? 0), 2) }}
                        </span>
                    </div>
                </div>
            </div>
        </div>

        <!-- Validation -->
        <div class="section">
            <div class="section-title">VALIDATION</div>
            <table class="table table-no-border">
                <tr>
                    <td width="35%"><strong>Assets = Liabilities + Equity:</strong></td>
                    <td>
                        @php
                            $assetsTotal = $assets->sum('balance') ?? 0;
                            $leEquityTotal = ($liabilities->sum('balance') ?? 0) + ($equity->sum('balance') ?? 0);
                            $difference = abs($assetsTotal - $leEquityTotal);
                        @endphp
                        @if($difference < 0.01)
                            <span class="status approved">PASS</span>
                        @else
                            <span class="status fail">FAIL - Difference: {{ number_format($difference, 2) }}</span>
                        @endif
                    </td>
                </tr>
                <tr>
                    <td><strong>As Of Date:</strong></td>
                    <td>{{ $as_of_date }}</td>
                </tr>
                <tr>
                    <td><strong>Reporting Currency:</strong></td>
                    <td>{{ $company->currency ?? 'USD' }}</td>
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

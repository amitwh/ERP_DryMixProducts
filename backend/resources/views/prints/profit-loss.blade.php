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
                Period: {{ $period['start_date'] }} to {{ $period['end_date'] }}<br>
                Generated: {{ now()->format('d-m-Y') }}
            </div>
        </div>
    </div>

    <!-- Content -->
    <div class="content">
        <!-- Revenue -->
        <div class="section">
            <div class="section-title" style="background: #D1FAE5; color: #065F46;">REVENUE</div>
            <table class="table">
                <thead>
                    <tr>
                        <th width="15%">Code</th>
                        <th width="60%">Account Name</th>
                        <th width="25%" class="text-right">Amount</th>
                    </tr>
                </thead>
                <tbody>
                    @forelse($revenue as $account)
                        <tr>
                            <td>{{ $account->account_code }}</td>
                            <td>
                                <strong>{{ $account->account_name }}</strong>
                                @if($account->notes)
                                <br><span class="text-sm">{{ $account->notes }}</span>
                                @endif
                            </td>
                            <td class="amount text-right text-bold" style="color: #059669;">
                                {{ number_format($account->balance ?? 0, 2) }}
                            </td>
                        </tr>
                    @empty
                        <tr>
                            <td colspan="3" class="text-center">No revenue accounts found</td>
                        </tr>
                    @endforelse
                </tbody>
                <tfoot>
                    <tr class="total-row">
                        <td colspan="2" class="text-right"><strong>TOTAL REVENUE:</strong></td>
                        <td class="amount text-right"><strong style="color: #059669;">{{ number_format($revenue->sum('balance') ?? 0, 2) }}</strong></td>
                    </tr>
                </tfoot>
            </table>
        </div>

        <!-- Direct Costs -->
        <div class="section">
            <div class="section-title" style="background: #FEE2E2; color: #991B1B;">COST OF GOODS SOLD</div>
            <table class="table">
                <thead>
                    <tr>
                        <th width="15%">Code</th>
                        <th width="60%">Account Name</th>
                        <th width="25%" class="text-right">Amount</th>
                    </tr>
                </thead>
                <tbody>
                    @forelse($expenses->where('category', 'cogs') as $account)
                        <tr>
                            <td>{{ $account->account_code }}</td>
                            <td>
                                <strong>{{ $account->account_name }}</strong>
                                @if($account->notes)
                                <br><span class="text-sm">{{ $account->notes }}</span>
                                @endif
                            </td>
                            <td class="amount text-right text-bold" style="color: #DC2626;">
                                ({{ number_format($account->balance ?? 0, 2) }})
                            </td>
                        </tr>
                    @empty
                        <tr>
                            <td colspan="3" class="text-center">No COGS accounts found</td>
                        </tr>
                    @endforelse
                </tbody>
                <tfoot>
                    <tr class="total-row">
                        <td colspan="2" class="text-right"><strong>TOTAL COGS:</strong></td>
                        <td class="amount text-right"><strong style="color: #DC2626;">({{ number_format($expenses->where('category', 'cogs')->sum('balance') ?? 0, 2) }})</strong></td>
                    </tr>
                </tfoot>
            </table>
        </div>

        <!-- Gross Profit -->
        <div class="section">
            <div class="section-title" style="background: #EEF2FF; color: #1E40AF;">GROSS PROFIT</div>
            <div style="padding: 5mm; border: 2px solid {{ $theme['primary_color'] ?? '#2563EB' }}; border-radius: 5px; background: #EEF2FF; text-align: center;">
                <p style="font-size: 16px; margin: 0;">
                    <strong>Total Revenue</strong> -
                    <strong>Total COGS</strong> =
                </p>
                <p style="font-size: 24px; font-weight: bold; margin: 3mm 0; color: #059669;">
                    @php
                        $totalRevenue = $revenue->sum('balance') ?? 0;
                        $totalCOGS = $expenses->where('category', 'cogs')->sum('balance') ?? 0;
                        $grossProfit = $totalRevenue - $totalCOGS;
                    @endphp
                    {{ number_format($grossProfit, 2) }}
                </p>
                <p style="font-size: 12px; margin: 0;">
                    Gross Profit Margin: {{ number_format(($totalRevenue > 0 ? ($grossProfit / $totalRevenue) * 100 : 0), 2) }}%
                </p>
            </div>
        </div>

        <!-- Operating Expenses -->
        <div class="section">
            <div class="section-title" style="background: #FEF3C7; color: #92400E;">OPERATING EXPENSES</div>
            <table class="table">
                <thead>
                    <tr>
                        <th width="15%">Code</th>
                        <th width="60%">Account Name</th>
                        <th width="25%" class="text-right">Amount</th>
                    </tr>
                </thead>
                <tbody>
                    @forelse($expenses->where('category', 'operating') as $account)
                        <tr>
                            <td>{{ $account->account_code }}</td>
                            <td>
                                <strong>{{ $account->account_name }}</strong>
                                @if($account->notes)
                                <br><span class="text-sm">{{ $account->notes }}</span>
                                @endif
                            </td>
                            <td class="amount text-right text-bold" style="color: #DC2626;">
                                ({{ number_format($account->balance ?? 0, 2) }})
                            </td>
                        </tr>
                    @empty
                        <tr>
                            <td colspan="3" class="text-center">No operating expenses found</td>
                        </tr>
                    @endforelse
                </tbody>
                <tfoot>
                    <tr class="total-row">
                        <td colspan="2" class="text-right"><strong>TOTAL OPERATING EXPENSES:</strong></td>
                        <td class="amount text-right"><strong style="color: #DC2626;">({{ number_format($expenses->where('category', 'operating')->sum('balance') ?? 0, 2) }})</strong></td>
                    </tr>
                </tfoot>
            </table>
        </div>

        <!-- Other Expenses -->
        @if($expenses->where('category', 'other')->count() > 0)
        <div class="section">
            <div class="section-title">OTHER EXPENSES</div>
            <table class="table">
                <thead>
                    <tr>
                        <th width="15%">Code</th>
                        <th width="60%">Account Name</th>
                        <th width="25%" class="text-right">Amount</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($expenses->where('category', 'other') as $account)
                        <tr>
                            <td>{{ $account->account_code }}</td>
                            <td>
                                <strong>{{ $account->account_name }}</strong>
                                @if($account->notes)
                                <br><span class="text-sm">{{ $account->notes }}</span>
                                @endif
                            </td>
                            <td class="amount text-right text-bold" style="color: #DC2626;">
                                ({{ number_format($account->balance ?? 0, 2) }})
                            </td>
                        </tr>
                    @endforeach
                </tbody>
                <tfoot>
                    <tr class="total-row">
                        <td colspan="2" class="text-right"><strong>TOTAL OTHER EXPENSES:</strong></td>
                        <td class="amount text-right"><strong style="color: #DC2626;">({{ number_format($expenses->where('category', 'other')->sum('balance') ?? 0, 2) }})</strong></td>
                    </tr>
                </tfoot>
            </table>
        </div>
        @endif

        <!-- Net Profit -->
        <div class="section">
            <div class="section-title" style="background: #EEF2FF; color: #1E40AF;">NET PROFIT / LOSS</div>
            <div style="padding: 5mm; border: 2px solid {{ $theme['primary_color'] ?? '#2563EB' }}; border-radius: 5px; background: #EEF2FF; text-align: center;">
                <p style="font-size: 16px; margin: 0;">
                    <strong>Gross Profit</strong> -
                    <strong>Operating Expenses</strong> -
                    <strong>Other Expenses</strong> =
                </p>
                <p style="font-size: 28px; font-weight: bold; margin: 3mm 0; color: {{ $grossProfit - ($expenses->sum('balance') ?? 0) >= 0 ? '#059669' : '#DC2626' }};">
                    @php
                        $totalOperating = $expenses->where('category', 'operating')->sum('balance') ?? 0;
                        $totalOther = $expenses->where('category', 'other')->sum('balance') ?? 0;
                        $netProfit = $grossProfit - $totalOperating - $totalOther;
                    @endphp
                    {{ number_format($netProfit, 2) }}
                </p>
                <p style="font-size: 14px; margin: 0; color: {{ $netProfit >= 0 ? '#059669' : '#DC2626' }};">
                    @if($netProfit >= 0)
                        NET PROFIT
                    @else
                        NET LOSS
                    @endif
                </p>
                <p style="font-size: 12px; margin: 0; color: #6B7280;">
                    Net Profit Margin: {{ number_format(($totalRevenue > 0 ? ($netProfit / $totalRevenue) * 100 : 0), 2) }}%
                </p>
            </div>
        </div>

        <!-- Summary -->
        <div class="section">
            <div class="section-title">PROFIT & LOSS SUMMARY</div>
            <table class="table table-no-border">
                <tr>
                    <td width="40%"><strong>Total Revenue:</strong></td>
                    <td width="60%">{{ number_format($totalRevenue, 2) }}</td>
                </tr>
                <tr>
                    <td><strong>Total Cost of Goods Sold:</strong></td>
                    <td style="color: #DC2626;">({{ number_format($totalCOGS, 2) }})</td>
                </tr>
                <tr>
                    <td><strong>Gross Profit:</strong></td>
                    <td style="color: #059669; font-weight: bold;">{{ number_format($grossProfit, 2) }}</td>
                </tr>
                <tr>
                    <td><strong>Total Operating Expenses:</strong></td>
                    <td style="color: #DC2626;">({{ number_format($totalOperating, 2) }})</td>
                </tr>
                @if($totalOther > 0)
                <tr>
                    <td><strong>Total Other Expenses:</strong></td>
                    <td style="color: #DC2626;">({{ number_format($totalOther, 2) }})</td>
                </tr>
                @endif
                <tr>
                    <td><strong>Net Profit / Loss:</strong></td>
                    <td style="color: {{ $netProfit >= 0 ? '#059669' : '#DC2626' }}; font-weight: bold; font-size: 16px;">
                        {{ number_format($netProfit, 2) }}
                        @if($netProfit >= 0)
                            (PROFIT)
                        @else
                            (LOSS)
                        @endif
                    </td>
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
            <div class="signature">
                <div class="signature-label">Chief Financial Officer</div>
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

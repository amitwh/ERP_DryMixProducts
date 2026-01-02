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
                Payslip #: {{ $payslip->payslip_number }}<br>
                Period: {{ $payslip->payrollPeriod->name }}<br>
                Generated: {{ now()->format('d-m-Y') }}
            </div>
        </div>
    </div>

    <!-- Content -->
    <div class="content">
        <!-- Employee Information -->
        <div class="section">
            <div class="section-title">EMPLOYEE INFORMATION</div>
            <div class="two-columns">
                <div class="column">
                    <strong>Employee Name:</strong> {{ $payslip->employee->name }}<br>
                    <strong>Employee Code:</strong> {{ $payslip->employee->employee_code }}<br>
                    <strong>Designation:</strong> {{ $payslip->employee->designation->name ?? '-' }}
                </div>
                <div class="column">
                    <strong>Department:</strong> {{ $payslip->employee->department->name ?? '-' }}<br>
                    <strong>Joining Date:</strong> {{ $payslip->employee->joining_date?->format('d-m-Y') ?? '-' }}<br>
                    <strong>PAN Number:</strong> {{ $payslip->employee->pan_number ?? '-' }}
                </div>
            </div>
        </div>

        <!-- Pay Period -->
        <div class="section">
            <div class="section-title">PAY PERIOD</div>
            <div class="info-grid">
                <div class="info-item">
                    <span class="info-label">Payslip Number:</span>
                    <span class="info-value">{{ $payslip->payslip_number }}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Period:</span>
                    <span class="info-value">{{ $payslip->payrollPeriod->name }}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Start Date:</span>
                    <span class="info-value">{{ $payslip->payrollPeriod->start_date->format('d-m-Y') }}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">End Date:</span>
                    <span class="info-value">{{ $payslip->payrollPeriod->end_date->format('d-m-Y') }}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Days Worked:</span>
                    <span class="info-value">{{ $payslip->days_worked }} Days</span>
                </div>
                <div class="info-item">
                    <span class="info-label">LOP Days:</span>
                    <span class="info-value">{{ $payslip->lop_days ?? 0 }} Days</span>
                </div>
            </div>
        </div>

        <!-- Earnings -->
        <div class="section">
            <div class="section-title">EARNINGS</div>
            <table class="table">
                <thead>
                    <tr>
                        <th width="10%">Sr. No.</th>
                        <th width="55%">Description</th>
                        <th width="15%" class="text-center">Days/Rate</th>
                        <th width="20%" class="text-right">Amount</th>
                    </tr>
                </thead>
                <tbody>
                    @forelse($payslip->components->where('type', 'earning') as $index => $component)
                        <tr>
                            <td>{{ $index + 1 }}</td>
                            <td>
                                <strong>{{ $component->salaryComponent->name }}</strong>
                                @if($component->salaryComponent->description)
                                <br><span class="text-sm">{{ $component->salaryComponent->description }}</span>
                                @endif
                            </td>
                            <td class="text-center">
                                @if($component->salaryComponent->is_taxable)
                                    <span class="text-sm">Taxable</span>
                                @else
                                    <span class="text-sm">Non-Taxable</span>
                                @endif
                            </td>
                            <td class="amount text-right text-bold">{{ number_format($component->amount, 2) }}</td>
                        </tr>
                    @empty
                        <tr>
                            <td colspan="4" class="text-center">No earnings found</td>
                        </tr>
                    @endforelse
                </tbody>
                <tfoot>
                    <tr class="total-row">
                        <td colspan="3" class="text-right"><strong>Total Earnings:</strong></td>
                        <td class="amount text-right"><strong>{{ number_format($payslip->gross_earnings ?? $payslip->components->where('type', 'earning')->sum('amount'), 2) }}</strong></td>
                    </tr>
                </tfoot>
            </table>
        </div>

        <!-- Deductions -->
        <div class="section">
            <div class="section-title">DEDUCTIONS</div>
            <table class="table">
                <thead>
                    <tr>
                        <th width="10%">Sr. No.</th>
                        <th width="55%">Description</th>
                        <th width="15%" class="text-center">Type</th>
                        <th width="20%" class="text-right">Amount</th>
                    </tr>
                </thead>
                <tbody>
                    @forelse($payslip->components->where('type', 'deduction') as $index => $component)
                        <tr>
                            <td>{{ $index + 1 }}</td>
                            <td>
                                <strong>{{ $component->salaryComponent->name }}</strong>
                                @if($component->salaryComponent->description)
                                <br><span class="text-sm">{{ $component->salaryComponent->description }}</span>
                                @endif
                            </td>
                            <td class="text-center">
                                @if($component->salaryComponent->code === 'PF' || $component->salaryComponent->code === 'ESI')
                                    <span class="text-sm">Social Security</span>
                                @elseif($component->salaryComponent->code === 'TAX')
                                    <span class="text-sm">Tax</span>
                                @else
                                    <span class="text-sm">Other</span>
                                @endif
                            </td>
                            <td class="amount text-right text-bold">{{ number_format($component->amount, 2) }}</td>
                        </tr>
                    @empty
                        <tr>
                            <td colspan="4" class="text-center">No deductions found</td>
                        </tr>
                    @endforelse
                </tbody>
                <tfoot>
                    <tr class="total-row">
                        <td colspan="3" class="text-right"><strong>Total Deductions:</strong></td>
                        <td class="amount text-right"><strong>({{ number_format($payslip->total_deductions ?? $payslip->components->where('type', 'deduction')->sum('amount'), 2) }})</strong></td>
                    </tr>
                </tfoot>
            </table>
        </div>

        <!-- Summary -->
        <div class="section">
            <div class="section-title">PAYSLIP SUMMARY</div>
            <div style="padding: 5mm; border: 2px solid {{ $theme['primary_color'] ?? '#2563EB' }}; border-radius: 5px; background: #EEF2FF;">
                <div class="info-grid">
                    <div class="info-item">
                        <span class="info-label">Gross Earnings:</span>
                        <span class="info-value text-bold">{{ number_format($payslip->gross_earnings, 2) }}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Total Deductions:</span>
                        <span class="info-value text-bold" style="color: #DC2626;">
                            ({{ number_format($payslip->total_deductions, 2) }})
                        </span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Net Salary:</span>
                        <span class="info-value text-bold" style="font-size: 16px; color: #059669;">
                            {{ number_format($payslip->net_salary, 2) }}
                        </span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Payment Mode:</span>
                        <span class="info-value text-bold">{{ strtoupper($payslip->payment_mode) }}</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- Tax Summary -->
        <div class="section">
            <div class="section-title">TAX SUMMARY</div>
            <table class="table table-no-border">
                <tr>
                    <td width="40%"><strong>Gross Taxable Income:</strong></td>
                    <td width="60%">{{ number_format($payslip->gross_taxable_income ?? $payslip->gross_earnings, 2) }}</td>
                </tr>
                <tr>
                    <td><strong>Tax Deducted:</strong></td>
                    <td>{{ number_format($payslip->tax_deducted ?? $payslip->components->where('salaryComponent.code', 'TAX')->sum('amount'), 2) }}</td>
                </tr>
                <tr>
                    <td><strong>PF Contribution:</strong></td>
                    <td>{{ number_format($payslip->pf_contribution ?? $payslip->components->where('salaryComponent.code', 'PF')->sum('amount'), 2) }}</td>
                </tr>
                <tr>
                    <td><strong>ESI Contribution:</strong></td>
                    <td>{{ number_format($payslip->esi_contribution ?? $payslip->components->where('salaryComponent.code', 'ESI')->sum('amount'), 2) }}</td>
                </tr>
            </table>
        </div>

        <!-- Signature Section -->
        <div class="signature-section">
            <div class="signature">
                <div class="signature-label">Employee Signature</div>
                <div class="signature-line"></div>
                <div class="signature-label">Date & Signature</div>
            </div>
            <div class="signature">
                <div class="signature-label">Prepared By</div>
                <div class="signature-line"></div>
                <div class="signature-label">HR Department</div>
            </div>
            <div class="signature">
                <div class="signature-label">Authorized By</div>
                <div class="signature-line"></div>
                <div class="signature-label">Finance Manager</div>
            </div>
        </div>
    </div>

    <!-- Footer -->
    <div class="footer">
        <div class="footer-left">
            Generated on: {{ now()->format('d-m-Y H:i:s') }} | ERP DryMix Products
        </div>
        <div class="footer-right">
            Page 1 of 1 | HR & Payroll
        </div>
    </div>
</div>
@endsection

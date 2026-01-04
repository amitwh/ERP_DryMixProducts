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
                | Unit: {{ $inspection->manufacturingUnit->name }}
            </div>
        </div>
        <div class="header-right">
            <div class="report-title">{{ $title }}</div>
            <div class="report-meta">
                Inspection #: {{ $inspection->inspection_number }}<br>
                Date: {{ $inspection->inspection_date->format('d-m-Y') }}<br>
                Status: <span class="status {{ $inspection->status }}">{{ $inspection->status }}</span>
            </div>
        </div>
    </div>

    <!-- Content -->
    <div class="content">
        <!-- Product Information -->
        <div class="section">
            <div class="section-title">PRODUCT INFORMATION</div>
            <div class="info-grid">
                <div class="info-item">
                    <span class="info-label">Product Name:</span>
                    <span class="info-value">{{ $inspection->product->name }}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Product Code:</span>
                    <span class="info-value">{{ $inspection->product->code ?? '-' }}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Batch Number:</span>
                    <span class="info-value">{{ $inspection->batch_number ?? '-' }}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Production Date:</span>
                    <span class="info-value">{{ $inspection->production_date?->format('d-m-Y') ?? '-' }}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Batch Size:</span>
                    <span class="info-value">{{ $inspection->batch_size }} {{ $inspection->batch_unit }}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Sample ID:</span>
                    <span class="info-value">{{ $inspection->sample_id ?? '-' }}</span>
                </div>
            </div>
        </div>

        <!-- Inspection Parameters -->
        <div class="section">
            <div class="section-title">INSPECTION PARAMETERS</div>
            <table class="table">
                <thead>
                    <tr>
                        <th width="10%">Sr. No.</th>
                        <th width="40%">Parameter</th>
                        <th width="15%" class="text-center">Unit</th>
                        <th width="15%" class="text-center">Standard</th>
                        <th width="10%" class="text-center">Result</th>
                        <th width="10%" class="text-center">Status</th>
                    </tr>
                </thead>
                <tbody>
                    @forelse($inspection->parameters as $index => $param)
                        <tr>
                            <td>{{ $index + 1 }}</td>
                            <td>
                                <strong>{{ $param->parameter_name }}</strong>
                                @if($param->parameter_category)
                                <br><span class="text-sm">Category: {{ $param->parameter_category }}</span>
                                @endif
                            </td>
                            <td class="text-center">{{ $param->unit }}</td>
                            <td class="text-center">
                                @if($param->min_value || $param->max_value)
                                    {{ $param->min_value }} - {{ $param->max_value }}
                                @else
                                    -
                                @endif
                            </td>
                            <td class="text-center text-bold">{{ $param->result_value ?? '-' }}</td>
                            <td class="text-center">
                                @if($param->result_status === 'pass')
                                    <span class="status pass">PASS</span>
                                @elseif($param->result_status === 'fail')
                                    <span class="status fail">FAIL</span>
                                @else
                                    <span class="status pending">PENDING</span>
                                @endif
                            </td>
                        </tr>
                    @empty
                        <tr>
                            <td colspan="6" class="text-center">No parameters found</td>
                        </tr>
                    @endforelse
                </tbody>
            </table>
        </div>

        <!-- Overall Result -->
        <div class="section">
            <div class="section-title">OVERALL INSPECTION RESULT</div>
            <div class="two-columns">
                <div class="column">
                    <div class="info-item">
                        <span class="info-label">Inspection Result:</span>
                        <span class="info-value">
                            @if($inspection->overall_result === 'pass')
                                <span class="status pass" style="padding: 5px 15px; font-size: 14px;">PASS</span>
                            @elseif($inspection->overall_result === 'fail')
                                <span class="status fail" style="padding: 5px 15px; font-size: 14px;">FAIL</span>
                            @else
                                <span class="status pending" style="padding: 5px 15px; font-size: 14px;">PENDING</span>
                            @endif
                        </span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Percentage Compliance:</span>
                        <span class="info-value text-bold">{{ $inspection->compliance_percentage ?? 0 }}%</span>
                    </div>
                </div>
                <div class="column">
                    <div class="info-item">
                        <span class="info-label">Standard Reference:</span>
                        <span class="info-value">{{ $inspection->standard_reference ?? '-' }}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Test Method:</span>
                        <span class="info-value">{{ $inspection->test_method ?? '-' }}</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- Observations -->
        @if($inspection->observations || $inspection->defects)
        <div class="section">
            <div class="section-title">OBSERVATIONS & DEFECTS</div>
            <table class="table table-no-border">
                <tr>
                    <td width="15%"><strong>Observations:</strong></td>
                    <td>{{ $inspection->observations ?? 'None' }}</td>
                </tr>
                <tr>
                    <td><strong>Defects:</strong></td>
                    <td>{{ $inspection->defects ?? 'None' }}</td>
                </tr>
            </table>
        </div>
        @endif

        <!-- Conformance Statement -->
        <div class="section">
            <div class="section-title">CONFORMANCE STATEMENT</div>
            <div style="border: 1px solid #E5E7EB; padding: 5mm; border-radius: 3px; background: #F9FAFB;">
                <p style="margin-bottom: 5mm;">
                    The product batch <strong>#{{ $inspection->batch_number ?? 'N/A' }}</strong> has been inspected and tested
                    as per the standard <strong>{{ $inspection->standard_reference ?? 'N/A' }}</strong>.
                </p>
                <p>
                    The product is hereby certified as:
                    <strong style="font-size: 14px; color: {{ $inspection->overall_result === 'pass' ? '#059669' : '#DC2626' }};">
                        {{ $inspection->overall_result === 'pass' ? 'CONFORMING TO SPECIFICATIONS' : 'NON-CONFORMING TO SPECIFICATIONS' }}
                    </strong>
                </p>
            </div>
        </div>

        <!-- Remarks -->
        @if($inspection->remarks)
        <div class="section">
            <div class="section-title">REMARKS</div>
            <p>{{ $inspection->remarks }}</p>
        </div>
        @endif

        <!-- Signature Section -->
        <div class="signature-section">
            <div class="signature">
                <div class="signature-label">Tested By</div>
                <div class="signature-line"></div>
                <div class="signature-label">{{ $inspection->testedBy->name ?? '-' }}</div>
                <div class="signature-label">{{ $inspection->tested_at?->format('d-m-Y H:i') ?? '-' }}</div>
            </div>
            <div class="signature">
                <div class="signature-label">Verified By</div>
                <div class="signature-line"></div>
                <div class="signature-label">{{ $inspection->verifiedBy->name ?? '-' }}</div>
                <div class="signature-label">{{ $inspection->verified_at?->format('d-m-Y H:i') ?? '-' }}</div>
            </div>
            <div class="signature">
                <div class="signature-label">Approved By</div>
                <div class="signature-line"></div>
                <div class="signature-label">{{ $inspection->approvedBy->name ?? '-' }}</div>
                <div class="signature-label">{{ $inspection->approved_at?->format('d-m-Y H:i') ?? '-' }}</div>
            </div>
        </div>
    </div>

    <!-- Footer -->
    <div class="footer">
        <div class="footer-left">
            Generated on: {{ now()->format('d-m-Y H:i:s') }} | ERP DryMix Products
        </div>
        <div class="footer-right">
            Page 1 of 1 | Quality Control Department
        </div>
    </div>
</div>
@endsection

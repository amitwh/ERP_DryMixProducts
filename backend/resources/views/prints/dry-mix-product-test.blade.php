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
                | Unit: {{ $test->manufacturingUnit->name }}
            </div>
        </div>
        <div class="header-right">
            <div class="report-title">{{ $title }}</div>
            <div class="report-meta">
                Test #: {{ $test->test_number }}<br>
                Date: {{ $test->test_date->format('d-m-Y') }}<br>
                Status: <span class="status {{ $test->status }}">{{ $test->status }}</span>
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
                    <span class="info-value">{{ $test->product->name }}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Product Code:</span>
                    <span class="info-value">{{ $test->product->code ?? '-' }}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Batch Number:</span>
                    <span class="info-value">{{ $test->batch?->batch_number ?? '-' }}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Sample ID:</span>
                    <span class="info-value">{{ $test->sample_id ?? '-' }}</span>
                </div>
            </div>
        </div>

        <!-- Mechanical Properties -->
        <div class="section">
            <div class="section-title">MECHANICAL PROPERTIES - COMPRESSIVE STRENGTH</div>
            <table class="table">
                <thead>
                    <tr>
                        <th width="25%">Curing Period</th>
                        <th width="25%" class="text-center">Standard (MPa)</th>
                        <th width="25%" class="text-center">Result (MPa)</th>
                        <th width="25%" class="text-center">Status</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>1 Day Strength</td>
                        <td class="text-center">{{ $test->standard_limits['compressive_strength_1_day']['min'] ?? '-' }}</td>
                        <td class="text-center text-bold">{{ $test->compressive_strength_1_day ?? '-' }}</td>
                        <td class="text-center">
                            @if(isset($test->standard_limits['compressive_strength_1_day']) && $test->compressive_strength_1_day)
                                @if($test->compressive_strength_1_day >= ($test->standard_limits['compressive_strength_1_day']['min'] ?? 0))
                                    <span class="status pass">PASS</span>
                                @else
                                    <span class="status fail">FAIL</span>
                                @endif
                            @else
                                -
                            @endif
                        </td>
                    </tr>
                    <tr>
                        <td>3 Day Strength</td>
                        <td class="text-center">{{ $test->standard_limits['compressive_strength_3_day']['min'] ?? '-' }}</td>
                        <td class="text-center text-bold">{{ $test->compressive_strength_3_day ?? '-' }}</td>
                        <td class="text-center">
                            @if(isset($test->standard_limits['compressive_strength_3_day']) && $test->compressive_strength_3_day)
                                @if($test->compressive_strength_3_day >= ($test->standard_limits['compressive_strength_3_day']['min'] ?? 0))
                                    <span class="status pass">PASS</span>
                                @else
                                    <span class="status fail">FAIL</span>
                                @endif
                            @else
                                -
                            @endif
                        </td>
                    </tr>
                    <tr>
                        <td>7 Day Strength</td>
                        <td class="text-center">{{ $test->standard_limits['compressive_strength_7_day']['min'] ?? '-' }}</td>
                        <td class="text-center text-bold">{{ $test->compressive_strength_7_day ?? '-' }}</td>
                        <td class="text-center">
                            @if(isset($test->standard_limits['compressive_strength_7_day']) && $test->compressive_strength_7_day)
                                @if($test->compressive_strength_7_day >= ($test->standard_limits['compressive_strength_7_day']['min'] ?? 0))
                                    <span class="status pass">PASS</span>
                                @else
                                    <span class="status fail">FAIL</span>
                                @endif
                            @else
                                -
                            @endif
                        </td>
                    </tr>
                    <tr>
                        <td>28 Day Strength</td>
                        <td class="text-center">{{ $test->standard_limits['compressive_strength_28_day']['min'] ?? '-' }}</td>
                        <td class="text-center text-bold">{{ $test->compressive_strength_28_day ?? '-' }}</td>
                        <td class="text-center">
                            @if(isset($test->standard_limits['compressive_strength_28_day']) && $test->compressive_strength_28_day)
                                @if($test->compressive_strength_28_day >= ($test->standard_limits['compressive_strength_28_day']['min'] ?? 0))
                                    <span class="status pass">PASS</span>
                                @else
                                    <span class="status fail">FAIL</span>
                                @endif
                            @else
                                -
                            @endif
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- Physical Properties -->
        <div class="section">
            <div class="section-title">PHYSICAL PROPERTIES</div>
            <table class="table">
                <thead>
                    <tr>
                        <th width="30%">Parameter</th>
                        <th width="20%" class="text-center">Unit</th>
                        <th width="25%" class="text-center">Standard</th>
                        <th width="25%" class="text-center">Result</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Flexural Strength</td>
                        <td class="text-center">MPa</td>
                        <td class="text-center">
                            {{ $test->standard_limits['flexural_strength']['min'] ?? '-' }}
                        </td>
                        <td class="text-center text-bold">{{ $test->flexural_strength ?? '-' }}</td>
                    </tr>
                    <tr>
                        <td>Adhesion Strength</td>
                        <td class="text-center">MPa</td>
                        <td class="text-center">
                            {{ $test->standard_limits['adhesion_strength']['min'] ?? '-' }}
                        </td>
                        <td class="text-center text-bold">{{ $test->adhesion_strength ?? '-' }}</td>
                    </tr>
                    <tr>
                        <td>Setting Time - Initial</td>
                        <td class="text-center">min</td>
                        <td class="text-center">
                            {{ $test->standard_limits['setting_time_initial']['min'] ?? '-' }} -
                            {{ $test->standard_limits['setting_time_initial']['max'] ?? '-' }}
                        </td>
                        <td class="text-center text-bold">{{ $test->setting_time_initial ?? '-' }}</td>
                    </tr>
                    <tr>
                        <td>Setting Time - Final</td>
                        <td class="text-center">min</td>
                        <td class="text-center">
                            {{ $test->standard_limits['setting_time_final']['min'] ?? '-' }} -
                            {{ $test->standard_limits['setting_time_final']['max'] ?? '-' }}
                        </td>
                        <td class="text-center text-bold">{{ $test->setting_time_final ?? '-' }}</td>
                    </tr>
                    <tr>
                        <td>Water Demand</td>
                        <td class="text-center">%</td>
                        <td class="text-center">
                            {{ $test->standard_limits['water_demand']['min'] ?? '-' }} -
                            {{ $test->standard_limits['water_demand']['max'] ?? '-' }}
                        </td>
                        <td class="text-center text-bold">{{ $test->water_demand ?? '-' }}</td>
                    </tr>
                    <tr>
                        <td>Water Retention</td>
                        <td class="text-center">%</td>
                        <td class="text-center">
                            {{ $test->standard_limits['water_retention']['min'] ?? '-' }}
                        </td>
                        <td class="text-center text-bold">{{ $test->water_retention ?? '-' }}</td>
                    </tr>
                    <tr>
                        <td>Flow Diameter</td>
                        <td class="text-center">mm</td>
                        <td class="text-center">
                            {{ $test->standard_limits['flow_diameter']['min'] ?? '-' }} -
                            {{ $test->standard_limits['flow_diameter']['max'] ?? '-' }}
                        </td>
                        <td class="text-center text-bold">{{ $test->flow_diameter ?? '-' }}</td>
                    </tr>
                    <tr>
                        <td>Bulk Density</td>
                        <td class="text-center">kg/m³</td>
                        <td class="text-center">
                            {{ $test->standard_limits['bulk_density']['min'] ?? '-' }}
                        </td>
                        <td class="text-center text-bold">{{ $test->bulk_density ?? '-' }}</td>
                    </tr>
                    <tr>
                        <td>Air Content</td>
                        <td class="text-center">%</td>
                        <td class="text-center">
                            {{ $test->standard_limits['air_content']['min'] ?? '-' }} -
                            {{ $test->standard_limits['air_content']['max'] ?? '-' }}
                        </td>
                        <td class="text-center text-bold">{{ $test->air_content ?? '-' }}</td>
                    </tr>
                    <tr>
                        <td>Shelf Life</td>
                        <td class="text-center">months</td>
                        <td class="text-center">
                            {{ $test->standard_limits['shelf_life']['min'] ?? '-' }}
                        </td>
                        <td class="text-center text-bold">{{ $test->shelf_life ?? '-' }}</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- Appearance -->
        @if($test->color || $test->texture || $test->appearance_notes)
        <div class="section">
            <div class="section-title">APPEARANCE</div>
            <table class="table table-no-border">
                <tr>
                    <td width="20%"><strong>Color:</strong></td>
                    <td>{{ $test->color ?? '-' }}</td>
                </tr>
                <tr>
                    <td><strong>Texture:</strong></td>
                    <td>{{ $test->texture ?? '-' }}</td>
                </tr>
                <tr>
                    <td><strong>Notes:</strong></td>
                    <td>{{ $test->appearance_notes ?? '-' }}</td>
                </tr>
            </table>
        </div>
        @endif

        <!-- Test Result -->
        <div class="section">
            <div class="section-title">TEST RESULT</div>
            <div style="border: 2px solid {{ $test->test_result === 'pass' ? '#059669' : '#DC2626' }}; padding: 8mm; border-radius: 5px; text-align: center; background: {{ $test->test_result === 'pass' ? '#D1FAE5' : '#FEE2E2' }};">
                <div style="font-size: 16px; font-weight: bold; color: {{ $test->test_result === 'pass' ? '#065F46' : '#991B1B' }};">
                    {{ strtoupper($test->test_result) }}
                </div>
            </div>
            <div class="info-grid" style="margin-top: 5mm;">
                <div class="info-item">
                    <span class="info-label">Meets Standard:</span>
                    <span class="info-value">
                        @if($test->meets_standard)
                            <span class="status pass">YES</span>
                        @elseif($test->meets_standard === false)
                            <span class="status fail">NO</span>
                        @else
                            Pending
                        @endif
                    </span>
                </div>
                <div class="info-item">
                    <span class="info-label">Standard Reference:</span>
                    <span class="info-value">{{ $test->standard_reference ?? '-' }}</span>
                </div>
            </div>
        </div>

        <!-- Remarks -->
        @if($test->remarks || $test->recommendations)
        <div class="section">
            <div class="section-title">REMARKS & RECOMMENDATIONS</div>
            <table class="table table-no-border">
                <tr>
                    <td width="15%"><strong>Remarks:</strong></td>
                    <td>{{ $test->remarks ?? 'None' }}</td>
                </tr>
                <tr>
                    <td><strong>Recommendations:</strong></td>
                    <td>{{ $test->recommendations ?? 'None' }}</td>
                </tr>
            </table>
        </div>
        @endif

        <!-- Signature Section -->
        <div class="signature-section">
            <div class="signature">
                <div class="signature-label">Tested By</div>
                <div class="signature-line"></div>
                <div class="signature-label">{{ $test->testedBy->name ?? '-' }}</div>
                <div class="signature-label">{{ $test->tested_at?->format('d-m-Y H:i') ?? '-' }}</div>
            </div>
            <div class="signature">
                <div class="signature-label">Verified By</div>
                <div class="signature-line"></div>
                <div class="signature-label">{{ $test->verifiedBy->name ?? '-' }}</div>
                <div class="signature-label">{{ $test->verified_at?->format('d-m-Y H:i') ?? '-' }}</div>
            </div>
            <div class="signature">
                <div class="signature-label">Approved By</div>
                <div class="signature-line"></div>
                <div class="signature-label">{{ $test->approvedBy->name ?? '-' }}</div>
                <div class="signature-label">{{ $test->approved_at?->format('d-m-Y H:i') ?? '-' }}</div>
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

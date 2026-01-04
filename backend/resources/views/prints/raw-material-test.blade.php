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
        <!-- Raw Material Information -->
        <div class="section">
            <div class="section-title">RAW MATERIAL INFORMATION</div>
            <div class="info-grid">
                <div class="info-item">
                    <span class="info-label">Material Name:</span>
                    <span class="info-value">{{ $test->rawMaterial->name }}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Material Code:</span>
                    <span class="info-value">{{ $test->rawMaterial->code ?? '-' }}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Material Type:</span>
                    <span class="info-value">{{ $test->rawMaterial->type ?? '-' }}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Supplier Batch:</span>
                    <span class="info-value">{{ $test->supplier_batch_id ?? '-' }}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Sample ID:</span>
                    <span class="info-value">{{ $test->sample_id ?? '-' }}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Supplier:</span>
                    <span class="info-value">{{ $test->rawMaterial->supplier?->name ?? '-' }}</span>
                </div>
            </div>
        </div>

        <!-- Chemical Analysis -->
        <div class="section">
            <div class="section-title">CHEMICAL ANALYSIS</div>
            <table class="table">
                <thead>
                    <tr>
                        <th width="50%">Oxide</th>
                        <th width="15%" class="text-center">Unit</th>
                        <th width="17%" class="text-center">Standard</th>
                        <th width="18%" class="text-center">Result</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Silicon Dioxide (SiO₂)</td>
                        <td class="text-center">%</td>
                        <td class="text-center">
                            {{ $test->standard_limits['sio2']['min'] ?? '-' }} -
                            {{ $test->standard_limits['sio2']['max'] ?? '-' }}
                        </td>
                        <td class="text-center text-bold">{{ $test->sio2 ?? '-' }}</td>
                    </tr>
                    <tr>
                        <td>Aluminum Oxide (Al₂O₃)</td>
                        <td class="text-center">%</td>
                        <td class="text-center">
                            {{ $test->standard_limits['al2o3']['min'] ?? '-' }} -
                            {{ $test->standard_limits['al2o3']['max'] ?? '-' }}
                        </td>
                        <td class="text-center text-bold">{{ $test->al2o3 ?? '-' }}</td>
                    </tr>
                    <tr>
                        <td>Iron Oxide (Fe₂O₃)</td>
                        <td class="text-center">%</td>
                        <td class="text-center">
                            {{ $test->standard_limits['fe2o3']['min'] ?? '-' }} -
                            {{ $test->standard_limits['fe2o3']['max'] ?? '-' }}
                        </td>
                        <td class="text-center text-bold">{{ $test->fe2o3 ?? '-' }}</td>
                    </tr>
                    <tr>
                        <td>Calcium Oxide (CaO)</td>
                        <td class="text-center">%</td>
                        <td class="text-center">
                            {{ $test->standard_limits['cao']['min'] ?? '-' }} -
                            {{ $test->standard_limits['cao']['max'] ?? '-' }}
                        </td>
                        <td class="text-center text-bold">{{ $test->cao ?? '-' }}</td>
                    </tr>
                    <tr>
                        <td>Magnesium Oxide (MgO)</td>
                        <td class="text-center">%</td>
                        <td class="text-center">
                            {{ $test->standard_limits['mgo']['min'] ?? '-' }} -
                            {{ $test->standard_limits['mgo']['max'] ?? '-' }}
                        </td>
                        <td class="text-center text-bold">{{ $test->mgo ?? '-' }}</td>
                    </tr>
                    <tr>
                        <td>Sulfur Trioxide (SO₃)</td>
                        <td class="text-center">%</td>
                        <td class="text-center">
                            {{ $test->standard_limits['so3']['min'] ?? '-' }} -
                            {{ $test->standard_limits['so3']['max'] ?? '-' }}
                        </td>
                        <td class="text-center text-bold">{{ $test->so3 ?? '-' }}</td>
                    </tr>
                    <tr>
                        <td>Potassium Oxide (K₂O)</td>
                        <td class="text-center">%</td>
                        <td class="text-center">
                            {{ $test->standard_limits['k2o']['min'] ?? '-' }} -
                            {{ $test->standard_limits['k2o']['max'] ?? '-' }}
                        </td>
                        <td class="text-center text-bold">{{ $test->k2o ?? '-' }}</td>
                    </tr>
                    <tr>
                        <td>Sodium Oxide (Na₂O)</td>
                        <td class="text-center">%</td>
                        <td class="text-center">
                            {{ $test->standard_limits['na2o']['min'] ?? '-' }} -
                            {{ $test->standard_limits['na2o']['max'] ?? '-' }}
                        </td>
                        <td class="text-center text-bold">{{ $test->na2o ?? '-' }}</td>
                    </tr>
                    <tr>
                        <td>Chloride (Cl)</td>
                        <td class="text-center">%</td>
                        <td class="text-center">
                            {{ $test->standard_limits['cl']['min'] ?? '-' }} -
                            {{ $test->standard_limits['cl']['max'] ?? '-' }}
                        </td>
                        <td class="text-center text-bold">{{ $test->cl ?? '-' }}</td>
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
                        <th width="50%">Property</th>
                        <th width="15%" class="text-center">Unit</th>
                        <th width="17%" class="text-center">Standard</th>
                        <th width="18%" class="text-center">Result</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Moisture Content</td>
                        <td class="text-center">%</td>
                        <td class="text-center">
                            {{ $test->standard_limits['moisture_content']['min'] ?? '-' }} -
                            {{ $test->standard_limits['moisture_content']['max'] ?? '-' }}
                        </td>
                        <td class="text-center text-bold">{{ $test->moisture_content ?? '-' }}</td>
                    </tr>
                    <tr>
                        <td>Loss on Ignition (LOI)</td>
                        <td class="text-center">%</td>
                        <td class="text-center">
                            {{ $test->standard_limits['loss_on_ignition']['min'] ?? '-' }} -
                            {{ $test->standard_limits['loss_on_ignition']['max'] ?? '-' }}
                        </td>
                        <td class="text-center text-bold">{{ $test->loss_on_ignition ?? '-' }}</td>
                    </tr>
                    <tr>
                        <td>Specific Gravity</td>
                        <td class="text-center">-</td>
                        <td class="text-center">
                            {{ $test->standard_limits['specific_gravity']['min'] ?? '-' }} -
                            {{ $test->standard_limits['specific_gravity']['max'] ?? '-' }}
                        </td>
                        <td class="text-center text-bold">{{ $test->specific_gravity ?? '-' }}</td>
                    </tr>
                    <tr>
                        <td>Bulk Density</td>
                        <td class="text-center">kg/m³</td>
                        <td class="text-center">
                            {{ $test->standard_limits['bulk_density']['min'] ?? '-' }}
                        </td>
                        <td class="text-center text-bold">{{ $test->bulk_density ?? '-' }}</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- Particle Size Analysis -->
        <div class="section">
            <div class="section-title">PARTICLE SIZE ANALYSIS</div>
            <table class="table">
                <thead>
                    <tr>
                        <th width="50%">Property</th>
                        <th width="15%" class="text-center">Unit</th>
                        <th width="17%" class="text-center">Standard</th>
                        <th width="18%" class="text-center">Result</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Particle Size (D50)</td>
                        <td class="text-center">µm</td>
                        <td class="text-center">
                            {{ $test->standard_limits['particle_size_d50']['min'] ?? '-' }} -
                            {{ $test->standard_limits['particle_size_d50']['max'] ?? '-' }}
                        </td>
                        <td class="text-center text-bold">{{ $test->particle_size_d50 ?? '-' }}</td>
                    </tr>
                    <tr>
                        <td>Particle Size (D90)</td>
                        <td class="text-center">µm</td>
                        <td class="text-center">
                            {{ $test->standard_limits['particle_size_d90']['min'] ?? '-' }} -
                            {{ $test->standard_limits['particle_size_d90']['max'] ?? '-' }}
                        </td>
                        <td class="text-center text-bold">{{ $test->particle_size_d90 ?? '-' }}</td>
                    </tr>
                    <tr>
                        <td>Particle Size (D98)</td>
                        <td class="text-center">µm</td>
                        <td class="text-center">
                            {{ $test->standard_limits['particle_size_d98']['min'] ?? '-' }} -
                            {{ $test->standard_limits['particle_size_d98']['max'] ?? '-' }}
                        </td>
                        <td class="text-center text-bold">{{ $test->particle_size_d98 ?? '-' }}</td>
                    </tr>
                    <tr>
                        <td>Blaine Fineness</td>
                        <td class="text-center">m²/kg</td>
                        <td class="text-center">
                            {{ $test->standard_limits['blaine_fineness']['min'] ?? '-' }}
                        </td>
                        <td class="text-center text-bold">{{ $test->blaine_fineness ?? '-' }}</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- Test Result -->
        <div class="section">
            <div class="section-title">TEST RESULT</div>
            <div style="border: 2px solid {{ $test->test_result === 'pass' ? '#059669' : '#DC2626' }}; padding: 8mm; border-radius: 5px; text-align: center; background: {{ $test->test_result === 'pass' ? '#D1FAE5' : '#FEE2E2' }};">
                <div style="font-size: 18px; font-weight: bold; color: {{ $test->test_result === 'pass' ? '#065F46' : '#991B1B' }};">
                    {{ strtoupper($test->test_result) }} - {{ $test->meets_standard ? 'MEETS STANDARD' : 'DOES NOT MEET STANDARD' }}
                </div>
            </div>
            <div class="info-grid" style="margin-top: 5mm;">
                <div class="info-item">
                    <span class="info-label">Standard Reference:</span>
                    <span class="info-value">{{ $test->standard_reference ?? '-' }}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Conformity:</span>
                    <span class="info-value">
                        @if($test->meets_standard)
                            <span class="status pass" style="padding: 3mm 10mm;">CONFORMING</span>
                        @elseif($test->meets_standard === false)
                            <span class="status fail" style="padding: 3mm 10mm;">NON-CONFORMING</span>
                        @else
                            Pending
                        @endif
                    </span>
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

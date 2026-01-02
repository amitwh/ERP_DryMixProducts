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
                | Unit: {{ $ncr->originUnit->name ?? '-' }}
            </div>
        </div>
        <div class="header-right">
            <div class="report-title" style="color: #DC2626;">{{ $title }}</div>
            <div class="report-meta">
                NCR #: {{ $ncr->ncr_number }}<br>
                Date: {{ $ncr->ncr_date->format('d-m-Y') }}<br>
                Status: <span class="status {{ $ncr->status }}">{{ $ncr->status }}</span>
            </div>
        </div>
    </div>

    <!-- Content -->
    <div class="content">
        <!-- Product Information -->
        <div class="section">
            <div class="section-title" style="background: #FEE2E2; color: #991B1B;">PRODUCT INFORMATION</div>
            <div class="info-grid">
                <div class="info-item">
                    <span class="info-label">Product Name:</span>
                    <span class="info-value text-bold">{{ $ncr->product->name }}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Product Code:</span>
                    <span class="info-value">{{ $ncr->product->code ?? '-' }}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Batch Number:</span>
                    <span class="info-value text-bold">{{ $ncr->batch_number ?? '-' }}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Quantity:</span>
                    <span class="info-value">{{ $ncr->quantity }} {{ $ncr->unit ?? '-' }}</span>
                </div>
            </div>
        </div>

        <!-- NCR Details -->
        <div class="section">
            <div class="section-title" style="background: #FEE2E2; color: #991B1B;">NCR DETAILS</div>
            <div class="info-grid">
                <div class="info-item">
                    <span class="info-label">NCR Number:</span>
                    <span class="info-value text-bold">{{ $ncr->ncr_number }}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">NCR Date:</span>
                    <span class="info-value">{{ $ncr->ncr_date->format('d-m-Y') }}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Origin:</span>
                    <span class="info-value">{{ ucfirst($ncr->origin) }}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Severity:</span>
                    <span class="info-value">
                        @if($ncr->severity === 'critical')
                            <span class="status fail" style="padding: 2mm 5mm;">CRITICAL</span>
                        @elseif($ncr->severity === 'major')
                            <span class="status" style="background: #F97316; color: white; padding: 2mm 5mm;">MAJOR</span>
                        @else
                            <span class="status" style="background: #FCD34D; color: #92400E; padding: 2mm 5mm;">MINOR</span>
                        @endif
                    </span>
                </div>
                <div class="info-item">
                    <span class="info-label">Defect Type:</span>
                    <span class="info-value">{{ $ncr->defect_type ?? '-' }}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Reference Document:</span>
                    <span class="info-value">{{ $ncr->reference_document ?? '-' }}</span>
                </div>
            </div>
        </div>

        <!-- Description -->
        <div class="section">
            <div class="section-title" style="background: #FEE2E2; color: #991B1B;">NON-CONFORMANCE DESCRIPTION</div>
            <div style="padding: 5mm; border: 2px solid #FCA5A5; border-radius: 3px; background: #FEF2F2;">
                <p style="font-weight: bold;">{{ $ncr->description }}</p>
            </div>
        </div>

        <!-- Root Cause Analysis -->
        <div class="section">
            <div class="section-title">ROOT CAUSE ANALYSIS</div>
            <div style="padding: 5mm; border: 1px solid #E5E7EB; border-radius: 3px; background: #F9FAFB;">
                <p>{{ $ncr->root_cause ?? 'Not analyzed yet' }}</p>
            </div>
        </div>

        <!-- Impact Assessment -->
        <div class="section">
            <div class="section-title">IMPACT ASSESSMENT</div>
            <div class="info-grid">
                <div class="info-item">
                    <span class="info-label">Quality Impact:</span>
                    <span class="info-value text-bold">{{ ucfirst($ncr->quality_impact ?? 'Unknown') }}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Delivery Impact:</span>
                    <span class="info-value text-bold">{{ ucfirst($ncr->delivery_impact ?? 'Unknown') }}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Cost Impact:</span>
                    <span class="info-value text-bold">{{ number_format($ncr->cost_impact ?? 0, 2) }}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Estimated Loss:</span>
                    <span class="info-value text-bold">{{ number_format($ncr->estimated_loss ?? 0, 2) }}</span>
                </div>
            </div>
        </div>

        <!-- Corrective Actions -->
        <div class="section">
            <div class="section-title">CORRECTIVE ACTIONS</div>
            <div style="padding: 5mm; border: 1px solid #E5E7EB; border-radius: 3px; background: #F9FAFB;">
                <p>{{ $ncr->corrective_actions ?? 'Not defined' }}</p>
            </div>
        </div>

        <!-- Preventive Actions -->
        <div class="section">
            <div class="section-title">PREVENTIVE ACTIONS</div>
            <div style="padding: 5mm; border: 1px solid #E5E7EB; border-radius: 3px; background: #F9FAFB;">
                <p>{{ $ncr->preventive_actions ?? 'Not defined' }}</p>
            </div>
        </div>

        <!-- Verification -->
        <div class="section">
            <div class="section-title">VERIFICATION & APPROVAL</div>
            <table class="table table-no-border">
                <tr>
                    <td width="25%"><strong>Status:</strong></td>
                    <td>
                        @if($ncr->status === 'resolved')
                            <span class="status approved">RESOLVED</span>
                        @elseif($ncr->status === 'in_progress')
                            <span class="status in-progress">IN PROGRESS</span>
                        @elseif($ncr->status === 'rejected')
                            <span class="status rejected">REJECTED</span>
                        @else
                            <span class="status pending">OPEN</span>
                        @endif
                    </td>
                </tr>
                <tr>
                    <td><strong>Verified By:</strong></td>
                    <td>{{ $ncr->verifiedBy->name ?? '-' }}</td>
                </tr>
                <tr>
                    <td><strong>Verified Date:</strong></td>
                    <td>{{ $ncr->verified_at?->format('d-m-Y H:i') ?? '-' }}</td>
                </tr>
                <tr>
                    <td><strong>Approved By:</strong></td>
                    <td>{{ $ncr->approvedBy->name ?? '-' }}</td>
                </tr>
                <tr>
                    <td><strong>Approved Date:</strong></td>
                    <td>{{ $ncr->approved_at?->format('d-m-Y H:i') ?? '-' }}</td>
                </tr>
            </table>
        </div>

        <!-- Remarks -->
        @if($ncr->remarks)
        <div class="section">
            <div class="section-title">REMARKS</div>
            <p>{{ $ncr->remarks }}</p>
        </div>
        @endif

        <!-- Signature Section -->
        <div class="signature-section">
            <div class="signature">
                <div class="signature-label">Raised By</div>
                <div class="signature-line"></div>
                <div class="signature-label">{{ $ncr->raisedBy->name ?? '-' }}</div>
                <div class="signature-label">{{ $ncr->created_at->format('d-m-Y') }}</div>
            </div>
            <div class="signature">
                <div class="signature-label">Verified By</div>
                <div class="signature-line"></div>
                <div class="signature-label">{{ $ncr->verifiedBy->name ?? '-' }}</div>
            </div>
            <div class="signature">
                <div class="signature-label">Quality Manager</div>
                <div class="signature-line"></div>
            </div>
            <div class="signature">
                <div class="signature-label">Approved By</div>
                <div class="signature-line"></div>
                <div class="signature-label">{{ $ncr->approvedBy->name ?? '-' }}</div>
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

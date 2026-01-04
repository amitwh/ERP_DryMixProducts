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
                | Manufacturing Unit: {{ $bom->product->manufacturingUnit->name ?? 'Main Unit' }}
            </div>
        </div>
        <div class="header-right">
            <div class="report-title">{{ $title }}</div>
            <div class="report-meta">
                BOM #: {{ $bom->bom_number }}<br>
                Version: {{ $bom->version }}<br>
                Effective: {{ $bom->effective_date?->format('d-m-Y') ?? '-' }}
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
                    <span class="info-value">{{ $bom->product->name }}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Product Code:</span>
                    <span class="info-value">{{ $bom->product->code ?? '-' }}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Product Type:</span>
                    <span class="info-value">{{ $bom->product->type ?? '-' }}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Base Quantity:</span>
                    <span class="info-value">{{ number_format($bom->base_quantity, 2) }} {{ $bom->unit }}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">BOM Type:</span>
                    <span class="info-value">{{ ucfirst($bom->bom_type) }}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Status:</span>
                    <span class="info-value">
                        @if($bom->is_active)
                            <span class="status completed">ACTIVE</span>
                        @else
                            <span class="status cancelled">INACTIVE</span>
                        @endif
                    </span>
                </div>
            </div>
        </div>

        <!-- BOM Details -->
        <div class="section">
            <div class="section-title">BOM DETAILS</div>
            <div class="info-grid">
                <div class="info-item">
                    <span class="info-label">BOM Number:</span>
                    <span class="info-value">{{ $bom->bom_number }}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Version:</span>
                    <span class="info-value">{{ $bom->version }}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Effective Date:</span>
                    <span class="info-value">{{ $bom->effective_date?->format('d-m-Y') ?? '-' }}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Revision Date:</span>
                    <span class="info-value">{{ $bom->revision_date?->format('d-m-Y') ?? '-' }}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Standard Reference:</span>
                    <span class="info-value">{{ $bom->standard_reference ?? '-' }}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Created By:</span>
                    <span class="info-value">{{ $bom->createdBy->name ?? '-' }}</span>
                </div>
            </div>
        </div>

        <!-- BOM Items -->
        <div class="section">
            <div class="section-title">RAW MATERIALS</div>
            <table class="table">
                <thead>
                    <tr>
                        <th width="8%">Sr. No.</th>
                        <th width="35%">Material Name</th>
                        <th width="15%" class="text-center">Quantity</th>
                        <th width="10%" class="text-center">Unit</th>
                        <th width="12%" class="text-center">Cost/unit</th>
                        <th width="10%" class="text-center">%</th>
                        <th width="10%" class="text-right">Total Cost</th>
                    </tr>
                </thead>
                <tbody>
                    @forelse($bom->bomItems as $index => $item)
                        <tr>
                            <td>{{ $index + 1 }}</td>
                            <td>
                                <strong>{{ $item->rawMaterial->name }}</strong>
                                @if($item->rawMaterial->code)
                                <br><span class="text-sm">Code: {{ $item->rawMaterial->code }}</span>
                                @endif
                                @if($item->rawMaterial->type)
                                <br><span class="text-sm">Type: {{ $item->rawMaterial->type }}</span>
                                @endif
                            </td>
                            <td class="text-center text-bold">{{ number_format($item->quantity, 3) }}</td>
                            <td class="text-center">{{ $item->unit }}</td>
                            <td class="amount text-center">{{ number_format($item->unit_cost ?? 0, 2) }}</td>
                            <td class="text-center">{{ number_format($item->percentage ?? 0, 2) }}%</td>
                            <td class="amount text-right">{{ number_format($item->total_cost ?? 0, 2) }}</td>
                        </tr>
                    @empty
                        <tr>
                            <td colspan="7" class="text-center">No materials found</td>
                        </tr>
                    @endforelse
                </tbody>
                <tfoot>
                    <tr class="total-row">
                        <td colspan="6" class="text-right"><strong>Total Material Cost:</strong></td>
                        <td class="amount text-right"><strong>{{ number_format($bom->total_material_cost ?? 0, 2) }}</strong></td>
                    </tr>
                    <tr class="total-row">
                        <td colspan="6" class="text-right"><strong>Processing Cost:</strong></td>
                        <td class="amount text-right"><strong>{{ number_format($bom->processing_cost ?? 0, 2) }}</strong></td>
                    </tr>
                    <tr class="total-row">
                        <td colspan="6" class="text-right"><strong>Overhead Cost:</strong></td>
                        <td class="amount text-right"><strong>{{ number_format($bom->overhead_cost ?? 0, 2) }}</strong></td>
                    </tr>
                    <tr class="total-row">
                        <td colspan="6" class="text-right"><strong>TOTAL COST:</strong></td>
                        <td class="amount text-right"><strong>{{ number_format($bom->total_cost ?? 0, 2) }}</strong></td>
                    </tr>
                    <tr class="total-row">
                        <td colspan="6" class="text-right"><strong>Cost per {{ $bom->unit }}:</strong></td>
                        <td class="amount text-right"><strong>{{ number_format($bom->cost_per_unit ?? 0, 2) }}</strong></td>
                    </tr>
                </tfoot>
            </table>
        </div>

        <!-- Process Instructions -->
        @if($bom->process_instructions)
        <div class="section">
            <div class="section-title">PROCESS INSTRUCTIONS</div>
            <div style="padding: 5mm; border: 1px solid #E5E7EB; border-radius: 3px; background: #F9FAFB;">
                <p>{{ $bom->process_instructions }}</p>
            </div>
        </div>
        @endif

        <!-- Quality Requirements -->
        @if($bom->quality_requirements)
        <div class="section">
            <div class="section-title">QUALITY REQUIREMENTS</div>
            <div style="padding: 5mm; border: 1px solid #E5E7EB; border-radius: 3px; background: #F9FAFB;">
                <p>{{ $bom->quality_requirements }}</p>
            </div>
        </div>
        @endif

        <!-- Remarks -->
        @if($bom->remarks)
        <div class="section">
            <div class="section-title">REMARKS</div>
            <p>{{ $bom->remarks }}</p>
        </div>
        @endif

        <!-- Signature Section -->
        <div class="signature-section">
            <div class="signature">
                <div class="signature-label">Prepared By</div>
                <div class="signature-line"></div>
                <div class="signature-label">{{ $bom->createdBy->name ?? '-' }}</div>
                <div class="signature-label">{{ $bom->created_at->format('d-m-Y') }}</div>
            </div>
            <div class="signature">
                <div class="signature-label">Reviewed By</div>
                <div class="signature-line"></div>
                <div class="signature-label">{{ $bom->reviewedBy->name ?? '-' }}</div>
                <div class="signature-label">{{ $bom->reviewed_at?->format('d-m-Y') ?? '-' }}</div>
            </div>
            <div class="signature">
                <div class="signature-label">Approved By</div>
                <div class="signature-line"></div>
                <div class="signature-label">{{ $bom->approvedBy->name ?? '-' }}</div>
                <div class="signature-label">{{ $bom->approved_at?->format('d-m-Y') ?? '-' }}</div>
            </div>
            <div class="signature">
                <div class="signature-label">Quality Assurance</div>
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
            Page 1 of 1 | Production Module
        </div>
    </div>
</div>
@endsection

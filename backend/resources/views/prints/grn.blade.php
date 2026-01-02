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
                | Unit: {{ $grn->manufacturingUnit->name ?? 'Main Unit' }}
            </div>
        </div>
        <div class="header-right">
            <div class="report-title">{{ $title }}</div>
            <div class="report-meta">
                GRN #: {{ $grn->grn_number }}<br>
                GRN Date: {{ $grn->grn_date->format('d-m-Y') }}<br>
                Status: <span class="status {{ $grn->status }}">{{ $grn->status }}</span>
            </div>
        </div>
    </div>

    <!-- Content -->
    <div class="content">
        <!-- Supplier Information -->
        <div class="section">
            <div class="section-title">SUPPLIER DETAILS</div>
            <div class="two-columns">
                <div class="column">
                    <strong>Supplier Name:</strong> {{ $grn->purchaseOrder?->supplier?->name ?? '-' }}<br>
                    <strong>Supplier Code:</strong> {{ $grn->purchaseOrder?->supplier?->supplier_code ?? '-' }}<br>
                    <strong>PO Number:</strong> {{ $grn->purchaseOrder?->order_number ?? '-' }}
                </div>
                <div class="column">
                    <strong>PO Date:</strong> {{ $grn->purchaseOrder?->order_date?->format('d-m-Y') ?? '-' }}<br>
                    <strong>Address:</strong> {{ $grn->purchaseOrder?->supplier?->address ?? '-' }}<br>
                    <strong>Phone:</strong> {{ $grn->purchaseOrder?->supplier?->phone ?? '-' }}
                </div>
            </div>
        </div>

        <!-- GRN Information -->
        <div class="section">
            <div class="section-title">GOODS RECEIPT DETAILS</div>
            <div class="info-grid">
                <div class="info-item">
                    <span class="info-label">GRN Number:</span>
                    <span class="info-value">{{ $grn->grn_number }}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">GRN Date:</span>
                    <span class="info-value">{{ $grn->grn_date->format('d-m-Y') }}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Challan Number:</span>
                    <span class="info-value">{{ $grn->challan_number ?? '-' }}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Challan Date:</span>
                    <span class="info-value">{{ $grn->challan_date?->format('d-m-Y') ?? '-' }}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Invoice Number:</span>
                    <span class="info-value">{{ $grn->invoice_number ?? '-' }}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Invoice Date:</span>
                    <span class="info-value">{{ $grn->invoice_date?->format('d-m-Y') ?? '-' }}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Vehicle Number:</span>
                    <span class="info-value">{{ $grn->vehicle_number ?? '-' }}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Receiving Location:</span>
                    <span class="info-value">{{ $grn->warehouse?->name ?? '-' }}</span>
                </div>
            </div>
        </div>

        <!-- GRN Items -->
        <div class="section">
            <div class="section-title">RECEIVED ITEMS</div>
            <table class="table">
                <thead>
                    <tr>
                        <th width="8%">Sr. No.</th>
                        <th width="32%">Material Name</th>
                        <th width="12%" class="text-center">PO Qty</th>
                        <th width="12%" class="text-center">Received Qty</th>
                        <th width="10%" class="text-center">Unit</th>
                        <th width="12%" class="text-right">Rate</th>
                        <th width="14%" class="text-right">Amount</th>
                    </tr>
                </thead>
                <tbody>
                    @forelse($grn->items as $index => $item)
                        <tr>
                            <td>{{ $index + 1 }}</td>
                            <td>
                                <strong>{{ $item->rawMaterial->name }}</strong>
                                @if($item->rawMaterial->code)
                                <br><span class="text-sm">Code: {{ $item->rawMaterial->code }}</span>
                                @endif
                                @if($item->batch_number)
                                <br><span class="text-sm">Batch: {{ $item->batch_number }}</span>
                                @endif
                            </td>
                            <td class="text-center">{{ number_format($item->po_quantity ?? 0, 3) }}</td>
                            <td class="text-center text-bold">{{ number_format($item->received_quantity, 3) }}</td>
                            <td class="text-center">{{ $item->unit }}</td>
                            <td class="amount text-right">{{ number_format($item->unit_price, 2) }}</td>
                            <td class="amount text-right">{{ number_format($item->total_amount, 2) }}</td>
                        </tr>
                    @empty
                        <tr>
                            <td colspan="7" class="text-center">No items found</td>
                        </tr>
                    @endforelse
                </tbody>
                <tfoot>
                    <tr class="total-row">
                        <td colspan="6" class="text-right"><strong>Total Quantity:</strong></td>
                        <td class="text-center text-bold">{{ $grn->items->sum('received_quantity') }}</td>
                    </tr>
                    <tr class="total-row">
                        <td colspan="6" class="text-right"><strong>Subtotal:</strong></td>
                        <td class="amount text-right"><strong>{{ number_format($grn->total_amount, 2) }}</strong></td>
                    </tr>
                    <tr class="total-row">
                        <td colspan="6" class="text-right"><strong>Tax ({{ $grn->tax_percentage ?? 0 }}%):</strong></td>
                        <td class="amount text-right"><strong>{{ number_format($grn->tax_amount ?? 0, 2) }}</strong></td>
                    </tr>
                    <tr class="total-row">
                        <td colspan="6" class="text-right"><strong>Grand Total:</strong></td>
                        <td class="amount text-right"><strong>{{ number_format($grn->grand_total ?? $grn->total_amount, 2) }}</strong></td>
                    </tr>
                </tfoot>
            </table>
        </div>

        <!-- Quality Check -->
        <div class="section">
            <div class="section-title">QUALITY CHECK</div>
            <table class="table table-no-border">
                <tr>
                    <td width="20%"><strong>QC Status:</strong></td>
                    <td>
                        @if($grn->qc_status === 'approved')
                            <span class="status approved">APPROVED</span>
                        @elseif($grn->qc_status === 'rejected')
                            <span class="status rejected">REJECTED</span>
                        @elseif($grn->qc_status === 'pending')
                            <span class="status pending">PENDING</span>
                        @else
                            -
                        @endif
                    </td>
                </tr>
                <tr>
                    <td><strong>QC Remarks:</strong></td>
                    <td>{{ $grn->qc_remarks ?? '-' }}</td>
                </tr>
                <tr>
                    <td><strong>Inspected By:</strong></td>
                    <td>{{ $grn->qc_inspected_by?->name ?? '-' }} @if($grn->qc_inspected_at)({{ $grn->qc_inspected_at->format('d-m-Y H:i') }})@endif</td>
                </tr>
            </table>
        </div>

        <!-- Remarks -->
        @if($grn->remarks)
        <div class="section">
            <div class="section-title">REMARKS</div>
            <p>{{ $grn->remarks }}</p>
        </div>
        @endif

        <!-- Signature Section -->
        <div class="signature-section">
            <div class="signature">
                <div class="signature-label">Storekeeper</div>
                <div class="signature-line"></div>
            </div>
            <div class="signature">
                <div class="signature-label">QC Inspector</div>
                <div class="signature-line"></div>
            </div>
            <div class="signature">
                <div class="signature-label">Received By</div>
                <div class="signature-line"></div>
                <div class="signature-label">Supplier Representative</div>
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
            Page 1 of 1 | Stores & Inventory
        </div>
    </div>
</div>
@endsection

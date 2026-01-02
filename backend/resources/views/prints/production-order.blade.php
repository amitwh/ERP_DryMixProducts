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
                | Unit: {{ $order->manufacturingUnit->name }}
            </div>
        </div>
        <div class="header-right">
            <div class="report-title">{{ $title }}</div>
            <div class="report-meta">
                PO #: {{ $order->order_number }}<br>
                Order Date: {{ $order->order_date->format('d-m-Y') }}<br>
                Status: <span class="status {{ $order->status }}">{{ $order->status }}</span>
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
                    <span class="info-value">{{ $order->product->name }}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Product Code:</span>
                    <span class="info-value">{{ $order->product->code ?? '-' }}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Product Type:</span>
                    <span class="info-value">{{ $order->product->type ?? '-' }}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Batch Number:</span>
                    <span class="info-value">{{ $order->batch?->batch_number ?? '-' }}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">UOM:</span>
                    <span class="info-value">{{ $order->product->unit ?? '-' }}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Production Line:</span>
                    <span class="info-value">{{ $order->production_line ?? '-' }}</span>
                </div>
            </div>
        </div>

        <!-- Order Details -->
        <div class="section">
            <div class="section-title">ORDER DETAILS</div>
            <div class="info-grid">
                <div class="info-item">
                    <span class="info-label">Order Number:</span>
                    <span class="info-value">{{ $order->order_number }}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Order Date:</span>
                    <span class="info-value">{{ $order->order_date->format('d-m-Y') }}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Priority:</span>
                    <span class="info-value">{{ strtoupper($order->priority) }}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Sales Order:</span>
                    <span class="info-value">{{ $order->sales_order_number ?? '-' }}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Customer:</span>
                    <span class="info-value">{{ $order->customer?->name ?? '-' }}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Project:</span>
                    <span class="info-value">{{ $order->project?->name ?? '-' }}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Planned Start Date:</span>
                    <span class="info-value">{{ $order->planned_start_date?->format('d-m-Y') ?? '-' }}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Planned End Date:</span>
                    <span class="info-value">{{ $order->planned_end_date?->format('d-m-Y') ?? '-' }}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Planned Quantity:</span>
                    <span class="info-value">{{ number_format($order->planned_quantity, 2) }} {{ $order->product->unit ?? '-' }}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Manufacturing Unit:</span>
                    <span class="info-value">{{ $order->manufacturingUnit->name }}</span>
                </div>
            </div>
        </div>

        <!-- Production Schedule -->
        <div class="section">
            <div class="section-title">PRODUCTION SCHEDULE</div>
            <table class="table">
                <thead>
                    <tr>
                        <th width="30%">Stage</th>
                        <th width="20%" class="text-center">Planned Date</th>
                        <th width="20%" class="text-center">Actual Date</th>
                        <th width="30%" class="text-center">Status</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td><strong>Material Preparation</strong></td>
                        <td class="text-center">{{ $order->material_preparation_date?->format('d-m-Y') ?? '-' }}</td>
                        <td class="text-center">{{ $order->actual_material_preparation_date?->format('d-m-Y') ?? '-' }}</td>
                        <td class="text-center">
                            @if($order->material_preparation_status === 'completed')
                                <span class="status completed">COMPLETED</span>
                            @elseif($order->material_preparation_status === 'in_progress')
                                <span class="status in-progress">IN PROGRESS</span>
                            @else
                                <span class="status pending">PENDING</span>
                            @endif
                        </td>
                    </tr>
                    <tr>
                        <td><strong>Weighing & Mixing</strong></td>
                        <td class="text-center">{{ $order->mixing_date?->format('d-m-Y') ?? '-' }}</td>
                        <td class="text-center">{{ $order->actual_mixing_date?->format('d-m-Y') ?? '-' }}</td>
                        <td class="text-center">
                            @if($order->mixing_status === 'completed')
                                <span class="status completed">COMPLETED</span>
                            @elseif($order->mixing_status === 'in_progress')
                                <span class="status in-progress">IN PROGRESS</span>
                            @else
                                <span class="status pending">PENDING</span>
                            @endif
                        </td>
                    </tr>
                    <tr>
                        <td><strong>Packaging</strong></td>
                        <td class="text-center">{{ $order->packaging_date?->format('d-m-Y') ?? '-' }}</td>
                        <td class="text-center">{{ $order->actual_packaging_date?->format('d-m-Y') ?? '-' }}</td>
                        <td class="text-center">
                            @if($order->packaging_status === 'completed')
                                <span class="status completed">COMPLETED</span>
                            @elseif($order->packaging_status === 'in_progress')
                                <span class="status in-progress">IN PROGRESS</span>
                            @else
                                <span class="status pending">PENDING</span>
                            @endif
                        </td>
                    </tr>
                    <tr>
                        <td><strong>Quality Inspection</strong></td>
                        <td class="text-center">{{ $order->inspection_date?->format('d-m-Y') ?? '-' }}</td>
                        <td class="text-center">{{ $order->actual_inspection_date?->format('d-m-Y') ?? '-' }}</td>
                        <td class="text-center">
                            @if($order->inspection_status === 'approved')
                                <span class="status approved">APPROVED</span>
                            @elseif($order->inspection_status === 'rejected')
                                <span class="status rejected">REJECTED</span>
                            @elseif($order->inspection_status === 'in_progress')
                                <span class="status in-progress">IN PROGRESS</span>
                            @else
                                <span class="status pending">PENDING</span>
                            @endif
                        </td>
                    </tr>
                    <tr>
                        <td><strong>Warehousing</strong></td>
                        <td class="text-center">{{ $order->warehousing_date?->format('d-m-Y') ?? '-' }}</td>
                        <td class="text-center">{{ $order->actual_warehousing_date?->format('d-m-Y') ?? '-' }}</td>
                        <td class="text-center">
                            @if($order->warehousing_status === 'completed')
                                <span class="status completed">COMPLETED</span>
                            @elseif($order->warehousing_status === 'in_progress')
                                <span class="status in-progress">IN PROGRESS</span>
                            @else
                                <span class="status pending">PENDING</span>
                            @endif
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- BOM Information -->
        @if($order->bom)
        <div class="section">
            <div class="section-title">BILL OF MATERIALS</div>
            <div class="info-grid">
                <div class="info-item">
                    <span class="info-label">BOM Number:</span>
                    <span class="info-value">{{ $order->bom->bom_number }}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">BOM Version:</span>
                    <span class="info-value">{{ $order->bom->version }}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Base Quantity:</span>
                    <span class="info-value">{{ $order->bom->base_quantity }} {{ $order->bom->unit }}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Effective Date:</span>
                    <span class="info-value">{{ $order->bom->effective_date?->format('d-m-Y') ?? '-' }}</span>
                </div>
            </div>
        </div>
        @endif

        <!-- Batch Information -->
        @if($order->batch)
        <div class="section">
            <div class="section-title">BATCH INFORMATION</div>
            <div class="info-grid">
                <div class="info-item">
                    <span class="info-label">Batch Number:</span>
                    <span class="info-value">{{ $order->batch->batch_number }}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Batch Date:</span>
                    <span class="info-value">{{ $order->batch->batch_date?->format('d-m-Y') ?? '-' }}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Produced Quantity:</span>
                    <span class="info-value">{{ number_format($order->batch->produced_quantity, 2) }} {{ $order->batch->unit ?? '-' }}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Shift:</span>
                    <span class="info-value">{{ $order->batch->shift ?? '-' }}</span>
                </div>
            </div>
        </div>
        @endif

        <!-- Remarks -->
        @if($order->remarks)
        <div class="section">
            <div class="section-title">REMARKS</div>
            <p>{{ $order->remarks }}</p>
        </div>
        @endif

        <!-- Signature Section -->
        <div class="signature-section">
            <div class="signature">
                <div class="signature-label">Production Planner</div>
                <div class="signature-line"></div>
            </div>
            <div class="signature">
                <div class="signature-label">Production Supervisor</div>
                <div class="signature-line"></div>
            </div>
            <div class="signature">
                <div class="signature-label">Quality Manager</div>
                <div class="signature-line"></div>
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
            Page 1 of 1 | Production Module
        </div>
    </div>
</div>
@endsection

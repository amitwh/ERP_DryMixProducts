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
                As of: {{ now()->format('d-m-Y') }}<br>
                @if(isset($filters['warehouse_id']) && $filters['warehouse_id'])
                Warehouse: {{ $inventories->first()?->warehouse->name ?? '-' }}<br>
                @else
                All Warehouses<br>
                @endif
                @if(isset($filters['product_id']) && $filters['product_id'])
                Product: {{ $inventories->first()?->product->name ?? '-' }}
                @endif
            </div>
        </div>
    </div>

    <!-- Content -->
    <div class="content">
        <!-- Summary -->
        <div class="section">
            <div class="section-title">INVENTORY SUMMARY</div>
            <div class="info-grid">
                <div class="info-item">
                    <span class="info-label">Total Products:</span>
                    <span class="info-value text-bold">{{ $inventories->count() }}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Total Stock Value:</span>
                    <span class="info-value text-bold">{{ number_format($inventories->sum(function($item) { return $item->on_hand * $item->unit_cost; }), 2) }}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Total Quantity:</span>
                    <span class="info-value text-bold">{{ $inventories->sum('on_hand') }}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Warehouses:</span>
                    <span class="info-value text-bold">{{ $inventories->pluck('warehouse_id')->unique()->count() }}</span>
                </div>
            </div>
        </div>

        <!-- Stock Details -->
        <div class="section">
            <div class="section-title">STOCK DETAILS</div>
            <table class="table">
                <thead>
                    <tr>
                        <th width="8%">Sr. No.</th>
                        <th width="30%">Product Name</th>
                        <th width="15%">Warehouse</th>
                        <th width="12%" class="text-center">On Hand</th>
                        <th width="12%" class="text-center">Reserved</th>
                        <th width="12%" class="text-center">Available</th>
                        <th width="11%" class="text-right">Stock Value</th>
                    </tr>
                </thead>
                <tbody>
                    @forelse($inventories as $index => $inventory)
                        <tr>
                            <td>{{ $index + 1 }}</td>
                            <td>
                                <strong>{{ $inventory->product->name }}</strong>
                                @if($inventory->product->code)
                                <br><span class="text-sm">Code: {{ $inventory->product->code }}</span>
                                @endif
                                @if($inventory->product->type)
                                <br><span class="text-sm">Type: {{ $inventory->product->type }}</span>
                                @endif
                            </td>
                            <td>{{ $inventory->warehouse->name }}</td>
                            <td class="text-center text-bold">{{ number_format($inventory->on_hand, 2) }}</td>
                            <td class="text-center">{{ number_format($inventory->reserved ?? 0, 2) }}</td>
                            <td class="text-center text-bold">{{ number_format($inventory->available ?? $inventory->on_hand, 2) }}</td>
                            <td class="amount text-right text-bold">{{ number_format($inventory->on_hand * ($inventory->unit_cost ?? 0), 2) }}</td>
                        </tr>
                    @empty
                        <tr>
                            <td colspan="7" class="text-center">No inventory found</td>
                        </tr>
                    @endforelse
                </tbody>
                <tfoot>
                    <tr class="total-row">
                        <td colspan="6" class="text-right"><strong>Total Stock Value:</strong></td>
                        <td class="amount text-right"><strong>{{ number_format($inventories->sum(function($item) { return $item->on_hand * ($item->unit_cost ?? 0); }), 2) }}</strong></td>
                    </tr>
                </tfoot>
            </table>
        </div>

        <!-- Low Stock Items -->
        @if($inventories->where('on_hand', '<=', 10)->count() > 0)
        <div class="section">
            <div class="section-title" style="background: #FEE2E2; color: #991B1B;">LOW STOCK ITEMS</div>
            <table class="table">
                <thead>
                    <tr>
                        <th width="15%">Product</th>
                        <th width="15%">Warehouse</th>
                        <th width="15%" class="text-center">On Hand</th>
                        <th width="15%" class="text-center">Reorder Level</th>
                        <th width="20%" class="text-center">Status</th>
                        <th width="20%" class="text-right">Action Required</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($inventories->where('on_hand', '<=', 10) as $inventory)
                        <tr>
                            <td><strong>{{ $inventory->product->name }}</strong></td>
                            <td>{{ $inventory->warehouse->name }}</td>
                            <td class="text-center text-bold" style="color: #DC2626;">{{ number_format($inventory->on_hand, 2) }}</td>
                            <td class="text-center">{{ $inventory->reorder_level ?? 10 }}</td>
                            <td class="text-center">
                                @if($inventory->on_hand == 0)
                                    <span class="status fail" style="padding: 2mm 5mm;">OUT OF STOCK</span>
                                @elseif($inventory->on_hand <= 5)
                                    <span class="status" style="background: #F97316; color: white; padding: 2mm 5mm;">CRITICAL</span>
                                @else
                                    <span class="status" style="background: #FCD34D; color: #92400E; padding: 2mm 5mm;">LOW</span>
                                @endif
                            </td>
                            <td class="text-center text-bold">REORDER IMMEDIATELY</td>
                        </tr>
                    @endforeach
                </tbody>
            </table>
        </div>
        @endif

        <!-- Signature Section -->
        <div class="signature-section">
            <div class="signature">
                <div class="signature-label">Storekeeper</div>
                <div class="signature-line"></div>
            </div>
            <div class="signature">
                <div class="signature-label">Warehouse Manager</div>
                <div class="signature-line"></div>
            </div>
            <div class="signature">
                <div class="signature-label">Authorized By</div>
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

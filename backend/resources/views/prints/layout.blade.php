<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $title }}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: {{ $theme['font_family'] ?? 'Arial, sans-serif' }};
            font-size: 12px;
            line-height: 1.5;
            color: #374151;
            background: #ffffff;
        }

        .page {
            width: 210mm;
            min-height: 297mm;
            padding: 15mm;
            margin: 0 auto;
            background: #ffffff;
            position: relative;
        }

        /* Header Styles */
        .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 10mm 0;
            margin-bottom: 5mm;
            border-bottom: 2px solid {{ $theme['primary_color'] ?? '#2563EB' }};
        }

        .header-left {
            flex: 1;
        }

        .company-name {
            font-size: 20px;
            font-weight: bold;
            color: {{ $theme['primary_color'] ?? '#2563EB' }};
            margin-bottom: 5px;
        }

        .company-details {
            font-size: 10px;
            color: #6B7280;
        }

        .header-right {
            text-align: right;
        }

        .report-title {
            font-size: 24px;
            font-weight: bold;
            color: {{ $theme['secondary_color'] ?? '#7C3AED' }};
            text-transform: uppercase;
            margin-bottom: 5px;
        }

        .report-meta {
            font-size: 10px;
            color: #6B7280;
        }

        /* Content Styles */
        .content {
            padding: 10mm 0;
        }

        .section {
            margin-bottom: 10mm;
        }

        .section-title {
            font-size: 14px;
            font-weight: bold;
            color: {{ $theme['header_background'] ?? '#1E40AF' }};
            background: {{ $theme['table_header_background'] ?? '#EEF2FF' }};
            padding: 3mm 5mm;
            border-radius: 3px;
            margin-bottom: 5mm;
        }

        /* Table Styles */
        .table {
            width: 100%;
            border-collapse: collapse;
            margin: 5mm 0;
            font-size: 11px;
        }

        .table thead {
            background: {{ $theme['table_header_background'] ?? '#EEF2FF' }};
        }

        .table th {
            padding: 3mm;
            text-align: left;
            font-weight: bold;
            color: {{ $theme['header_background'] ?? '#1E40AF' }};
            border-bottom: 1px solid {{ $theme['border_color'] ?? '#E5E7EB' }};
            border-right: 1px solid {{ $theme['border_color'] ?? '#E5E7EB' }};
        }

        .table td {
            padding: 3mm;
            border-bottom: 1px solid {{ $theme['border_color'] ?? '#E5E7EB' }};
            border-right: 1px solid {{ $theme['border_color'] ?? '#E5E7EB' }};
            vertical-align: top;
        }

        .table tr:last-child td {
            border-bottom: none;
        }

        .table tbody tr:nth-child(even) {
            background: #F9FAFB;
        }

        .table tbody tr:hover {
            background: #F3F4F6;
        }

        .table-no-border td,
        .table-no-border th {
            border: none;
        }

        .text-right {
            text-align: right;
        }

        .text-center {
            text-align: center;
        }

        .text-bold {
            font-weight: bold;
        }

        .amount {
            text-align: right;
            font-family: 'Courier New', monospace;
        }

        /* Two Column Layout */
        .two-columns {
            display: flex;
            gap: 10mm;
            margin: 5mm 0;
        }

        .column {
            flex: 1;
        }

        /* Info Grid */
        .info-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 3mm;
            margin: 5mm 0;
        }

        .info-item {
            display: flex;
            margin-bottom: 2mm;
        }

        .info-label {
            font-weight: bold;
            color: #6B7280;
            min-width: 100px;
        }

        .info-value {
            color: #111827;
        }

        /* Status Badges */
        .status {
            display: inline-block;
            padding: 2mm 4mm;
            border-radius: 3px;
            font-size: 10px;
            font-weight: bold;
            text-transform: uppercase;
        }

        .status.pending {
            background: #FEF3C7;
            color: #92400E;
        }

        .status.in-progress {
            background: #DBEAFE;
            color: #1E40AF;
        }

        .status.completed {
            background: #D1FAE5;
            color: #065F46;
        }

        .status.approved {
            background: #10B981;
            color: #FFFFFF;
        }

        .status.rejected {
            background: #FEE2E2;
            color: #991B1B;
        }

        .status.cancelled {
            background: #9CA3AF;
            color: #FFFFFF;
        }

        .status.pass {
            background: #D1FAE5;
            color: #065F46;
        }

        .status.fail {
            background: #FEE2E2;
            color: #991B1B;
        }

        /* Footer Styles */
        .footer {
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            padding: 5mm 15mm;
            background: {{ $theme['footer_background'] ?? '#F3F4F6' }};
            border-top: 1px solid {{ $theme['border_color'] ?? '#E5E7EB' }};
            font-size: 10px;
            color: #6B7280;
            display: flex;
            justify-content: space-between;
        }

        .footer-left {
            flex: 1;
        }

        .footer-right {
            text-align: right;
        }

        /* Signature Section */
        .signature-section {
            display: flex;
            justify-content: space-between;
            margin-top: 15mm;
            padding-top: 5mm;
        }

        .signature {
            width: 30%;
            text-align: center;
        }

        .signature-line {
            border-bottom: 1px solid {{ $theme['border_color'] ?? '#E5E7EB' }};
            margin-top: 10mm;
            padding-bottom: 2mm;
        }

        .signature-label {
            font-size: 10px;
            color: #6B7280;
        }

        /* Total Row */
        .total-row {
            background: {{ $theme['table_header_background'] ?? '#EEF2FF' }} !important;
            font-weight: bold;
        }

        .total-row td {
            border-top: 2px solid {{ $theme['primary_color'] ?? '#2563EB' }} !important;
        }

        /* Page Break */
        .page-break {
            page-break-before: always;
        }

        @media print {
            .page {
                width: 210mm;
                min-height: 297mm;
                padding: 15mm;
                margin: 0;
            }

            body {
                background: #ffffff;
            }
        }
    </style>
</head>
<body>
    @yield('content')
</body>
</html>

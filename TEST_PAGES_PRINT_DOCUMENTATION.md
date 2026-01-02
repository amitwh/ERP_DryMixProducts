# Test Pages & Print/Export Documentation

## Overview

This document describes the Test Pages and Print/Export functionality added to the ERP DryMix Products system.

---

## Test Pages Module

### 1. Dry Mix Product Tests

Individual test page for finished goods (dry mix products) with comprehensive quality parameters.

#### Test Parameters

**Mechanical Properties:**
- Compressive Strength at 1, 3, 7, and 28 days
- Flexural Strength (N/mm² or MPa)
- Adhesion Strength (N/mm² or MPa)

**Setting Times:**
- Initial Setting Time (minutes)
- Final Setting Time (minutes)

**Physical Properties:**
- Water Demand (%)
- Water Retention (%)
- Flow Diameter (mm)
- Bulk Density (kg/m³)
- Air Content (%)
- Shelf Life (months)

**Appearance:**
- Color
- Texture
- Appearance Notes

#### Database Table: `dry_mix_product_tests`

```php
// Key Fields
- organization_id
- manufacturing_unit_id
- product_id
- batch_id
- test_number
- test_date
- sample_id

// Test Result Fields
- compressive_strength_1_day
- compressive_strength_3_day
- compressive_strength_7_day
- compressive_strength_28_day
- flexural_strength
- adhesion_strength
- setting_time_initial
- setting_time_final
- water_demand
- water_retention
- flow_diameter
- bulk_density
- air_content
- shelf_life
- color
- texture
- appearance_notes
- test_result (pass, fail, marginal)
- status (pending, in_progress, completed)
- remarks
- recommendations
- meets_standard
- standard_reference
- standard_limits (JSON)
```

#### Workflow

1. **Create Test**: Generate test number, assign product and batch
2. **Enter Parameters**: Fill in all test measurements
3. **Calculate Result**: System calculates pass/fail based on standard limits
4. **Test Completion**: Mark as tested by lab technician
5. **Verification**: QA officer verifies results
6. **Approval**: Final approval by quality manager

---

### 2. Raw Material Tests

Individual test page for raw materials (ingredients) with chemical and physical analysis.

#### Test Parameters

**Chemical Analysis:**
- Silicon Dioxide (SiO₂) - %
- Aluminum Oxide (Al₂O₃) - %
- Iron Oxide (Fe₂O₃) - %
- Calcium Oxide (CaO) - %
- Magnesium Oxide (MgO) - %
- Sulfur Trioxide (SO₃) - %
- Potassium Oxide (K₂O) - %
- Sodium Oxide (Na₂O) - %
- Chloride (Cl) - %

**Physical Properties:**
- Moisture Content - %
- Loss on Ignition (LOI) - %
- Specific Gravity
- Bulk Density - kg/m³

**Particle Size Analysis:**
- Particle Size (D50) - µm
- Particle Size (D90) - µm
- Particle Size (D98) - µm
- Blaine Fineness - m²/kg

**Functional Properties:**
- Water Reducer - %
- Retention Aid - %
- Defoamer - %

**Polymer Properties:**
- Solid Content - %
- Viscosity - mPa·s
- pH Value
- Minimum Film Forming Temperature - °C

**Aggregate Properties:**
- Fineness Modulus
- Water Absorption - %
- Silt Content - %
- Organic Impurities - %

#### Database Table: `raw_material_tests`

```php
// Key Fields
- organization_id
- manufacturing_unit_id
- raw_material_id
- supplier_batch_id
- test_number
- test_date
- sample_id

// Chemical Analysis Fields
- sio2, al2o3, fe2o3, cao, mgo, so3, k2o, na2o, cl

// Physical Properties Fields
- moisture_content
- loss_on_ignition
- specific_gravity
- bulk_density

// Particle Size Fields
- particle_size_d50
- particle_size_d90
- particle_size_d98
- blaine_fineness

// Additional Properties (based on material type)
- water_reducer
- retention_aid
- defoamer
- solid_content
- viscosity
- ph_value
- minimum_film_forming_temperature
- fineness_modulus
- water_absorption
- silt_content
- organic_impurities

// Result Fields
- test_result (pass, fail, marginal)
- status
- remarks
- recommendations
- meets_standard
- standard_reference
- standard_limits (JSON)
```

---

### 3. Test Parameters Configuration

Centralized configuration for test parameters, standards, and templates.

#### Database Tables

**`test_parameters`**: Parameter definitions
- Parameter code, name, category
- Unit of measurement
- Min/max values, target values
- Mandatory flag
- Display order
- Active status

**`test_standards`**: Quality standards
- Standard code (IS:1542, ASTM C618, EN 197)
- Standard name
- Issuing body (IS, ASTM, EN, JIS)
- Test type (dry_mix_product, raw_material)
- Effective date
- Current version flag

**`test_templates`**: Test templates
- Template code and name
- Test type (dry_mix_product, raw_material)
- Product association
- Selected parameters array
- Parameter limits (JSON)
- Instructions
- Standard reference
- Default flag

---

## Print/Export Module

### Features

Comprehensive PDF printing and export functionality for all major reports with:
- Professional theming and styling
- Company branding and logo
- Standard A4 page layout
- Print-optimized CSS
- Proper headers and footers
- Table formatting
- Status badges
- Signature sections
- Page numbers

### Print Reports Available

#### 1. Sales Reports
- Sales Order
- Tax Invoice
- Customer Ledger

#### 2. Procurement Reports
- Purchase Order
- Goods Receipt Note (GRN)

#### 3. Production Reports
- Production Order
- Bill of Materials (BOM)
- Production Batch Report

#### 4. Quality Reports
- Inspection Report
- Non-Conformance Report (NCR)
- Dry Mix Product Test Report
- Raw Material Test Report

#### 5. Finance Reports
- Trial Balance
- Balance Sheet
- Profit & Loss Statement

#### 6. Credit Control Reports
- Credit Control Report
- Collection Report
- Aging Report

#### 7. HR Reports
- Payslip
- Attendance Report

#### 8. Inventory Reports
- Stock Report
- Warehouse Report

---

### Print Views

All print views follow a consistent structure with theming support.

#### Master Layout: `prints/layout.blade.php`

**Theme Configuration:**
```php
$theme = [
    'primary_color' => '#2563EB',      // Blue-600
    'secondary_color' => '#7C3AED',    // Violet-600
    'header_background' => '#1E40AF',   // Blue-800
    'header_text' => '#FFFFFF',
    'footer_background' => '#F3F4F6',   // Gray-100
    'table_header_background' => '#EEF2FF', // Blue-50
    'border_color' => '#E5E7EB',       // Gray-200
    'font_family' => 'Arial, sans-serif',
]
```

**Components:**
- **Header**: Company name, address, contact, report title, metadata
- **Content**: Report-specific sections, tables, info grids
- **Footer**: Generation timestamp, page numbers, branding
- **Signature Section**: Signature lines with labels (3-4 signatories)

**CSS Classes:**
- `.page`: A4 page container (210mm x 297mm)
- `.table`: Styled tables with headers and borders
- `.section`: Content section with title
- `.section-title`: Section heading with background color
- `.status`: Status badges with colors
- `.signature`: Signature container
- `.amount`: Right-aligned monetary values
- `.total-row`: Bold totals with top border

---

### Print View Files

1. **`layout.blade.php`** - Master print layout
2. **`sales-order.blade.php`** - Sales order print
3. **`invoice.blade.php`** - Tax invoice print
4. **`inspection.blade.php`** - Quality inspection report
5. **`dry-mix-product-test.blade.php`** - Product test report
6. **`raw-material-test.blade.php`** - Material test report

Additional views can be created following the same pattern:
- `purchase-order.blade.php`
- `grn.blade.php`
- `production-order.blade.php`
- `bom.blade.php`
- `ncr.blade.php`
- `customer-ledger.blade.php`
- `stock-report.blade.php`
- `credit-control.blade.php`
- `collection.blade.php`
- `aging-report.blade.php`
- `payslip.blade.php`
- `attendance-report.blade.php`
- `trial-balance.blade.php`
- `balance-sheet.blade.php`
- `profit-loss.blade.php`

---

## API Endpoints

### Test Pages

```
GET    /api/v1/test-parameters
POST   /api/v1/test-parameters
GET    /api/v1/test-parameters/{parameter}
PUT    /api/v1/test-parameters/{parameter}
DELETE /api/v1/test-parameters/{parameter}

GET    /api/v1/test-standards
POST   /api/v1/test-standards
GET    /api/v1/test-standards/{standard}
PUT    /api/v1/test-standards/{standard}
DELETE /api/v1/test-standards/{standard}

GET    /api/v1/test-templates
POST   /api/v1/test-templates
GET    /api/v1/test-templates/{template}
PUT    /api/v1/test-templates/{template}
DELETE /api/v1/test-templates/{template}

GET    /api/v1/dry-mix-product-tests
POST   /api/v1/dry-mix-product-tests
GET    /api/v1/dry-mix-product-tests/{test}
PUT    /api/v1/dry-mix-product-tests/{test}
DELETE /api/v1/dry-mix-product-tests/{test}
POST   /api/v1/dry-mix-product-tests/{test}/test
POST   /api/v1/dry-mix-product-tests/{test}/verify
POST   /api/v1/dry-mix-product-tests/{test}/approve

GET    /api/v1/raw-material-tests
POST   /api/v1/raw-material-tests
GET    /api/v1/raw-material-tests/{test}
PUT    /api/v1/raw-material-tests/{test}
DELETE /api/v1/raw-material-tests/{test}
POST   /api/v1/raw-material-tests/{test}/test
POST   /api/v1/raw-material-tests/{test}/verify
POST   /api/v1/raw-material-tests/{test}/approve
```

### Print/Export

All print endpoints return PDF downloads:

```
GET /api/v1/print/sales-order/{order}
GET /api/v1/print/invoice/{invoice}
GET /api/v1/print/purchase-order/{order}
GET /api/v1/print/grn/{grn}
GET /api/v1/print/production-order/{order}
GET /api/v1/print/bom?bom_id={id}
GET /api/v1/print/inspection/{inspection}
GET /api/v1/print/ncr/{ncr}
GET /api/v1/print/customer-ledger?customer_id={id}
GET /api/v1/print/stock-report?organization_id={id}
GET /api/v1/print/credit-control/{creditControl}
GET /api/v1/print/collection/{collection}
GET /api/v1/print/aging-report?organization_id={id}
GET /api/v1/print/payslip/{payslip}
GET /api/v1/print/attendance-report?organization_id={id}
GET /api/v1/print/dry-mix-product-test/{test}
GET /api/v1/print/raw-material-test/{test}
GET /api/v1/print/trial-balance?organization_id={id}
GET /api/v1/print/balance-sheet?organization_id={id}
GET /api/v1/print/profit-loss?organization_id={id}
```

---

## Usage Examples

### Creating a Dry Mix Product Test

```javascript
// POST /api/v1/dry-mix-product-tests
{
  "organization_id": 1,
  "manufacturing_unit_id": 1,
  "product_id": 5,
  "batch_id": 123,
  "test_number": "DMT-2024-001",
  "test_date": "2024-01-15",
  "sample_id": "SMP-001",
  
  "compressive_strength_1_day": 8.5,
  "compressive_strength_3_day": 15.2,
  "compressive_strength_7_day": 22.8,
  "compressive_strength_28_day": 35.5,
  
  "setting_time_initial": 45,
  "setting_time_final": 180,
  
  "flow_diameter": 180,
  "bulk_density": 1650,
  
  "standard_reference": "IS:1542",
  "standard_limits": {
    "compressive_strength_28_day": { "min": 30 },
    "setting_time_initial": { "min": 30, "max": 60 },
    "flow_diameter": { "min": 160, "max": 200 }
  },
  
  "created_by": 1
}
```

### Printing a Test Report

```bash
# Download PDF
curl -X GET http://localhost:8101/api/v1/print/dry-mix-product-test/123 \
  -H "Authorization: Bearer {token}" \
  -o test-report.pdf
```

### Filtering Test Reports

```javascript
// GET /api/v1/dry-mix-product-tests?product_id=5&start_date=2024-01-01
// Response: Paginated list of tests
```

---

## Frontend Integration

### Print Button Component (React)

```typescript
import axios from 'axios';

const PrintButton = ({ type, id, filename }: PrintButtonProps) => {
  const handlePrint = async () => {
    try {
      const response = await axios.get(
        `/api/v1/print/${type}/${id}`,
        {
          responseType: 'blob',
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        }
      );
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${filename}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Print error:', error);
    }
  };

  return (
    <button
      onClick={handlePrint}
      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
    >
      <Printer size={16} />
      Print Report
    </button>
  );
};

// Usage
<PrintButton 
  type="dry-mix-product-test" 
  id={testId} 
  filename={`Product-Test-${testNumber}`} 
/>
```

---

## Configuration

### DomPDF Configuration

```php
// config/dompdf.php
return [
    'options' => [
        'defaultFont' => 'Arial',
        'isHtml5ParserEnabled' => true,
        'isRemoteEnabled' => true,
        'isFontSubsettingEnabled' => true,
        'chroot' => base_path('public'),
    ],
];
```

### Print Theme Configuration

Themes can be customized per organization in system settings:

```php
// Retrieve theme for organization
$theme = $this->getPrintTheme($organizationId);
```

Supported theme colors:
- `primary_color`: Main theme color
- `secondary_color`: Accent color
- `header_background`: Header background
- `header_text`: Header text color
- `footer_background`: Footer background
- `table_header_background`: Table header background
- `border_color`: Border color
- `font_family`: Font family

---

## Best Practices

1. **Test Creation**: Always create test from approved batch or sample
2. **Standard Limits**: Reference appropriate standards (IS, ASTM, EN)
3. **Parameter Validation**: Ensure all mandatory parameters are filled
4. **Result Calculation**: Let system calculate pass/fail based on standards
5. **Verification**: Always have QA officer verify lab results
6. **Printing**: Use print endpoints for official documents
7. **Theming**: Maintain consistent theme across organization
8. **PDF Naming**: Use meaningful filenames with document numbers
9. **Approval**: Follow proper approval workflow before releasing documents
10. **Archiving**: Store printed PDFs in document management system

---

## Future Enhancements

1. **Barcode/QR Code**: Add barcodes to test reports
2. **Digital Signatures**: Implement digital signature verification
3. **Email Integration**: Send PDF reports via email automatically
4. **Batch Printing**: Print multiple documents in single request
5. **Custom Templates**: Allow users to create custom print templates
6. **Watermarks**: Add watermarks (Draft, Confidential, etc.)
7. **Multi-language**: Support multiple languages for reports
8. **Excel Export**: Add Excel export option alongside PDF
9. **Report Scheduling**: Auto-generate and email scheduled reports
10. **Print History**: Track all printed documents

---

## Troubleshooting

### PDF Not Generating
- Check DomPDF is installed: `composer show barryvdh/laravel-dompdf`
- Verify view file exists
- Check data passed to view
- Review error logs

### Print Layout Issues
- Verify CSS classes are applied
- Check theme configuration
- Test in browser print preview
- Adjust CSS as needed

### Missing Data in Report
- Verify model relationships
- Check eager loading (`with()`)
- Validate database records
- Review controller logic

---

**Last Updated**: January 2, 2026
**Version**: 1.0
**Module**: Test Pages & Print/Export

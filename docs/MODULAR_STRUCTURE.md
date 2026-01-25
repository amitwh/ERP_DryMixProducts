# ERP DryMix Products - Comprehensive Modular Structure

## System Overview

**ERP DryMix Products** is a comprehensive Enterprise Resource Planning system designed specifically for the cementitious dry mix manufacturing industry. Built with a modern tech stack featuring Laravel 10+ backend and React 18+ frontend, it provides complete business process automation with advanced geolocation and geotagging capabilities.

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           PRESENTATION LAYER                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │  React 18 + TypeScript + Vite                                           ││
│  │  ├── TailwindCSS (Styling)                                              ││
│  │  ├── React Router v6 (Navigation)                                       ││
│  │  ├── React Query v5 (Data Fetching)                                     ││
│  │  ├── React Hook Form + Zod (Forms/Validation)                           ││
│  │  ├── TanStack Table v8 (Data Tables)                                    ││
│  │  └── Recharts (Data Visualization)                                      ││
│  └─────────────────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              API LAYER                                       │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │  Nginx Reverse Proxy (Port 8100)                                        ││
│  │  ├── SSL Termination                                                    ││
│  │  ├── Load Balancing                                                     ││
│  │  └── Static File Serving                                                ││
│  └─────────────────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           APPLICATION LAYER                                  │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │  Laravel 10+ (Port 8101)                                                ││
│  │  ├── Sanctum Authentication                                             ││
│  │  ├── 39 API Controllers                                                 ││
│  │  ├── 94 Eloquent Models                                                 ││
│  │  ├── 11 Middleware Classes                                              ││
│  │  └── 69 Database Migrations                                             ││
│  └─────────────────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                        ┌─────────────┼─────────────┐
                        ▼             ▼             ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│  DATA LAYER     │ │  CACHE LAYER    │ │  QUEUE LAYER    │
│  ┌───────────┐  │ │  ┌───────────┐  │ │  ┌───────────┐  │
│  │ MariaDB   │  │ │  │ Redis 7+  │  │ │  │ Redis     │  │
│  │ 10.11+    │  │ │  │           │  │ │  │ Queue     │  │
│  │           │  │ │  │ Sessions  │  │ │  │ Worker    │  │
│  │ PostGIS   │  │ │  │ Cache     │  │ │  │           │  │
│  │ Optional  │  │ │  │           │  │ │  │           │  │
│  └───────────┘  │ └───────────────┘ │ └───────────────┘ │
└─────────────────┘
```

---

## Technology Stack

### Backend Stack
| Component | Technology | Version |
|-----------|-----------|---------|
| Framework | Laravel | 10.x |
| Language | PHP | 8.1+ |
| Authentication | Sanctum | Token-based |
| Database | MariaDB / PostgreSQL | 10.11+ / 15+ |
| Cache | Redis | 7+ |
| Queue | Redis Queue | - |
| Spatial | MariaDB Spatial / PostGIS | SRID 4326 |

### Frontend Stack
| Component | Technology | Version |
|-----------|-----------|---------|
| Framework | React | 18.2+ |
| Language | TypeScript | 5.x |
| Build Tool | Vite | 5+ |
| Styling | TailwindCSS | 3.3+ |
| Router | React Router | v6 |
| State | React Query | v5 |
| Forms | React Hook Form + Zod | - |
| Tables | TanStack Table | v8 |
| Charts | Recharts | - |
| Icons | Lucide React | - |

### Infrastructure
| Component | Technology |
|-----------|-----------|
| Container | Docker + Docker Compose |
| Web Server | Nginx |
| Mail | MailHog (dev) / SMTP (prod) |
| Monitoring | Sentry + Google Analytics |

---

## Module Structure (21 Modules)

### 1. Core Foundation Modules

#### 1.1 User & Access Management
```
backend/
├── app/Http/Controllers/Api/
│   ├── AuthController.php          # Login, logout, register, token management
│   ├── UserController.php          # User CRUD, profile management
│   └── RoleController.php          # Role & permission management
├── app/Models/
│   ├── User.php                    # User model with Sanctum
│   ├── Role.php                    # Role model
│   ├── Permission.php              # Permission model
│   └── PersonalAccessToken.php     # Token management
└── app/Middleware/
    ├── Authenticate.php            # Auth middleware
    ├── OrganizationContext.php     # Multi-org context
    └── CheckPermission.php         # Permission validation

frontend/src/
├── pages/auth/
│   ├── LoginPage.tsx               # Login form
│   └── RegisterPage.tsx            # Registration
├── pages/system/
│   ├── UsersPage.tsx               # User list
│   ├── UserDetailPage.tsx          # User details
│   ├── CreateUserPage.tsx          # Create user
│   ├── RolesPage.tsx               # Role management
│   ├── RoleDetailPage.tsx          # Role details
│   └── PermissionManagementPage.tsx # Permissions
└── services/
    └── auth.service.ts             # Auth API calls
```

#### 1.2 Dashboard & Analytics
```
backend/
├── app/Http/Controllers/Api/
│   ├── DashboardController.php     # Dashboard data aggregation
│   └── KpiController.php           # KPI calculations
└── app/Models/
    └── (uses aggregated data from other models)

frontend/src/
├── pages/
│   ├── DashboardPage.tsx           # Main dashboard
│   └── analytics/
│       └── AnalyticsPage.tsx       # Advanced analytics
└── components/
    ├── KPICard.tsx                 # KPI display widget
    ├── SalesTrendChart.tsx         # Sales visualization
    └── TopCustomersTable.tsx       # Top customers list
```

#### 1.3 Organization Management
```
backend/
├── app/Http/Controllers/Api/
│   ├── OrganizationController.php  # Organization CRUD
│   └── ManufacturingUnitController.php # Unit management
└── app/Models/
    ├── Organization.php            # Organization model (with location POINT)
    └── ManufacturingUnit.php       # Unit model (with boundary POLYGON)

frontend/src/
├── pages/system/
│   ├── OrganizationsPage.tsx       # Organization list
│   └── OrganizationDetailPage.tsx  # Org details
└── services/
    └── organization.service.ts     # Org API calls
```

---

### 2. Sales & Customer Management

#### 2.1 Customer Module
```
backend/
├── app/Http/Controllers/Api/
│   └── CustomerController.php      # Customer CRUD with geolocation
└── app/Models/
    └── Customer.php                # Customer model (with location POINT)

frontend/src/
├── pages/customers/
│   ├── CustomersListPage.tsx       # Customer list
│   └── CreateCustomerPage.tsx      # Create customer
└── services/
    └── customers.service.ts        # Customer API
```

#### 2.2 Sales Orders
```
backend/
├── app/Http/Controllers/Api/
│   └── SalesOrderController.php    # SO CRUD, status management
└── app/Models/
    ├── SalesOrder.php              # Order header (with delivery_location POINT)
    └── SalesOrderItem.php          # Order line items

frontend/src/
├── pages/sales/
│   ├── SalesOrdersPage.tsx         # Order list
│   ├── SalesOrdersListPage.tsx     # Alternative list view
│   ├── SalesOrderDetailPage.tsx    # Order details
│   └── CreateSalesOrderPage.tsx    # Create order
└── services/
    └── sales.service.ts            # Sales API
```

#### 2.3 Invoicing
```
backend/
├── app/Http/Controllers/Api/
│   └── InvoiceController.php       # Invoice generation, payment tracking
└── app/Models/
    └── Invoice.php                 # Invoice model

frontend/src/
├── pages/sales/
│   ├── InvoicesPage.tsx            # Invoice list
│   └── CreateInvoicePage.tsx       # Create invoice
└── services/
    └── invoices.service.ts         # Invoice API
```

#### 2.4 Projects (Construction Sites)
```
backend/
├── app/Http/Controllers/Api/
│   └── ProjectController.php       # Project CRUD with geofencing
└── app/Models/
    └── Project.php                 # Project model (with site_location, site_boundary)

frontend/src/
├── pages/sales/
│   ├── ProjectsPage.tsx            # Project list
│   ├── ProjectDetailPage.tsx       # Project details
│   └── CreateProjectPage.tsx       # Create project
└── services/
    └── projects.service.ts         # Project API
```

---

### 3. Procurement Module

```
backend/
├── app/Http/Controllers/Api/
│   ├── SupplierController.php      # Supplier management
│   ├── PurchaseOrderController.php # PO management
│   └── GoodsReceiptNoteController.php # GRN processing
└── app/Models/
    ├── Supplier.php                # Supplier (with location POINT)
    ├── PurchaseOrder.php           # PO header
    ├── PurchaseOrderItem.php       # PO line items
    └── GoodsReceiptNote.php        # GRN model

frontend/src/
├── pages/procurement/
│   ├── SuppliersPage.tsx           # Supplier list
│   ├── CreateSupplierPage.tsx      # Create supplier
│   ├── PurchaseOrdersPage.tsx      # PO list
│   ├── PurchaseOrderDetailPage.tsx # PO details
│   ├── CreatePurchaseOrderPage.tsx # Create PO
│   ├── RequestsPage.tsx            # Purchase requests
│   └── ApprovalsPage.tsx           # PO approvals
├── pages/suppliers/
│   └── SuppliersListPage.tsx       # Alternative supplier view
└── services/
    └── procurement.service.ts      # Procurement API
```

---

### 4. Inventory Module

```
backend/
├── app/Http/Controllers/Api/
│   ├── InventoryController.php     # Stock management
│   └── StockTransactionController.php # Stock movements
└── app/Models/
    ├── Warehouse.php               # Warehouse (with location POINT)
    ├── Inventory.php               # Stock levels
    └── StockTransaction.php        # Stock movements

frontend/src/
├── pages/inventory/
│   ├── InventoryPage.tsx           # Stock overview
│   ├── InventoryStockPage.tsx      # Stock levels
│   ├── InventoryMovementsPage.tsx  # Movement history
│   ├── StockMovementsPage.tsx      # Alternative view
│   ├── StockDetailPage.tsx         # Item details
│   ├── CreateStockTransferPage.tsx # Inter-warehouse transfer
│   ├── AdjustmentsPage.tsx         # Stock adjustments
│   └── WarehousePage.tsx           # Warehouse management
└── services/
    └── inventory.service.ts        # Inventory API
```

---

### 5. Production Module

```
backend/
├── app/Http/Controllers/Api/
│   ├── ProductionOrderController.php # Production order management
│   └── BillOfMaterialController.php  # BOM management
└── app/Models/
    ├── ProductionOrder.php         # Production order
    ├── ProductionBatch.php         # Production batch
    ├── BillOfMaterial.php          # BOM header
    └── BomItem.php                 # BOM components

frontend/src/
├── pages/production/
│   ├── ProductionOrdersPage.tsx    # Order list
│   ├── ProductionOrderDetailPage.tsx # Order details
│   ├── CreateProductionOrderPage.tsx # Create order
│   ├── ProductionBatchesPage.tsx   # Batch management
│   ├── ProductionBatchDetailPage.tsx # Batch details
│   ├── WorkstationsPage.tsx        # Workstation management
│   └── ProductionReportsPage.tsx   # Production reports
└── services/
    └── production.service.ts       # Production API
```

---

### 6. Quality Control Module

```
backend/
├── app/Http/Controllers/Api/
│   ├── InspectionController.php    # Quality inspections
│   ├── NcrController.php           # Non-conformance reports
│   └── QualityDocumentController.php # Quality documents
└── app/Models/
    ├── Inspection.php              # Inspection (with location POINT)
    ├── Ncr.php                     # NCR model
    ├── DryMixProductTest.php       # Product test results
    ├── RawMaterialTest.php         # Material test results
    └── QualityDocument.php         # Quality documents

frontend/src/
├── pages/qa-qc/
│   ├── InspectionsPage.tsx         # Inspection list
│   ├── CreateInspectionPage.tsx    # Create inspection
│   ├── QualityTestsPage.tsx        # Test management
│   ├── NCRsPage.tsx                # NCR list
│   ├── CertificatesPage.tsx        # Quality certificates
│   └── QualityReportsPage.tsx      # Quality reports
├── pages/quality/
│   ├── QualityInspectionsPage.tsx  # Alternative view
│   ├── InspectionDetailPage.tsx    # Inspection details
│   ├── NCRDetailPage.tsx           # NCR details
│   ├── CreateDryMixTestPage.tsx    # Create product test
│   └── CreateRawMaterialTestPage.tsx # Create material test
└── services/
    └── quality.service.ts          # Quality API
```

---

### 7. Finance Module

```
backend/
├── app/Http/Controllers/Api/
│   └── FinanceController.php       # Financial operations
└── app/Models/
    ├── ChartOfAccount.php          # COA
    ├── FiscalYear.php              # Fiscal periods
    ├── JournalVoucher.php          # Journal vouchers
    ├── JournalEntry.php            # Journal entries
    └── Ledger.php                  # Ledger entries

frontend/src/
├── pages/finance/
│   ├── FinanceDashboardPage.tsx    # Finance overview
│   ├── ChartOfAccountsPage.tsx     # COA management
│   ├── FiscalYearsPage.tsx         # Fiscal year management
│   ├── JournalVouchersPage.tsx     # Voucher management
│   ├── LedgerViewPage.tsx          # Ledger view
│   ├── BalanceSheetPage.tsx        # Balance sheet report
│   ├── ProfitLossPage.tsx          # P&L report
│   ├── TrialBalancePage.tsx        # Trial balance
│   └── FinancialReportsPage.tsx    # Custom reports
└── services/
    └── finance.service.ts          # Finance API
```

---

### 8. HR & Payroll Module

```
backend/
├── app/Http/Controllers/Api/
│   └── HRController.php            # HR & Payroll operations
└── app/Models/
    ├── Employee.php                # Employee model
    ├── Department.php              # Department
    ├── Designation.php             # Designation/Grade
    ├── Attendance.php              # Attendance (with check_in/out_location POINT)
    ├── LeaveType.php               # Leave types
    ├── LeaveRequest.php            # Leave requests
    ├── PayrollPeriod.php           # Payroll periods
    └── Payslip.php                 # Payslips

frontend/src/
├── pages/hr-payroll/
│   ├── EmployeesPage.tsx           # Employee list
│   ├── EmployeeDetailPage.tsx      # Employee details
│   ├── AttendancePage.tsx          # Attendance tracking
│   ├── LeaveManagementPage.tsx     # Leave management
│   ├── PayrollProcessingPage.tsx   # Payroll processing
│   └── PayslipDetailPage.tsx       # Payslip details
└── services/
    └── hr.service.ts               # HR API
```

---

### 9. Planning Module

```
backend/
├── app/Http/Controllers/Api/
│   └── PlanningController.php      # Planning operations
└── app/Models/
    ├── ProductionPlan.php          # Production plans
    ├── ProductionPlanItem.php      # Plan items
    └── DemandForecast.php          # Demand forecasts

frontend/src/
├── pages/planning/
│   ├── ProductionPlansPage.tsx     # Plan list
│   ├── ProductionPlanDetailPage.tsx # Plan details
│   ├── DemandForecastPage.tsx      # Forecasting
│   ├── CapacityPlanningPage.tsx    # Capacity planning
│   └── MRPPage.tsx                 # Material requirements
└── services/
    └── planning.service.ts         # Planning API
```

---

### 10. Geolocation & Tracking Module

```
backend/
├── app/Http/Controllers/Api/
│   └── GeolocationController.php   # 40+ geolocation endpoints
└── app/Models/
    ├── GeoTag.php                  # Geotag (polymorphic, with location POINT)
    ├── DeliveryTracking.php        # Delivery tracking (POINT, LINESTRING)
    ├── DeliveryWaypoint.php        # Delivery waypoints
    ├── LocationHistory.php         # Location audit trail
    └── SiteInspection.php          # GPS-verified inspections

frontend/src/
├── pages/geolocation/
│   ├── DeliveryTrackingPage.tsx    # Real-time delivery tracking (353 lines)
│   ├── SiteInspectionsPage.tsx     # Inspection history (351 lines)
│   ├── CreateSiteInspectionPage.tsx # GPS-verified inspection (395 lines)
│   └── GeoTagsPage.tsx             # Geotag management (464 lines)
├── services/
│   └── geolocation.service.ts      # Geolocation utilities (675 lines)
│       ├── getCurrentPosition()    # Get device location
│       ├── watchPosition()         # Real-time tracking
│       ├── calculateDistance()     # Haversine distance
│       ├── isPointInPolygon()      # Polygon containment
│       ├── isPointInRadius()       # Radius check
│       └── formatDistance()        # Distance formatting
└── hooks/
    └── useGeolocation.ts           # Geolocation React hooks
```

**Geolocation API Endpoints:**
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/geo/geocode` | POST | Address to coordinates |
| `/geo/reverse-geocode` | POST | Coordinates to address |
| `/geo/route` | POST | Route calculation (OSRM) |
| `/geo/location-history` | GET/POST | Location audit trail |
| `/delivery-tracking` | CRUD | Delivery management |
| `/delivery-tracking/{id}/location` | POST | Update current location |
| `/site-inspections` | CRUD | Site inspection CRUD |
| `/projects/{id}/validate-location` | POST | Geofence validation |
| `/geotags` | CRUD | Geotag management |
| `/geotags/nearby` | GET | Nearby search |
| `/geo/checkGeofence` | POST | Point-in-radius check |
| `/geo/getEntitiesInRadius` | POST | Spatial search |

---

### 11. Communication Module

```
backend/
├── app/Http/Controllers/Api/
│   └── CommunicationController.php # SMS, Email, WhatsApp
└── app/Models/
    ├── CommunicationTemplate.php   # Message templates
    └── CommunicationLog.php        # Communication history

frontend/src/
├── pages/communication/
│   ├── TemplatesPage.tsx           # Template list
│   ├── TemplateEditorPage.tsx      # Template editor
│   ├── SMSComposePage.tsx          # Compose SMS
│   ├── WhatsAppComposePage.tsx     # Compose WhatsApp
│   └── CommunicationLogsPage.tsx   # Communication history
└── services/
    └── communication.service.ts    # Communication API
```

---

### 12. Credit Control Module

```
backend/
├── app/Http/Controllers/Api/
│   ├── CreditControlController.php # Credit limit management
│   └── CollectionController.php    # Payment collections
└── app/Models/
    ├── CreditControl.php           # Credit limits & risk
    └── Collection.php              # Collections

frontend/src/
├── pages/credit-control/
│   ├── CreditCustomersPage.tsx     # Customer credit overview
│   └── CreditLimitsPage.tsx        # Credit limit management
└── services/
    └── creditControl.service.ts    # Credit API
```

---

### 13. Document Management

```
backend/
├── app/Http/Controllers/Api/
│   └── DocumentManagementController.php # Document CRUD
└── app/Models/
    └── Document.php                # Document model

frontend/src/
├── pages/documents/
│   ├── DocumentsPage.tsx           # Document browser
│   └── UploadDocumentPage.tsx      # Upload documents
└── services/
    └── documents.service.ts        # Document API
```

---

### 14. System Administration

```
backend/
├── app/Http/Controllers/Api/
│   ├── SystemAdminController.php   # System administration
│   ├── SystemSettingsController.php # System settings
│   └── SettingsController.php      # User settings
└── app/Models/
    ├── SystemSetting.php           # System settings
    ├── SystemBackup.php            # Backup management
    └── Notification.php            # Notifications

frontend/src/
├── pages/system/
│   ├── SystemSettingsPage.tsx      # System configuration
│   ├── ModuleManagementPage.tsx    # Module toggles
│   ├── BackupsPage.tsx             # Backup management
│   └── SystemLogsPage.tsx          # Activity logs
└── services/
    └── system.service.ts           # System API
```

---

### 15. Cloud Storage Integration

```
backend/
├── app/Http/Controllers/Api/
│   └── CloudStorageController.php  # Cloud storage management
└── app/Models/
    ├── CloudStorageConfig.php      # Storage configurations
    └── CloudStorageFile.php        # Stored files

frontend/src/
└── services/
    └── storage.service.ts          # Storage API
```

---

### 16. ERP Integration

```
backend/
├── app/Http/Controllers/Api/
│   └── ErpIntegrationController.php # External ERP sync
├── app/Models/
│   ├── ErpIntegration.php          # Integration config
│   ├── ErpSyncLog.php              # Sync history
│   └── ErpFieldMapping.php         # Field mappings
└── app/Jobs/
    └── ProcessErpSyncJob.php       # Background sync job

frontend/src/
└── services/
    └── integration.service.ts      # Integration API
```

---

### 17. Plant Automation (IoT)

```
backend/
├── app/Http/Controllers/Api/
│   └── PlantAutomationController.php # IoT device management
└── app/Models/
    ├── PlantAutomationConfig.php   # Device configuration
    ├── PlantAutomationTag.php      # PLC/SCADA tags
    ├── PlantAutomationDataLog.php  # Historical data
    └── PlantAutomationAlarm.php    # Device alarms

frontend/src/
└── services/
    └── automation.service.ts       # Automation API
```

---

### 18. Reports Module

```
frontend/src/
├── pages/reports/
│   └── ReportsPage.tsx             # Report generator
└── services/
    └── reports.service.ts          # Report API
```

---

## Database Schema Structure

### Schema Files
| File | Database | Description |
|------|----------|-------------|
| `database/schema_mariadb.sql` | MariaDB 10.6+ | Full schema with SPATIAL indexes |
| `database/schema_postgresql.sql` | PostgreSQL 15+ | Full schema with PostGIS, UUID, partitioning |

### Table Categories

#### Core Tables (15)
- `organizations`, `manufacturing_units`, `users`
- `roles`, `permissions`, `role_permissions`, `user_roles`
- `personal_access_tokens`
- `products`, `customers`, `suppliers`, `projects`
- `activity_logs`, `system_settings`, `notifications`

#### Transaction Tables (20)
- `sales_orders`, `sales_order_items`, `invoices`
- `purchase_orders`, `purchase_order_items`, `goods_receipt_notes`
- `inventory`, `stock_transactions`, `warehouses`
- `production_orders`, `production_batches`
- `bill_of_materials`, `bom_items`
- `journal_vouchers`, `journal_entries`, `ledgers`
- `collections`

#### Quality Tables (6)
- `inspections`, `ncrs`
- `dry_mix_product_tests`, `raw_material_tests`
- `quality_documents`

#### HR Tables (8)
- `departments`, `designations`, `employees`
- `attendances`, `leave_types`, `leave_requests`
- `payroll_periods`, `payslips`

#### Geolocation Tables (5)
- `delivery_tracking`, `delivery_waypoints`
- `location_history`, `site_inspections`, `geotags`

#### System Tables (8)
- `communication_templates`, `communication_logs`
- `credit_controls`, `fiscal_years`
- `production_plans`, `production_plan_items`, `demand_forecasts`
- `system_backups`

### Spatial Indexes (MariaDB)
```sql
SPATIAL INDEX `idx_org_location` (`location`)
SPATIAL INDEX `idx_unit_location` (`location`)
SPATIAL INDEX `idx_unit_boundary` (`boundary`)
SPATIAL INDEX `idx_customer_location` (`location`)
SPATIAL INDEX `idx_supplier_location` (`location`)
SPATIAL INDEX `idx_project_site` (`site_location`)
SPATIAL INDEX `idx_project_boundary` (`site_boundary`)
SPATIAL INDEX `idx_so_delivery_location` (`delivery_location`)
SPATIAL INDEX `idx_warehouse_location` (`location`)
SPATIAL INDEX `idx_inspection_location` (`location`)
SPATIAL INDEX `idx_checkin_location` (`check_in_location`)
SPATIAL INDEX `idx_checkout_location` (`check_out_location`)
SPATIAL INDEX `idx_delivery_current` (`current_location`)
SPATIAL INDEX `idx_delivery_route` (`route_path`)
SPATIAL INDEX `idx_waypoint_location` (`location`)
SPATIAL INDEX `idx_location_point` (`location`)
SPATIAL INDEX `idx_site_inspection_gps` (`gps_location`)
SPATIAL INDEX `idx_geotag_location` (`location`)
```

---

## Frontend Components Library

### UI Components (`frontend/src/components/ui/`)
| Component | Description |
|-----------|-------------|
| `Button.tsx` | Primary button component |
| `Card.tsx` | Card container |
| `Input.tsx` | Form input |
| `Badge.tsx` | Status badges |
| `Table.tsx` | Data table wrapper |
| `Modal.tsx` | Modal dialogs |
| `Select.tsx` | Dropdown select |
| `Tabs.tsx` | Tab navigation |
| `Tooltip.tsx` | Tooltips |
| `Alert.tsx` | Alert messages |
| `Spinner.tsx` | Loading spinner |
| `Pagination.tsx` | Pagination controls |
| `DatePicker.tsx` | Date selection |
| `FileUpload.tsx` | File upload |
| `Breadcrumbs.tsx` | Navigation breadcrumbs |
| `EmptyState.tsx` | Empty state placeholder |

### Service Layer (`frontend/src/services/`)
| Service | Lines | Description |
|---------|-------|-------------|
| `api.ts` | ~100 | Axios instance configuration |
| `auth.service.ts` | ~150 | Authentication |
| `customers.service.ts` | ~200 | Customer API |
| `sales.service.ts` | ~250 | Sales operations |
| `procurement.service.ts` | ~200 | Procurement API |
| `inventory.service.ts` | ~200 | Inventory API |
| `production.service.ts` | ~200 | Production API |
| `quality.service.ts` | ~200 | Quality API |
| `finance.service.ts` | ~250 | Finance API |
| `hr.service.ts` | ~200 | HR API |
| `planning.service.ts` | ~150 | Planning API |
| `geolocation.service.ts` | ~675 | **Geolocation utilities** |
| `communication.service.ts` | ~150 | Communication API |
| `system.service.ts` | ~150 | System API |
| `reports.service.ts` | ~100 | Reports API |

---

## API Endpoints Summary

### Authentication (4 endpoints)
```
POST   /auth/login
POST   /auth/logout
POST   /auth/register
POST   /auth/refresh
```

### Users & Roles (12 endpoints)
```
GET    /users
POST   /users
GET    /users/{id}
PUT    /users/{id}
DELETE /users/{id}
GET    /roles
POST   /roles
GET    /roles/{id}
PUT    /roles/{id}
DELETE /roles/{id}
GET    /permissions
POST   /roles/{id}/permissions
```

### Sales (20 endpoints)
```
GET    /customers
POST   /customers
GET    /customers/{id}
PUT    /customers/{id}
GET    /sales-orders
POST   /sales-orders
GET    /sales-orders/{id}
PUT    /sales-orders/{id}
POST   /sales-orders/{id}/confirm
POST   /sales-orders/{id}/ship
GET    /invoices
POST   /invoices
GET    /projects
POST   /projects
GET    /projects/{id}
...
```

### Geolocation (40+ endpoints)
```
POST   /geo/geocode
POST   /geo/reverse-geocode
POST   /geo/route
GET    /geo/location-history
POST   /geo/location-history
GET    /delivery-tracking
POST   /delivery-tracking
GET    /delivery-tracking/{id}
PUT    /delivery-tracking/{id}
POST   /delivery-tracking/{id}/location
GET    /delivery-tracking/order/{salesOrderId}
POST   /site-inspections
GET    /site-inspections
GET    /projects/{projectId}/inspections
POST   /projects/{projectId}/validate-location
GET    /geotags
POST   /geotags
GET    /geotags/{id}
PUT    /geotags/{id}
DELETE /geotags/{id}
POST   /geotags/{id}/verify
GET    /geotags/nearby
POST   /geo/checkGeofence
POST   /geo/getEntitiesInRadius
...
```

---

## Docker Infrastructure

### Services
```yaml
services:
  erp-backend:     # Laravel API (Port 8101)
  erp-frontend:    # React app (Port 3101)
  erp-queue-worker: # Redis queue processor
  erp-nginx:       # Reverse proxy (Port 8100)

external:
  mariadb:         # Database
  redis:           # Cache & Queue
  mailhog:         # Email testing
  grafana:         # Monitoring
```

### Volumes
```yaml
volumes:
  backend_storage: # Laravel storage
  backend_cache:   # Laravel cache
```

### Network
```yaml
networks:
  cinfo_app_network:
    external: true
```

---

## File Statistics

| Category | Count |
|----------|-------|
| Backend PHP Files | 152 |
| Backend Models | 94 |
| Backend Controllers | 39 |
| Backend Migrations | 69 |
| Backend Middleware | 11 |
| Frontend TSX Files | 146 |
| Frontend Pages | 100+ |
| Frontend Services | 16 |
| Frontend Components | 16 |
| Total Lines (Geolocation) | 1,563 |

---

## Configuration Files

### Backend Environment
```
APP_NAME=ERP_DryMixProducts
APP_TIMEZONE=Asia/Kolkata
DB_CONNECTION=mysql
CACHE_DRIVER=redis
SESSION_DRIVER=redis
QUEUE_CONNECTION=redis
SANCTUM_TOKEN_EXPIRATION=10080  # 7 days
```

### Frontend Environment
```
VITE_API_BASE_URL=http://localhost:8101/api/v1
VITE_APP_NAME=ERP DryMix Products
```

---

## Security Features

- **Authentication**: Laravel Sanctum with token-based auth
- **Authorization**: Role-based access control (RBAC)
- **Two-Factor**: Optional 2FA support
- **Rate Limiting**: Configurable per-endpoint
- **HTTPS**: HSTS enabled in production
- **CORS**: Configured for API access
- **Password Policy**: Minimum 12 characters
- **Activity Logging**: Full audit trail
- **Session Management**: Redis-backed sessions

---

## External Integrations

| Service | Purpose |
|---------|---------|
| OpenStreetMap Nominatim | Geocoding |
| OSRM | Route calculation |
| AWS S3 | Cloud storage (optional) |
| Sentry | Error tracking |
| Google Analytics | Usage analytics |
| Pusher | Real-time events |
| SMTP/MailHog | Email delivery |

---

## Development Workflow

```bash
# Backend
cd backend
composer install
php artisan migrate
php artisan serve --port=8101

# Frontend
cd frontend
npm install
npm run dev

# Docker
docker-compose up -d

# Queue Worker
php artisan queue:work redis --queue=default,erp-sync
```

---

**Document Version**: 1.0.0
**Last Updated**: January 2026
**Status**: Production Ready

# ERP DryMix Products - Comprehensive Implementation Plan

## Project Overview

**Project Name**: ERP DryMix Products - Enterprise Resource Planning for Cementitious DryMix Manufacturing Industry

**Version**: 1.0.0
**Target Release**: Q2 2026
**Development Platform**: PHP, MariaDB, HTML5, Modern Frontend Framework
**Target Market**: Commercial SaaS/On-premise ERP solution
**License Type**: Commercial Proprietary

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [System Architecture](#system-architecture)
3. [Multi-Organization Structure](#multi-organization-structure)
4. [Module Catalog](#module-catalog)
5. [Database Schema Design](#database-schema-design)
6. [API & Integration Architecture](#api--integration-architecture)
7. [QA/QC Module - Construction Focus](#qaqc-module---construction-focus)
8. [Advanced Analytics & AI/ML](#advanced-analytics--aiml)
9. [Theming & Branding System](#theming--branding-system)
10. [Mobile-First Design Strategy](#mobile-first-design-strategy)
11. [Access Control & Security](#access-control--security)
12. [Commercial & Legal Framework](#commercial--legal-framework)
13. [Implementation Phases](#implementation-phases)
14. [Quality Assurance & Testing](#quality-assurance--testing)
15. [Deployment & DevOps](#deployment--devops)

---

## Executive Summary

### Business Problem

The cementitious dry mix products manufacturing industry requires a comprehensive ERP solution that integrates:
- Quality Assurance/Quality Control (QA/QC) with detailed testing procedures
- Production planning and batch management
- Inventory and stores management
- Supply chain and procurement
- Sales and customer management
- Finance and accounting
- Human resources and payroll
- Advanced analytics with AI/ML predictions
- External integrations (messaging, cloud storage, plant automation, ERP systems)

### Solution Overview

A modular, scalable, mobile-first ERP system designed specifically for:
- Non-Shrink Grouts
- Tile Adhesives
- Wall Plasters
- Block Jointing Mortar
- Wall Putty

### Key Differentiators

1. **Industry-Specific QA/QC**: Comprehensive test forms for raw materials and finished goods with 31+ international standards
2. **Construction QA/QC**: Specialized module for construction site quality management
3. **Multi-Tenancy**: Support for multiple organizations with multiple manufacturing units
4. **Integration Ready**: APIs for batching systems, SAP/Oracle ERPs, QC software, testing machines
5. **AI/ML Powered**: Predictive analytics, KPI/KRA tracking, performance predictions
6. **Modular Architecture**: Plug-and-play modules without regression
7. **Commercial Ready**: Complete licensing, EULA, legal documentation

---

## System Architecture

### Technology Stack

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| **Frontend** | | | |
| | React.js | 18+ | Component-based UI |
| | Bootstrap 5 | 5.3+ | Responsive UI framework |
| | Chart.js | 4.4+ | Data visualization |
| | React Query | 4+ | Server state management |
| | Formik | 2+ | Form management |
| | Material-UI / Ant Design | 5+ | Component library |
| **Backend** | | | |
| | PHP | 8.2+ | Server-side logic |
| | Laravel / Symfony | 10+ / 6+ | PHP framework |
| | PHP-FPM | 8.2+ | Process manager |
| | Nginx | 1.24+ | Web server |
| **Database** | | | |
| | MariaDB | 10.11+ | Primary database |
| | Redis | 7+ | Caching & sessions |
| **Infrastructure** | | | |
| | Docker | 24+ | Containerization |
| | Docker Compose | 2.20+ | Multi-container orchestration |
| | Kubernetes (optional) | 1.28+ | Orchestration for large deployments |
| **Background Processing** | | | |
| | Supervisor | 4+ | Process supervisor |
| | RabbitMQ / Redis Queue | 3+ / 7+ | Message queue |
| **External Integrations** | | | |
| | Guzzle | 7+ | HTTP client |
| | Microsoft Graph SDK | 1.0+ | Microsoft 365 integration |
| | Google Client Library | 2.0+ | Google Workspace integration |
| | OPC-UA / Modbus libraries | - | Plant automation |

### Architecture Patterns

#### 1. **Modular Monolith**
- Single application with distinct, independently deployable modules
- Module boundary enforced at code and database level
- Allows for gradual migration to microservices if needed

#### 2. **Domain-Driven Design (DDD)**
- Bounded contexts for each domain (QC, Production, Finance, etc.)
- Shared kernel for cross-cutting concerns
- Domain models aligned with business language

#### 3. **Multi-Tenancy Strategy**
- Shared database with organization_id isolation
- Row-level security for data isolation
- Tenant-aware caching with namespace prefixes

#### 4. **API Gateway Pattern**
- Single entry point for all API requests
- Authentication, rate limiting, logging at gateway level
- Versioned API endpoints

### Layered Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Presentation Layer                        │
│  ┌─────────────┐  ┌─────────────┐  ┌──────────────────────┐  │
│  │ React SPA   │  │ Mobile App  │  │  API Gateway         │  │
│  │ (Web UI)    │  │ (PWA)       │  │  (REST/GraphQL)      │  │
│  └─────────────┘  └─────────────┘  └──────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   Application Layer                          │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────────────┐  │
│  │ Core Modules │ │ ERP Modules  │ │ Integration Layer    │  │
│  │ - Dashboard  │ │ - Stores     │ │ - WhatsApp           │  │
│  │ - Users      │ │ - Planning   │ │ - Email              │  │
│  │ - Settings   │ │ - Finance    │ │ - Office 365         │  │
│  │ - QA/QC      │ │ - Sales      │ │ - Google Workspace   │  │
│  │ - Documents  │ │ - Procure    │ │ - SAP/Oracle         │  │
│  │              │ │ - HR         │ │ - Plant Automation   │  │
│  └──────────────┘ └──────────────┘ └──────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      Domain Layer                             │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────────────┐  │
│  │ Domain Models│ │ Services     │ │ AI/ML Models         │  │
│  │ - Entities   │ │ - Business   │ │ - Predictions        │  │
│  │ - Value Objs │ │   Logic      │ │ - Anomalies          │  │
│  │ - Aggregates │ │ - Rules      │ │ - Recommendations    │  │
│  └──────────────┘ └──────────────┘ └──────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Infrastructure Layer                      │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────────────┐  │
│  │ Database     │ │ Cache        │ │ Message Queue        │  │
│  │ (MariaDB)    │ │ (Redis)      │ │ (RabbitMQ)           │  │
│  └──────────────┘ └──────────────┘ └──────────────────────┘  │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────────────┐  │
│  │ File Storage │ │ Search       │ │ Background Jobs      │  │
│  │ (Local/S3)   │ │ (Elastic)    │ │ (Supervisor)         │  │
│  └──────────────┘ └──────────────┘ └──────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## Multi-Organization Structure

### Organization Hierarchy

```
Organization (Top Level)
│
├── Organization 1
│   ├── Manufacturing Unit 1
│   │   ├── Production Lines
│   │   ├── Warehouses
│   │   ├── QC Labs
│   │   └── Staff
│   │
│   ├── Manufacturing Unit 2
│   └── Head Office
│
├── Organization 2
│   ├── Manufacturing Unit 1
│   └── ...
│
└── Organization 3
```

### Database Schema - Multi-Tenancy

```sql
-- Organizations (Top level)
CREATE TABLE organizations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    org_code VARCHAR(20) UNIQUE NOT NULL,
    org_name VARCHAR(200) NOT NULL,
    legal_name VARCHAR(200) NOT NULL,
    tax_id VARCHAR(50),
    registration_number VARCHAR(100),
    address TEXT,
    country VARCHAR(100),
    state VARCHAR(100),
    city VARCHAR(100),
    pincode VARCHAR(20),
    phone VARCHAR(20),
    email VARCHAR(150),
    website VARCHAR(200),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_org_code (org_code),
    INDEX idx_org_name (org_name)
);

-- Manufacturing Units
CREATE TABLE manufacturing_units (
    id INT PRIMARY KEY AUTO_INCREMENT,
    org_id INT NOT NULL,
    unit_code VARCHAR(20) NOT NULL,
    unit_name VARCHAR(200) NOT NULL,
    unit_type ENUM('factory', 'warehouse', 'office', 'qc_lab', 'construction_site') DEFAULT 'factory',
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100),
    pincode VARCHAR(20),
    phone VARCHAR(20),
    email VARCHAR(150),
    capacity_daily_tons DECIMAL(10,2),
    is_active BOOLEAN DEFAULT TRUE,
    latitude DECIMAL(10,6),
    longitude DECIMAL(10,6),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (org_id) REFERENCES organizations(id) ON DELETE CASCADE,
    UNIQUE KEY uk_unit_org (org_id, unit_code),
    INDEX idx_unit_type (unit_type),
    INDEX idx_location (city, state, country)
);

-- Unit Features/Modules
CREATE TABLE unit_features (
    id INT PRIMARY KEY AUTO_INCREMENT,
    unit_id INT NOT NULL,
    feature_code VARCHAR(50) NOT NULL,
    feature_name VARCHAR(200) NOT NULL,
    is_enabled BOOLEAN DEFAULT TRUE,
    configuration JSON COMMENT 'Feature-specific configuration',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (unit_id) REFERENCES manufacturing_units(id) ON DELETE CASCADE,
    UNIQUE KEY uk_unit_feature (unit_id, feature_code)
);

-- Example Features:
-- 'qa_qc', 'planning', 'stores', 'document_revision', 'trial_register',
-- 'daily_inspection', 'checklists', 'snags', 'handover',
-- 'observation_reports', 'test_certificates', 'non_compliance',
-- 'raw_material_testing', 'finished_goods_testing', 'analytics',
-- 'reporting', 'exports', 'communications', 'ai_ml', 'construction_qaqc'

-- User-Unit Assignment
CREATE TABLE user_unit_assignments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    unit_id INT NOT NULL,
    role VARCHAR(50) NOT NULL,
    is_primary BOOLEAN DEFAULT FALSE,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (unit_id) REFERENCES manufacturing_units(id) ON DELETE CASCADE,
    UNIQUE KEY uk_user_unit (user_id, unit_id)
);
```

### Cross-Organization Data Sharing

```sql
-- Inter-Organization Transactions
CREATE TABLE inter_org_transactions (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    transaction_type ENUM('stock_transfer', 'material_request', 'shared_report', 'shared_test_result'),
    from_org_id INT NOT NULL,
    from_unit_id INT,
    to_org_id INT NOT NULL,
    to_unit_id INT,
    reference_type VARCHAR(50),
    reference_id BIGINT,
    status ENUM('pending', 'approved', 'rejected', 'completed') DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (from_org_id) REFERENCES organizations(id),
    FOREIGN KEY (to_org_id) REFERENCES organizations(id),
    INDEX idx_status (status),
    INDEX idx_transaction_type (transaction_type)
);
```

---

## Module Catalog

### Core Modules (Always Enabled)

#### 1. **User & Access Management**
- Multi-organization user management
- Role-based access control (RBAC)
- Module-wise permission assignment
- Organization-level and unit-level permissions
- Activity logging and audit trails
- Password policies and MFA support
- User profile management
- Device management for mobile access

#### 2. **Dashboard & Analytics**
- Organization-level dashboard
- Unit-level dashboard with KPIs
- Customizable widgets
- Real-time alerts and notifications
- Performance metrics (KPI/KRA)
- AI/ML predictions dashboard
- Trend analysis charts
- Drill-down capabilities

#### 3. **Settings & Configuration**
- Organization settings
- Unit settings
- Module configuration
- Feature toggles
- System preferences
- Theme and branding
- Notification settings
- Integration configurations

#### 4. **Document Management**
- Document repository
- Version control
- Access control per document
- OCR for scanned documents
- Full-text search
- Document categories and tags
- Expiry alerts
- E-signature support

### Primary Modules

#### 5. **QA/QC Module**

**5.1 Document Revisioning System**
- Document types (SOPs, test methods, specifications, manuals)
- Revision tracking with version history
- Approval workflows
- Distribution control
- Review schedules
- Document status (draft, under review, approved, obsolete)
- Change requests
- Compliance tracking

**5.2 Trial Register**
- Trial request creation
- Trial types (product development, formulation, material)
- Trial status tracking
- Trial results and conclusions
- Trial documentation
- Trial-to-production conversion
- Trial cost analysis
- Trial approval workflow

**5.3 Daily Inspections**
- Inspection templates
- Scheduled and ad-hoc inspections
- Inspection checklists
- Photo evidence capture
- Non-conformance identification
- Inspector assignment
- Follow-up actions
- Compliance reporting

**5.4 Checklists**
- Checklist library
- Custom checklist creation
- Checklist categories (safety, quality, process)
- Checklist templates
- Checklist execution tracking
- Pass/fail criteria
- Auto-remediation suggestions
- Checklist analytics

**5.5 Snags & Defects**
- Snag/defect registration
- Priority classification
- Location-based tracking
- Before/after photos
- Assignment to responsible party
- Resolution tracking
- Root cause analysis
- Preventive action recommendations

**5.6 Handover Management**
- Handover types (project, batch, batch transfer)
- Handover checklists
- Document bundling
- Acceptance criteria
- Handover approval workflow
- Handover certificates
- Responsibility transfer
- Post-handover support

**5.7 Observation Reports**
- Observation types (safety, quality, process, environmental)
- Severity classification
- Observer assignment
- Evidence attachment
- Investigation workflow
- CAPA tracking
- Observation analytics
- Trend analysis

**5.8 Test Certificates**
- Certificate templates
- Auto-certificate generation
- Digital signatures
- Certificate validation
- QR code integration
- Batch traceability
- Certificate expiry alerts
- Customer portal access

**5.9 Non-Compliance Management**
- Non-compliance registration
- Classification (minor, major, critical)
- Impact assessment
- CAPA workflow
- Verification and closure
- NC analytics
- Repeat NC tracking
- Preventive action recommendations

**5.10 Raw Material Testing**
- Material master with specifications
- Supplier-specific test requirements
- Test method selection (IS, ASTM, EN, ISO)
- Test data entry forms (detailed per material)
- Automated calculations
- Pass/fail determination
- Test report generation
- Certificate generation
- Supplier performance tracking
- Material approval/rejection

**5.11 Finished Goods Testing**
- Product master with specifications
- Batch-wise testing
- Test methods per product type:
  - Non-Shrink Grouts (ASTM C1107, IS 5129)
  - Tile Adhesives (IS 15477, EN 12004)
  - Wall Plasters (IS 2547, IS 1661, EN 998-1)
  - Block Jointing Mortar (IS 2250, ASTM C270)
  - Wall Putty (IS 5469, IS 15477)
- Detailed test forms with step-by-step procedures
- Equipment requirements
- Acceptance criteria
- Pass/fail indicators
- Batch release control
- Test certificates

**5.12 Construction QA/QC**
- Project-based quality management
- Site inspection scheduling
- Material inspection at site
- Workmanship inspection
- Progress tracking
- Acceptance criteria per construction activity
- Handover readiness assessment
- Defect identification and tracking
- Photo documentation
- Contractor management
- Submittal tracking
- RFI (Request for Information) management
- Daily site reports
- Safety compliance tracking
- Environmental compliance

#### 6. **Planning Module**
- Production planning (daily, weekly, monthly)
- Material requirement planning (MRP)
- Capacity planning
- Production scheduling
- Work order generation
- Shift planning
- Resource allocation
- Bottleneck identification
- Alternative production plans
- What-if scenarios
- Production efficiency analytics

#### 7. **Stores & Inventory Module**
- Multi-warehouse management
- Material master (raw materials, consumables, spare parts)
- Stock receipts (GRN, production receipts)
- Stock issues (production, consumption, transfer)
- Stock transfers between units
- FIFO/FEFO valuation
- Reorder point management
- Minimum/maximum stock levels
- Stock aging analysis
- Batch/lot tracking
- Expiry date management
- Location management (warehouse, aisle, rack, bin)
- Cycle counting
- Stock reconciliation
- Physical inventory
- Stock valuation reports

#### 8. **Production Module**
- Recipe/BOM management
- Mix design optimization
- Batch planning and creation
- Batching automation integration
- Production logging
- Material consumption tracking
- Yield calculation
- Production efficiency
- Batch quality tracking
- Production reporting
- Batch history and traceability
- Cost per batch calculation

#### 9. **Sales & Customer Management**
- Customer master
- Customer hierarchy
- Pricing management
- Product catalogs
- Quotations
- Sales orders
- Delivery scheduling
- Invoice generation
- Payment tracking
- Customer portal
- Order tracking
- Complaint management
- Customer feedback
- Sales analytics

#### 10. **Procurement Module**
- Supplier master
- Supplier rating and performance
- Purchase requisitions
- RFQ management
- Purchase orders
- Supplier quotations
- PO approval workflow
- Goods receipt note (GRN)
- Purchase returns
- Supplier payments
- Procurement analytics
- Vendor evaluation

#### 11. **Finance & Accounting**
- Chart of accounts
- Multi-currency support
- Fiscal year management
- Journal vouchers
- Ledgers (General, Sales, Purchase, Cash, Bank)
- Accounts receivable
- Accounts payable
- Cash management
- Bank reconciliation
- Fixed assets
- Depreciation
- Tax management (GST/VAT)
- Financial reports (P&L, Balance Sheet, Cash Flow)
- Trial balance
- Cost centers
- Budget management
- Expense tracking

#### 12. **HR & Payroll**
- Employee master
- Department management
- Designations and grades
- Attendance management
- Leave management
- Shift management
- Payroll processing
- Salary structure
- PF/ESI/Tax calculations
- Performance appraisal
- Training management
- Recruitment
- Employee portal

#### 13. **Analytics & Reporting**
- Custom report builder
- Scheduled reports
- Ad-hoc reporting
- Data export (Excel, CSV, PDF, PPTX, DOCX, Markdown)
- Dashboard customization
- KPI tracking
- Trend analysis
- Comparative analysis
- Drill-down reports
- Report sharing
- Subscription to reports
- Report scheduling

#### 14. **AI/ML & Predictions**
- Predictive analytics models
- Demand forecasting
- Production prediction
- Quality prediction
- Equipment failure prediction
- Inventory optimization
- Price trend prediction
- Anomaly detection
- KPI/KRA predictions
- Performance predictions
- Recommendation engine
- What-if analysis

#### 15. **Communications Module**
- WhatsApp Business integration
- Email notifications
- SMS notifications (optional)
- Microsoft Teams integration
- Communication logs
- Template management
- Bulk communications
- Communication history
- Attachment support
- Delivery tracking

#### 16. **Cloud Storage Integration**
- Microsoft OneDrive integration
- SharePoint integration
- Google Drive integration
- Document backup
- Document sharing
- Access control
- Sync status
- Storage analytics
- Conflict resolution

#### 17. **External ERP Integration**
- SAP Business One integration
- Oracle ERP integration
- Master data sync
- Transaction sync
- Two-way communication
- Error handling
- Reconciliation
- Integration logs

#### 18. **Plant Automation Integration**
- Batching system integration (OPC-UA/Modbus)
- Testing machine integration
- Weighbridge integration
- Lab equipment integration
- Real-time data collection
- Data validation
- Error handling
- Equipment status monitoring
- Maintenance alerts

### Administrative Modules

#### 19. **Organization Management**
- Organization setup
- Unit setup
- Feature assignment
- Branding configuration
- License management
- Billing and subscriptions
- Usage analytics
- Organization hierarchy

#### 20. **System Administration**
- System configuration
- Module management
- Plugin system
- Theme management
- Logo and branding
- System health monitoring
- Performance tuning
- Backup management
- Restore management
- Log management
- Audit logs

#### 21. **API & Integration Management**
- API key management
- API documentation
- API versioning
- Rate limiting
- Webhook management
- Integration status
- Error monitoring
- Performance monitoring
- API analytics

---

## Database Schema Design

### Core Tables

#### Organizations and Units
```sql
-- Organizations (already defined above)
-- Manufacturing Units (already defined above)
-- Unit Features (already defined above)
```

#### Users and Permissions
```sql
-- Users table
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    org_id INT NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(200) NOT NULL,
    phone VARCHAR(20),
    role VARCHAR(50) NOT NULL,
    designation VARCHAR(100),
    department VARCHAR(100),
    employee_code VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    is_locked BOOLEAN DEFAULT FALSE,
    last_login TIMESTAMP NULL,
    failed_login_attempts INT DEFAULT 0,
    password_changed_at TIMESTAMP NULL,
    mfa_enabled BOOLEAN DEFAULT FALSE,
    mfa_secret VARCHAR(255),
    ui_theme VARCHAR(50) DEFAULT 'light',
    ui_font VARCHAR(50) DEFAULT 'Roboto',
    custom_theme_colors JSON,
    language VARCHAR(10) DEFAULT 'en',
    timezone VARCHAR(50) DEFAULT 'UTC',
    date_format VARCHAR(20) DEFAULT 'Y-m-d',
    number_format VARCHAR(10) DEFAULT '1,000.00',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    FOREIGN KEY (org_id) REFERENCES organizations(id) ON DELETE CASCADE,
    INDEX idx_org_users (org_id),
    INDEX idx_role (role),
    INDEX idx_email (email)
);

-- Roles
CREATE TABLE roles (
    id INT PRIMARY KEY AUTO_INCREMENT,
    org_id INT NOT NULL,
    role_code VARCHAR(50) NOT NULL,
    role_name VARCHAR(100) NOT NULL,
    description TEXT,
    is_system_role BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (org_id) REFERENCES organizations(id) ON DELETE CASCADE,
    UNIQUE KEY uk_org_role (org_id, role_code)
);

-- Permissions
CREATE TABLE permissions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    module_code VARCHAR(50) NOT NULL,
    permission_code VARCHAR(100) NOT NULL,
    permission_name VARCHAR(200) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uk_module_permission (module_code, permission_code)
);

-- Role-Permissions mapping
CREATE TABLE role_permissions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    role_id INT NOT NULL,
    permission_id INT NOT NULL,
    is_allowed BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE,
    UNIQUE KEY uk_role_permission (role_id, permission_id)
);

-- Activity Log
CREATE TABLE activity_log (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    org_id INT NOT NULL,
    user_id INT,
    action VARCHAR(50) NOT NULL,
    module VARCHAR(50),
    record_type VARCHAR(50),
    record_id BIGINT,
    details JSON,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (org_id) REFERENCES organizations(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_action (action),
    INDEX idx_module (module),
    INDEX idx_user_activity (user_id, created_at),
    INDEX idx_org_date (org_id, created_at)
);
```

#### QA/QC Tables

```sql
-- Document Revisioning
CREATE TABLE doc_revisions (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    org_id INT NOT NULL,
    unit_id INT,
    doc_type ENUM('sop', 'test_method', 'specification', 'manual', 'form', 'certificate') NOT NULL,
    doc_code VARCHAR(50) NOT NULL,
    doc_title VARCHAR(200) NOT NULL,
    version VARCHAR(20) NOT NULL,
    revision_number INT NOT NULL,
    revision_date DATE NOT NULL,
    status ENUM('draft', 'under_review', 'approved', 'obsolete') DEFAULT 'draft',
    prepared_by INT NOT NULL,
    reviewed_by INT,
    approved_by INT,
    effective_date DATE,
    next_review_date DATE,
    storage_path VARCHAR(500),
    file_size BIGINT,
    mime_type VARCHAR(100),
    pages INT,
    keywords TEXT,
    description TEXT,
    distribution_list JSON,
    change_summary TEXT,
    superseded_by BIGINT,
    is_current BOOLEAN DEFAULT TRUE,
    access_level ENUM('public', 'internal', 'restricted', 'confidential') DEFAULT 'internal',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    FOREIGN KEY (org_id) REFERENCES organizations(id) ON DELETE CASCADE,
    FOREIGN KEY (unit_id) REFERENCES manufacturing_units(id) ON DELETE CASCADE,
    FOREIGN KEY (prepared_by) REFERENCES users(id),
    FOREIGN KEY (reviewed_by) REFERENCES users(id),
    FOREIGN KEY (approved_by) REFERENCES users(id),
    UNIQUE KEY uk_doc_version (doc_code, version),
    INDEX idx_doc_type (doc_type),
    INDEX idx_status (status),
    INDEX idx_review_date (next_review_date)
);

-- Trial Register
CREATE TABLE trial_register (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    org_id INT NOT NULL,
    unit_id INT NOT NULL,
    trial_number VARCHAR(50) NOT NULL,
    trial_type ENUM('product_development', 'formulation', 'material_test', 'process_optimization', 'customer_request') NOT NULL,
    product_id INT,
    title VARCHAR(200) NOT NULL,
    objective TEXT,
    description TEXT,
    requested_by INT NOT NULL,
    assigned_to INT,
    priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
    start_date DATE,
    target_date DATE,
    completion_date DATE,
    status ENUM('requested', 'approved', 'in_progress', 'completed', 'cancelled', 'on_hold') DEFAULT 'requested',
    trial_data JSON COMMENT 'Trial parameters and observations',
    results_summary TEXT,
    conclusion TEXT,
    conversion_to_production BOOLEAN DEFAULT FALSE,
    production_batch_id BIGINT,
    cost_analysis JSON,
    attachments JSON,
    approval_workflow JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (org_id) REFERENCES organizations(id) ON DELETE CASCADE,
    FOREIGN KEY (unit_id) REFERENCES manufacturing_units(id) ON DELETE CASCADE,
    FOREIGN KEY (requested_by) REFERENCES users(id),
    FOREIGN KEY (assigned_to) REFERENCES users(id),
    UNIQUE KEY uk_trial_number (org_id, unit_id, trial_number),
    INDEX idx_status (status),
    INDEX idx_dates (start_date, target_date, completion_date)
);

-- Daily Inspections
CREATE TABLE daily_inspections (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    org_id INT NOT NULL,
    unit_id INT NOT NULL,
    inspection_number VARCHAR(50) NOT NULL,
    inspection_type ENUM('safety', 'quality', 'process', 'equipment', 'hygiene', 'environmental') NOT NULL,
    inspection_template_id INT,
    area_location VARCHAR(200),
    inspection_date DATE NOT NULL,
    scheduled_time TIME,
    conducted_by INT NOT NULL,
    supervised_by INT,
    status ENUM('scheduled', 'in_progress', 'completed', 'cancelled') DEFAULT 'scheduled',
    overall_result ENUM('pass', 'pass_with_observation', 'fail') DEFAULT 'pass',
    total_points INT,
    passed_points INT,
    failed_points INT,
    observation_points INT,
    inspection_data JSON COMMENT 'Checklist items and results',
    non_conformances JSON,
    photos JSON,
    follow_up_required BOOLEAN DEFAULT FALSE,
    follow_up_actions TEXT,
    follow_up_assigned_to INT,
    follow_up_target_date DATE,
    signature_path VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (org_id) REFERENCES organizations(id) ON DELETE CASCADE,
    FOREIGN KEY (unit_id) REFERENCES manufacturing_units(id) ON DELETE CASCADE,
    FOREIGN KEY (conducted_by) REFERENCES users(id),
    UNIQUE KEY uk_inspection_number (org_id, unit_id, inspection_number),
    INDEX idx_inspection_type (inspection_type),
    INDEX idx_date (inspection_date),
    INDEX idx_status (status)
);

-- Checklists
CREATE TABLE checklists (
    id INT PRIMARY KEY AUTO_INCREMENT,
    org_id INT NOT NULL,
    unit_id INT,
    checklist_code VARCHAR(50) NOT NULL,
    checklist_name VARCHAR(200) NOT NULL,
    category ENUM('safety', 'quality', 'process', 'pre_start', 'post_production', 'maintenance', 'loading', 'shipping') NOT NULL,
    description TEXT,
    checklist_type ENUM('predefined', 'custom') DEFAULT 'predefined',
    is_active BOOLEAN DEFAULT TRUE,
    frequency ENUM('once', 'daily', 'weekly', 'monthly', 'quarterly', 'annually', 'per_batch', 'per_shift') DEFAULT 'daily',
    applicable_areas JSON,
    target_roles JSON,
    checklist_items JSON COMMENT 'Array of checklist items with criteria',
    pass_criteria JSON,
    total_score INT,
    passing_score INT,
    created_by INT NOT NULL,
    version VARCHAR(20) DEFAULT '1.0',
    effective_date DATE,
    review_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    FOREIGN KEY (org_id) REFERENCES organizations(id) ON DELETE CASCADE,
    FOREIGN KEY (unit_id) REFERENCES manufacturing_units(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id),
    UNIQUE KEY uk_checklist_code (org_id, checklist_code),
    INDEX idx_category (category),
    INDEX idx_active (is_active)
);

CREATE TABLE checklist_executions (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    org_id INT NOT NULL,
    unit_id INT NOT NULL,
    checklist_id INT NOT NULL,
    execution_number VARCHAR(50) NOT NULL,
    execution_date DATE NOT NULL,
    execution_time TIME,
    executed_by INT NOT NULL,
    reference_type VARCHAR(50),
    reference_id BIGINT,
    status ENUM('in_progress', 'completed', 'failed') DEFAULT 'in_progress',
    total_score INT,
    obtained_score INT,
    result ENUM('pass', 'fail') DEFAULT 'pass',
    responses JSON COMMENT 'Checklist item responses',
    observations TEXT,
    photos JSON,
    failures JSON,
    corrective_actions TEXT,
    reviewed_by INT,
    review_date TIMESTAMP NULL,
    signature_path VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (org_id) REFERENCES organizations(id) ON DELETE CASCADE,
    FOREIGN KEY (unit_id) REFERENCES manufacturing_units(id) ON DELETE CASCADE,
    FOREIGN KEY (checklist_id) REFERENCES checklists(id),
    FOREIGN KEY (executed_by) REFERENCES users(id),
    FOREIGN KEY (reviewed_by) REFERENCES users(id),
    UNIQUE KEY uk_execution_number (org_id, unit_id, execution_number),
    INDEX idx_checklist_date (checklist_id, execution_date),
    INDEX idx_status (status)
);

-- Snags/Defects
CREATE TABLE snags (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    org_id INT NOT NULL,
    unit_id INT NOT NULL,
    snag_number VARCHAR(50) NOT NULL,
    snag_type ENUM('quality', 'workmanship', 'material', 'safety', 'equipment', 'packaging', 'documentation') NOT NULL,
    severity ENUM('minor', 'major', 'critical') NOT NULL,
    priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
    title VARCHAR(200) NOT NULL,
    description TEXT,
    location VARCHAR(200),
    product_id INT,
    batch_id BIGINT,
    reported_by INT NOT NULL,
    reported_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    assigned_to INT,
    assigned_date TIMESTAMP NULL,
    target_date DATE,
    status ENUM('open', 'in_progress', 'resolved', 'verified', 'closed', 'rejected') DEFAULT 'open',
    root_cause TEXT,
    correction_action TEXT,
    preventive_action TEXT,
    photos_before JSON,
    photos_after JSON,
    verification_by INT,
    verification_date TIMESTAMP NULL,
    verification_notes TEXT,
    closure_date TIMESTAMP NULL,
    resolution_summary TEXT,
    cost_impact DECIMAL(15,2),
    time_impact_hours DECIMAL(10,2),
    attachments JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (org_id) REFERENCES organizations(id) ON DELETE CASCADE,
    FOREIGN KEY (unit_id) REFERENCES manufacturing_units(id) ON DELETE CASCADE,
    FOREIGN KEY (reported_by) REFERENCES users(id),
    FOREIGN KEY (assigned_to) REFERENCES users(id),
    FOREIGN KEY (verification_by) REFERENCES users(id),
    UNIQUE KEY uk_snag_number (org_id, unit_id, snag_number),
    INDEX idx_status (status),
    INDEX idx_severity (severity),
    INDEX idx_priority (priority),
    INDEX idx_reported_date (reported_date)
);

-- Handover Management
CREATE TABLE handovers (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    org_id INT NOT NULL,
    from_unit_id INT NOT NULL,
    to_unit_id INT NOT NULL,
    handover_number VARCHAR(50) NOT NULL,
    handover_type ENUM('project', 'batch', 'material', 'equipment', 'construction_site', 'phase') NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    project_id BIGINT,
    batch_id BIGINT,
    material_id INT,
    quantity DECIMAL(15,3),
    uom VARCHAR(20),
    handover_date DATE,
    handover_time TIME,
    from_responsible_person INT NOT NULL,
    to_responsible_person INT NOT NULL,
    status ENUM('planned', 'ready', 'in_progress', 'completed', 'rejected', 'cancelled') DEFAULT 'planned',
    handover_checklist JSON,
    acceptance_criteria JSON,
    documents_bundle JSON COMMENT 'List of documents attached',
    observations TEXT,
    notes TEXT,
    photos JSON,
    from_signature_path VARCHAR(500),
    to_signature_path VARCHAR(500),
    from_signed_at TIMESTAMP NULL,
    to_signed_at TIMESTAMP NULL,
    accepted BOOLEAN DEFAULT FALSE,
    accepted_at TIMESTAMP NULL,
    rejection_reason TEXT,
    post_handover_support TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (org_id) REFERENCES organizations(id) ON DELETE CASCADE,
    FOREIGN KEY (from_unit_id) REFERENCES manufacturing_units(id),
    FOREIGN KEY (to_unit_id) REFERENCES manufacturing_units(id),
    FOREIGN KEY (from_responsible_person) REFERENCES users(id),
    FOREIGN KEY (to_responsible_person) REFERENCES users(id),
    UNIQUE KEY uk_handover_number (org_id, handover_number),
    INDEX idx_status (status),
    INDEX idx_date (handover_date),
    INDEX idx_units (from_unit_id, to_unit_id)
);

-- Observation Reports
CREATE TABLE observations (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    org_id INT NOT NULL,
    unit_id INT NOT NULL,
    observation_number VARCHAR(50) NOT NULL,
    observation_type ENUM('safety', 'quality', 'process', 'environmental', 'efficiency', 'waste', 'compliance') NOT NULL,
    severity ENUM('low', 'medium', 'high', 'critical') NOT NULL,
    category VARCHAR(100),
    title VARCHAR(200) NOT NULL,
    description TEXT,
    location VARCHAR(200),
    activity_type VARCHAR(100),
    observed_by INT NOT NULL,
    observed_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    evidence_photos JSON,
    videos JSON,
    witness_names JSON,
    immediate_action_taken TEXT,
    risk_assessment JSON,
    status ENUM('reported', 'under_investigation', 'action_in_progress', 'resolved', 'closed') DEFAULT 'reported',
    investigation_by INT,
    investigation_date DATE,
    investigation_findings TEXT,
    root_cause TEXT,
    corrective_action_required BOOLEAN DEFAULT FALSE,
    corrective_actions JSON,
    assigned_to INT,
    target_date DATE,
    completed_date DATE,
    verification_by INT,
    verified BOOLEAN DEFAULT FALSE,
    verified_date TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (org_id) REFERENCES organizations(id) ON DELETE CASCADE,
    FOREIGN KEY (unit_id) REFERENCES manufacturing_units(id) ON DELETE CASCADE,
    FOREIGN KEY (observed_by) REFERENCES users(id),
    FOREIGN KEY (investigation_by) REFERENCES users(id),
    FOREIGN KEY (assigned_to) REFERENCES users(id),
    FOREIGN KEY (verification_by) REFERENCES users(id),
    UNIQUE KEY uk_observation_number (org_id, unit_id, observation_number),
    INDEX idx_type (observation_type),
    INDEX idx_status (status),
    INDEX idx_date (observed_date)
);

-- Test Certificates
CREATE TABLE test_certificates (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    org_id INT NOT NULL,
    unit_id INT NOT NULL,
    certificate_number VARCHAR(50) NOT NULL,
    certificate_type ENUM('raw_material', 'finished_product', 'batch', 'third_party', 'internal') NOT NULL,
    material_id INT,
    product_id INT,
    batch_id BIGINT,
    test_result_id BIGINT NOT NULL,
    customer_id INT,
    po_reference VARCHAR(100),
    issue_date DATE,
    valid_until DATE,
    certificate_template VARCHAR(100),
    certificate_data JSON COMMENT 'Test results summary',
    standards_followed JSON,
    overall_result ENUM('pass', 'fail', 'conditional') NOT NULL,
    remarks TEXT,
    tested_by INT NOT NULL,
    reviewed_by INT,
    approved_by INT,
    approval_status ENUM('draft', 'pending_review', 'approved', 'rejected') DEFAULT 'draft',
    signature_path VARCHAR(500),
    stamp_path VARCHAR(500),
    qr_code_data VARCHAR(500),
    public_link VARCHAR(500),
    public_access BOOLEAN DEFAULT FALSE,
    password_protected BOOLEAN DEFAULT FALSE,
    password VARCHAR(255),
    delivery_method ENUM('print', 'email', 'portal', 'whatsapp', 'all') DEFAULT 'portal',
    delivery_status ENUM('pending', 'sent', 'delivered', 'failed') DEFAULT 'pending',
    delivered_at TIMESTAMP NULL,
    view_count INT DEFAULT 0,
    download_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    FOREIGN KEY (org_id) REFERENCES organizations(id) ON DELETE CASCADE,
    FOREIGN KEY (unit_id) REFERENCES manufacturing_units(id) ON DELETE CASCADE,
    FOREIGN KEY (tested_by) REFERENCES users(id),
    FOREIGN KEY (reviewed_by) REFERENCES users(id),
    FOREIGN KEY (approved_by) REFERENCES users(id),
    UNIQUE KEY uk_certificate_number (org_id, certificate_number),
    INDEX idx_type (certificate_type),
    INDEX idx_status (approval_status),
    INDEX idx_issue_date (issue_date),
    INDEX idx_valid_until (valid_until)
);

-- Non-Compliance Management
CREATE TABLE non_compliances (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    org_id INT NOT NULL,
    unit_id INT NOT NULL,
    nc_number VARCHAR(50) NOT NULL,
    nc_category ENUM('quality', 'safety', 'process', 'documentation', 'environmental', 'regulatory', 'customer_complaint') NOT NULL,
    classification ENUM('minor', 'major', 'critical') NOT NULL,
    source ENUM('internal_audit', 'external_audit', 'inspection', 'customer_complaint', 'process_failure', 'product_failure', 'observation') NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    reference_type VARCHAR(50),
    reference_id BIGINT,
    detected_by INT NOT NULL,
    detected_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    location VARCHAR(200),
    product_id INT,
    batch_id BIGINT,
    quantity_affected DECIMAL(15,3),
    impact_assessment TEXT,
    root_cause_analysis JSON,
    corrective_action_plan JSON,
    preventive_action_plan JSON,
    responsible_person INT,
    target_date DATE,
    actual_completion_date DATE,
    verification_by INT,
    verification_date TIMESTAMP NULL,
    verification_result ENUM('effective', 'not_effective', 'partially_effective'),
    status ENUM('open', 'investigation', 'action_in_progress', 'verification', 'closed', 'cancelled') DEFAULT 'open',
    closure_summary TEXT,
    lessons_learned TEXT,
    repeat_nc BOOLEAN DEFAULT FALSE,
    previous_nc_id BIGINT,
    attachments JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (org_id) REFERENCES organizations(id) ON DELETE CASCADE,
    FOREIGN KEY (unit_id) REFERENCES manufacturing_units(id) ON DELETE CASCADE,
    FOREIGN KEY (detected_by) REFERENCES users(id),
    FOREIGN KEY (responsible_person) REFERENCES users(id),
    FOREIGN KEY (verification_by) REFERENCES users(id),
    UNIQUE KEY uk_nc_number (org_id, unit_id, nc_number),
    INDEX idx_classification (classification),
    INDEX idx_status (status),
    INDEX idx_detected_date (detected_date),
    INDEX idx_repeat (repeat_nc, previous_nc_id)
);

-- Raw Material Testing
CREATE TABLE raw_materials (
    id INT PRIMARY KEY AUTO_INCREMENT,
    org_id INT NOT NULL,
    material_code VARCHAR(50) NOT NULL,
    material_name VARCHAR(200) NOT NULL,
    category ENUM('cement', 'aggregate', 'sand', 'admixtures', 'fly_ash', 'water', 'additives', 'packaging', 'other') NOT NULL,
    description TEXT,
    standard_specifications JSON COMMENT 'Applicable standards and specifications',
    test_methods JSON COMMENT 'Required test methods',
    storage_requirements TEXT,
    shelf_life_days INT,
    storage_conditions TEXT,
    safety_precautions TEXT,
    uoms JSON COMMENT 'Multiple units of measure',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (org_id) REFERENCES organizations(id) ON DELETE CASCADE,
    UNIQUE KEY uk_material_code (org_id, material_code),
    INDEX idx_category (category),
    INDEX idx_active (is_active)
);

CREATE TABLE raw_material_tests (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    org_id INT NOT NULL,
    unit_id INT NOT NULL,
    test_number VARCHAR(50) NOT NULL,
    test_date DATE NOT NULL,
    material_id INT NOT NULL,
    supplier_id INT,
    batch_lot_number VARCHAR(100),
    sample_number VARCHAR(50),
    sample_date DATE,
    sample_location VARCHAR(200),
    test_type ENUM('routine', 'incoming', 'periodic', 'complaint', 'development') NOT NULL,
    test_standard VARCHAR(100),
    test_method VARCHAR(100),
    test_parameters JSON COMMENT 'Test-specific parameters and results',
    test_result ENUM('pass', 'fail', 'conditional') DEFAULT 'pass',
    remarks TEXT,
    tested_by INT NOT NULL,
    reviewed_by INT,
    approved_by INT,
    status ENUM('draft', 'pending_review', 'approved', 'rejected') DEFAULT 'draft',
    attachment_ids JSON,
    certificate_generated BOOLEAN DEFAULT FALSE,
    certificate_id BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (org_id) REFERENCES organizations(id) ON DELETE CASCADE,
    FOREIGN KEY (unit_id) REFERENCES manufacturing_units(id) ON DELETE CASCADE,
    FOREIGN KEY (material_id) REFERENCES raw_materials(id),
    FOREIGN KEY (tested_by) REFERENCES users(id),
    FOREIGN KEY (reviewed_by) REFERENCES users(id),
    FOREIGN KEY (approved_by) REFERENCES users(id),
    UNIQUE KEY uk_test_number (org_id, unit_id, test_number),
    INDEX idx_material_date (material_id, test_date),
    INDEX idx_status (status)
);

-- Finished Goods Testing
CREATE TABLE finished_products (
    id INT PRIMARY KEY AUTO_INCREMENT,
    org_id INT NOT NULL,
    product_code VARCHAR(50) NOT NULL,
    product_name VARCHAR(200) NOT NULL,
    product_type ENUM('non_shrink_grout', 'tile_adhesive', 'wall_plaster', 'block_jointing_mortar', 'wall_putty', 'other') NOT NULL,
    grade VARCHAR(50),
    description TEXT,
    standard_specifications JSON,
    test_methods JSON,
    recipe_bom_id INT,
    packaging_type VARCHAR(100),
    packaging_weight DECIMAL(10,3),
    shelf_life_days INT,
    storage_requirements TEXT,
    safety_data_sheet VARCHAR(500),
    technical_data_sheet VARCHAR(500),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (org_id) REFERENCES organizations(id) ON DELETE CASCADE,
    UNIQUE KEY uk_product_code (org_id, product_code),
    INDEX idx_type (product_type),
    INDEX idx_active (is_active)
);

CREATE TABLE finished_product_tests (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    org_id INT NOT NULL,
    unit_id INT NOT NULL,
    test_number VARCHAR(50) NOT NULL,
    test_date DATE NOT NULL,
    product_id INT NOT NULL,
    batch_number VARCHAR(100),
    batch_id BIGINT,
    production_date DATE,
    sample_number VARCHAR(50),
    sample_date DATE,
    test_type ENUM('routine', 'batch_release', 'customer_sample', 'development', 'complaint') NOT NULL,
    test_standard VARCHAR(100),
    test_method VARCHAR(100),
    test_parameters JSON COMMENT 'Comprehensive test parameters and results',
    test_result ENUM('pass', 'fail', 'conditional') DEFAULT 'pass',
    overall_grade VARCHAR(50),
    remarks TEXT,
    tested_by INT NOT NULL,
    reviewed_by INT,
    approved_by INT,
    status ENUM('draft', 'pending_review', 'approved', 'rejected') DEFAULT 'draft',
    batch_release_status ENUM('not_required', 'pending', 'released', 'rejected'),
    attachment_ids JSON,
    certificate_generated BOOLEAN DEFAULT FALSE,
    certificate_id BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (org_id) REFERENCES organizations(id) ON DELETE CASCADE,
    FOREIGN KEY (unit_id) REFERENCES manufacturing_units(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES finished_products(id),
    FOREIGN KEY (tested_by) REFERENCES users(id),
    FOREIGN KEY (reviewed_by) REFERENCES users(id),
    FOREIGN KEY (approved_by) REFERENCES users(id),
    UNIQUE KEY uk_test_number (org_id, unit_id, test_number),
    INDEX idx_product_date (product_id, test_date),
    INDEX idx_batch_number (batch_number),
    INDEX idx_status (status)
);
```

#### Construction QA/QC Tables

```sql
-- Projects
CREATE TABLE construction_projects (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    org_id INT NOT NULL,
    customer_id INT NOT NULL,
    project_code VARCHAR(50) NOT NULL,
    project_name VARCHAR(200) NOT NULL,
    project_type ENUM('residential', 'commercial', 'industrial', 'infrastructure', 'renovation') NOT NULL,
    project_address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100),
    pincode VARCHAR(20),
    latitude DECIMAL(10,6),
    longitude DECIMAL(10,6),
    contract_value DECIMAL(15,2),
    currency VARCHAR(10) DEFAULT 'INR',
    start_date DATE,
    estimated_end_date DATE,
    actual_end_date DATE,
    project_status ENUM('planning', 'in_progress', 'on_hold', 'completed', 'cancelled') DEFAULT 'planning',
    project_manager_id INT,
    site_engineer_id INT,
    qc_manager_id INT,
    safety_officer_id INT,
    description TEXT,
    specifications JSON,
    contract_documents JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (org_id) REFERENCES organizations(id) ON DELETE CASCADE,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
    UNIQUE KEY uk_project_code (org_id, project_code),
    INDEX idx_status (project_status),
    INDEX idx_dates (start_date, estimated_end_date)
);

-- Construction Activities/Phases
CREATE TABLE construction_activities (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    project_id BIGINT NOT NULL,
    activity_code VARCHAR(50) NOT NULL,
    activity_name VARCHAR(200) NOT NULL,
    activity_type ENUM('foundation', 'superstructure', 'finishing', 'electrical', 'plumbing', 'hvac', 'external', 'landscaping') NOT NULL,
    parent_activity_id INT,
    sequence_number INT,
    start_date DATE,
    estimated_end_date DATE,
    actual_start_date DATE,
    actual_end_date DATE,
    status ENUM('not_started', 'in_progress', 'completed', 'on_hold', 'delayed') DEFAULT 'not_started',
    planned_budget DECIMAL(15,2),
    actual_cost DECIMAL(15,2),
    progress_percentage DECIMAL(5,2) DEFAULT 0,
    contractor_id INT,
    specifications JSON,
    drawings JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES construction_projects(id) ON DELETE CASCADE,
    UNIQUE KEY uk_project_activity (project_id, activity_code),
    INDEX idx_status (status),
    INDEX idx_dates (start_date, estimated_end_date)
);

-- Site Inspections
CREATE TABLE site_inspections (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    org_id INT NOT NULL,
    unit_id INT NOT NULL COMMENT 'Can be construction site',
    project_id BIGINT,
    activity_id BIGINT,
    inspection_number VARCHAR(50) NOT NULL,
    inspection_date DATE NOT NULL,
    inspection_type ENUM('pre_construction', 'in_progress', 'post_construction', 'material_delivery', 'safety', 'quality') NOT NULL,
    inspection_category VARCHAR(100),
    inspected_by INT NOT NULL,
    supervised_by INT,
    contractor_representative VARCHAR(200),
    weather_conditions VARCHAR(100),
    ambient_temp DECIMAL(6,2),
    relative_humidity DECIMAL(5,2),
    inspection_data JSON COMMENT 'Detailed inspection items and results',
    overall_result ENUM('satisfactory', 'acceptable_with_observation', 'unsatisfactory') DEFAULT 'satisfactory',
    non_conformances JSON,
    observations TEXT,
    photos JSON,
    videos JSON,
    immediate_actions TEXT,
    follow_up_required BOOLEAN DEFAULT FALSE,
    follow_up_actions TEXT,
    follow_up_target_date DATE,
    inspector_signature VARCHAR(500),
    contractor_signature VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (org_id) REFERENCES organizations(id) ON DELETE CASCADE,
    FOREIGN KEY (unit_id) REFERENCES manufacturing_units(id) ON DELETE CASCADE,
    FOREIGN KEY (project_id) REFERENCES construction_projects(id),
    FOREIGN KEY (activity_id) REFERENCES construction_activities(id),
    FOREIGN KEY (inspected_by) REFERENCES users(id),
    FOREIGN KEY (supervised_by) REFERENCES users(id),
    UNIQUE KEY uk_inspection_number (org_id, unit_id, inspection_number),
    INDEX idx_project_date (project_id, inspection_date),
    INDEX idx_activity (activity_id)
);

-- Material Inspections at Site
CREATE TABLE site_material_inspections (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    org_id INT NOT NULL,
    project_id BIGINT NOT NULL,
    activity_id BIGINT,
    inspection_number VARCHAR(50) NOT NULL,
    inspection_date DATE NOT NULL,
    material_id INT,
    material_name VARCHAR(200),
    batch_number VARCHAR(100),
    supplier_id INT,
    delivery_challan_number VARCHAR(100),
    quantity_delivered DECIMAL(15,3),
    uom VARCHAR(20),
    sample_taken BOOLEAN DEFAULT FALSE,
    sample_number VARCHAR(50),
    sample_tested BOOLEAN DEFAULT FALSE,
    test_result_id BIGINT,
    inspection_data JSON COMMENT 'Visual inspection parameters',
    condition ENUM('satisfactory', 'acceptable', 'unsatisfactory', 'requires_test') DEFAULT 'satisfactory',
    visual_defects TEXT,
 dimensions_checked BOOLEAN DEFAULT FALSE,
    dimensional_results JSON,
    storage_conditions TEXT,
    recommendations TEXT,
    inspected_by INT NOT NULL,
    site_engineer_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (org_id) REFERENCES organizations(id) ON DELETE CASCADE,
    FOREIGN KEY (project_id) REFERENCES construction_projects(id) ON DELETE CASCADE,
    FOREIGN KEY (activity_id) REFERENCES construction_activities(id),
    FOREIGN KEY (material_id) REFERENCES raw_materials(id),
    UNIQUE KEY uk_material_inspection (org_id, project_id, inspection_number),
    INDEX idx_material_date (material_id, inspection_date)
);

-- Workmanship Inspection
CREATE TABLE workmanship_inspections (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    org_id INT NOT NULL,
    project_id BIGINT NOT NULL,
    activity_id BIGINT NOT NULL,
    inspection_number VARCHAR(50) NOT NULL,
    inspection_date DATE NOT NULL,
    work_area VARCHAR(200),
    work_type VARCHAR(100),
    contractor_id INT,
    worker_team VARCHAR(100),
    supervisor VARCHAR(100),
    work_stage VARCHAR(100),
    acceptance_criteria JSON,
    inspection_parameters JSON,
    measurements_taken JSON,
    tolerances JSON,
    deviations JSON,
    overall_quality ENUM('excellent', 'good', 'acceptable', 'poor') DEFAULT 'good',
    rework_required BOOLEAN DEFAULT FALSE,
    rework_area TEXT,
    rework_instructions TEXT,
    approved BOOLEAN DEFAULT FALSE,
    approved_by INT,
    approved_date TIMESTAMP NULL,
    photos JSON,
    sketches JSON,
    inspected_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (org_id) REFERENCES organizations(id) ON DELETE CASCADE,
    FOREIGN KEY (project_id) REFERENCES construction_projects(id) ON DELETE CASCADE,
    FOREIGN KEY (activity_id) REFERENCES construction_activities(id),
    FOREIGN KEY (approved_by) REFERENCES users(id),
    UNIQUE KEY uk_workmanship_inspection (org_id, project_id, inspection_number)
);

-- Submittals Management
CREATE TABLE submittals (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    org_id INT NOT NULL,
    project_id BIGINT NOT NULL,
    submittal_number VARCHAR(50) NOT NULL,
    submittal_title VARCHAR(200) NOT NULL,
    submittal_type ENUM('material', 'shop_drawing', 'sample', 'method_statement', 'test_report', 'technical_data') NOT NULL,
    spec_section VARCHAR(50),
    required_by_date DATE,
    submitted_by INT NOT NULL,
    submitted_date DATE,
    revision_number INT DEFAULT 1,
    submittal_status ENUM('pending', 'submitted', 'under_review', 'approved', 'approved_as_noted', 'revise_and_resubmit', 'rejected') DEFAULT 'pending',
    documents JSON,
    review_comments TEXT,
    reviewed_by INT,
    review_date DATE,
    final_approval_date DATE,
    distribution_list JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (org_id) REFERENCES organizations(id) ON DELETE CASCADE,
    FOREIGN KEY (project_id) REFERENCES construction_projects(id) ON DELETE CASCADE,
    FOREIGN KEY (submitted_by) REFERENCES users(id),
    FOREIGN KEY (reviewed_by) REFERENCES users(id),
    UNIQUE KEY uk_submittal_number (org_id, project_id, submittal_number),
    INDEX idx_status (submittal_status),
    INDEX idx_required_date (required_by_date)
);

-- RFIs (Request for Information)
CREATE TABLE rfis (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    org_id INT NOT NULL,
    project_id BIGINT NOT NULL,
    rfi_number VARCHAR(50) NOT NULL,
    rfi_title VARCHAR(200) NOT NULL,
    spec_section VARCHAR(50),
    submitted_by INT NOT NULL,
    submitted_date DATE,
    urgency ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
    required_by_date DATE,
    assigned_to INT,
    status ENUM('draft', 'submitted', 'assigned', 'answered', 'closed') DEFAULT 'draft',
    question TEXT NOT NULL,
    response TEXT,
    drawing_references JSON,
    photos JSON,
    response_by INT,
    response_date DATE,
    response_time_hours INT,
    documents JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (org_id) REFERENCES organizations(id) ON DELETE CASCADE,
    FOREIGN KEY (project_id) REFERENCES construction_projects(id) ON DELETE CASCADE,
    FOREIGN KEY (submitted_by) REFERENCES users(id),
    FOREIGN KEY (assigned_to) REFERENCES users(id),
    FOREIGN KEY (response_by) REFERENCES users(id),
    UNIQUE KEY uk_rfi_number (org_id, project_id, rfi_number),
    INDEX idx_status (status),
    INDEX idx_dates (submitted_date, required_by_date)
);

-- Daily Site Reports
CREATE TABLE daily_site_reports (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    org_id INT NOT NULL,
    project_id BIGINT NOT NULL,
    report_date DATE NOT NULL,
    report_number VARCHAR(50) NOT NULL,
    weather_conditions VARCHAR(200),
    max_temp DECIMAL(6,2),
    min_temp DECIMAL(6,2),
    rainfall_mm DECIMAL(6,2),
    humidity_percent DECIMAL(5,2),
    wind_conditions VARCHAR(100),
    overall_progress TEXT,
    key_achievements TEXT,
    challenges_issues TEXT,
    activities_completed JSON,
    activities_in_progress JSON,
    activities_planned JSON,
    manpower_on_site JSON,
    equipment_on_site JSON,
    materials_delivered JSON,
    materials_consumed JSON,
    inspections_conducted JSON,
    tests_conducted JSON,
    safety_incidents JSON,
    delays TEXT,
    approvals_obtained JSON,
    photos JSON,
    next_day_plan TEXT,
    prepared_by INT NOT NULL,
    reviewed_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (org_id) REFERENCES organizations(id) ON DELETE CASCADE,
    FOREIGN KEY (project_id) REFERENCES construction_projects(id) ON DELETE CASCADE,
    FOREIGN KEY (prepared_by) REFERENCES users(id),
    FOREIGN KEY (reviewed_by) REFERENCES users(id),
    UNIQUE KEY uk_daily_report (org_id, project_id, report_date)
);
```

#### Planning, Stores, Production, Sales, Finance Tables
*Note: Detailed schemas for these modules will be provided in subsequent sections, following the modular pattern with org_id and unit_id isolation.*

#### Analytics & AI/ML Tables

```sql
-- KPI Definitions
CREATE TABLE kpi_definitions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    org_id INT NOT NULL,
    kpi_code VARCHAR(50) NOT NULL,
    kpi_name VARCHAR(200) NOT NULL,
    kpi_category ENUM('quality', 'production', 'efficiency', 'cost', 'safety', 'sales', 'inventory', 'customer_satisfaction') NOT NULL,
    description TEXT,
    calculation_formula TEXT,
    uom VARCHAR(20),
    target_value DECIMAL(15,2),
    tolerance_percentage DECIMAL(5,2),
    frequency ENUM('daily', 'weekly', 'monthly', 'quarterly', 'annually') DEFAULT 'monthly',
    data_source VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (org_id) REFERENCES organizations(id) ON DELETE CASCADE,
    UNIQUE KEY uk_kpi_code (org_id, kpi_code),
    INDEX idx_category (kpi_category),
    INDEX idx_active (is_active)
);

-- KPI Values
CREATE TABLE kpi_values (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    kpi_id INT NOT NULL,
    org_id INT NOT NULL,
    unit_id INT,
    record_date DATE NOT NULL,
    actual_value DECIMAL(15,2),
    target_value DECIMAL(15,2),
    variance DECIMAL(15,2),
    variance_percentage DECIMAL(5,2),
    achievement_percentage DECIMAL(5,2),
    status ENUM('below_target', 'on_target', 'above_target') DEFAULT 'on_target',
    trend ENUM('improving', 'stable', 'declining'),
    notes TEXT,
    calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (kpi_id) REFERENCES kpi_definitions(id) ON DELETE CASCADE,
    FOREIGN KEY (org_id) REFERENCES organizations(id) ON DELETE CASCADE,
    FOREIGN KEY (unit_id) REFERENCES manufacturing_units(id) ON DELETE CASCADE,
    UNIQUE KEY uk_kpi_date (kpi_id, org_id, unit_id, record_date),
    INDEX idx_record_date (record_date)
);

-- KRA (Key Result Areas) Definitions
CREATE TABLE kra_definitions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    org_id INT NOT NULL,
    kra_code VARCHAR(50) NOT NULL,
    kra_name VARCHAR(200) NOT NULL,
    kra_category VARCHAR(100),
    description TEXT,
    weightage_percentage DECIMAL(5,2) DEFAULT 0,
    period ENUM('monthly', 'quarterly', 'half_yearly', 'annually') DEFAULT 'quarterly',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (org_id) REFERENCES organizations(id) ON DELETE CASCADE,
    UNIQUE KEY uk_kra_code (org_id, kra_code)
);

-- AI/ML Models
CREATE TABLE ml_models (
    id INT PRIMARY KEY AUTO_INCREMENT,
    org_id INT NOT NULL,
    model_code VARCHAR(50) NOT NULL,
    model_name VARCHAR(200) NOT NULL,
    model_type ENUM('forecast', 'classification', 'regression', 'anomaly_detection', 'recommendation', 'clustering') NOT NULL,
    target_variable VARCHAR(100),
    input_features JSON COMMENT 'List of input features',
    algorithm VARCHAR(100),
    model_version VARCHAR(20),
    accuracy_score DECIMAL(5,4),
    precision_score DECIMAL(5,4),
    recall_score DECIMAL(5,4),
    f1_score DECIMAL(5,4),
    last_trained_at TIMESTAMP NULL,
    next_training_date DATE,
    training_frequency_days INT,
    is_active BOOLEAN DEFAULT TRUE,
    model_file_path VARCHAR(500),
    training_data_source VARCHAR(200),
    model_parameters JSON,
    feature_importance JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (org_id) REFERENCES organizations(id) ON DELETE CASCADE,
    UNIQUE KEY uk_model_code (org_id, model_code),
    INDEX idx_type (model_type),
    INDEX idx_active (is_active)
);

-- Predictions
CREATE TABLE predictions (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    org_id INT NOT NULL,
    unit_id INT,
    model_id INT NOT NULL,
    prediction_type ENUM('demand', 'production', 'quality', 'equipment_failure', 'inventory', 'price', 'sales', 'anomaly') NOT NULL,
    entity_type VARCHAR(50),
    entity_id BIGINT,
    prediction_date TIMESTAMP NOT NULL,
    prediction_horizon_days INT,
    predicted_value DECIMAL(15,2),
    confidence_lower DECIMAL(15,2),
    confidence_upper DECIMAL(15,2),
    confidence_percentage DECIMAL(5,2),
    input_data JSON,
    actual_value DECIMAL(15,2),
    actual_recorded_at TIMESTAMP NULL,
    accuracy_percentage DECIMAL(5,2),
    status ENUM('predicted', 'actual_recorded', 'verified', 'expired') DEFAULT 'predicted',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (org_id) REFERENCES organizations(id) ON DELETE CASCADE,
    FOREIGN KEY (unit_id) REFERENCES manufacturing_units(id) ON DELETE CASCADE,
    FOREIGN KEY (model_id) REFERENCES ml_models(id),
    INDEX idx_prediction_date (prediction_date),
    INDEX idx_type (prediction_type),
    INDEX idx_entity (entity_type, entity_id),
    INDEX idx_status (status)
);

-- Anomalies Detected
CREATE TABLE anomalies (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    org_id INT NOT NULL,
    unit_id INT,
    anomaly_type ENUM('quality', 'production', 'equipment', 'inventory', 'sales', 'financial', 'process') NOT NULL,
    severity ENUM('low', 'medium', 'high', 'critical') NOT NULL,
    detected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    entity_type VARCHAR(50),
    entity_id BIGINT,
    anomaly_description TEXT,
    expected_value DECIMAL(15,2),
    actual_value DECIMAL(15,2),
    deviation_percentage DECIMAL(5,2),
    anomaly_score DECIMAL(10,4),
    confidence_percentage DECIMAL(5,2),
    model_id INT,
    probable_cause TEXT,
    recommended_action TEXT,
    status ENUM('detected', 'investigating', 'resolved', 'false_positive', 'ignored') DEFAULT 'detected',
    investigated_by INT,
    investigation_summary TEXT,
    resolution_summary TEXT,
    resolved_by INT,
    resolved_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (org_id) REFERENCES organizations(id) ON DELETE CASCADE,
    FOREIGN KEY (unit_id) REFERENCES manufacturing_units(id) ON DELETE CASCADE,
    FOREIGN KEY (model_id) REFERENCES ml_models(id),
    FOREIGN KEY (investigated_by) REFERENCES users(id),
    FOREIGN KEY (resolved_by) REFERENCES users(id),
    INDEX idx_type (anomaly_type),
    INDEX idx_severity (severity),
    INDEX idx_detected_at (detected_at),
    INDEX idx_status (status)
);
```

[... continued in next part due to length ...]

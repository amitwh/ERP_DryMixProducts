# ERP DryMix Products - API Documentation

## Table of Contents
1. [Introduction](#introduction)
2. [Authentication](#authentication)
3. [API Endpoints](#api-endpoints)
4. [Request/Response Format](#requestresponse-format)
5. [Error Handling](#error-handling)
6. [Rate Limiting](#rate-limiting)
7. [Examples](#examples)

---

## Introduction

### Base URL
```
Production: https://erp.yourcompany.com/api/v1
Development: http://localhost:8000/api/v1
```

### API Version
```
Current Version: v1.0.0
```

### Supported Formats
```
Request: JSON (application/json)
Response: JSON (application/json)
```

---

## Authentication

### Login

**Endpoint:** `POST /auth/login`

**Request Body:**
```json
{
  "email": "admin@erp.com",
  "password": "admin123",
  "device_name": "Web Browser",
  "device_type": "web"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": 1,
      "name": "Super Admin",
      "email": "admin@erp.com",
      "organization_id": 1,
      "role": "super-admin"
    },
    "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
    "token_type": "Bearer",
    "expires_in": 7200
  }
}
```

### Logout

**Endpoint:** `POST /auth/logout`

**Headers:**
```
Authorization: Bearer {access_token}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

### Refresh Token

**Endpoint:** `POST /auth/refresh`

**Headers:**
```
Authorization: Bearer {access_token}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Token refreshed",
  "data": {
    "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
    "token_type": "Bearer",
    "expires_in": 7200
  }
}
```

---

## API Endpoints

### Authentication Endpoints

#### Login
```
POST /auth/login
```
Authenticates user and returns access token.

#### Logout
```
POST /auth/logout
```
Logs out current user and invalidates token.

#### Refresh Token
```
POST /auth/refresh
```
Refreshes access token using current token.

#### Me
```
GET /auth/me
```
Returns current authenticated user information.

---

### Dashboard Endpoints

#### Get Dashboard Data
```
GET /dashboard
```
Returns dashboard KPIs and metrics.

**Query Parameters:**
- `period`: 7d, 30d, 90d, 1y (default: 30d)
- `organization_id`: Filter by organization

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "total_revenue": 12500000,
    "total_orders": 1234,
    "pending_orders": 56,
    "overdue_invoices": 23,
    "revenue_trend": [120000, 150000, 180000, ...],
    "orders_by_status": {
      "pending": 56,
      "processing": 123,
      "completed": 890,
      "cancelled": 45
    },
    "top_products": [...],
    "recent_activity": [...]
  }
}
```

---

### User Endpoints

#### Get Users
```
GET /users
```
Returns list of users.

**Query Parameters:**
- `page`: Page number (default: 1)
- `per_page`: Items per page (default: 15)
- `search`: Search by name or email
- `role`: Filter by role
- `organization_id`: Filter by organization
- `status`: Filter by status (active, inactive)

#### Create User
```
POST /users
```
Creates a new user.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john.doe@company.com",
  "password": "SecurePassword123!",
  "phone": "+91-9876543210",
  "department": "Sales",
  "role": "admin",
  "organization_id": 1,
  "status": "active"
}
```

#### Get User
```
GET /users/{id}
```
Returns user details.

#### Update User
```
PUT /users/{id}
```
Updates user information.

#### Delete User
```
DELETE /users/{id}
```
Deletes user (soft delete).

---

### Product Endpoints

#### Get Products
```
GET /products
```
Returns list of products.

**Query Parameters:**
- `page`: Page number
- `per_page`: Items per page
- `search`: Search by name or code
- `category_id`: Filter by category
- `status`: Filter by status
- `organization_id`: Filter by organization

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "product_code": "DM-001",
      "name": "Ready Mix Concrete M20",
      "category": {
        "id": 1,
        "name": "Concrete"
      },
      "description": "High strength ready mix concrete",
      "uom": "MT",
      "selling_price": 4500.00,
      "cost_price": 3800.00,
      "status": "active",
      "created_at": "2026-01-15T10:00:00Z"
    }
  ],
  "meta": {
    "current_page": 1,
    "per_page": 15,
    "total": 150,
    "last_page": 10
  }
}
```

#### Create Product
```
POST /products
```
Creates a new product.

**Request Body:**
```json
{
  "product_code": "DM-001",
  "name": "Ready Mix Concrete M20",
  "category_id": 1,
  "description": "High strength ready mix concrete",
  "uom": "MT",
  "selling_price": 4500.00,
  "cost_price": 3800.00,
  "organization_id": 1
}
```

#### Get Product
```
GET /products/{id}
```
Returns product details with BOM and specifications.

#### Update Product
```
PUT /products/{id}
```
Updates product information.

#### Delete Product
```
DELETE /products/{id}
```
Deletes product (soft delete).

---

### Sales Order Endpoints

#### Get Sales Orders
```
GET /sales-orders
```
Returns list of sales orders.

**Query Parameters:**
- `page`: Page number
- `per_page`: Items per page
- `search`: Search by order number or customer
- `customer_id`: Filter by customer
- `status`: Filter by status
- `from_date`: Filter by order date (from)
- `to_date`: Filter by order date (to)
- `organization_id`: Filter by organization

#### Create Sales Order
```
POST /sales-orders
```
Creates a new sales order.

**Request Body:**
```json
{
  "customer_id": 1,
  "order_date": "2026-01-15",
  "delivery_date": "2026-01-20",
  "delivery_address": "123 Construction Site",
  "payment_terms": "NET 30",
  "items": [
    {
      "product_id": 1,
      "quantity": 50,
      "unit_price": 4500.00,
      "discount": 0
    },
    {
      "product_id": 2,
      "quantity": 30,
      "unit_price": 4200.00,
      "discount": 5
    }
  ],
  "notes": "Urgent delivery required",
  "organization_id": 1
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Sales order created successfully",
  "data": {
    "id": 1001,
    "order_number": "SO-2026-0001",
    "customer": {
      "id": 1,
      "name": "ABC Construction Pvt Ltd"
    },
    "order_date": "2026-01-15",
    "delivery_date": "2026-01-20",
    "subtotal": 351000.00,
    "tax_amount": 63180.00,
    "grand_total": 414180.00,
    "status": "draft",
    "items": [...]
  }
}
```

#### Get Sales Order
```
GET /sales-orders/{id}
```
Returns sales order details.

#### Update Sales Order
```
PUT /sales-orders/{id}
```
Updates sales order (only if status is 'draft').

#### Delete Sales Order
```
DELETE /sales-orders/{id}
```
Deletes sales order (only if status is 'draft').

#### Submit Sales Order
```
POST /sales-orders/{id}/submit
```
Submits sales order for processing.

#### Approve Sales Order
```
POST /sales-orders/{id}/approve
```
Approves sales order.

#### Reject Sales Order
```
POST /sales-orders/{id}/reject
```
Rejects sales order.

#### Cancel Sales Order
```
POST /sales-orders/{id}/cancel
```
Cancels sales order.

---

### Invoice Endpoints

#### Get Invoices
```
GET /invoices
```
Returns list of invoices.

**Query Parameters:**
- `page`: Page number
- `per_page`: Items per page
- `search`: Search by invoice number or customer
- `customer_id`: Filter by customer
- `status`: Filter by status
- `from_date`: Filter by invoice date (from)
- `to_date`: Filter by invoice date (to)
- `organization_id`: Filter by organization

#### Create Invoice
```
POST /invoices
```
Creates a new invoice.

**Request Body:**
```json
{
  "sales_order_id": 1001,
  "invoice_date": "2026-01-15",
  "due_date": "2026-02-14",
  "items": [
    {
      "product_id": 1,
      "quantity": 50,
      "unit_price": 4500.00
    }
  ],
  "notes": "Payment due within 30 days"
}
```

#### Get Invoice
```
GET /invoices/{id}
```
Returns invoice details.

#### Update Invoice
```
PUT /invoices/{id}
```
Updates invoice (only if status is 'draft').

#### Delete Invoice
```
DELETE /invoices/{id}
```
Deletes invoice.

#### Print Invoice
```
GET /invoices/{id}/print
```
Generates printable invoice PDF.

#### Send Invoice Email
```
POST /invoices/{id}/send-email
```
Sends invoice to customer via email.

---

### Production Order Endpoints

#### Get Production Orders
```
GET /production/orders
```
Returns list of production orders.

**Query Parameters:**
- `page`: Page number
- `per_page`: Items per page
- `search`: Search by order number or product
- `product_id`: Filter by product
- `status`: Filter by status
- `from_date`: Filter by order date (from)
- `to_date`: Filter by order date (to)
- `warehouse_id`: Filter by warehouse
- `organization_id`: Filter by organization

#### Create Production Order
```
POST /production/orders
```
Creates a new production order.

**Request Body:**
```json
{
  "product_id": 1,
  "target_quantity": 100,
  "uom": "MT",
  "order_date": "2026-01-15",
  "start_date": "2026-01-16",
  "end_date": "2026-01-18",
  "priority": "normal",
  "warehouse_id": 1,
  "notes": "Standard production run"
}
```

#### Get Production Order
```
GET /production/orders/{id}
```
Returns production order details with BOM.

#### Start Production Order
```
POST /production/orders/{id}/start
```
Starts production order and creates production batch.

#### Complete Production Order
```
POST /production/orders/{id}/complete
```
Marks production order as completed.

#### Cancel Production Order
```
POST /production/orders/{id}/cancel
```
Cancels production order.

---

### Quality Inspection Endpoints

#### Get Quality Inspections
```
GET /quality/inspections
```
Returns list of quality inspections.

**Query Parameters:**
- `page`: Page number
- `per_page`: Items per page
- `search`: Search by inspection number
- `product_id`: Filter by product
- `batch_id`: Filter by batch
- `type`: Filter by inspection type
- `status`: Filter by status
- `from_date`: Filter by inspection date (from)
- `to_date`: Filter by inspection date (to)
- `organization_id`: Filter by organization

#### Create Quality Inspection
```
POST /quality/inspections
```
Creates a new quality inspection.

**Request Body:**
```json
{
  "product_id": 1,
  "batch_id": 10,
  "inspection_type": "finished_product",
  "inspection_date": "2026-01-15",
  "inspection_standard": "IS:10262-2019",
  "test_parameters": [
    {
      "parameter_name": "Compressive Strength",
      "test_method": "IS:516",
      "min_value": 20.0,
      "max_value": 25.0,
      "unit": "N/mm²",
      "actual_value": 22.5,
      "result": "pass"
    },
    {
      "parameter_name": "Slump",
      "test_method": "IS:1199",
      "min_value": 50,
      "max_value": 100,
      "unit": "mm",
      "actual_value": 75,
      "result": "pass"
    }
  ],
  "inspector_id": 5,
  "notes": "All tests within specification"
}
```

#### Get Quality Inspection
```
GET /quality/inspections/{id}
```
Returns inspection details with all test results.

#### Update Quality Inspection
```
PUT /quality/inspections/{id}
```
Updates inspection (only if status is 'pending').

#### Submit Quality Inspection
```
POST /quality/inspections/{id}/submit
```
Submits inspection for review.

#### Approve Quality Inspection
```
POST /quality/inspections/{id}/approve
```
Approves inspection.

#### Reject Quality Inspection
```
POST /quality/inspections/{id}/reject
```
Rejects inspection.

---

### Inventory Endpoints

#### Get Stock
```
GET /inventory/stock
```
Returns current stock levels.

**Query Parameters:**
- `warehouse_id`: Filter by warehouse
- `product_id`: Filter by product
- `category_id`: Filter by category
- `organization_id`: Filter by organization

#### Create Stock Transfer
```
POST /inventory/transfers
```
Creates a new stock transfer.

**Request Body:**
```json
{
  "from_warehouse_id": 1,
  "to_warehouse_id": 2,
  "transfer_date": "2026-01-15",
  "items": [
    {
      "product_id": 1,
      "quantity": 50
    },
    {
      "product_id": 2,
      "quantity": 30
    }
  ],
  "notes": "Stock replenishment"
}
```

#### Create Stock Adjustment
```
POST /inventory/adjustments
```
Creates a new stock adjustment.

**Request Body:**
```json
{
  "warehouse_id": 1,
  "adjustment_date": "2026-01-15",
  "reason": "damage",
  "items": [
    {
      "product_id": 1,
      "current_quantity": 100,
      "adjusted_quantity": 95,
      "difference": -5,
      "reason": "Damaged during handling"
    }
  ]
}
```

---

## Request/Response Format

### Request Format

All requests must include:

1. **Content-Type:** `application/json`
2. **Authorization:** `Bearer {access_token}` (except for login)
3. **Accept:** `application/json`

**Example Request:**
```bash
curl -X POST https://erp.yourcompany.com/api/v1/sales-orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGc..." \
  -H "Accept: application/json" \
  -d '{
    "customer_id": 1,
    "order_date": "2026-01-15",
    "items": [...]
  }'
```

### Response Format

All responses follow this structure:

**Success Response:**
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

**Paginated Response:**
```json
{
  "success": true,
  "data": [ ... ],
  "meta": {
    "current_page": 1,
    "per_page": 15,
    "total": 150,
    "last_page": 10
  }
}
```

---

## Error Handling

### Error Response Format

```json
{
  "success": false,
  "message": "Error message",
  "errors": {
    "field_name": [
      "Error message for this field"
    ]
  }
}
```

### HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | OK - Request successful |
| 201 | Created - Resource created successfully |
| 204 | No Content - Resource deleted successfully |
| 400 | Bad Request - Invalid request data |
| 401 | Unauthorized - Invalid or missing token |
| 403 | Forbidden - User doesn't have permission |
| 404 | Not Found - Resource not found |
| 422 | Validation Error - Input validation failed |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error - Server error |
| 503 | Service Unavailable - Server is down for maintenance |

### Common Errors

#### 401 Unauthorized
```json
{
  "success": false,
  "message": "Unauthenticated."
}
```
**Solution:** Login again to get new access token.

#### 403 Forbidden
```json
{
  "success": false,
  "message": "You do not have permission to access this resource."
}
```
**Solution:** Contact administrator to grant required permissions.

#### 404 Not Found
```json
{
  "success": false,
  "message": "Resource not found."
}
```
**Solution:** Verify the URL and resource ID.

#### 422 Validation Error
```json
{
  "success": false,
  "message": "The given data was invalid.",
  "errors": {
    "email": [
      "The email field is required."
    ],
    "password": [
      "The password must be at least 8 characters."
    ]
  }
}
```
**Solution:** Fix validation errors and resubmit.

---

## Rate Limiting

### Rate Limit Policy

- **Default:** 100 requests per minute per IP
- **Authenticated:** 1000 requests per minute per user
- **Burst:** Allow burst of up to 10 requests

### Rate Limit Headers

All responses include rate limit headers:

```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 950
X-RateLimit-Reset: 1642263600
```

### Handling Rate Limiting

When rate limit is exceeded:

**Status:** 429 Too Many Requests
```json
{
  "success": false,
  "message": "Too many requests. Please try again later.",
  "retry_after": 60
}
```

**Solution:** Implement exponential backoff and retry after `retry_after` seconds.

---

## Examples

### Example 1: Complete Sales Order Flow

#### 1. Login
```bash
curl -X POST https://erp.yourcompany.com/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@erp.com",
    "password": "admin123",
    "device_name": "Web Browser"
  }'
```

#### 2. Get Products
```bash
curl -X GET https://erp.yourcompany.com/api/v1/products \
  -H "Authorization: Bearer {access_token}"
```

#### 3. Create Sales Order
```bash
curl -X POST https://erp.yourcompany.com/api/v1/sales-orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {access_token}" \
  -d '{
    "customer_id": 1,
    "order_date": "2026-01-15",
    "delivery_date": "2026-01-20",
    "items": [
      {
        "product_id": 1,
        "quantity": 50,
        "unit_price": 4500.00
      }
    ]
  }'
```

#### 4. Get Order Details
```bash
curl -X GET https://erp.yourcompany.com/api/v1/sales-orders/1001 \
  -H "Authorization: Bearer {access_token}"
```

#### 5. Submit Order
```bash
curl -X POST https://erp.yourcompany.com/api/v1/sales-orders/1001/submit \
  -H "Authorization: Bearer {access_token}"
```

### Example 2: Production Flow

#### 1. Create Production Order
```bash
curl -X POST https://erp.yourcompany.com/api/v1/production/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {access_token}" \
  -d '{
    "product_id": 1,
    "target_quantity": 100,
    "uom": "MT",
    "order_date": "2026-01-15",
    "start_date": "2026-01-16",
    "warehouse_id": 1
  }'
```

#### 2. Start Production
```bash
curl -X POST https://erp.yourcompany.com/api/v1/production/orders/1/start \
  -H "Authorization: Bearer {access_token}"
```

#### 3. Update Batch Progress
```bash
curl -X PUT https://erp.yourcompany.com/api/v1/production/batches/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {access_token}" \
  -d '{
    "current_quantity": 50,
    "progress_percentage": 50.0,
    "status": "in_progress"
  }'
```

### Example 3: Quality Inspection

#### 1. Create Inspection
```bash
curl -X POST https://erp.yourcompany.com/api/v1/quality/inspections \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {access_token}" \
  -d '{
    "product_id": 1,
    "batch_id": 10,
    "inspection_type": "finished_product",
    "test_parameters": [
      {
        "parameter_name": "Compressive Strength",
        "actual_value": 22.5,
        "result": "pass"
      }
    ]
  }'
```

#### 2. Submit Inspection
```bash
curl -X POST https://erp.yourcompany.com/api/v1/quality/inspections/1/submit \
  -H "Authorization: Bearer {access_token}"
```

#### 3. Get Certificate
```bash
curl -X GET https://erp.yourcompany.com/api/v1/quality/inspections/1/certificate \
  -H "Authorization: Bearer {access_token}" \
  --output certificate.pdf
```

---

## Best Practices

1. **Use HTTPS:** Always use HTTPS in production
2. **Handle Errors:** Implement proper error handling
3. **Cache Responses:** Cache GET requests when appropriate
4. **Use Pagination:** Use pagination for large datasets
5. **Validate Inputs:** Validate all inputs before sending
6. **Rate Limiting:** Respect rate limits and implement backoff
7. **Refresh Tokens:** Refresh tokens before expiry
8. **Log Requests:** Log API requests for debugging
9. **Monitor Performance:** Monitor API response times
10. **Version Your Client:** Version your API client for compatibility

---

## Support

For API support or questions:
- **Email:** api-support@erp.com
- **Documentation:** https://docs.erp.com
- **Status Page:** https://status.erp.com

---

*Version: 1.0.0*
*Last Updated: 2026-01-15*

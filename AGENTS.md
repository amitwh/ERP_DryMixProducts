# AGENTS.md - ERP DryMix Products Development Guide

## Project Overview

**ERP DryMix Products** is a comprehensive Enterprise Resource Planning system for cementitious dry mix manufacturing industry.

- **Backend**: Laravel 10+ (PHP 8.1+)
- **Frontend**: React 18+ + TypeScript + Vite
- **Database**: MariaDB 10.11+
- **Cache/Queue**: Redis 7+
- **Architecture**: Modular monolith with multi-tenancy support

## Essential Commands

### Backend (Laravel)

```bash
# Navigate to backend
cd backend

# Install dependencies
composer install

# Run development server
php artisan serve

# Run database migrations
php artisan migrate

# Fresh migration with seeding
php artisan migrate:fresh --seed

# Create new migration
php artisan make:migration create_table_name

# Create new controller
php artisan make:controller Api/SomeController

# Create new model
php artisan make:model SomeModel

# Clear caches
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear

# Run tests
php artisan test

# Generate application key
php artisan key:generate

# Create storage link
php artisan storage:link
```

### Frontend (React + TypeScript)

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint
```

### Docker Operations

```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# View logs
docker-compose logs -f [service_name]

# Rebuild specific service
docker-compose build [service_name]

# Execute command in container
docker-compose exec backend php artisan migrate
docker-compose exec frontend npm install
```

### Testing

```bash
# Backend tests
cd backend
php artisan test
vendor/bin/phpunit

# Frontend tests (when configured)
cd frontend
npm test
```

## Code Organization

### Backend Structure

```
backend/
├── app/
│   ├── Console/           # Artisan commands
│   ├── Exceptions/         # Exception handlers
│   ├── Http/
│   │   ├── Controllers/
│   │   │   └── Api/       # API controllers (RESTful)
│   │   ├── Middleware/     # Custom middleware
│   │   └── Kernel.php     # HTTP kernel
│   ├── Models/            # Eloquent models with relationships
│   ├── Providers/         # Service providers
│   └── Services/          # Business logic services
│       └── Python/        # Python integration scripts
├── config/                # Laravel configuration files
├── database/
│   ├── migrations/        # Database migrations
│   ├── seeders/          # Database seeders
│   └── factories/        # Model factories
├── routes/
│   ├── api.php           # API routes (primary)
│   └── web.php           # Web routes
├── tests/
│   ├── Unit/             # Unit tests
│   └── Feature/          # Feature tests
└── storage/              # Application storage
```

### Frontend Structure

```
frontend/
├── src/
│   ├── components/       # Reusable React components
│   ├── pages/           # Page components (routes)
│   ├── hooks/           # Custom React hooks
│   ├── services/        # API services
│   ├── types/           # TypeScript type definitions
│   ├── utils/           # Utility functions
│   ├── App.tsx          # Root component
│   └── main.tsx         # Entry point
├── public/              # Static assets
└── dist/               # Build output (generated)
```

## Naming Conventions

### Backend (Laravel)

#### Models
- Singular, PascalCase: `User`, `Product`, `SalesOrder`
- File: `app/Models/User.php`
- Database table: plural, snake_case: `users`, `products`, `sales_orders`

#### Controllers
- Singular, PascalCase + "Controller": `DashboardController`, `ProductController`
- File: `app/Http/Controllers/Api/ProductController.php`
- Namespace: `App\Http\Controllers\Api`

#### Migrations
- Timestamped, snake_case, descriptive: `2025_01_01_000000_create_products_table.php`

#### Routes
- RESTful resource routes: `Route::apiResource('products', ProductController::class)`
- Custom routes: kebab-case: `products/{product}/activate`
- API versioning: `/api/v1/...`

#### Variables/Methods
- camelCase: `$userName`, `getUsers()`, `calculateTotal()`
- Constants: UPPER_SNAKE_CASE: `MAX_ATTEMPTS`, `DEFAULT_STATUS`

### Frontend (React + TypeScript)

#### Components
- PascalCase: `DashboardCard`, `KPICard`, `NotificationPanel`
- File: `src/components/DashboardCard.tsx`
- Export: `export default function DashboardCard()`

#### Hooks
- camelCase with "use" prefix: `useDashboardData`, `useKPIMetrics`
- File: `src/hooks/useDashboardData.ts`

#### Services
- camelCase: `apiService`, `dashboardService`
- File: `src/services/apiService.ts`

#### Types/Interfaces
- PascalCase: `User`, `DashboardData`, `KPIMetric`
- File: `src/types/index.ts`

#### Files/Folders
- PascalCase for components: `src/pages/Dashboard.tsx`
- kebab-case for utilities: `src/utils/format-date.ts`

## Code Patterns and Conventions

### Backend Patterns

#### Model Structure

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;

class Product extends Model
{
    use HasFactory, SoftDeletes, LogsActivity;

    protected $fillable = [
        'organization_id',
        'name',
        'code',
        // ...
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
        'specifications' => 'array',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    // Relationships
    public function organization()
    {
        return $this->belongsTo(Organization::class);
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeByOrganization($query, $organizationId)
    {
        return $query->where('organization_id', $organizationId);
    }

    // Accessors
    public function getIsActiveAttribute()
    {
        return $this->status === 'active';
    }

    // Activity Logging
    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['name', 'code', 'status'])
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs();
    }
}
```

#### Controller Structure

```php
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ProductController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $organizationId = $request->get('organization_id');

        $products = Product::query()
            ->when($organizationId, fn($q) => $q->where('organization_id', $organizationId))
            ->with(['organization'])
            ->paginate($request->get('per_page', 20));

        return response()->json([
            'success' => true,
            'data' => $products,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|unique:products,code',
            'organization_id' => 'required|exists:organizations,id',
        ]);

        $product = Product::create($validated);

        return response()->json([
            'success' => true,
            'data' => $product,
            'message' => 'Product created successfully',
        ], 201);
    }

    public function show(Product $product): JsonResponse
    {
        $product->load(['organization', 'productionOrders']);

        return response()->json([
            'success' => true,
            'data' => $product,
        ]);
    }

    public function update(Request $request, Product $product): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'code' => 'sometimes|string|unique:products,code,' . $product->id,
        ]);

        $product->update($validated);

        return response()->json([
            'success' => true,
            'data' => $product,
            'message' => 'Product updated successfully',
        ]);
    }

    public function destroy(Product $product): JsonResponse
    {
        $product->delete();

        return response()->json([
            'success' => true,
            'message' => 'Product deleted successfully',
        ]);
    }
}
```

#### API Response Format

```php
// Success response
return response()->json([
    'success' => true,
    'data' => $resource,
    'message' => 'Operation successful',
]);

// Error response
return response()->json([
    'success' => false,
    'message' => 'Error occurred',
    'errors' => $validator->errors(),
], 422);
```

### Frontend Patterns

#### Component Structure

```tsx
import React, { useState, useEffect } from 'react';
import { SomeIcon } from 'lucide-react';
import { DashboardCard } from '../components';

interface DashboardProps {
  title?: string;
}

export default function Dashboard({ title = 'Dashboard' }: DashboardProps) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/v1/dashboard/overview', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        }
      });
      const result = await response.json();
      if (result.success) {
        setData(result.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <DashboardCard title={title} data={data} />
      </div>
    </div>
  );
}
```

#### API Service Pattern

```typescript
// src/services/apiService.ts
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.VITE_API_URL || 'http://localhost:8100/api/v1',
  timeout: 10000,
});

// Request interceptor for auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

// Usage
export const dashboardService = {
  getOverview: () => api.get('/dashboard/overview'),
  getSalesTrend: (months: number = 6) =>
    api.get(`/dashboard/sales-trend?months=${months}`),
};
```

## Testing Approach

### Backend Testing

```bash
# Run all tests
php artisan test

# Run specific test file
php artisan test --filter ProductControllerTest

# Run with coverage
php artisan test --coverage
```

### Frontend Testing

```bash
# Run tests (when configured)
npm test

# Run with coverage
npm test -- --coverage
```

## Important Gotchas

### Multi-Tenancy

- **All** queries must filter by `organization_id`
- Use `$request->get('organization_id')` or `auth()->user()->organization_id`
- Implement `scopeByOrganization()` on all models
- Never query without organization scoping

### Soft Deletes

- Most models use soft deletes via `SoftDeletes` trait
- Use `withTrashed()`, `onlyTrashed()`, `restore()` when needed
- Check `deleted_at` column before assuming record doesn't exist

### API Authentication

- Uses Laravel Sanctum for token-based authentication
- Routes require `auth:sanctum` middleware
- Tokens stored in localStorage on frontend
- Include token in Authorization header: `Bearer {token}`

### Database Relationships

- Always eager load relationships when displaying data: `with(['organization', 'products'])`
- Use explicit foreign keys in migrations: `$table->foreignId('organization_id')->constrained()->onDelete('cascade')`
- Cascade deletes are enabled for most relationships

### JSON Columns

- MariaDB JSON columns for flexible data storage
- Cast JSON columns to array in model: `'specifications' => 'array'`
- Access JSON properties: `$product->specifications['key']`

### Activity Logging

- Use Spatie Activitylog for audit trails
- Implement `getActivitylogOptions()` in models
- Log only relevant fields with `logOnly()`
- Log changes only with `logOnlyDirty()`

### Docker Port Conflicts

- Backend uses port 8100 (internal 8000)
- Frontend uses port 3100 (internal 80)
- Modify docker-compose.yml if ports conflict
- Use `docker ps` to check port usage

### External Dependencies

- Redis for caching and queues
- MariaDB from `general_server_configs` container
- Python services in separate container
- Grafana for analytics dashboard

### CORS Configuration

- Frontend running on different port
- Configure CORS in `config/cors.php`
- Allow frontend origin in CORS settings

## Environment Configuration

### Backend (.env)

```env
APP_NAME="ERP DryMix"
APP_ENV=local
APP_DEBUG=true
APP_URL=http://localhost:8100

DB_CONNECTION=mysql
DB_HOST=general_server_configs
DB_PORT=3306
DB_DATABASE=db_erp_drymix_prod
DB_USERNAME=amit
DB_PASSWORD=angles

REDIS_HOST=general_server_configs
REDIS_PORT=6379
REDIS_PASSWORD=angles
```

### Frontend (.env)

```env
VITE_API_URL=http://localhost:8100/api/v1
VITE_APP_NAME=ERP_DryMix
```

## Development Workflow

1. **Create feature branch**: `git checkout -b feature/feature-name`
2. **Make changes**: Implement feature, write tests
3. **Test locally**: Run backend and frontend tests
4. **Commit**: `git add . && git commit -m "Feature: description"`
5. **Push**: `git push origin feature/feature-name`
6. **Create PR**: Review and merge to main

## Git Commit Conventions

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes (formatting)
- `refactor:` Code refactoring
- `test:` Adding or updating tests
- `chore:` Maintenance tasks
- `perf:` Performance improvements

## Module Coverage

The ERP consists of 21 modules across 3 categories:

### Core Foundation (4 modules)
1. User & Access Management
2. Dashboard & Analytics
3. Settings & Configuration
4. Document Management

### Primary Modules (13 modules)
5. QA/QC Module
6. Planning Module
7. Stores & Inventory Module
8. Production Module
9. Sales & Customer Management
10. Procurement Module
11. Finance & Accounting
12. HR & Payroll
13. Analytics & Reporting
14. AI/ML & Predictions
15. Communications Module
16. Cloud Storage Integration
17. External ERP Integration
18. Plant Automation Integration

### Administrative Modules (3 modules)
19. Organization Management
20. System Administration
21. API & Integration Management

## Industry-Specific Context

### Products Covered
- Non-Shrink Grouts (ASTM C1107, IS 5129)
- Tile Adhesives (IS 15477, EN 12004)
- Wall Plasters (IS 2547, IS 1661, EN 998-1)
- Block Jointing Mortar (IS 2250, ASTM C270)
- Wall Putty (IS 5469, IS 15477)

### Quality Standards
- 40+ international standards supported
- IS (Indian Standards), ASTM (American), EN (European)
- Comprehensive test forms per product type
- Digital certificate generation with QR codes

### Multi-Organization
- Support for multiple organizations
- Multiple manufacturing units per organization
- Cross-organization transactions
- Role-based access control per organization

## Performance Considerations

- Use database indexes on frequently queried columns
- Implement pagination for large datasets
- Cache frequently accessed data with Redis
- Use queue for time-consuming operations
- Optimize N+1 queries with eager loading
- Implement rate limiting on API endpoints

## Security Best Practices

- Validate all user inputs
- Sanitize outputs (XSS prevention)
- Use prepared statements (Eloquent handles this)
- Implement CSRF protection on web routes
- Rate limit API endpoints
- Use HTTPS in production
- Never commit sensitive data (.env, API keys)
- Implement proper error handling without exposing details

## Common Issues and Solutions

### Migration Errors
- Solution: `php artisan migrate:fresh` (only in development)
- Check foreign key constraints
- Ensure `general_server_configs` container is running

### Authentication Issues
- Clear browser cookies and localStorage
- Regenerate API token
- Check Sanctum configuration

### Docker Container Issues
- Check port conflicts: `netstat -ano | findstr :8100`
- Rebuild container: `docker-compose down && docker-compose up --build`
- Check logs: `docker-compose logs -f backend`

### Frontend Build Errors
- Clear node_modules: `rm -rf node_modules && npm install`
- Check TypeScript errors
- Ensure all dependencies are installed

## Contact and Support

For questions or issues:
1. Check this AGENTS.md guide
2. Review IMPLEMENTATION_PLAN.md for detailed specifications
3. Check existing code patterns in similar files
4. Run tests to identify issues
5. Check logs for error messages

---

**Last Updated**: 2026-01-02
**Version**: 1.0.0

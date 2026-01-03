# Developer Guide - Post-Fix Implementation

**Updated**: January 3, 2026
**Status**: Critical Security Fixes Complete

---

## 🚀 Quick Start

### 1. Install Required Dependencies

```bash
cd frontend
npm install react-hook-form @hookform/resolvers zod @tanstack/react-query axios-retry
```

### 2. Update Root Component

Wrap your application with the new providers:

```tsx
// src/main.tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryProvider } from '@/providers/QueryProvider'
import { ErrorBoundary } from '@/components/common/ErrorBoundary'
import { AuthProvider } from '@/context/AuthContext'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <ErrorBoundary>
        <QueryProvider>
          <AuthProvider>
            <App />
          </AuthProvider>
        </QueryProvider>
      </ErrorBoundary>
    </BrowserRouter>
  </React.StrictMode>
)
```

### 3. Copy Environment Files

```bash
# Backend
cd backend
cp .env.example .env
php artisan key:generate

# Frontend
cd frontend
cp .env.example .env
```

---

## 📝 Usage Examples

### Form Validation

Using `react-hook-form` with `zod` schemas:

```tsx
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { customerSchema, type CustomerFormData } from '@/utils/validation'

const CreateCustomerPage = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
  })

  const onSubmit = async (data: CustomerFormData) => {
    try {
      await api.post('/customers', {
        ...data,
        credit_limit: parseFloat(data.credit_limit),
      })
      toast.success('Customer created successfully')
      // Navigate to list
    } catch (error) {
      // Error is handled by API interceptor
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* Customer Code */}
      <div>
        <label htmlFor="customer_code">Customer Code</label>
        <Input
          id="customer_code"
          {...register('customer_code')}
          error={errors.customer_code?.message}
        />
        {errors.customer_code && (
          <p className="text-error-500">{errors.customer_code.message}</p>
        )}
      </div>

      {/* Name */}
      <div>
        <label htmlFor="name">Customer Name</label>
        <Input
          id="name"
          {...register('name')}
          error={errors.name?.message}
        />
      </div>

      {/* Email */}
      <div>
        <label htmlFor="email">Email</label>
        <Input
          id="email"
          type="email"
          {...register('email')}
          error={errors.email?.message}
        />
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        isLoading={isSubmitting}
      >
        Create Customer
      </Button>
    </form>
  )
}
```

### Data Fetching with React Query

```tsx
import { useQuery } from '@tanstack/react-query'
import { api } from '@/services/api'
import { queryKeys } from '@/providers/QueryProvider'

const CustomersListPage = () => {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')

  // Fetch customers with React Query
  const { data, isLoading, error } = useQuery({
    queryKey: queryKeys.customers.list({ page, search }),
    queryFn: () =>
      api.get('/customers', {
        params: { page, search },
      }),
    // Cache for 5 minutes
    staleTime: 5 * 60 * 1000,
  })

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (error) {
    return <div>Error loading customers</div>
  }

  return (
    <div>
      {/* Search Input with Debouncing */}
      <SearchInput
        value={search}
        onChange={setSearch}
      />

      {/* Customer List */}
      <table>
        <thead>
          <tr>
            <th>Code</th>
            <th>Name</th>
            <th>Email</th>
          </tr>
        </thead>
        <tbody>
          {data?.data.map((customer) => (
            <tr key={customer.id}>
              <td>{customer.code}</td>
              <td>{customer.name}</td>
              <td>{customer.email}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
      <Pagination
        currentPage={page}
        totalPages={data?.meta.last_page || 1}
        onPageChange={setPage}
      />
    </div>
  )
}
```

### Debounced Search Input

```tsx
import { useState } from 'react'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import { Input } from '@/components/ui/Input'

const SearchInput = ({ value, onChange }) => {
  const [searchTerm, setSearchTerm] = useState(value)
  const debouncedSearchTerm = useDebouncedValue(searchTerm, 300)

  // Call onChange with debounced value
  useEffect(() => {
    onChange(debouncedSearchTerm)
  }, [debouncedSearchTerm, onChange])

  return (
    <Input
      type="text"
      placeholder="Search..."
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
    />
  )
}
```

### Format Utilities

```tsx
import {
  formatCurrency,
  formatDate,
  formatIndianNumber,
  formatPercentage,
} from '@/utils/format'

const OrderCard = ({ order }) => {
  return (
    <div className="card">
      <h3>{order.order_number}</h3>
      <p>Date: {formatDate(order.order_date)}</p>
      <p>Amount: {formatCurrency(order.total_amount)}</p>
      <p>Quantity: {formatIndianNumber(order.quantity)}</p>
      <p>Discount: {formatPercentage(order.discount_percentage)}</p>
    </div>
  )
}
```

### Error Handling with Error Boundary

```tsx
import { ErrorBoundary } from '@/components/common/ErrorBoundary'

const App = () => {
  return (
    <ErrorBoundary>
      <YourApplication />
    </ErrorBoundary>
  )
}
```

### API Calls (Automatic)

```tsx
import { api } from '@/services/api'

// GET request
const customers = await api.get('/customers')
// No need to handle token, refresh, errors separately

// POST request
const newCustomer = await api.post('/customers', customerData)

// PUT request
const updatedCustomer = await api.put(`/customers/${id}`, customerData)

// DELETE request
await api.delete(`/customers/${id}`)

// File upload
const result = await api.upload(
  '/upload',
  file,
  (progress) => console.log(`Upload progress: ${progress}%`)
)
```

---

## 🔧 Configuration

### Backend Configuration

Update your `.env` file:

```env
# Environment
APP_ENV=production
APP_DEBUG=false

# Database
DB_DATABASE=erp_drymix
DB_USERNAME=your_db_user
DB_PASSWORD=your_secure_password

# Frontend URLs (for CORS)
FRONTEND_URL=https://your-frontend.com
FRONTEND_URL_DEV=https://your-dev-frontend.com

# Session & Security
SESSION_SECURE_COOKIE=true
SANCTUM_STATEFUL_DOMAINS=your-frontend.com,localhost:3000
```

### Frontend Configuration

Update your `.env` file:

```env
# API Base URL
VITE_API_BASE_URL=https://your-backend.com/api/v1

# Environment
VITE_APP_ENV=production

# Feature Flags
VITE_ENABLE_DARK_MODE=true
VITE_ENABLE_NOTIFICATIONS=true
```

---

## 🎨 Common Patterns

### 1. Loading State with Skeleton

```tsx
import { Skeleton } from '@/components/ui/Loading'

const CustomerCard = ({ customer }) => {
  if (!customer) {
    return <SkeletonCard />
  }

  return <div>{customer.name}</div>
}
```

### 2. Optimistic Updates (React Query)

```tsx
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/providers/QueryProvider'

const CreateCustomer = () => {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (data) => api.post('/customers', data),

    // Optimistically update cache
    onMutate: async (newCustomer) => {
      await queryClient.cancelQueries(queryKeys.customers.lists())

      const previousCustomers =
        queryClient.getQueryData(queryKeys.customers.lists())

      queryClient.setQueryData(
        queryKeys.customers.lists(),
        (old) => [...old, { ...newCustomer, id: 'temp-id' }]
      )

      return { previousCustomers }
    },

    // Rollback on error
    onError: (err, newCustomer, context) => {
      queryClient.setQueryData(
        queryKeys.customers.lists(),
        context.previousCustomers
      )
    },

    // Refetch on success
    onSettled: () => {
      queryClient.invalidateQueries(queryKeys.customers.lists())
    },
  })

  const handleSubmit = (data) => {
    mutation.mutate(data)
  }
}
```

### 3. Infinite Scroll (React Query)

```tsx
import { useInfiniteQuery } from '@tanstack/react-query'
import { queryKeys } from '@/providers/QueryProvider'

const CustomersInfinite = () => {
  const { data, fetchNextPage, hasNextPage, isFetching } =
    useInfiniteQuery({
      queryKey: queryKeys.customers.lists(),
      queryFn: ({ pageParam = 1 }) =>
        api.get('/customers', { params: { page: pageParam } }),
      getNextPageParam: (lastPage) => {
        if (lastPage.meta.current_page < lastPage.meta.last_page) {
          return lastPage.meta.current_page + 1
        }
        return undefined
      },
    })

  const customers = data?.pages.flatMap((page) => page.data) || []

  return (
    <div>
      {customers.map((customer) => (
        <CustomerCard key={customer.id} customer={customer} />
      ))}

      {hasNextPage && (
        <Button
          onClick={() => fetchNextPage()}
          isLoading={isFetching}
        >
          Load More
        </Button>
      )}
    </div>
  )
}
```

### 4. Custom Hooks

```tsx
// hooks/useCustomers.ts
import { useQuery } from '@tanstack/react-query'
import { api } from '@/services/api'
import { queryKeys } from '@/providers/QueryProvider'

export const useCustomers = (filters?: Record<string, any>) => {
  return useQuery({
    queryKey: queryKeys.customers.list(filters),
    queryFn: () => api.get('/customers', { params: filters }),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Usage
const { data, isLoading, error } = useCustomers({
  search: searchTerm,
  status: 'active',
})
```

---

## 🐛 Troubleshooting

### Issue: Login not working

**Checklist**:
1. Backend CORS configured correctly?
2. Frontend API URL correct?
3. Browser console for errors?
4. Network tab for failed requests?

**Solution**:
```env
# Backend .env
FRONTEND_URL=http://localhost:3000
FRONTEND_URL_DEV=http://localhost:5173

# Frontend .env
VITE_API_BASE_URL=http://localhost:8100/api/v1
```

### Issue: Token refresh not working

**Checklist**:
1. httpOnly cookies enabled?
2. `/auth/refresh` endpoint exists?
3. API interceptor configured correctly?

**Solution**: Check that `withCredentials: true` is set in API client.

### Issue: Form validation not working

**Checklist**:
1. Installed `react-hook-form` and `zod`?
2. Imported validation schema correctly?
3. Used `zodResolver`?
4. Registered form fields?

**Solution**:
```tsx
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { customerSchema } from '@/utils/validation'

const { register } = useForm({
  resolver: zodResolver(customerSchema),
})
```

### Issue: React Query not working

**Checklist**:
1. Installed `@tanstack/react-query`?
2. Wrapped app with `QueryProvider`?
3. Using correct query keys?

**Solution**:
```tsx
import { QueryProvider } from '@/providers/QueryProvider'

<QueryProvider>
  <App />
</QueryProvider>
```

---

## 📚 Additional Resources

- [React Hook Form Docs](https://react-hook-form.com/)
- [Zod Docs](https://zod.dev/)
- [React Query Docs](https://tanstack.com/query/latest)
- [Comprehensive Code Review](./COMPREHENSIVE_CODE_REVIEW_REPORT.md)
- [Implementation Summary](./CRITICAL_FIXES_IMPLEMENTATION_SUMMARY.md)

---

## 💡 Best Practices

### 1. Always use React Query for data fetching
```tsx
// ✅ Good
const { data } = useQuery({ queryKey: [...], queryFn: ... })

// ❌ Bad
const [data, setData] = useState([])
useEffect(() => {
  api.get('/...').then(res => setData(res.data))
}, [])
```

### 2. Always validate forms with Zod
```tsx
// ✅ Good
const { register, handleSubmit } = useForm({
  resolver: zodResolver(schema),
})

// ❌ Bad
const handleChange = (e) => {
  if (e.target.value.length < 2) {
    // Manual validation
  }
}
```

### 3. Always debounce search inputs
```tsx
// ✅ Good
const debouncedSearch = useDebouncedValue(search, 300)

// ❌ Bad
const handleSearch = (value) => {
  api.get('/...', { params: { search: value } })
}
```

### 4. Always use Error Boundaries
```tsx
// ✅ Good
<ErrorBoundary>
  <YourComponent />
</ErrorBoundary>

// ❌ Bad
// No error boundary
```

### 5. Always use format utilities
```tsx
// ✅ Good
<span>{formatCurrency(amount)}</span>

// ❌ Bad
<span>₹{amount.toFixed(2)}</span>
```

---

**Happy Coding! 🚀**

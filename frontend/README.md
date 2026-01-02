# ERP DryMix Products - Frontend

**Modern ERP System for Dry Mix Products Manufacturing**

---

## 📋 Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Features](#features)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Available Scripts](#available-scripts)
- [API Integration](#api-integration)
- [Components](#components)
- [Pages](#pages)
- [State Management](#state-management)
- [Styling](#styling)
- [Testing](#testing)
- [Deployment](#deployment)
- [Contributing](#contributing)

---

## 🎯 Overview

ERP DryMix Products is a comprehensive enterprise resource planning system designed specifically for dry mix products manufacturing. The frontend is built with React and TypeScript, providing a modern, responsive, and user-friendly interface.

**Key Modules**:
- Sales & Customer Management
- Products & Inventory
- Production & Manufacturing
- Quality Control & Testing
- Finance & Accounting
- Credit Control
- Procurement
- HR & Payroll
- Planning
- Communication
- System Administration

---

## 💻 Tech Stack

### Core Framework
- **React 18+** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool

### Routing & State
- **React Router DOM v6** - Client-side routing
- **React Context** - State management

### HTTP Client
- **Axios** - API client with interceptors

### Styling
- **TailwindCSS** - Utility-first CSS
- **PostCSS** - CSS processing
- **Autoprefixer** - CSS vendor prefixes

### UI Components
- **Lucide Icons** - Icon library
- **Sonner** - Toast notifications
- **Recharts** - Charting library
- **React Hook Form** - Form handling
- **Zod** - Schema validation
- **@tanstack/react-table** - Table component

### Utilities
- **clsx** - Conditional class names
- **tailwind-merge** - Merge Tailwind classes
- **date-fns** - Date manipulation

### File Export
- **jsPDF** - PDF generation
- **xlsx** - Excel export

---

## ✨ Features

### User Experience
- ✅ Responsive design (mobile, tablet, desktop)
- ✅ Dark/Light mode support
- ✅ Real-time notifications
- ✅ Keyboard shortcuts
- ✅ Search functionality
- ✅ Advanced filtering & sorting
- ✅ Pagination
- ✅ Data export (PDF, Excel, CSV)
- ✅ Print optimization
- ✅ Loading states & skeletons

### Authentication & Authorization
- ✅ Login/Register
- ✅ Password reset
- ✅ Role-based access control
- ✅ Permission system
- ✅ Token refresh
- ✅ Session management

### Dashboard
- ✅ Overview metrics
- ✅ KPIs and charts
- ✅ Recent activity
- ✅ Quick actions
- ✅ Low stock alerts

### Sales Management
- ✅ Sales orders
- ✅ Invoices
- ✅ Sales returns
- ✅ Customer management
- ✅ Sales reports

### Quality Control
- ✅ Dry mix product tests
- ✅ Raw material tests
- ✅ NCR management
- ✅ Test reports (PDF)
- ✅ Quality dashboards

### Inventory Management
- ✅ Stock overview
- ✅ Stock movements
- ✅ Stock transfers
- ✅ Warehouses
- ✅ Low stock alerts

### Production Management
- ✅ Production orders
- ✅ Bill of materials
- ✅ Production batches
- ✅ Material consumption

### Finance
- ✅ Charts of accounts
- ✅ Vouchers
- ✅ Ledgers
- ✅ Financial reports (Trial Balance, Balance Sheet, P&L)

### Credit Control
- ✅ Customer credit limits
- ✅ Aging reports
- ✅ Collections
- ✅ Customer ledgers

### HR & Payroll
- ✅ Employee management
- ✅ Attendance tracking
- ✅ Leave management
- ✅ Payroll processing
- ✅ Payslips

---

## 📁 Project Structure

```
frontend/
├── public/                 # Static assets
├── src/
│   ├── components/        # Reusable components
│   │   ├── ui/          # UI components (Button, Input, etc.)
│   │   ├── layouts/     # Layout components
│   │   └── features/    # Feature-specific components
│   ├── pages/           # Page components
│   │   ├── auth/        # Authentication pages
│   │   ├── sales/       # Sales pages
│   │   ├── products/    # Products pages
│   │   ├── customers/   # Customers pages
│   │   ├── production/  # Production pages
│   │   ├── inventory/   # Inventory pages
│   │   ├── quality/     # Quality control pages
│   │   ├── finance/     # Finance pages
│   │   ├── credit-control/ # Credit control pages
│   │   ├── procurement/ # Procurement pages
│   │   ├── hr-payroll/  # HR & Payroll pages
│   │   ├── planning/    # Planning pages
│   │   ├── communication/ # Communication pages
│   │   └── system/      # System administration pages
│   ├── layouts/          # Layout wrappers
│   ├── context/         # React Context providers
│   ├── services/         # API services
│   ├── hooks/           # Custom React hooks
│   ├── types/           # TypeScript types
│   ├── utils/           # Utility functions
│   ├── App.tsx          # Root component
│   ├── main.tsx         # Application entry point
│   └── index.css        # Global styles
├── index.html           # HTML template
├── vite.config.ts       # Vite configuration
├── tailwind.config.js   # TailwindCSS configuration
├── tsconfig.json        # TypeScript configuration
├── postcss.config.js    # PostCSS configuration
├── package.json         # Dependencies
└── .eslintrc.cjs       # ESLint configuration
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- Backend API running (http://localhost:8000)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/amitwh/ERP-DryMixProducts.git
   cd ERP-DryMixProducts/frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```

4. **Start development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

5. **Open browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

---

## 🔧 Environment Variables

Create a `.env` file in the root directory:

```env
# API Base URL
VITE_API_BASE_URL=http://localhost:8000/api/v1

# App Settings
VITE_APP_NAME=ERP DryMix Products
VITE_APP_VERSION=1.0.0

# Currency Settings
VITE_CURRENCY=INR
VITE_CURRENCY_SYMBOL=₹

# Date Format
VITE_DATE_FORMAT=dd/MM/yyyy

# Pagination
VITE_DEFAULT_PAGE_SIZE=10
```

---

## 📜 Available Scripts

```bash
# Development
npm run dev              # Start development server

# Build
npm run build            # Build for production

# Preview
npm run preview          # Preview production build

# Type Checking
npm run type-check        # Check TypeScript types

# Linting
npm run lint             # Run ESLint
```

---

## 🔌 API Integration

### API Client

The API client is configured in `src/services/api.ts`:

- **Base URL**: Configurable via environment variable
- **Interceptors**:
  - Request: Adds authorization token
  - Response: Handles errors and token refresh
- **Methods**: GET, POST, PUT, PATCH, DELETE, upload

### Example Usage

```typescript
import { api } from '@/services/api'

// GET Request
const response = await api.get<User>('/auth/me')

// POST Request
const response = await api.post<LoginResponse>('/auth/login', {
  email: 'user@example.com',
  password: 'password123',
})

// Upload File
const response = await api.upload('/upload', file, (progress) => {
  console.log('Upload progress:', progress)
})
```

### Auth Service

Authentication service in `src/services/auth.service.ts`:

```typescript
import { authService } from '@/services/auth.service'

// Login
await authService.login({ email, password })

// Register
await authService.register({ name, email, password })

// Logout
await authService.logout()

// Get Current User
const user = await authService.getCurrentUser()
```

---

## 🧩 Components

### UI Components

Located in `src/components/ui/`:

- **Button** - Primary, secondary, success, warning, danger, ghost, outline
- **Input** - Text, email, password, number, date with validation
- **Card** - Container with header, content, footer
- **Badge** - Status badges (success, warning, error, info)
- **Modal** - Dialog overlay with header, body, footer
- **Loading** - Spinner, full-page loading, skeleton, loading overlay
- **Table** - Reusable data table

### Example Usage

```typescript
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'

<Button variant="primary" size="md" onClick={handleClick}>
  Click Me
</Button>

<Input
  type="email"
  label="Email"
  placeholder="Enter email"
  value={email}
  onChange={setEmail}
  error={error}
  leftIcon={<Mail />}
  showPasswordToggle
/>
```

---

## 📄 Pages

### Authentication

- **Login** (`/login`) - User authentication
- **Register** (`/register`) - User registration
- **Forgot Password** (`/forgot-password`) - Password reset

### Dashboard

- **Dashboard** (`/dashboard`) - Overview with KPIs, charts, recent activity

### Sales Management

- **Sales Orders** (`/sales/orders`) - List, create, view, print orders
- **Invoices** (`/sales/invoices`) - List, create, view, print invoices
- **Returns** (`/sales/returns`) - Sales returns management
- **Projects** (`/sales/projects`) - Project management

### Products & Inventory

- **Products** (`/products`) - Product list, categories, attributes
- **Customers** (`/customers`) - Customer management
- **Stock Overview** (`/inventory/stock`) - Stock levels, movements, transfers
- **Warehouses** (`/inventory/warehouses`) - Warehouse management

### Production

- **Production Orders** (`/production/orders`) - List, create, manage orders
- **BOM** (`/production/bom`) - Bill of materials
- **Batches** (`/production/batches`) - Production batches
- **Consumption** (`/production/consumption`) - Material consumption

### Quality Control

- **Inspections** (`/quality/inspections`) - List, create, view tests
- **NCRs** (`/quality/ncrs`) - Non-conformance reports
- **Dry Mix Tests** (`/quality/dry-mix-tests`) - Product tests
- **Raw Material Tests** (`/quality/raw-material-tests`) - Material tests

### Finance

- **Charts** (`/finance/charts`) - Chart of accounts
- **Vouchers** (`/finance/vouchers`) - Journal vouchers
- **Ledgers** (`/finance/ledgers`) - Account ledgers
- **Reports** (`/finance/reports`) - Trial balance, balance sheet, P&L

### Credit Control

- **Customer Credit** (`/credit-control/customers`) - Credit limits
- **Aging** (`/credit-control/aging`) - Aging reports
- **Collections** (`/credit-control/collections`) - Collections management

### HR & Payroll

- **Employees** (`/hr-payroll/employees`) - Employee management
- **Attendance** (`/hr-payroll/attendances`) - Attendance tracking
- **Payroll** (`/hr-payroll/payroll`) - Payroll processing
- **Payslips** (`/hr-payroll/payslips`) - Payslip management

### System Administration

- **Users** (`/system/users`) - User management
- **Roles** (`/system/roles`) - Role management
- **Organizations** (`/system/organizations`) - Organization settings
- **Modules** (`/system/modules`) - Module configuration
- **Logs** (`/system/logs`) - System logs

---

## 🔄 State Management

### React Context

Auth Context (`src/context/AuthContext.tsx`):

```typescript
import { useAuth } from '@/context/AuthContext'

// Access auth state
const { user, token, isAuthenticated, isLoading } = useAuth()

// Auth actions
const { login, register, logout, refreshUser, updateUser } = useAuth()
```

### Local State

Use React hooks for component-level state:

```typescript
const [value, setValue] = useState('')
const [loading, setLoading] = useState(false)

useEffect(() => {
  // Side effect
}, [dependency])
```

---

## 🎨 Styling

### TailwindCSS

Utility-first CSS framework. Use Tailwind classes directly:

```typescript
<div className="flex items-center justify-between p-4 bg-white rounded-lg shadow">
  <h1 className="text-xl font-bold text-gray-900">Title</h1>
  <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
    Button
  </button>
</div>
```

### Custom Utilities

Located in `src/utils/index.ts`:

```typescript
import { cn, formatCurrency, formatDate } from '@/utils'

// Merge Tailwind classes
const className = cn('px-4 py-2', isActive && 'bg-primary-600')

// Format currency (Indian Rupee)
const amount = formatCurrency(123456.78) // "₹1,23,456.78"

// Format date
const date = formatDate('2026-01-02') // "Jan 02, 2026"
```

### Theme Colors

- **Primary**: Blue (`#2563EB`)
- **Secondary**: Purple (`#9333EA`)
- **Success**: Green (`#059669`)
- **Warning**: Amber (`#D97706`)
- **Error**: Red (`#DC2626`)

---

## 🧪 Testing

### Coming Soon

- Unit tests with Vitest
- Component tests with React Testing Library
- E2E tests with Playwright

---

## 📦 Deployment

### Build for Production

```bash
npm run build
```

### Preview Build

```bash
npm run preview
```

### Deploy to Vercel

```bash
npm install -g vercel
vercel
```

### Deploy to Netlify

```bash
npm install -g netlify-cli
netlify deploy --prod
```

### Docker Deployment

```bash
# Build image
docker build -t erp-drymix-frontend .

# Run container
docker run -p 3000:3000 erp-drymix-frontend
```

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style

- Use TypeScript for all new code
- Follow ESLint rules
- Use Prettier for formatting
- Write meaningful commit messages
- Add comments for complex logic

---

## 📝 License

This project is licensed under the MIT License.

---

## 👥 Team

- **Amit Wh** - Full Stack Developer

---

## 📞 Support

For support, email amit@example.com or open an issue on GitHub.

---

**Built with ❤️ using React, TypeScript, and TailwindCSS**

import React, { ReactNode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

/**
 * Create Query Client instance
 */
const createQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Stale time: Data is fresh for 5 minutes
        staleTime: 5 * 60 * 1000,

        // Cache time: Keep unused data for 10 minutes
        gcTime: 10 * 60 * 1000,

        // Retry failed requests 3 times
        retry: 3,

        // Retry delay: exponential backoff
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),

        // Refetch on window focus
        refetchOnWindowFocus: false,

        // Refetch on reconnect
        refetchOnReconnect: true,

        // Refetch on mount
        refetchOnMount: 'stale',

        // Network mode: Always try to fetch
        networkMode: 'online',
      },
      mutations: {
        // Retry failed mutations once
        retry: 1,

        // Retry delay: 500ms
        retryDelay: 500,
      },
    },
  })
}

/**
 * Query Client Provider
 *
 * Wraps the application with QueryClientProvider
 * and provides React Query functionality
 */
interface QueryProviderProps {
  children: ReactNode
  client?: QueryClient
}

export const QueryProvider: React.FC<QueryProviderProps> = ({
  children,
  client,
}) => {
  const queryClient = client || createQueryClient()

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}

/**
 * Query Keys
 *
 * Centralized query keys for consistent caching
 */
export const queryKeys = {
  // Auth
  auth: {
    all: ['auth'] as const,
    me: () => ['auth', 'me'] as const,
  },

  // Dashboard
  dashboard: {
    all: ['dashboard'] as const,
    overview: () => ['dashboard', 'overview'] as const,
    salesTrend: () => ['dashboard', 'sales-trend'] as const,
    topCustomers: () => ['dashboard', 'top-customers'] as const,
    topProducts: () => ['dashboard', 'top-products'] as const,
    qualityMetrics: () => ['dashboard', 'quality-metrics'] as const,
    productionMetrics: () => ['dashboard', 'production-metrics'] as const,
  },

  // Customers
  customers: {
    all: ['customers'] as const,
    lists: () => ['customers', 'list'] as const,
    list: (filters?: Record<string, any>) =>
      ['customers', 'list', filters] as const,
    details: () => ['customers', 'detail'] as const,
    detail: (id: number) => ['customers', 'detail', id] as const,
    ledger: (id: number) => ['customers', 'ledger', id] as const,
  },

  // Products
  products: {
    all: ['products'] as const,
    lists: () => ['products', 'list'] as const,
    list: (filters?: Record<string, any>) =>
      ['products', 'list', filters] as const,
    details: () => ['products', 'detail'] as const,
    detail: (id: number) => ['products', 'detail', id] as const,
  },

  // Suppliers
  suppliers: {
    all: ['suppliers'] as const,
    lists: () => ['suppliers', 'list'] as const,
    list: (filters?: Record<string, any>) =>
      ['suppliers', 'list', filters] as const,
    details: () => ['suppliers', 'detail'] as const,
    detail: (id: number) => ['suppliers', 'detail', id] as const,
    performance: (id: number) => ['suppliers', 'performance', id] as const,
  },

  // Sales Orders
  salesOrders: {
    all: ['sales-orders'] as const,
    lists: () => ['sales-orders', 'list'] as const,
    list: (filters?: Record<string, any>) =>
      ['sales-orders', 'list', filters] as const,
    details: () => ['sales-orders', 'detail'] as const,
    detail: (id: number) => ['sales-orders', 'detail', id] as const,
  },

  // Invoices
  invoices: {
    all: ['invoices'] as const,
    lists: () => ['invoices', 'list'] as const,
    list: (filters?: Record<string, any>) =>
      ['invoices', 'list', filters] as const,
    details: () => ['invoices', 'detail'] as const,
    detail: (id: number) => ['invoices', 'detail', id] as const,
  },

  // Purchase Orders
  purchaseOrders: {
    all: ['purchase-orders'] as const,
    lists: () => ['purchase-orders', 'list'] as const,
    list: (filters?: Record<string, any>) =>
      ['purchase-orders', 'list', filters] as const,
    details: () => ['purchase-orders', 'detail'] as const,
    detail: (id: number) => ['purchase-orders', 'detail', id] as const,
  },

  // Inventory
  inventory: {
    all: ['inventory'] as const,
    lists: () => ['inventory', 'list'] as const,
    list: (filters?: Record<string, any>) =>
      ['inventory', 'list', filters] as const,
    details: () => ['inventory', 'detail'] as const,
    detail: (id: number) => ['inventory', 'detail', id] as const,
    alerts: () => ['inventory', 'alerts'] as const,
  },

  // Stock Transactions
  stockTransactions: {
    all: ['stock-transactions'] as const,
    lists: () => ['stock-transactions', 'list'] as const,
    list: (filters?: Record<string, any>) =>
      ['stock-transactions', 'list', filters] as const,
    summary: () => ['stock-transactions', 'summary'] as const,
  },

  // Production Orders
  productionOrders: {
    all: ['production-orders'] as const,
    lists: () => ['production-orders', 'list'] as const,
    list: (filters?: Record<string, any>) =>
      ['production-orders', 'list', filters] as const,
    details: () => ['production-orders', 'detail'] as const,
    detail: (id: number) => ['production-orders', 'detail', id] as const,
  },

  // Inspections
  inspections: {
    all: ['inspections'] as const,
    lists: () => ['inspections', 'list'] as const,
    list: (filters?: Record<string, any>) =>
      ['inspections', 'list', filters] as const,
    details: () => ['inspections', 'detail'] as const,
    detail: (id: number) => ['inspections', 'detail', id] as const,
  },

  // NCRs
  ncrs: {
    all: ['ncrs'] as const,
    lists: () => ['ncrs', 'list'] as const,
    list: (filters?: Record<string, any>) =>
      ['ncrs', 'list', filters] as const,
    details: () => ['ncrs', 'detail'] as const,
    detail: (id: number) => ['ncrs', 'detail', id] as const,
    statistics: () => ['ncrs', 'statistics'] as const,
  },

  // Projects
  projects: {
    all: ['projects'] as const,
    lists: () => ['projects', 'list'] as const,
    list: (filters?: Record<string, any>) =>
      ['projects', 'list', filters] as const,
    details: () => ['projects', 'detail'] as const,
    detail: (id: number) => ['projects', 'detail', id] as const,
  },

  // Quality Documents
  qualityDocuments: {
    all: ['quality-documents'] as const,
    lists: () => ['quality-documents', 'list'] as const,
    list: (filters?: Record<string, any>) =>
      ['quality-documents', 'list', filters] as const,
    details: () => ['quality-documents', 'detail'] as const,
    detail: (id: number) => ['quality-documents', 'detail', id] as const,
  },

  // Credit Controls
  creditControls: {
    all: ['credit-controls'] as const,
    lists: () => ['credit-controls', 'list'] as const,
    list: (filters?: Record<string, any>) =>
      ['credit-controls', 'list', filters] as const,
    details: () => ['credit-controls', 'detail'] as const,
    detail: (id: number) => ['credit-controls', 'detail', id] as const,
    agingReport: () => ['credit-controls', 'aging-report'] as const,
    creditScoreDistribution: () =>
      ['credit-controls', 'credit-score-distribution'] as const,
    riskAnalysis: () => ['credit-controls', 'risk-analysis'] as const,
    statistics: () => ['credit-controls', 'statistics'] as const,
  },

  // Collections
  collections: {
    all: ['collections'] as const,
    lists: () => ['collections', 'list'] as const,
    list: (filters?: Record<string, any>) =>
      ['collections', 'list', filters] as const,
    details: () => ['collections', 'detail'] as const,
    detail: (id: number) => ['collections', 'detail', id] as const,
    summary: () => ['collections', 'summary'] as const,
  },

  // Finance
  finance: {
    all: ['finance'] as const,
    chartOfAccounts: {
      all: ['chart-of-accounts'] as const,
      lists: () => ['chart-of-accounts', 'list'] as const,
      list: (filters?: Record<string, any>) =>
        ['chart-of-accounts', 'list', filters] as const,
      detail: (id: number) =>
        ['chart-of-accounts', 'detail', id] as const,
      balance: (id: number) =>
        ['chart-of-accounts', 'balance', id] as const,
      runningBalance: (id: number) =>
        ['chart-of-accounts', 'running-balance', id] as const,
      ledger: (id: number) =>
        ['chart-of-accounts', 'ledger', id] as const,
    },
    journalVouchers: {
      all: ['journal-vouchers'] as const,
      lists: () => ['journal-vouchers', 'list'] as const,
      list: (filters?: Record<string, any>) =>
        ['journal-vouchers', 'list', filters] as const,
      detail: (id: number) =>
        ['journal-vouchers', 'detail', id] as const,
    },
    ledgers: () => ['finance', 'ledgers'] as const,
    trialBalance: () => ['finance', 'trial-balance'] as const,
    balanceSheet: () => ['finance', 'balance-sheet'] as const,
    profitAndLoss: () => ['finance', 'profit-and-loss'] as const,
    balanceSummary: () => ['finance', 'balance-summary'] as const,
  },

  // HR
  hr: {
    all: ['hr'] as const,
    employees: {
      all: ['employees'] as const,
      lists: () => ['employees', 'list'] as const,
      list: (filters?: Record<string, any>) =>
        ['employees', 'list', filters] as const,
      detail: (id: number) =>
        ['employees', 'detail', id] as const,
    },
    attendances: {
      all: ['attendances'] as const,
      lists: () => ['attendances', 'list'] as const,
      list: (filters?: Record<string, any>) =>
        ['attendances', 'list', filters] as const,
      detail: (id: number) =>
        ['attendances', 'detail', id] as const,
    },
    leaveRequests: {
      all: ['leave-requests'] as const,
      lists: () => ['leave-requests', 'list'] as const,
      list: (filters?: Record<string, any>) =>
        ['leave-requests', 'list', filters] as const,
      detail: (id: number) =>
        ['leave-requests', 'detail', id] as const,
    },
    departments: () => ['hr', 'departments'] as const,
    statistics: () => ['hr', 'statistics'] as const,
  },

  // Planning
  planning: {
    all: ['planning'] as const,
    productionPlans: {
      all: ['production-plans'] as const,
      lists: () => ['production-plans', 'list'] as const,
      list: (filters?: Record<string, any>) =>
        ['production-plans', 'list', filters] as const,
      detail: (id: number) =>
        ['production-plans', 'detail', id] as const,
    },
    materialRequirements: () =>
      ['planning', 'material-requirements'] as const,
    demandForecasts: {
      all: ['demand-forecasts'] as const,
      lists: () => ['demand-forecasts', 'list'] as const,
      list: (filters?: Record<string, any>) =>
        ['demand-forecasts', 'list', filters] as const,
      detail: (id: number) =>
        ['demand-forecasts', 'detail', id] as const,
    },
    mrpAnalysis: () => ['planning', 'mrp-analysis'] as const,
    capacityAnalysis: () => ['planning', 'capacity-analysis'] as const,
  },

  // Communication
  communication: {
    all: ['communication'] as const,
    templates: {
      all: ['communication-templates'] as const,
      lists: () => ['communication-templates', 'list'] as const,
      list: (filters?: Record<string, any>) =>
        ['communication-templates', 'list', filters] as const,
      detail: (id: number) =>
        ['communication-templates', 'detail', id] as const,
    },
    logs: () => ['communication', 'logs'] as const,
    notificationPreferences: () =>
      ['communication', 'notification-preferences'] as const,
    statistics: () => ['communication', 'statistics'] as const,
  },

  // System
  system: {
    all: ['system'] as const,
    modules: () => ['system', 'modules'] as const,
    module: (id: number) => ['system', 'modules', id] as const,
    apiKeys: {
      all: ['api-keys'] as const,
      lists: () => ['api-keys', 'list'] as const,
      list: (filters?: Record<string, any>) =>
        ['api-keys', 'list', filters] as const,
      detail: (id: number) =>
        ['api-keys', 'detail', id] as const,
    },
    apiLogs: {
      all: ['api-logs'] as const,
      lists: () => ['api-logs', 'list'] as const,
      list: (filters?: Record<string, any>) =>
        ['api-logs', 'list', filters] as const,
      statistics: () => ['api-logs', 'statistics'] as const,
    },
    systemLogs: () => ['system', 'system-logs'] as const,
    backups: () => ['system', 'backups'] as const,
    scheduledTasks: {
      all: ['scheduled-tasks'] as const,
      lists: () => ['scheduled-tasks', 'list'] as const,
      list: (filters?: Record<string, any>) =>
        ['scheduled-tasks', 'list', filters] as const,
      detail: (id: number) =>
        ['scheduled-tasks', 'detail', id] as const,
    },
    health: () => ['system', 'health'] as const,
    statistics: () => ['system', 'statistics'] as const,
  },

  // Test Pages
  testPages: {
    all: ['test-pages'] as const,
    dryMixProductTests: {
      all: ['dry-mix-product-tests'] as const,
      lists: () => ['dry-mix-product-tests', 'list'] as const,
      list: (filters?: Record<string, any>) =>
        ['dry-mix-product-tests', 'list', filters] as const,
      detail: (id: number) =>
        ['dry-mix-product-tests', 'detail', id] as const,
    },
    rawMaterialTests: {
      all: ['raw-material-tests'] as const,
      lists: () => ['raw-material-tests', 'list'] as const,
      list: (filters?: Record<string, any>) =>
        ['raw-material-tests', 'list', filters] as const,
      detail: (id: number) =>
        ['raw-material-tests', 'detail', id] as const,
    },
    testParameters: () => ['test-pages', 'test-parameters'] as const,
    testStandards: () => ['test-pages', 'test-standards'] as const,
    testTemplates: () => ['test-pages', 'test-templates'] as const,
    statistics: () => ['test-pages', 'statistics'] as const,
  },
}

export default QueryProvider

import { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>{children}</BrowserRouter>
    </QueryClientProvider>
  )
}

const customRender = (ui: ReactElement, options?: Omit<RenderOptions, 'wrapper'>) =>
  render(ui, { wrapper: AllTheProviders, ...options })

export * from '@testing-library/react'
export { customRender as render }

export const mockUser = {
  id: 1,
  name: 'Test User',
  email: 'test@example.com',
  organizationId: 1,
  role: 'admin',
}

export const mockOrganization = {
  id: 1,
  name: 'Test Organization',
  code: 'TEST',
  status: 'active',
}

export const mockProduct = {
  id: 1,
  product_code: 'PROD001',
  name: 'Test Product',
  description: 'Test product description',
  product_type: 'tile_adhesive',
  unit_of_measure: 'kg',
  selling_price: 100,
  cost_price: 80,
  status: 'active',
}

export const mockCustomer = {
  id: 1,
  customer_code: 'CUST001',
  name: 'Test Customer',
  email: 'customer@test.com',
  phone: '+1234567890',
  status: 'active',
}

export const mockInvoice = {
  id: 1,
  invoice_number: 'INV001',
  customer_id: 1,
  total_amount: 1000,
  status: 'pending',
  invoice_date: '2024-01-01',
  due_date: '2024-01-31',
}

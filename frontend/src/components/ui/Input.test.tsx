import { describe, it, expect } from 'vitest'
import { render, screen } from '@/test/utils'
import { Input } from '@/components/ui/Input'

describe('Input Component', () => {
  it('renders input element', () => {
    render(<Input placeholder="Enter text" />)
    expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument()
  })

  it('renders with label', () => {
    render(<Input label="Username" id="username" />)
    expect(screen.getByLabelText('Username')).toBeInTheDocument()
  })

  it('shows error message', () => {
    render(<Input error="This field is required" />)
    expect(screen.getByText('This field is required')).toBeInTheDocument()
  })

  it('applies error styles when error prop is provided', () => {
    render(<Input error="Error" />)
    const input = screen.getByRole('textbox')
    expect(input).toHaveClass('border-red-500')
  })

  it('disables input when disabled prop is true', () => {
    render(<Input disabled />)
    expect(screen.getByRole('textbox')).toBeDisabled()
  })

  it('renders different input types', () => {
    const { rerender } = render(<Input type="text" />)
    expect(screen.getByRole('textbox')).toBeInTheDocument()

    rerender(<Input type="email" />)
    expect(screen.getByRole('textbox')).toBeInTheDocument()

    rerender(<Input type="password" />)
    expect(screen.getByPlaceholderText('')).toBeInTheDocument()
  })
})

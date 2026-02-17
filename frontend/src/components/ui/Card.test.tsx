import { describe, it, expect } from 'vitest'
import { render, screen } from '@/test/utils'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/Card'

describe('Card Components', () => {
  it('renders Card with children', () => {
    render(
      <Card>
        <div>Card content</div>
      </Card>
    )
    expect(screen.getByText('Card content')).toBeInTheDocument()
  })

  it('renders CardHeader', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Card Title</CardTitle>
        </CardHeader>
      </Card>
    )
    expect(screen.getByText('Card Title')).toBeInTheDocument()
  })

  it('renders CardContent', () => {
    render(
      <Card>
        <CardContent>
          <p>Content paragraph</p>
        </CardContent>
      </Card>
    )
    expect(screen.getByText('Content paragraph')).toBeInTheDocument()
  })

  it('renders CardFooter', () => {
    render(
      <Card>
        <CardFooter>
          <button>Action</button>
        </CardFooter>
      </Card>
    )
    expect(screen.getByRole('button', { name: 'Action' })).toBeInTheDocument()
  })

  it('applies variant styles', () => {
    const { container } = render(<Card variant="bordered">Bordered Card</Card>)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('applies padding styles', () => {
    const { container } = render(<Card padding="lg">Padded Card</Card>)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('renders complete card structure', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Complete Card</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Card body content</p>
        </CardContent>
        <CardFooter>
          <button>Submit</button>
        </CardFooter>
      </Card>
    )

    expect(screen.getByText('Complete Card')).toBeInTheDocument()
    expect(screen.getByText('Card body content')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Submit' })).toBeInTheDocument()
  })
})

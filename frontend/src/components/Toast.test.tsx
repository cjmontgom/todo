import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Toast } from './Toast'

describe('Toast', () => {
  it('renders the message text', () => {
    render(<Toast message="Something went wrong" />)
    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
  })

  it('has role="alert"', () => {
    render(<Toast message="Error" />)
    expect(screen.getByRole('alert')).toBeInTheDocument()
  })

  it('has aria-live="polite"', () => {
    render(<Toast message="Error" />)
    expect(screen.getByRole('alert')).toHaveAttribute('aria-live', 'polite')
  })
})

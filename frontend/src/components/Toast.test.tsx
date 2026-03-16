import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Toast } from './Toast'

describe('Toast', () => {
  it('renders the message text when provided', () => {
    render(<Toast message="Something went wrong" />)
    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
  })

  it('renders the live region container even when message is null', () => {
    render(<Toast message={null} />)
    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('has role="status"', () => {
    render(<Toast message="Error" />)
    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('has aria-live="polite"', () => {
    render(<Toast message="Error" />)
    expect(screen.getByRole('status')).toHaveAttribute('aria-live', 'polite')
  })
})

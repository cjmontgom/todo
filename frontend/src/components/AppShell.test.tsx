import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { AppShell } from './AppShell'

describe('AppShell', () => {
  it('renders a skip link targeting #task-input', () => {
    render(<AppShell><div /></AppShell>)
    const link = screen.getByRole('link', { name: 'Skip to task input' })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', '#task-input')
  })

  it('renders a main landmark element', () => {
    render(<AppShell><div /></AppShell>)
    expect(screen.getByRole('main')).toBeInTheDocument()
  })
})

import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { TaskItem } from './TaskItem'
import { Task } from '../types'

describe('TaskItem', () => {
  it('renders active task with full opacity text', () => {
    const task: Task = { id: 1, text: 'Buy milk', completed: false, createdAt: '2026-03-12T10:00:00.000Z' }
    render(<TaskItem task={task} />)

    expect(screen.getByText('Buy milk')).toBeInTheDocument()
    expect(screen.getByText('Buy milk')).not.toHaveClass('line-through')
  })

  it('renders completed task with strikethrough', () => {
    const task: Task = { id: 2, text: 'Walk the dog', completed: true, createdAt: '2026-03-12T10:00:00.000Z' }
    render(<TaskItem task={task} />)

    expect(screen.getByText('Walk the dog')).toHaveClass('line-through')
    expect(screen.getByText('Walk the dog')).toHaveClass('text-completed')
  })

  it('renders checkbox with correct aria-label for active task', () => {
    const task: Task = { id: 1, text: 'Buy milk', completed: false, createdAt: '2026-03-12T10:00:00.000Z' }
    render(<TaskItem task={task} onToggle={vi.fn()} />)

    const checkbox = screen.getByRole('checkbox')
    expect(checkbox).toHaveAttribute('aria-checked', 'false')
    expect(checkbox).toHaveAttribute('aria-label', 'Mark Buy milk as complete')
  })

  it('renders checkbox with correct aria-label for completed task', () => {
    const task: Task = { id: 2, text: 'Walk the dog', completed: true, createdAt: '2026-03-12T10:00:00.000Z' }
    render(<TaskItem task={task} onToggle={vi.fn()} />)

    const checkbox = screen.getByRole('checkbox')
    expect(checkbox).toHaveAttribute('aria-checked', 'true')
    expect(checkbox).toHaveAttribute('aria-label', 'Mark Walk the dog as incomplete')
  })

  it('calls onToggle with inverted completed value on checkbox click', async () => {
    const user = userEvent.setup()
    const onToggle = vi.fn().mockResolvedValue(undefined)
    const task: Task = { id: 1, text: 'Buy milk', completed: false, createdAt: '2026-03-12T10:00:00.000Z' }

    render(<TaskItem task={task} onToggle={onToggle} />)

    await user.click(screen.getByRole('checkbox'))

    expect(onToggle).toHaveBeenCalledWith(1, true)
  })

  it('disables checkbox during toggle and applies opacity', async () => {
    let resolveToggle: () => void
    const onToggle = vi.fn().mockImplementation(
      () => new Promise<void>((resolve) => { resolveToggle = resolve })
    )
    const task: Task = { id: 1, text: 'Buy milk', completed: false, createdAt: '2026-03-12T10:00:00.000Z' }

    render(<TaskItem task={task} onToggle={onToggle} />)

    await userEvent.click(screen.getByRole('checkbox'))

    expect(screen.getByRole('checkbox')).toBeDisabled()

    resolveToggle!()

    await waitFor(() => {
      expect(screen.getByRole('checkbox')).not.toBeDisabled()
    })
  })
})

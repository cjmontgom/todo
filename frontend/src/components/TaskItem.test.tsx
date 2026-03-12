import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { TaskItem } from './TaskItem'
import type { Task } from '../types'

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

  it('renders delete button with correct aria-label when onDelete provided', () => {
    const task: Task = { id: 1, text: 'Buy milk', completed: false, createdAt: '2026-03-12T10:00:00.000Z' }
    render(<TaskItem task={task} onDelete={vi.fn()} />)

    const deleteBtn = screen.getByRole('button', { name: 'Delete task: Buy milk' })
    expect(deleteBtn).toBeInTheDocument()
  })

  it('does not render delete button when onDelete not provided', () => {
    const task: Task = { id: 1, text: 'Buy milk', completed: false, createdAt: '2026-03-12T10:00:00.000Z' }
    render(<TaskItem task={task} />)

    expect(screen.queryByRole('button', { name: /Delete task/ })).not.toBeInTheDocument()
  })

  it('calls onDelete with task id on delete button click', async () => {
    const user = userEvent.setup()
    const onDelete = vi.fn().mockResolvedValue(undefined)
    const task: Task = { id: 5, text: 'Clean house', completed: false, createdAt: '2026-03-12T10:00:00.000Z' }

    render(<TaskItem task={task} onDelete={onDelete} />)

    await user.click(screen.getByRole('button', { name: 'Delete task: Clean house' }))

    expect(onDelete).toHaveBeenCalledWith(5)
  })

  it('disables delete button during delete', async () => {
    let resolveDelete: () => void
    const onDelete = vi.fn().mockImplementation(
      () => new Promise<void>((resolve) => { resolveDelete = resolve })
    )
    const task: Task = { id: 1, text: 'Buy milk', completed: false, createdAt: '2026-03-12T10:00:00.000Z' }

    render(<TaskItem task={task} onDelete={onDelete} />)

    await userEvent.click(screen.getByRole('button', { name: 'Delete task: Buy milk' }))

    expect(screen.getByRole('button', { name: 'Delete task: Buy milk' })).toBeDisabled()

    resolveDelete!()

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Delete task: Buy milk' })).not.toBeDisabled()
    })
  })
})

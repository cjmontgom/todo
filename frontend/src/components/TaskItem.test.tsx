import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
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

  it('renders checkbox with correct checked state for active task', () => {
    const task: Task = { id: 1, text: 'Buy milk', completed: false, createdAt: '2026-03-12T10:00:00.000Z' }
    render(<TaskItem task={task} />)

    const checkbox = screen.getByRole('checkbox')
    expect(checkbox).toHaveAttribute('aria-checked', 'false')
    expect(checkbox).toHaveAttribute('aria-label', 'Mark Buy milk as complete')
  })

  it('renders checkbox with correct checked state for completed task', () => {
    const task: Task = { id: 2, text: 'Walk the dog', completed: true, createdAt: '2026-03-12T10:00:00.000Z' }
    render(<TaskItem task={task} />)

    const checkbox = screen.getByRole('checkbox')
    expect(checkbox).toHaveAttribute('aria-checked', 'true')
  })
})

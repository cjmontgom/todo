import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { TaskList } from './TaskList'
import { Task } from '../types'

const mockTasks: Task[] = [
  { id: 1, text: 'Active task', completed: false, createdAt: '2026-03-12T10:00:00.000Z' },
  { id: 2, text: 'Completed task', completed: true, createdAt: '2026-03-12T09:00:00.000Z' },
  { id: 3, text: 'Another active', completed: false, createdAt: '2026-03-12T11:00:00.000Z' },
]

describe('TaskList', () => {
  it('renders loading state when loading', () => {
    render(<TaskList tasks={[]} loading={true} error={null} onRetry={() => {}} />)
    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('renders error state when error exists', () => {
    render(<TaskList tasks={[]} loading={false} error="Something broke" onRetry={() => {}} />)
    expect(screen.getByText("Something went wrong. Let's try again.")).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument()
  })

  it('renders empty state when no tasks', () => {
    render(<TaskList tasks={[]} loading={false} error={null} onRetry={() => {}} />)
    expect(screen.getByText("Nothing here yet. What's on your mind?")).toBeInTheDocument()
  })

  it('sorts active tasks before completed tasks', () => {
    render(<TaskList tasks={mockTasks} loading={false} error={null} onRetry={() => {}} />)

    const listItems = screen.getAllByRole('listitem')
    expect(listItems).toHaveLength(3)

    expect(listItems[0]).toHaveTextContent('Active task')
    expect(listItems[1]).toHaveTextContent('Another active')
    expect(listItems[2]).toHaveTextContent('Completed task')
  })

  it('renders task list with correct aria label', () => {
    render(<TaskList tasks={mockTasks} loading={false} error={null} onRetry={() => {}} />)
    expect(screen.getByRole('list')).toHaveAttribute('aria-label', 'Task list, 3 items')
  })

  it('passes onRetry to ErrorState', () => {
    const onRetry = vi.fn()
    render(<TaskList tasks={[]} loading={false} error="Error" onRetry={onRetry} />)

    screen.getByRole('button', { name: 'Retry' }).click()
    expect(onRetry).toHaveBeenCalledOnce()
  })
})

import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import App from './App'
import * as api from './api'
import { Task } from './types'

vi.mock('./api')

const mockTasks: Task[] = [
  { id: 1, text: 'Buy groceries', completed: false, createdAt: '2026-03-12T10:00:00.000Z' },
  { id: 2, text: 'Walk the dog', completed: true, createdAt: '2026-03-12T11:00:00.000Z' },
]

describe('App', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('renders loading state then displays tasks', async () => {
    vi.mocked(api.fetchTasks).mockResolvedValue(mockTasks)

    render(<App />)

    expect(screen.getByRole('status')).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.getByText('Buy groceries')).toBeInTheDocument()
    })
    expect(screen.getByText('Walk the dog')).toBeInTheDocument()
  })

  it('shows empty state when no tasks exist', async () => {
    vi.mocked(api.fetchTasks).mockResolvedValue([])

    render(<App />)

    await waitFor(() => {
      expect(screen.getByText("Nothing here yet. What's on your mind?")).toBeInTheDocument()
    })
  })

  it('shows error state with retry button on fetch failure', async () => {
    vi.mocked(api.fetchTasks).mockRejectedValue(new Error('Network error'))

    render(<App />)

    await waitFor(() => {
      expect(screen.getByText("Something went wrong. Let's try again.")).toBeInTheDocument()
    })
    expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument()
  })

  it('retries fetching when retry button is clicked', async () => {
    vi.mocked(api.fetchTasks)
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce(mockTasks)

    render(<App />)

    await waitFor(() => {
      expect(screen.getByText("Something went wrong. Let's try again.")).toBeInTheDocument()
    })

    await userEvent.click(screen.getByRole('button', { name: 'Retry' }))

    await waitFor(() => {
      expect(screen.getByText('Buy groceries')).toBeInTheDocument()
    })
  })

  it('creates a new task and displays it in the list', async () => {
    const user = userEvent.setup()
    vi.mocked(api.fetchTasks).mockResolvedValue([])
    vi.mocked(api.createTask).mockResolvedValue({
      id: 10,
      text: 'New task',
      completed: false,
      createdAt: '2026-03-12T14:00:00.000Z',
    })

    render(<App />)

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Add a task...')).toBeInTheDocument()
    })

    await user.type(screen.getByPlaceholderText('Add a task...'), 'New task{enter}')

    await waitFor(() => {
      expect(screen.getByText('New task')).toBeInTheDocument()
    })
    expect(api.createTask).toHaveBeenCalledWith('New task')
  })

  it('toggles task completion and updates visual state', async () => {
    const user = userEvent.setup()
    vi.mocked(api.fetchTasks).mockResolvedValue(mockTasks)
    vi.mocked(api.toggleTask).mockResolvedValue({
      id: 1,
      text: 'Buy groceries',
      completed: true,
      createdAt: '2026-03-12T10:00:00.000Z',
    })

    render(<App />)

    await waitFor(() => {
      expect(screen.getByText('Buy groceries')).toBeInTheDocument()
    })

    const checkboxes = screen.getAllByRole('checkbox')
    const activeCheckbox = checkboxes.find(
      (cb) => cb.getAttribute('aria-label') === 'Mark Buy groceries as complete'
    )!
    await user.click(activeCheckbox)

    await waitFor(() => {
      expect(api.toggleTask).toHaveBeenCalledWith(1, true)
    })

    await waitFor(() => {
      expect(screen.getByText('Buy groceries')).toHaveClass('line-through')
    })
  })

  it('keeps task unchanged when toggle fails', async () => {
    const user = userEvent.setup()
    vi.mocked(api.fetchTasks).mockResolvedValue(mockTasks)
    vi.mocked(api.toggleTask).mockRejectedValue(new Error('Network error'))

    render(<App />)

    await waitFor(() => {
      expect(screen.getByText('Buy groceries')).toBeInTheDocument()
    })

    const checkboxes = screen.getAllByRole('checkbox')
    const activeCheckbox = checkboxes.find(
      (cb) => cb.getAttribute('aria-label') === 'Mark Buy groceries as complete'
    )!
    await user.click(activeCheckbox)

    await waitFor(() => {
      expect(api.toggleTask).toHaveBeenCalledWith(1, true)
    })

    expect(screen.getByText('Buy groceries')).not.toHaveClass('line-through')
  })

  it('shows inline error when task creation fails', async () => {
    const user = userEvent.setup()
    vi.mocked(api.fetchTasks).mockResolvedValue(mockTasks)
    vi.mocked(api.createTask).mockRejectedValue(new Error('Server error'))

    render(<App />)

    await waitFor(() => {
      expect(screen.getByText('Buy groceries')).toBeInTheDocument()
    })

    await user.type(screen.getByPlaceholderText('Add a task...'), 'Failing task{enter}')

    await waitFor(() => {
      expect(screen.getByText('Something went wrong. Give it another try.')).toBeInTheDocument()
    })
  })
})

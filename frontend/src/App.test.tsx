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
})

import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { TaskInput } from './TaskInput'

function renderTaskInput(overrides: Partial<{
  onCreateTask: (text: string) => Promise<void>
  createError: string | null
  onClearError: () => void
}> = {}) {
  const defaults = {
    onCreateTask: vi.fn<(text: string) => Promise<void>>().mockResolvedValue(undefined),
    createError: null,
    onClearError: vi.fn(),
    ...overrides,
  }
  return { ...render(<TaskInput {...defaults} />), ...defaults }
}

describe('TaskInput', () => {
  it('submits on Enter key press', async () => {
    const user = userEvent.setup()
    const { onCreateTask } = renderTaskInput()

    await user.type(screen.getByPlaceholderText('Add a task...'), 'Buy milk{enter}')

    expect(onCreateTask).toHaveBeenCalledWith('Buy milk')
  })

  it('submits on button click', async () => {
    const user = userEvent.setup()
    const { onCreateTask } = renderTaskInput()

    await user.type(screen.getByPlaceholderText('Add a task...'), 'Walk the dog')
    await user.click(screen.getByRole('button', { name: 'Add task' }))

    expect(onCreateTask).toHaveBeenCalledWith('Walk the dog')
  })

  it('ignores empty input', async () => {
    const user = userEvent.setup()
    const { onCreateTask } = renderTaskInput()

    await user.click(screen.getByRole('button', { name: 'Add task' }))

    expect(onCreateTask).not.toHaveBeenCalled()
  })

  it('ignores whitespace-only input', async () => {
    const user = userEvent.setup()
    const { onCreateTask } = renderTaskInput()

    await user.type(screen.getByPlaceholderText('Add a task...'), '   {enter}')

    expect(onCreateTask).not.toHaveBeenCalled()
  })

  it('clears input on successful submission', async () => {
    const user = userEvent.setup()
    renderTaskInput()

    const input = screen.getByPlaceholderText('Add a task...')
    await user.type(input, 'New task{enter}')

    await waitFor(() => {
      expect(input).toHaveValue('')
    })
  })

  it('preserves input text on failed submission', async () => {
    const user = userEvent.setup()
    const onCreateTask = vi.fn<(text: string) => Promise<void>>().mockRejectedValue(new Error('fail'))
    renderTaskInput({ onCreateTask })

    const input = screen.getByPlaceholderText('Add a task...')
    await user.type(input, 'Will fail{enter}')

    await waitFor(() => {
      expect(input).toHaveValue('Will fail')
    })
  })

  it('displays inline error message', () => {
    renderTaskInput({ createError: 'Something went wrong. Give it another try.' })

    expect(screen.getByText('Something went wrong. Give it another try.')).toBeInTheDocument()
  })

  it('clears error when user starts typing', async () => {
    const user = userEvent.setup()
    const { onClearError } = renderTaskInput({
      createError: 'Something went wrong. Give it another try.',
    })

    await user.type(screen.getByPlaceholderText('Add a task...'), 'a')

    expect(onClearError).toHaveBeenCalled()
  })

  it('disables button during submission', async () => {
    const user = userEvent.setup()
    let resolveCreate: () => void
    const onCreateTask = vi.fn<(text: string) => Promise<void>>().mockImplementation(
      () => new Promise<void>((resolve) => { resolveCreate = resolve })
    )
    renderTaskInput({ onCreateTask })

    await user.type(screen.getByPlaceholderText('Add a task...'), 'Test')
    await user.click(screen.getByRole('button', { name: 'Add task' }))

    expect(screen.getByRole('button', { name: 'Add task' })).toBeDisabled()

    resolveCreate!()
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Add task' })).toBeEnabled()
    })
  })
})

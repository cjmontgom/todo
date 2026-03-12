import { useState } from 'react'

interface TaskInputProps {
  onCreateTask: (text: string) => Promise<void>
  createError: string | null
  onClearError: () => void
}

export function TaskInput({ onCreateTask, createError, onClearError }: TaskInputProps) {
  const [text, setText] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async () => {
    const trimmed = text.trim()
    if (!trimmed) return

    setSubmitting(true)
    try {
      await onCreateTask(trimmed)
      setText('')
    } catch {
      // Error display handled by parent via createError prop
    } finally {
      setSubmitting(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit()
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setText(e.target.value)
    if (createError) {
      onClearError()
    }
  }

  return (
    <div className="mb-4">
      <div className="flex gap-2">
        <input
          type="text"
          value={text}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Add a task..."
          disabled={submitting}
          className="flex-1 min-h-[44px] px-3 bg-surface border border-border rounded-lg text-text-primary placeholder:text-text-secondary focus:outline-2 focus:outline-coral focus:outline-offset-2 transition-all duration-200 ease-out disabled:opacity-50"
        />
        <button
          onClick={handleSubmit}
          disabled={submitting}
          aria-label="Add task"
          className="min-w-[44px] min-h-[44px] flex items-center justify-center bg-coral text-white rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-2 focus:outline-coral focus:outline-offset-2 transition-all duration-200 ease-out"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <path d="M10 4V16M4 10H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      </div>
      {createError && (
        <div className="mt-2 px-3 py-2 bg-error-bg text-error-text text-sm rounded-lg">
          {createError}
        </div>
      )}
    </div>
  )
}

import { useState } from 'react'
import type { Task } from '../types'
import { Checkbox } from './Checkbox'
import { DeleteButton } from './DeleteButton'

interface TaskItemProps {
  task: Task
  onToggle?: (id: number, completed: boolean) => Promise<void>
  onDelete?: (id: number) => Promise<void>
}

export function TaskItem({ task, onToggle, onDelete }: TaskItemProps) {
  const [toggling, setToggling] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const handleToggle = async () => {
    if (!onToggle) return
    setToggling(true)
    try {
      await onToggle(task.id, !task.completed)
    } finally {
      setToggling(false)
    }
  }

  const handleDelete = async () => {
    if (!onDelete) return
    setDeleting(true)
    try {
      await onDelete(task.id)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div
      className={`group flex items-center border-b border-border py-3 sm:py-4 transition-all duration-200 ease-out ${
        toggling || deleting ? 'opacity-70' : ''
      }`}
    >
      <Checkbox
        checked={task.completed}
        label={
          task.completed
            ? `Mark ${task.text} as incomplete`
            : `Mark ${task.text} as complete`
        }
        onChange={onToggle ? handleToggle : undefined}
        disabled={toggling || deleting}
      />
      <span
        className={`flex-1 ${
          task.completed
            ? 'line-through text-completed'
            : 'text-text-primary'
        }`}
      >
        {task.text}
      </span>
      {onDelete && (
        <DeleteButton
          onClick={handleDelete}
          disabled={deleting}
          label={`Delete task: ${task.text}`}
        />
      )}
    </div>
  )
}

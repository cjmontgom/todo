import { useState } from 'react'
import { Task } from '../types'
import { Checkbox } from './Checkbox'

interface TaskItemProps {
  task: Task
  onToggle?: (id: number, completed: boolean) => Promise<void>
}

export function TaskItem({ task, onToggle }: TaskItemProps) {
  const [toggling, setToggling] = useState(false)

  const handleToggle = async () => {
    if (!onToggle) return
    setToggling(true)
    try {
      await onToggle(task.id, !task.completed)
    } finally {
      setToggling(false)
    }
  }

  return (
    <div
      className={`flex items-center border-b border-border py-3 sm:py-4 transition-all duration-200 ease-out ${
        toggling ? 'opacity-70' : ''
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
        disabled={toggling}
      />
      <span
        className={
          task.completed
            ? 'line-through text-completed'
            : 'text-text-primary'
        }
      >
        {task.text}
      </span>
    </div>
  )
}

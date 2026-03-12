import { Task } from '../types'
import { EmptyState } from './EmptyState'
import { ErrorState } from './ErrorState'
import { LoadingState } from './LoadingState'
import { TaskItem } from './TaskItem'

interface TaskListProps {
  tasks: Task[]
  loading: boolean
  error: string | null
  onRetry: () => void
  onToggle?: (id: number, completed: boolean) => Promise<void>
}

export function TaskList({ tasks, loading, error, onRetry, onToggle }: TaskListProps) {
  if (loading) {
    return <LoadingState />
  }

  if (error) {
    return <ErrorState onRetry={onRetry} />
  }

  if (tasks.length === 0) {
    return <EmptyState />
  }

  const sorted = [...tasks].sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1
    return 0
  })

  return (
    <ul aria-label={`Task list, ${tasks.length} items`}>
      {sorted.map((task) => (
        <li key={task.id}>
          <TaskItem task={task} onToggle={onToggle} />
        </li>
      ))}
    </ul>
  )
}

import { Task } from '../types'
import { Checkbox } from './Checkbox'

interface TaskItemProps {
  task: Task
}

export function TaskItem({ task }: TaskItemProps) {
  return (
    <div className="flex items-center border-b border-border py-3 sm:py-4 transition-all duration-200 ease-out">
      <Checkbox
        checked={task.completed}
        label={`Mark ${task.text} as complete`}
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

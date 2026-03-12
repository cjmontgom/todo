import { useEffect, useState } from 'react'
import { fetchTasks, createTask, toggleTask } from './api'
import { Task } from './types'
import { AppShell } from './components/AppShell'
import { AppHeader } from './components/AppHeader'
import { TaskInput } from './components/TaskInput'
import { TaskList } from './components/TaskList'

function App() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [createError, setCreateError] = useState<string | null>(null)

  const loadTasks = () => {
    setError(null)
    setLoading(true)
    fetchTasks()
      .then((data) => {
        setTasks(data)
        setLoading(false)
      })
      .catch((err) => {
        setError(err.message)
        setLoading(false)
      })
  }

  const handleCreateTask = async (text: string) => {
    setCreateError(null)
    try {
      const newTask = await createTask(text)
      setTasks((prev) => [...prev, newTask])
    } catch {
      setCreateError("Something went wrong. Give it another try.")
      throw new Error('Create failed')
    }
  }

  const handleToggleTask = async (id: number, completed: boolean) => {
    try {
      const updatedTask = await toggleTask(id, completed)
      setTasks((prev) =>
        prev.map((t) => (t.id === updatedTask.id ? updatedTask : t))
      )
    } catch {
      // Silent failure — Toast error notification deferred to Story 5.1
    }
  }

  useEffect(() => {
    loadTasks()
  }, [])

  return (
    <AppShell>
      <AppHeader />
      <TaskInput
        onCreateTask={handleCreateTask}
        createError={createError}
        onClearError={() => setCreateError(null)}
      />
      <TaskList
        tasks={tasks}
        loading={loading}
        error={error}
        onRetry={loadTasks}
        onToggle={handleToggleTask}
      />
    </AppShell>
  )
}

export default App

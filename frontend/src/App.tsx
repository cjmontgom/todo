import { useEffect, useState } from 'react'
import { fetchTasks, createTask } from './api'
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
      />
    </AppShell>
  )
}

export default App

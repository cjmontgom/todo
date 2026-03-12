import { useEffect, useState } from 'react'
import { fetchTasks } from './api'
import { Task } from './types'
import { AppShell } from './components/AppShell'
import { AppHeader } from './components/AppHeader'
import { TaskList } from './components/TaskList'

function App() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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

  useEffect(() => {
    loadTasks()
  }, [])

  return (
    <AppShell>
      <AppHeader />
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

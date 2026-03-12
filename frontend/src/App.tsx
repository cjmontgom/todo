import { useEffect, useState } from 'react'
import { fetchTasks } from './api'
import { Task } from './types'

function App() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchTasks()
      .then(setTasks)
      .catch((err) => setError(err.message))
  }, [])

  return (
    <div className="min-h-screen bg-background text-text-primary font-sans">
      <h1 className="text-2xl font-semibold p-8">Todo</h1>
      {error && <p className="text-error-text px-8">Error: {error}</p>}
      <p className="px-8 text-text-secondary">
        {tasks.length === 0 ? 'No tasks yet.' : `${tasks.length} task(s) loaded.`}
      </p>
    </div>
  )
}

export default App

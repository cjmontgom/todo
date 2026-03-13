const API_URL = 'http://localhost:3001'

export interface TaskPayload {
  id: number
  text: string
  completed: boolean
  createdAt: string
}

export async function deleteAllTasks(): Promise<void> {
  const res = await fetch(`${API_URL}/api/tasks`)
  const tasks: TaskPayload[] = await res.json()
  await Promise.all(
    tasks.map((t) => fetch(`${API_URL}/api/tasks/${t.id}`, { method: 'DELETE' }))
  )
}

export async function seedTask(text: string, completed = false): Promise<TaskPayload> {
  const res = await fetch(`${API_URL}/api/tasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  })
  const task: TaskPayload = await res.json()

  if (completed) {
    const patchRes = await fetch(`${API_URL}/api/tasks/${task.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed: true }),
    })
    return patchRes.json()
  }

  return task
}

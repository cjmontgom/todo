import { Task } from './types'

const API_URL = import.meta.env.VITE_API_URL

export async function fetchTasks(): Promise<Task[]> {
  const response = await fetch(`${API_URL}/api/tasks`)
  if (!response.ok) {
    throw new Error(`Failed to fetch tasks: ${response.statusText}`)
  }
  return response.json()
}

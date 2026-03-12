import pg from 'pg'

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
})

export async function getAllTasks() {
  const result = await pool.query(
    'SELECT id, text, completed, created_at FROM tasks ORDER BY created_at ASC'
  )
  return result.rows.map((row) => ({
    id: row.id,
    text: row.text,
    completed: row.completed,
    createdAt: row.created_at,
  }))
}

export async function createTask(text: string) {
  const result = await pool.query(
    'INSERT INTO tasks (text) VALUES ($1) RETURNING id, text, completed, created_at',
    [text]
  )
  const row = result.rows[0]
  return {
    id: row.id,
    text: row.text,
    completed: row.completed,
    createdAt: row.created_at,
  }
}

export async function toggleTask(id: number, completed: boolean) {
  const result = await pool.query(
    'UPDATE tasks SET completed = $1 WHERE id = $2 RETURNING id, text, completed, created_at',
    [completed, id]
  )
  if (result.rows.length === 0) return null
  const row = result.rows[0]
  return {
    id: row.id,
    text: row.text,
    completed: row.completed,
    createdAt: row.created_at,
  }
}

export async function deleteTask(id: number) {
  const result = await pool.query(
    'DELETE FROM tasks WHERE id = $1 RETURNING id',
    [id]
  )
  return result.rows.length > 0
}

export default pool

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

export default pool

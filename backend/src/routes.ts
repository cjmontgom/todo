import { FastifyInstance } from 'fastify'
import { getAllTasks } from './db.js'

export async function taskRoutes(server: FastifyInstance) {
  server.get('/api/tasks', async (_request, reply) => {
    try {
      const tasks = await getAllTasks()
      return reply.send(tasks)
    } catch {
      return reply.status(500).send({ error: 'Something went wrong' })
    }
  })
}

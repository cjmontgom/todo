import { FastifyInstance } from 'fastify'

export async function taskRoutes(server: FastifyInstance) {
  server.get('/api/tasks', async () => {
    return []
  })
}

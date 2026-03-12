import { FastifyInstance } from 'fastify'
import { getAllTasks, createTask } from './db.js'

export async function taskRoutes(server: FastifyInstance) {
  server.get('/api/tasks', async (_request, reply) => {
    try {
      const tasks = await getAllTasks()
      return reply.send(tasks)
    } catch {
      return reply.status(500).send({ error: 'Something went wrong' })
    }
  })

  server.post<{ Body: { text: string } }>('/api/tasks', {
    schema: {
      body: {
        type: 'object',
        required: ['text'],
        properties: {
          text: { type: 'string' },
        },
      },
    },
  }, async (request, reply) => {
    const trimmed = request.body.text.trim()
    if (!trimmed) {
      return reply.status(400).send({ error: 'Task text is required' })
    }
    try {
      const task = await createTask(trimmed)
      return reply.status(201).send(task)
    } catch {
      return reply.status(500).send({ error: 'Something went wrong' })
    }
  })
}

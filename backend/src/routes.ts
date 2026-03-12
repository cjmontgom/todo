import { FastifyInstance } from 'fastify'
import { getAllTasks, createTask, toggleTask } from './db.js'

export async function taskRoutes(server: FastifyInstance) {
  server.get('/api/tasks', async (_request, reply) => {
    try {
      const tasks = await getAllTasks()
      return reply.send(tasks)
    } catch {
      return reply.status(500).send({ error: 'Something went wrong' })
    }
  })

  server.patch<{ Params: { id: string }; Body: { completed: boolean } }>('/api/tasks/:id', {
    schema: {
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string' },
        },
      },
      body: {
        type: 'object',
        required: ['completed'],
        properties: {
          completed: { type: 'boolean' },
        },
      },
    },
  }, async (request, reply) => {
    const id = Number(request.params.id)
    if (Number.isNaN(id)) {
      return reply.status(400).send({ error: 'Invalid task ID' })
    }
    try {
      const task = await toggleTask(id, request.body.completed)
      if (!task) {
        return reply.status(404).send({ error: 'Task not found' })
      }
      return reply.send(task)
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

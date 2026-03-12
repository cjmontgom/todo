import { describe, it, mock } from 'node:test'
import assert from 'node:assert/strict'

const getAllTasksMock = mock.fn<() => Promise<unknown>>()

mock.module('./db.js', {
  namedExports: {
    getAllTasks: getAllTasksMock,
  },
})

const { taskRoutes } = await import('./routes.js')
const { default: fastify } = await import('fastify')

const mockTasks = [
  { id: 1, text: 'Buy groceries', completed: false, createdAt: '2026-03-12T10:00:00.000Z' },
  { id: 2, text: 'Walk the dog', completed: true, createdAt: '2026-03-12T11:00:00.000Z' },
]

async function buildApp() {
  const app = fastify()
  app.register(taskRoutes)
  await app.ready()
  return app
}

describe('GET /api/tasks', () => {
  it('returns tasks with 200 status', async () => {
    getAllTasksMock.mock.mockImplementation(() => Promise.resolve(mockTasks))

    const app = await buildApp()
    const response = await app.inject({ method: 'GET', url: '/api/tasks' })

    assert.equal(response.statusCode, 200)
    const body = JSON.parse(response.body)
    assert.equal(body.length, 2)
    assert.equal(body[0].text, 'Buy groceries')
    assert.equal(body[1].text, 'Walk the dog')

    await app.close()
  })

  it('returns empty array when no tasks exist', async () => {
    getAllTasksMock.mock.mockImplementation(() => Promise.resolve([]))

    const app = await buildApp()
    const response = await app.inject({ method: 'GET', url: '/api/tasks' })

    assert.equal(response.statusCode, 200)
    const body = JSON.parse(response.body)
    assert.deepEqual(body, [])

    await app.close()
  })

  it('returns 500 on database error', async () => {
    getAllTasksMock.mock.mockImplementation(() => Promise.reject(new Error('DB connection failed')))

    const app = await buildApp()
    const response = await app.inject({ method: 'GET', url: '/api/tasks' })

    assert.equal(response.statusCode, 500)
    const body = JSON.parse(response.body)
    assert.equal(body.error, 'Something went wrong')

    await app.close()
  })
})

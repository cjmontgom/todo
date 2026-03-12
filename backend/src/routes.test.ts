import { describe, it, mock } from 'node:test'
import assert from 'node:assert/strict'

const getAllTasksMock = mock.fn<() => Promise<unknown>>()
const createTaskMock = mock.fn<(text: string) => Promise<unknown>>()
const toggleTaskMock = mock.fn<(id: number, completed: boolean) => Promise<unknown>>()

mock.module('./db.js', {
  namedExports: {
    getAllTasks: getAllTasksMock,
    createTask: createTaskMock,
    toggleTask: toggleTaskMock,
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

const mockCreatedTask = {
  id: 3,
  text: 'New task',
  completed: false,
  createdAt: '2026-03-12T12:00:00.000Z',
}

describe('POST /api/tasks', () => {
  it('creates a task and returns 201', async () => {
    createTaskMock.mock.mockImplementation(() => Promise.resolve(mockCreatedTask))

    const app = await buildApp()
    const response = await app.inject({
      method: 'POST',
      url: '/api/tasks',
      payload: { text: 'New task' },
    })

    assert.equal(response.statusCode, 201)
    const body = JSON.parse(response.body)
    assert.equal(body.id, 3)
    assert.equal(body.text, 'New task')
    assert.equal(body.completed, false)

    await app.close()
  })

  it('trims whitespace from task text', async () => {
    createTaskMock.mock.mockImplementation((text: string) =>
      Promise.resolve({ ...mockCreatedTask, text })
    )

    const app = await buildApp()
    const response = await app.inject({
      method: 'POST',
      url: '/api/tasks',
      payload: { text: '  Trimmed task  ' },
    })

    assert.equal(response.statusCode, 201)
    const body = JSON.parse(response.body)
    assert.equal(body.text, 'Trimmed task')

    await app.close()
  })

  it('returns 400 for empty text', async () => {
    const app = await buildApp()
    const response = await app.inject({
      method: 'POST',
      url: '/api/tasks',
      payload: { text: '   ' },
    })

    assert.equal(response.statusCode, 400)
    const body = JSON.parse(response.body)
    assert.equal(body.error, 'Task text is required')

    await app.close()
  })

  it('returns 400 for missing body', async () => {
    const app = await buildApp()
    const response = await app.inject({
      method: 'POST',
      url: '/api/tasks',
      payload: {},
    })

    assert.equal(response.statusCode, 400)

    await app.close()
  })

  it('returns 500 on database error', async () => {
    createTaskMock.mock.mockImplementation(() => Promise.reject(new Error('DB insert failed')))

    const app = await buildApp()
    const response = await app.inject({
      method: 'POST',
      url: '/api/tasks',
      payload: { text: 'Will fail' },
    })

    assert.equal(response.statusCode, 500)
    const body = JSON.parse(response.body)
    assert.equal(body.error, 'Something went wrong')

    await app.close()
  })
})

const mockToggledTask = {
  id: 1,
  text: 'Buy groceries',
  completed: true,
  createdAt: '2026-03-12T10:00:00.000Z',
}

describe('PATCH /api/tasks/:id', () => {
  it('toggles task completion and returns 200', async () => {
    toggleTaskMock.mock.mockImplementation(() => Promise.resolve(mockToggledTask))

    const app = await buildApp()
    const response = await app.inject({
      method: 'PATCH',
      url: '/api/tasks/1',
      payload: { completed: true },
    })

    assert.equal(response.statusCode, 200)
    const body = JSON.parse(response.body)
    assert.equal(body.id, 1)
    assert.equal(body.completed, true)
    assert.equal(body.text, 'Buy groceries')

    await app.close()
  })

  it('returns 404 when task not found', async () => {
    toggleTaskMock.mock.mockImplementation(() => Promise.resolve(null))

    const app = await buildApp()
    const response = await app.inject({
      method: 'PATCH',
      url: '/api/tasks/999',
      payload: { completed: true },
    })

    assert.equal(response.statusCode, 404)
    const body = JSON.parse(response.body)
    assert.equal(body.error, 'Task not found')

    await app.close()
  })

  it('returns 500 on database error', async () => {
    toggleTaskMock.mock.mockImplementation(() => Promise.reject(new Error('DB update failed')))

    const app = await buildApp()
    const response = await app.inject({
      method: 'PATCH',
      url: '/api/tasks/1',
      payload: { completed: true },
    })

    assert.equal(response.statusCode, 500)
    const body = JSON.parse(response.body)
    assert.equal(body.error, 'Something went wrong')

    await app.close()
  })

  it('returns 400 for invalid body', async () => {
    const app = await buildApp()
    const response = await app.inject({
      method: 'PATCH',
      url: '/api/tasks/1',
      payload: {},
    })

    assert.equal(response.statusCode, 400)

    await app.close()
  })
})

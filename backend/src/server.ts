import fastify from 'fastify'
import cors from '@fastify/cors'
import { taskRoutes } from './routes.js'

const server = fastify({ logger: true })

server.register(cors)
server.register(taskRoutes)

const start = async () => {
  const port = Number(process.env.PORT) || 3001
  await server.listen({ port, host: '0.0.0.0' })
}

start()

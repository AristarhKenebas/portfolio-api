import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { profileRoutes } from './routes/profile'
import { skillsRoutes } from './routes/skills'
import { currentlyRoutes } from './routes/currently'
import { githubRoutes } from './routes/github'

const app = new Hono()

app.use('*', logger())
app.use('*', cors({
  origin: ['http://localhost:3000', 'https://yourdomain.com'],
}))

app.get('/', (c) => c.json({ status: 'ok', version: '1.0.0' }))

app.route('/api/profile', profileRoutes)
app.route('/api/skills', skillsRoutes)
app.route('/api/currently', currentlyRoutes)
app.route('/api/github', githubRoutes)

const port = Number(process.env.PORT) || 3001
console.log(`Server running on http://localhost:${port}`)

export default {
  port,
  fetch: app.fetch,
}
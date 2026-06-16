import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { sessionMiddleware, CookieStore } from 'hono-sessions'
import { profileRoutes } from './routes/profile'
import { skillsRoutes } from './routes/skills'
import { currentlyRoutes } from './routes/currently'
import { githubRoutes } from './routes/github'
import { authRoutes } from './routes/auth'
import { githubSettingsRoutes } from './routes/github-settings'
import { wakatimeRoutes } from './routes/wakatime'
import { projectsRoutes } from './routes/projects'
import { authMiddleware } from './middleware/auth'

const app = new Hono()
const store = new CookieStore()

app.use('*', logger())
app.use('*', cors({
  origin: ['http://localhost:3000', 'http://localhost:3002'],
  credentials: true,
}))
app.use('*', sessionMiddleware({
  store,
  encryptionKey: process.env.SESSION_SECRET!,
  expireAfterSeconds: 60 * 60 * 24 * 7,
  cookieOptions: {
    httpOnly: true,
    secure: false,
    sameSite: 'Lax',
  },
}))

app.get('/', (c) => c.json({ status: 'ok', version: '1.0.0' }))

// Публічні роути — без authMiddleware
app.route('/api/auth', authRoutes)
app.route('/api/github', githubRoutes)
app.route('/api/profile', profileRoutes)
app.route('/api/skills', skillsRoutes)
app.route('/api/currently', currentlyRoutes)
app.route('/api/projects', projectsRoutes)
app.route('/api/wakatime', wakatimeRoutes)

// Захищені роути — тільки для адмінки
app.use('/api/github-settings/*', authMiddleware)
app.route('/api/github-settings', githubSettingsRoutes)

const port = Number(process.env.PORT) || 3001
console.log(`Server running on http://localhost:${port}`)

export default {
  port,
  fetch: app.fetch,
}
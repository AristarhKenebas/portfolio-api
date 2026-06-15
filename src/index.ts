import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { sessionMiddleware, CookieStore } from 'hono-sessions'
import { profileRoutes } from './routes/profile'
import { skillsRoutes } from './routes/skills'
import { currentlyRoutes } from './routes/currently'
import { githubRoutes } from './routes/github'
import { authRoutes } from './routes/auth'
import { authMiddleware } from './middleware/auth'
import { spotifyRoutes } from './routes/spotify'

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
    secure: false, // true в продакшне с HTTPS
    sameSite: 'Lax',
  },
}))

app.get('/', (c) => c.json({ status: 'ok', version: '1.0.0' }))

app.route('/api/auth', authRoutes)
app.route('/api/github', githubRoutes)

app.use('/api/profile/*', authMiddleware)
app.use('/api/skills/*', authMiddleware)
app.use('/api/currently/*', authMiddleware)

app.route('/api/profile', profileRoutes)
app.route('/api/skills', skillsRoutes)
app.route('/api/currently', currentlyRoutes)

app.route('/api/spotify', spotifyRoutes)

const port = Number(process.env.PORT) || 3001
console.log(`Server running on http://localhost:${port}`)

export default {
  port,
  fetch: app.fetch,
}
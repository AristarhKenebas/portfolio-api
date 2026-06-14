import { Hono } from 'hono'
import { hash, verify } from '@node-rs/argon2'
import type { Session } from 'hono-sessions'

type SessionData = {
  authenticated: boolean
  username: string
}

type Env = {
  Variables: {
    session: Session<SessionData>
    session_key_rotation: boolean
  }
}

export const authRoutes = new Hono<Env>()

let hashedPassword: string | null = null

const getHashedPassword = async () => {
  if (!hashedPassword) {
    hashedPassword = await hash(process.env.ADMIN_PASSWORD!)
  }
  return hashedPassword
}

authRoutes.post('/login', async (c) => {
  const { username, password } = await c.req.json()
  const session = c.get('session')

  if (username !== process.env.ADMIN_USERNAME) {
    return c.json({ error: 'Invalid credentials' }, 401)
  }

  const hashed = await getHashedPassword()
  const valid = await verify(hashed, password)

  if (!valid) {
    return c.json({ error: 'Invalid credentials' }, 401)
  }

  session.set('authenticated', true)
  session.set('username', username)

  return c.json({ success: true })
})

authRoutes.post('/logout', async (c) => {
  const session = c.get('session')
  session.deleteSession()
  return c.json({ success: true })
})

authRoutes.get('/me', async (c) => {
  const session = c.get('session')
  const isAuth = session.get('authenticated')

  if (!isAuth) {
    return c.json({ authenticated: false })
  }

  return c.json({
    authenticated: true,
    username: session.get('username')
  })
})
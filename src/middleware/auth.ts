import type { Context, Next } from 'hono'
import type { Session } from 'hono-sessions'

type SessionData = {
  authenticated: boolean
  username: string
}

export const authMiddleware = async (c: Context<{
  Variables: {
    session: Session<SessionData>
    session_key_rotation: boolean
  }
}>, next: Next) => {
  const session = c.get('session')
  const isAuth = session.get('authenticated')

  if (!isAuth) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  await next()
}
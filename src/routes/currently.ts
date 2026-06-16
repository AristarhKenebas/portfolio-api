import { Hono } from 'hono'
import { db } from '../db'
import { currently } from '../db/schema'
import { eq } from 'drizzle-orm'
import { authMiddleware } from '../middleware/auth'

export const currentlyRoutes = new Hono()

currentlyRoutes.get('/', async (c) => {
  const data = await db.select().from(currently)
  return c.json(data)
})

currentlyRoutes.post('/', authMiddleware, async (c) => {
  const body = await c.req.json()
  const created = await db.insert(currently).values(body).returning()
  return c.json(created[0], 201)
})

currentlyRoutes.delete('/:id', authMiddleware, async (c) => {
  const id = Number(c.req.param('id'))
  await db.delete(currently).where(eq(currently.id, id))
  return c.json({ success: true })
})
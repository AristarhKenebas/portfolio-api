import { Hono } from 'hono'
import { db } from '../db'
import { profile } from '../db/schema'

export const profileRoutes = new Hono()

profileRoutes.get('/', async (c) => {
  const data = await db.select().from(profile).limit(1)
  if (!data[0]) {
    return c.json({ error: 'Profile not found' }, 404)
  }
  return c.json(data[0])
})

profileRoutes.post('/', async (c) => {
  const body = await c.req.json()
  const existing = await db.select().from(profile).limit(1)

  if (existing[0]) {
    const updated = await db.update(profile)
      .set({ ...body, updatedAt: new Date() })
      .returning()
    return c.json(updated[0])
  }

  const created = await db.insert(profile).values(body).returning()
  return c.json(created[0], 201)
})
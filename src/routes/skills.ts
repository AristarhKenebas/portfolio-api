import { Hono } from 'hono'
import { db } from '../db'
import { skills } from '../db/schema'
import { eq } from 'drizzle-orm'

export const skillsRoutes = new Hono()

skillsRoutes.get('/', async (c) => {
  const data = await db.select().from(skills)
  return c.json(data)
})

skillsRoutes.post('/', async (c) => {
  const body = await c.req.json()
  const created = await db.insert(skills).values(body).returning()
  return c.json(created[0], 201)
})

skillsRoutes.delete('/:id', async (c) => {
  const id = Number(c.req.param('id'))
  await db.delete(skills).where(eq(skills.id, id))
  return c.json({ success: true })
})
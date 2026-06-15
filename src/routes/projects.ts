import { Hono } from 'hono'
import { db } from '../db'
import { projects } from '../db/schema'
import { eq } from 'drizzle-orm'

export const projectsRoutes = new Hono()

projectsRoutes.get('/', async (c) => {
  const data = await db.select().from(projects).orderBy(projects.order)
  return c.json(data)
})

projectsRoutes.post('/', async (c) => {
  const body = await c.req.json()
  const created = await db.insert(projects).values(body).returning()
  return c.json(created[0], 201)
})

projectsRoutes.patch('/:id', async (c) => {
  const id = Number(c.req.param('id'))
  const body = await c.req.json()
  const updated = await db.update(projects).set(body).where(eq(projects.id, id)).returning()
  return c.json(updated[0])
})

projectsRoutes.delete('/:id', async (c) => {
  const id = Number(c.req.param('id'))
  await db.delete(projects).where(eq(projects.id, id))
  return c.json({ success: true })
})
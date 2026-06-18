import { Hono } from 'hono'
import { db } from '../db'
import { projectDisplaySettings } from '../db/schema'
import { authMiddleware } from '../middleware/auth'

export const projectSettingsRoutes = new Hono()

const getOrCreateSettings = async () => {
  const rows = await db.select().from(projectDisplaySettings).limit(1)
  if (rows[0]) return rows[0]
  const created = await db.insert(projectDisplaySettings).values({}).returning()
  return created[0]!
}

projectSettingsRoutes.get('/', async (c) => {
  const settings = await getOrCreateSettings()
  return c.json(settings)
})

projectSettingsRoutes.patch('/', authMiddleware, async (c) => {
  const body = await c.req.json()
  await getOrCreateSettings()
  const updated = await db.update(projectDisplaySettings).set(body).returning()
  return c.json(updated[0])
})
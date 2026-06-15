import { Hono } from 'hono'
import { db } from '../db'
import { githubSettings } from '../db/schema'

export const githubSettingsRoutes = new Hono()

const getOrCreateSettings = async () => {
  const rows = await db.select().from(githubSettings).limit(1)
  if (rows[0]) return rows[0]

  const created = await db.insert(githubSettings).values({}).returning()
  return created[0]!
}

githubSettingsRoutes.get('/', async (c) => {
  const settings = await getOrCreateSettings()
  return c.json(settings)
})

githubSettingsRoutes.patch('/', async (c) => {
  const body = await c.req.json()
  const existing = await getOrCreateSettings()

  const updated = await db
    .update(githubSettings)
    .set(body)
    .returning()

  return c.json(updated[0])
})
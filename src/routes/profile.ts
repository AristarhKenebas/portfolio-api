import { Hono } from 'hono'
import { db } from '../db'
import { profile } from '../db/schema'
import { authMiddleware } from '../middleware/auth'
import { join } from 'path'
import { mkdir, writeFile } from 'fs/promises'
import { existsSync } from 'fs'

export const profileRoutes = new Hono()

const UPLOADS_DIR = join(process.cwd(), 'uploads')

const ensureUploadsDir = async () => {
  if (!existsSync(UPLOADS_DIR)) {
    await mkdir(UPLOADS_DIR, { recursive: true })
  }
}

profileRoutes.get('/', async (c) => {
  const data = await db.select().from(profile).limit(1)
  if (!data[0]) return c.json({ error: 'Profile not found' }, 404)
  return c.json(data[0])
})

profileRoutes.post('/', authMiddleware, async (c) => {
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

profileRoutes.post('/avatar', authMiddleware, async (c) => {
  await ensureUploadsDir()

  const formData = await c.req.formData()
  const file = formData.get('avatar') as File | null

  if (!file) {
    return c.json({ error: 'No file provided' }, 400)
  }

  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
  if (!allowedTypes.includes(file.type)) {
    return c.json({ error: 'Only JPEG, PNG and WebP are allowed' }, 400)
  }

  if (file.size > 5 * 1024 * 1024) {
    return c.json({ error: 'File too large, max 5MB' }, 400)
  }

  const ext = (file.type.split('/')[1] ?? 'jpg').replace('jpeg', 'jpg')
  const filename = `avatar.${ext}`
  const filepath = join(UPLOADS_DIR, filename)

  const buffer = await file.arrayBuffer()
  await writeFile(filepath, Buffer.from(buffer))

  const avatarUrl = `/api/profile/avatar`

  const existing = await db.select().from(profile).limit(1)
  if (existing[0]) {
    await db.update(profile).set({ avatarUrl, updatedAt: new Date() })
  }

  return c.json({ url: avatarUrl })
})

profileRoutes.get('/avatar', async (c) => {
  await ensureUploadsDir()

  const extensions = ['jpg', 'png', 'webp']
  let avatarPath: string | null = null
  let mimeType = 'image/jpeg'

  for (const ext of extensions) {
    const p = join(UPLOADS_DIR, `avatar.${ext}`)
    if (existsSync(p)) {
      avatarPath = p
      mimeType = ext === 'jpg' ? 'image/jpeg' : `image/${ext}`
      break
    }
  }

  if (!avatarPath) {
    return c.json({ error: 'Avatar not found' }, 404)
  }

  const file = Bun.file(avatarPath)
  const buffer = await file.arrayBuffer()

  return new Response(buffer, {
    headers: {
      'Content-Type': mimeType,
      'Cache-Control': 'public, max-age=3600',
    }
  })
})